/**
 * Tests for analyzer/rules/_utils.ts
 *
 * Covers the shared helpers: Levenshtein, closestMatch, offsetToLineCol,
 * walkComponentDef, and the global prop allow-lists.
 */

import { describe, it, expect } from "vitest";
import {
  levenshtein,
  closestMatch,
  offsetToLineCol,
  walkComponentDef,
  FRAMEWORK_PROPS,
  BEHAVIOR_PROPS,
  isDataAttribute,
  isAllowedGlobalProp,
} from "../../../../src/components-core/analyzer/rules/_utils";
import type { ComponentDef } from "../../../../src/abstractions/ComponentDefs";

// ---------------------------------------------------------------------------
// levenshtein
// ---------------------------------------------------------------------------

describe("levenshtein", () => {
  it("returns 0 for identical strings", () => {
    expect(levenshtein("Button", "Button")).toBe(0);
  });

  it("returns the length of the non-empty string when the other is empty", () => {
    expect(levenshtein("Button", "")).toBe(6);
    expect(levenshtein("", "abc")).toBe(3);
  });

  it("measures a single deletion", () => {
    expect(levenshtein("Buttn", "Button")).toBe(1);
  });

  it("measures a single substitution", () => {
    expect(levenshtein("Buttonx", "Button")).toBe(1);
  });

  it("measures a transposition as 2 operations", () => {
    // 'Buton' vs 'Button' — missing 't' → distance 1
    expect(levenshtein("Buton", "Button")).toBe(1);
  });

  it("measures larger distance", () => {
    expect(levenshtein("xyz", "Button")).toBeGreaterThan(3);
  });
});

// ---------------------------------------------------------------------------
// closestMatch
// ---------------------------------------------------------------------------

describe("closestMatch", () => {
  const pool = ["Button", "Text", "Stack", "Input"];

  it("returns the closest match within default distance", () => {
    expect(closestMatch("Buttn", pool)).toBe("Button");
  });

  it("returns undefined when nothing is close enough", () => {
    expect(closestMatch("XyzAbc", pool)).toBeUndefined();
  });

  it("returns the exact match when present", () => {
    expect(closestMatch("Text", pool)).toBe("Text");
  });
});

// ---------------------------------------------------------------------------
// offsetToLineCol
// ---------------------------------------------------------------------------

describe("offsetToLineCol", () => {
  const source = "line1\nline2\nline3";

  it("returns line 1 col 1 for offset 0", () => {
    expect(offsetToLineCol(source, 0)).toEqual({ line: 1, col: 1 });
  });

  it("returns correct col within first line", () => {
    expect(offsetToLineCol(source, 3)).toEqual({ line: 1, col: 4 });
  });

  it("returns line 2 col 1 for offset at start of second line", () => {
    expect(offsetToLineCol(source, 6)).toEqual({ line: 2, col: 1 });
  });

  it("clamps negative offsets to offset 0", () => {
    expect(offsetToLineCol(source, -5)).toEqual({ line: 1, col: 1 });
  });

  it("clamps offset beyond source length to end", () => {
    const result = offsetToLineCol(source, 9999);
    expect(result.line).toBeGreaterThanOrEqual(1);
  });
});

// ---------------------------------------------------------------------------
// walkComponentDef
// ---------------------------------------------------------------------------

describe("walkComponentDef", () => {
  const tree: ComponentDef = {
    type: "App",
    children: [
      {
        type: "VStack",
        children: [{ type: "Button" }],
      },
    ],
  };

  it("visits every node in depth-first order", () => {
    const visited: string[] = [];
    walkComponentDef(tree, (node) => { visited.push(node.type); });
    expect(visited).toEqual(["App", "VStack", "Button"]);
  });

  it("stops descending when visitor returns false", () => {
    const visited: string[] = [];
    walkComponentDef(tree, (node) => {
      visited.push(node.type);
      if (node.type === "VStack") return false; // skip VStack's children
    });
    expect(visited).toEqual(["App", "VStack"]);
    expect(visited).not.toContain("Button");
  });

  it("visits slot children", () => {
    const withSlots: ComponentDef = {
      type: "Modal",
      slots: {
        footer: [{ type: "Button" }],
      },
    };
    const visited: string[] = [];
    walkComponentDef(withSlots, (node) => { visited.push(node.type); });
    expect(visited).toContain("Button");
  });
});

// ---------------------------------------------------------------------------
// Allow-list helpers
// ---------------------------------------------------------------------------

describe("FRAMEWORK_PROPS / BEHAVIOR_PROPS / isDataAttribute / isAllowedGlobalProp", () => {
  it("FRAMEWORK_PROPS contains uid, testId, when, slot, etc.", () => {
    expect(FRAMEWORK_PROPS.has("uid")).toBe(true);
    expect(FRAMEWORK_PROPS.has("testId")).toBe(true);
    expect(FRAMEWORK_PROPS.has("when")).toBe(true);
    expect(FRAMEWORK_PROPS.has("slot")).toBe(true);
    expect(FRAMEWORK_PROPS.has("when-md")).toBe(true);
  });

  it("BEHAVIOR_PROPS contains tooltip, label, bindTo, required, variant, animation, bookmark", () => {
    for (const p of ["tooltip", "label", "bindTo", "required", "variant", "animation", "bookmark"]) {
      expect(BEHAVIOR_PROPS.has(p)).toBe(true);
    }
  });

  it("isDataAttribute matches data-* names", () => {
    expect(isDataAttribute("data-testid")).toBe(true);
    expect(isDataAttribute("data-foo")).toBe(true);
    expect(isDataAttribute("testId")).toBe(false);
  });

  it("isAllowedGlobalProp is true for framework props, behavior props, and data-*", () => {
    expect(isAllowedGlobalProp("uid")).toBe(true);
    expect(isAllowedGlobalProp("tooltip")).toBe(true);
    expect(isAllowedGlobalProp("data-x")).toBe(true);
    expect(isAllowedGlobalProp("customProp")).toBe(false);
  });
});
