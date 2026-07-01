import React, { type CSSProperties, type ReactNode } from "react";

import type { ComponentMetadata } from "../../component-core/metadata/types";
import { createMetadata, dClick, dContextMenu } from "../../component-core/metadata/helpers";
import type { XmluiElement, XmluiNode } from "../../compiler/ir";
import { nonPropertyChildren, wrapComponent } from "../../runtime/rendering/adapter";
import type { XmluiComponentAdapter } from "../../runtime/rendering/adapter";
import { createRuntimeScope, type RuntimeScope } from "../../runtime/state";
import { COMPONENT_PART_KEY } from "../../styling";
import { extractScssThemeVars, resolveThemeReferences } from "../../styling/theme";
import { FlowItemBreak, FlowItemWrapper, FlowLayout } from "../FlowLayout/FlowLayoutReact";
import { defaultProps as flowLayoutDefaultProps } from "../FlowLayout/FlowLayout.defaults";
import { Stack } from "./StackReact";
import { DEFAULT_ORIENTATION, defaultProps } from "./Stack.defaults";
import stackStylesSource from "./Stack.module.scss?xmlui-theme-vars";

const COMP = "Stack";

const alignmentOptionValues = ["start", "center", "end", "stretch"];

const HORIZONTAL_ALIGNMENT = {
  description: "Manages the horizontal content alignment for each child element in the Stack.",
  availableValues: alignmentOptionValues,
  valueType: "string",
  defaultValue: "start",
} as const;

const VERTICAL_ALIGNMENT = {
  description: "Manages the vertical content alignment for each child element in the Stack.",
  availableValues: [...alignmentOptionValues, "baseline"],
  valueType: "string",
  defaultValue: "start",
} as const;

const stackProps = {
  desktopOnly: {
    description: "Optional boolean property to hide the Stack on desktop devices.",
    valueType: "boolean",
    isInternal: true,
    defaultValue: defaultProps.desktopOnly,
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
      "Optional boolean which wraps the content if set to true and the available space is not big enough.",
    valueType: "boolean",
    defaultValue: false,
  },
  orientation: {
    description: "An optional property that governs the Stack's orientation.",
    availableValues: ["horizontal", "vertical"],
    isStrictEnum: true,
    valueType: "string",
    defaultValue: defaultProps.orientation,
  },
  horizontalAlignment: HORIZONTAL_ALIGNMENT,
  verticalAlignment: VERTICAL_ALIGNMENT,
  hoverContainer: {
    description: "Reserved for future use.",
    valueType: "boolean",
    isInternal: true,
    defaultValue: defaultProps.hoverContainer,
  },
  visibleOnHover: {
    description: "Reserved for future use.",
    valueType: "boolean",
    isInternal: true,
    defaultValue: defaultProps.visibleOnHover,
  },
  scrollStyle: {
    description: "This property determines the scrollbar style.",
    valueType: "string",
    availableValues: ["normal", "overlay", "whenMouseOver", "whenScrolling"],
    isStrictEnum: true,
    defaultValue: defaultProps.scrollStyle,
  },
  showScrollerFade: {
    description: "When enabled, displays gradient fade indicators around scrollable Stack content.",
    valueType: "boolean",
    defaultValue: defaultProps.showScrollerFade,
  },
  itemWidth: {
    description: "The default width applied to child elements in the Stack.",
    valueType: "string",
  },
  dock: {
    description: "When set on a child of a Stack, activates DockPanel layout in the parent Stack.",
    availableValues: ["top", "bottom", "left", "right", "stretch"],
    isStrictEnum: true,
    valueType: "string",
  },
  testId: {
    description: "This optional property adds a test identifier to the Stack root element.",
    valueType: "string",
  },
} as const;

