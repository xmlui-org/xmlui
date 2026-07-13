import { toCssVar } from "../../parsers/style-parser/StyleParser";
import { type HVar, parseHVar } from "./hvar";

export type OldThemeVars = Record<string, string>;

export function isThemeVarName(varName: unknown) {
  return typeof varName === "string" && varName.startsWith("$");
}

export function resolveThemeVar(
  varName: string | undefined,
  theme: OldThemeVars = {},
  seen: Set<string> = new Set(),
): string | undefined {
  let safeVarName = varName;
  if (isThemeVarName(varName)) {
    safeVarName = varName.substring(1);
  }
  if (!safeVarName || seen.has(safeVarName)) {
    return undefined;
  }
  seen.add(safeVarName);
  const value = safeVarName ? theme[safeVarName] : undefined;
  if (typeof value === "string" && isThemeVarName(value)) {
    return resolveThemeVar(value, theme, seen);
  }
  return value;
}

export function resolveThemeVarsWithCssVars(theme: OldThemeVars = {}): OldThemeVars {
  const ret: OldThemeVars = {};
  Object.entries(theme).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }
    const resolved = resolveThemeVar(key, theme);
    if (resolved === undefined || resolved === null) {
      return;
    }
    ret[key] = replaceEmbeddedThemeVars(resolved);
  });
  return ret;
}

export function generateBaseTones(theme: OldThemeVars | undefined) {
  if (!theme) {
    return {};
  }
  const resolvedTheme = resolveThemeVars(theme);
  return {
    ...generateBaseTonesForColor("color-primary", resolvedTheme),
    ...generateBaseTonesForColor("color-secondary", resolvedTheme),
    ...generateBaseTonesForColor("color-info", resolvedTheme),
    ...generateBaseTonesForColor("color-success", resolvedTheme),
    ...generateBaseTonesForColor("color-warn", resolvedTheme),
    ...generateBaseTonesForColor("color-danger", resolvedTheme),
    ...generateBaseTonesForColor("color-surface", resolvedTheme, { distributeEven: true }),
  };
}

export function generateBaseSpacings(theme: OldThemeVars | undefined) {
  if (!theme) {
    return {};
  }
  const resolvedTheme = resolveThemeVars(theme);
  const base = resolvedTheme["space-base"];
  if (!base || typeof base !== "string") {
    return {};
  }
  const parsed = parseCssNumber(base);
  if (!parsed) {
    return {};
  }
  const scale = [
    0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 16, 20, 24, 28, 32, 36, 40,
    44, 48, 52, 56, 60, 64, 72, 80, 96,
  ];
  const ret: OldThemeVars = {};

  scale.forEach((step) => {
    ret[`space-${(`${step}`).replace(".", "_")}`] = `${step * parsed.value}${parsed.unit}`;
  });

  return ret;
}

export function generateBootstrapBaseColumns(theme: OldThemeVars | undefined = {}) {
  if (!theme) {
    return {};
  }
  const ret: OldThemeVars = {};
  for (let i = 1; i <= 12; i++) {
    ret[`col-${i}`] = `${((100 / 12) * i).toFixed(4)}%`;
  }
  return ret;
}

export function generateBaseFontSizes(theme: OldThemeVars | undefined) {
  if (!theme) {
    return {};
  }

  const resolvedTheme = resolveThemeVars(theme);
  const base = resolvedTheme["fontSize"];
  if (!base || typeof base !== "string") {
    return {};
  }

  const parsed = parseCssNumber(base);
  let baseNum = parsed?.value ?? 16;
  let baseUnit = parsed?.unit ?? "px";
  if (baseUnit !== "px" || !Number.isFinite(baseNum)) {
    baseUnit = "px";
    baseNum = 16;
  }

  const ret: OldThemeVars = {};
  ret["const-fontSize-tiny"] = `${0.625 * baseNum}${baseUnit}`;
  ret["const-fontSize-xs"] = `${0.75 * baseNum}${baseUnit}`;
  ret["const-fontSize-code"] = `${0.85 * baseNum}${baseUnit}`;
  ret["const-fontSize-sm"] = `${0.875 * baseNum}${baseUnit}`;
  ret["const-fontSize-base"] = base;
  ret["const-fontSize-lg"] = `${1.125 * baseNum}${baseUnit}`;
  ret["const-fontSize-xl"] = `${1.25 * baseNum}${baseUnit}`;
  ret["const-fontSize-2xl"] = `${1.5 * baseNum}${baseUnit}`;
  ret["const-fontSize-3xl"] = `${1.875 * baseNum}${baseUnit}`;
  ret["const-fontSize-4xl"] = `${2.25 * baseNum}${baseUnit}`;
  ret["const-fontSize-5xl"] = `${3 * baseNum}${baseUnit}`;
  ret["const-fontSize-6xl"] = `${3.75 * baseNum}${baseUnit}`;
  ret["const-fontSize-7xl"] = `${4.5 * baseNum}${baseUnit}`;
  ret["const-fontSize-8xl"] = `${6 * baseNum}${baseUnit}`;
  ret["const-fontSize-9xl"] = `${8 * baseNum}${baseUnit}`;
  return ret;
}

