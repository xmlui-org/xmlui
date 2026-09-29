import { describe, expect, it } from "vitest";
import {
  MAX_FIT_HEIGHT_VIEWPORT_RATIO,
  nextFitHeight,
} from "../../../src/components/NestedApp/contentOverflow";

describe("nextFitHeight", () => {
  it("grows the box by the overflow", () => {
    expect(nextFitHeight(320, 120, 320, 1000)).toBe(440);
  });

  it("rounds up fractional overflow", () => {
    expect(nextFitHeight(320, 10.2, 320, 1000)).toBe(331);
  });

  it("never shrinks the box", () => {
    expect(nextFitHeight(500, -50, 320, 1000)).toBe(500);
    expect(nextFitHeight(500, 0, 320, 1000)).toBe(500);
  });

  it("caps growth at the viewport-relative maximum", () => {
    const cap = Math.floor(1000 * MAX_FIT_HEIGHT_VIEWPORT_RATIO);
    expect(nextFitHeight(320, 5000, 320, 1000)).toBe(cap);
  });

  it("never caps below the reserved height on a small viewport", () => {
    expect(nextFitHeight(320, 200, 320, 300)).toBe(320);
  });

  it("keeps a box that is already taller than the cap", () => {
    expect(nextFitHeight(900, 100, 320, 1000)).toBe(900);
  });
});
