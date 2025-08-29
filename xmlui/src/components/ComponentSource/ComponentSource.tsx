import { createComponentRenderer } from "../../components-core/renderers";
import { ComponentSource, defaultProps } from "./ComponentSourceNative";
import { createMetadata, d } from "../metadata-helpers";

const COMP = "ComponentSource";

export const ComponentSourceMd = createMetadata({
  status: "experimental",
  description:
    `The \`${COMP}\` component extracts and provides the source code of XMLUI components. ` +
    `It uses the inspector's source extraction mechanisms to get the exact source code ` +
    `of the current component or a specified component.`,
  props: {
    autoLoad: {
      description: `Determines whether the component should automatically load the source code when mounted.`,
      valueType: "boolean",
      defaultValue: defaultProps.autoLoad,
    },
    onSourceLoaded: d(
      `Callback function that is called when the source code has been successfully loaded. ` +
      `Receives the extracted source code as a parameter.`,
    ),
    onError: d(
      `Callback function that is called when an error occurs while loading the source code. ` +
      `Receives the error message as a parameter.`,
    ),
    componentName: {
      description: `The name of the component whose source code should be extracted. ` +
        `If not provided, the component will try to determine the context from its uid.`,
      valueType: "string",
    },
  },
});

export const componentSourceComponentRenderer = createComponentRenderer(
  COMP,
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
