import styles from "./NavPanel.module.scss";

import { createMetadata } from "../../abstractions/ComponentDefs";
import { createComponentRenderer } from "../../components-core/renderers";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { dComponent } from "../metadata-helpers";
import { NavPanel, defaultProps } from "./NavPanelNative";

const COMP = "NavPanel";

export const NavPanelMd = createMetadata({
  description: `\`${COMP}\` is a placeholder within \`App\` to define the app's navigation (menu) structure.`,
  props: {
    logoTemplate: dComponent(
      `This property defines the logo template to display in the navigation panel with the ` +
        `\`vertical\` and \`vertical-sticky\` layout.`,
    ),
    inDrawer: {
      description: `This property determines if the navigation panel is displayed in a drawer.`,
      valueType: "boolean",
      defaultValue: defaultProps.inDrawer,
    },
  },
  themeVars: parseScssVar(styles.themeVars),
  limitThemeVarsToComponent: true,
  defaultThemeVars: {
    [`horizontalAlignment-logo-${COMP}`]: "center",
    [`backgroundColor-${COMP}`]: "$backgroundColor",
    [`backgroundColor-${COMP}-horizontal`]: "$backgroundColor-AppHeader",
    [`border-${COMP}`]: "0px solid $borderColor",
    [`paddingHorizontal-${COMP}`]: "0",
    [`paddingVertical-logo-${COMP}`]: "$space-4",
    [`paddingHorizontal-logo-${COMP}`]: "$space-4",
    [`marginBottom-logo-${COMP}`]: "$space-4",
    [`boxShadow-${COMP}-vertical`]: "4px 0 4px 0 rgb(0 0 0 / 10%)",
  },
});

export const navPanelRenderer = createComponentRenderer(
  COMP,
  NavPanelMd,
  ({ node, renderChild, layoutCss, className, layoutContext }) => {
    // TODO: How do we merge the `className` with the `layoutContext.themeClassName`?
    return (
      <NavPanel
        style={layoutCss}
        logoContent={renderChild(node.props.logoTemplate)}
        className={layoutContext?.themeClassName}
        inDrawer={layoutContext?.inDrawer}
        renderChild={renderChild}
      >
        {renderChild(node.children)}
      </NavPanel>
    );
  },
);
