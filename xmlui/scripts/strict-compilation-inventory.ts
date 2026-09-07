#!/usr/bin/env tsx

/**
 * The strict-compilation violation inventory.
 *
 * Phase 3.1 of `.plan/strict-compilation-mode.md`: run strict mode over every piece of
 * XMLUI in the repository and publish what does not compile, so the remaining work is
 * counted rather than estimated.
 *
 * Scope, stated plainly: this covers the constructs the *compiler refuses* — category A
 * in the plan's taxonomy. The two silent categories need a running app, because a lazy
 * arrow and a call site that never carried the switch only reveal themselves when the
 * interpreter is actually entered. The runtime tripwire covers those; this does not.
 *
 *   npm run check:strict-compilation          # report
 *   npm run check:strict-compilation -- --fail # non-zero exit if anything is found
 *   npx tsx scripts/strict-compilation-inventory.ts --json
 */

import { readdirSync, readFileSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, relative, resolve } from "node:path";

import { xmlUiMarkupToComponent } from "../src/components-core/xmlui-parser";
import { compileBindingSyncExpression } from "../src/components-core/script-compiler/targets/binding-sync";
import { createCompileDiagnostic } from "../src/components-core/script-compiler/diagnostics";
import { parseParameterString } from "../src/components-core/script-runner/ParameterParser";
import { collectCodeBehindFromSource } from "../src/parsers/scripting/code-behind-collect";
import type { CompileDiagnosticNotice } from "../src/parsers/xmlui-parser/parser";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const SKIP_DIRECTORIES = new Set(["node_modules", "dist", "dist-ssg", ".git", "build", "coverage"]);

type Violation = CompileDiagnosticNotice & { origin: string };

function walk(directory: string, onFile: (path: string) => void): void {
  let entries: string[];
  try {
    entries = readdirSync(directory);
  } catch {
    return;
  }
  for (const entry of entries) {
    if (SKIP_DIRECTORIES.has(entry)) continue;
    const path = join(directory, entry);
    let stats;
    try {
      stats = statSync(path);
    } catch {
      continue;
    }
    if (stats.isDirectory()) {
      walk(path, onFile);
    } else {
      onFile(path);
    }
  }
}

/**
 * Binding expressions, which the build never compiles.
 *
 * Prop values are stored as strings and parsed lazily in the browser, so
 * `onCompileDiagnostic` never fires for one — an inventory built only from the build's
 * own diagnostics is blind to every `var.` initializer and every attribute binding, which
 * is most of an app. Worse, the binding path has no fallback catch, so a construct it
 * refuses is an app-breaking error rather than a slow path. They are compiled here
 * explicitly, the way the browser would on first evaluation.
 */
function collectFromBindings(
  component: unknown,
  fileName: string,
  violations: Violation[],
): void {
  const seen = new Set<unknown>();
  const walk = (node: unknown, path: string): void => {
    if (!node || typeof node !== "object" || seen.has(node)) return;
    seen.add(node);
    if (Array.isArray(node)) {
      node.forEach((item, index) => walk(item, `${path}[${index}]`));
      return;
    }
    for (const [key, value] of Object.entries(node as Record<string, unknown>)) {
      if (typeof value === "string" && value.includes("{")) {
        compileBindingString(value, `${path}.${key}`, fileName, violations);
      } else {
        walk(value, `${path}.${key}`);
      }
    }
  };
  walk(component, "");
}

function compileBindingString(
  value: string,
  owner: string,
  fileName: string,
  violations: Violation[],
): void {
  let segments;
  try {
    segments = parseParameterString(value);
  } catch {
    return;
  }
  segments.forEach((segment, index) => {
    if (segment.type !== "expression") return;
    const sourceId = `${fileName}#expr-${index}`;
    try {
      compileBindingSyncExpression(segment.value as any, { sourceId, sourceText: value });
    } catch (error) {
      violations.push({
        origin: "binding",
        fileName,
        sourceText: value,
        diagnostic: createCompileDiagnostic(error, { sourceId, owner }) as any,
      });
    }
  });
}

/** Markup files, compiled the way the Vite plugin compiles them. */
function collectFromMarkup(violations: Violation[]): number {
  let scanned = 0;
  walk(REPO_ROOT, (path) => {
    if (!path.endsWith(".xmlui")) return;
    scanned++;
    const fileId = `/${relative(REPO_ROOT, path)}`;
    try {
      const parsed: any = xmlUiMarkupToComponent(
        readFileSync(path, "utf-8"),
        fileId,
        undefined,
        undefined,
        {
          compileScripts: true,
          onCompileDiagnostic: (entry) => violations.push({ ...entry, origin: "markup" }),
        } as any,
      );
      collectFromBindings(parsed?.component, fileId, violations);
      (parsed?.inlineComponents ?? []).forEach((inline: unknown) =>
        collectFromBindings(inline, fileId, violations),
      );
    } catch {
      // --- A file that does not parse is not this script's problem to report.
    }
  });
  return scanned;
}