export function generateTextFontSizes(theme: OldThemeVars | undefined) {
  if (!theme) {
    return {};
  }
  const resolvedTheme = resolveThemeVars(theme);
  const base = resolvedTheme["fontSize-Text"];
  if (!base || typeof base !== "string") {
    return {};
  }

  const ret: OldThemeVars = {};
  ret["fontSize-Text-keyboard"] = `calc(${toCssVar("$fontSize-Text")} * 0.875)`;
  ret["fontSize-Text-sample"] = `calc(${toCssVar("$fontSize-Text")} * 0.875)`;
  ret["fontSize-Text-sup"] = `calc(${toCssVar("$fontSize-Text")} * 0.625)`;
  ret["fontSize-Text-sub"] = `calc(${toCssVar("$fontSize-Text")} * 0.625)`;
  ret["fontSize-Text-title"] = `calc(${toCssVar("$fontSize-Text")} * 1.5)`;
  ret["fontSize-Text-subtitle"] = `calc(${toCssVar("$fontSize-Text")} * 1.25)`;
  ret["fontSize-Text-small"] = `calc(${toCssVar("$fontSize-Text")} * 0.875)`;
  ret["fontSize-Text-placeholder"] = `calc(${toCssVar("$fontSize-Text")} * 0.875)`;
  ret["fontSize-Text-paragraph"] = toCssVar("$fontSize-Text");
  ret["fontSize-Text-subheading"] = `calc(${toCssVar("$fontSize-Text")} * 0.625)`;
  ret["fontSize-Text-tableheading"] = `calc(${toCssVar("$fontSize-Text")} * 0.625)`;
  ret["fontSize-Text-secondary"] = `calc(${toCssVar("$fontSize-Text")} * 0.875)`;

  return ret;
}

export function generateButtonTones(theme?: OldThemeVars) {
  if (!theme) {
    return {};
  }
  const resolvedTheme = resolveThemeVars(theme);
  const variants = ["primary", "secondary", "attention"];

  let ret: OldThemeVars = {};

  variants.forEach((variant) => {
    const solidTones = mapTones(findClosest(resolvedTheme, `color-Button-${variant}-solid`), (tones) => ({
      [`backgroundColor-Button-${variant}-solid`]: toCssVar(`$backgroundColor-Button-${variant}`),
      [`backgroundColor-Button-${variant}-solid--hover`]: tones.tone1,
      [`backgroundColor-Button-${variant}-solid--active`]: tones.tone2,
      [`borderColor-Button-${variant}-solid`]: toCssVar(`$borderColor-Button-${variant}`),
      [`borderColor-Button-${variant}-solid--hover`]: toCssVar(`$borderColor-Button-${variant}`),
      [`borderColor-Button-${variant}-solid--active`]: toCssVar(`$borderColor-Button-${variant}`),
      [`textColor-Button-${variant}-solid`]: tones.tone3,
      [`textColor-Button-${variant}-solid--hover`]: tones.tone3,
      [`textColor-Button-${variant}-solid--active`]: tones.tone3,
    }));

    const outlinedTones = mapTones(findClosest(resolvedTheme, `color-Button-${variant}-outlined`), (tones) => ({
      [`backgroundColor-Button-${variant}-outlined--hover`]: tones.alpha1,
      [`backgroundColor-Button-${variant}-outlined--active`]: tones.alpha2,
      [`borderColor-Button-${variant}-outlined`]: tones.base,
      [`borderColor-Button-${variant}-outlined--hover`]: tones.tone1,
      [`borderColor-Button-${variant}-outlined--active`]: tones.tone2,
      [`textColor-Button-${variant}-outlined`]: tones.base,
      [`textColor-Button-${variant}-outlined--hover`]: tones.tone1,
      [`textColor-Button-${variant}-outlined--active`]: tones.tone2,
    }));

    const ghostTones = mapTones(findClosest(resolvedTheme, `color-Button-${variant}-ghost`), (tones) => ({
      [`backgroundColor-Button-${variant}-ghost--active`]: tones.alpha2,
      [`backgroundColor-Button-${variant}-ghost--hover`]: tones.alpha1,
      [`textColor-Button-${variant}-ghost`]: tones.base,
      [`textColor-Button-${variant}-ghost--hover`]: tones.tone1,
      [`textColor-Button-${variant}-ghost--active`]: tones.tone2,
    }));
    ret = {
      ...ret,
      ...solidTones,
      ...outlinedTones,
      ...ghostTones,
    };
  });
  return ret;
}

