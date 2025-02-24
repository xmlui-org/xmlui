import styles from "./NavPanel.module.scss";

import { createMetadata } from "../../abstractions/ComponentDefs";
import { createComponentRenderer } from "../../components-core/renderers";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { borderSubject } from "../../components-core/theming/themes/base-utils";
import { dComponent } from "../metadata-helpers";
import { NavPanel } from "./NavPanelNative";

const COMP = "NavPanel";

export const NavPanelMd = createMetadata({
  description: `\`${COMP}\` is a placeholder within \`App\` to define the app's navigation (menu) structure.`,
  props: {
    logoTemplate: dComponent(
      `This property defines the logo template to display in the navigation panel with the ` +
        `\`vertical\` and \`vertical-sticky\` layout.`,
    ),
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    [`color-bg-${COMP}`]: "transparent",
    [`border-${COMP}`]: '0px solid $color-border',
    [`padding-horizontal-${COMP}`]: "$space-4",
    [`padding-vertical-logo-${COMP}`]: "$space-4",
    [`padding-horizontal-logo-${COMP}`]: "$space-4",
    [`margin-bottom-logo-${COMP}`]: "$space-4",
    light: {
      [`shadow-${COMP}-vertical`]: "4px 0 4px 0 rgb(0 0 0 / 10%)",
    },
    dark: {
      [`shadow-${COMP}-vertical`]: "4px 0 6px 0 rgba(0, 0, 0, 0.2)",
    },
  },
});

export const navPanelRenderer = createComponentRenderer(
  COMP,
  NavPanelMd,
  ({ node, renderChild, layoutCss, layoutContext }) => {
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
