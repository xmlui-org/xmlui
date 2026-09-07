import type { CompileDiagnostic } from "./diagnostics";
import type { StrictCompilationViolation } from "./strict-compilation";
import type { CompiledScriptSourceRange } from "./types";

/**
 * The report an app author actually reads.
 *
 * The compact form — `compile-unsupported-node: /src/Globals.xs#function-roleHint` plus a
 * line and column — identifies the block but not the code, the cure, or the owner. On a
 * large file a `#event-690` counter narrows nothing. This renders the line itself with a
 * caret under the construct, says what to write instead, and names the switch that turned
 * a fallback into an error.
 */

export type CompileReportContext = {
  /** Original script text, so the offending line can be quoted. */
  sourceText?: string;
  /** File the script came from, for the location line. */
  fileName?: string;
  /** Human owner, e.g. `Button onClick` or `var.rows`. */
  owner?: string;
  /** Whether strict compilation is what made this an error rather than a fallback. */
  strict?: boolean;
};

const INDENT = "  ";

export function formatCompileReport(
  diagnostic: CompileDiagnostic,
  context: CompileReportContext = {},
): string {
  const lines: string[] = [];
  lines.push(
    context.strict
      ? "[xmlui] Strict compilation: this script cannot be compiled."
      : "[xmlui] This script could not be compiled and will run interpreted.",
  );
  lines.push("");

  const location = formatLocation(diagnostic, context);
  if (location) {
    lines.push(`${INDENT}${location}`);
  }
  // --- The diagnostic's own owner wins: it was resolved where the handler was parsed.
  const owner = [diagnostic.owner ?? context.owner, `source id: ${diagnostic.sourceId}`]
    .filter(Boolean)
    .join("   ");
  lines.push(`${INDENT}${owner}`);

  const snippet = formatSnippet(diagnostic, context);
  if (snippet.length > 0) {
    lines.push("");
    lines.push(...snippet.map((line) => `${INDENT}${line}`));
  }

  lines.push("");
  lines.push(`${INDENT}${diagnostic.detail}.`);
  if (diagnostic.fix) {
    lines.push(...wrap(diagnostic.fix, 88).map((line) => `${INDENT}${line}`));
  }

  lines.push("");
  lines.push(...formatConsequence(diagnostic.code, context.strict));
  return lines.join("\n");
}

/**
 * A tripwire violation has no compiler error behind it: nothing refused this construct,
 * it simply was not compiled. Saying so is the difference between "fix your code" and
 * "this call site never asked", which have different fixes and different owners.
 */
export function formatStrictViolationReport(
  violation: StrictCompilationViolation,
  context: CompileReportContext = {},
): string {
  const lines: string[] = [
    "[xmlui] Strict compilation: this script ran interpreted.",
    "",
  ];
  const location = formatRangeLocation(violation.sourceRange, context.fileName);
  if (location) {
    lines.push(`${INDENT}${location}`);
  }
  const owner = [context.owner, violation.sourceId ? `source id: ${violation.sourceId}` : ""]
    .filter(Boolean)
    .join("   ");
  if (owner) {
    lines.push(`${INDENT}${owner}`);
  }
  if (violation.sourceText) {
    lines.push("");
    lines.push(`${INDENT}${collapse(violation.sourceText)}`);
  }
  lines.push("");
  lines.push(
    ...wrap(DOOR_EXPLANATIONS[violation.door], 88).map((line) => `${INDENT}${line}`),
  );
  lines.push("");
  lines.push(
    `${INDENT}No construct was refused here — nothing reported a fallback, because nothing`,
  );
  lines.push(`${INDENT}fell back. This code was never handed to the compiler at all.`);
  lines.push("");
  lines.push(...formatConsequence("strict-compilation-violation", true));
  return lines.join("\n");
}

