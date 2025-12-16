import Color from "color";

import { type HVar, parseHVar } from "../theming/hvar";
import { StyleParser } from "../../parsers/style-parser/StyleParser";
import { toCssVar } from "./layout-resolver";

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

  //TODO if the fontSize is not px, we need to handle that case (use this: 1em, 1rem = 16px)
  const resolvedTheme = resolveThemeVars(theme);
  const base = resolvedTheme["fontSize"];
  if (!base || typeof base !== "string") {
    return {};
  }

  let baseTrimmed = base.trim();
  if (baseTrimmed.startsWith(".")) {
    //if we have something like .5rem
    baseTrimmed = `0${baseTrimmed}`;
  }
  let baseNum = parseFloat(baseTrimmed);
  let baseUnit = baseTrimmed.replace(baseNum + "", "") || "px";
  if (baseUnit !== "px" || Number.isNaN(baseNum)) {
    // --- We fall back to 16px base if not px
    baseUnit = "px";
    baseNum = 16;
  }

  const ret: Record<string, string> = {};
  ret[`const-fontSize-tiny`] = `${0.625 * baseNum}${baseUnit}`;
  ret[`const-fontSize-xs`] = `${0.75 * baseNum}${baseUnit}`;
  ret[`const-fontSize-code`] = `${0.85 * baseNum}${baseUnit}`;
  ret[`const-fontSize-sm`] = `${0.875 * baseNum}${baseUnit}`;
  ret[`const-fontSize-base`] = base;
  ret[`const-fontSize-lg`] = `${1.125 * baseNum}${baseUnit}`;
  ret[`const-fontSize-xl`] = `${1.25 * baseNum}${baseUnit}`;
  ret[`const-fontSize-2xl`] = `${1.5 * baseNum}${baseUnit}`;
  ret[`const-fontSize-3xl`] = `${1.875 * baseNum}${baseUnit}`;
  ret[`const-fontSize-4xl`] = `${2.25 * baseNum}${baseUnit}`;
  ret[`const-fontSize-5xl`] = `${3 * baseNum}${baseUnit}`;
  ret[`const-fontSize-6xl`] = `${3.75 * baseNum}${baseUnit}`;
  ret[`const-fontSize-7xl`] = `${4.5 * baseNum}${baseUnit}`;
  ret[`const-fontSize-8xl`] = `${6 * baseNum}${baseUnit}`;
  ret[`const-fontSize-9xl`] = `${8 * baseNum}${baseUnit}`;
  return ret;
}

