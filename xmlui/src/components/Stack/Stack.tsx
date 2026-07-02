import React, { type CSSProperties, type ReactNode } from "react";

import { COMPONENT_PART_KEY } from "../../styling/layout";
import type { XmluiElement, XmluiNode } from "../../compiler/ir";
import { nonPropertyChildren, wrapComponent, type XmluiComponentAdapter } from "../../runtime/rendering/adapter";
import { extractScssThemeVars } from "../../styling/theme";
import { createMetadata, dClick, dContextMenu } from "../../component-core/metadata/helpers";
import type { ComponentMetadata } from "../../component-core/metadata/types";
import { FlowItemBreak, FlowItemWrapper, FlowLayout } from "../FlowLayout/FlowLayoutReact";
import { resolveThemeReferences, resolveThemeVariable, rootThemeVariables } from "../../styling/theme";
import { Stack } from "./StackReact";
import stackStylesSource from "./Stack.module.scss?xmlui-theme-vars";
import { defaultProps } from "./Stack.defaults";

const COMP = "Stack";

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
    description: "Optional boolean which wraps horizontal Stack content when the available space is not large enough.",
    valueType: "boolean",
    defaultValue: false,
  },
  orientation: {
    description: "An optional property that governs whether the Stack lays out its children in a row or a column.",
    availableValues: ["horizontal", "vertical"],
    isStrictEnum: true,
    valueType: "string",
    defaultValue: defaultProps.orientation,
  },
  horizontalAlignment: {
    description: "Manages the horizontal content alignment for each child element in the Stack.",
    availableValues: ["start", "center", "end", "stretch"],
    valueType: "string",
    defaultValue: "start",
  },
  verticalAlignment: {
    description: "Manages the vertical content alignment for each child element in the Stack.",
    availableValues: ["start", "center", "end", "stretch", "baseline"],
    valueType: "string",
    defaultValue: "start",
  },
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
    description: "Determines the scrollbar style.",
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
    description: "When set on a child of a Stack, activates DockPanel-style layout in the parent Stack.",
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
};

export const HStackMd = {
  ...StackMd,
  specializedFrom: COMP,
  description: "This component represents a stack rendering its contents horizontally.",
};

export const CVStackMd = {
  ...StackMd,
  specializedFrom: COMP,
  description:
    "This component represents a stack rendering its contents vertically and aligning it in the center along both axes.",
};

