import {
  type AnchorHTMLAttributes,
  type CSSProperties,
  forwardRef,
  memo,
  type ReactNode,
  createContext,
  useContext,
  useCallback,
} from "react";
import { useEffect, useState, useRef } from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { useHref, useLocation } from "react-router-dom";
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
  LinkTarget,
} from "../abstractions";
import { isAbsoluteUrl } from "../component-utils";
import { useAppContext } from "../../components-core/AppContext";
import { resolveRelativePathname } from "../../components-core/action/NavigateAction";
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

/**
 * A click the browser should own rather than the app: any non-primary button, or a click held
 * with a modifier key. These open the anchor's `href` in a new tab or window — the whole point
 * of rendering a real link — so the app must neither cancel them nor act on them a second time.
 * Same test as React Router's `shouldProcessLinkClick`, minus the `target` check, which the
 * caller applies separately because a declared `click` handler outranks it.
 */
function isBrowserOwnedClick(event: React.MouseEvent) {
  return (
    event.button !== 0 || event.metaKey || event.altKey || event.ctrlKey || event.shiftKey
  );
}

type MenuItemAnchorProps = AnchorHTMLAttributes<HTMLAnchorElement>;

/**
 * The bare anchor a linking `MenuItem` renders. Radix's `asChild` clones the item's own props
 * (role, tabIndex, data-highlighted, the composed click handler, the ref) onto this element,
 * so it only has to forward everything it is handed.
 */
const MenuItemAnchor = forwardRef(function MenuItemAnchor(
  { children, ...rest }: MenuItemAnchorProps,
  ref: React.ForwardedRef<HTMLAnchorElement>,
) {
  return (
    <a {...rest} ref={ref}>
      {children}
    </a>
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
  target?: LinkTarget;
  rel?: string;
  /** Set when the markup declares a `to`, regardless of what that `to` evaluates to. */
  isLink?: boolean;
  /** Set when the markup declares a `click` handler, which takes precedence over `to`. */
  hasClickHandler?: boolean;
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
    to,
    target,
    rel,
    isLink = false,
    hasClickHandler = false,
    ...rest
  }: MenuItemProps,
  ref,
) {
  const iconToStart = iconPosition === "start";
  const context = useDropdownMenuContext();
  const { pathname } = useLocation();
  // `appContext.navigate` is the app's own navigation entry point: it runs the `willNavigate`
  // guard, lets `didNavigate` fire, and emits the `kind:"navigate"` trace entry. Going through
  // it directly (rather than looking up a "navigate" action, which resolves the name through
  // the scripting engine) is what keeps `to` working with compiled event handlers.
  const appContext = useAppContext();

  const trimmedTo = typeof to === "string" ? to.trim() : "";
  const absolute = isAbsoluteUrl(trimmedTo);

  // One resolution feeds BOTH the href and the navigation, so the address shown in the status
  // bar and copied from the context menu is by construction the address a click goes to.
  // `resolveRelativePathname` resolves against the current location, which is what the
  // `navigate` action does; React Router resolves relative paths against the router root
  // instead, which is why a relative `to` used to land on the wrong page.
  const resolvedTo =
    trimmedTo && !absolute ? String(resolveRelativePathname(trimmedTo, pathname)) : "";
  const routerHref = useHref(resolvedTo || "/");

  // A disabled item is deliberately href-less: without an href the anchor is neither focusable
  // nor followable, which keeps it inert without having to cancel the event (cancelling would
  // also suppress Radix's own select handling).
  const href =
    !isLink || !enabled || !trimmedTo ? undefined : absolute ? trimmedTo : routerHref;

  // `to` navigates only when no `click` handler outranks it, and only for an in-app
  // destination — an absolute URL is left to the anchor's own navigation.
  const navigatesOnClick = isLink && !hasClickHandler && !!resolvedTo;

  const handleClick = useCallback(
    (event: React.MouseEvent) => {
      if (!enabled) return;

      if (href) {
        if (isBrowserOwnedClick(event)) {
          // The browser is about to open the href in a new tab or window. Running the app's
          // click handler (or its `to` navigation) on top of that would act twice on a single
          // gesture, so this gesture belongs to the browser alone. Radix still closes the menu.
          return;
        }
        if (hasClickHandler) {
          // `click` takes precedence over `to`, and that outranks `target` too: an item with
          // both must run its handler rather than open a tab on a plain click.
          event.preventDefault();
        } else if (target && target !== "_self") {
          // No handler to run, and the anchor is aimed at another frame or tab — let it be.
          return;
        } else if (!absolute) {
          // In-app destination: hand it to the navigate action (see the renderer for why).
          event.preventDefault();
        }
        // An absolute URL with no click handler falls through to the anchor's own navigation:
        // in-app navigation cannot route outside the app, and used to resolve it to "/".
      }

      if (navigatesOnClick) {
        appContext?.navigate?.(resolvedTo);
      } else {
        onClick(event);
      }

      // Close the menu after clicking an item. Note that `preventDefault` above also skips
      // Radix's own select handling (`composeEventHandlers` checks `defaultPrevented`), so
      // this call — not Radix — is what closes the menu on a navigating click. Both
      // `DropdownMenu` and `ContextMenu` drive `open` from this same context.
      context?.closeMenu();
    },
    [
      enabled,
      href,
      target,
      hasClickHandler,
      absolute,
      navigatesOnClick,
      resolvedTo,
      appContext,
      onClick,
      context,
    ],
  );

  const itemClassName = classnames(
    classes?.[COMPONENT_PART_KEY],
    className,
    styles.DropdownMenuItem,
    {
      [styles.active]: active,
      [styles.disabled]: !enabled,
      [styles.compact]: compact,
    },
  );

  const content = (
    <>
      {iconToStart && icon}
      <div className={styles.wrapper}>{label ?? children}</div>
      {!iconToStart && icon}
    </>
  );

  return (
    <DropdownMenuPrimitive.Item
      {...rest}
      asChild={isLink}
      style={style}
      className={itemClassName}
      ref={ref as any}
      onClick={handleClick}
      role="menuitem"
    >
      {isLink ? (
        <MenuItemAnchor
          href={href}
          target={target}
          rel={rel}
          aria-current={active ? "page" : undefined}
        >
          {content}
        </MenuItemAnchor>
      ) : (
        content
      )}
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
