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
    to: {
      description: `This property defines an optional navigation link.`,
      valueType: "string",
    },
    icon: {
      description: `This property defines an optional icon to display along with the \`${COMP}\` label.`,
      valueType: "string",
    },
    iconHorizontalExpanded: {
      description: "Set an icon to display when the menu is expanded an a **horizontal** app layout.",
      valueType: "string",
      defaultValue: defaultProps.iconHorizontalExpanded,
    },
    iconVerticalExpanded: {
      description: "Set an icon to display when the menu is expanded an a **vertical** app layout.",
      valueType: "string",
      defaultValue: defaultProps.iconVerticalExpanded,
    },
    iconHorizontalCollapsed: {
      description: "Set an icon to display when the menu is collapsed an a **horizontal** app layout.",
      valueType: "string",
      defaultValue: defaultProps.iconHorizontalCollapsed,
    },
    iconVerticalCollapsed: {
      description: "Set an icon to display when the menu is collapsed an a **vertical** app layout.",
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
        renderChild={renderChild}
        iconHorizontalExpanded={extractValue.asOptionalString(node.props.iconHorizontalExpanded)}
        iconVerticalExpanded={extractValue.asOptionalString(node.props.iconVerticalExpanded)}
        iconHorizontalCollapsed={extractValue.asOptionalString(node.props.iconHorizontalCollapsed)}
        iconVerticalCollapsed={extractValue.asOptionalString(node.props.iconVerticalCollapsed)}
      />
    );
  },
);
