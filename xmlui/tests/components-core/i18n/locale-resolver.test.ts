import { describe, expect, it } from "vitest";

import { resolveLocale } from "../../../src/components-core/i18n";

describe("resolveLocale", () => {
  it("honors app locale before user, persisted, navigator, and fallback", () => {
    expect(
      resolveLocale({
        appProp: "de-DE",
        userOverride: "fr-FR",
        persisted: "it-IT",
        navigatorLanguages: ["es-ES"],
        available: [],
        fallback: "en",
      }),
    ).toEqual({ locale: "de-DE", source: "app" });
  });

  it("honors explicit app locale even when no matching bundle is available", () => {
    expect(
      resolveLocale({
        appProp: "hu-hu",
        navigatorLanguages: ["en-US"],
        available: ["en"],
        fallback: "en",
      }),
    ).toEqual({ locale: "hu-HU", source: "app" });
  });

  it("uses the first available navigator locale", () => {
    expect(
      resolveLocale({
        navigatorLanguages: ["de-DE", "fr-FR"],
        available: ["fr-FR"],
        fallback: "en",
      }),
    ).toEqual({ locale: "fr-FR", source: "navigator" });
  });

  it("falls back when candidates are invalid or unavailable", () => {
    expect(
      resolveLocale({
        appProp: "not a locale",
        navigatorLanguages: ["de-DE"],
        available: ["fr-FR"],
        fallback: "en",
      }),
    ).toEqual({ locale: "en", source: "fallback" });
  });
});
