import {
  type CSSProperties,
  type Dispatch,
  type ForwardedRef,
  forwardRef,
  type ReactNode,
  type SetStateAction,
  createContext,
  useContext,
  useMemo,
  useState,
  useRef,
  useEffect,
} from "react";
import classnames from "classnames";
import { noop } from "lodash-es";

import styles from "./FlowLayout.module.scss";
import { ThemedScroller as Scroller, type ScrollStyle } from "../ScrollViewer/ScrollViewer";

import { useTheme } from "../../components-core/theming/ThemeContext";
import { normalizeCssValueForCalc, getSizeString } from "../../components-core/utils/css-utils";
import { useIsomorphicLayoutEffect } from "../../components-core/utils/hooks";
import { resolveLayoutProps } from "../../components-core/theming/layout-resolver";
import { useAppContext } from "../../components-core/AppContext";
import { COMPONENT_PART_KEY } from "../../components-core/theming/responsive-layout";
import { useStyles } from "../../components-core/theming/StyleContext";
import type { StyleObjectType } from "../../components-core/theming/StyleRegistry";
import type { MediaBreakpointType } from "../../abstractions/AppContextDefs";

type FlowItemProps = {
  children: ReactNode;
  width?: string | number;
  minWidth?: string | number;
  maxWidth?: string | number;
  responsiveWidthProps?: Record<string, any>;
  forceBreak?: boolean;
};

/**
 * Breakpoint min-widths (px) matching the framework's responsive system.
 * "xs" is the base with no media query.
 */
const BREAKPOINT_MIN_WIDTH: Record<string, number> = {
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
  xxl: 1400,
};

const BREAKPOINT_ORDER: MediaBreakpointType[] = ["sm", "md", "lg", "xl", "xxl"];

/**
 * Computes the auto-inferred width for a given percentage at a breakpoint tier.
 * Reproduces the original sizeIndex-based percentage logic as pure functions.
 *
 * - xs/sm  (tier 0-1): multiply by 4, clamp to 100%
 * - md     (tier 2):   multiply by 3, snap 50-75% → 50%, >75% → 100%
 * - lg+    (tier 3+):  use original value capped at 100%
 */
function inferredPercentageWidth(percNumber: number, tier: number): string {
  if (tier <= 1) {
    // xs / sm
    const scaled = percNumber * 4;
    return scaled > 50 ? "100%" : `min(${scaled}%, 100%)`;
  }
  if (tier === 2) {
    // md
    const scaled = percNumber * 3;
    if (scaled >= 50 && scaled <= 75) return "50%";
    if (scaled > 75) return "100%";
    return `min(${scaled}%, 100%)`;
  }
  // lg, xl, xxl
  return `min(${percNumber}%, 100%)`;
}

/**
 * Builds a `StyleObjectType` with @media rules for the flow item width,
 * so the browser applies the correct width on first paint (no flash).
 */
