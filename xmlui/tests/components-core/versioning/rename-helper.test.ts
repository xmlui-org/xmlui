/**
 * Tests for the prop rename helper (plan #12 Phase 2 §2.4).
 */

import { describe, expect, it } from "vitest";
import { applyRenames } from "../../../src/components-core/versioning/rename-helper";

describe("applyRenames", () => {
  it("empty rename list is a no-op", () => {
    const out = applyRenames({ a: 1 }, []);
    expect(out.props).toEqual({ a: 1 });
    expect(out.diagnostics).toEqual([]);
  });

  it("rewrites a single rename and emits one diagnostic", () => {
    const out = applyRenames(
      { pattern: "[a-z]+" },
      [{ from: "pattern", to: "validator", deprecatedSince: "0.10.0" }],
      "TextBox",
    );
    expect(out.props).toEqual({ validator: "[a-z]+" });
    expect(out.diagnostics).toHaveLength(1);
    expect(out.diagnostics[0].code).toBe("renamed-prop");
    expect(out.diagnostics[0].severity).toBe("warn");
    expect(out.diagnostics[0].componentName).toBe("TextBox");
    expect(out.diagnostics[0].replacement).toBe("validator");
  });

  it("when both old and new are present, new wins and info diagnostic is emitted", () => {
    const out = applyRenames(
      { pattern: "old", validator: "new" },
      [{ from: "pattern", to: "validator", deprecatedSince: "0.10.0" }],
    );
    expect(out.props).toEqual({ validator: "new" });
    expect(out.diagnostics[0].severity).toBe("info");
    expect(out.diagnostics[0].message).toContain("takes precedence");
  });

  it("transform runs on the migrated value", () => {
    const out = applyRenames(
      { count: "5" },
      [
        {
          from: "count",
          to: "limit",
          deprecatedSince: "0.10.0",
          transform: (v) => Number(v),
        },
      ],
    );
    expect(out.props).toEqual({ limit: 5 });
  });

  it("preserves unrelated props", () => {
    const out = applyRenames(
      { a: 1, pattern: 2, c: 3 },
      [{ from: "pattern", to: "validator", deprecatedSince: "0.10.0" }],
    );
    expect(out.props).toEqual({ a: 1, validator: 2, c: 3 });
  });

  it("includes removedIn in the diagnostic message", () => {
    const out = applyRenames(
      { pattern: "x" },
      [
        {
          from: "pattern",
          to: "validator",
          deprecatedSince: "0.10.0",
          removedIn: "1.0.0",
        },
      ],
    );
    expect(out.diagnostics[0].removedIn).toBe("1.0.0");
    expect(out.diagnostics[0].message).toContain("removed in 1.0.0");
  });
});
