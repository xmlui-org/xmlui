import { createMetadata, d } from "@abstractions/ComponentDefs";
import { createComponentRenderer } from "@components-core/renderers";
import styles from "./NavGroup.module.scss";
import { Icon } from "@components/Icon/IconNative";
import navLinkStyles from "@components/NavLink/NavLink.module.scss";
import { parseScssVar } from "@components-core/theming/themeVars";
import { NavGroup } from "./NavGroupNative";
import { dLabel } from "@components/metadata-helpers";

const COMP = "NavGroup";

export const NavGroupMd = createMetadata({
  description:
    `The \`NavGroup\` component is a container for grouping related navigation targets ` +
    `(\`NavLink\` components). It can be displayed as a submenu in the App's UI.`,
  props: {
    label: dLabel(),
    icon: d(`This property defines an optional icon to display along with the \`${COMP}\` label.`),
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    [`color-bg-dropdown-${COMP}`]: "$color-bg-primary",
    [`radius-dropdown-${COMP}`]: "$radius",
    [`shadow-dropdown-${COMP}`]: "$shadow-spread",
  },
});

export const navGroupComponentRenderer = createComponentRenderer(
  COMP,
  NavGroupMd,
  ({ node, extractValue, renderChild }) => {
    return (
      <NavGroup
        label={extractValue.asDisplayText(node.props.label)}
        icon={<Icon name={extractValue.asString(node.props.icon)} className={navLinkStyles.icon} />}
        node={node}
        renderChild={renderChild}
      />
    );
  },
);
