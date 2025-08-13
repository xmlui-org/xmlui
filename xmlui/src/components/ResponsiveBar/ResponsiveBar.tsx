import styles from "./ResponsiveBar.module.scss";

import { createComponentRenderer } from "../../components-core/renderers";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { createMetadata, dClick } from "../metadata-helpers";
import { defaultResponsiveBarProps, ResponsiveBar } from "./ResponsiveBarNative";

const COMP = "ResponsiveBar";

export const ResponsiveBarMd = createMetadata({
  status: "stable",
  description:
    "`ResponsiveBar` is a horizontal layout container that automatically manages child " +
    "component overflow by moving items that don't fit into a dropdown menu. It provides " +
    "a space-efficient way to display navigation items, toolbar buttons, or other components " +
    "that need to adapt to varying container widths while maintaining full functionality.",
  docFolder: COMP,
  props: {
    overflowIcon: {
      description: 
        "Icon to display in the dropdown trigger button when items overflow. " +
        "You can use component-specific icons in the format \"iconName:ResponsiveBar\".",
      valueType: "string",
      defaultValue: defaultResponsiveBarProps.overflowIcon,
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
    [`gap-${COMP}`]: "$gap-normal",
    [`backgroundColor-${COMP}`]: "transparent",
    [`padding-${COMP}`]: "0",
    [`margin-${COMP}`]: "0",
  },
});

export const responsiveBarComponentRenderer = createComponentRenderer(
  COMP,
  ResponsiveBarMd,
  ({ node, extractValue, renderChild, layoutCss, lookupEventHandler }) => {
    return (
      <ResponsiveBar
        overflowIcon={extractValue(node.props?.overflowIcon)}
        onClick={lookupEventHandler("click")}
        style={layoutCss}
      >
        {renderChild(node.children)}
      </ResponsiveBar>
    );
  },
);
