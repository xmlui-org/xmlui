import { describe, expect, it } from "vitest";
import { parseParameterString } from "../../src/components-core/script-runner/ParameterParser";
import type { Expression } from "../../src/components-core/script-runner/ScriptingSourceTree";
import { T_BINARY_EXPRESSION, T_LITERAL } from "../../src/parsers/scripting/ScriptingNodeTypes";
import { UnsupportedCompiledScriptNodeError } from "../../src/components-core/script-compiler";

describe("parseParameterString", () => {
  it("Empty string works", () => {
    // --- Act
    const result = parseParameterString("");

    // --- Assert
    expect(result.length).toBe(0);
  });

  it("String literal works", () => {
    // --- Act
    const result = parseParameterString("abc");

    // --- Assert
    expect(result.length).toBe(1);
    expect(result[0].type).toBe("literal");
    expect(result[0].value).toBe("abc");
  });

  it("Single expression works", () => {
    // --- Act
    const result = parseParameterString("{a+b}");

    // --- Assert
    expect(result.length).toBe(1);
    expect(result[0].type).toBe("expression");
    expect((result[0].value as Expression).type).toBe(T_BINARY_EXPRESSION);
    if (result[0].type === "expression") {
      expect(result[0].compiled).toBeUndefined();
    }
  });

  it("can attach compiled binding artifacts when requested", () => {
    // --- Act
    const result = parseParameterString("hello{a+b}world", {
      compileBindings: true,
      sourceId: "Main.xmlui:title",
    });

    // --- Assert
    expect(result.length).toBe(3);
    expect(result[1].type).toBe("expression");
    if (result[1].type === "expression") {
      expect(result[1].compiled).toMatchObject({
        target: "binding-sync",
        sourceId: "Main.xmlui:title#expr-1",
        sourceText: "a+b",
        dependencies: ["a", "b"],
      });
      expect(result[1].compiled?.js).toContain("runtime.start(evalContext);");
      expect(result[1].compiled?.mappings.length).toBeGreaterThan(0);
      expect(JSON.stringify(result[1].compiled)).not.toContain("nativeFn");
    }
  });

  it("throws unsupported node errors while compiling requested parse artifacts", () => {
    expect(() =>
      parseParameterString("{(() => { try { return 1; } finally {} })()}", {
        compileBindings: true,
        sourceId: "Main.xmlui:bad",
      }),
    ).toThrow(UnsupportedCompiledScriptNodeError);
  });

  it("Combination works #1", () => {
    // --- Act
    const result = parseParameterString("hello{a+b}");

    // --- Assert
    expect(result.length).toBe(2);
    expect(result[0].type).toBe("literal");
    expect(result[0].value).toBe("hello");
    expect(result[1].type).toBe("expression");
    expect((result[1].value as Expression).type).toBe(T_BINARY_EXPRESSION);
  });

  it("Combination works #2", () => {
    // --- Act
    const result = parseParameterString("{a+b}world");

    // --- Assert
    expect(result.length).toBe(2);
    expect(result[0].type).toBe("expression");
    expect((result[0].value as Expression).type).toBe(T_BINARY_EXPRESSION);
    expect(result[1].type).toBe("literal");
    expect(result[1].value).toBe("world");
  });

  it("Combination works #3", () => {
    // --- Act
    const result = parseParameterString("hello{a+b}world");

    // --- Assert
    expect(result.length).toBe(3);
    expect(result[0].type).toBe("literal");
    expect(result[0].value).toBe("hello");
    expect(result[1].type).toBe("expression");
    expect((result[1].value as Expression).type).toBe(T_BINARY_EXPRESSION);
    expect(result[2].type).toBe("literal");
    expect(result[2].value).toBe("world");
  });

  it("Single escape works #1", () => {
    // --- Act
    const result = parseParameterString("\\{a+b}");

    // --- Assert
    expect(result.length).toBe(1);
    expect(result[0].type).toBe("literal");
    expect(result[0].value).toBe("{a+b}");
  });

  it("Single escape works #2", () => {
    // --- Act
    const result = parseParameterString("\\{{a+b}");

    // --- Assert
    expect(result.length).toBe(2);
    expect(result[0].type).toBe("literal");
    expect(result[0].value).toBe("{");
    expect(result[1].type).toBe("expression");
    expect((result[1].value as Expression).type).toBe(T_BINARY_EXPRESSION);
  });

  it("Single escape works #3", () => {
    // --- Act
    const result = parseParameterString("/\\{{3}$/");

    // --- Assert
    expect(result.length).toBe(3);
    expect(result[0].type).toBe("literal");
    expect(result[0].value).toBe("/{");
    expect(result[1].type).toBe("expression");
    expect((result[1].value as Expression).type).toBe(T_LITERAL);
    expect(result[2].type).toBe("literal");
    expect(result[2].value).toBe("$/");
  });
});
