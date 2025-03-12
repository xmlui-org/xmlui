import styles from "./NavGroup.module.scss";
import navLinkStyles from "../NavLink/NavLink.module.scss";

import { createMetadata, d } from "../../abstractions/ComponentDefs";
import { createComponentRenderer } from "../../components-core/renderers";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { Icon } from "../Icon/IconNative";
import { dLabel } from "../metadata-helpers";
import { NavGroup } from "./NavGroupNative";

const COMP = "NavGroup";

export const NavGroupMd = createMetadata({
  description:
    `The \`NavGroup\` component is a container for grouping related navigation targets ` +
    `(\`NavLink\` components). It can be displayed as a submenu in the App's UI.`,
  props: {
    label: dLabel(),
    icon: d(`This property defines an optional icon to display along with the \`${COMP}\` label.`),
    to: d(`This property defines an optional navigation link.`),
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    [`backgroundColor-dropdown-${COMP}`]: "$backgroundColor-primary",
    [`borderRadius-dropdown-${COMP}`]: "$borderRadius",
    [`boxShadow-dropdown-${COMP}`]: "$shadow-spread",
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
      />
    );
  },
);