export const CHStackMd = {
  ...StackMd,
  specializedFrom: COMP,
  description:
    "This component represents a stack rendering its contents horizontally and aligning it in the center along both axes.",
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
  orientation?: string,
  fixedHorizontalAlignment?: string,
  fixedVerticalAlignment?: string,
) {
  return wrapComponent({
    name,
    metadata,
    renderer: ({ adapter }) => {
      const rootAttrs = adapter.rootAttrs();
      const gap = adapter.stringProp("gap");
      const style = { ...(rootAttrs.style as CSSProperties | undefined) };
      const actualOrientation = orientation ?? adapter.stringProp("orientation", defaultProps.orientation) ?? defaultProps.orientation;
      const horizontalAlignment = fixedHorizontalAlignment ?? adapter.stringProp("horizontalAlignment");
      const verticalAlignment = fixedVerticalAlignment ?? adapter.stringProp("verticalAlignment");
      const itemWidth = adapter.stringProp(
        "itemWidth",
        actualOrientation === "vertical" ? "100%" : "fit-content",
      );
      delete style.display;
      delete style.flexDirection;
      delete style.alignItems;
      delete style.justifyContent;
      if (gap) {
        (style as Record<string, string>)["--xmlui-gap-Stack"] = gap;
      }
      const children = nonPropertyChildren(adapter.node.children);
      const scrollStyle = adapter.stringProp("scrollStyle", defaultProps.scrollStyle);
      const showScrollerFade = adapter.booleanProp("showScrollerFade", defaultProps.showScrollerFade);
      if (children.some((child) => isDockedElement(child))) {
        return renderDockStack({
          adapter,
          attrs: rootAttrs,
          style,
          children,
          scrollStyle,
          showScrollerFade,
        });
      }
      if (actualOrientation === "horizontal" && adapter.booleanProp("wrapContent", false)) {
        const resolvedItemWidth = resolveCssSize(itemWidth) ?? itemWidth;
        return (
          <FlowLayout
            {...rootAttrs}
            style={style}
            columnGap={gap ?? "var(--xmlui-gap-Stack, var(--xmlui-gap-layout, 0px))"}
            rowGap={gap ?? "var(--xmlui-gap-Stack, var(--xmlui-gap-layout, 0px))"}
            itemWidth={resolvedItemWidth}
            verticalAlignment={verticalAlignment || "start"}
            onContextMenu={() => void adapter.event("contextMenu")()}
            registerComponentApi={adapter.registerApi}
          >
            {children.map((child, index) =>
              child.kind === "element" && child.type === "SpaceFiller" ? (
                <FlowItemBreak key={index} />
              ) : (
                <FlowItemWrapper
                  key={index}
                  itemWidth={resolvedItemWidth}
                  width={child.kind === "element" ? resolveCssSize(child.props.width) : undefined}
                  minWidth={child.kind === "element" ? resolveCssSize(child.props.minWidth) : undefined}
                  maxWidth={child.kind === "element" ? resolveCssSize(child.props.maxWidth) : undefined}
                >
                  {adapter.context.renderChildren([stripLayoutProps(child, ["width", "minWidth", "maxWidth"])], adapter.scope)}
                </FlowItemWrapper>
              ),
            )}
          </FlowLayout>
        );
      }
      return (
        <Stack
          {...withoutClassName(rootAttrs)}
          classes={rootAttrs.className ? { [COMPONENT_PART_KEY]: String(rootAttrs.className) } : undefined}
          style={style}
          orientation={actualOrientation}
          horizontalAlignment={horizontalAlignment}
          verticalAlignment={verticalAlignment}
          reverse={adapter.booleanProp("reverse", defaultProps.reverse)}
          hoverContainer={adapter.booleanProp("hoverContainer", defaultProps.hoverContainer)}
          visibleOnHover={adapter.booleanProp("visibleOnHover", defaultProps.visibleOnHover)}
          desktopOnly={adapter.booleanProp("desktopOnly", defaultProps.desktopOnly)}
          scrollStyle={scrollStyle as any}
          showScrollerFade={showScrollerFade}
          onClick={() => void adapter.event("click")()}
          onContextMenu={() => void adapter.event("contextMenu")()}
          onMount={() => void adapter.event("mounted")()}
          registerComponentApi={adapter.registerApi}
        >
          {renderStackChildren(
            adapter,
            children,
            actualOrientation,
            itemWidth,
            adapter.node.props.itemWidth !== undefined,
            style.overflowX === "scroll",
          )}
        </Stack>
      );
    },
  });
}

function renderStackChildren(
  adapter: XmluiComponentAdapter,
  children: XmluiNode[],
  orientation: string,
  itemWidth: string | undefined,
  hasExplicitItemWidth: boolean,
  preserveHorizontalOverflow: boolean,
): ReactNode {
  const normalizedChildren = children.map((child) =>
    normalizeStackChild(child, orientation, preserveHorizontalOverflow),
  );
  if (!hasExplicitItemWidth) {
    return adapter.context.renderChildren(normalizedChildren, adapter.scope);
  }
  return normalizedChildren.map((child, index) => {
    if (itemWidth && /^\d*\*$/.test(itemWidth)) {
      const flex = itemWidth === "*" ? 1 : Number.parseInt(itemWidth.slice(0, -1), 10);
      return (
        <div key={index} style={{ flex, flexShrink: 1 }}>
          {adapter.context.renderChildren([child], adapter.scope)}
        </div>
      );
    }
    return (
      <div key={index} style={{ width: itemWidth, flexShrink: 0 }}>
        {adapter.context.renderChildren([child], adapter.scope)}
      </div>
    );
  });
}

function normalizeStackChild(
  child: XmluiNode,
  orientation: string,
  preserveHorizontalOverflow: boolean,
): XmluiNode {
  if (child.kind !== "element") {
    return child;
  }
  const mainProp = orientation === "horizontal" ? "width" : "height";
  const mainValue = child.props[mainProp];
  if (mainValue === undefined || mainValue === null || mainValue === "") {
    if (!preserveHorizontalOverflow || orientation !== "horizontal") {
      return child;
    }
    const props: Record<string, unknown> = { ...child.props };
    props.canShrink = false;
    props.style = appendInlineStyle(props.style, "white-space: nowrap; max-width: none");
    return {
      ...child,
      props,
    } as XmluiElement;
  }

  const props: Record<string, unknown> = { ...child.props };
  const parsedProps = child.parsed?.props ? { ...child.parsed.props } : undefined;
  const star = parseStarSize(mainValue);
  if (star) {
    delete props[mainProp];
    delete parsedProps?.[mainProp];
    props.style = appendInlineStyle(
      props.style,
      `flex-grow: ${star}; flex-shrink: 1; flex-basis: 0`,
    );
  } else if (props.canShrink === undefined) {
    props.canShrink = false;
  }

  return {
    ...child,
    props,
    parsed: child.parsed ? { ...child.parsed, props: parsedProps } : child.parsed,
  } as XmluiElement;
}

