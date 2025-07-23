import { type CSSProperties, forwardRef, type ReactNode } from "react";
import { useEffect, useState } from "react";
import * as ReactDropdownMenu from "@radix-ui/react-dropdown-menu";
import classnames from "classnames";

import styles from "./DropdownMenu.module.scss";

import type { RegisterComponentApiFn } from "../../abstractions/RendererDefs";
import { useTheme } from "../../components-core/theming/ThemeContext";
import { noop } from "../../components-core/constants";
import type {
  IconPosition,
  ButtonVariant,
  ButtonThemeColor,
  AlignmentOptions,
} from "../abstractions";
import { Button } from "../Button/ButtonNative";
import { Icon } from "../Icon/IconNative";

type DropdownMenuProps = {
  triggerTemplate?: ReactNode;
  children?: ReactNode;
  label?: string;
  registerComponentApi?: RegisterComponentApiFn;
  style?: CSSProperties;
  alignment?: AlignmentOptions;
  onWillOpen?: () => Promise<boolean | undefined>;
  disabled?: boolean;
  triggerButtonVariant?: string;
  triggerButtonThemeColor?: string;
  triggerButtonIcon?: string;
  triggerButtonIconPosition?: IconPosition;
};

export const defaultDropdownMenuProps: Pick<
  DropdownMenuProps,
  | "alignment"
  | "triggerButtonVariant"
  | "triggerButtonThemeColor"
  | "triggerButtonIcon"
  | "triggerButtonIconPosition"
> = {
  alignment: "start",
  triggerButtonVariant: "ghost",
  triggerButtonThemeColor: "primary",
  triggerButtonIcon: "triggerButton:DropdownMenu", // Use component-specific icon resource pattern
  triggerButtonIconPosition: "end",
};

export const DropdownMenu = forwardRef(function DropdownMenu(
  {
    triggerTemplate,
    children,
    label,
    registerComponentApi,
    style,
    onWillOpen,
    alignment = defaultDropdownMenuProps.alignment,
    disabled = false,
    triggerButtonVariant = defaultDropdownMenuProps.triggerButtonVariant,
    triggerButtonThemeColor = defaultDropdownMenuProps.triggerButtonThemeColor,
    triggerButtonIcon = defaultDropdownMenuProps.triggerButtonIcon,
    triggerButtonIconPosition = defaultDropdownMenuProps.triggerButtonIconPosition,
  }: DropdownMenuProps,
  ref,
) {
  const { root } = useTheme();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    registerComponentApi?.({
      open: () => setOpen(true),
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
      <ReactDropdownMenu.Trigger asChild disabled={disabled} ref={ref as any}>
        {triggerTemplate ? (
          triggerTemplate
        ) : (
          <Button
            icon={<Icon name={triggerButtonIcon} fallback="chevrondown" />}
            iconPosition={triggerButtonIconPosition}
            type="button"
            variant={triggerButtonVariant as ButtonVariant}
            themeColor={triggerButtonThemeColor as ButtonThemeColor}
            disabled={disabled}
          >
            {label}
          </Button>
        )}
      </ReactDropdownMenu.Trigger>
      <ReactDropdownMenu.Portal container={root}>
        <ReactDropdownMenu.Content
          align={alignment}
          style={style}
          className={styles.DropdownMenuContent}
        >
          {children}
        </ReactDropdownMenu.Content>
      </ReactDropdownMenu.Portal>
    </ReactDropdownMenu.Root>
  );
});

type MenuItemProps = {
  icon?: ReactNode;
  iconPosition?: IconPosition;
  onClick?: (event: any) => void;
  children?: ReactNode;
  label?: string;
  style?: CSSProperties;
  to?: string;
  active?: boolean;
  enabled?: boolean;
};

export const defaultMenuItemProps: Pick<MenuItemProps, "iconPosition" | "active"> = {
  iconPosition: "start",
  active: false,
};

export const MenuItem = forwardRef(function MenuItem(
  {
    children,
    onClick = noop,
    label,
    style,
    icon,
    iconPosition = defaultMenuItemProps.iconPosition,
    active = defaultMenuItemProps.active,
    enabled = true,
  }: MenuItemProps,
  ref,
) {
  const iconToStart = iconPosition === "start";

  return (
    <ReactDropdownMenu.Item
      style={style}
      className={classnames(styles.DropdownMenuItem, {
        [styles.active]: active,
        [styles.disabled]: !enabled,
      })}
      onClick={(event) => {
        if (!enabled) {
          event.preventDefault();
          event.stopPropagation();
          return;
        }
        event.stopPropagation();
        if (enabled) {
          onClick(event);
        }
      }}
      ref={ref as any}
    >
      {iconToStart && icon}
      <div className={styles.wrapper}>{label ?? children}</div>
      {!iconToStart && icon}
    </ReactDropdownMenu.Item>
  );
});

type SubMenuItemProps = {
  label?: string;
  children?: ReactNode;
  triggerTemplate?: ReactNode;
};

export function SubMenuItem({ children, label, triggerTemplate }: SubMenuItemProps) {
  const { root } = useTheme();

  return (
    <ReactDropdownMenu.Sub>
      <ReactDropdownMenu.SubTrigger className={styles.DropdownMenuSubTrigger} asChild>
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

export function MenuSeparator() {
  return <ReactDropdownMenu.Separator className={styles.DropdownMenuSeparator} />;
}
