import { createComponentRenderer, createMetadata } from "xmlui";
import { ComponentSource, defaultProps } from "./ComponentSourceNative";

const ComponentSourceMd = createMetadata({
  description: "ComponentSource component that fetches and exposes the source code of the current component",
  status: "experimental",
  props: {
    autoLoad: {
      description: "Whether to automatically load the source code on mount",
      isRequired: false,
      type: "boolean",
      defaultValue: true,
    },
    onSourceLoaded: {
      description: "Callback function called when source code is loaded",
      isRequired: false,
      type: "function",
    },
    onError: {
      description: "Callback function called when an error occurs",
      isRequired: false,
      type: "function",
    },
  },
});

export const componentSourceComponentRenderer = createComponentRenderer(
  "ComponentSource",
  ComponentSourceMd,
  ({ node, extractValue, updateState, appContext }: any) => {
    console.log('ComponentSource renderer called with node:', node);
    console.log('ComponentSource renderer node.parent:', node.parent);
    console.log('ComponentSource renderer node.parent?.type:', node.parent?.type);
    console.log('ComponentSource renderer node.parent?.name:', node.parent?.name);

    const autoLoad = extractValue.asOptionalBoolean(node.props?.autoLoad, true);
    const onSourceLoaded = extractValue(node.props?.onSourceLoaded);
    const onError = extractValue(node.props?.onError);

    // Try to get component name from various sources
    let componentName = null;

    // Check if we're in a component context by looking at the node's parent
    if (node.parent && node.parent.type === "Component") {
      componentName = node.parent.name;
      console.log('ComponentSource renderer found component name from parent:', componentName);
    }

    // Also check if we're in a page context
    if (!componentName && node.parent && node.parent.type === "Page") {
      const pageUrl = node.parent.props?.url;
      if (pageUrl) {
        const pageName = pageUrl.split('/').pop() || pageUrl;
        componentName = pageName.charAt(0).toUpperCase() + pageName.slice(1);
        console.log('ComponentSource renderer found page name:', componentName);
      }
    }

    console.log('ComponentSource renderer final componentName:', componentName);

    return (
      <ComponentSource
        autoLoad={autoLoad}
        onSourceLoaded={onSourceLoaded}
        onError={onError}
        updateState={updateState}
        componentName={componentName}
        uid={node.uid}
      />
    );
  },
);