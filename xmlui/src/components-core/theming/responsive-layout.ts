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

/**
 * Maps XMLUI state names (used after `--` in layout property keys) to CSS pseudo-class selectors.
 * Only these states are supported; any other state name is silently ignored.
 */
const STATE_TO_PSEUDO: Record<string, string> = {
  hover: "&:hover",
  focus: "&:focus",
  active: "&:active",
  focusVisible: "&:focus-visible",
  focusWithin: "&:focus-within",
  disabled: "&:disabled",
};

type PartStyles = {
  // base (xs / no media query) CSS props
  base: Record<string, string>;
  // per-breakpoint CSS props
  breakpoints: Partial<Record<MediaBreakpointType, Record<string, string>>>;
  // per-state CSS props (each state has its own base + breakpoints)
  states: Record<string, {
    base: Record<string, string>;
    breakpoints: Partial<Record<MediaBreakpointType, Record<string, string>>>;
  }>;
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
 *   `backgroundColor--hover` → background-color on hover on the component root
 *   `color-label--focus`     → color on focus on the "label" part
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
      partStyles[part] = { base: {}, breakpoints: {}, states: {} };
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

    // Determine the pseudo-class selector for state suffixes (e.g. --hover → &:hover).
    // If multiple states are present (e.g. --hover--focus), combine them into a compound
    // selector (e.g. &:hover:focus). Unrecognised state names cause the entry to be skipped.
    let pseudoSelector: string | undefined;
    if (parsed.states && parsed.states.length > 0) {
      const pseudoParts: string[] = [];
      for (const state of parsed.states) {
        const pseudo = STATE_TO_PSEUDO[state];
        if (!pseudo) {
          pseudoSelector = undefined;
          pseudoParts.length = 0;
          break; // unknown state, skip entire entry
        }
        // Extract the ":pseudo" part (skip the "&" prefix)
        pseudoParts.push(pseudo.slice(1));
      }
      if (pseudoParts.length === 0) continue;
      pseudoSelector = `&${pseudoParts.join("")}`;
    }

    // Pick the target bucket: either a state-scoped sub-bucket or the top-level one
    const target = pseudoSelector
      ? (entry.states[pseudoSelector] ??= { base: {}, breakpoints: {} })
      : entry;

    for (const cssPropName of cssProps) {
      if (!parsed.screenSizes || parsed.screenSizes.length === 0) {
        // Base rule (applies at all widths, or acts as xs)
        target.base[cssPropName] = value;
      } else {
        for (const size of parsed.screenSizes) {
          if (size === "xs") {
            // xs is the base — no media query
            target.base[cssPropName] = value;
          } else {
            if (!target.breakpoints[size]) {
              target.breakpoints[size] = {};
            }
            target.breakpoints[size]![cssPropName] = value;
          }
        }
      }
    }
  }

  // Convert PartStyles → StyleObjectType for each part
  const result: Record<string, StyleObjectType> = {};

  for (const [partKey, styles] of Object.entries(partStyles)) {
    const styleObj: StyleObjectType = {};

    // --- Emission order matters for CSS cascade: pseudo selectors BEFORE @media so that
    // --- media-scoped overrides (e.g. @media sm { :hover }) come later in source order
    // --- and beat base pseudo rules (e.g. :hover) at matching viewports.

    // 1. Base CSS props go directly on the selector ("&" = current element)
    if (Object.keys(styles.base).length > 0) {
      styleObj["&"] = styles.base as StyleObjectType;
    }

    // 2. State-specific base props become pseudo-class selectors (e.g. "&:hover")
    //    Emitted before @media so that breakpoint-scoped overrides win in the cascade.
    for (const [pseudoSel, stateStyles] of Object.entries(styles.states)) {
      if (Object.keys(stateStyles.base).length > 0) {
        styleObj[pseudoSel] = {
          ...((styleObj[pseudoSel] as StyleObjectType) ?? {}),
          ...stateStyles.base,
        } as StyleObjectType;
      }
    }

    // 3. Breakpoint-specific props become @media rules
    // Sort smallest-to-largest so that larger breakpoints always appear later in CSS source
    // order and correctly override smaller ones when multiple queries match (equal specificity).
    const sortedBreakpoints = (
      Object.entries(styles.breakpoints) as [MediaBreakpointType, Record<string, string>][]
    ).sort((a, b) => (BREAKPOINT_MIN_WIDTH[a[0]] ?? 0) - (BREAKPOINT_MIN_WIDTH[b[0]] ?? 0));
    for (const [size, bpProps] of sortedBreakpoints) {
      const minWidth = BREAKPOINT_MIN_WIDTH[size];
      if (minWidth === undefined || Object.keys(bpProps).length === 0) continue;
      styleObj[`@media (min-width: ${minWidth}px)`] = {
        "&": bpProps as StyleObjectType,
      } as StyleObjectType;
    }

    // 4. State props within breakpoints — merge into the @media entries created above
    for (const [pseudoSel, stateStyles] of Object.entries(styles.states)) {
      const sortedStateBreakpoints = (
        Object.entries(stateStyles.breakpoints) as [MediaBreakpointType, Record<string, string>][]
      ).sort((a, b) => (BREAKPOINT_MIN_WIDTH[a[0]] ?? 0) - (BREAKPOINT_MIN_WIDTH[b[0]] ?? 0));
      for (const [size, bpProps] of sortedStateBreakpoints) {
        const minWidth = BREAKPOINT_MIN_WIDTH[size];
        if (minWidth === undefined || Object.keys(bpProps).length === 0) continue;
        const mediaKey = `@media (min-width: ${minWidth}px)`;
        if (!styleObj[mediaKey]) {
          styleObj[mediaKey] = {} as StyleObjectType;
        }
        const mediaObj = styleObj[mediaKey] as StyleObjectType;
        mediaObj[pseudoSel] = {
          ...((mediaObj[pseudoSel] as StyleObjectType) ?? {}),
          ...bpProps,
        } as StyleObjectType;
      }
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

  function mergeInto(target: StyleObjectType, key: string, styles: object) {
    const existing = target[key] as StyleObjectType | undefined;
    if (existing) {
      Object.assign(existing, styles);
    } else {
      target[key] = { ...styles } as StyleObjectType;
    }
  }

  for (const [partKey, styleObj] of Object.entries(styleObjects)) {
    if (partKey === COMPONENT_PART_KEY) {
      // Merge root styles directly into composite
      for (const [selector, value] of Object.entries(styleObj)) {
        if (selector === "&") {
          // Direct CSS props on the root element
          Object.assign(composite, value);
        } else if (selector.startsWith("@media")) {
          // Media query — merge all inner selectors ("&", "&:hover", etc.)
          if (!composite[selector]) {
            composite[selector] = {} as StyleObjectType;
          }
          const mediaObj = composite[selector] as StyleObjectType;
          for (const [innerSel, innerVal] of Object.entries(
            value as StyleObjectType,
          )) {
            mergeInto(mediaObj, innerSel, innerVal as object);
          }
        } else {
          // Pseudo-class selectors like "&:hover" or other nested selectors
          mergeInto(composite, selector, value as object);
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

      for (const [selector, value] of Object.entries(styleObj)) {
        if (selector === "&") {
          // Base CSS props for this part
          mergeInto(composite, selfSel, value as object);
          mergeInto(composite, descSel, value as object);
        } else if (selector.startsWith("@media")) {
          // Breakpoint rules for this part
          if (!composite[selector]) {
            composite[selector] = {} as StyleObjectType;
          }
          const mediaObj = composite[selector] as StyleObjectType;
          for (const [innerSel, innerVal] of Object.entries(
            value as StyleObjectType,
          )) {
            if (innerSel === "&") {
              mergeInto(mediaObj, selfSel, innerVal as object);
              mergeInto(mediaObj, descSel, innerVal as object);
            } else {
              // Pseudo selector inside media for named part — nest under part selectors
              if (!mediaObj[selfSel]) mediaObj[selfSel] = {} as StyleObjectType;
              if (!mediaObj[descSel]) mediaObj[descSel] = {} as StyleObjectType;
              mergeInto(
                mediaObj[selfSel] as StyleObjectType,
                innerSel,
                innerVal as object,
              );
              mergeInto(
                mediaObj[descSel] as StyleObjectType,
                innerSel,
                innerVal as object,
              );
            }
          }
        } else {
          // Pseudo-class selector for named part (e.g. "&:hover") — nest under part selectors
          if (!composite[selfSel]) composite[selfSel] = {} as StyleObjectType;
          if (!composite[descSel]) composite[descSel] = {} as StyleObjectType;
          mergeInto(
            composite[selfSel] as StyleObjectType,
            selector,
            value as object,
          );
          mergeInto(
            composite[descSel] as StyleObjectType,
            selector,
            value as object,
          );
        }
      }
    }
  }

  return composite;
}

// ---------------------------------------------------------------------------
// Responsive "when" → CSS display rules
// ---------------------------------------------------------------------------

/** Breakpoint names in ascending order (matches MediaBreakpointKeys). */
const BREAKPOINT_ORDER: readonly MediaBreakpointType[] = [
  "xs", "sm", "md", "lg", "xl", "xxl",
];

/**
 * Resolves a raw `when` / `when-*` value to a boolean.
 * Returns `undefined` when the value is missing or is a dynamic expression that
 * cannot be evaluated at CSS-generation time.
 */
function resolveStaticWhen(value: string | boolean | undefined): boolean | undefined {
  if (value === undefined) return undefined;
  if (typeof value === "boolean") return value;
  const trimmed = value.trim();
  if (trimmed === "false") return false;
  if (trimmed === "true") return true;
  // Dynamic expression (e.g. "{someVar}") — cannot resolve statically
  return undefined;
}

/**
 * Builds a `StyleObjectType` containing `display` rules derived from the base
 * `when` attribute and its responsive variants (`when-sm`, `when-md`, …).
 *
 * Rules:
 * - A falsy value produces `display: none`.
 * - A truthy value produces `display: revert` (undoes a lower-breakpoint `none`).
 * - An absent or dynamic (expression) value produces nothing.
 *
 * The resulting object can be merged into the composite style object or passed
 * directly to `useStyles`.  For the typical pattern
 *
 *   `<Text when="false" when-md="true" />`
 *
 * the output is:
 *
 * ```
 * { display: "none", "@media (min-width: 768px)": { "&": { display: "revert" } } }
 * ```
 *
 * This is a pure function and safe to unit-test directly.
 */
/**
 * Determines whether a component is visible at ANY breakpoint based on static
 * analysis of `when` and responsive `when-*` attributes.
 *
 * Returns:
 * - `true`  — the component is visible at at least one breakpoint → render with CSS
 * - `false` — the component is provably hidden at ALL breakpoints → skip rendering
 * - `undefined` — cannot determine statically (dynamic expressions) → use runtime check
 *
 * This drives the SSR decision: when `true`, ComponentAdapter renders the component
 * and relies on CSS `display` rules to control per-breakpoint visibility.
 */
export function isVisibleAtAnyBreakpoint(
  when: string | boolean | undefined,
  responsiveWhen: Partial<Record<MediaBreakpointType, string | boolean>> | undefined,
): boolean | undefined {
  const hasResponsiveRules = !!responsiveWhen && Object.keys(responsiveWhen).length > 0;
  const baseWhen = resolveStaticWhen(responsiveWhen?.xs) ?? resolveStaticWhen(when);

  if (!hasResponsiveRules) {
    // No responsive rules — purely based on base `when`
    return baseWhen; // undefined if dynamic, true/false if static
  }

  // Walk all breakpoints: if ANY resolves to true, the component is visible somewhere
  let anyTrue = baseWhen === true;
  let anyStatic = baseWhen !== undefined;

  for (const bp of BREAKPOINT_ORDER) {
    if (bp === "xs") continue;
    const value = resolveStaticWhen(responsiveWhen![bp]);
    if (value === undefined) continue;
    anyStatic = true;
    if (value === true) {
      anyTrue = true;
    }
  }

  if (!anyStatic && baseWhen === undefined) {
    // All values are dynamic → can't determine
    return undefined;
  }

  // If base is undefined (no explicit base `when`) and responsive rules exist,
  // the component is visible at breakpoints without rules (mobile-first default).
  // But buildWhenStyleObject infers base=hidden when the lowest rule is truthy,
  // so we only need to check anyTrue here.
  if (anyTrue) return true;

  // If we got here with a defined base that is false and no responsive rule is true,
  // the component is hidden everywhere.
  if (baseWhen === false) return false;

  // Base is undefined + all responsive rules are false:
  // The default `when` is true (component visible), but responsive overrides hide it
  // at their breakpoints. The component is still visible at non-covered breakpoints.
  return true;
}

export function buildWhenStyleObject(
  when: string | boolean | undefined,
  responsiveWhen: Partial<Record<MediaBreakpointType, string | boolean>> | undefined,
): StyleObjectType {
  const style: StyleObjectType = {};

  const hasResponsiveRules = !!responsiveWhen && Object.keys(responsiveWhen).length > 0;

  // --- Determine the base (xs) display state ---
  // Priority:
  //  1. Explicit `when-xs` attribute
  //  2. Explicit base `when` attribute (static value only)
  //  3. No explicit base, but responsive rules are defined →
  //     infer from the *lowest* statically-resolved responsive rule:
  //       • If that rule is truthy  ("show from bp up") → base must be hidden (display: none)
  //       • If that rule is falsy   ("hide from bp up") → base is visible; no CSS needed
  //     This matches the spec: responsive rules are the exclusive source of truth for
  //     visibility, so breakpoints below the lowest rule follow the same "hide when
  //     no rule matches" default.
  let baseDisplay: boolean | undefined;

  if (responsiveWhen?.xs !== undefined) {
    baseDisplay = resolveStaticWhen(responsiveWhen.xs);
  } else {
    const staticWhen = resolveStaticWhen(when);
    if (staticWhen !== undefined) {
      baseDisplay = staticWhen;
    } else if (hasResponsiveRules) {
      // Find the lowest bp with a statically-known value
      for (const bp of BREAKPOINT_ORDER) {
        if (bp === "xs") continue;
        const value = resolveStaticWhen(responsiveWhen![bp]);
        if (value === undefined) continue; // missing or dynamic — keep searching
        // If the lowest rule is truthy, hide below it; if falsy, visible below (no CSS needed)
        if (value === true) baseDisplay = false;
        break;
      }
    }
  }

  if (baseDisplay === false) {
    style.display = "none";
  } else if (baseDisplay === true) {
    style.display = "revert";
  }

  if (!hasResponsiveRules) return style;

  // --- Walk breakpoints sm..xxl, emitting @media rules when visibility changes ---
  let prevKnown: boolean | undefined = baseDisplay;

  for (const bp of BREAKPOINT_ORDER) {
    if (bp === "xs") continue; // handled as base above

    const value = resolveStaticWhen(responsiveWhen![bp]);
    if (value === undefined) continue; // not set or dynamic — skip

    if (value !== prevKnown) {
      const minWidth = BREAKPOINT_MIN_WIDTH[bp];
      if (minWidth !== undefined) {
        const mediaKey = `@media (min-width: ${minWidth}px)`;
        style[mediaKey] = {
          "&": { display: value ? "revert" : "none" },
        } as StyleObjectType;
      }
    }
    prevKnown = value;
  }

  return style;
}
