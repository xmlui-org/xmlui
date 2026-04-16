import React from "react";
import type { CSSProperties } from "react";

import styles from "./Stack.module.scss";

import type { ComponentDef, ComponentPropertyMetadata } from "../../abstractions/ComponentDefs";
import type { RenderChildFn, LayoutContext } from "../../abstractions/RendererDefs";
import type { AsyncFunction } from "../../abstractions/FunctionDefs";
import type { ValueExtractor } from "../../abstractions/RendererDefs";
import { createChildLayoutContext } from "../../abstractions/layout-context-utils";
import { isComponentDefChildren } from "../../components-core/utils/misc";
import { NotAComponentDefError } from "../../components-core/EngineError";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { createMetadata, dClick, dContextMenu, dInternal } from "../metadata-helpers";
import { useComponentThemeClass } from "../../components-core/theming/utils";
import { DEFAULT_ORIENTATION, Stack, defaultProps } from "./StackNative";
import { wrapComponent } from "../../components-core/wrapComponent";
import { alignmentOptionValues } from "../abstractions";
import { ThemedFlowLayout as FlowLayout, FlowItemWrapper, FlowItemBreak } from "../FlowLayout/FlowLayout";
import { collectResponsiveWidthProps } from "../FlowLayout/flow-layout-utils";
import { COMPONENT_PART_KEY } from "../../components-core/theming/responsive-layout";

const COMP = "Stack";

const starSizeRegex = /^\d*\*$/;
function getStarSizeNumber(input: string): number {
  const numberPart = input.slice(0, -1);
  return numberPart === "" ? 1 : parseInt(numberPart, 10);
}

const HORIZONTAL_ALIGNMENT: ComponentPropertyMetadata = {
  description: "Manages the horizontal content alignment for each child element in the Stack.",
  availableValues: alignmentOptionValues,
  valueType: "string",
  defaultValue: "start",
};
const VERTICAL_ALIGNMENT: ComponentPropertyMetadata = {
  description: "Manages the vertical content alignment for each child element in the Stack.",
  availableValues: alignmentOptionValues,
  valueType: "string",
  defaultValue: "start",
};

