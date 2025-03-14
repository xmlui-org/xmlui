import type { Locator, Page } from "@playwright/test";

import { xmlUiMarkupToComponent } from "../components-core/xmlui-parser";
import type { StandaloneAppDescription } from "../components-core/abstractions/standalone";
import type { ComponentDef, CompoundComponentDef } from "../abstractions/ComponentDefs";

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

export async function getFullRectangle(locator: Locator) {
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
}

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

export async function getStyle(page: Page, testId: string, style: string) {
  const locator = page.getByTestId(testId);
  return await getElementStyle(locator, style);
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

// ---

export function pixelStrToNum(pixelStr: string) {
  return Number(pixelStr.replace("px", ""));
}

export function parseAsNumericCss(str: string) {
  const parts = str.match(/^([+-]?(?:\d+|\d*\.\d+))([a-z]*|%)$/);
  if (!parts) {
    throw new Error(`Provided value ${str} cannot be parsed as a numeric CSS value`);
  }
  if (parts.length < 3) {
    throw new Error(`${parts[0]} is not a correct numeric CSS value`);
  }
  if (!isCSSUnit(parts[2])) {
    throw new Error(`${parts[2]} is not have a valid CSS unit`);
  }
  const result: NumericCSS = {
    value: parseFloat(parts[1]),
    unit: parts[2] as CSSUnit,
  };
  return result;
}

export function parseAsCssBorder(str: string) {
  const parts = str.split(/\s+(?=[a-z]+|\()/i);
  if (parts.length !== 3) {
    throw new Error(`Provided value ${str} cannot be parsed as a CSS border`);
  }
  if (!isCSSBorderStyle(parts[1])) {
    throw new Error(`${parts[1]} is not have a valid CSS border style`);
  }
  const result: CSSBorder = {
    width: parseAsNumericCss(parts[0]),
    style: parts[1] as CSSBorderStyle,
    color: parts[2],
  };
  return result;
}

export type NumericCSS = {
  value: number;
  unit: CSSUnit;
};

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

type CSSBorder = {
  width: NumericCSS;
  style: CSSBorderStyle;
  color: string;
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
type CSSBorderStyle = (typeof CSSBorderStyleValues)[number];

function isCSSBorderStyle(str: string): str is CSSBorderStyle {
  return CSSBorderStyleValues.includes(str as any);
}
