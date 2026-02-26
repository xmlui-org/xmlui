import React from "react";

import styles from "./Stack.module.scss";

import type { ComponentDef, ComponentPropertyMetadata } from "../../abstractions/ComponentDefs";
import type { RenderChildFn } from "../../abstractions/RendererDefs";
import type { AsyncFunction } from "../../abstractions/FunctionDefs";
import type { ValueExtractor } from "../../abstractions/RendererDefs";
import { createComponentRenderer } from "../../components-core/renderers";
import { isComponentDefChildren } from "../../components-core/utils/misc";
import { NotAComponentDefError } from "../../components-core/EngineError";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { createMetadata, dClick, dContextMenu, dInternal } from "../metadata-helpers";
import { useComponentThemeClass } from "../../components-core/theming/utils";
import { DEFAULT_ORIENTATION, Stack, defaultProps } from "./StackNative";
import { alignmentOptionValues } from "../abstractions";
import { ThemedFlowLayout as FlowLayout, FlowItemWrapper, FlowItemBreak } from "../FlowLayout/FlowLayout";

const COMP = "Stack";

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
        `only while scrolling is active and fades out after 400ms of inactivity.`,
      valueType: "string",
      availableValues: ["normal", "overlay", "whenMouseOver", "whenScrolling"],
      defaultValue: defaultProps.scrollStyle,
    },
    showScrollerFade: {
      description:
        "When enabled, displays gradient fade indicators at the top and bottom of the scroll container to visually indicate that more content is available in those directions. " +
        "The fade indicators automatically appear/disappear based on the current scroll position. " +
        "Top fade shows when scrolled down from the top, bottom fade shows when not at the bottom. " +
        "Only works with overlay scrollbar modes (not with 'normal' mode).",
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
});

export const StackMd = {
  ...stackMd,
  props: {
    ...stackMd.props,
  },
};
type StackComponentDef = ComponentDef<typeof StackMd>;

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
type CVStackComponentDef = ComponentDef<typeof CVStackMd>;

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
type CHStackComponentDef = ComponentDef<typeof CHStackMd>;

type RenderStackPars = {
  node: any;
  extractValue: ValueExtractor;
  className?: string;
  lookupEventHandler: (
    eventName: keyof NonNullable<StackComponentDef["events"]>,
  ) => AsyncFunction | undefined;
  renderChild: RenderChildFn;
  orientation: string;
  horizontalAlignment: string;
  verticalAlignment: string;
  scrollStyle?: string;
  showScrollerFade?: boolean;
  wrapContent?: boolean;
  itemWidth?: string;
  registerComponentApi?: (api: any) => void;
};

function renderStack({
  node,
  extractValue,
  className,
  orientation,
  horizontalAlignment,
  verticalAlignment,
  lookupEventHandler,
  renderChild,
  scrollStyle,
  showScrollerFade,
  wrapContent,
  itemWidth,
  registerComponentApi,
}: RenderStackPars) {
  if (!isComponentDefChildren(node.children)) {
    throw new NotAComponentDefError();
  }

  // Use FlowLayout when orientation is horizontal and wrapContent is true
  if (orientation === "horizontal" && wrapContent) {
    const columnGap =
      extractValue.asSize(node.props?.gap) ||
      extractValue.asSize("$space-4");
    const rowGap = columnGap; // Use same gap for rows

    return (
      <FlowLayout
        className={className}
        columnGap={columnGap}
        rowGap={rowGap}
        itemWidth={itemWidth}
        verticalAlignment={verticalAlignment || "start"}
        scrollStyle={scrollStyle as any}
        showScrollerFade={showScrollerFade}
        onContextMenu={lookupEventHandler("contextMenu")}
        registerComponentApi={registerComponentApi}
      >
        {renderChild(node.children, {
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
            return (
              <FlowItemWrapper
                width={width}
                minWidth={minWidth}
                maxWidth={maxWidth}
                forceBreak={node.type === "SpaceFiller"}
              >
                {renderedChild}
              </FlowItemWrapper>
            );
          },
        })}
      </FlowLayout>
    );
  }

  // Default Stack behavior
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
      className={className}
      onClick={lookupEventHandler("click")}
      onContextMenu={lookupEventHandler("contextMenu")}
      onMount={lookupEventHandler("mounted")}
      registerComponentApi={registerComponentApi}
      desktopOnly={extractValue.asOptionalBoolean(node.props?.desktopOnly)}
    >
      {renderChild(node.children, {
        type: "Stack",
        orientation,
        itemWidth,
      })}
    </Stack>
  );
}