const stackMd = createMetadata({
  status: "stable",
  description:
    "`Stack` is the fundamental layout container that organizes child elements in " +
    "configurable horizontal or vertical arrangements. As the most versatile building " +
    "block in XMLUI's layout system, it provides comprehensive alignment, spacing, " +
    "and flow control options that serve as the foundation for all specialized stack variants.",
  props: {
    desktopOnly: {
      description: "Optional boolean property to hide the Stack on desktop devices.",
      valueType: "boolean",
      isInternal: true,
      defaultValue: false,
    },
    gap: {
      description: "Optional size value indicating the gap between child elements.",
      valueType: "string",
      defaultValue: "$gap-normal",
    },
    reverse: {
      description: "Optional boolean property to reverse the order of child elements.",
      valueType: "boolean",
      defaultValue: defaultProps.reverse,
    },
    wrapContent: {
      description:
        "Optional boolean which wraps the content if set to true and the available " +
        "space is not big enough. Works only with horizontal orientations.",
      valueType: "boolean",
      defaultValue: false,
    },
    orientation: {
      description:
        "An optional property that governs the Stack's orientation (whether " +
        "the Stack lays out its children in a row or a column).",
      availableValues: ["horizontal", "vertical"],
      valueType: "string",
      defaultValue: defaultProps.orientation,
    },
    horizontalAlignment: HORIZONTAL_ALIGNMENT,
    verticalAlignment: VERTICAL_ALIGNMENT,
    hoverContainer: {
      ...dInternal("Reserved for future use"),
      defaultValue: defaultProps.hoverContainer,
    },
    visibleOnHover: {
      ...dInternal("Reserved for future use"),
      defaultValue: defaultProps.visibleOnHover,
    },
    scrollStyle: {
      description: `This property determines the scrollbar style. Options: "normal" uses the browser's default ` +
        `scrollbar; "overlay" displays a themed scrollbar that is always visible; "whenMouseOver" shows the ` +
        `scrollbar only when hovering over the scroll container; "whenScrolling" displays the scrollbar ` +
        `only while scrolling is active and fades out after 400ms of inactivity. ` +
        `On mobile/touch devices, this property is ignored and the browser's native scrollbar is always used.`,
      valueType: "string",
      availableValues: ["normal", "overlay", "whenMouseOver", "whenScrolling"],
      defaultValue: defaultProps.scrollStyle,
    },
    showScrollerFade: {
      description:
        "When enabled, displays gradient fade indicators at the top and bottom of the scroll container to visually indicate that more content is available in those directions. " +
        "The fade indicators automatically appear/disappear based on the current scroll position. " +
        "Top fade shows when scrolled down from the top, bottom fade shows when not at the bottom. " +
        "Only works with overlay scrollbar modes (not with 'normal' mode). " +
        "On mobile/touch devices, this property has no effect.",
      valueType: "boolean",
      defaultValue: defaultProps.showScrollerFade,
    },
    itemWidth: {
      description:
        "The default width applied to child elements in the Stack. " +
        "For vertical stacks, defaults to '100%' (children take full width). " +
        "For horizontal stacks, defaults to 'fit-content' (children size to their content).",
      valueType: "string",
    },
    dock: {
      description:
        "When set on a child of a Stack, activates DockPanel layout in the parent Stack. " +
        "`top` — child occupies the top of the remaining area, full width, respects its own `height`. " +
        "`bottom` — child occupies the bottom, full width, respects its own `height`. " +
        "`left` — child occupies the left of the middle row, respects its own `width`. " +
        "`right` — child occupies the right of the middle row, respects its own `width`. " +
        "`stretch` — child fills all remaining middle-row space; its `width` and `height` are ignored. " +
        "Children without a `dock` prop participate as undocked items in the middle row. " +
        "The parent Stack must have a defined height for `bottom`-docked children to anchor correctly.",
      availableValues: ["top", "bottom", "left", "right", "stretch"],
      valueType: "string",
    },
  },
  events: {
    click: dClick(COMP),
    contextMenu: dContextMenu(COMP),
    mounted: {
      description: "Reserved for future use",
      signature: "mounted(): void",
      parameters: {},
      isInternal: true,
    },
  },
  apis: {
    scrollToTop: {
      description: "Scrolls the Stack container to the top. Works when the Stack has an explicit height and overflowY is set to 'scroll'.",
      signature: "scrollToTop(behavior?: 'auto' | 'instant' | 'smooth'): void",
    },
    scrollToBottom: {
      description: "Scrolls the Stack container to the bottom. Works when the Stack has an explicit height and overflowY is set to 'scroll'.",
      signature: "scrollToBottom(behavior?: 'auto' | 'instant' | 'smooth'): void",
    },
    scrollToStart: {
      description: "Scrolls the Stack container to the start (left in LTR, right in RTL). Works when the Stack has an explicit width and overflowX is set to 'scroll'.",
      signature: "scrollToStart(behavior?: 'auto' | 'instant' | 'smooth'): void",
    },
    scrollToEnd: {
      description: "Scrolls the Stack container to the end (right in LTR, left in RTL). Works when the Stack has an explicit width and overflowX is set to 'scroll'.",
      signature: "scrollToEnd(behavior?: 'auto' | 'instant' | 'smooth'): void",
    },
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    [`gap-Stack`]: "$gap-normal",
  },
});

export const StackMd = {
  ...stackMd,
  props: {
    ...stackMd.props,
  },
};

type ThemedStackProps = React.ComponentProps<typeof Stack> & { className?: string };
export const ThemedStack = React.forwardRef<HTMLDivElement, ThemedStackProps>(
  function ThemedStack({ className, ...props }: ThemedStackProps, ref) {
    const themeClass = useComponentThemeClass(stackMd);
    return <Stack {...props} className={`${themeClass}${className ? ` ${className}` : ""}`} ref={ref} />;
  },
);

export const VStackMd = {
  ...StackMd,
  specializedFrom: COMP,
  description: `This component represents a stack rendering its contents vertically.`,
  props: {
    ...stackMd.props,
  },
  apis: {
    ...stackMd.apis,
  },
};

