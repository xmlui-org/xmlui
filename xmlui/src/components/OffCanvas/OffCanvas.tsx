import { createMetadata, d } from "@abstractions/ComponentDefs";

import styles from "./OffCanvas.module.scss";

import { createComponentRenderer } from "@components-core/renderers";
import { parseScssVar } from "@components-core/theming/themeVars";
import { OffCanvas } from "./OffCanvasNative";
import { placementNames } from "@components/abstractions";
import { dDidClose, dDidOpen } from "@components/metadata-helpers";

const COMP = "OffCanvas";

// See reference implementation here: https://getbootstrap.com/docs/5.3/components/alerts/

export const OffCanvasMd = createMetadata({
  status: "in review",
  description:
    `(**NOT IMPLEMENTED YET**) The \`OffCanvas\` component is a hidden panel that slides into view ` +
    `from the side of the screen. It helps display additional content or navigation without disrupting ` +
    `the main interface.`,
  props: {
    enableBackdrop: d(
      `This property indicates if the backdrop is enabled when the component is displayed. When the ` +
        `backdrop is not enabled, clicking outside \`OffCanvas\` will not close it.`,
      null,
      "boolean",
      true,
    ),
    enableBodyScroll: d(
      `This property indicates if the body scroll is enabled when the component is displayed.`,
      null,
      "boolean",
      false,
    ),
    noCloseOnBackdropClick: d(
      `When this property is set to \`true\`, the ${COMP} does not close when the user clicks on its backdrop.`,
      null,
      "boolean",
      false,
    ),
    placement: d(
      `This property indicates the position where the ${COMP} should be docked to.`,
      placementNames,
    ),
    autoCloseInMs: d(
      `This property sets a timeout. When the timeout expires, the component gets hidden.`,
    ),
  },
  events: {
    didOpen: dDidOpen(COMP),
    didClose: dDidClose(COMP),
  },
  apis: {
    open: d(
      `This method opens the component. It triggers the \`didOpen\` event  with the argument ` +
        `set to \`false\`.`,
    ),
    close: d(
      `This method closes the component. It triggers the \`didClose\` event with the argument ` +
        `set to \`false\`.`,
    ),
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    light: {},
    dark: {},
  },
});

export const offCanvasComponentRenderer = createComponentRenderer(
  COMP,
  OffCanvasMd,
  ({ node, extractValue, lookupEventHandler, layoutCss }) => {
    return <OffCanvas />;
  },
);