function buildFlowItemStyleObject(
  baseWidth: string | number | undefined,
  baseMinWidth: string | number | undefined,
  baseMaxWidth: string | number | undefined,
  responsiveProps: Record<string, any> | undefined,
  columnGap: string,
  isIntrinsicSizing: boolean,
): StyleObjectType {
  if (isIntrinsicSizing) {
    return { "&": { width: baseWidth } as StyleObjectType };
  }

  const hasResponsiveWidth = responsiveProps &&
    Object.keys(responsiveProps).some((k) => k.startsWith("width-"));

  const baseStr = baseWidth != null ? String(baseWidth) : undefined;
  const isBasePercentage = baseStr?.endsWith("%");

  // --- Helper to produce the CSS width value for a given raw width
  function toWidthValue(raw: string | number | undefined, gap: string): string | undefined {
    if (raw == null) return undefined;
    const s = String(raw);
    if (s.endsWith("%")) return `min(${s}, 100%)`;
    return `min(calc(${s} + ${gap}), 100%)`;
  }

  // --- Collect widths per breakpoint tier using mobile-first cascade
  // --- Build the base (xs) rule
  const result: StyleObjectType = {};
  const baseRule: Record<string, any> = {};

  // Dimension properties that change per breakpoint
  function addDimProps(
    target: Record<string, any>,
    w: string | number | undefined,
    minW: string | number | undefined,
    maxW: string | number | undefined,
    gap: string,
  ) {
    const wv = toWidthValue(w, gap);
    if (wv != null) target.width = wv;
    if (minW != null) target["min-width"] = String(minW);
    if (maxW != null) target["max-width"] = String(maxW);
  }

  if (hasResponsiveWidth) {
    // --- Explicit responsive widths: base rule uses the base width as-is
    addDimProps(baseRule, baseWidth, baseMinWidth, baseMaxWidth, columnGap);
    if (Object.keys(baseRule).length > 0) {
      result["&"] = baseRule as StyleObjectType;
    }

    // Produce @media for each breakpoint with mobile-first cascade
    let currentWidth = baseWidth;
    let currentMinWidth = baseMinWidth;
    let currentMaxWidth = baseMaxWidth;
    for (const bp of BREAKPOINT_ORDER) {
      const wKey = `width-${bp}`;
      const minKey = `minWidth-${bp}`;
      const maxKey = `maxWidth-${bp}`;
      let changed = false;
      if (responsiveProps![wKey] != null) { currentWidth = responsiveProps![wKey]; changed = true; }
      if (responsiveProps![minKey] != null) { currentMinWidth = responsiveProps![minKey]; changed = true; }
      if (responsiveProps![maxKey] != null) { currentMaxWidth = responsiveProps![maxKey]; changed = true; }
      if (changed) {
        const bpRule: Record<string, any> = {};
        addDimProps(bpRule, currentWidth, currentMinWidth, currentMaxWidth, columnGap);
        if (Object.keys(bpRule).length > 0) {
          result[`@media (min-width: ${BREAKPOINT_MIN_WIDTH[bp]}px)`] = {
            "&": bpRule,
          } as StyleObjectType;
        }
      }
    }
  } else if (isBasePercentage) {
    // --- Auto-inferred responsive widths from percentage
    const percNumber = parseFloat(baseStr!);

    // xs tier (base — no media query)
    baseRule.width = inferredPercentageWidth(percNumber, 0);
    if (baseMinWidth != null) baseRule["min-width"] = String(baseMinWidth);
    if (baseMaxWidth != null) baseRule["max-width"] = String(baseMaxWidth);
    result["&"] = baseRule as StyleObjectType;

    // sm tier (≥576px) — same formula as xs (tier ≤ 1)
    // (identical to base, skip unless something changes in the future)

    // md tier (≥768px)
    const mdWidth = inferredPercentageWidth(percNumber, 2);
    if (mdWidth !== baseRule.width) {
      result[`@media (min-width: ${BREAKPOINT_MIN_WIDTH.md}px)`] = {
        "&": { width: mdWidth },
      } as StyleObjectType;
    }

    // lg+ tier (≥992px)
    const lgWidth = inferredPercentageWidth(percNumber, 3);
    if (lgWidth !== mdWidth) {
      result[`@media (min-width: ${BREAKPOINT_MIN_WIDTH.lg}px)`] = {
        "&": { width: lgWidth },
      } as StyleObjectType;
    }
  } else {
    // --- Fixed width (px, rem, etc.)
    addDimProps(baseRule, baseWidth, baseMinWidth, baseMaxWidth, columnGap);
    if (Object.keys(baseRule).length > 0) {
      result["&"] = baseRule as StyleObjectType;
    }
  }

  return result;
}

const resolvedCssVars: Record<string, any> = {};

interface IFlowLayoutContext {
  rowGap: string | number;
  columnGap: string | number;
  itemWidth: string;
  setNumberOfChildren: Dispatch<SetStateAction<number>>;
}

