import paster from "..";

const sleep = (ms: number) => new Promise<void>((res) => setTimeout(res, ms));
(async function () {
  while (true) {
    await sleep(2000);
    const text = await paster.getClipboardPlainText();
    console.log("Found plain text:", text);
  }
})();
