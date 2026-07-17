import React from "react";
import classnames from "classnames";
import styles from "./FlowLayout.module.scss";

import { wrapComponent } from "../../components-core/wrapComponent";
import { COMPONENT_PART_KEY } from "../../components-core/theming/responsive-layout";
import { isComponentDefChildren } from "../../components-core/utils/misc";
import { NotAComponentDefError } from "../../components-core/EngineError";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { useComponentThemeClass } from "../../components-core/theming/utils";
import { defaultProps } from "./FlowLayout.defaults";
import { FlowItemBreak, FlowItemWrapper, FlowLayout } from "./FlowLayoutReact";
import { collectResponsiveWidthProps } from "./flow-layout-utils";
import { createMetadata, dContextMenu } from "../metadata-helpers";
import type { ComponentMetadata } from "../../component-core/metadata/types";
import type { XmluiElement, XmluiNode } from "../../compiler/ir";
import { nonPropertyChildren, wrapComponent as wrapRuntimeComponent } from "../../runtime/rendering/adapter";
import { evaluateProps } from "../../runtime/rendering/bindings";
import { resolveThemeReferences } from "../../styling/theme";

export { FlowItemBreak, FlowItemWrapper } from "./FlowLayoutReact";
import { alignmentOptionValues } from "../abstractions";

const COMP = "FlowLayout";

export const FlowLayoutMd = createMetadata({
  status: "stable",
  description:
    "`FlowLayout` positions content in rows with automatic wrapping. When items " +
    "exceed the available horizontal space, they automatically wrap to a new line.",
  deprecationMessage:
    "We plan to deprecate the FlowLayout component in the near future. Please use HStack with wrapContent set to true; it will overtake the role of FlowLayout.",
  props: {
    gap: {
      description:
        `This property defines the gap between items in the same row and between rows. The ${COMP} ` +
        `component creates a new row when an item is about to overflow the current row.`,
      valueType: "length",
      defaultValue: "$gap-normal",
    },
    itemWidth: {
      description:
        "Specifies the default width for child items when they don't have an explicit width property. " +
        "Accepts any valid CSS width value (e.g., '100%', '200px', '20rem', '*').",
      valueType: "string",
      defaultValue: defaultProps.itemWidth,
    },
    columnGap: {
      description:
        "The \`columnGap\` property specifies the space between items in a single row; it overrides " +
        "the \`gap\` value.",
      valueType: "length",
      defaultValue: defaultProps.columnGap,
    },
    rowGap: {
      description:
        `The \`rowGap\` property specifies the space between the ${COMP} rows; it overrides ` +
        `the \`gap\` value.`,
      valueType: "length",
      defaultValue: defaultProps.rowGap,
    },
    verticalAlignment: {
      description:
        "Manages the vertical content alignment for each child element within the same row. " +
        "This aligns items along the cross-axis of the flex container.",
      availableValues: alignmentOptionValues,
      valueType: "string",
      defaultValue: "start",
    },
    scrollStyle: {
      description:
        `This property determines the scrollbar style. Options: "normal" uses the browser's default ` +
        `scrollbar; "overlay" displays a themed scrollbar that is always visible; "whenMouseOver" shows the ` +
        `scrollbar only when hovering over the scroll container; "whenScrolling" displays the scrollbar ` +
        `only while scrolling is active and fades out after 400ms of inactivity. ` +
        `On mobile/touch devices, this property is ignored and the browser's native scrollbar is always used.`,
      valueType: "string",
      availableValues: ["normal", "overlay", "whenMouseOver", "whenScrolling"],
      isStrictEnum: true,
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
  },
  events: {
    contextMenu: dContextMenu(COMP),
  },
  apis: {
    scrollToTop: {
      description:
        "Scrolls the FlowLayout container to the top. Works when the FlowLayout has an explicit height and overflowY is set to 'scroll'.",
      signature: "scrollToTop(behavior?: 'auto' | 'instant' | 'smooth'): void",
    },
    scrollToBottom: {
      description:
        "Scrolls the FlowLayout container to the bottom. Works when the FlowLayout has an explicit height and overflowY is set to 'scroll'.",
      signature: "scrollToBottom(behavior?: 'auto' | 'instant' | 'smooth'): void",
    },
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    [`gap-${COMP}`]: "$gap-layout",
    [`columnGap-${COMP}`]: `$gap-${COMP}`,
    [`rowGap-${COMP}`]: `$gap-${COMP}`,
  },
});

type ThemedFlowLayoutProps = React.ComponentPropsWithoutRef<typeof FlowLayout> & {
  classes?: Record<string, string>;
};

export const ThemedFlowLayout = React.forwardRef<
  React.ElementRef<typeof FlowLayout>,
  ThemedFlowLayoutProps
>(function ThemedFlowLayout({ className, classes, ...props }, ref) {
  const themeClass = useComponentThemeClass(FlowLayoutMd);
  const mergedClasses = {
    ...classes,
    [COMPONENT_PART_KEY]: classnames(themeClass, classes?.[COMPONENT_PART_KEY], className),
  };
  return <FlowLayout {...props} classes={mergedClasses} ref={ref} />;
});

export const flowLayoutComponentRenderer = wrapComponent(COMP, FlowLayout, FlowLayoutMd, {
  customRender: (
    _props,
    { node, renderChild, classes, extractValue, registerComponentApi, lookupEventHandler },
  ) => {
    if (!isComponentDefChildren(node.children)) {
      throw new NotAComponentDefError();
    }

    const columnGap =
      extractValue.asSize(node.props?.columnGap) ||
      extractValue.asSize(node.props?.gap) ||
      extractValue.asSize(`$columnGap-${COMP}`);
    const rowGap =
      extractValue.asSize(node.props?.rowGap) ||
      extractValue.asSize(node.props?.gap) ||
      extractValue.asSize(`$rowGap-${COMP}`);
    const itemWidth =
      extractValue.asSize(node.props?.itemWidth) ??
      extractValue.asOptionalString(node.props?.itemWidth, defaultProps.itemWidth);
    const verticalAlignment = extractValue.asOptionalString(node.props?.verticalAlignment, "start");
    const scrollStyle = extractValue.asOptionalString(
      node.props.scrollStyle,
      defaultProps.scrollStyle,
    ) as any;
    const showScrollerFade = extractValue.asOptionalBoolean(node.props.showScrollerFade);

    return (
      <ThemedFlowLayout
        classes={classes}
        columnGap={columnGap}
        rowGap={rowGap}
        itemWidth={itemWidth}
        verticalAlignment={verticalAlignment}
        scrollStyle={scrollStyle}
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
            const width = extractValue.asSize((node.props as any)?.width);
            const minWidth = extractValue.asSize((node.props as any)?.minWidth);
            const maxWidth = extractValue.asSize((node.props as any)?.maxWidth);
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
        })}
      </ThemedFlowLayout>
    );
  },
});

