import styles from "./HelloWorld.module.scss";
import { createMetadata } from "../../abstractions/ComponentDefs";
import { createComponentRenderer } from "../../components-core/renderers";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { HelloWorld, defaultProps, HelloWorldRef } from "./HelloWorldNative";

const COMP = "HelloWorld";

// Temporarily simplified for Edge compatibility testing
export const HelloWorldMd = createMetadata({
  description: "Simple HelloWorld component for testing.",
  status: "experimental",
  props: {
    message: {
      description: "The greeting message to display.",
      type: "string",
    },
  },
  // Temporarily removed complex metadata
  // events: {},
  // apis: {},
  // themeVars: parseScssVar(styles.themeVars),
  // defaultThemeVars: {},
});

export const helloWorldComponentRenderer = createComponentRenderer(
  COMP,
  HelloWorldMd,
  ({ node, extractValue, renderChild, layoutCss }) => {
    // Simplified renderer for Edge compatibility testing
    return (
      <HelloWorld
        message={extractValue.asOptionalString(node.props.message)}
        style={layoutCss}
      >
        {renderChild(node.children)}
      </HelloWorld>
    );
  }
);
