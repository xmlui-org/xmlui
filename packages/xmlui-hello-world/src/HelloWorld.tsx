import styles from "./HelloWorld.module.scss";
import { createComponentRenderer, parseScssVar, createMetadata } from "xmlui";
import { HelloWorld, defaultProps } from "./HelloWorldNative";

const HelloWorldMd = createMetadata({
  description: "`HelloWorld` is a demonstration component.",
  status: "experimental",
  props: {
    message: {
      description: "The message to display.",
      isRequired: false,
      type: "string",
      defaultValue: defaultProps.message,
    },
    theme: {
      description: "Visual theme variant.",
      isRequired: false,
      type: "string",
      availableValues: ["default", "success"],
      defaultValue: defaultProps.theme,
    },
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    [`backgroundColor-HelloWorld`]: "$color-surface-50",
    [`textColor-HelloWorld`]: "$color-content-primary",
    [`backgroundColor-HelloWorld--success`]: "$color-success-50",
    [`textColor-HelloWorld--success`]: "$color-success-700",
    dark: {
      [`backgroundColor-HelloWorld`]: "$color-surface-200",
      [`textColor-HelloWorld`]: "$color-content-primary",
      [`backgroundColor-HelloWorld--success`]: "$color-success-200",
      [`textColor-HelloWorld--success`]: "$color-success-800",
    },
  },
});

export const helloWorldComponentRenderer = createComponentRenderer(
  "HelloWorld",
  HelloWorldMd,
  ({ node, extractValue }) => {
    return (
      <HelloWorld
        id={extractValue.asOptionalString(node.props?.id)}
        message={extractValue.asOptionalString(node.props?.message, defaultProps.message)}
        theme={extractValue.asOptionalString(node.props?.theme, defaultProps.theme)}
      />
    );
  }
);
