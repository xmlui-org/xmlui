import { createComponentRenderer } from "../../components-core/renderers";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { createMetadata, d } from "../metadata-helpers";
import { DrawerNative, defaultProps } from "./DrawerNative";

import styles from "./Drawer.module.scss";

const COMP = "Drawer";

// =============================================================================
// Metadata
// =============================================================================

export const DrawerMd = createMetadata({
  status: "experimental",
  description:
    "`Drawer` is a panel that slides in from one of the four edges of the viewport. " +
    "It can be opened and closed programmatically using its API methods `open()` and `close()`. " +
    "An optional backdrop dims the content behind the drawer.",

  props: {
    position: {
      description:
        "Specifies the edge from which the drawer slides in. " +
        "Accepted values are `\"left\"`, `\"right\"`, `\"top\"`, and `\"bottom\"`.",
      valueType: "string",
      availableValues: ["left", "right", "top", "bottom"],
      defaultValue: defaultProps.position,
    },
    hasBackdrop: {
      description:
        "When `true`, a translucent overlay is shown behind the drawer while it is open.",
      valueType: "boolean",
      defaultValue: defaultProps.hasBackdrop,
    },
    initiallyOpen: {
      description: "When `true`, the drawer is open on its first render.",
      valueType: "boolean",
      defaultValue: defaultProps.initiallyOpen,
    },
    closeButtonVisible: {
      description:
        "When `true`, an \u2715 button is displayed in the top-right corner of the drawer that closes it when clicked.",
      valueType: "boolean",
      defaultValue: defaultProps.closeButtonVisible,
    },
    closeOnClickAway: {
      description:
        "When `true`, clicking outside the drawer panel closes it.",
      valueType: "boolean",
      defaultValue: defaultProps.closeOnClickAway,
    },
  },

  events: {
    open: {
      description: `Fired when the \`${COMP}\` is opened.`,
    },
    close: {
      description: `Fired when the \`${COMP}\` is closed.`,
    },
  },

  apis: {
    open: {
      description: `Opens the \`${COMP}\`. Invoke with \`drawerId.open()\`.`,
      signature: "open(): void",
    },
    close: {
      description: `Closes the \`${COMP}\`. Invoke with \`drawerId.close()\`.`,
      signature: "close(): void",
    },
    isOpen: {
      description: `Returns \`true\` when the \`${COMP}\` is currently open, \`false\` otherwise.`,
      signature: "isOpen(): boolean",
    },
  },

  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    [`backgroundColor-${COMP}`]: "$backgroundColor-primary",
    [`backgroundColor-backdrop-${COMP}`]: "rgba(0, 0, 0, 0.4)",
    [`borderRadius-${COMP}`]: "$borderRadius",
    [`boxShadow-${COMP}`]:
      "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)",
    [`padding-${COMP}`]: "$space-4",
    [`width-${COMP}`]: "320px",
    [`maxWidth-${COMP}`]: "50%",
    [`height-${COMP}`]: "320px",
    [`zIndex-${COMP}`]: "200",
    [`animationDuration-${COMP}`]: "250ms",
    [`animationEasing-${COMP}`]: "cubic-bezier(0.4, 0, 0.2, 1)",
  },
});

// =============================================================================
// Renderer
// =============================================================================

export const drawerComponentRenderer = createComponentRenderer(
  COMP,
  DrawerMd,
  ({  
    node,
    extractValue,
    renderChild,
    lookupEventHandler,
    registerComponentApi,
    className,
  }) => {
    // Read layout properties that should override the corresponding theme variables
    const backgroundColor = extractValue.asOptionalString(node.props.backgroundColor);

    return (
      <DrawerNative
        position={extractValue.asOptionalString(node.props.position, defaultProps.position) as any}
        hasBackdrop={extractValue.asOptionalBoolean(node.props.hasBackdrop, defaultProps.hasBackdrop)}
        initiallyOpen={extractValue.asOptionalBoolean(node.props.initiallyOpen, defaultProps.initiallyOpen)}
        closeButtonVisible={extractValue.asOptionalBoolean(node.props.closeButtonVisible, defaultProps.closeButtonVisible)}
        closeOnClickAway={extractValue.asOptionalBoolean(node.props.closeOnClickAway, defaultProps.closeOnClickAway)}
        onOpen={lookupEventHandler("open")}
        onClose={lookupEventHandler("close")}
        registerComponentApi={registerComponentApi}
        className={className}
        style={backgroundColor ? { backgroundColor } : undefined}
      >
        {renderChild(node.children)}
      </DrawerNative>
    );
  },
);
