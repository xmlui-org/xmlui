import { writeFileSync, statSync, readFileSync } from "fs";
import { extname } from "path";
import {
  gatherAndRemoveDuplicates,
  strBufferToLines,
  toHeadingPath,
  toNormalizedUpperCase,
  traverseDirectory,
} from "./utils.mjs";
import { createScopedLogger } from "./logging-standards.mjs";
import { 
  generateExportStatements, 
  processDuplicatesWithLogging 
} from "./pattern-utilities.mjs";
import { PAGES_MAP_CONFIG } from "./constants.mjs";

const pathCutoff = PAGES_MAP_CONFIG.PATH_CUTOFF;
const includedFileExtensions = PAGES_MAP_CONFIG.INCLUDED_FILE_EXTENSIONS;

/**
 * Creates a file containing link constant variables to components/articles in the pages folder.
 * @param {string} pagesFolder The path to the pages folder (use UNIX delimiters)
 * @param {string} outFilePathAndName The path and name of the output file (use UNIX delimiters)
 */
export function buildPagesMap(pagesFolder, outFilePathAndName) {
  const logger = createScopedLogger("PagesMapBuilder");
  logger.operationStart("building pages map");
  const pages = [];
  traverseDirectory({ name: "", path: pagesFolder }, (item, _) => {
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
        const articleHeadings = getArticleIds(item);
        if (articleHeadings) {
          pages.push(...articleHeadings);
        }
      }
    }
  });

  const { filtered: filteredPages, duplicates } = gatherAndRemoveDuplicates(pages);
  
  // Process duplicates with standardized logging
  processDuplicatesWithLogging(duplicates, logger, "article IDs and paths");

  // Generate export statements using utility
  const pagesStr = generateExportStatements(filteredPages);

  writeFileSync(outFilePathAndName, pagesStr);
}

function getArticleIds(article) {
  const content = readFileSync(article.path, { encoding: "utf8" });
  const relativeArticlePath = article.path.split(pathCutoff)[1]?.replace(extname(article.name), "");

  const lines = strBufferToLines(content);

  const titleId = getTitleId(lines);
  if (!titleId) return null;

  const subHeadingIds = getSubHeadingIds(lines);
  return [
    { id: toNormalizedUpperCase(titleId), path: relativeArticlePath },
    ...subHeadingIds.map((id) => ({
      id: `${toNormalizedUpperCase(titleId)}_${toNormalizedUpperCase(id)}`,
      path: `${relativeArticlePath}#${toHeadingPath(id)}`,
    })),
  ];

  // ---

  function getTitleId(lines) {
    for (const line of lines) {
      const match = line.match(/^#\s+.+?\s*(\[#[\w-]+\])?$/);
      if (!match) continue;
      if (match[1]) {
        // Has ID, extract it and use that
        return match[1].replace(/\[#(.*?)\]/, (_, p1) => p1);
      } else {
        // Generate new ID from the heading title
        return match[0].slice(1);
      }
    }
  }

  function getSubHeadingIds(lines) {
    const headings = [];
    for (const line of lines) {
      // We only gather headings which have an explicit ID defined and they are not leveled as h1
      const match = line.match(/^##+\s+.+?\s*(\[#[\w-]+\])$/);
      if (!match) continue;
      if (!match[1]) continue;
      // Has ID, extract it and use that
      headings.push(match[1].replace(/\[#(.*?)\]/, (_, p1) => p1));
    }
    return headings;
  }
}
