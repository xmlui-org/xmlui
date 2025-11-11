import { assert, describe, expect, it } from "vitest";

import { Parser } from "../../../src/parsers/scripting/Parser";
import type {
  BlockStatement,
  ConstStatement,
  DoWhileStatement,
  ExpressionStatement,
  ForInStatement,
  ForOfStatement,
  ForStatement,
  IfStatement,
  LetStatement,
  ReturnStatement,
  SwitchStatement,
  ThrowStatement,
  TryStatement,
  VarStatement,
  WhileStatement} from "../../../src/components-core/script-runner/ScriptingSourceTree";
import {
  T_ARRAY_LITERAL,
  T_BINARY_EXPRESSION,
  T_BLOCK_STATEMENT,
  T_BREAK_STATEMENT,
  T_CONST_STATEMENT,
  T_CONTINUE_STATEMENT,
  T_DO_WHILE_STATEMENT,
  T_EMPTY_STATEMENT,
  T_EXPRESSION_STATEMENT,
  T_FOR_IN_STATEMENT,
  T_FOR_OF_STATEMENT,
  T_FOR_STATEMENT,
  T_IDENTIFIER,
  T_IF_STATEMENT,
  T_LET_STATEMENT,
  T_LITERAL,
  T_POSTFIX_OP_EXPRESSION,
  T_RETURN_STATEMENT,
  T_SPREAD_EXPRESSION,
  T_SWITCH_STATEMENT,
  T_THROW_STATEMENT,
  T_TRY_STATEMENT,
  T_UNARY_EXPRESSION,
  T_VAR_STATEMENT,
  T_WHILE_STATEMENT
} from "../../../src/components-core/script-runner/ScriptingSourceTree";

