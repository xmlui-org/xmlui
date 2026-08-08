import { describe, expect, it, vi } from "vitest";

import {
  formatCurrencyWithLocaleProfile,
  formatNumberWithLocaleProfile,
  normalizeLocaleProfile,
  type LocaleProfile,
} from "../../../src/components-core/i18n";

describe("locale profile", () => {
  it("normalizes valid locale identifiers", () => {
    expect(normalizeLocaleProfile({ locale: "EN-us" })).toMatchObject({
      locale: "en-US",
    });
  });

  it("inherits parent locale and traits", () => {
    const parent: LocaleProfile = {
      locale: "de-DE",
      decimalSeparator: ",",
      groupSeparator: ".",
      minusSign: "-",
      source: "app",
    };

    expect(normalizeLocaleProfile({ groupSeparator: " " }, parent)).toEqual({
      locale: "de-DE",
      decimalSeparator: ",",
      groupSeparator: " ",
      minusSign: "-",
      source: "app",
    });
  });

  it("falls back to parent locale when a child locale is invalid", () => {
    const onInvalidLocale = vi.fn();
    const profile = normalizeLocaleProfile(
      { locale: "not a locale", decimalSeparator: "," },
      { locale: "fr-FR", source: "app" },
      onInvalidLocale,
    );

    expect(profile).toMatchObject({
      locale: "fr-FR",
      decimalSeparator: ",",
    });
    expect(onInvalidLocale).toHaveBeenCalledWith("not a locale");
  });

  it("uses thousandSeparator as an alias for groupSeparator", () => {
    expect(normalizeLocaleProfile({ thousandSeparator: "'" })).toMatchObject({
      groupSeparator: "'",
    });
  });

  it("applies number-part overrides without changing digits", () => {
    const text = formatNumberWithLocaleProfile(-1234.5, {
      locale: "en-US",
      decimalSeparator: ",",
      groupSeparator: " ",
      minusSign: "−",
    });

    expect(text).toBe("−1 234,5");
  });

  it("applies currency separator overrides without changing currency text", () => {
    const text = formatCurrencyWithLocaleProfile(1234.5, "USD", {
      locale: "en-US",
      decimalSeparator: ",",
      groupSeparator: " ",
    });

    expect(text).toBe("$1 234,50");
  });

  it("uses the profile currency when no currency argument is provided", () => {
    const text = formatCurrencyWithLocaleProfile(1234.5, undefined, {
      locale: "en-US",
      decimalSeparator: ",",
      groupSeparator: " ",
      currency: "EUR",
    });

    expect(text).toBe("€1 234,50");
  });

  it("forwards numberingSystem to Intl number formatting", () => {
    const text = formatNumberWithLocaleProfile(1234, {
      locale: "en-US",
      numberingSystem: "arab",
    });

    expect(text).toContain("١");
  });
});
