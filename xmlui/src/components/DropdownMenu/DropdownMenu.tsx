import styles from "./DropdownMenu.module.scss";
import React from "react";

import { wrapComponent } from "../../components-core/wrapComponent";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { useComponentThemeClass } from "../../components-core/theming/utils";
import {
  alignmentOptionMd,
  buttonThemeMd,
  buttonVariantMd,
  iconPositionMd,
  LinkTargetMd,
} from "../abstractions";
import { createMetadata, dClick, dEnabled, dLabel, dTriggerTemplate } from "../metadata-helpers";
import { ThemedIcon } from "../Icon/Icon";
import {
  defaultDropdownMenuProps,
  defaultMenuItemProps,
  DropdownMenu,
  DropdownMenuContext,
  MenuItem,
  MenuSeparator,
  SubMenuItem,
} from "./DropdownMenuReact";

export { DropdownMenuContext };
import { filterSeparators } from "../menu-helpers";

const DDMCOMP = "DropdownMenu";

export const DropdownMenuMd = createMetadata({
  status: "stable",
  description:
    "`DropdownMenu` provides a space-efficient way to present multiple options or " +
    "actions through a collapsible interface. When clicked, the trigger button reveals " +
    "a menu that can include items, separators, and nested submenus, making it ideal " +
    "for navigation, action lists, or any situation requiring many options without " +
    "permanent screen space.",
  parts: {
    content: {
      description: "The content area of the DropdownMenu where menu items are displayed.",
    },
  },
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
    modal: {
      isInternal: true,
      description: "internal radix modal prop",
      valueType: "boolean",
    },
  },
  events: {
    willOpen: {
      description:
        `This event fires when the \`${DDMCOMP}\` component is about to be opened. ` +
        `You can prevent opening the menu by returning \`false\` from the event handler. ` +
        `Otherwise, the menu will open at the end of the event handler like normal.`,
      signature: "willOpen(): boolean | void",
      parameters: {},
    },
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

type ThemedDropdownMenuProps = React.ComponentProps<typeof DropdownMenu> & { className?: string };

export const ThemedDropdownMenu = React.forwardRef<HTMLButtonElement, ThemedDropdownMenuProps>(
  function ThemedDropdownMenu({ className, ...props }: ThemedDropdownMenuProps, ref) {
    const themeClass = useComponentThemeClass(DropdownMenuMd);
    const combinedClassName = `${themeClass}${className ? ` ${className}` : ""}`;
    return (
      <DropdownMenu
        {...props}
        className={combinedClassName}
        contentClassName={combinedClassName}
        ref={ref}
      />
    );
  },
);

export const dropdownMenuComponentRenderer = wrapComponent(
  DDMCOMP,
  ThemedDropdownMenu,
  DropdownMenuMd,
  {
    exposeRegisterApi: true,
    contentClassName: true,
    exclude: ["enabled"],
    customRender: (props, { node, extractValue, renderChild }) => {
      // Filter separators dynamically: accounts for adjacent/leading/trailing separators
      // and `when` conditions on menu items so hidden items don't leave orphaned separators.
      const filteredChildren = filterSeparators(node.children, extractValue);

      return (
        <DropdownMenu
          {...props}
          disabled={!extractValue.asOptionalBoolean(node.props.enabled, true)}
        >
          {renderChild(filteredChildren)}
        </DropdownMenu>
      );
    },
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
        `This property defines the URL of the menu item. When it is set, the menu item renders ` +
        `as a real link (an \`<a>\` element with an \`href\`), so it can be opened in a new tab, ` +
        `copied, and read as a link by assistive technology. If this property is defined (and the ` +
        `\`click\` event does not have an event handler), clicking the menu item navigates to this link.`,
      valueType: "string",
    },
    target: {
      description:
        `This property specifies where to open the link represented by the \`${MICOMP}\`. It only ` +
        `has an effect when \`to\` is defined. This property accepts the following values (in ` +
        `accordance with the HTML standard):`,
      availableValues: LinkTargetMd,
      isStrictEnum: true,
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
    [`fontSize-${MICOMP}`]: "$fontSize-sm",
    [`paddingVertical-${MICOMP}`]: "$space-2",
    [`paddingHorizontal-${MICOMP}`]: "$space-3",
    [`backgroundColor-${MICOMP}--hover`]: "$backgroundColor-dropdown-item--hover",
    [`maxWidth-${MICOMP}`]: "100%",
    [`color-${MICOMP}--hover`]: "inherit",
    [`gap-${MICOMP}`]: "$space-2",
    [`color-${MICOMP}--active`]: "$color-primary",
    [`backgroundColor-${MICOMP}--active`]: "$backgroundColor-dropdown-item--active",
    light: {},
    dark: {},
  },
});

type ThemedMenuItemProps = React.ComponentProps<typeof MenuItem> & { className?: string };

// The ref lands on an <a> for a menu item with `to` and on a <div> otherwise, so it is typed
// as the common supertype rather than claiming to always be a div.
export const ThemedMenuItem = React.forwardRef<HTMLElement, ThemedMenuItemProps>(
  function ThemedMenuItem({ className, ...props }: ThemedMenuItemProps, ref) {
    const themeClass = useComponentThemeClass(MenuItemMd);
    return (
      <MenuItem
        {...props}
        className={`${themeClass}${className ? ` ${className}` : ""}`}
        ref={ref}
      />
    );
  },
);

// Component types that render their own interactive element. Nesting one inside a MenuItem
// that is itself a link produces invalid, unusable markup (an anchor inside an anchor), so
// we warn instead of letting it fail silently at runtime.
const INTERACTIVE_CHILD_TYPES = new Set(["Link", "NavLink", "Button", "MenuItem"]);

function findInteractiveChildType(children: any): string | undefined {
  if (!children) return undefined;
  const nodes = Array.isArray(children) ? children : [children];
  for (const child of nodes) {
    if (!child || typeof child !== "object") continue;
    if (typeof child.type === "string" && INTERACTIVE_CHILD_TYPES.has(child.type)) {
      return child.type;
    }
    const nested = findInteractiveChildType(child.children);
    if (nested) return nested;
  }
  return undefined;
}

export const menuItemRenderer = wrapComponent(MICOMP, ThemedMenuItem, MenuItemMd, {
  exclude: ["icon"],
  customRender: (props, context) => {
    const { node, extractValue, renderChild, lookupEventHandler } = context;
    // Whether the item is a link is decided by the MARKUP declaring `to`, not by what `to`
    // currently evaluates to. A binding that resolves late (`to="{item.url}"`) must not flip
    // the rendered element type from <div> to <a> mid-life and remount the item, which would
    // throw focus out of an open menu.
    const isLink = node.props?.to !== undefined;
    const to = extractValue.asOptionalString(node.props.to);

    // `click` outranks `to`; the component needs to know which of the two is in play. The
    // navigation itself is not wired up here: the component calls `appContext.navigate` so
    // that the `willNavigate` guard, `didNavigate` and the `kind:"navigate"` trace entry all
    // still see a menu-driven navigation, exactly as they did before `to` became a real link.
    const clickEventHandler = lookupEventHandler("click");

    if (process.env.NODE_ENV !== "production" && isLink) {
      const interactiveChild = findInteractiveChildType(node.children);
      if (interactiveChild) {
        console.warn(
          `[${MICOMP}] A '${interactiveChild}' is nested inside a ${MICOMP} that declares 'to'. ` +
            `Because 'to' makes the ${MICOMP} itself a link, this produces invalid nested ` +
            `interactive markup. Either drop 'to' from the ${MICOMP} or remove the nested ` +
            `'${interactiveChild}'.`,
        );
      }
    }

    return (
      <ThemedMenuItem
        {...props}
        to={to}
        isLink={isLink}
        hasClickHandler={!!clickEventHandler}
        icon={
          node.props?.icon && (
            <ThemedIcon
              name={extractValue(node.props.icon)}
              fallback={extractValue(node.props.icon)}
            />
          )
        }
      >
        {renderChild(node.children)}
      </ThemedMenuItem>
    );
  },
});

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
    iconPosition: {
      description: `This property allows you to determine the position of the icon displayed in the submenu item.`,
      valueType: "string",
      availableValues: iconPositionMd,
      defaultValue: defaultMenuItemProps.iconPosition,
    },
    icon: {
      description: `This property names an optional icon to display with the submenu item. You can use component-specific icons in the format "iconName:SubMenuItem".`,
      valueType: "string",
    },
    label: dLabel(),
    triggerTemplate: dTriggerTemplate(SMCOMP),
  },
});

