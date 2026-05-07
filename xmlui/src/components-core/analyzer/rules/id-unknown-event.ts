/**
 * Rule: id-unknown-event
 *
 * For every known component (one in the registry with a `descriptor`), checks
 * that each event-handler binding used in markup is declared in
 * `descriptor.events`.  Event attributes in XMLUI are props whose names begin
 * with `on` followed by an uppercase letter (e.g., `onClick`, `onChange`).
 *
 * Severity: `warn` (strict: `error`).
 * When `descriptor.allowArbitraryProps === true` the check is skipped.
 */

import type { BuildDiagnostic } from "../diagnostics";
import type { RuleContext } from "../rule-registry";
import { registerRule } from "../rule-registry";
import type { ComponentDef } from "../../../abstractions/ComponentDefs";
import { closestMatch, offsetToLineCol, walkComponentDef } from "./_utils";

/**
 * Framework-level event names that are valid on every component regardless
 * of metadata.
 */
const FRAMEWORK_EVENTS: ReadonlySet<string> = new Set([
  // Lifecycle events exposed by wrapComponent / container machinery
  "onMount",
  "onUnmount",
  "onError",
  "onBeforeDispose",
  "onDidChange",
  "onInit",
  // Navigation
  "onDidNavigate",
]);

/** Returns `true` if `name` looks like an XMLUI event attribute. */
function isEventAttr(name: string): boolean {
  return name.length > 2 && name.startsWith("on") && /[A-Z]/.test(name[2]);
}

registerRule({
  code: "id-unknown-event",
  description: "The event handler is not a declared event of this component.",
  defaultSeverity: "warn",
  strictSeverity: "error",
  appliesTo: "markup",

  *run(ctx: RuleContext): Iterable<BuildDiagnostic> {
    if (!ctx.markupAst) return;

    const root = ctx.markupAst as ComponentDef;
    const registry = ctx.componentRegistry;
    if (!registry) return []; // no registry available in this context
    const severity = ctx.strict ? "error" : "warn";
    const diagnostics: BuildDiagnostic[] = [];

    walkComponentDef(root, (node) => {
      // Events live in node.events (transformed from onX= attributes)
      if (!node.events || typeof node.events !== "object") return;

      const entry = registry.lookupComponentRenderer(node.type);
      if (!entry) return;

      const descriptor = entry.descriptor;
      if (!descriptor) return;
      if (descriptor.allowArbitraryProps) return;

      const knownEvents = descriptor.events ? Object.keys(descriptor.events) : [];

      for (const eventName of Object.keys(node.events)) {
        if (!isEventAttr(eventName)) continue;
        if (FRAMEWORK_EVENTS.has(eventName)) continue;
        if (knownEvents.includes(eventName)) continue;

        const offset = (node.debug?.source as any)?.start ?? 0;
        const { line, col } = offsetToLineCol(ctx.source, offset);
        const suggestion = closestMatch(eventName, knownEvents);

        diagnostics.push({
          code: "id-unknown-event",
          severity,
          file: ctx.file,
          line,
          column: col,
          length: eventName.length,
          message: `Unknown event "${eventName}" on <${node.type}>.${suggestion ? ` Did you mean "${suggestion}"?` : ""}`,
          data: { eventName, componentType: node.type },
          suggestions: suggestion
            ? [{ title: `Replace with "${suggestion}"`, replacement: suggestion }]
            : undefined,
        });
      }
    });

    yield* diagnostics;
  },
});
