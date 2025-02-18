import Color from "color";

import { HVar, parseHVar } from "../theming/hvar";
import { styleKeywords } from "../../parsers/style-parser/StyleLexer";
import { StyleTokenType } from "../../parsers/style-parser/tokens";
import { StyleParser } from "../../parsers/style-parser/StyleParser";

export function isThemeVarName(varName: any) {
  return typeof varName === "string" && varName?.startsWith("$");
}

export function resolveThemeVar(
  varName: string | undefined,
  theme: Record<string, string> = {},
): string {
  let safeVarName = varName;
  if (isThemeVarName(varName)) {
    safeVarName = varName.substring(1);
  }
  const value = theme[safeVarName];
  if (typeof value === "string" && isThemeVarName(value)) {
    return resolveThemeVar(value, theme);
  }
  return value;
}

export function generateBaseTones(theme: Record<string, string> | undefined) {
  if (!theme) {
    return {};
  }
  const resolvedTheme = resolveThemeVars(theme);
  let colorTones = {
    ...generateBaseTonesForColor("color-primary", resolvedTheme),
    ...generateBaseTonesForColor("color-secondary", resolvedTheme),
    ...generateBaseTonesForColor("color-info", resolvedTheme),
    ...generateBaseTonesForColor("color-success", resolvedTheme),
    ...generateBaseTonesForColor("color-warn", resolvedTheme),
    ...generateBaseTonesForColor("color-danger", resolvedTheme),
    ...generateBaseTonesForColor("color-surface", resolvedTheme, { distributeEven: true }),
  };
  return {
    ...colorTones,
    ...generateRbgChannelsForTone("color-surface", { ...resolvedTheme, ...colorTones }),
    ...generateRbgChannelsForTone("color-primary", { ...resolvedTheme, ...colorTones }),
    ...generateRbgChannelsForTone("color-secondary", { ...resolvedTheme, ...colorTones }),
  };
}

export function generateBaseSpacings(theme: Record<string, string> | undefined) {
  if (!theme) {
    return {};
  }
  const resolvedTheme = resolveThemeVars(theme);
  const base = resolvedTheme["space-base"];
  if (!base || typeof base !== "string") {
    return {};
  }
  let baseTrimmed = base.trim();
  if (baseTrimmed.startsWith(".")) {
    //if we have something like .5rem
    baseTrimmed = `0${baseTrimmed}`;
  }
  const baseNum = parseFloat(baseTrimmed);
  let baseUnit = baseTrimmed.replace(baseNum + "", "") || "px";

  //  a) non-baseNum -> "0px"
  if (Number.isNaN(baseNum)) {
    return {};
  }

  const scale = [
    0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 16, 20, 24, 28, 32, 36, 40,
    44, 48, 52, 56, 60, 64, 72, 80, 96,
  ];
  const ret: Record<string, string> = {};

  scale.forEach((step) => {
    ret[`space-${(step + "").replace(".", "_")}`] = `${step * baseNum}${baseUnit}`;
  });

  return ret;
}

export function generateBaseFontSizes(theme: Record<string, string> | undefined) {
  if (!theme) {
    return {};
  }
  const resolvedTheme = resolveThemeVars(theme);
  const base = resolvedTheme["font-size"];
  if (!base || typeof base !== "string") {
    return {};
  }

  let baseTrimmed = base.trim();
  if (baseTrimmed.startsWith(".")) {
    //if we have something like .5rem
    baseTrimmed = `0${baseTrimmed}`;
  }
  const baseNum = parseFloat(baseTrimmed);
  let baseUnit = baseTrimmed.replace(baseNum + "", "") || "px";

  //  a) non-baseNum -> "0px"
  if (Number.isNaN(baseNum)) {
    return {};
  }
  const ret: Record<string, string> = {};
  ret[`font-size-large`] = `${1.5 * baseNum}${baseUnit}`;
  ret[`font-size-medium`] = `${1.25 * baseNum}${baseUnit}`;
  ret[`font-size-normal`] = base;
  ret[`font-size-small`] = `${0.875 * baseNum}${baseUnit}`;
  ret[`font-size-smaller`] = `${0.75 * baseNum}${baseUnit}`;
  ret[`font-size-tiny`] = `${0.625 * baseNum}${baseUnit}`;

  return ret;
}