export const StackMd = createMetadata({
  status: "stable",
  description:
    "`Stack` is the fundamental layout container that organizes child elements in configurable horizontal or vertical arrangements.",
  props: stackProps,
  events: {
    click: dClick(COMP),
    contextMenu: dContextMenu(COMP),
    mounted: {
      description: "Reserved for future use.",
      signature: "mounted(): void",
      parameters: {},
      isInternal: true,
    },
  },
  apis: {
    scrollToTop: {
      description: "Scrolls the Stack container to the top.",
      signature: "scrollToTop(behavior?: 'auto' | 'instant' | 'smooth'): void",
    },
    scrollToBottom: {
      description: "Scrolls the Stack container to the bottom.",
      signature: "scrollToBottom(behavior?: 'auto' | 'instant' | 'smooth'): void",
    },
    scrollToStart: {
      description: "Scrolls the Stack container to the start.",
      signature: "scrollToStart(behavior?: 'auto' | 'instant' | 'smooth'): void",
    },
    scrollToEnd: {
      description: "Scrolls the Stack container to the end.",
      signature: "scrollToEnd(behavior?: 'auto' | 'instant' | 'smooth'): void",
    },
  },
  themeVars: extractScssThemeVars(stackStylesSource),
  defaultThemeVars: {
    [`gap-${COMP}`]: "$gap-layout",
  },
});

export const VStackMd = {
  ...StackMd,
  specializedFrom: COMP,
  description: "This component represents a stack rendering its contents vertically.",
  props: specializedStackProps(),
};

export const HStackMd = {
  ...StackMd,
  specializedFrom: COMP,
  description: "This component represents a stack rendering its contents horizontally.",
  props: specializedStackProps(),
};

export const CVStackMd = {
  ...StackMd,
  specializedFrom: COMP,
  description:
    "This component represents a stack that renders its contents vertically and aligns that in the center along both axes.",
  props: specializedStackProps(),
};

export const CHStackMd = {
  ...StackMd,
  specializedFrom: COMP,
  description:
    "This component represents a stack that renders its contents horizontally and aligns that in the center along both axes.",
  props: specializedStackProps(),
};

export const stackRenderer = createStackRenderer("Stack", StackMd as ComponentMetadata);
export const hStackRenderer = createStackRenderer("HStack", HStackMd as ComponentMetadata, "horizontal");
export const vStackRenderer = createStackRenderer("VStack", VStackMd as ComponentMetadata, "vertical");
export const chStackRenderer = createStackRenderer(
  "CHStack",
  CHStackMd as ComponentMetadata,
  "horizontal",
  "center",
  "center",
);
export const cvStackRenderer = createStackRenderer(
  "CVStack",
  CVStackMd as ComponentMetadata,
  "vertical",
  "center",
  "center",
);

function createStackRenderer(
  name: string,
  metadata: ComponentMetadata,
  fixedOrientation?: string,
  fixedHorizontalAlignment?: string,
  fixedVerticalAlignment?: string,
) {
  return wrapComponent({
    name,
    metadata,
    renderer: ({ adapter }) => {
      const orientation = fixedOrientation ?? adapter.stringProp("orientation", DEFAULT_ORIENTATION) ?? DEFAULT_ORIENTATION;
      const itemWidth = stringSize(adapter.prop("itemWidth")) ??
        (orientation === "vertical" ? "100%" : "fit-content");
      const containerStyle =
        name === "VStack" &&
        adapter.node.props.width == null &&
        adapter.node.props.maxWidth == null
          ? { width: "100%", flexShrink: 1 }
          : undefined;

      return renderStack({
        adapter,
        orientation,
        horizontalAlignment: fixedHorizontalAlignment ?? adapter.stringProp("horizontalAlignment"),
        verticalAlignment: fixedVerticalAlignment ?? adapter.stringProp("verticalAlignment"),
        itemWidth,
        wrapContent: adapter.booleanProp("wrapContent", false),
        containerStyle,
      });
    },
  });
}

