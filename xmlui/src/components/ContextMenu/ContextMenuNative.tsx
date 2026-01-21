import {
  type CSSProperties,
  forwardRef,
  type ReactNode,
  createContext,
  useContext,
  useCallback,
  useState,
  useEffect,
  useRef,
} from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import classnames from "classnames";

import styles from "./ContextMenu.module.scss";

import type { RegisterComponentApiFn } from "../../abstractions/RendererDefs";
import { useTheme } from "../../components-core/theming/ThemeContext";
import type { AlignmentOptions } from "../abstractions";
import { DropdownMenuContext } from "../DropdownMenu/DropdownMenuNative";

type ContextMenuProps = {
  children?: ReactNode;
  registerComponentApi?: RegisterComponentApiFn;
  updateState?: (state: any) => void;
  style?: CSSProperties;
  className?: string;
  alignment?: AlignmentOptions;
  compact?: boolean;
};

export const defaultContextMenuProps: Pick<ContextMenuProps, "alignment"> = {
  alignment: "start",
};

export const ContextMenu = forwardRef(function ContextMenu(
  {
    children,
    registerComponentApi,
    updateState,
    style,
    className,
    alignment = defaultContextMenuProps.alignment,
    compact = false,
    ...rest
  }: ContextMenuProps,
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  const { root } = useTheme();
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [enableClicks, setEnableClicks] = useState(true);
  const [contentReady, setContentReady] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const closeMenu = useCallback(() => {
    setOpen(false);
    // Clear context data when closing
    updateState?.({ $context: undefined });
    // Reset click enablement
    setEnableClicks(true);
  }, [updateState]);

  const openAt = useCallback((event: MouseEvent | React.MouseEvent, context?: any) => {
    // Prevent the browser's default context menu
    event.preventDefault();
    
    // Set the position where the menu should appear
    setPosition({
      x: event.clientX,
      y: event.clientY,
    });
    
    // Store the context data in state
    updateState?.({ $context: context });
    
    // Disable clicks temporarily
    setEnableClicks(false);
    
    // Open the menu
    setOpen(true);
    
    // Re-enable clicks after mouse button is released
    const enableAfterRelease = () => {
      setEnableClicks(true);
    };
    
    // Listen for mouseup to re-enable clicks
    window.addEventListener('mouseup', enableAfterRelease, { once: true });
    window.addEventListener('pointerup', enableAfterRelease, { once: true });
  }, [updateState]);

  const handleContentRef = useCallback((el: HTMLDivElement | null) => {
    contentRef.current = el;
    setContentReady(!!el);
  }, []);

  useEffect(() => {
    registerComponentApi?.({
      close: closeMenu,
      openAt,
    });
  }, [registerComponentApi, closeMenu, openAt]);

  // Adjust menu position to stay within viewport
  useEffect(() => {
    if (open && position && contentReady && contentRef.current) {
      const content = contentRef.current;
      const { innerWidth, innerHeight } = window;
      const rect = content.getBoundingClientRect();
      
      let x = position.x;
      let y = position.y;
      const margin = 8;
      
      // Adjust horizontal position
      if (x + rect.width > innerWidth - margin) {
        x = innerWidth - rect.width - margin;
      }
      if (x < margin) {
        x = margin;
      }
      
      // Adjust vertical position
      if (y + rect.height > innerHeight - margin) {
        y = innerHeight - rect.height - margin;
      }
      if (y < margin) {
        y = margin;
      }
      
      content.style.left = `${x}px`;
      content.style.top = `${y}px`;
    }
  }, [open, position, contentReady]);

  return (
    <DropdownMenuContext.Provider value={{ closeMenu }}>
      <DropdownMenuPrimitive.Root
        open={open}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            closeMenu();
          }
        }}
        modal={false}
      >
        {/* No trigger element for ContextMenu - it's opened programmatically */}
        <DropdownMenuPrimitive.Portal container={root}>
          <DropdownMenuPrimitive.Content
            ref={handleContentRef}
            align={alignment}
            style={{
              ...style,
              position: 'fixed',
              // Initial positioning - will be adjusted by useEffect
              left: position?.x ?? 0,
              top: position?.y ?? 0,
              // Disable pointer events until mouse button is released
              pointerEvents: enableClicks ? 'auto' : 'none',
            }}
            className={classnames(styles.ContextMenuContent, className, {
              [styles.compact]: compact,
            })}
            tabIndex={-1}
            loop={true}
            onEscapeKeyDown={closeMenu}
            onInteractOutside={closeMenu}
          >
            {children}
          </DropdownMenuPrimitive.Content>
        </DropdownMenuPrimitive.Portal>
      </DropdownMenuPrimitive.Root>
    </DropdownMenuContext.Provider>
  );
});