export const stackComponentRenderer = createComponentRenderer(
  COMP,
  StackMd,
  ({ node, extractValue, renderChild, className, lookupEventHandler, registerComponentApi }) => {
    const orientation = extractValue(node.props?.orientation) || DEFAULT_ORIENTATION;
    const horizontalAlignment = extractValue(node.props?.horizontalAlignment);
    const verticalAlignment = extractValue(node.props?.verticalAlignment);
    const scrollStyle = extractValue.asOptionalString(node.props.scrollStyle, defaultProps.scrollStyle);
    const showScrollerFade = extractValue.asOptionalBoolean(node.props.showScrollerFade);
    const wrapContent = extractValue.asOptionalBoolean(node.props.wrapContent, false);
    const itemWidth = extractValue.asOptionalString(
      node.props?.itemWidth,
      orientation === "vertical" ? "100%" : "fit-content"
    );
    return renderStack({
      node,
      extractValue,
      className,
      orientation,
      horizontalAlignment,
      verticalAlignment,
      scrollStyle,
      showScrollerFade,
      wrapContent,
      itemWidth,
      lookupEventHandler,
      renderChild,
      registerComponentApi,
    });
  },
);

export const vStackComponentRenderer = createComponentRenderer(
  "VStack",
  VStackMd,
  ({ node, extractValue, renderChild, className, lookupEventHandler, registerComponentApi }) => {
    const horizontalAlignment = extractValue(node.props?.horizontalAlignment);
    const verticalAlignment = extractValue(node.props?.verticalAlignment);
    const scrollStyle = extractValue.asOptionalString(node.props.scrollStyle, defaultProps.scrollStyle);
    const itemWidth = extractValue.asOptionalString(node.props?.itemWidth, "100%");
    return renderStack({
      node,
      extractValue,
      className,
      lookupEventHandler,
      renderChild,
      orientation: "vertical",
      horizontalAlignment,
      verticalAlignment,
      scrollStyle,
      itemWidth,
      registerComponentApi,
    });
  },
);

export const hStackComponentRenderer = createComponentRenderer(
  "HStack",
  HStackMd,
  ({ node, extractValue, renderChild, className, lookupEventHandler, registerComponentApi }) => {
    const horizontalAlignment = extractValue(node.props?.horizontalAlignment);
    const verticalAlignment = extractValue(node.props?.verticalAlignment);
    const scrollStyle = extractValue.asOptionalString(node.props.scrollStyle, defaultProps.scrollStyle);
    const wrapContent = extractValue.asOptionalBoolean(node.props.wrapContent, false);
    const itemWidth = extractValue.asOptionalString(node.props?.itemWidth, "fit-content");
    return renderStack({
      node,
      extractValue,
      className,
      lookupEventHandler,
      renderChild,
      orientation: "horizontal",
      horizontalAlignment,
      verticalAlignment,
      scrollStyle,
      wrapContent,
      itemWidth,
      registerComponentApi,
    });
  },
);

export const cvStackComponentRenderer = createComponentRenderer(
  "CVStack",
  CVStackMd,
  ({ node, extractValue, renderChild, className, lookupEventHandler, registerComponentApi }) => {
    const scrollStyle = extractValue.asOptionalString(node.props.scrollStyle, defaultProps.scrollStyle);
    const itemWidth = extractValue.asOptionalString(node.props?.itemWidth, "100%");
    return renderStack({
      node,
      extractValue,
      className,
      lookupEventHandler,
      renderChild,
      orientation: "vertical",
      horizontalAlignment: "center",
      verticalAlignment: "center",
      scrollStyle,
      itemWidth,
      registerComponentApi,
    });
  },
);

export const chStackComponentRenderer = createComponentRenderer(
  "CHStack",
  CHStackMd,
  ({ node, extractValue, renderChild, className, lookupEventHandler, registerComponentApi }) => {
    const scrollStyle = extractValue.asOptionalString(node.props.scrollStyle, defaultProps.scrollStyle);
    const wrapContent = extractValue.asOptionalBoolean(node.props.wrapContent, false);
    const itemWidth = extractValue.asOptionalString(node.props?.itemWidth, "fit-content");
    return renderStack({
      node,
      extractValue,
      className,
      lookupEventHandler,
      renderChild,
      orientation: "horizontal",
      horizontalAlignment: "center",
      verticalAlignment: "center",
      scrollStyle,
      wrapContent,
      itemWidth,
      registerComponentApi,
    });
  },
);
