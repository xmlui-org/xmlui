import { Fragment } from "react";
import { createMetadata } from "@abstractions/ComponentDefs";
import { createComponentRendererNew } from "@components-core/renderers";

const COMP = "Fragment";
export const FragmentMd = createMetadata({
  description: `The \`${COMP}\` component encloses multiple child components into a single root component, so it can be used where only a single component definition is allowed.`,
  opaque: true,
});

export const fragmentComponentRenderer = createComponentRendererNew(
  COMP,
  FragmentMd,
  ({ node, extractValue, renderChild, layoutContext }) => {
    return (
      <Fragment key={extractValue(node.uid)}>{renderChild(node.children, layoutContext)}</Fragment>
    );
  },
);
