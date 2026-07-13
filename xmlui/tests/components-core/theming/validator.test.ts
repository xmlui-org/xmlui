import { afterEach, describe, expect, it, vi } from "vitest";

import {
  lookupThemeRule,
  validateInlineStyle,
  validateStyleString,
  validateTheme,
  verifyThemeValue,
} from "../../../src/components-core/theming/validator";
import {
  emitThemeDiagnostics,
  resetThemeDiagnosticDeduplication,
} from "../../../src/components-core/theming/validator/emit";
import type { ThemeVarMetadata } from "../../../src/abstractions/ComponentDefs";

afterEach(() => {
  resetThemeDiagnosticDeduplication();
  vi.restoreAllMocks();
});

describe("theming validator — rule table", () => {
  it("returns undefined for opt-out 'string' and unknown types", () => {
    expect(lookupThemeRule("string")).toBeUndefined();
    expect(lookupThemeRule(undefined)).toBeUndefined();
    expect(lookupThemeRule("nonsense" as any)).toBeUndefined();
  });

  it("delegates to shared color/length/integer/number rules", () => {
    expect(lookupThemeRule("color")).toBeDefined();
    expect(lookupThemeRule("length")).toBeDefined();
    expect(lookupThemeRule("integer")).toBeDefined();
    expect(lookupThemeRule("number")).toBeDefined();
  });

  it("registers the 7 theming-only rules", () => {
    for (const t of [
      "duration",
      "easing",
      "shadow",
      "border",
      "fontFamily",
      "fontWeight",
      "lineHeight",
    ] as const) {
      expect(lookupThemeRule(t), `${t} rule`).toBeDefined();
    }
  });
});

describe("theming validator — color", () => {
  it("accepts component-shaped theme variable references", () => {
    expect(verifyThemeValue("color", "textColor-Link--hover")).toBeNull();
  });
  it("accepts modern CSS color functions emitted by generated theme values", () => {
    expect(verifyThemeValue("color", "color(srgb 0.436168 0.651561 0.907832)")).toBeNull();
  });
  it("still rejects arbitrary bare words", () => {
    expect(verifyThemeValue("color", "not-a-color")).not.toBeNull();
  });
});

describe("theming validator — duration", () => {
  it.each(["200ms", "0.5s", "0", "var(--xmlui-d)", "$x"])("accepts %s", (v) => {
    expect(verifyThemeValue("duration", v)).toBeNull();
  });
  it.each(["200", "abc", "1px"])("rejects %s", (v) => {
    expect(verifyThemeValue("duration", v)).not.toBeNull();
  });
  it("accepts a finite JS number (treated as ms)", () => {
    expect(verifyThemeValue("duration", 250)).toBeNull();
  });
});

describe("theming validator — easing", () => {
  it.each(["linear", "ease", "ease-in-out", "cubic-bezier(0.1,0.7,1,0.1)", "steps(4, end)", "var(--e)", "$e"])(
    "accepts %s",
    (v) => {
      expect(verifyThemeValue("easing", v)).toBeNull();
    },
  );
  it("rejects an unknown name", () => {
    expect(verifyThemeValue("easing", "bouncy")).not.toBeNull();
  });
});

describe("theming validator — shadow", () => {
  it.each(["none", "0 1px 2px rgba(0,0,0,0.2)", "inset 0 0 4px #000", "0 1px 0 #000, 0 2px 4px rgba(0,0,0,0.1)"])(
    "accepts %s",
    (v) => {
      expect(verifyThemeValue("shadow", v)).toBeNull();
    },
  );
  it("rejects a shadow without a length token", () => {
    expect(verifyThemeValue("shadow", "red blue")).not.toBeNull();
  });
});

describe("theming validator — border", () => {
  it.each(["none", "solid", "1px solid red", "2px dashed", "var(--b)"])("accepts %s", (v) => {
    expect(verifyThemeValue("border", v)).toBeNull();
  });
  it("rejects multi-token shorthand missing line-style", () => {
    expect(verifyThemeValue("border", "1px red")).not.toBeNull();
  });
});

