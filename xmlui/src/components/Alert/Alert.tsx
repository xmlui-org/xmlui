import styles from "./Alert.module.scss";

import { createMetadata, d } from "../../abstractions/ComponentDefs";
import { createComponentRenderer } from "../../components-core/renderers";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { statusColorMd } from "../../components/abstractions";
import { Alert } from "./AlertNative";

const COMP = "Alert";

// See reference implementation here: https://getbootstrap.com/docs/5.3/components/alerts/

export const AlertMd = createMetadata({
  status: "in progress",
  description:
    `(**NOT IMPLEMENTED YET**) The \`${COMP}\` component is a panel used to display important ` +
    `notifications or feedback to users. It helps convey different statuses or levels of urgency, ` +
    `such as success, warning, error, and others.`,
  props: {
    statusColor: {
      description: `The value of this optional property sets the string to provide a color scheme for the ${COMP}.`,
      availableValues: statusColorMd,
      valueType: "string",
      defaultValue: "primary",
    },
    dismissable: {
      description:
        `This property's \`true\` value indicates if this alert is dismissable by the user. When the ` +
        `user closes the ${COMP}, it gets hidden.`,
      valueType: "boolean",
      defaultValue: true,
    },
    autoDismissInMs: {
      description: "Timeout for the alert to be dismissed",
      valueType: "number",
    },
    showIcon: {
      description: "Indicates if the alert should display an icon",
      valueType: "boolean",
      defaultValue: true,
    },
    icon: {
      description: "Icon to be displayed in the alert",
      valueType: "string",
    },
  },
  events: {},
  apis: {
    dismiss: d(
      `This method dismisses the ${COMP}. It triggers the \`didDismiss\` event with the argument set ` +
        `to \`false\`.`,
    ),
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    light: {},
    dark: {},
  },
});

export const alertComponentRenderer = createComponentRenderer(COMP, AlertMd, ({ layoutCss }) => {
  return <Alert />;
});
