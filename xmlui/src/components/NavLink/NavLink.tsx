import styles from "./NavLink.module.scss";

import { createMetadata, d } from "../../abstractions/ComponentDefs";
import { createComponentRenderer } from "../../components-core/renderers";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { dClick, dEnabled, dLabel } from "../metadata-helpers";
import { Icon } from "../Icon/IconNative";
import { NavLink } from "./NavLinkNative";
import { LinkTargetMd } from "../abstractions";

const COMP = "NavLink";

export const NavLinkMd = createMetadata({
  description:
    `The \`${COMP}\` component defines a navigation target (app navigation menu item) within ` +
    `the app; it is associated with a particular in-app navigation target (or an external link).`,
  props: {
    to: d(`This property defines the URL of the link.`),
    enabled: dEnabled(),
    active: {
      description:
        `This property indicates if the particular navigation is an active link. An active link ` +
        `has a particular visual appearance, provided its [\`displayActive\`](#displayactive) ` +
        `property is set to \`true\`.`,
      valueType: "boolean",
      defaultValue: false,
    },
    target: {
      description: `This property specifies how to open the clicked link.`,
      availableValues: LinkTargetMd,
      type: "string",
      defaultValue: "_self",
    },
    label: dLabel(),
    vertical: {
      description:
        `This property sets how the active status is displayed on the \`${COMP}\` component. If ` +
        `set to true, the indicator is displayed on the side which lends itself to a vertically ` +
        `aligned navigation menu.`,
      valueType: "boolean",
      defaultValue: false,
    },
    displayActive: {
      description:
        `This Boolean property indicates if the active state of a link should have a visual ` +
        `indication. Setting it to \`false\` removes the visual indication of an active link.`,
      valueType: "boolean",
      defaultValue: true,
    },
    icon: d(
      `This property allows you to add an icon (specify the icon's name) to the navigation link.`,
    ),
  },
  events: {
    click: dClick(COMP),
  },
  themeVars: parseScssVar(styles.themeVars),
  themeVarDescriptions: {
    [`color-indicator-${COMP}`]: "Provides the following states: `--hover`, `--active`, `--pressed`",
  },
  defaultThemeVars: {
    [`border-${COMP}`]: "0px solid $borderColor",
    [`borderRadius-${COMP}`]: "$borderRadius",
    [`backgroundColor-${COMP}`]: "transparent",
    [`paddingHorizontal-${COMP}`]: "$space-4",
    [`paddingVertical-${COMP}`]: "$space-2",
    [`fontSize-${COMP}`]: "$fontSize-small",
    [`fontWeight-${COMP}`]: "$fontWeight-normal",
    [`fontFamily-${COMP}`]: "$fontFamily",
    [`textColor-${COMP}`]: "$textColor-primary",
    [`fontWeight-${COMP}--pressed`]: "$fontWeight-normal",
    [`thickness-indicator-${COMP}`]: "$space-0_5",

    [`outlineColor-${COMP}--focus`]: "$outlineColor--focus",
    [`outlineWidth-${COMP}--focus`]: "$outlineWidth--focus",
    [`outlineStyle-${COMP}--focus`]: "$outlineStyle--focus",
    [`outlineOffset-${COMP}--focus`]: "-1px",
    [`borderRadius-indicator-${COMP}`]: "$borderRadius",
    [`color-icon-${COMP}`]: "$color-surface-500",
    [`color-indicator-${COMP}--active`]: "$color-primary-500",
    [`color-indicator-${COMP}--pressed`]: "$color-primary-500",
    [`color-indicator-${COMP}--hover`]: "$color-primary-600",
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
