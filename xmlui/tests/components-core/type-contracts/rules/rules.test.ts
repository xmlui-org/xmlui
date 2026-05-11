/**
 * Per-rule unit tests (one suite per refined `valueType`).
 */

import { describe, it, expect } from "vitest";
import { integerRule } from "../../../../src/components-core/type-contracts/rules/integer";
import { colorRule } from "../../../../src/components-core/type-contracts/rules/color";
import { lengthRule } from "../../../../src/components-core/type-contracts/rules/length";
import { urlRule } from "../../../../src/components-core/type-contracts/rules/url";
import { iconRule } from "../../../../src/components-core/type-contracts/rules/icon";
import { idRefRule } from "../../../../src/components-core/type-contracts/rules/id-ref";
import { verifyEnum } from "../../../../src/components-core/type-contracts/rules/enum";

describe("integerRule", () => {
  it.each([0, 1, -1, 42, "42", "-7"])("accepts %p", (raw) => {
    expect(integerRule.verify(raw)).toBeNull();
  });
  it.each([1.5, "1.5", "abc", "", true, [] as unknown])("rejects %p", (raw) => {
    expect(integerRule.verify(raw)).not.toBeNull();
  });
  it("coerces strings to numbers", () => {
    expect(integerRule.coerce("42")).toBe(42);
  });
  it("truncates fractional numbers on coerce", () => {
    expect(integerRule.coerce(3.7)).toBe(3);
  });
});

describe("colorRule", () => {
  it.each([
    "#fff",
    "#FFFFFF",
    "#fffabc",
    "#ffffffff",
    "rgb(0, 0, 0)",
    "rgba(0,0,0,0.5)",
    "hsl(120, 50%, 50%)",
    "var(--xmlui-Button-color)",
    "$primary",
    "red",
    "TRANSPARENT",
  ])("accepts %p", (raw) => {
    expect(colorRule.verify(raw)).toBeNull();
  });
  it.each(["", "not-a-color", "#zzz", 42 as unknown, true])("rejects %p", (raw) => {
    expect(colorRule.verify(raw)).not.toBeNull();
  });
});

describe("lengthRule", () => {
  it.each([
    0,
    "0",
    8,
    "10px",
    "1.5rem",
    "100%",
    "50vh",
    "50svh",
    "var(--space-2)",
    "$gap",
    "auto",
  ])("accepts %p", (raw) => {
    expect(lengthRule.verify(raw)).toBeNull();
  });
  it.each(["", "10banana", "px10", true, {} as unknown])("rejects %p", (raw) => {
    expect(lengthRule.verify(raw)).not.toBeNull();
  });
  it("coerces bare numbers to px strings", () => {
    expect(lengthRule.coerce(8)).toBe("8px");
    expect(lengthRule.coerce("8")).toBe("8px");
  });
});

describe("urlRule", () => {
  it.each([
    "/foo/bar",
    "https://example.com/path?x=1",
    "mailto:a@b.com",
    "../sibling",
    "page#anchor",
  ])("accepts %p", (raw) => {
    expect(urlRule.verify(raw)).toBeNull();
  });
  it.each(["", "   ", 42 as unknown, true])("rejects %p", (raw) => {
    expect(urlRule.verify(raw)).not.toBeNull();
  });
});

describe("iconRule", () => {
  it("accepts any non-empty string without context", () => {
    expect(iconRule.verify("save")).toBeNull();
  });
  it("rejects empty string", () => {
    expect(iconRule.verify("")).not.toBeNull();
  });
  it("rejects non-string types", () => {
    expect(iconRule.verify(42 as unknown)).not.toBeNull();
  });
  it("checks against ctx.icons when supplied", () => {
    expect(iconRule.verify("save", { icons: new Set(["save"]) })).toBeNull();
    expect(iconRule.verify("missing", { icons: new Set(["save"]) })).not.toBeNull();
  });
});

describe("idRefRule", () => {
  it.each(["x", "_x", "$x", "myField_2"])("accepts identifier %p", (raw) => {
    expect(idRefRule.verify(raw)).toBeNull();
  });
  it.each(["", "1abc", "with space", "with-dash"])("rejects %p", (raw) => {
    expect(idRefRule.verify(raw)).not.toBeNull();
  });
  it("checks against ctx.scopeIds when supplied", () => {
    expect(idRefRule.verify("a", { scopeIds: new Set(["a", "b"]) })).toBeNull();
    expect(idRefRule.verify("c", { scopeIds: new Set(["a", "b"]) })).not.toBeNull();
  });
});

describe("verifyEnum", () => {
  it("returns null when value is in the enum", () => {
    expect(verifyEnum("solid", ["solid", "ghost", "outlined"])).toBeNull();
  });

  it("returns null when availableValues is empty/undefined", () => {
    expect(verifyEnum("anything", undefined)).toBeNull();
    expect(verifyEnum("anything", [])).toBeNull();
  });

  it("returns null for null/undefined values regardless of enum", () => {
    expect(verifyEnum(undefined, ["a"])).toBeNull();
    expect(verifyEnum(null, ["a"])).toBeNull();
  });

  it("rejects values outside the enum", () => {
    const failure = verifyEnum("vibrant", ["solid", "ghost"]);
    expect(failure).not.toBeNull();
    expect(failure!.message).toMatch(/not one of/);
  });

  it("supports descriptor-form enum entries", () => {
    expect(
      verifyEnum("solid", [{ value: "solid", description: "" }, { value: "ghost", description: "" }]),
    ).toBeNull();
  });
});
