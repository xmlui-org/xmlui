import { UnsupportedCompiledScriptNodeError } from "./errors";
import { T_LITERAL } from "../../parsers/scripting/ScriptingNodeTypes";
import { createLogEntry, pushXsLog } from "../inspector/inspectorUtils";
import type { CompiledScriptSourceRange } from "./types";

/**
 * Why a script block is not running as compiled JavaScript.
 *
 * One code per cause, in the shape the other diagnostic families use
 * (`ConcurrencyCode`, `FormDiagnosticCode`, `A11yCode`): a stable string an app author
 * can search for, grep out of a build log, or filter an Inspector trace by.
 */
export type CompileDiagnosticCode =
  /** The compiler met a construct it cannot emit (`await`, an `async` arrow, …). */
  | "compile-unsupported-node"
  /**
   * A literal that cannot be carried into an interpreted arrow — a regular expression,
   * for instance, which does not survive serialization into the emitted module.
   */
  | "compile-unserializable-literal"
  /**
   * A compiled artifact reported an unsupported node while running, and the interpreter
   * took the block over.
   */
  | "compile-runtime-fallback"
  /** Compilation failed for a reason that is not an unsupported construct. */
  | "compile-source-unavailable";

export type CompileDiagnosticPhase = "build" | "runtime";

export type CompileDiagnostic = {
  code: CompileDiagnosticCode;
  severity: "warn";
  /** Identifies the script block, e.g. `"/src/Globals.xs#function-roleHint"`. */
  sourceId: string;
  /** Human-readable construct name, e.g. `"await expression"`, when one is known. */
  construct?: string;
  /** 1-based line of the construct in the original source, when known. */
  line?: number;
  /** 1-based column of the construct in the original source, when known. */
  column?: number;
  /** What stopped compilation, without the code or the source id. */
  detail: string;
};

type CreateCompileDiagnosticOptions = {
  sourceId: string;
  phase?: CompileDiagnosticPhase;
};

/**
 * Turns a compilation failure into a diagnostic. The code is derived from the error
 * itself rather than from the call site, so the same construct always reports the same
 * way whether it was refused during the build or while the app was running.
 */
export function createCompileDiagnostic(
  error: unknown,
  { sourceId, phase = "build" }: CreateCompileDiagnosticOptions,
): CompileDiagnostic {
  if (error instanceof UnsupportedCompiledScriptNodeError) {
    const isLiteral = Number(error.nodeType) === T_LITERAL;
    const position = positionOf(error.sourceRange);
    return {
      code:
        phase === "runtime"
          ? "compile-runtime-fallback"
          : isLiteral
            ? "compile-unserializable-literal"
            : "compile-unsupported-node",
      severity: "warn",
      sourceId: error.sourceId || sourceId,
      construct: error.nodeTypeName,
      ...position,
      detail: isLiteral
        ? `${error.nodeTypeName} cannot be carried into interpreted execution`
        : `${error.nodeTypeName} is not supported by the compiler`,
    };
  }
  return {
    code: "compile-source-unavailable",
    severity: "warn",
    sourceId,
    detail: (error as Error)?.message ?? "compilation failed",
  };
}

/**
 * The reported form, e.g.
 *
 * ```
 * compile-unsupported-node: /src/Globals.xs#function-roleHint
 *         await expression at line 4, column 12 — falling back to interpretation
 * ```
 */
export function formatCompileDiagnostic(diagnostic: CompileDiagnostic): string {
  return (
    `${diagnostic.code}: ${diagnostic.sourceId}\n` +
    `        ${diagnostic.detail}${formatPosition(diagnostic)} — falling back to interpretation`
  );
}

/**
 * The compact form stored on the emitted block as `compiledUnsupportedReason`, so a
 * fallback stays machine-checkable in a built bundle even with reporting turned off.
 */
export function describeCompileDiagnostic(diagnostic: CompileDiagnostic): string {
  return `${diagnostic.code}: ${diagnostic.detail}${formatPosition(diagnostic)}`;
}

function positionOf(sourceRange?: CompiledScriptSourceRange): { line?: number; column?: number } {
  if (sourceRange?.startLine === undefined) {
    return {};
  }
  return {
    line: sourceRange.startLine,
    // --- Source ranges carry 0-based columns; diagnostics quote them the way an editor
    // --- does.
    ...(sourceRange.startColumn === undefined ? {} : { column: sourceRange.startColumn + 1 }),
  };
}

function formatPosition(diagnostic: Pick<CompileDiagnostic, "line" | "column">): string {
  if (diagnostic.line === undefined) {
    return "";
  }
  return diagnostic.column === undefined
    ? ` at line ${diagnostic.line}`
    : ` at line ${diagnostic.line}, column ${diagnostic.column}`;
}

/**
 * Reports a fallback the way the runtime reports every other diagnostic family: a
 * `kind:"compile"` Inspector entry (kept even when the console stays quiet, so the
 * Inspector shows the full picture) and, when `reportCompileFallbacks` is on, one
 * console line.
 */
export function reportCompileDiagnostic(
  diagnostic: CompileDiagnostic,
  options: { report?: boolean; xsLogMax?: number } = {},
): void {
  pushXsLog(
    createLogEntry("compile", {
      code: diagnostic.code,
      severity: diagnostic.severity,
      message: describeCompileDiagnostic(diagnostic),
      sourceId: diagnostic.sourceId,
      ...(diagnostic.construct === undefined ? {} : { construct: diagnostic.construct }),
      ...(diagnostic.line === undefined ? {} : { line: diagnostic.line }),
      ...(diagnostic.column === undefined ? {} : { column: diagnostic.column }),
    } as any),
    options.xsLogMax ?? 200,
  );
  if (options.report && typeof console !== "undefined" && console.warn) {
    console.warn(`[xmlui] ${formatCompileDiagnostic(diagnostic)}`);
  }
}
