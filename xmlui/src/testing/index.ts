// Main testing exports - test and expect with xmlui-specific fixtures
export { test, expect } from "./fixtures";

// Testing utilities and helpers
export {
  getBoundingRect,
  getElementStyle,
  getElementStyles,
  isIndeterminate,
  overflows,
  getStyles,
  getPseudoStyles,
  getHtmlAttributes,
  getPaddings,
  getBorders,
  getMargins,
  getBounds,
  SKIP_REASON,
  pixelStrToNum,
  parseAsCssBorder,
  parseAsNumericCss,
  numericCSSToString,
  parseAsCSSColor,
  parseAsCSSBorderStyle,
  parseComponentIfNecessary,
  scaleByPercent,
  getComponentTagName,
  mapObject,
  type ThemeTestDesc,
  type NumericCSS,
  type CSSColor,
  type CSSBorder,
  type CSSBorderStyle,
  type BorderSide,
} from "./component-test-helpers";

// Component drivers
export { ComponentDriver } from "./ComponentDrivers";

// Themed app test helpers
export {
  initApp,
  prepPage,
  initThemedApp,
  scalePercentBy,
  getBoundingRect as getThemedBoundingRect,
  getFullRectangle,
  isElementOverflown as themedOverflows,
  pixelStrToNum as themedPixelStrToNum,
  getElementStyle as getThemedElementStyle,
  getElementStyles as getThemedElementStyles,
  getStyle as getThemedStyle,
  type ThemeTestDesc as ThemedThemeTestDesc,
} from "./themed-app-test-helpers";

// Assertions
export * from "./assertions";

// Testing infrastructure types (but not the infrastructure itself)
export type { TestBedDescription } from "./fixtures";

// Driver exports
export { DateInputDriver, TimeInputDriver, TimerDriver } from "./drivers/index";
