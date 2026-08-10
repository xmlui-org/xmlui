import { describe, expect, it } from "vitest";
import { normalizeValueType } from "../../../src/components/Value/value-types";
import { formatValue } from "../../../src/components/Value/value-formatting";

function type(input: string, options?: Record<string, unknown>) {
  return normalizeValueType(input, options).type;
}

describe("Value formatting", () => {
  it("renders nullish values as empty except explicit json", () => {
    expect(formatValue(null, type("text"))).toEqual({ kind: "empty", text: "" });
    expect(formatValue(undefined, type("number"))).toEqual({ kind: "empty", text: "" });
    expect(formatValue(null, type("json"))).toEqual({ kind: "json", text: "null" });
  });

  it("formats number precision and decimal parts", () => {
    expect(formatValue(1234.5678, type("number(8,3)"), { locale: "en-US" })).toEqual({
      kind: "number",
      text: "1,234.568",
      integerPart: "1,234",
      decimalSeparator: ".",
      fractionPart: "568",
    });
  });

  it("formats integers and decimals", () => {
    expect(formatValue(12.7, type("integer"), { locale: "en-US" }).text).toBe("13");
    expect(formatValue(12.7, type("decimal(2)"), { locale: "en-US" }).text).toBe("12.70");
  });

  it("uses value locale options for numeric formatting", () => {
    expect(formatValue(1976, type("number", { locale: "hu-HU" })).text).toBe("1976");
    expect(formatValue(1234.5, type("decimal(1)", { locale: "hu-HU" })).text).toBe(
      "1234,5",
    );
  });

  it("uses locale profile options when the value has no explicit locale", () => {
    expect(
      formatValue(12345.5, type("decimal(1)"), {
        localeProfile: {
          locale: "en-US",
          decimalSeparator: ",",
          groupSeparator: " ",
        },
      }).text,
    ).toBe("12 345,5");
  });

  it("uses locale profile currency when the value has no explicit currency", () => {
    expect(
      formatValue(1299.95, type("currency"), {
        localeProfile: {
          locale: "fr-FR",
          currency: "EUR",
        },
      }).text,
    ).toBe("1 299,95 €");
  });

  it("lets value locale options override locale profile options", () => {
    expect(
      formatValue(12345.5, type("decimal(1)", { locale: "en-US" }), {
        localeProfile: {
          locale: "hu-HU",
          decimalSeparator: "|",
          groupSeparator: "_",
        },
      }).text,
    ).toBe("12,345.5");
  });

  it("lets explicit value currency override locale profile currency", () => {
    expect(
      formatValue(1299.95, type("currency(USD)"), {
        localeProfile: {
          locale: "fr-FR",
          currency: "EUR",
        },
      }).text,
    ).toBe("1 299,95 $US");
  });

  it("formats currency, accounting, percent, and scientific values", () => {
    expect(formatValue(12.5, type("currency(USD)"), { locale: "en-US" }).text).toBe(
      "$12.50",
    );
    expect(formatValue(-12.5, type("accounting(USD)"), { locale: "en-US" }).text).toBe(
      "($12.50)",
    );
    expect(formatValue(0.12, type("percent"), { locale: "en-US" }).text).toBe("12%");
    expect(formatValue(1200, type("scientific"), { locale: "en-US" }).text).toBe("1.2E3");
  });

  it("formats dates and relative time with stable inputs", () => {
    expect(formatValue("2026-08-06", type("iso-date"), { locale: "en-US" }).text).toBe(
      "2026-08-06",
    );
    expect(formatValue("2026-08-06T12:00:00Z", type("timestamp")).text).toBe(
      "1786017600000",
    );
    expect(
      formatValue("2026-08-06T11:00:00Z", type("relative-time"), {
        locale: "en-US",
        now: new Date("2026-08-06T12:00:00Z"),
      }).text,
    ).toBe("1 hour ago");
  });

  it("formats booleans", () => {
    expect(formatValue(true, type("boolean"))).toEqual({ kind: "boolean", text: "true" });
    expect(formatValue(false, type("yes-no"))).toEqual({ kind: "yes-no", text: "No" });
    expect(formatValue(true, type("checkbox"))).toEqual({ kind: "checkbox", text: "✓" });
  });

  it("formats link-like values", () => {
    expect(formatValue("ada@example.com", type("email"))).toEqual({
      kind: "link",
      text: "ada@example.com",
      href: "mailto:ada@example.com",
    });
    expect(formatValue("+1 555 123 4567", type("phone"))).toEqual({
      kind: "link",
      text: "+1 555 123 4567",
      href: "tel:+1 555 123 4567",
    });
    expect(formatValue("https://example.com/path", type("url(label:domain)"))).toEqual({
      kind: "link",
      text: "example.com",
      href: "https://example.com/path",
    });
  });

  it("formats enum and status labels from typeOptions", () => {
    expect(
      formatValue("sent", type("enum", { sent: { label: "Sent to customer" } })),
    ).toEqual({
      kind: "enum",
      text: "Sent to customer",
    });
    expect(formatValue("failed", type("status", { failed: "Failed" }))).toEqual({
      kind: "status",
      text: "Failed",
    });
  });

  it("formats structured values", () => {
    expect(formatValue({ a: 1 }, type("object"))).toEqual({
      kind: "json",
      text: '{"a":1}',
    });
    expect(formatValue("alpha", type("tag"))).toEqual({
      kind: "tag",
      text: "alpha",
    });
    expect(formatValue(["red", "blue"], type("tags"))).toEqual({
      kind: "tags",
      text: "red, blue",
    });
    expect(formatValue(["red", "blue"], type("list"))).toEqual({
      kind: "list",
      text: "red, blue",
    });
    expect(formatValue([1, 2], type("array"))).toEqual({
      kind: "json",
      text: "[1,2]",
    });
  });

  it("formats text-like display types with their own render kinds", () => {
    expect(formatValue("short", type("short-text"))).toEqual({
      kind: "short-text",
      text: "short",
    });
    expect(formatValue("long body", type("long-text"))).toEqual({
      kind: "long-text",
      text: "long body",
    });
    expect(formatValue("**bold**", type("markdown"))).toEqual({
      kind: "markdown",
      text: "**bold**",
    });
    expect(formatValue("const x = 1;", type("code"))).toEqual({
      kind: "code",
      text: "const x = 1;",
    });
    expect(formatValue("47f4d9f8-2f6a-4e3d-9bf5-010d74822c6f", type("uuid"))).toEqual({
      kind: "uuid",
      text: "47f4d9f8-2f6a-4e3d-9bf5-010d74822c6f",
    });
    expect(formatValue("customer-00000042", type("id(short)"))).toEqual({
      kind: "id",
      text: "customer...",
    });
    expect(formatValue("Ada Lovelace", type("name"))).toEqual({
      kind: "name",
      text: "Ada Lovelace",
    });
    expect(formatValue("1 Infinite Loop", type("address"))).toEqual({
      kind: "address",
      text: "1 Infinite Loop",
    });
  });

  it("formats visual display types", () => {
    expect(formatValue("#336699", type("color"))).toEqual({
      kind: "color",
      text: "#336699",
      color: "#336699",
    });
    expect(formatValue("/avatar.png", type("image", { alt: "Portrait" }))).toEqual({
      kind: "image",
      text: "/avatar.png",
      src: "/avatar.png",
      alt: "Portrait",
    });
    expect(formatValue("/avatar.png", type("avatar", { label: "Ada" }))).toEqual({
      kind: "avatar",
      text: "/avatar.png",
      src: "/avatar.png",
      alt: "Ada",
    });
    expect(formatValue("check", type("icon"))).toEqual({
      kind: "icon",
      text: "check",
      iconName: "check",
    });
  });

  it("formats utility numeric display types", () => {
    expect(formatValue(1536, type("bytes"), { locale: "en-US" })).toEqual({
      kind: "number",
      text: "1.5 KB",
      integerPart: "1.5",
      suffixPart: " KB",
    });
    expect(formatValue(3661, type("duration"))).toEqual({
      kind: "duration",
      text: "1h 1m 1s",
    });
    expect(formatValue(4, type("rating(5)"), { locale: "en-US" })).toEqual({
      kind: "rating",
      text: "4 / 5",
    });
  });

  it("falls back to text for invalid numeric and date values", () => {
    expect(formatValue("abc", type("number"))).toEqual({ kind: "text", text: "abc" });
    expect(formatValue("not a date", type("date"))).toEqual({
      kind: "text",
      text: "not a date",
    });
  });
});
