import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { lstatSync } from "fs";
import { readdir, readFile } from "fs/promises";
import { execSync } from "child_process";

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), "../../../");

const extendedPackagesFolder = join(projectRoot, "packages");
const packageDirectories = (await readdir(extendedPackagesFolder)).filter((entry) => {
  return entry.startsWith("xmlui-") && lstatSync(join(extendedPackagesFolder, entry)).isDirectory();
});

for (let dir of packageDirectories) {
  try {
    const dirFullPath = join(extendedPackagesFolder, dir);
    const filePath = join(dirFullPath, "package.json");
    const { scripts } = JSON.parse(await readFile(filePath, "utf8"));
    if (!scripts) {
      console.error(`No scripts section found in package.json: ${filePath}`);
      continue;
    }

    const metaBuildScript = scripts["build:meta"];
    if (!metaBuildScript) {
      console.error(`No build:meta script found in package.json: ${filePath}`);
      continue;
    }

    console.log(`--- Building Extension Package: ${dir}`);
    execSync(metaBuildScript, { stdio: "inherit", cwd: dirFullPath });
  } catch (error) {
    console.error(error);
  }
}
