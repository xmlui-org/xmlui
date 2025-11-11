import { describe, expect, it } from "vitest";
import { Parser } from "../../../src/parsers/scripting/Parser";
import type { Identifier, Literal } from "../../../src/components-core/script-runner/ScriptingSourceTree";
import {
  simplifyExpression,
  simplifyStatement,
} from "../../../src/components-core/script-runner/simplify-expression";

describe("Parser - simplify expression", () => {
  const exprNoUpdateCases = [
    "-x",
    "x+a",
    "x, y",
    "x ? y : z",
    "x(123)",
    "x.a",
    "x[123]",
    "x",
    "123",
    "[1, 2, x]",
    "{a: 1, b: 2}",
    "...x",
    "x = a + b",
    "x => x + 1",
    "++x",
    "x++",
  ];

  exprNoUpdateCases.forEach((c) => {
    it(`No change: ${c}`, () => {
      // --- Arrange
      const wParser = new Parser(c);
      const expr = wParser.parseExpr()!;

      // --- Act
      const simple = simplifyExpression(expr);

      // --- Assert
      expect(simple).equal(expr);
    });
  });

  const stmtNoUpdateCases = [
    ";",
    "a + b",
    "a => a + 1",
    "let a = 1",
    "const a = 1",
    "var x = 1, y = 2",
    "{ x++; }",
    "if (x) { x++; } else { x--; }",
    "return 123",
    "while (x) { x++; }",
    "do { x++; } while (x)",
    "break",
    "continue",
    "throw x",
    "try { x++; } catch (e) { x--; } finally { x++; }",
    "for (let i = 0; i < 10; i++) { x++; }",
    "for (let i in x) { x++; }",
    "for (let i of x) { x++; }",
    "switch (x) { case 1: x++; break; default: x--; }",
    "function f() { x++; }",
  ];

  stmtNoUpdateCases.forEach((c) => {
    it(`No change: ${c}`, () => {
      // --- Arrange
      const wParser = new Parser(c);
      const stmt = wParser.parseStatements()![0];

      // --- Act
      const simple = simplifyStatement(stmt);

      // --- Assert
      expect(simple).equal(stmt);
    });
  });

  it("-{const value} works", () => {
    // --- Arrange
    const wParser = new Parser("-123.5");
    const expr = wParser.parseExpr()!;

    // --- Act
    const simple = simplifyExpression(expr);

    // --- Assert
    const literal = simple as Literal;
    expect(literal.value).equal(-123.5);
  });

  it("!{const value} works", () => {
    // --- Arrange
    const wParser = new Parser("!123.5");
    const expr = wParser.parseExpr()!;

    // --- Act
    const simple = simplifyExpression(expr);

    // --- Assert
    const literal = simple as Literal;
    expect(literal.value).equal(false);
  });

  it("typeof {const value} works", () => {
    // --- Arrange
    const wParser = new Parser("typeof true");
    const expr = wParser.parseExpr()!;

    // --- Act
    const simple = simplifyExpression(expr);

    // --- Assert
    const literal = simple as Literal;
    expect(literal.value).equal("boolean");
  });

  const unarySimpleCases = [
    "-123.5",
    "-123 + a",
    "-123, x",
    "x, -123",
    "-123 ? y : z",
    "x ? -123 : z",
    "x ? y : -123",
    "x(-123)",
    "(-123).a",
    "x[-123]",
    "[1, 2, -123]",
    "{a: -123}",
    "{[-123]: x}",
    "...(-123)",
    "x = -123 + b",
    "x => -123 + 1",
    "++(-123)",
    "(-123)++",
  ];

  unarySimpleCases.forEach((c) => {
    it(`Unary simplified: ${c}`, () => {
      // --- Arrange
      const wParser = new Parser(c);
      const expr = wParser.parseExpr()!;

      // --- Act
      const simple = simplifyExpression(expr);

      // --- Assert
      expect(simple).not.equal(expr);
    });
  });

  const unaryStatementCases = [
    "-123.5;",
    "a => a + -123",
    "let a = -123",
    "const a = -123",
    "var x = -123",
    "{ (-123)++; }",
    "if (-123) { x++; } else { x--; }",
    "if (x) { -123; } else { x--; }",
    "if (x) { x++; } else { -123; }",
    "return -123",
    "while (-123) { x++; }",
    "while (x) { -123; }",
    "do { -123; } while (x)",
    "do { x++; } while (-123)",
    "throw -123",
    "try { -123; } catch (e) { x--; } finally { x++; }",
    "try { x++; } catch (e) { -123; } finally { x++; }",
    "try { x++; } catch (e) { x--; } finally { -123; }",
    "for (let i = -123; i < 10; i++) { x++; }",
    "for (let i = 0; i < -123; i++) { x++; }",
    "for (let i = 0; i < 10; -123) { x++; }",
    "for (let i = 0; i < 10; i++) { -123; }",
    "for (let i in -123) { x++; }",
    "for (let i in x) { -123; }",
    "for (let i of -123) { x++; }",
    "for (let i of x) { -123; }",
    "switch (-123) { case 1: x++; break; default: x--; }",
    "switch (x) { case -123: x++; break; default: x--; }",
    "switch (x) { case 1: -123; break; default: x--; }",
    "switch (x) { case 1: x++; break; default: -123; }",
    "function f() { -123; }",
  ];

  unaryStatementCases.forEach((c) => {
    it(`Unary simplified: ${c}`, () => {
      // --- Arrange
      const wParser = new Parser(c);
      const stmt = wParser.parseStatements()![0];

      // --- Act
      const simple = simplifyStatement(stmt);

      // --- Assert
      expect(simple).not.equal(stmt);
    });
  });

  it("{const}**{const} works", () => {
    // --- Arrange
    const wParser = new Parser("2**2");
    const expr = wParser.parseExpr()!;

    // --- Act
    const simple = simplifyExpression(expr);

    // --- Assert
    const literal = simple as Literal;
    expect(literal.value).equal(4);
  });

  it("{const}*{const} works", () => {
    // --- Arrange
    const wParser = new Parser("2*2");
    const expr = wParser.parseExpr()!;

    // --- Act
    const simple = simplifyExpression(expr);

    // --- Assert
    const literal = simple as Literal;
    expect(literal.value).equal(4);
  });

  it("{const}/{const} works", () => {
    // --- Arrange
    const wParser = new Parser("2/4");
    const expr = wParser.parseExpr()!;

    // --- Act
    const simple = simplifyExpression(expr);

    // --- Assert
    const literal = simple as Literal;
    expect(literal.value).equal(0.5);
  });

  it("{const}%{const} works", () => {
    // --- Arrange
    const wParser = new Parser("5%2");
    const expr = wParser.parseExpr()!;

    // --- Act
    const simple = simplifyExpression(expr);

    // --- Assert
    const literal = simple as Literal;
    expect(literal.value).equal(1);
  });

  it("{const}+{const} works", () => {
    // --- Arrange
    const wParser = new Parser("1+2");
    const expr = wParser.parseExpr()!;

    // --- Act
    const simple = simplifyExpression(expr);

    // --- Assert
    const literal = simple as Literal;
    expect(literal.value).equal(3);
  });

  it("{const}-{const} works", () => {
    // --- Arrange
    const wParser = new Parser("1-2");
    const expr = wParser.parseExpr()!;

    // --- Act
    const simple = simplifyExpression(expr);

    // --- Assert
    const literal = simple as Literal;
    expect(literal.value).equal(-1);
  });

  it("{const}<<{const} works", () => {
    // --- Arrange
    const wParser = new Parser("2 << 1");
    const expr = wParser.parseExpr()!;

    // --- Act
    const simple = simplifyExpression(expr);

    // --- Assert
    const literal = simple as Literal;
    expect(literal.value).equal(4);
  });

  it("{const}>>{const} works", () => {
    // --- Arrange
    const wParser = new Parser("15 >> 2");
    const expr = wParser.parseExpr()!;

    // --- Act
    const simple = simplifyExpression(expr);

    // --- Assert
    const literal = simple as Literal;
    expect(literal.value).equal(3);
  });

  it("{const}>>>{const} works", () => {
    // --- Arrange
    const wParser = new Parser("3 >>> 1");
    const expr = wParser.parseExpr()!;

    // --- Act
    const simple = simplifyExpression(expr);

    // --- Assert
    const literal = simple as Literal;
    expect(literal.value).equal(1);
  });

  it("{const}<{const} works", () => {
    // --- Arrange
    const wParser = new Parser("1 < 2");
    const expr = wParser.parseExpr()!;

    // --- Act
    const simple = simplifyExpression(expr);

    // --- Assert
    const literal = simple as Literal;
    expect(literal.value).equal(true);
  });

  it("{const}<={const} works", () => {
    // --- Arrange
    const wParser = new Parser("1 <= 2");
    const expr = wParser.parseExpr()!;

    // --- Act
    const simple = simplifyExpression(expr);

    // --- Assert
    const literal = simple as Literal;
    expect(literal.value).equal(true);
  });

  it("{const}>{const} works", () => {
    // --- Arrange
    const wParser = new Parser("1 > 2");
    const expr = wParser.parseExpr()!;

    // --- Act
    const simple = simplifyExpression(expr);

    // --- Assert
    const literal = simple as Literal;
    expect(literal.value).equal(false);
  });

  it("{const}>={const} works", () => {
    // --- Arrange
    const wParser = new Parser("1 >= 2");
    const expr = wParser.parseExpr()!;

    // --- Act
    const simple = simplifyExpression(expr);

    // --- Assert
    const literal = simple as Literal;
    expect(literal.value).equal(false);
  });

  it("{const}=={const} works", () => {
    // --- Arrange
    const wParser = new Parser("1 == '1'");
    const expr = wParser.parseExpr()!;

    // --- Act
    const simple = simplifyExpression(expr);

    // --- Assert
    const literal = simple as Literal;
    expect(literal.value).equal(true);
  });

  it("{const}==={const} works", () => {
    // --- Arrange
    const wParser = new Parser("1 === '1'");
    const expr = wParser.parseExpr()!;

    // --- Act
    const simple = simplifyExpression(expr);

    // --- Assert
    const literal = simple as Literal;
    expect(literal.value).equal(false);
  });

  it("{const}!={const} works", () => {
    // --- Arrange
    const wParser = new Parser("1 != '1'");
    const expr = wParser.parseExpr()!;

    // --- Act
    const simple = simplifyExpression(expr);

    // --- Assert
    const literal = simple as Literal;
    expect(literal.value).equal(false);
  });

  it("{const}!=={const} works", () => {
    // --- Arrange
    const wParser = new Parser("1 !== '1'");
    const expr = wParser.parseExpr()!;

    // --- Act
    const simple = simplifyExpression(expr);

    // --- Assert
    const literal = simple as Literal;
    expect(literal.value).equal(true);
  });

  it("{const}&{const} works", () => {
    // --- Arrange
    const wParser = new Parser("1 & 3");
    const expr = wParser.parseExpr()!;

    // --- Act
    const simple = simplifyExpression(expr);

    // --- Assert
    const literal = simple as Literal;
    expect(literal.value).equal(1);
  });

  it("{const}|{const} works", () => {
    // --- Arrange
    const wParser = new Parser("1 | 3");
    const expr = wParser.parseExpr()!;

    // --- Act
    const simple = simplifyExpression(expr);

    // --- Assert
    const literal = simple as Literal;
    expect(literal.value).equal(3);
  });

  it("{const}^{const} works", () => {
    // --- Arrange
    const wParser = new Parser("1 ^ 3");
    const expr = wParser.parseExpr()!;

    // --- Act
    const simple = simplifyExpression(expr);

    // --- Assert
    const literal = simple as Literal;
    expect(literal.value).equal(2);
  });

  it("{const}&&{const} works", () => {
    // --- Arrange
    const wParser = new Parser("1 && 3");
    const expr = wParser.parseExpr()!;

    // --- Act
    const simple = simplifyExpression(expr);

    // --- Assert
    const literal = simple as Literal;
    expect(literal.value).equal(3);
  });

  it("{const}||{const} works", () => {
    // --- Arrange
    const wParser = new Parser("1 || 3");
    const expr = wParser.parseExpr()!;

    // --- Act
    const simple = simplifyExpression(expr);

    // --- Assert
    const literal = simple as Literal;
    expect(literal.value).equal(1);
  });

  it("{expr} + 0 works", () => {
    // --- Arrange
    const wParser = new Parser("x + 0");
    const expr = wParser.parseExpr()!;

    // --- Act
    const simple = simplifyExpression(expr);

    // --- Assert
    const id = simple as Identifier;
    expect(id.name).equal("x");
  });

  it("0 + {expr} works", () => {
    // --- Arrange
    const wParser = new Parser("0 + x");
    const expr = wParser.parseExpr()!;

    // --- Act
    const simple = simplifyExpression(expr);

    // --- Assert
    const id = simple as Identifier;
    expect(id.name).equal("x");
  });

  it("{expr} - 0 works", () => {
    // --- Arrange
    const wParser = new Parser("x - 0");
    const expr = wParser.parseExpr()!;

    // --- Act
    const simple = simplifyExpression(expr);

    // --- Assert
    const id = simple as Identifier;
    expect(id.name).equal("x");
  });

  it("{expr} * 1 works", () => {
    // --- Arrange
    const wParser = new Parser("x * 1");
    const expr = wParser.parseExpr()!;

    // --- Act
    const simple = simplifyExpression(expr);

    // --- Assert
    const id = simple as Identifier;
    expect(id.name).equal("x");
  });

  it("1 * {expr} works", () => {
    // --- Arrange
    const wParser = new Parser("1 * x");
    const expr = wParser.parseExpr()!;

    // --- Act
    const simple = simplifyExpression(expr);

    // --- Assert
    const id = simple as Identifier;
    expect(id.name).equal("x");
  });

  it("0 * {expr} works", () => {
    // --- Arrange
    const wParser = new Parser("0 * x");
    const expr = wParser.parseExpr()!;

    // --- Act
    const simple = simplifyExpression(expr);

    // --- Assert
    const literal = simple as Literal;
    expect(literal.value).equal(0);
  });

  it("{expr} * 0 works", () => {
    // --- Arrange
    const wParser = new Parser("x * 0");
    const expr = wParser.parseExpr()!;

    // --- Act
    const simple = simplifyExpression(expr);

    // --- Assert
    const literal = simple as Literal;
    expect(literal.value).equal(0);
  });

  it("{expr} / 1 works", () => {
    // --- Arrange
    const wParser = new Parser("x / 1");
    const expr = wParser.parseExpr()!;

    // --- Act
    const simple = simplifyExpression(expr);

    // --- Assert
    const id = simple as Identifier;
    expect(id.name).equal("x");
  });

  const binarySimpleCases = [
    { src: "1+2+3", result: 6 },
    { src: "4*(2+3)", result: 20 },
    { src: "123 % 2 + 4 * 6", result: 25 },
  ];
  binarySimpleCases.forEach((c) => {
    it(`Binary simplified: ${c.src}`, () => {
      // --- Arrange
      const wParser = new Parser(c.src);
      const expr = wParser.parseExpr()!;

      // --- Act
      const simple = simplifyExpression(expr);

      // --- Assert
      const literal = simple as Literal;
      expect(literal.value).equal(c.result);
    });
  });

  const binaryStatementCases = [
    "1+2;",
    "a => a + (1+2)",
    "let a = 1+2",
    "const a = 1+2",
    "var x = 1+2",
    "{ (1+2)++; }",
    "if (1+2) { x++; } else { x--; }",
    "if (x) { 1+2; } else { x--; }",
    "if (x) { x++; } else { 1+2; }",
    "return 1+2",
    "while (1+2) { x++; }",
    "while (x) { 1+2; }",
    "do { 1+2; } while (x)",
    "do { x++; } while (1+2)",
    "throw 1+2",
    "try { 1+2; } catch (e) { x--; } finally { x++; }",
    "try { x++; } catch (e) { 1+2; } finally { x++; }",
    "try { x++; } catch (e) { x--; } finally { 1+2; }",
    "for (let i = 1+2; i < 10; i++) { x++; }",
    "for (let i = 0; i < 1+2; i++) { x++; }",
    "for (let i = 0; i < 10; 1+2) { x++; }",
    "for (let i = 0; i < 10; i++) { 1+2; }",
    "for (let i in 1+2) { x++; }",
    "for (let i in x) { 1+2; }",
    "for (let i of 1+2) { x++; }",
    "for (let i of x) { 1+2; }",
    "switch (1+2) { case 1: x++; break; default: x--; }",
    "switch (x) { case 1+2: x++; break; default: x--; }",
    "switch (x) { case 1: 1+2; break; default: x--; }",
    "switch (x) { case 1: x++; break; default: 1+2; }",
    "function f() { 1+2; }",
  ];

  binaryStatementCases.forEach((c) => {
    it(`Binary simplified: ${c}`, () => {
      // --- Arrange
      const wParser = new Parser(c);
      const stmt = wParser.parseStatements()![0];

      // --- Act
      const simple = simplifyStatement(stmt);

      // --- Assert
      expect(simple).not.equal(stmt);
    });
  });
});
