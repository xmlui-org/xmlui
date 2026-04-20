import styles from "./ScrollToTop.module.scss";

import { wrapComponent, createMetadata, d, parseScssVar } from "xmlui";
import type { ComponentMetadata } from "xmlui";
import * as ScrollToTopNative from "./ScrollToTopReact";

const COMP = "ScrollToTop";
const { ScrollToTop, defaultProps } = ScrollToTopNative;

export const ScrollToTopMd: ComponentMetadata = createMetadata({
  status: "experimental",
  description: "A floating button that scrolls the page to the top when clicked",
  parts: {
    icon: {
      description: "The icon displayed inside the scroll to top button",
    }
  },
  props: {
    position: {
      description: "Horizontal position of the button at the bottom of the screen",
      valueType: "string",
      defaultValue: defaultProps.position,
      availableValues: ["start", "center", "end"],
    },
    visible: {
      description: "Whether the button is visible",
      valueType: "boolean",
      defaultValue: defaultProps.visible,
    },
    threshold: {
      description: "Scroll position threshold (in pixels) after which the button becomes visible",
      valueType: "number",
      defaultValue: defaultProps.threshold,
    },
    icon: {
      description: "Name of the icon to display in the button",
      valueType: "string",
      defaultValue: defaultProps.icon,
    },
    behavior: {
      description: "Scroll behavior when scrolling to top",
      valueType: "string",
      defaultValue: defaultProps.behavior,
      availableValues: ["smooth", "instant", "auto"],
    },
  },
  events: {
    click: {
      description: "Triggered when the scroll to top button is clicked",
    },
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    [`backgroundColor-${COMP}`]: "$color-primary",
    [`borderColor-${COMP}`]: "$color-primary-dark",
    [`color-${COMP}`]: "$color-surface-0",
    [`size-${COMP}-xs`]: "38px",
    [`size-${COMP}-sm`]: "42px",
    [`size-${COMP}-md`]: "42px",
    [`size-${COMP}-lg`]: "48px",
    [`horizontalSpacing-${COMP}-xs`]: "$space-6",
    [`horizontalSpacing-${COMP}-sm`]: "$space-8",
    [`horizontalSpacing-${COMP}-md`]: "$space-10",
    [`horizontalSpacing-${COMP}-lg`]: "$space-12",
    [`bottom-${COMP}-xs`]: "$space-10",
    [`bottom-${COMP}-sm`]: "$space-12",
    [`bottom-${COMP}-md`]: "$space-14",
    [`bottom-${COMP}-lg`]: "$space-16",
    [`borderRadius-${COMP}`]: "$space-24",
    [`shadow-${COMP}`]: "$shadow-lg",
    [`zIndex-${COMP}`]: "1000",
  },
});

export const scrollToTopComponentRenderer = wrapComponent(COMP, ScrollToTop, ScrollToTopMd, {
  booleans: ["visible"],
  numbers: ["threshold"],
});
