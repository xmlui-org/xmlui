/**
 * Rule: id-undefined-form-ref
 *
 * A `<FormItem bindTo="x">` is declared inside a `<Form>` whose `data` shape
 * does not declare the field `x`, or is declared outside any `<Form>`
 * entirely.
 *
 * Severity: `warn` (strict: `error`).
 *
 * Scope:
 *   - When `<Form data="{...}">` carries a binding whose root expression is
 *     an `ObjectLiteral`, the rule infers the field names from the literal.
 *   - When `data` is dynamic (a function call, identifier reference, …) the
 *     shape is unknown and the rule skips validation for that form.
 *   - A `<FormItem>` outside any `<Form>` reports the diagnostic with a
 *     dedicated message.
 *   - Nested Forms scope independently — the closest enclosing `<Form>` wins.
 */

import type { BuildDiagnostic } from "../diagnostics";
import type { RuleContext } from "../rule-registry";
import { registerRule } from "../rule-registry";
import type { ComponentDef } from "../../../abstractions/ComponentDefs";
import { closestMatch, offsetToLineCol } from "./_utils";
import { parseExpression, unwrapBinding } from "./_ast-utils";
import type { Expression, Literal, ObjectLiteral } from "../../script-runner/ScriptingSourceTree";
import { T_LITERAL, T_OBJECT_LITERAL } from "../../../parsers/scripting/ScriptingNodeTypes";

/** Extract the static key names from an ObjectLiteral, or `undefined` if dynamic. */
function objectLiteralKeys(expr: Expression | undefined): string[] | undefined {
  if (!expr || expr.type !== T_OBJECT_LITERAL) return undefined;
  const keys: string[] = [];
  for (const prop of (expr as ObjectLiteral).props) {
    if (Array.isArray(prop)) {
      const [keyExpr] = prop;
      if (keyExpr && (keyExpr as Literal).type === T_LITERAL) {
        const v = (keyExpr as Literal).value;
        if (typeof v === "string") keys.push(v);
        else if (typeof v === "number") keys.push(String(v));
        else return undefined;
      } else if (keyExpr && (keyExpr as any).type === 107 /* T_IDENTIFIER */) {
        keys.push((keyExpr as any).name);
      } else {
        return undefined;
      }
    } else {
      // Spread expression → shape is dynamic.
      return undefined;
    }
  }
  return keys;
}

interface FormScope {
  /** Known top-level keys; `undefined` when the data shape is dynamic. */
  keys: string[] | undefined;
}

registerRule({
  code: "id-undefined-form-ref",
  description:
    "A FormItem `bindTo` value references a field not declared by the parent Form.",
  defaultSeverity: "warn",
  strictSeverity: "error",
  appliesTo: "markup",

  *run(ctx: RuleContext): Iterable<BuildDiagnostic> {
    if (!ctx.markupAst) return;
    const root = ctx.markupAst as ComponentDef;
    const severity = ctx.strict ? "error" : "warn";
    const { line, col } = offsetToLineCol(ctx.source, (root.debug?.source as any)?.start ?? 0);
    const diagnostics: BuildDiagnostic[] = [];

    function visit(node: ComponentDef, formStack: FormScope[]): void {
      let pushed = false;
      if (node.type === "Form") {
        const dataValue = node.props?.data;
        const inner = unwrapBinding(dataValue) ?? (typeof dataValue === "string" ? dataValue : undefined);
        const expr = inner ? parseExpression(inner) : undefined;
        const keys = objectLiteralKeys(expr);
        formStack = [...formStack, { keys }];
        pushed = true;
      }

      if (node.type === "FormItem") {
        const bindTo = node.props?.bindTo;
        if (typeof bindTo === "string" && bindTo.trim()) {
          // The bindTo value can either be a bare identifier ("phone") or a
          // dotted path ("address.street"). For the rule we only validate
          // the root segment against the form's top-level keys.
          const fieldRoot = bindTo.trim().split(".")[0];
          const enclosing = formStack[formStack.length - 1];
          if (!enclosing) {
            diagnostics.push({
              code: "id-undefined-form-ref",
              severity,
              file: ctx.file,
              line,
              column: col,
              length: bindTo.length,
              message: `FormItem with bindTo="${bindTo}" is not inside a <Form>.`,
              data: { bindTo },
            });
          } else if (enclosing.keys && !enclosing.keys.includes(fieldRoot)) {
            const suggestion = closestMatch(fieldRoot, enclosing.keys);
            diagnostics.push({
              code: "id-undefined-form-ref",
              severity,
              file: ctx.file,
              line,
              column: col,
              length: bindTo.length,
              message: `FormItem bindTo="${bindTo}" references field "${fieldRoot}" not declared by the enclosing Form's data.${
                suggestion ? ` Did you mean "${suggestion}"?` : ""
              }`,
              data: { bindTo, knownKeys: enclosing.keys },
              suggestions: suggestion
                ? [{ title: `Replace with "${suggestion}"`, replacement: suggestion }]
                : undefined,
            });
          }
        }
      }

      if (node.children) for (const c of node.children) visit(c as ComponentDef, formStack);
      if (node.slots) {
        for (const slotChildren of Object.values(node.slots)) {
          for (const c of slotChildren) visit(c as ComponentDef, formStack);
        }
      }
      if (node.loaders) for (const l of node.loaders) visit(l as ComponentDef, formStack);

      if (pushed) formStack.pop();
    }

    visit(root, []);

    yield* diagnostics;
  },
});
