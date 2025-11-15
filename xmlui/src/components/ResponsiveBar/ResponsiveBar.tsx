import styles from "./ResponsiveBar.module.scss";

import { createComponentRenderer } from "../../components-core/renderers";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { createMetadata, dClick } from "../metadata-helpers";
import { defaultResponsiveBarProps, ResponsiveBar } from "./ResponsiveBarNative";

const COMP = "ResponsiveBar";

export const ResponsiveBarMd = createMetadata({
  status: "stable",
  description:
    "`ResponsiveBar` is a layout container that automatically manages child " +
    "component overflow by moving items that don't fit into a dropdown menu. It supports " +
    "both horizontal and vertical orientations and provides a space-efficient way to display " +
    "navigation items, toolbar buttons, or other components that need to adapt to varying " +
    "container dimensions while maintaining full functionality.",
  docFolder: COMP,
  props: {
    orientation: {
      description:
        "Layout direction of the responsive bar. In horizontal mode, items are arranged " +
        "left-to-right and overflow is based on container width. In vertical mode, items are " +
        "arranged top-to-bottom and overflow is based on container height.",
      valueType: "string",
      availableValues: ["horizontal", "vertical"],
      defaultValue: defaultResponsiveBarProps.orientation,
    },
    overflowIcon: {
      description: 
        "Icon to display in the dropdown trigger button when items overflow. " +
        "You can use component-specific icons in the format \"iconName:ResponsiveBar\".",
      valueType: "string",
      defaultValue: defaultResponsiveBarProps.overflowIcon,
    },
    dropdownText: {
      description:
        "Text to display in the dropdown trigger button label when items overflow. " +
        "This text is used for accessibility and appears alongside the overflow icon.",
      valueType: "string",
      defaultValue: defaultResponsiveBarProps.dropdownText,
    },
    gap: {
      description: 
        "Gap between child elements in pixels. Controls the spacing between items " +
        "in the responsive bar layout.",
      valueType: "number",
      defaultValue: defaultResponsiveBarProps.gap,
    },
  },
  events: {
    click: dClick(COMP),
  },
  apis: {},
  contextVars: {},
  themeVars: parseScssVar(styles.themeVars),
  limitThemeVarsToComponent: true,
  defaultThemeVars: {
    [`backgroundColor-${COMP}`]: "transparent",
    [`padding-${COMP}`]: "0",
    [`margin-${COMP}`]: "0",
  },
});

export const responsiveBarComponentRenderer = createComponentRenderer(
  COMP,
  ResponsiveBarMd,
  ({ node, extractValue, renderChild, className, lookupEventHandler }) => {
    return (
      <ResponsiveBar
        orientation={extractValue(node.props?.orientation)}
        overflowIcon={extractValue(node.props?.overflowIcon)}
        dropdownText={extractValue(node.props?.dropdownText)}
        gap={extractValue(node.props?.gap)}
        onClick={lookupEventHandler("click")}
        className={className}
      >
        {renderChild(node.children)}
      </ResponsiveBar>
    );
  },
);
