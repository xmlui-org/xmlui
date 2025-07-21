import type { Locator, Page } from "@playwright/test";

import { xmlUiMarkupToComponent } from "../components-core/xmlui-parser";
import type { StandaloneAppDescription } from "../components-core/abstractions/standalone";
import type { ComponentDef, CompoundComponentDef } from "../abstractions/ComponentDefs";

import chroma, { type Color } from "chroma-js";
import { ComponentDriver } from "./ComponentDrivers";

type EntryPoint = string | ComponentDef;
type UnparsedAppDescription = Omit<Partial<StandaloneAppDescription>, "entryPoint"> & {
  entryPoint?: EntryPoint;
};

export type ThemeTestDesc = {
  themeVar: string;
  themeVarAsCSS: string;
  expected: string;
  dependsOnVars?: Record<string, string>;
};

export function mapObject<K extends (val: any) => any, V extends (val: string) => string | number>(
  obj: Record<string, any>,
  valFn: K = ((val) => val) as K,
  keyFn: V = ((val) => val) as V,
) {
  const newObject = {} as Record<ReturnType<V>, ReturnType<K>>;
  Object.entries(obj).forEach(([key, value]) => {
    newObject[keyFn(key)] = valFn(value);
  });
  return newObject;
}

export async function getComponentTagName(locator: Locator) {
  return locator.evaluate((el) => el.tagName.toLowerCase());
}

function parseComponentIfNecessary(entryPoint: ComponentDef<any> | CompoundComponentDef | string) {
  if (typeof entryPoint === "string") {
    return xmlUiMarkupToComponent(entryPoint).component;
  }
  return entryPoint;
}

export async function initComponent(page: Page, appDescription: UnparsedAppDescription) {
  const { entryPoint } = appDescription;

  const _appDescription: StandaloneAppDescription = {
    name: "test bed app",
    ...appDescription,
    entryPoint: parseComponentIfNecessary(entryPoint),
  };

  await page.addInitScript((app) => {
    // @ts-ignore
    window.TEST_ENV = app;
  }, _appDescription);
  await page.goto("/");
}

/**
 * @param percentage a percenage value as a string, like "40%"
 * @param scalarOf100Percent The value to multiply the percentage by
 */
export function scalePercentBy(scalarOf100Percent: number, percentage: string) {
  if (!percentage.endsWith("%")) {
    throw new Error("argument doesn't end with % sign");
  }
  const percentageNum = Number(percentage.slice(0, -1));
  return (scalarOf100Percent / 100) * percentageNum;
}

export async function getBoundingRect(locator: Locator) {
  return locator.evaluate((element) => element.getBoundingClientRect());
}

/* export async function getFullRectangle(locator: Locator) {
  const boundingRect = await locator.evaluate((element) => element.getBoundingClientRect());

  const margins = await getElementStyles(locator, [
    "margin-left",
    "margin-right",
    "margin-top",
    "margin-bottom",
  ]);
  const marginLeft = parseFloat(margins["margin-left"]);
  const marginRight = parseFloat(margins["margin-right"]);
  const marginTop = parseFloat(margins["margin-top"]);
  const marginBottom = parseFloat(margins["margin-bottom"]);

  const width = boundingRect.width + marginLeft + marginRight;
  const height = boundingRect.height + marginTop + marginBottom;
  const left = boundingRect.left - marginLeft;
  const right = boundingRect.right + marginRight;
  const top = boundingRect.top - marginTop;
  const bottom = boundingRect.bottom + marginBottom;
  return { width, height, left, right, top, bottom };
} */

export async function isElementOverflown(locator: Locator, direction: "x" | "y" | "both" = "both") {
  const [width, height, scrollWidth, scrollHeight] = await locator.evaluate((element) => [
    element.clientWidth,
    element.clientHeight,
    element.scrollWidth,
    element.scrollHeight,
  ]);
  if (direction === "x") return scrollWidth > width;
  if (direction === "y") return scrollHeight > height;
  return scrollWidth > width && scrollHeight > height;
}

export async function getElementStyle(locator: Locator, style: string) {
  return locator.evaluate(
    (element, style) => window.getComputedStyle(element).getPropertyValue(style),
    style,
  );
}

