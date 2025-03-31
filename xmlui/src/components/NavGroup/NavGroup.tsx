import styles from "./NavGroup.module.scss";
import navLinkStyles from "../NavLink/NavLink.module.scss";

import { createMetadata, d } from "../../abstractions/ComponentDefs";
import { createComponentRenderer } from "../../components-core/renderers";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { Icon } from "../Icon/IconNative";
import { dLabel } from "../metadata-helpers";
import { defaultProps, NavGroup } from "./NavGroupNative";

const COMP = "NavGroup";

export const NavGroupMd = createMetadata({
  description:
    `The \`NavGroup\` component is a container for grouping related navigation targets ` +
    `(\`NavLink\` components). It can be displayed as a submenu in the App's UI.`,
  props: {
    label: dLabel(),
    initiallyExpanded: d('This property defines whether the group is initially expanded or collapsed.'),
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
        to={extractValue.asOptionalString(node.props.to)}
        icon={<Icon name={extractValue.asString(node.props.icon)} className={navLinkStyles.icon} />}
        node={node}
        initiallyExpanded={extractValue.asBoolean(node.props.initiallyExpanded)}
        renderChild={renderChild}
        iconHorizontalExpanded={extractValue.asOptionalString(node.props.iconHorizontalExpanded)}
        iconVerticalExpanded={extractValue.asOptionalString(node.props.iconVerticalExpanded)}
        iconHorizontalCollapsed={extractValue.asOptionalString(node.props.iconHorizontalCollapsed)}
        iconVerticalCollapsed={extractValue.asOptionalString(node.props.iconVerticalCollapsed)}
      />
    );
  },
);
