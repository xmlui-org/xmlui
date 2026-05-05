import { copyFile, mkdir } from "fs/promises";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const projDirName = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const destDir = resolve(projDirName, "public", "js");
await mkdir(destDir, { recursive: true });

try {
  await copyFile(
    resolve(projDirName, "..", "..", "xmlui", "dist", "standalone", "xmlui-standalone.umd.js"),
    resolve(destDir, "xmlui-standalone.umd.js"),
  );
  await copyFile(
    resolve(projDirName, "..", "extension", "dist", "xmlui-test-extension.js"),
    resolve(destDir, "xmlui-test-extension.js"),
  );
} catch (e) {
  console.error(e.message);
  console.error(
    "The files first need to be built. Use `npm run test-integration` defined in the workspace root to make sure they exist.",
  );
  exit(1);
}
console.log("Standalone and extension UMD files copied.");
