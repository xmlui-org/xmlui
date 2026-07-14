import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, test } from "vitest";

import type { ThemeDefinition } from "../../../src/abstractions/ThemingDefs";
import {
  LegacyThemeProvider,
  useTheme,
} from "../../../src/components-core/theming/ThemeContext";
import { StyleProvider } from "../../../src/components-core/theming/StyleContext";
import { createCoreComponentThemeMetadataRegistry } from "../../../src/component-core";

afterEach(() => {
  globalThis.__XMLUI_ENABLE_OLD_THEME_SHADOW__ = undefined;
  globalThis.__XMLUI_OLD_THEME_SHADOW__ = undefined;
});

describe("old theme shadow diagnostics", () => {
  test("runs the inert old compiler with the active metadata registry", () => {
    const theme: ThemeDefinition = {
      id: "brand",
      extends: "xmlui",
      themeVars: {
        "brand-shadow-marker": "yes",
      },
    };

    const html = renderShadowProvider({
      themes: [theme],
      defaultTheme: "brand",
    });
    const diagnostics = globalThis.__XMLUI_OLD_THEME_SHADOW__;

    expect(html).toContain("theme:brand");
    expect(diagnostics?.activeThemeId).toBe("brand");
    expect(diagnostics?.shadowTheme.activeThemeId).toBe("brand");
    expect(diagnostics?.shadowTheme.availableThemeIds[0]).toBe("brand");
    expect(diagnostics?.shadowTheme.rawAllThemeVars["brand-shadow-marker"]).toBe("yes");
    expect(diagnostics?.shadowTheme.rawAllThemeVars["backgroundColor-Avatar"]).toBeDefined();
  });

  test("captures shadow/current root var mismatches without affecting render output", () => {
    const theme: ThemeDefinition = {
      id: "brand",
      extends: "xmlui",
      themeVars: {
        "shadow-only-marker": "#123456",
      },
    };

    const html = renderShadowProvider({
      themes: [theme],
      defaultTheme: "brand",
    });
    const diagnostics = globalThis.__XMLUI_OLD_THEME_SHADOW__;

    expect(html).toContain("theme:brand");
    expect(diagnostics?.mismatches).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "--xmlui-shadow-only-marker",
          emittedValue: undefined,
          shadowValue: "#123456",
        }),
      ]),
    );
    expect(diagnostics?.emittedRootVars["--xmlui-shadow-only-marker"]).toBeUndefined();
  });

  test("does not compute diagnostics unless explicitly enabled", () => {
    renderToStaticMarkup(
      <StyleProvider>
        <LegacyThemeProvider>
          <ThemeProbe />
        </LegacyThemeProvider>
      </StyleProvider>,
    );

    expect(globalThis.__XMLUI_OLD_THEME_SHADOW__).toBeUndefined();
  });
});

function renderShadowProvider({
  themes,
  defaultTheme,
}: {
  themes: ThemeDefinition[];
  defaultTheme: string;
}) {
  return renderToStaticMarkup(
    <StyleProvider>
      <LegacyThemeProvider
        themes={themes}
        defaultTheme={defaultTheme}
        componentThemeMetadata={createCoreComponentThemeMetadataRegistry()}
        enableOldThemeShadowDiagnostics
      >
        <ThemeProbe />
      </LegacyThemeProvider>
    </StyleProvider>,
  );
}

function ThemeProbe() {
  const theme = useTheme();
  return <span>{`theme:${theme.activeThemeId}`}</span>;
}
