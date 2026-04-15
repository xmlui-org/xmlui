import styles from "./Inspector.module.scss";

import { parseScssVar } from "../../components-core/theming/themeVars";
import { wrapComponent } from "../../components-core/wrapComponent";
import { createMetadata, d } from "../metadata-helpers";
import { Inspector, defaultProps } from "./InspectorNative";

const COMP = "Inspector";

export const InspectorMd = createMetadata({
  status: "experimental",
  description:
    "`Inspector` provides an in-app trace viewer for XMLUI applications. " +
    "It renders a clickable icon that opens a modal dialog containing the " +
    "XMLUI Inspector (xs-diff.html), which displays interactive timelines " +
    "of interactions, API calls, state changes, and handler timing.",
  props: {
    src: {
      description:
        "Path to the inspector HTML file. The file must be accessible " +
        "from the app's root directory.",
      valueType: "string",
      defaultValue: defaultProps.src,
    },
    tooltip: d("Tooltip text shown when hovering over the inspector icon."),
    dialogTitle: d("Title displayed in the inspector modal dialog header."),
    dialogWidth: d("Minimum width of the inspector modal dialog."),
    dialogHeight: d("Minimum height of the inspector modal dialog."),
  },
  apis: {
    open: {
      description: "Opens the inspector dialog programmatically.",
      signature: "open(): void",
    },
    close: {
      description: "Closes the inspector dialog programmatically.",
      signature: "close(): void",
    },
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    [`color-icon-${COMP}`]: "$color-surface-500",
  },
});

export const inspectorComponentRenderer = wrapComponent(COMP, Inspector, InspectorMd, {
  strings: ["tooltip", "dialogTitle", "dialogWidth", "dialogHeight"],
  exposeRegisterApi: true,
});