const paddingRegEx = /^padding-(?!(?:horizontal|vertical|left|right|top|bottom)-)(.+)$/;
const paddingHorizontalRegEx = /^paddingHorizontal-(.+)$/;
const paddingVerticalRegEx = /^paddingVertical-(.+)$/;

export function generatePaddingSegments(theme?: OldThemeVars) {
  if (!theme) {
    return {};
  }
  const result = { ...theme };

  Object.entries(theme).forEach(([key, value]) => {
    if (value === null || value === undefined) {
      delete result[key];
      return;
    }

    let match = paddingHorizontalRegEx.exec(key);
    if (match) {
      const remainder = match[1];
      result[`paddingLeft-${remainder}`] ??= value;
      result[`paddingRight-${remainder}`] ??= value;
    }

    match = paddingVerticalRegEx.exec(key);
    if (match) {
      const remainder = match[1];
      result[`paddingTop-${remainder}`] ??= value;
      result[`paddingBottom-${remainder}`] ??= value;
    }

    match = paddingRegEx.exec(key);
    if (!match) return;
    const remainder = match[1];
    const horizontal = theme[`paddingHorizontal-${remainder}`];
    const vertical = theme[`paddingVertical-${remainder}`];
    const segments = value.trim().replace(/ +/g, " ").split(" ");
    switch (segments.length) {
      case 1:
        result[`paddingTop-${remainder}`] ??= vertical ?? segments[0];
        result[`paddingRight-${remainder}`] ??= horizontal ?? segments[0];
        result[`paddingBottom-${remainder}`] ??= vertical ?? segments[0];
        result[`paddingLeft-${remainder}`] ??= horizontal ?? segments[0];
        break;
      case 2:
        result[`paddingTop-${remainder}`] ??= vertical ?? segments[0];
        result[`paddingRight-${remainder}`] ??= horizontal ?? segments[1];
        result[`paddingBottom-${remainder}`] ??= vertical ?? segments[0];
        result[`paddingLeft-${remainder}`] ??= horizontal ?? segments[1];
        break;
      case 3:
        result[`paddingTop-${remainder}`] ??= vertical ?? segments[0];
        result[`paddingRight-${remainder}`] ??= horizontal ?? segments[1];
        result[`paddingBottom-${remainder}`] ??= vertical ?? segments[2];
        result[`paddingLeft-${remainder}`] ??= horizontal ?? segments[1];
        break;
      case 4:
        result[`paddingTop-${remainder}`] ??= vertical ?? segments[0];
        result[`paddingRight-${remainder}`] ??= horizontal ?? segments[1];
        result[`paddingBottom-${remainder}`] ??= vertical ?? segments[2];
        result[`paddingLeft-${remainder}`] ??= horizontal ?? segments[3];
        break;
      default:
        return;
    }
  });

  return result;
}

const borderRegEx = /^border-(.+)$/;
const thicknessBorderRegEx = /^borderWidth-(.+)$/;
const thicknessBorderHorizontalRegEx = /^borderHorizontalWidth-(.+)$/;
const thicknessBorderVerticalRegEx = /^borderVerticalWidth-(.+)$/;
const styleBorderRegEx = /^borderStyle-(.+)$/;
const styleBorderHorizontalRegEx = /^borderHorizontalStyle-(.+)$/;
const styleBorderVerticalRegEx = /^borderVerticalStyle-(.+)$/;
const borderLeftRegEx = /^borderLeft-(.+)$/;
const borderRightRegEx = /^borderRight-(.+)$/;
const borderTopRegEx = /^borderTop-(.+)$/;
const borderBottomRegEx = /^borderBottom-(.+)$/;
const borderHorizontalRegEx = /^borderHorizontal-(.+)$/;
const borderVerticalRegEx = /^borderVertical-(.+)$/;
const colorBorderRegEx = /^borderColor-(.+)$/;
const colorBorderHorizontalRegEx = /^borderHorizontalColor-(.+)$/;
const colorBorderVerticalRegEx = /^borderVerticalColor-(.+)$/;

