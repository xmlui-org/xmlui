/**
 * Rule: id-unknown-prop
 *
 * For every known component (i.e., one found in the registry with a
 * `descriptor` that declares its props), checks that each prop key used in
 * markup is either:
 *
 *   - declared in `descriptor.props`, or
 *   - a framework-level prop (uid, testId, when, …), or
 *   - a behavior-contributed prop (label, tooltip, bindTo, …), or
 *   - a `data-*` custom attribute.
 *
 * Severity: `warn` (strict: `error`).
 * When `descriptor.allowArbitraryProps === true` the check is skipped.
 */

import type { BuildDiagnostic } from "../diagnostics";
import type { RuleContext } from "../rule-registry";
import { registerRule } from "../rule-registry";
import type { ComponentDef } from "../../../abstractions/ComponentDefs";
import { closestMatch, isAllowedGlobalProp, offsetToLineCol, walkComponentDef } from "./_utils";

registerRule({
  code: "id-unknown-prop",
  description: "The attribute is not a declared prop of this component.",
  defaultSeverity: "warn",
  strictSeverity: "error",
  appliesTo: "markup",

  *run(ctx: RuleContext): Iterable<BuildDiagnostic> {
    if (!ctx.markupAst) return;

    const root = ctx.markupAst as ComponentDef;
    const registry = ctx.componentRegistry;
    const severity = ctx.strict ? "error" : "warn";
    const diagnostics: BuildDiagnostic[] = [];

    walkComponentDef(root, (node) => {
      if (!node.props || typeof node.props !== "object") return;

      const entry = registry.lookupComponentRenderer(node.type);
      if (!entry) return; // unknown component — reported by id-unknown-component

      const descriptor = entry.descriptor;
      if (!descriptor) return; // no metadata → cannot validate
      if (descriptor.allowArbitraryProps) return; // component accepts any prop

      const knownProps = descriptor.props ? Object.keys(descriptor.props) : [];

      for (const propName of Object.keys(node.props)) {
        // Framework / behavior / data-* props are always allowed.
        if (isAllowedGlobalProp(propName)) continue;
        // Props starting with "on" are event handlers — checked by id-unknown-event.
        if (propName.startsWith("on") && propName.length > 2 && /^[A-Z]/.test(propName[2])) {
          continue;
        }

        if (knownProps.includes(propName)) continue;

        const offset = (node.debug?.source as any)?.start ?? 0;
        const { line, col } = offsetToLineCol(ctx.source, offset);
        const suggestion = closestMatch(propName, knownProps);

        diagnostics.push({
          code: "id-unknown-prop",
          severity,
          file: ctx.file,
          line,
          column: col,
          length: propName.length,
          message: `Unknown prop "${propName}" on <${node.type}>.${suggestion ? ` Did you mean "${suggestion}"?` : ""}`,
          data: { propName, componentType: node.type },
          suggestions: suggestion
            ? [{ title: `Replace with "${suggestion}"`, replacement: suggestion }]
            : undefined,
        });
      }
    });

    yield* diagnostics;
  },
});
