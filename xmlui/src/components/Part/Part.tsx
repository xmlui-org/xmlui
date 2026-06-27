import { createMetadata } from "../../component-core/metadata/helpers";
import { wrapComponent } from "../../runtime/rendering/adapter";
import type { ComponentMetadata } from "../../component-core/metadata/types";
import type { XmluiElement } from "../../compiler/ir";

const COMP = "Part";

export const PartMd = createMetadata({
  status: "stable",
  description:
    "`Part` marks its single child as a named internal part without adding a wrapper element.",
  nonVisual: true,
  props: {
    partId: {
      description: "The part identifier to apply to the child element.",
      valueType: "string",
    },
  },
});

export const partRenderer = wrapComponent({
  name: COMP,
  metadata: PartMd as ComponentMetadata,
  renderer: ({ adapter }) => {
    const partId = adapter.stringProp("partId");
    const nodeChildren = adapter.node.children;

    if (nodeChildren.length === 1 && nodeChildren[0].kind === "element" && partId) {
      const child = nodeChildren[0] as XmluiElement;
      return adapter.context.renderChildren([
        {
          ...child,
          props: {
            ...child.props,
            __xmluiPartId: partId,
          },
        },
      ], adapter.scope);
    }
    return adapter.renderChildren();
  },
});
