import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, test, vi } from "vitest";

import type { ThemeDefinition, ThemeScope } from "../../../src/abstractions/ThemingDefs";
import {
  applyThemeCssVarsToRoot,
  LegacyThemeProvider,
  useTheme,
} from "../../../src/components-core/theming/ThemeContext";
import { StyleProvider } from "../../../src/components-core/theming/StyleContext";
import { StyleRegistry } from "../../../src/components-core/theming/StyleRegistry";
import { useComponentThemeClass } from "../../../src/components-core/theming/utils";
import { ComponentRegistryProvider } from "../../../src/components/ComponentRegistryContext";
import {
  collectComponentThemeMetadata,
  createCoreComponentThemeMetadataRegistry,
} from "../../../src/component-core";
import { resetThemeDiagnosticDeduplication } from "../../../src/components-core/theming/validator/emit";
import { AppMd } from "../../../src/components/App/App";
import { FooterMd } from "../../../src/components/Footer/Footer";
import { PagesMd } from "../../../src/components/Pages/Pages";
import { MarkdownMd } from "../../../src/components/Markdown/Markdown";
import { CodeBlockMd } from "../../../src/components/CodeBlock/CodeBlock";
import { TextMd } from "../../../src/components/Text/Text";
import { NestedAppMd } from "../../../src/components/NestedApp/NestedApp";
import { ContextMenuMd } from "../../../src/components/ContextMenu/ContextMenu";
import {
  MenuItemMd,
  MenuSeparatorMd,
  SubMenuItemMd,
} from "../../../src/components/DropdownMenu/DropdownMenu";
import type { ComponentMetadata } from "../../../src/component-core/metadata";

afterEach(() => {
  globalThis.__XMLUI_ENABLE_OLD_THEME_SHADOW__ = undefined;
  globalThis.__XMLUI_OLD_THEME_SHADOW__ = undefined;
  globalThis.__XMLUI_OLD_THEME_CANARY__ = undefined;
  resetThemeDiagnosticDeduplication();
});

