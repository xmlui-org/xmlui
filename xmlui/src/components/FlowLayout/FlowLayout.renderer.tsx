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
