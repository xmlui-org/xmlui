import type { Locator } from "@playwright/test";
import type { ComponentDriver } from "./ComponentDrivers";

export async function getBounds(locator: Locator): Promise<{
  x: number;
  y: number;
  width: number;
  height: number;
  left: number;
  right: number;
  top: number;
  bottom: number;
}> {
  const box = await locator.boundingBox();
  if (!box) {
    throw new Error("Expected locator to have bounds.");
  }
  return {
    ...box,
    left: box.x,
    right: box.x + box.width,
    top: box.y,
    bottom: box.y + box.height,
  };
}

export function getStyles(
  locator: Locator,
  style: string | string[],
  pseudoElement?: string,
): Promise<Record<string, string>> {
  const styleNames = Array.isArray(style) ? style : [style];
  return locator.evaluate(
    (element, options) =>
      Object.fromEntries(
        options.styleNames.map((styleName) => [
          styleName
            .trim()
            .split("-")
            .map((part, index) => (index === 0 ? part : part[0].toUpperCase() + part.slice(1)))
            .join(""),
          window.getComputedStyle(element, options.pseudoElement).getPropertyValue(styleName),
        ]),
      ),
    { styleNames, pseudoElement },
  );
}

export async function overflows(locator: Locator, direction: "x" | "y" | "both" = "both") {
  const [width, height, scrollWidth, scrollHeight] = await locator.evaluate((element) => [
    element.clientWidth,
    element.clientHeight,
    element.scrollWidth,
    element.scrollHeight,
  ]);
  if (direction === "x") {
    return scrollWidth > width;
  }
  if (direction === "y") {
    return scrollHeight > height;
  }
  return scrollWidth > width && scrollHeight > height;
}

export async function getPaddings(locator: Locator) {
  const styles = await computedStyles(locator, [
    "padding-left",
    "padding-right",
    "padding-top",
    "padding-bottom",
  ]);
  return {
    left: cssLength(styles["padding-left"]),
    right: cssLength(styles["padding-right"]),
    top: cssLength(styles["padding-top"]),
    bottom: cssLength(styles["padding-bottom"]),
  };
}

export async function getBorders(driver: ComponentDriver) {
  const styles = await computedStyles(driver.component, [
    "border-left-width",
    "border-right-width",
    "border-top-width",
    "border-bottom-width",
  ]);
  return {
    left: { width: cssLength(styles["border-left-width"]) },
    right: { width: cssLength(styles["border-right-width"]) },
    top: { width: cssLength(styles["border-top-width"]) },
    bottom: { width: cssLength(styles["border-bottom-width"]) },
  };
}

export async function isIndeterminate(locator: Locator): Promise<boolean> {
  return locator.evaluate((element) =>
    element instanceof HTMLInputElement ? element.indeterminate : false,
  );
}

export const SKIP_REASON = {
  TEST_NOT_WORKING: (description: string) => ({
    annotation: {
      type: "skip",
      description,
    },
  }),
  XMLUI_BUG: (description: string) => ({
    annotation: {
      type: "skip",
      description,
    },
  }),
  TO_BE_IMPLEMENTED: (description: string) => ({
    annotation: {
      type: "skip",
      description,
    },
  }),
  OTHER: (description: string) => ({
    annotation: {
      type: "skip",
      description,
    },
  }),
};

async function computedStyles(locator: Locator, names: string[]): Promise<Record<string, string>> {
  return locator.evaluate((element, styleNames) => {
    const styles = window.getComputedStyle(element);
    return Object.fromEntries(styleNames.map((name) => [name, styles.getPropertyValue(name)]));
  }, names);
}

function cssLength(value: string) {
  const parsed = Number.parseFloat(value);
  return {
    value: Number.isFinite(parsed) ? parsed : 0,
    unit: value.replace(String(parsed), "").trim() || "px",
  };
}
