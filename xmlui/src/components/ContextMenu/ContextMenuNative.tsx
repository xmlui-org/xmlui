import {
  type CSSProperties,
  forwardRef,
  type ReactNode,
  useCallback,
  useState,
  useEffect,
  useRef,
  useMemo,
} from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import classnames from "classnames";

import styles from "./ContextMenu.module.scss";

import type { RegisterComponentApiFn } from "../../abstractions/RendererDefs";
import { useTheme } from "../../components-core/theming/ThemeContext";
import { DropdownMenuContext } from "../DropdownMenu/DropdownMenuNative";
import { filterAdjacentSeparatorsFromChildren } from "../menu-helpers";

type ContextMenuProps = {
  children?: ReactNode;
  registerComponentApi?: RegisterComponentApiFn;
  updateState?: (state: any) => void;
  style?: CSSProperties;
  className?: string;
  compact?: boolean;
  menuWidth?: string;
};

export const ContextMenu = forwardRef(function ContextMenu(
  {
    children,
    registerComponentApi,
    updateState,
    style,
    className,
    compact = false,
    menuWidth,
    ...rest
  }: ContextMenuProps,
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  const { root, getThemeVar } = useTheme();
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [enableClicks, setEnableClicks] = useState(true);
  const [contentReady, setContentReady] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const effectiveMenuWidth = menuWidth ?? getThemeVar("minWidth-ContextMenu") ?? "160px";

  // Filter adjacent separators from rendered children (after 'when' conditions are evaluated)
  const filteredChildren = useMemo(
    () => filterAdjacentSeparatorsFromChildren(children),
    [children]
  );

  const getContainerInfo = useCallback(() => {
    if (!root || root === document.body) {
      return { 
        rect: { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight },
        useFixed: true 
      };
    }
    
    const rect = root.getBoundingClientRect();
    // Check if the root element has display:contents or has collapsed bounds
    // In such cases, fall back to viewport coordinates
    if (rect.width === 0 || rect.height === 0) {
      return { 
        rect: { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight },
        useFixed: true 
      };
    }
    
    return { rect, useFixed: false };
  }, [root]);

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
    // Stop event propagation to prevent any parent handlers from firing
    event.stopPropagation();
    
    // Calculate coordinates - use clientX/clientY which are viewport-relative
    // These coordinates will be adjusted relative to the portal container below
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
    
    // Re-enable clicks after a short delay to ensure the current event cycle completes
    // This prevents the click from the right-click from registering as a menu click
    setTimeout(() => {
      setEnableClicks(true);
    }, 100);
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

  // Adjust menu position to stay within viewport (or portal container)
  useEffect(() => {
    if (open && position && contentReady && contentRef.current) {
      const content = contentRef.current;
      const rect = content.getBoundingClientRect();
      
      // Get the portal container's bounds
      const { rect: containerRect } = getContainerInfo();
      
      // Calculate position relative to the container
      let x = position.x - containerRect.left;
      let y = position.y - containerRect.top;
      const margin = 8;
      
      // Adjust horizontal position to stay within container
      if (x + rect.width > containerRect.width - margin) {
        x = containerRect.width - rect.width - margin;
      }
      if (x < margin) {
        x = margin;
      }
      
      // Adjust vertical position to stay within container
      if (y + rect.height > containerRect.height - margin) {
        y = containerRect.height - rect.height - margin;
      }
      if (y < margin) {
        y = margin;
      }
      
      content.style.left = `${x}px`;
      content.style.top = `${y}px`;
    }
  }, [open, position, contentReady, getContainerInfo]);

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
            style={(() => {
              const { rect: containerRect, useFixed } = getContainerInfo();
              return {
                ...style,
                minWidth: effectiveMenuWidth,
                // Use fixed positioning when dealing with viewport or collapsed containers
                position: useFixed ? 'fixed' : 'absolute',
                // Initial positioning - will be adjusted by useEffect
                left: position?.x ? position.x - containerRect.left : 0,
                top: position?.y ? position.y - containerRect.top : 0,
                // Disable pointer events until mouse button is released
                pointerEvents: enableClicks ? 'auto' : 'none',
                // Apply menuWidth if provided
                ...(menuWidth && { width: menuWidth }),
              };
            })()}
            className={classnames(styles.ContextMenuContent, className, {
              [styles.compact]: compact,
            })}
            tabIndex={-1}
            loop={true}
            onEscapeKeyDown={closeMenu}
            onInteractOutside={closeMenu}
          >
            {filteredChildren}
          </DropdownMenuPrimitive.Content>
        </DropdownMenuPrimitive.Portal>
      </DropdownMenuPrimitive.Root>
    </DropdownMenuContext.Provider>
  );
});
