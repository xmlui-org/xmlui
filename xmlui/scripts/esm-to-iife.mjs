#!/usr/bin/env node
/**
 * Converts ESM chunk output from Vite/Rollup into concatenable IIFEs.
 *
 * This replaces rollup-plugin-iife, avoiding:
 *   - Global name collisions (uses filename hash for uniqueness)
 *   - __commonJS wrapper issues
 *   - Leftover ESM syntax
 *
 * Pipeline:
 *   1. Parse each .js file's imports and exports
 *   2. Assign unique global names based on full filename (including hash)
 *   3. Rewrite each file as a `var globalName = (function() { ... return exports; })();`
 *   4. Replace import references with the global variable names
 *   5. Strip CSS imports (CSS handled separately)
 *   6. Compute dependency order (topological sort) and write chunk-order.json
 *
 * Usage: node scripts/esm-to-iife.mjs [chunks-dir]
 */
import { readFileSync, writeFileSync, readdirSync } from "fs";
import { join, basename } from "path";

const chunksDir = process.argv[2] || "dist/chunks";
const files = readdirSync(chunksDir).filter(f => f.endsWith(".js"));

// Step 1: Assign unique global names to each file
function fileToGlobal(filename) {
  // Remove .js extension, replace non-alphanumeric with underscore, ensure starts with letter
  const name = filename.replace(/\.js$/, "").replace(/[^a-zA-Z0-9]/g, "_");
  return "_" + name; // prefix with _ to ensure valid identifier
}

const globalNames = {};
for (const file of files) {
  globalNames[file] = fileToGlobal(file);
}

// Step 2: Parse imports and exports for each file
const chunks = {};
for (const file of files) {
  const code = readFileSync(join(chunksDir, file), "utf-8");
  chunks[file] = { code, imports: [], exports: [], reExports: [] };

  // Parse: import { a, b as c } from "./other.js";
  // Parse: import "./other.css";
  const importRegex = /^import\s+(?:\{([^}]*)\}\s+from\s+)?["']\.\/([^"']+)["'];?\s*$/gm;
  let match;
  while ((match = importRegex.exec(code)) !== null) {
    const specifiers = match[1];
    const source = match[2];

    if (source.endsWith(".css")) {
      // CSS import — will be stripped
      chunks[file].imports.push({ fullMatch: match[0], source, specifiers: null, isCss: true });
    } else {
      // JS import
      const specs = specifiers
        ? specifiers.split(",").map(s => {
            const parts = s.trim().split(/\s+as\s+/);
            return { imported: parts[0], local: parts[1] || parts[0] };
          }).filter(s => s.imported)
        : [];
      chunks[file].imports.push({ fullMatch: match[0], source, specifiers: specs, isCss: false });
    }
  }

  // Parse: export { a, b as c } from "./other.js";  (re-exports)
  const reExportRegex = /^export\s+\{([^}]*)\}\s+from\s+["']\.\/([^"']+)["'];?\s*$/gm;
  while ((match = reExportRegex.exec(code)) !== null) {
    const specifiers = match[1].split(",").map(s => {
      const parts = s.trim().split(/\s+as\s+/);
      return { imported: parts[0], exported: parts[1] || parts[0] };
    }).filter(s => s.imported);
    chunks[file].reExports.push({ fullMatch: match[0], source: match[2], specifiers });
  }

  // Parse: export { a, b as c };  (local exports)
  const exportRegex = /^export\s+\{([^}]*)\};?\s*$/gm;
  while ((match = exportRegex.exec(code)) !== null) {
    const specifiers = match[1].split(",").map(s => {
      const parts = s.trim().split(/\s+as\s+/);
      return { local: parts[0], exported: parts[1] || parts[0] };
    }).filter(s => s.local);
    chunks[file].exports.push({ fullMatch: match[0], specifiers });
  }

  // Parse: export default ...;
  const defaultExportRegex = /^export\s+default\s+(.+);?\s*$/gm;
  while ((match = defaultExportRegex.exec(code)) !== null) {
    chunks[file].exports.push({ fullMatch: match[0], isDefault: true, value: match[1] });
  }
}

