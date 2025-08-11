import styles from "./NavPanel.module.scss";

import { createComponentRenderer } from "../../components-core/renderers";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { createMetadata, dComponent } from "../metadata-helpers";
import { NavPanel, defaultProps, buildNavHierarchy } from "./NavPanelNative";
import { useMemo } from "react";

const COMP = "NavPanel";

export const NavPanelMd = createMetadata({
  status: "stable",
  description:
    "`NavPanel` defines the navigation structure within an App, serving as a container " +
    "for NavLink and NavGroup components that create your application's primary " +
    "navigation menu. Its appearance and behavior automatically adapt based on the " +
    "App's layout configuration.",
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

function NavPanelWithBuiltNavHierarchy({
  node,
  renderChild,
  layoutCss,
  layoutContext,
  extractValue,
}) {
  const navLinks = useMemo(() => {
    return buildNavHierarchy(node.children, extractValue, undefined, []);
  }, [extractValue, node.children]);

  return (
    <NavPanel
      style={layoutCss}
      logoContent={renderChild(node.props.logoTemplate)}
      className={layoutContext?.themeClassName}
      inDrawer={layoutContext?.inDrawer}
      renderChild={renderChild}
      navLinks={navLinks}
    >
      {renderChild(node.children)}
    </NavPanel>
  );
}

export const navPanelRenderer = createComponentRenderer(
  COMP,
  NavPanelMd,
  ({ node, renderChild, layoutCss, layoutContext, extractValue }) => {
    return (
      <NavPanelWithBuiltNavHierarchy
        node={node}
        renderChild={renderChild}
        layoutCss={layoutCss}
        layoutContext={layoutContext}
        extractValue={extractValue}
      />
    );
  },
);
