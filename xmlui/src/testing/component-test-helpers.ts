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

export function pixelStrToNum(pixelStr: string) {
  return Number(pixelStr.replace("px", ""));
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
      }
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
