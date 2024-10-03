import { writeFileSync, readdirSync, statSync, readFileSync } from "fs";
import { posix, extname } from "path";
import { convertPath, strBufferToLines } from "./utils.mjs";
import { logger } from "./logger.mjs";

const pathCutoff = "pages";
const acceptedExtensions = [".mdx", ".md"];
const acceptedFileNames = [];
const rejectedFileNames = [];

export function buildPagesMap(pagesFolder, outFilePathAndName) {
  //let pages = "";
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
      if (
        (acceptedFileNames.includes(item.name) ||
          acceptedExtensions.includes(extname(item.name))) &&
        !rejectedFileNames.includes(item.name)
      ) {
        const articleHeading = getArticleIds(item);
        if (articleHeading) {
          pages.push(articleHeading);
        }
      }
    }
  });

  const { pages: filteredPages, duplicates } = indicateAndRemoveDuplicateIds(pages);
  if (duplicates.length) {
    logger.warning(`Duplicate entries found when collecting article IDs and paths:`);
    duplicates.forEach((item) => {
      logger.warning(`Removed duplicate ID: ${item.id} - Path: ${item.path}`);
    });
  }

  const pagesStr = filteredPages.reduce((acc, curr) => {
    acc += `export const ${curr.id} = "${curr.path}";\n`;
    return acc;
  }, "");

  writeFileSync(outFilePathAndName, pagesStr);
}

/**
 * Recursive function that traverses a given folder and applies an optional function on
 * each of the folders/files found inside.
 */
function traverseDirectory(node, visitor, level = 0) {
  level++;
  const dirContents = readdirSync(node.path);
  if (!node.children) node.children = dirContents;
  for (const itemName of dirContents) {
    const itemPath = [convertPath(node.path), itemName].join(posix.sep);
    const itemIsDir = statSync(itemPath).isDirectory();
    const childNode = {
      name: itemName,
      path: itemPath,
      parent: node,
    };
    visitor && visitor(childNode, level);
    if (itemIsDir) {
      traverseDirectory(childNode, visitor, level);
    }
  }
}

function getArticleIds(article) {
  const content = readFileSync(article.path, { encoding: "utf8" });
  const relativeArticlePath = article.path.split(pathCutoff)[1]?.replace(extname(article.name), "");

  const lines = strBufferToLines(content);

  const titleId = getTitleId(lines);
  if (!titleId) return null;
  return { id: titleId, path: relativeArticlePath };

  // ---

  function getTitleId(lines) {
    for (const line of lines) {
      const match = line.match(/^#\s+.+?\s*(\[#[\w-]+\])?$/);
      if (!match) continue;
      if (match[1]) {
        // Has ID, extract it and use that
        return normalizeToHeadingId(match[1].replace(/\[#(.*?)\]/, (_, p1) => p1));
      } else {
        // Generate new ID from the heading title
        return normalizeToHeadingId(match[0].slice(1));
      }
    }
  }
}

function normalizeToHeadingId(rawStr) {
  return rawStr
    .trim()
    .toLocaleUpperCase()
    .replaceAll(/[^A-Za-z0-9_]/g, "_")
    .replaceAll(/__+/g, "_"); // <- remove duplicate underscores
}

function indicateAndRemoveDuplicateIds(pagesData) {
  const idSet = new Set();
  const duplicates = [];
  pagesData.forEach((item) => {
    if (idSet.has(item.id)) {
      duplicates.push(item);
    }
    idSet.add(item.id);
  });

  return {
    pages: pagesData.filter((item) => !duplicates.includes(item)),
    duplicates,
  };
}
