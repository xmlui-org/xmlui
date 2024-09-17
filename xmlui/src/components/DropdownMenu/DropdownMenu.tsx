import styles from "./DropdownMenu.module.scss";

import { createMetadata, d } from "@abstractions/ComponentDefs";
import { iconPositionNames } from "@components/abstractions";

import { createComponentRenderer } from "@components-core/renderers";
import { parseScssVar } from "@components-core/theming/themeVars";
import { Icon } from "@components/Icon/IconNative";
import { DropdownMenu, MenuItem, MenuSeparator, SubMenuItem } from "./DropdownMenuNative";
import { dClick, dEnabled, dLabel, dTriggerTemplate } from "@components/metadata-helpers";

const DDMCOMP = "DropdownMenu";

export const DropdownMenuMd = createMetadata({
  description:
    `This component represents a dropdown menu with a trigger. When the user clicks the trigger, ` +
    `the dropdown menu displays its items.`,
  props: {
    label: dLabel(),
    triggerTemplate: dTriggerTemplate(DDMCOMP),
    alignment: d(
      `This property allows you to determine the alignment of the displayed menu items.`,
    ),
    enabled: dEnabled(),
    triggerButtonVariant: d(
      `This property defines the theme variant of the \`Button\` as the dropdown menu's trigger. ` +
        `It has no effect when a custom trigger is defined with \`triggerTemplate\`.`,
    ),
    triggerButtonThemeColor: d(
      `This property defines the theme color of the \`Button\` as the dropdown menu's trigger. ` +
        `It has no effect when a custom trigger is defined with \`triggerTemplate\`.`,
    ),
    triggerButtonIcon: d(`This property defines the icon to display on the trigger button.`),
    triggerButtonIconPosition: d(
      `This property defines the position of the icon on the trigger button.`,
      iconPositionNames,
    ),
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
        layout={layoutCss}
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
  folder: "DropdownMenu",
  props: {
    iconPosition: d(
      `This property allows you to determine the position of the icon displayed in the menu item.`,
      iconPositionNames,
    ),
    icon: d(`This property names an optional icon to display with the menu item.`),
    label: dLabel(),
    to: d(
      `This property defines the URL of the menu item. If this property is defined (and the \`click\` ` +
        `event does not have an event handler), clicking the menu item navigates to this link.`,
    ),
    active: d(`This property indicates if the specified menu item is active.`),
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
  folder: "DropdownMenu",
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
  folder: "DropdownMenu",
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
