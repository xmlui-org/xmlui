/**
 * Rule: expr-unbound-identifier
 *
 * An identifier appearing in an expression that resolves to none of:
 *   - a `var` declared on this node or an ancestor,
 *   - a `uid` of a component declared anywhere in the same `<App>` scope,
 *   - a framework-reserved identifier (`$event`, `App`, `Math`, …),
 *   - a local `let` / `const` / `var` / function-parameter declared inside
 *     the same handler body,
 *   - an arrow-function or other lexical binding introduced by the
 *     expression itself.
 *
 * Severity: `error` (same in strict).
 *
 * The rule walks the markup once to gather ancestor-scope `vars` and the
 * global `uid` set, then walks each expression to flag root identifiers
 * (and chain roots) that fail to resolve.
 *
 * False-positive guards:
 *   - `obj.member` — only the **root** identifier (`obj`) is validated.
 *   - Arrow / function params shadow outer scope inside their body.
 *   - Identifiers used as object-literal keys without computed `[ ]` are
 *     not references and are filtered out.
 */

import type { BuildDiagnostic } from "../diagnostics";
import type { RuleContext } from "../rule-registry";
import { registerRule } from "../rule-registry";
import type { ComponentDef } from "../../../abstractions/ComponentDefs";
import { closestMatch, offsetToLineCol } from "./_utils";
import {
  collectDeclaredNames,
  collectIdentifierRefs,
  collectUidMap,
  iterComponentExpressions,
} from "./_ast-utils";
import { isReservedRoot } from "./_reserved-identifiers";

registerRule({
  code: "expr-unbound-identifier",
  description:
    "An identifier in an expression cannot be resolved to any declared variable or scope entry.",
  defaultSeverity: "error",
  strictSeverity: "error",
  appliesTo: "both",

  *run(ctx: RuleContext): Iterable<BuildDiagnostic> {
    if (!ctx.markupAst) return;
    const root = ctx.markupAst as ComponentDef;
    const uidMap = collectUidMap(root);

    const { line, col } = offsetToLineCol(ctx.source, (root.debug?.source as any)?.start ?? 0);
    const diagnostics: BuildDiagnostic[] = [];
    const reported = new Set<string>();

    function visit(node: ComponentDef, varScopeStack: string[][]): void {
      const localVars = node.vars ? Object.keys(node.vars) : [];
      const nextStack = localVars.length > 0 ? [...varScopeStack, localVars] : varScopeStack;
      const inScopeVars = new Set<string>(nextStack.flat());

      for (const ce of iterComponentExpressions(node)) {
        const bodyLocals = ce.statements ? new Set(collectDeclaredNames(ce.statements)) : new Set<string>();
        if (ce.kind === "var") bodyLocals.add(ce.name);

        const refs = ce.expr
          ? collectIdentifierRefs(ce.expr)
          : ce.statements
            ? ce.statements.flatMap((s) => collectIdentifierRefs(s as any))
            : [];

        for (const ref of refs) {
          const name = ref.name;
          if (!name) continue;
          if (isReservedRoot(name)) continue;
          if (inScopeVars.has(name)) continue;
          if (bodyLocals.has(name)) continue;
          if (uidMap.has(name)) continue;

          const key = `${name}@${ce.kind}:${ce.name}`;
          if (reported.has(key)) continue;
          reported.add(key);

          const candidatePool = [
            ...inScopeVars,
            ...uidMap.keys(),
            ...bodyLocals,
          ];
          const suggestion = closestMatch(name, candidatePool);
          diagnostics.push({
            code: "expr-unbound-identifier",
            severity: "error",
            file: ctx.file,
            line,
            column: col,
            length: name.length,
            message: `Unbound identifier "${name}" in ${ce.kind} "${ce.name}" on <${node.type}>.${
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
