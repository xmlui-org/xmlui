import { describe, expect, it } from "vitest";

import { formatIcuMessage } from "../../../src/components-core/i18n";

describe("formatIcuMessage", () => {
  it("formats simple variables", () => {
    expect(formatIcuMessage("Hello {name}", { name: "Ada" }, "en")).toBe("Hello Ada");
  });

  it("formats plural branches", () => {
    const pattern = "{count, plural, one {# file} other {# files}}";
    expect(formatIcuMessage(pattern, { count: 1 }, "en")).toBe("1 file");
    expect(formatIcuMessage(pattern, { count: 2 }, "en")).toBe("2 files");
  });

  it("formats select branches", () => {
    const pattern = "{status, select, draft {Draft} published {Published} other {Unknown}}";
    expect(formatIcuMessage(pattern, { status: "published" }, "en")).toBe("Published");
    expect(formatIcuMessage(pattern, { status: "archived" }, "en")).toBe("Unknown");
  });

  it("formats nested variables in ICU branches", () => {
    const pattern = "{count, plural, one {{name} has one task} other {{name} has # tasks}}";
    expect(formatIcuMessage(pattern, { count: 3, name: "Ada" }, "en")).toBe("Ada has 3 tasks");
  });
});
