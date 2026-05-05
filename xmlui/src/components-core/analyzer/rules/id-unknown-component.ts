/**
 * Rule: id-unknown-component
 *
 * Emits an error for every markup node whose `type` is not found in the
 * component registry. Includes a Levenshtein-based suggestion.
 *
 * Severity: always `error` (typos here drop entire subtrees silently).
 */

import type { BuildDiagnostic } from "../diagnostics";
import type { RuleContext } from "../rule-registry";
import { registerRule } from "../rule-registry";
import type { ComponentDef } from "../../../abstractions/ComponentDefs";
import { closestMatch, offsetToLineCol, walkComponentDef } from "./_utils";

/** Framework-level type names that are not component-registry entries. */
const FRAMEWORK_TYPES: ReadonlySet<string> = new Set([
  // Compound-component declaration root
  "Component",
  // Transformer internal helpers (should never appear in user markup but guard anyway)
  "#text",
  "#comment",
  "#cdata-section",
  "Fragment",
]);

/** Loader type names that are in the loader registry (not component registry). */
const LOADER_TYPES: ReadonlySet<string> = new Set([
  "DataSource",
  "APICall",
  "MockLoader",
  "DataLoader",
  "ExternalDataLoader",
]);

registerRule({
  code: "id-unknown-component",
  description: "The tag name is not registered in the component registry.",
  defaultSeverity: "error",
  strictSeverity: "error",
  appliesTo: "markup",

  *run(ctx: RuleContext): Iterable<BuildDiagnostic> {
    if (!ctx.markupAst) return;

    const root = ctx.markupAst as ComponentDef;
    const registry = ctx.componentRegistry;
    if (!registry) return []; // no registry available in this context
    // Cache the name list lazily — only built once per `run` call.
    let allNames: readonly string[] | undefined;

    function getNames(): readonly string[] {
      if (!allNames) allNames = registry.getComponentNames();
      return allNames;
    }

    const diagnostics: BuildDiagnostic[] = [];

    walkComponentDef(root, (node) => {
      const typeName = node.type;

      // Skip framework / loader special types.
      if (FRAMEWORK_TYPES.has(typeName) || LOADER_TYPES.has(typeName)) return;

      // Skip HTML lowercase tags (html-* prefixed or plain lowercase).
      if (typeName.startsWith("html-") || /^[a-z]/.test(typeName)) return;

      // Skip namespace-qualified types (e.g., "ns.Button") — resolver handles those.
      if (typeName.includes(".")) return;

      if (registry.hasComponent(typeName)) return;

      const offset = (node.debug?.source as any)?.start ?? 0;
      const { line, col } = offsetToLineCol(ctx.source, offset);
      const suggestion = closestMatch(typeName, getNames());

      diagnostics.push({
        code: "id-unknown-component",
        severity: "error",
        file: ctx.file,
        line,
        column: col,
        length: typeName.length,
        message: `Unknown component "${typeName}".${suggestion ? ` Did you mean "${suggestion}"?` : ""}`,
        data: { typeName },
        suggestions: suggestion
          ? [{ title: `Replace with "${suggestion}"`, replacement: suggestion }]
          : undefined,
      });
    });

    yield* diagnostics;
  },
});
