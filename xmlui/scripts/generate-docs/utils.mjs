import { existsSync, readdirSync, statSync, unlinkSync } from "fs";
import { posix } from "path";
import { TABLE_CONFIG } from "./constants.mjs";

/**
 * Creates a markdown table.
 * The number of headers can be more or less than the number of rows.
 * @param {Record<string, string[] | boolean>} data
 * @param {string[]} data.headers A list of headers for the table 
 * @param {string[][]} data.rows A list of rows of the table content,
 *  each row is an array of strings
 * @param {boolean} data.rowNums Toggle to generate row numbers or not
 * @returns {string} Generated markdown table
 */
export function createTable({ headers = [], rows = [], rowNums = false }) {
  let table = "";

  if (headers.length === 0 && rows.length === 0) {
    return table;
  }

  if (rowNums) {
    headers.unshift(TABLE_CONFIG.DEFAULT_ROW_NUM_HEADER);
  }

  table +=
    "| " +
    headers
      .map((h) => {
        if (typeof h === "string") return h;
        if (typeof h === "object") return h.value;
      })
      .join(" | ") +
    " |\n";

  table +=
    "| " +
    headers
      .map((h) => {
        if (typeof h === "object" && h.style === TABLE_CONFIG.STYLES.LEFT) return TABLE_CONFIG.MARKDOWN_ALIGNMENTS.LEFT;
        if (typeof h === "object" && h.style === TABLE_CONFIG.STYLES.CENTER) return TABLE_CONFIG.MARKDOWN_ALIGNMENTS.CENTER;
        if (typeof h === "object" && h.style === TABLE_CONFIG.STYLES.RIGHT) return TABLE_CONFIG.MARKDOWN_ALIGNMENTS.RIGHT;
        return TABLE_CONFIG.MARKDOWN_ALIGNMENTS.DEFAULT;
      })
      .join(" | ") +
    " |\n";

  rows.forEach((row) => {
    table += "| " + (rowNums ? rows.indexOf(row) + 1 + " | " : "") + row.join(" | ") + " |\n";
  });

  return table;
}

/**
 * Multi-liner (commented and compatible with really old javascript versions)
 * Source: https://stackoverflow.com/a/62732509
 */
export function winPathToPosix(windowsPath) {
  // handle the edge-case of Window's long file names
  // See: https://learn.microsoft.com/en-us/windows/win32/fileio/naming-a-file#short-vs-long-names
  windowsPath = windowsPath.replace(/^\\\\\?\\/, "");

  // convert the separators, valid since both \ and / can't be in a windows filename
  windowsPath = windowsPath.replace(/\\/g, "/");

  // compress any // or /// to be just /, which is a safe operation under POSIX
  // and prevents accidental errors caused by manually doing path1+path2
  windowsPath = windowsPath.replace(/\/\/+/g, "/");

  return windowsPath;
}

/**
 * Simple but slow
 * @param {string} buffer
 */
export function strBufferToLines(buffer) {
  if (typeof buffer !== "string") {
    throw new Error("Only string buffers are supported.");
  }
  return buffer.split(/\r?\n/);
}

/**
 * Recursive function that traverses a given folder and applies an optional function on
 * each of the folders/files found inside.
 */
export function traverseDirectory(node, visitor, level = 0) {
  level++;
  const dirContents = readdirSync(node.path);
  if (!node.children) node.children = dirContents;
  for (const itemName of dirContents) {
    const itemPath = [winPathToPosix(node.path), itemName].join(posix.sep);
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

/**
 * Removes duplicate entries from the input array.
 */
export function gatherAndRemoveDuplicates(container, byAttribute = "id") {
  const idSet = new Set();
  const duplicates = [];
  container.forEach((item) => {
    if (idSet.has(item[byAttribute])) {
      duplicates.push(item);
    }
    idSet.add(item[byAttribute]);
  });

  return {
    filtered: container.filter((item) => !duplicates.includes(item)),
    duplicates,
  };
}

export function toNormalizedUpperCase(rawStr) {
  return rawStr
    .trim()
    .toLocaleUpperCase()
    .replaceAll(/[^A-Za-z0-9_]/g, "_")
    .replaceAll(/__+/g, "_"); // <- remove duplicate underscores
}

export function toHeadingPath(rawStr) {
  return rawStr
    .trim()
    .toLocaleLowerCase()
    .replaceAll(/[^A-Za-z0-9-]/g, "-")
    .replaceAll(/--+/g, "-")
    .replace(/^-|-$/, "");
}

/**
 * Converts string from kebab case to space separated string with uppercase starting character
 * @param {string} rawStr input in kebab case (e.g. "hello-there-friend")
 * @returns {string} camel cased string (e.g. "Hello There Friend")
 */
export function fromKebabtoReadable(rawStr) {
  return rawStr
    .trim()
    .split("-")
    .map((n) => n[0].toUpperCase() + n.slice(1))
    .join(" ");
}

/**
 * Deletes a file if it exists
 * @param {string} filePath the full path of the file to delete
 */
export function deleteFileIfExists(filePath) {
  if (existsSync(filePath)) {
    unlinkSync(filePath);
  }
}

/**
 * Removes duplicate new line characters adjecent to one another in a list of strings
 * @param {string[]} buffer the list of strings
 * @returns {string[]} the list of strings without duplicate new line characters
 */
export function removeAdjacentNewlines(buffer) {
  const result = [];  
  let prevWasNewline = false;

  for (const item of buffer) {
    // Check if the current item is only newline characters
    const isNewline = /^\s*$/.test(item);

    if (!isNewline || !prevWasNewline) {
      result.push(item);
    }
    prevWasNewline = isNewline;
  }
  return result;
}

/**
 * The summary file may contain further sections other than the summary table.
 * Thus, we only (re)generate the section that contains the summary table.
 * This is done by finding the heading for the start of the summary table section
 * and either the end of file or the next section heading.
 * @param {string} buffer the string containing the file contents
 * @param {string} sectionHeading The section to look for, has to have heading level as well
 */
export function getSectionBeforeAndAfter(buffer, sectionHeading) {
  if (!sectionHeading) {
    return { beforeSection: buffer, afterSection: "" };
  }

  const lines = strBufferToLines(buffer);
  const sectionStartIdx = lines.findIndex((line) => line.includes(sectionHeading));

  // If sectionHeading isn't found, return the buffer unchanged
  if (sectionStartIdx === -1) {
    return { beforeSection: buffer, afterSection: "" };
  }

  // Find the next heading after the section heading
  let nextHeadingIdx = -1;
  for (let i = sectionStartIdx + 1; i < lines.length; i++) {
    if (/^#+\s/.test(lines[i])) {
      nextHeadingIdx = i;
      break;
    }
  }

  // Remove lines after the section heading and before the next heading (or end of file)
  const beforeSection = lines.slice(0, sectionStartIdx).join("\n");
  const afterSection = (nextHeadingIdx !== -1 ? lines.slice(nextHeadingIdx) : []).join("\n");

  return { beforeSection, afterSection };
}
