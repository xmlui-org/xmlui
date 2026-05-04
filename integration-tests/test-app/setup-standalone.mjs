import { copyFile } from "fs/promises";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
await copyFile(
  resolve(__dirname, "../../xmlui/dist/standalone/xmlui-standalone.umd.js"),
  resolve(__dirname, "xmlui-standalone.umd.js"),
);
await copyFile(
  resolve(__dirname, "../extension/dist/xmlui-test-extension.js"),
  resolve(__dirname, "xmlui-test-extension.js"),
);
console.log("Standalone and extension UMD files copied.");
