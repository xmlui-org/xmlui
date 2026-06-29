import type { CSSProperties } from "react";

import type { ComponentMetadata } from "../../component-core/metadata/types";
import type { XmluiNode } from "../../compiler/ir";
import { nonPropertyChildren, wrapComponent } from "../../runtime/rendering/adapter";
import { CardMd } from "./Card";
import { defaultProps } from "./Card.defaults";
import { Card } from "./CardReact";

const COMP = "Card";

export const cardRenderer = wrapComponent({
  name: COMP,
  metadata: CardMd as ComponentMetadata,
  renderer: ({ adapter }) => {
    const rootAttrs = adapter.rootAttrs();
    return (
      <Card
        {...rootAttrs}
        style={rootAttrs.style as CSSProperties}
        title={adapter.stringProp("title")}
        subtitle={adapter.stringProp("subtitle")}
        linkTo={adapter.stringProp("linkTo")}
        avatarUrl={adapter.stringProp("avatarUrl")}
        showAvatar={adapter.booleanProp("showAvatar", Boolean(adapter.stringProp("avatarUrl")))}
        avatarSize={adapter.stringProp("avatarSize")}
        orientation={adapter.stringProp("orientation", defaultProps.orientation)}
        horizontalAlignment={adapter.stringProp("horizontalAlignment")}
        verticalAlignment={adapter.stringProp("verticalAlignment")}
        onClick={(event) => void adapter.event("click")(event)}
        onDoubleClick={(event) => void adapter.event("doubleClick")(event)}
        onContextMenu={(event) => void adapter.event("contextMenu")(event)}
        registerComponentApi={adapter.registerApi}
      >
        {adapter.context.renderChildren(
          nonPropertyChildren(adapter.node.children).map(withCardChildLayout),
          adapter.scope,
        )}
      </Card>
    );
  },
});

function withCardChildLayout(child: XmluiNode): XmluiNode {
  if (child.kind !== "element" || child.props.canShrink !== undefined) {
    return child;
  }
  return {
    ...child,
    props: {
      ...child.props,
      canShrink: "false",
    },
  };
}
