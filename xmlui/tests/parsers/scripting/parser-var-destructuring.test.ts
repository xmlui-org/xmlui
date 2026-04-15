import { describe, expect, it, assert } from "vitest";
import { Parser } from "../../../src/parsers/scripting/Parser";
import type {
  VarStatement,
  MemberAccessExpression,
  CalculatedMemberAccessExpression,
  Identifier,
  Literal,
  Expression,
} from "../../../src/components-core/script-runner/ScriptingSourceTree";
import {
  T_VAR_STATEMENT,
  T_REACTIVE_VAR_DECLARATION,
  T_IDENTIFIER,
  T_MEMBER_ACCESS_EXPRESSION,
  T_CALCULATED_MEMBER_ACCESS_EXPRESSION,
  T_LITERAL,
} from "../../../src/components-core/script-runner/ScriptingSourceTree";
import {
  collectCodeBehindFromSource,
  collectCodeBehindFromSourceWithImports,
  PARSED_MARK_PROP,
} from "../../../src/parsers/scripting/code-behind-collect";

describe("Parser - var destructuring", () => {
  // =========================================================================
  // Object destructuring
  // =========================================================================

  it("var, object, single ID", () => {
    const wParser = new Parser("var {a} = expr;");
    const stmts = wParser.parseStatements()!;

    expect(stmts.length).equal(1);
    const vs = stmts[0] as VarStatement;
    expect(vs.type).equal(T_VAR_STATEMENT);
    // Should expand to: var __destr_1 = expr; var a = __destr_1.a;
    expect(vs.decls.length).equal(2);

    // First decl: temp variable
    const tempDecl = vs.decls[0];
    expect(tempDecl.type).equal(T_REACTIVE_VAR_DECLARATION);
    expect(tempDecl.id.name).toMatch(/^__destr_\d+$/);

    // Second decl: a = __destr_N.a
    const aDecl = vs.decls[1];
    expect(aDecl.type).equal(T_REACTIVE_VAR_DECLARATION);
    expect(aDecl.id.name).equal("a");
    const aExpr = aDecl.expr as MemberAccessExpression;
    expect(aExpr.type).equal(T_MEMBER_ACCESS_EXPRESSION);
    expect(aExpr.member).equal("a");
    expect((aExpr.obj as Identifier).name).equal(tempDecl.id.name);
  });

  it("var, object, multiple IDs", () => {
    const wParser = new Parser("var {a, b} = expr;");
    const stmts = wParser.parseStatements()!;

    expect(stmts.length).equal(1);
    const vs = stmts[0] as VarStatement;
    // Should expand to: var __destr_N = expr; var a = __destr_N.a; var b = __destr_N.b;
    expect(vs.decls.length).equal(3);

    const tempName = vs.decls[0].id.name;
    expect(tempName).toMatch(/^__destr_\d+$/);

    expect(vs.decls[1].id.name).equal("a");
    const aExpr = vs.decls[1].expr as MemberAccessExpression;
    expect(aExpr.type).equal(T_MEMBER_ACCESS_EXPRESSION);
    expect(aExpr.member).equal("a");
    expect((aExpr.obj as Identifier).name).equal(tempName);

    expect(vs.decls[2].id.name).equal("b");
    const bExpr = vs.decls[2].expr as MemberAccessExpression;
    expect(bExpr.type).equal(T_MEMBER_ACCESS_EXPRESSION);
    expect(bExpr.member).equal("b");
    expect((bExpr.obj as Identifier).name).equal(tempName);
  });

  it("var, object, multiple IDs with trailing comma", () => {
    const wParser = new Parser("var {a, b, } = expr;");
    const stmts = wParser.parseStatements()!;

    const vs = stmts[0] as VarStatement;
    // temp + a + b = 3 decls
    expect(vs.decls.length).equal(3);
    expect(vs.decls[1].id.name).equal("a");
    expect(vs.decls[2].id.name).equal("b");
  });

  it("var, object, aliased ID", () => {
    const wParser = new Parser("var {a: aAlias} = expr;");
    const stmts = wParser.parseStatements()!;

    const vs = stmts[0] as VarStatement;
    // temp + aAlias
    expect(vs.decls.length).equal(2);

    const tempName = vs.decls[0].id.name;
    expect(vs.decls[1].id.name).equal("aAlias");
    const expr = vs.decls[1].expr as MemberAccessExpression;
    expect(expr.member).equal("a");
    expect((expr.obj as Identifier).name).equal(tempName);
  });

  it("var, object, multiple aliased IDs", () => {
    const wParser = new Parser("var {a: aA, b: bB} = expr;");
    const stmts = wParser.parseStatements()!;

    const vs = stmts[0] as VarStatement;
    // temp + aA + bB
    expect(vs.decls.length).equal(3);

    const tempName = vs.decls[0].id.name;
    expect(vs.decls[1].id.name).equal("aA");
    expect((vs.decls[1].expr as MemberAccessExpression).member).equal("a");

    expect(vs.decls[2].id.name).equal("bB");
    expect((vs.decls[2].expr as MemberAccessExpression).member).equal("b");
  });

  it("var, object, nested object destructure", () => {
    const wParser = new Parser("var {a: {b, c}} = expr;");
    const stmts = wParser.parseStatements()!;

    const vs = stmts[0] as VarStatement;
    // temp1 = expr; temp2 = temp1.a; b = temp2.b; c = temp2.c;
    expect(vs.decls.length).equal(4);

    const temp1 = vs.decls[0].id.name;
    expect(temp1).toMatch(/^__destr_\d+$/);

    const temp2 = vs.decls[1].id.name;
    expect(temp2).toMatch(/^__destr_\d+$/);
    expect(temp2).not.equal(temp1);

    // temp2 = temp1.a
    const temp2Expr = vs.decls[1].expr as MemberAccessExpression;
    expect(temp2Expr.member).equal("a");
    expect((temp2Expr.obj as Identifier).name).equal(temp1);

    // b = temp2.b
    expect(vs.decls[2].id.name).equal("b");
    expect((vs.decls[2].expr as MemberAccessExpression).member).equal("b");
    expect(((vs.decls[2].expr as MemberAccessExpression).obj as Identifier).name).equal(temp2);

    // c = temp2.c
    expect(vs.decls[3].id.name).equal("c");
    expect((vs.decls[3].expr as MemberAccessExpression).member).equal("c");
  });

  it("var, object, empty destructure", () => {
    const wParser = new Parser("var {} = expr;");
    const stmts = wParser.parseStatements()!;

    const vs = stmts[0] as VarStatement;
    // Just the temp variable, no extracted properties
    expect(vs.decls.length).equal(1);
    expect(vs.decls[0].id.name).toMatch(/^__destr_\d+$/);
  });

  // =========================================================================
  // Array destructuring
  // =========================================================================

  it("var, array, single ID", () => {
    const wParser = new Parser("var [a] = expr;");
    const stmts = wParser.parseStatements()!;

    const vs = stmts[0] as VarStatement;
    // temp + a
    expect(vs.decls.length).equal(2);

    const tempName = vs.decls[0].id.name;
    expect(tempName).toMatch(/^__destr_\d+$/);

    expect(vs.decls[1].id.name).equal("a");
    const aExpr = vs.decls[1].expr as CalculatedMemberAccessExpression;
    expect(aExpr.type).equal(T_CALCULATED_MEMBER_ACCESS_EXPRESSION);
    expect((aExpr.obj as Identifier).name).equal(tempName);
    expect((aExpr.member as Literal).value).equal(0);
  });

  it("var, array, multiple IDs", () => {
    const wParser = new Parser("var [a, b] = expr;");
    const stmts = wParser.parseStatements()!;

    const vs = stmts[0] as VarStatement;
    expect(vs.decls.length).equal(3);

    const tempName = vs.decls[0].id.name;

    expect(vs.decls[1].id.name).equal("a");
    expect(((vs.decls[1].expr as CalculatedMemberAccessExpression).member as Literal).value).equal(0);

    expect(vs.decls[2].id.name).equal("b");
    expect(((vs.decls[2].expr as CalculatedMemberAccessExpression).member as Literal).value).equal(1);
  });

  it("var, array, skipped elements (holes)", () => {
    const wParser = new Parser("var [a, , c] = expr;");
    const stmts = wParser.parseStatements()!;

    const vs = stmts[0] as VarStatement;
    // temp + a + c (hole skipped)
    expect(vs.decls.length).equal(3);

    const tempName = vs.decls[0].id.name;

    expect(vs.decls[1].id.name).equal("a");
    expect(((vs.decls[1].expr as CalculatedMemberAccessExpression).member as Literal).value).equal(0);

    expect(vs.decls[2].id.name).equal("c");
    expect(((vs.decls[2].expr as CalculatedMemberAccessExpression).member as Literal).value).equal(2);
  });

  it("var, array, nested array", () => {
    const wParser = new Parser("var [a, [b, c]] = expr;");
    const stmts = wParser.parseStatements()!;

    const vs = stmts[0] as VarStatement;
    // temp1 = expr; a = temp1[0]; temp2 = temp1[1]; b = temp2[0]; c = temp2[1];
    expect(vs.decls.length).equal(5);

    const temp1 = vs.decls[0].id.name;
    expect(vs.decls[1].id.name).equal("a");

    const temp2 = vs.decls[2].id.name;
    expect(temp2).toMatch(/^__destr_\d+$/);
    // temp2 = temp1[1]
    const temp2Expr = vs.decls[2].expr as CalculatedMemberAccessExpression;
    expect((temp2Expr.obj as Identifier).name).equal(temp1);
    expect((temp2Expr.member as Literal).value).equal(1);

    // b = temp2[0]
    expect(vs.decls[3].id.name).equal("b");
    expect(((vs.decls[3].expr as CalculatedMemberAccessExpression).obj as Identifier).name).equal(temp2);
    expect(((vs.decls[3].expr as CalculatedMemberAccessExpression).member as Literal).value).equal(0);

    // c = temp2[1]
    expect(vs.decls[4].id.name).equal("c");
    expect(((vs.decls[4].expr as CalculatedMemberAccessExpression).member as Literal).value).equal(1);
  });

  it("var, array, nested object in array", () => {
    const wParser = new Parser("var [a, {b, c}] = expr;");
    const stmts = wParser.parseStatements()!;

    const vs = stmts[0] as VarStatement;
    // temp1 = expr; a = temp1[0]; temp2 = temp1[1]; b = temp2.b; c = temp2.c;
    expect(vs.decls.length).equal(5);

    expect(vs.decls[1].id.name).equal("a");

    const temp2 = vs.decls[2].id.name;
    expect(temp2).toMatch(/^__destr_\d+$/);

    expect(vs.decls[3].id.name).equal("b");
    expect((vs.decls[3].expr as MemberAccessExpression).type).equal(T_MEMBER_ACCESS_EXPRESSION);
    expect((vs.decls[3].expr as MemberAccessExpression).member).equal("b");

    expect(vs.decls[4].id.name).equal("c");
    expect((vs.decls[4].expr as MemberAccessExpression).member).equal("c");
  });

  it("var, array, empty", () => {
    const wParser = new Parser("var [] = expr;");
    const stmts = wParser.parseStatements()!;

    const vs = stmts[0] as VarStatement;
    // Just the temp variable
    expect(vs.decls.length).equal(1);
    expect(vs.decls[0].id.name).toMatch(/^__destr_\d+$/);
  });

  // =========================================================================
  // Errors
  // =========================================================================

  it("var, object fails without initialization", () => {
    const wParser = new Parser("var {a, b}");

    expect(() => wParser.parseStatements()).toThrow();
  });

  it("var, array fails without initialization", () => {
    const wParser = new Parser("var [a, b]");

    expect(() => wParser.parseStatements()).toThrow();
  });

  // =========================================================================
  // Mixed with simple var declarations
  // =========================================================================

  it("var, simple identifier still works", () => {
    const wParser = new Parser("var x = 42;");
    const stmts = wParser.parseStatements()!;

    const vs = stmts[0] as VarStatement;
    expect(vs.decls.length).equal(1);
    expect(vs.decls[0].id.name).equal("x");
  });

  it("var, multiple simple identifiers still work", () => {
    const wParser = new Parser("var x = 1, y = 2;");
    const stmts = wParser.parseStatements()!;

    const vs = stmts[0] as VarStatement;
    expect(vs.decls.length).equal(2);
    expect(vs.decls[0].id.name).equal("x");
    expect(vs.decls[1].id.name).equal("y");
  });

  // =========================================================================
  // Reactivity verification — all decls are ReactiveVarDeclaration
  // =========================================================================

  it("object destructuring: all expanded decls are ReactiveVarDeclaration", () => {
    const wParser = new Parser("var {a, b, c} = source;");
    const stmts = wParser.parseStatements()!;
    const vs = stmts[0] as VarStatement;

    // temp + a + b + c = 4 decls, all reactive
    expect(vs.decls.length).equal(4);
    for (const decl of vs.decls) {
      expect(decl.type).equal(T_REACTIVE_VAR_DECLARATION);
    }
  });

  it("object destructuring with alias: all expanded decls are ReactiveVarDeclaration", () => {
    const wParser = new Parser("var {x: xAlias, y: yAlias} = source;");
    const stmts = wParser.parseStatements()!;
    const vs = stmts[0] as VarStatement;

    expect(vs.decls.length).equal(3);
    for (const decl of vs.decls) {
      expect(decl.type).equal(T_REACTIVE_VAR_DECLARATION);
    }
    expect(vs.decls[1].id.name).equal("xAlias");
    expect(vs.decls[2].id.name).equal("yAlias");
  });

  it("array destructuring: all expanded decls are ReactiveVarDeclaration", () => {
    const wParser = new Parser("var [a, b, c] = source;");
    const stmts = wParser.parseStatements()!;
    const vs = stmts[0] as VarStatement;

    expect(vs.decls.length).equal(4);
    for (const decl of vs.decls) {
      expect(decl.type).equal(T_REACTIVE_VAR_DECLARATION);
    }
  });

  it("array destructuring with holes: all expanded decls are ReactiveVarDeclaration", () => {
    const wParser = new Parser("var [a, , , d] = source;");
    const stmts = wParser.parseStatements()!;
    const vs = stmts[0] as VarStatement;

    // temp + a + d = 3 (holes skipped)
    expect(vs.decls.length).equal(3);
    for (const decl of vs.decls) {
      expect(decl.type).equal(T_REACTIVE_VAR_DECLARATION);
    }
    expect(vs.decls[1].id.name).equal("a");
    expect(vs.decls[2].id.name).equal("d");
  });

  it("nested object destructuring: all expanded decls are ReactiveVarDeclaration", () => {
    const wParser = new Parser("var {outer: {inner1, inner2}} = source;");
    const stmts = wParser.parseStatements()!;
    const vs = stmts[0] as VarStatement;

    // temp1 + temp2 + inner1 + inner2 = 4
    expect(vs.decls.length).equal(4);
    for (const decl of vs.decls) {
      expect(decl.type).equal(T_REACTIVE_VAR_DECLARATION);
    }
  });

  it("nested array destructuring: all expanded decls are ReactiveVarDeclaration", () => {
    const wParser = new Parser("var [[a, b], [c, d]] = source;");
    const stmts = wParser.parseStatements()!;
    const vs = stmts[0] as VarStatement;

    // temp1 + temp2 + a + b + temp3 + c + d = 7
    expect(vs.decls.length).equal(7);
    for (const decl of vs.decls) {
      expect(decl.type).equal(T_REACTIVE_VAR_DECLARATION);
    }
  });

  it("mixed nested destructuring: all expanded decls are ReactiveVarDeclaration", () => {
    const wParser = new Parser("var [first, {name, age}] = source;");
    const stmts = wParser.parseStatements()!;
    const vs = stmts[0] as VarStatement;

    // temp1 + first + temp2 + name + age = 5
    expect(vs.decls.length).equal(5);
    for (const decl of vs.decls) {
      expect(decl.type).equal(T_REACTIVE_VAR_DECLARATION);
    }
  });

  it("object destructuring: extracted vars reference the temp variable (reactive chain)", () => {
    const wParser = new Parser("var {x, y} = computePosition();");
    const stmts = wParser.parseStatements()!;
    const vs = stmts[0] as VarStatement;

    const tempName = vs.decls[0].id.name;

    // x = temp.x — obj reference points to temp
    const xExpr = vs.decls[1].expr as MemberAccessExpression;
    expect(xExpr.type).equal(T_MEMBER_ACCESS_EXPRESSION);
    expect((xExpr.obj as Identifier).type).equal(T_IDENTIFIER);
    expect((xExpr.obj as Identifier).name).equal(tempName);
    expect(xExpr.member).equal("x");

    // y = temp.y — obj reference points to temp
    const yExpr = vs.decls[2].expr as MemberAccessExpression;
    expect((yExpr.obj as Identifier).name).equal(tempName);
    expect(yExpr.member).equal("y");
  });

  it("array destructuring: extracted vars reference the temp variable (reactive chain)", () => {
    const wParser = new Parser("var [a, b] = getItems();");
    const stmts = wParser.parseStatements()!;
    const vs = stmts[0] as VarStatement;

    const tempName = vs.decls[0].id.name;

    // a = temp[0]
    const aExpr = vs.decls[1].expr as CalculatedMemberAccessExpression;
    expect(aExpr.type).equal(T_CALCULATED_MEMBER_ACCESS_EXPRESSION);
    expect((aExpr.obj as Identifier).name).equal(tempName);
    expect((aExpr.member as Literal).value).equal(0);

    // b = temp[1]
    const bExpr = vs.decls[2].expr as CalculatedMemberAccessExpression;
    expect((bExpr.obj as Identifier).name).equal(tempName);
    expect((bExpr.member as Literal).value).equal(1);
  });

  it("nested object: inner vars reference inner temp (nested reactive chain)", () => {
    const wParser = new Parser("var {user: {name, email}} = getData();");
    const stmts = wParser.parseStatements()!;
    const vs = stmts[0] as VarStatement;

    const outerTemp = vs.decls[0].id.name;
    const innerTemp = vs.decls[1].id.name;

    // innerTemp = outerTemp.user
    const innerExpr = vs.decls[1].expr as MemberAccessExpression;
    expect((innerExpr.obj as Identifier).name).equal(outerTemp);
    expect(innerExpr.member).equal("user");

    // name = innerTemp.name
    const nameExpr = vs.decls[2].expr as MemberAccessExpression;
    expect((nameExpr.obj as Identifier).name).equal(innerTemp);
    expect(nameExpr.member).equal("name");

    // email = innerTemp.email
    const emailExpr = vs.decls[3].expr as MemberAccessExpression;
    expect((emailExpr.obj as Identifier).name).equal(innerTemp);
    expect(emailExpr.member).equal("email");
  });

  // =========================================================================
  // Multiple destructuring declarations within a single script
  // =========================================================================

  it("multiple object destructuring statements in one script", () => {
    const wParser = new Parser(`
      var {a, b} = source1;
      var {c, d} = source2;
    `);
    const stmts = wParser.parseStatements()!;

    expect(stmts.length).equal(2);
    const vs1 = stmts[0] as VarStatement;
    const vs2 = stmts[1] as VarStatement;

    // First statement: temp1 + a + b
    expect(vs1.decls.length).equal(3);
    expect(vs1.decls[0].id.name).toMatch(/^__destr_\d+$/);
    expect(vs1.decls[1].id.name).equal("a");
    expect(vs1.decls[2].id.name).equal("b");

    // Second statement: temp2 + c + d
    expect(vs2.decls.length).equal(3);
    expect(vs2.decls[0].id.name).toMatch(/^__destr_\d+$/);
    expect(vs2.decls[1].id.name).equal("c");
    expect(vs2.decls[2].id.name).equal("d");

    // Temp names must be different
    expect(vs1.decls[0].id.name).not.equal(vs2.decls[0].id.name);
  });

  it("multiple array destructuring statements in one script", () => {
    const wParser = new Parser(`
      var [x, y] = coords;
      var [r, g, b] = colors;
    `);
    const stmts = wParser.parseStatements()!;

    expect(stmts.length).equal(2);
    const vs1 = stmts[0] as VarStatement;
    const vs2 = stmts[1] as VarStatement;

    expect(vs1.decls.length).equal(3);
    expect(vs1.decls[1].id.name).equal("x");
    expect(vs1.decls[2].id.name).equal("y");

    expect(vs2.decls.length).equal(4);
    expect(vs2.decls[1].id.name).equal("r");
    expect(vs2.decls[2].id.name).equal("g");
    expect(vs2.decls[3].id.name).equal("b");

    expect(vs1.decls[0].id.name).not.equal(vs2.decls[0].id.name);
  });

  it("mixed destructuring and simple var statements in one script", () => {
    const wParser = new Parser(`
      var count = 0;
      var {name, age} = person;
      var label = "hello";
      var [first, second] = items;
    `);
    const stmts = wParser.parseStatements()!;

    expect(stmts.length).equal(4);

    // Simple var
    const vs1 = stmts[0] as VarStatement;
    expect(vs1.decls.length).equal(1);
    expect(vs1.decls[0].id.name).equal("count");

    // Object destructuring
    const vs2 = stmts[1] as VarStatement;
    expect(vs2.decls.length).equal(3);
    expect(vs2.decls[1].id.name).equal("name");
    expect(vs2.decls[2].id.name).equal("age");

    // Simple var
    const vs3 = stmts[2] as VarStatement;
    expect(vs3.decls.length).equal(1);
    expect(vs3.decls[0].id.name).equal("label");

    // Array destructuring
    const vs4 = stmts[3] as VarStatement;
    expect(vs4.decls.length).equal(3);
    expect(vs4.decls[1].id.name).equal("first");
    expect(vs4.decls[2].id.name).equal("second");
  });

  it("destructuring mixed with function declarations in a script", () => {
    const wParser = new Parser(`
      var {x, y} = getCoords();
      function double(n) { return n * 2; }
      var [a, b] = getItems();
    `);
    const stmts = wParser.parseStatements()!;

    expect(stmts.length).equal(3);
    expect((stmts[0] as VarStatement).decls[1].id.name).equal("x");
    expect((stmts[0] as VarStatement).decls[2].id.name).equal("y");
    expect(stmts[1].type).not.equal(T_VAR_STATEMENT); // function declaration
    expect((stmts[2] as VarStatement).decls[1].id.name).equal("a");
    expect((stmts[2] as VarStatement).decls[2].id.name).equal("b");
  });

  it("multiple destructurings: all decls across statements are reactive", () => {
    const wParser = new Parser(`
      var {a} = s1;
      var [b] = s2;
      var {c: cAlias} = s3;
    `);
    const stmts = wParser.parseStatements()!;

    for (const stmt of stmts) {
      const vs = stmt as VarStatement;
      for (const decl of vs.decls) {
        expect(decl.type).equal(T_REACTIVE_VAR_DECLARATION);
      }
    }
  });

  // =========================================================================
  // Code-behind collector integration
  // =========================================================================

  it("var object destructuring works with collectCodeBehindFromSource", () => {
    const source = `var {validEmails, emails} = extractEmails(input);`;
    const result = collectCodeBehindFromSource("test", source);

    expect(result.hasInvalidStatements).equal(false);
    // Should have __destr_N, validEmails, and emails
    expect("validEmails" in result.vars).equal(true);
    expect("emails" in result.vars).equal(true);
    // Temp variable should also be in vars
    const tempVarName = Object.keys(result.vars).find((k) => k.startsWith("__destr_"));
    expect(tempVarName).not.equal(undefined);
  });

  it("var array destructuring works with collectCodeBehindFromSource", () => {
    const source = `var [first, second] = getItems();`;
    const result = collectCodeBehindFromSource("test", source);

    expect(result.hasInvalidStatements).equal(false);
    expect("first" in result.vars).equal(true);
    expect("second" in result.vars).equal(true);
  });

  it("code-behind: object destructured vars are marked as parsed (reactive)", () => {
    const source = `var {name, age} = getPerson();`;
    const result = collectCodeBehindFromSource("test-reactive", source);

    // Each collected var must have PARSED_MARK_PROP to be treated reactively
    expect(result.vars.name[PARSED_MARK_PROP]).equal(true);
    expect(result.vars.age[PARSED_MARK_PROP]).equal(true);

    // The temp variable is also marked as parsed
    const tempKey = Object.keys(result.vars).find((k) => k.startsWith("__destr_"))!;
    expect(result.vars[tempKey][PARSED_MARK_PROP]).equal(true);
  });

  it("code-behind: array destructured vars are marked as parsed (reactive)", () => {
    const source = `var [x, y, z] = getCoords();`;
    const result = collectCodeBehindFromSource("test-reactive", source);

    expect(result.vars.x[PARSED_MARK_PROP]).equal(true);
    expect(result.vars.y[PARSED_MARK_PROP]).equal(true);
    expect(result.vars.z[PARSED_MARK_PROP]).equal(true);
  });

  it("code-behind: aliased object destructured vars are marked as parsed (reactive)", () => {
    const source = `var {first: firstName, last: lastName} = getNames();`;
    const result = collectCodeBehindFromSource("test-reactive", source);

    expect(result.vars.firstName[PARSED_MARK_PROP]).equal(true);
    expect(result.vars.lastName[PARSED_MARK_PROP]).equal(true);
    // Original property names should NOT appear as vars
    expect("first" in result.vars).equal(false);
    expect("last" in result.vars).equal(false);
  });

  it("code-behind: destructured vars have expression trees (for dependency tracking)", () => {
    const source = `var {a, b} = source;`;
    const result = collectCodeBehindFromSource("test-tree", source);

    // The temp var's tree should be an identifier referencing "source"
    const tempKey = Object.keys(result.vars).find((k) => k.startsWith("__destr_"))!;
    expect(result.vars[tempKey].tree).not.equal(undefined);
    expect(result.vars[tempKey].tree.type).equal(T_IDENTIFIER);

    // a's tree is a MemberAccessExpression: __destr_N.a
    const aTree = result.vars.a.tree;
    expect(aTree.type).equal(T_MEMBER_ACCESS_EXPRESSION);
    expect((aTree as MemberAccessExpression).member).equal("a");
    expect(((aTree as MemberAccessExpression).obj as Identifier).name).equal(tempKey);

    // b's tree is a MemberAccessExpression: __destr_N.b
    const bTree = result.vars.b.tree;
    expect(bTree.type).equal(T_MEMBER_ACCESS_EXPRESSION);
    expect((bTree as MemberAccessExpression).member).equal("b");
  });

  it("code-behind: array destructured vars have indexed expression trees", () => {
    const source = `var [first, second] = items;`;
    const result = collectCodeBehindFromSource("test-tree", source);

    const tempKey = Object.keys(result.vars).find((k) => k.startsWith("__destr_"))!;
    expect(result.vars[tempKey].tree.type).equal(T_IDENTIFIER);

    // first's tree is __destr_N[0]
    const firstTree = result.vars.first.tree;
    expect(firstTree.type).equal(T_CALCULATED_MEMBER_ACCESS_EXPRESSION);
    expect(((firstTree as CalculatedMemberAccessExpression).member as Literal).value).equal(0);

    // second's tree is __destr_N[1]
    const secondTree = result.vars.second.tree;
    expect(secondTree.type).equal(T_CALCULATED_MEMBER_ACCESS_EXPRESSION);
    expect(((secondTree as CalculatedMemberAccessExpression).member as Literal).value).equal(1);
  });

  it("code-behind: multiple destructuring statements produce independent vars", () => {
    const source = `
      var {a, b} = source1;
      var {c, d} = source2;
    `;
    const result = collectCodeBehindFromSource("test-multi", source);

    expect(result.hasInvalidStatements).equal(false);
    expect("a" in result.vars).equal(true);
    expect("b" in result.vars).equal(true);
    expect("c" in result.vars).equal(true);
    expect("d" in result.vars).equal(true);

    // Two temp variables
    const tempKeys = Object.keys(result.vars).filter((k) => k.startsWith("__destr_"));
    expect(tempKeys.length).equal(2);

    // All vars marked as parsed
    for (const key of Object.keys(result.vars)) {
      expect(result.vars[key][PARSED_MARK_PROP]).equal(true);
    }
  });

  it("code-behind: mixed simple vars and destructuring", () => {
    const source = `
      var count = 0;
      var {name, age} = person;
      var label = "test";
    `;
    const result = collectCodeBehindFromSource("test-mixed", source);

    expect(result.hasInvalidStatements).equal(false);
    expect("count" in result.vars).equal(true);
    expect("name" in result.vars).equal(true);
    expect("age" in result.vars).equal(true);
    expect("label" in result.vars).equal(true);

    // All should be marked as parsed
    expect(result.vars.count[PARSED_MARK_PROP]).equal(true);
    expect(result.vars.name[PARSED_MARK_PROP]).equal(true);
    expect(result.vars.age[PARSED_MARK_PROP]).equal(true);
    expect(result.vars.label[PARSED_MARK_PROP]).equal(true);
  });

  it("code-behind: destructuring with functions in same script", () => {
    const source = `
      var {x, y} = getCoords();
      function format(val) { return "(" + val + ")"; }
      var [a, b] = getItems();
    `;
    const result = collectCodeBehindFromSource("test-with-fn", source);

    expect(result.hasInvalidStatements).equal(false);
    expect("x" in result.vars).equal(true);
    expect("y" in result.vars).equal(true);
    expect("a" in result.vars).equal(true);
    expect("b" in result.vars).equal(true);
    expect("format" in result.functions).equal(true);
  });

  it("code-behind: duplicate var from destructuring fails", () => {
    const source = `
      var {a, b} = source1;
      var {a, c} = source2;
    `;

    expect(() => collectCodeBehindFromSource("test-dup", source)).toThrow(/Duplicated/);
  });

  it("code-behind: nested object destructuring vars are all marked parsed", () => {
    const source = `var {user: {name, email}} = getData();`;
    const result = collectCodeBehindFromSource("test-nested", source);

    expect(result.hasInvalidStatements).equal(false);
    expect("name" in result.vars).equal(true);
    expect("email" in result.vars).equal(true);
    expect(result.vars.name[PARSED_MARK_PROP]).equal(true);
    expect(result.vars.email[PARSED_MARK_PROP]).equal(true);
    // "user" should NOT appear — it's a nesting path, not a variable
    expect("user" in result.vars).equal(false);
  });

  it("code-behind: array with holes, only non-hole vars collected", () => {
    const source = `var [a, , , d] = items;`;
    const result = collectCodeBehindFromSource("test-holes", source);

    expect("a" in result.vars).equal(true);
    expect("d" in result.vars).equal(true);
    expect(result.vars.a[PARSED_MARK_PROP]).equal(true);
    expect(result.vars.d[PARSED_MARK_PROP]).equal(true);

    // The only named vars should be temp + a + d
    const namedVars = Object.keys(result.vars).filter((k) => !k.startsWith("__destr_"));
    expect(namedVars.length).equal(2);
  });

  // =========================================================================
  // Code-behind with imports (async)
  // =========================================================================

  it("code-behind with imports: destructuring works", async () => {
    const modules: Record<string, string> = {
      "/helpers.xs": `function getConfig() { return {host: "localhost", port: 8080}; }`,
      "/main.xs": `
        import { getConfig } from './helpers.xs';
        var {host, port} = getConfig();
      `,
    };

    const fetcher = async (path: string) => {
      if (modules[path]) return modules[path];
      throw new Error(`Module not found: ${path}`);
    };

    const result = await collectCodeBehindFromSourceWithImports(
      "/main.xs",
      modules["/main.xs"],
      fetcher,
    );

    expect(result.hasInvalidStatements).equal(false);
    expect("host" in result.vars).equal(true);
    expect("port" in result.vars).equal(true);
    expect(result.vars.host[PARSED_MARK_PROP]).equal(true);
    expect(result.vars.port[PARSED_MARK_PROP]).equal(true);
    expect("getConfig" in result.functions).equal(true);
  });
});
