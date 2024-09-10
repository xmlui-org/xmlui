import {CSSProperties, Dispatch, forwardRef, ReactNode, SetStateAction} from "react";
import { createContext, useContext, useMemo, useState } from "react";
import styles from "./FlowLayout.module.scss";
import { createComponentRenderer } from "@components-core/renderers";
import type { ComponentDef } from "@abstractions/ComponentDefs";
import { isComponentDefChildren } from "@components-core/utils/misc";
import type { ComponentDescriptor } from "@abstractions/ComponentDescriptorDefs";
import { NotAComponentDefError } from "@components-core/EngineError";
import classnames from "@components-core/utils/classnames";
import { compileLayout } from "../../parsers/style-parser/style-compiler";
import { useTheme } from "@components-core/theming/ThemeContext";
import { parseScssVar } from "@components-core/theming/themeVars";
import { desc } from "@components-core/descriptorHelper";
import { noop } from "lodash-es";
import { normalizeCssValueForCalc, getSizeString } from "@components-core/utils/css-utils";
import { useIsomorphicLayoutEffect, useMediaQuery } from "@components-core/utils/hooks";

// =====================================================================================================================
// React FlowLayout component implementation

type FlowItemProps = {
  children: ReactNode;
  width?: string | number;
  minWidth?: string | number;
  maxWidth?: string | number;
};

const resolvedCssVars: Record<string, any> = {};

interface IFlowLayoutContext {
  rowGap: string | number;
  columnGap: string | number;
  setNumberOfChildren: Dispatch<SetStateAction<number>>;
}

const FlowLayoutContext = createContext<IFlowLayoutContext>({
  rowGap: 0,
  columnGap: 0,
  setNumberOfChildren: noop,
});

const FlowItemWrapper = forwardRef(function FlowItemWrapper({ children, ...restProps }: FlowItemProps, ref: any) {
  const { rowGap, columnGap, setNumberOfChildren } = useContext(FlowLayoutContext);
  useIsomorphicLayoutEffect(() => {
    setNumberOfChildren((prev) => prev + 1);
    return () => {
      setNumberOfChildren((prev) => prev - 1);
    };
  }, [setNumberOfChildren]);
  const { activeTheme, root } = useTheme();
  const _width = restProps.width || "100%";
  const _minWidth = restProps.minWidth || undefined;
  const _maxWidth = restProps.maxWidth || undefined;

  const {
    width = _width,
    minWidth,
    maxWidth,
    flex,
  } = useMemo(() => {
    return (
      compileLayout({ width: _width, maxWidth: _maxWidth, minWidth: _minWidth }, activeTheme.themeVars, {
        type: "Stack",
        orientation: "horizontal",
      }).cssProps || {}
    );
  }, [_maxWidth, _minWidth, _width, activeTheme.themeVars]);

  const resolvedWidth = useMemo(() => {
    if (width && typeof width === "string" && width.startsWith("var(")) {
      if (!resolvedCssVars[width]) {
        const varName = width.substring(4, width.length - 1);
        const resolved = getComputedStyle(root!).getPropertyValue(varName);
        resolvedCssVars[width] = resolved || _width;
      }
      return resolvedCssVars[width];
    }
    return width || _width;
  }, [_width, root, width]);

  const isWidthPercentage = typeof resolvedWidth === "string" && resolvedWidth.endsWith("%");

  const _columnGap = normalizeCssValueForCalc(columnGap);
  const isViewportPhone = useMediaQuery("(max-width: 420px)"); //TODO useContainerQuery
  const isViewportTablet = useMediaQuery("(max-width: 800px)");

  const outerWrapperStyle: CSSProperties = {
    minWidth,
    maxWidth,
    width: isWidthPercentage
      ? `min(${width} * ${isViewportPhone ? "8" : isViewportTablet ? "4" : "1"}, 100%)`
      : `min(calc(${width} + ${_columnGap}), 100%)`,
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
      <div style={outerWrapperStyle} ref={ref}>
        <div style={{ paddingRight: _columnGap }} className={styles.flowItem}>
          {children}
        </div>
      </div>
      {isStarSizing && <div className={styles.break} />}
    </>
  );
});

