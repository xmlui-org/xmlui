import type { CSSProperties } from "react";
import type {
  LayoutContext,
  StylePropResolvers,
  ValueExtractor,
} from "../../abstractions/RendererDefs";
import { EMPTY_OBJECT } from "../constants";
import type { ParsedLayout } from "./parse-layout-props";
import { parseLayoutProperty } from "./parse-layout-props";
import type { ComponentDef, ComponentMetadata } from "../../abstractions/ComponentDefs";
import type { MediaBreakpointType } from "../../abstractions/AppContextDefs";
import { MediaBreakpointKeys } from "../../abstractions/AppContextDefs";

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

type ResolveComponentLayoutPropsContext = {
  layoutContext?: LayoutContext;
  stylePropResolvers?: StylePropResolvers;
  node?: ComponentDef;
  valueExtractor?: ValueExtractor;
};

function resolveSingleProp(
  parsed: ParsedLayout,
  value,
  result: ResolvedComponentLayout,
  node: ComponentDef<ComponentMetadata>,
  valueExtractor: ValueExtractor,
  layoutContext: LayoutContext<ComponentDef<ComponentMetadata>>,
  stylePropResolvers: StylePropResolvers,
  resolveStyleProp,
  cssResolved?,
) {
  // --- Process the properties, resolve theme variables to CSS variables
  const cssPropName = parsed.property;
  const appliedValue = value
    ?.toString()
    ?.replace(themeVarCapturesRegex, (match: string) => toCssVar(match.trim()));


  const defaults = stylePropResolvers?.defaults?.();

  // --- Some properties may need transformation
  let stylePropResolverContext = {
    value: appliedValue,
    node,
    extractValue: valueExtractor,
    layoutContext,
    resolveStyleProp: (propName)=>{
      return resolveStyleProp(propName, defaults);
    },
  };
  const cssProps: CSSProperties =
    cssPropName in stylePropResolvers
      ? stylePropResolvers[cssPropName](stylePropResolverContext)
      : cssPropName in specialResolvers
        ? specialResolvers[cssPropName](appliedValue, layoutContext)
        : { [cssPropName]: appliedValue };

  cssResolved?.(cssProps);
  // --- Check if the property belongs to one or more states
  const stateName = parsed.states && parsed.states.length > 0 ? parsed.states.join("&") : null;

  // --- Prepare the place to store the styles. It belongs to the specified part.
  const partName = parsed.part ? parsed.part : BASE_COMPONENT_PART;
  let propertyTarget: any = (result[partName] ??= {});
  if (parsed.screenSizes && parsed.screenSizes.length > 0) {
    const screenSizeKey = parsed.screenSizes.join("&");
    propertyTarget.responsiveStyles ??= {};
    propertyTarget.responsiveStyles[screenSizeKey] ??=
      stylePropResolvers?.defaults?.(stylePropResolverContext) || {};
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
    propertyTarget.baseStyles ??= stylePropResolvers?.defaults?.(stylePropResolverContext) || {};
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

function findStyleProp(newParsed: ParsedLayout, result: ResolvedComponentLayout, propNAme) {
  if (newParsed.screenSizes?.length) {
    const screenSize = newParsed.screenSizes[0];
    let responsiveStyles = result[newParsed.part ?? BASE_COMPONENT_PART]?.responsiveStyles;
    for (let i = MediaBreakpointKeys.indexOf(screenSize); i >= 0; i--) {
      if (responsiveStyles?.[MediaBreakpointKeys[i]]?.[propNAme]) {
        return responsiveStyles?.[MediaBreakpointKeys[i]][propNAme];
      }
    }
  }
  return result[newParsed.part ?? BASE_COMPONENT_PART]?.baseStyles?.[propNAme]// || defaults?.[propNAme];
}

function doResolve(
  layoutProps: Record<string, any>,
  node: ComponentDef<ComponentMetadata>,
  valueExtractor: ValueExtractor,
  layoutContext: LayoutContext<ComponentDef>,
  stylePropResolvers: StylePropResolvers = {},
) {
  const result: ResolvedComponentLayout = {};

  const depMap: Record<string, Set<string>> = {};
  const definedStylesByProperties: Record<string, Set<string>> = {};
  const sizesForProps: Record<string, Set<MediaBreakpointType>> = {};
  const parsedPropertiesForProp: Record<string, Array<{ parsedLayout: ParsedLayout, value: any, key: string }>> = {};
  for (const [key, value] of Object.entries(layoutProps)) {
    const parsed = parseLayoutProperty(key, false);

    if (typeof parsed === "string") {
      // --- Ignore failed properties
      continue;
    }

    parsed.value = value;

    sizesForProps[parsed.property] = sizesForProps[parsed.property] || new Set();
    sizesForProps[parsed.property] = sizesForProps[parsed.property].union(
      new Set(parsed.screenSizes || []),
    );
    parsedPropertiesForProp[parsed.property] = parsedPropertiesForProp[parsed.property] || [];
    parsedPropertiesForProp[parsed.property].push({ parsedLayout: parsed, value: value, key });
    resolveSingleProp(
      parsed,
      value,
      result,
      node,
      valueExtractor,
      layoutContext,
      stylePropResolvers,
      function resolveStyleProp(propName) {
        depMap[parsed.property] = depMap[parsed.property] || new Set();
        depMap[parsed.property].add(propName);
        console.log("HEY, resolveStyleProp", propName, result);
        console.log("HEY, parsed", parsed, key);
        return findStyleProp(parsed, result, propName);
      },
      function cssResolved(props) {
        Object.keys(props).forEach((key) => {
          definedStylesByProperties[key] = definedStylesByProperties[key] || new Set();
          definedStylesByProperties[key].add(parsed.property);
        });
      },
    );
  }

  console.log("depMap", depMap);
  console.log("definedStylesByProperties", definedStylesByProperties);

  const mergedDepMap = Object.entries(depMap).reduce(
    (acc, [key, values]) => {
      acc[key] = acc[key] || new Set();
      values.forEach((v) => {
        if (definedStylesByProperties[v]) {
          acc[key] = acc[key].union(definedStylesByProperties[v]);
          acc[key].delete(key);//make sure it doesn't contain itself
        }
      });
      return acc;
    },
    {} as Record<string, Set<string>>,
  );

  console.log("mergedDepMap", mergedDepMap);

  //megvan, hogy melyik property kitol fugg
  // azokat, akik fuggnek valakitol, azokat ujra kell szamolni azokkal a variaciokkal, akiktol fuggenek

  Object.entries(mergedDepMap).forEach(([what, dependsToProps]) => {
    parsedPropertiesForProp[what]?.forEach(({ parsedLayout, value, key }) => {



    });


    //TODO resolve for the existing AND the extras, too (for the extras, the value should be the last in the cascade)
    const extraScreenSizes = new Set<MediaBreakpointType>();
    dependsToProps.forEach((p) => {
      (sizesForProps[p] || new Set()).forEach((s) => extraScreenSizes.add(s));
    });
    const toRevisit = parsedPropertiesForProp[what]?.map(p => p.parsedLayout).toSorted((a, b)=>{
      if(!a.screenSizes && !b.screenSizes){
        return 0;
      }
      if(!a.screenSizes){
        return -1;
      }
      const screenSizeA = a.screenSizes[0];
      const screenSizeB = a.screenSizes[0];
      return MediaBreakpointKeys.indexOf(screenSizeA) - MediaBreakpointKeys.indexOf(screenSizeB);
    });

    console.log("resolving what for extrasizes", what, extraScreenSizes, toRevisit);
    extraScreenSizes.forEach((size)=>{
      let newParsed = {...toRevisit[toRevisit.length - 1]};
      newParsed.screenSizes = [size];
      toRevisit.push(newParsed);
    })
    toRevisit.forEach((parsedL) => {
      resolveSingleProp(
        parsedL,
        parsedL.value,
        result,
        node,
        valueExtractor,
        layoutContext,
        stylePropResolvers,
        (propNAme) => {
          return findStyleProp(parsedL, result, propNAme);
        },
      );
    });

  });

  return result;
}

export function resolveComponentLayoutProps(
  layoutProps: Record<string, any> = EMPTY_OBJECT,
  {
    layoutContext,
    stylePropResolvers,
    node,
    valueExtractor,
  }: ResolveComponentLayoutPropsContext = EMPTY_OBJECT,
): ResolvedComponentLayout {
  return doResolve(
    layoutProps,
    node,
    valueExtractor,
    layoutContext,
    stylePropResolvers,
  );
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

const specialResolvers: Record<string, SpecialResolver> = {
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
  visible: (propValue) => {
    return propValue === "false" ? { display: "none" } : { display: 'revert-layer'};
  },
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
