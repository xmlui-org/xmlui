import { createComponentRenderer } from "../../components-core/renderers";
import { createMetadata, d } from "../metadata-helpers";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { NotificationToastNative, defaultProps } from "./NotificationToastNative";
import styles from "./NotificationToast.module.scss";

const COMP = "NotificationToast";

export const NotificationToastMd = createMetadata({
  status: "stable",
  description: "A notification toast system that displays temporary messages to the user. Automatically manages stacking and animation of multiple toasts.",
  nonVisual: false,
  props: {
    toastDuration: d(
      "The duration in milliseconds that a toast should be visible before automatically dismissing.",
      undefined,
      "number",
      defaultProps.toastDuration
    ),
  },
  events: {},
  apis: {},
  contextVars: {},
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    "backgroundColor-NotificationToast": "white",
    "borderColor-NotificationToast": "#e1e5e9", 
    "textColor-NotificationToast": "inherit",
    "shadowColor-NotificationToast": "rgba(0, 0, 0, 0.15)",
    "borderRadius-NotificationToast": "4px",
    "padding-NotificationToast": "12px 16px",
    "maxWidth-NotificationToast": "300px",
    "containerSpacing-NotificationToast": "20px",
    "toastSpacing-NotificationToast": "68px",
    "iconSuccessBackground-NotificationToast": "#10b981",
    "iconErrorBackground-NotificationToast": "#ef4444",
    "modalTopOffset-NotificationToast": "60px",
  },
});

export const notificationToastComponentRenderer = createComponentRenderer(
  COMP,
  NotificationToastMd,
  ({ node, extractValue }) => {
    const toastDuration = extractValue.asOptionalNumber(node.props.toastDuration, defaultProps.toastDuration);

    return (
      <NotificationToastNative
        toastDuration={toastDuration}
      />
    );
  },
);
