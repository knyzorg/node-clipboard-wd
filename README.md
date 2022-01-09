# node-clipboard-wd

`node-clipboard-wd` is an experimental clipboard accessor that uses the Devtools protocol via [puppeteer](https://github.com/puppeteer/puppeteer/) to extract data from the clipboard.

## API

The Clipboard class exposes the following API:

```ts
interface Paster {
  getClipboardTypes(): Promise<string[]>;
  getClipboardRichText(): Promise<string>;
  getClipboardPlainText(): Promise<string>;
  getClipboardFile(): Promise<number[]>;
  getClipboardFormat(format: string): Promise<number[]>;
}
```

## Under The Hood

`node-clipboard-wd` functions by setting up a `paste` listener in a Chromium instance and sending <kbd>CTRL</kbd>+<kbd>V</kbd> to trigger a paste operation.

The listener intercepts the pasted data and returns it to the Node process. This approach works surprisingly well.

## Why?

The original intent was to leverage Chrome's [clipboard](https://developer.mozilla.org/en-US/docs/Web/API/Clipboard) API for both copying and pasting.

Sadly, the clipboard API is too restrictive to be effective in this context. For example, minimizing the Window that is spawned (headless mode cannot access the clipboard) will prevent all clipboard access.

## What About Copying?

Copying plain text and rich text is technically possible, but there are no plans to implement it as long as full parity between copying and pasting is impossible to achieve.

## Production?

While it should be reliable on all operating systems that Chromium runs on, I offer no guarantees.

This project is very experimental.