// Step 3: Convert each file to IIFE
for (const file of files) {
  const chunk = chunks[file];
  let code = chunk.code;

  // Strip CSS imports
  for (const imp of chunk.imports.filter(i => i.isCss)) {
    code = code.replace(imp.fullMatch + "\n", "");
    code = code.replace(imp.fullMatch, "");
  }

  // Replace JS imports with const destructuring from globals
  for (const imp of chunk.imports.filter(i => !i.isCss)) {
    const sourceGlobal = globalNames[imp.source];
    if (!sourceGlobal) {
      console.warn(`WARNING: ${file} imports from "${imp.source}" which has no global. Skipping.`);
      continue;
    }
    if (imp.specifiers.length > 0) {
      const destructure = imp.specifiers.map(s =>
        s.imported === s.local ? s.imported : `${s.imported}: ${s.local}`
      ).join(", ");
      code = code.replace(imp.fullMatch, `const { ${destructure} } = ${sourceGlobal};`);
    } else {
      // Side-effect import: import "./foo.js"; — just reference the global (ensure it's loaded)
      code = code.replace(imp.fullMatch, `/* side-effect: ${sourceGlobal} */`);
    }
  }

  // Handle re-exports: export { a } from "./other.js" → reference the other global
  for (const reExp of chunk.reExports) {
    const sourceGlobal = globalNames[reExp.source];
    if (!sourceGlobal) {
      console.warn(`WARNING: ${file} re-exports from "${reExp.source}" which has no global.`);
      continue;
    }
    // Convert to local variable assignments that will be included in the return object
    const assignments = reExp.specifiers.map(s =>
      `const ${s.exported} = ${sourceGlobal}.${s.imported};`
    ).join("\n");
    code = code.replace(reExp.fullMatch, assignments);
  }

  // Build the return object from exports
  let returnObj = null;
  const exportedNames = [];

  for (const exp of chunk.exports) {
    if (exp.isDefault) {
      // export default expr; → will be the return value
      code = code.replace(exp.fullMatch, "");
      returnObj = exp.value;
    } else {
      // export { a, b as c }; → return { c: a, ... }
      for (const s of exp.specifiers) {
        exportedNames.push(s.exported === s.local ? s.local : `${s.exported}: ${s.local}`);
      }
      code = code.replace(exp.fullMatch, "");
    }
  }

  // Also collect re-exported names for the return object
  for (const reExp of chunk.reExports) {
    for (const s of reExp.specifiers) {
      exportedNames.push(s.exported);
    }
  }

  // Build the final IIFE
  const global = globalNames[file];
  const isEntry = file.startsWith("chunk-") && !file.includes("-"); // entry chunks like chunk-button.js

  let returnStatement = "";
  if (returnObj) {
    returnStatement = `\nreturn ${returnObj};`;
  } else if (exportedNames.length > 0) {
    returnStatement = `\nreturn { ${exportedNames.join(", ")} };`;
  }

  // Detect if this is an entry point (no exports, just side effects)
  const hasExports = returnObj || exportedNames.length > 0;

  if (hasExports) {
    code = `var ${global} = (function() {\n"use strict";\n${code.trim()}${returnStatement}\n})();\n`;
  } else {
    // Entry point or side-effect-only chunk — anonymous IIFE
    code = `(function() {\n"use strict";\n${code.trim()}\n})();\n`;
  }

  writeFileSync(join(chunksDir, file), code);
}

console.log(`Converted ${files.length} files to IIFEs.`);

// Step 4: Compute dependency order
const chunkList = [];
for (const file of files) {
  const deps = new Set();
  for (const imp of chunks[file].imports.filter(i => !i.isCss)) {
    if (globalNames[imp.source]) deps.add(imp.source);
  }
  for (const reExp of chunks[file].reExports) {
    if (globalNames[reExp.source]) deps.add(reExp.source);
  }
  chunkList.push({ file, deps });
}

// Topological sort
const visited = new Set();
const ordered = [];

function visit(file) {
  if (visited.has(file)) return;
  visited.add(file);
  const chunk = chunkList.find(c => c.file === file);
  if (chunk) {
    for (const dep of chunk.deps) {
      visit(dep);
    }
  }
  ordered.push(file);
}

// Visit shared chunks and xmlui-core first, then entry chunks.
// xmlui-core sets window.Xmlui which the entry chunks need for registerExtension().
const sharedAndCore = chunkList.filter(c => !c.file.startsWith("chunk-"));
const entries = chunkList.filter(c => c.file.startsWith("chunk-"));
for (const { file } of sharedAndCore) {
  visit(file);
}
for (const { file } of entries) {
  visit(file);
}

writeFileSync(join(chunksDir, "chunk-order.json"), JSON.stringify(ordered, null, 2));
console.log(`Wrote chunk-order.json with ${ordered.length} entries.`);

// Step 5: Write dependency graph (chunk-deps.json)
// Maps each file to its direct dependencies. The CLI uses this to compute
// transitive dependencies and only include shared chunks needed by selected components.
const depsMap = {};
for (const { file, deps } of chunkList) {
  depsMap[file] = [...deps];
}
writeFileSync(join(chunksDir, "chunk-deps.json"), JSON.stringify(depsMap, null, 2));
console.log(`Wrote chunk-deps.json`);

// Print summary
const entryCount = ordered.filter(f => f.startsWith("chunk-")).length;
const sharedCount = ordered.length - entryCount - 1; // -1 for xmlui-core
console.log(`  Core: xmlui-core.js`);
console.log(`  Shared chunks: ${sharedCount}`);
console.log(`  Component entries: ${entryCount}`);
