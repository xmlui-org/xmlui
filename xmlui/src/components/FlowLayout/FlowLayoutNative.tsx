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
import { useIsomorphicLayoutEffect, useMediaQuery } from "../../components-core/utils/hooks";
import { resolveLayoutProps } from "../../components-core/theming/layout-resolver";
import { useAppContext } from "../../components-core/AppContext";

type FlowItemProps = {
  children: ReactNode;
  width?: string | number;
  minWidth?: string | number;
  maxWidth?: string | number;
  forceBreak?: boolean;
};

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
  const { mediaSize, appGlobals } = useAppContext();
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
      // --- New layout resolution
      resolveLayoutProps(
        { width: _width, maxWidth: _maxWidth, minWidth: _minWidth },
        {
          type: "Stack",
          orientation: "horizontal",
        },
        appGlobals?.disableInlineStyle,
      ).cssProps || {}

      // --- Old layout resolution
      // compileLayout(
      //   { width: _width, maxWidth: _maxWidth, minWidth: _minWidth },
      //   activeTheme.themeVars,
      //   {
      //     type: "Stack",
      //     orientation: "horizontal",
      //   },
      // ).cssProps || {}
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

  const isWidthPercentage = typeof resolvedWidth === "string" && resolvedWidth.endsWith("%");
  
  // Check if width is an intrinsic sizing keyword that can't be used in calc()
  const isIntrinsicSizing = typeof resolvedWidth === "string" && 
    (resolvedWidth === "fit-content" || 
     resolvedWidth === "min-content" || 
     resolvedWidth === "max-content" ||
     resolvedWidth === "auto");

  const _columnGap = normalizeCssValueForCalc(columnGap);

  let responsiveWidth;
  if (isIntrinsicSizing) {
    // Intrinsic sizing keywords should be used as-is without calc()
    responsiveWidth = resolvedWidth;
  } else if (isWidthPercentage) {
    const percNumber = parseFloat(resolvedWidth);
    if (mediaSize.sizeIndex <= 1) {
      let percentage = percNumber * 4;
      if (percentage > 50) {
        responsiveWidth = `100%`;
      } else {
        responsiveWidth = `min(${percentage}%, 100%)`;
      }
    } else if (mediaSize.sizeIndex <= 2) {
      let percentage = percNumber * 3;
      if (percentage >= 50 && percentage <= 75) {
        responsiveWidth = `50%`;
      } else if (percentage > 75) {
        responsiveWidth = `100%`;
      } else {
        responsiveWidth = `min(${percentage}%, 100%)`;
      }
    } else {
      responsiveWidth = `min(${width}, 100%)`;
    }
  } else {
    responsiveWidth = `min(calc(${width} + ${_columnGap}), 100%)`;
  }

  const outerWrapperStyle: CSSProperties = {
    minWidth,
    maxWidth,
    width: responsiveWidth,
    paddingBottom: rowGap,
    flex,
  };

  const isStarSizing = flex !== undefined;
  if (isStarSizing) {
    //star sizing
    outerWrapperStyle.width = "100%";
    outerWrapperStyle.minWidth = minWidth || "1px";
  }
  return (
    <>
      <div
        style={{ ...outerWrapperStyle, paddingRight: _columnGap }}
        className={classnames(styles.flowItem, {
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
        className={className}
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
