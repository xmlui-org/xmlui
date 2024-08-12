import { Fragment } from "react";

import type { ComponentDef } from "@abstractions/ComponentDefs";

import { createComponentRenderer } from "@components-core/renderers";
import { ComponentDescriptor } from "@abstractions/ComponentDescriptorDefs";

// =====================================================================================================================
// XMLUI Avatar component definition
export interface FragmentComponentDef extends ComponentDef<"Fragment"> {}

export const metadata: ComponentDescriptor<FragmentComponentDef> = {
  displayName: "Fragment",
  description: "Groups multiple children into a single fragment",
  opaque: true
};

export const fragmentComponentRenderer = createComponentRenderer<FragmentComponentDef>(
  "Fragment",
  ({ node, extractValue, renderChild, layoutContext }) => {
    return <Fragment key={extractValue(node.uid)}>{renderChild(node.children, layoutContext)}</Fragment>;
  },
  metadata
);
