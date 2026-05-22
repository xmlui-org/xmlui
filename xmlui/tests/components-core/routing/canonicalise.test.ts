import { describe, expect, it } from "vitest";

import { canonicalise } from "../../../src/components-core/routing";

describe("canonicalise", () => {
  it("preserves URLs by default", () => {
    expect(
      canonicalise("/Users/42/?b=2&a=1", {
        case: "preserve",
        trailingSlash: "preserve",
        queryParamOrder: "preserve",
        onMismatch: "warn",
      }),
    ).toEqual({ canonical: "/Users/42/?b=2&a=1", changed: false });
  });

  it("normalizes configured URL pieces", () => {
    expect(
      canonicalise("/Users/42/?b=2&a=1", {
        case: "lower",
        trailingSlash: "never",
        queryParamOrder: "alphabetical",
        onMismatch: "warn",
      }),
    ).toEqual({ canonical: "/users/42?a=1&b=2", changed: true });
  });
});
