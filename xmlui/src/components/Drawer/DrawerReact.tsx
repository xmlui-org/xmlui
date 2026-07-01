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

import type { RegisterComponentApiFn } from "../../abstractions/RendererDefs";
import { useTheme } from "../../components-core/theming/ThemeContext";
import { useEvent } from "../../components-core/utils/misc";
import { COMPONENT_PART_KEY } from "../../components-core/theming/responsive-layout";
import { Icon } from "../Icon/IconReact";
import { defaultProps } from "./Drawer.defaults";
import styles from "./Drawer.module.scss";

export type DrawerPosition = "left" | "right" | "top" | "bottom";

export interface DrawerProps {
  position?: DrawerPosition;
  hasBackdrop?: boolean;
  initiallyOpen?: boolean;
  closeButtonVisible?: boolean;
  closeOnClickAway?: boolean;
  headerTemplate?: ReactNode;
  onOpen?: () => void | Promise<void>;
  onClose?: () => void | Promise<void>;
  registerComponentApi?: RegisterComponentApiFn;
  children?: ReactNode;
  className?: string;
  classes?: Record<string, string>;
  style?: CSSProperties;
  [key: string]: unknown;
}

function applyCssCustomProperties(target: HTMLElement, source?: CSSProperties) {
  for (const name of Array.from(target.style)) {
    if (name.startsWith("--xmlui-")) {
      target.style.removeProperty(name);
    }
  }
  if (!source) {
    return;
  }
  for (const [name, value] of Object.entries(source)) {
    if (!name.startsWith("--xmlui-") || value === undefined || value === null) {
      continue;
    }
    target.style.setProperty(name, String(value));
  }
}

function useDrawerOpenState(
  initiallyOpen: boolean,
  onOpen?: () => void | Promise<void>,
  onClose?: () => void | Promise<void>,
) {
  const [isOpen, setIsOpen] = useState(initiallyOpen);

  const doOpen = useEvent(() => {
    setIsOpen((wasOpen) => {
      if (!wasOpen) {
        void onOpen?.();
      }
      return true;
    });
  });

  const doClose = useEvent(() => {
    setIsOpen((wasOpen) => {
      if (wasOpen) {
        void onClose?.();
      }
      return false;
    });
  });

  return useMemo(() => ({ isOpen, doOpen, doClose }), [isOpen, doOpen, doClose]);
}

export const DrawerNative = memo(
  forwardRef<HTMLDivElement, DrawerProps>(function DrawerNative(
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
      ...rest
    },
    forwardedRef,
  ) {
    const theme = useTheme() as ReturnType<typeof useTheme> & { root?: HTMLElement };
    const portalHost =
      theme.root ?? (typeof document !== "undefined" ? document.body : undefined);
    const drawerRef = useRef<HTMLDivElement | null>(null);
    const [portalContainer, setPortalContainer] = useState<HTMLDivElement | null>(null);
    const [childPortalContainer, setChildPortalContainer] = useState<HTMLDivElement | null>(null);
    const rootClassName = classnames(classes?.[COMPONENT_PART_KEY], className);

    useEffect(() => {
      if (!portalHost) {
        return;
      }
      const el = document.createElement("div");
      el.style.cssText = "position:fixed;inset:0;overflow:hidden;pointer-events:none;";
      if (rootClassName) {
        el.className = rootClassName;
      }
      portalHost.appendChild(el);
      setPortalContainer(el);

      const childEl = document.createElement("div");
      childEl.className = styles.childPortal;
      portalHost.appendChild(childEl);
      setChildPortalContainer(childEl);

      return () => {
        portalHost.removeChild(el);
        setPortalContainer(null);
        portalHost.removeChild(childEl);
        setChildPortalContainer(null);
      };
    }, [portalHost, rootClassName]);

    useEffect(() => {
      if (!portalContainer) {
        return;
      }
      applyCssCustomProperties(portalContainer, style);
    }, [portalContainer, style]);

    const { isOpen, doOpen, doClose } = useDrawerOpenState(initiallyOpen, onOpen, onClose);
    const animatingRef = useRef(false);

    useEffect(() => {
      if (!isOpen || !portalHost) {
        return;
      }
      portalHost.style.overflowX = "hidden";
      return () => {
        animatingRef.current = true;
      };
    }, [isOpen, portalHost]);

    useEffect(() => {
      return () => {
        if (portalHost) {
          portalHost.style.overflowX = "";
        }
      };
    }, [portalHost]);

    const handlePanelAnimationEnd = useCallback(() => {
      if (animatingRef.current) {
        animatingRef.current = false;
        if (portalHost) {
          portalHost.style.overflowX = "";
        }
      }
    }, [portalHost]);

    useEffect(() => {
      registerComponentApi?.({
        open: doOpen,
        close: doClose,
        isOpen: () => isOpen,
      });
    }, [registerComponentApi, doOpen, doClose, isOpen]);

    if (!portalContainer) {
      return null;
    }

    return (
      <Dialog.Root
        open={isOpen}
        onOpenChange={(open) => {
          if (!open) {
            doClose();
          }
        }}
      >
        <Dialog.Portal container={portalContainer}>
          {hasBackdrop && (
            <Dialog.Overlay className={classnames(styles.backdrop, rootClassName)} />
          )}
          <Dialog.Content
            {...rest}
            ref={(node) => {
              drawerRef.current = node;
              if (typeof forwardedRef === "function") {
                forwardedRef(node);
              } else if (forwardedRef) {
                forwardedRef.current = node;
              }
            }}
            className={classnames(
              styles.drawer,
              {
                [styles.left]: position === "left",
                [styles.right]: position === "right",
                [styles.top]: position === "top",
                [styles.bottom]: position === "bottom",
              },
              rootClassName,
            )}
            style={style}
            aria-label="Drawer"
            onAnimationEnd={handlePanelAnimationEnd}
            onPointerDownOutside={(event) => {
              if (closeOnClickAway) {
                doClose();
              } else {
                event.preventDefault();
              }
            }}
            onEscapeKeyDown={doClose}
          >
            <Dialog.Title className={styles.srOnly}>Drawer</Dialog.Title>
            {closeButtonVisible && (
              <Dialog.Close asChild>
                <button className={styles.closeButton} aria-label="Close" type="button">
                  <Icon name="close" size="sm" />
                </button>
              </Dialog.Close>
            )}
            {!!headerTemplate && (
              <div className={styles.header}>
                <div className={styles.headerContent}>{headerTemplate}</div>
              </div>
            )}
            <div
              className={classnames(styles.body, {
                [styles.bodyNoHeader]: !headerTemplate,
              })}
              data-xmlui-child-portal={childPortalContainer ? "ready" : undefined}
            >
              {children}
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    );
  }),
);

export const DrawerComponent = DrawerNative;
