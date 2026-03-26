import { describe, expect, it } from "vitest";
import { Parser } from "../../src/parsers/scripting/Parser";
import {
  extractPropsFromExpression,
  extractThemeVarsFromValue,
} from "../../src/components-core/ud-metadata";

// Helper: parse an expression string into an AST
function parseExpr(src: string) {
  return new Parser(src).parseExpr();
}

describe("extractPropsFromExpression", () => {
  it("extracts simple $props.foo", () => {
    const expr = parseExpr("$props.foo");
    expect(extractPropsFromExpression(expr)).toEqual(["foo"]);
  });

  it("extracts multiple $props members in binary expression", () => {
    const expr = parseExpr("$props.bar + $props.baz");
    const result = extractPropsFromExpression(expr);
    expect(result).toContain("bar");
    expect(result).toContain("baz");
    expect(result).toHaveLength(2);
  });

  it("returns empty for no $props references", () => {
    const expr = parseExpr("someVar + 42");
    expect(extractPropsFromExpression(expr)).toEqual([]);
  });

  it("returns empty for bare $props identifier without member access", () => {
    const expr = parseExpr("$props");
    expect(extractPropsFromExpression(expr)).toEqual([]);
  });

  it("extracts from nested conditional expression", () => {
    const expr = parseExpr("$props.enabled ? $props.label : 'default'");
    const result = extractPropsFromExpression(expr);
    expect(result).toContain("enabled");
    expect(result).toContain("label");
    expect(result).toHaveLength(2);
  });

  it("extracts from function call arguments", () => {
    const expr = parseExpr("format($props.value, $props.pattern)");
    const result = extractPropsFromExpression(expr);
    expect(result).toContain("value");
    expect(result).toContain("pattern");
    expect(result).toHaveLength(2);
  });

  it("extracts from template literal", () => {
    const expr = parseExpr("`Hello ${$props.name}!`");
    expect(extractPropsFromExpression(expr)).toEqual(["name"]);
  });

  it("deduplicates repeated $props members", () => {
    const expr = parseExpr("$props.x + $props.x");
    expect(extractPropsFromExpression(expr)).toEqual(["x"]);
  });

  it("extracts from unary expression", () => {
    const expr = parseExpr("!$props.visible");
    expect(extractPropsFromExpression(expr)).toEqual(["visible"]);
  });

  it("extracts from optional chaining $props?.foo", () => {
    const expr = parseExpr("$props?.foo");
    expect(extractPropsFromExpression(expr)).toEqual(["foo"]);
  });

  it("extracts from array literal", () => {
    const expr = parseExpr("[$props.a, $props.b]");
    const result = extractPropsFromExpression(expr);
    expect(result).toContain("a");
    expect(result).toContain("b");
  });

  it("extracts from object literal", () => {
    const expr = parseExpr("{ key: $props.val }");
    expect(extractPropsFromExpression(expr)).toContain("val");
  });

  it("extracts from spread expression", () => {
    const expr = parseExpr("[...$props.items]");
    expect(extractPropsFromExpression(expr)).toEqual(["items"]);
  });

  it("extracts from nested member access on $props", () => {
    // $props.config.value — only top-level member "config" should be extracted
    // because that's the prop name; .value is a sub-path
    const expr = parseExpr("$props.config.value");
    expect(extractPropsFromExpression(expr)).toEqual(["config"]);
  });

  it("does not extract from non-$props member access", () => {
    const expr = parseExpr("$state.value");
    expect(extractPropsFromExpression(expr)).toEqual([]);
  });

  it("extracts from assignment expression", () => {
    const expr = parseExpr("x = $props.initial");
    expect(extractPropsFromExpression(expr)).toEqual(["initial"]);
  });

  it("extracts from prefix/postfix expressions", () => {
    const expr = parseExpr("++$props.count");
    expect(extractPropsFromExpression(expr)).toEqual(["count"]);
  });

  it("extracts from new expression arguments", () => {
    const expr = parseExpr("new Date($props.timestamp)");
    expect(extractPropsFromExpression(expr)).toEqual(["timestamp"]);
  });
});

describe("extractThemeVarsFromValue", () => {
  it("extracts single theme variable", () => {
    expect(extractThemeVarsFromValue("$color-surface-100")).toEqual(["color-surface-100"]);
  });

  it("extracts multiple theme variables", () => {
    const result = extractThemeVarsFromValue("$space-2 $space-4");
    expect(result).toContain("space-2");
    expect(result).toContain("space-4");
    expect(result).toHaveLength(2);
  });

  it("returns empty for plain CSS value", () => {
    expect(extractThemeVarsFromValue("10px")).toEqual([]);
  });

  it("returns empty for undefined", () => {
    expect(extractThemeVarsFromValue(undefined)).toEqual([]);
  });

  it("returns empty for null", () => {
    expect(extractThemeVarsFromValue(null)).toEqual([]);
  });

  it("returns empty for empty string", () => {
    expect(extractThemeVarsFromValue("")).toEqual([]);
  });

  it("extracts from CSS function value", () => {
    expect(extractThemeVarsFromValue("rgb(from $color-secondary-500 r g b / 0.6)")).toEqual([
      "color-secondary-500",
    ]);
  });

  it("extracts theme var with hyphen", () => {
    expect(extractThemeVarsFromValue("$border-radius")).toEqual(["border-radius"]);
  });

  it("extracts theme var with underscore", () => {
    expect(extractThemeVarsFromValue("$space_large")).toEqual(["space_large"]);
  });

  it("extracts multiple vars in complex expression", () => {
    const result = extractThemeVarsFromValue("$space-0_5 $space-2");
    expect(result).toContain("space-0_5");
    expect(result).toContain("space-2");
    expect(result).toHaveLength(2);
  });

  it("deduplicates repeated theme vars", () => {
    expect(extractThemeVarsFromValue("$x $x")).toEqual(["x"]);
  });

  it("does not match dollar sign followed by number", () => {
    // $1 doesn't match because name must start with a letter
    expect(extractThemeVarsFromValue("$1foo")).toEqual([]);
  });
});
