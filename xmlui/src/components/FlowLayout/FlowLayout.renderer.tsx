import type { CSSProperties } from "react";

import type { ComponentMetadata } from "../../component-core/metadata/types";
import type { XmluiNode } from "../../compiler/ir";
import { nonPropertyChildren, wrapComponent } from "../../runtime/rendering/adapter";
import { FlowLayoutMd } from "./FlowLayout";
import { defaultProps } from "./FlowLayout.defaults";
import { FlowItemBreak, FlowItemWrapper, FlowLayout } from "./FlowLayoutReact";

const COMP = "FlowLayout";

export const flowLayoutRenderer = wrapComponent({
  name: COMP,
  metadata: FlowLayoutMd as ComponentMetadata,
  renderer: ({ adapter }) => {
    const gap = adapter.stringProp("gap");
    const columnGap = adapter.node.props.columnGap !== undefined
      ? adapter.stringProp("columnGap", defaultProps.columnGap)
      : gap ?? "var(--xmlui-gap-FlowLayout, var(--xmlui-gap-layout, 0px))";
    const rowGap = adapter.node.props.rowGap !== undefined
      ? adapter.stringProp("rowGap", defaultProps.rowGap)
      : gap ?? "var(--xmlui-gap-FlowLayout, var(--xmlui-gap-layout, 0px))";
    const rootAttrs = adapter.rootAttrs();
    const style = { ...(rootAttrs.style as CSSProperties | undefined) };
    delete style.gap;
    delete style.columnGap;
    delete style.rowGap;
    const children = nonPropertyChildren(adapter.node.children);
    const itemWidth = adapter.stringProp("itemWidth", defaultProps.itemWidth);
    return (
      <FlowLayout
        {...rootAttrs}
        style={style}
        columnGap={columnGap}
        rowGap={rowGap}
        itemWidth={itemWidth}
        verticalAlignment={adapter.stringProp("verticalAlignment", defaultProps.verticalAlignment)}
        onContextMenu={() => void adapter.event("contextMenu")()}
        registerComponentApi={adapter.registerApi}
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
              {adapter.context.renderChildren([stripFlowItemLayoutProps(child)], adapter.scope)}
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

function stripFlowItemLayoutProps(child: XmluiNode): XmluiNode {
  if (child.kind !== "element") {
    return child;
  }
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
