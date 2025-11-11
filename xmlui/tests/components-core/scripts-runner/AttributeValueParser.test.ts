import { assert, describe, expect, it } from "vitest";

import { parseAttributeValue } from "../../../src/components-core/script-runner/AttributeValueParser";
import type { Identifier, ObjectLiteral} from "../../../src/components-core/script-runner/ScriptingSourceTree";
import { T_IDENTIFIER } from "../../../src/components-core/script-runner/ScriptingSourceTree";
import { T_OBJECT_LITERAL } from "../../../src/parsers/scripting/ScriptingNodeTypes";

describe("Attribute value parsing", () => {
  it("Empty value", () => {
    // --- Act
    const source = "";
    const val = parseAttributeValue(source)!;

    // --- Assert
    expect(val.__PARSED).toBe(true);
    expect(val.parseId).toBeTypeOf("number");
    expect(val.segments).toHaveLength(0);
  });

  it("single string literal", () => {
    // --- Act
    const source = "hello";
    const val = parseAttributeValue(source)!;

    // --- Assert
    expect(val.__PARSED).toBe(true);
    expect(val.parseId).toBeTypeOf("number");
    expect(val.segments).toHaveLength(1);
    expect(val.segments![0].expr).toBeUndefined();
    expect(val.segments![0].literal).toBe("hello");
  });

  it("single expression value", () => {
    // --- Act
    const source = "{myId}";
    const val = parseAttributeValue(source)!;

    // --- Assert
    expect(val.__PARSED).toBe(true);
    expect(val.segments).toHaveLength(1);
    expect(val.segments![0].expr).toBeDefined();
    expect(val.segments![0].literal).toBeUndefined();
    expect(val.segments![0].expr.type).toBe(T_IDENTIFIER);
    expect((val.segments![0].expr as Identifier).name).toBe("myId");
  });

  it("compound value #1", () => {
    // --- Act
    const source = "{myId}hello";
    const val = parseAttributeValue(source)!;

    // --- Assert
    expect(val.__PARSED).toBe(true);
    expect(val.parseId).toBeTypeOf("number");
    expect(val.segments).toHaveLength(2);
    expect(val.segments![0].expr).toBeDefined();
    expect(val.segments![0].literal).toBeUndefined();
    expect(val.segments![0].expr.type).toBe(T_IDENTIFIER);
    expect((val.segments![0].expr as Identifier).name).toBe("myId");
    expect(val.segments![1].expr).toBeUndefined();
    expect(val.segments![1].literal).toBe("hello");
  });

  it("compound value #2", () => {
    // --- Act
    const source = "hello{myId}";
    const val = parseAttributeValue(source)!;

    // --- Assert
    expect(val.__PARSED).toBe(true);
    expect(val.parseId).toBeTypeOf("number");
    expect(val.segments).toHaveLength(2);
    expect(val.segments![0].expr).toBeUndefined();
    expect(val.segments![0].literal).toBe("hello");
    expect(val.segments![1].expr).toBeDefined();
    expect(val.segments![1].literal).toBeUndefined();
    expect(val.segments![1].expr.type).toBe(T_IDENTIFIER);
    expect((val.segments![1].expr as Identifier).name).toBe("myId");
  });

  it("compound value #3", () => {
    // --- Act
    const source = "hello{myId}world";
    const val = parseAttributeValue(source)!;

    // --- Assert
    expect(val.__PARSED).toBe(true);
    expect(val.parseId).toBeTypeOf("number");
    expect(val.segments).toHaveLength(3);
    expect(val.segments![0].expr).toBeUndefined();
    expect(val.segments![0].literal).toBe("hello");
    expect(val.segments![1].expr).toBeDefined();
    expect(val.segments![1].literal).toBeUndefined();
    expect(val.segments![1].expr.type).toBe(T_IDENTIFIER);
    expect((val.segments![1].expr as Identifier).name).toBe("myId");
    expect(val.segments![2].expr).toBeUndefined();
    expect(val.segments![2].literal).toBe("world");
  });

  it("value with escaped brace #1", () => {
    // --- Act
    const source = "\\{myId";
    const val = parseAttributeValue(source)!;

    // --- Assert
    expect(val.__PARSED).toBe(true);
    expect(val.parseId).toBeTypeOf("number");
    expect(val.segments).toHaveLength(1);
    expect(val.segments![0].expr).toBeUndefined();
    expect(val.segments![0].literal).toBe("{myId");
  });

  it("value with escaped brace #2", () => {
    // --- Act
    const source = "\\{myId}hello";
    const val = parseAttributeValue(source)!;

    // --- Assert
    expect(val.__PARSED).toBe(true);
    expect(val.parseId).toBeTypeOf("number");
    expect(val.segments).toHaveLength(1);
    expect(val.segments![0].expr).toBeUndefined();
    expect(val.segments![0].literal).toBe("{myId}hello");
  });

  it("value with escaped brace #3", () => {
    // --- Act
    const source = "hello\\{myId}";
    const val = parseAttributeValue(source)!;

    // --- Assert
    expect(val.__PARSED).toBe(true);
    expect(val.parseId).toBeTypeOf("number");
    expect(val.segments).toHaveLength(1);
    expect(val.segments![0].expr).toBeUndefined();
    expect(val.segments![0].literal).toBe("hello{myId}");
  });

  it("value with escaped brace #4", () => {
    // --- Act
    const source = "hello\\{myId}{world}";
    const val = parseAttributeValue(source)!;

    // --- Assert
    expect(val.__PARSED).toBe(true);
    expect(val.parseId).toBeTypeOf("number");
    expect(val.segments).toHaveLength(2);
    expect(val.segments![0].expr).toBeUndefined();
    expect(val.segments![0].literal).toBe("hello{myId}");
    expect(val.segments![1].expr).toBeDefined();
    expect(val.segments![1].literal).toBeUndefined();
    expect(val.segments![1].expr.type).toBe(T_IDENTIFIER);
    expect((val.segments![1].expr as Identifier).name).toBe("world");
  });

  it("value with unclosed brace", () => {
    // --- Act
    const source = "{myId";
    try {
      const val = parseAttributeValue(source)!;
    } catch (err) {
      expect(err.toString()).toContain("Unclosed");
      return;
    }
    assert.fail("Exception expected");
  });

    it("object value #1", () => {
    // --- Act
    const source = "{{ from: from, to: to }}";
    const val = parseAttributeValue(source)!;

    // --- Assert
    expect(val.__PARSED).toBe(true);
    expect(val.parseId).toBeTypeOf("number");
    expect(val.segments).toHaveLength(1);
    expect(val.segments![0].expr).toBeDefined();
    expect(val.segments![0].literal).toBeUndefined();
    expect(val.segments![0].expr.type).toBe(T_OBJECT_LITERAL);
    expect((val.segments![0].expr as ObjectLiteral).props.length).toBe(2);
  });

});