const FlowLayoutContext = createContext<IFlowLayoutContext>({
  rowGap: 0,
  columnGap: 0,
  itemWidth: "100%",
  setNumberOfChildren: noop,
});

export const FlowItemBreak = ({ force }: { force?: boolean }) => (
  <div className={classnames(styles.break, { [styles.forceBreak]: force })} />
);

export const FlowItemWrapper = forwardRef(function FlowItemWrapper(
  { children, forceBreak, ...restProps }: FlowItemProps,
  ref: any,
) {
  const { rowGap, columnGap, itemWidth, setNumberOfChildren } = useContext(FlowLayoutContext);
  const { appGlobals } = useAppContext();
  useIsomorphicLayoutEffect(() => {
    setNumberOfChildren((prev) => prev + 1);
    return () => {
      setNumberOfChildren((prev) => prev - 1);
    };
  }, [setNumberOfChildren]);
  const { root } = useTheme();
  const _width = restProps.width || itemWidth;
  const _minWidth = restProps.minWidth || undefined;
  const _maxWidth = restProps.maxWidth || undefined;

  // Check if width is an intrinsic sizing keyword that shouldn't go through layout resolution
  const isIntrinsicWidth = typeof _width === "string" && 
    (_width === "fit-content" || 
     _width === "min-content" || 
     _width === "max-content" ||
     _width === "auto");

  const {
    width = _width,
    minWidth,
    maxWidth,
    flex,
  } = useMemo(() => {
    // Skip layout resolution for intrinsic sizing keywords
    if (isIntrinsicWidth) {
      return {
        width: _width,
        minWidth: _minWidth,
        maxWidth: _maxWidth,
      };
    }
    
    return (
      resolveLayoutProps(
        { width: _width, maxWidth: _maxWidth, minWidth: _minWidth },
        {
          type: "Stack",
          orientation: "horizontal",
        },
        appGlobals?.disableInlineStyle,
      ).cssProps || {}
    );
  }, [_maxWidth, _minWidth, _width, appGlobals, isIntrinsicWidth]);

  const resolvedWidth = useMemo(() => {
    if (width && typeof width === "string" && width.startsWith("var(")) {
      if (!resolvedCssVars[width]) {
        const varName = width.substring(4, width.length - 1);
        const resolved = getComputedStyle(root || document.body).getPropertyValue(varName);
        resolvedCssVars[width] = resolved || _width;
      }
      return resolvedCssVars[width];
    }
    return width || _width;
  }, [_width, root, width]);
  
  // Check if width is an intrinsic sizing keyword that can't be used in calc()
  const isIntrinsicSizing = typeof resolvedWidth === "string" && 
    (resolvedWidth === "fit-content" || 
     resolvedWidth === "min-content" || 
     resolvedWidth === "max-content" ||
     resolvedWidth === "auto");

  const _columnGap = normalizeCssValueForCalc(columnGap);

  // --- Build a CSS style object with @media rules for responsive dimensions
  // --- This avoids the flash caused by JS-based sizeIndex detection.
  const responsiveStyleObj = useMemo(
    () =>
      buildFlowItemStyleObject(
        resolvedWidth,
        minWidth,
        maxWidth,
        restProps.responsiveWidthProps,
        _columnGap,
        isIntrinsicSizing,
      ),
    [resolvedWidth, minWidth, maxWidth, restProps.responsiveWidthProps, _columnGap, isIntrinsicSizing],
  );

  const responsiveClassName = useStyles(responsiveStyleObj);

  const isStarSizing = flex !== undefined;

  const outerWrapperStyle: CSSProperties = {
    paddingBottom: rowGap,
    flex,
  };

  if (isStarSizing) {
    outerWrapperStyle.width = "100%";
    outerWrapperStyle.minWidth = minWidth || "1px";
  }

  return (
    <>
      <div
        style={{ ...outerWrapperStyle, paddingRight: _columnGap }}
        className={classnames(styles.flowItem, responsiveClassName, {
          [styles.starSized]: isStarSizing,
        })}
        ref={ref}
      >
        {children}
      </div>
      {isStarSizing && <FlowItemBreak />}
    </>
  );
});

