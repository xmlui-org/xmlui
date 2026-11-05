import styles from "./Inspector.module.scss";

import { parseScssVar } from "../../components-core/theming/themeVars";
import { wrapComponent } from "../../components-core/wrapComponent";
import { createMetadata } from "../metadata-helpers";
import { defaultProps } from "./Inspector.defaults";
import { Inspector } from "./InspectorReact";

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
        "from the app's root directory. The viewer imports `xmlui-parser.es.js` " +
        "from the same directory.",
      valueType: "string",
      defaultValue: defaultProps.src,
    },
    fetchMissing: {
      description:
        "When `true`, a viewer file that is missing locally (`xs-diff.html` or " +
        "`xmlui-parser.es.js`) is loaded from the `xmlui` npm package on jsDelivr, " +
        "pinned to the version of the running runtime. Local files still take " +
        "precedence. When `false`, the Inspector never fetches from the network and " +
        "shows an error naming the missing file instead.",
      valueType: "boolean",
      defaultValue: defaultProps.fetchMissing,
    },
    tooltip: {
      description: "Tooltip text shown when hovering over the inspector icon.",
    },
    dialogTitle: {
      description: "Title displayed in the inspector modal dialog header.",
    },
    dialogWidth: {
      description: "Minimum width of the inspector modal dialog.",
    },
    dialogHeight: {
      description: "Minimum height of the inspector modal dialog.",
    },
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
    [`backgroundColor-dialog-${COMP}`]: "$color-surface-300",
  },
});

export const inspectorComponentRenderer = wrapComponent(COMP, Inspector, InspectorMd, {
  strings: ["tooltip", "dialogTitle", "dialogWidth", "dialogHeight"],
  booleans: ["fetchMissing"],
  exposeRegisterApi: true,
});
