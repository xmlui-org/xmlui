import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import { createContext, forwardRef, useCallback, useContext, useEffect, useRef, useState } from "react";

import styles from "./DropdownMenu.module.scss";

export type MenuContextValue = {
  closeMenu?: () => void;
};

export const MenuContext = createContext<MenuContextValue | undefined>(undefined);

export function useMenuContext(): MenuContextValue {
  return useContext(MenuContext) ?? {};
}

export type DropdownMenuApi = {
  close: () => void;
  open: () => void;
};

export type DropdownMenuProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  alignment?: "start" | "center" | "end";
  children?: ReactNode;
  contentClassName?: string;
  disabled?: boolean;
  label?: string;
  menuWidth?: string;
  onWillOpen?: () => boolean | undefined | Promise<boolean | undefined>;
  registerComponentApi?: (api: DropdownMenuApi) => void;
  triggerTemplate?: ReactNode;
};

export const defaultDropdownMenuProps = {
  alignment: "start" as "start" | "center" | "end",
  triggerButtonVariant: "ghost",
  triggerButtonThemeColor: "primary",
  triggerButtonIcon: "triggerButton:DropdownMenu",
  triggerButtonIconPosition: "end" as "start" | "end",
};

export const DropdownMenuComponent = forwardRef<HTMLDivElement, DropdownMenuProps>(function DropdownMenuComponent(
  {
    alignment = defaultDropdownMenuProps.alignment,
    children,
    className,
    contentClassName,
    disabled = false,
    label,
    menuWidth,
    onWillOpen,
    registerComponentApi,
    style,
    triggerTemplate,
    ...rest
  },
  ref,
) {
  const triggerRef = useRef<HTMLButtonElement | HTMLSpanElement | null>(null);
  const [openState, setOpenState] = useState(false);
  const [position, setPosition] = useState({ left: 0, top: 0 });

  const close = useCallback(() => setOpenState(false), []);
  const open = useCallback(async () => {
    if (disabled) {
      return;
    }
    const willOpenResult = await onWillOpen?.();
    if (willOpenResult === false) {
      return;
    }
    const rect = triggerRef.current?.getBoundingClientRect();
    if (rect) {
      const left = alignment === "end"
        ? rect.right
        : alignment === "center"
          ? rect.left + rect.width / 2
          : rect.left;
      setPosition({ left, top: rect.bottom + 4 });
    }
    setOpenState(true);
  }, [alignment, disabled, onWillOpen]);

  useEffect(() => {
    registerComponentApi?.({ open, close });
  }, [close, open, registerComponentApi]);

  useEffect(() => {
    if (!openState) {
      return;
    }
    const onPointerDown = () => close();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        close();
      }
    };
    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [close, openState]);

  return (
    <MenuContext.Provider value={{ closeMenu: close }}>
      {triggerTemplate ? (
        <span
          data-xmlui-component="DropdownMenuTrigger"
          onClick={(event) => {
            event.stopPropagation();
            void (openState ? close() : open());
          }}
          ref={triggerRef}
        >
          {triggerTemplate}
        </span>
      ) : (
        <button
          className={styles.trigger}
          data-xmlui-component="DropdownMenu"
          disabled={disabled}
          onClick={(event) => {
            event.stopPropagation();
            void (openState ? close() : open());
          }}
          ref={triggerRef as React.Ref<HTMLButtonElement>}
          type="button"
        >
          {label || "Menu"}
        </button>
      )}
      {openState ? (
        <div
          {...rest}
          className={[styles.content, contentClassName, className].filter(Boolean).join(" ")}
          data-xmlui-component="DropdownMenuContent"
          data-xmlui-part="content"
          ref={ref}
          role="menu"
          style={{
            ...(style as CSSProperties),
            left: position.left,
            top: position.top,
            transform: alignment === "end" ? "translateX(-100%)" : alignment === "center" ? "translateX(-50%)" : undefined,
            ...(menuWidth ? { width: menuWidth } : null),
          }}
          onPointerDown={(event) => event.stopPropagation()}
        >
          {children}
        </div>
      ) : null}
    </MenuContext.Provider>
  );
});

