import type { MediaBreakpointType } from "../../abstractions/AppContextDefs";
import type { StyleObjectType } from "./StyleRegistry";
import { parseLayoutProperty, toCssPropertyNames } from "./parse-layout-props";
import type { ParsedLayout } from "./parse-layout-props";
import { toCssVar } from "./layout-resolver";
import { layoutOptionKeys } from "../descriptorHelper";

// Lookup set for O(1) validation of base property names
const layoutOptionKeySet = new Set(layoutOptionKeys);

/** The key used for the outermost DOM element (no part). */
export const COMPONENT_PART_KEY = "-component";

/**
 * Min-width breakpoint values (in px) for mobile-first responsive rules.
 * "xs" has no min-width — it is the base (no media query).
 */
const BREAKPOINT_MIN_WIDTH: Partial<Record<MediaBreakpointType, number>> = {
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
  xxl: 1400,
};

const themeVarCapturesRegex = /(\$[a-zA-Z][a-zA-Z0-9\-_]*)/g;

function resolveValue(raw: unknown): string | undefined {
  if (raw == null) return undefined;
  const str = typeof raw === "string" ? raw.trim() : String(raw);
  if (!str) return undefined;
  return str.replace(themeVarCapturesRegex, (match) => toCssVar(match.trim()));
}

type PartStyles = {
  // base (xs / no media query) CSS props
  base: Record<string, string>;
  // per-breakpoint CSS props
  breakpoints: Partial<Record<MediaBreakpointType, Record<string, string>>>;
};

/**
 * Builds per-part responsive style objects from a flat map of evaluated prop values.
 *
 * Prop keys follow the pattern defined by `parseLayoutProperty`:
 *   `<cssProperty>[-<part>][-<breakpoint>][--<state>]`
 *
 * Examples:
 *   `fontSize`         → base font-size on the component root
 *   `fontSize-sm`      → font-size at ≥576 px on the component root
 *   `fontSize-label`   → base font-size on the "label" part
 *   `fontSize-label-md`→ font-size at ≥768 px on the "label" part
 *
 * State suffixes (`--hover` etc.) are recognised by the parser but ignored here
 * — they are reserved for a future phase.
 *
 * Returns a map of part key → `StyleObjectType` compatible with `useStyles`.
 * The component-root part is keyed as `"-component"`.
 *
 * This function is pure (no React hooks) and safe to unit-test directly.
 */
export function buildResponsiveStyleObjects(
  props: Record<string, unknown>,
): Record<string, StyleObjectType> {
  const partStyles: Record<string, PartStyles> = {};

  function getOrCreatePart(part: string): PartStyles {
    if (!partStyles[part]) {
      partStyles[part] = { base: {}, breakpoints: {} };
    }
    return partStyles[part];
  }

  // Collect all valid entries first so we can enforce compound-before-specific ordering.
  type ValidEntry = { parsed: ParsedLayout; cssProps: readonly string[]; value: string };
  const validEntries: ValidEntry[] = [];

  for (const propKey of Object.keys(props)) {
    const parsed = parseLayoutProperty(propKey);
    if (typeof parsed === "string") continue; // not a valid layout property
    if (parsed.component) continue;           // component-scoped, skip
    if (!layoutOptionKeySet.has(parsed.property)) continue;

    const cssProps = toCssPropertyNames(parsed.property);
    if (cssProps.length === 0) continue; // non-CSS or suppressed

    const value = resolveValue(props[propKey]);
    if (value === undefined) continue;

    validEntries.push({ parsed, cssProps, value });
  }

  // Compound expansions (e.g. paddingVertical → padding-top + padding-bottom) are applied
  // before specific properties (e.g. paddingTop → padding-top) so that specific ones
  // always win when both are present, regardless of their declaration order.
  validEntries.sort((a, b) => b.cssProps.length - a.cssProps.length);

  for (const { parsed, cssProps, value } of validEntries) {
    const partKey = parsed.part ?? COMPONENT_PART_KEY;
    const entry = getOrCreatePart(partKey);

    for (const cssPropName of cssProps) {
      if (!parsed.screenSizes || parsed.screenSizes.length === 0) {
        // Base rule (applies at all widths, or acts as xs)
        entry.base[cssPropName] = value;
      } else {
        for (const size of parsed.screenSizes) {
          if (size === "xs") {
            // xs is the base — no media query
            entry.base[cssPropName] = value;
          } else {
            if (!entry.breakpoints[size]) {
              entry.breakpoints[size] = {};
            }
            entry.breakpoints[size]![cssPropName] = value;
          }
        }
      }
    }
  }

  // Convert PartStyles → StyleObjectType for each part
  const result: Record<string, StyleObjectType> = {};

  for (const [partKey, styles] of Object.entries(partStyles)) {
    const styleObj: StyleObjectType = {};

    // Base CSS props go directly on the selector ("&" = current element)
    if (Object.keys(styles.base).length > 0) {
      styleObj["&"] = styles.base as StyleObjectType;
    }

    // Breakpoint-specific props become @media rules
    for (const [size, bpProps] of Object.entries(styles.breakpoints) as [MediaBreakpointType, Record<string, string>][]) {
      const minWidth = BREAKPOINT_MIN_WIDTH[size];
      if (minWidth === undefined || Object.keys(bpProps).length === 0) continue;
      styleObj[`@media (min-width: ${minWidth}px)`] = {
        "&": bpProps as StyleObjectType,
      } as StyleObjectType;
    }

    if (Object.keys(styleObj).length > 0) {
      result[partKey] = styleObj;
    }
  }

  return result;
}