type FlowLayoutProps = {
  style?: CSSProperties;
  className?: string;
  classes?: Record<string, string>;
  columnGap: string | number;
  rowGap: string | number;
  itemWidth?: string;
  verticalAlignment?: string;
  scrollStyle?: ScrollStyle;
  showScrollerFade?: boolean;
  children: ReactNode;
  onContextMenu?: any;
  registerComponentApi?: (api: any) => void;
};

export const defaultProps: Pick<FlowLayoutProps, "columnGap" | "rowGap" | "itemWidth" | "verticalAlignment" | "scrollStyle" | "showScrollerFade"> = {
  columnGap: "$gap-normal",
  rowGap: "$gap-normal",
  itemWidth: "100%",
  verticalAlignment: "start",
  scrollStyle: "normal" as ScrollStyle,
  showScrollerFade: true,
};

export const FlowLayout = forwardRef(function FlowLayout(
  {
    style,
    className,
    classes,
    columnGap = 0,
    rowGap = 0,
    itemWidth = defaultProps.itemWidth,
    verticalAlignment = defaultProps.verticalAlignment,
    scrollStyle = defaultProps.scrollStyle,
    showScrollerFade = defaultProps.showScrollerFade,
    children,
    onContextMenu,
    registerComponentApi,
    ...rest
  }: FlowLayoutProps,
  forwardedRef: ForwardedRef<HTMLDivElement>,
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [numberOfChildren, setNumberOfChildren] = useState(0);
  const safeColumnGap = numberOfChildren === 1 ? 0 : columnGap;

  // Register API methods
  useEffect(() => {
    if (registerComponentApi) {
      registerComponentApi({
        scrollToTop: (behavior: ScrollBehavior = "instant") => {
          if (containerRef.current) {
            containerRef.current.scrollTo({
              top: 0,
              behavior,
            });
          }
        },
        scrollToBottom: (behavior: ScrollBehavior = "instant") => {
          if (containerRef.current) {
            containerRef.current.scrollTo({
              top: containerRef.current.scrollHeight,
              behavior,
            });
          }
        },
      });
    }
  }, [registerComponentApi]);

  // --- Be smart about rowGap
  const _rowGap = getSizeString(rowGap);
  const _columnGap = getSizeString(safeColumnGap);

  // --- Determine alignment class
  const alignmentClass = useMemo(() => {
    if (verticalAlignment === "center") return styles.alignItemsCenter;
    if (verticalAlignment === "end") return styles.alignItemsEnd;
    return styles.alignItemsStart;
  }, [verticalAlignment]);

  const innerStyle = useMemo(
    () => ({
      // We put a negative margin on the container to fill the space for the row's last columnGap
      marginRight: `calc(-1 * ${_columnGap})`,
      marginBottom: `calc(-1 * ${_rowGap})`,
    }),
    [_columnGap, _rowGap],
  );

  const flowLayoutContextValue = useMemo(() => {
    return {
      rowGap: _rowGap,
      columnGap: _columnGap,
      itemWidth,
      setNumberOfChildren,
    };
  }, [_columnGap, _rowGap, itemWidth]);
  return (
    <FlowLayoutContext.Provider value={flowLayoutContextValue}>
      <Scroller
        style={style}
        className={classnames(classes?.[COMPONENT_PART_KEY], className)}
        ref={containerRef}
        scrollStyle={scrollStyle}
        showScrollerFade={showScrollerFade}
        onContextMenu={onContextMenu}
        {...rest}
      >
        <div className={styles.outer}>
          <div
            className={classnames(styles.flowContainer, styles.horizontal, alignmentClass)}
            style={innerStyle}
          >
            {children}
          </div>
        </div>
      </Scroller>
    </FlowLayoutContext.Provider>
  );
});