export function generateButtonTones(theme?: Record<string, string>) {
  if (!theme) {
    return {};
  }
  const resolvedTheme = resolveThemeVars(theme);
  const variants = ["primary", "secondary", "attention"];

  let ret = {};

  variants.forEach((variant) => {
    const solidTones = mapTones(
      findClosest(resolvedTheme, `color-Button-${variant}-solid`),
      (tones) => {
        return {
          [`color-bg-Button-${variant}-solid`]: tones.base,
          [`color-bg-Button-${variant}-solid--hover`]: tones.tone1,
          [`color-bg-Button-${variant}-solid--active`]: tones.tone2,
          [`color-border-Button-${variant}-solid`]: tones.base,
          [`color-border-Button-${variant}-solid--hover`]: tones.base,
          [`color-border-Button-${variant}-solid--active`]: tones.base,
          [`color-text-Button-${variant}-solid`]: tones.tone3,
          [`color-text-Button-${variant}-solid--hover`]: tones.tone3,
          [`color-text-Button-${variant}-solid--active`]: tones.tone3,
        };
      },
    );

    const outlinedTones = mapTones(
      findClosest(resolvedTheme, `color-Button-${variant}-outlined`),
      (tones) => {
        return {
          [`color-bg-Button-${variant}-outlined--hover`]: tones.alpha1,
          [`color-bg-Button-${variant}-outlined--active`]: tones.alpha2,
          [`color-border-Button-${variant}-outlined`]: tones.base,
          [`color-border-Button-${variant}-outlined--hover`]: tones.tone1,
          [`color-border-Button-${variant}-outlined--active`]: tones.tone2,
          [`color-text-Button-${variant}-outlined`]: tones.base,
          [`color-text-Button-${variant}-outlined--hover`]: tones.tone1,
          [`color-text-Button-${variant}-outlined--active`]: tones.tone2,
        };
      },
    );

    const ghostTones = mapTones(
      findClosest(resolvedTheme, `color-Button-${variant}-ghost`),
      (tones) => {
        return {
          [`color-bg-Button-${variant}-ghost--active`]: tones.alpha2,
          [`color-bg-Button-${variant}-ghost--hover`]: tones.alpha1,
          [`color-text-Button-${variant}-ghost`]: tones.base,
          [`color-text-Button-${variant}-ghost--hover`]: tones.tone1,
          [`color-text-Button-${variant}-ghost--active`]: tones.tone2,
        };
      },
    );
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

/**
 * Segment the padding values into top, right, bottom, left to provide consistency
 */
export function generatePaddingSegments(theme?: Record<string, string>) {
  if (!theme) {
    return {};
  }
  const result = { ...theme };

  // --- Iterate through theme variables and split padding values
  Object.entries(theme).forEach(([key, value]) => {
    const match = paddingRegEx.exec(key);
    if (!match) return;
    const remainder = match[1];

    // --- Check for horizontal and vertical padding values
    const horizontal = theme[`padding-horizontal-${remainder}`];
    const vertical = theme[`padding-vertical-${remainder}`];

    // --- We have a padding value to segment
    const segments = value.trim().replace(/ +/g, " ").split(" ");
    switch (segments.length) {
      case 1:
        result[`padding-top-${remainder}`] ??= vertical ?? segments[0];
        result[`padding-right-${remainder}`] ??= horizontal ?? segments[0];
        result[`padding-bottom-${remainder}`] ??= vertical ?? segments[0];
        result[`padding-left-${remainder}`] ??= horizontal ?? segments[0];
        break;
      case 2:
        result[`padding-top-${remainder}`] ??= vertical ?? segments[0];
        result[`padding-right-${remainder}`] ??= horizontal ?? segments[1];
        result[`padding-bottom-${remainder}`] ??= vertical ?? segments[0];
        result[`padding-left-${remainder}`] ??= horizontal ?? segments[1];
        break;
      case 3:
        result[`padding-top-${remainder}`] ??= vertical ?? segments[0];
        result[`padding-right-${remainder}`] ??= horizontal ?? segments[1];
        result[`padding-bottom-${remainder}`] ??= vertical ?? segments[2];
        result[`padding-left-${remainder}`] ??= horizontal ?? segments[1];
        break;
      case 4:
        result[`padding-top-${remainder}`] ??= vertical ?? segments[0];
        result[`padding-right-${remainder}`] ??= horizontal ?? segments[1];
        result[`padding-bottom-${remainder}`] ??= vertical ?? segments[2];
        result[`padding-left-${remainder}`] ??= horizontal ?? segments[3];
        break;
      default:
        return;
    }
  });

  // --- Done
  return result;
}

const borderRegEx = /^border-(?!(?:horizontal|vertical|left|right|top|bottom)-)(.+)$/;
const thicknessBorderRegEx =
  /^thickness-border-(?!(?:horizontal|vertical|left|right|top|bottom)-)(.+)$/;
const thicknessBorderHorizontalRegEx = /^thickness-border-(horizontal)-(.+)$/;
const thicknessBorderVerticalRegEx = /^thickness-border-(vertical)-(.+)$/;
const styleBorderRegEx = /^style-border-(?!(?:horizontal|vertical|left|right|top|bottom)-)(.+)$/;
const styleBorderHorizontalRegEx = /^style-border-(horizontal)-(.+)$/;
const styleBorderVerticalRegEx = /^style-border-(vertical)-(.+)$/;
const colorBorderRegEx = /^color-border-(?!(?:horizontal|vertical|left|right|top|bottom)-)(.+)$/;
const colorBorderHorizontalRegEx = /^color-border-(horizontal)-(.+)$/;
const colorBorderVerticalRegEx = /^color-border-(vertical)-(.+)$/;

/**
 * Segment the border values to provide consistency
 */
export function generateBorderSegments(theme?: Record<string, string>) {
  if (!theme) {
    return {};
  }
  const result = { ...theme };

  // --- Iterate through theme variables and split border values
  Object.entries(theme).forEach(([key, value]) => {
    // --- Check "border-" theme variables
    let match = borderRegEx.exec(key);
    if (match) {
      // --- We have a border value to segment
      const remainder = match[1];

      const border = getBorderSegments(value);
      if (border.thickness) {
        result[`thickness-border-${remainder}`] ??= border.thickness;
      }
      if (border.style) {
        result[`style-border-${remainder}`] ??= border.style;
      }
      if (border.color) {
        result[`color-border-${remainder}`] ??= border.color;
      }
    }

    // --- Check "thickness-border-" theme variables
    match = thicknessBorderRegEx.exec(key);
    if (match) {
      // --- We have a thickness-border value to flow down
      const remainder = match[1];
      result[`thickness-border-left-${remainder}`] ??= value;
      result[`thickness-border-right-${remainder}`] ??= value;
      result[`thickness-border-top-${remainder}`] ??= value;
      result[`thickness-border-bottom-${remainder}`] ??= value;
    }

    // --- Check "thickness-border-horizontal" theme variables
    match = thicknessBorderHorizontalRegEx.exec(key);
    if (match) {
      // --- We have a thickness-border-horizontal value to flow down
      const remainder = match[2];
      result[`thickness-border-left-${remainder}`] ??= value;
      result[`thickness-border-right-${remainder}`] ??= value;
    }

    // --- Check "thickness-border-vertical" theme variables
    match = thicknessBorderVerticalRegEx.exec(key);
    if (match) {
      // --- We have a thickness-border-vertical value to flow down
      const remainder = match[2];
      result[`thickness-border-top-${remainder}`] ??= value;
      result[`thickness-border-bottom-${remainder}`] ??= value;
    }

    // --- Check "style-border-" theme variables
    match = styleBorderRegEx.exec(key);
    if (match) {
      // --- We have a style-border value to flow down
      const remainder = match[1];
      result[`style-border-left-${remainder}`] ??= value;
      result[`style-border-right-${remainder}`] ??= value;
      result[`style-border-top-${remainder}`] ??= value;
      result[`style-border-bottom-${remainder}`] ??= value;
    }

    // --- Check "style-border-horizontal" theme variables
    match = styleBorderHorizontalRegEx.exec(key);
    if (match) {
      // --- We have a style-border-horizontal value to flow down
      const remainder = match[1];
      result[`style-border-left-${remainder}`] ??= value;
      result[`style-border-right-${remainder}`] ??= value;
    }

    // --- Check "style-border-vertical" theme variables
    match = styleBorderVerticalRegEx.exec(key);
    if (match) {
      // --- We have a style-border-vertical value to flow down
      const remainder = match[1];
      result[`style-border-top-${remainder}`] ??= value;
      result[`style-border-bottom-${remainder}`] ??= value;
    }

    // --- Check "color-border-" theme variables
    match = colorBorderRegEx.exec(key);
    if (match) {
      // --- We have a color-border value to flow down
      const remainder = match[1];
      result[`color-border-left-${remainder}`] ??= value;
      result[`color-border-right-${remainder}`] ??= value;
      result[`color-border-top-${remainder}`] ??= value;
      result[`color-border-bottom-${remainder}`] ??= value;
    }

    // --- Check "color-border-horizontal" theme variables
    match = colorBorderHorizontalRegEx.exec(key);
    if (match) {
      // --- We have a color-border-horizontal value to flow down
      const remainder = match[1];
      result[`color-border-left-${remainder}`] ??= value;
      result[`color-border-right-${remainder}`] ??= value;
    }

    // --- Check "color-border-vertical" theme variables
    match = colorBorderVerticalRegEx.exec(key);
    if (match) {
      // --- We have a color-border-vertical value to flow down
      const remainder = match[1];
      result[`color-border-top-${remainder}`] ??= value;
      result[`color-border-bottom-${remainder}`] ??= value;
    }
  });

  // --- Done
  return result;

  function getBorderSegments(value: string) {
    try {
      const sParser = new StyleParser(value);
      const parsed = sParser.parseBorder();

      // --- Get the parsed result
      const result = {
        style: parsed.styleValue,
        thickness:
          parsed.widthValue !== undefined
            ? `${parsed.widthValue}${parsed.widthUnit ?? "px"}`
            : undefined,
        color:
          parsed.color === undefined
            ? undefined
            : typeof parsed.color === "string"
              ? parsed.color
              : parsed.color.toString(),
      };

      // --- All theme variables are present?
      if (parsed.themeId1 && parsed.themeId2 && parsed.themeId3) {
        return {
          thickness: parsed.themeId1.id,
          style: parsed.themeId2.id,
          color: parsed.themeId3.id,
        };
      }

      // --- Two theme variables are present?
      if (parsed.themeId1 && parsed.themeId2) {
        if (result.thickness) {
          return {
            thickness: result.thickness,
            style: parsed.themeId1.id,
            color: parsed.themeId2.id,
          };
        }
        if (result.style) {
          return {
            thickness: parsed.themeId1.id,
            style: result.style,
            color: parsed.themeId2.id,
          };
        }
        return {
          thickness: parsed.themeId1.id,
          style: parsed.themeId2.id,
          color: result.color,
        };
      }

      // --- One theme variable is present?
      if (parsed.themeId1) {
        if (result.thickness && result.style) {
          return {
            thickness: result.thickness,
            style: result.style,
            color: parsed.themeId1.id,
          };
        }
        if (result.thickness && result.color) {
          return {
            thickness: result.thickness,
            style: parsed.themeId1.id,
            color: result.color,
          };
        }
        if (result.style && result.color) {
          return {
            thickness: parsed.themeId1.id,
            style: result.style,
            color: result.color,
          };
        }
      }
      return {
        thickness: result.thickness?.trim(),
        style: result.style?.trim(),
        color: result.color?.trim(),
      };
    } catch (e) {
      return {
        thickness: undefined,
        style: undefined,
        color: undefined,
      };
    }
  }
}

function findClosest(theme: Record<string, string>, themeVarName: string) {
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
    if (
      !parsedVar ||
      parsedVar.component !== hVar.component ||
      parsedVar.attribute !== hVar.attribute
    ) {
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
      return;
    }
  });
  if (closestKey) {
    // console.log("found closest for", themeVarName, closestKey);
    return theme[closestKey];
  }
  return null;
}

function resolveThemeVars(theme: Record<string, string>) {
  const ret: Record<string, string> = {};
  Object.keys(theme).forEach((key) => {
    ret[key] = resolveThemeVar(key, theme);
  });
  return ret;
}

function getRgbChannelsString(colorStr?: string) {
  if (!colorStr) {
    return undefined;
  }
  const color = Color(colorStr);
  let rgb = color.rgb();
  return `${rgb.red()},${rgb.green()},${rgb.blue()}`;
}

function generateBaseTonesForColor(
  varName: string,
  theme: Record<string, string>,
  options = { distributeEven: false },
) {
  try {
    const { distributeEven } = options;
    const color = theme[varName];
    if (!color || typeof color !== "string") {
      return {};
    }
    const baseColor = Color(color);
    let color50;
    let color100;
    let color200;
    let color300;
    let color400;
    let color500;
    let color600;
    let color700;
    let color800;
    let color900;
    let color950;
    if (distributeEven) {
      color50 = baseColor.lightness(98);
      color100 = baseColor.lightness(95);
      color200 = baseColor.lightness(83);
      color300 = baseColor.lightness(75);
      color400 = baseColor.lightness(63);
      color500 = baseColor.lightness(52);
      color600 = baseColor.lightness(40);
      color700 = baseColor.lightness(32);
      color800 = baseColor.lightness(27);
      color900 = baseColor.lightness(16);
      color950 = baseColor.lightness(13);
    } else {
      const baseL = baseColor.hsl().l();
      const darkStep = baseL / 5;
      const lightStep = (100 - baseL) / 5;
      color50 = baseColor.lightness(baseL + lightStep * 4.5);
      color100 = baseColor.lightness(baseL + lightStep * 4);
      color200 = baseColor.lightness(baseL + lightStep * 3);
      color300 = baseColor.lightness(baseL + lightStep * 2);
      color400 = baseColor.lightness(baseL + lightStep * 1);
      color500 = baseColor;
      color600 = baseColor.lightness(baseL - darkStep * 1);
      color700 = baseColor.lightness(baseL - darkStep * 2);
      color800 = baseColor.lightness(baseL - darkStep * 3);
      color900 = baseColor.lightness(baseL - darkStep * 4);
      color950 = baseColor.lightness(baseL - darkStep * 4.5);
    }

    return {
      [`${varName}-50`]: color50.toString(),
      [`${varName}-100`]: color100.toString(),
      [`${varName}-200`]: color200.toString(),
      [`${varName}-300`]: color300.toString(),
      [`${varName}-400`]: color400.toString(),
      [`${varName}-500`]: color500.toString(),
      [`${varName}-600`]: color600.toString(),
      [`${varName}-700`]: color700.toString(),
      [`${varName}-800`]: color800.toString(),
      [`${varName}-900`]: color900.toString(),
      [`${varName}-950`]: color950.toString(),
    };
  } catch (e) {
    console.error("Error generating base tones for color:", varName);
    return {};
  }
}

function generateRbgChannelsForTone(varName: string, theme: Record<string, string>) {
  return {
    [`${varName}-50-rgb`]: getRgbChannelsString(theme[`${varName}-50`]),
    [`${varName}-100-rgb`]: getRgbChannelsString(theme[`${varName}-100`]),
    [`${varName}-200-rgb`]: getRgbChannelsString(theme[`${varName}-200`]),
    [`${varName}-300-rgb`]: getRgbChannelsString(theme[`${varName}-300`]),
    [`${varName}-400-rgb`]: getRgbChannelsString(theme[`${varName}-400`]),
    [`${varName}-500-rgb`]: getRgbChannelsString(theme[`${varName}-500`]),
    [`${varName}-600-rgb`]: getRgbChannelsString(theme[`${varName}-600`]),
    [`${varName}-700-rgb`]: getRgbChannelsString(theme[`${varName}-700`]),
    [`${varName}-800-rgb`]: getRgbChannelsString(theme[`${varName}-800`]),
    [`${varName}-900-rgb`]: getRgbChannelsString(theme[`${varName}-900`]),
    [`${varName}-950-rgb`]: getRgbChannelsString(theme[`${varName}-950`]),
  };
}

function mapTones(
  baseColor: string | undefined | null,
  mapper: (tones: ColorTones) => Record<string, string>,
) {
  const tones = generateTones(baseColor);
  if (!tones) {
    return {};
  }
  return mapper(tones);
}

function generateTones(baseColorStr: string | null | undefined): ColorTones | null {
  if (!baseColorStr || typeof baseColorStr !== "string" || baseColorStr.startsWith("$"))
    return null; //TODO illesg here the startsWidth $ should be something else

  const baseColor = Color(baseColorStr);
  let tone1;
  let tone2;
  let tone3;
  if (baseColor.isLight()) {
    tone1 = baseColor.darken(0.2).toString();
    tone2 = baseColor.darken(0.1).toString();
    tone3 = baseColor.darken(0.95).toString();
  } else {
    tone1 = baseColor.lighten(0.2).toString();
    tone2 = baseColor.lighten(0.1).toString();
    tone3 = baseColor.lighten(0.95).toString();
  }

  const alpha1 = baseColor.alpha(0.1).toString();
  const alpha2 = baseColor.alpha(0.2).toString();
  return {
    base: baseColorStr,
    tone1,
    tone2,
    tone3,
    alpha1,
    alpha2,
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