type FlowLayoutProps = {
  style?: CSSProperties;
  columnGap: string | number;
  rowGap: string | number;
  children: ReactNode;
};

export function FlowLayout({ style, columnGap, rowGap, children }: FlowLayoutProps) {
  const [numberOfChildren, setNumberOfChildren] = useState(0);
  const safeColumnGap = numberOfChildren === 1 ? 0 : columnGap;

  // --- Be smart about rowGap
  const _rowGap = getSizeString(rowGap);
  const _columnGap = getSizeString(safeColumnGap);

  const outerStyle: CSSProperties = {
    overflow: "auto",
    ...style,
  };
  const innerStyle = {
    // We put a negative margin on the container to fill the space for the row's last columnGap
    marginRight: `calc(-1 * ${_columnGap})`,
    marginBottom: `calc(-1 * ${_rowGap})`,
  };
  const flowLayoutContextValue = useMemo(() => {
    return {
      rowGap: _rowGap,
      columnGap: _columnGap,
      setNumberOfChildren,
    };
  }, [_columnGap, _rowGap]);
  return (
    <FlowLayoutContext.Provider value={flowLayoutContextValue}>
      <div style={outerStyle}>
        <div style={{ overflow: "hidden" }}>
          <div className={classnames(styles.flowContainer, styles.horizontal)} style={innerStyle}>
            {children}
          </div>
        </div>
      </div>
    </FlowLayoutContext.Provider>
  );
}

// =====================================================================================================================
// XMLUI FlowLayout component definition

/**
 * This layout component is used to position content in rows with an auto wrapping feature:
 * if the length of the items exceed the available space the layout will wrap into a new line.
 *
 * For details on how to work with \`FlowLayout\` (like sizing children), see 
 * [this guide](../learning/using-components/layout-components.mdx#flowlayout).
 */
export interface FlowLayoutComponentDef extends ComponentDef<"FlowLayout"> {
  props: {
    /** @descriptionRef */
    gap?: string | number;
    /** @descriptionRef */
    columnGap?: string | number;
    /** @descriptionRef */
    rowGap?: string | number;
    /** @descriptionRef */
    shadow?: string;
  };
}

export const FlowLayoutMd: ComponentDescriptor<FlowLayoutComponentDef> = {
  displayName: "FlowLayout",
  description: "",
  props: {
    columnGap: desc("Gap between flow layout items in a row"),
    rowGap: desc("Gap between flow layout rows"),
  },
  themeVars: parseScssVar(styles.themeVars),
};

export const flowLayoutComponentRenderer = createComponentRenderer<FlowLayoutComponentDef>(
  "FlowLayout",
  ({ node, renderChild, layoutCss, extractValue }) => {
    if (!isComponentDefChildren(node.children)) {
      throw new NotAComponentDefError();
    }
    // Only calculate column gaps if there are more than 1 child
    const columnGap = extractValue.asSize(node.props?.columnGap) || layoutCss.gap || 0;
    const rowGap = extractValue.asSize(node.props?.rowGap) || layoutCss.gap || 0;
    return (
      <FlowLayout style={layoutCss} columnGap={columnGap} rowGap={rowGap}>
        {renderChild(node.children, {
          wrapChild: ({ node, extractValue }, renderedChild, hints) => {
            if (hints?.opaque) {
              return renderedChild;
            }
            // Handle SpaceFiller as a * width item
            const width = node.type === "SpaceFiller" ? "*" : extractValue(node.props?.width);
            return (
              <FlowItemWrapper
                width={width}
                minWidth={extractValue(node.props?.minWidth)}
                maxWidth={extractValue(node.props?.maxWidth)}
              >
                {renderedChild}
              </FlowItemWrapper>
            );
          },
        })}
      </FlowLayout>
    );
  },
  FlowLayoutMd
);