describe("Parser - statements", () => {
  it("Empty source", () => {
    // --- Arrange
    const wParser = new Parser("");

    // --- Act
    const stmts = wParser.parseStatements();

    // --- Assert
    expect(stmts?.length).equal(0);
  });

  it("Empty statement", () => {
    // --- Arrange
    const wParser = new Parser(";");

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert
    expect(stmts.length).equal(1);
    expect(stmts[0].type).equal(T_EMPTY_STATEMENT);
  });

  it("Multiple empty statement", () => {
    // --- Arrange
    const wParser = new Parser(";;");

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert
    expect(stmts.length).equal(2);
    expect(stmts[0].type).equal(T_EMPTY_STATEMENT);
    expect(stmts[1].type).equal(T_EMPTY_STATEMENT);
  });

  const exprStmts = [
    { expr: "(a + b)", top: T_BINARY_EXPRESSION },
    { expr: "myId", top: T_IDENTIFIER },
    { expr: "+myId", top: T_UNARY_EXPRESSION },
    { expr: "-myId", top: T_UNARY_EXPRESSION },
    { expr: "~myId", top: T_UNARY_EXPRESSION },
    { expr: "[1, 2, 3]", top: T_ARRAY_LITERAL },
    { expr: "!myId", top: T_UNARY_EXPRESSION },
    { expr: "...[1, 2, 3]", top: T_SPREAD_EXPRESSION },
    { expr: "123", top: T_LITERAL },
    { expr: "0x123", top: T_LITERAL },
    { expr: "0b00_11", top: T_LITERAL },
    { expr: "true", top: T_LITERAL },
    { expr: "false", top: T_LITERAL },
    { expr: "Infinity", top: T_LITERAL },
    { expr: "typeof a", top: T_UNARY_EXPRESSION },
    { expr: "$item", top: T_IDENTIFIER },
    { expr: "null", top: T_LITERAL },
    { expr: "undefined", top: T_LITERAL },
  ];
  exprStmts.forEach((st, idx) => {
    it(`Statement #${idx + 1}: ${st.expr}`, () => {
      // --- Arrange
      const wParser = new Parser(st.expr);

      // --- Act
      const stmts = wParser.parseStatements();

      // --- Assert
      expect(stmts?.length).equal(1);
      expect(stmts?.[0].type).equal(T_EXPRESSION_STATEMENT);
      const exprStmt = stmts?.[0] as ExpressionStatement;
      expect(exprStmt.expr.type).equal(st.top);
    });
  });

  it("Let statement - no init", () => {
    // --- Arrange
    const wParser = new Parser("let x");

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert
    expect(stmts.length).equal(1);
    expect(stmts[0].type).equal(T_LET_STATEMENT);
    const letStmt = stmts[0] as LetStatement;
    expect(letStmt.decls.length).equal(1);
    expect(letStmt.decls[0].id).equal("x");
    expect(letStmt.decls[0].expr).equal(undefined);
  });

  it("Let statement - with init", () => {
    // --- Arrange
    const wParser = new Parser("let x = 3");

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert
    expect(stmts.length).equal(1);
    expect(stmts[0].type).equal(T_LET_STATEMENT);
    const letStmt = stmts[0] as LetStatement;
    expect(letStmt.decls.length).equal(1);
    expect(letStmt.decls[0].id).equal("x");
    expect(letStmt.decls[0].expr).not.equal(null);
    expect(letStmt.decls[0].expr!.type).equal(T_LITERAL);
  });

  it("Let statement - with '$'", () => {
    // --- Arrange
    const wParser = new Parser("let $x = 3");

    // --- Act
    try {
      wParser.parseStatements()!;
    } catch (err) {
      expect(wParser.errors[0].code).equal("W031");
      return;
    }
    assert.fail("Exception expected");
  });

  it("Const statement #1", () => {
    // --- Arrange
    const wParser = new Parser("const x = 3");

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert
    expect(stmts.length).equal(1);
    expect(stmts[0].type).equal(T_CONST_STATEMENT);
    const constStmt = stmts[0] as ConstStatement;
    expect(constStmt.decls.length).equal(1);
    expect(constStmt.decls[0].id).equal("x");
    expect(constStmt.decls[0].expr).not.equal(null);
    expect(constStmt.decls[0].expr!.type).equal(T_LITERAL);
  });

  it("Const statement with '$'", () => {
    // --- Arrange
    const wParser = new Parser("const $x = 3");

    // --- Act
    try {
      wParser.parseStatements()!;
    } catch (err) {
      expect(wParser.errors[0].code).equal("W031");
      return;
    }
    assert.fail("Exception expected");
  });

  it("Const statement #2", () => {
    // --- Arrange
    const wParser = new Parser("const x = 3, y = 4");

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert
    expect(stmts.length).equal(1);
    expect(stmts[0].type).equal(T_CONST_STATEMENT);
    const constStmt = stmts[0] as ConstStatement;
    expect(constStmt.decls.length).equal(2);
    expect(constStmt.decls[0].id).equal("x");
    expect(constStmt.decls[0].expr).not.equal(null);
    expect(constStmt.decls[0].expr!.type).equal(T_LITERAL);
    expect(constStmt.decls[1].id).equal("y");
    expect(constStmt.decls[1].expr).not.equal(null);
    expect(constStmt.decls[1].expr!.type).equal(T_LITERAL);
  });

  it("Var statement with '$'", () => {
    // --- Arrange
    const wParser = new Parser("var $x = 3");

    // --- Act
    try {
      wParser.parseStatements()!;
    } catch (err) {
      expect(wParser.errors[0].code).equal("W031");
      return;
    }
    assert.fail("Exception expected");
  });

  it("Var statement #1", () => {
    // --- Arrange
    const wParser = new Parser("var x = 3");

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert
    expect(stmts.length).equal(1);
    expect(stmts[0].type).equal(T_VAR_STATEMENT);
    const constStmt = stmts[0] as VarStatement;
    expect(constStmt.decls.length).equal(1);
    expect(constStmt.decls[0].id.name).equal("x");
    expect(constStmt.decls[0].expr).not.equal(null);
    expect(constStmt.decls[0].expr!.type).equal(T_LITERAL);
  });

  it("Var statement #2", () => {
    // --- Arrange
    const wParser = new Parser("var x = 3, y = 4");

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert
    expect(stmts.length).equal(1);
    expect(stmts[0].type).equal(T_VAR_STATEMENT);
    const constStmt = stmts[0] as VarStatement;
    expect(constStmt.decls.length).equal(2);
    expect(constStmt.decls[0].id.name).equal("x");
    expect(constStmt.decls[0].expr).not.equal(null);
    expect(constStmt.decls[0].expr!.type).equal(T_LITERAL);
    expect(constStmt.decls[1].id.name).equal("y");
    expect(constStmt.decls[1].expr).not.equal(null);
    expect(constStmt.decls[1].expr!.type).equal(T_LITERAL);
  });

  it("Block statement - empty", () => {
    // --- Arrange
    const wParser = new Parser("{}");

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert
    expect(stmts.length).equal(1);
    expect(stmts[0].type).equal(T_BLOCK_STATEMENT);
    const blockStmt = stmts[0] as BlockStatement;
    expect(blockStmt.stmts.length).equal(0);
  });

  it("Block statement - single #1", () => {
    // --- Arrange
    const wParser = new Parser("{;}");

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert
    expect(stmts.length).equal(1);
    expect(stmts[0].type).equal(T_BLOCK_STATEMENT);
    const blockStmt = stmts[0] as BlockStatement;
    expect(blockStmt.stmts.length).equal(1);
    expect(blockStmt.stmts[0].type).equal(T_EMPTY_STATEMENT);
  });

  it("Block statement - single #1", () => {
    // --- Arrange
    const wParser = new Parser("{ x; }");

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert
    expect(stmts.length).equal(1);
    expect(stmts[0].type).equal(T_BLOCK_STATEMENT);
    const blockStmt = stmts[0] as BlockStatement;
    expect(blockStmt.stmts.length).equal(1);
    expect(blockStmt.stmts[0].type).equal(T_EXPRESSION_STATEMENT);
  });

  it("Block statement - single #2", () => {
    // --- Arrange
    const wParser = new Parser("{ let x }");

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert
    expect(stmts.length).equal(1);
    expect(stmts[0].type).equal(T_BLOCK_STATEMENT);
    const blockStmt = stmts[0] as BlockStatement;
    expect(blockStmt.stmts.length).equal(1);
    expect(blockStmt.stmts[0].type).equal(T_LET_STATEMENT);
  });

  it("Block statement - multiple #1", () => {
    // --- Arrange
    const wParser = new Parser("{ x; let y; }");

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert
    expect(stmts.length).equal(1);
    expect(stmts[0].type).equal(T_BLOCK_STATEMENT);
    const blockStmt = stmts[0] as BlockStatement;
    expect(blockStmt.stmts.length).equal(2);
    expect(blockStmt.stmts[0].type).equal(T_EXPRESSION_STATEMENT);
    expect(blockStmt.stmts[1].type).equal(T_LET_STATEMENT);
  });

  it("Block statement - multiple #2", () => {
    // --- Arrange
    const wParser = new Parser("{ x; { let y; z} }");

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert
    expect(stmts.length).equal(1);
    expect(stmts[0].type).equal(T_BLOCK_STATEMENT);
    const blockStmt = stmts[0] as BlockStatement;
    expect(blockStmt.stmts.length).equal(2);
    expect(blockStmt.stmts[0].type).equal(T_EXPRESSION_STATEMENT);
    expect(blockStmt.stmts[1].type).equal(T_BLOCK_STATEMENT);
    const nested = blockStmt.stmts[1] as BlockStatement;
    expect(nested.stmts.length).equal(2);
    expect(nested.stmts[0].type).equal(T_LET_STATEMENT);
    expect(nested.stmts[1].type).equal(T_EXPRESSION_STATEMENT);
  });

  it("If statement - single then no else", () => {
    // --- Arrange
    const wParser = new Parser("if (true) x;");

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert
    expect(stmts.length).equal(1);
    expect(stmts[0].type).equal(T_IF_STATEMENT);
    const blockStmt = stmts[0] as IfStatement;
    expect(blockStmt.cond.type).equal(T_LITERAL);
    expect(blockStmt.thenB.type).equal(T_EXPRESSION_STATEMENT);
    expect(blockStmt.elseB).equal(null);
  });

  it("If statement - block then no else", () => {
    // --- Arrange
    const wParser = new Parser("if (true) {x; let y }");

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert
    expect(stmts.length).equal(1);
    expect(stmts[0].type).equal(T_IF_STATEMENT);
    const blockStmt = stmts[0] as IfStatement;
    expect(blockStmt.cond.type).equal(T_LITERAL);
    expect(blockStmt.thenB.type).equal(T_BLOCK_STATEMENT);
    expect(blockStmt.elseB).equal(null);
  });

  it("If statement - block then single else", () => {
    // --- Arrange
    const wParser = new Parser("if (true) {x; let y } else z");

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert
    expect(stmts.length).equal(1);
    expect(stmts[0].type).equal(T_IF_STATEMENT);
    const blockStmt = stmts[0] as IfStatement;
    expect(blockStmt.cond.type).equal(T_LITERAL);
    expect(blockStmt.thenB.type).equal(T_BLOCK_STATEMENT);
    expect(blockStmt.elseB!.type).equal(T_EXPRESSION_STATEMENT);
  });

  it("If statement - block then block else", () => {
    // --- Arrange
    const wParser = new Parser("if (true) {x; let y } else { let z; y = 12; }");

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert
    expect(stmts.length).equal(1);
    expect(stmts[0].type).equal(T_IF_STATEMENT);
    const blockStmt = stmts[0] as IfStatement;
    expect(blockStmt.cond.type).equal(T_LITERAL);
    expect(blockStmt.thenB.type).equal(T_BLOCK_STATEMENT);
    expect(blockStmt.elseB!.type).equal(T_BLOCK_STATEMENT);
  });

  it("If statement - single then block else", () => {
    // --- Arrange
    const wParser = new Parser("if (true) y=13; else { let z; y = 12; }");

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert
    expect(stmts.length).equal(1);
    expect(stmts[0].type).equal(T_IF_STATEMENT);
    const blockStmt = stmts[0] as IfStatement;
    expect(blockStmt.cond.type).equal(T_LITERAL);
    expect(blockStmt.thenB.type).equal(T_EXPRESSION_STATEMENT);
    expect(blockStmt.elseB!.type).equal(T_BLOCK_STATEMENT);
  });

  it("If statement - single then single else", () => {
    // --- Arrange
    const wParser = new Parser("if (true) y=13; else y = 12;");

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert
    expect(stmts.length).equal(1);
    expect(stmts[0].type).equal(T_IF_STATEMENT);
    const blockStmt = stmts[0] as IfStatement;
    expect(blockStmt.cond.type).equal(T_LITERAL);
    expect(blockStmt.thenB.type).equal(T_EXPRESSION_STATEMENT);
    expect(blockStmt.elseB!.type).equal(T_EXPRESSION_STATEMENT);
  });

  it("Return statement - no expression", () => {
    // --- Arrange
    const wParser = new Parser("return");

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert
    expect(stmts.length).equal(1);
    expect(stmts[0].type).equal(T_RETURN_STATEMENT);
    const returnStmt = stmts[0] as ReturnStatement;
    expect(returnStmt.expr).equal(undefined);
  });

  it("Return statement - with expression", () => {
    // --- Arrange
    const wParser = new Parser("return 123;");

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert
    expect(stmts.length).equal(1);
    expect(stmts[0].type).equal(T_RETURN_STATEMENT);
    const returnStmt = stmts[0] as ReturnStatement;
    expect(returnStmt.expr!.type).equal(T_LITERAL);
  });

  it("Break statement", () => {
    // --- Arrange
    const wParser = new Parser("break;");

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert
    expect(stmts.length).equal(1);
    expect(stmts[0].type).equal(T_BREAK_STATEMENT);
  });

  it("Continue statement", () => {
    // --- Arrange
    const wParser = new Parser("continue;");

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert
    expect(stmts.length).equal(1);
    expect(stmts[0].type).equal(T_CONTINUE_STATEMENT);
  });

  it("while statement - empty body", () => {
    // --- Arrange
    const wParser = new Parser("while (a > b);");

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert
    expect(stmts.length).equal(1);
    expect(stmts[0].type).equal(T_WHILE_STATEMENT);
    const whileStmt = stmts[0] as WhileStatement;
    expect(whileStmt.cond.type).equal(T_BINARY_EXPRESSION);
    expect(whileStmt.body.type).equal(T_EMPTY_STATEMENT);
  });

  it("while statement - single statement body", () => {
    // --- Arrange
    const wParser = new Parser("while (a > b) break;");

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert
    expect(stmts.length).equal(1);
    expect(stmts[0].type).equal(T_WHILE_STATEMENT);
    const whileStmt = stmts[0] as WhileStatement;
    expect(whileStmt.cond.type).equal(T_BINARY_EXPRESSION);
    expect(whileStmt.body.type).equal(T_BREAK_STATEMENT);
  });

  it("while statement - block body", () => {
    // --- Arrange
    const wParser = new Parser("while (a > b) { let x = 1; break; }");

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert

    expect(stmts.length).equal(1);
    expect(stmts[0].type).equal(T_WHILE_STATEMENT);
    const whileStmt = stmts[0] as WhileStatement;
    expect(whileStmt.cond.type).equal(T_BINARY_EXPRESSION);
    expect(whileStmt.body.type).equal(T_BLOCK_STATEMENT);
    const blockStmt = whileStmt.body as BlockStatement;
    expect(blockStmt.stmts.length).equal(2);
    expect(blockStmt.stmts[0].type).equal(T_LET_STATEMENT);
    expect(blockStmt.stmts[1].type).equal(T_BREAK_STATEMENT);
  });

  it("do-while statement - empty body", () => {
    // --- Arrange
    const wParser = new Parser("do ; while (a > b);");

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert

    expect(stmts.length).equal(1);
    expect(stmts[0].type).equal(T_DO_WHILE_STATEMENT);
    const whileStmt = stmts[0] as DoWhileStatement;
    expect(whileStmt.cond.type).equal(T_BINARY_EXPRESSION);
    expect(whileStmt.body.type).equal(T_EMPTY_STATEMENT);
  });

  it("do-while statement - single statement body", () => {
    // --- Arrange
    const wParser = new Parser("do break; while (a > b)");

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert

    expect(stmts.length).equal(1);
    expect(stmts[0].type).equal(T_DO_WHILE_STATEMENT);
    const whileStmt = stmts[0] as DoWhileStatement;
    expect(whileStmt.cond.type).equal(T_BINARY_EXPRESSION);
    expect(whileStmt.body.type).equal(T_BREAK_STATEMENT);
  });

  it("do-while statement - block body", () => {
    // --- Arrange
    const wParser = new Parser("do { let x = 1; break; } while (a > b)");

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert

    expect(stmts.length).equal(1);
    expect(stmts[0].type).equal(T_DO_WHILE_STATEMENT);
    const whileStmt = stmts[0] as DoWhileStatement;
    expect(whileStmt.cond.type).equal(T_BINARY_EXPRESSION);
    expect(whileStmt.body.type).equal(T_BLOCK_STATEMENT);
    const blockStmt = whileStmt.body as BlockStatement;
    expect(blockStmt.stmts.length).equal(2);
    expect(blockStmt.stmts[0].type).equal(T_LET_STATEMENT);
    expect(blockStmt.stmts[1].type).equal(T_BREAK_STATEMENT);
  });

  it("for loop - no declaration, no body", () => {
    // --- Arrange
    const wParser = new Parser("for (;;);");

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert

    expect(stmts.length).equal(1);
    expect(stmts[0].type).equal(T_FOR_STATEMENT);
    const forStmt = stmts[0] as ForStatement;
    expect(forStmt.init).equal(undefined);
    expect(forStmt.cond).equal(undefined);
    expect(forStmt.upd).equal(undefined);
    expect(forStmt.body.type).equal(T_EMPTY_STATEMENT);
  });

  it("for loop - no init, no condition, no body", () => {
    // --- Arrange
    const wParser = new Parser("for (;; x++);");

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert

    expect(stmts.length).equal(1);
    expect(stmts[0].type).equal(T_FOR_STATEMENT);
    const forStmt = stmts[0] as ForStatement;
    expect(forStmt.init).equal(undefined);
    expect(forStmt.cond).equal(undefined);
    expect(forStmt.upd!.type).equal(T_POSTFIX_OP_EXPRESSION);
    expect(forStmt.body.type).equal(T_EMPTY_STATEMENT);
  });

  it("for loop - no init, no body", () => {
    // --- Arrange
    const wParser = new Parser("for (; x < 3; x++);");

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert

    expect(stmts.length).equal(1);
    expect(stmts[0].type).equal(T_FOR_STATEMENT);
    const forStmt = stmts[0] as ForStatement;
    expect(forStmt.init).equal(undefined);
    expect(forStmt.cond!.type).equal(T_BINARY_EXPRESSION);
    expect(forStmt.upd!.type).equal(T_POSTFIX_OP_EXPRESSION);
    expect(forStmt.body.type).equal(T_EMPTY_STATEMENT);
  });

  it("for loop - expr init, no body", () => {
    // --- Arrange
    const wParser = new Parser("for (x = 0; x < 3; x++);");

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert

    expect(stmts.length).equal(1);
    expect(stmts[0].type).equal(T_FOR_STATEMENT);
    const forStmt = stmts[0] as ForStatement;
    expect(forStmt.init!.type).equal(T_EXPRESSION_STATEMENT);
    expect(forStmt.cond!.type).equal(T_BINARY_EXPRESSION);
    expect(forStmt.upd!.type).equal(T_POSTFIX_OP_EXPRESSION);
    expect(forStmt.body.type).equal(T_EMPTY_STATEMENT);
  });

  it("for loop - let init, no body", () => {
    // --- Arrange
    const wParser = new Parser("for (let x = 0; x < 3; x++);");

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert

    expect(stmts.length).equal(1);
    expect(stmts[0].type).equal(T_FOR_STATEMENT);
    const forStmt = stmts[0] as ForStatement;
    expect(forStmt.init!.type).equal(T_LET_STATEMENT);
    expect(forStmt.cond!.type).equal(T_BINARY_EXPRESSION);
    expect(forStmt.upd!.type).equal(T_POSTFIX_OP_EXPRESSION);
    expect(forStmt.body.type).equal(T_EMPTY_STATEMENT);
  });

  it("for loop - let init with '$'", () => {
    // --- Arrange
    const wParser = new Parser("for (let $x = 0; x < 3; x++);");

    // --- Act
    try {
      wParser.parseStatements()!;
    } catch (err) {
      expect(wParser.errors[0].code).equal("W031");
      return;
    }
    assert.fail("Exception expected");
  });

  it("for loop - single statement body", () => {
    // --- Arrange
    const wParser = new Parser("for (let x = 0; x < 3; x++) y++");

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert

    expect(stmts.length).equal(1);
    expect(stmts[0].type).equal(T_FOR_STATEMENT);
    const forStmt = stmts[0] as ForStatement;
    expect(forStmt.init!.type).equal(T_LET_STATEMENT);
    expect(forStmt.cond!.type).equal(T_BINARY_EXPRESSION);
    expect(forStmt.upd!.type).equal(T_POSTFIX_OP_EXPRESSION);
    expect(forStmt.body.type).equal(T_EXPRESSION_STATEMENT);
  });

  it("for loop - block statement body", () => {
    // --- Arrange
    const wParser = new Parser("for (let x = 0; x < 3; x++) {y++; break;}");

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert

    expect(stmts.length).equal(1);
    expect(stmts[0].type).equal(T_FOR_STATEMENT);
    const forStmt = stmts[0] as ForStatement;
    expect(forStmt.init!.type).equal(T_LET_STATEMENT);
    expect(forStmt.cond!.type).equal(T_BINARY_EXPRESSION);
    expect(forStmt.upd!.type).equal(T_POSTFIX_OP_EXPRESSION);
    expect(forStmt.body.type).equal(T_BLOCK_STATEMENT);
  });

  it("Throw statement - with expression", () => {
    // --- Arrange
    const wParser = new Parser("throw 123;");

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert

    expect(stmts.length).equal(1);
    expect(stmts[0].type).equal(T_THROW_STATEMENT);
    const throwStmt = stmts[0] as ThrowStatement;
    expect(throwStmt.expr!.type).equal(T_LITERAL);
  });

  it("Try statement - with catch", () => {
    // --- Arrange
    const wParser = new Parser("try { let x = 1; } catch { return; }");

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert

    expect(stmts.length).equal(1);
    expect(stmts[0].type).equal(T_TRY_STATEMENT);
    const tryStmt = stmts[0] as TryStatement;
    expect(tryStmt.tryB.stmts[0].type).equal(T_LET_STATEMENT);
    expect(tryStmt.catchV).equal(undefined);
    expect(tryStmt.catchB!.stmts[0].type).equal(T_RETURN_STATEMENT);
    expect(tryStmt.finallyB).equal(undefined);
  });

  it("Try statement - with catch and catch variable", () => {
    // --- Arrange
    const wParser = new Parser("try { let x = 1; } catch (err) { return; }");

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert

    expect(stmts.length).equal(1);
    expect(stmts[0].type).equal(T_TRY_STATEMENT);
    const tryStmt = stmts[0] as TryStatement;
    expect(tryStmt.tryB.stmts[0].type).equal(T_LET_STATEMENT);
    expect(tryStmt.catchV!.name).equal("err");
    expect(tryStmt.catchB!.stmts[0].type).equal(T_RETURN_STATEMENT);
    expect(tryStmt.finallyB).equal(undefined);
  });

  it("Try statement - with finally", () => {
    // --- Arrange
    const wParser = new Parser("try { let x = 1; } finally { return; }");

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert

    expect(stmts.length).equal(1);
    expect(stmts[0].type).equal(T_TRY_STATEMENT);
    const tryStmt = stmts[0] as TryStatement;
    expect(tryStmt.tryB.stmts[0].type).equal(T_LET_STATEMENT);
    expect(tryStmt.catchV).equal(undefined);
    expect(tryStmt.catchB).equal(undefined);
    expect(tryStmt.finallyB!.stmts[0].type).equal(T_RETURN_STATEMENT);
  });

  it("Try statement - with catch and finally", () => {
    // --- Arrange
    const wParser = new Parser("try { let x = 1; } catch { return; } finally { break; }");

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert

    expect(stmts.length).equal(1);
    expect(stmts[0].type).equal(T_TRY_STATEMENT);
    const tryStmt = stmts[0] as TryStatement;
    expect(tryStmt.tryB.stmts[0].type).equal(T_LET_STATEMENT);
    expect(tryStmt.catchV).equal(undefined);
    expect(tryStmt.catchB!.stmts[0].type).equal(T_RETURN_STATEMENT);
    expect(tryStmt.finallyB!.stmts[0].type).equal(T_BREAK_STATEMENT);
  });

  it("Try statement - with catch, catch variable, and finally", () => {
    // --- Arrange
    const wParser = new Parser("try { let x = 1; } catch (err) { return; } finally { break; }");

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert

    expect(stmts.length).equal(1);
    expect(stmts[0].type).equal(T_TRY_STATEMENT);
    const tryStmt = stmts[0] as TryStatement;
    expect(tryStmt.tryB.stmts[0].type).equal(T_LET_STATEMENT);
    expect(tryStmt.catchV!.name).equal("err");
    expect(tryStmt.catchB!.stmts[0].type).equal(T_RETURN_STATEMENT);
    expect(tryStmt.finallyB!.stmts[0].type).equal(T_BREAK_STATEMENT);
  });

  it("Switch statement - empty", () => {
    // --- Arrange
    const wParser = new Parser("switch (myValue) { }");

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert

    expect(stmts.length).equal(1);
    expect(stmts[0].type).equal(T_SWITCH_STATEMENT);
    const swcStmt = stmts[0] as SwitchStatement;
    expect(swcStmt.cases.length).equal(0);
  });

  it("Switch statement - single empty label", () => {
    // --- Arrange
    const wParser = new Parser(`
    switch (myValue) {
      case 0:
     }`);

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert

    expect(stmts.length).equal(1);
    expect(stmts[0].type).equal(T_SWITCH_STATEMENT);
    const swcStmt = stmts[0] as SwitchStatement;
    expect(swcStmt.cases.length).equal(1);
    const swcCase = swcStmt.cases[0];
    expect(swcCase.caseE!.type).equal(T_LITERAL);
    expect(swcCase.stmts!.length).equal(0);
  });

  it("Switch statement - single label/single statement", () => {
    // --- Arrange
    const wParser = new Parser(`
    switch (myValue) {
      case 0:
        let x = 3;
     }`);

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert

    expect(stmts.length).equal(1);
    expect(stmts[0].type).equal(T_SWITCH_STATEMENT);
    const swcStmt = stmts[0] as SwitchStatement;
    expect(swcStmt.cases.length).equal(1);
    const swcCase = swcStmt.cases[0];
    expect(swcCase.caseE!.type).equal(T_LITERAL);
    expect(swcCase.stmts!.length).equal(1);
  });

  it("Switch statement - single label/multiple statements", () => {
    // --- Arrange
    const wParser = new Parser(`
    switch (myValue) {
      case 0:
        let x = 3;
        console.log(x);
     }`);

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert

    expect(stmts.length).equal(1);
    expect(stmts[0].type).equal(T_SWITCH_STATEMENT);
    const swcStmt = stmts[0] as SwitchStatement;
    expect(swcStmt.cases.length).equal(1);
    const swcCase = swcStmt.cases[0];
    expect(swcCase.caseE!.type).equal(T_LITERAL);
    expect(swcCase.stmts!.length).equal(2);
  });

  it("Switch statement - multiple label #1", () => {
    // --- Arrange
    const wParser = new Parser(`
    switch (myValue) {
      case 0:
      case 1:
        let x = 3;
        console.log(x);
     }`);

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert

    expect(stmts.length).equal(1);
    expect(stmts[0].type).equal(T_SWITCH_STATEMENT);
    const swcStmt = stmts[0] as SwitchStatement;
    expect(swcStmt.cases.length).equal(2);
    let swcCase = swcStmt.cases[0];
    expect(swcCase.caseE!.type).equal(T_LITERAL);
    expect(swcCase.stmts!.length).equal(0);
    swcCase = swcStmt.cases[1];
    expect(swcCase.caseE!.type).equal(T_LITERAL);
    expect(swcCase.stmts!.length).equal(2);
  });

  it("Switch statement - multiple label #2", () => {
    // --- Arrange
    const wParser = new Parser(`
    switch (myValue) {
      case 0:
        let x = 3;
        console.log(x);
      case 1:
     }`);

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert

    expect(stmts.length).equal(1);
    expect(stmts[0].type).equal(T_SWITCH_STATEMENT);
    const swcStmt = stmts[0] as SwitchStatement;
    expect(swcStmt.cases.length).equal(2);
    let swcCase = swcStmt.cases[0];
    expect(swcCase.caseE!.type).equal(T_LITERAL);
    expect(swcCase.stmts!.length).equal(2);
    swcCase = swcStmt.cases[1];
    expect(swcCase.caseE!.type).equal(T_LITERAL);
    expect(swcCase.stmts!.length).equal(0);
  });

  it("Switch statement - multiple label #3", () => {
    // --- Arrange
    const wParser = new Parser(`
    switch (myValue) {
      case 0:
        let x = 3;
        console.log(x);
      case 1:
        break;
     }`);

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert

    expect(stmts.length).equal(1);
    expect(stmts[0].type).equal(T_SWITCH_STATEMENT);
    const swcStmt = stmts[0] as SwitchStatement;
    expect(swcStmt.cases.length).equal(2);
    let swcCase = swcStmt.cases[0];
    expect(swcCase.caseE!.type).equal(T_LITERAL);
    expect(swcCase.stmts!.length).equal(2);
    swcCase = swcStmt.cases[1];
    expect(swcCase.caseE!.type).equal(T_LITERAL);
    expect(swcCase.stmts!.length).equal(1);
  });

  it("Switch statement - multiple label #4", () => {
    // --- Arrange
    const wParser = new Parser(`
    switch (myValue) {
      default:
      case 0:
        let x = 3;
        console.log(x);
      case 1:
        break;
     }`);

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert

    expect(stmts.length).equal(1);
    expect(stmts[0].type).equal(T_SWITCH_STATEMENT);
    const swcStmt = stmts[0] as SwitchStatement;
    expect(swcStmt.cases.length).equal(3);
    let swcCase = swcStmt.cases[0];
    expect(swcCase.caseE).equal(undefined);
    expect(swcCase.stmts!.length).equal(0);
    swcCase = swcStmt.cases[1];
    expect(swcCase.caseE!.type).equal(T_LITERAL);
    expect(swcCase.stmts!.length).equal(2);
    swcCase = swcStmt.cases[2];
    expect(swcCase.caseE!.type).equal(T_LITERAL);
    expect(swcCase.stmts!.length).equal(1);
  });

  it("Switch statement - multiple label #5", () => {
    // --- Arrange
    const wParser = new Parser(`
    switch (myValue) {
      case 0:
        let x = 3;
        console.log(x);
      default:
      case 1:
        break;
     }`);

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert

    expect(stmts.length).equal(1);
    expect(stmts[0].type).equal(T_SWITCH_STATEMENT);
    const swcStmt = stmts[0] as SwitchStatement;
    expect(swcStmt.cases.length).equal(3);
    let swcCase = swcStmt.cases[0];
    expect(swcCase.caseE!.type).equal(T_LITERAL);
    expect(swcCase.stmts!.length).equal(2);
    swcCase = swcStmt.cases![1];
    expect(swcCase.caseE).equal(undefined);
    expect(swcCase.stmts!.length).equal(0);
    swcCase = swcStmt.cases![2];
    expect(swcCase.caseE!.type).equal(T_LITERAL);
    expect(swcCase.stmts!.length).equal(1);
  });

  it("Switch statement - multiple label #6", () => {
    // --- Arrange
    const wParser = new Parser(`
    switch (myValue) {
      case 0:
        let x = 3;
        console.log(x);
      case 1:
      default:
        break;
     }`);

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert

    expect(stmts.length).equal(1);
    expect(stmts[0].type).equal(T_SWITCH_STATEMENT);
    const swcStmt = stmts[0] as SwitchStatement;
    expect(swcStmt.cases.length).equal(3);
    let swcCase = swcStmt.cases[0];
    expect(swcCase.caseE!.type).equal(T_LITERAL);
    expect(swcCase.stmts!.length).equal(2);
    swcCase = swcStmt.cases[1];
    expect(swcCase.caseE!.type).equal(T_LITERAL);
    expect(swcCase.stmts!.length).equal(0);
    swcCase = swcStmt.cases[2];
    expect(swcCase.caseE).equal(undefined);
    expect(swcCase.stmts!.length).equal(1);
  });

  it("Switch statement - multiple label #7", () => {
    // --- Arrange
    const wParser = new Parser(`
    switch (myValue) {
      case 0:
        let x = 3;
        console.log(x);
      case 1:
        break;
      default:
     }`);

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert

    expect(stmts.length).equal(1);
    expect(stmts[0].type).equal(T_SWITCH_STATEMENT);
    const swcStmt = stmts[0] as SwitchStatement;
    expect(swcStmt.cases.length).equal(3);
    let swcCase = swcStmt.cases[0];
    expect(swcCase.caseE!.type).equal(T_LITERAL);
    expect(swcCase.stmts!.length).equal(2);
    swcCase = swcStmt.cases[1];
    expect(swcCase.caseE!.type).equal(T_LITERAL);
    expect(swcCase.stmts!.length).equal(1);
    swcCase = swcStmt.cases[2];
    expect(swcCase.caseE).equal(undefined);
    expect(swcCase.stmts!.length).equal(0);
  });

  it("Switch statement - multiple label #8", () => {
    // --- Arrange
    const wParser = new Parser(`
    switch (myValue) {
      case 0:
        let x = 3;
        console.log(x);
      case 1:
        break;
      default: {
        let x = 0;
        console.log(x);
      }
     }`);

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert

    expect(stmts.length).equal(1);
    expect(stmts[0].type).equal(T_SWITCH_STATEMENT);
    const swcStmt = stmts[0] as SwitchStatement;
    expect(swcStmt.cases.length).equal(3);
    let swcCase = swcStmt.cases[0];
    expect(swcCase.caseE!.type).equal(T_LITERAL);
    expect(swcCase.stmts!.length).equal(2);
    swcCase = swcStmt.cases[1];
    expect(swcCase.caseE!.type).equal(T_LITERAL);
    expect(swcCase.stmts!.length).equal(1);
    swcCase = swcStmt.cases[2];
    expect(swcCase.caseE).equal(undefined);
    expect(swcCase.stmts!.length).equal(1);
  });

  it("Switch statement - multiple default", () => {
    // --- Arrange
    const wParser = new Parser(`
    switch (myValue) {
      default:
        let x = 3;
        console.log(x);
      case 1:
        break;
      default: {
        let x = 0;
        console.log(x);
      }
     }`);

    // --- Act/Assert
    try {
      wParser.parseStatements()!;
    } catch (err) {
      expect(wParser.errors.length).equal(1);
      expect(wParser.errors[0].code).equal("W016");
      return;
    }
    assert.fail("Exception expected");
  });

  it("for..in loop - no var binding, no body", () => {
    // --- Arrange
    const wParser = new Parser("for (myVar in collection);");

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert

    expect(stmts.length).equal(1);
    expect(stmts[0].type).equal(T_FOR_IN_STATEMENT);
    const forStmt = stmts[0] as ForInStatement;
    expect(forStmt.varB).equal("none");
    expect(forStmt.id.name).equal("myVar");
    expect(forStmt.expr.type).equal(T_IDENTIFIER);
    expect(forStmt.body.type).equal(T_EMPTY_STATEMENT);
  });

  it("for..in loop - 'let' binding, no body", () => {
    // --- Arrange
    const wParser = new Parser("for (let myVar in collection);");

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert

    expect(stmts.length).equal(1);
    expect(stmts[0].type).equal(T_FOR_IN_STATEMENT);
    const forStmt = stmts[0] as ForInStatement;
    expect(forStmt.varB).equal("let");
    expect(forStmt.id.name).equal("myVar");
    expect(forStmt.expr.type).equal(T_IDENTIFIER);
    expect(forStmt.body.type).equal(T_EMPTY_STATEMENT);
  });

  it("for..in loop - 'let' binding with '$'", () => {
    // --- Arrange
    const wParser = new Parser("for (let $myVar in collection);");

    // --- Act
    try {
      wParser.parseStatements()!;
    } catch (err) {
      expect(wParser.errors[0].code).equal("W031");
      return;
    }
    assert.fail("Exception expected");
  });

  it("for..in loop - 'const' binding, no body", () => {
    // --- Arrange
    const wParser = new Parser("for (const myVar in collection);");

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert

    expect(stmts.length).equal(1);
    expect(stmts[0].type).equal(T_FOR_IN_STATEMENT);
    const forStmt = stmts[0] as ForInStatement;
    expect(forStmt.varB).equal("const");
    expect(forStmt.id.name).equal("myVar");
    expect(forStmt.expr.type).equal(T_IDENTIFIER);
    expect(forStmt.body.type).equal(T_EMPTY_STATEMENT);
  });

  it("for..in loop - 'const' binding with '$'", () => {
    // --- Arrange
    const wParser = new Parser("for (const $myVar in collection);");

    // --- Act
    try {
      wParser.parseStatements()!;
    } catch (err) {
      expect(wParser.errors[0].code).equal("W031");
      return;
    }
    assert.fail("Exception expected");
  });

  it("for..in loop - no var binding, body", () => {
    // --- Arrange
    const wParser = new Parser("for (myVar in collection) { console.log(myVar); }");

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert

    expect(stmts.length).equal(1);
    expect(stmts[0].type).equal(T_FOR_IN_STATEMENT);
    const forStmt = stmts[0] as ForInStatement;
    expect(forStmt.varB).equal("none");
    expect(forStmt.id.name).equal("myVar");
    expect(forStmt.expr.type).equal(T_IDENTIFIER);
    expect(forStmt.body.type).equal(T_BLOCK_STATEMENT);
  });

  it("for..in loop - 'let' binding, body", () => {
    // --- Arrange
    const wParser = new Parser("for (let myVar in collection) { console.log(myVar); }");

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert

    expect(stmts.length).equal(1);
    expect(stmts[0].type).equal(T_FOR_IN_STATEMENT);
    const forStmt = stmts[0] as ForInStatement;
    expect(forStmt.varB).equal("let");
    expect(forStmt.id.name).equal("myVar");
    expect(forStmt.expr.type).equal(T_IDENTIFIER);
    expect(forStmt.body.type).equal(T_BLOCK_STATEMENT);
  });

  it("for..in loop - 'const' binding, body", () => {
    // --- Arrange
    const wParser = new Parser("for (const myVar in collection) { console.log(myVar); }");

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert

    expect(stmts.length).equal(1);
    expect(stmts[0].type).equal(T_FOR_IN_STATEMENT);
    const forStmt = stmts[0] as ForInStatement;
    expect(forStmt.varB).equal("const");
    expect(forStmt.id.name).equal("myVar");
    expect(forStmt.expr.type).equal(T_IDENTIFIER);
    expect(forStmt.body.type).equal(T_BLOCK_STATEMENT);
  });

  it("for..of loop - no var binding, no body", () => {
    // --- Arrange
    const wParser = new Parser("for (myVar of collection);");

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert

    expect(stmts.length).equal(1);
    expect(stmts[0].type).equal(T_FOR_OF_STATEMENT);
    const forStmt = stmts[0] as ForOfStatement;
    expect(forStmt.varB).equal("none");
    expect(forStmt.id.name).equal("myVar");
    expect(forStmt.expr.type).equal(T_IDENTIFIER);
    expect(forStmt.body.type).equal(T_EMPTY_STATEMENT);
  });

  it("for..of loop - 'let' binding, no body", () => {
    // --- Arrange
    const wParser = new Parser("for (let myVar of collection);");

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert

    expect(stmts.length).equal(1);
    expect(stmts[0].type).equal(T_FOR_OF_STATEMENT);
    const forStmt = stmts[0] as ForOfStatement;
    expect(forStmt.varB).equal("let");
    expect(forStmt.id.name).equal("myVar");
    expect(forStmt.expr.type).equal(T_IDENTIFIER);
    expect(forStmt.body.type).equal(T_EMPTY_STATEMENT);
  });

  it("for..of loop - 'let' binding with '$'", () => {
    // --- Arrange
    const wParser = new Parser("for (let $myVar of collection);");

    // --- Act
    try {
      wParser.parseStatements()!;
    } catch (err) {
      expect(wParser.errors[0].code).equal("W031");
      return;
    }
    assert.fail("Exception expected");
  });

  it("for..of loop - 'const' binding, no body", () => {
    // --- Arrange
    const wParser = new Parser("for (const myVar of collection);");

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert

    expect(stmts.length).equal(1);
    expect(stmts[0].type).equal(T_FOR_OF_STATEMENT);
    const forStmt = stmts[0] as ForOfStatement;
    expect(forStmt.varB).equal("const");
    expect(forStmt.id.name).equal("myVar");
    expect(forStmt.expr.type).equal(T_IDENTIFIER);
    expect(forStmt.body.type).equal(T_EMPTY_STATEMENT);
  });

  it("for..of loop - 'const' binding with '$'", () => {
    // --- Arrange
    const wParser = new Parser("for (const $myVar of collection);");

    // --- Act
    try {
      wParser.parseStatements()!;
    } catch (err) {
      expect(wParser.errors[0].code).equal("W031");
      return;
    }
    assert.fail("Exception expected");
  });

  it("for..of loop - no var binding, body", () => {
    // --- Arrange
    const wParser = new Parser("for (myVar of collection) { console.log(myVar); }");

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert

    expect(stmts.length).equal(1);
    expect(stmts[0].type).equal(T_FOR_OF_STATEMENT);
    const forStmt = stmts[0] as ForOfStatement;
    expect(forStmt.varB).equal("none");
    expect(forStmt.id.name).equal("myVar");
    expect(forStmt.expr.type).equal(T_IDENTIFIER);
    expect(forStmt.body.type).equal(T_BLOCK_STATEMENT);
  });

  it("for..of loop - 'let' binding, body", () => {
    // --- Arrange
    const wParser = new Parser("for (let myVar of collection) { console.log(myVar); }");

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert

    expect(stmts.length).equal(1);
    expect(stmts[0].type).equal(T_FOR_OF_STATEMENT);
    const forStmt = stmts[0] as ForOfStatement;
    expect(forStmt.varB).equal("let");
    expect(forStmt.id.name).equal("myVar");
    expect(forStmt.expr.type).equal(T_IDENTIFIER);
    expect(forStmt.body.type).equal(T_BLOCK_STATEMENT);
  });

  it("for..of loop - 'const' binding, body", () => {
    // --- Arrange
    const wParser = new Parser("for (const myVar of collection) { console.log(myVar); }");

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert

    expect(stmts.length).equal(1);
    expect(stmts[0].type).equal(T_FOR_OF_STATEMENT);
    const forStmt = stmts[0] as ForOfStatement;
    expect(forStmt.varB).equal("const");
    expect(forStmt.id.name).equal("myVar");
    expect(forStmt.expr.type).equal(T_IDENTIFIER);
    expect(forStmt.body.type).equal(T_BLOCK_STATEMENT);
  });
});
