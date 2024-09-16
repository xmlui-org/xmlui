import { createMetadata, d } from "@abstractions/ComponentDefs";

import styles from "./Alert.module.scss";

import { createComponentRendererNew } from "@components-core/renderers";
import { parseScssVar } from "@components-core/theming/themeVars";
import { Alert } from "./AlertNative";
import { statusColorNames } from "@components/abstractions";

const COMP = "Alert";

// See reference implementation here: https://getbootstrap.com/docs/5.3/components/alerts/

export const AlertMd = createMetadata({
  description:
    `(**NOT IMPLEMENTED YET**) The \`${COMP}\` component is a panel used to display important ` +
    `notifications or feedback to users. It helps convey different statuses or levels of urgency, ` +
    `such as success, warning, error, and others.`,
  props: {
    statusColor: d(
      `The value of this optional property sets the string to provide a color scheme for the ${COMP}.`,
      statusColorNames,
    ),
    dismissable: d(
      `This property's \`true\` value indicates if this alert is dismissable by the user. When the ` +
        `user closes the ${COMP}, it gets hidden.`,
    ),
    autoDismissInMs: d("Timeout for the alert to be dismissed"),
    showIcon: d("Indicates if the alert should display an icon"),
    icon: d("Icon to be displayed in the alert"),
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

export const alertComponentRenderer = createComponentRendererNew(
  COMP,
  AlertMd,
  ({ node, extractValue, lookupEventHandler, layoutCss }) => {
    return <Alert />;
  },
);
