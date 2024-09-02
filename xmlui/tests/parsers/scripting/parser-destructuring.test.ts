import { describe, expect, it, assert } from "vitest";
import { Parser } from "@parsers/scripting/Parser";
import { ConstStatement, LetStatement } from "@abstractions/scripting/ScriptingSourceTree";

describe("Parser - destructuring", () => {
  it("let, object, empty", () => {
    // --- Arrange
    const wParser = new Parser("let {} = expr;");

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert
    expect(stmts.length).equal(1);
    const lst = stmts[0] as LetStatement;
    expect(lst.source).equal("let {} = expr");
    expect(lst.declarations.length).equal(1);
    const decl = lst.declarations[0];
    expect(decl.objectDestruct).not.equal(undefined);
    expect(decl.objectDestruct!.length).equal(0);
  });

  it("let, object, single ID", () => {
    // --- Arrange
    const wParser = new Parser("let {a} = expr;");

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert
    expect(stmts.length).equal(1);
    const lst = stmts[0] as LetStatement;
    expect(lst.source).equal("let {a} = expr");
    expect(lst.declarations.length).equal(1);
    const decl = lst.declarations[0];
    expect(decl.objectDestruct).not.equal(undefined);
    expect(decl.objectDestruct!.length).equal(1);
    const od = decl.objectDestruct![0];
    expect(od.id).equal("a");
    expect(od.alias).equal(undefined);
    expect(od.arrayDestruct).equal(undefined);
    expect(od.objectDestruct).equal(undefined);
  });

  it("let, object, multiple IDs #1", () => {
    // --- Arrange
    const wParser = new Parser("let {a, b} = expr;");

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert
    expect(stmts.length).equal(1);
    const lst = stmts[0] as LetStatement;
    expect(lst.source).equal("let {a, b} = expr");
    expect(lst.declarations.length).equal(1);
    const decl = lst.declarations[0];
    expect(decl.objectDestruct).not.equal(undefined);
    expect(decl.objectDestruct!.length).equal(2);
    let od = decl.objectDestruct![0];
    expect(od.id).equal("a");
    expect(od.alias).equal(undefined);
    expect(od.arrayDestruct).equal(undefined);
    expect(od.objectDestruct).equal(undefined);
    od = decl.objectDestruct![1];
    expect(od.id).equal("b");
    expect(od.alias).equal(undefined);
    expect(od.arrayDestruct).equal(undefined);
    expect(od.objectDestruct).equal(undefined);
  });

  it("let, object, multiple IDs #2", () => {
    // --- Arrange
    const wParser = new Parser("let {a, b, } = expr;");

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert
    expect(stmts.length).equal(1);
    const lst = stmts[0] as LetStatement;
    expect(lst.source).equal("let {a, b, } = expr");
    expect(lst.declarations.length).equal(1);
    const decl = lst.declarations[0];
    expect(decl.objectDestruct).not.equal(undefined);
    expect(decl.objectDestruct!.length).equal(2);
    let od = decl.objectDestruct![0];
    expect(od.id).equal("a");
    expect(od.alias).equal(undefined);
    expect(od.arrayDestruct).equal(undefined);
    expect(od.objectDestruct).equal(undefined);
    od = decl.objectDestruct![1];
    expect(od.id).equal("b");
    expect(od.alias).equal(undefined);
    expect(od.arrayDestruct).equal(undefined);
    expect(od.objectDestruct).equal(undefined);
  });

  it("let, object, single aliased ID", () => {
    // --- Arrange
    const wParser = new Parser("let {a: aA} = expr;");

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert
    expect(stmts.length).equal(1);
    const lst = stmts[0] as LetStatement;
    expect(lst.source).equal("let {a: aA} = expr");
    expect(lst.declarations.length).equal(1);
    const decl = lst.declarations[0];
    expect(decl.objectDestruct).not.equal(undefined);
    expect(decl.objectDestruct!.length).equal(1);
    const od = decl.objectDestruct![0];
    expect(od.id).equal("a");
    expect(od.alias).equal("aA");
    expect(od.arrayDestruct).equal(undefined);
    expect(od.objectDestruct).equal(undefined);
  });

  it("let, object, multiple aliased IDs #1", () => {
    // --- Arrange
    const wParser = new Parser("let {a: aA, b: bB} = expr;");

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert
    expect(stmts.length).equal(1);
    const lst = stmts[0] as LetStatement;
    expect(lst.declarations.length).equal(1);
    expect(lst.source).equal("let {a: aA, b: bB} = expr");
    const decl = lst.declarations[0];
    expect(decl.objectDestruct).not.equal(undefined);
    expect(decl.objectDestruct!.length).equal(2);
    let od = decl.objectDestruct![0];
    expect(od.id).equal("a");
    expect(od.alias).equal("aA");
    expect(od.arrayDestruct).equal(undefined);
    expect(od.objectDestruct).equal(undefined);
    od = decl.objectDestruct![1];
    expect(od.id).equal("b");
    expect(od.alias).equal("bB");
    expect(od.arrayDestruct).equal(undefined);
    expect(od.objectDestruct).equal(undefined);
  });

  it("let, object, multiple aliased IDs #2", () => {
    // --- Arrange
    const wParser = new Parser("let {a: aA, b: bB, } = expr;");

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert
    expect(stmts.length).equal(1);
    const lst = stmts[0] as LetStatement;
    expect(lst.source).equal("let {a: aA, b: bB, } = expr");
    expect(lst.declarations.length).equal(1);
    const decl = lst.declarations[0];
    expect(decl.objectDestruct).not.equal(undefined);
    expect(decl.objectDestruct!.length).equal(2);
    let od = decl.objectDestruct![0];
    expect(od.id).equal("a");
    expect(od.alias).equal("aA");
    expect(od.arrayDestruct).equal(undefined);
    expect(od.objectDestruct).equal(undefined);
    od = decl.objectDestruct![1];
    expect(od.id).equal("b");
    expect(od.alias).equal("bB");
    expect(od.arrayDestruct).equal(undefined);
    expect(od.objectDestruct).equal(undefined);
  });

  it("let, object, single nested object #1", () => {
    // --- Arrange
    const wParser = new Parser("let {a: {b}} = expr;");

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert
    expect(stmts.length).equal(1);
    const lst = stmts[0] as LetStatement;
    expect(lst.source).equal("let {a: {b}} = expr");
    expect(lst.declarations.length).equal(1);
    const decl = lst.declarations[0];
    expect(decl.objectDestruct).not.equal(undefined);
    expect(decl.objectDestruct!.length).equal(1);
    const od = decl.objectDestruct![0];
    expect(od.id).equal("a");
    expect(od.alias).equal(undefined);
    expect(od.arrayDestruct).equal(undefined);
    expect(od.objectDestruct!.length).equal(1);
    const nod = od.objectDestruct![0];
    expect(nod.id).equal("b");
    expect(nod.alias).equal(undefined);
    expect(nod.arrayDestruct).equal(undefined);
    expect(nod.objectDestruct).equal(undefined);
  });

  it("let, object, single nested object #2", () => {
    // --- Arrange
    const wParser = new Parser("let {a: {b, c: cC}} = expr;");

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert
    expect(stmts.length).equal(1);
    const lst = stmts[0] as LetStatement;
    expect(lst.source).equal("let {a: {b, c: cC}} = expr");
    expect(lst.declarations.length).equal(1);
    const decl = lst.declarations[0];
    expect(decl.objectDestruct).not.equal(undefined);
    expect(decl.objectDestruct!.length).equal(1);
    const od = decl.objectDestruct![0];
    expect(od.id).equal("a");
    expect(od.alias).equal(undefined);
    expect(od.arrayDestruct).equal(undefined);
    expect(od.objectDestruct!.length).equal(2);
    let nod = od.objectDestruct![0];
    expect(nod.id).equal("b");
    expect(nod.alias).equal(undefined);
    expect(nod.arrayDestruct).equal(undefined);
    expect(nod.objectDestruct).equal(undefined);
    nod = od.objectDestruct![1];
    expect(nod.id).equal("c");
    expect(nod.alias).equal("cC");
    expect(nod.arrayDestruct).equal(undefined);
    expect(nod.objectDestruct).equal(undefined);
  });

  it("let, array, empty #1", () => {
    // --- Arrange
    const wParser = new Parser("let [] = expr;");

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert
    expect(stmts.length).equal(1);
    const lst = stmts[0] as LetStatement;
    expect(lst.source).equal("let [] = expr");
    expect(lst.declarations.length).equal(1);
    const decl = lst.declarations[0];
    expect(decl.arrayDestruct).not.equal(undefined);
    expect(decl.arrayDestruct!.length).equal(0);
  });

  it("let, array, empty #2", () => {
    // --- Arrange
    const wParser = new Parser("let [,] = expr;");

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert
    expect(stmts.length).equal(1);
    const lst = stmts[0] as LetStatement;
    expect(lst.source).equal("let [,] = expr");
    expect(lst.declarations.length).equal(1);
    const decl = lst.declarations[0];
    expect(decl.arrayDestruct).not.equal(undefined);
    expect(decl.arrayDestruct!.length).equal(1);
    const ad = decl.arrayDestruct![0];
    expect(ad.id).equal(undefined);
    expect(ad.arrayDestruct).equal(undefined);
    expect(ad.objectDestruct).equal(undefined);
  });

  it("let, array, single ID", () => {
    // --- Arrange
    const wParser = new Parser("let [a] = expr;");

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert
    expect(stmts.length).equal(1);
    const lst = stmts[0] as LetStatement;
    expect(lst.source).equal("let [a] = expr");
    expect(lst.declarations.length).equal(1);
    const decl = lst.declarations[0];
    expect(decl.arrayDestruct).not.equal(undefined);
    expect(decl.arrayDestruct!.length).equal(1);
    const ad = decl.arrayDestruct![0];
    expect(ad.id).equal("a");
    expect(ad.arrayDestruct).equal(undefined);
    expect(ad.objectDestruct).equal(undefined);
  });

  it("let, array, multiple IDs #1", () => {
    // --- Arrange
    const wParser = new Parser("let [a, b] = expr;");

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert
    expect(stmts.length).equal(1);
    const lst = stmts[0] as LetStatement;
    expect(lst.source).equal("let [a, b] = expr");
    expect(lst.declarations.length).equal(1);
    const decl = lst.declarations[0];
    expect(decl.arrayDestruct).not.equal(undefined);
    expect(decl.arrayDestruct!.length).equal(2);
    let ad = decl.arrayDestruct![0];
    expect(ad.id).equal("a");
    expect(ad.arrayDestruct).equal(undefined);
    expect(ad.objectDestruct).equal(undefined);
    ad = decl.arrayDestruct![1];
    expect(ad.id).equal("b");
    expect(ad.arrayDestruct).equal(undefined);
    expect(ad.objectDestruct).equal(undefined);
  });

  it("let, array, multiple IDs #2", () => {
    // --- Arrange
    const wParser = new Parser("let [a, b,] = expr");

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert
    expect(stmts.length).equal(1);
    const lst = stmts[0] as LetStatement;
    expect(lst.source).equal("let [a, b,] = expr");
    expect(lst.declarations.length).equal(1);
    const decl = lst.declarations[0];
    expect(decl.arrayDestruct).not.equal(undefined);
    expect(decl.arrayDestruct!.length).equal(2);
    let ad = decl.arrayDestruct![0];
    expect(ad.id).equal("a");
    expect(ad.arrayDestruct).equal(undefined);
    expect(ad.objectDestruct).equal(undefined);
    ad = decl.arrayDestruct![1];
    expect(ad.id).equal("b");
    expect(ad.arrayDestruct).equal(undefined);
    expect(ad.objectDestruct).equal(undefined);
  });

  it("let, array, multiple IDs #3", () => {
    // --- Arrange
    const wParser = new Parser("let [a,,b,] = expr;");

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert
    expect(stmts.length).equal(1);
    const lst = stmts[0] as LetStatement;
    expect(lst.source).equal("let [a,,b,] = expr")
    expect(lst.declarations.length).equal(1);
    const decl = lst.declarations[0];
    expect(decl.arrayDestruct).not.equal(undefined);
    expect(decl.arrayDestruct!.length).equal(3);
    let ad = decl.arrayDestruct![0];
    expect(ad.id).equal("a");
    expect(ad.arrayDestruct).equal(undefined);
    expect(ad.objectDestruct).equal(undefined);
    ad = decl.arrayDestruct![1];
    expect(ad.id).equal(undefined);
    expect(ad.arrayDestruct).equal(undefined);
    expect(ad.objectDestruct).equal(undefined);
    ad = decl.arrayDestruct![2];
    expect(ad.id).equal("b");
    expect(ad.arrayDestruct).equal(undefined);
    expect(ad.objectDestruct).equal(undefined);
  });

  it("let, array, single nested array #1", () => {
    // --- Arrange
    const wParser = new Parser("let [a, [b,c]] = expr;");

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert
    expect(stmts.length).equal(1);
    const lst = stmts[0] as LetStatement;
    expect(lst.source).equal("let [a, [b,c]] = expr");
    expect(lst.declarations.length).equal(1);
    const decl = lst.declarations[0];
    expect(decl.arrayDestruct).not.equal(undefined);
    expect(decl.arrayDestruct!.length).equal(2);
    let ad = decl.arrayDestruct![0];
    expect(ad.id).equal("a");
    expect(ad.arrayDestruct).equal(undefined);
    expect(ad.objectDestruct).equal(undefined);
    ad = decl.arrayDestruct![1];
    expect(ad.id).equal(undefined);
    expect(ad.arrayDestruct!.length).equal(2);
    expect(ad.objectDestruct).equal(undefined);
    ad = decl.arrayDestruct![1].arrayDestruct![0];
    expect(ad.id).equal("b");
    expect(ad.arrayDestruct).equal(undefined);
    expect(ad.objectDestruct).equal(undefined);
    ad = decl.arrayDestruct![1].arrayDestruct![1];
    expect(ad.id).equal("c");
    expect(ad.arrayDestruct).equal(undefined);
    expect(ad.objectDestruct).equal(undefined);
  });

  it("let, array, single nested array #2", () => {
    // --- Arrange
    const wParser = new Parser("let [[a,b], c] = expr;");

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert
    expect(stmts.length).equal(1);
    const lst = stmts[0] as LetStatement;
    expect(lst.source).equal("let [[a,b], c] = expr");
    expect(lst.declarations.length).equal(1);
    const decl = lst.declarations[0];
    expect(decl.arrayDestruct).not.equal(undefined);
    expect(decl.arrayDestruct!.length).equal(2);
    let ad = decl.arrayDestruct![0].arrayDestruct![0];
    expect(ad.id).equal("a");
    expect(ad.arrayDestruct).equal(undefined);
    expect(ad.objectDestruct).equal(undefined);
    ad = decl.arrayDestruct![0].arrayDestruct![1];
    expect(ad.id).equal("b");
    expect(ad.arrayDestruct).equal(undefined);
    expect(ad.objectDestruct).equal(undefined);
    ad = decl.arrayDestruct![1];
    expect(ad.id).equal("c");
    expect(ad.arrayDestruct).equal(undefined);
    expect(ad.objectDestruct).equal(undefined);
  });

  it("let, array in object #1", () => {
    // --- Arrange
    const wParser = new Parser("let {a, b: [,c]} = expr;");

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert
    expect(stmts.length).equal(1);
    const lst = stmts[0] as LetStatement;
    expect(lst.source).equal("let {a, b: [,c]} = expr");
    expect(lst.declarations.length).equal(1);
    const decl = lst.declarations[0];
    expect(decl.objectDestruct).not.equal(undefined);
    expect(decl.objectDestruct!.length).equal(2);
    let od = decl.objectDestruct![0];
    expect(od.id).equal("a");
    expect(od.alias).equal(undefined);
    expect(od.arrayDestruct).equal(undefined);
    expect(od.objectDestruct).equal(undefined);
    od = decl.objectDestruct![1];
    expect(od.id).equal("b");
    expect(od.alias).equal(undefined);
    expect(od.arrayDestruct!.length).equal(2);
    expect(od.objectDestruct).equal(undefined);
    let ad = od.arrayDestruct![0];
    expect(ad.id).equal(undefined);
    expect(ad.arrayDestruct).equal(undefined);
    expect(ad.objectDestruct).equal(undefined);
    ad = od.arrayDestruct![1];
    expect(ad.id).equal("c");
    expect(ad.arrayDestruct).equal(undefined);
    expect(ad.objectDestruct).equal(undefined);
  });

  it("let, object in array #1", () => {
    // --- Arrange
    const wParser = new Parser("let [a, {b, c}] = expr;");

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert
    expect(stmts.length).equal(1);
    const lst = stmts[0] as LetStatement;
    expect(lst.source).equal("let [a, {b, c}] = expr");
    expect(lst.declarations.length).equal(1);
    const decl = lst.declarations[0];
    expect(decl.arrayDestruct!.length).equal(2);
    expect(decl.objectDestruct).equal(undefined);
    let ad = decl.arrayDestruct![0];
    expect(ad.id).equal("a");
    expect(ad.arrayDestruct).equal(undefined);
    expect(ad.objectDestruct).equal(undefined);
    ad = decl.arrayDestruct![1];
    expect(ad.id).equal(undefined);
    expect(ad.arrayDestruct).equal(undefined);
    expect(ad.objectDestruct!.length).equal(2);
    let od = ad.objectDestruct![0];
    expect(od.id).equal("b");
    expect(od.alias).equal(undefined);
    expect(od.arrayDestruct).equal(undefined);
    expect(od.objectDestruct).equal(undefined);
    od = ad.objectDestruct![1];
    expect(od.id).equal("c");
    expect(od.alias).equal(undefined);
    expect(od.arrayDestruct).equal(undefined);
    expect(od.objectDestruct).equal(undefined);
  });

  it("const, array in object #1", () => {
    // --- Arrange
    const wParser = new Parser("const {a, b: [,c]} = expr;");

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert
    expect(stmts.length).equal(1);
    const lst = stmts[0] as ConstStatement;
    expect(lst.source).equal("const {a, b: [,c]} = expr")
    expect(lst.declarations.length).equal(1);
    const decl = lst.declarations[0];
    expect(decl.objectDestruct).not.equal(undefined);
    expect(decl.objectDestruct!.length).equal(2);
    let od = decl.objectDestruct![0];
    expect(od.id).equal("a");
    expect(od.alias).equal(undefined);
    expect(od.arrayDestruct).equal(undefined);
    expect(od.objectDestruct).equal(undefined);
    od = decl.objectDestruct![1];
    expect(od.id).equal("b");
    expect(od.alias).equal(undefined);
    expect(od.arrayDestruct!.length).equal(2);
    expect(od.objectDestruct).equal(undefined);
    let ad = od.arrayDestruct![0];
    expect(ad.id).equal(undefined);
    expect(ad.arrayDestruct).equal(undefined);
    expect(ad.objectDestruct).equal(undefined);
    ad = od.arrayDestruct![1];
    expect(ad.id).equal("c");
    expect(ad.arrayDestruct).equal(undefined);
    expect(ad.objectDestruct).equal(undefined);
  });

  it("const, object in array #1", () => {
    // --- Arrange
    const wParser = new Parser("const [a, {b, c}] = expr;");

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert
    expect(stmts.length).equal(1);
    const lst = stmts[0] as ConstStatement;
    expect(lst.source).equal("const [a, {b, c}] = expr");
    expect(lst.declarations.length).equal(1);
    const decl = lst.declarations[0];
    expect(decl.arrayDestruct!.length).equal(2);
    expect(decl.objectDestruct).equal(undefined);
    let ad = decl.arrayDestruct![0];
    expect(ad.id).equal("a");
    expect(ad.arrayDestruct).equal(undefined);
    expect(ad.objectDestruct).equal(undefined);
    ad = decl.arrayDestruct![1];
    expect(ad.id).equal(undefined);
    expect(ad.arrayDestruct).equal(undefined);
    expect(ad.objectDestruct!.length).equal(2);
    let od = ad.objectDestruct![0];
    expect(od.id).equal("b");
    expect(od.alias).equal(undefined);
    expect(od.arrayDestruct).equal(undefined);
    expect(od.objectDestruct).equal(undefined);
    od = ad.objectDestruct![1];
    expect(od.id).equal("c");
    expect(od.alias).equal(undefined);
    expect(od.arrayDestruct).equal(undefined);
    expect(od.objectDestruct).equal(undefined);
  });

  it("let, object fails with no initialization", () => {
    // --- Arrange
    const wParser = new Parser("let {}");

    // --- Act/Assert
    try {
      wParser.parseStatements();
    } catch (err: any) {
      expect(err.toString().includes("=")).equal(true);
      return;
    }
    assert.fail("Exception expected");
  });

  it("let, array fails with no initialization", () => {
    // --- Arrange
    const wParser = new Parser("let []");

    // --- Act/Assert
    try {
      wParser.parseStatements();
    } catch (err: any) {
      expect(err.toString().includes("=")).equal(true);
      return;
    }
    assert.fail("Exception expected");
  });
});
