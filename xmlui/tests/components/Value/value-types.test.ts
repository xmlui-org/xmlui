import { describe, expect, it } from "vitest";
import {
  VALUE_TYPE_NAMES,
  normalizeValueType,
  type ValueTypeName,
} from "../../../src/components/Value/value-types";

function expectType(input: unknown, expectedName: ValueTypeName) {
  const result = normalizeValueType(input);
  expect(result.type.name).toBe(expectedName);
  expect(result.type.source).toBe("explicit");
  expect(result.diagnostics).toEqual([]);
  return result.type;
}

describe("Value type parser", () => {
  describe("bare type names", () => {
    it("parses every supported bare type without diagnostics", () => {
      for (const typeName of VALUE_TYPE_NAMES) {
        const type = expectType(typeName, typeName);
        expect(type.args).toBeUndefined();
      }
    });

    it("normalizes type name casing", () => {
      expectType("Currency", "currency");
      expectType("SHORT-TEXT", "short-text");
      expectType("Relative-Time", "relative-time");
    });

    it("ignores surrounding whitespace", () => {
      expectType("  number  ", "number");
    });
  });

  describe("positional arguments", () => {
    it("parses number precision and scale", () => {
      const { type, diagnostics } = normalizeValueType("number(8,3)");
      expect(diagnostics).toEqual([]);
      expect(type).toMatchObject({
        name: "number",
        args: [8, 3],
        options: { precision: 8, scale: 3 },
      });
    });

    it("parses decimal scale", () => {
      const { type, diagnostics } = normalizeValueType("decimal(2)");
      expect(diagnostics).toEqual([]);
      expect(type).toMatchObject({
        name: "decimal",
        args: [2],
        options: { scale: 2 },
      });
    });

    it("parses and uppercases currency codes", () => {
      const { type, diagnostics } = normalizeValueType("currency(usd)");
      expect(diagnostics).toEqual([]);
      expect(type).toMatchObject({
        name: "currency",
        args: ["USD"],
        options: { currency: "USD" },
      });
    });

    it("parses accounting currency codes", () => {
      const { type, diagnostics } = normalizeValueType("accounting(EUR)");
      expect(diagnostics).toEqual([]);
      expect(type).toMatchObject({
        name: "accounting",
        args: ["EUR"],
        options: { currency: "EUR" },
      });
    });

    it("parses rating max", () => {
      const { type, diagnostics } = normalizeValueType("rating(5)");
      expect(diagnostics).toEqual([]);
      expect(type).toMatchObject({
        name: "rating",
        args: [5],
        options: { max: 5 },
      });
    });

    it("parses date, time, and datetime styles", () => {
      expect(normalizeValueType("date(short)").type.options).toEqual({ style: "short" });
      expect(normalizeValueType("time(medium)").type.options).toEqual({ style: "medium" });
      expect(normalizeValueType("datetime(long)").type.options).toEqual({ style: "long" });
    });

    it("parses id display mode", () => {
      const { type, diagnostics } = normalizeValueType("id(short)");
      expect(diagnostics).toEqual([]);
      expect(type).toMatchObject({
        name: "id",
        args: ["short"],
        options: { mode: "short" },
      });
    });

    it("ignores whitespace around positional arguments", () => {
      const { type, diagnostics } = normalizeValueType(" number( 8 , 3 ) ");
      expect(diagnostics).toEqual([]);
      expect(type.options).toEqual({ precision: 8, scale: 3 });
    });
  });

  describe("named arguments", () => {
    it("parses named arguments into options", () => {
      const { type, diagnostics } = normalizeValueType("long-text(lines:3)");
      expect(diagnostics).toEqual([]);
      expect(type).toMatchObject({
        name: "long-text",
        options: { lines: 3 },
      });
      expect(type.args).toBeUndefined();
    });

    it("parses multiple named arguments", () => {
      const { type, diagnostics } = normalizeValueType("link(label:name,target:url)");
      expect(diagnostics).toEqual([]);
      expect(type).toMatchObject({
        name: "link",
        options: { label: "name", target: "url" },
      });
    });

    it("parses quoted named argument values", () => {
      const { type, diagnostics } = normalizeValueType("url(label:'Visit site')");
      expect(diagnostics).toEqual([]);
      expect(type.options).toEqual({ label: "Visit site" });
    });

    it("reports duplicate named arguments and keeps the first value", () => {
      const { type, diagnostics } = normalizeValueType("long-text(lines:2,lines:4)");
      expect(type.options).toEqual({ lines: 2 });
      expect(diagnostics).toHaveLength(1);
      expect(diagnostics[0]).toMatchObject({
        code: "invalid-argument",
        argument: "lines",
      });
    });
  });

  describe("typeOptions", () => {
    it("merges typeOptions into a bare type", () => {
      const options = { currency: "USD", minimumFractionDigits: 2 };
      const { type, diagnostics } = normalizeValueType("currency", options);
      expect(diagnostics).toEqual([]);
      expect(type).toMatchObject({
        name: "currency",
        options,
      });
    });

    it("lets typeOptions override positional argument options", () => {
      const { type, diagnostics } = normalizeValueType("currency(USD)", { currency: "EUR" });
      expect(diagnostics).toEqual([]);
      expect(type.options).toEqual({ currency: "EUR" });
      expect(type.args).toEqual(["USD"]);
    });

    it("lets typeOptions override named argument options", () => {
      const { type, diagnostics } = normalizeValueType("long-text(lines:2)", { lines: 4 });
      expect(diagnostics).toEqual([]);
      expect(type.options).toEqual({ lines: 4 });
    });

    it("does not mutate typeOptions", () => {
      const options = { lines: 3 };
      const { type } = normalizeValueType("long-text(lines:2)", options);
      expect(options).toEqual({ lines: 3 });
      expect(type.options).toEqual({ lines: 3 });
    });

    it("reports and ignores non-object typeOptions", () => {
      const { type, diagnostics } = normalizeValueType("text", "bad options");
      expect(type).toMatchObject({ name: "text" });
      expect(type.options).toBeUndefined();
      expect(diagnostics).toEqual([
        expect.objectContaining({
          code: "invalid-type-options",
        }),
      ]);
    });

    it("reports and ignores array typeOptions", () => {
      const { type, diagnostics } = normalizeValueType("text", ["bad"]);
      expect(type).toMatchObject({ name: "text" });
      expect(type.options).toBeUndefined();
      expect(diagnostics[0]).toMatchObject({ code: "invalid-type-options" });
    });

    it("reports invalid typeOptions once on fallback paths", () => {
      const { type, diagnostics } = normalizeValueType("number(x,3)", ["bad"]);
      expect(type).toMatchObject({ name: "text", source: "fallback" });
      expect(diagnostics.map((diagnostic) => diagnostic.code)).toEqual([
        "invalid-argument",
        "invalid-type-options",
      ]);
    });
  });

  describe("invalid type strings", () => {
    it("falls back for empty strings", () => {
      const { type, diagnostics } = normalizeValueType("   ");
      expect(type).toMatchObject({ name: "text", source: "fallback" });
      expect(diagnostics[0]).toMatchObject({ code: "empty-type" });
    });

    it("falls back for non-string values", () => {
      const { type, diagnostics } = normalizeValueType(42);
      expect(type).toMatchObject({ name: "text", source: "fallback" });
      expect(diagnostics[0]).toMatchObject({ code: "invalid-type-value" });
    });

    it("falls back for unknown types", () => {
      const { type, diagnostics } = normalizeValueType("money");
      expect(type).toMatchObject({ name: "text", source: "fallback" });
      expect(diagnostics[0]).toMatchObject({
        code: "unknown-type",
        input: "money",
      });
    });

    it.each([
      "number(8,3",
      "number(8,3))",
      "number()",
      "number(8,)",
      "number(8,,3)",
      "number((8),3)",
      "number(8,3).toString()",
      "number({precision:8})",
    ])("falls back for malformed argument syntax: %s", (input) => {
      const { type, diagnostics } = normalizeValueType(input);
      expect(type).toMatchObject({ name: "text", source: "fallback" });
      expect(diagnostics[0].code).toBe("malformed-arguments");
    });

    it.each([
      ["number(x,3)", "invalid-argument"],
      ["number(3,8)", "invalid-argument"],
      ["number(-1,0)", "invalid-argument"],
      ["decimal(-1)", "invalid-argument"],
      ["currency(US)", "invalid-argument"],
      ["rating(0)", "invalid-argument"],
      ["date(tiny)", "invalid-argument"],
      ["id(compact)", "invalid-argument"],
      ["text(short)", "unsupported-arguments"],
    ] as const)("falls back for invalid arguments: %s", (input, code) => {
      const { type, diagnostics } = normalizeValueType(input);
      expect(type).toMatchObject({ name: "text", source: "fallback" });
      expect(diagnostics[0].code).toBe(code);
    });

    it("falls back for mixed positional and named arguments", () => {
      const { type, diagnostics } = normalizeValueType("link(name,target:url)");
      expect(type).toMatchObject({ name: "text", source: "fallback" });
      expect(diagnostics[0]).toMatchObject({ code: "malformed-arguments" });
    });

    it("does not execute dangerous-looking strings", () => {
      const { type, diagnostics } = normalizeValueType("url(label:window.alert('x'))");
      expect(type).toMatchObject({ name: "text", source: "fallback" });
      expect(diagnostics[0]).toMatchObject({ code: "malformed-arguments" });
    });

    it("never throws for malformed public input", () => {
      const inputs = [
        undefined,
        null,
        "",
        {},
        [],
        "bad(type",
        "number(x,3)",
        "text(alert:window.alert('x'))",
      ];

      for (const input of inputs) {
        expect(() => normalizeValueType(input)).not.toThrow();
      }
    });
  });

  describe("source handling", () => {
    it("preserves inferred source for valid inferred types", () => {
      const { type, diagnostics } = normalizeValueType("number", undefined, "inferred");
      expect(diagnostics).toEqual([]);
      expect(type).toMatchObject({
        name: "number",
        source: "inferred",
      });
    });

    it("uses fallback source when an inferred type is invalid", () => {
      const { type, diagnostics } = normalizeValueType("wat", undefined, "inferred");
      expect(type).toMatchObject({
        name: "text",
        source: "fallback",
      });
      expect(diagnostics[0]).toMatchObject({ code: "unknown-type" });
    });
  });
});
