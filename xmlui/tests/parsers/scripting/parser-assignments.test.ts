import { describe, expect, it } from "vitest";

import { Parser } from "../../../src/parsers/scripting/Parser";
import {
  BinaryExpression,
  AssignmentExpression,
} from "../../../src/abstractions/scripting/ScriptingSourceTree";

describe("Parser - assignment expressions", () => {
  it("Assignment with binary expression", () => {
    // --- Arrange
    const wParser = new Parser("a = 2 + c");

    // --- Act
    const expr = wParser.parseExpr();

    // --- Assert
    expect(expr).not.equal(null);
    if (!expr) return;
    expect(expr.type).equal("AsgnE");
    const asgn = expr as AssignmentExpression;
    expect(asgn.leftValue.type).equal("IdE");
    expect(asgn.operand.type).equal("BinaryE");
    const bExpr = asgn.operand as BinaryExpression;
    expect(bExpr.left.type).equal("LitE");
    expect(bExpr.right.type).equal("IdE");
  });
});
