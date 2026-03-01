#!/usr/bin/env node
/**
 * Computes the correct concatenation order for IIFE chunks.
 *
 * Each chunk either:
 *   - Defines a global: `var fooName = (function() { ... })();`
 *   - References globals: identifiers like `iconNative001.xyz` inside the IIFE body
 *   - Or is an anonymous IIFE (chunk-*.js entry points)
 *
 * This script performs a topological sort so that each chunk is concatenated
 * after all the globals it references have been defined.
 *
 * Usage: node scripts/chunk-order.mjs [chunks-dir]
 * Output: Filenames in concatenation order, one per line.
 *         Also writes chunk-order.json with the ordered list.
 */
import { readFileSync, writeFileSync, readdirSync } from "fs";
import { join } from "path";

const chunksDir = process.argv[2] || "dist/chunks";

const files = readdirSync(chunksDir).filter(f => f.endsWith(".js"));

// Parse each file to find what global it defines and what globals it references
const chunks = [];
for (const file of files) {
  const code = readFileSync(join(chunksDir, file), "utf-8");

  // Check if this file defines a global: `var someName = (function() {`
  const defMatch = code.match(/^var\s+(\w+)\s*=\s*\(function\s*\(/m);
  const defines = defMatch ? defMatch[1] : null;

  // Find all global references: identifiers that match the pattern of other chunk globals
  // We'll collect all `identifier.` patterns and filter to known globals later
  const identifierRefs = new Set();
  const refRegex = /\b([a-zA-Z_]\w+)\./g;
  let match;
  while ((match = refRegex.exec(code)) !== null) {
    if (match[1] !== defines) { // Don't count self-references
      identifierRefs.add(match[1]);
    }
  }

  chunks.push({ file, defines, refs: identifierRefs });
}

// Build set of all defined globals
const allGlobals = new Set(chunks.map(c => c.defines).filter(Boolean));

// Filter refs to only include known globals
for (const chunk of chunks) {
  chunk.deps = new Set([...chunk.refs].filter(r => allGlobals.has(r)));
}

// Topological sort (Kahn's algorithm)
const globalToChunk = {};
for (const chunk of chunks) {
  if (chunk.defines) {
    globalToChunk[chunk.defines] = chunk;
  }
}

// Separate into: chunks that define globals (need ordering) and entry points (go last)
const definingChunks = chunks.filter(c => c.defines);
const entryChunks = chunks.filter(c => !c.defines);

// Compute in-degree for defining chunks
const inDegree = new Map();
for (const c of definingChunks) {
  inDegree.set(c.file, 0);
}
for (const c of definingChunks) {
  for (const dep of c.deps) {
    const depChunk = globalToChunk[dep];
    if (depChunk) {
      inDegree.set(c.file, (inDegree.get(c.file) || 0) + 1);
    }
  }
}

// Start with chunks that have no dependencies
const queue = [];
for (const c of definingChunks) {
  if (inDegree.get(c.file) === 0) {
    queue.push(c);
  }
}

const ordered = [];
while (queue.length > 0) {
  const current = queue.shift();
  ordered.push(current.file);

  // Find chunks that depend on this one
  for (const c of definingChunks) {
    if (c.deps.has(current.defines)) {
      inDegree.set(c.file, inDegree.get(c.file) - 1);
      if (inDegree.get(c.file) === 0) {
        queue.push(c);
      }
    }
  }
}

if (ordered.length !== definingChunks.length) {
  console.error("WARNING: Circular dependency detected! Missing chunks:");
  for (const c of definingChunks) {
    if (!ordered.includes(c.file)) {
      console.error(`  ${c.file} (defines: ${c.defines}, deps: ${[...c.deps].join(", ")})`);
    }
  }
}

// Entry point chunks go last (they just call registerExtension)
const entryFiles = entryChunks.map(c => c.file).sort();
const fullOrder = [...ordered, ...entryFiles];

console.log("=== Concatenation order ===");
for (const f of fullOrder) {
  const chunk = chunks.find(c => c.file === f);
  const info = chunk.defines ? `defines: ${chunk.defines}` : "entry point";
  const deps = chunk.deps.size > 0 ? `, deps: ${[...chunk.deps].join(", ")}` : "";
  console.log(`  ${f}  (${info}${deps})`);
}

// Write the order to a JSON file for the CLI to consume
writeFileSync(join(chunksDir, "chunk-order.json"), JSON.stringify(fullOrder, null, 2));
console.log(`\nWrote ${join(chunksDir, "chunk-order.json")}`);
