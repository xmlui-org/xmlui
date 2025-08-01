import styles from "./DropdownMenu.module.scss";

import { createComponentRenderer } from "../../components-core/renderers";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { alignmentOptionMd, buttonThemeMd, buttonVariantMd, iconPositionMd } from "../abstractions";
import { createMetadata, d, dClick, dEnabled, dLabel, dTriggerTemplate } from "../metadata-helpers";
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
  status: "stable",
  description:
    "`DropdownMenu` provides a space-efficient way to present multiple options or " +
    "actions through a collapsible interface. When clicked, the trigger button reveals " +
    "a menu that can include items, separators, and nested submenus, making it ideal " +
    "for navigation, action lists, or any situation requiring many options without " +
    "permanent screen space.",
  props: {
    label: dLabel(),
    triggerTemplate: dTriggerTemplate(DDMCOMP),
    alignment: {
      description:
        "This property allows you to determine the alignment of the dropdown panel with " +
        "the displayed menu items.",
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
      description:
        `This property defines the icon to display on the trigger button. You can change the default icon ` +
        `for all ${DDMCOMP} instances with the "icon.triggerButton:DropdownMenu" declaration in the app ` +
        `configuration file.`,
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
    close: {
      description: `This method command closes the dropdown.`,
      signature: "close(): void",
    },
    open: {
      description: `This method command opens the dropdown.`,
      signature: "open(): void",
    },
  },
  themeVars: parseScssVar(styles.themeVars),
  limitThemeVarsToComponent: true,
  defaultThemeVars: {
    [`backgroundColor-${DDMCOMP}`]: "$color-surface-raised",
    [`minWidth-${DDMCOMP}`]: "160px",
    [`boxShadow-${DDMCOMP}`]: "$boxShadow-xl",
    [`borderStyle-${DDMCOMP}-content`]: "solid",
    [`borderRadius-${DDMCOMP}`]: "$borderRadius",
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
  status: "stable",
  description:
    "`MenuItem` represents individual clickable items within dropdown menus and other " +
    "menu components. Each menu item can display text, icons, and respond to clicks " +
    "with either navigation or custom actions, making it the building block for " +
    "interactive menu systems.",
  docFolder: DDMCOMP,
  props: {
    iconPosition: {
      description: `This property allows you to determine the position of the icon displayed in the menu item.`,
      valueType: "string",
      availableValues: iconPositionMd,
      defaultValue: defaultMenuItemProps.iconPosition,
    },
    icon: {
      description: `This property names an optional icon to display with the menu item. You can use component-specific icons in the format "iconName:MenuItem".`,
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
    enabled: dEnabled(),
  },
  events: {
    click: dClick(MICOMP),
  },
  themeVars: parseScssVar(styles.themeVars),
  limitThemeVarsToComponent: true,
  defaultThemeVars: {
    [`backgroundColor-${MICOMP}`]: "$backgroundColor-dropdown-item",
    [`color-${MICOMP}`]: "$textColor-primary",
    [`color-${MICOMP}--disabled`]: "$textColor--disabled",
    [`fontFamily-${MICOMP}`]: "$fontFamily",
    [`fontSize-${MICOMP}`]: "$fontSize-small",
    [`paddingVertical-${MICOMP}`]: "$space-2",
    [`paddingHorizontal-${MICOMP}`]: "$space-3",
    [`backgroundColor-${MICOMP}--hover`]: "$backgroundColor-dropdown-item--hover",
    [`color-${MICOMP}--hover`]: "inherit",
    [`gap-${MICOMP}`]: "$space-2",
    [`color-${MICOMP}--active`]: "$color-primary",
    [`backgroundColor-${MICOMP}--active`]: "$backgroundColor-dropdown-item--active",
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
        icon={
          node.props?.icon && (
            <Icon name={extractValue(node.props.icon)} fallback={extractValue(node.props.icon)} />
          )
        }
        active={extractValue.asOptionalBoolean(node.props.active, false)}
        enabled={extractValue.asOptionalBoolean(node.props.enabled, true)}
      >
        {renderChild(node.children)}
      </MenuItem>
    );
  },
);

const SMCOMP = "SubMenuItem";

export const SubMenuItemMd = createMetadata({
  status: "stable",
  description:
    "`SubMenuItem` creates hierarchical menu structures by acting as both a menu " +
    "item and a container for nested menu items. When clicked or hovered, it reveals " +
    "a submenu containing additional [MenuItem](/components/MenuItem), " +
    "[MenuSeparator](/components/MenuSeparator), or other " +
    "[SubMenuItem](/components/SubMenuItems) components, enabling complex multi-level " +
    "navigation and action organization.",
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
  status: "stable",
  description:
    "`MenuSeparator` displays a separator line between menu items to group related " +
    "menu options within `DropdownMenu`.",
  docFolder: DDMCOMP,
  themeVars: parseScssVar(styles.themeVars),
  limitThemeVarsToComponent: true,
  defaultThemeVars: {
    [`marginTop-${MSEP}`]: "$space-1",
    [`marginBottom-${MSEP}`]: "$space-1",
    [`width-${MSEP}`]: "100%",
    [`height-${MSEP}`]: "1px",
    [`color-${MSEP}`]: "$borderColor-dropdown-item",
    [`marginHorizontal-${MSEP}`]: "12px",
  },
});

export const menuSeparatorRenderer = createComponentRenderer(MSEP, MenuSeparatorMd, () => {
  return <MenuSeparator />;
});
