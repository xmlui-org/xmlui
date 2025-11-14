import { describe, expect, it } from "vitest";

import { evalBindingExpression } from "../../../src/components-core/script-runner/eval-tree-sync";
import { createEvalContext } from "./test-helpers";
import { Parser } from "../../../src/parsers/scripting/Parser";
import { evalBindingAsync } from "../../../src/components-core/script-runner/eval-tree-async";

describe("Evaluate arrow expressions (exp)", () => {
  it("concat #1", () => {
    // --- Arrange
    const source = "[].concat([])";
    const context = createEvalContext({});

    // --- Act
    const value = evalBindingExpression(source, context);

    // --- Arrange
    expect(value).toStrictEqual([]);
  });

  it("concat (async) #1", async () => {
    // --- Arrange
    const source = "[].concat([])";
    const context = createEvalContext({});

    // --- Act
    const wParser = new Parser(source);
    const expr = wParser.parseExpr();
    expect(expr).not.equal(null);
    if (!expr) return;
    const value = await evalBindingAsync(expr, context, context.mainThread);

    // --- Arrange
    expect(value).toStrictEqual([]);
  });

  it("|| with strings", () => {
    // --- Arrange
    const source = "('la' || '').toLowerCase()";
    const context = createEvalContext({});

    // --- Act
    const value = evalBindingExpression(source, context);

    // --- Arrange
    expect(value).toStrictEqual("la");
  });

    it("|| with strings (async)", async () => {
    // --- Arrange
    const source = "('la' || '').toLowerCase()";
    const context = createEvalContext({});

    // --- Act
    const wParser = new Parser(source);
    const expr = wParser.parseExpr();
    expect(expr).not.equal(null);
    if (!expr) return;
    const value = await evalBindingAsync(expr, context, context.mainThread);

    // --- Arrange
    expect(value).toStrictEqual("la");
  });
});