export function generateBorderSegments(theme?: OldThemeVars) {
  if (!theme) {
    return {};
  }
  const result = { ...theme };

  Object.entries(theme).forEach(([key, value]) => {
    let match = borderRegEx.exec(key);
    if (match) {
      const remainder = match[1];
      result[`borderLeft-${remainder}`] = value;
      result[`borderRight-${remainder}`] = value;
      result[`borderTop-${remainder}`] = value;
      result[`borderBottom-${remainder}`] = value;

      const border = getBorderSegments(value);
      result[`borderWidth-${remainder}`] ??= border.thickness;
      result[`borderStyle-${remainder}`] ??= border.style;
      result[`borderColor-${remainder}`] ??= border.color;
    }

    match = thicknessBorderRegEx.exec(key);
    if (match) {
      const remainder = match[1];
      result[`borderLeftWidth-${remainder}`] = value;
      result[`borderRightWidth-${remainder}`] = value;
      result[`borderTopWidth-${remainder}`] = value;
      result[`borderBottomWidth-${remainder}`] = value;
    }

    match = styleBorderRegEx.exec(key);
    if (match) {
      const remainder = match[1];
      result[`borderLeftStyle-${remainder}`] = value;
      result[`borderRightStyle-${remainder}`] = value;
      result[`borderTopStyle-${remainder}`] = value;
      result[`borderBottomStyle-${remainder}`] = value;
    }

    match = colorBorderRegEx.exec(key);
    if (match) {
      const remainder = match[1];
      result[`borderLeftColor-${remainder}`] = value;
      result[`borderRightColor-${remainder}`] = value;
      result[`borderTopColor-${remainder}`] = value;
      result[`borderBottomColor-${remainder}`] = value;
    }

    match = borderHorizontalRegEx.exec(key);
    if (match) {
      const remainder = match[1];
      result[`borderLeft-${remainder}`] = value;
      result[`borderRight-${remainder}`] = value;
      const border = getBorderSegments(value);
      if (border.thickness) {
        result[`borderLeftWidth-${remainder}`] = border.thickness;
        result[`borderRightWidth-${remainder}`] = border.thickness;
      }
      if (border.style) {
        result[`borderLeftStyle-${remainder}`] = border.style;
        result[`borderRightStyle-${remainder}`] = border.style;
      }
      if (border.color) {
        result[`borderLeftColor-${remainder}`] = border.color;
        result[`borderRightColor-${remainder}`] = border.color;
      }
    }

    match = borderVerticalRegEx.exec(key);
    if (match) {
      const remainder = match[1];
      result[`borderTop-${remainder}`] = value;
      result[`borderBottom-${remainder}`] = value;
      const border = getBorderSegments(value);
      if (border.thickness) {
        result[`borderTopWidth-${remainder}`] = border.thickness;
        result[`borderBottomWidth-${remainder}`] = border.thickness;
      }
      if (border.style) {
        result[`borderTopStyle-${remainder}`] = border.style;
        result[`borderBottomStyle-${remainder}`] = border.style;
      }
      if (border.color) {
        result[`borderTopColor-${remainder}`] = border.color;
        result[`borderBottomColor-${remainder}`] = border.color;
      }
    }

    match = borderLeftRegEx.exec(key);
    if (match) {
      const remainder = match[1];
      const border = getBorderSegments(value);
      if (border.thickness && !theme[`borderLeftWidth-${remainder}`]) result[`borderLeftWidth-${remainder}`] = border.thickness;
      if (border.style && !theme[`borderLeftStyle-${remainder}`]) result[`borderLeftStyle-${remainder}`] = border.style;
      if (border.color && !theme[`borderLeftColor-${remainder}`]) result[`borderLeftColor-${remainder}`] = border.color;
    }

    match = borderRightRegEx.exec(key);
    if (match) {
      const remainder = match[1];
      const border = getBorderSegments(value);
      if (border.thickness) result[`borderRightWidth-${remainder}`] = border.thickness;
      if (border.style) result[`borderRightStyle-${remainder}`] = border.style;
      if (border.color) result[`borderRightColor-${remainder}`] = border.color;
    }

    match = borderTopRegEx.exec(key);
    if (match) {
      const remainder = match[1];
      const border = getBorderSegments(value);
      if (border.thickness) result[`borderTopWidth-${remainder}`] = border.thickness;
      if (border.style) result[`borderTopStyle-${remainder}`] = border.style;
      if (border.color) result[`borderTopColor-${remainder}`] = border.color;
    }

    match = borderBottomRegEx.exec(key);
    if (match) {
      const remainder = match[1];
      const border = getBorderSegments(value);
      if (border.thickness) result[`borderBottomWidth-${remainder}`] = border.thickness;
      if (border.style) result[`borderBottomStyle-${remainder}`] = border.style;
      if (border.color) result[`borderBottomColor-${remainder}`] = border.color;
    }

    match = thicknessBorderHorizontalRegEx.exec(key);
    if (match) {
      const remainder = match[1];
      result[`borderLeftWidth-${remainder}`] = value;
      result[`borderRightWidth-${remainder}`] = value;
    }

    match = thicknessBorderVerticalRegEx.exec(key);
    if (match) {
      const remainder = match[1];
      result[`borderTopWidth-${remainder}`] = value;
      result[`borderBottomWidth-${remainder}`] = value;
    }

    match = styleBorderHorizontalRegEx.exec(key);
    if (match) {
      const remainder = match[1];
      result[`borderLeftStyle-${remainder}`] = value;
      result[`borderRightStyle-${remainder}`] = value;
    }

    match = styleBorderVerticalRegEx.exec(key);
    if (match) {
      const remainder = match[1];
      result[`borderTopStyle-${remainder}`] = value;
      result[`borderBottomStyle-${remainder}`] = value;
    }

    match = colorBorderHorizontalRegEx.exec(key);
    if (match) {
      const remainder = match[1];
      result[`borderLeftColor-${remainder}`] = value;
      result[`borderRightColor-${remainder}`] = value;
    }

    match = colorBorderVerticalRegEx.exec(key);
    if (match) {
      const remainder = match[1];
      result[`borderTopColor-${remainder}`] = value;
      result[`borderBottomColor-${remainder}`] = value;
    }
  });

  normalizeBorderSideSegments(theme, result);
  return result;
}