export const flowLayoutRenderer = wrapRuntimeComponent({
  name: COMP,
  metadata: FlowLayoutMd as ComponentMetadata,
  renderer: ({ adapter }) => {
    const columnGap =
      resolveCssSize(adapter.stringProp("columnGap")) ||
      resolveCssSize(adapter.stringProp("gap")) ||
      `var(--xmlui-columnGap-${COMP}, var(--xmlui-gap-${COMP}, var(--xmlui-gap-layout, 0px)))`;
    const rowGap =
      resolveCssSize(adapter.stringProp("rowGap")) ||
      resolveCssSize(adapter.stringProp("gap")) ||
      `var(--xmlui-rowGap-${COMP}, var(--xmlui-gap-${COMP}, var(--xmlui-gap-layout, 0px)))`;
    const itemWidth =
      resolveCssSize(adapter.stringProp("itemWidth")) ??
      resolveCssSize(adapter.stringProp("itemWidth", defaultProps.itemWidth));
    const children = nonPropertyChildren(adapter.node.children);
    const flowLayoutContext = {
      type: "FlowLayout",
      ignoreLayoutProps: ["width", "minWidth", "maxWidth"],
      wrapChild: (
        { node }: { node: XmluiElement },
        renderedChild: React.ReactNode,
      ) => {
        if (isOpaqueComponent(node.type) || isNonVisualComponent(node.type)) {
          return renderedChild;
        }
        if (node.type === "SpaceFiller") {
          return <FlowItemBreak force={true} />;
        }
        const childProps = evaluateProps(node.props, node.parsed?.props, adapter.scope);
        const width = resolveCssSize(childProps.width);
        const minWidth = resolveCssSize(childProps.minWidth);
        const maxWidth = resolveCssSize(childProps.maxWidth);
        const responsiveWidthProps = collectResponsiveWidthProps(
          childProps,
          valueAsString,
        );
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
    };

    return (
      <ThemedFlowLayout
        {...adapter.rootAttrs()}
        columnGap={columnGap}
        rowGap={rowGap}
        itemWidth={itemWidth}
        verticalAlignment={adapter.stringProp("verticalAlignment", "start")}
        scrollStyle={adapter.stringProp("scrollStyle", defaultProps.scrollStyle) as any}
        showScrollerFade={adapter.booleanProp("showScrollerFade", defaultProps.showScrollerFade)}
        onContextMenu={adapter.event("contextMenu")}
        registerComponentApi={adapter.registerApi}
      >
        {children.map((child: XmluiNode, index) => {
          if (isSpaceFiller(child)) {
            return <FlowItemBreak key={index} force={true} />;
          }
          if (child.kind === "text") {
            return adapter.context.renderChildren([child], adapter.scope, adapter.node.range.end);
          }
          if (isOpaqueComponent(child.type) || isNonVisualComponent(child.type)) {
            return adapter.context.renderChildren(
              [child],
              adapter.scope,
              adapter.node.range.end,
              flowLayoutContext,
            );
          }
          const childProps = evaluateProps(child.props, child.parsed?.props, adapter.scope);
          const width = resolveCssSize(childProps.width);
          const minWidth = resolveCssSize(childProps.minWidth);
          const maxWidth = resolveCssSize(childProps.maxWidth);
          const responsiveWidthProps = collectResponsiveWidthProps(
            childProps,
            valueAsString,
          );
          return (
            <FlowItemWrapper
              key={index}
              width={width}
              minWidth={minWidth}
              maxWidth={maxWidth}
              responsiveWidthProps={responsiveWidthProps}
              forceBreak={child.type === "SpaceFiller"}
            >
              {adapter.context.renderChildren(
                [shouldPreserveLayoutPropsForSingleRootForwarding(adapter, child)
                  ? child
                  : stripFlowItemLayoutProps(child)],
                adapter.scope,
                adapter.node.range.end,
              )}
            </FlowItemWrapper>
          );
        })}
      </ThemedFlowLayout>
    );
  },
});

function isSpaceFiller(child: unknown): boolean {
  return (
    typeof child === "object" &&
    child !== null &&
    (child as any).kind === "element" &&
    (child as any).type === "SpaceFiller"
  );
}

type ValueAsString = ((value: unknown, fallback?: string) => string | undefined) & {
  asSize?: (value: unknown, fallback?: string) => string | undefined;
};

const valueAsString: ValueAsString = (value: unknown, fallback?: string) => {
  return value === undefined || value === null || value === "" ? fallback : String(value);
};

valueAsString.asSize = valueAsString;

function resolveCssSize(value: unknown): string | undefined {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }
  return String(resolveThemeReferences(value));
}