function parseStarSize(value: unknown): number | undefined {
  if (typeof value !== "string") {
    return undefined;
  }
  const match = value.trim().match(/^(\d+(?:\.\d+)?)?\*$/);
  if (!match) {
    return undefined;
  }
  return match[1] ? Number(match[1]) : 1;
}

function appendInlineStyle(value: unknown, declaration: string): string {
  const current = typeof value === "string" ? value.trim() : "";
  return current ? `${current}; ${declaration}` : declaration;
}

function resolveCssSize(value: unknown): string | undefined {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }
  if (typeof value === "string" && value.startsWith("$")) {
    const resolved = resolveThemeVariable(value.slice(1), [rootThemeVariables]);
    if (resolved !== undefined) {
      return String(resolveThemeReferences(resolved));
    }
  }
  return String(resolveThemeReferences(value));
}

function renderDockStack({
  adapter,
  attrs,
  style,
  children,
  scrollStyle,
  showScrollerFade,
}: {
  adapter: XmluiComponentAdapter;
  attrs: Record<string, unknown>;
  style: CSSProperties;
  children: XmluiNode[];
  scrollStyle?: string;
  showScrollerFade: boolean;
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
    <Stack
      {...withoutClassName(attrs)}
      classes={attrs.className ? { [COMPONENT_PART_KEY]: String(attrs.className) } : undefined}
      orientation="vertical"
      style={style}
      scrollStyle={scrollStyle as any}
      showScrollerFade={showScrollerFade}
      onClick={() => void adapter.event("click")()}
      onContextMenu={() => void adapter.event("contextMenu")()}
      onMount={() => void adapter.event("mounted")()}
      registerComponentApi={adapter.registerApi}
    >
      {top.map((child, index) => (
        <div key={`top-${index}`} style={{ flexShrink: 0, width: "100%", minWidth: 0 }}>
          {adapter.context.renderChildren([stripLayoutProps(child, ["dock"])], adapter.scope)}
        </div>
      ))}
      {needsMiddleRow ? (
        <div style={{ display: "flex", flexDirection: "row", flex: 1, minHeight: 0, minWidth: 0 }}>
          {left.map((child, index) => (
            <div key={`left-${index}`} style={{ flexShrink: 0, alignSelf: "stretch", display: "grid", width: childWidth(child) }}>
              {adapter.context.renderChildren([stripLayoutProps(child, ["dock", "width", "minWidth", "maxWidth"])], adapter.scope)}
            </div>
          ))}
          {middle.map((child, index) => {
            const stretch = child.kind === "element" && child.props.dock === "stretch";
            return (
              <div key={`middle-${index}`} style={stretch ? { flex: 1, minWidth: 0, minHeight: 0, display: "grid" } : { flexShrink: 0 }}>
                {adapter.context.renderChildren([stripLayoutProps(child, stretch ? ["dock", "width", "minWidth", "maxWidth", "height", "minHeight", "maxHeight"] : ["dock"])], adapter.scope)}
              </div>
            );
          })}
          {right.slice().reverse().map((child, index) => (
            <div key={`right-${index}`} style={{ flexShrink: 0, alignSelf: "stretch", display: "grid", width: childWidth(child) }}>
              {adapter.context.renderChildren([stripLayoutProps(child, ["dock", "width", "minWidth", "maxWidth"])], adapter.scope)}
            </div>
          ))}
        </div>
      ) : null}
      {bottom.slice().reverse().map((child, index) => (
        <div key={`bottom-${index}`} style={{ flexShrink: 0, width: "100%", minWidth: 0 }}>
          {adapter.context.renderChildren([stripLayoutProps(child, ["dock"])], adapter.scope)}
        </div>
      ))}
    </Stack>
  );
}

function isDockedElement(child: XmluiNode): boolean {
  return child.kind === "element" && child.props.dock !== undefined;
}

function childWidth(child: XmluiNode): string | undefined {
  return child.kind === "element" ? child.props.width : undefined;
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

function withoutClassName(attrs: Record<string, unknown>): Record<string, unknown> {
  const { className: _className, ...rest } = attrs;
  return rest;
}
