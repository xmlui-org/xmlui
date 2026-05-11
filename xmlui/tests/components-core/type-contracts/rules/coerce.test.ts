/**
 * Tests for the unified coercion decision table.
 */

import { describe, it, expect } from "vitest";
import {
  coerceValue,
  coercionRules,
  verifyValue,
} from "../../../../src/components-core/type-contracts/rules/coerce";

describe("coercionRules", () => {
  it("contains a rule for every shipped PropertyValueType", () => {
    const expected = [
      "boolean",
      "string",
      "number",
      "any",
      "ComponentDef",
      "integer",
      "color",
      "length",
      "url",
      "icon",
      "id-ref",
    ] as const;
    for (const t of expected) {
      expect(coercionRules.get(t)).toBeDefined();
    }
  });

  it("verify returns null for null/undefined regardless of type", () => {
    for (const t of coercionRules.keys()) {
      expect(verifyValue(t, null)).toBeNull();
      expect(verifyValue(t, undefined)).toBeNull();
    }
  });

  it("verify and coerce agree: when verify says ok, coerce is lossless for refined types", () => {
    const cases: Array<[Parameters<typeof verifyValue>[0], unknown, unknown]> = [
      ["integer", 42, 42],
      ["integer", "42", 42],
      ["color", "#fff", "#fff"],
      ["color", "rgb(0, 0, 0)", "rgb(0, 0, 0)"],
      ["length", "10px", "10px"],
      ["length", 8, "8px"],
      ["url", "/foo/bar", "/foo/bar"],
      ["icon", "save", "save"],
      ["id-ref", "myField", "myField"],
    ];
    for (const [t, raw, expected] of cases) {
      expect(verifyValue(t, raw)).toBeNull();
      expect(coerceValue(t, raw)).toEqual(expected);
    }
  });

  it("verify rejects malformed inputs", () => {
    expect(verifyValue("integer", "abc")).not.toBeNull();
    expect(verifyValue("integer", 1.5)).not.toBeNull();
    expect(verifyValue("color", "")).not.toBeNull();
    expect(verifyValue("color", 42 as unknown)).not.toBeNull();
    expect(verifyValue("length", "10banana")).not.toBeNull();
    expect(verifyValue("url", "")).not.toBeNull();
    expect(verifyValue("icon", "")).not.toBeNull();
    expect(verifyValue("id-ref", "1abc")).not.toBeNull();
  });

  it("returns null verification for unknown / undefined valueType (forward-compat)", () => {
    expect(verifyValue(undefined, "anything")).toBeNull();
    // @ts-expect-error — testing forward-compat behaviour
    expect(verifyValue("not-a-real-type", "anything")).toBeNull();
  });

  it("coerceValue passes through when type unknown", () => {
    expect(coerceValue(undefined, "x")).toBe("x");
    // @ts-expect-error — testing forward-compat behaviour
    expect(coerceValue("not-a-real-type", "x")).toBe("x");
  });
});

describe("rule context", () => {
  it("icon rule consults ctx.icons when provided", () => {
    expect(verifyValue("icon", "save", { icons: new Set(["save", "edit"]) })).toBeNull();
    const failure = verifyValue("icon", "missing", {
      icons: new Set(["save", "edit"]),
    });
    expect(failure).not.toBeNull();
    expect(failure!.message).toMatch(/Unknown icon/);
  });

  it("icon rule degrades to structural check without ctx.icons", () => {
    expect(verifyValue("icon", "anything")).toBeNull();
  });

  it("id-ref rule consults ctx.scopeIds when provided", () => {
    expect(
      verifyValue("id-ref", "myField", { scopeIds: new Set(["myField", "other"]) }),
    ).toBeNull();
    const failure = verifyValue("id-ref", "missing", {
      scopeIds: new Set(["myField"]),
    });
    expect(failure).not.toBeNull();
    expect(failure!.message).toMatch(/Unknown id reference/);
  });
});
