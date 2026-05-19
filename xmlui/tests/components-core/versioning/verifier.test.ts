/**
 * Tests for the versioning verifier (plan #12 Phases 1–2).
 */

import { describe, expect, it } from "vitest";
import type { ComponentDef, ComponentMetadata } from "../../../src/abstractions/ComponentDefs";
import { verifyVersioning } from "../../../src/components-core/versioning/verifier";

function registry(entries: Record<string, ComponentMetadata>) {
  return new Map(Object.entries(entries));
}

describe("verifyVersioning — component-level", () => {
  it("emits deprecated-component for status:deprecated", () => {
    const reg = registry({
      OldBox: {
        status: "deprecated",
        deprecationMessage: "Use Box instead.",
      } as ComponentMetadata,
    });
    const def: ComponentDef = { type: "OldBox" } as any;
    const d = verifyVersioning(def, reg);
    expect(d).toHaveLength(1);
    expect(d[0].code).toBe("deprecated-component");
    expect(d[0].severity).toBe("warn");
    expect(d[0].message).toContain("Use Box instead.");
  });

  it("emits experimental-use as info", () => {
    const reg = registry({
      Beta: { status: "experimental" } as ComponentMetadata,
    });
    const d = verifyVersioning({ type: "Beta" } as any, reg);
    expect(d[0].code).toBe("experimental-use");
    expect(d[0].severity).toBe("info");
  });

  it("emits internal-component-use warn by default, error in strict", () => {
    const reg = registry({
      _Internal: { status: "internal" } as ComponentMetadata,
    });
    const def: ComponentDef = { type: "_Internal" } as any;
    expect(verifyVersioning(def, reg)[0].severity).toBe("warn");
    expect(verifyVersioning(def, reg, { strict: true })[0].severity).toBe("error");
  });

  it("returns no diagnostics for stable component", () => {
    const reg = registry({ Box: { status: "stable" } as ComponentMetadata });
    expect(verifyVersioning({ type: "Box" } as any, reg)).toHaveLength(0);
  });
});

describe("verifyVersioning — prop-level", () => {
  const reg = registry({
    Button: {
      status: "stable",
      props: {
        legacyLabel: { deprecationMessage: "Use label." },
        text: {
          deprecatedSince: "0.10.0",
          replacement: "label",
        },
        oldIcon: {
          deprecatedSince: "0.9.0",
          removedIn: "1.0.0",
          replacement: "icon",
        },
        gone: {
          deprecatedSince: "0.8.0",
          removedIn: "0.9.0",
          replacement: "Button.label",
        },
      },
    } as any,
  });

  it("emits deprecated-prop for deprecationMessage", () => {
    const d = verifyVersioning(
      { type: "Button", props: { legacyLabel: "x" } } as any,
      reg,
    );
    expect(d[0].code).toBe("deprecated-prop");
    expect(d[0].message).toContain("Use label.");
  });

  it("emits deprecated-prop for deprecatedSince with timeline", () => {
    const d = verifyVersioning(
      { type: "Button", props: { text: "Hello" } } as any,
      reg,
    );
    expect(d[0].code).toBe("deprecated-prop");
    expect(d[0].deprecatedSince).toBe("0.10.0");
    expect(d[0].replacement).toBe("label");
    expect(d[0].message).toContain("0.10.0");
  });

  it("emits deprecated-prop with removal timeline when removedIn in the future", () => {
    const d = verifyVersioning(
      { type: "Button", props: { oldIcon: "ic" } } as any,
      reg,
      { currentVersion: "0.10.0" },
    );
    expect(d[0].code).toBe("deprecated-prop");
    expect(d[0].message).toContain("1.0.0");
  });

  it("emits removed-prop when currentVersion >= removedIn", () => {
    const d = verifyVersioning(
      { type: "Button", props: { gone: "x" } } as any,
      reg,
      { currentVersion: "1.0.0" },
    );
    expect(d[0].code).toBe("removed-prop");
    expect(d[0].severity).toBe("warn");
    expect(d[0].replacement).toBe("Button.label");
  });

  it("removed-prop escalates to error in strict mode", () => {
    const d = verifyVersioning(
      { type: "Button", props: { gone: "x" } } as any,
      reg,
      { currentVersion: "1.0.0", strict: true },
    );
    expect(d[0].severity).toBe("error");
  });

  it("backward compatible: pure deprecationMessage still works", () => {
    const d = verifyVersioning(
      { type: "Button", props: { legacyLabel: "x" } } as any,
      reg,
      { currentVersion: "2.0.0" },
    );
    expect(d).toHaveLength(1);
    expect(d[0].code).toBe("deprecated-prop");
  });
});

describe("verifyVersioning — recursion", () => {
  it("walks children", () => {
    const reg = registry({
      A: { status: "stable" } as ComponentMetadata,
      Old: { status: "deprecated" } as ComponentMetadata,
    });
    const d = verifyVersioning(
      { type: "A", children: [{ type: "Old" }, { type: "A" }] } as any,
      reg,
    );
    expect(d).toHaveLength(1);
    expect(d[0].componentName).toBe("Old");
  });
});