describe("old theme compiler canary", () => {
  test("uses old root custom and generated variables by default", () => {
    const theme = createCanaryTheme();

    const current = renderCanaryProvider({
      themes: [theme],
      defaultTheme: "brand",
      enableOldThemeCanary: false,
    });
    expect(current.html).toContain("theme:brand");
    expect(current.theme.themeStyles["--xmlui-brand-canary-marker"]).toBe("yes");
    expect(current.theme.themeStyles["--xmlui-paddingLeft-Card"]).toBe("8px");
    expect(current.theme.themeStyles["--xmlui-borderLeftWidth-Card"]).toBe("2px");
    expect(current.theme.themeStyles["--xmlui-fontSize-Text-title"]).toBe(
      "calc(var(--xmlui-fontSize-Text) * 1.5)",
    );
    expect(current.theme.themeStyles["--xmlui-const-color-primary-500"]).toBe(
      "hsl(210, 50%, 40%)",
    );
    expect(current.theme.themeStyles["--xmlui-backgroundColor-Button-primary-solid"]).toBe(
      "#336699",
    );
    expect(current.theme.getThemeVar("$paddingLeft-Card")).toBe("8px");
    expect(globalThis.__XMLUI_OLD_THEME_CANARY__).toBeUndefined();

    const canary = renderCanaryProvider({
      themes: [theme],
      defaultTheme: "brand",
      enableOldThemeCanary: true,
    });
    expect(canary.theme.themeStyles).toEqual(current.theme.themeStyles);
    expect(globalThis.__XMLUI_OLD_THEME_CANARY__?.themeCssVars).toEqual(current.theme.themeStyles);
  });

  test("uses old resource lookup and exposes font link output in the canary snapshot", () => {
    const theme = createCanaryTheme();
    const canary = renderCanaryProvider({
      themes: [theme],
      defaultTheme: "brand",
      resources: {
        fallback: "/fallback.svg",
      },
      resourceMap: {
        "/theme/logo.svg": "/assets/logo.hash.svg",
        "fonts/demo.woff2": "/assets/demo.hash.woff2",
      },
      enableOldThemeCanary: true,
    });

    expect(canary.theme.getResourceUrl("resource:logo")).toBe("/assets/logo.hash.svg");
    expect(canary.theme.getResourceUrl("resource:font.demo")).toBe("/assets/demo.hash.woff2");
    expect(canary.theme.getResourceUrl("resource:fallback")).toBe("/fallback.svg");
    expect(globalThis.__XMLUI_OLD_THEME_CANARY__?.fontLinks).toEqual([
      "https://example.test/font.css",
      "/fonts/demo.woff2",
    ]);
  });

  test("supports an explicit custom default theme without a nested Theme wrapper", () => {
    const canary = renderCanaryProvider({
      themes: [
        {
          id: "brand",
          extends: "xmlui",
          themeVars: {
            "backgroundColor-App": "#123456",
          },
        },
      ],
      defaultTheme: "brand",
      enableOldThemeCanary: true,
    });

    expect(canary.html).toContain("theme:brand");
    expect(canary.theme.themeStyles["--xmlui-backgroundColor-App"]).toBe("#123456");
    expect(canary.theme.getThemeVar("$backgroundColor-App")).toBe("#123456");
  });

  test("applies and cleans up canary CSS variables on a root style object", () => {
    const style = new FakeStyleDeclaration({
      "--xmlui-existing": "previous",
    });

    const cleanup = applyThemeCssVarsToRoot(style, {
      "--xmlui-existing": "next",
      "--xmlui-added": "value",
    });

    expect(style.getPropertyValue("--xmlui-existing")).toBe("next");
    expect(style.getPropertyValue("--xmlui-added")).toBe("value");

    cleanup();

    expect(style.getPropertyValue("--xmlui-existing")).toBe("previous");
    expect(style.getPropertyValue("--xmlui-added")).toBe("");
  });

  test("emits diagnostics while filtering invalid strict theme variables", () => {
    const previousWindow = globalThis.window;
    const previousDocument = globalThis.document;
    const fakeWindow = { _xsLogs: [] as Array<Record<string, unknown>> } as unknown as Window &
      typeof globalThis & { _xsLogs: Array<Record<string, unknown>> };
    const fakeDocument = {
      querySelector: () => null,
      documentElement: undefined,
    } as unknown as Document;
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      writable: true,
      value: fakeWindow,
    });
    Object.defineProperty(globalThis, "document", {
      configurable: true,
      writable: true,
      value: fakeDocument,
    });
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const error = vi.spyOn(console, "error").mockImplementation(() => undefined);

    try {
      const registry = collectComponentThemeMetadata([
        {
          name: "Panel",
          metadata: {
            themeVars: {
              "backgroundColor-Panel": {
                name: "backgroundColor-Panel",
                valueType: "color",
              },
            },
          },
        },
      ]);
      const result = renderCanaryProvider({
        themes: [
          {
            id: "brand",
            themeVars: {
              "backgroundColor-Panel": "not-a-color",
            },
          },
        ],
        defaultTheme: "brand",
        componentThemeMetadata: registry,
        enableOldThemeCanary: false,
      });

      expect(result.theme.themeStyles["--xmlui-backgroundColor-Panel"]).toBeUndefined();
      expect(result.theme.themeVars["backgroundColor-Panel"]).toBeUndefined();
      expect(fakeWindow._xsLogs).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            kind: "theming",
            code: "invalid-theme-value",
            severity: "error",
            variableName: "backgroundColor-Panel",
          }),
        ]),
      );
    } finally {
      warn.mockRestore();
      error.mockRestore();
      Object.defineProperty(globalThis, "window", {
        configurable: true,
        writable: true,
        value: previousWindow,
      });
      Object.defineProperty(globalThis, "document", {
        configurable: true,
        writable: true,
        value: previousDocument,
      });
    }
  });

  test("keeps invalid theme variables when provider strict theming is disabled", () => {
    const registry = collectComponentThemeMetadata([
      {
        name: "Panel",
        metadata: {
          themeVars: {
            "backgroundColor-Panel": {
              name: "backgroundColor-Panel",
              valueType: "color",
            },
          },
        },
      },
    ]);
    const result = renderCanaryProvider({
      themes: [
        {
          id: "brand",
          themeVars: {
            "backgroundColor-Panel": "not-a-color",
          },
        },
      ],
      defaultTheme: "brand",
      componentThemeMetadata: registry,
      strictTheming: false,
      enableOldThemeCanary: false,
    });

    expect(result.theme.themeStyles["--xmlui-backgroundColor-Panel"]).toBe("not-a-color");
    expect(result.theme.themeVars["backgroundColor-Panel"]).toBe("not-a-color");
  });

  test("emits strict accessibility contrast diagnostics through the old theme path", () => {
    const previousWindow = globalThis.window;
    const previousDocument = globalThis.document;
    const fakeWindow = { _xsLogs: [] as Array<Record<string, unknown>> } as unknown as Window &
      typeof globalThis & { _xsLogs: Array<Record<string, unknown>> };
    const fakeDocument = {
      querySelector: () => null,
      documentElement: undefined,
    } as unknown as Document;
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      writable: true,
      value: fakeWindow,
    });
    Object.defineProperty(globalThis, "document", {
      configurable: true,
      writable: true,
      value: fakeDocument,
    });
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const error = vi.spyOn(console, "error").mockImplementation(() => undefined);

    try {
      renderCanaryProvider({
        themes: [
          {
            id: "brand",
            extends: "xmlui",
            themeVars: {
              textColor: "#ffffff",
              backgroundColor: "#ffffff",
            },
          },
        ],
        defaultTheme: "brand",
        strictAccessibility: true,
        enableOldThemeCanary: false,
      });

      expect(fakeWindow._xsLogs).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            kind: "a11y",
            code: "color-contrast-low",
            severity: "error",
            componentName: "Theme",
          }),
        ]),
      );
      expect(error).toHaveBeenCalledWith(expect.stringContaining("[XMLUI Accessibility]"));
    } finally {
      warn.mockRestore();
      error.mockRestore();
      Object.defineProperty(globalThis, "window", {
        configurable: true,
        writable: true,
        value: previousWindow,
      });
      Object.defineProperty(globalThis, "document", {
        configurable: true,
        writable: true,
        value: previousDocument,
      });
    }
  });

  test("component theme class includes Markdown contributor variables", () => {
    const result = renderThemeClassProvider({
      descriptor: MarkdownMd as ComponentMetadata,
      entries: [
        ["Markdown", MarkdownMd as ComponentMetadata],
        ["CodeBlock", CodeBlockMd as ComponentMetadata],
        ["Text", TextMd as ComponentMetadata],
        ["NestedApp", NestedAppMd as ComponentMetadata],
      ],
      themes: [
        {
          id: "brand",
          extends: "xmlui",
          themeVars: {
            "fontSize-Text": "21px",
            "backgroundColor-CodeBlock": "#123456",
          },
        },
      ],
    });

    expect(result.css).toContain("--xmlui-fontSize-Text:21px");
    expect(result.css).toContain("--xmlui-backgroundColor-CodeBlock:#123456");
  });

  test("component theme class includes ContextMenu contributor variables", () => {
    const result = renderThemeClassProvider({
      descriptor: ContextMenuMd as ComponentMetadata,
      entries: [
        ["ContextMenu", ContextMenuMd as ComponentMetadata],
        ["MenuItem", MenuItemMd as ComponentMetadata],
        ["MenuSeparator", MenuSeparatorMd as ComponentMetadata],
        ["SubMenuItem", SubMenuItemMd as ComponentMetadata],
      ],
      themes: [
        {
          id: "brand",
          extends: "xmlui",
          themeVars: {
            "backgroundColor-MenuItem": "#010203",
            "paddingHorizontal-MenuItem": "17px",
          },
        },
      ],
    });

    expect(result.css).toContain("--xmlui-backgroundColor-MenuItem:#010203");
    expect(result.css).toContain("--xmlui-paddingHorizontal-MenuItem:17px");
  });

  test("component theme class includes App contributor variables", () => {
    const result = renderThemeClassProvider({
      descriptor: AppMd as ComponentMetadata,
      entries: [
        ["App", AppMd as ComponentMetadata],
        ["Footer", FooterMd as ComponentMetadata],
        ["Pages", PagesMd as ComponentMetadata],
      ],
      themes: [
        {
          id: "brand",
          extends: "xmlui",
          themeVars: {
            "backgroundColor-Footer": "#0f172a",
            "gap-Pages": "23px",
          },
        },
      ],
    });

    expect(result.css).toContain("--xmlui-backgroundColor-Footer:#0f172a");
    expect(result.css).toContain("--xmlui-gap-Pages:23px");
  });

  test("component theme class preserves compound values resolved to CSS variables", () => {
    const PanelMd: ComponentMetadata = {
      themeVars: {
        "border-Panel": {
          name: "border-Panel",
          valueType: "border",
        },
      },
    };
    const result = renderThemeClassProvider({
      descriptor: PanelMd,
      entries: [["Panel", PanelMd]],
      themes: [
        {
          id: "brand",
          extends: "xmlui",
          themeVars: {
            "border-Panel": "1px solid $borderColor",
          },
        },
      ],
    });

    expect(result.css).toContain("--xmlui-border-Panel:1px solid var(--xmlui-borderColor)");
  });
});

