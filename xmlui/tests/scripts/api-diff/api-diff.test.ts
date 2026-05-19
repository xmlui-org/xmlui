/**
 * Tests for the api-diff extractor + differ + changeset suggester
 * (plan #12 Phase 3 Steps 3.1, 3.2, 3.3).
 */

import { describe, expect, it } from "vitest";
import { extractApiSurface, serializeApiSurface } from "../../../scripts/api-diff/extract";
import { diffApiSurfaces } from "../../../scripts/api-diff/diff";
import {
  parseChangeset,
  suggestChangeset,
} from "../../../scripts/api-diff/suggest-changeset";
import type { ComponentMetadata } from "../../../src/abstractions/ComponentDefs";

function reg(entries: Record<string, ComponentMetadata>) {
  return new Map(Object.entries(entries));
}

describe("extractApiSurface", () => {
  it("captures props, events, methods, status; output is deterministic", () => {
    const r = reg({
      Button: {
        status: "stable",
        props: { label: { valueType: "string" } as any },
        events: { click: { description: "x" } },
        apis: { focus: { description: "x", signature: "() => void" } },
      } as any,
    });
    const a = extractApiSurface(r, "0.10.0");
    const b = extractApiSurface(r, "0.10.0");
    expect(serializeApiSurface(a)).toBe(serializeApiSurface(b));
    expect(a.components.Button.props.label.valueType).toBe("string");
    expect(a.components.Button.events.click).toBeDefined();
    expect(a.components.Button.methods.focus.signature).toBe("() => void");
  });

  it("sorts component names and prop names", () => {
    const r = reg({
      Zeta: { status: "stable" } as any,
      Alpha: { status: "stable", props: { z: {}, a: {} } } as any,
    });
    const out = extractApiSurface(r, "0.1.0");
    expect(Object.keys(out.components)).toEqual(["Alpha", "Zeta"]);
    expect(Object.keys(out.components.Alpha.props)).toEqual(["a", "z"]);
  });
});

describe("diffApiSurfaces — bump classification", () => {
  it("added component → minor", () => {
    const prev = extractApiSurface(reg({}), "0.10.0");
    const next = extractApiSurface(
      reg({ NewBox: { status: "stable" } as any }),
      "0.11.0",
    );
    const d = diffApiSurfaces(prev, next);
    expect(d.bump).toBe("minor");
    expect(d.deltas[0].kind).toBe("component-added");
  });

  it("removed prop without removedIn → major", () => {
    const prev = extractApiSurface(
      reg({ Button: { status: "stable", props: { label: { valueType: "string" } } } as any }),
      "0.10.0",
    );
    const next = extractApiSurface(
      reg({ Button: { status: "stable", props: {} } as any }),
      "0.11.0",
    );
    const d = diffApiSurfaces(prev, next);
    expect(d.bump).toBe("major");
    expect(d.deltas[0].kind).toBe("prop-removed");
    expect(d.deltas[0].covered).toBe(false);
  });

  it("removed prop with matching removedIn → minor (covered)", () => {
    const prev = extractApiSurface(
      reg({
        Button: {
          status: "stable",
          props: { label: { valueType: "string", removedIn: "1.0.0" } as any },
        } as any,
      }),
      "0.10.0",
    );
    const next = extractApiSurface(
      reg({ Button: { status: "stable", props: {} } as any }),
      "1.0.0",
    );
    const d = diffApiSurfaces(prev, next);
    expect(d.bump).toBe("minor");
    expect(d.deltas[0].covered).toBe(true);
  });

  it("required-added → major", () => {
    const prev = extractApiSurface(
      reg({ B: { status: "stable", props: { x: {} } } as any }),
      "0.1.0",
    );
    const next = extractApiSurface(
      reg({ B: { status: "stable", props: { x: { isRequired: true } } } as any }),
      "0.2.0",
    );
    const d = diffApiSurfaces(prev, next);
    expect(d.bump).toBe("major");
    expect(d.deltas[0].kind).toBe("prop-required-added");
  });

  it("default-value-change → major", () => {
    const prev = extractApiSurface(
      reg({ B: { status: "stable", props: { x: { defaultValue: 1 } } } as any }),
      "0.1.0",
    );
    const next = extractApiSurface(
      reg({ B: { status: "stable", props: { x: { defaultValue: 2 } } } as any }),
      "0.2.0",
    );
    const d = diffApiSurfaces(prev, next);
    expect(d.bump).toBe("major");
    expect(d.deltas[0].kind).toBe("prop-default-changed");
  });

  it("stable → deprecated status change → minor", () => {
    const prev = extractApiSurface(
      reg({ B: { status: "stable" } as any }),
      "0.1.0",
    );
    const next = extractApiSurface(
      reg({ B: { status: "deprecated" } as any }),
      "0.2.0",
    );
    const d = diffApiSurfaces(prev, next);
    expect(d.bump).toBe("minor");
    expect(d.deltas[0].kind).toBe("component-status-changed");
  });

  it("identical surfaces → patch", () => {
    const r = reg({ B: { status: "stable", props: { x: {} } } as any });
    const prev = extractApiSurface(r, "0.1.0");
    const next = extractApiSurface(r, "0.1.1");
    expect(diffApiSurfaces(prev, next).bump).toBe("patch");
  });
});

describe("suggestChangeset", () => {
  it("flags missing changeset when bump escalates", () => {
    const prev = extractApiSurface(
      reg({ B: { status: "stable", props: { x: {} } } as any }),
      "0.1.0",
    );
    const next = extractApiSurface(
      reg({ B: { status: "stable", props: {} } as any }),
      "0.2.0",
    );
    const diff = diffApiSurfaces(prev, next);
    const cs = parseChangeset("a.md", `---\n"xmlui": patch\n---\nfix\n`);
    const out = suggestChangeset(diff, [cs]);
    expect(out.covered).toBe(false);
    expect(out.required).toBe("major");
    expect(out.report).toContain("requires `major`");
  });

  it("accepts a satisfying changeset", () => {
    const prev = extractApiSurface(reg({}), "0.1.0");
    const next = extractApiSurface(
      reg({ X: { status: "stable" } as any }),
      "0.2.0",
    );
    const diff = diffApiSurfaces(prev, next);
    const cs = parseChangeset("a.md", `---\n"xmlui": minor\n---\nadd X\n`);
    const out = suggestChangeset(diff, [cs]);
    expect(out.covered).toBe(true);
    expect(out.report).toMatch(/coverage ok/i);
  });

  it("--allow-patch override is recorded as accepted", () => {
    const prev = extractApiSurface(reg({}), "0.1.0");
    const next = extractApiSurface(
      reg({ X: { status: "stable" } as any }),
      "0.2.0",
    );
    const diff = diffApiSurfaces(prev, next);
    const cs = parseChangeset("a.md", `---\n"xmlui": patch\n---\nfix\n`);
    const out = suggestChangeset(diff, [cs], { allowPatch: true });
    expect(out.covered).toBe(true);
    expect(out.allowPatch).toBe(true);
    expect(out.report).toContain("Override accepted");
  });
});

describe("parseChangeset", () => {
  it("extracts package → bump pairs from frontmatter", () => {
    const cs = parseChangeset(
      "x.md",
      `---\n"xmlui": minor\n"xmlui-pdf": patch\n---\nbody\n`,
    );
    expect(cs.packages).toEqual({ xmlui: "minor", "xmlui-pdf": "patch" });
    expect(cs.body).toBe("body");
  });
});
