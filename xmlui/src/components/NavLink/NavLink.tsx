import styles from "./NavLink.module.scss";
import { createMetadata, d } from "../../abstractions/ComponentDefs";
import { createComponentRenderer } from "../../components-core/renderers";
import { Icon } from "../Icon/IconNative";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { NavLink } from "./NavLinkNative";
import { dClick, dEnabled, dLabel } from "../metadata-helpers";

const COMP = "NavLink";

export const NavLinkMd = createMetadata({
  description:
    `The \`${COMP}\` component defines a navigation target (app navigation menu item) within ` +
    `the app; it is associated with a particular in-app navigation target (or an external link).`,
  props: {
    to: d(`This property defines the URL of the link.`),
    enabled: dEnabled(),
    active: d(
      `This property indicates if the particular navigation is an active link. An active link ` +
        `has a particular visual appearance, provided its [\`displayActive\`](#displayactive) ` +
        `property is set to \`true\`.`,
    ),
    target: d(`This property specifies how to open the clicked link.`),
    label: dLabel(),
    vertical: d(
      `This property sets how the active status is displayed on the \`${COMP}\` component. If ` +
        `set to true, the indicator is displayed on the side which lends itself to a vertically ` +
        `aligned navigation menu.`,
    ),
    displayActive: d(
      `This Boolean property indicates if the active state of a link should have a visual ` +
        `indication. Setting it to \`false\` removes the visual indication of an active link.`,
    ),
    icon: d(
      `This property allows you to add an icon (specify the icon's name) to the navigation link.`,
    ),
  },
  events: {
    click: dClick(COMP),
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    "radius-NavLink": "$radius",
    "color-bg-NavLink": "transparent",
    "padding-horizontal-NavLink": "$space-4",
    "padding-vertical-NavLink": "$space-2",
    "font-size-NavLink": "$font-size-small",
    "font-weight-NavLink": "$font-weight-normal",
    "font-family-NavLink": "$font-family",
    "color-text-NavLink": "$color-text-primary",
    "font-weight-NavLink--pressed": "$font-weight-normal",
    "thickness-indicator-NavLink": "$space-0_5",

    "color-outline-NavLink--focus": "$color-outline--focus",
    "thickness-outline-NavLink--focus": "$thickness-outline--focus",
    "style-outline-NavLink--focus": "$style-outline--focus",
    "offset-outline-NavLink--focus": "-1px",
    "radius-indicator-NavLink": "$radius",

    light: {
      "color-icon-NavLink": "$color-surface-500",
      "color-indicator-NavLink--active": "$color-primary-500",
      "color-indicator-NavLink--pressed": "$color-primary-500",
      "color-indicator-NavLink--hover": "$color-primary-600",
    },
    dark: {
      "color-indicator-NavLink--active": "$color-primary-500",
      "color-indicator-NavLink--pressed": "$color-primary-500",
      "color-indicator-NavLink--hover": "$color-primary-400",
    },
  },
});

export const navLinkComponentRenderer = createComponentRenderer(
  COMP,
  NavLinkMd,
  ({ node, extractValue, renderChild, layoutCss }) => {
    const iconName = extractValue.asString(node.props.icon);
    return (
      <NavLink
        uid={node.uid}
        to={extractValue(node.props.to)}
        disabled={!extractValue.asOptionalBoolean(node.props.enabled ?? true)}
        vertical={extractValue.asOptionalBoolean(node.props.vertical)}
        displayActive={extractValue.asOptionalBoolean(node.props.displayActive)}
        forceActive={extractValue.asOptionalBoolean(node.props.active)}
        style={layoutCss}
        target={extractValue(node.props?.target)}
        icon={<Icon name={iconName} className={styles.icon} />}
      >
        {extractValue.asDisplayText(node.props.label) || renderChild(node.children)}
      </NavLink>
    );
  },
);
