import { describe, expect, it } from "vitest";

import { InputStream, SourceText } from "../../../src/parser";

describe("parser source primitives", () => {
  it("tracks offsets, slices, and EOF", () => {
    const input = new InputStream("abc", "Main.xmlui");

    expect(input.position).toBe(0);
    expect(input.peek()).toBe("a");
    expect(input.peek(2)).toBe("c");
    expect(input.advance()).toBe("a");
    expect(input.advance(2)).toBe("bc");
    expect(input.eof).toBe(true);
    expect(input.peek()).toBeNull();
    expect(input.slice(0)).toBe("abc");
  });

  it("maps offsets to zero-based line and column positions", () => {
    const source = new SourceText("one\ntwo\r\nthree", "Main.xmlui");

    expect(source.positionAt(0)).toEqual({ line: 0, column: 0 });
    expect(source.positionAt(4)).toEqual({ line: 1, column: 0 });
    expect(source.positionAt(9)).toEqual({ line: 2, column: 0 });
    expect(source.positionAt(14)).toEqual({ line: 2, column: 5 });
  });

  it("creates source spans with stable source IDs", () => {
    const generatedFrom = {
      sourceId: "IncrementButton.xmlui",
      start: 10,
      end: 15,
    };
    const source = new SourceText({ id: "Main.xmlui", text: "<App />" });

    expect(source.span(1, 4, generatedFrom)).toEqual({
      sourceId: "Main.xmlui",
      start: 1,
      end: 4,
      generatedFrom,
    });
  });
});
