import { Fragment } from "react";
import { wrapComponent } from "../../components-core/wrapComponent";
import { createMetadata } from "../metadata-helpers";
import { wrapComponent as wrapRuntimeComponent } from "../../runtime/rendering/adapter";

const COMP = "Fragment";
export const FragmentMd = createMetadata({
  status: "stable",
  description:
    "`Fragment` provides conditional rendering. You can use `when=` on any " +
    "component to render it conditionally, use `Fragment` to apply `when` to a group of components.",
  opaque: true,
  props: {
    // Note: 'when' is a universal property defined in ComponentDefCore, no need to redefine it here
  },
});

export const fragmentComponentRenderer = wrapComponent(COMP, Fragment as unknown as React.ComponentType, FragmentMd, {
  customRender: (_props, { node, extractValue, renderChild, layoutContext }) => {
    const renderedChild = renderChild(node.children, layoutContext);
    if (Array.isArray(renderedChild)) {
      return <Fragment key={extractValue(node.uid)}>{renderedChild}</Fragment>;
    }
    return renderedChild;
  },
});

export const fragmentRenderer = wrapRuntimeComponent({
  name: COMP,
  metadata: FragmentMd,
  renderer: ({ adapter }) => {
    const renderedChild = adapter.renderChildren(adapter.node.children);
    if (Array.isArray(renderedChild)) {
      return <Fragment key={adapter.stringProp("id")}>{renderedChild}</Fragment>;
    }
    return renderedChild;
  },
});
