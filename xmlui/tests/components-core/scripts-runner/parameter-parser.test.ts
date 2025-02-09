import { describe, expect, it, assert } from "vitest";
import { Parser } from "../../../src/parsers/scripting/Parser";
import { parseParameterString } from "../../../src/components-core/script-runner/ParameterParser";
import { Expression } from "../../../src/abstractions/scripting/ScriptingSourceTree";

describe("ParameterParser", () => {
  it("Regression #1", () => {
    // --- Act
    try {
      parseParameterString("{5+}");
    } catch (err: any) {
      expect(err.toString()).toContain("5+}");
      return;
    }
    assert.fail("Exception expected");
  });

  it("Regression #2", () => {
    // --- Act
    const segments = parseParameterString("{ items.map(id => {return {id: id} }) }");

    // --- Assert
    expect(segments.length).equal(1);
    expect(segments[0].type).equal("expression");
  });

  it("Regression #3", () => {
    // --- Act
    const segments = parseParameterString("\u{1f600}");

    // --- Assert
    expect(segments.length).equal(1);
    expect(segments[0].type).equal("literal");
  });

  it("Regression #4", () => {
    // --- Act
    try {
      parseParameterString("{5+23");
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
      parseParameterString("{-23sf{}");
    } catch (err: any) {
      expect(err.toString()).toContain("-23sf{}");
      expect(err.toString()).toContain("Unclosed");
      return;
    }
    assert.fail("Exception expected");
  });

  it("Test string works", () => {
    // --- Act
    const segments = parseParameterString("{$props}");

    // --- Assert
    expect(segments.length).equal(1);
  });

  it("Empty string works", () => {
    // --- Act
    const segments = parseParameterString("");

    // --- Assert
    expect(segments.length).equal(0);
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
    const segments = parseParameterString("hello");

    // --- Assert
    expect(segments.length).equal(1);
    expect(segments[0].type).equal("literal");
    expect(segments[0].value).equal("hello");
  });

  it("Parse single literal with escape #1", () => {
    // --- Act
    const segments = parseParameterString("hello \\");

    // --- Assert
    expect(segments.length).equal(1);
    expect(segments[0].type).equal("literal");
    expect(segments[0].value).equal("hello \\");
  });

  it("Parse single literal with escape #2", () => {
    // --- Act
    const segments = parseParameterString("hello \\{");

    // --- Assert
    expect(segments.length).equal(1);
    expect(segments[0].type).equal("literal");
    expect(segments[0].value).equal("hello {");
  });

  it("Parse single literal with escape #3", () => {
    // --- Act
    const segments = parseParameterString("hello \\\\{");

    // --- Assert
    expect(segments.length).equal(1);
    expect(segments[0].type).equal("literal");
    expect(segments[0].value).equal("hello \\{");
  });

  it("Parse single literal with escape #4", () => {
    // --- Act
    const segments = parseParameterString("hello \\\\+");

    // --- Assert
    expect(segments.length).equal(1);
    expect(segments[0].type).equal("literal");
    expect(segments[0].value).equal("hello \\\\+");
  });

  it("Parse single literal with escape #5", () => {
    // --- Act
    const segments = parseParameterString("hello \\{abs");

    // --- Assert
    expect(segments.length).equal(1);
    expect(segments[0].type).equal("literal");
    expect(segments[0].value).equal("hello {abs");
  });

  it("Parse single literal with escape #4", () => {
    // --- Act
    const segments = parseParameterString("hello \\\\abs");

    // --- Assert
    expect(segments.length).equal(1);
    expect(segments[0].type).equal("literal");
    expect(segments[0].value).equal("hello \\\\abs");
  });

  it("Parse single literal with escape #5", () => {
    // --- Act
    const segments = parseParameterString("hello \\{1+2}");

    // --- Assert
    expect(segments.length).equal(1);
    expect(segments[0].type).equal("literal");
    expect(segments[0].value).equal("hello {1+2}");
  });

  it("Parse incomplete expression #1", () => {
    // --- Act
    const segments = parseParameterString("{");

    // --- Assert
    expect(segments.length).equal(1);
    expect(segments[0].type).equal("literal");
    expect(segments[0].value).equal("{");
  });

  it("Parse incomplete expression #3", () => {
    // --- Act
    try {
      parseParameterString("dummy {a+b");
    } catch (err: any) {
      expect(err.toString()).toContain("a+b");
      expect(err.toString()).toContain("Unclosed");
      return;
    }
    assert.fail("Exception expected");
  });

  it("Parse single expression #1", () => {
    // --- Act
    const segments = parseParameterString("{a+b}");

    // --- Assert
    expect(segments.length).equal(1);
    expect(segments[0].type).equal("expression");
    expect((segments[0].value as any).type).equal("BinaryE");
  });

  it("Parse single expression #2", () => {
    // --- Act
    const segments = parseParameterString("abc {a+b}");

    // --- Assert
    expect(segments.length).equal(2);
    expect(segments[0].type).equal("literal");
    expect(segments[0].value).equal("abc ");
    expect(segments[1].type).equal("expression");
    expect((segments[1].value as any).type).equal("BinaryE");
  });

  it("Parse single expression #3", () => {
    // --- Act
    const segments = parseParameterString("abc {a+b} def");

    // --- Assert
    expect(segments.length).equal(3);
    expect(segments[0].type).equal("literal");
    expect(segments[0].value).equal("abc ");
    expect(segments[1].type).equal("expression");
    expect((segments[1].value as any).type).equal("BinaryE");
    expect(segments[2].type).equal("literal");
    expect(segments[2].value).equal(" def");
  });

  it("Parse single expression #4", () => {
    // --- Act
    const segments = parseParameterString("{{a:b}}");

    // --- Assert
    expect(segments.length).equal(1);
    expect(segments[0].type).equal("expression");
    expect((segments[0].value as any).type).equal("OLitE");
  });

  it("Parse single expression #5", () => {
    // --- Act
    const segments = parseParameterString('{{a:"}"}}');

    // --- Assert
    expect(segments.length).equal(1);
    expect(segments[0].type).equal("expression");
    expect((segments[0].value as any).type).equal("OLitE");
  });

  it("Parse single expression #6", () => {
    // --- Act
    const segments = parseParameterString('{{"{":"}"}}');

    // --- Assert
    expect(segments.length).equal(1);
    expect(segments[0].type).equal("expression");
    expect((segments[0].value as any).type).equal("OLitE");
  });

  it("Parse single expression #6", () => {
    // --- Act
    const segments = parseParameterString('{{"{":123}}');

    // --- Assert
    expect(segments.length).equal(1);
    expect(segments[0].type).equal("expression");
    expect((segments[0].value as any).type).equal("OLitE");
  });

  it("Parse multiple expression #1", () => {
    // --- Act
    const segments = parseParameterString("{a+b}{d+e}");

    // --- Assert
    expect(segments.length).equal(2);
    expect(segments[0].type).equal("expression");
    expect((segments[0].value as any).type).equal("BinaryE");
    expect(segments[1].type).equal("expression");
    expect((segments[1].value as any).type).equal("BinaryE");
  });

  it("Parse multiple expression #2", () => {
    // --- Act
    const segments = parseParameterString("\\{{a+b}{d+e}");

    // --- Assert
    expect(segments.length).equal(3);
    expect(segments[0].type).equal("literal");
    expect(segments[0].value).equal("{");
    expect(segments[1].type).equal("expression");
    expect((segments[1].value as any).type).equal("BinaryE");
    expect(segments[2].type).equal("expression");
    expect((segments[2].value as any).type).equal("BinaryE");
  });

  it("Parse multiple expression #3", () => {
    // --- Act
    const segments = parseParameterString("{a+b}{{d:e}}");

    // --- Assert
    expect(segments.length).equal(2);
    expect(segments[0].type).equal("expression");
    expect((segments[0].value as any).type).equal("BinaryE");
    expect(segments[1].type).equal("expression");
    expect((segments[1].value as any).type).equal("OLitE");
  });

  it("Parse multiple expression #4", () => {
    // --- Act
    const segments = parseParameterString("abc{a+b}{d+e}");

    // --- Assert
    expect(segments.length).equal(3);
    expect(segments[0].type).equal("literal");
    expect(segments[0].value).equal("abc");
    expect(segments[1].type).equal("expression");
    expect((segments[1].value as any).type).equal("BinaryE");
    expect(segments[2].type).equal("expression");
    expect((segments[2].value as any).type).equal("BinaryE");
  });

  it("Parse multiple expression #5", () => {
    // --- Act
    const segments = parseParameterString("abc{a+b}def{d+e}");

    // --- Assert
    expect(segments.length).equal(4);
    expect(segments[0].type).equal("literal");
    expect(segments[0].value).equal("abc");
    expect(segments[1].type).equal("expression");
    expect((segments[1].value as any).type).equal("BinaryE");
    expect(segments[2].type).equal("literal");
    expect(segments[2].value).equal("def");
    expect(segments[1].type).equal("expression");
    expect(segments[3].type).equal("expression");
    expect((segments[3].value as any).type).equal("BinaryE");
  });

  it("Parse multiple expression #6", () => {
    // --- Act
    const segments = parseParameterString("abc{a+b}def{d+e}ghi");

    // --- Assert
    expect(segments.length).equal(5);
    expect(segments[0].type).equal("literal");
    expect(segments[0].value).equal("abc");
    expect(segments[1].type).equal("expression");
    expect((segments[1].value as any).type).equal("BinaryE");
    expect(segments[2].type).equal("literal");
    expect(segments[2].value).equal("def");
    expect(segments[1].type).equal("expression");
    expect(segments[3].type).equal("expression");
    expect((segments[3].value as any).type).equal("BinaryE");
    expect(segments[4].type).equal("literal");
    expect(segments[4].value).equal("ghi");
  });

  it("Keywords as member names regression", () => {
    // --- Act
    const source = "{$item.displayName.default || $item.uid}";
    const segments = parseParameterString(source);

    // --- Assert
    expect(segments.length).equal(1);
    expect(segments[0].type).equal("expression");
    expect((segments[0].value as Expression).type).equal("BinaryE");
  });
});
