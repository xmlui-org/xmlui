import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const componentsRoot = path.resolve("src/components");
const apply = process.argv.includes("--apply");
const only = readOption("--only");

const rows = [];

for (const componentName of listDirectories(componentsRoot)) {
  const componentDir = path.join(componentsRoot, componentName);
  for (const filename of readdirSync(componentDir).filter((item) => item.endsWith("React.tsx")).sort()) {
    const file = path.join(componentDir, filename);
    const source = readFileSync(file, "utf8");
    rows.push(auditRenderer({ componentName, componentDir, file, source }));
  }
}

if (apply) {
  for (const row of rows) {
    applySafeConversion(row);
  }
}

const groups = groupBy(rows, (row) => row.classification);

printGroup("direct import", groups.get("direct-import") ?? []);
printGroup("custom query import", groups.get("custom-query-import") ?? []);
printGroup("literal map - auto convertible", rows.filter((row) => row.classification === "literal-map" && row.safeToConvert));
printGroup("literal map - manual", rows.filter((row) => row.classification === "literal-map" && !row.safeToConvert));
printGroup("no stylesheet usage", groups.get("no-stylesheet-usage") ?? []);
printGroup("manual review", groups.get("manual-review") ?? []);
printGroup("converted by apply mode", rows.filter((row) => row.converted));
printGroup("apply-mode skipped", rows.filter((row) => apply && row.safeToConvert && !row.converted));

const summary = {
  total: rows.length,
  mode: apply ? "apply" : "dry-run",
  directImport: (groups.get("direct-import") ?? []).length,
  customQueryImport: (groups.get("custom-query-import") ?? []).length,
  literalMapAutoConvertible: rows.filter((row) => row.classification === "literal-map" && row.safeToConvert).length,
  literalMapManual: rows.filter((row) => row.classification === "literal-map" && !row.safeToConvert).length,
  noStylesheetUsage: (groups.get("no-stylesheet-usage") ?? []).length,
  manualReview: (groups.get("manual-review") ?? []).length,
  converted: rows.filter((row) => row.converted).length,
};

console.log("\nSummary");
console.log(JSON.stringify(summary, null, 2));

function auditRenderer({ componentName, componentDir, file, source }) {
  const relativeFile = path.relative(process.cwd(), file);
  const directImport = source.match(/import\s+([A-Za-z_$][\w$]*)\s+from\s+["'](\.\/[^"']+\.module\.scss)["'];?/);
  if (directImport) {
    return {
      componentName,
      file: relativeFile,
      classification: "direct-import",
      absoluteFile: file,
      importName: directImport[1],
      stylesheet: directImport[2],
      safeToConvert: false,
      reason: "Already uses the original direct SCSS module import pattern.",
    };
  }

  const customQueryImport = source.match(/import\s+([A-Za-z_$][\w$]*)\s+from\s+["'](\.\/[^"']+\.module\.scss\?xmlui-css-module)["'];?/);
  if (customQueryImport) {
    return {
      componentName,
      file: relativeFile,
      classification: "custom-query-import",
      absoluteFile: file,
      importName: customQueryImport[1],
      stylesheet: customQueryImport[2],
      safeToConvert: true,
      reason: "Can be rewritten mechanically by removing ?xmlui-css-module.",
    };
  }

  const literalMap = source.match(/const\s+styles\s*=\s*\{([\s\S]*?)\}\s*as\s+const\s*;/);
  if (literalMap) {
    const entries = parseLiteralStyleMap(literalMap[1]);
    const scssFile = findPrimaryScssFile(componentDir, componentName);
    if (!scssFile) {
      return {
        componentName,
        file: relativeFile,
        classification: "literal-map",
        absoluteFile: file,
        safeToConvert: false,
        reason: "Literal styles map found, but no matching primary SCSS module file exists.",
      };
    }

    const scssClasses = extractScssClasses(readFileSync(scssFile, "utf8"));
    const missing = entries
      .map((entry) => entry.className)
      .filter((className) => className && !scssClasses.has(className));
    const parseFailures = entries.filter((entry) => !entry.className);
    const safeToConvert = entries.length > 0 && missing.length === 0 && parseFailures.length === 0;
    return {
      componentName,
      file: relativeFile,
      classification: "literal-map",
      absoluteFile: file,
      stylesheet: path.relative(path.dirname(file), scssFile).replaceAll(path.sep, "/"),
      literalMapSource: literalMap[0],
      entryCount: entries.length,
      safeToConvert,
      reason: safeToConvert
        ? "Every literal class name exists in the primary SCSS module."
        : [
          parseFailures.length ? `${parseFailures.length} style map entries were not simple string literals` : "",
          missing.length ? `Missing SCSS classes: ${missing.join(", ")}` : "",
        ].filter(Boolean).join("; "),
    };
  }

  if (/styles\./.test(source) || /\.module\.scss/.test(source)) {
    return {
      componentName,
      file: relativeFile,
      classification: "manual-review",
      absoluteFile: file,
      safeToConvert: false,
      reason: "Styles are referenced, but the renderer does not match a known safe pattern.",
    };
  }

  return {
    componentName,
    file: relativeFile,
    classification: "no-stylesheet-usage",
    absoluteFile: file,
    safeToConvert: false,
    reason: "Renderer does not import or define a styles object.",
  };
}

