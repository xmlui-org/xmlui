/**
 * @vitest-environment jsdom
 */
import { render } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";

import type { ThemeDefinition } from "../../../src/abstractions/ThemingDefs";
import { useCompiledTheme } from "../../../src/components-core/theming/ThemeProvider";

vi.mock("../../../src/components/ComponentRegistryContext", () => ({
  useComponentRegistry: vi.fn(() => ({
    componentThemeVars: new Set<string>(),
    componentDefaultThemeVars: {},
    componentThemeVarDeclarations: new Map(),
  })),
}));

describe("useCompiledTheme", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("keeps warning-level theme diagnostics out of the browser console", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const theme: ThemeDefinition = {
      id: "test",
      name: "Test",
      themeVars: {
        "unknown-theme-var": "red",
      },
    };

    const TestComponent = () => {
      useCompiledTheme(theme, "light", [theme], {}, {}, true);
      return null;
    };

    render(<TestComponent />);

    expect(warn).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
  });
});
