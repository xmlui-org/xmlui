import { Fragment } from "react";
import { createMetadata } from "../abstractions/ComponentDefs";
import { createComponentRenderer } from "./renderers";

const COMP = "Fragment";
export const FragmentMd = createMetadata({
  description:
    "`Fragment` provides conditional rendering. You can use `when=` on any " +
    "component to render it conditionally, use `Fragment` to apply `when` to a group of components.",
  opaque: true,
  props: {
    when: {
      description: "Enables conditional rendering. If the expression evaluates to true, the component or group is rendered; otherwise, it is omitted. If omitted, the component is always rendered (equivalent to when={true}).",
      valueType: "boolean | expression"
    },
  },
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