function renderStack({
  adapter,
  orientation,
  horizontalAlignment,
  verticalAlignment,
  itemWidth,
  wrapContent,
  containerStyle,
}: {
  adapter: XmluiComponentAdapter;
  orientation: string;
  horizontalAlignment?: string;
  verticalAlignment?: string;
  itemWidth: string;
  wrapContent?: boolean;
  containerStyle?: CSSProperties;
}) {
  const children = nonPropertyChildren(adapter.node.children);
  if (children.some((child) => child.kind === "element" && child.props.dock != null)) {
    return renderDockLayout({ adapter, children, containerStyle });
  }
  if (orientation === "horizontal" && wrapContent) {
    return renderWrappedHorizontalStack({ adapter, children, itemWidth, verticalAlignment, containerStyle });
  }

  const hasExplicitItemWidth = adapter.node.props.itemWidth != null;
  const childScope = createChildLayoutScope(adapter.scope, "Stack", orientation);
  return (
    <StackShell
      adapter={adapter}
      orientation={orientation}
      horizontalAlignment={horizontalAlignment}
      verticalAlignment={verticalAlignment}
      containerStyle={containerStyle}
    >
      {hasExplicitItemWidth
        ? children.map((child, index) => wrapItemWidth(adapter, child, itemWidth, index))
        : adapter.context.renderChildren(children, childScope)}
    </StackShell>
  );
}

function createChildLayoutScope(
  scope: RuntimeScope,
  type: string,
  orientation: string,
): RuntimeScope {
  return createRuntimeScope({
    store: scope.store,
    localOwnerId: scope.localOwnerId,
    parent: scope,
    layoutContext: {
      type,
      orientation,
      parent: scope.layoutContext,
    },
    props: scope.props,
    contextValues: scope.contextValues,
    appContext: scope.appContext,
    references: scope.references,
    slots: scope.slots,
    routing: scope.routing,
    toast: scope.toast,
    i18n: scope.i18n,
    emitEvent: scope.emitEvent,
    extensionFunctions: scope.extensionFunctions,
  });
}

function renderDockLayout({
  adapter,
  children,
  containerStyle,
}: {
  adapter: XmluiComponentAdapter;
  children: XmluiNode[];
  containerStyle?: CSSProperties;
}) {
  const top: XmluiNode[] = [];
  const bottom: XmluiNode[] = [];
  const left: XmluiNode[] = [];
  const right: XmluiNode[] = [];
  const middle: XmluiNode[] = [];
  for (const child of children) {
    const dock = child.kind === "element" ? child.props.dock : undefined;
    if (dock === "top") top.push(child);
    else if (dock === "bottom") bottom.push(child);
    else if (dock === "left") left.push(child);
    else if (dock === "right") right.push(child);
    else middle.push(child);
  }
  const needsMiddleRow = middle.length > 0 || left.length > 0 || right.length > 0 || bottom.length > 0;

  return (
    <StackShell adapter={adapter} orientation="vertical" containerStyle={containerStyle}>
      {top.map((child, index) => (
        <div key={`top-${index}`} style={{ flexShrink: 0, width: "100%", minWidth: 0 }}>
          {adapter.context.renderChildren([child], adapter.scope)}
        </div>
      ))}
      {needsMiddleRow ? (
        <div style={{ display: "flex", flexDirection: "row", flex: 1, minHeight: 0, minWidth: 0 }}>
          {left.map((child, index) => (
            <div key={`left-${index}`} style={{ flexShrink: 0, alignSelf: "stretch", display: "grid", width: childWidth(child) }}>
              {adapter.context.renderChildren([stripLayoutProps(child, ["width", "minWidth", "maxWidth"])], adapter.scope)}
            </div>
          ))}
          {middle.map((child, index) => {
            const isStretch = child.kind === "element" && child.props.dock === "stretch";
            return (
              <div
                key={`middle-${index}`}
                style={isStretch ? { flex: 1, minWidth: 0, minHeight: 0, display: "grid" } : { flexShrink: 0 }}
              >
                {adapter.context.renderChildren([
                  isStretch
                    ? stripLayoutProps(child, ["width", "minWidth", "maxWidth", "height", "minHeight", "maxHeight"])
                    : child,
                ], adapter.scope)}
              </div>
            );
          })}
          {right.slice().reverse().map((child, index) => (
            <div key={`right-${index}`} style={{ flexShrink: 0, alignSelf: "stretch", display: "grid", width: childWidth(child) }}>
              {adapter.context.renderChildren([stripLayoutProps(child, ["width", "minWidth", "maxWidth"])], adapter.scope)}
            </div>
          ))}
        </div>
      ) : undefined}
      {bottom.slice().reverse().map((child, index) => (
        <div key={`bottom-${index}`} style={{ flexShrink: 0, width: "100%", minWidth: 0 }}>
          {adapter.context.renderChildren([child], adapter.scope)}
        </div>
      ))}
    </StackShell>
  );
}

