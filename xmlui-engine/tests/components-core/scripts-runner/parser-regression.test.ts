import { describe, expect, it } from "vitest";
import { Parser } from "@parsers/scripting/Parser";
import { evalBinding } from "@components-core/script-runner/eval-tree-sync";
import { createEvalContext } from "@components-core/script-runner/BindingTreeEvaluationContext";

describe("Parser - regression", () => {
  it("Function call: 'true.toString()'", () => {
    // --- Arrange
    const wParser = new Parser("true.toString()");
    const expr = wParser.parseExpr();
    expect(expr).not.equal(null);
    if (!expr) return;

    // --- Act
    const context = createEvalContext({ localContext: {} });
    const value = evalBinding(expr, context);

    // --- Assert
    expect(value).equal("true");
  });
});
