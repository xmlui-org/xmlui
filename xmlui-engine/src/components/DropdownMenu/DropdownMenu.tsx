import type { CSSProperties, ReactNode } from "react";
import { useEffect, useState } from "react";
import * as ReactDropdownMenu from "@radix-ui/react-dropdown-menu";

import styles from "./DropdownMenu.module.scss";

import type { ComponentDef } from "@abstractions/ComponentDefs";
import type { RegisterComponentApiFn } from "@abstractions/RendererDefs";
import { ComponentDescriptor } from "@abstractions/ComponentDescriptorDefs";
import type { ButtonThemeColor, ButtonVariant, IconPosition } from "@components/Button/Button";
import { createComponentRenderer } from "@components-core/renderers";
import { parseScssVar } from "@components-core/theming/themeVars";
import { Button } from "@components/Button/Button";
import { useTheme } from "@components-core/theming/ThemeContext";
import { desc } from "@components-core/descriptorHelper";
import { Icon } from "@components/Icon/Icon";
import { noop } from "@components-core/constants";

// ====================================================================================================================
// React DropdownMenu component implementation

type DropdownMenuProps = {
  triggerTemplate?: ReactNode;
  children?: ReactNode;
  label?: string;
  registerComponentApi?: RegisterComponentApiFn;
  layout?: CSSProperties;
  alignment?: "start" | "center" | "end";
  onWillOpen?: () => Promise<boolean | undefined>;
  disabled?: boolean;
  triggerButtonVariant?: string;
  triggerButtonThemeColor?: string;
};

export function DropdownMenu({
  triggerTemplate,
  children,
  label,
  registerComponentApi,
  layout,
  onWillOpen,
  alignment = "start",
  disabled = false,
  triggerButtonVariant = "ghost",
  triggerButtonThemeColor = "primary",
}: DropdownMenuProps) {
  const { root } = useTheme();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    registerComponentApi?.({
      close: () => setOpen(false),
    });
  }, [registerComponentApi]);

  return (
    <ReactDropdownMenu.Root
      open={open}
      onOpenChange={async (isOpen) => {
        if (isOpen) {
          const willOpenResult = await onWillOpen?.();
          if (willOpenResult === false) {
            return;
          }
        }
        setOpen(isOpen);
      }}
    >
      <ReactDropdownMenu.Trigger asChild disabled={disabled}>
        {triggerTemplate ? (
          triggerTemplate
        ) : (
          <Button
            icon={<Icon name="chevrondown" />}
            type="button"
            variant={triggerButtonVariant as ButtonVariant}
            themeColor={triggerButtonThemeColor as ButtonThemeColor}
          >
            {label}
          </Button>
        )}
      </ReactDropdownMenu.Trigger>
      <ReactDropdownMenu.Portal container={root}>
        <ReactDropdownMenu.Content
          align={alignment}
          style={layout}
          className={styles.DropdownMenuContent}
        >
          {children}
        </ReactDropdownMenu.Content>
      </ReactDropdownMenu.Portal>
    </ReactDropdownMenu.Root>
  );
}

// ====================================================================================================================
// XMLUI DropdownMenu definition

/**
 * This component represents a dropdown menu with a trigger.
 * When the user clicks the trigger, the dropdown menu displays its items.
 */
export interface DropdownMenuComponentDef extends ComponentDef<"DropdownMenu"> {
  props: {
    /**
     * This property allows you to define a custom trigger instead of the default one provided by \`DropdownMenu\`.
     * @descriptionRef
     */
    triggerTemplate?: ComponentDef;
    /**
     * This property defines the label to display in the dropdown menu.
     * If you define a custom trigger template, this property has no effect.
     */
    label?: string;
    /** @descriptionRef */
    alignment?: "start" | "end";
    /**
     * This property enables (\`true\`) or disables (\`false\`) the component.
     * @descriptionRef
     */
    enabled?: string;
    /**
     * This property defines the theme variant of the \`Button\` as the dropdown menu's trigger. It has no 
     * effect when a custom trigger is defined with \`triggerTemplate\`.
     */
    triggerButtonVariant?: string;
    /**
     * This property defines the theme color of the \`Button\` as the dropdown menu's trigger. It has no 
     * effect when a custom trigger is defined with \`triggerTemplate\`.
     */
    triggerButtonThemeColor?: string;
  };
  events: {
    /**
     * This event fires when the \`DropdownMenu\` component is opened.
     * @descriptionRef
     */
    willOpen?: string;
  };
  api: {
    /**
     * The \`close\` command closes the dropdown.
     *
     * Open the dropdown menu and click on any of the menu items to close the menu.
     * @descriptionRef
     */
    close: () => void;
  };
}

const metadata: ComponentDescriptor<DropdownMenuComponentDef> = {
  displayName: "DropdownMenu",
  description:
    "It represents a dropdown menu with multiple menu items. Clicking it displays the available menu items.",
  props: {
    label: desc("The label to display on the button"),
    triggerTemplate: desc("The trigger template to use"),
    alignment: desc("The alignment of the drop-down menu"),
    enabled: desc("Enables or disables the component"),
    triggerButtonVariant: desc("The variant of the trigger button"),
    triggerButtonThemeColor: desc("The theme color of the trigger button"),
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    "color-bg-DropdownMenu": "$color-bg-primary",
    "min-width-DropdownMenu": "160px",
    "shadow-DropdownMenu": "$shadow-md",
    "style-border-DropdownMenu-content": "solid",
  },
};

