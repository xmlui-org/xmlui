import { wrapComponent } from "../../components-core/wrapComponent";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { paddingSubject } from "../../components-core/theming/themes/base-utils";
import { createMetadata, dComponent } from "../metadata-helpers";
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
        "Specifies the edge from which the drawer slides in.",
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
    headerTemplate: dComponent(
      "A custom template rendered in the sticky header area, next to the close button.",
    ),
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
    ...paddingSubject(COMP, { horizontal: "$space-4", vertical: "$space-4" }),
    [`gap-${COMP}`]: "$space-4",
    [`width-${COMP}`]: "320px",
    [`maxWidth-${COMP}`]: "80%",
    [`height-${COMP}`]: "320px",
    [`maxHeight-${COMP}`]: "50%",
    [`zIndex-${COMP}`]: "200",
    [`animationDuration-${COMP}`]: "250ms",
    [`animationEasing-${COMP}`]: "cubic-bezier(0.4, 0, 0.2, 1)",
    [`top-closeButton-${COMP}`]: "$space-2",
    [`right-closeButton-${COMP}`]: "$space-3",
  },
});

// =============================================================================
// Renderer
// =============================================================================

export const drawerComponentRenderer = wrapComponent(COMP, DrawerNative, DrawerMd, {
  exposeRegisterApi: true,
  customRender: (props, { node, extractValue, renderChild }) => {
    // Read layout properties that should override the corresponding theme variables
    const backgroundColor = extractValue.asOptionalString(node.props.backgroundColor);

    return (
      <DrawerNative
        {...props}
        style={backgroundColor ? { backgroundColor } : undefined}
      >
        {renderChild(node.children)}
      </DrawerNative>
    );
  },
});