type BorderSegment = "thickness" | "style" | "color";
type BorderSide = "Left" | "Right" | "Top" | "Bottom";

const BORDER_SIDES: BorderSide[] = ["Left", "Right", "Top", "Bottom"];

function normalizeBorderSideSegments(theme: OldThemeVars, result: OldThemeVars) {
  const remainders = new Set<string>();
  Object.keys(theme).forEach((key) => {
    const match =
      borderRegEx.exec(key) ??
      thicknessBorderRegEx.exec(key) ??
      thicknessBorderHorizontalRegEx.exec(key) ??
      thicknessBorderVerticalRegEx.exec(key) ??
      styleBorderRegEx.exec(key) ??
      styleBorderHorizontalRegEx.exec(key) ??
      styleBorderVerticalRegEx.exec(key) ??
      borderLeftRegEx.exec(key) ??
      borderRightRegEx.exec(key) ??
      borderTopRegEx.exec(key) ??
      borderBottomRegEx.exec(key) ??
      borderHorizontalRegEx.exec(key) ??
      borderVerticalRegEx.exec(key) ??
      colorBorderRegEx.exec(key) ??
      colorBorderHorizontalRegEx.exec(key) ??
      colorBorderVerticalRegEx.exec(key);
    if (match) {
      remainders.add(match[1]);
    }
  });

  remainders.forEach((remainder) => {
    BORDER_SIDES.forEach((side) => {
      const axis = side === "Left" || side === "Right" ? "Horizontal" : "Vertical";
      applyBorderSideSegment(theme, result, remainder, side, axis, "thickness");
      applyBorderSideSegment(theme, result, remainder, side, axis, "style");
      applyBorderSideSegment(theme, result, remainder, side, axis, "color");
    });
  });
}

