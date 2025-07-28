import styles from "./ResponsiveMenu.module.scss";

import { createComponentRenderer } from "../../components-core/renderers";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { createMetadata, d, dClick, dEnabled, dLabel } from "../metadata-helpers";
import { Icon } from "../Icon/IconNative";
import {
  defaultResponsiveMenuProps,
  ResponsiveMenu,
  ResponsiveMenuItem,
} from "./ResponsiveMenuNative";

const RMCOMP = "ResponsiveMenu";

export const ResponsiveMenuMd = createMetadata({
  status: "stable",
  description:
    "`ResponsiveMenu` provides a horizontal menu that automatically moves overflow " +
    "items to a dropdown when they don't fit in the available viewport width. " +
    "This pattern is commonly used in application menus (like VS Code's main menu) " +
    "to maintain usability across different screen sizes while preserving access " +
    "to all menu items.",
  props: {
    overflowIcon: {
      description:
        `This property defines the icon to display on the overflow dropdown button. ` +
        `You can change the default icon for all ${RMCOMP} instances with the ` +
        `"icon.overflow:ResponsiveMenu" declaration in the app configuration file.`,
      defaultValue: defaultResponsiveMenuProps.overflowIcon,
      valueType: "string",
    },
    overflowLabel: {
      description:
        `This property defines the accessible label for the overflow dropdown button.`,
      defaultValue: defaultResponsiveMenuProps.overflowLabel,
      valueType: "string",
    },
  },
  apis: {
    recalculate: {
      description: `This method recalculates the visible and overflow items based on current container width.`,
      signature: "recalculate(): void",
    },
  },
  themeVars: parseScssVar(styles.themeVars),
  limitThemeVarsToComponent: true,
  defaultThemeVars: {
    [`backgroundColor-${RMCOMP}`]: "$color-surface",
    [`borderColor-${RMCOMP}`]: "$borderColor-subtle",
    [`borderWidth-${RMCOMP}`]: "0",
    [`borderStyle-${RMCOMP}`]: "solid",
    [`padding-${RMCOMP}`]: "$space-2 $space-3",
    [`gap-${RMCOMP}`]: "$space-1",
    
    [`backgroundColor-ResponsiveMenuItem`]: "transparent",
    [`color-ResponsiveMenuItem`]: "$textColor-primary",
    [`fontFamily-ResponsiveMenuItem`]: "$fontFamily",
    [`fontSize-ResponsiveMenuItem`]: "$fontSize-small",
    [`fontWeight-ResponsiveMenuItem`]: "$fontWeight-medium",
    [`padding-ResponsiveMenuItem`]: "$space-1 $space-2",
    [`borderRadius-ResponsiveMenuItem`]: "$borderRadius-sm",
    [`gap-ResponsiveMenuItem`]: "$space-1",
    
    [`backgroundColor-ResponsiveMenuItem--hover`]: "$backgroundColor-action--hover",
    [`color-ResponsiveMenuItem--hover`]: "$textColor-primary",
    [`backgroundColor-ResponsiveMenuItem--active`]: "$backgroundColor-action--active",
    [`color-ResponsiveMenuItem--active`]: "$color-primary",
    [`color-ResponsiveMenuItem--disabled`]: "$textColor--disabled",
  },
});

export const responsiveMenuComponentRenderer = createComponentRenderer(
  RMCOMP,
  ResponsiveMenuMd,
  ({ node, extractValue, renderChild, registerComponentApi, layoutCss }) => {
    return (
      <ResponsiveMenu
        registerComponentApi={registerComponentApi}
        style={layoutCss}
        overflowIcon={extractValue(node.props?.overflowIcon)}
        overflowLabel={extractValue(node.props?.overflowLabel)}
      >
        {renderChild(node.children)}
      </ResponsiveMenu>
    );
  },
);

const RMICOMP = "ResponsiveMenuItem";

export const ResponsiveMenuItemMd = createMetadata({
  status: "stable",
  description:
    "`ResponsiveMenuItem` represents individual items within a ResponsiveMenu. " +
    "Each item can display text, icons, and respond to clicks. When the menu " +
    "overflows, these items are automatically moved to the dropdown menu while " +
    "maintaining their functionality and appearance.",
  docFolder: RMCOMP,
  props: {
    label: dLabel(),
    icon: {
      description: `This property names an optional icon to display with the menu item. You can use component-specific icons in the format "iconName:ResponsiveMenuItem".`,
      valueType: "string",
    },
    active: {
      description: `This property indicates if the specified menu item is active.`,
      valueType: "boolean",
      defaultValue: false,
    },
    enabled: dEnabled(),
  },
  events: {
    click: dClick(RMICOMP),
  },
});

export const responsiveMenuItemRenderer = createComponentRenderer(
  RMICOMP,
  ResponsiveMenuItemMd,
  ({ node, renderChild, lookupEventHandler, extractValue, layoutCss }) => {
    const clickEventHandler = lookupEventHandler("click");

    return (
      <ResponsiveMenuItem
        onClick={clickEventHandler}
        label={extractValue(node.props?.label)}
        icon={
          node.props?.icon && (
            <Icon name={extractValue(node.props.icon)} fallback={extractValue(node.props.icon)} />
          )
        }
        active={extractValue.asOptionalBoolean(node.props.active, false)}
        enabled={extractValue.asOptionalBoolean(node.props.enabled, true)}
        className={layoutCss ? 'custom-layout' : undefined}
      >
        {renderChild(node.children)}
      </ResponsiveMenuItem>
    );
  },
);
