import { writeFileSync, statSync } from "fs";
import { basename, extname } from "path";
import { gatherAndRemoveDuplicates, toNormalizedUpperCase, traverseDirectory } from "./utils.mjs";
import { createScopedLogger } from "./logging-standards.mjs";
import { DOWNLOADS_MAP_CONFIG } from "./constants.mjs";
import { 
  generateExportStatements, 
  processDuplicatesWithLogging 
} from "./pattern-utilities.mjs";

const baseUrlCutoff = DOWNLOADS_MAP_CONFIG.BASE_URL_CUTOFF;
const includedFileExtensions = DOWNLOADS_MAP_CONFIG.INCLUDED_FILE_EXTENSIONS;

/**
 * Creates a file containing download link constants for downloadable files.
 * @param {string} downloadsFolder The path to the downloads folder (use UNIX delimiters)
 * @param {string} outFilePathAndName The path and name of the output file (use UNIX delimiters)
 */
export function buildDownloadsMap(downloadsFolder, outFilePathAndName) {
  const logger = createScopedLogger("DownloadsMapBuilder");
  logger.operationStart("building downloads map");
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
  
  // Process duplicates with standardized logging
  processDuplicatesWithLogging(duplicates, logger, "download IDs and paths");

  // Generate export statements using utility
  const outStr = generateExportStatements(filtered);

  writeFileSync(outFilePathAndName, outStr);
}
