import { assert, describe, expect, it } from "vitest";

import { Parser } from "@parsers/scripting-exp/Parser";
import {
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
  WhileStatement,
} from "@parsers/scripting-exp/source-tree";

describe("Parser - statements", () => {
  it("Empty source", () => {
    // --- Arrange
    const wParser = new Parser("");

    // --- Act
    const stmts = wParser.parseStatements();

    // --- Assert
    expect(isDeepFrozen(stmts)).equal(true);
    expect(stmts?.length).equal(0);
  });

  it("Empty statement", () => {
    // --- Arrange
    const wParser = new Parser(";");

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert
    expect(isDeepFrozen(stmts)).equal(true);
    expect(stmts.length).equal(1);
    expect(stmts[0].type).equal("EmptyS");
  });

  it("Multiple empty statement", () => {
    // --- Arrange
    const wParser = new Parser(";;");

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert
    expect(isDeepFrozen(stmts)).equal(true);
    expect(stmts.length).equal(2);
    expect(stmts[0].type).equal("EmptyS");
    expect(stmts[1].type).equal("EmptyS");
  });

  const exprStmts = [
    { expr: "(a + b)", top: "BinaryE" },
    { expr: "myId", top: "IdE" },
    { expr: "+myId", top: "UnaryE" },
    { expr: "-myId", top: "UnaryE" },
    { expr: "~myId", top: "UnaryE" },
    { expr: "[1, 2, 3]", top: "ALitE" },
    { expr: "!myId", top: "UnaryE" },
    { expr: "...[1, 2, 3]", top: "SpreadE" },
    { expr: "123", top: "LitE" },
    { expr: "0x123", top: "LitE" },
    { expr: "0b00_11", top: "LitE" },
    { expr: "true", top: "LitE" },
    { expr: "false", top: "LitE" },
    { expr: "Infinity", top: "LitE" },
    { expr: "typeof a", top: "UnaryE" },
    { expr: "$item", top: "IdE" },
    { expr: "null", top: "LitE" },
    { expr: "undefined", top: "LitE" },
  ];
  exprStmts.forEach((st, idx) => {
    it(`Statement #${idx + 1}: ${st.expr}`, () => {
      // --- Arrange
      const wParser = new Parser(st.expr);

      // --- Act
      const stmts = wParser.parseStatements();

      // --- Assert
      expect(isDeepFrozen(stmts)).equal(true);
      expect(stmts?.length).equal(1);
      expect(stmts?.[0].type).equal("ExprS");
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
    expect(isDeepFrozen(stmts)).equal(true);
    expect(stmts.length).equal(1);
    expect(stmts[0].type).equal("LetS");
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
    expect(stmts[0].type).equal("LetS");
    const letStmt = stmts[0] as LetStatement;
    expect(letStmt.decls.length).equal(1);
    expect(letStmt.decls[0].id).equal("x");
    expect(letStmt.decls[0].expr).not.equal(null);
    expect(letStmt.decls[0].expr!.type).equal("LitE");
  });

  it("Const statement #1", () => {
    // --- Arrange
    const wParser = new Parser("const x = 3");

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert
    expect(stmts.length).equal(1);
    expect(stmts[0].type).equal("ConstS");
    const constStmt = stmts[0] as ConstStatement;
    expect(constStmt.decls.length).equal(1);
    expect(constStmt.decls[0].id).equal("x");
    expect(constStmt.decls[0].expr).not.equal(null);
    expect(constStmt.decls[0].expr!.type).equal("LitE");
  });

  it("Const statement #2", () => {
    // --- Arrange
    const wParser = new Parser("const x = 3, y = 4");

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert
    expect(isDeepFrozen(stmts)).equal(true);
    expect(stmts.length).equal(1);
    expect(stmts[0].type).equal("ConstS");
    const constStmt = stmts[0] as ConstStatement;
    expect(constStmt.decls.length).equal(2);
    expect(constStmt.decls[0].id).equal("x");
    expect(constStmt.decls[0].expr).not.equal(null);
    expect(constStmt.decls[0].expr!.type).equal("LitE");
    expect(constStmt.decls[1].id).equal("y");
    expect(constStmt.decls[1].expr).not.equal(null);
    expect(constStmt.decls[1].expr!.type).equal("LitE");
  });

  it("Var statement #1", () => {
    // --- Arrange
    const wParser = new Parser("var x = 3");

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert
    expect(isDeepFrozen(stmts)).equal(true);
    expect(stmts.length).equal(1);
    expect(stmts[0].type).equal("VarS");
    const constStmt = stmts[0] as VarStatement;
    expect(constStmt.decls.length).equal(1);
    expect(constStmt.decls[0].id.name).equal("x");
    expect(constStmt.decls[0].expr).not.equal(null);
    expect(constStmt.decls[0].expr!.type).equal("LitE");
  });

  it("Var statement #2", () => {
    // --- Arrange
    const wParser = new Parser("var x = 3, y = 4");

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert
    expect(isDeepFrozen(stmts)).equal(true);
    expect(stmts.length).equal(1);
    expect(stmts[0].type).equal("VarS");
    const constStmt = stmts[0] as VarStatement;
    expect(constStmt.decls.length).equal(2);
    expect(constStmt.decls[0].id.name).equal("x");
    expect(constStmt.decls[0].expr).not.equal(null);
    expect(constStmt.decls[0].expr!.type).equal("LitE");
    expect(constStmt.decls[1].id.name).equal("y");
    expect(constStmt.decls[1].expr).not.equal(null);
    expect(constStmt.decls[1].expr!.type).equal("LitE");
  });

  it("Block statement - empty", () => {
    // --- Arrange
    const wParser = new Parser("{}");

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert
    expect(isDeepFrozen(stmts)).equal(true);
    expect(stmts.length).equal(1);
    expect(stmts[0].type).equal("BlockS");
    const blockStmt = stmts[0] as BlockStatement;
    expect(blockStmt.stmts.length).equal(0);
  });

  it("Block statement - single #1", () => {
    // --- Arrange
    const wParser = new Parser("{;}");

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert
    expect(isDeepFrozen(stmts)).equal(true);
    expect(stmts.length).equal(1);
    expect(stmts[0].type).equal("BlockS");
    const blockStmt = stmts[0] as BlockStatement;
    expect(blockStmt.stmts.length).equal(1);
    expect(blockStmt.stmts[0].type).equal("EmptyS");
  });

  it("Block statement - single #1", () => {
    // --- Arrange
    const wParser = new Parser("{ x; }");

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert
    expect(isDeepFrozen(stmts)).equal(true);
    expect(stmts.length).equal(1);
    expect(stmts[0].type).equal("BlockS");
    const blockStmt = stmts[0] as BlockStatement;
    expect(blockStmt.stmts.length).equal(1);
    expect(blockStmt.stmts[0].type).equal("ExprS");
  });

  it("Block statement - single #2", () => {
    // --- Arrange
    const wParser = new Parser("{ let x }");

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert
    expect(isDeepFrozen(stmts)).equal(true);
    expect(stmts.length).equal(1);
    expect(stmts[0].type).equal("BlockS");
    const blockStmt = stmts[0] as BlockStatement;
    expect(blockStmt.stmts.length).equal(1);
    expect(blockStmt.stmts[0].type).equal("LetS");
  });

  it("Block statement - multiple #1", () => {
    // --- Arrange
    const wParser = new Parser("{ x; let y; }");

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert
    expect(isDeepFrozen(stmts)).equal(true);
    expect(stmts.length).equal(1);
    expect(stmts[0].type).equal("BlockS");
    const blockStmt = stmts[0] as BlockStatement;
    expect(blockStmt.stmts.length).equal(2);
    expect(blockStmt.stmts[0].type).equal("ExprS");
    expect(blockStmt.stmts[1].type).equal("LetS");
  });

  it("Block statement - multiple #2", () => {
    // --- Arrange
    const wParser = new Parser("{ x; { let y; z} }");

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert
    expect(isDeepFrozen(stmts)).equal(true);
    expect(stmts.length).equal(1);
    expect(stmts[0].type).equal("BlockS");
    const blockStmt = stmts[0] as BlockStatement;
    expect(blockStmt.stmts.length).equal(2);
    expect(blockStmt.stmts[0].type).equal("ExprS");
    expect(blockStmt.stmts[1].type).equal("BlockS");
    const nested = blockStmt.stmts[1] as BlockStatement;
    expect(nested.stmts.length).equal(2);
    expect(nested.stmts[0].type).equal("LetS");
    expect(nested.stmts[1].type).equal("ExprS");
  });

  it("If statement - single then no else", () => {
    // --- Arrange
    const wParser = new Parser("if (true) x;");

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert
    expect(isDeepFrozen(stmts)).equal(true);
    expect(stmts.length).equal(1);
    expect(stmts[0].type).equal("IfS");
    const blockStmt = stmts[0] as IfStatement;
    expect(blockStmt.cond.type).equal("LitE");
    expect(blockStmt.thenB.type).equal("ExprS");
    expect(blockStmt.elseB).equal(null);
  });

  it("If statement - block then no else", () => {
    // --- Arrange
    const wParser = new Parser("if (true) {x; let y }");

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert
    expect(isDeepFrozen(stmts)).equal(true);
    expect(stmts.length).equal(1);
    expect(stmts[0].type).equal("IfS");
    const blockStmt = stmts[0] as IfStatement;
    expect(blockStmt.cond.type).equal("LitE");
    expect(blockStmt.thenB.type).equal("BlockS");
    expect(blockStmt.elseB).equal(null);
  });

  it("If statement - block then single else", () => {
    // --- Arrange
    const wParser = new Parser("if (true) {x; let y } else z");

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert
    expect(isDeepFrozen(stmts)).equal(true);
    expect(stmts.length).equal(1);
    expect(stmts[0].type).equal("IfS");
    const blockStmt = stmts[0] as IfStatement;
    expect(blockStmt.cond.type).equal("LitE");
    expect(blockStmt.thenB.type).equal("BlockS");
    expect(blockStmt.elseB!.type).equal("ExprS");
  });

  it("If statement - block then block else", () => {
    // --- Arrange
    const wParser = new Parser("if (true) {x; let y } else { let z; y = 12; }");

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert
    expect(isDeepFrozen(stmts)).equal(true);
    expect(stmts.length).equal(1);
    expect(stmts[0].type).equal("IfS");
    const blockStmt = stmts[0] as IfStatement;
    expect(blockStmt.cond.type).equal("LitE");
    expect(blockStmt.thenB.type).equal("BlockS");
    expect(blockStmt.elseB!.type).equal("BlockS");
  });

  it("If statement - single then block else", () => {
    // --- Arrange
    const wParser = new Parser("if (true) y=13; else { let z; y = 12; }");

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert
    expect(isDeepFrozen(stmts)).equal(true);
    expect(stmts.length).equal(1);
    expect(stmts[0].type).equal("IfS");
    const blockStmt = stmts[0] as IfStatement;
    expect(blockStmt.cond.type).equal("LitE");
    expect(blockStmt.thenB.type).equal("ExprS");
    expect(blockStmt.elseB!.type).equal("BlockS");
  });

  it("If statement - single then single else", () => {
    // --- Arrange
    const wParser = new Parser("if (true) y=13; else y = 12;");

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert
    expect(isDeepFrozen(stmts)).equal(true);
    expect(stmts.length).equal(1);
    expect(stmts[0].type).equal("IfS");
    const blockStmt = stmts[0] as IfStatement;
    expect(blockStmt.cond.type).equal("LitE");
    expect(blockStmt.thenB.type).equal("ExprS");
    expect(blockStmt.elseB!.type).equal("ExprS");
  });

  it("Return statement - no expression", () => {
    // --- Arrange
    const wParser = new Parser("return");

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert
    expect(isDeepFrozen(stmts)).equal(true);
    expect(stmts.length).equal(1);
    expect(stmts[0].type).equal("RetS");
    const returnStmt = stmts[0] as ReturnStatement;
    expect(returnStmt.expr).equal(undefined);
  });

  it("Return statement - with expression", () => {
    // --- Arrange
    const wParser = new Parser("return 123;");

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert
    expect(isDeepFrozen(stmts)).equal(true);
    expect(stmts.length).equal(1);
    expect(stmts[0].type).equal("RetS");
    const returnStmt = stmts[0] as ReturnStatement;
    expect(returnStmt.expr!.type).equal("LitE");
  });

  it("Break statement", () => {
    // --- Arrange
    const wParser = new Parser("break;");

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert
    expect(isDeepFrozen(stmts)).equal(true);
    expect(stmts.length).equal(1);
    expect(stmts[0].type).equal("BrkS");
  });

  it("Continue statement", () => {
    // --- Arrange
    const wParser = new Parser("continue;");

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert
    expect(isDeepFrozen(stmts)).equal(true);
    expect(stmts.length).equal(1);
    expect(stmts[0].type).equal("ContS");
  });

  it("while statement - empty body", () => {
    // --- Arrange
    const wParser = new Parser("while (a > b);");

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert
    expect(isDeepFrozen(stmts)).equal(true);
    expect(stmts.length).equal(1);
    expect(stmts[0].type).equal("WhileS");
    const whileStmt = stmts[0] as WhileStatement;
    expect(whileStmt.cond.type).equal("BinaryE");
    expect(whileStmt.body.type).equal("EmptyS");
  });

  it("while statement - single statement body", () => {
    // --- Arrange
    const wParser = new Parser("while (a > b) break;");

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert
    expect(isDeepFrozen(stmts)).equal(true);
    expect(stmts.length).equal(1);
    expect(stmts[0].type).equal("WhileS");
    const whileStmt = stmts[0] as WhileStatement;
    expect(whileStmt.cond.type).equal("BinaryE");
    expect(whileStmt.body.type).equal("BrkS");
  });

  it("while statement - block body", () => {
    // --- Arrange
    const wParser = new Parser("while (a > b) { let x = 1; break; }");

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert
    expect(isDeepFrozen(stmts)).equal(true);
    expect(stmts.length).equal(1);
    expect(stmts[0].type).equal("WhileS");
    const whileStmt = stmts[0] as WhileStatement;
    expect(whileStmt.cond.type).equal("BinaryE");
    expect(whileStmt.body.type).equal("BlockS");
    const blockStmt = whileStmt.body as BlockStatement;
    expect(blockStmt.stmts.length).equal(2);
    expect(blockStmt.stmts[0].type).equal("LetS");
    expect(blockStmt.stmts[1].type).equal("BrkS");
  });

  it("do-while statement - empty body", () => {
    // --- Arrange
    const wParser = new Parser("do ; while (a > b);");

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert
    expect(isDeepFrozen(stmts)).equal(true);
    expect(stmts.length).equal(1);
    expect(stmts[0].type).equal("DoWS");
    const whileStmt = stmts[0] as DoWhileStatement;
    expect(whileStmt.cond.type).equal("BinaryE");
    expect(whileStmt.body.type).equal("EmptyS");
  });

  it("do-while statement - single statement body", () => {
    // --- Arrange
    const wParser = new Parser("do break; while (a > b)");

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert
    expect(isDeepFrozen(stmts)).equal(true);
    expect(stmts.length).equal(1);
    expect(stmts[0].type).equal("DoWS");
    const whileStmt = stmts[0] as DoWhileStatement;
    expect(whileStmt.cond.type).equal("BinaryE");
    expect(whileStmt.body.type).equal("BrkS");
  });

  it("do-while statement - block body", () => {
    // --- Arrange
    const wParser = new Parser("do { let x = 1; break; } while (a > b)");

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert
    expect(isDeepFrozen(stmts)).equal(true);
    expect(stmts.length).equal(1);
    expect(stmts[0].type).equal("DoWS");
    const whileStmt = stmts[0] as DoWhileStatement;
    expect(whileStmt.cond.type).equal("BinaryE");
    expect(whileStmt.body.type).equal("BlockS");
    const blockStmt = whileStmt.body as BlockStatement;
    expect(blockStmt.stmts.length).equal(2);
    expect(blockStmt.stmts[0].type).equal("LetS");
    expect(blockStmt.stmts[1].type).equal("BrkS");
  });

  it("for loop - no declaration, no body", () => {
    // --- Arrange
    const wParser = new Parser("for (;;);");

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert
    expect(isDeepFrozen(stmts)).equal(true);
    expect(stmts.length).equal(1);
    expect(stmts[0].type).equal("ForS");
    const forStmt = stmts[0] as ForStatement;
    expect(forStmt.init).equal(undefined);
    expect(forStmt.cond).equal(undefined);
    expect(forStmt.upd).equal(undefined);
    expect(forStmt.body.type).equal("EmptyS");
  });

  it("for loop - no init, no condition, no body", () => {
    // --- Arrange
    const wParser = new Parser("for (;; x++);");

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert
    expect(isDeepFrozen(stmts)).equal(true);
    expect(stmts.length).equal(1);
    expect(stmts[0].type).equal("ForS");
    const forStmt = stmts[0] as ForStatement;
    expect(forStmt.init).equal(undefined);
    expect(forStmt.cond).equal(undefined);
    expect(forStmt.upd!.type).equal("PostfE");
    expect(forStmt.body.type).equal("EmptyS");
  });

  it("for loop - no init, no body", () => {
    // --- Arrange
    const wParser = new Parser("for (; x < 3; x++);");

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert
    expect(isDeepFrozen(stmts)).equal(true);
    expect(stmts.length).equal(1);
    expect(stmts[0].type).equal("ForS");
    const forStmt = stmts[0] as ForStatement;
    expect(forStmt.init).equal(undefined);
    expect(forStmt.cond!.type).equal("BinaryE");
    expect(forStmt.upd!.type).equal("PostfE");
    expect(forStmt.body.type).equal("EmptyS");
  });

  it("for loop - expr init, no body", () => {
    // --- Arrange
    const wParser = new Parser("for (x = 0; x < 3; x++);");

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert
    expect(isDeepFrozen(stmts)).equal(true);
    expect(stmts.length).equal(1);
    expect(stmts[0].type).equal("ForS");
    const forStmt = stmts[0] as ForStatement;
    expect(forStmt.init!.type).equal("ExprS");
    expect(forStmt.cond!.type).equal("BinaryE");
    expect(forStmt.upd!.type).equal("PostfE");
    expect(forStmt.body.type).equal("EmptyS");
  });

  it("for loop - let init, no body", () => {
    // --- Arrange
    const wParser = new Parser("for (let x = 0; x < 3; x++);");

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert
    expect(isDeepFrozen(stmts)).equal(true);
    expect(stmts.length).equal(1);
    expect(stmts[0].type).equal("ForS");
    const forStmt = stmts[0] as ForStatement;
    expect(forStmt.init!.type).equal("LetS");
    expect(forStmt.cond!.type).equal("BinaryE");
    expect(forStmt.upd!.type).equal("PostfE");
    expect(forStmt.body.type).equal("EmptyS");
  });

  it("for loop - single statement body", () => {
    // --- Arrange
    const wParser = new Parser("for (let x = 0; x < 3; x++) y++");

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert
    expect(isDeepFrozen(stmts)).equal(true);
    expect(stmts.length).equal(1);
    expect(stmts[0].type).equal("ForS");
    const forStmt = stmts[0] as ForStatement;
    expect(forStmt.init!.type).equal("LetS");
    expect(forStmt.cond!.type).equal("BinaryE");
    expect(forStmt.upd!.type).equal("PostfE");
    expect(forStmt.body.type).equal("ExprS");
  });

  it("for loop - block statement body", () => {
    // --- Arrange
    const wParser = new Parser("for (let x = 0; x < 3; x++) {y++; break;}");

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert
    expect(isDeepFrozen(stmts)).equal(true);
    expect(stmts.length).equal(1);
    expect(stmts[0].type).equal("ForS");
    const forStmt = stmts[0] as ForStatement;
    expect(forStmt.init!.type).equal("LetS");
    expect(forStmt.cond!.type).equal("BinaryE");
    expect(forStmt.upd!.type).equal("PostfE");
    expect(forStmt.body.type).equal("BlockS");
  });

  it("Throw statement - with expression", () => {
    // --- Arrange
    const wParser = new Parser("throw 123;");

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert
    expect(isDeepFrozen(stmts)).equal(true);
    expect(stmts.length).equal(1);
    expect(stmts[0].type).equal("ThrowS");
    const throwStmt = stmts[0] as ThrowStatement;
    expect(throwStmt.expr!.type).equal("LitE");
  });

  it("Try statement - with catch", () => {
    // --- Arrange
    const wParser = new Parser("try { let x = 1; } catch { return; }");

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert
    expect(isDeepFrozen(stmts)).equal(true);
    expect(stmts.length).equal(1);
    expect(stmts[0].type).equal("TryS");
    const tryStmt = stmts[0] as TryStatement;
    expect(tryStmt.tryB.stmts[0].type).equal("LetS");
    expect(tryStmt.catchV).equal(undefined);
    expect(tryStmt.catchB!.stmts[0].type).equal("RetS");
    expect(tryStmt.finallyB).equal(undefined);
  });

  it("Try statement - with catch and catch variable", () => {
    // --- Arrange
    const wParser = new Parser("try { let x = 1; } catch (err) { return; }");

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert
    expect(isDeepFrozen(stmts)).equal(true);
    expect(stmts.length).equal(1);
    expect(stmts[0].type).equal("TryS");
    const tryStmt = stmts[0] as TryStatement;
    expect(tryStmt.tryB.stmts[0].type).equal("LetS");
    expect(tryStmt.catchV!.name).equal("err");
    expect(tryStmt.catchB!.stmts[0].type).equal("RetS");
    expect(tryStmt.finallyB).equal(undefined);
  });

  it("Try statement - with finally", () => {
    // --- Arrange
    const wParser = new Parser("try { let x = 1; } finally { return; }");

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert
    expect(isDeepFrozen(stmts)).equal(true);
    expect(stmts.length).equal(1);
    expect(stmts[0].type).equal("TryS");
    const tryStmt = stmts[0] as TryStatement;
    expect(tryStmt.tryB.stmts[0].type).equal("LetS");
    expect(tryStmt.catchV).equal(undefined);
    expect(tryStmt.catchB).equal(undefined);
    expect(tryStmt.finallyB!.stmts[0].type).equal("RetS");
  });

  it("Try statement - with catch and finally", () => {
    // --- Arrange
    const wParser = new Parser("try { let x = 1; } catch { return; } finally { break; }");

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert
    expect(isDeepFrozen(stmts)).equal(true);
    expect(stmts.length).equal(1);
    expect(stmts[0].type).equal("TryS");
    const tryStmt = stmts[0] as TryStatement;
    expect(tryStmt.tryB.stmts[0].type).equal("LetS");
    expect(tryStmt.catchV).equal(undefined);
    expect(tryStmt.catchB!.stmts[0].type).equal("RetS");
    expect(tryStmt.finallyB!.stmts[0].type).equal("BrkS");
  });

  it("Try statement - with catch, catch variable, and finally", () => {
    // --- Arrange
    const wParser = new Parser("try { let x = 1; } catch (err) { return; } finally { break; }");

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert
    expect(isDeepFrozen(stmts)).equal(true);
    expect(stmts.length).equal(1);
    expect(stmts[0].type).equal("TryS");
    const tryStmt = stmts[0] as TryStatement;
    expect(tryStmt.tryB.stmts[0].type).equal("LetS");
    expect(tryStmt.catchV!.name).equal("err");
    expect(tryStmt.catchB!.stmts[0].type).equal("RetS");
    expect(tryStmt.finallyB!.stmts[0].type).equal("BrkS");
  });

  it("Switch statement - empty", () => {
    // --- Arrange
    const wParser = new Parser("switch (myValue) { }");

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert
    expect(isDeepFrozen(stmts)).equal(true);
    expect(stmts.length).equal(1);
    expect(stmts[0].type).equal("SwitchS");
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
    expect(isDeepFrozen(stmts)).equal(true);
    expect(stmts.length).equal(1);
    expect(stmts[0].type).equal("SwitchS");
    const swcStmt = stmts[0] as SwitchStatement;
    expect(swcStmt.cases.length).equal(1);
    const swcCase = swcStmt.cases[0];
    expect(swcCase.caseE!.type).equal("LitE");
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
    expect(isDeepFrozen(stmts)).equal(true);
    expect(stmts.length).equal(1);
    expect(stmts[0].type).equal("SwitchS");
    const swcStmt = stmts[0] as SwitchStatement;
    expect(swcStmt.cases.length).equal(1);
    const swcCase = swcStmt.cases[0];
    expect(swcCase.caseE!.type).equal("LitE");
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
    expect(isDeepFrozen(stmts)).equal(true);
    expect(stmts.length).equal(1);
    expect(stmts[0].type).equal("SwitchS");
    const swcStmt = stmts[0] as SwitchStatement;
    expect(swcStmt.cases.length).equal(1);
    const swcCase = swcStmt.cases[0];
    expect(swcCase.caseE!.type).equal("LitE");
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
    expect(isDeepFrozen(stmts)).equal(true);
    expect(stmts.length).equal(1);
    expect(stmts[0].type).equal("SwitchS");
    const swcStmt = stmts[0] as SwitchStatement;
    expect(swcStmt.cases.length).equal(2);
    let swcCase = swcStmt.cases[0];
    expect(swcCase.caseE!.type).equal("LitE");
    expect(swcCase.stmts!.length).equal(0);
    swcCase = swcStmt.cases[1];
    expect(swcCase.caseE!.type).equal("LitE");
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
    expect(isDeepFrozen(stmts)).equal(true);
    expect(stmts.length).equal(1);
    expect(stmts[0].type).equal("SwitchS");
    const swcStmt = stmts[0] as SwitchStatement;
    expect(swcStmt.cases.length).equal(2);
    let swcCase = swcStmt.cases[0];
    expect(swcCase.caseE!.type).equal("LitE");
    expect(swcCase.stmts!.length).equal(2);
    swcCase = swcStmt.cases[1];
    expect(swcCase.caseE!.type).equal("LitE");
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
    expect(isDeepFrozen(stmts)).equal(true);
    expect(stmts.length).equal(1);
    expect(stmts[0].type).equal("SwitchS");
    const swcStmt = stmts[0] as SwitchStatement;
    expect(swcStmt.cases.length).equal(2);
    let swcCase = swcStmt.cases[0];
    expect(swcCase.caseE!.type).equal("LitE");
    expect(swcCase.stmts!.length).equal(2);
    swcCase = swcStmt.cases[1];
    expect(swcCase.caseE!.type).equal("LitE");
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
    expect(isDeepFrozen(stmts)).equal(true);
    expect(stmts.length).equal(1);
    expect(stmts[0].type).equal("SwitchS");
    const swcStmt = stmts[0] as SwitchStatement;
    expect(swcStmt.cases.length).equal(3);
    let swcCase = swcStmt.cases[0];
    expect(swcCase.caseE).equal(undefined);
    expect(swcCase.stmts!.length).equal(0);
    swcCase = swcStmt.cases[1];
    expect(swcCase.caseE!.type).equal("LitE");
    expect(swcCase.stmts!.length).equal(2);
    swcCase = swcStmt.cases[2];
    expect(swcCase.caseE!.type).equal("LitE");
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
    expect(isDeepFrozen(stmts)).equal(true);
    expect(stmts.length).equal(1);
    expect(stmts[0].type).equal("SwitchS");
    const swcStmt = stmts[0] as SwitchStatement;
    expect(swcStmt.cases.length).equal(3);
    let swcCase = swcStmt.cases[0];
    expect(swcCase.caseE!.type).equal("LitE");
    expect(swcCase.stmts!.length).equal(2);
    swcCase = swcStmt.cases![1];
    expect(swcCase.caseE).equal(undefined);
    expect(swcCase.stmts!.length).equal(0);
    swcCase = swcStmt.cases![2];
    expect(swcCase.caseE!.type).equal("LitE");
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
    expect(isDeepFrozen(stmts)).equal(true);
    expect(stmts.length).equal(1);
    expect(stmts[0].type).equal("SwitchS");
    const swcStmt = stmts[0] as SwitchStatement;
    expect(swcStmt.cases.length).equal(3);
    let swcCase = swcStmt.cases[0];
    expect(swcCase.caseE!.type).equal("LitE");
    expect(swcCase.stmts!.length).equal(2);
    swcCase = swcStmt.cases[1];
    expect(swcCase.caseE!.type).equal("LitE");
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
    expect(isDeepFrozen(stmts)).equal(true);
    expect(stmts.length).equal(1);
    expect(stmts[0].type).equal("SwitchS");
    const swcStmt = stmts[0] as SwitchStatement;
    expect(swcStmt.cases.length).equal(3);
    let swcCase = swcStmt.cases[0];
    expect(swcCase.caseE!.type).equal("LitE");
    expect(swcCase.stmts!.length).equal(2);
    swcCase = swcStmt.cases[1];
    expect(swcCase.caseE!.type).equal("LitE");
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
    expect(isDeepFrozen(stmts)).equal(true);
    expect(stmts.length).equal(1);
    expect(stmts[0].type).equal("SwitchS");
    const swcStmt = stmts[0] as SwitchStatement;
    expect(swcStmt.cases.length).equal(3);
    let swcCase = swcStmt.cases[0];
    expect(swcCase.caseE!.type).equal("LitE");
    expect(swcCase.stmts!.length).equal(2);
    swcCase = swcStmt.cases[1];
    expect(swcCase.caseE!.type).equal("LitE");
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
    expect(isDeepFrozen(stmts)).equal(true);
    expect(stmts.length).equal(1);
    expect(stmts[0].type).equal("ForInS");
    const forStmt = stmts[0] as ForInStatement;
    expect(forStmt.varB).equal("none");
    expect(forStmt.id.name).equal("myVar");
    expect(forStmt.expr.type).equal("IdE");
    expect(forStmt.body.type).equal("EmptyS");
  });

  it("for..in loop - 'let' binding, no body", () => {
    // --- Arrange
    const wParser = new Parser("for (let myVar in collection);");

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert
    expect(isDeepFrozen(stmts)).equal(true);
    expect(stmts.length).equal(1);
    expect(stmts[0].type).equal("ForInS");
    const forStmt = stmts[0] as ForInStatement;
    expect(forStmt.varB).equal("let");
    expect(forStmt.id.name).equal("myVar");
    expect(forStmt.expr.type).equal("IdE");
    expect(forStmt.body.type).equal("EmptyS");
  });

  it("for..in loop - 'const' binding, no body", () => {
    // --- Arrange
    const wParser = new Parser("for (const myVar in collection);");

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert
    expect(isDeepFrozen(stmts)).equal(true);
    expect(stmts.length).equal(1);
    expect(stmts[0].type).equal("ForInS");
    const forStmt = stmts[0] as ForInStatement;
    expect(forStmt.varB).equal("const");
    expect(forStmt.id.name).equal("myVar");
    expect(forStmt.expr.type).equal("IdE");
    expect(forStmt.body.type).equal("EmptyS");
  });

  it("for..in loop - no var binding, body", () => {
    // --- Arrange
    const wParser = new Parser("for (myVar in collection) { console.log(myVar); }");

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert
    expect(isDeepFrozen(stmts)).equal(true);
    expect(stmts.length).equal(1);
    expect(stmts[0].type).equal("ForInS");
    const forStmt = stmts[0] as ForInStatement;
    expect(forStmt.varB).equal("none");
    expect(forStmt.id.name).equal("myVar");
    expect(forStmt.expr.type).equal("IdE");
    expect(forStmt.body.type).equal("BlockS");
  });

  it("for..in loop - 'let' binding, body", () => {
    // --- Arrange
    const wParser = new Parser("for (let myVar in collection) { console.log(myVar); }");

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert
    expect(isDeepFrozen(stmts)).equal(true);
    expect(stmts.length).equal(1);
    expect(stmts[0].type).equal("ForInS");
    const forStmt = stmts[0] as ForInStatement;
    expect(forStmt.varB).equal("let");
    expect(forStmt.id.name).equal("myVar");
    expect(forStmt.expr.type).equal("IdE");
    expect(forStmt.body.type).equal("BlockS");
  });

  it("for..in loop - 'const' binding, body", () => {
    // --- Arrange
    const wParser = new Parser("for (const myVar in collection) { console.log(myVar); }");

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert
    expect(isDeepFrozen(stmts)).equal(true);
    expect(stmts.length).equal(1);
    expect(stmts[0].type).equal("ForInS");
    const forStmt = stmts[0] as ForInStatement;
    expect(forStmt.varB).equal("const");
    expect(forStmt.id.name).equal("myVar");
    expect(forStmt.expr.type).equal("IdE");
    expect(forStmt.body.type).equal("BlockS");
  });

  it("for..of loop - no var binding, no body", () => {
    // --- Arrange
    const wParser = new Parser("for (myVar of collection);");

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert
    expect(isDeepFrozen(stmts)).equal(true);
    expect(stmts.length).equal(1);
    expect(stmts[0].type).equal("ForOfS");
    const forStmt = stmts[0] as ForOfStatement;
    expect(forStmt.varB).equal("none");
    expect(forStmt.id.name).equal("myVar");
    expect(forStmt.expr.type).equal("IdE");
    expect(forStmt.body.type).equal("EmptyS");
  });

  it("for..of loop - 'let' binding, no body", () => {
    // --- Arrange
    const wParser = new Parser("for (let myVar of collection);");

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert
    expect(isDeepFrozen(stmts)).equal(true);
    expect(stmts.length).equal(1);
    expect(stmts[0].type).equal("ForOfS");
    const forStmt = stmts[0] as ForOfStatement;
    expect(forStmt.varB).equal("let");
    expect(forStmt.id.name).equal("myVar");
    expect(forStmt.expr.type).equal("IdE");
    expect(forStmt.body.type).equal("EmptyS");
  });

  it("for..of loop - 'const' binding, no body", () => {
    // --- Arrange
    const wParser = new Parser("for (const myVar of collection);");

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert
    expect(isDeepFrozen(stmts)).equal(true);
    expect(stmts.length).equal(1);
    expect(stmts[0].type).equal("ForOfS");
    const forStmt = stmts[0] as ForOfStatement;
    expect(forStmt.varB).equal("const");
    expect(forStmt.id.name).equal("myVar");
    expect(forStmt.expr.type).equal("IdE");
    expect(forStmt.body.type).equal("EmptyS");
  });

  it("for..of loop - no var binding, body", () => {
    // --- Arrange
    const wParser = new Parser("for (myVar of collection) { console.log(myVar); }");

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert
    expect(isDeepFrozen(stmts)).equal(true);
    expect(stmts.length).equal(1);
    expect(stmts[0].type).equal("ForOfS");
    const forStmt = stmts[0] as ForOfStatement;
    expect(forStmt.varB).equal("none");
    expect(forStmt.id.name).equal("myVar");
    expect(forStmt.expr.type).equal("IdE");
    expect(forStmt.body.type).equal("BlockS");
  });

  it("for..of loop - 'let' binding, body", () => {
    // --- Arrange
    const wParser = new Parser("for (let myVar of collection) { console.log(myVar); }");

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert
    expect(isDeepFrozen(stmts)).equal(true);
    expect(stmts.length).equal(1);
    expect(stmts[0].type).equal("ForOfS");
    const forStmt = stmts[0] as ForOfStatement;
    expect(forStmt.varB).equal("let");
    expect(forStmt.id.name).equal("myVar");
    expect(forStmt.expr.type).equal("IdE");
    expect(forStmt.body.type).equal("BlockS");
  });

  it("for..of loop - 'const' binding, body", () => {
    // --- Arrange
    const wParser = new Parser("for (const myVar of collection) { console.log(myVar); }");

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert
    expect(isDeepFrozen(stmts)).equal(true);
    expect(stmts.length).equal(1);
    expect(stmts[0].type).equal("ForOfS");
    const forStmt = stmts[0] as ForOfStatement;
    expect(forStmt.varB).equal("const");
    expect(forStmt.id.name).equal("myVar");
    expect(forStmt.expr.type).equal("IdE");
    expect(forStmt.body.type).equal("BlockS");
  });
});

function isDeepFrozen(obj: any): any {
  return (
    Object.isFrozen(obj) &&
    (obj === null ||
      obj === undefined ||
      Object.keys(obj).every((prop) => typeof obj[prop] !== "object" || isDeepFrozen(obj[prop])))
  );
}
