import type { ComponentDef } from "@abstractions/ComponentDefs";
import { createComponentRenderer } from "@components-core/renderers";
import { Helmet } from "react-helmet-async";
import { ComponentDescriptor } from "@abstractions/ComponentDescriptorDefs";
import { desc } from "@components-core/descriptorHelper";

// =====================================================================================================================
// React PageMetaTitle component implementation

const PageMetaTitle = ({ title }: { title: string }) => {
  return <Helmet title={title} />;
};

// =====================================================================================================================
// XMLUI PageMetaTitle component definition

/**
 * A \`PageMetaTitle\` component allows setting up (or changing) the app title to display with the 
 * current browser tab.
 */
export interface PageMetaTitleComponentDef extends ComponentDef<"PageMetaTitle"> {
  props: {
    /**
     * This property sets the page's title to display in the browser tab.
     */
    value: string;
  };
}

const metadata: ComponentDescriptor<PageMetaTitleComponentDef> = {
  displayName: "PageMetaTitle",
  description: "This component defines the title to add to the current page's metadata",
  props: {
    value: desc("Page title"),
  },
};

export const pageMetaTitleComponentRenderer = createComponentRenderer<PageMetaTitleComponentDef>(
  "PageMetaTitle",
  ({ node, extractValue }) => {
    return <PageMetaTitle title={extractValue(node.props.value)} />;
  },
  metadata
);
