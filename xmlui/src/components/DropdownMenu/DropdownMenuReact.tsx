import {
  type CSSProperties,
  forwardRef,
  type HTMLAttributes,
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
import { noop } from "../../components-core/constants";
import { pushXsLog } from "../../components-core/inspector/inspectorUtils";
import type {
  IconPosition,
  ButtonVariant,
  ButtonThemeColor,
  AlignmentOptions,
} from "../abstractions";
import { ThemedIcon } from "../Icon/Icon";
import { ThemedButton } from "../Button/Button";

// Context to manage dropdown menu state
type DropdownMenuContextType = {
  closeMenu: () => void;
  contentClassName?: string;
};

export const DropdownMenuContext = createContext<DropdownMenuContextType | null>(null);

export const useDropdownMenuContext = () => {
  const context = useContext(DropdownMenuContext);
  return context;
};

function hasVisibleLayer(selector: string): boolean {
  if (typeof document === "undefined") {
    return false;
  }
  return Array.from(document.querySelectorAll<HTMLElement>(selector)).some((element) => {
    const style = window.getComputedStyle(element);
    return style.display !== "none" && style.visibility !== "hidden" && element.getClientRects().length > 0;
  });
}

type DropdownSuppressionWindow = Window & {
  __xmluiSuppressNextDropdownClose?: boolean;
  __xmluiSuppressDropdownCloseUntil?: number;
};

function markDropdownCloseSuppressed(durationMs = 80) {
  if (typeof window === "undefined") {
    return;
  }
  const suppressionWindow = window as DropdownSuppressionWindow;
  suppressionWindow.__xmluiSuppressNextDropdownClose = true;
  suppressionWindow.__xmluiSuppressDropdownCloseUntil = Date.now() + durationMs;
}

function shouldSuppressDropdownClose() {
  if (typeof window === "undefined") {
    return false;
  }
  const suppressionWindow = window as DropdownSuppressionWindow;
  if ((suppressionWindow.__xmluiSuppressDropdownCloseUntil ?? 0) > Date.now()) {
    return true;
  }
  if (suppressionWindow.__xmluiSuppressNextDropdownClose) {
    return true;
  }
  return false;
}

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

  useEffect(() => {
    if (!open) {
      return;
    }
    const markChildLayerClose = () => {
      if (hasVisibleLayer(".xmlui-AutoCompleteContent, [role='listbox']")) {
        markDropdownCloseSuppressed();
      } else if (typeof window !== "undefined") {
        const suppressionWindow = window as DropdownSuppressionWindow;
        suppressionWindow.__xmluiSuppressNextDropdownClose = false;
        suppressionWindow.__xmluiSuppressDropdownCloseUntil = 0;
      }
    };
    document.addEventListener("pointerdown", markChildLayerClose, true);
    return () => document.removeEventListener("pointerdown", markChildLayerClose, true);
  }, [open]);

  const closeMenu = useCallback(() => {
    setOpen(false);
  }, []);

  const contentRef = useRef<HTMLDivElement>(null);

  return (
    <DropdownMenuContext.Provider value={{ closeMenu, contentClassName: classnames(contentClassName, classes?.[COMPONENT_PART_KEY], className) }}>
      <DropdownMenuPrimitive.Root
        open={open}
        onOpenChange={async (isOpen) => {
          if (disabled) return;

          if (isOpen) {
            if (typeof window !== "undefined") {
              markDropdownCloseSuppressed(0);
            }
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
            if (shouldSuppressDropdownClose()) {
              return;
            }
            // When closing, add a small delay to allow child components (like Select)
            // to handle their click-outside events first before the DropdownMenu closes
            closeTimeoutRef.current = setTimeout(() => {
              if (shouldSuppressDropdownClose()) {
                closeTimeoutRef.current = undefined;
                return;
              }
              setOpen(false);
              closeTimeoutRef.current = undefined;
            }, 0);
          }
        }}
        modal={modal}
      >
        <DropdownMenuPrimitive.Trigger
          {...rest}
          asChild
          disabled={disabled}
          onPointerDown={(event) => {
            markDropdownCloseSuppressed(0);
            (rest as HTMLAttributes<HTMLElement>).onPointerDown?.(event);
          }}
          ref={ref}
        >
          {triggerTemplate ? (
            triggerTemplate
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
        <DropdownMenuPrimitive.Portal container={root}>
          <DropdownMenuPrimitive.Content
            ref={contentRef}
            align={alignment}
            onClick={(event) => event.stopPropagation()}
            onCloseAutoFocus={(event) => event.preventDefault()}
            onInteractOutside={(event) => {
              if (hasVisibleLayer(".xmlui-AutoCompleteContent, [role='listbox']")) {
                markDropdownCloseSuppressed();
                event.preventDefault();
              }
            }}
            onPointerDownOutside={(event) => {
              if (hasVisibleLayer(".xmlui-AutoCompleteContent, [role='listbox']")) {
                markDropdownCloseSuppressed();
                event.preventDefault();
              }
            }}
            onOpenAutoFocus={(event) => event.preventDefault()}
            onPointerDown={(event) => event.stopPropagation()}
            style={style}
            className={classnames(styles.DropdownMenuContent, contentClassName, classes?.[COMPONENT_PART_KEY], className, {
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
}));

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
};

export const SubMenuItem = forwardRef<HTMLDivElement, SubMenuItemProps>(function SubMenuItem(
  { children, label, icon, iconPosition = defaultMenuItemProps.iconPosition, triggerTemplate, className, contentClassName },
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  const { root } = useTheme();
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
      <DropdownMenuPrimitive.SubTrigger ref={ref} className={styles.DropdownMenuSubTrigger} asChild>
        {triggerTemplate ? (
          triggerTemplate
        ) : (
          <div className={styles.subMenuItemTrigger}>
            {iconToStart && icon}
            <div className={styles.wrapper}>{label}</div>
            {!iconToStart && icon}
            <ThemedIcon name="chevronright" fallback="chevronright" />
          </div>
        )}
      </DropdownMenuPrimitive.SubTrigger>
      <DropdownMenuPrimitive.Portal container={root}>
        <DropdownMenuPrimitive.SubContent
          className={resolvedContentClassName}
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
