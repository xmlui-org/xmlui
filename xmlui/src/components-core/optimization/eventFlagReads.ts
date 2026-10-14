/**
 * Which `<event>InProgress` flags can an app read? (#3941, engine item 1)
 *
 * Every event handler on a component with an `id` sets `<event>InProgress` on its owner
 * container when it starts and clears it when it ends. Each write is a new container state, so
 * every handler run redraws its owner twice, whether or not anything reads the flag. Markup can
 * read a flag as `<id>.<event>InProgress`, but most apps never do.
 *
 * This module collects, once per app (and again when its definitions change), every
 * `…InProgress` name that appears anywhere in the app's definitions: markup expressions, event
 * handlers, code-behind, raw or already parsed.
 * A handler skips its flag writes when its flag's name is not among them.
 *
 * The check is deliberately coarse and conservative:
 * - One set per app: if any part of the app mentions `clickInProgress`, every `click` handler
 *   keeps writing its flag.
 * - Unknown means "write as before": the set is `undefined` when it was never computed (nested
 *   playground apps don't go through `StandaloneApp`) or when the app may build a flag name at
 *   runtime (the bare token `InProgress` appears, as in `x[name + "InProgress"]`).
 */

/** Matches a whole `…InProgress` identifier, or the bare `InProgress` token */
const FLAG_NAME = /[A-Za-z_$][\w$]*InProgress(?![\w$])|(?<![\w$])InProgress(?![\w$])/g;

/** The bare token: a flag name may be assembled at runtime */
const BARE_TOKEN = "InProgress";

/**
 * The key under which the app-wide set travels in the app's global props: `StandaloneApp` puts
 * it there, and event handlers read it through `appContext.appGlobals`. A symbol keeps it out of
 * markup, `Object.keys` and JSON.
 */
export const EVENT_FLAG_READS = Symbol("xmlui.eventFlagReads");

/**
 * Collects every `…InProgress` name that appears in the given definitions.
 * @param roots The app's definitions (entry point, compound components)
 * @returns The names, or `undefined` when a flag name could be built at runtime
 */
export function collectEventFlagReads(roots: readonly unknown[]): ReadonlySet<string> | undefined {
  const names = new Set<string>();
  const visited = new WeakSet<object>();
  let dynamic = false;

  const visit = (value: unknown): void => {
    if (dynamic || value === null || value === undefined) return;
    if (typeof value === "string") {
      if (!value.includes(BARE_TOKEN)) return;
      for (const match of value.matchAll(FLAG_NAME)) {
        if (match[0] === BARE_TOKEN) {
          dynamic = true;
          return;
        }
        names.add(match[0]);
      }
      return;
    }
    if (typeof value !== "object") return;
    if (visited.has(value)) return;
    visited.add(value);
    if (Array.isArray(value)) {
      for (const item of value) visit(item);
      return;
    }
    if (value instanceof Map) {
      value.forEach((item) => visit(item));
      return;
    }
    if (value instanceof Set) {
      value.forEach((item) => visit(item));
      return;
    }
    for (const key of Object.keys(value)) visit((value as Record<string, unknown>)[key]);
  };

  roots.forEach(visit);
  return dynamic ? undefined : names;
}

/**
 * Whether an app may read the `<eventName>InProgress` flag.
 * @param reads The app's set from {@link collectEventFlagReads}; `undefined` means unknown
 * @param eventName The handler's event name, e.g. `"click"`
 */
export function mayReadEventFlag(
  reads: ReadonlySet<string> | undefined,
  eventName: string | undefined,
): boolean {
  if (!reads || !eventName) return true;
  return reads.has(`${eventName}InProgress`);
}
