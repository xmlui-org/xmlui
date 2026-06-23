import type { CSSProperties } from "react";

import { createMetadata, dContextMenu } from "../../component-core/metadata/helpers";
import type { ComponentMetadata } from "../../component-core/metadata/types";
import type { XmluiNode } from "../../compiler/ir";
import { wrapComponent, nonPropertyChildren } from "../../runtime/rendering/adapter";
import { defaultProps } from "./FlowLayout.defaults";
import { FlowItemBreak, FlowItemWrapper, FlowLayout } from "./FlowLayoutReact";

const COMP = "FlowLayout";

export const FlowLayoutMd = createMetadata({
  status: "stable",
  description:
    "`FlowLayout` positions content in rows with automatic wrapping. When items exceed the available horizontal space, they automatically wrap to a new line.",
  deprecationMessage:
    "We plan to deprecate the FlowLayout component in the near future. Please use HStack with wrapContent set to true; it will overtake the role of FlowLayout.",
  props: {
    gap: {
      description: "Defines the gap between items in the same row and between rows.",
      valueType: "length",
      defaultValue: "$gap-normal",
    },
    itemWidth: {
      description: "Specifies the default width for child items when they do not have an explicit width property.",
      valueType: "string",
      defaultValue: defaultProps.itemWidth,
    },
    columnGap: {
      description: "Specifies the space between items in a single row; it overrides the `gap` value.",
      valueType: "length",
      defaultValue: defaultProps.columnGap,
    },
    rowGap: {
      description: "Specifies the space between FlowLayout rows; it overrides the `gap` value.",
      valueType: "length",
      defaultValue: defaultProps.rowGap,
    },
    verticalAlignment: {
      description: "Manages vertical alignment for each child element within the same row.",
      availableValues: ["start", "center", "end"],
      valueType: "string",
      defaultValue: defaultProps.verticalAlignment,
    },
    scrollStyle: {
      description: "Determines the scrollbar style.",
      valueType: "string",
      availableValues: ["normal", "overlay", "whenMouseOver", "whenScrolling"],
      isStrictEnum: true,
      defaultValue: defaultProps.scrollStyle,
    },
    showScrollerFade: {
      description: "When enabled, displays gradient fade indicators around scrollable FlowLayout content.",
      valueType: "boolean",
      defaultValue: defaultProps.showScrollerFade,
    },
    testId: {
      description: "This optional property adds a test identifier to the FlowLayout root element.",
      valueType: "string",
    },
  },
  events: {
    contextMenu: dContextMenu(COMP),
  },
  apis: {
    scrollToTop: {
      description: "Scrolls the FlowLayout container to the top.",
      signature: "scrollToTop(behavior?: 'auto' | 'instant' | 'smooth'): void",
    },
    scrollToBottom: {
      description: "Scrolls the FlowLayout container to the bottom.",
      signature: "scrollToBottom(behavior?: 'auto' | 'instant' | 'smooth'): void",
    },
  },
  themeVars: {
    [`gap-${COMP}`]: "Gap between FlowLayout items.",
    [`columnGap-${COMP}`]: "Horizontal gap between FlowLayout items.",
    [`rowGap-${COMP}`]: "Vertical gap between FlowLayout rows.",
  },
  defaultThemeVars: {
    [`gap-${COMP}`]: "$gap-layout",
    [`columnGap-${COMP}`]: `$gap-${COMP}`,
    [`rowGap-${COMP}`]: `$gap-${COMP}`,
  },
});

export const flowLayoutRenderer = wrapComponent({
  name: COMP,
  metadata: FlowLayoutMd as ComponentMetadata,
  renderer: ({ adapter }) => {
    const gap = adapter.stringProp("gap");
    const columnGap = adapter.stringProp("columnGap", gap ?? defaultProps.columnGap);
    const rowGap = adapter.stringProp("rowGap", gap ?? defaultProps.rowGap);
    const rootAttrs = adapter.rootAttrs();
    const children = nonPropertyChildren(adapter.node.children);
    const itemWidth = adapter.stringProp("itemWidth", defaultProps.itemWidth);
    return (
      <FlowLayout
        {...rootAttrs}
        style={rootAttrs.style as CSSProperties}
        columnGap={columnGap}
        rowGap={rowGap}
        itemWidth={itemWidth}
        verticalAlignment={adapter.stringProp("verticalAlignment", defaultProps.verticalAlignment)}
        onContextMenu={() => void adapter.event("contextMenu")()}
      >
        {children.map((child, index) =>
          isSpaceFiller(child) ? (
            <FlowItemBreak key={index} />
          ) : (
            <FlowItemWrapper
              key={index}
              itemWidth={itemWidth}
              width={child.kind === "element" ? child.props.width : undefined}
              minWidth={child.kind === "element" ? child.props.minWidth : undefined}
              maxWidth={child.kind === "element" ? child.props.maxWidth : undefined}
            >
              {adapter.context.renderChildren([child], adapter.scope)}
            </FlowItemWrapper>
          ),
        )}
      </FlowLayout>
    );
  },
});

function isSpaceFiller(child: XmluiNode): boolean {
  return child.kind === "element" && child.type === "SpaceFiller";
}
