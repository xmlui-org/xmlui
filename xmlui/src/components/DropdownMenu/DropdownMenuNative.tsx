import { type CSSProperties, forwardRef, type ReactNode } from "react";
import { useEffect, useState } from "react";
import * as ReactDropdownMenu from "@radix-ui/react-dropdown-menu";

import styles from "./DropdownMenu.module.scss";

import type { RegisterComponentApiFn } from "@abstractions/RendererDefs";
import type { IconPosition, ButtonVariant, ButtonThemeColor } from "@components/abstractions";

import { Button } from "@components/Button/ButtonNative";
import { useTheme } from "@components-core/theming/ThemeContext";
import { Icon } from "@components/Icon/IconNative";
import classnames from "@components-core/utils/classnames";
import { noop } from "@components-core/constants";

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
  triggerButtonIcon?: string;
  triggerButtonIconPosition?: IconPosition;
};

export const DropdownMenu = forwardRef(function DropdownMenu(
  {
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
    triggerButtonIcon = "chevrondown",
    triggerButtonIconPosition = "end",
  }: DropdownMenuProps,
  ref,
) {
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
      <ReactDropdownMenu.Trigger asChild disabled={disabled} ref={ref as any}>
        {triggerTemplate ? (
          triggerTemplate
        ) : (
          <Button
            icon={<Icon name={triggerButtonIcon} />}
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
          style={layout}
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
};

export function MenuItem({
  children,
  onClick = noop,
  label,
  style,
  icon,
  iconPosition = "start",
  active = false,
}: MenuItemProps) {
  const iconToLeft = iconPosition === "start";

  return (
    <ReactDropdownMenu.Item
      style={style}
      className={classnames(styles.DropdownMenuItem, {
        [styles.active]: active,
      })}
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
