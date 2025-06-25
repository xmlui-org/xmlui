import { Fragment } from "react";
import { createMetadata } from "../abstractions/ComponentDefs";
import { createComponentRenderer } from "./renderers";

const COMP = "Fragment";
export const FragmentMd = createMetadata({
  description:
    "!!!`Fragment` provides conditional rendering and grouping of components. It's often " +
    "used to hide components until their dependent variables are available.",
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
