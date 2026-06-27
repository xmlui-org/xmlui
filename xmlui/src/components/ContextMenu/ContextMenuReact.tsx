import type { CSSProperties, HTMLAttributes, MutableRefObject, ReactNode } from "react";
import { Children, forwardRef, useCallback, useEffect, useRef, useState } from "react";

import { focusMenuItem, MenuContext } from "../DropdownMenu/DropdownMenuReact";
import styles from "./ContextMenu.module.scss";

export type ContextMenuApi = {
  close: () => void;
  openAt: (event: MouseEvent | React.MouseEvent, context?: unknown) => void;
};

export type ContextMenuProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  children?: (context: unknown) => ReactNode;
  menuWidth?: string;
  registerComponentApi?: (api: ContextMenuApi) => void;
};

export const ContextMenuComponent = forwardRef<HTMLDivElement, ContextMenuProps>(function ContextMenuComponent(
  {
    children,
    className,
    menuWidth,
    registerComponentApi,
    style,
    ...rest
  },
  ref,
) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [context, setContext] = useState<unknown>(undefined);
  const contentRef = useRef<HTMLDivElement | null>(null);

  const close = useCallback(() => {
    setOpen(false);
  }, []);

  const openAt = useCallback((event: MouseEvent | React.MouseEvent, nextContext?: unknown) => {
    event.preventDefault();
    event.stopPropagation();
    setPosition({ x: event.clientX, y: event.clientY });
    setContext(nextContext);
    setOpen(true);
  }, []);

  useEffect(() => {
    registerComponentApi?.({ close, openAt });
  }, [close, openAt, registerComponentApi]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const onPointerDown = () => close();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        close();
        return;
      }
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        focusMenuItem(contentRef.current, event.key === "ArrowDown" ? 1 : -1);
      }
    };
    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [close, open]);

  if (!open) {
    return null;
  }

  const renderedChildren = children?.(context);
  if (Children.count(renderedChildren) === 0) {
    return null;
  }

  return (
    <MenuContext.Provider value={{ closeMenu: close }}>
      <div
        {...rest}
        className={[styles.content, "ContextMenuContent", className].filter(Boolean).join(" ")}
        data-xmlui-component="ContextMenu"
        data-xmlui-part="content"
        ref={(node) => {
          contentRef.current = node;
          if (typeof ref === "function") {
            ref(node);
          } else if (ref) {
            (ref as MutableRefObject<HTMLDivElement | null>).current = node;
          }
        }}
        role="menu"
        style={{
          ...(style as CSSProperties),
          left: position.x,
          top: position.y,
          ...(menuWidth ? { width: menuWidth } : null),
        }}
        onPointerDown={(event) => event.stopPropagation()}
      >
        {renderedChildren}
      </div>
    </MenuContext.Provider>
  );
});
