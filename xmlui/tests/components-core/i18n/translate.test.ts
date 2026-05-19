import { describe, expect, it, vi } from "vitest";

import { createBundleStore, translateMessage } from "../../../src/components-core/i18n";

describe("translateMessage", () => {
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
});
