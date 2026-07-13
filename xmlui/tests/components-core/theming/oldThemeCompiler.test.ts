import React from "react";
import { describe, expect, test } from "vitest";

import { AppMd } from "../../../src/components/App/App";
import { AvatarMd } from "../../../src/components/Avatar/Avatar";
import { AutoCompleteMd } from "../../../src/components/AutoComplete/AutoComplete";
import { ButtonMd } from "../../../src/components/Button/Button";
import { ContextMenuMd } from "../../../src/components/ContextMenu/ContextMenu";
import { DateInputMd } from "../../../src/components/DateInput/DateInput";
import { DatePickerMd } from "../../../src/components/DatePicker/DatePicker";
import { MarkdownMd } from "../../../src/components/Markdown/Markdown";
import { SelectMd } from "../../../src/components/Select/Select";
import {
  collectComponentThemeMetadata,
  createComponentThemeMetadataRegistry,
  createCoreComponentThemeMetadataRegistry,
} from "../../../src/component-core";
import type { ComponentMetadata } from "../../../src/component-core/metadata";
import { compileOldThemeModel } from "../../../src/components-core/theming/oldThemeCompiler";
import { normalizeExtensions, type Extension } from "../../../src/extensions";

const representativeComponentMetadata: Array<[string, ComponentMetadata]> = [
  ["App", AppMd as ComponentMetadata],
  ["Button", ButtonMd as ComponentMetadata],
  ["Avatar", AvatarMd as ComponentMetadata],
  ["AutoComplete", AutoCompleteMd as ComponentMetadata],
  ["DateInput", DateInputMd as ComponentMetadata],
  ["ContextMenu", ContextMenuMd as ComponentMetadata],
  ["Select", SelectMd as ComponentMetadata],
  ["DatePicker", DatePickerMd as ComponentMetadata],
  ["Markdown", MarkdownMd as ComponentMetadata],
];

