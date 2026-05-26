/**
 * Rule: id-unknown-method
 *
 * For every expression of the form `<uid>.<method>(...)` (or `<uid>.<chain>.<method>(...)`),
 * verify that `<method>` is a declared API method on the component identified by `<uid>`.
 *
 * Severity: `warn` (strict: `error`).
 *
 * Scope: only the **last** member of an invoked chain is validated, and only
 * against the API of the component rooted at the chain's root identifier.
 * For chains longer than one hop (`form.fields.submit()`) the rule skips the
 * check because the intermediate object is not a component.
 *
 * When `descriptor.allowArbitraryProps === true` on the rooted component the
 * check is skipped (the component opts out of method validation).
 */

import type { BuildDiagnostic } from "../diagnostics";
import type { RuleContext } from "../rule-registry";
import { registerRule } from "../rule-registry";
import type { ComponentDef } from "../../../abstractions/ComponentDefs";
import {
  closestMatch,
  offsetToLineCol,
  walkComponentDef,
} from "./_utils";
import {
  collectRootedChains,
  collectUidMap,
  iterComponentExpressions,
} from "./_ast-utils";

registerRule({
  code: "id-unknown-method",
  description:
    "An expression calls an API method that is not declared on the referenced component.",
  defaultSeverity: "warn",
  strictSeverity: "error",
  appliesTo: "both",

  *run(ctx: RuleContext): Iterable<BuildDiagnostic> {
    if (!ctx.markupAst) return;
    const registry = ctx.componentRegistry;
    if (!registry) return;

    const root = ctx.markupAst as ComponentDef;
    const uidMap = collectUidMap(root);
    if (uidMap.size === 0) return;

    const severity = ctx.strict ? "error" : "warn";
    const offset = (root.debug?.source as any)?.start ?? 0;
    const { line, col } = offsetToLineCol(ctx.source, offset);
    const diagnostics: BuildDiagnostic[] = [];

    walkComponentDef(root, (node) => {
      for (const ce of iterComponentExpressions(node)) {
        const chains = ce.expr
          ? collectRootedChains(ce.expr)
          : ce.statements
            ? ce.statements.flatMap((s) => collectRootedChains(s as any))
            : [];

        for (const chain of chains) {
          if (!chain.invoked) continue;
          if (chain.memberPath.length !== 1) continue;
          // The chain must root at a known uid.
          const componentType = uidMap.get(chain.rootName);
          if (!componentType) continue;

          const entry = registry.lookupComponentRenderer(componentType);
          const descriptor = entry?.descriptor;
          if (!descriptor) continue;
          if (descriptor.allowArbitraryProps) continue;

          const methodName = chain.memberPath[0];
          const apis = descriptor.apis ? Object.keys(descriptor.apis) : [];
          if (apis.includes(methodName)) continue;

          const suggestion = closestMatch(methodName, apis);
          diagnostics.push({
            code: "id-unknown-method",
            severity,
            file: ctx.file,
            line,
            column: col,
            length: methodName.length,
            message: `Unknown method "${methodName}" on <${componentType}> (referenced via id "${chain.rootName}").${
              suggestion ? ` Did you mean "${suggestion}"?` : ""
            }`,
            data: {
              methodName,
              componentType,
              uid: chain.rootName,
              kind: ce.kind,
              attribute: ce.name,
            },
            suggestions: suggestion
              ? [{ title: `Replace with "${suggestion}"`, replacement: suggestion }]
              : undefined,
          });
        }
      }
    });

    yield* diagnostics;
  },
});
