import type { BrowserContext, Locator, Page } from "@playwright/test";
import { xmlUiMarkupToComponent } from "../components-core/xmlui-parser";
import type { ThemeDefinition } from "../abstractions/ThemingDefs";
import type { ComponentDef, CompoundComponentDef } from "../abstractions/ComponentDefs";
import type { StandaloneAppDescription } from "../components-core/abstractions/standalone";

type EntryPoint = string | Record<string, any>;
type UnparsedAppDescription = Omit<Partial<StandaloneAppDescription>, "entryPoint"> & {
  entryPoint?: EntryPoint;
};

export type ThemeTestDesc = {
  themeVar: string;
  themeVarAsCSS: string;
  expected: string;
  dependsOnVars?: Record<string, string>;
};

function parseComponent(entryPoint: ComponentDef<any> | string) {
  if (typeof entryPoint === "string") {
    return xmlUiMarkupToComponent(entryPoint).component;
  }
  return entryPoint;
}

export async function initApp(
  page: Page,
  appDescription: UnparsedAppDescription,
  url: string = "/",
  resources = {},
) {
  const { entryPoint, components } = appDescription;

  const _appDescription: StandaloneAppDescription = {
    ...appDescription,
    name: appDescription.name || "Test App",
    entryPoint: parseComponent(entryPoint as ComponentDef) as ComponentDef,
    resources,
    components: (!components
      ? undefined
      : Array.isArray(components)
        ? components.map((comp) => parseComponent(comp as unknown as ComponentDef))
        : [parseComponent(components)]) as CompoundComponentDef[],
  };

  await page.addInitScript((app) => {
    // @ts-ignore
    window.TEST_ENV = app;
  }, _appDescription);
  await page.goto(url);
}

export async function prepPage(
  co: BrowserContext,
  appDesc: StandaloneAppDescription,
  url: string = "/",
) {
  const context = co;
  const page = await context.newPage();
  await initApp(page, appDesc, url);
  return page;
}

export async function initThemedApp(
  page: Page,
  entryPoint: EntryPoint,
  theme: Partial<ThemeDefinition>,
) {
  theme.id ??= "testTheme";
  theme.name ??= "Custom Test theme";
  await initApp(page, { entryPoint, defaultTheme: theme.id, themes: [theme as any] });
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

export function getBoundingRect(locator: Locator) {
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

export function getElementStyle(locator: Locator, style: string) {
  return locator.evaluate(
    (element, style) => window.getComputedStyle(element).getPropertyValue(style),
    style,
  );
}

/**
 * Retreives all the provided style properties from the locator
 * @returns an object with the keys being the elements of the styles argument
 */
export function getElementStyles(locator: Locator, styles: string[] = []) {
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
