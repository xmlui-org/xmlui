import type { CSSProperties } from "react";
import type { LayoutContext } from "../../abstractions/RendererDefs";
import { EMPTY_OBJECT } from "../constants";
import { parseLayoutProperty } from "./parse-layout-props";

export type ResolvedComponentLayout = Record<string, ResolvedPartLayout>;

export type ResolvedPartLayout = {
  baseStyles?: CssPropsWithStates;
  responsiveStyles?: Record<string, CssPropsWithStates>;
};

export type CssPropsWithStates = CSSProperties & {
  states?: Record<string, CSSProperties>;
};

export const THEME_VAR_PREFIX = "xmlui";
export const BASE_COMPONENT_PART = "_base_";
const themeVarCapturesRegex = /(\$[a-zA-Z][a-zA-Z0-9-_]*)/g;
const starSizeRegex = /^\d*\*$/;

export function resolveComponentLayoutProps(
  layoutProps: Record<string, any> = EMPTY_OBJECT,
  layoutContext?: LayoutContext,
): ResolvedComponentLayout {
  const result: ResolvedComponentLayout = {};

  for (const [key, value] of Object.entries(layoutProps)) {
    const parsed = parseLayoutProperty(key, false);

    if (typeof parsed === "string") {
      // --- Ignore failed properties
      continue;
    }

    // --- Process the properties, resolve theme variables to CSS variables
    const cssPropName = parsed.property;
    const appliedValue = value
      ?.toString()
      ?.replace(themeVarCapturesRegex, (match: string) => toCssVar(match.trim()));

    // --- Some properties may need transformation
    const cssProps: CSSProperties =
      cssPropName in specialResolvers
        ? specialResolvers[cssPropName](appliedValue, layoutContext)
        : { [cssPropName]: appliedValue };

    // --- Check if the property belongs to one or more states
    const stateName = parsed.states && parsed.states.length > 0 ? parsed.states.join("&") : null;

    // --- Prepare the place to store the styles. It belongs to the specified part.
    const partName = parsed.part ? parsed.part : BASE_COMPONENT_PART;
    let propertyTarget: any = (result[partName] ??= {});
    if (parsed.screenSizes && parsed.screenSizes.length > 0) {
      const screenSizeKey = parsed.screenSizes.join("&");
      propertyTarget.responsiveStyles ??= {};
      propertyTarget.responsiveStyles[screenSizeKey] ??= {};
      if (stateName) {
        propertyTarget.responsiveStyles[screenSizeKey].states ??= {};
        propertyTarget.responsiveStyles[screenSizeKey].states = {
          ...propertyTarget.responsiveStyles[screenSizeKey].states,
          [stateName]: {
            ...propertyTarget.responsiveStyles[screenSizeKey].states[stateName],
            ...cssProps,
          },
        };
      } else {
        propertyTarget.responsiveStyles[screenSizeKey] = {
          ...propertyTarget.responsiveStyles[screenSizeKey],
          ...cssProps,
        };
      }
    } else {
      // --- No screen sizes specified, the property belongs to the base styles
      propertyTarget.baseStyles ??= {};
      if (stateName) {
        propertyTarget.baseStyles.states ??= {};
        propertyTarget.baseStyles.states = {
          ...propertyTarget.baseStyles.states,
          [stateName]: { ...propertyTarget.baseStyles.states[stateName], ...cssProps },
        };
      } else {
        propertyTarget.baseStyles = { ...propertyTarget.baseStyles, ...cssProps };
      }
    }
  }

  // --- Done
  return result;
}

// --- Checks if the specified size is a star size and the orientation is horizontal
function getHorizontalStarSize(
  size: string | number,
  layoutContext?: LayoutContext,
): number | null {
  if (!size) return null;
  const orientation = getOrientation(layoutContext);
  return orientation === "horizontal" && starSizeRegex.test(size.toString())
    ? getStarSizeNumber(size.toString())
    : null;
}

// --- Checks if the specified size is a star size and the orientation is vertical
function getVerticalStarSize(size: string | number, layoutContext?: LayoutContext): number | null {
  if (!size) return null;
  const orientation = getOrientation(layoutContext);
  return orientation === "vertical" && starSizeRegex.test(size.toString())
    ? getStarSizeNumber(size.toString())
    : null;
}

// ---  Obtains the integer number from a string that matches the starSizeRegex.
function getStarSizeNumber(input: string): number | null {
  if (starSizeRegex.test(input)) {
    const numberPart = input.slice(0, -1); // Remove the trailing '*'
    return numberPart === "" ? 1 : parseInt(numberPart, 10); // Default to 1 if no number is present
  }
  return null;
}

// --- Gets the current orientation from the layout context
function getOrientation(layoutContext?: LayoutContext): string | undefined {
  if (!layoutContext) return;
  let orientation = layoutContext?.type === "Stack" && layoutContext?.orientation;
  return orientation?.toString();
}

function toCssVar(c: string): string {
  return `var(--${THEME_VAR_PREFIX}-${c.substring(1)})`;
}

type SpecialResolver = (propValue: any, layoutContext?: LayoutContext) => CSSProperties;

export const specialResolvers: Record<string, SpecialResolver> = {
  paddingHorizontal: (propValue) => ({
    paddingLeft: propValue,
    paddingRight: propValue,
  }),
  paddingVertical: (propValue) => ({
    paddingTop: propValue,
    paddingBottom: propValue,
  }),
  marginHorizontal: (propValue) => ({
    marginLeft: propValue,
    marginRight: propValue,
  }),
  marginVertical: (propValue) => ({
    marginTop: propValue,
    marginBottom: propValue,
  }),
  borderHorizontal: (propValue) => ({
    borderLeft: propValue,
    borderRight: propValue,
  }),
  borderVertical: (propValue) => ({
    borderTop: propValue,
    borderBottom: propValue,
  }),
  wrapContent: (propValue) => ({
    flexWrap: propValue === "true" ? "wrap" : "nowrap",
  }),
  canShrink: (propValue) => ({
    flexShrink: propValue === "true" ? 1 : 0,
  }),
  width: (propValue, layoutContext) => {
    const horizontalStarSize = getHorizontalStarSize(propValue, layoutContext);
    const result: CSSProperties = {};
    if (horizontalStarSize !== null) {
      // --- We use "flex" when width is in start-size and allow shrinking
      result.flex = horizontalStarSize;
      result.flexShrink = 1;
    } else {
      result.width = propValue;
    }
    return result;
  },
  height: (propValue, layoutContext) => {
    const verticalStarSize = getVerticalStarSize(propValue, layoutContext);
    const result: CSSProperties = {};
    if (verticalStarSize !== null) {
      // --- We use "flex" when height is in start-size and allow shrinking
      result.flex = verticalStarSize;
      result.flexShrink = 1;
    } else {
      result.height = propValue;
    }
    return result;
  },
};
