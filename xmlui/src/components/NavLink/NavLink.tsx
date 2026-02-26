import styles from "./NavLink.module.scss";

import { createComponentRenderer } from "../../components-core/renderers";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { createMetadata, d, dClick, dEnabled, dLabel } from "../metadata-helpers";
import { ThemedIcon } from "../Icon/Icon";
import { NavLink, defaultProps } from "./NavLinkNative";
import { LinkTargetMd } from "../abstractions";

const COMP = "NavLink";

export const NavLinkMd = createMetadata({
  status: "stable",
  description:
    "`NavLink` creates interactive navigation items that connect users to different " +
    "destinations within an app or external URLs. It automatically indicates active " +
    "states, supports custom icons and labels, and can execute custom actions instead " +
    "of navigation when needed.",
  parts: {
    indicator: {
      description: "The active indicator within the NavLink component.",
    },
  },
  props: {
    to: d(`This property defines the URL of the link.`),
    enabled: dEnabled(),
    active: {
      description:
        `This property indicates if the particular navigation is an active link. An active link ` +
        `has a particular visual appearance, provided its [\`displayActive\`](#displayactive) ` +
        `property is set to \`true\`.`,
      valueType: "boolean",
      defaultValue: defaultProps.active,
    },
    target: {
      description: `This optionally property specifies how to open the clicked link.`,
      availableValues: LinkTargetMd,
      type: "string",
    },
    label: dLabel(),
    vertical: {
      description:
        `This property sets how the active status is displayed on the \`${COMP}\` component. If ` +
        `set to true, the indicator is displayed on the side which lends itself to a vertically ` +
        `aligned navigation menu. By default, it displays a horizontal indicator.`,
      valueType: "boolean",
    },
    displayActive: {
      description:
        `This Boolean property indicates if the active state of a link should have a visual ` +
        `indication. Setting it to \`false\` removes the visual indication of an active link.`,
      valueType: "boolean",
      defaultValue: defaultProps.displayActive,
    },
    noIndicator: {
      description:
        `This Boolean property controls whether to hide the visual indicator for active and ` +
        `hovered states. When set to \`true\`, the indicator line will not be displayed.`,
      valueType: "boolean",
      defaultValue: defaultProps.noIndicator,
    },
    icon: d(
      `This property allows you to add an optional icon (specify the icon's name) to the navigation link.`,
    ),
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
    level: {
      description:
        `This property specifies the nesting level (1-4) for the navigation link, which affects its padding. ` +
        `Higher levels typically have more left padding to indicate hierarchy. When used inside a NavGroup, ` +
        `the level is automatically inherited from the group context.`,
      valueType: "number",
      availableValues: [1, 2, 3, 4],
    },
  },
  events: {
    click: dClick(COMP),
  },
  themeVars: parseScssVar(styles.themeVars),
  themeVarDescriptions: {
    [`color-indicator-${COMP}`]:
      "Provides the following states: `--hover`, `--active`, `--pressed`",
    [`iconAlignment-${COMP}`]:
      "Sets the default vertical alignment of the icon when the label text wraps to multiple lines. Valid values: `baseline`, `start`, `center`, `end`",
    [`gap-icon-${COMP}`]:
      "Sets the gap between the icon and the text label. Only applied when an icon is present.",
  },
  defaultThemeVars: {
    [`border-${COMP}`]: "0px solid $borderColor",
    [`borderRadius-${COMP}`]: "$borderRadius",
    [`backgroundColor-${COMP}`]: "transparent",
    [`paddingHorizontal-${COMP}`]: "$space-4",
    [`paddingVertical-${COMP}`]: "$space-2",
    [`fontWeight-${COMP}`]: "$fontWeight-normal",
    [`fontFamily-${COMP}`]: "$fontFamily",
    [`lineHeight-${COMP}`]: "$lineHeight-relaxed",

    [`textColor-${COMP}`]: "$textColor-primary",
    [`textColor-${COMP}--active`]: "$color-primary-500",
    [`thickness-indicator-${COMP}`]: "$space-0_5",

    [`outlineColor-${COMP}--focus`]: "$outlineColor--focus",
    [`outlineWidth-${COMP}--focus`]: "$outlineWidth--focus",
    [`outlineStyle-${COMP}--focus`]: "$outlineStyle--focus",
    [`outlineOffset-${COMP}--focus`]: "-1px",
    [`borderRadius-indicator-${COMP}`]: "$borderRadius",
    [`color-icon-${COMP}`]: "$color-surface-500",
    [`gap-icon-${COMP}`]: "$space-3",
    [`color-indicator-${COMP}--active`]: "$color-primary-500",
    [`color-indicator-${COMP}--pressed`]: "$color-primary-500",
    [`color-indicator-${COMP}--hover`]: "$color-primary-600",
  },
});

export const navLinkComponentRenderer = createComponentRenderer(
  COMP,
  NavLinkMd,
  ({ node, extractValue, renderChild, className }) => {
    const iconName = extractValue.asString(node.props.icon);
    return (
      <NavLink
        uid={node.uid}
        to={extractValue(node.props.to)}
        disabled={!extractValue.asOptionalBoolean(node.props.enabled ?? true)}
        vertical={extractValue.asOptionalBoolean(node.props.vertical)}
        displayActive={extractValue.asOptionalBoolean(node.props.displayActive)}
        noIndicator={extractValue.asOptionalBoolean(node.props.noIndicator)}
        forceActive={extractValue.asOptionalBoolean(node.props.active)}
        level={extractValue.asOptionalNumber(node.props.level)}
        className={className}
        target={extractValue(node.props?.target)}
        icon={<ThemedIcon name={iconName} className={styles.icon} />}
        iconAlignment={extractValue.asOptionalString(node.props.iconAlignment)}
      >
        {extractValue.asDisplayText(node.props.label) || renderChild(node.children)}
      </NavLink>
    );
  },
);
