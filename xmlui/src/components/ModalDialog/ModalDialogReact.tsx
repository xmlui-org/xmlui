import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { defaultProps } from "./ModalDialog.defaults";
import { ModalVisibilityContext } from "./ModalVisibilityContext";
import styles from "./ModalDialog.module.scss";

type CloseResult = boolean | void;
type RenderTitle = ReactNode | ((params: unknown[]) => ReactNode);

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
  onClose?: () => CloseResult | Promise<CloseResult>;
  onOpen?: (...params: unknown[]) => void | Promise<void>;
  registerComponentApi?: (api: ModalDialogApi) => void;
  title?: RenderTitle;
  tooltip?: string;
  tooltipMarkdown?: string;
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
    tooltip,
    tooltipMarkdown,
    ...rest
  },
  ref,
) {
  const [isOpen, setIsOpen] = useState(initiallyOpen);
  const [openParams, setOpenParams] = useState<unknown[]>([]);
  const [tooltipVisible, setTooltipVisible] = useState(false);

  const open = useCallback((...params: unknown[]) => {
    setOpenParams(params);
    setIsOpen(true);
    void onOpen?.(...params);
  }, [onOpen]);

  const close = useCallback(() => {
    void (async () => {
      const closeResult = await onClose?.();
      if (closeResult === false) {
        return;
      }
      setIsOpen(false);
    })();
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

  useEffect(() => {
    if (!isOpen || typeof document === "undefined") {
      return;
    }
    const hiddenSiblings: Array<[Element, string | null]> = [];
    const isModalPortal = (element: Element) =>
      element.getAttribute("data-xmlui-component") === "ModalDialogPortal";

    for (const child of Array.from(document.body.children)) {
      if (isModalPortal(child)) {
        continue;
      }
      hiddenSiblings.push([child, child.getAttribute("aria-hidden")]);
      child.setAttribute("aria-hidden", "true");
    }

    return () => {
      for (const [child, previousValue] of hiddenSiblings) {
        if (previousValue === null) {
          child.removeAttribute("aria-hidden");
        } else {
          child.setAttribute("aria-hidden", previousValue);
        }
      }
    };
  }, [isOpen]);

  const renderedChildren = useMemo(() => children?.(openParams), [children, openParams]);
  const renderedTitle = useMemo(
    () => typeof title === "function" ? title(openParams) : title,
    [openParams, title],
  );
  const registeredFormsRef = useRef(new Set<string>());
  const modalVisibilityContextValue = useMemo(() => ({
    registerForm: (id: string) => {
      registeredFormsRef.current.add(id);
    },
    unRegisterForm: (id: string) => {
      registeredFormsRef.current.delete(id);
    },
    amITheSingleForm: (id: string) =>
      registeredFormsRef.current.size === 1 && registeredFormsRef.current.has(id),
    requestClose: close,
  }), [close]);

  if (!isOpen) {
    return null;
  }
  const tooltipContent = tooltipMarkdown || tooltip;

  const dialogAttrs = { ...rest } as HTMLAttributes<HTMLDivElement> & Record<string, unknown>;
  if (dialogAttrs["data-testid"] == null && typeof dialogAttrs["data-xmlui-id"] === "string") {
    dialogAttrs["data-testid"] = dialogAttrs["data-xmlui-id"];
  }

  const modal = (
    <div className={styles.portal} data-xmlui-component="ModalDialogPortal">
      <div aria-hidden="true" className={styles.overlayBackground} />
      <div
        className={cx(styles.overlay, fullScreen && styles.fullScreenOverlay)}
        onPointerDown={(event) => {
          if ((event.nativeEvent as PointerEvent & { __xmluiLayerHandled?: boolean }).__xmluiLayerHandled) {
            return;
          }
          close();
        }}
      >
        <div
          {...dialogAttrs}
          ref={ref}
          aria-labelledby={renderedTitle ? "modal-dialog-title" : undefined}
          aria-modal="true"
          className={cx(styles.content, fullScreen && styles.fullScreenContent, className)}
          data-state="open"
          role="dialog"
          style={style as CSSProperties}
          onPointerDown={(event) => event.stopPropagation()}
        >
          {renderedTitle ? (
            <header
              aria-level={2}
              className={styles.title}
              data-part-id="title"
              data-xmlui-part="title"
              id="modal-dialog-title"
              role="heading"
            >
              {renderedTitle}
            </header>
          ) : null}
          <div
            className={styles.innerContent}
            data-part-id="content"
            data-xmlui-part="content"
            data-xmlui-tooltip-markdown={tooltipMarkdown}
            onBlur={() => setTooltipVisible(false)}
            onFocus={() => setTooltipVisible(true)}
            onMouseEnter={() => setTooltipVisible(true)}
            onMouseLeave={() => setTooltipVisible(false)}
            title={tooltip}
          >
            <ModalVisibilityContext.Provider value={modalVisibilityContextValue}>
              {renderedChildren}
            </ModalVisibilityContext.Provider>
            {tooltipVisible && tooltipContent ? (
              <span role="tooltip">
                {tooltipMarkdown ? renderTinyMarkdown(tooltipMarkdown) : tooltipContent}
              </span>
            ) : null}
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

  return typeof document === "undefined" ? modal : createPortal(modal, document.body);
});

function cx(...classes: Array<string | undefined | false>): string {
  return classes.filter(Boolean).join(" ");
}

function renderTinyMarkdown(markdown: string): ReactNode {
  const strongMatch = /^\*\*(.*)\*\*$/.exec(markdown.trim());
  return strongMatch ? <strong>{strongMatch[1]}</strong> : markdown;
}
