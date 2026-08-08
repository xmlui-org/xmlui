import { describe, expect, it } from "vitest";
import { normalizeColumnType } from "../../../src/components/Column/column-types";
import { formatTableCellValue } from "../../../src/components/Table/table-cell-formatting";

function type(input: string, options?: Record<string, unknown>) {
  return normalizeColumnType(input, options).type;
}

describe("Table typed cell formatting", () => {
  it("renders nullish values as empty except explicit json", () => {
    expect(formatTableCellValue(null, type("text"))).toEqual({ kind: "empty", text: "" });
    expect(formatTableCellValue(undefined, type("number"))).toEqual({ kind: "empty", text: "" });
    expect(formatTableCellValue(null, type("json"))).toEqual({ kind: "json", text: "null" });
  });

  it("formats number precision and decimal parts", () => {
    expect(formatTableCellValue(1234.5678, type("number(8,3)"), { locale: "en-US" })).toEqual({
      kind: "number",
      text: "1,234.568",
      integerPart: "1,234",
      decimalSeparator: ".",
      fractionPart: "568",
    });
  });

  it("formats integers and decimals", () => {
    expect(formatTableCellValue(12.7, type("integer"), { locale: "en-US" }).text).toBe("13");
    expect(formatTableCellValue(12.7, type("decimal(2)"), { locale: "en-US" }).text).toBe("12.70");
  });

  it("uses column locale options for numeric formatting", () => {
    expect(formatTableCellValue(1976, type("number", { locale: "hu-HU" })).text).toBe("1976");
    expect(formatTableCellValue(1234.5, type("decimal(1)", { locale: "hu-HU" })).text).toBe(
      "1234,5",
    );
  });

  it("formats currency, accounting, percent, and scientific values", () => {
    expect(formatTableCellValue(12.5, type("currency(USD)"), { locale: "en-US" }).text).toBe(
      "$12.50",
    );
    expect(formatTableCellValue(-12.5, type("accounting(USD)"), { locale: "en-US" }).text).toBe(
      "($12.50)",
    );
    expect(formatTableCellValue(0.12, type("percent"), { locale: "en-US" }).text).toBe("12%");
    expect(formatTableCellValue(1200, type("scientific"), { locale: "en-US" }).text).toBe("1.2E3");
  });

  it("formats dates and relative time with stable inputs", () => {
    expect(formatTableCellValue("2026-08-06", type("iso-date"), { locale: "en-US" }).text).toBe(
      "2026-08-06",
    );
    expect(formatTableCellValue("2026-08-06T12:00:00Z", type("timestamp")).text).toBe(
      "1786017600000",
    );
    expect(
      formatTableCellValue("2026-08-06T11:00:00Z", type("relative-time"), {
        locale: "en-US",
        now: new Date("2026-08-06T12:00:00Z"),
      }).text,
    ).toBe("1 hour ago");
  });

  it("formats booleans", () => {
    expect(formatTableCellValue(true, type("boolean"))).toEqual({ kind: "boolean", text: "true" });
    expect(formatTableCellValue(false, type("yes-no"))).toEqual({ kind: "yes-no", text: "No" });
    expect(formatTableCellValue(true, type("checkbox"))).toEqual({ kind: "checkbox", text: "✓" });
  });

  it("formats link-like values", () => {
    expect(formatTableCellValue("ada@example.com", type("email"))).toEqual({
      kind: "link",
      text: "ada@example.com",
      href: "mailto:ada@example.com",
    });
    expect(formatTableCellValue("+1 555 123 4567", type("phone"))).toEqual({
      kind: "link",
      text: "+1 555 123 4567",
      href: "tel:+1 555 123 4567",
    });
    expect(formatTableCellValue("https://example.com/path", type("url(label:domain)"))).toEqual({
      kind: "link",
      text: "example.com",
      href: "https://example.com/path",
    });
  });

  it("formats enum and status labels from typeOptions", () => {
    expect(
      formatTableCellValue("sent", type("enum", { sent: { label: "Sent to customer" } })),
    ).toEqual({
      kind: "enum",
      text: "Sent to customer",
    });
    expect(formatTableCellValue("failed", type("status", { failed: "Failed" }))).toEqual({
      kind: "status",
      text: "Failed",
    });
  });

  it("formats structured values", () => {
    expect(formatTableCellValue({ a: 1 }, type("object"))).toEqual({
      kind: "json",
      text: '{"a":1}',
    });
    expect(formatTableCellValue("alpha", type("tag"))).toEqual({
      kind: "tag",
      text: "alpha",
    });
    expect(formatTableCellValue(["red", "blue"], type("tags"))).toEqual({
      kind: "tags",
      text: "red, blue",
    });
    expect(formatTableCellValue(["red", "blue"], type("list"))).toEqual({
      kind: "list",
      text: "red, blue",
    });
    expect(formatTableCellValue([1, 2], type("array"))).toEqual({
      kind: "json",
      text: "[1,2]",
    });
  });

  it("formats text-like display types with their own render kinds", () => {
    expect(formatTableCellValue("short", type("short-text"))).toEqual({
      kind: "short-text",
      text: "short",
    });
    expect(formatTableCellValue("long body", type("long-text"))).toEqual({
      kind: "long-text",
      text: "long body",
    });
    expect(formatTableCellValue("**bold**", type("markdown"))).toEqual({
      kind: "markdown",
      text: "**bold**",
    });
    expect(formatTableCellValue("const x = 1;", type("code"))).toEqual({
      kind: "code",
      text: "const x = 1;",
    });
    expect(formatTableCellValue("47f4d9f8-2f6a-4e3d-9bf5-010d74822c6f", type("uuid"))).toEqual({
      kind: "uuid",
      text: "47f4d9f8-2f6a-4e3d-9bf5-010d74822c6f",
    });
    expect(formatTableCellValue("customer-00000042", type("id(short)"))).toEqual({
      kind: "id",
      text: "customer...",
    });
    expect(formatTableCellValue("Ada Lovelace", type("name"))).toEqual({
      kind: "name",
      text: "Ada Lovelace",
    });
    expect(formatTableCellValue("1 Infinite Loop", type("address"))).toEqual({
      kind: "address",
      text: "1 Infinite Loop",
    });
  });

  it("formats visual display types", () => {
    expect(formatTableCellValue("#336699", type("color"))).toEqual({
      kind: "color",
      text: "#336699",
      color: "#336699",
    });
    expect(formatTableCellValue("/avatar.png", type("image", { alt: "Portrait" }))).toEqual({
      kind: "image",
      text: "/avatar.png",
      src: "/avatar.png",
      alt: "Portrait",
    });
    expect(formatTableCellValue("/avatar.png", type("avatar", { label: "Ada" }))).toEqual({
      kind: "avatar",
      text: "/avatar.png",
      src: "/avatar.png",
      alt: "Ada",
    });
    expect(formatTableCellValue("check", type("icon"))).toEqual({
      kind: "icon",
      text: "check",
      iconName: "check",
    });
  });

  it("formats utility numeric display types", () => {
    expect(formatTableCellValue(1536, type("bytes"), { locale: "en-US" })).toEqual({
      kind: "number",
      text: "1.5 KB",
      integerPart: "1.5",
      suffixPart: " KB",
    });
    expect(formatTableCellValue(3661, type("duration"))).toEqual({
      kind: "duration",
      text: "1h 1m 1s",
    });
    expect(formatTableCellValue(4, type("rating(5)"), { locale: "en-US" })).toEqual({
      kind: "rating",
      text: "4 / 5",
    });
  });

  it("falls back to text for invalid numeric and date values", () => {
    expect(formatTableCellValue("abc", type("number"))).toEqual({ kind: "text", text: "abc" });
    expect(formatTableCellValue("not a date", type("date"))).toEqual({
      kind: "text",
      text: "not a date",
    });
  });
});