function createCanaryTheme(): ThemeDefinition {
  return {
    id: "brand",
    extends: "xmlui",
    themeVars: {
      "brand-canary-marker": "yes",
      "space-base": "4px",
      fontSize: "16px",
      "fontSize-Text": "$fontSize",
      "padding-Card": "4px 8px",
      "border-Card": "2px dashed #0000ff",
      "color-primary": "#336699",
      "color-Button-primary": "#336699",
    },
    resources: {
      logo: "/theme/logo.svg",
      "font.remote": "https://example.test/font.css",
      "font.demo": "/fonts/demo.woff2",
    },
  };
}

function renderCanaryProvider({
  themes,
  defaultTheme,
  resources,
  resourceMap,
  componentThemeMetadata = createCoreComponentThemeMetadataRegistry(),
  strictTheming,
  strictAccessibility,
  enableOldThemeCanary,
}: {
  themes: ThemeDefinition[];
  defaultTheme: string;
  resources?: Record<string, string>;
  resourceMap?: Record<string, string>;
  componentThemeMetadata?: ReturnType<typeof createCoreComponentThemeMetadataRegistry>;
  strictTheming?: boolean;
  strictAccessibility?: boolean;
  enableOldThemeCanary: boolean;
}) {
  let capturedTheme: ThemeScope | undefined;
  const html = renderToStaticMarkup(
    <StyleProvider>
      <LegacyThemeProvider
        themes={themes}
        defaultTheme={defaultTheme}
        resources={resources}
        resourceMap={resourceMap}
        componentThemeMetadata={componentThemeMetadata}
        strictTheming={strictTheming}
        strictAccessibility={strictAccessibility}
        enableOldThemeCanary={enableOldThemeCanary}
      >
        <ThemeProbe onTheme={(theme) => {
          capturedTheme = theme;
        }} />
      </LegacyThemeProvider>
    </StyleProvider>,
  );
  if (!capturedTheme) {
    throw new Error("ThemeProbe did not render.");
  }
  return { html, theme: capturedTheme };
}

