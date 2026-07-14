import { isLayoutPropName } from "./contracts";
import { parseStyleSelectorKey } from "./layout";

const dimensionLayoutPropNames = new Set([
  "width",
  "minWidth",
  "maxWidth",
  "height",
  "minHeight",
  "maxHeight",
]);

export function isInlineStyleDisabled(
  themeDisableInlineStyle: boolean | undefined,
  appGlobals?: Record<string, unknown>,
  themeDisableInlineStyleIsExplicit = false,
): boolean {
  if (themeDisableInlineStyle === true) {
    return true;
  }
  if (themeDisableInlineStyle === false && themeDisableInlineStyleIsExplicit) {
    return false;
  }
  return isTruthyBoolean(appGlobals?.disableInlineStyle);
}

export function filterPropsForDisabledInlineStyle(
  props: Record<string, unknown>,
): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(props).filter(([name]) => isAllowedWhenInlineStylesAreDisabled(name)),
  );
}

export function isAllowedWhenInlineStylesAreDisabled(name: string): boolean {
  if (dimensionLayoutPropNames.has(name)) {
    return true;
  }
  const selector = parseStyleSelectorKey(name);
  return selector.breakpoint !== undefined && dimensionLayoutPropNames.has(selector.property);
}

export function isInlineStylePropName(name: string): boolean {
  if (isLayoutPropName(name)) {
    return true;
  }
  const selector = parseStyleSelectorKey(name);
  return selector.breakpoint !== undefined && isLayoutPropName(selector.property);
}

function isTruthyBoolean(value: unknown): boolean {
  return value === true || value === "true";
}
