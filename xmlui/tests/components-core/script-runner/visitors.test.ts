import { describe, expect, it } from "vitest";

import { collectVariableDependencies } from "../../../src/components-core/script-runner/visitors";
import { Parser } from "../../../src/parsers/scripting/Parser";

// --- https://github.com/xmlui-org/xmlui/issues/3774
// `collectVariableDependencies` previously dereferenced `program.type`
// unconditionally, so a null/undefined program (e.g. produced by a parser
// for an empty, whitespace-only, or comment-only expression source) crashed
// with `TypeError: Cannot read properties of null (reading 'type')`.
describe("collectVariableDependencies null-tolerance (issue #3774)", () => {
  it("returns an empty dependency list for a null program", () => {
    // --- Act
    const deps = collectVariableDependencies(null as any);

    // --- Assert
    expect(deps).toEqual([]);
  });

  it("returns an empty dependency list for an undefined program", () => {
    // --- Act
    const deps = collectVariableDependencies(undefined as any);

    // --- Assert
    expect(deps).toEqual([]);
  });

  it("does not throw when given a null program with custom options", () => {
    // --- Act & Assert
    expect(() =>
      collectVariableDependencies(null as any, {}, { includeAssignmentTargets: true }),
    ).not.toThrow();
    expect(collectVariableDependencies(null as any, {}, { includeAssignmentTargets: true })).toEqual(
      [],
    );
  });

  it("still collects dependencies normally for a real expression", () => {
    // --- Arrange
    const parser = new Parser("a + b");
    const expr = parser.parseExpr();

    // --- Act
    const deps = collectVariableDependencies(expr as any);

    // --- Assert
    expect(deps).toEqual(["a", "b"]);
  });

  it("returns an empty list for a program that itself parses to null (comment-only source)", () => {
    // --- Arrange: a comment-only source is trivia-only, so the parser
    // produces no expression node at all.
    const parser = new Parser("/* just a comment */");
    const expr = parser.parseExpr();
    expect(expr).toBeNull();

    // --- Act
    const deps = collectVariableDependencies(expr as any);

    // --- Assert
    expect(deps).toEqual([]);
  });
});