function renderThemeClassProvider({
  descriptor,
  explicitContributors = [],
  entries,
  themes,
}: {
  descriptor: ComponentMetadata;
  explicitContributors?: ComponentMetadata[];
  entries: Array<[string, ComponentMetadata]>;
  themes: ThemeDefinition[];
}) {
  let capturedClassName: string | undefined;
  const styleRegistry = new StyleRegistry();
  const componentThemeMetadata = collectComponentThemeMetadata(
    entries.map(([name, metadata]) => ({ name, metadata })),
  );
  const descriptors = new Map(entries);
  renderToStaticMarkup(
    <StyleProvider styleRegistry={styleRegistry}>
      <LegacyThemeProvider
        themes={themes}
        defaultTheme="brand"
        componentThemeMetadata={componentThemeMetadata}
        enableOldThemeCanary={false}
      >
        <ComponentRegistryProvider
          value={{
            lookupComponentRenderer: (name) => ({ descriptor: descriptors.get(name) }),
            componentThemeVars: componentThemeMetadata.componentThemeVars,
          }}
        >
          <ThemeClassProbe
            descriptor={descriptor}
            explicitContributors={explicitContributors}
            onClassName={(className) => {
              capturedClassName = className;
            }}
          />
        </ComponentRegistryProvider>
      </LegacyThemeProvider>
    </StyleProvider>,
  );
  if (!capturedClassName) {
    throw new Error("ThemeClassProbe did not render.");
  }
  return {
    className: capturedClassName,
    css: Array.from(styleRegistry.cache.values()).map((entry) => entry.css).join(""),
  };
}

function ThemeProbe({ onTheme }: { onTheme: (theme: ThemeScope) => void }) {
  const theme = useTheme();
  onTheme(theme);
  return <span>{`theme:${theme.activeThemeId}`}</span>;
}

function ThemeClassProbe({
  descriptor,
  explicitContributors,
  onClassName,
}: {
  descriptor: ComponentMetadata;
  explicitContributors: ComponentMetadata[];
  onClassName: (className: string | undefined) => void;
}) {
  const className = useComponentThemeClass(descriptor, explicitContributors);
  onClassName(className);
  return <span className={className}>class:{className}</span>;
}

class FakeStyleDeclaration {
  private values: Record<string, string>;

  constructor(values: Record<string, string>) {
    this.values = { ...values };
  }

  getPropertyValue(name: string): string {
    return this.values[name] ?? "";
  }

  setProperty(name: string, value: string): void {
    this.values[name] = value;
  }

  removeProperty(name: string): string {
    const value = this.values[name] ?? "";
    delete this.values[name];
    return value;
  }
}