function applyBorderSideSegment(
  theme: OldThemeVars,
  result: OldThemeVars,
  remainder: string,
  side: BorderSide,
  axis: "Horizontal" | "Vertical",
  segment: BorderSegment,
) {
  const suffix = segment === "thickness" ? "Width" : segment === "style" ? "Style" : "Color";
  const value =
    theme[`border${side}${suffix}-${remainder}`] ??
    getBorderSegment(theme[`border${side}-${remainder}`], segment) ??
    theme[`border${axis}${suffix}-${remainder}`] ??
    getBorderSegment(theme[`border${axis}-${remainder}`], segment) ??
    theme[`border${suffix}-${remainder}`] ??
    getBorderSegment(theme[`border-${remainder}`], segment);

  if (value) {
    result[`border${side}${suffix}-${remainder}`] = value;
  }
}

function getBorderSegment(value: string | undefined, segment: BorderSegment) {
  if (!value) {
    return undefined;
  }
  return getBorderSegments(value)[segment];
}

export type OldThemeDefinitionDetails = {
  themeVars?: OldThemeVars;
  resources?: Record<string, unknown>;
};

export type OldThemeDefinition = OldThemeDefinitionDetails & {
  id: string;
  name?: string;
  extends?: string | string[];
  tones?: Record<string, OldThemeDefinitionDetails>;
  color?: string;
};

export type OldDefaultThemeVars = Record<string, string | Record<string, string>>;

export function collectThemeChainByExtends(
  customTheme: OldThemeDefinition,
  allThemes: OldThemeDefinition[],
  componentDefaultThemeVars: OldDefaultThemeVars,
  rootTheme: OldThemeDefinition = { id: "root", themeVars: {}, resources: {}, tones: {} },
) {
  const rootThemeVars: OldThemeVars = { ...(rootTheme.themeVars ?? {}) };
  const rootTones: Record<string, OldThemeDefinitionDetails> = cloneThemeDetails(rootTheme.tones ?? {});
  Object.entries(componentDefaultThemeVars).forEach(([key, value]) => {
    if (typeof value === "string") {
      rootThemeVars[key.trim()] = value;
    } else {
      Object.entries(value).forEach(([themeVarKey, themeVarVal]) => {
        if (!rootTones[key]) {
          rootTones[key] = { themeVars: {} };
        }
        rootTones[key].themeVars = {
          ...rootTones[key].themeVars,
          [themeVarKey.trim()]: themeVarVal,
        };
      });
    }
  });

  const root: OldThemeDefinition = {
    ...rootTheme,
    id: "root",
    themeVars: rootThemeVars,
    resources: rootTheme.resources ?? {},
    tones: rootTones,
  };
  return [root, ...collectExtends(customTheme, allThemes), customTheme];
}

function getBorderSegments(value: string) {
  return parseSimpleBorder(value);
}

function parseSimpleBorder(value: string) {
  const borderStyles = new Set([
    "none",
    "hidden",
    "dotted",
    "dashed",
    "solid",
    "double",
    "groove",
    "ridge",
    "inset",
    "outset",
  ]);
  const ret: { thickness?: string; style?: string; color?: string } = {};
  tokenizeBorderValue(value).forEach((segment) => {
    if (!ret.thickness && /^[-.\d]+(?:px|rem|em|%)?$/.test(segment)) {
      ret.thickness = segment;
    } else if (!ret.style && borderStyles.has(segment)) {
      ret.style = segment;
    } else if (!ret.color) {
      ret.color = segment;
    }
  });
  return ret;
}

function tokenizeBorderValue(value: string): string[] {
  const tokens: string[] = [];
  let current = "";
  let depth = 0;
  for (const char of value.trim()) {
    if (/\s/.test(char) && depth === 0) {
      if (current) {
        tokens.push(current);
        current = "";
      }
      continue;
    }
    current += char;
    if (char === "(") {
      depth += 1;
    } else if (char === ")" && depth > 0) {
      depth -= 1;
    }
  }
  if (current) {
    tokens.push(current);
  }
  return tokens;
}