export function generateTextFontSizes(theme: Record<string, string> | undefined) {
  if (!theme) {
    return {};
  }
  const resolvedTheme = resolveThemeVars(theme);
  const base = resolvedTheme["fontSize-Text"];
  if (!base || typeof base !== "string") {
    return {};
  }

  // --- Get the CSS variable name of fontSize-Text-keyboard
  
  const ret: Record<string, string> = {};
  ret[`fontSize-Text-keyboard`] = `calc(${toCssVar("$fontSize-Text")} * 0.875)`;
  ret[`fontSize-Text-sample`] = `calc(${toCssVar("$fontSize-Text")} * 0.875)`;
  ret[`fontSize-Text-sup`] = `calc(${toCssVar("$fontSize-Text")} * 0.625)`;
  ret[`fontSize-Text-sub`] = `calc(${toCssVar("$fontSize-Text")} * 0.625)`;
  ret[`fontSize-Text-title`] = `calc(${toCssVar("$fontSize-Text")} * 1.5)`;
  ret[`fontSize-Text-subtitle`] = `calc(${toCssVar("$fontSize-Text")} * 1.25)`;
  ret[`fontSize-Text-small`] = `calc(${toCssVar("$fontSize-Text")} * 0.875)`;
  ret[`fontSize-Text-placeholder`] = `calc(${toCssVar("$fontSize-Text")} * 0.875)`;
  ret[`fontSize-Text-paragraph`] = toCssVar("$fontSize-Text");
  ret[`fontSize-Text-subheading`] = `calc(${toCssVar("$fontSize-Text")} * 0.625)`;
  ret[`fontSize-Text-tableheading`] = `calc(${toCssVar("$fontSize-Text")} * 0.625)`;
  ret[`fontSize-Text-secondary`] = `calc(${toCssVar("$fontSize-Text")} * 0.875)`;

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
          [`backgroundColor-Button-${variant}-solid`]: tones.base,
          [`backgroundColor-Button-${variant}-solid--hover`]: tones.tone1,
          [`backgroundColor-Button-${variant}-solid--active`]: tones.tone2,
          [`borderColor-Button-${variant}-solid`]: tones.base,
          [`borderColor-Button-${variant}-solid--hover`]: tones.base,
          [`borderColor-Button-${variant}-solid--active`]: tones.base,
          [`textColor-Button-${variant}-solid`]: tones.tone3,
          [`textColor-Button-${variant}-solid--hover`]: tones.tone3,
          [`textColor-Button-${variant}-solid--active`]: tones.tone3,
        };
      },
    );

    const outlinedTones = mapTones(
      findClosest(resolvedTheme, `color-Button-${variant}-outlined`),
      (tones) => {
        return {
          [`backgroundColor-Button-${variant}-outlined--hover`]: tones.alpha1,
          [`backgroundColor-Button-${variant}-outlined--active`]: tones.alpha2,
          [`borderColor-Button-${variant}-outlined`]: tones.base,
          [`borderColor-Button-${variant}-outlined--hover`]: tones.tone1,
          [`borderColor-Button-${variant}-outlined--active`]: tones.tone2,
          [`textColor-Button-${variant}-outlined`]: tones.base,
          [`textColor-Button-${variant}-outlined--hover`]: tones.tone1,
          [`textColor-Button-${variant}-outlined--active`]: tones.tone2,
        };
      },
    );

    const ghostTones = mapTones(
      findClosest(resolvedTheme, `color-Button-${variant}-ghost`),
      (tones) => {
        return {
          [`backgroundColor-Button-${variant}-ghost--active`]: tones.alpha2,
          [`backgroundColor-Button-${variant}-ghost--hover`]: tones.alpha1,
          [`textColor-Button-${variant}-ghost`]: tones.base,
          [`textColor-Button-${variant}-ghost--hover`]: tones.tone1,
          [`textColor-Button-${variant}-ghost--active`]: tones.tone2,
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
const paddingHorizontalRegEx = /^paddingHorizontal-(.+)$/;
const paddingVerticalRegEx = /^paddingVertical-(.+)$/;

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
    if (value === null || value === undefined) {
      // --- We want to allow theme files to use null or undefined as a synonim for 
      // --- "pretend this theme variable is not defined".
      delete result[key];
      return;
    }

    // --- Check the "paddingHorizontal" theme variables
    let match = paddingHorizontalRegEx.exec(key);
    if (match) {
      // --- We have a paddingHorizontal value to segment
      const remainder = match[1];
      result[`paddingLeft-${remainder}`] ??= value;
      result[`paddingRight-${remainder}`] ??= value;
    }

    // --- Check the "paddingVertical" theme variables
    match = paddingVerticalRegEx.exec(key);
    if (match) {
      // --- We have a paddingVertical value to segment
      const remainder = match[1];
      result[`paddingTop-${remainder}`] ??= value;
      result[`paddingBottom-${remainder}`] ??= value;
    }

    // --- Check the "padding" theme variables
    match = paddingRegEx.exec(key);
    if (!match) return;
    const remainder = match[1];

    // --- Check for horizontal and vertical padding values
    const horizontal = theme[`paddingHorizontal-${remainder}`];
    const vertical = theme[`paddingVertical-${remainder}`];

    // --- We have a padding value to segment
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

  // --- Done
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
      const remainder = match[1];

      // --- Flow down the border value
      result[`borderLeft-${remainder}`] = value;
      result[`borderRight-${remainder}`] = value;
      result[`borderTop-${remainder}`] = value;
      result[`borderBottom-${remainder}`] = value;

      // --- We have a border value to segment
      const border = getBorderSegments(value);
      result[`borderWidth-${remainder}`] ??= border.thickness;
      result[`borderStyle-${remainder}`] ??= border.style;
      result[`borderColor-${remainder}`] ??= border.color;
    }

    // --- Check "borderWidth-" theme variables
    match = thicknessBorderRegEx.exec(key);
    if (match) {
      // --- We have a borderWidth value to flow down
      const remainder = match[1];
      result[`borderLeftWidth-${remainder}`] = value;
      result[`borderRightWidth-${remainder}`] = value;
      result[`borderTopWidth-${remainder}`] = value;
      result[`borderBottomWidth-${remainder}`] = value;
    }

    // --- Check "borderStyle-" theme variables
    match = styleBorderRegEx.exec(key);
    if (match) {
      // --- We have a borderStyle value to flow down
      const remainder = match[1];
      result[`borderLeftStyle-${remainder}`] = value;
      result[`borderRightStyle-${remainder}`] = value;
      result[`borderTopStyle-${remainder}`] = value;
      result[`borderBottomStyle-${remainder}`] = value;
    }

    // --- Check "borderColor-" theme variables
    match = colorBorderRegEx.exec(key);
    if (match) {
      // --- We have a borderColor value to flow down
      const remainder = match[1];
      result[`borderLeftColor-${remainder}`] = value;
      result[`borderRightColor-${remainder}`] = value;
      result[`borderTopColor-${remainder}`] = value;
      result[`borderBottomColor-${remainder}`] = value;
    }

    // --- Check "borderHorizontal" theme variables
    match = borderHorizontalRegEx.exec(key);
    if (match) {
      // --- We have a borderHorizontal value to segment
      const remainder = match[1];

      // --- Flow down the border value
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

    // --- Check "borderVertical" theme variables
    match = borderVerticalRegEx.exec(key);
    if (match) {
      // --- We have a borderVertical value to segment
      const remainder = match[1];
      // --- Flow down the border value
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

    // --- Check "borderLeft" theme variables
    match = borderLeftRegEx.exec(key);
    if (match) {
      // --- We have a borderLeft value to segment
      const remainder = match[1];
      const border = getBorderSegments(value);
      if (border.thickness && !theme[`borderLeftWidth-${remainder}`]) {
        result[`borderLeftWidth-${remainder}`] = border.thickness;
      }
      if (border.style && !theme[`borderLeftStyle-${remainder}`]) {
        result[`borderLeftStyle-${remainder}`] = border.style;
      }
      if (border.color && !theme[`borderLeftColor-${remainder}`]) {
        result[`borderLeftColor-${remainder}`] = border.color;
      }
    }

    // --- Check "borderRight" theme variables
    match = borderRightRegEx.exec(key);
    if (match) {
      // --- We have a borderRight value to segment
      const remainder = match[1];
      const border = getBorderSegments(value);
      if (border.thickness) {
        result[`borderRightWidth-${remainder}`] = border.thickness;
      }
      if (border.style) {
        result[`borderRightStyle-${remainder}`] = border.style;
      }
      if (border.color) {
        result[`borderRightColor-${remainder}`] = border.color;
      }
    }

    // --- Check "borderTop" theme variables
    match = borderTopRegEx.exec(key);
    if (match) {
      // --- We have a borderTop value to segment
      const remainder = match[1];
      const border = getBorderSegments(value);
      if (border.thickness) {
        result[`borderTopWidth-${remainder}`] = border.thickness;
      }
      if (border.style) {
        result[`borderTopStyle-${remainder}`] = border.style;
      }
      if (border.color) {
        result[`borderTopColor-${remainder}`] = border.color;
      }
    }

    // --- Check "borderBottom" theme variables
    match = borderBottomRegEx.exec(key);
    if (match) {
      // --- We have a borderBottom value to segment
      const remainder = match[1];
      const border = getBorderSegments(value);
      if (border.thickness) {
        result[`borderBottomWidth-${remainder}`] = border.thickness;
      }
      if (border.style) {
        result[`borderBottomStyle-${remainder}`] = border.style;
      }
      if (border.color) {
        result[`borderBottomColor-${remainder}`] = border.color;
      }
    }

    // --- Check "borderHorizontalWidth" theme variables
    match = thicknessBorderHorizontalRegEx.exec(key);
    if (match) {
      // --- We have a borderHorizontalWidth value to flow down
      const remainder = match[1];
      result[`borderLeftWidth-${remainder}`] = value;
      result[`borderRightWidth-${remainder}`] = value;
    }

    // --- Check "borderVerticalWidth" theme variables
    match = thicknessBorderVerticalRegEx.exec(key);
    if (match) {
      // --- We have a borderVerticalWidth value to flow down
      const remainder = match[1];
      result[`borderTopWidth-${remainder}`] = value;
      result[`borderBottomWidth-${remainder}`] = value;
    }

    // --- Check "borderHorizontalStyle" theme variables
    match = styleBorderHorizontalRegEx.exec(key);
    if (match) {
      // --- We have a borderHorizontalStyle value to flow down
      const remainder = match[1];
      result[`borderLeftStyle-${remainder}`] = value;
      result[`borderRightStyle-${remainder}`] = value;
    }

    // --- Check "borderVerticalStyle" theme variables
    match = styleBorderVerticalRegEx.exec(key);
    if (match) {
      // --- We have a borderVerticalStyle value to flow down
      const remainder = match[1];
      result[`borderTopStyle-${remainder}`] = value;
      result[`borderBottomStyle-${remainder}`] = value;
    }

    // --- Check "borderHorizontalColor" theme variables
    match = colorBorderHorizontalRegEx.exec(key);
    if (match) {
      // --- We have a borderHorizontalColor value to flow down
      const remainder = match[1];
      result[`borderLeftColor-${remainder}`] = value;
      result[`borderRightColor-${remainder}`] = value;
    }

    // --- Check "borderVerticalColor" theme variables
    match = colorBorderVerticalRegEx.exec(key);
    if (match) {
      // --- We have a borderVerticalColor value to flow down
      const remainder = match[1];
      result[`borderTopColor-${remainder}`] = value;
      result[`borderBottomColor-${remainder}`] = value;
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
    let color0;
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
    let color1000;
    if (distributeEven) {
      color0 = baseColor.lightness(100);
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
      color1000 = baseColor.lightness(9);
    } else {
      const baseL = baseColor.hsl().l();
      const darkStep = baseL / 5;
      const lightStep = (100 - baseL) / 5;
      color0 = baseColor.lightness(100);
      color50 = baseColor.lightness(baseL + lightStep * 4.5);
      color100 = baseColor.lightness(baseL + lightStep * 4);
      color200 = baseColor.lightness(baseL + lightStep * 3);
      color300 = baseColor.lightness(baseL + lightStep * 2);
      color400 = baseColor.lightness(baseL + lightStep * 1);
      color500 = baseColor.lightness(baseL);
      color600 = baseColor.lightness(baseL - darkStep * 1);
      color700 = baseColor.lightness(baseL - darkStep * 2);
      color800 = baseColor.lightness(baseL - darkStep * 3);
      color900 = baseColor.lightness(baseL - darkStep * 4);
      color950 = baseColor.lightness(baseL - darkStep * 4.5);
      color1000 = baseColor.lightness(baseL - darkStep * 5);
    }

    return {
      [`const-${varName}-0`]: color0.toString(),
      [`const-${varName}-50`]: color50.toString(),
      [`const-${varName}-100`]: color100.toString(),
      [`const-${varName}-200`]: color200.toString(),
      [`const-${varName}-300`]: color300.toString(),
      [`const-${varName}-400`]: color400.toString(),
      [`const-${varName}-500`]: color500.toString(),
      [`const-${varName}-600`]: color600.toString(),
      [`const-${varName}-700`]: color700.toString(),
      [`const-${varName}-800`]: color800.toString(),
      [`const-${varName}-900`]: color900.toString(),
      [`const-${varName}-950`]: color950.toString(),
      [`const-${varName}-1000`]: color1000.toString(),
    };
  } catch (e) {
    console.error("Error generating base tones for color:", varName);
    return {};
  }
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