describe("theming validator — fontFamily", () => {
  it.each([
    "Inter, sans-serif",
    '"Segoe UI", Arial',
    "serif",
    "monospace",
    "-apple-system",
    "-apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif",
  ])("accepts %s", (v) => {
    expect(verifyThemeValue("fontFamily", v)).toBeNull();
  });
  it("rejects an entry with stray punctuation", () => {
    expect(verifyThemeValue("fontFamily", "Inter; sans-serif")).not.toBeNull();
  });
});

describe("theming validator — fontWeight", () => {
  it.each([100, 400, 900, "normal", "bold", "300", "lighter", "fontWeight-Text"])("accepts %s", (v) => {
    expect(verifyThemeValue("fontWeight", v as any)).toBeNull();
  });
  it.each([150, "abc", -100])("rejects %s", (v) => {
    expect(verifyThemeValue("fontWeight", v as any)).not.toBeNull();
  });
});

describe("theming validator — lineHeight", () => {
  it.each(["normal", "1.5", "20px", 1.25])("accepts %s", (v) => {
    expect(verifyThemeValue("lineHeight", v as any)).toBeNull();
  });
  it("rejects a non-numeric non-length", () => {
    expect(verifyThemeValue("lineHeight", "fluffy")).not.toBeNull();
  });
});

describe("theming validator — length", () => {
  it("accepts CSS calc expressions", () => {
    expect(verifyThemeValue("length", "calc(var(--xmlui-fontSize-Text) * 0.875)")).toBeNull();
  });
  it.each(["min(10px, 2rem)", "max(10px, 2rem)", "clamp(12px, 2vw, 18px)"])(
    "accepts CSS math expression %s",
    (value) => {
      expect(verifyThemeValue("length", value)).toBeNull();
    },
  );
});

