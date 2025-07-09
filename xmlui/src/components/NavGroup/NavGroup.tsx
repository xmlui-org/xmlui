import styles from "./NavGroup.module.scss";
import navLinkStyles from "../NavLink/NavLink.module.scss";

import { createComponentRenderer } from "../../components-core/renderers";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { Icon } from "../Icon/IconNative";
import { createMetadata, d, dEnabled, dLabel } from "../metadata-helpers";
import { defaultProps, NavGroup } from "./NavGroupNative";

const COMP = "NavGroup";

export const NavGroupMd = createMetadata({
  status: "stable",
  description:
    "`NavGroup` creates collapsible containers for organizing related navigation " +
    "items into hierarchical menu structures. It groups `NavLink` components and " +
    "other `NavGroup` components, providing expandable submenus with customizable " +
    "icons and states.",
  props: {
    label: dLabel(),
    initiallyExpanded: d(
      "This property defines whether the group is initially expanded or collapsed. If not " +
        "defined, the group is collapsed by default.",
    ),
    enabled: dEnabled(),
    to: {
      description: `This property defines an optional navigation link.`,
      valueType: "string",
    },
    icon: {
      description: `This property defines an optional icon to display along with the \`${COMP}\` label.`,
      valueType: "string",
    },
    iconHorizontalExpanded: {
      description:
        "Set a custom icon to display when the navigation menu is expanded, " +
        "is in a **horizontal** app layout, and is in a navigation submenu.",
      valueType: "string",
      defaultValue: defaultProps.iconHorizontalExpanded,
    },
    iconVerticalExpanded: {
      description:
        "Set a custom icon to display when the navigation menu is expanded, " +
        "is in a **vertical** app layout, or is in a **horizontal** layout and is the top-level navigation item in the menu.",
      valueType: "string",
      defaultValue: defaultProps.iconVerticalExpanded,
    },
    iconHorizontalCollapsed: {
      description:
        "Set a custom icon to display when the navigation menu is collapsed, " +
        "is in a **horizontal** app layout, and is in a navigation submenu.",
      valueType: "string",
      defaultValue: defaultProps.iconHorizontalCollapsed,
    },
    iconVerticalCollapsed: {
      description:
        "Set a custom icon to display when the navigation menu is collapsed, " +
        "is in a **vertical** app layout, or is in a **horizontal** layout and is the top-level navigation item in the menu.",
      valueType: "string",
      defaultValue: defaultProps.iconVerticalCollapsed,
    },
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    [`backgroundColor-dropdown-${COMP}`]: "$backgroundColor-primary",
    [`borderRadius-dropdown-${COMP}`]: "$borderRadius",
    [`boxShadow-dropdown-${COMP}`]: "$boxShadow-spread",
  },
});

export const navGroupComponentRenderer = createComponentRenderer(
  COMP,
  NavGroupMd,
  ({ node, extractValue, renderChild }) => {
    return (
      <NavGroup
        label={extractValue.asDisplayText(node.props.label)}
        disabled={!extractValue.asOptionalBoolean(node.props.enabled ?? true)}
        to={extractValue.asOptionalString(node.props.to)}
        icon={<Icon name={extractValue.asString(node.props.icon)} className={navLinkStyles.icon} />}
        node={node}
        initiallyExpanded={extractValue.asOptionalBoolean(node.props.initiallyExpanded)}
        renderChild={renderChild}
        iconHorizontalExpanded={extractValue.asOptionalString(node.props.iconHorizontalExpanded)}
        iconVerticalExpanded={extractValue.asOptionalString(node.props.iconVerticalExpanded)}
        iconHorizontalCollapsed={extractValue.asOptionalString(node.props.iconHorizontalCollapsed)}
        iconVerticalCollapsed={extractValue.asOptionalString(node.props.iconVerticalCollapsed)}
      />
    );
  },
);
