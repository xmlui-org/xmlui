import React from "react";
import { describe, expect, it } from "vitest";

import {
  collectComponentThemeMetadata,
  createComponentThemeMetadataRegistry,
  createCoreComponentThemeMetadataRegistry,
} from "../../src/component-core";
import type { ComponentMetadata } from "../../src/component-core/metadata";
import { normalizeExtensions, type Extension } from "../../src/extensions";
import { AppMd } from "../../src/components/App/App";
import { ButtonMd } from "../../src/components/Button/Button";
import { TextMd } from "../../src/components/Text/Text";
import { HeadingMd } from "../../src/components/Heading/Heading";
import { NavPanelMd } from "../../src/components/NavPanel/NavPanel";
import { NavLinkMd } from "../../src/components/NavLink/NavLink";
import { MarkdownMd } from "../../src/components/Markdown/Markdown";
import { ContextMenuMd } from "../../src/components/ContextMenu/ContextMenu";
import { SelectMd } from "../../src/components/Select/Select";
import { DatePickerMd } from "../../src/components/DatePicker/DatePicker";

const representativeComponents: Array<[string, ComponentMetadata]> = [
  ["App", AppMd as ComponentMetadata],
  ["Button", ButtonMd as ComponentMetadata],
  ["Text", TextMd as ComponentMetadata],
  ["Heading", HeadingMd as ComponentMetadata],
  ["NavPanel", NavPanelMd as ComponentMetadata],
  ["NavLink", NavLinkMd as ComponentMetadata],
  ["Markdown", MarkdownMd as ComponentMetadata],
  ["ContextMenu", ContextMenuMd as ComponentMetadata],
  ["Select", SelectMd as ComponentMetadata],
  ["DatePicker", DatePickerMd as ComponentMetadata],
];

describe("component theme metadata registry", () => {
  it("reconnects representative component metadata to the old theme registry contract", () => {
    const registry = createCoreComponentThemeMetadataRegistry();

    for (const [name, metadata] of representativeComponents) {
      const themeVarNames = Object.keys(metadata.themeVars ?? {}).sort();
      const defaultThemeVarNames = Object.keys(metadata.defaultThemeVars ?? {}).sort();

      expect(registry.componentMetadataByName.get(name)).toBe(metadata);
      expect([...registry.componentThemeVars].filter((themeVar) => themeVarNames.includes(themeVar)).sort())
        .toEqual(themeVarNames);
      expect([...registry.componentThemeVarDeclarations.keys()]
        .filter((themeVar) => themeVarNames.includes(themeVar))
        .sort())
        .toEqual(themeVarNames);
      expect(Object.keys(registry.componentDefaultThemeVars)
        .filter((themeVar) => defaultThemeVarNames.includes(themeVar))
        .sort())
        .toEqual(defaultThemeVarNames);
    }

    expect(registry.componentThemeVarContributorComponents.get("App")).toEqual(["Footer", "Pages"]);
    expect(registry.componentThemeVarContributorComponents.get("Markdown")).toEqual([
      "CodeBlock",
      "Text",
      "NestedApp",
    ]);
    expect(registry.componentThemeVarContributorComponents.get("ContextMenu")).toEqual([
      "MenuItem",
      "MenuSeparator",
      "SubMenuItem",
    ]);
  });

  it("deeply merges default theme variables like the old ComponentRegistry", () => {
    const registry = collectComponentThemeMetadata([
      {
        name: "First",
        metadata: {
          defaultThemeVars: {
            palette: {
              background: "white",
              color: "black",
            },
          },
        },
      },
      {
        name: "Second",
        metadata: {
          defaultThemeVars: {
            palette: {
              color: "blue",
            },
          },
        },
      },
    ]);

    expect(registry.componentDefaultThemeVars.palette).toEqual({
      background: "white",
      color: "blue",
    });
  });

  it("preserves extension theme metadata and applies theme namespace prefixes", () => {
    const extension: Extension = {
      namespace: "Demo",
      themeNamespacePrefix: "demo",
      components: [
        {
          name: "Meter",
          component: () => React.createElement("div"),
          metadata: {
            themeVars: {
              "accentColor-Meter": "Meter accent color.",
              "backgroundColor-Meter": {
                name: "backgroundColor-Meter",
                description: "Meter background color.",
                valueType: "color",
              },
            },
            defaultThemeVars: {
              "accentColor-Meter": "red",
              "shadow-Meter": {
                outer: "0 0 2px black",
              },
            },
            themeVarContributorComponents: ["Button"],
          },
        },
      ],
    };
    const normalized = normalizeExtensions([extension]);
    const registry = createComponentThemeMetadataRegistry(normalized);

    expect(normalized.contracts.find((contract) => contract.name === "Meter")?.themeVars)
      .toHaveProperty("demo:accentColor-Meter");
    expect(normalized.contracts.find((contract) => contract.name === "Meter")?.defaultThemeVars)
      .toHaveProperty("demo:accentColor-Meter", "red");
    expect(registry.componentMetadataByName.has("Meter")).toBe(true);
    expect(registry.componentThemeVars.has("demo:accentColor-Meter")).toBe(true);
    expect(registry.componentThemeVarDeclarations.get("demo:backgroundColor-Meter")).toMatchObject({
      name: "demo:backgroundColor-Meter",
      description: "Meter background color.",
      valueType: "color",
    });
    expect(registry.componentDefaultThemeVars["demo:shadow-Meter"]).toEqual({
      outer: "0 0 2px black",
    });
    expect(registry.componentThemeVarContributorComponents.get("Meter")).toEqual(["Button"]);
  });
});