export const HStackMd = {
  ...StackMd,
  specializedFrom: COMP,
  description: `This component represents a stack rendering its contents horizontally.`,
  props: {
    ...stackMd.props,
  },
  apis: {
    ...stackMd.apis,
  },
};

export const CVStackMd = {
  ...StackMd,
  specializedFrom: COMP,
  description:
    `This component represents a stack that renders its contents vertically ` +
    `and aligns that in the center along both axes.`,
  apis: {
    ...stackMd.apis,
  },
};

export const CHStackMd = {
  ...StackMd,
  specializedFrom: COMP,
  description:
    `This component represents a stack that renders its contents horizontally ` +
    `and aligns that in the center along both axes.`,
  apis: {
    ...stackMd.apis,
  },
};

type RenderStackPars = {
  node: any;
  extractValue: ValueExtractor;
  classes?: Record<string, string>;
  onClick?: AsyncFunction;
  onContextMenu?: AsyncFunction;
  onMount?: AsyncFunction;
  renderChild: RenderChildFn;
  orientation: string;
  horizontalAlignment: string;
  verticalAlignment: string;
  scrollStyle?: string;
  showScrollerFade?: boolean;
  wrapContent?: boolean;
  itemWidth?: string;
  containerStyle?: CSSProperties;
  registerComponentApi?: (api: any) => void;
  layoutContext?: LayoutContext;
};

function renderDockLayout({
  node,
  classes,
  onClick,
  onContextMenu,
  onMount,
  renderChild,
  scrollStyle,
  showScrollerFade,
  containerStyle,
  registerComponentApi,
  layoutContext,
}: RenderStackPars) {
  const allChildren = (Array.isArray(node.children) ? node.children : [node.children]).filter(
    (child) => child != null
  );

  // Categorise children by dock value
  const top: any[] = [], bottom: any[] = [], left: any[] = [], right: any[] = [], middle: any[] = [];
  for (const child of allChildren) {
    const dock = (child.props as any)?.dock;
    if (dock === "top") top.push(child);
    else if (dock === "bottom") bottom.push(child);
    else if (dock === "left") left.push(child);
    else if (dock === "right") right.push(child);
    else middle.push(child); // "stretch" and undocked children share the middle row
  }

  // The middle row is always rendered if any bottom children exist (it acts as the flex:1 spacer
  // that pushes bottom children to the bottom of the outer flex column).
  const needsMiddleRow = middle.length > 0 || left.length > 0 || right.length > 0 || bottom.length > 0;

  // Renders a homogeneous group of children — each wrapped in a flex-positioning div
  const renderGroup = (children: any[], wrapStyle: Record<string, any>) =>
    renderChild(children, createChildLayoutContext(layoutContext, {
      type: "DockLayout",
      wrapChild: (_ctx, rendered, metadata) =>
        metadata?.opaque || metadata?.nonVisual
          ? rendered
          : <div style={wrapStyle}>{rendered}</div>,
    }));

  // Middle children are rendered individually so that "stretch" children can receive
  // ignoreLayoutProps while undocked children keep their own width/height props.
  const middleRendered = middle.map((child, index) => {
    const isStretch = (child.props as any)?.dock === "stretch";
    return (
      <React.Fragment key={index}>
        {renderChild(child, createChildLayoutContext(layoutContext, {
          type: "DockLayout",
          ignoreLayoutProps: isStretch
            ? ["width", "minWidth", "maxWidth", "height", "minHeight", "maxHeight"]
            : undefined,
          wrapChild: (_ctx, rendered, metadata) => {
            if (metadata?.opaque || metadata?.nonVisual) return rendered;
            return (
              <div style={isStretch ? { flex: 1, minWidth: 0, minHeight: 0, display: "grid" } : { flexShrink: 0 }}>
                {rendered}
              </div>
            );
          },
        }))}
      </React.Fragment>
    );
  });

  return (
    <Stack
      orientation="vertical"
      scrollStyle={scrollStyle as any}
      showScrollerFade={showScrollerFade}
      classes={classes}
      style={containerStyle}
      onClick={onClick}
      onContextMenu={onContextMenu}
      onMount={onMount}
      registerComponentApi={registerComponentApi}
    >
      {/* Top-docked children in declaration order */}
      {top.length > 0 && renderGroup(top, { flexShrink: 0, width: "100%", minWidth: 0 })}

      {/* Middle row: left | undocked+stretch | right — flex:1 so it consumes leftover height */}
      {needsMiddleRow && (
        <div style={{ display: "flex", flexDirection: "row", flex: 1, minHeight: 0, minWidth: 0 }}>
          {left.length > 0 && renderChild(left, createChildLayoutContext(layoutContext, {
            type: "DockLayout",
            ignoreLayoutProps: ["width", "minWidth", "maxWidth"],
            wrapChild: (ctx, rendered, metadata) => {
              if (metadata?.opaque || metadata?.nonVisual) return rendered;
              const w = ctx.extractValue((ctx.node.props as any)?.width);
              return (
                <div style={{ flexShrink: 0, alignSelf: "stretch", display: "grid", width: w }}>
                  {rendered}
                </div>
              );
            },
          }))}
          {middleRendered}
          {/* Right children reversed so the first-declared sits at the rightmost edge */}
          {right.length > 0 && renderChild(right.slice().reverse(), createChildLayoutContext(layoutContext, {
            type: "DockLayout",
            ignoreLayoutProps: ["width", "minWidth", "maxWidth"],
            wrapChild: (ctx, rendered, metadata) => {
              if (metadata?.opaque || metadata?.nonVisual) return rendered;
              const w = ctx.extractValue((ctx.node.props as any)?.width);
              return (
                <div style={{ flexShrink: 0, alignSelf: "stretch", display: "grid", width: w }}>
                  {rendered}
                </div>
              );
            },
          }))}
        </div>
      )}

      {/* Bottom-docked children reversed so the first-declared sits at the very bottom */}
      {bottom.length > 0 && renderGroup(bottom.slice().reverse(), { flexShrink: 0, width: "100%", minWidth: 0 })}
    </Stack>
  );
}

