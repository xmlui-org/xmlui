/**
 * Rule: id-undefined-component-ref
 *
 * An expression references a component by `<uid>` (e.g., `myButton.flash()`
 * or `myForm.dirty`) but no component with that `uid` is declared anywhere
 * in the current file's `<App>` scope.
 *
 * Severity: `error` (same in strict).
 *
 * Scope: the rule fires only on chains of the form `<root>.member[...]` where
 * `<root>` is **not** a reserved framework identifier and **not** a locally
 * declared variable. Bare identifiers (no `.member`) are handled by
 * `expr-unbound-identifier`.
 */

import type { BuildDiagnostic } from "../diagnostics";
import type { RuleContext } from "../rule-registry";
import { registerRule } from "../rule-registry";
import type { ComponentDef } from "../../../abstractions/ComponentDefs";
import { closestMatch, offsetToLineCol } from "./_utils";
import {
  collectDeclaredNames,
  collectRootedChains,
  collectUidMap,
  iterComponentExpressions,
} from "./_ast-utils";
import { isReservedRoot } from "./_reserved-identifiers";

registerRule({
  code: "id-undefined-component-ref",
  description:
    "An expression references a component id that is not declared anywhere in the current scope.",
  defaultSeverity: "error",
  strictSeverity: "error",
  appliesTo: "both",

  *run(ctx: RuleContext): Iterable<BuildDiagnostic> {
    if (!ctx.markupAst) return;
    const root = ctx.markupAst as ComponentDef;
    const uidMap = collectUidMap(root);

    const allKnownIds: string[] = [...uidMap.keys()];

    const { line, col } = offsetToLineCol(ctx.source, (root.debug?.source as any)?.start ?? 0);
    const diagnostics: BuildDiagnostic[] = [];
    const reported = new Set<string>();

    function visit(node: ComponentDef, varScopeStack: string[][]): void {
      const localVars = node.vars ? Object.keys(node.vars) : [];
      const nextStack = localVars.length > 0 ? [...varScopeStack, localVars] : varScopeStack;
      const inScopeVars = new Set<string>(nextStack.flat());

      for (const ce of iterComponentExpressions(node)) {
        const bodyLocals = ce.statements ? collectDeclaredNames(ce.statements) : [];

        const chains = ce.expr
          ? collectRootedChains(ce.expr)
          : ce.statements
            ? ce.statements.flatMap((s) => collectRootedChains(s as any))
            : [];

        for (const chain of chains) {
          if (chain.memberPath.length === 0) continue;
          const name = chain.rootName;
          if (isReservedRoot(name)) continue;
          if (inScopeVars.has(name)) continue;
          if (bodyLocals.includes(name)) continue;
          if (uidMap.has(name)) continue;

          const key = `${name}@${ce.kind}:${ce.name}`;
          if (reported.has(key)) continue;
          reported.add(key);

          const suggestion = closestMatch(name, allKnownIds);
          diagnostics.push({
            code: "id-undefined-component-ref",
            severity: "error",
            file: ctx.file,
            line,
            column: col,
            length: name.length,
            message: `Identifier "${name}" used as a component reference, but no component with that id is declared.${
              suggestion ? ` Did you mean "${suggestion}"?` : ""
            }`,
            data: { name, kind: ce.kind, attribute: ce.name },
            suggestions: suggestion
              ? [{ title: `Replace with "${suggestion}"`, replacement: suggestion }]
              : undefined,
          });
        }
      }

      if (node.children) for (const c of node.children) visit(c as ComponentDef, nextStack);
      if (node.slots) {
        for (const slotChildren of Object.values(node.slots)) {
          for (const c of slotChildren) visit(c as ComponentDef, nextStack);
        }
      }
      if (node.loaders) for (const l of node.loaders) visit(l as ComponentDef, nextStack);
    }

    visit(root, []);

    yield* diagnostics;
  },
});