/**
 * Builds a single composite `StyleObjectType` for use with `useStyles`.
 *
 * The component-root part's styles apply directly on the class selector.
 * Each named part's styles are scoped under `& [data-part-id="<part>"]`.
 *
 * This lets ComponentAdapter call `useStyles` exactly once for all parts.
 */
export function buildCompositeStyleObject(
  styleObjects: Record<string, StyleObjectType>,
): StyleObjectType {
  const composite: StyleObjectType = {};

  for (const [partKey, styleObj] of Object.entries(styleObjects)) {
    if (partKey === COMPONENT_PART_KEY) {
      // Merge root styles directly into composite
      for (const [selector, value] of Object.entries(styleObj)) {
        if (selector === "&") {
          // Direct CSS props on the root element
          Object.assign(composite, value);
        } else if (selector.startsWith("@media")) {
          // Media query — merge inner "&" content
          const existing = composite[selector] as StyleObjectType | undefined;
          if (existing) {
            const inner = (existing["&"] ?? {}) as StyleObjectType;
            Object.assign(inner, (value as StyleObjectType)["&"]);
            (existing as StyleObjectType)["&"] = inner;
          } else {
            composite[selector] = value as StyleObjectType;
          }
        } else {
          composite[selector] = value as StyleObjectType;
        }
      }
    } else {
      // Named part — emit rules under BOTH selectors:
      // 1. &[data-part-id="x"]  (self, no space): matches when the component root itself IS the
      //    part element (e.g. RatingInput, where Part/Slot puts data-part-id on the root div).
      // 2. & [data-part-id="x"] (descendant, space): matches when the part is a child of the root
      //    (e.g. DateInput where day/month/year are descendant elements).
      const selfSel = `&[data-part-id="${partKey}"]`;
      const descSel = `& [data-part-id="${partKey}"]`;

      function mergePartStyles(target: StyleObjectType, sel: string, styles: object) {
        const existing = target[sel] as StyleObjectType | undefined;
        if (existing) {
          Object.assign(existing, styles);
        } else {
          target[sel] = { ...styles } as StyleObjectType;
        }
      }

      for (const [selector, value] of Object.entries(styleObj)) {
        if (selector === "&") {
          mergePartStyles(composite, selfSel, value as object);
          mergePartStyles(composite, descSel, value as object);
        } else if (selector.startsWith("@media")) {
          const innerPartStyles = (value as StyleObjectType)["&"] as StyleObjectType | undefined;
          if (innerPartStyles) {
            if (!composite[selector]) {
              composite[selector] = {} as StyleObjectType;
            }
            const mediaObj = composite[selector] as StyleObjectType;
            mergePartStyles(mediaObj, selfSel, innerPartStyles);
            mergePartStyles(mediaObj, descSel, innerPartStyles);
          }
        }
      }
    }
  }

  return composite;
}
