import { Fragment } from "react";
import { createComponentRenderer } from "../../components-core/renderers";
import { createMetadata } from "../metadata-helpers";

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

export const fragmentComponentRenderer = createComponentRenderer(
  COMP,
  FragmentMd,
  ({ node, extractValue, renderChild, layoutContext }) => {
    let renderedChild = renderChild(node.children, layoutContext);
    if(Array.isArray(renderedChild)) {
      return <Fragment key={extractValue(node.uid)}>{renderedChild}</Fragment>
    }
    return renderedChild;
  },
);
