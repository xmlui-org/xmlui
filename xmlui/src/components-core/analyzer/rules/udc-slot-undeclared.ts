/**
 * Rule: udc-slot-undeclared
 *
 * For every child markup placed inside a User-Defined Component (UDC) via a
 * `slot="…"` attribute, verifies that the parent UDC's declared contract
 * lists a matching `<Slot name="…">`.
 *
 * Only fires when the parent UDC carries an explicit declared contract
 * (i.e. its `<Component>` block declares at least one `<Slot>`).  UDCs with
 * no slot declarations remain in legacy / inferred mode and never trigger
 * this diagnostic, preserving backwards-compatibility.
 *
 * Severity: `warn` (strict: `error`).
 *
 * Plan #14 Step 2.2.
 */

import type { BuildDiagnostic } from "../diagnostics";
import type { RuleContext } from "../rule-registry";
import { registerRule } from "../rule-registry";
import type { ComponentDef } from "../../../abstractions/ComponentDefs";
import type { UdcContract } from "../../udc-sandbox";
import { closestMatch, offsetToLineCol, walkComponentDef } from "./_utils";

registerRule({
  code: "udc-slot-undeclared",
  description:
    "A `slot=\"…\"` attribute names a slot the parent UDC's contract does not declare.",
  defaultSeverity: "warn",
  strictSeverity: "error",
  appliesTo: "markup",

  *run(ctx: RuleContext): Iterable<BuildDiagnostic> {
    if (!ctx.markupAst) return;
    const registry = ctx.componentRegistry;
    if (!registry) return;

    const root = ctx.markupAst as ComponentDef;
    const severity = ctx.strict ? "error" : "warn";
    const diagnostics: BuildDiagnostic[] = [];

    walkComponentDef(root, (node) => {
      if (!node.children || node.children.length === 0) return;

      // Look up the host component; only UDCs with a declared contract are
      // checked.  Built-in components and contract-less UDCs are skipped.
      const entry = registry.lookupComponentRenderer(node.type);
      if (!entry || !entry.isCompoundComponent) return;
      const contract = entry.udcContract as UdcContract | undefined;
      if (!contract) return;
      // A UDC that declares no slots stays in legacy mode — children with
      // a `slot` attribute were never validated and we keep that behaviour.
      if (!contract.slots || contract.slots.size === 0) return;

      const declared = Array.from(contract.slots);

      for (const child of node.children) {
        const slotName = (child.props as any)?.slot;
        if (typeof slotName !== "string" || slotName.length === 0) continue;
        if (contract.slots.has(slotName)) continue;

        const offset = (child.debug?.source as any)?.start ?? 0;
        const { line, col } = offsetToLineCol(ctx.source, offset);
        const suggestion = closestMatch(slotName, declared);

        diagnostics.push({
          code: "udc-slot-undeclared",
          severity,
          file: ctx.file,
          line,
          column: col,
          length: slotName.length,
          message:
            `Slot "${slotName}" is not declared by <${node.type}>. ` +
            `Declared slots: ${declared.length > 0 ? declared.join(", ") : "<none>"}.` +
            (suggestion ? ` Did you mean "${suggestion}"?` : ""),
          data: { slotName, udc: node.type, declaredSlots: declared },
          suggestions: suggestion
            ? [{ title: `Replace with "${suggestion}"`, replacement: suggestion }]
            : undefined,
        });
      }
    });

    yield* diagnostics;
  },
});
