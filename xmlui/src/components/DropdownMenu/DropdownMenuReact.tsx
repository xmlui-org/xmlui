import {
  type CSSProperties,
  type ComponentProps,
  forwardRef,
  memo,
  type ReactNode,
  createContext,
  useContext,
  useCallback,
} from "react";
import { useEffect, useState, useRef } from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import classnames from "classnames";

import styles from "./DropdownMenu.module.scss";
import { COMPONENT_PART_KEY } from "../../components-core/theming/responsive-layout";

import type { RegisterComponentApiFn } from "../../abstractions/RendererDefs";
import { useTheme } from "../../components-core/theming/ThemeContext";
import { useComponentThemeClass } from "../../runtime/rendering/theme";
import type { ComponentMetadata } from "../../component-core/metadata";
import { noop } from "../../components-core/constants";
import type {
  IconPosition,
  ButtonVariant,
  ButtonThemeColor,
  AlignmentOptions,
} from "../abstractions";
import { ThemedIcon } from "../Icon/Icon";
import { Button } from "../Button/ButtonReact";
import { ButtonMd } from "../Button/Button";

// Context to manage dropdown menu state
type DropdownMenuContextType = {
  closeMenu: () => void;
  contentClassName?: string;
  contentStyle?: CSSProperties;
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
  contentClassName?: string;
  classes?: Record<string, string>;
  alignment?: AlignmentOptions;
  onWillOpen?: () => Promise<boolean | undefined>;
  disabled?: boolean;
  triggerButtonVariant?: string;
  triggerButtonThemeColor?: string;
  triggerButtonIcon?: string;
  triggerButtonIconPosition?: IconPosition;
  compact?: boolean;
  modal?: boolean;
  menuWidth?: string;
  hasContent?: boolean;
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

export const DropdownMenu = memo(forwardRef(function DropdownMenu(
  {
    triggerTemplate,
    children,
    label,
    registerComponentApi,
    style,
    className,
    contentClassName,
    classes,
    onWillOpen,
    alignment = defaultDropdownMenuProps.alignment,
    disabled = false,
    triggerButtonVariant = defaultDropdownMenuProps.triggerButtonVariant,
    triggerButtonThemeColor = defaultDropdownMenuProps.triggerButtonThemeColor,
    triggerButtonIcon = defaultDropdownMenuProps.triggerButtonIcon,
    triggerButtonIconPosition = defaultDropdownMenuProps.triggerButtonIconPosition,
    compact = false,
    modal = false,
    menuWidth,
    hasContent = true,
    ...rest
  }: DropdownMenuProps,
  ref: React.ForwardedRef<HTMLButtonElement>,
) {
  const { root } = useTheme() as ReturnType<typeof useTheme> & { root?: HTMLElement };
  const [open, setOpen] = useState(false);
  const closeTimeoutRef = useRef<NodeJS.Timeout>();
  const allowModalCloseRef = useRef(false);
  const registeredApiRef = useRef(false);

  useEffect(() => {
    if (registeredApiRef.current) {
      return;
    }
    registeredApiRef.current = true;
    registerComponentApi?.({
      open: () => setOpen(true),
      close: () => {
        allowModalCloseRef.current = true;
        setOpen(false);
      },
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
    allowModalCloseRef.current = true;
    setOpen(false);
  }, []);

  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open || !modal) {
      return;
    }
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Element | null;
      if (!target) {
        return;
      }
      if (target.closest("[data-xmlui-confirm-layer]")) {
        return;
      }
      const openListbox = document.querySelector('[role="listbox"]');
      if (openListbox && contentRef.current && !openListbox.contains(contentRef.current)) {
        return;
      }
      if (contentRef.current?.contains(target)) {
        return;
      }
      (event as PointerEvent & { __xmluiLayerHandled?: boolean }).__xmluiLayerHandled = true;
      allowModalCloseRef.current = true;
      setOpen(false);
    };
    window.addEventListener("pointerdown", onPointerDown, true);
    return () => window.removeEventListener("pointerdown", onPointerDown, true);
  }, [modal, open]);

  const menuContent = (
    <DropdownMenuPrimitive.Content
      {...rest}
      ref={contentRef}
      align={alignment}
      style={{
        ...style,
        ...(menuWidth ? { width: menuWidth } : undefined),
      }}
      className={classnames(styles.DropdownMenuContent, contentClassName, classes?.[COMPONENT_PART_KEY], className, {
        [styles.compact]: compact,
      })}
      data-xmlui-component="DropdownMenuContent"
      data-xmlui-modal-dropdown={modal ? "true" : undefined}
      data-xmlui-part="content"
      tabIndex={-1}
      loop={true}
      onInteractOutside={(event) => {
        if (!modal) {
          return;
        }
        const originalEvent = (event as unknown as { detail?: { originalEvent?: Event } })
          .detail?.originalEvent as (Event & { __xmluiLayerHandled?: boolean }) | undefined;
        if (originalEvent) {
          originalEvent.__xmluiLayerHandled = true;
        }
      }}
      onCloseAutoFocus={(event) => {
        if (modal) {
          event.preventDefault();
        }
      }}
    >
      {children}
    </DropdownMenuPrimitive.Content>
  );

  return (
    <DropdownMenuContext.Provider
      value={{
        closeMenu,
        contentClassName: classnames(contentClassName, classes?.[COMPONENT_PART_KEY], className),
        contentStyle: style,
      }}
    >
      <DropdownMenuPrimitive.Root
        open={open}
        onOpenChange={async (isOpen) => {
          if (disabled) return;
          if (isOpen && !hasContent) {
            setOpen(false);
            return;
          }

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
            if (modal) {
              if (allowModalCloseRef.current) {
                allowModalCloseRef.current = false;
                setOpen(false);
              } else {
                setTimeout(() => setOpen(true), 0);
              }
              return;
            }
            // When closing, add a small delay to allow child components (like Select)
            // to handle their click-outside events first before the DropdownMenu closes
            closeTimeoutRef.current = setTimeout(() => {
              setOpen(false);
              closeTimeoutRef.current = undefined;
            }, 0);
          }
        }}
        modal={false}
      >
        <DropdownMenuPrimitive.Trigger {...rest} asChild disabled={disabled} ref={ref}>
          {triggerTemplate ? (
            <span>
              {triggerTemplate}
            </span>
          ) : (
            <ThemedButton
              icon={<ThemedIcon name={triggerButtonIcon} fallback="chevrondown" />}
              iconPosition={triggerButtonIconPosition}
              type="button"
              variant={triggerButtonVariant as ButtonVariant}
              themeColor={triggerButtonThemeColor as ButtonThemeColor}
              disabled={disabled}
              className=""
            >
              {label}
            </ThemedButton>
          )}
        </DropdownMenuPrimitive.Trigger>
        {modal ? menuContent : <DropdownMenuPrimitive.Portal container={root}>{menuContent}</DropdownMenuPrimitive.Portal>}
      </DropdownMenuPrimitive.Root>
    </DropdownMenuContext.Provider>
  );
}));

