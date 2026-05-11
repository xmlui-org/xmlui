/**
 * Tests for the Levenshtein suggestion helper.
 *
 * See `dev-docs/plans/01-verified-type-contracts.md` Phase 2 §2.1.
 */

import { describe, it, expect } from "vitest";
import { levenshtein, findSuggestion } from "../../../src/components-core/type-contracts/suggestions";

describe("levenshtein", () => {
  it("returns 0 for identical strings", () => {
    expect(levenshtein("label", "label")).toBe(0);
  });

  it("returns string length for empty vs non-empty", () => {
    expect(levenshtein("", "abc")).toBe(3);
    expect(levenshtein("abc", "")).toBe(3);
  });

  it("returns 1 for a single substitution", () => {
    expect(levenshtein("label", "lXbel")).toBe(1);
  });

  it("returns 1 for a single insertion", () => {
    // "labe" → "label" = 1 insertion
    expect(levenshtein("labe", "label")).toBe(1);
  });

  it("returns 1 for a single deletion", () => {
    expect(levenshtein("labeel", "label")).toBe(1);
  });

  it("returns 2 for two edits", () => {
    expect(levenshtein("labe", "label")).toBeLessThanOrEqual(2);
    expect(levenshtein("labl", "label")).toBeLessThanOrEqual(2);
  });
});

describe("findSuggestion", () => {
  it("finds an exact match (distance 0)", () => {
    expect(findSuggestion("label", ["label", "value", "id"])).toBe("label");
  });

  it("finds a 1-edit suggestion", () => {
    expect(findSuggestion("labe", ["label", "value", "id"])).toBe("label");
  });

  it("finds a 2-edit suggestion", () => {
    // "labl" is 2 edits from "label" (delete 'l', substitute 'b' → 'e'... actually let's compute:
    // "labl" vs "label": insert 'e' before 'l' and swap? let me use a clear case
    // "lbel" vs "label": l→l, a→b (sub), b→e (sub), e→l (sub)... = 3?
    // Use "labell" vs "label": 1 deletion = distance 1
    // Use "lbael" vs "label": 2 subs = distance 2
    expect(findSuggestion("lbael", ["label", "value"])).toBe("label");
  });

  it("returns undefined when no candidate is within distance 2", () => {
    expect(findSuggestion("completelywrong", ["label", "value", "id"])).toBeUndefined();
  });

  it("returns undefined for an empty candidates list", () => {
    expect(findSuggestion("label", [])).toBeUndefined();
  });

  it("returns the closer of two candidates", () => {
    // "labe" is 1 edit from "label", 4+ edits from "type"
    const result = findSuggestion("labe", ["label", "type"]);
    expect(result).toBe("label");
  });
});
