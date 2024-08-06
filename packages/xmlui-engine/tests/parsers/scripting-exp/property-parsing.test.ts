import { describe, expect, it, assert } from "vitest";
import { parsePropertyValue } from "@parsers/scripting-exp/property-parsing";
import {
  CompoundPropertyValue,
  SingleExpressionValue,
  SinglePropertyValue,
} from "@parsers/scripting-exp/source-tree";
import { Parser } from "@parsers/scripting/Parser";

describe("Parameter property parsing", () => {
  it("Regression #1", () => {
    // --- Act
    try {
      parsePropertyValue("{5+}");
    } catch (err: any) {
      expect(err.toString()).toContain("5+}");
      return;
    }
    assert.fail("Exception expected");
  });

  it("Regression #2", () => {
    // --- Act
    const segments = parsePropertyValue("{ items.map(id => {return {id: id} }) }")!;

    // --- Assert
    expect(segments.type).equal("SEV");
  });

  it("Regression #3", () => {
    // --- Act
    const segments = parsePropertyValue("\u{1f600}")!;

    // --- Assert
    const value = (segments as SinglePropertyValue).value;
    expect(segments.type).equal("SPV");
    expect(value).equal("\u{1f600}");
  });

  it("Regression #4", () => {
    // --- Act
    try {
      parsePropertyValue("{5+23");
    } catch (err: any) {
      expect(err.toString()).toContain("5+23");
      expect(err.toString()).toContain("Unclosed");
      return;
    }
    assert.fail("Exception expected");
  });

  it("Regression #5", () => {
    // --- Act
    try {
      parsePropertyValue("{-23sf{}");
    } catch (err: any) {
      expect(err.toString()).toContain("-23sf{}");
      expect(err.toString()).toContain("Unclosed");
      return;
    }
    assert.fail("Exception expected");
  });

  it("Test string works", () => {
    // --- Act
    const segments = parsePropertyValue("{$props}")!;

    // --- Assert
    expect(segments.type).equal("SEV");
  });

  it("Empty string works", () => {
    // --- Act
    const segments = parsePropertyValue("")!;

    // --- Assert
    const value = (segments as SinglePropertyValue).value;
    expect(segments.type).equal("SPV");
    expect(value).equal("");
  });

  it("Tail works", () => {
    // --- Arrange
    const wParser = new Parser("a+b } others");

    // --- Act
    const expr = wParser.parseExpr();

    // --- Assert
    expect(expr).not.equal(null);
    if (!expr) return;

    const tail = wParser.getTail();
    expect(tail.startsWith("}")).equal(true);
  });

  it("Parse single literal", () => {
    // --- Act
    const segments = parsePropertyValue("hello")!;

    // --- Assert
    const value = (segments as SinglePropertyValue).value;
    expect(segments.type).equal("SPV");
    expect(value).equal("hello");
  });

  it("Parse single literal with escape #1", () => {
    // --- Act
    const segments = parsePropertyValue("hello \\")!;

    // --- Assert
    const value = (segments as SinglePropertyValue).value;
    expect(segments.type).equal("SPV");
    expect(value).equal("hello \\");
  });

  it("Parse single literal with escape #2", () => {
    // --- Act
    const segments = parsePropertyValue("hello \\{")!;

    // --- Assert
    const value = (segments as SinglePropertyValue).value;
    expect(segments.type).equal("SPV");
    expect(value).equal("hello {");
  });

  it("Parse single literal with escape #3", () => {
    // --- Act
    const segments = parsePropertyValue("hello \\\\{")!;

    // --- Assert
    const value = (segments as SinglePropertyValue).value;
    expect(segments.type).equal("SPV");
    expect(value).equal("hello \\{");
  });

  it("Parse single literal with escape #4", () => {
    // --- Act
    const segments = parsePropertyValue("hello \\\\+")!;

    // --- Assert
    const value = (segments as SinglePropertyValue).value;
    expect(segments.type).equal("SPV");
    expect(value).equal("hello \\\\+");
  });

  it("Parse single literal with escape #5", () => {
    // --- Act
    const segments = parsePropertyValue("hello \\{abs")!;

    // --- Assert
    const value = (segments as SinglePropertyValue).value;
    expect(segments.type).equal("SPV");
    expect(value).equal("hello {abs");
  });

  it("Parse single literal with escape #4", () => {
    // --- Act
    const segments = parsePropertyValue("hello \\\\abs")!;

    // --- Assert
    const value = (segments as SinglePropertyValue).value;
    expect(segments.type).equal("SPV");
    expect(value).equal("hello \\\\abs");
  });

  it("Parse single literal with escape #5", () => {
    // --- Act
    const segments = parsePropertyValue("hello \\{1+2}")!;

    // --- Assert
    const value = (segments as SinglePropertyValue).value;
    expect(segments.type).equal("SPV");
    expect(value).equal("hello {1+2}");
  });

  it("Parse incomplete expression #1", () => {
    // --- Act
    const segments = parsePropertyValue("{")!;

    // --- Assert
    const value = (segments as SinglePropertyValue).value;
    expect(segments.type).equal("SPV");
    expect(value).equal("{");
  });

  it("Parse incomplete expression #3", () => {
    // --- Act
    try {
      parsePropertyValue("dummy {a+b");
    } catch (err: any) {
      expect(err.toString()).toContain("a+b");
      expect(err.toString()).toContain("Unclosed");
      return;
    }
    assert.fail("Exception expected");
  });

  it("Parse single expression #1", () => {
    // --- Act
    const segments = parsePropertyValue("{a+b}")!;

    // --- Assert
    const expr = (segments as SingleExpressionValue).expr;
    expect(segments.type).equal("SEV");
    expect(expr.type).equal("BinaryE");
  });

  it("Parse single expression #2", () => {
    // --- Act
    const segments = parsePropertyValue("abc {a+b}")!;

    // --- Assert
    expect(segments.type).equal("CPV");
    const parts = (segments as CompoundPropertyValue).parts;
    expect(parts[0]).equal("abc ");
    expect((parts[1] as any).type).equal("BinaryE");
  });

  it("Parse single expression #3", () => {
    // --- Act
    const segments = parsePropertyValue("abc {a+b} def")!;

    // --- Assert
    const parts = (segments as CompoundPropertyValue).parts;
    expect(parts[0]).equal("abc ");
    expect((parts[1] as any).type).equal("BinaryE");
    expect(parts[2]).equal(" def");
  });

  it("Parse single expression #4", () => {
    // --- Act
    const segments = parsePropertyValue("{{a:b}}")!;

    // --- Assert
    expect(segments.type).equal("SEV");
    expect((segments as any).expr.type).equal("OLitE");
  });

  it("Parse single expression #5", () => {
    // --- Act
    const segments = parsePropertyValue('{{a:"}"}}')!;

    // --- Assert
    expect(segments.type).equal("SEV");
    expect((segments as any).expr.type).equal("OLitE");
  });

  it("Parse single expression #6", () => {
    // --- Act
    const segments = parsePropertyValue('{{"{":"}"}}')!;

    // --- Assert
    expect(segments.type).equal("SEV");
    expect((segments as any).expr.type).equal("OLitE");
  });

  it("Parse single expression #6", () => {
    // --- Act
    const segments = parsePropertyValue('{{"{":123}}')!;

    // --- Assert
    expect(segments.type).equal("SEV");
    expect((segments as any).expr.type).equal("OLitE");
  });

  it("Parse multiple expression #1", () => {
    // --- Act
    const segments = parsePropertyValue("{a+b}{d+e}")!;

    // --- Assert
    expect(segments.type).equal("CPV");
    const parts = (segments as CompoundPropertyValue).parts;
    expect(parts.length).equal(2);
    expect((parts[0] as any).type).equal("BinaryE");
    expect((parts[1] as any).type).equal("BinaryE");
  });

  it("Parse multiple expression #2", () => {
    // --- Act
    const segments = parsePropertyValue("\\{{a+b}{d+e}")!;

    // --- Assert
    expect(segments.type).equal("CPV");
    const parts = (segments as CompoundPropertyValue).parts;
    expect(parts.length).equal(3);
    expect(parts[0]).equal("{");
    expect((parts[1] as any).type).equal("BinaryE");
    expect((parts[2] as any).type).equal("BinaryE");
  });

  it("Parse multiple expression #3", () => {
    // --- Act
    const segments = parsePropertyValue("{a+b}{{d:e}}")!;

    // --- Assert
    expect(segments.type).equal("CPV");
    const parts = (segments as CompoundPropertyValue).parts;
    expect(parts.length).equal(2);
    expect((parts[0] as any).type).equal("BinaryE");
    expect((parts[1] as any).type).equal("OLitE");
  });

  it("Parse multiple expression #4", () => {
    // --- Act
    const segments = parsePropertyValue("abc{a+b}{d+e}")!;

    // --- Assert
    expect(segments.type).equal("CPV");
    const parts = (segments as CompoundPropertyValue).parts;
    expect(parts.length).equal(3);
    expect(parts[0]).equal("abc");
    expect((parts[1] as any).type).equal("BinaryE");
    expect((parts[2] as any).type).equal("BinaryE");
  });

  it("Parse multiple expression #5", () => {
    // --- Act
    const segments = parsePropertyValue("abc{a+b}def{d+e}")!;

    // --- Assert
    expect(segments.type).equal("CPV");
    const parts = (segments as CompoundPropertyValue).parts;
    expect(parts.length).equal(4);
    expect(parts[0]).equal("abc");
    expect((parts[1] as any).type).equal("BinaryE");
    expect(parts[2]).equal("def");
    expect((parts[3] as any).type).equal("BinaryE");
  });

  it("Parse multiple expression #6", () => {
    // --- Act
    const segments = parsePropertyValue("abc{a+b}def{d+e}ghi")!;

    // --- Assert
    expect(segments.type).equal("CPV");
    const parts = (segments as CompoundPropertyValue).parts;
    expect(parts.length).equal(5);
    expect(parts[0]).equal("abc");
    expect((parts[1] as any).type).equal("BinaryE");
    expect(parts[2]).equal("def");
    expect((parts[3] as any).type).equal("BinaryE");
    expect(parts[4]).equal("ghi");
  });

  it("Keywords as member names regression", () => {
    // --- Act
    const source = "{$item.displayName.default || $item.uid}";
    const segments = parsePropertyValue(source)!;

    // --- Assert
    expect(segments.type).equal("SEV");
    expect((segments as any).expr.type).equal("BinaryE");
  });
});
