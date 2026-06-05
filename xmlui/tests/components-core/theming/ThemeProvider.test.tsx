/**
 * @vitest-environment jsdom
 */
import { render } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";

import type { ThemeDefinition } from "../../../src/abstractions/ThemingDefs";
import { useCompiledTheme } from "../../../src/components-core/theming/ThemeProvider";
import { resetThemeDiagnosticDeduplication } from "../../../src/components-core/theming/validator/emit";

const registryState = vi.hoisted(() => ({
  componentThemeVars: new Set<string>(),
  componentDefaultThemeVars: {},
  componentThemeVarDeclarations: new Map(),
}));

vi.mock("../../../src/components/ComponentRegistryContext", () => ({
  useComponentRegistry: vi.fn(() => registryState),
}));

describe("useCompiledTheme", () => {
  afterEach(() => {
    registryState.componentThemeVars = new Set<string>();
    registryState.componentDefaultThemeVars = {};
    registryState.componentThemeVarDeclarations = new Map();
    resetThemeDiagnosticDeduplication();
    vi.restoreAllMocks();
  });

  test("does not warn for denamespaced SCSS theme vars without default values", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    registryState.componentThemeVars = new Set<string>(["Input:borderRadius-TextArea"]);
    registryState.componentThemeVarDeclarations = new Map([
      ["Input:borderRadius-TextArea", { name: "Input:borderRadius-TextArea" }],
    ]);
    const theme: ThemeDefinition = {
      id: "test",
      name: "Test",
      themeVars: {
        "borderRadius-TextArea": "4px",
      },
    };
    let resolvedThemeVars: Record<string, string> | undefined;

    const TestComponent = () => {
      resolvedThemeVars = useCompiledTheme(
        theme,
        "light",
        [theme],
        {},
        {},
        true,
      ).allThemeVarsWithResolvedHierarchicalVars;
      return null;
    };

    render(<TestComponent />);

    expect(resolvedThemeVars?.["borderRadius-TextArea"]).toBe("4px");
    expect(warn).not.toHaveBeenCalledWith(
      expect.stringContaining("[XMLUI Theme] [unknown-theme-variable]"),
    );
    expect(error).not.toHaveBeenCalled();
  });

  test("drops invalid strict theme variables from compiled and raw theme maps", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    registryState.componentThemeVars = new Set<string>(["backgroundColor-Button"]);
    registryState.componentThemeVarDeclarations = new Map([
      ["backgroundColor-Button", { name: "backgroundColor-Button", valueType: "color" }],
      ["backgroundColor-Button--hover", { name: "backgroundColor-Button--hover", valueType: "color" }],
    ]);
    const theme: ThemeDefinition = {
      id: "test",
      name: "Test",
      themeVars: {
        "backgroundColor-Button": "#abc def",
        "backgroundColor-Button--hover": "$backgroundColor-Button",
      },
    };
    let compiled:
      | ReturnType<typeof useCompiledTheme>
      | undefined;

    const TestComponent = () => {
      compiled = useCompiledTheme(theme, "light", [theme], {}, {}, true);
      return null;
    };

    render(<TestComponent />);

    expect(compiled?.allThemeVarsWithResolvedHierarchicalVars["backgroundColor-Button"]).toBeUndefined();
    expect(compiled?.allThemeVarsWithResolvedHierarchicalVars["backgroundColor-Button--hover"]).toBeUndefined();
    expect(compiled?.getThemeVar("backgroundColor-Button")).toBeUndefined();
    expect(compiled?.getThemeVar("backgroundColor-Button--hover")).toBeUndefined();
    expect(compiled?.invalidThemeVarNames.has("backgroundColor-Button")).toBe(true);
    expect(compiled?.invalidThemeVarNames.has("backgroundColor-Button--hover")).toBe(true);
  });

  test("treats invalid strict theme variables as absent and reports them", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    registryState.componentThemeVars = new Set<string>([
      "backgroundColor-Button",
      "padding-Button",
      "backgroundColor-Buton",
    ]);
    registryState.componentThemeVarDeclarations = new Map([
      ["backgroundColor-Button", { name: "backgroundColor-Button", valueType: "color" }],
      ["padding-Button", { name: "padding-Button", valueType: "length" }],
      ["backgroundColor-Buton", { name: "backgroundColor-Buton", valueType: "color" }],
    ]);
    const withInvalidBase: ThemeDefinition = {
      id: "with-invalid-base",
      name: "With invalid base",
      themeVars: {
        "backgroundColor-Button": "#abc def",
        "padding-Button": "1rim",
        "backgroundColor-Buton": "#ff0066",
      },
    };
    const withoutInvalidBase: ThemeDefinition = {
      id: "without-invalid-base",
      name: "Without invalid base",
      themeVars: {
        "padding-Button": "1rim",
        "backgroundColor-Buton": "#ff0066",
      },
    };
    const compiled: Array<ReturnType<typeof useCompiledTheme>> = [];

    const TestComponent = () => {
      compiled[0] = useCompiledTheme(withInvalidBase, "light", [withInvalidBase], {}, {}, true);
      compiled[1] = useCompiledTheme(withoutInvalidBase, "light", [withoutInvalidBase], {}, {}, true);
      return null;
    };

    render(<TestComponent />);

    expect(compiled[0].allThemeVarsWithResolvedHierarchicalVars).toEqual(
      compiled[1].allThemeVarsWithResolvedHierarchicalVars,
    );
    expect(compiled[0].themeCssVars).toEqual(compiled[1].themeCssVars);
    expect(compiled[0].getThemeVar("backgroundColor-Button")).toBeUndefined();
    expect(compiled[1].getThemeVar("backgroundColor-Button")).toBeUndefined();
    expect(error).toHaveBeenCalledWith(
      expect.stringContaining(
        '[XMLUI Theme] [invalid-theme-value] Theme variable "backgroundColor-Button"',
      ),
    );
    expect(error).toHaveBeenCalledWith(
      expect.stringContaining('[XMLUI Theme] [invalid-theme-value] Theme variable "padding-Button"'),
    );
  });
});
