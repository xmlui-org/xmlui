import styles from "./HelloWorld.module.scss";
import { createComponentRenderer } from "../../components-core/renderers";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { createMetadata, dSetValueApi, dValue } from "../metadata-helpers";
import { HelloWorld, defaultProps } from "./HelloWorldNative";

const COMP = "HelloWorld";

export const HelloWorldMd = createMetadata({
  status: "experimental",
  description:
    "`HelloWorld` is a demonstration component that shows basic XMLUI patterns. " +
    "It displays a customizable greeting message with an interactive click counter.",
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
  },
  events: {
    onClick: {
      description: "Triggered when the click button is pressed. Receives the current click count.",
      type: "function",
    },
    onReset: {
      description: "Triggered when the reset button is pressed. Called when count is reset to 0.",
      type: "function",
    },
  },
  apis: {
    value: {
      description: "This API returns the current value of the HelloWorld component.",
      signature: "value(): string",
    },
    setValue: {
      description: "This API sets a new value for the HelloWorld component.",
      signature: "setValue(value: string): void",
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
    [`textColor-${COMP}`]: "$color-primary",
    [`maxWidth-${COMP}`]: "400px",

    // Content styling
    [`textAlign-${COMP}-content`]: "center",

    // Message styling
    [`marginBottom-${COMP}-message`]: "$space-4",
    [`fontSize-${COMP}-message`]: "$fontSize-lg",
    [`fontWeight-${COMP}-message`]: "$fontWeight-semibold",

    // Children styling
    [`margin-${COMP}-children`]: "$space-4 0",
    [`padding-${COMP}-children`]: "$space-3",
    [`backgroundColor-${COMP}-children`]: "$color-surface-100",
    [`borderRadius-${COMP}-children`]: "$borderRadius-sm",
    [`fontStyle-${COMP}-children`]: "italic",

    // Interactive container
    [`gap-${COMP}-interactive`]: "$space-3",

    // Click button styling
    [`backgroundColor-${COMP}-clickButton`]: "$color-primary-500",
    [`textColor-${COMP}-clickButton`]: "white",
    [`border-${COMP}-clickButton`]: "none",
    [`borderRadius-${COMP}-clickButton`]: "$borderRadius",
    [`padding-${COMP}-clickButton`]: "$space-3 $space-6",
    [`fontSize-${COMP}-clickButton`]: "$fontSize-base",
    [`fontWeight-${COMP}-clickButton`]: "$fontWeight-medium",
    [`transition-${COMP}-clickButton`]: "background-color 0.2s ease",
    [`backgroundColor-${COMP}-clickButton--hover`]: "$color-primary-600",
    [`transform-${COMP}-clickButton--active`]: "translateY(1px)",

    // Counter styling
    [`fontSize-${COMP}-counter`]: "$fontSize-lg",
    [`fontWeight-${COMP}-counter`]: "$fontWeight-medium",

    // Count badge styling
    [`backgroundColor-${COMP}-count`]: "$color-primary-100",
    [`textColor-${COMP}-count`]: "$color-primary-700",
    [`padding-${COMP}-count`]: "$space-1 $space-2",
    [`borderRadius-${COMP}-count`]: "$borderRadius-sm",
    [`fontWeight-${COMP}-count`]: "$fontWeight-bold",
    [`minWidth-${COMP}-count`]: "24px",

    // Reset button styling
    [`backgroundColor-${COMP}-resetButton`]: "$color-surface-400",
    [`textColor-${COMP}-resetButton`]: "white",
    [`border-${COMP}-resetButton`]: "none",
    [`borderRadius-${COMP}-resetButton`]: "$borderRadius-sm",
    [`padding-${COMP}-resetButton`]: "$space-2 $space-4",
    [`fontSize-${COMP}-resetButton`]: "$fontSize-sm",
    [`transition-${COMP}-resetButton`]: "background-color 0.2s ease",
    [`backgroundColor-${COMP}-resetButton--hover`]: "$color-surface-500",
  },
});

export const helloWorldComponentRenderer = createComponentRenderer(
  COMP,
  HelloWorldMd,
  ({ node, extractValue, renderChild, layoutCss, lookupEventHandler, registerComponentApi, updateState }) => {
    return (
      <HelloWorld
        id={extractValue.asOptionalString(node.props.id)}
        message={extractValue.asOptionalString(node.props.message)}
        onClick={lookupEventHandler("onClick")}
        onReset={lookupEventHandler("onReset")}
        registerComponentApi={registerComponentApi}
        updateState={updateState}
        style={layoutCss}
      >
        {renderChild(node.children)}
      </HelloWorld>
    );
  }
);
