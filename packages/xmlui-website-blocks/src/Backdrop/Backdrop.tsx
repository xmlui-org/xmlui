import styles from "./Backdrop.module.scss";

import { wrapComponent, createMetadata, dComponent, parseScssVar } from "xmlui";
import type { ComponentMetadata } from "xmlui";
import { Backdrop } from "./BackdropReact";

const COMP = "Backdrop";

export const BackdropMd: ComponentMetadata = createMetadata({
  status: "stable",
  description:
    `The \`${COMP}\` component is a semi-transparent overlay that appears on ` +
    `top of its child component to obscure or highlight the content behind it.`,
  props: {
    overlayTemplate: dComponent(
      "This property defines the component template for an optional overlay to display " +
        "over the component.",
    ),
    backgroundColor: {
      description: "The background color of the backdrop.",
      valueType: "string",
    },
    opacity: {
      description: "The opacity of the backdrop.",
      valueType: "string",
    },
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    [`backgroundColor-${COMP}`]: "transparent",
    [`opacity-${COMP}`]: "0.1",
  }
});

export const backdropComponentRenderer = wrapComponent(COMP, Backdrop, BackdropMd);
