/**
 * Tests for analyzer rule: theming-missing-prefix (plan #02).
 */

import { describe, it, expect } from "vitest";
import { analyze } from "../../../../src/components-core/analyzer/walker";
import type { ComponentDef } from "../../../../src/abstractions/ComponentDefs";

// Side-effect import registers the rule.
import "../../../../src/components-core/analyzer/rules/theming-missing-prefix";

function mockRegistry(
  entries: Record<string, { themeNamespacePrefix?: string }> = {},
) {
  return {
    hasComponent: (name: string) => name in entries,
    getComponentNames: () => Object.keys(entries),
    lookupComponentRenderer: (name: string) => {
      if (!(name in entries)) return undefined;
      return { descriptor: {}, themeNamespacePrefix: entries[name].themeNamespacePrefix };
    },
  } as any;
}

function runRule(
  root: ComponentDef,
  registry: ReturnType<typeof mockRegistry> = mockRegistry(),
  strict = false,
) {
  return analyze({
    files: [{ file: "T.xmlui", source: "<root />", markupAst: root }],
    componentRegistry: registry,
    strict,
  }).filter((d) => d.code === "theming-missing-prefix");
}

describe("rule: theming-missing-prefix", () => {
  it("emits nothing for a core component reference without prefix", () => {
    const root: ComponentDef = {
      type: "Button",
      props: { style: "color: var(--xmlui-color-Button);" },
    };
    expect(runRule(root)).toHaveLength(0);
  });

  it("emits nothing for a correctly prefixed extension theme variable", () => {
    const root: ComponentDef = {
      type: "Animations_Slide",
      props: { style: "color: var(--xmlui-color-Animations_Slide);" },
    };
    expect(runRule(root)).toHaveLength(0);
  });

  it("flags an unknown package prefix", () => {
    const root: ComponentDef = {
      type: "Foo",
      props: { style: "color: var(--xmlui-color-Animation_Button);" },
    };
    const diags = runRule(root);
    expect(diags).toHaveLength(1);
    expect(diags[0].message).toContain("Animation");
    // info severity in non-strict mode (default).
    expect(diags[0].severity).toBe("info");
    // Suggests the closest registered prefix.
    expect(diags[0].suggestions?.[0]?.title).toContain("Animations");
  });

  it("escalates to warn in strict mode", () => {
    const root: ComponentDef = {
      type: "Foo",
      props: { style: "color: var(--xmlui-color-Animation_Button);" },
    };
    const diags = runRule(root, mockRegistry(), /* strict */ true);
    expect(diags).toHaveLength(1);
    expect(diags[0].severity).toBe("warn");
  });

  it("flags a reference that omits a required package prefix", () => {
    const root: ComponentDef = {
      type: "Pdf_Viewer",
      props: { style: "color: var(--xmlui-color-Viewer);" },
    };
    const registry = mockRegistry({
      Pdf_Viewer: { themeNamespacePrefix: "Pdf" },
    });
    const diags = runRule(root, registry);
    expect(diags).toHaveLength(1);
    expect(diags[0].message).toContain("Pdf_Viewer");
    expect(diags[0].suggestions?.[0]?.replacement).toBe("Pdf_Viewer");
  });

  it("does not flag a reference whose bare name is ambiguous across packages", () => {
    const root: ComponentDef = {
      type: "Pdf_Viewer",
      props: { style: "color: var(--xmlui-color-Viewer);" },
    };
    const registry = mockRegistry({
      Pdf_Viewer: { themeNamespacePrefix: "Pdf" },
      Echart_Viewer: { themeNamespacePrefix: "Echart" },
    });
    expect(runRule(root, registry)).toHaveLength(0);
  });

  it("walks nested children", () => {
    const root: ComponentDef = {
      type: "Stack",
      children: [
        {
          type: "Text",
          props: { style: "background: var(--xmlui-color-NotARealPrefix_Foo);" },
        },
      ],
    };
    expect(runRule(root)).toHaveLength(1);
  });

  it("ignores non-xmlui CSS variables", () => {
    const root: ComponentDef = {
      type: "Foo",
      props: { style: "color: var(--my-custom-var);" },
    };
    expect(runRule(root)).toHaveLength(0);
  });

  it("recurses into object-valued `vars` attributes", () => {
    const root: ComponentDef = {
      type: "Foo",
      props: {
        vars: {
          "--my-token": "var(--xmlui-color-NotARealPrefix_Foo)",
        },
      },
    };
    expect(runRule(root)).toHaveLength(1);
  });
});
