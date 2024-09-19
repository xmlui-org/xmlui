export function createTable({
  headers = [],
  rows = [],
}) {
  let table = "";

  if (headers.length === 0 && rows.length === 0) {
    return table;
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
    table += "| " + row.join(" | ") + " |\n";
  });
  
  return table;
}
