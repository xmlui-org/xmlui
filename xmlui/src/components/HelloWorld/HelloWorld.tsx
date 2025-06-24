import styles from "./HelloWorld.module.scss";
import { createMetadata } from "../../abstractions/ComponentDefs";
import { createComponentRenderer } from "../../components-core/renderers";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { HelloWorld, defaultProps, HelloWorldRef } from "./HelloWorldNative";

const COMP = "HelloWorld";

export const HelloWorldMd = createMetadata({
  description:
    "`HelloWorld` is a demonstration component that shows basic XMLUI patterns. " +
    "It displays a customizable greeting message with an interactive click counter " +
    "and supports different visual themes.",
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
      isRequired: false,
      type: "string",
      availableValues: [
        { value: "default", description: "Default theme" },
        { value: "success", description: "Success theme (green)" },
        { value: "warning", description: "Warning theme (yellow)" },
        { value: "error", description: "Error theme (red)" },
      ],
      defaultValue: defaultProps.theme,
    },
    showCounter: {
      description: "Whether to show the click counter.",
      type: "boolean",
      defaultValue: defaultProps.showCounter,
    },
  },
  events: {
    click: {
      description: `This event is triggered when the ${COMP} button is clicked. Receives the current click count as a parameter.`,
    },
    reset: {
      description: `This event is triggered when the reset button is clicked.`,
    },
  },
  apis: {
    reset: {
      description: `Resets the click counter to zero.`,
    },
    getClickCount: {
      description: `Returns the current click count.`,
      returnType: "number",
    },
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    [`backgroundColor-${COMP}`]: "$color-surface-50",
    [`borderColor-${COMP}`]: "$color-surface-200",
    [`borderRadius-${COMP}`]: "$borderRadius",
    [`padding-${COMP}`]: "$space-6",
    [`textColor-${COMP}`]: "$color-surface-900",
    
    // Theme colors
    [`backgroundColor-${COMP}-success`]: "$color-success-50",
    [`borderColor-${COMP}-success`]: "$color-success-200",
    [`textColor-${COMP}-success`]: "$color-success-800",
    
    [`backgroundColor-${COMP}-warning`]: "$color-warning-50", 
    [`borderColor-${COMP}-warning`]: "$color-warning-200",
    [`textColor-${COMP}-warning`]: "$color-warning-800",
    
    [`backgroundColor-${COMP}-error`]: "$color-danger-50",
    [`borderColor-${COMP}-error`]: "$color-danger-200", 
    [`textColor-${COMP}-error`]: "$color-danger-800",
    
    // Button styles
    [`backgroundColor-button-${COMP}`]: "$color-primary-500",
    [`textColor-button-${COMP}`]: "$color-surface-50",
    [`backgroundColor-button-${COMP}--hover`]: "$color-primary-600",
  },
});

export const helloWorldComponentRenderer = createComponentRenderer(
  COMP,
  HelloWorldMd,
  ({ 
    node, 
    extractValue, 
    renderChild, 
    lookupEventHandler, 
    layoutCss,
    registerComponentApi
  }) => {
    return (
      <HelloWorld
        id={extractValue.asOptionalString(node.props.id)}
        message={extractValue.asOptionalString(node.props.message)}
        theme={extractValue.asOptionalString(node.props.theme)}
        showCounter={extractValue.asOptionalBoolean(node.props.showCounter)}
        style={layoutCss}
        onClick={(clickCount) => {
          const handler = lookupEventHandler("click");
          if (handler) {
            handler({ clickCount });
          }
        }}
        onReset={() => {
          const handler = lookupEventHandler("reset");
          if (handler) {
            handler();
          }
        }}
        registerComponentApi={registerComponentApi}
      >
        {renderChild(node.children)}
      </HelloWorld>
    );
  }
);
