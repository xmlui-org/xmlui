import { writeFileSync, readdirSync, statSync } from "fs";
import { posix, extname, parse } from "path";
import { convertPath } from "./utils.mjs";

const pathCutoff = "pages";
const acceptedExtensions = [".mdx", ".md"];
const acceptedFileNames = [];
const rejectedFileNames = [];

export function buildPagesMap(pagesFolder, outFilePathAndName) {
  let pages = "";
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
      const extension = extname(item.name);
      if (
        (acceptedFileNames.includes(item.name) || acceptedExtensions.includes(extname(item.name))) &&
        !rejectedFileNames.includes(item.name)
      ) {
        pages += `export const ${parse(item.path).name.toLocaleUpperCase().replaceAll("-", "_")} = "${item.path
          .split(pathCutoff)[1]
          ?.replace(extension, "")}";\n`;
      }
    }
  });

  writeFileSync(outFilePathAndName, pages);
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
