import { writeFileSync, statSync } from "fs";
import { basename, extname } from "path";
import { gatherAndRemoveDuplicates, toNormalizedUpperCase, traverseDirectory } from "./utils.mjs";
import { logger } from "./logger.mjs";

const baseUrlCutoff = "files";
const includedFileExtensions = [".zip"];

/**
 * Creates a file containing download link constants for downloadable files.
 * @param {string} downloadsFolder The path to the downloads folder (use UNIX delimiters)
 * @param {string} outFilePathAndName The path and name of the output file (use UNIX delimiters)
 */
export function buildDownloadsMap(downloadsFolder, outFilePathAndName) {
  const downloads = [];
  traverseDirectory({ name: "", path: downloadsFolder }, (item, _) => {
    /**
     * name: the folder's/file's name (eg. "hello-app-engine")
     * path: the path to the root of the given folder from the project root (eg. "src/apps/1_basic/samples/hello-app-engine")
     * parent: parent node
     * children: children file/folder names
     */
    if (statSync(item.path).isDirectory()) {
      // Node is a folder
    } else {
      // Node is a file
      if (includedFileExtensions.includes(extname(item.name))) {
        const relativePath = item.path.split(baseUrlCutoff)[1];
        downloads.push({
          id: toNormalizedUpperCase(basename(relativePath, extname(relativePath))),
          path: relativePath,
        });
      }
    }
  });

  const { filtered, duplicates } = gatherAndRemoveDuplicates(downloads);
  if (duplicates.length) {
    logger.warning(`Duplicate entries found when collecting download IDs and paths:`);
    duplicates.forEach((item) => {
      logger.warning(`Removed duplicate ID: ${item.id} - Path: ${item.path}`);
    });
  }

  const outStr = filtered.reduce((acc, curr) => {
    acc += `export const ${curr.id} = "${curr.path}";\n`;
    return acc;
  }, "");

  writeFileSync(outFilePathAndName, outStr);
}
