export class ErrorWithSeverity extends Error {
  constructor(message, severity = Logger.severity.error) {
    super(message);
    this.name = "ErrorWithSeverity";
    this.severity = severity;
  }
}

export function handleError(error) {
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