type ThemedSubMenuItemProps = React.ComponentProps<typeof SubMenuItem> & { className?: string };

const ThemedSubMenuItem = React.forwardRef<HTMLDivElement, ThemedSubMenuItemProps>(
  function ThemedSubMenuItem({ className, ...props }: ThemedSubMenuItemProps, ref) {
    const themeClass = useComponentThemeClass(SubMenuItemMd);
    const combinedClassName = `${themeClass}${className ? ` ${className}` : ""}`;
    return (
      <SubMenuItem
        {...props}
        className={combinedClassName}
        contentClassName={combinedClassName}
        ref={ref}
      />
    );
  },
);

export const subMenuItemRenderer = wrapComponent(SMCOMP, ThemedSubMenuItem, SubMenuItemMd, {
  exclude: ["icon"],
  customRender: (props, { node, extractValue, renderChild }) => {
    const iconName = extractValue(node.props?.icon);
    // Filter separators dynamically: accounts for adjacent/leading/trailing separators
    // and `when` conditions on submenu items so hidden items don't leave orphaned separators.
    const filteredChildren = filterSeparators(node.children, extractValue);

    return (
      <ThemedSubMenuItem
        {...props}
        icon={iconName && <ThemedIcon name={iconName} fallback={iconName} />}
      >
        {renderChild(filteredChildren)}
      </ThemedSubMenuItem>
    );
  },
});

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

type ThemedMenuSeparatorProps = React.HTMLAttributes<HTMLDivElement>;
const MenuSeparatorTyped = MenuSeparator as React.ForwardRefExoticComponent<
  React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>
>;

export const ThemedMenuSeparator = React.forwardRef<HTMLDivElement, ThemedMenuSeparatorProps>(
  function ThemedMenuSeparator({ className, ...props }: ThemedMenuSeparatorProps, ref) {
    const themeClass = useComponentThemeClass(MenuSeparatorMd);
    return (
      <MenuSeparatorTyped
        {...props}
        className={`${themeClass}${className ? ` ${className}` : ""}`}
        ref={ref}
      />
    );
  },
);

export const menuSeparatorRenderer = wrapComponent(MSEP, MenuSeparator, MenuSeparatorMd, {
  customRender: () => <MenuSeparator />,
});
