
import { describe, expect, it } from "vitest";

import { Parser } from "@parsers/scripting/Parser";
import { evalBinding } from "@components-core/script-runner/eval-tree-sync";
import { parseParameterString } from "@components-core/script-runner/ParameterParser";
import { Expression } from "@abstractions/scripting/ScriptingSourceTree";
import {createEvalContext} from "./test-helpers";

describe("Evaluate binding expression tree", () => {
  it("Regression #1", () => {
    // --- Act
    const segments = parseParameterString("{{a: 1, b: 'Hello!'}.b}");
    const context = createEvalContext({ localContext: {} });
    const value = evalBinding(segments[0].value as Expression, context);

    // --- Assert
    expect(segments.length).equal(1);
    expect(segments[0].type).equal("expression");
    expect(value).to.equal("Hello!");
  });

  it(`Eval object literal prop`, () => {
    // --- Arrange
    const wParser = new Parser("{a: 1, b: 'Hello!'}.b");

    // --- Act/Assert
    const expr = wParser.parseExpr();
    expect(expr).not.equal(null);
    if (!expr) return;
    const context = createEvalContext({ localContext: {} });
    const value = evalBinding(expr, context);
    expect(value).to.equal("Hello!");
  });

  it("Regression #2", () => {
    // --- Act
    const segments = parseParameterString("{123.toString()}");
    const context = createEvalContext({ localContext: {} });
    const value = evalBinding(segments[0].value as Expression, context);

    // --- Assert
    expect(segments.length).equal(1);
    expect(segments[0].type).equal("expression");
    expect(value).to.equal("123");
  });
});
