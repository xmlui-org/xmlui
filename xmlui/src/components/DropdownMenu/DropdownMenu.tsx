import styles from "./DropdownMenu.module.scss";
import React from "react";

import { wrapComponent as wrapRuntimeComponent, type XmluiComponentAdapter } from "../../runtime/rendering/adapter";
import type { ComponentMetadata } from "../../component-core/metadata/types";
import type { XmluiNode } from "../../compiler/ir";
import { useDropdownMenuContext } from "./DropdownMenuReact";
import { wrapComponent } from "../../components-core/wrapComponent";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { useComponentThemeClass } from "../../components-core/theming/utils";
import { alignmentOptionMd, buttonThemeMd, buttonVariantMd, iconPositionMd } from "../abstractions";
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

export const ThemedMenuItem = React.forwardRef<HTMLDivElement, ThemedMenuItemProps>(
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

export const menuItemRenderer = wrapComponent(MICOMP, ThemedMenuItem, MenuItemMd, {
  exclude: ["icon"],
  customRender: (props, context) => {
    const { node, extractValue, renderChild, lookupEventHandler } = context;
    // Use the auto-traced onClick if a click handler is defined,
    // otherwise fall back to navigation if `to` is set.
    let clickHandler = props.onClick;
    const clickEventHandler = lookupEventHandler("click");
    const to = extractValue(node.props.to);
    if (!clickEventHandler && to?.trim()) {
      const navigateAction = context.lookupAction?.("navigate", { signError: false });
      clickHandler = () => {
        navigateAction?.({ pathname: to });
      };
    }

    return (
      <ThemedMenuItem
        {...props}
        onClick={clickHandler}
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

function hasPropertyChild(node: XmluiComponentAdapter["node"], name: string): boolean {
  return node.children.some(
    (child) => child.kind === "element" && child.type === "property" && child.props.name === name,
  );
}

export function filterMenuSeparators(children: XmluiNode[]): XmluiNode[] {
  const filtered: XmluiNode[] = [];
  let lastVisibleWasSeparator = true;

  for (const child of children) {
    if (child.kind === "element" && child.type === "property") {
      continue;
    }

    const isSeparator = child.kind === "element" && child.type === MSEP;
    if (isSeparator) {
      if (!lastVisibleWasSeparator) {
        filtered.push(child);
      }
      lastVisibleWasSeparator = true;
      continue;
    }

    filtered.push(child);
    lastVisibleWasSeparator = false;
  }

  const lastChild = filtered[filtered.length - 1];
  if (lastChild?.kind === "element" && lastChild.type === MSEP) {
    filtered.pop();
  }

  return filtered;
}

function stampPortalContent(className: string, componentName: string) {
  if (typeof document === "undefined") {
    return undefined;
  }
  const firstClass = className.split(/\s+/).find(Boolean);
  if (!firstClass) {
    return undefined;
  }
  const escaped = typeof CSS !== "undefined" && CSS.escape
    ? CSS.escape(firstClass)
    : firstClass.replace(/[^a-zA-Z0-9_-]/g, "\\$&");
  const sync = () => {
    for (const element of document.querySelectorAll<HTMLElement>(`.${escaped}`)) {
      element.setAttribute("data-xmlui-component", componentName);
      element.setAttribute("data-xmlui-part", "root");
    }
  };
  sync();
  const observer = new MutationObserver(sync);
  observer.observe(document.body, { childList: true, subtree: true });
  return () => observer.disconnect();
}

function RuntimeDropdownMenuContentAttrs({
  className,
  componentName,
  close,
}: {
  className: string;
  componentName: string;
  close?: () => void;
}) {
  React.useEffect(() => stampPortalContent(className, componentName), [className, componentName]);
  React.useEffect(() => {
    if (!close || typeof document === "undefined") {
      return;
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        close();
      }
    };
    document.addEventListener("keydown", closeOnEscape, true);
    return () => document.removeEventListener("keydown", closeOnEscape, true);
  }, [close]);
  return null;
}

function renderSingleTemplate(adapter: XmluiComponentAdapter, name: string) {
  const rendered = adapter.renderTemplate(name);
  const children = React.Children.toArray(rendered);
  return children.length === 1 ? children[0] : rendered;
}

function renderTriggerTemplate(adapter: XmluiComponentAdapter, name: string) {
  const rendered = renderSingleTemplate(adapter, name);
  return (
    <span>
      {rendered}
    </span>
  );
}

type RuntimeMenuItemProps = React.ComponentProps<typeof MenuItem>;

function RuntimeMenuItem({ children, className, enabled = true, active, icon, iconPosition, label, onClick, ...rest }: RuntimeMenuItemProps) {
  const menuContext = useDropdownMenuContext();
  if (menuContext) {
    return (
      <MenuItem
        {...rest}
        active={active}
        className={className}
        enabled={enabled}
        icon={icon}
        iconPosition={iconPosition}
        label={label}
        onClick={onClick}
      >
        {children}
      </MenuItem>
    );
  }

  const iconToStart = iconPosition !== "end";
  return (
    <div
      {...rest}
      className={`${styles.DropdownMenuItem} ${className ?? ""} ${active ? styles.active : ""} ${!enabled ? styles.disabled : ""}`}
      role="menuitem"
      tabIndex={enabled ? 0 : -1}
      onClick={enabled ? onClick : undefined}
    >
      {iconToStart && icon}
      <div className={styles.wrapper}>{label ?? children}</div>
      {!iconToStart && icon}
    </div>
  );
}

export const dropdownMenuRenderer = wrapRuntimeComponent({
  name: DDMCOMP,
  metadata: DropdownMenuMd as ComponentMetadata,
  renderer: ({ adapter }) => {
    const rootAttrs = adapter.rootAttrs("content");
    const triggerTemplate = hasPropertyChild(adapter.node, "triggerTemplate")
      ? renderTriggerTemplate(adapter, "triggerTemplate")
      : undefined;

    return (
      <DropdownMenu
        {...rootAttrs}
        alignment={adapter.stringProp("alignment", defaultDropdownMenuProps.alignment) as any}
        contentClassName={`${adapter.className} xmlui-DropdownMenuContent`}
        disabled={!adapter.booleanProp("enabled", true)}
        label={adapter.stringProp("label")}
        modal={adapter.booleanProp("modal", false)}
        onWillOpen={async () => {
          const result = await adapter.event("willOpen")();
          return typeof result === "boolean" ? result : undefined;
        }}
        registerComponentApi={adapter.registerApi}
        triggerButtonIcon={adapter.stringProp("triggerButtonIcon", defaultDropdownMenuProps.triggerButtonIcon)}
        triggerButtonIconPosition={adapter.stringProp(
          "triggerButtonIconPosition",
          defaultDropdownMenuProps.triggerButtonIconPosition,
        ) as any}
        triggerButtonThemeColor={adapter.stringProp(
          "triggerButtonThemeColor",
          defaultDropdownMenuProps.triggerButtonThemeColor,
        )}
        triggerButtonVariant={adapter.stringProp(
          "triggerButtonVariant",
          defaultDropdownMenuProps.triggerButtonVariant,
        )}
        triggerTemplate={triggerTemplate}
      >
        <RuntimeDropdownMenuContentAttrs
          className="xmlui-DropdownMenuContent"
          close={adapter.api.close as (() => void) | undefined}
          componentName="DropdownMenuContent"
        />
        {adapter.renderChildren(filterMenuSeparators(adapter.node.children))}
      </DropdownMenu>
    );
  },
});

export const menuItemRuntimeRenderer = wrapRuntimeComponent({
  name: MICOMP,
  metadata: MenuItemMd as ComponentMetadata,
  renderer: ({ adapter }) => {
    const iconName = adapter.stringProp("icon");
    const clickHandlerDefined = Object.prototype.hasOwnProperty.call(adapter.node.events, "click");
    const to = adapter.stringProp("to");

    return (
      <RuntimeMenuItem
        {...adapter.rootAttrs()}
        active={adapter.booleanProp("active", defaultMenuItemProps.active)}
        enabled={adapter.booleanProp("enabled", true)}
        icon={iconName && <ThemedIcon name={iconName} fallback={iconName} />}
        iconPosition={adapter.stringProp("iconPosition", defaultMenuItemProps.iconPosition) as any}
        label={adapter.stringProp("label")}
        onClick={() => {
          if (clickHandlerDefined) {
            void adapter.event("click")();
            return;
          }
          if (to && typeof window !== "undefined") {
            window.history.pushState({}, "", to);
            window.dispatchEvent(new Event("popstate"));
          }
        }}
        to={to}
      >
        {adapter.renderChildren()}
      </RuntimeMenuItem>
    );
  },
});

export const subMenuItemRuntimeRenderer = wrapRuntimeComponent({
  name: SMCOMP,
  metadata: SubMenuItemMd as ComponentMetadata,
  renderer: ({ adapter }) => {
    const iconName = adapter.stringProp("icon");
    const triggerTemplate = hasPropertyChild(adapter.node, "triggerTemplate")
      ? renderTriggerTemplate(adapter, "triggerTemplate")
      : undefined;

    return (
      <SubMenuItem
        {...adapter.rootAttrs("content")}
        contentClassName={`${adapter.className} xmlui-SubMenuContent`}
        icon={iconName && <ThemedIcon name={iconName} fallback={iconName} />}
        iconPosition={adapter.stringProp("iconPosition", defaultMenuItemProps.iconPosition) as any}
        label={adapter.stringProp("label")}
        triggerTemplate={triggerTemplate}
      >
        <RuntimeDropdownMenuContentAttrs
          className="xmlui-SubMenuContent"
          componentName="SubMenuContent"
        />
        {adapter.renderChildren(filterMenuSeparators(adapter.node.children))}
      </SubMenuItem>
    );
  },
});

export const menuSeparatorRuntimeRenderer = wrapRuntimeComponent({
  name: MSEP,
  metadata: MenuSeparatorMd as ComponentMetadata,
  renderer: ({ adapter }) => {
    const attrs = adapter.rootAttrs();
    return (
      <div
        {...attrs}
        className={`${styles.DropdownMenuSeparator} ${adapter.className}`}
        role="separator"
      />
    );
  },
});
