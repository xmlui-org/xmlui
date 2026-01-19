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
    noIndicator: {
      description:
        `This Boolean property controls whether to hide the visual indicator for active and ` +
        `hovered states. When set to \`true\`, the indicator line will not be displayed on the ` +
        `\`${COMP}\` toggle button.`,
      valueType: "boolean",
      defaultValue: defaultProps.noIndicator,
    },
    iconAlignment: {
      description:
        `This property controls the vertical alignment of the icon when the label text wraps to multiple lines. ` +
        `Set to \`baseline\` to align with the first line of text, \`start\` to align to the top, \`center\` for middle alignment (default), or \`end\` for bottom alignment.`,
      valueType: "string",
      availableValues: [
        { value: "baseline", description: "Align icon with the first line of text" },
        { value: "start", description: "Align icon to the top" },
        { value: "center", description: "Align icon to the center (default)" },
        { value: "end", description: "Align icon to the bottom" },
      ],
      defaultValue: "center",
    },
    expandIconAlignment: {
      description:
        `This property controls the horizontal alignment of the expand/collapse arrow icon. ` +
        `Set to \`start\` to display the arrow immediately after the label, or \`end\` to push it to the right edge of the NavGroup (only applies when the NavGroup has a defined width).`,
      valueType: "string",
      availableValues: [
        { value: "start", description: "Display arrow immediately after the label (default)" },
        { value: "end", description: "Push arrow to the right edge of the NavGroup" },
      ],
      defaultValue: "start",
    },
  },
  themeVars: parseScssVar(styles.themeVars),
  themeVarDescriptions: {
    [`marginTop-items-${COMP}`]:
      "Sets the margin between the NavGroup header and the first child item. Does not affect margins between child items.",
    [`marginBottom-items-${COMP}`]: "Sets the margin after the last child item in the NavGroup.",
  },
  defaultThemeVars: {
    [`backgroundColor-dropdown-${COMP}`]: "$backgroundColor-primary",
    [`borderRadius-dropdown-${COMP}`]: "$borderRadius",
    [`boxShadow-dropdown-${COMP}`]: "$boxShadow-spread",
    [`minWidth-dropdown-${COMP}`]: "11em",
    [`marginTop-items-${COMP}`]: "0",
    [`marginBottom-items-${COMP}`]: "0",
    [`expandIconAlignment-${COMP}`]: "start",
    [`paddingHorizontal-${COMP}`]: "$space-4",
    [`paddingVertical-${COMP}`]: "$space-2",
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
        noIndicator={extractValue.asOptionalBoolean(node.props.noIndicator)}
        renderChild={renderChild}
        iconHorizontalExpanded={extractValue.asOptionalString(node.props.iconHorizontalExpanded)}
        iconVerticalExpanded={extractValue.asOptionalString(node.props.iconVerticalExpanded)}
        iconHorizontalCollapsed={extractValue.asOptionalString(node.props.iconHorizontalCollapsed)}
        iconVerticalCollapsed={extractValue.asOptionalString(node.props.iconVerticalCollapsed)}
        iconAlignment={extractValue.asOptionalString(node.props.iconAlignment, "center")}
        expandIconAlignment={extractValue(node.props.expandIconAlignment)}
      />
    );
  },
);
