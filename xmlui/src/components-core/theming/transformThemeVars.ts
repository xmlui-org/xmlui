import Color from "color";

import { HVar, parseHVar } from "@components-core/theming/hvar";

export function resolveThemeVar(varName: string, theme: Record<string, string> = {}): string {
  const value = theme[varName];
  if (typeof value === "string" && value.startsWith("$")) {
    return resolveThemeVar(value.substring(1), theme);
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
    ...generateBaseTonesForColor("color-surface", resolvedTheme, {distributeEven: true}),
  };
  return {
    ...colorTones,
    ...generateRbgChannelsForTone("color-surface", {...resolvedTheme, ...colorTones}),
    ...generateRbgChannelsForTone("color-primary", {...resolvedTheme, ...colorTones})
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
  if (Number.isNaN(baseNum)){
    return {};
  }

  const scale = [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 16, 20, 24, 28, 32, 36, 40, 44, 48, 52, 56, 60, 64, 72, 80, 96];
  const ret: Record<string, string> = {};

  scale.forEach((step)=>{
    ret[`space-${(step + "").replace(".", "_")}`] = `${step * baseNum}${baseUnit}`;
  })

  return ret;
}

export function generateBaseFontSizes(theme: Record<string, string> | undefined){
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
  if (Number.isNaN(baseNum)){
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
    const solidTones = mapTones(findClosest(resolvedTheme, `color-Button-${variant}-solid`), (tones) => {
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
    });

    const outlinedTones = mapTones(findClosest(resolvedTheme, `color-Button-${variant}-outlined`), (tones) => {
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
    });

    const ghostTones = mapTones(findClosest(resolvedTheme, `color-Button-${variant}-ghost`), (tones) => {
      return {
        [`color-bg-Button-${variant}-ghost--active`]: tones.alpha2,
        [`color-bg-Button-${variant}-ghost--hover`]: tones.alpha1,
        [`color-text-Button-${variant}-ghost`]: tones.base,
        [`color-text-Button-${variant}-ghost--hover`]: tones.tone1,
        [`color-text-Button-${variant}-ghost--active`]: tones.tone2,
      };
    });
    ret = {
      ...ret,
      ...solidTones,
      ...outlinedTones,
      ...ghostTones,
    };
  });
  return ret;
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
  if(!colorStr){
    return undefined;
  }
  const color = Color(colorStr)
  let rgb = color.rgb();
  return `${rgb.red()},${rgb.green()},${rgb.blue()}`;
}

function generateBaseTonesForColor(varName: string, theme: Record<string, string>, options = {distributeEven: false}) {
  try {
    const {distributeEven} = options;
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
    }
  } catch (e) {
    console.error("Error generating base tones for color:", varName);
    return {};
  }
}

function generateRbgChannelsForTone(varName: string, theme: Record<string, string>){
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
  mapper: (tones: ColorTones) => Record<string, string>
) {
  const tones = generateTones(baseColor);
  if (!tones) {
    return {};
  }
  return mapper(tones);
}

function generateTones(baseColorStr: string | null | undefined): ColorTones | null {
  if (!baseColorStr || typeof baseColorStr !== "string" || baseColorStr.startsWith("$")) return null; //TODO illesg here the startsWidth $ should be something else

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
