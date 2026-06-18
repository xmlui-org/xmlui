import { describe, expect, it } from "vitest";

import { parseMixedTextSegments } from "../../src/compiler/mixedText";

describe("parseMixedTextSegments", () => {
  it("keeps literal text and parses expression segments", () => {
    const segments = parseMixedTextSegments("Local count: {count}", { start: 10, end: 30 });

    expect(segments).toHaveLength(2);
    expect(segments[0]).toEqual({
      kind: "literal",
      value: "Local count: ",
      range: { start: 10, end: 23 },
    });
    expect(segments[1]).toMatchObject({
      kind: "expression",
      source: "count",
      range: { start: 23, end: 30 },
      expressionRange: { start: 24, end: 29 },
      ast: {
        kind: "Identifier",
        name: "count",
      },
    });
  });

  it("handles multiple expressions and trims expression whitespace", () => {
    const segments = parseMixedTextSegments("{ first } + {second}", { start: 0, end: 20 });

    expect(segments.map((segment) => segment.kind)).toEqual([
      "expression",
      "literal",
      "expression",
    ]);
    expect(segments[0]).toMatchObject({
      source: "first",
      expressionRange: { start: 2, end: 7 },
    });
    expect(segments[2]).toMatchObject({
      source: "second",
      expressionRange: { start: 13, end: 19 },
    });
  });

  it("treats unmatched braces as literal text", () => {
    expect(parseMixedTextSegments("Hello {name", { start: 0, end: 11 })).toEqual([
      {
        kind: "literal",
        value: "Hello ",
        range: { start: 0, end: 6 },
      },
      {
        kind: "literal",
        value: "{name",
        range: { start: 6, end: 11 },
      },
    ]);
  });
});