const DOOR_EXPLANATIONS: Record<StrictCompilationViolation["door"], string> = {
  binding:
    "A binding expression was evaluated by the interpreter. Either the evaluation context " +
    "that reached it does not carry `compileScripts`, or the expression is an arrow the " +
    "compiled binding path hands back to be walked.",
  "statement-sync":
    "A statement list ran through the synchronous interpreter, which has no compiled " +
    "target. Every caller of it is interpreted today, whatever the app asked for.",
  "statement-async":
    "A statement list ran through the asynchronous interpreter — either as a fallback " +
    "after compilation was refused, or because the evaluation context never carried " +
    "`compileScripts`.",
  arrow:
    "An arrow function body was walked by the interpreter. A compiled declaration runs " +
    "from its build-time artifact, so reaching here means this arrow has none.",
};

/** The code, and — under strict mode — why it stopped the build and how to relax it. */
function formatConsequence(code: string, strict?: boolean): string[] {
  if (!strict) {
    return [`${INDENT}${code}`];
  }
  return wrap(
    `${code} · "strictCompilation" is on, so this is an error rather than a fallback to ` +
      `interpreted execution. Set "strictCompilation": false in xmlui.config.json to ` +
      `downgrade it to a warning.`,
    88,
  ).map((line) => `${INDENT}${line}`);
}

function formatLocation(diagnostic: CompileDiagnostic, context: CompileReportContext): string {
  const file = context.fileName ?? diagnostic.sourceId.split("#")[0];
  if (!file || diagnostic.line === undefined) {
    return file ?? "";
  }
  const column = diagnostic.column === undefined ? "" : `:${diagnostic.column}`;
  return `${file}:${diagnostic.line}${column}`;
}

function formatRangeLocation(
  range: CompiledScriptSourceRange | undefined,
  fileName?: string,
): string {
  if (!fileName && range?.startLine === undefined) {
    return "";
  }
  if (range?.startLine === undefined) {
    return fileName ?? "";
  }
  const column = range.startColumn === undefined ? "" : `:${range.startColumn + 1}`;
  return `${fileName ?? ""}:${range.startLine}${column}`;
}

/**
 * The offending line with a caret under it. Falls back to nothing rather than guessing:
 * a caret in the wrong place is worse than no caret.
 */
function formatSnippet(
  diagnostic: CompileDiagnostic,
  context: CompileReportContext,
): string[] {
  if (!context.sourceText || diagnostic.line === undefined) {
    return [];
  }
  const sourceLines = context.sourceText.split("\n");
  const line = sourceLines[diagnostic.line - 1];
  if (line === undefined) {
    return [];
  }
  const gutter = String(diagnostic.line);
  const pad = " ".repeat(gutter.length);
  const rendered = [`${gutter} | ${line}`];
  if (diagnostic.column !== undefined) {
    const caretOffset = Math.max(0, diagnostic.column - 1);
    const width = Math.max(1, Math.min(caretMax(line, caretOffset), 20));
    rendered.push(
      `${pad} | ${" ".repeat(caretOffset)}${"^".repeat(width)} ${diagnostic.construct ?? ""}`.trimEnd(),
    );
  }
  return rendered;
}

/** How far the construct runs on this line, so the caret spans it rather than a guess. */
function caretMax(line: string, offset: number): number {
  const rest = line.slice(offset);
  const token = /^[A-Za-z_$][\w$]*|^\S+/.exec(rest);
  return token ? token[0].length : 1;
}

function collapse(text: string): string {
  const collapsed = text.replace(/\s+/g, " ").trim();
  return collapsed.length > 120 ? `${collapsed.slice(0, 117)}...` : collapsed;
}

function wrap(text: string, width: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    if (current.length === 0) {
      current = word;
    } else if (current.length + 1 + word.length <= width) {
      current += ` ${word}`;
    } else {
      lines.push(current);
      current = word;
    }
  }
  if (current.length > 0) {
    lines.push(current);
  }
  return lines;
}
