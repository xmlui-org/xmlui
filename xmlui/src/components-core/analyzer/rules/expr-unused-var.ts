/**
 * Rule: expr-unused-var
 *
 * A `var` declared on a component or page that is never referenced in any
 * descendant expression (handler body, bound prop, child `var`).
 *
 * Severity: `info` (strict: `warn`).
 *
 * Scope: the rule walks the entire component tree once, collects every
 * identifier reference appearing in any expression, then flags `node.vars`
 * keys whose name never appears in that set.
 *
 * Limitations: identifier references inside dynamic indexers (`obj[name]`)
 * and template-literal interpolations are detected; references that only
 * appear inside string literals are not (XMLUI does not auto-interpolate
 * arbitrary strings).
 */

import type { BuildDiagnostic } from "../diagnostics";
import type { RuleContext } from "../rule-registry";
import { registerRule } from "../rule-registry";
import type { ComponentDef } from "../../../abstractions/ComponentDefs";
import { offsetToLineCol, walkComponentDef } from "./_utils";
import { iterComponentExpressions, walkAstNodes, T_IDENTIFIER } from "./_ast-utils";
import type { Identifier } from "../../script-runner/ScriptingSourceTree";

function getVarLocation(node: ComponentDef, varName: string) {
  return (node.debug as any)?.reactiveNodes?.[`var.${varName}`];
}

function getDeclaringComponentLabel(node: ComponentDef, varName: string): string {
  const varLocation = getVarLocation(node, varName);
  const nodeLocation = (node.debug?.source as any) ?? undefined;
  if (
    varLocation &&
    nodeLocation &&
    typeof varLocation.start === "number" &&
    typeof nodeLocation.start === "number" &&
    varLocation.start < nodeLocation.start
  ) {
    return "Component";
  }
  return node.type;
}

registerRule({
  code: "expr-unused-var",
  description: "A `var` is declared but never referenced in any descendant expression.",
  defaultSeverity: "info",
  strictSeverity: "warn",
  appliesTo: "both",

  *run(ctx: RuleContext): Iterable<BuildDiagnostic> {
    if (!ctx.markupAst) return;
    const root = ctx.markupAst as ComponentDef;
    const severity = ctx.strict ? "warn" : "info";

    // Pass 1: collect every identifier reference appearing in any expression
    // across the whole tree.
    const referenced = new Set<string>();
    walkComponentDef(root, (node) => {
      for (const ce of iterComponentExpressions(node)) {
        const seed = (ce.expr as any) ?? null;
        if (seed)
          walkAstNodes(seed, (n) => {
            if (n.type === T_IDENTIFIER) referenced.add((n as Identifier).name);
          });
        if (ce.statements) {
          for (const s of ce.statements) {
            walkAstNodes(s as any, (n) => {
              if (n.type === T_IDENTIFIER) referenced.add((n as Identifier).name);
            });
          }
        }
      }
    });

    // Pass 2: emit one diagnostic per `node.vars` key never referenced.
    const diagnostics: BuildDiagnostic[] = [];
    walkComponentDef(root, (node) => {
      if (!node.vars || typeof node.vars !== "object") return;
      for (const varName of Object.keys(node.vars)) {
        if (referenced.has(varName)) continue;
        const varLocation = getVarLocation(node, varName);
        const componentType = getDeclaringComponentLabel(node, varName);
        if (componentType === "Component") continue;
        const { line, col } =
          varLocation?.line && varLocation?.col
            ? { line: varLocation.line, col: varLocation.col }
            : offsetToLineCol(
                ctx.source,
                (varLocation as any)?.start ?? (node.debug?.source as any)?.start ?? 0,
              );
        diagnostics.push({
          code: "expr-unused-var",
          severity,
          file: ctx.file,
          line,
          column: col,
          length: varLocation?.length ?? varName.length,
          message: `Var "${varName}" declared on <${componentType}> is never referenced.`,
          data: { varName, componentType },
        });
      }
    });

    yield* diagnostics;
  },
});