function renderWrappedHorizontalStack({
  adapter,
  children,
  itemWidth,
  verticalAlignment,
  containerStyle,
}: {
  adapter: XmluiComponentAdapter;
  children: XmluiNode[];
  itemWidth: string;
  verticalAlignment?: string;
  containerStyle?: CSSProperties;
}) {
  const gap = cssSizeValue(adapter.prop("gap"));
  const rootAttrs = stackRootAttrs(adapter, containerStyle);
  return (
    <FlowLayout
      {...rootAttrs.attrs}
      style={rootAttrs.style}
      className={rootAttrs.className}
      columnGap={gap ?? "var(--xmlui-gap-Stack, var(--xmlui-gap-layout, 0px))"}
      rowGap={gap ?? "var(--xmlui-gap-Stack, var(--xmlui-gap-layout, 0px))"}
      itemWidth={itemWidth || flowLayoutDefaultProps.itemWidth}
      verticalAlignment={verticalAlignment || "start"}
      onContextMenu={eventHandler(adapter, "contextMenu")}
      registerComponentApi={adapter.registerApi}
    >
      {children.map((child, index) =>
        child.kind === "element" && child.type === "SpaceFiller" ? (
          <FlowItemBreak key={index} />
        ) : (
          <FlowItemWrapper
            key={index}
            itemWidth={itemWidth}
            width={child.kind === "element" ? child.props.width : undefined}
            minWidth={child.kind === "element" ? child.props.minWidth : undefined}
            maxWidth={child.kind === "element" ? child.props.maxWidth : undefined}
          >
            {adapter.context.renderChildren([
              stripLayoutProps(child, ["width", "minWidth", "maxWidth"]),
            ], adapter.scope)}
          </FlowItemWrapper>
        ),
      )}
    </FlowLayout>
  );
}

function StackShell({
  adapter,
  orientation,
  horizontalAlignment,
  verticalAlignment,
  containerStyle,
  children,
}: {
  adapter: XmluiComponentAdapter;
  orientation: string;
  horizontalAlignment?: string;
  verticalAlignment?: string;
  containerStyle?: CSSProperties;
  children: ReactNode;
}) {
  const root = stackRootAttrs(adapter, containerStyle);
  return (
    <Stack
      {...root.attrs}
      className={root.className}
      classes={{ [COMPONENT_PART_KEY]: adapter.className }}
      style={root.style}
      orientation={orientation}
      horizontalAlignment={horizontalAlignment}
      verticalAlignment={verticalAlignment}
      reverse={adapter.booleanProp("reverse", defaultProps.reverse)}
      hoverContainer={adapter.booleanProp("hoverContainer", defaultProps.hoverContainer)}
      visibleOnHover={adapter.booleanProp("visibleOnHover", defaultProps.visibleOnHover)}
      scrollStyle={adapter.stringProp("scrollStyle", defaultProps.scrollStyle) as any}
      showScrollerFade={adapter.booleanProp("showScrollerFade", defaultProps.showScrollerFade)}
      desktopOnly={adapter.booleanProp("desktopOnly", defaultProps.desktopOnly)}
      onClick={eventHandler(adapter, "click")}
      onContextMenu={eventHandler(adapter, "contextMenu")}
      onMount={eventHandler(adapter, "mounted")}
      registerComponentApi={adapter.registerApi}
    >
      {children}
    </Stack>
  );
}

