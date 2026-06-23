import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import { forwardRef, useCallback, useEffect, useState } from "react";

import { defaultProps } from "./Drawer.defaults";
import styles from "./Drawer.module.scss";

export type DrawerProps = Omit<HTMLAttributes<HTMLDivElement>, "children" | "onClose" | "onOpen"> & {
  children?: ReactNode;
  closeButtonVisible?: boolean;
  closeOnClickAway?: boolean;
  hasBackdrop?: boolean;
  headerTemplate?: ReactNode;
  initiallyOpen?: boolean;
  onClose?: () => void | Promise<void>;
  onOpen?: () => void | Promise<void>;
  position?: "left" | "right" | "top" | "bottom";
  registerComponentApi?: (api: Record<string, unknown>) => void;
};

export const DrawerComponent = forwardRef<HTMLDivElement, DrawerProps>(function DrawerComponent(
  {
    children,
    className,
    closeButtonVisible = defaultProps.closeButtonVisible,
    closeOnClickAway = defaultProps.closeOnClickAway,
    hasBackdrop = defaultProps.hasBackdrop,
    headerTemplate,
    initiallyOpen = defaultProps.initiallyOpen,
    onClose,
    onOpen,
    position = defaultProps.position,
    registerComponentApi,
    style,
    ...rest
  },
  ref,
) {
  const [isOpen, setIsOpen] = useState(initiallyOpen);

  const open = useCallback(() => {
    if (!isOpen) {
      void onOpen?.();
    }
    setIsOpen(true);
  }, [isOpen, onOpen]);

  const close = useCallback(() => {
    if (isOpen) {
      void onClose?.();
    }
    setIsOpen(false);
  }, [isOpen, onClose]);

  const isOpenApi = useCallback(() => isOpen, [isOpen]);

  useEffect(() => {
    registerComponentApi?.({ open, close, isOpen: isOpenApi });
  }, [close, isOpenApi, open, registerComponentApi]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        close();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", onKeyDown);
    }
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [close, isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className={styles.root} data-xmlui-component="DrawerPortal">
      {hasBackdrop ? (
        <div
          aria-hidden="true"
          className={styles.backdrop}
          data-state="open"
          onClick={closeOnClickAway ? close : undefined}
        />
      ) : null}
      {!hasBackdrop && closeOnClickAway ? (
        <div aria-hidden="true" className={styles.backdrop} onClick={close} />
      ) : null}
      <div
        {...rest}
        ref={ref}
        aria-label="Drawer"
        className={cx(styles.drawer, styles[position], className)}
        data-state="open"
        role="dialog"
        style={style as CSSProperties}
      >
        {closeButtonVisible ? (
          <button aria-label="Close" className={styles.closeButton} onClick={close} type="button">
            x
          </button>
        ) : null}
        {headerTemplate ? (
          <div className={styles.header}>
            <div className={styles.headerContent}>{headerTemplate}</div>
          </div>
        ) : null}
        <div className={cx(styles.body, !headerTemplate && styles.bodyNoHeader)}>
          {children}
        </div>
      </div>
    </div>
  );
});

function cx(...classes: Array<string | undefined | false>): string {
  return classes.filter(Boolean).join(" ");
}
