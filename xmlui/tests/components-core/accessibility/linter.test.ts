/**
 * Tests for the accessibility linter.
 */

import { describe, it, expect } from "vitest";
import { lintComponentDef } from "../../../src/components-core/accessibility/linter";
import type { ComponentDef, ComponentMetadata } from "../../../src/abstractions/ComponentDefs";

// ---------------------------------------------------------------------------
// Registry helpers
// ---------------------------------------------------------------------------

function makeRegistry(
  entries: Record<string, Partial<ComponentMetadata>> = {},
): ReadonlyMap<string, ComponentMetadata> {
  return new Map(Object.entries(entries) as [string, ComponentMetadata][]);
}

// ---------------------------------------------------------------------------
// Step 0: Empty ComponentDef
// ---------------------------------------------------------------------------

describe("lintComponentDef — Step 0 baseline", () => {
  it("returns no diagnostics for an empty ComponentDef", () => {
    const def: ComponentDef = { type: "App" };
    const result = lintComponentDef(def, makeRegistry());
    expect(result).toEqual([]);
  });

  it("respects skipUnknown: true for unregistered components", () => {
    const def: ComponentDef = {
      type: "App",
      children: [{ type: "UnknownWidget" }],
    };
    const result = lintComponentDef(def, makeRegistry(), { skipUnknown: true });
    expect(result).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Rule 1: missing-accessible-name
// ---------------------------------------------------------------------------

describe("rule: missing-accessible-name", () => {
  const registry = makeRegistry({
    IconButton: {
      a11y: {
        role: "button",
        accessibleNameProps: ["label", "aria-label"],
        requiresAccessibleName: true,
      },
    },
  });

  it("emits warn when no accessible name prop is set", () => {
    const def: ComponentDef = { type: "IconButton" };
    const result = lintComponentDef(def, registry);
    expect(result.some((d) => d.code === "missing-accessible-name")).toBe(true);
    expect(result.find((d) => d.code === "missing-accessible-name")?.severity).toBe("warn");
  });

  it("emits error in strict mode", () => {
    const def: ComponentDef = { type: "IconButton" };
    const result = lintComponentDef(def, registry, { strict: true });
    expect(result.find((d) => d.code === "missing-accessible-name")?.severity).toBe("error");
  });

  it("emits no diagnostic when label prop is set", () => {
    const def: ComponentDef = { type: "IconButton", props: { label: "Save" } };
    const result = lintComponentDef(def, registry);
    expect(result.filter((d) => d.code === "missing-accessible-name")).toHaveLength(0);
  });

  it("emits no diagnostic when aria-label prop is set", () => {
    const def: ComponentDef = { type: "IconButton", props: { "aria-label": "Save" } };
    const result = lintComponentDef(def, registry);
    expect(result.filter((d) => d.code === "missing-accessible-name")).toHaveLength(0);
  });

  it("skips the check when requiresAccessibleName is false", () => {
    const reg = makeRegistry({
      Decorative: {
        a11y: {
          role: "button",
          accessibleNameProps: ["label"],
          requiresAccessibleName: false,
        },
      },
    });
    const def: ComponentDef = { type: "Decorative" };
    const result = lintComponentDef(def, reg);
    expect(result.filter((d) => d.code === "missing-accessible-name")).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// Rule 2: icon-only-button-no-label
// ---------------------------------------------------------------------------

describe("rule: icon-only-button-no-label", () => {
  it("emits warn for <Button icon=...> without label", () => {
    const def: ComponentDef = { type: "Button", props: { icon: "trash" } };
    const result = lintComponentDef(def, makeRegistry());
    expect(result.some((d) => d.code === "icon-only-button-no-label")).toBe(true);
    expect(result.find((d) => d.code === "icon-only-button-no-label")?.severity).toBe("warn");
  });

  it("emits error for icon-only button in strict mode", () => {
    const def: ComponentDef = { type: "Button", props: { icon: "trash" } };
    const result = lintComponentDef(def, makeRegistry(), { strict: true });
    expect(result.find((d) => d.code === "icon-only-button-no-label")?.severity).toBe("error");
  });

  it("emits no diagnostic when label is provided", () => {
    const def: ComponentDef = { type: "Button", props: { icon: "trash", label: "Delete" } };
    const result = lintComponentDef(def, makeRegistry());
    expect(result.filter((d) => d.code === "icon-only-button-no-label")).toHaveLength(0);
  });

  it("emits no diagnostic when aria-label is provided", () => {
    const def: ComponentDef = {
      type: "Button",
      props: { icon: "trash", "aria-label": "Delete item" },
    };
    const result = lintComponentDef(def, makeRegistry());
    expect(result.filter((d) => d.code === "icon-only-button-no-label")).toHaveLength(0);
  });

  it("emits no diagnostic for a button without an icon", () => {
    const def: ComponentDef = { type: "Button", props: { label: "Save" } };
    const result = lintComponentDef(def, makeRegistry());
    expect(result.filter((d) => d.code === "icon-only-button-no-label")).toHaveLength(0);
  });

  it("suggests aria-label in the fix", () => {
    const def: ComponentDef = { type: "Button", props: { icon: "edit" } };
    const result = lintComponentDef(def, makeRegistry());
    const diag = result.find((d) => d.code === "icon-only-button-no-label");
    expect(diag?.fix).toContain("aria-label");
  });
});

// ---------------------------------------------------------------------------
// Rule 3: modal-no-title
// ---------------------------------------------------------------------------

describe("rule: modal-no-title", () => {
  it("emits warn for <Modal> without a title prop", () => {
    const def: ComponentDef = {
      type: "Modal",
      children: [{ type: "Text", props: { value: "Content" } }],
    };
    const result = lintComponentDef(def, makeRegistry());
    expect(result.some((d) => d.code === "modal-no-title")).toBe(true);
  });

  it("emits no diagnostic when title prop is set", () => {
    const def: ComponentDef = {
      type: "Modal",
      props: { title: "Confirm Action" },
    };
    const result = lintComponentDef(def, makeRegistry());
    expect(result.filter((d) => d.code === "modal-no-title")).toHaveLength(0);
  });

  it("emits no diagnostic when a ModalTitle slot child is present", () => {
    const def: ComponentDef = {
      type: "Modal",
      children: [{ type: "ModalTitle", props: { value: "Title" } }],
    };
    const result = lintComponentDef(def, makeRegistry());
    expect(result.filter((d) => d.code === "modal-no-title")).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// Rule 4: form-input-no-label
// ---------------------------------------------------------------------------

describe("rule: form-input-no-label", () => {
  const registry = makeRegistry({
    TextBox: { a11y: { role: "form-input" } },
  });

  it("emits warn for a TextBox outside FormItem without label", () => {
    const def: ComponentDef = { type: "TextBox" };
    const result = lintComponentDef(def, registry);
    expect(result.some((d) => d.code === "form-input-no-label")).toBe(true);
  });

  it("emits no diagnostic when TextBox is a child of FormItem", () => {
    const def: ComponentDef = {
      type: "FormItem",
      props: { label: "Name" },
      children: [{ type: "TextBox" }],
    };
    const result = lintComponentDef(def, registry);
    expect(result.filter((d) => d.code === "form-input-no-label")).toHaveLength(0);
  });

  it("emits no diagnostic when TextBox has a label prop", () => {
    const def: ComponentDef = {
      type: "TextBox",
      props: { label: "Name" },
    };
    const result = lintComponentDef(def, registry);
    expect(result.filter((d) => d.code === "form-input-no-label")).toHaveLength(0);
  });

  it("emits no diagnostic when TextBox has bindTo (FormBinding provides context)", () => {
    const def: ComponentDef = {
      type: "TextBox",
      props: { bindTo: "name" },
    };
    const result = lintComponentDef(def, registry);
    expect(result.filter((d) => d.code === "form-input-no-label")).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// Rule 5: duplicate-landmark
// ---------------------------------------------------------------------------

describe("rule: duplicate-landmark", () => {
  const registry = makeRegistry({
    MainContent: { a11y: { landmark: "main" } },
  });

  it("emits warn when the same landmark appears twice", () => {
    const def: ComponentDef = {
      type: "App",
      children: [{ type: "MainContent" }, { type: "MainContent" }],
    };
    const result = lintComponentDef(def, registry);
    expect(result.some((d) => d.code === "duplicate-landmark")).toBe(true);
  });

  it("emits no diagnostic when the landmark appears once", () => {
    const def: ComponentDef = {
      type: "App",
      children: [{ type: "MainContent" }],
    };
    const result = lintComponentDef(def, registry);
    expect(result.filter((d) => d.code === "duplicate-landmark")).toHaveLength(0);
  });
});