function renderStack({
  node,
  extractValue,
  classes,
  orientation,
  horizontalAlignment,
  verticalAlignment,
  onClick,
  onContextMenu,
  onMount,
  renderChild,
  scrollStyle,
  showScrollerFade,
  wrapContent,
  itemWidth,
  containerStyle,
  registerComponentApi,
  layoutContext,
}: RenderStackPars) {
  if (!isComponentDefChildren(node.children)) {
    throw new NotAComponentDefError();
  }

  // If any direct child carries a dock prop, delegate to DockPanel layout.
  const allChildren = (Array.isArray(node.children) ? node.children : [node.children]).filter(
    (child) => child != null
  );
  if (allChildren.some((child) => (child.props as any)?.dock != null)) {
      return renderDockLayout({ node, extractValue, classes, orientation, horizontalAlignment, verticalAlignment, onClick, onContextMenu, onMount, renderChild, scrollStyle, showScrollerFade, wrapContent, itemWidth, registerComponentApi, layoutContext });
  }

  // Use FlowLayout when orientation is horizontal and wrapContent is true
  if (orientation === "horizontal" && wrapContent) {
    const columnGap =
      extractValue.asSize(node.props?.gap) ||
      extractValue.asSize("$space-4");
    const rowGap = columnGap; // Use same gap for rows

    return (
      <FlowLayout
        className={classes?.[COMPONENT_PART_KEY]}
        columnGap={columnGap}
        rowGap={rowGap}
        itemWidth={itemWidth}
        verticalAlignment={verticalAlignment || "start"}
        scrollStyle={scrollStyle as any}
        showScrollerFade={showScrollerFade}
        onContextMenu={onContextMenu}
        registerComponentApi={registerComponentApi}
      >
        {renderChild(node.children, createChildLayoutContext(layoutContext, {
          type: "FlowLayout",
          ignoreLayoutProps: ["width", "minWidth", "maxWidth"],
          wrapChild: ({ node, extractValue }, renderedChild, hints) => {
            if (hints?.opaque) {
              return renderedChild;
            }
            if (hints?.nonVisual) {
              return renderedChild;
            }
            // Handle SpaceFiller as flow item break
            if (node.type === "SpaceFiller") {
              return <FlowItemBreak force={true} />;
            }
            const width = extractValue((node.props as any)?.width);
            const minWidth = extractValue((node.props as any)?.minWidth);
            const maxWidth = extractValue((node.props as any)?.maxWidth);
            const responsiveWidthProps = collectResponsiveWidthProps(node.props, extractValue);
            return (
              <FlowItemWrapper
                width={width}
                minWidth={minWidth}
                maxWidth={maxWidth}
                responsiveWidthProps={responsiveWidthProps}
                forceBreak={node.type === "SpaceFiller"}
              >
                {renderedChild}
              </FlowItemWrapper>
            );
          },
        }))}
      </FlowLayout>
    );
  }

  // Default Stack behavior
  // When the user explicitly sets itemWidth, wrap each child in a div so the width applies.
  const hasExplicitItemWidth = node.props?.itemWidth != null;
  return (
    <Stack
      orientation={orientation}
      horizontalAlignment={horizontalAlignment}
      verticalAlignment={verticalAlignment}
      reverse={extractValue(node.props?.reverse)}
      hoverContainer={extractValue(node.props?.hoverContainer)}
      visibleOnHover={extractValue(node.props?.visibleOnHover)}
      scrollStyle={scrollStyle as any}
      showScrollerFade={showScrollerFade}
      classes={classes}
      style={containerStyle}
      onClick={onClick}
      onContextMenu={onContextMenu}
      onMount={onMount}
      registerComponentApi={registerComponentApi}
      desktopOnly={extractValue.asOptionalBoolean(node.props?.desktopOnly)}
    >
      {renderChild(node.children, createChildLayoutContext(layoutContext, {
        type: "Stack",
        orientation,
        itemWidth,
        ...(hasExplicitItemWidth ? {
          wrapChild: (_ctx, renderedChild, hints) => {
            if (hints?.opaque || hints?.nonVisual) return renderedChild;
            if (itemWidth && starSizeRegex.test(itemWidth)) {
              return <div style={{ flex: getStarSizeNumber(itemWidth), flexShrink: 1 }}>{renderedChild}</div>;
            }
            return <div style={{ width: itemWidth, flexShrink: 0 }}>{renderedChild}</div>;
          },
        } : {}),
      }))}
    </Stack>
  );
}