describe("validateTheme", () => {
  const decls = new Map<string, ThemeVarMetadata>([
    ["backgroundColor-Button", { name: "backgroundColor-Button", valueType: "color" }],
    ["padding-Button", { name: "padding-Button", valueType: "length" }],
    ["transitionDuration-Button", { name: "transitionDuration-Button", valueType: "duration" }],
    ["mode-Button", { name: "mode-Button", availableValues: ["light", "dark"] }],
  ]);

  it("returns no diagnostics for a valid theme", () => {
    const resolved = new Map<string, string>([
      ["backgroundColor-Button", "#fff"],
      ["padding-Button", "8px"],
      ["transitionDuration-Button", "200ms"],
      ["mode-Button", "dark"],
    ]);
    expect(validateTheme(resolved, decls)).toEqual([]);
  });

  it("flags invalid-theme-value for a bad color", () => {
    const resolved = new Map([["backgroundColor-Button", "not a color"]]);
    const diags = validateTheme(resolved, decls);
    expect(diags).toHaveLength(1);
    expect(diags[0].code).toBe("invalid-theme-value");
    expect(diags[0].severity).toBe("warn");
    expect(diags[0].variableName).toBe("backgroundColor-Button");
  });

  it("escalates invalid-theme-value to error in strict mode", () => {
    const resolved = new Map([["backgroundColor-Button", "not a color"]]);
    const diags = validateTheme(resolved, decls, { strict: true });
    expect(diags).toHaveLength(1);
    expect(diags[0].severity).toBe("error");
  });

  it("emits unknown-theme-variable for unknown names (warn even in strict)", () => {
    const resolved = new Map([["unknown-thing", "10px"]]);
    const strict = validateTheme(resolved, decls, { strict: true });
    expect(strict[0].code).toBe("unknown-theme-variable");
    expect(strict[0].severity).toBe("warn");
  });

  it("treats empty string theme values as unset", () => {
    const resolved = new Map([
      ["backgroundColor-Button", ""],
      ["paddingHorizontal-ModalDialog", "   "],
      ["unknown-theme-variable", ""],
    ]);
    expect(validateTheme(resolved, decls, { strict: true })).toEqual([]);
  });

  it("does not emit unknown-theme-variable for known but untyped names", () => {
    const resolved = new Map([["backgroundColor-track-Slider", "$color-surface-200"]]);
    const diags = validateTheme(resolved, decls, {
      strict: true,
      knownNames: new Set(["backgroundColor-track-Slider"]),
    });
    expect(diags).toEqual([]);
  });

  it("infers color validation for known theme variables without explicit valueType", () => {
    const resolved = new Map([["backgroundColor-Button", "#abc def"]]);
    const diags = validateTheme(
      resolved,
      new Map([["backgroundColor-Button", { name: "backgroundColor-Button" }]]),
      { strict: true },
    );
    expect(diags).toHaveLength(1);
    expect(diags[0]).toMatchObject({
      code: "invalid-theme-value",
      severity: "error",
      variableName: "backgroundColor-Button",
      expected: "color",
    });
  });

  it("does not repeat invalid base color diagnostics for derived Button variants", () => {
    const resolved = new Map([
      ["backgroundColor-Button", "#abc def"],
      ["backgroundColor-Button--hover", "#abc def"],
      ["backgroundColor-Button-primary-solid", "#abc def"],
      ["backgroundColor-Button-primary-solid--hover", "#abc def"],
      ["backgroundColor-Button-primary-solid--active", "#abc def"],
    ]);
    const diags = validateTheme(resolved, new Map(), {
      strict: true,
      knownNames: new Set(resolved.keys()),
    });
    expect(diags.map((diag) => diag.variableName)).toEqual(["backgroundColor-Button"]);
  });

  it("can include derived diagnostics for strict filtering", () => {
    const resolved = new Map([
      ["backgroundColor-Button", "#abc def"],
      ["backgroundColor-Button--hover", "#abc def"],
    ]);
    const diags = validateTheme(resolved, new Map(), {
      strict: true,
      knownNames: new Set(resolved.keys()),
      includeDerived: true,
    });
    expect(diags.map((diag) => diag.variableName)).toEqual([
      "backgroundColor-Button",
      "backgroundColor-Button--hover",
    ]);
  });

  it("keeps explicit invalid derived color diagnostics when the base color is valid", () => {
    const resolved = new Map([
      ["backgroundColor-Button", "#fff"],
      ["backgroundColor-Button-primary-solid", "#abc def"],
    ]);
    const diags = validateTheme(resolved, new Map(), {
      strict: true,
      knownNames: new Set(resolved.keys()),
    });
    expect(diags.map((diag) => diag.variableName)).toEqual([
      "backgroundColor-Button-primary-solid",
    ]);
  });

  it("infers length validation for known theme variables without explicit valueType", () => {
    const resolved = new Map([["padding-Button", "1rim"]]);
    const diags = validateTheme(
      resolved,
      new Map([["padding-Button", { name: "padding-Button" }]]),
      { strict: true },
    );
    expect(diags).toHaveLength(1);
    expect(diags[0]).toMatchObject({
      code: "invalid-theme-value",
      severity: "error",
      variableName: "padding-Button",
      expected: "length",
    });
  });

  it("does not repeat invalid shorthand padding diagnostics for generated side variables", () => {
    const resolved = new Map([
      ["padding-Button", "1rim"],
      ["paddingTop-Button", "1rim"],
      ["paddingRight-Button", "1rim"],
      ["paddingBottom-Button", "1rim"],
      ["paddingLeft-Button", "1rim"],
    ]);
    const diags = validateTheme(resolved, new Map(), {
      strict: true,
      knownNames: new Set(resolved.keys()),
    });
    expect(diags.map((diag) => diag.variableName)).toEqual(["padding-Button"]);
  });

  it("does not repeat invalid base padding diagnostics for size fallback variables", () => {
    const resolved = new Map([
      ["padding-Button", "1rim"],
      ["padding-Button-xs", "1rim"],
      ["padding-Button-sm", "1rim"],
      ["padding-Button-md", "1rim"],
      ["padding-Button-lg", "1rim"],
    ]);
    const diags = validateTheme(resolved, new Map(), {
      strict: true,
      knownNames: new Set(resolved.keys()),
    });
    expect(diags.map((diag) => diag.variableName)).toEqual(["padding-Button"]);
  });

  it("keeps explicit invalid size-specific padding diagnostics when base padding is valid", () => {
    const resolved = new Map([
      ["padding-Button", "4px"],
      ["padding-Button-xs", "1rim"],
    ]);
    const diags = validateTheme(resolved, new Map(), {
      strict: true,
      knownNames: new Set(resolved.keys()),
    });
    expect(diags.map((diag) => diag.variableName)).toEqual(["padding-Button-xs"]);
  });

  it("keeps explicit invalid padding side diagnostics when no shorthand is invalid", () => {
    const resolved = new Map([["paddingTop-Button", "1rim"]]);
    const diags = validateTheme(resolved, new Map(), {
      strict: true,
      knownNames: new Set(resolved.keys()),
    });
    expect(diags.map((diag) => diag.variableName)).toEqual(["paddingTop-Button"]);
  });

  it("accepts multi-token length values for inferred spacing variables", () => {
    const resolved = new Map([["padding-Button", "$space-2 $space-4"]]);
    const diags = validateTheme(
      resolved,
      new Map([["padding-Button", { name: "padding-Button" }]]),
      { strict: true },
    );
    expect(diags).toEqual([]);
  });

  it("still emits unknown-theme-variable for typos not in knownNames", () => {
    const resolved = new Map([["backgroundColor-Buton", "#ff0066"]]);
    const diags = validateTheme(resolved, decls, {
      strict: true,
      knownNames: new Set(["backgroundColor-Button"]),
    });
    expect(diags).toHaveLength(1);
    expect(diags[0].code).toBe("unknown-theme-variable");
  });

  it("rejects values not in availableValues", () => {
    const resolved = new Map([["mode-Button", "neon"]]);
    const diags = validateTheme(resolved, decls);
    expect(diags[0].code).toBe("invalid-theme-value");
    expect(diags[0].expected).toBe("light | dark");
  });
});