function stackRootAttrs(adapter: XmluiComponentAdapter, containerStyle?: CSSProperties) {
  const { className, style, ...attrs } = adapter.rootAttrs();
  const gap = cssSizeValue(adapter.prop("gap"));
  const mergedStyle = {
    ...(style as CSSProperties | undefined),
    ...containerStyle,
    ...(gap ? { "--xmlui-gap-Stack": gap } : undefined),
  } as CSSProperties;
  delete mergedStyle.display;
  delete mergedStyle.flexDirection;
  delete mergedStyle.gap;
  if (adapter.node.props.horizontalAlignment != null || adapter.node.props.verticalAlignment != null) {
    delete mergedStyle.alignItems;
    delete mergedStyle.justifyContent;
    if (adapter.node.props.alignItems != null) {
      mergedStyle.alignItems = adapter.prop("alignItems");
    }
    if (adapter.node.props.justifyContent != null) {
      mergedStyle.justifyContent = adapter.prop("justifyContent");
    }
  }
  return {
    attrs,
    className: typeof className === "string" ? className : undefined,
    style: mergedStyle,
  };
}

function cssSizeValue(value: unknown): string | undefined {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    return `${value}px`;
  }
  if (typeof value !== "string") {
    return undefined;
  }
  const resolved = String(resolveThemeReferences(value)).trim();
  if (
    resolved === "0" ||
    resolved.startsWith("var(") ||
    resolved.startsWith("calc(") ||
    resolved.startsWith("min(") ||
    resolved.startsWith("max(") ||
    resolved.startsWith("clamp(") ||
    /^-?\d+(?:\.\d+)?(?:px|r?em|vh|vw|vmin|vmax|%|ch|ex|cm|mm|in|pt|pc|q)$/i.test(resolved)
  ) {
    return resolved;
  }
  return undefined;
}

function eventHandler(adapter: XmluiComponentAdapter, name: "click" | "contextMenu" | "mounted") {
  return Object.prototype.hasOwnProperty.call(adapter.node.events, name)
    ? (...args: unknown[]) => void adapter.event(name)(...args)
    : undefined;
}

function wrapItemWidth(adapter: XmluiComponentAdapter, child: XmluiNode, itemWidth: string, key: number) {
  if (child.kind === "element" && nonWrappedChildTypes.has(child.type)) {
    return <React.Fragment key={key}>{adapter.context.renderChildren([child], adapter.scope)}</React.Fragment>;
  }
  const style = starSizeRegex.test(itemWidth)
    ? { flex: getStarSizeNumber(itemWidth), flexShrink: 1 }
    : { width: itemWidth, flexShrink: 0 };
  return (
    <div key={key} style={style}>
      {adapter.context.renderChildren([child], adapter.scope)}
    </div>
  );
}

function stripLayoutProps(child: XmluiNode, names: string[]): XmluiNode {
  if (child.kind !== "element") {
    return child;
  }
  const props = { ...child.props };
  for (const name of names) {
    delete props[name];
  }
  const parsedProps = child.parsed?.props ? { ...child.parsed.props } : undefined;
  if (parsedProps) {
    for (const name of names) {
      delete parsedProps[name];
    }
  }
  return {
    ...child,
    props,
    parsed: child.parsed ? { ...child.parsed, props: parsedProps } : child.parsed,
  } as XmluiElement;
}

function childWidth(child: XmluiNode) {
  return child.kind === "element" ? stringSize(child.props.width) : undefined;
}

function stringSize(value: unknown): string | undefined {
  return value == null || value === "" ? undefined : String(value);
}

const starSizeRegex = /^\d*\*$/;

function getStarSizeNumber(input: string): number {
  const numberPart = input.slice(0, -1);
  return numberPart === "" ? 1 : parseInt(numberPart, 10);
}

const nonWrappedChildTypes = new Set([
  "APICall",
  "AppState",
  "Bookmark",
  "ChangeListener",
  "Column",
  "DataSource",
  "EventSource",
  "Fragment",
  "IncludeMarkup",
  "Items",
  "Lifecycle",
  "MessageListener",
  "PageMetaTitle",
  "Part",
  "Redirect",
  "RetryPolicy",
  "SelectionStore",
  "Slot",
  "Theme",
  "Timer",
  "WebSocket",
]);

function specializedStackProps() {
  const { orientation: _orientation, ...props } = stackProps;
  return props;
}
