import { describe, expect, it } from "vitest";

import { Parser } from "../../../src/parsers/scripting/Parser";
import type {
  BinaryExpression,
  AssignmentExpression} from "../../../src/components-core/script-runner/ScriptingSourceTree";
import {
  T_ASSIGNMENT_EXPRESSION,
  T_IDENTIFIER,
  T_BINARY_EXPRESSION,
  T_LITERAL,
} from "../../../src/components-core/script-runner/ScriptingSourceTree";

describe("Parser - assignment expressions", () => {
  it("Assignment with binary expression", () => {
    // --- Arrange
    const wParser = new Parser("a = 2 + c");

    // --- Act
    const expr = wParser.parseExpr();

    // --- Assert
    expect(expr).not.equal(null);
    if (!expr) return;
    expect(expr.type).equal(T_ASSIGNMENT_EXPRESSION);
    const asgn = expr as AssignmentExpression;
    expect(asgn.leftValue.type).equal(T_IDENTIFIER);
    expect(asgn.expr.type).equal(T_BINARY_EXPRESSION);
    const bExpr = asgn.expr as BinaryExpression;
    expect(bExpr.left.type).equal(T_LITERAL);
    expect(bExpr.right.type).equal(T_IDENTIFIER);
  });
});