describe("validateInlineStyle (layout props)", () => {
  it("passes a valid length", () => {
    const { value, diagnostics } = validateInlineStyle({
      propName: "width",
      valueType: "length",
      rawValue: "100px",
    });
    expect(value).toBe("100px");
    expect(diagnostics).toEqual([]);
  });

  it("warns on an invalid length", () => {
    const { value, diagnostics } = validateInlineStyle({
      propName: "width",
      valueType: "length",
      rawValue: "fluffy",
    });
    expect(value).toBe("fluffy");
    expect(diagnostics[0].severity).toBe("warn");
  });

  it("drops the value in strict mode", () => {
    const { value, diagnostics } = validateInlineStyle(
      { propName: "width", valueType: "length", rawValue: "fluffy" },
      { strict: true },
    );
    expect(value).toBeUndefined();
    expect(diagnostics[0].severity).toBe("error");
  });

  it("clamps zIndex above the ceiling", () => {
    const { value, diagnostics } = validateInlineStyle({
      propName: "zIndex",
      valueType: "integer",
      rawValue: 999999,
    });
    expect(value).toBe(9999);
    expect(diagnostics[0].code).toBe("invalid-theme-value");
  });

  it("respects a custom ceiling", () => {
    const { value } = validateInlineStyle(
      { propName: "zIndex", valueType: "integer", rawValue: 200 },
      { maxZIndex: 100 },
    );
    expect(value).toBe(100);
  });

  it("returns undefined for empty input without diagnostics", () => {
    const r = validateInlineStyle({ propName: "width", valueType: "length", rawValue: undefined });
    expect(r.value).toBeUndefined();
    expect(r.diagnostics).toEqual([]);
  });
});

