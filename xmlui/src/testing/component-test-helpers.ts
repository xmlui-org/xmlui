import type { Locator } from "@playwright/test";

import { type ParserResult, xmlUiMarkupToComponent } from "../components-core/xmlui-parser";
import type { ComponentDef, CompoundComponentDef } from "../abstractions/ComponentDefs";

import chroma, { type Color } from "chroma-js";
import { ComponentDriver } from "./ComponentDrivers";

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

export function parseComponentIfNecessary(
  rawComponent: ComponentDef<any> | CompoundComponentDef | string,
): ParserResult {
  if (typeof rawComponent === "string") {
    return xmlUiMarkupToComponent(rawComponent);
  }
  return {
    component: rawComponent,
    errors: [],
    erroneousCompoundComponentName: undefined,
  };
}

export function getBoundingRect(locator: Locator) {
  return locator.evaluate((element) => element.getBoundingClientRect());
}

export function isIndeterminate(specifier: ComponentDriver | Locator) {
  if (specifier instanceof ComponentDriver) specifier = specifier.component;
  return specifier.evaluate((el: HTMLInputElement) => el.indeterminate);
}

export async function overflows(locator: Locator, direction: "x" | "y" | "both" = "both") {
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

// ----------------------------------
// ComponentDriver style helpers
// ----------------------------------

export function getStyles(
  specifier: ComponentDriver | Locator,
  style: string | string[],
  pseudoElement?: string,
) {
  if (specifier instanceof ComponentDriver) specifier = specifier.component;
  style = Array.isArray(style) ? style : [style];
  return specifier.evaluate(
    (element, obj) =>
      Object.fromEntries(
        obj.style.map((styleName) => [
          styleName
            .trim()
            .split("-")
            .map((n, idx) => (idx === 0 ? n : n[0].toUpperCase() + n.slice(1)))
            .join(""),
          window.getComputedStyle(element, obj.pseudoElement).getPropertyValue(styleName),
        ]),
      ),
    { style, pseudoElement },
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

  REFACTOR(description?: string) {
    return this.addAnnotation("refactor", description);
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

  const color = parts.filter((p) => chroma.valid(p));
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
}

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

/**
 * Retrieves the bounding rectangle of the component including **margins** and **padding**
 * added to the dimensions.
 */
export async function getBounds(locator: Locator) {
  const { boundingRect, marginLeft, marginRight, marginTop, marginBottom } = await locator.evaluate(
    (element) => {
      const styles = window.getComputedStyle(element);
      return {
        boundingRect: element.getBoundingClientRect(),
        marginLeft: parseFloat(styles.getPropertyValue("margin-left")),
        marginRight: parseFloat(styles.getPropertyValue("margin-right")),
        marginTop: parseFloat(styles.getPropertyValue("margin-top")),
        marginBottom: parseFloat(styles.getPropertyValue("margin-bottom")),
      };
    },
  );

  const width = boundingRect.width + marginLeft + marginRight;
  const height = boundingRect.height + marginTop + marginBottom;
  const left = boundingRect.left - marginLeft;
  const right = boundingRect.right + marginRight;
  const top = boundingRect.top - marginTop;
  const bottom = boundingRect.bottom + marginBottom;
  return { width, height, left, right, top, bottom };
}