describe("compileOldThemeModel", () => {
  test("returns the old provider-shaped output without using React runtime context", () => {
    const registry = createCoreComponentThemeMetadataRegistry();
    const compiled = compileOldThemeModel({
      builtInThemes: [
        {
          id: "xmlui",
          themeVars: {
            "space-base": "4px",
            fontSize: "16px",
            "fontSize-Text": "$fontSize",
            "color-primary": "#336699",
            "color-Button-primary": "#336699",
            "textColor-Button": "#111111",
          },
          resources: {
            logo: "/theme/logo.svg",
            "font.remote": "https://example.test/font.css",
            "font.local": {
              fontFamily: "Demo",
              src: "resource:font.demo",
              format: "woff2",
            },
            "font.demo": "/fonts/demo.woff2",
          },
          tones: {
            dark: {
              themeVars: {
                "textColor-Button": "#eeeeee",
              },
              resources: {
                logo: "/theme/logo-dark.svg",
              },
            },
          },
        },
      ],
      activeThemeId: "xmlui",
      defaultTone: "dark",
      componentThemeMetadata: registry,
      resources: {
        fallback: "/fallback.svg",
      },
      resourceMap: {
        "/theme/logo-dark.svg": "/assets/logo-dark.hash.svg",
        "fonts/demo.woff2": "/assets/demo.hash.woff2",
      },
    });

    expect(compiled.activeThemeId).toBe("xmlui");
    expect(compiled.activeThemeTone).toBe("dark");
    expect(compiled.availableThemeIds).toEqual(["xmlui"]);
    expect(compiled.themeDefChain.map((theme) => theme.id)).toEqual(["root", "xmlui"]);
    expect(compiled.themeCssVars["--xmlui-textColor-Button"]).toBe("#eeeeee");
    expect(compiled.themeVars["fontSize-Text-title"]).toBe("calc(var(--xmlui-fontSize-Text) * 1.5)");
    expect(compiled.rawAllThemeVars["fontSize-Text-title"]).toBe("calc(var(--xmlui-fontSize-Text) * 1.5)");
    expect(compiled.getThemeVar("$textColor-Button")).toBe("#eeeeee");
    expect(compiled.getResourceUrl("resource:logo")).toBe("/assets/logo-dark.hash.svg");
    expect(compiled.getResourceUrl("resource:font.demo")).toBe("/assets/demo.hash.woff2");
    expect(compiled.getResourceUrl("resource:fallback")).toBe("/fallback.svg");
    expect(compiled.fontLinks).toEqual(["https://example.test/font.css", "/fonts/demo.woff2"]);
  });

  test("orders custom themes before built-ins and lets the final theme override generated vars", () => {
    const registry = collectComponentThemeMetadata([]);
    const compiled = compileOldThemeModel({
      customThemes: [
        {
          id: "brand",
          extends: "base",
          themeVars: {
            "space-base": "4px",
            "space-1": "999px",
            "padding-Button": "$space-1",
          },
        },
      ],
      builtInThemes: [
        {
          id: "base",
          themeVars: {
            "space-base": "8px",
          },
        },
      ],
      defaultTheme: "brand",
      componentThemeMetadata: registry,
    });

    expect(compiled.availableThemeIds).toEqual(["brand", "base"]);
    expect(compiled.themeDefChain.map((theme) => theme.id)).toEqual(["root", "base", "brand"]);
    expect(compiled.rawAllThemeVars["space-1"]).toBe("999px");
    expect(compiled.themeVars["padding-Button"]).toBe("999px");
    expect(compiled.themeCssVars["--xmlui-paddingLeft-Button"]).toBe("999px");
  });

  test("produces output for representative component metadata and contributor defaults", () => {
    const registry = collectComponentThemeMetadata(
      representativeComponentMetadata.map(([name, metadata]) => ({ name, metadata })),
    );
    const compiled = compileOldThemeModel({
      builtInThemes: [
        {
          id: "xmlui",
          themeVars: {
            "space-base": "4px",
            fontSize: "16px",
            "fontSize-Text": "$fontSize",
            "color-primary": "#336699",
            "color-Button-primary-solid": "#336699",
            "textColor-Button": "#111111",
            "backgroundColor-App": "#fafafa",
            "backgroundColor-Avatar": "#eeeeee",
            "borderColor-AutoComplete": "#dddddd",
            "borderColor-DateInput": "#cccccc",
            "backgroundColor-ContextMenu": "#ffffff",
            "borderColor-Select": "#bbbbbb",
            "borderColor-DatePicker": "#aaaaaa",
            "textColor-Markdown": "#222222",
          },
        },
      ],
      defaultTheme: "xmlui",
      componentThemeMetadata: registry,
    });

    for (const [name] of representativeComponentMetadata) {
      expect(registry.componentMetadataByName.has(name)).toBe(true);
    }
    expect(compiled.rawAllThemeVars).toMatchObject({
      "backgroundColor-App": "#fafafa",
      "backgroundColor-Avatar": "#eeeeee",
      "borderColor-AutoComplete": "#dddddd",
      "borderColor-DateInput": "#cccccc",
      "backgroundColor-ContextMenu": "#ffffff",
      "borderColor-Select": "#bbbbbb",
      "borderColor-DatePicker": "#aaaaaa",
      "textColor-Markdown": "#222222",
    });
    expect(compiled.rawAllThemeVars["backgroundColor-Button-primary-solid"]).toBe("#336699");
    expect(compiled.rawAllThemeVars["textColor-Button-primary-solid"]).toBeDefined();
  });

  test("preserves namespaced extension component theme variables", () => {
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
              "backgroundColor-Meter": "Meter background color.",
            },
            defaultThemeVars: {
              "accentColor-Meter": "red",
            },
          },
        },
      ],
    };
    const registry = createComponentThemeMetadataRegistry(normalizeExtensions([extension]));
    const compiled = compileOldThemeModel({
      builtInThemes: [
        {
          id: "xmlui",
          themeVars: {
            "demo:backgroundColor-Meter": "green",
          },
        },
      ],
      defaultTheme: "xmlui",
      componentThemeMetadata: registry,
    });

    expect(registry.componentThemeVars.has("demo:accentColor-Meter")).toBe(true);
    expect(compiled.rawAllThemeVars["demo:accentColor-Meter"]).toBe("red");
    expect(compiled.rawAllThemeVars["demo:backgroundColor-Meter"]).toBe("green");
    expect(compiled.themeCssVars["--xmlui-demo:backgroundColor-Meter"]).toBe("green");
  });

  test("falls back to the first available theme when the requested theme is missing", () => {
    const compiled = compileOldThemeModel({
      customThemes: [{ id: "custom", themeVars: { color: "custom" } }],
      builtInThemes: [{ id: "xmlui", themeVars: { color: "xmlui" } }],
      activeThemeId: "missing",
      componentThemeMetadata: collectComponentThemeMetadata([]),
    });

    expect(compiled.activeThemeId).toBe("custom");
    expect(compiled.getThemeVar("color")).toBe("custom");
  });
});
