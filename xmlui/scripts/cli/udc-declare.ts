#!/usr/bin/env node
/**
 * xmlui udc declare — UDC contract migration scaffolder (plan #14 Step 1.2).
 *
 * Walks one or more `.xmlui` files, finds every `<Component>` root that has
 * NO explicit `<Prop>`/`<Event>`/`<Method>`/`<Slot>` declaration block, and
 * prints (or, with `--write`, in-place inserts) a recommended declaration
 * block derived from the existing inference walk.
 *
 * The output is a starting point — authors should review and refine types,
 * mark required props, and add `capabilities="…"` before promoting to a
 * strict-mode build.
 *
 * Usage:
 *   node xmlui/scripts/cli/udc-declare.ts <file-or-directory> [options]
 *
 * Options:
 *   --write            Insert the declaration block in-place (creates a .bak file)
 *   --format gnu|json  Output format (default: gnu)
 *
 * Exit codes:
 *   0 — clean (or contracts produced)
 *   2 — usage / IO error
 */

import * as fs from "fs";
import * as path from "path";

import { parseXmlUiMarkup } from "../../src/parsers/xmlui-parser/parser";
import { nodeToComponentDef } from "../../src/parsers/xmlui-parser/transform";
import { collectPropsFromComponentDef } from "../../src/components-core/ud-metadata";
import type {
  CompoundComponentDef,
  ComponentDef,
} from "../../src/abstractions/ComponentDefs";

// ---------------------------------------------------------------------------
// Argument parsing
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);
const target = args.find((a) => !a.startsWith("--")) ?? process.cwd();
const write = args.includes("--write");
const formatIdx = args.indexOf("--format");
const format = (formatIdx >= 0 ? args[formatIdx + 1] : "gnu") as "gnu" | "json";

// ---------------------------------------------------------------------------
// File discovery
// ---------------------------------------------------------------------------

function walkDir(dir: string, ext: string): string[] {
  const results: string[] = [];
  try {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory() && entry.name !== "node_modules" && !entry.name.startsWith(".")) {
        results.push(...walkDir(full, ext));
      } else if (entry.isFile() && entry.name.endsWith(ext)) {
        results.push(full);
      }
    }
  } catch {
    // unreadable directories are skipped
  }
  return results;
}

function listInputs(t: string): string[] {
  const abs = path.resolve(t);
  if (!fs.existsSync(abs)) {
    process.stderr.write(`xmlui udc declare: not found: ${abs}\n`);
    process.exit(2);
  }
  const stat = fs.statSync(abs);
  return stat.isDirectory() ? walkDir(abs, ".xmlui") : [abs];
}

// ---------------------------------------------------------------------------
// Inference & rendering
// ---------------------------------------------------------------------------

function isCompound(
  def: ComponentDef | CompoundComponentDef | null,
): def is CompoundComponentDef {
  return !!def && (def as CompoundComponentDef).component !== undefined;
}

interface DeclareResult {
  file: string;
  name: string;
  /** Whether the source already had an explicit declaration block. */
  alreadyDeclared: boolean;
  props: string[];
  declarationBlock: string;
}

function inferredDeclarationBlock(props: string[]): string {
  if (props.length === 0) return "";
  const lines = props.map(
    (p) => `    <Prop name="${p}" />`,
  );
  return lines.join("\n");
}

function processFile(file: string): DeclareResult | null {
  let source: string;
  try {
    source = fs.readFileSync(file, "utf-8");
  } catch {
    return null;
  }
  const parsed = parseXmlUiMarkup(source);
  if (parsed.errors.length > 0 || !parsed.node) return null;
  const getText = (n: any) => source.substring(n.start ?? 0, n.end ?? 0);
  const def = nodeToComponentDef(parsed.node, getText, file);
  if (!isCompound(def)) return null;

  const alreadyDeclared = !!(def as any).contract;
  const inferredProps = alreadyDeclared
    ? []
    : collectPropsFromComponentDef(def.component as ComponentDef).sort();
  return {
    file,
    name: def.name,
    alreadyDeclared,
    props: inferredProps,
    declarationBlock: inferredDeclarationBlock(inferredProps),
  };
}

// ---------------------------------------------------------------------------
// In-place writer — inserts the block immediately after the opening
// `<Component …>` tag.  Idempotency: skips when contract already declared.
// ---------------------------------------------------------------------------

function insertDeclarationBlock(file: string, block: string): boolean {
  if (!block) return false;
  let source: string;
  try {
    source = fs.readFileSync(file, "utf-8");
  } catch {
    return false;
  }
  const openTagMatch = source.match(/<Component\b[^>]*>/);
  if (!openTagMatch || openTagMatch.index === undefined) return false;
  const insertAt = openTagMatch.index + openTagMatch[0].length;
  const updated =
    source.slice(0, insertAt) + "\n" + block + "\n" + source.slice(insertAt);
  try {
    fs.writeFileSync(file + ".bak", source);
    fs.writeFileSync(file, updated);
    return true;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main(): void {
  const files = listInputs(target);
  const results: DeclareResult[] = [];
  for (const file of files) {
    const r = processFile(file);
    if (r) results.push(r);
  }

  if (format === "json") {
    process.stdout.write(JSON.stringify(results, null, 2) + "\n");
  } else {
    if (results.length === 0) {
      process.stdout.write("xmlui udc declare: no UDCs found.\n");
    }
    for (const r of results) {
      if (r.alreadyDeclared) {
        process.stdout.write(`${r.file}: ${r.name} — already declared (skipped)\n`);
        continue;
      }
      if (r.props.length === 0) {
        process.stdout.write(`${r.file}: ${r.name} — no $props references found\n`);
        continue;
      }
      process.stdout.write(`${r.file}: ${r.name} — suggested declarations:\n`);
      process.stdout.write(r.declarationBlock + "\n");
    }
  }

  if (write) {
    let written = 0;
    for (const r of results) {
      if (r.alreadyDeclared || !r.declarationBlock) continue;
      if (insertDeclarationBlock(r.file, r.declarationBlock)) written++;
    }
    process.stdout.write(
      `xmlui udc declare: wrote declaration blocks into ${written} file(s) (originals saved as *.bak).\n`,
    );
  }
  process.exit(0);
}

main();
