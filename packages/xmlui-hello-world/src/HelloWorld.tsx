import styles from "./HelloWorld.module.scss";
import { createComponentRenderer, parseScssVar, createMetadata } from "xmlui";
import { HelloWorld, defaultProps } from "./HelloWorldNative";

const HelloWorldMd = createMetadata({
  description:
    "`HelloWorld` is a demonstration component that shows basic XMLUI patterns.",
  status: "experimental",
  props: {
    message: {
      description: "The greeting message to display.",
      isRequired: false,
      type: "string",
      defaultValue: defaultProps.message,
    },
  },
  events: {
    onClick: {
      description:
        "Triggered when the click button is pressed. " + "Receives the current click count.",
      type: "function",
    },
    onReset: {
      description:
        "Triggered when the reset button is pressed. " + "Called when count is reset to 0.",
      type: "function",
    },
  },
  apis: {
    value: {
      description: "The current click count value.",
      type: "number",
    },
    setValue: {
      description: "Set the click count to a specific value.",
      type: "function",
    },
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    [`backgroundColor-HelloWorld`]: "$color-surface-50",
    [`textColor-HelloWorld`]: "$color-content-primary",
    dark: {
      [`backgroundColor-HelloWorld`]: "$color-surface-800",
      // No textColor override needed - $color-content-primary should auto-adapt
    },
  },
});

export const helloWorldComponentRenderer = createComponentRenderer(
  "HelloWorld",
  HelloWorldMd,

  ({ node, extractValue, lookupEventHandler, className, registerComponentApi }) => {
    return (
      <HelloWorld
        id={extractValue.asOptionalString(node.props?.id)}
        message={extractValue.asOptionalString(node.props?.message)}
        onClick={lookupEventHandler("onClick")}
        onReset={lookupEventHandler("onReset")}
        className={className}
        registerComponentApi={registerComponentApi}
      />
    );
  },
);
