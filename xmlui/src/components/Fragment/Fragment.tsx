import { Fragment } from "react";

import { createMetadata } from "../../component-core/metadata/helpers";
import { wrapComponent } from "../../runtime/rendering/adapter";

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

export const fragmentRenderer = wrapComponent({
  name: COMP,
  metadata: FragmentMd,
  renderer: ({ adapter }) => {
    const renderedChild = adapter.renderChildren();
    if (Array.isArray(renderedChild)) {
      return <Fragment key={`${adapter.node.range.start}:${adapter.node.range.end}`}>{renderedChild}</Fragment>;
    }
    return renderedChild;
  },
});