function findClosest(theme: OldThemeVars, themeVarName: string) {
  if (theme[themeVarName]) {
    return theme[themeVarName];
  }
  const hVar = parseHVar(themeVarName);
  if (!hVar) {
    return null;
  }
  let closest: HVar | null = null;
  let closestKey: string | null = null;
  Object.keys(theme).forEach((themeVar) => {
    const parsedVar = parseHVar(themeVar);
    if (!parsedVar || parsedVar.component !== hVar.component || parsedVar.attribute !== hVar.attribute) {
      return;
    }
    if (parsedVar.states.length) {
      return;
    }
    if (
      parsedVar.traits.every((tr) => hVar.traits.includes(tr)) &&
      (!closest || closest.traits.length <= parsedVar.traits.length)
    ) {
      closest = parsedVar;
      closestKey = themeVar;
    }
  });
  if (closestKey) {
    return theme[closestKey];
  }
  return null;
}

function resolveThemeVars(theme: OldThemeVars) {
  const ret: OldThemeVars = {};
  Object.keys(theme).forEach((key) => {
    ret[key] = resolveThemeVar(key, theme);
  });
  return ret;
}

function generateBaseTonesForColor(
  varName: string,
  theme: OldThemeVars,
  options = { distributeEven: false },
) {
  const color = parseCssColor(theme[varName]);
  if (!color) {
    return {};
  }
  const baseL = color.l;
  const darkStep = baseL / 5;
  const lightStep = (100 - baseL) / 5;
  const lightnesses = options.distributeEven
    ? [100, 98, 95, 83, 75, 63, 52, 40, 32, 27, 16, 13, 9]
    : [
        100,
        baseL + lightStep * 4.5,
        baseL + lightStep * 4,
        baseL + lightStep * 3,
        baseL + lightStep * 2,
        baseL + lightStep,
        baseL,
        baseL - darkStep,
        baseL - darkStep * 2,
        baseL - darkStep * 3,
        baseL - darkStep * 4,
        baseL - darkStep * 4.5,
        baseL - darkStep * 5,
      ];
  const toneNames = [0, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950, 1000];
  return Object.fromEntries(
    toneNames.map((tone, index) => [
      `const-${varName}-${tone}`,
      formatHsl(color.h, color.s, clamp(lightnesses[index], 0, 100)),
    ]),
  );
}

function mapTones(
  baseColor: string | undefined | null,
  mapper: (tones: ColorTones) => OldThemeVars,
) {
  const tones = generateTones(baseColor);
  if (!tones) {
    return {};
  }
  return mapper(tones);
}

function generateTones(baseColorStr: string | null | undefined): ColorTones | null {
  if (!baseColorStr || typeof baseColorStr !== "string" || baseColorStr.startsWith("$")) {
    return null;
  }

  const color = parseCssColor(baseColorStr);
  if (!color) {
    return null;
  }
  const tone1 = color.l > 50
    ? formatHsl(color.h, color.s, color.l * 0.8)
    : formatHsl(color.h, color.s, color.l + (100 - color.l) * 0.2);
  const tone2 = color.l > 50
    ? formatHsl(color.h, color.s, color.l * 0.9)
    : formatHsl(color.h, color.s, color.l + (100 - color.l) * 0.1);
  const tone3 = color.l > 50
    ? formatHsl(color.h, color.s, color.l * 0.05)
    : formatHsl(color.h, color.s, color.l + (100 - color.l) * 0.95);
  const rgb = hslToRgb(color.h, color.s, color.l);

  return {
    base: baseColorStr,
    tone1,
    tone2,
    tone3,
    alpha1: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)`,
    alpha2: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2)`,
  };
}

type ColorTones = {
  base: string;
  tone1: string;
  tone2: string;
  tone3: string;
  alpha1: string;
  alpha2: string;
};

function replaceEmbeddedThemeVars(value: string) {
  return value.replace(/\$[a-zA-Z][a-zA-Z0-9-_]*/g, (match) => toCssVar(match));
}

function parseCssNumber(value: string): { value: number; unit: string } | undefined {
  let baseTrimmed = value.trim();
  if (baseTrimmed.startsWith(".")) {
    baseTrimmed = `0${baseTrimmed}`;
  }
  const baseNum = parseFloat(baseTrimmed);
  if (Number.isNaN(baseNum)) {
    return undefined;
  }
  return {
    value: baseNum,
    unit: baseTrimmed.replace(`${baseNum}`, "") || "px",
  };
}