const opaqueComponents = new Set(["Bookmark", "Fragment", "Items", "Slot", "Theme"]);
const nonVisualComponents = new Set([
  "APICall",
  "AppState",
  "ChangeListener",
  "Column",
  "DataSource",
  "EventSource",
  "IncludeMarkup",
  "Lifecycle",
  "MessageListener",
  "PageMetaTitle",
  "Part",
  "Queue",
  "Redirect",
  "Timer",
  "WebSocket",
]);

function isOpaqueComponent(type: string): boolean {
  return opaqueComponents.has(type);
}

function isNonVisualComponent(type: string): boolean {
  return nonVisualComponents.has(type);
}

function stripFlowItemLayoutProps(child: XmluiElement): XmluiElement {
  const { width, minWidth, maxWidth, ...props } = child.props;
  const parsedProps = child.parsed?.props
    ? (() => {
        const { width, minWidth, maxWidth, ...rest } = child.parsed.props;
        return rest;
      })()
    : child.parsed?.props;
  return {
    ...child,
    props,
    parsed: child.parsed ? { ...child.parsed, props: parsedProps } : child.parsed,
  };
}

function shouldPreserveLayoutPropsForSingleRootForwarding(
  adapter: { context: { components: Record<string, unknown> } },
  child: XmluiElement,
): boolean {
  return Object.prototype.hasOwnProperty.call(adapter.context.components, child.type);
}