function applySafeConversion(row) {
  if (!row.safeToConvert) {
    return;
  }
  if (only && row.classification !== only) {
    return;
  }
  const source = readFileSync(row.absoluteFile, "utf8");
  let nextSource = source;
  if (row.classification === "custom-query-import") {
    nextSource = source.replace(/(\.module\.scss)\?xmlui-css-module(["'])/, "$1$2");
  } else if (row.classification === "literal-map") {
    const importPath = row.stylesheet.startsWith(".") ? row.stylesheet : `./${row.stylesheet}`;
    nextSource = source.replace(row.literalMapSource, `import styles from "${importPath}";`);
  }
  if (nextSource === source) {
    row.converted = false;
    row.reason = `${row.reason} Apply mode found no textual change.`;
    return;
  }
  writeFileSync(row.absoluteFile, nextSource);
  row.converted = true;
}

function readOption(name) {
  const prefixed = process.argv.find((arg) => arg.startsWith(`${name}=`));
  if (prefixed) {
    return prefixed.slice(name.length + 1);
  }
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : null;
}

function parseLiteralStyleMap(body) {
  return body
    .split("\n")
    .map((line) => line.trim().replace(/,$/, ""))
    .filter(Boolean)
    .map((line) => {
      const match = line.match(/^([A-Za-z_$][\w$]*|"[^"]+"|'[^']+')\s*:\s*["']([^"']+)["']$/);
      if (!match) {
        return { raw: line, className: null };
      }
      const key = match[1].replace(/^["']|["']$/g, "");
      return { key, className: match[2] };
    });
}

function findPrimaryScssFile(componentDir, componentName) {
  const primary = path.join(componentDir, `${componentName}.module.scss`);
  if (existsSync(primary)) {
    return primary;
  }
  const scssFiles = readdirSync(componentDir)
    .filter((file) => file.endsWith(".module.scss"))
    .map((file) => path.join(componentDir, file));
  return scssFiles.length === 1 ? scssFiles[0] : null;
}

function extractScssClasses(source) {
  const withoutComments = source
    .replace(/\/\/.*$/gm, "")
    .replace(/\/\*[\s\S]*?\*\//g, "");
  return new Set([...withoutComments.matchAll(/\.([A-Za-z_][A-Za-z0-9_-]*)/g)].map((match) => match[1]));
}

function listDirectories(dir) {
  return readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

function groupBy(items, getKey) {
  const map = new Map();
  for (const item of items) {
    const key = getKey(item);
    const group = map.get(key) ?? [];
    group.push(item);
    map.set(key, group);
  }
  return map;
}

function printGroup(title, items) {
  console.log(`\n${title} (${items.length})`);
  for (const item of items) {
    console.log(`- ${item.componentName}: ${item.file}`);
    if (item.reason) {
      console.log(`  ${item.reason}`);
    }
  }
}