describe("validateStyleString (style prop funnel)", () => {
  it("passes a valid background", () => {
    const r = validateStyleString("background: red");
    expect(r.diagnostics).toEqual([]);
    expect(r.value).toContain("background: red");
  });

  it("flags position: fixed (warn) and keeps it in non-strict", () => {
    const r = validateStyleString("position: fixed; color: red");
    expect(r.diagnostics.find((d) => d.code === "position-fixed-blocked")).toBeDefined();
    expect(r.value).toMatch(/position: fixed/);
  });

  it("drops position: fixed in strict mode", () => {
    const r = validateStyleString("position: fixed; color: red", {}, { strict: true });
    const d = r.diagnostics.find((d) => d.code === "position-fixed-blocked")!;
    expect(d.severity).toBe("error");
    expect(r.value).not.toMatch(/position/);
    expect(r.value).toMatch(/color: red/);
  });

  it("flags url(...) when allowRawCss is false", () => {
    const r = validateStyleString(
      "background: url(http://evil.example/x)",
      {},
      { allowRawCss: false },
    );
    expect(r.diagnostics.find((d) => d.code === "url-in-style")).toBeDefined();
  });

  it("does not flag url(...) when allowRawCss is true (default)", () => {
    const r = validateStyleString("background: url(/local.png)");
    expect(r.diagnostics.find((d) => d.code === "url-in-style")).toBeUndefined();
  });

  it("flags !important when allowRawCss is false", () => {
    const r = validateStyleString("z-index: 10 !important", {}, { allowRawCss: false });
    expect(r.diagnostics.find((d) => d.code === "important-blocked")).toBeDefined();
  });

  it("flags unknown properties as raw-css-in-prop (warn)", () => {
    const r = validateStyleString("clip-path: circle(50%)");
    expect(r.diagnostics[0].code).toBe("raw-css-in-prop");
    expect(r.diagnostics[0].severity).toBe("warn");
    expect(r.value).toContain("clip-path");
  });

  it("drops unknown properties only when strict + !allowRawCss", () => {
    const r = validateStyleString("clip-path: circle(50%)", {}, { strict: true, allowRawCss: false });
    expect(r.value).toBe("");
  });

  it("flags an invalid known-property value (e.g. width)", () => {
    const r = validateStyleString("width: fluffy");
    expect(r.diagnostics[0].code).toBe("invalid-theme-value");
  });

  it("handles empty input", () => {
    expect(validateStyleString("").diagnostics).toEqual([]);
    expect(validateStyleString("   ").diagnostics).toEqual([]);
  });
});

describe("emitThemeDiagnostics", () => {
  it("echoes warning diagnostics to the browser console", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const error = vi.spyOn(console, "error").mockImplementation(() => {});

    emitThemeDiagnostics([
      {
        code: "unknown-theme-variable",
        severity: "warn",
        variableName: "backgroundColor-Buton",
        actual: "#ff0066",
        message: "Unknown theme variable 'backgroundColor-Buton'.",
      },
    ]);

    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining("[XMLUI Theme] [unknown-theme-variable]"),
    );
    expect(error).not.toHaveBeenCalled();
  });

  it("does not echo identical diagnostics more than once", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const diagnostic = {
      code: "invalid-theme-value" as const,
      severity: "error" as const,
      variableName: "backgroundColor-Button",
      actual: "#abc def",
      message: 'Theme variable "backgroundColor-Button": Expected a CSS color.',
    };
    const error = vi.spyOn(console, "error").mockImplementation(() => {});

    emitThemeDiagnostics([diagnostic]);
    emitThemeDiagnostics([diagnostic]);

    expect(error).toHaveBeenCalledTimes(1);
    expect(warn).not.toHaveBeenCalled();
  });

  it("echoes strict diagnostics to the browser console as errors", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const error = vi.spyOn(console, "error").mockImplementation(() => {});

    emitThemeDiagnostics([
      {
        code: "position-fixed-blocked",
        severity: "error",
        propName: "style",
        actual: "position: fixed",
        message: "style blocks position: fixed.",
      },
    ]);

    expect(error).toHaveBeenCalledWith(
      expect.stringContaining("[XMLUI Theme] [position-fixed-blocked]"),
    );
    expect(warn).not.toHaveBeenCalled();
  });
});
