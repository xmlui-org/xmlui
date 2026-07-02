import { describe, expect, it, vi } from "vitest";

import { createBundleStore, resolveLocale, translateMessage } from "../../src/components-core/i18n";

describe("i18n core", () => {
  it("resolves locale bundles with language fallback", () => {
    const store = createBundleStore([
      {
        locale: "en",
        messages: {
          greeting: "Hello {name}",
        },
      },
    ]);

    expect(translateMessage("greeting", { name: "Ada" }, { store, locale: "en-US" })).toBe("Hello Ada");
  });

  it("normalizes old locale bundle objects", () => {
    const store = createBundleStore([
      {
        locale: "en",
        messages: new Map([["terms", "Read {name}"]]),
      },
    ]);

    expect(translateMessage("terms", { name: "terms" }, { store, locale: "en" })).toBe("Read terms");
  });

  it("returns the key and emits a diagnostic for missing keys", () => {
    const onDiagnostic = vi.fn();
    const store = createBundleStore();

    expect(translateMessage("missing.key", undefined, { store, locale: "en", onDiagnostic })).toBe("missing.key");
    expect(onDiagnostic).toHaveBeenCalledWith(
      expect.objectContaining({
        code: "missing-key",
        key: "missing.key",
        severity: "warn",
      }),
    );
  });

  it("formats ICU messages from the bundle", () => {
    const store = createBundleStore([
      {
        locale: "en",
        messages: {
          inbox: "{count, plural, one {# message} other {# messages}}",
        },
      },
    ]);

    expect(translateMessage("inbox", { count: 5 }, { store, locale: "en" })).toBe("5 messages");
  });

  it("resolves the browser locale against available app bundles", () => {
    expect(
      resolveLocale({
        navigatorLanguages: ["de-DE", "en-US"],
        available: ["en", "de"],
        fallback: "en",
      }),
    ).toEqual({ locale: "de-DE", source: "navigator" });
  });

  it("prefers the explicit app locale over browser and user locales", () => {
    expect(
      resolveLocale({
        appProp: "en",
        userOverride: "de",
        navigatorLanguages: ["de-DE"],
        available: ["en", "de"],
        fallback: "en",
      }),
    ).toEqual({ locale: "en", source: "app" });
  });

  it("prefers persisted locale over browser locale when App locale is omitted", () => {
    expect(
      resolveLocale({
        persisted: "de",
        navigatorLanguages: ["en-US"],
        available: ["en", "de"],
        fallback: "en",
      }),
    ).toEqual({ locale: "de", source: "persisted" });
  });
});
