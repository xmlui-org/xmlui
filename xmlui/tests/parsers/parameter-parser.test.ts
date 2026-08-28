import { describe, expect, it } from "vitest";
import { parseParameterString } from "../../src/components-core/script-runner/ParameterParser";
import type { Expression } from "../../src/components-core/script-runner/ScriptingSourceTree";
import { T_BINARY_EXPRESSION, T_LITERAL } from "../../src/parsers/scripting/ScriptingNodeTypes";
import { UnsupportedCompiledScriptNodeError } from "../../src/components-core/script-compiler";
import { collectVariableDependencies } from "../../src/components-core/script-runner/visitors";

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

  it("tracks computed member keys as compiled binding dependencies", () => {
    // --- Act
    const result = parseParameterString("{readings[dataset].min}", {
      compileBindings: true,
      sourceId: "Main.xmlui:current",
    });

    // --- Assert
    expect(result.length).toBe(1);
    expect(result[0].type).toBe("expression");
    if (result[0].type === "expression") {
      expect(result[0].compiled?.dependencies).toEqual(["readings", "dataset"]);
    }
  });

  it("throws unsupported node errors while compiling requested parse artifacts", () => {
    expect(() =>
      parseParameterString("{(async () => 1)}", {
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

  // --- https://github.com/xmlui-org/xmlui/issues/3774
  // A braced section whose content parses to no expression at all (empty,
  // whitespace-only, or comment-only — comments are lexer trivia, so they
  // leave no tokens behind) must not produce an expression segment with a
  // null `value`. It should be treated as literal source text instead.
  describe("comment-only / empty expression segments (issue #3774)", () => {
    it("comment-only braces are parsed as a literal segment, not a null expression", () => {
      // --- Act
      const result = parseParameterString("before {/* note */} after");

      // --- Assert: no segment has type "expression" with a null value
      expect(result.every((segment) => segment.type === "literal")).toBe(true);
      expect(result.map((s) => s.value).join("")).toContain("before ");
      expect(result.map((s) => s.value).join("")).toContain(" after");
      // --- No expression segment was fabricated around the null AST node
      expect(result.some((segment) => segment.type === "expression")).toBe(false);
    });

    it("whitespace-only braces are also parsed as a literal segment", () => {
      // --- Act
      const result = parseParameterString("{   }");

      // --- Assert
      expect(result.length).toBe(1);
      expect(result[0].type).toBe("literal");
      expect(result[0].value).toBe("   ");
    });

    it("dependency collection never sees a null expression value (interpreted mode)", () => {
      // --- Act
      const result = parseParameterString("before @{ /* note */ } after");

      // --- Assert: every segment is safe to feed into collectVariableDependencies
      for (const segment of result) {
        if (segment.type === "expression") {
          expect(() => collectVariableDependencies(segment.value)).not.toThrow();
        }
      }
      // --- The specific crash reported in #3774: no segment carries a null value
      expect(result.some((segment) => (segment as any).value === null)).toBe(false);
    });

    it("comment-only braces do not throw when compiled bindings are requested", () => {
      // --- Act & Assert
      expect(() =>
        parseParameterString("before @{ /* note */ } after", {
          compileBindings: true,
          sourceId: "Main.xmlui:comment-only",
        }),
      ).not.toThrow();

      const result = parseParameterString("before @{ /* note */ } after", {
        compileBindings: true,
        sourceId: "Main.xmlui:comment-only",
      });

      // --- No expression segment (and therefore no compiled artifact) was
      // built for the comment-only braces.
      expect(result.every((segment) => segment.type === "literal")).toBe(true);
    });

    it("a real expression alongside a comment-only one still compiles correctly", () => {
      // --- Act
      const result = parseParameterString("{a+b}{/* note */}", {
        compileBindings: true,
        sourceId: "Main.xmlui:mixed",
      });

      // --- Assert
      expect(result[0].type).toBe("expression");
      if (result[0].type === "expression") {
        expect(result[0].compiled).toMatchObject({
          dependencies: ["a", "b"],
        });
      }
      expect(result[1].type).toBe("literal");
    });
  });
});
