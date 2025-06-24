import styles from "./HelloWorld.module.scss";
import { createMetadata } from "../../abstractions/ComponentDefs";
import { createComponentRenderer } from "../../components-core/renderers";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { HelloWorld, defaultProps } from "./HelloWorldNative";

const COMP = "HelloWorld";

export const HelloWorldMd = createMetadata({
  description:
    "`HelloWorld` is a demonstration component that shows basic XMLUI patterns. " +
    "It displays a customizable greeting message with an interactive click counter.",
  status: "experimental",
  props: {
    id: {
      description: "The unique identifier for the component.",
      type: "string",
    },
    message: {
      description: "The greeting message to display.",
      type: "string",
      defaultValue: defaultProps.message,
    },
    theme: {
      description: "Sets the visual theme of the component.",
      type: "string",
      availableValues: [
        { value: "default", description: "Default theme" },
        { value: "success", description: "Success theme (green)" },
      ],
    },
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    // Standard HelloWorld theme variables with visible defaults
    [`backgroundColor-${COMP}`]: "$color-surface-50",
    [`borderColor-${COMP}`]: "$color-surface-200",
    [`borderWidth-${COMP}`]: "$space-2",
    [`borderStyle-${COMP}`]: "solid",
    [`borderRadius-${COMP}`]: "$borderRadius",
    [`padding-${COMP}`]: "$space-4",
    [`textColor-${COMP}`]: "$color-primary",     // Dark gray text

    [`backgroundColor-${COMP}-success`]: "$color-success-50",
    [`borderColor-${COMP}-success`]: "$color-success-200",
    [`textColor-${COMP}-success`]: "$color-success-800",
  },
});

export const helloWorldComponentRenderer = createComponentRenderer(
  COMP,
  HelloWorldMd,
  ({ node, extractValue, renderChild, layoutCss }) => {
    return (
      <HelloWorld
        id={extractValue.asOptionalString(node.props.id)}
        message={extractValue.asOptionalString(node.props.message)}
        theme={extractValue.asOptionalString(node.props.theme)}
        style={layoutCss}
      >
        {renderChild(node.children)}
      </HelloWorld>
    );
  }
);
