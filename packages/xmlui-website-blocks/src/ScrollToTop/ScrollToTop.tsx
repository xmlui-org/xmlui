import styles from "./ScrollToTop.module.scss";

import { createComponentRenderer, createMetadata, d, parseScssVar } from "xmlui";
import * as ScrollToTopNative from "./ScrollToTopNative";

const COMP = "ScrollToTop";
const { ScrollToTop, defaultProps } = ScrollToTopNative;

export const ScrollToTopMd = createMetadata({
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
      type: "string",
      defaultValue: defaultProps.position,
      options: ["start", "center", "end"],
    },
    visible: {
      description: "Whether the button is visible",
      type: "boolean",
      defaultValue: defaultProps.visible,
    },
    threshold: {
      description: "Scroll position threshold (in pixels) after which the button becomes visible",
      type: "number",
      defaultValue: defaultProps.threshold,
    },
    icon: {
      description: "Name of the icon to display in the button",
      type: "string",
      defaultValue: defaultProps.icon,
    },
    behavior: {
      description: "Scroll behavior when scrolling to top",
      type: "string",
      defaultValue: defaultProps.behavior,
      options: ["smooth", "instant", "auto"],
    },
  },
  events: {
    click: d("Triggered when the scroll to top button is clicked"),
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
    [`borderRadius-${COMP}`]: "$space-24",
    [`shadow-${COMP}`]: "$shadow-lg",
    [`bottom-${COMP}`]: "$space-16",
    [`horizontalSpacing-${COMP}-xs`]: "$space-6",
    [`horizontalSpacing-${COMP}-sm`]: "$space-8",
    [`horizontalSpacing-${COMP}-md`]: "$space-10",
    [`horizontalSpacing-${COMP}-lg`]: "$space-12",
    [`zIndex-${COMP}`]: "1000",
  },
});

export const scrollToTopComponentRenderer = createComponentRenderer(
  COMP,
  ScrollToTopMd,
  ({ node, extractValue, className, lookupEventHandler }) => {
    const props = (node.props as typeof ScrollToTopMd.props)!;
    
    return (
      <ScrollToTop
        className={className}
        position={extractValue.asOptionalString(props.position, defaultProps.position)}
        visible={extractValue.asOptionalBoolean(props.visible, defaultProps.visible)}
        threshold={extractValue.asOptionalNumber(props.threshold, defaultProps.threshold)}
        icon={extractValue.asOptionalString(props.icon, defaultProps.icon)}
        behavior={extractValue.asOptionalString(props.behavior, defaultProps.behavior) as "smooth" | "instant" | "auto"}
        onClick={lookupEventHandler("click")} // This is not an error.
      />
    );
  },
);
