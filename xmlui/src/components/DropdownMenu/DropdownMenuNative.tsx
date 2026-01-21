import {
  type CSSProperties,
  forwardRef,
  type ReactNode,
  createContext,
  useContext,
  useCallback,
} from "react";
import { useEffect, useState, useRef } from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
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

// Context to manage dropdown menu state
type DropdownMenuContextType = {
  closeMenu: () => void;
};

export const DropdownMenuContext = createContext<DropdownMenuContextType | null>(null);

export const useDropdownMenuContext = () => {
  const context = useContext(DropdownMenuContext);
  return context;
};

type DropdownMenuProps = {
  triggerTemplate?: ReactNode;
  children?: ReactNode;
  label?: string;
  registerComponentApi?: RegisterComponentApiFn;
  style?: CSSProperties;
  className?: string;
  alignment?: AlignmentOptions;
  onWillOpen?: () => Promise<boolean | undefined>;
  disabled?: boolean;
  triggerButtonVariant?: string;
  triggerButtonThemeColor?: string;
  triggerButtonIcon?: string;
  triggerButtonIconPosition?: IconPosition;
  compact?: boolean;
  modal?: boolean;
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
    className,
    onWillOpen,
    alignment = defaultDropdownMenuProps.alignment,
    disabled = false,
    triggerButtonVariant = defaultDropdownMenuProps.triggerButtonVariant,
    triggerButtonThemeColor = defaultDropdownMenuProps.triggerButtonThemeColor,
    triggerButtonIcon = defaultDropdownMenuProps.triggerButtonIcon,
    triggerButtonIconPosition = defaultDropdownMenuProps.triggerButtonIconPosition,
    compact = false,
    modal = false,
    ...rest
  }: DropdownMenuProps,
  ref: React.ForwardedRef<HTMLButtonElement>,
) {
  const { root } = useTheme();
  const [open, setOpen] = useState(false);
  const closeTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    registerComponentApi?.({
      open: () => setOpen(true),
      close: () => setOpen(false),
    });
  }, [registerComponentApi]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  const closeMenu = useCallback(() => {
    setOpen(false);
  }, []);

  const contentRef = useRef<HTMLDivElement>(null);

  return (
    <DropdownMenuContext.Provider value={{ closeMenu }}>
      <DropdownMenuPrimitive.Root
        open={open}
        onOpenChange={async (isOpen) => {
          if (disabled) return;

          if (isOpen) {
            // Clear any pending close timeout when opening
            if (closeTimeoutRef.current) {
              clearTimeout(closeTimeoutRef.current);
              closeTimeoutRef.current = undefined;
            }

            const willOpenResult = await onWillOpen?.();
            if (willOpenResult === false) {
              return;
            }
            setOpen(isOpen);
          } else {
            // When closing, add a small delay to allow child components (like Select)
            // to handle their click-outside events first before the DropdownMenu closes
            closeTimeoutRef.current = setTimeout(() => {
              setOpen(false);
              closeTimeoutRef.current = undefined;
            }, 0);
          }
        }}
        modal={modal}
      >
        <DropdownMenuPrimitive.Trigger {...rest} asChild disabled={disabled} ref={ref}>
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
        </DropdownMenuPrimitive.Trigger>
        <DropdownMenuPrimitive.Portal container={root}>
          <DropdownMenuPrimitive.Content
            ref={contentRef}
            align={alignment}
            style={style}
            className={classnames(styles.DropdownMenuContent, className, {
              [styles.compact]: compact,
            })}
            tabIndex={-1}
            loop={true}
          >
            {children}
          </DropdownMenuPrimitive.Content>
        </DropdownMenuPrimitive.Portal>
      </DropdownMenuPrimitive.Root>
    </DropdownMenuContext.Provider>
  );
});

type MenuItemProps = {
  icon?: ReactNode;
  iconPosition?: IconPosition;
  onClick?: (event: any) => void;
  children?: ReactNode;
  label?: string;
  style?: CSSProperties;
  className?: string;
  to?: string;
  active?: boolean;
  enabled?: boolean;
  compact?: boolean;
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
    className,
    icon,
    iconPosition = defaultMenuItemProps.iconPosition,
    active = defaultMenuItemProps.active,
    enabled = true,
    compact = false,
  }: MenuItemProps,
  ref,
) {
  const iconToStart = iconPosition === "start";
  const context = useDropdownMenuContext();

  const handleClick = useCallback(
    (event: React.MouseEvent) => {
      if (!enabled) return;
      onClick(event);
      // Close the menu after clicking an item
      context?.closeMenu();
    },
    [enabled, onClick, context],
  );

  return (
    <DropdownMenuPrimitive.Item
      style={style}
      className={classnames(className, styles.DropdownMenuItem, {
        [styles.active]: active,
        [styles.disabled]: !enabled,
        [styles.compact]: compact,
      })}
      ref={ref as any}
      onClick={handleClick}
      role="menuitem"
      tabIndex={enabled ? 0 : -1}
    >
      {iconToStart && icon}
      <div className={styles.wrapper}>{label ?? children}</div>
      {!iconToStart && icon}
    </DropdownMenuPrimitive.Item>
  );
});

type SubMenuItemProps = {
  label?: string;
  children?: ReactNode;
  triggerTemplate?: ReactNode;
};

export const SubMenuItem = forwardRef<HTMLDivElement, SubMenuItemProps>(function SubMenuItem(
  { children, label, triggerTemplate },
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  const { root } = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <DropdownMenuPrimitive.Sub open={open} onOpenChange={setOpen}>
      <DropdownMenuPrimitive.SubTrigger ref={ref} className={styles.DropdownMenuSubTrigger} asChild>
        {triggerTemplate ? triggerTemplate : <div>{label}</div>}
      </DropdownMenuPrimitive.SubTrigger>
      <DropdownMenuPrimitive.Portal container={root}>
        <DropdownMenuPrimitive.SubContent
          className={styles.DropdownMenuSubContent}
          sideOffset={2}
          loop={true}
        >
          {children}
        </DropdownMenuPrimitive.SubContent>
      </DropdownMenuPrimitive.Portal>
    </DropdownMenuPrimitive.Sub>
  );
});

export const MenuSeparator = forwardRef<HTMLDivElement>(function MenuSeparator(props, ref) {
  return <div ref={ref} className={styles.DropdownMenuSeparator} role="separator" {...props} />;
});
