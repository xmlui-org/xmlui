import styles from "./DropdownMenu.module.scss";

import { createMetadata, d } from "../../abstractions/ComponentDefs";
import { createComponentRenderer } from "../../components-core/renderers";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { alignmentOptionMd, buttonThemeMd, buttonVariantMd, iconPositionMd } from "../abstractions";
import { dClick, dEnabled, dLabel, dTriggerTemplate } from "../metadata-helpers";
import { Icon } from "../Icon/IconNative";
import {
  defaultDropdownMenuProps,
  defaultMenuItemProps,
  DropdownMenu,
  MenuItem,
  MenuSeparator,
  SubMenuItem,
} from "./DropdownMenuNative";

const DDMCOMP = "DropdownMenu";

export const DropdownMenuMd = createMetadata({
  description:
    `This component represents a dropdown menu with a trigger. When the user clicks the trigger, ` +
    `the dropdown menu displays its items.`,
  props: {
    label: dLabel(),
    triggerTemplate: dTriggerTemplate(DDMCOMP),
    alignment: {
      description: `This property allows you to determine the alignment of the displayed menu items.`,
      valueType: "string",
      availableValues: alignmentOptionMd,
      defaultValue: defaultDropdownMenuProps.alignment,
    },
    enabled: dEnabled(),
    triggerButtonVariant: {
      description:
        `This property defines the theme variant of the \`Button\` as the dropdown menu's trigger. ` +
        `It has no effect when a custom trigger is defined with \`triggerTemplate\`.`,
      valueType: "string",
      availableValues: buttonVariantMd,
      defaultValue: defaultDropdownMenuProps.triggerButtonVariant,
    },
    triggerButtonThemeColor: {
      description:
        `This property defines the theme color of the \`Button\` as the dropdown menu's trigger. ` +
        `It has no effect when a custom trigger is defined with \`triggerTemplate\`.`,
      valueType: "string",
      availableValues: buttonThemeMd,
      defaultValue: defaultDropdownMenuProps.triggerButtonThemeColor,
    },
    triggerButtonIcon: {
      description: `This property defines the icon to display on the trigger button.`,
      defaultValue: defaultDropdownMenuProps.triggerButtonIcon,
      valueType: "string",
    },
    triggerButtonIconPosition: {
      description: `This property defines the position of the icon on the trigger button.`,
      defaultValue: defaultDropdownMenuProps.triggerButtonIconPosition,
      valueType: "string",
      availableValues: iconPositionMd,
    },
  },
  events: {
    willOpen: d(`This event fires when the \`${DDMCOMP}\` component is opened.`),
  },
  apis: {
    close: d(`This method command closes the dropdown.`),
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    [`color-bg-${DDMCOMP}`]: "$color-bg-primary",
    [`min-width-${DDMCOMP}`]: "160px",
    [`shadow-${DDMCOMP}`]: "$shadow-xl",
    [`style-border-${DDMCOMP}-content`]: "solid",
    [`radius-${DDMCOMP}`]: "$radius",
  },
});

export const dropdownMenuComponentRenderer = createComponentRenderer(
  DDMCOMP,
  DropdownMenuMd,
  ({ node, extractValue, renderChild, registerComponentApi, layoutCss, lookupEventHandler }) => {
    return (
      <DropdownMenu
        triggerTemplate={renderChild(node.props?.triggerTemplate)}
        label={extractValue(node.props?.label)}
        registerComponentApi={registerComponentApi}
        onWillOpen={lookupEventHandler("willOpen")}
        style={layoutCss}
        alignment={extractValue(node.props?.alignment)}
        disabled={!extractValue.asOptionalBoolean(node.props.enabled, true)}
        triggerButtonThemeColor={extractValue(node.props.triggerButtonThemeColor)}
        triggerButtonVariant={extractValue(node.props.triggerButtonVariant)}
        triggerButtonIcon={extractValue(node.props.triggerButtonIcon)}
        triggerButtonIconPosition={extractValue(node.props.triggerButtonIconPosition)}
      >
        {renderChild(node.children)}
      </DropdownMenu>
    );
  },
);

const MICOMP = "MenuItem";

