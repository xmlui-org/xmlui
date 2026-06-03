/**
 * @vitest-environment jsdom
 *
 * Tests for the prop coercion helpers (plan #12 §2.2 / §2.3):
 *   - `applyValueAliases`        — legacy enum rewrite + `deprecated-value`
 *   - `applyPreserveLegacyDefault` — opt-back to old default + `default-value-changed`
 */

import { beforeEach, describe, expect, it } from "vitest";
import {
  applyValueAliases,
  applyPreserveLegacyDefault,
} from "../../../src/components-core/versioning/propCoercion";
import { _resetVersioningDedup } from "../../../src/components-core/versioning/runtime";
import type { ComponentPropertyMetadata } from "../../../src/abstractions/ComponentDefs";

beforeEach(() => {
  _resetVersioningDedup();
  if (typeof window !== "undefined") {
    (window as any)._xsLogs = [];
  }
});

describe("applyValueAliases", () => {
  const meta: ComponentPropertyMetadata = {
    description: "size",
    valueAliases: [
      { from: "huge", to: "xl", deprecatedSince: "1.4.0", removedIn: "2.0.0" },
    ],
  } as any;

  it("returns the original value when there is no match", () => {
    expect(applyValueAliases("Modal", "size", "xl", meta)).toBe("xl");
    expect((window as any)._xsLogs).toHaveLength(0);
  });

  it("returns the original value when there are no aliases", () => {
    expect(applyValueAliases("Modal", "size", "huge", { description: "x" } as any)).toBe("huge");
  });

  it("rewrites a matching value and emits a deprecated-value diagnostic", () => {
    expect(applyValueAliases("Modal", "size", "huge", meta)).toBe("xl");
    const logs = (window as any)._xsLogs;
    expect(logs).toHaveLength(1);
    expect(logs[0].code).toBe("deprecated-value");
    expect(logs[0].componentName).toBe("Modal");
    expect(logs[0].propName).toBe("size");
    expect(logs[0].replacement).toBe("xl");
    expect(logs[0].deprecatedSince).toBe("1.4.0");
    expect(logs[0].removedIn).toBe("2.0.0");
  });

  it("ignores non-string values", () => {
    expect(applyValueAliases("Modal", "size", 42 as any, meta)).toBe(42);
    expect((window as any)._xsLogs).toHaveLength(0);
  });
});

describe("applyPreserveLegacyDefault", () => {
  const meta: ComponentPropertyMetadata = {
    description: "submitPolicy",
    defaultValueChangedIn: [
      { version: "1.5.0", previousDefault: "any", note: "Forms strict by default." },
    ],
  } as any;

  it("returns undefined when the opt-back is not configured", () => {
    expect(
      applyPreserveLegacyDefault("Form", "submitPolicy", meta, {}),
    ).toBeUndefined();
    expect((window as any)._xsLogs).toHaveLength(0);
  });

  it("returns the previous default and emits a default-value-changed info when opted in", () => {
    const result = applyPreserveLegacyDefault("Form", "submitPolicy", meta, {
      preserveLegacyDefaults: ["Form.submitPolicy"],
    });
    expect(result).toBe("any");
    const logs = (window as any)._xsLogs;
    expect(logs).toHaveLength(1);
    expect(logs[0].code).toBe("default-value-changed");
    expect(logs[0].severity).toBe("info");
    expect(logs[0].componentName).toBe("Form");
    expect(logs[0].propName).toBe("submitPolicy");
  });

  it("returns undefined when metadata has no recorded default changes", () => {
    expect(
      applyPreserveLegacyDefault(
        "Foo",
        "bar",
        { description: "x" } as any,
        { preserveLegacyDefaults: ["Foo.bar"] },
      ),
    ).toBeUndefined();
  });
});