type ThemedButtonProps = ComponentProps<typeof Button>;

const ThemedButton = forwardRef<HTMLButtonElement, ThemedButtonProps>(function ThemedButton(
  { classes, style, ...props },
  ref,
) {
  const themeClass = useComponentThemeClass("Button", ButtonMd as ComponentMetadata);
  return (
    <Button
      {...props}
      ref={ref}
      classes={{
        ...classes,
        [COMPONENT_PART_KEY]: classnames(themeClass.className, classes?.[COMPONENT_PART_KEY]),
      }}
      style={{
        ...themeClass.style,
        ...style,
      }}
    />
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
  classes?: Record<string, string>;
  to?: string;
  active?: boolean;
  enabled?: boolean;
  compact?: boolean;
  [key: string]: any;
};

export const defaultMenuItemProps: Pick<MenuItemProps, "iconPosition" | "active"> = {
  iconPosition: "start",
  active: false,
};

export const MenuItem = memo(forwardRef(function MenuItem(
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
    classes,
    ...rest
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

  if (!context) {
    return (
      <div
        {...rest}
        style={style}
        className={classnames(classes?.[COMPONENT_PART_KEY], className, styles.DropdownMenuItem, {
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
      </div>
    );
  }

  return (
    <DropdownMenuPrimitive.Item
      {...rest}
      style={style}
      className={classnames(classes?.[COMPONENT_PART_KEY], className, styles.DropdownMenuItem, {
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
}));

type SubMenuItemProps = {
  label?: string;
  icon?: ReactNode;
  iconPosition?: IconPosition;
  children?: ReactNode;
  triggerTemplate?: ReactNode;
  className?: string;
  contentClassName?: string;
  style?: CSSProperties;
};

export const SubMenuItem = forwardRef<HTMLDivElement, SubMenuItemProps>(function SubMenuItem(
  {
    children,
    label,
    icon,
    iconPosition = defaultMenuItemProps.iconPosition,
    triggerTemplate,
    className,
    contentClassName,
    style,
  },
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  const { root } = useTheme() as ReturnType<typeof useTheme> & { root?: HTMLElement };
  const [open, setOpen] = useState(false);
  const iconToStart = iconPosition === "start";
  const context = useDropdownMenuContext();
  const resolvedContentClassName = classnames(styles.DropdownMenuSubContent, contentClassName, context?.contentClassName);

  const handleOpenChange = useCallback((isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      pushXsLog({
        ts: Date.now(),
        perfTs: typeof performance !== "undefined" ? performance.now() : undefined,
        traceId: typeof window !== "undefined" ? (window as any)._xsCurrentTrace : undefined,
        kind: "submenu:open",
        displayLabel: label,
        componentLabel: label,
        ariaRole: "menuitem",
        ariaName: label,
      });
    }
  }, [label]);

  return (
    <DropdownMenuPrimitive.Sub open={open} onOpenChange={handleOpenChange}>
      <DropdownMenuPrimitive.SubTrigger
        ref={ref}
        className={classnames(styles.DropdownMenuSubTrigger, className)}
        style={menuItemStyleFromSubMenuItemStyle(style)}
        asChild
      >
        {triggerTemplate ? (
          <div className={styles.subMenuItemTrigger}>
            {triggerTemplate}
          </div>
        ) : (
          <div className={styles.subMenuItemTrigger}>
            {icon && iconToStart && <span className={styles.iconStart}>{icon}</span>}
            <div className={styles.wrapper}>{label}</div>
            {icon && !iconToStart && <span className={styles.iconEnd}>{icon}</span>}
            <span className={styles.chevronIcon}>
              <ThemedIcon name="chevronright" fallback="chevronright" />
            </span>
          </div>
        )}
      </DropdownMenuPrimitive.SubTrigger>
      <DropdownMenuPrimitive.Portal container={root}>
        <DropdownMenuPrimitive.SubContent
          className={resolvedContentClassName}
          style={context?.contentStyle}
          data-xmlui-component="SubMenuContent"
          sideOffset={2}
          loop={true}
          onInteractOutside={(event) => {
            if (context?.closeMenu && contentClassName?.includes("xmlui-DropdownMenu")) {
              event.preventDefault();
            }
          }}
        >
          {children}
        </DropdownMenuPrimitive.SubContent>
      </DropdownMenuPrimitive.Portal>
    </DropdownMenuPrimitive.Sub>
  );
});

export const MenuSeparator = forwardRef<HTMLDivElement>(function MenuSeparator({ className, ...props }: React.HTMLAttributes<HTMLDivElement>, ref) {
  return (
    <div
      {...props}
      data-xmlui-component="MenuSeparator"
      data-xmlui-part="root"
      ref={ref}
      className={classnames(styles.DropdownMenuSeparator, className)}
      role="separator"
    />
  );
});

export const DropdownMenuComponent = DropdownMenu;
export const MenuItemComponent = MenuItem;
export const MenuSeparatorComponent = MenuSeparator;
export const SubMenuItemComponent = SubMenuItem;

function pushXsLog(_entry: Record<string, unknown>) {
  // The rewrite does not carry the old inspector event stream yet. Keep the
  // restored Radix submenu behavior intact while treating inspector logging as
  // an optional side channel.
}

function menuItemStyleFromSubMenuItemStyle(style: CSSProperties | undefined): CSSProperties | undefined {
  if (!style) {
    return undefined;
  }
  return {
    ...style,
    "--xmlui-backgroundColor-MenuItem": "var(--xmlui-backgroundColor-SubMenuItem)",
    "--xmlui-backgroundColor-MenuItem--hover": "var(--xmlui-backgroundColor-SubMenuItem--hover)",
    "--xmlui-color-MenuItem": "var(--xmlui-color-SubMenuItem)",
    "--xmlui-color-MenuItem--hover": "var(--xmlui-color-SubMenuItem--hover)",
    "--xmlui-fontFamily-MenuItem": "var(--xmlui-fontFamily-SubMenuItem)",
    "--xmlui-fontSize-MenuItem": "var(--xmlui-fontSize-SubMenuItem)",
    "--xmlui-paddingVertical-MenuItem": "var(--xmlui-paddingVertical-SubMenuItem)",
    "--xmlui-paddingHorizontal-MenuItem": "var(--xmlui-paddingHorizontal-SubMenuItem)",
    "--xmlui-gap-MenuItem": "var(--xmlui-gap-SubMenuItem)",
  } as CSSProperties;
}