export const MenuItemMd = createMetadata({
  description: `This property represents a leaf item in a menu hierarchy. Clicking the item triggers an action.`,
  docFolder: DDMCOMP,
  props: {
    iconPosition: {
      description: `This property allows you to determine the position of the icon displayed in the menu item.`,
      valueType: "string",
      availableValues: iconPositionMd,
      defaultValue: defaultMenuItemProps.iconPosition,
    },
    icon: {
      description: `This property names an optional icon to display with the menu item.`,
      valueType: "string",
    },
    label: dLabel(),
    to: {
      description:
        `This property defines the URL of the menu item. If this property is defined (and the \`click\` ` +
        `event does not have an event handler), clicking the menu item navigates to this link.`,
      valueType: "string",
    },
    active: {
      description: `This property indicates if the specified menu item is active.`,
      valueType: "boolean",
      defaultValue: defaultMenuItemProps.active,
    },
  },
  events: {
    click: dClick(MICOMP),
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    [`color-bg-${MICOMP}`]: "$color-bg-dropdown-item",
    [`color-${MICOMP}`]: "$color-text-primary",
    [`font-family-${MICOMP}`]: "$font-family",
    [`font-size-${MICOMP}`]: "$font-size-small",
    [`padding-vertical-${MICOMP}`]: "$space-2",
    [`padding-horizontal-${MICOMP}`]: "$space-3",
    [`color-bg-${MICOMP}--hover`]: "$color-bg-dropdown-item--hover",
    [`color-${MICOMP}--hover`]: "inherit",
    [`gap-${MICOMP}`]: "$space-2",
    [`color-${MICOMP}--active`]: "$color-primary",
    [`color-bg-${MICOMP}--active`]: "$color-bg-dropdown-item--active",
    light: {},
    dark: {},
  },
});

export const menuItemRenderer = createComponentRenderer(
  MICOMP,
  MenuItemMd,
  ({ node, renderChild, lookupEventHandler, lookupAction, extractValue, layoutCss }) => {
    const clickEventHandler = lookupEventHandler("click");

    let clickHandler;
    const to = extractValue(node.props.to);
    if (!clickEventHandler && to?.trim()) {
      const navigateAction = lookupAction("navigate", { signError: false });
      clickHandler = () => {
        navigateAction?.({ pathname: to });
      };
    }
    return (
      <MenuItem
        onClick={clickHandler}
        label={extractValue(node.props?.label)}
        style={layoutCss}
        iconPosition={extractValue(node.props.iconPosition)}
        icon={node.props?.icon && <Icon name={extractValue(node.props.icon)} />}
        active={extractValue.asOptionalBoolean(node.props.active, false)}
      >
        {renderChild(node.children)}
      </MenuItem>
    );
  },
);

const SMCOMP = "SubMenuItem";

export const SubMenuItemMd = createMetadata({
  description: "This component represents a nested menu item within another menu or menu item.",
  docFolder: DDMCOMP,
  props: {
    label: dLabel(),
    triggerTemplate: dTriggerTemplate(SMCOMP),
  },
});

export const subMenuItemRenderer = createComponentRenderer(
  SMCOMP,
  SubMenuItemMd,
  ({ node, renderChild, extractValue }) => {
    return (
      <SubMenuItem
        label={extractValue(node.props?.label)}
        triggerTemplate={renderChild(node.props?.triggerTemplate)}
      >
        {renderChild(node.children)}
      </SubMenuItem>
    );
  },
);

const MSEP = "MenuSeparator";

export const MenuSeparatorMd = createMetadata({
  description: "This component displays a separator line between menu items.",
  docFolder: DDMCOMP,
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    [`margin-top-${MSEP}`]: "$space-1",
    [`margin-bottom-${MSEP}`]: "$space-1",
    [`width-${MSEP}`]: "100%",
    [`height-${MSEP}`]: "1px",
    [`color-${MSEP}`]: "$color-border-dropdown-item",
    [`margin-horizontal-${MSEP}`]: "12px",
  },
});

export const menuSeparatorRenderer = createComponentRenderer(MSEP, MenuSeparatorMd, () => {
  return <MenuSeparator />;
});