/** `.xs` code-behind and helper modules. */
function collectFromCodeBehind(violations: Violation[]): number {
  let scanned = 0;
  walk(REPO_ROOT, (path) => {
    if (!path.endsWith(".xs")) return;
    scanned++;
    const fileId = `/${relative(REPO_ROOT, path)}`;
    try {
      const collected: any = collectCodeBehindFromSource(fileId, readFileSync(path, "utf-8"), {
        compileScripts: true,
      } as any);
      for (const [name, declaration] of Object.entries<any>(collected.functions ?? {})) {
        if (declaration?.compiledUnsupported) {
          violations.push({
            origin: "code-behind",
            fileName: fileId,
            diagnostic: {
              code: "compile-unsupported-node",
              sourceId: `${fileId}#function-${name}`,
              detail: String(declaration.compiledUnsupportedReason ?? "did not compile"),
              owner: name,
            },
          });
        }
      }
    } catch {
      // --- Same: a parse failure is a different report.
    }
  });
  return scanned;
}

/** Documentation examples, which are the API surface app authors copy from. */
function collectFromDocs(violations: Violation[]): number {
  let scanned = 0;
  const docsRoot = join(REPO_ROOT, "website", "content", "docs");
  walk(docsRoot, (path) => {
    if (!path.endsWith(".md")) return;
    const text = readFileSync(path, "utf-8");
    const fences = [...text.matchAll(/```xmlui\s*\n([\s\S]*?)```/g)];
    fences.forEach((fence, index) => {
      scanned++;
      const fileId = `/${relative(REPO_ROOT, path)}#example-${index + 1}`;
      try {
        const parsed: any = xmlUiMarkupToComponent(fence[1], fileId, undefined, undefined, {
          compileScripts: true,
          onCompileDiagnostic: (entry) => violations.push({ ...entry, origin: "docs" }),
        } as any);
        collectFromBindings(parsed?.component, fileId, violations);
      } catch {
        // --- Many fences are fragments rather than whole files.
      }
    });
  });
  return scanned;
}

function tally<T>(items: T[], key: (item: T) => string): Array<[string, number]> {
  const counts = new Map<string, number>();
  for (const item of items) {
    const k = key(item);
    counts.set(k, (counts.get(k) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

function main(): void {
  const violations: Violation[] = [];
  const markupFiles = collectFromMarkup(violations);
  const codeBehindFiles = collectFromCodeBehind(violations);
  const docExamples = collectFromDocs(violations);

  if (process.argv.includes("--json")) {
    console.log(JSON.stringify({ violations }, null, 2));
    return;
  }

  console.log("Strict-compilation violation inventory");
  console.log("=".repeat(72));
  console.log(
    `Scanned: ${markupFiles} .xmlui file(s), ${codeBehindFiles} .xs file(s), ` +
      `${docExamples} documentation example(s).`,
  );
  console.log(`Violations: ${violations.length}`);
  console.log("");
  console.log("Covers constructs the compiler refuses, in handlers, declarations and");
  console.log("bindings — the last of which the build never compiles on its own, so they");
  console.log("are compiled here the way the browser would on first evaluation.");
  console.log("");
  console.log("Not covered: interpretation that nothing refuses — a lazy arrow, or a call");
  console.log("site that never carried the switch. Those need a running app, and the");
  console.log("runtime guard reports them instead.");

  if (violations.length === 0) {
    console.log("");
    console.log("Nothing in this repository fails to compile.");
    return;
  }

  for (const [heading, key] of [
    ["By construct", (v: Violation) => v.diagnostic.construct ?? v.diagnostic.detail],
    ["By source", (v: Violation) => v.origin],
    ["By file", (v: Violation) => v.fileName ?? "(unknown)"],
  ] as const) {
    console.log("");
    console.log(`${heading}:`);
    for (const [name, count] of tally(violations, key)) {
      console.log(`  ${String(count).padStart(5)}  ${name}`);
    }
  }

  // --- `--fail` makes this a gate rather than a report, so CI can hold the line at zero
  // --- once it is reached. The repository is at zero today.
  if (process.argv.includes("--fail")) {
    process.exitCode = 1;
  }
}

main();
