import { readdirSync, statSync } from "fs";
import { posix } from "path";
import { logger } from "./logger.mjs";

export class ErrorWithSeverity extends Error {
  constructor(message, severity = Logger.severity.error) {
    super(message);
    this.name = "ErrorWithSeverity";
    this.severity = severity;
  }
}

export function processError(error) {
  if (error instanceof ErrorWithSeverity) {
    logger.log(error.severity, error.message);
  } else if (error instanceof Error) {
    logger.error(error.message);
  } else {
    logger.error(error);
  }
}

export function createTable({ headers = [], rows = [], rowNums = false }) {
  let table = "";

  if (headers.length === 0 && rows.length === 0) {
    return table;
  }

  if (rowNums) {
    headers.unshift({ value: "Num", style: "center" });
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
        if (typeof h === "object" && h.style === "left") return ":---";
        if (typeof h === "object" && h.style === "center") return ":---:";
        if (typeof h === "object" && h.style === "right") return "---:";
        return "---";
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

/**
 * Simple but slow
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
