import { describe, expect, it } from "vitest";

import { orderedKeys } from "../../../src/components-core/utils/orderedKeys";
import { serializeSpacing } from "../../../src/components-core/utils/serializeSpacing";

describe("determinism utilities", () => {
  it("serializes spacing values with stable precision", () => {
    expect(serializeSpacing(0.1 + 0.2)).toBe("0.3");
    expect(serializeSpacing(1 / 3)).toBe("0.3333");
  });

  it("orders object keys deterministically", () => {
    const beta = Symbol("beta");
    const alpha = Symbol("alpha");
    const obj = {
      b: 1,
      "10": 2,
      "2": 3,
      a: 4,
      [beta]: 5,
      [alpha]: 6,
    };
    expect(orderedKeys(obj)).toEqual(["2", "10", "b", "a", alpha, beta]);
  });
});
