import { Fragment } from "react";
import { createMetadata } from "../abstractions/ComponentDefs";
import { createComponentRenderer } from "./renderers";

const COMP = "Fragment";
export const FragmentMd = createMetadata({
  description:
    "`Fragment` provides conditional rendering. You can use `when=` on any " +
    "component to render it conditionally, use `Fragment` to apply `when` to a group of components.",
  opaque: true,
});

export const fragmentComponentRenderer = createComponentRenderer(
  COMP,
  FragmentMd,
  ({ node, extractValue, renderChild, layoutContext }) => {
    return (
      <Fragment key={extractValue(node.uid)}>{renderChild(node.children, layoutContext)}</Fragment>
    );
  },
);
