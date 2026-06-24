import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import { forwardRef, useCallback, useEffect, useMemo, useState } from "react";

import { defaultProps } from "./ModalDialog.defaults";
import styles from "./ModalDialog.module.scss";

export type ModalDialogApi = {
  open: (...params: unknown[]) => void;
  close: () => void;
  isOpen: () => boolean;
};

export type ModalDialogProps = Omit<HTMLAttributes<HTMLDivElement>, "children" | "onClose" | "onOpen" | "title"> & {
  children?: (params: unknown[]) => ReactNode;
  closeButtonVisible?: boolean;
  fullScreen?: boolean;
  initiallyOpen?: boolean;
  onClose?: () => void | Promise<void>;
  onOpen?: (...params: unknown[]) => void | Promise<void>;
  registerComponentApi?: (api: ModalDialogApi) => void;
  title?: ReactNode;
};

export const ModalDialogComponent = forwardRef<HTMLDivElement, ModalDialogProps>(function ModalDialogComponent(
  {
    children,
    className,
    closeButtonVisible = defaultProps.closeButtonVisible,
    fullScreen = defaultProps.fullScreen,
    initiallyOpen = false,
    onClose,
    onOpen,
    registerComponentApi,
    style,
    title,
    ...rest
  },
  ref,
) {
  const [isOpen, setIsOpen] = useState(initiallyOpen);
  const [openParams, setOpenParams] = useState<unknown[]>([]);

  const open = useCallback((...params: unknown[]) => {
    setOpenParams(params);
    setIsOpen(true);
    void onOpen?.(...params);
  }, [onOpen]);

  const close = useCallback(() => {
    setIsOpen(false);
    void onClose?.();
  }, [onClose]);

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

  const renderedChildren = useMemo(() => children?.(openParams), [children, openParams]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className={styles.portal} data-xmlui-component="ModalDialogPortal">
      <div aria-hidden="true" className={styles.overlayBackground} />
      <div className={cx(styles.overlay, fullScreen && styles.fullScreenOverlay)}>
        <div
          {...rest}
          ref={ref}
          aria-labelledby={title ? "modal-dialog-title" : undefined}
          aria-modal="true"
          className={cx(styles.content, fullScreen && styles.fullScreenContent, className)}
          data-state="open"
          role="dialog"
          style={style as CSSProperties}
        >
          {title ? (
            <header className={styles.title} data-xmlui-part="title" id="modal-dialog-title">
              {title}
            </header>
          ) : null}
          <div className={styles.innerContent} data-xmlui-part="content">
            {renderedChildren}
          </div>
          {closeButtonVisible ? (
            <button aria-label="Close" className={styles.closeButton} onClick={close} type="button">
              x
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
});

function cx(...classes: Array<string | undefined | false>): string {
  return classes.filter(Boolean).join(" ");
}
