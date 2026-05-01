import React, {
  type CSSProperties,
  type ReactNode,
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import * as Dialog from "@radix-ui/react-dialog";
import classnames from "classnames";

import styles from "./Drawer.module.scss";

import type { RegisterComponentApiFn } from "../../abstractions/RendererDefs";
import { useTheme } from "../../components-core/theming/ThemeContext";
import { ThemeContext } from "../../components-core/theming/ThemeContext";
import { useEvent } from "../../components-core/utils/misc";
import { Icon } from "../Icon/IconReact";
import { COMPONENT_PART_KEY } from "../../components-core/theming/responsive-layout";

// =============================================================================
// Types
// =============================================================================

export type DrawerPosition = "left" | "right" | "top" | "bottom";

export interface DrawerProps {
  /** Which edge the drawer slides out from */
  position?: DrawerPosition;
  /** Whether to show a backdrop overlay behind the drawer */
  hasBackdrop?: boolean;
  /** Whether the drawer is open on first render */
  initiallyOpen?: boolean;
  /** Show the ✕ close button in the top-right corner */
  closeButtonVisible?: boolean;
  /** Close the drawer when the user clicks outside of it */
  closeOnClickAway?: boolean;
  /** Custom content rendered in the sticky header (next to the close button) */
  headerTemplate?: ReactNode;
  /** Callback fired when the drawer opens */
  onOpen?: () => void;
  /** Callback fired when the drawer closes */
  onClose?: () => void;
  /** Register imperative API (open / close / isOpen) */
  registerComponentApi?: RegisterComponentApiFn;
  children?: ReactNode;
  className?: string;
  classes?: Record<string, string>;
  /** Inline styles applied directly to the drawer panel (overrides theme vars) */
  style?: CSSProperties;
}

export const defaultProps = {
  position: "left" as DrawerPosition,
  hasBackdrop: true,
  initiallyOpen: false,
  closeButtonVisible: true,
  closeOnClickAway: true,
};

// =============================================================================
// Hook – manages open/closed state with stable callbacks
// =============================================================================

function useDrawerOpenState(
  initiallyOpen: boolean,
  onOpen?: () => void,
  onClose?: () => void,
) {
  const [isOpen, setIsOpen] = useState(initiallyOpen);

  const doOpen = useEvent(() => {
    setIsOpen(true);
    onOpen?.();
  });

  const doClose = useEvent(() => {
    setIsOpen(false);
    onClose?.();
  });

  return useMemo(() => ({ isOpen, doOpen, doClose }), [isOpen, doOpen, doClose]);
}

// =============================================================================
// Native React component
// =============================================================================

export const DrawerNative = memo(forwardRef<HTMLDivElement, DrawerProps>(function DrawerNative(
  {
    position = defaultProps.position,
    hasBackdrop = defaultProps.hasBackdrop,
    initiallyOpen = defaultProps.initiallyOpen,
    closeButtonVisible = defaultProps.closeButtonVisible,
    closeOnClickAway = defaultProps.closeOnClickAway,
    headerTemplate,
    onOpen,
    onClose,
    registerComponentApi,
    children,
    className,
    classes,
    style,
  },
  _ref,
) {
  const theme = useTheme();
  const { root } = theme;
  const drawerRef = useRef<HTMLDivElement>(null);

  // --- Create a scoped portal container appended to root. It uses
  // --- position:absolute + inset:0 so it is a containing block for the
  // --- drawer's own position:absolute children, and overflow:hidden clips
  // --- the exit animation to the root's bounds (stops the flash).
  const [portalContainer, setPortalContainer] = useState<HTMLDivElement | null>(null);

  // --- Create a secondary portal container for child portalled content
  // --- (e.g. Select dropdowns, tooltips). This container sits as a sibling
  // --- of the main portal container in `root` and has a z-index above the
  // --- drawer panel so that overlays from components inside the drawer are
  // --- not hidden behind it.
  const [childPortalContainer, setChildPortalContainer] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!root) return;
    const el = document.createElement('div');
    el.style.cssText = 'position:absolute;inset:0;overflow:hidden;pointer-events:none;';
    if (className || classes?.[COMPONENT_PART_KEY]) el.className = classnames(classes?.[COMPONENT_PART_KEY], className);
    (root as HTMLElement).appendChild(el);
    setPortalContainer(el);

    const childEl = document.createElement('div');
    childEl.className = styles.childPortal;
    (root as HTMLElement).appendChild(childEl);
    setChildPortalContainer(childEl);

    return () => {
      (root as HTMLElement).removeChild(el);
      setPortalContainer(null);
      (root as HTMLElement).removeChild(childEl);
      setChildPortalContainer(null);
    };
  }, [root, className, classes]);

  // Override the theme context's portal root for children inside the drawer
  // so that portalled content (Select dropdowns, tooltips, etc.) renders into
  // the child portal container which stacks above the drawer panel.
  const childTheme = useMemo(() => ({
    ...theme,
    root: childPortalContainer ?? root,
  }), [theme, childPortalContainer, root]);

  const { isOpen, doOpen, doClose } = useDrawerOpenState(initiallyOpen, onOpen, onClose);

  // --- Prevent scrollbars while the drawer slides out. Radix releases the body
  // --- scroll-lock before the close animation completes, so we re-apply it on
  // --- the body and html elements and clear it only when animationend fires.
  const animatingRef = useRef(false);

  useEffect(() => {
    if (!isOpen || !root) return;
    // Lock horizontal overflow for horizontal-sliding drawers
    (root as HTMLElement).style.overflowX = 'hidden';
    return () => {
      // Keep locked while the exit animation plays; cleared in handlePanelAnimationEnd.
      animatingRef.current = true;
    };
  }, [isOpen, root]);

  // Safety-net: always clear on unmount.
  useEffect(() => {
    return () => {
      if (root) {
        (root as HTMLElement).style.overflowX = '';
      }
    };
  }, [root]);

  const handlePanelAnimationEnd = useCallback(() => {
    if (animatingRef.current) {
      animatingRef.current = false;
      if (root) {
        (root as HTMLElement).style.overflowX = '';
      }
    }
  }, [root]);

  // Register imperative API
  useEffect(() => {
    registerComponentApi?.({
      open: doOpen,
      close: doClose,
      isOpen: () => isOpen,
    });
  }, [registerComponentApi, doOpen, doClose, isOpen]);

  if (!root || !portalContainer) return null;

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => { if (!open) doClose(); }}>
      <Dialog.Portal container={portalContainer}>
        {/* Backdrop */}
        {hasBackdrop && (
          <Dialog.Overlay className={classnames(styles.backdrop, className)} />
        )}

        {/* Drawer panel */}
        <Dialog.Content
          ref={drawerRef}
          className={classnames(styles.drawer, {
            [styles.left]:   position === "left",
            [styles.right]:  position === "right",
            [styles.top]:    position === "top",
            [styles.bottom]: position === "bottom",
          }, classes?.[COMPONENT_PART_KEY], className)}
          style={style}
          aria-label="Drawer"
          onAnimationEnd={handlePanelAnimationEnd}
          onPointerDownOutside={(e) => { if (closeOnClickAway) doClose(); else e.preventDefault(); }}
          onEscapeKeyDown={() => doClose()}
        >
          <Dialog.Title className={styles.srOnly}>Drawer</Dialog.Title>
          {/* Close button - floats at top-right */}
          {closeButtonVisible && (
            <Dialog.Close asChild>
              <button className={styles.closeButton} aria-label="Close">
                <Icon name="close" size="sm" />
              </button>
            </Dialog.Close>
          )}
          {/* Header with template content - full width */}
          {!!headerTemplate && (
            <div className={styles.header}>
              <div className={styles.headerContent}>
                {headerTemplate}
              </div>
            </div>
          )}
          <ThemeContext.Provider value={childTheme}>
            <div className={classnames(styles.body, {
              [styles.bodyNoHeader]: !headerTemplate,
            })}>
              {children}
            </div>
          </ThemeContext.Provider>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}));
