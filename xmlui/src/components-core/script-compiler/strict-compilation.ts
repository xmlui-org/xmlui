import type { CompiledScriptSourceRange } from "./types";

/**
 * Strict compilation: with `compileScripts` on, reaching the interpreter is an error.
 *
 * There are three ways a script ends up interpreted, and only the first leaves a trace:
 *
 *   A. the compiler refused a construct and the caller fell back — reported today;
 *   B. the compiled path chose to interpret (a lazy arrow, anything routed through the
 *      synchronous statement queue, which has no compiled target) — silent;
 *   C. the evaluation context never carried `compileScripts` at all — silent, and worse
 *      than silent, since `evalBinding` stamps a default options object onto a context
 *      that arrives without one, so the omission leaves nothing to find.
 *
 * Escalating the existing `compile-*` diagnostics from warning to error would only cover
 * A. An app could then report zero fallbacks while running mostly interpreted — the same
 * shape as the bug that started this work, where a build announced 835 compiled artifacts
 * for an app that executed none of them.
 *
 * So the invariant is not "no fallbacks" but "no interpretation", enforced at the
 * interpreter's own doors. It needs no knowledge of *why* the interpreter was reached,
 * which is what makes it hold against a category nobody has thought of yet.
 *
 * The flag is module-level rather than read from the evaluation context on purpose:
 * category C is precisely the case where those options are missing, so a context-based
 * check would be blind to it. It also keeps the cost of the guard to one boolean read on
 * the hottest paths in the framework.
 */

/** Which door into the interpreter was opened. */
export type StrictCompilationDoor =
  /** A binding expression evaluated by the AST walker. */
  | "binding"
  /** A statement list run by the synchronous queue. */
  | "statement-sync"
  /** A statement list run by the asynchronous queue. */
  | "statement-async"
  /** An arrow function body walked by the interpreter. */
  | "arrow";

export type StrictCompilationViolation = {
  door: StrictCompilationDoor;
  /** Original source of the construct, when the AST node carries it. */
  sourceText?: string;
  /** Where it came from, once the node carries an id (see `sourceId` enrichment). */
  sourceId?: string;
  sourceRange?: CompiledScriptSourceRange;
};

export class StrictCompilationViolationError extends Error {
  constructor(public readonly violation: StrictCompilationViolation) {
    super(describeViolation(violation));
    this.name = "StrictCompilationViolationError";
  }
}

let strictCompilationEnabled = false;

/**
 * Arms or disarms the guard. Called once from the app's configuration merge, so that a
 * context-free call site — an emulated backend, a hand-built evaluation context — is
 * covered exactly like a component's binding.
 */
export function setStrictCompilationEnabled(enabled: boolean): void {
  strictCompilationEnabled = enabled;
}

export function isStrictCompilationEnabled(): boolean {
  return strictCompilationEnabled;
}

/** Test seam: strict mode is process-wide, so a test that arms it must disarm it. */
export function resetStrictCompilationForTests(): void {
  strictCompilationEnabled = false;
}

/**
 * The guard itself. Call sites check `isStrictCompilationEnabled()` first so the common
 * path is a boolean read with no argument object allocated.
 */
export function throwStrictCompilationViolation(violation: StrictCompilationViolation): never {
  throw new StrictCompilationViolationError(violation);
}

const DOOR_DESCRIPTIONS: Record<StrictCompilationDoor, string> = {
  binding: "a binding expression was evaluated by the interpreter",
  "statement-sync": "a statement list was run by the synchronous interpreter",
  "statement-async": "a statement list was run by the asynchronous interpreter",
  arrow: "an arrow function body was walked by the interpreter",
};

function describeViolation(violation: StrictCompilationViolation): string {
  const where = violation.sourceId ? ` in ${violation.sourceId}` : "";
  const what = violation.sourceText ? `: ${truncate(violation.sourceText)}` : "";
  return `${DOOR_DESCRIPTIONS[violation.door]}${where}${what}`;
}

function truncate(text: string): string {
  const collapsed = text.replace(/\s+/g, " ").trim();
  return collapsed.length > 120 ? `${collapsed.slice(0, 117)}...` : collapsed;
}
