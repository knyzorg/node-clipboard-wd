import paster from "..";

paster.getClipboardFile().then((file) => {
  console.log("Found file:", file?.name);
  paster.unload();
});
