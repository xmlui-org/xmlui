#!/usr/bin/env node
/**
 * Post-processes rollup-plugin-iife output to fix:
 * 1. CSS import statements (strip them — CSS is handled separately)
 * 2. __commonJS wrapper pattern (unwrap to a proper IIFE global assignment)
 */
import { readFileSync, writeFileSync, readdirSync } from "fs";
import { join } from "path";

const chunksDir = process.argv[2] || "dist/chunks";

// Pass 1: Detect and fix global name collisions across all chunks.
// The iife plugin generates names like "index01" from "index-CSHCMnq1.js",
// but two chunks with different hashes can collide.
const globalNames = {}; // globalName -> [filename, ...]
for (const file of readdirSync(chunksDir)) {
  if (!file.endsWith(".js")) continue;
  const code = readFileSync(join(chunksDir, file), "utf-8");
  const defMatch = code.match(/^var\s+(\w+)\s*=\s*\(function\s*\(/m);
  if (defMatch) {
    const name = defMatch[1];
    if (!globalNames[name]) globalNames[name] = [];
    globalNames[name].push(file);
  }
}

// Build rename map for collisions: file -> newName
const renameMap = {};
for (const [name, files] of Object.entries(globalNames)) {
  if (files.length > 1) {
    console.log(`Collision: ${name} defined by ${files.join(", ")}`);
    // Give each a unique suffix based on the hash portion of the filename
    for (let i = 1; i < files.length; i++) {
      const hashMatch = files[i].match(/-([A-Za-z0-9_]+)\./);
      const suffix = hashMatch ? hashMatch[1].substring(0, 6) : String(i);
      const newName = `${name}_${suffix}`;
      renameMap[files[i]] = { oldName: name, newName };
      console.log(`  Renaming in ${files[i]}: ${name} -> ${newName}`);
    }
  }
}

// Pass 2: Fix each file
for (const file of readdirSync(chunksDir)) {
  if (!file.endsWith(".js")) continue;

  let code = readFileSync(join(chunksDir, file), "utf-8");
  let modified = false;

  // Apply renames: if this file defines a colliding name, rename its declaration
  if (renameMap[file]) {
    const { oldName, newName } = renameMap[file];
    code = code.replace(`var ${oldName} = (function()`, `var ${newName} = (function()`);
    modified = true;
  }

  // Also rename references to colliding globals in ALL files
  for (const [targetFile, { oldName, newName }] of Object.entries(renameMap)) {
    // In files OTHER than the one being renamed, update references
    // We need to be careful: only rename references that point to the renamed chunk
    // This is tricky — we need to know which "index01" a file references.
    // For now, we'll handle this after IIFE conversion by checking cross-references.
  }

  // 1. Strip CSS imports: import "./Foo.css";
  if (/^import\s+"[^"]+\.css";?\s*$/m.test(code)) {
    code = code.replace(/^import\s+"[^"]+\.css";?\s*\n/gm, "");
    modified = true;
  }

  // 2. Fix __commonJS wrapper pattern
  // Detect: var __getOwnPropNames = ... var __commonJS = ... var require_Foo = __commonJS({ ... }); export default require_Foo();
  if (code.includes("__commonJS")) {
    // Extract the variable name from "export default require_XXX();"
    const exportMatch = code.match(/export\s+default\s+(require_\w+)\(\);?\s*$/m);
    if (exportMatch) {
      const requireFn = exportMatch[1]; // e.g. require_AppRoot_002

      // Find the variable name pattern: var varName = (function() { ... at the start of the callback body
      // The callback looks like: "filename.js"(exports, module) { var varName = (function() { ... })(); }
      const callbackMatch = code.match(
        /"\w[^"]*"\(exports,\s*module\)\s*\{\s*\n\s*var\s+(\w+)\s*=\s*\(function\(\)/
      );

      if (callbackMatch) {
        const varName = callbackMatch[1]; // e.g. appRoot002

        // Strategy: extract the inner IIFE content.
        // The structure is:
        //   var __getOwnPropNames = ...;
        //   var __commonJS = ...;
        //   var require_X = __commonJS({
        //     "file.js"(exports, module) {
        //       var appRoot002 = (function() {
        //         ...code...
        //         return { ... };
        //       })();
        //     }
        //   });
        //   export default require_X();

        // Find where the inner IIFE starts
        const iifeStart = code.indexOf(`var ${varName} = (function()`);
        if (iifeStart !== -1) {
          // Find the end: the closing of the callback is `})();` followed by newline, then `  }` (closing the callback), then `});` (closing __commonJS)
          // We need to find the IIFE's closing `})();` — but there could be nested ones.
          // Better approach: take everything from `var varName = (function()` to the end,
          // then strip the __commonJS boilerplate suffix.

          let inner = code.slice(iifeStart);

          // Remove the trailing callback/commonJS/export boilerplate:
          // After the IIFE's `})();` there will be:
          //   \n  }\n});\nexport default require_X();
          inner = inner.replace(
            /\n\s*\}\s*\n\}\);\s*\nexport\s+default\s+\w+\(\);?\s*$/,
            ""
          );

          code = inner;
          modified = true;
        }
      }
    }
  }

  // 3. Strip any remaining `export default ...` lines (shouldn't happen for proper IIFEs but just in case)
  if (/^export\s+default\s+/m.test(code)) {
    code = code.replace(/^export\s+default\s+.*$/gm, "");
    modified = true;
  }

  if (modified) {
    writeFileSync(join(chunksDir, file), code);
    console.log(`Fixed: ${file}`);
  }
}

console.log("Done.");