const STACK_EVENTS = {
  click: "onClick",
  contextMenu: "onContextMenu",
  mounted: "onMount",
} as const;

export const stackComponentRenderer = wrapComponent(
  COMP,
  Stack,
  StackMd,
  {
    events: STACK_EVENTS,
    exposeRegisterApi: true,
    customRender(props, { node, extractValue, renderChild, layoutContext }) {
      const orientation = (props.orientation as string) || DEFAULT_ORIENTATION;
      const itemWidth =
        extractValue.asSize(node.props?.itemWidth) ??
        extractValue.asOptionalString(
          node.props?.itemWidth,
          orientation === "vertical" ? "100%" : "fit-content",
        );
      return renderStack({
        node,
        extractValue,
        classes: props.classes,
        orientation,
        horizontalAlignment: props.horizontalAlignment,
        verticalAlignment: props.verticalAlignment,
        scrollStyle: props.scrollStyle,
        showScrollerFade: props.showScrollerFade,
        wrapContent: props.wrapContent,
        itemWidth,
        onClick: props.onClick,
        onContextMenu: props.onContextMenu,
        onMount: props.onMount,
        renderChild,
        registerComponentApi: props.registerComponentApi,
        layoutContext,
      });
    },
  },
);

export const vStackComponentRenderer = wrapComponent(
  "VStack",
  Stack,
  VStackMd,
  {
    events: STACK_EVENTS,
    exposeRegisterApi: true,
    customRender(props, { node, extractValue, renderChild, layoutContext }) {
      const itemWidth =
        extractValue.asSize(node.props?.itemWidth) ??
        extractValue.asOptionalString(node.props?.itemWidth, "100%");
      // When VStack is inside a horizontal Stack and no explicit width is set,
      // expand to fill the available horizontal space.
      const containerStyle =
        layoutContext?.orientation === "horizontal" && node.props?.width == null
          ? { width: "100%", flexShrink: 1 }
          : undefined;
      return renderStack({
        node,
        extractValue,
        classes: props.classes,
        orientation: "vertical",
        horizontalAlignment: props.horizontalAlignment,
        verticalAlignment: props.verticalAlignment,
        scrollStyle: props.scrollStyle,
        showScrollerFade: props.showScrollerFade,
        itemWidth,
        containerStyle,
        onClick: props.onClick,
        onContextMenu: props.onContextMenu,
        onMount: props.onMount,
        renderChild,
        registerComponentApi: props.registerComponentApi,
        layoutContext,
      });
    },
  },
);

