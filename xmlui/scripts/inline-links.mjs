import * as fs from "fs";
import * as path from "path";

const includedFileExtensions = [".mdx", ".md"];

// Read the file contents
const fileContent = fs.readFileSync("../docs/meta/pages.js", "utf-8");

// Match lines like: export const NAME = "value";
const regex = /export const (\w+)\s*=\s*["'`](.*?)["'`];/g;

const constants = {};
let match;
while ((match = regex.exec(fileContent)) !== null) {
  const [, key, value] = match;
  constants[key] = value;
}

inlineLinks("../docs/pages");

function inlineLinks(pagesFolder) {
  traverseDirectory({ name: "", path: pagesFolder }, (item, _) => {
    /**
     * name: the folder's/file's name (eg. "hello-app-engine")
     * path: the path to the root of the given folder from the project root (eg. "src/apps/1_basic/samples/hello-app-engine")
     * parent: parent node
     * children: children file/folder names
     */
    if (fs.statSync(item.path).isDirectory()) {
      // Node is a folder
    } else {
      // Node is a file
      if (includedFileExtensions.includes(path.extname(item.name))) {
        console.log(item.name);
        const mdxContent = fs.readFileSync(item.path, "utf-8");
        
        const regex = /<SmartLink\s+href=\{([^}]+)\}>/g;
        const newMdxContent = mdxContent.replace(regex, (_, hrefExpr) => {
          return `<SmartLink href="${constants[hrefExpr] || ''}">`;
        });

        fs.writeFileSync(item.path, newMdxContent);
      }
    }
  });
}

/**
 * Recursive function that traverses a given folder and applies an optional function on
 * each of the folders/files found inside.
 */
export function traverseDirectory(node, visitor, level = 0) {
  level++;
  const dirContents = fs.readdirSync(node.path);
  if (!node.children) node.children = dirContents;
  for (const itemName of dirContents) {
    const itemPath = [convertPath(node.path), itemName].join(path.posix.sep);
    const itemIsDir = fs.statSync(itemPath).isDirectory();
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

/**
 * Multi-liner (commented and compatible with really old javascript versions)
 * Source: https://stackoverflow.com/a/62732509
 */
export function convertPath(windowsPath) {
  // handle the edge-case of Window's long file names
  // See: https://learn.microsoft.com/en-us/windows/win32/fileio/naming-a-file#short-vs-long-names
  windowsPath = windowsPath.replace(/^\\\\\?\\/, "");

  // convert the separators, valid since both \ and / can't be in a windows filename
  windowsPath = windowsPath.replace(/\\/g, "/");

  // compress any // or /// to be just /, which is a safe oper under POSIX
  // and prevents accidental errors caused by manually doing path1+path2
  windowsPath = windowsPath.replace(/\/\/+/g, "/");

  return windowsPath;
}
