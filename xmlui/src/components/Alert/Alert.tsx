import type { ComponentDef } from "@abstractions/ComponentDefs";
import type { ComponentDescriptor } from "@abstractions/ComponentDescriptorDefs";

import styles from "./Alert.module.scss";

import { createComponentRenderer } from "@components-core/renderers";
import { desc } from "@components-core/descriptorHelper";
import { parseScssVar } from "@components-core/theming/themeVars";

// See reference implementation here: https://getbootstrap.com/docs/5.3/components/alerts/

/**
 * (**NOT IMPLEMENTED YET**) The \`Alert\` component is a panel used to display important notifications or feedback to users. It helps 
 * convey different statuses or levels of urgency, such as success, warning, error, and others.
 */
export interface AlertComponentDef extends ComponentDef<"Alert"> {
  props: {
    /**
     * @descriptionRef
     * @defaultValue "success"
     */
    statusColor?: "primary" | "secondary" | "success" | "danger" | "warning" | "info" | "light" | "dark";
    /**
     * This property's \`true\` value indicates if this alert is dismissable by the user. When the user closes the 
     * alert, it gets hidden.
     * @descriptionRef
     */
    dismissable?: boolean;
    /**
     * This property sets the alert's timeout. When the timeout expires, this component is hidden (independently 
     * from the value of \`dismissable\`).
     * @descriptionRef
     */
    autoDismissInMilliseconds?: number;
    /**
     * This property indicates if the alert should display an icon that represents the alert's status.
     * @descriptionRef
     */
    showIcon?: boolean;
    /**
     * This property sets the icon to be displayed in the alert. If this property is not defined, the icon 
     * is selected according to the \`statusColor\` value; otherwise, the specified icon is used.
     * @descriptionRef
     */
    icon?: string;
  };
  events: {
    /**
     * This event is triggered when the alert is dismissed. The event handler has a single boolean argument 
     * set to `true`, indicating that the user dismisses the alert. 
     * @descriptionRef
     */
    didDismiss?: (byUser: boolean) => void;
  };
  api: {
    /**
     * This method dismisses the alert. It triggers the \`didDismiss\` event with the argument set to \`false\`.
     */
    dismiss: () => void;
  };
}

const metadata: ComponentDescriptor<AlertComponentDef> = {
  displayName: "Accordion",
  description: "A collapsible container that toggles the display of content sections.",
  props: {
    statusColor: desc("Status color of the alert"),
    dismissable: desc("Indicates if the alert is dismissable"),
    autoDismissInMilliseconds: desc("Timeout for the alert to be dismissed"),
    showIcon: desc("Indicates if the alert should display an icon"),
    icon: desc("Icon to be displayed in the alert"),
  },
  events: {
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    light: {
    },
    dark: {
    },
  },
};

export const alertComponentRenderer = createComponentRenderer<AlertComponentDef>(
  "Alert",
  ({ node, extractValue, lookupEventHandler, layoutCss }) => {
    return <div style={{ backgroundColor: "red", color: "white" }}>Alert component is not implemented yet</div>;
  },
  metadata,
);