export const dropdownMenuComponentRenderer =
  createComponentRenderer<DropdownMenuComponentDef>(
    "DropdownMenu",
    ({
      node,
      extractValue,
      renderChild,
      registerComponentApi,
      layoutCss,
      lookupEventHandler,
    }) => {
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
        >
          {renderChild(node.children)}
        </DropdownMenu>
      );
    },
    metadata
  );

// ====================================================================================================================
// React MenuItem component implementation

type MenuItemProps = {
  icon?: ReactNode;
  iconPosition?: IconPosition;
  onClick?: (event: any) => void;
  children?: ReactNode;
  label?: string;
  style?: CSSProperties;
  to?: string;
};

export function MenuItem({
  children,
  onClick = noop,
  label,
  style,
  icon,
  iconPosition = "start",
}: MenuItemProps) {
  const iconToLeft = iconPosition === "left" || iconPosition === "start";

  return (
    <ReactDropdownMenu.Item
      style={style}
      className={styles.DropdownMenuItem}
      onClick={(event) => {
        event.stopPropagation();
        onClick(event);
      }}
    >
      {iconToLeft && icon}
      <div className={styles.wrapper}>{label ?? children}</div>
      {!iconToLeft && icon}
    </ReactDropdownMenu.Item>
  );
}

// ====================================================================================================================
// XMLUI MenuItem definition

interface MenuItemDef extends ComponentDef<"MenuItem"> {
  props: {
    iconPosition?: IconPosition;
    icon?: string;
    label?: string;
    to?: string;
  };
  events: {
    click: string;
  };
}

const menuItemMetadata: ComponentDescriptor<MenuItemDef> = {
  displayName: "MenuItem",
  description:
    "Represents a menu item within a DropDownMenu, clicking of which triggers an action",
  props: {
    iconPosition: desc("Position of the icon displayed"),
    icon: desc("Optional icon ID to display the particular icon"),
    label: desc("The label to display on the button"),
    to: desc("The target URL"),
  },
  events: {
    click: desc("Triggers when the menu item is clicked"),
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    "color-bg-MenuItem": "$color-bg-dropdown-item",
    "color-MenuItem": "$color-text-primary",
    "font-family-MenuItem": "$font-family",
    "font-size-MenuItem": "inherit",
    "padding-vertical-MenuItem": "$space-2",
    "padding-horizontal-MenuItem": "$space-3",
    "color-bg-MenuItem--hover": "$color-bg-dropdown-item--active",
    "color-MenuItem--hover": "inherit",
    "gap-MenuItem": "$space-2",
  },
};

export const menuItemRenderer = createComponentRenderer<MenuItemDef>(
  "MenuItem",
  ({
    node,
    renderChild,
    lookupEventHandler,
    lookupAction,
    extractValue,
    layoutCss,
  }) => {
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
      >
        {renderChild(node.children)}
      </MenuItem>
    );
  },
  menuItemMetadata
);

// ====================================================================================================================
// React SubMenuItem component implementation

type SubMenuItemProps = {
  label?: string;
  children?: ReactNode;
  triggerTemplate?: ReactNode;
};

function SubMenuItem({ children, label, triggerTemplate }: SubMenuItemProps) {
  const { root } = useTheme();

  return (
    <ReactDropdownMenu.Sub>
      <ReactDropdownMenu.SubTrigger
        className={styles.DropdownMenuSubTrigger}
        asChild
      >
        {triggerTemplate ? triggerTemplate : <div>{label}</div>}
      </ReactDropdownMenu.SubTrigger>
      <ReactDropdownMenu.Portal container={root}>
        <ReactDropdownMenu.SubContent className={styles.DropdownMenuSubContent}>
          {children}
        </ReactDropdownMenu.SubContent>
      </ReactDropdownMenu.Portal>
    </ReactDropdownMenu.Sub>
  );
}

// ====================================================================================================================
// XMLUI SubMenuItem definition

interface SubMenuItemDef extends ComponentDef<"SubMenuItem"> {
  props: {
    label?: string;
    triggerTemplate?: ComponentDef;
  };
}

const subMenuItemMetadata: ComponentDescriptor<SubMenuItemDef> = {
  displayName: "SubMenuItem",
  description: "Represents a nested menu item within another menu or menu item",
  props: {
    label: desc("The label to display as the name of the submenu"),
    triggerTemplate: desc("The trigger template to use for this submenu"),
  },
};

export const subMenuItemRenderer = createComponentRenderer<SubMenuItemDef>(
  "SubMenuItem",
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
  subMenuItemMetadata
);

// ====================================================================================================================
// React MenuSeparator component implementation

export function MenuSeparator() {
  return (
    <ReactDropdownMenu.Separator className={styles.DropdownMenuSeparator} />
  );
}

// ====================================================================================================================
// XMLUI MenuSeparator definition

export interface MenuSeparatorDef extends ComponentDef<"MenuSeparator"> {
  props: {};
}

const menuSeparatorMetadata: ComponentDescriptor<MenuSeparatorDef> = {
  displayName: "MenuSeparator",
  description: "Displays a separator line between menu items",
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    "margin-top-MenuSeparator": "$space-1",
    "margin-bottom-MenuSeparator": "$space-1",
    "width-MenuSeparator": "100%",
    "height-MenuSeparator": "1px",
    "color-MenuSeparator": "$color-border-dropdown-item",
    "margin-horizontal-MenuSeparator": "12px",
  },
};

export const menuSeparatorRenderer = createComponentRenderer<MenuSeparatorDef>(
  "MenuSeparator",
  () => {
    return <MenuSeparator />;
  },
  menuSeparatorMetadata
);