function collectExtends(cTheme: OldThemeDefinition | undefined, allThemes: OldThemeDefinition[]) {
  if (!cTheme || !cTheme.extends) {
    return [];
  }
  const arrayExtends = typeof cTheme.extends === "string" ? [cTheme.extends] : cTheme.extends;
  const ret: OldThemeDefinition[] = [];

  arrayExtends.forEach((ext) => {
    const parentTheme = allThemes.find((theme) => theme.id === ext);
    if (parentTheme) {
      ret.push(...collectExtends(parentTheme, allThemes));
      ret.push(parentTheme);
    }
  });
  return ret;
}

function cloneThemeDetails(value: Record<string, OldThemeDefinitionDetails>) {
  return Object.fromEntries(
    Object.entries(value).map(([key, details]) => [
      key,
      {
        ...details,
        themeVars: details.themeVars ? { ...details.themeVars } : undefined,
        resources: details.resources ? { ...details.resources } : undefined,
      },
    ]),
  );
}

function parseCssColor(value?: string): { h: number; s: number; l: number } | undefined {
  if (!value) {
    return undefined;
  }
  return parseHexColor(value) ?? parseRgbColor(value) ?? parseHslColor(value);
}

function parseHexColor(value: string): { h: number; s: number; l: number } | undefined {
  const match = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(value.trim());
  if (!match) {
    return undefined;
  }
  const hex = match[1].length === 3
    ? match[1].split("").map((char) => char + char).join("")
    : match[1];
  return rgbToHsl(
    Number.parseInt(hex.slice(0, 2), 16),
    Number.parseInt(hex.slice(2, 4), 16),
    Number.parseInt(hex.slice(4, 6), 16),
  );
}

function parseRgbColor(value: string): { h: number; s: number; l: number } | undefined {
  const match = /^rgba?\(\s*([-.\d]+)[\s,]+([-.\d]+)[\s,]+([-.\d]+)(?:\s*[,/]\s*[-.\d]+%?)?\s*\)$/i.exec(value.trim());
  if (!match) {
    return undefined;
  }
  return rgbToHsl(Number(match[1]), Number(match[2]), Number(match[3]));
}

function parseHslColor(value: string): { h: number; s: number; l: number } | undefined {
  const match = /^hsl\(\s*([-.\d]+)(?:deg)?[\s,]+([-.\d]+)%[\s,]+([-.\d]+)%\s*\)$/i.exec(value.trim());
  if (!match) {
    return undefined;
  }
  return { h: Number(match[1]), s: Number(match[2]), l: Number(match[3]) };
}

function rgbToHsl(red: number, green: number, blue: number): { h: number; s: number; l: number } {
  const r = clamp(red, 0, 255) / 255;
  const g = clamp(green, 0, 255) / 255;
  const b = clamp(blue, 0, 255) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) {
    return { h: 0, s: 0, l: l * 100 };
  }
  const delta = max - min;
  const s = delta / (1 - Math.abs(2 * l - 1));
  let h = 0;
  if (max === r) {
    h = ((g - b) / delta) % 6;
  } else if (max === g) {
    h = (b - r) / delta + 2;
  } else {
    h = (r - g) / delta + 4;
  }
  h *= 60;
  if (h < 0) {
    h += 360;
  }
  return { h, s: s * 100, l: l * 100 };
}

function hslToRgb(hue: number, saturation: number, lightness: number) {
  const h = (((hue % 360) + 360) % 360) / 360;
  const s = clamp(saturation, 0, 100) / 100;
  const l = clamp(lightness, 0, 100) / 100;
  if (s === 0) {
    const value = Math.round(l * 255);
    return { r: value, g: value, b: value };
  }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return {
    r: Math.round(hueToRgb(p, q, h + 1 / 3) * 255),
    g: Math.round(hueToRgb(p, q, h) * 255),
    b: Math.round(hueToRgb(p, q, h - 1 / 3) * 255),
  };
}

function hueToRgb(p: number, q: number, t: number) {
  let value = t;
  if (value < 0) value += 1;
  if (value > 1) value -= 1;
  if (value < 1 / 6) return p + (q - p) * 6 * value;
  if (value < 1 / 2) return q;
  if (value < 2 / 3) return p + (q - p) * (2 / 3 - value) * 6;
  return p;
}

function formatHsl(hue: number, saturation: number, lightness: number) {
  return `hsl(${formatCssNumber(hue)}, ${formatCssNumber(saturation)}%, ${formatCssNumber(lightness)}%)`;
}

function formatCssNumber(value: number) {
  return Number.isInteger(value) ? `${value}` : `${Number(value.toFixed(4))}`;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
