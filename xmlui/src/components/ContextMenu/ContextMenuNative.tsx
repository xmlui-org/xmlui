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
    
    console.log('ContextMenu openAt:', event.clientX, event.clientY);
    
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
      console.log('Enabling clicks after mouseup');
      setEnableClicks(true);
    };
    
    // Listen for mouseup to re-enable clicks
    window.addEventListener('mouseup', enableAfterRelease, { once: true });
    window.addEventListener('pointerup', enableAfterRelease, { once: true });
  }, [updateState]);

  useEffect(() => {
    registerComponentApi?.({
      open: () => setOpen(true),
      close: closeMenu,
      openAt,
    });
  }, [registerComponentApi, closeMenu, openAt]);

  // Handle positioning the menu at the clicked coordinates
  useEffect(() => {
    if (open && position && contentRef.current) {
      const content = contentRef.current;
      const { innerWidth, innerHeight } = window;
      const rect = content.getBoundingClientRect();
      
      // Calculate if menu would overflow viewport
      let x = position.x;
      let y = position.y;
      
      // Adjust horizontal position if menu would overflow right edge
      if (x + rect.width > innerWidth) {
        x = innerWidth - rect.width - 8; // 8px margin
      }
      
      // Adjust vertical position if menu would overflow bottom edge
      if (y + rect.height > innerHeight) {
        y = innerHeight - rect.height - 8; // 8px margin
      }
      
      // Apply positioning
      content.style.left = `${x}px`;
      content.style.top = `${y}px`;
    }
  }, [open, position]);

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
            ref={contentRef}
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
