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

export function createTable({
  headers = [],
  rows = [],
  rowNums = false,
}) {
  let table = "";

  if (headers.length === 0 && rows.length === 0) {
    return table;
  }

  if (rowNums) {
    headers.unshift({ value: "Num", style: "center" });
  }

  table += "| " + headers.map((h) => {
    if (typeof h === "string") return h;
    if (typeof h === "object") return h.value;
  }).join(" | ") + " |\n";

  table += "| " + headers.map((h) => {
    if (typeof h === "object" && h.style === "left") return ":---";
    if (typeof h === "object" && h.style === "center") return ":---:";
    if (typeof h === "object" && h.style === "right") return "---:";
    return "---";
  }).join(" | ") + " |\n";
  
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