/**
 * Retreives all the provided style properties from the locator
 * @returns an object with the keys being the elements of the styles argument
 */
export async function getElementStyles(locator: Locator, styles: string[] = []) {
  return locator.evaluate(
    (element, styles) =>
      Object.fromEntries(
        styles.map((styleName) => [
          styleName,
          window.getComputedStyle(element).getPropertyValue(styleName),
        ]),
      ),
    styles,
  );
}

// ----------------------------------
// ComponentDriver style helpers
// ----------------------------------

export async function getStyles(specifier: ComponentDriver | Locator, style: string | string[]) {
  if (specifier instanceof ComponentDriver) specifier = specifier.component;
  style = Array.isArray(style) ? style : [style];
  return (specifier).evaluate(
    (element, styles) =>
      Object.fromEntries(
        styles.map((styleName) => [
          styleName
            .trim()
            .split("-")
            .map((n, idx) => (idx === 0 ? n : n[0].toUpperCase() + n.slice(1)))
            .join(""),
          window.getComputedStyle(element).getPropertyValue(styleName),
        ]),
      ),
    style,
  );
}

export async function getPaddings(specifier: ComponentDriver | Locator) {
  const paddings = mapObject(
    await getStyles(specifier, ["padding-left", "padding-right", "padding-top", "padding-bottom"]),
    parseAsNumericCss,
  );
  return {
    left: paddings.paddingLeft,
    right: paddings.paddingRight,
    top: paddings.paddingTop,
    bottom: paddings.paddingBottom,
  };
}

export async function getBorders(specifier: ComponentDriver | Locator) {
  const borders = mapObject(
    await getStyles(specifier, ["border-left", "border-right", "border-top", "border-bottom"]),
    parseAsCssBorder,
  );
  return {
    left: borders.borderLeft,
    right: borders.borderRight,
    top: borders.borderTop,
    bottom: borders.borderBottom,
  };
}

export async function getMargins(specifier: ComponentDriver | Locator) {
  return getStyles(specifier, ["margin-left", "margin-right", "margin-top", "margin-bottom"]);
}

/**
 * Retrieves the bounding rectangle of the component including **margins** and **padding**
 * added to the dimensions.
 */
export async function getBounds(specifier: ComponentDriver | Locator) {
  if (specifier instanceof ComponentDriver) specifier = specifier.component;
  const boundingRect = await specifier.evaluate((element) =>
    element.getBoundingClientRect(),
  );
  const m = mapObject(await getMargins(specifier), parseFloat);

  const width = boundingRect.width + m.marginLeft + m.marginRight;
  const height = boundingRect.height + m.marginTop + m.marginBottom;
  const left = boundingRect.left - m.marginLeft;
  const right = boundingRect.right + m.marginRight;
  const top = boundingRect.top - m.marginTop;
  const bottom = boundingRect.bottom + m.marginBottom;

  return {
    width,
    height,
    left,
    right,
    top,
    bottom,
  };
}

/**
 * Provides annotations for skipped tests and the ability to specify a reason.
 * Use it via the SKIP_REASON exported variable.
 */
class TestSkipReason {
  private addAnnotation(type: string, description?: string) {
    return {
      annotation: {
        type,
        description: description ?? "",
      },
    };
  }

  NOT_IMPLEMENTED_XMLUI(description?: string) {
    return this.addAnnotation("not implemented in xmlui", description);
  }

  TO_BE_IMPLEMENTED(description?: string) {
    return this.addAnnotation("to be implemented", description);
  }

  XMLUI_BUG(description?: string) {
    return this.addAnnotation("xmlui bug", description);
  }

  TEST_INFRA_BUG(description?: string) {
    return this.addAnnotation("test infra bug", description);
  }

  TEST_NOT_WORKING(description?: string) {
    return this.addAnnotation("test not working", description);
  }

  TEST_INFRA_NOT_IMPLEMENTED(description?: string) {
    return this.addAnnotation("test infra not implemented", description);
  }

  // Need to specify a reason here!
  UNSURE(description: string) {
    return this.addAnnotation("unsure", description);
  }
}

/**
 * Provides annotations for skipped tests and the ability to specify a reason.
 *
 * Usage:
 *
 * ```ts
 * import { SKIP_REASON } from "./tests/component-test-helpers";
 *
 * test.skip(
 *   "test name",
 *   SKIP_REASON.NOT_IMPLEMENTED_XMLUI("This test is not implemented in xmlui")
 *   async ({}) => {},
 * );
 * ```
 */
