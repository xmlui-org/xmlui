import {
  type CSSProperties,
  forwardRef,
  type ReactNode,
  createContext,
  useContext,
  useCallback,
} from "react";
import { useEffect, useState, useRef } from "react";
import { Popover, PopoverTrigger, PopoverContent, Portal } from "@radix-ui/react-popover";
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

const DropdownMenuContext = createContext<DropdownMenuContextType | null>(null);

const useDropdownMenuContext = () => {
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
  ref,
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

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === "Escape") {
      setOpen(false);
      return;
    }

    // Handle ArrowDown and ArrowUp for navigation
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const content = contentRef.current;
      if (!content) return;

      const menuItems = Array.from(
        content.querySelectorAll('[role="menuitem"]:not([class*="disabled"])'),
      ) as HTMLElement[];

      if (menuItems.length === 0) return;

      const currentIndex = menuItems.findIndex((item) => item === document.activeElement);

      let nextIndex: number;
      if (currentIndex === -1) {
        // No item focused, focus the first one on ArrowDown, last on ArrowUp
        nextIndex = event.key === "ArrowDown" ? 0 : menuItems.length - 1;
      } else if (event.key === "ArrowDown") {
        nextIndex = currentIndex < menuItems.length - 1 ? currentIndex + 1 : 0;
      } else {
        nextIndex = currentIndex > 0 ? currentIndex - 1 : menuItems.length - 1;
      }

      menuItems[nextIndex]?.focus();
    }

    // Let Enter and Space bubble down to the focused menu item
    if (event.key === "Enter" || event.key === " ") {
      // Don't prevent default here - let the menu item handle it
      return;
    }
  }, []);

  return (
    <DropdownMenuContext.Provider value={{ closeMenu }}>
      <Popover
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
        <PopoverTrigger
          {...rest}
          asChild
          disabled={disabled}
          ref={ref as any}
          aria-haspopup="menu"
          aria-expanded={open}
        >
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
        </PopoverTrigger>
        <Portal container={root}>
          <PopoverContent
            ref={contentRef}
            align={alignment}
            style={style}
            className={classnames(styles.DropdownMenuContent, className, {
              [styles.compact]: compact,
            })}
            onOpenAutoFocus={(e) => {
              // Allow focus on the popover content so keyboard events work
              e.preventDefault();
              contentRef.current?.focus();
            }}
            onKeyDownCapture={handleKeyDown}
            role="menu"
            tabIndex={-1}
          >
            {children}
          </PopoverContent>
        </Portal>
      </Popover>
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

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (!enabled) return;

      if (event.key === "Enter") {
        event.preventDefault();
        event.stopPropagation();
        onClick(event as any);
        context?.closeMenu();
      } else if (event.key === " ") {
        event.preventDefault();
        event.stopPropagation();
        onClick(event as any);
        context?.closeMenu();
      }
    },
    [enabled, onClick, context],
  );

  return (
    <div
      style={style}
      className={classnames(className, styles.DropdownMenuItem, {
        [styles.active]: active,
        [styles.disabled]: !enabled,
        [styles.compact]: compact,
      })}
      ref={ref as any}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="menuitem"
      tabIndex={enabled ? 0 : -1}
    >
      {iconToStart && icon}
      <div className={styles.wrapper}>{label ?? children}</div>
      {!iconToStart && icon}
    </div>
  );
});

type SubMenuItemProps = {
  label?: string;
  children?: ReactNode;
  triggerTemplate?: ReactNode;
};

export const SubMenuItem = forwardRef<HTMLDivElement, SubMenuItemProps>(function SubMenuItem(
  { children, label, triggerTemplate },
  ref,
) {
  const { root } = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen} modal={false}>
      <PopoverTrigger asChild>
        <div
          className={styles.DropdownMenuSubTrigger}
          role="menuitem"
          tabIndex={0}
          ref={ref}
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
        >
          {triggerTemplate ? triggerTemplate : <div>{label}</div>}
        </div>
      </PopoverTrigger>
      <Portal container={root}>
        <PopoverContent
          className={styles.DropdownMenuSubContent}
          side="right"
          align="start"
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          {children}
        </PopoverContent>
      </Portal>
    </Popover>
  );
});

export const MenuSeparator = forwardRef<HTMLDivElement>(function MenuSeparator(props, ref) {
  return <div ref={ref} className={styles.DropdownMenuSeparator} role="separator" {...props} />;
});
