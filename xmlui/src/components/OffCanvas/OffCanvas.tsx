import type { ComponentDef } from "@abstractions/ComponentDefs";
import type { ComponentDescriptor } from "@abstractions/ComponentDescriptorDefs";

import styles from "./OffCanvas.module.scss";

import { createComponentRenderer } from "@components-core/renderers";
import { desc } from "@components-core/descriptorHelper";
import { parseScssVar } from "@components-core/theming/themeVars";

// See reference implementation here: https://getbootstrap.com/docs/5.3/components/alerts/

/**
 * (**NOT IMPLEMENTED YET**) The \`OffCanvas\` component is a hidden panel that slides into view from the side of the screen. It helps
 * display additional content or navigation without disrupting the main interface.
 */
export interface OffCanvasComponentDef extends ComponentDef<"OffCanvas"> {
  props: {
    /**
     * This property indicates if the backdrop is enabled when the component is displayed. By default, this value
     * is \`true\`. When the backdrop is not enabled, clicking outside \`OffCanvas\` will not close it.
     * @descriptionRef
     * @defaultValue true
     */
    enableBackdrop?: boolean;
    /**
     * This property indicates if the body scroll is enabled when the component is displayed. By default, this value
     * is \`false\`.
     * @descriptionRef
     * @defaultValue false
     */
    enableBodyScroll?: boolean;

    /**
     * When this property is set to `true`, the `OffCanvas` does not close when the user clicks on its backdrop.
     * @descriptionRef
     * @defaultValue false
     */
    noCloseOnBackdropClick?: boolean;

    /**
     * This property indicates the position where the `OffCanvas` should be docked to. The possible values are:
     * @descriptionRef
     * @defaultValue "start"
     */
    placement?: "start" | "end" | "top" | "bottom";

    /**
     * This property sets a timeout. When the timeout expires, the component gets hidden.
     * @descriptionRef
     */
    autoCloseInMilliseconds?: number;
  };
  events: {
    /**
     * This event is triggered when the component has been displayed. The event handler has a single boolean argument
     * set to `true`, indicating that the user closed the component.
     * @descriptionRef
     */
    didOpen?: () => void;
    /**
     * This event is triggered when the component has been closed. The event handler has a single boolean argument
     * set to `true`, indicating that the user closed the component.
     * @descriptionRef
     */
    didClose?: (byUser: boolean) => void;
  };
  api: {
    /**
     * This method opens the component. It triggers the \`didOpen\` event.
     */
    open: () => void;
    /**
     * This method closes the component. It triggers the \`didClose\` event with the argument set to \`false\`.
     */
    close: () => void;
  };
}

const metadata: ComponentDescriptor<OffCanvasComponentDef> = {
  displayName: "OffCanvas",
  description: "A hidden panel that slides into view from the side of the screen.",
  props: {
    enableBackdrop: desc("Indicates if the backdrop is enabled when the component is displayed"),
    enableBodyScroll: desc("Indicates if the body scroll is enabled when the component is displayed"),
    noCloseOnBackdropClick: desc("Indicates if the OffCanvas does not close when the user clicks on its backdrop"),
    placement: desc("Position where the OffCanvas should be docked to"),
    autoCloseInMilliseconds: desc("Timeout for the component to be hidden"),
  },
  events: {
    didOpen: desc("This event is triggered when the component has been displayed"),
    didClose: desc("This event is triggered when the component has been closed"),
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    light: {},
    dark: {},
  },
};

export const offCanvasComponentRenderer = createComponentRenderer<OffCanvasComponentDef>(
  "OffCanvas",
  ({ node, extractValue, lookupEventHandler, layoutCss }) => {
    return <div style={{ backgroundColor: "red", color: "white" }}>OffCanvas component is not implemented yet</div>;
  },
  metadata,
);
