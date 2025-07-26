import { describe, expect, it } from "vitest";
import { parseBindingExpression } from "../../../src/components/Markdown/parse-binding-expr";

describe("parseBindingExpression - Safari Compatibility", () => {
  // Simple mock value extractor for testing basic functionality
  const mockValueExtractor = ((expr: any) => `EXTRACTED(${expr})`) as any;

  it("should handle empty binding expressions", () => {
    const input = "Some text @{} more text";
    const result = parseBindingExpression(input, mockValueExtractor);

    // Should replace empty binding with empty string
    expect(result).toBe("Some text  more text");
  });

  it("should handle binding expressions with content", () => {
    const input = "Hello @{name}!";
    const result = parseBindingExpression(input, mockValueExtractor);

    // Should extract and replace binding expressions with content
    expect(result).toBe("Hello EXTRACTED({name})!");
  });

  it("should handle escaped binding expressions", () => {
    const input = "This is \\@{} not a binding";
    const result = parseBindingExpression(input, mockValueExtractor);

    // Should preserve escaped bindings
    expect(result).toBe("This is \\@{} not a binding");
  });

  it("should handle multiple empty bindings", () => {
    const input = "Text @{} middle @{} end";
    const result = parseBindingExpression(input, mockValueExtractor);

    // Should replace both empty bindings
    expect(result).toBe("Text  middle  end");
  });

  it("should handle mixed empty and content bindings", () => {
    const input = "Start @{} @{value} @{} end";
    const result = parseBindingExpression(input, mockValueExtractor);

    // Should only replace empty bindings and extract content bindings
    expect(result).toBe("Start  EXTRACTED({value})  end");
  });

  it("should handle bindings at start and end", () => {
    const input = "@{} middle text @{}";
    const result = parseBindingExpression(input, mockValueExtractor);

    // Should handle edge cases
    expect(result).toBe(" middle text ");
  });

  it("should handle whitespace in empty bindings", () => {
    const input = "Text @{   } more text";
    const result = parseBindingExpression(input, mockValueExtractor);

    // Should replace whitespace-only bindings
    expect(result).toBe("Text  more text");
  });

  it("should not break with complex text", () => {
    const input = "Complex @{} text with @{variable} and \\@{escaped} and @{} end";
    const result = parseBindingExpression(input, mockValueExtractor);

    // Should handle complex scenarios correctly
    expect(result).toBe("Complex  text with EXTRACTED({variable}) and \\@{escaped} and  end");
  });

  it("should handle Safari-incompatible regex patterns", () => {
    // This is the key test to ensure our Safari fix works
    const input = "Before @{} after @{content} final @{}";

    // This should not throw "Invalid regular expression" on Safari
    expect(() => {
      parseBindingExpression(input, mockValueExtractor);
    }).not.toThrow();

    const result = parseBindingExpression(input, mockValueExtractor);
    expect(result).toBe("Before  after EXTRACTED({content}) final ");
  });

  it("should preserve escaped content bindings", () => {
    const input = "Escaped \\@{name} binding";
    const result = parseBindingExpression(input, mockValueExtractor);
    expect(result).toBe("Escaped \\@{name} binding");
  });

  it("should handle nested braces", () => {
    const input = "Nested @{outer{inner}} binding";
    const result = parseBindingExpression(input, mockValueExtractor);
    expect(result).toBe("Nested EXTRACTED({outer{inner}}) binding");
  });

  it("should handle adjacent bindings", () => {
    const input = "@{a}@{b}@{}";
    const result = parseBindingExpression(input, mockValueExtractor);
    expect(result).toBe("EXTRACTED({a})EXTRACTED({b})");
  });
});
