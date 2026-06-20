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

export const SKIP_REASON = {
  TEST_NOT_WORKING: (description: string) => ({
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