export const hStackComponentRenderer = wrapComponent(
  "HStack",
  Stack,
  HStackMd,
  {
    events: STACK_EVENTS,
    exposeRegisterApi: true,
    customRender(props, { node, extractValue, renderChild, layoutContext }) {
      const itemWidth =
        extractValue.asSize(node.props?.itemWidth) ??
        extractValue.asOptionalString(node.props?.itemWidth, "fit-content");
      return renderStack({
        node,
        extractValue,
        classes: props.classes,
        orientation: "horizontal",
        horizontalAlignment: props.horizontalAlignment,
        verticalAlignment: props.verticalAlignment,
        scrollStyle: props.scrollStyle,
        showScrollerFade: props.showScrollerFade,
        wrapContent: props.wrapContent,
        itemWidth,
        onClick: props.onClick,
        onContextMenu: props.onContextMenu,
        onMount: props.onMount,
        renderChild,
        registerComponentApi: props.registerComponentApi,
        layoutContext,
      });
    },
  },
);

export const cvStackComponentRenderer = wrapComponent(
  "CVStack",
  Stack,
  CVStackMd,
  {
    events: STACK_EVENTS,
    exposeRegisterApi: true,
    customRender(props, { node, extractValue, renderChild, layoutContext }) {
      const itemWidth =
        extractValue.asSize(node.props?.itemWidth) ??
        extractValue.asOptionalString(node.props?.itemWidth, "100%");
      // When CVStack is inside a horizontal Stack and no explicit width is set,
      // expand to fill the available horizontal space.
      const containerStyle =
        layoutContext?.orientation === "horizontal" && node.props?.width == null
          ? { width: "100%", flexShrink: 1 }
          : undefined;
      return renderStack({
        node,
        extractValue,
        classes: props.classes,
        orientation: "vertical",
        horizontalAlignment: "center",
        verticalAlignment: "center",
        scrollStyle: props.scrollStyle,
        showScrollerFade: props.showScrollerFade,
        itemWidth,
        containerStyle,
        onClick: props.onClick,
        onContextMenu: props.onContextMenu,
        onMount: props.onMount,
        renderChild,
        registerComponentApi: props.registerComponentApi,
        layoutContext,
      });
    },
  },
);

export const chStackComponentRenderer = wrapComponent(
  "CHStack",
  Stack,
  CHStackMd,
  {
    events: STACK_EVENTS,
    exposeRegisterApi: true,
    customRender(props, { node, extractValue, renderChild, layoutContext }) {
      const itemWidth =
        extractValue.asSize(node.props?.itemWidth) ??
        extractValue.asOptionalString(node.props?.itemWidth, "fit-content");
      return renderStack({
        node,
        extractValue,
        classes: props.classes,
        orientation: "horizontal",
        horizontalAlignment: "center",
        verticalAlignment: "center",
        scrollStyle: props.scrollStyle,
        showScrollerFade: props.showScrollerFade,
        wrapContent: props.wrapContent,
        itemWidth,
        onClick: props.onClick,
        onContextMenu: props.onContextMenu,
        onMount: props.onMount,
        renderChild,
        registerComponentApi: props.registerComponentApi,
        layoutContext,
      });
    },
  },
);
