import * as puppeteer from "puppeteer";

interface Paster {
  getClipboardTypes(): Promise<string[]>;
  getClipboardRichText(): Promise<string>;
  getClipboardPlainText(): Promise<string>;
  getClipboardFile(): Promise<number[]>;
  getClipboardFormat(format: string): Promise<number[]>;
}

class WebDriverPaster implements Paster {
  browser: puppeteer.Browser;
  page: puppeteer.Page;
  isConnected = false;
  browserPromise = Promise.resolve<puppeteer.Browser>(null);
  async ensureBrowserLoaded() {
    await this.browserPromise;
    if (this.isConnected) {
      return;
    }
    this.browserPromise = puppeteer.launch({
      headless: false,
      args: ["--app=https://example.com"],
    });
    const browser = await this.browserPromise;
    this.browser = browser;
    this.page = await browser.pages().then((pages) => pages[0]);
    this.browser.once("disconnected", () => (this.isConnected = false));
    const session = await this.page.target().createCDPSession();
    const { windowId } = await session.send("Browser.getWindowForTarget");
    await session.send("Browser.setWindowBounds", {
      windowId,
      bounds: { width: 0, height: 0 },
    });

    await this.page.waitForNavigation();
    this.isConnected = true;
  }

  async getClipboardFormat(): Promise<number[]> {
    throw new Error("Not supported");
  }

  async getClipboardTypes(): Promise<string[]> {
    await this.ensureBrowserLoaded();
    let types = this.page
      .evaluate(function () {
        return new Promise<string[]>((resolve) => {
          const handler = (event: ClipboardEvent) => {
            resolve(event.clipboardData.types as string[]);
            document
              .querySelector("body")
              .removeEventListener("paste", handler);
          };
          document.querySelector("body").addEventListener("paste", handler);
        });
      })
      .catch(() => []);

    try {
      await this.page.keyboard.down("Control");
      await this.page.keyboard.press("V");
      await this.page.keyboard.up("Control");
    } catch {
      return [];
    }

    return types;
  }

  async getClipboardPlainText(): Promise<string> {
    await this.ensureBrowserLoaded();
    let types = this.page
      .evaluate(function () {
        return new Promise<string>((resolve) => {
          const handler = (event: ClipboardEvent) => {
            resolve(event.clipboardData.getData("text/plain"));
            document
              .querySelector("body")
              .removeEventListener("paste", handler);
          };
          document.querySelector("body").addEventListener("paste", handler);
        });
      })
      .catch(() => null);

    try {
      await this.page.keyboard.down("Control");
      await this.page.keyboard.press("V");
      await this.page.keyboard.up("Control");
    } catch {
      return null;
    }

    return types;
  }
  async getClipboardRichText(): Promise<string> {
    await this.ensureBrowserLoaded();
    let types = this.page
      .evaluate(function () {
        return new Promise<string>((resolve) => {
          const handler = (event: ClipboardEvent) => {
            resolve(event.clipboardData.getData("text/html"));
            document
              .querySelector("body")
              .removeEventListener("paste", handler);
          };
          document.querySelector("body").addEventListener("paste", handler);
        });
      })
      .catch(() => null);

    try {
      await this.page.keyboard.down("Control");
      await this.page.keyboard.press("V");
      await this.page.keyboard.up("Control");
    } catch {
      return null;
    }

    return types;
  }

  async getClipboardFile() {
    await this.ensureBrowserLoaded();
    let types = this.page
      .evaluate(function () {
        return new Promise<{
          name: string;
          type: string;
          content: number[];
        }>((resolve) => {
          const handler = async (event: ClipboardEvent) => {
            const files = Array.from(event.clipboardData.files);
            if (!files.length) return null;
            for (let file of files) {
              const reader = (
                file.stream() as any as ReadableStream<Int8Array>
              ).getReader();
              const buffer: number[] = [];
              while (true) {
                const { value, done } = await reader.read();
                if (done) break;
                for (let byte of value) buffer.push(byte);
              }
              resolve({ name: file.name, type: file.type, content: buffer });
              break;
            }
            document
              .querySelector("body")
              .removeEventListener("paste", handler);
          };
          document.querySelector("body").addEventListener("paste", handler);
        });
      })
      .catch(() => null);

    try {
      await this.page.keyboard.down("Control");
      await this.page.keyboard.press("V");
      await this.page.keyboard.up("Control");
    } catch {
      return null;
    }

    return types;
  }
}

const sleep = (ms: number) => new Promise<void>((res) => setTimeout(res, ms));
// (async function () {
//   let paster = new WebDriverPaster();
//   await paster.getClipboardTypes().then((types) => console.log(types));
//   await paster.getClipboardPlainText().then((types) => console.log(types));
//   await paster.getClipboardRichText().then((types) => console.log(types));
//   await paster.getClipboardFile().then((types) => console.log(types));
// })();

let paster = new WebDriverPaster();
setInterval(async () => {
  await paster.getClipboardFile().then((types) => console.log(types));
}, 2000);