export type MenuItemProps = Omit<HTMLAttributes<HTMLDivElement>, "onClick"> & {
  active?: boolean;
  children?: ReactNode;
  enabled?: boolean;
  icon?: ReactNode;
  iconPosition?: "start" | "end";
  label?: string;
  onClick?: () => void | Promise<void>;
};

export const MenuItemComponent = forwardRef<HTMLDivElement, MenuItemProps>(function MenuItemComponent(
  {
    active = false,
    children,
    className,
    enabled = true,
    icon,
    iconPosition = "start",
    label,
    onClick,
    ...rest
  },
  ref,
) {
  const menu = useMenuContext();
  const content = children ?? label;
  return (
    <div
      {...rest}
      aria-disabled={!enabled || undefined}
      className={[
        styles.menuItem,
        active && styles.menuItemActive,
        !enabled && styles.menuItemDisabled,
        className,
      ].filter(Boolean).join(" ")}
      data-xmlui-component="MenuItem"
      ref={ref}
      role="menuitem"
      tabIndex={enabled ? 0 : -1}
      onClick={() => {
        if (!enabled) {
          return;
        }
        void onClick?.();
        menu.closeMenu?.();
      }}
      onKeyDown={(event) => {
        if ((event.key === "Enter" || event.key === " ") && enabled) {
          event.preventDefault();
          void onClick?.();
          menu.closeMenu?.();
        }
      }}
    >
      {icon && iconPosition !== "end" ? icon : null}
      <span>{content}</span>
      {icon && iconPosition === "end" ? icon : null}
    </div>
  );
});

export type MenuSeparatorProps = HTMLAttributes<HTMLDivElement>;

export const MenuSeparatorComponent = forwardRef<HTMLDivElement, MenuSeparatorProps>(
  function MenuSeparatorComponent({ className, ...rest }, ref) {
    return (
      <div
        {...rest}
        aria-orientation="horizontal"
        className={[styles.menuSeparator, className].filter(Boolean).join(" ")}
        data-xmlui-component="MenuSeparator"
        ref={ref}
        role="separator"
      />
    );
  },
);

export type SubMenuItemProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  children?: ReactNode;
  icon?: ReactNode;
  iconPosition?: "start" | "end";
  label?: string;
  triggerTemplate?: ReactNode;
};

export const SubMenuItemComponent = forwardRef<HTMLDivElement, SubMenuItemProps>(function SubMenuItemComponent(
  {
    children,
    className,
    icon,
    iconPosition = "start",
    label,
    triggerTemplate,
    ...rest
  },
  ref,
) {
  const [openState, setOpenState] = useState(false);

  return (
    <div
      {...rest}
      className={[styles.subMenuItem, className].filter(Boolean).join(" ")}
      data-xmlui-component="SubMenuItem"
      ref={ref}
      onMouseEnter={() => setOpenState(true)}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          setOpenState(false);
        }
      }}
    >
      <div
        aria-expanded={openState}
        className={styles.subMenuTrigger}
        role="menuitem"
        tabIndex={0}
        onClick={(event) => {
          event.stopPropagation();
          setOpenState((current) => !current);
        }}
        onFocus={() => setOpenState(true)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " " || event.key === "ArrowRight") {
            event.preventDefault();
            setOpenState(true);
          }
        }}
      >
        {triggerTemplate ?? (
          <>
            {icon && iconPosition !== "end" ? icon : null}
            <span className={styles.subMenuLabel}>{label}</span>
            {icon && iconPosition === "end" ? icon : null}
            <span aria-hidden="true" className={styles.subMenuIndicator}>
              &rsaquo;
            </span>
          </>
        )}
      </div>
      {openState ? (
        <div className={styles.subMenuContent} data-xmlui-component="SubMenuContent" role="menu">
          {children}
        </div>
      ) : null}
    </div>
  );
});
