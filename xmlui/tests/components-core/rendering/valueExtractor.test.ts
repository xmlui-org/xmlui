import { describe, expect, it } from "vitest";

import { createValueExtractor } from "../../../src/components-core/rendering/valueExtractor";

function createExtractor() {
  return createValueExtractor({} as any, undefined, {}, { current: new Map() } as any);
}

describe("valueExtractor numeric helpers", () => {
  it("coerces finite numeric strings", () => {
    const extractValue = createExtractor();

    expect(extractValue.asNumber("12")).toBe(12);
    expect(extractValue.asOptionalNumber("12.5")).toBe(12.5);
  });

  it("treats blank optional numeric strings as absent", () => {
    const extractValue = createExtractor();

    expect(extractValue.asOptionalNumber("")).toBeUndefined();
    expect(extractValue.asOptionalNumber("   ", 7)).toBe(7);
  });

  it("rejects malformed and non-finite numeric values", () => {
    const extractValue = createExtractor();

    expect(() => extractValue.asOptionalNumber("12px")).toThrow("Expected a number");
    expect(() => extractValue.asOptionalNumber(NaN)).toThrow("Expected a number");
  });
});
