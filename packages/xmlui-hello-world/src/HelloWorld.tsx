import styles from "./HelloWorld.module.scss";
import { createComponentRenderer, parseScssVar, createMetadata } from "xmlui";
import { HelloWorld, defaultProps } from "./HelloWorldReact";

const HelloWorldMd = createMetadata({
  description:
    "`HelloWorld` is a demonstration component that shows basic XMLUI patterns.",
  status: "experimental",
  props: {
    message: {
      description: "The greeting message to display.",
      isRequired: false,
      valueType: "string",
      defaultValue: defaultProps.message,
    },
  },
  events: {
    onClick: {
      description:
        "Triggered when the click button is pressed. " + "Receives the current click count.",
    },
    onReset: {
      description:
        "Triggered when the reset button is pressed. " + "Called when count is reset to 0.",
    },
  },
  apis: {
    value: {
      description: "The current click count value.",
      signature: "value: number",
    },
    setValue: {
      description: "Set the click count to a specific value.",
      signature: "setValue(count: number): void",
    },
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    [`backgroundColor-HelloWorld`]: "$color-surface-50",
    [`textColor-HelloWorld`]: "$color-content-primary",
    [`backgroundColor-button-HelloWorld`]: "#4a90e2",
    [`textColor-button-HelloWorld`]: "white",
    [`borderRadius-button-HelloWorld`]: "4px",
    dark: {
      [`backgroundColor-HelloWorld`]: "$color-surface-800",
    },
  },
});

export const helloWorldComponentRenderer = createComponentRenderer(
  "HelloWorld",
  HelloWorldMd,

  ({ node, extractValue, lookupEventHandler, classes, registerComponentApi }) => {
    const props = node.props as unknown as Record<string, any>;
    return (
      <HelloWorld
        message={extractValue.asOptionalString(props?.message)}
        onClick={lookupEventHandler("onClick")}
        onReset={lookupEventHandler("onReset")}
        classes={classes}
        registerComponentApi={registerComponentApi}
      />
    );
  },
);
