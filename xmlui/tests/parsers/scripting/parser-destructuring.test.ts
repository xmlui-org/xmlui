import { describe, expect, it, assert } from "vitest";
import { Parser } from "../../../src/parsers/scripting/Parser";
import type {
  ConstStatement,
  LetStatement,
} from "../../../src/components-core/script-runner/ScriptingSourceTree";

describe("Parser - destructuring", () => {
  it("let, object, empty", () => {
    // --- Arrange
    const wParser = new Parser("let {} = expr;");

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert
    expect(stmts.length).equal(1);
    const lst = stmts[0] as LetStatement;
    expect(lst.decls.length).equal(1);
    const decl = lst.decls[0];
    expect(decl.oDestr).not.equal(undefined);
    expect(decl.oDestr!.length).equal(0);
  });

  it("let, object, single ID", () => {
    // --- Arrange
    const wParser = new Parser("let {a} = expr;");

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert
    expect(stmts.length).equal(1);
    const lst = stmts[0] as LetStatement;
    expect(lst.decls.length).equal(1);
    const decl = lst.decls[0];
    expect(decl.oDestr).not.equal(undefined);
    expect(decl.oDestr!.length).equal(1);
    const od = decl.oDestr![0];
    expect(od.id).equal("a");
    expect(od.alias).equal(undefined);
    expect(od.aDestr).equal(undefined);
    expect(od.oDestr).equal(undefined);
  });

  it("let, object, multiple IDs #1", () => {
    // --- Arrange
    const wParser = new Parser("let {a, b} = expr;");

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert
    expect(stmts.length).equal(1);
    const lst = stmts[0] as LetStatement;
    expect(lst.decls.length).equal(1);
    const decl = lst.decls[0];
    expect(decl.oDestr).not.equal(undefined);
    expect(decl.oDestr!.length).equal(2);
    let od = decl.oDestr![0];
    expect(od.id).equal("a");
    expect(od.alias).equal(undefined);
    expect(od.aDestr).equal(undefined);
    expect(od.oDestr).equal(undefined);
    od = decl.oDestr![1];
    expect(od.id).equal("b");
    expect(od.alias).equal(undefined);
    expect(od.aDestr).equal(undefined);
    expect(od.oDestr).equal(undefined);
  });

  it("let, object, multiple IDs #2", () => {
    // --- Arrange
    const wParser = new Parser("let {a, b, } = expr;");

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert
    expect(stmts.length).equal(1);
    const lst = stmts[0] as LetStatement;
    expect(lst.decls.length).equal(1);
    const decl = lst.decls[0];
    expect(decl.oDestr).not.equal(undefined);
    expect(decl.oDestr!.length).equal(2);
    let od = decl.oDestr![0];
    expect(od.id).equal("a");
    expect(od.alias).equal(undefined);
    expect(od.aDestr).equal(undefined);
    expect(od.oDestr).equal(undefined);
    od = decl.oDestr![1];
    expect(od.id).equal("b");
    expect(od.alias).equal(undefined);
    expect(od.aDestr).equal(undefined);
    expect(od.oDestr).equal(undefined);
  });

  it("let, object, single aliased ID", () => {
    // --- Arrange
    const wParser = new Parser("let {a: aA} = expr;");

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert
    expect(stmts.length).equal(1);
    const lst = stmts[0] as LetStatement;
    expect(lst.decls.length).equal(1);
    const decl = lst.decls[0];
    expect(decl.oDestr).not.equal(undefined);
    expect(decl.oDestr!.length).equal(1);
    const od = decl.oDestr![0];
    expect(od.id).equal("a");
    expect(od.alias).equal("aA");
    expect(od.aDestr).equal(undefined);
    expect(od.oDestr).equal(undefined);
  });

  it("let, object, multiple aliased IDs #1", () => {
    // --- Arrange
    const wParser = new Parser("let {a: aA, b: bB} = expr;");

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert
    expect(stmts.length).equal(1);
    const lst = stmts[0] as LetStatement;
    expect(lst.decls.length).equal(1);
    const decl = lst.decls[0];
    expect(decl.oDestr).not.equal(undefined);
    expect(decl.oDestr!.length).equal(2);
    let od = decl.oDestr![0];
    expect(od.id).equal("a");
    expect(od.alias).equal("aA");
    expect(od.aDestr).equal(undefined);
    expect(od.oDestr).equal(undefined);
    od = decl.oDestr![1];
    expect(od.id).equal("b");
    expect(od.alias).equal("bB");
    expect(od.aDestr).equal(undefined);
    expect(od.oDestr).equal(undefined);
  });

  it("let, object, multiple aliased IDs #2", () => {
    // --- Arrange
    const wParser = new Parser("let {a: aA, b: bB, } = expr;");

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert
    expect(stmts.length).equal(1);
    const lst = stmts[0] as LetStatement;
    expect(lst.decls.length).equal(1);
    const decl = lst.decls[0];
    expect(decl.oDestr).not.equal(undefined);
    expect(decl.oDestr!.length).equal(2);
    let od = decl.oDestr![0];
    expect(od.id).equal("a");
    expect(od.alias).equal("aA");
    expect(od.aDestr).equal(undefined);
    expect(od.oDestr).equal(undefined);
    od = decl.oDestr![1];
    expect(od.id).equal("b");
    expect(od.alias).equal("bB");
    expect(od.aDestr).equal(undefined);
    expect(od.oDestr).equal(undefined);
  });

  it("let, object, single nested object #1", () => {
    // --- Arrange
    const wParser = new Parser("let {a: {b}} = expr;");

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert
    expect(stmts.length).equal(1);
    const lst = stmts[0] as LetStatement;
    expect(lst.decls.length).equal(1);
    const decl = lst.decls[0];
    expect(decl.oDestr).not.equal(undefined);
    expect(decl.oDestr!.length).equal(1);
    const od = decl.oDestr![0];
    expect(od.id).equal("a");
    expect(od.alias).equal(undefined);
    expect(od.aDestr).equal(undefined);
    expect(od.oDestr!.length).equal(1);
    const nod = od.oDestr![0];
    expect(nod.id).equal("b");
    expect(nod.alias).equal(undefined);
    expect(nod.aDestr).equal(undefined);
    expect(nod.oDestr).equal(undefined);
  });

  it("let, object, single nested object #2", () => {
    // --- Arrange
    const wParser = new Parser("let {a: {b, c: cC}} = expr;");

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert
    expect(stmts.length).equal(1);
    const lst = stmts[0] as LetStatement;
    expect(lst.decls.length).equal(1);
    const decl = lst.decls[0];
    expect(decl.oDestr).not.equal(undefined);
    expect(decl.oDestr!.length).equal(1);
    const od = decl.oDestr![0];
    expect(od.id).equal("a");
    expect(od.alias).equal(undefined);
    expect(od.aDestr).equal(undefined);
    expect(od.oDestr!.length).equal(2);
    let nod = od.oDestr![0];
    expect(nod.id).equal("b");
    expect(nod.alias).equal(undefined);
    expect(nod.aDestr).equal(undefined);
    expect(nod.oDestr).equal(undefined);
    nod = od.oDestr![1];
    expect(nod.id).equal("c");
    expect(nod.alias).equal("cC");
    expect(nod.aDestr).equal(undefined);
    expect(nod.oDestr).equal(undefined);
  });

  it("let, array, empty #1", () => {
    // --- Arrange
    const wParser = new Parser("let [] = expr;");

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert
    expect(stmts.length).equal(1);
    const lst = stmts[0] as LetStatement;
    expect(lst.decls.length).equal(1);
    const decl = lst.decls[0];
    expect(decl.aDestr).not.equal(undefined);
    expect(decl.aDestr!.length).equal(0);
  });

  it("let, array, empty #2", () => {
    // --- Arrange
    const wParser = new Parser("let [,] = expr;");

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert
    expect(stmts.length).equal(1);
    const lst = stmts[0] as LetStatement;
    expect(lst.decls.length).equal(1);
    const decl = lst.decls[0];
    expect(decl.aDestr).not.equal(undefined);
    expect(decl.aDestr!.length).equal(1);
    const ad = decl.aDestr![0];
    expect(ad.id).equal(undefined);
    expect(ad.aDestr).equal(undefined);
    expect(ad.oDestr).equal(undefined);
  });

  it("let, array, single ID", () => {
    // --- Arrange
    const wParser = new Parser("let [a] = expr;");

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert
    expect(stmts.length).equal(1);
    const lst = stmts[0] as LetStatement;
    expect(lst.decls.length).equal(1);
    const decl = lst.decls[0];
    expect(decl.aDestr).not.equal(undefined);
    expect(decl.aDestr!.length).equal(1);
    const ad = decl.aDestr![0];
    expect(ad.id).equal("a");
    expect(ad.aDestr).equal(undefined);
    expect(ad.oDestr).equal(undefined);
  });

  it("let, array, multiple IDs #1", () => {
    // --- Arrange
    const wParser = new Parser("let [a, b] = expr;");

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert
    expect(stmts.length).equal(1);
    const lst = stmts[0] as LetStatement;
    expect(lst.decls.length).equal(1);
    const decl = lst.decls[0];
    expect(decl.aDestr).not.equal(undefined);
    expect(decl.aDestr!.length).equal(2);
    let ad = decl.aDestr![0];
    expect(ad.id).equal("a");
    expect(ad.aDestr).equal(undefined);
    expect(ad.oDestr).equal(undefined);
    ad = decl.aDestr![1];
    expect(ad.id).equal("b");
    expect(ad.aDestr).equal(undefined);
    expect(ad.oDestr).equal(undefined);
  });

  it("let, array, multiple IDs #2", () => {
    // --- Arrange
    const wParser = new Parser("let [a, b,] = expr");

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert
    expect(stmts.length).equal(1);
    const lst = stmts[0] as LetStatement;
    expect(lst.decls.length).equal(1);
    const decl = lst.decls[0];
    expect(decl.aDestr).not.equal(undefined);
    expect(decl.aDestr!.length).equal(2);
    let ad = decl.aDestr![0];
    expect(ad.id).equal("a");
    expect(ad.aDestr).equal(undefined);
    expect(ad.oDestr).equal(undefined);
    ad = decl.aDestr![1];
    expect(ad.id).equal("b");
    expect(ad.aDestr).equal(undefined);
    expect(ad.oDestr).equal(undefined);
  });

  it("let, array, multiple IDs #3", () => {
    // --- Arrange
    const wParser = new Parser("let [a,,b,] = expr;");

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert
    expect(stmts.length).equal(1);
    const lst = stmts[0] as LetStatement;
    expect(lst.decls.length).equal(1);
    const decl = lst.decls[0];
    expect(decl.aDestr).not.equal(undefined);
    expect(decl.aDestr!.length).equal(3);
    let ad = decl.aDestr![0];
    expect(ad.id).equal("a");
    expect(ad.aDestr).equal(undefined);
    expect(ad.oDestr).equal(undefined);
    ad = decl.aDestr![1];
    expect(ad.id).equal(undefined);
    expect(ad.aDestr).equal(undefined);
    expect(ad.oDestr).equal(undefined);
    ad = decl.aDestr![2];
    expect(ad.id).equal("b");
    expect(ad.aDestr).equal(undefined);
    expect(ad.oDestr).equal(undefined);
  });

  it("let, array, single nested array #1", () => {
    // --- Arrange
    const wParser = new Parser("let [a, [b,c]] = expr;");

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert
    expect(stmts.length).equal(1);
    const lst = stmts[0] as LetStatement;
    expect(lst.decls.length).equal(1);
    const decl = lst.decls[0];
    expect(decl.aDestr).not.equal(undefined);
    expect(decl.aDestr!.length).equal(2);
    let ad = decl.aDestr![0];
    expect(ad.id).equal("a");
    expect(ad.aDestr).equal(undefined);
    expect(ad.oDestr).equal(undefined);
    ad = decl.aDestr![1];
    expect(ad.id).equal(undefined);
    expect(ad.aDestr!.length).equal(2);
    expect(ad.oDestr).equal(undefined);
    ad = decl.aDestr![1].aDestr![0];
    expect(ad.id).equal("b");
    expect(ad.aDestr).equal(undefined);
    expect(ad.oDestr).equal(undefined);
    ad = decl.aDestr![1].aDestr![1];
    expect(ad.id).equal("c");
    expect(ad.aDestr).equal(undefined);
    expect(ad.oDestr).equal(undefined);
  });

  it("let, array, single nested array #2", () => {
    // --- Arrange
    const wParser = new Parser("let [[a,b], c] = expr;");

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert
    expect(stmts.length).equal(1);
    const lst = stmts[0] as LetStatement;
    expect(lst.decls.length).equal(1);
    const decl = lst.decls[0];
    expect(decl.aDestr).not.equal(undefined);
    expect(decl.aDestr!.length).equal(2);
    let ad = decl.aDestr![0].aDestr![0];
    expect(ad.id).equal("a");
    expect(ad.aDestr).equal(undefined);
    expect(ad.oDestr).equal(undefined);
    ad = decl.aDestr![0].aDestr![1];
    expect(ad.id).equal("b");
    expect(ad.aDestr).equal(undefined);
    expect(ad.oDestr).equal(undefined);
    ad = decl.aDestr![1];
    expect(ad.id).equal("c");
    expect(ad.aDestr).equal(undefined);
    expect(ad.oDestr).equal(undefined);
  });

  it("let, array in object #1", () => {
    // --- Arrange
    const wParser = new Parser("let {a, b: [,c]} = expr;");

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert
    expect(stmts.length).equal(1);
    const lst = stmts[0] as LetStatement;
    expect(lst.decls.length).equal(1);
    const decl = lst.decls[0];
    expect(decl.oDestr).not.equal(undefined);
    expect(decl.oDestr!.length).equal(2);
    let od = decl.oDestr![0];
    expect(od.id).equal("a");
    expect(od.alias).equal(undefined);
    expect(od.aDestr).equal(undefined);
    expect(od.oDestr).equal(undefined);
    od = decl.oDestr![1];
    expect(od.id).equal("b");
    expect(od.alias).equal(undefined);
    expect(od.aDestr!.length).equal(2);
    expect(od.oDestr).equal(undefined);
    let ad = od.aDestr![0];
    expect(ad.id).equal(undefined);
    expect(ad.aDestr).equal(undefined);
    expect(ad.oDestr).equal(undefined);
    ad = od.aDestr![1];
    expect(ad.id).equal("c");
    expect(ad.aDestr).equal(undefined);
    expect(ad.oDestr).equal(undefined);
  });

  it("let, object in array #1", () => {
    // --- Arrange
    const wParser = new Parser("let [a, {b, c}] = expr;");

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert
    expect(stmts.length).equal(1);
    const lst = stmts[0] as LetStatement;
    expect(lst.decls.length).equal(1);
    const decl = lst.decls[0];
    expect(decl.aDestr!.length).equal(2);
    expect(decl.oDestr).equal(undefined);
    let ad = decl.aDestr![0];
    expect(ad.id).equal("a");
    expect(ad.aDestr).equal(undefined);
    expect(ad.oDestr).equal(undefined);
    ad = decl.aDestr![1];
    expect(ad.id).equal(undefined);
    expect(ad.aDestr).equal(undefined);
    expect(ad.oDestr!.length).equal(2);
    let od = ad.oDestr![0];
    expect(od.id).equal("b");
    expect(od.alias).equal(undefined);
    expect(od.aDestr).equal(undefined);
    expect(od.oDestr).equal(undefined);
    od = ad.oDestr![1];
    expect(od.id).equal("c");
    expect(od.alias).equal(undefined);
    expect(od.aDestr).equal(undefined);
    expect(od.oDestr).equal(undefined);
  });

  it("const, array in object #1", () => {
    // --- Arrange
    const wParser = new Parser("const {a, b: [,c]} = expr;");

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert
    expect(stmts.length).equal(1);
    const lst = stmts[0] as ConstStatement;
    expect(lst.decls.length).equal(1);
    const decl = lst.decls[0];
    expect(decl.oDestr).not.equal(undefined);
    expect(decl.oDestr!.length).equal(2);
    let od = decl.oDestr![0];
    expect(od.id).equal("a");
    expect(od.alias).equal(undefined);
    expect(od.aDestr).equal(undefined);
    expect(od.oDestr).equal(undefined);
    od = decl.oDestr![1];
    expect(od.id).equal("b");
    expect(od.alias).equal(undefined);
    expect(od.aDestr!.length).equal(2);
    expect(od.oDestr).equal(undefined);
    let ad = od.aDestr![0];
    expect(ad.id).equal(undefined);
    expect(ad.aDestr).equal(undefined);
    expect(ad.oDestr).equal(undefined);
    ad = od.aDestr![1];
    expect(ad.id).equal("c");
    expect(ad.aDestr).equal(undefined);
    expect(ad.oDestr).equal(undefined);
  });

  it("const, object in array #1", () => {
    // --- Arrange
    const wParser = new Parser("const [a, {b, c}] = expr;");

    // --- Act
    const stmts = wParser.parseStatements()!;

    // --- Assert
    expect(stmts.length).equal(1);
    const lst = stmts[0] as ConstStatement;
    expect(lst.decls.length).equal(1);
    const decl = lst.decls[0];
    expect(decl.aDestr!.length).equal(2);
    expect(decl.oDestr).equal(undefined);
    let ad = decl.aDestr![0];
    expect(ad.id).equal("a");
    expect(ad.aDestr).equal(undefined);
    expect(ad.oDestr).equal(undefined);
    ad = decl.aDestr![1];
    expect(ad.id).equal(undefined);
    expect(ad.aDestr).equal(undefined);
    expect(ad.oDestr!.length).equal(2);
    let od = ad.oDestr![0];
    expect(od.id).equal("b");
    expect(od.alias).equal(undefined);
    expect(od.aDestr).equal(undefined);
    expect(od.oDestr).equal(undefined);
    od = ad.oDestr![1];
    expect(od.id).equal("c");
    expect(od.alias).equal(undefined);
    expect(od.aDestr).equal(undefined);
    expect(od.oDestr).equal(undefined);
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