export const SKIP_REASON = new TestSkipReason();

// --- CSS types and parsers

export function pixelStrToNum(pixelStr: string) {
  return Number(pixelStr.replace("px", ""));
}

export function parseAsCssBorder(str: string) {
  const parts = str.split(/\s+(?=[a-z]+|\()/i);
  if (parts.length > 3) {
    throw new Error(`Provided value ${str} cannot be parsed as a CSS border`);
  }
  const style = parts.filter(isCSSBorderStyle);
  if (style.length > 1) {
    throw new Error(`Too many border styles provided in ${str}`);
  }

  const width = parts.filter(isNumericCSS);
  if (width.length > 1) {
    throw new Error(`Too many border widths provided in ${str}`);
  }

  const color = parts.filter(p => chroma.valid(p));
  if (color.length > 1) {
    throw new Error(`Too many border colors provided in ${str}`);
  }

  const result: CSSBorder = {
    width: !!width[0] ? parseAsNumericCss(width[0]) : undefined,
    style: style[0],
    color: chroma(color[0]),
  };
  return result;

}

export interface NumericCSS {
  value: number;
  unit: CSSUnit;
};

const numericCSSRegex = /^([+-]?(?:\d+|\d*\.\d+))([a-z]*|%)$/;

export function isNumericCSS(str: any): str is NumericCSS {
  const parts = str.match(numericCSSRegex);
  
  if (!parts) return false;
  if (parts.length < 3) return false;
  if (isNaN(parseFloat(parts[1]))) return false;
  if (!isCSSUnit(parts[2])) return false;

  return true;
}

export function parseAsNumericCss(str: string) {
  const parts = str.match(numericCSSRegex);
  if (!parts) {
    throw new Error(`Provided value ${str} cannot be parsed as a numeric CSS value`);
  }
  if (parts.length < 3) {
    throw new Error(`${parts[0]} is not a correct numeric CSS value`);
  }
  const value = parseFloat(parts[1]);
  if (isNaN(value)) {
    throw new Error(`${value} is not a valid number in ${str}`);
  }
  const unit = parts[2];
  if (!isCSSUnit(unit)) {
    throw new Error(`${unit} is not have a valid CSS unit in ${str}`);
  }
  const result: NumericCSS = { value, unit };
  return result;
}

export function numericCSSToString(cssValue: NumericCSS) {
  return `${cssValue.value}${cssValue.unit}`;
}

export type CSSColor = chroma.Color;

export function isCSSColor(str: any): str is CSSColor {
  return chroma.valid(str);
}

export function parseAsCSSColor(str: string): CSSColor {
  return chroma(str);
}

const CSSUnitValues = [
  "px",
  "em",
  "rem",
  "vh",
  "vw",
  "%",
  "cm",
  "mm",
  "in",
  "pt",
  "pc",
  "ex",
  "ch",
  "vmin",
  "vmax",
] as const;
type CSSUnit = (typeof CSSUnitValues)[number];

function isCSSUnit(str: string): str is CSSUnit {
  return CSSUnitValues.includes(str as any);
}

export type CSSBorder = {
  width?: NumericCSS;
  style?: CSSBorderStyle;
  color?: Color;
};

const CSSBorderStyleValues = [
  "solid",
  "dotted",
  "dashed",
  "double",
  "none",
  "hidden",
  "groove",
  "ridge",
  "inset",
  "outset",
] as const;
export type CSSBorderStyle = (typeof CSSBorderStyleValues)[number];

export function isCSSBorderStyle(str: string): str is CSSBorderStyle {
  return CSSBorderStyleValues.includes(str as any);
}
export function parseAsCSSBorderStyle(str: string) {
  if (!isCSSBorderStyle(str)) {
    throw new Error(`Provided value ${str} cannot be parsed as a CSS border style`);
  }
  return str;
}

export const BorderSideValues = ["top", "bottom", "left", "right"] as const;
export type BorderSide = (typeof BorderSideValues)[number];

export function isBorderSide(str: string): str is BorderSide {
  return BorderSideValues.includes(str as any);
}
