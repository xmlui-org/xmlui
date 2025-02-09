import classnames from "../../components-core/utils/classnames";
import styles from "./OffCanvas.module.scss";
import { CSSProperties, useEffect, useState } from "react";

type OffCanvasPlacement = "top" | "bottom" | "left" | "right";

type Props = {
  title?: string;
  isInitiallyOpen: boolean;
  onClose?: () => void;
  placement?: OffCanvasPlacement;
  showCloseButton?: boolean;
  children?: React.ReactNode;
  allowScroll?: boolean;
  showBackdrop?: boolean;
  style?: CSSProperties;
};

export const OffCanvas = ({
  title,
  isInitiallyOpen,
  onClose,
  placement = "right",
  showCloseButton = true,
  children,
  allowScroll = true,
  showBackdrop = false,
  style,
}: Props) => {
  const [isOpen, setIsOpen] = useState(isInitiallyOpen);
  const [place, setPlace] = useState(placement);

  // Control body scrolling
  useEffect(() => {
    if (isOpen && !allowScroll) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    // Cleanup when unmounted or isOpen changes
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, allowScroll]);

  return (
    <>
      {showBackdrop && (
        <div
          className={classnames(styles.overlay, {
            [styles.overlayVisible]: isOpen,
          })}
          onClick={onClose}
        />
      )}
      <div
        className={classnames(styles.offCanvas, {
          [styles.open]: isOpen,
          [styles.left]: place === "left",
          [styles.right]: place === "right",
          [styles.top]: place === "top",
          [styles.bottom]: place === "bottom",
        })}
        style={style}
      >
        <header className={styles.offCanvasHeader}>
          {!!title && <span className={styles.offCanvasTitle}>{title}</span>}
          <div className={styles.spacer} />
          {showCloseButton && (
            <>
              {place !== "left" && (
                <button
                  className={styles.button}
                  onClick={() => {
                    setPlace("left");
                  }}
                >
                  &larr;
                </button>
              )}
              {place !== "right" && (
                <button
                  className={styles.button}
                  onClick={() => {
                    setPlace("right");
                  }}
                >
                  &rarr;
                </button>
              )}
              {place !== "top" && (
                <button
                  className={styles.button}
                  onClick={() => {
                    setPlace("top");
                  }}
                >
                  &uarr;
                </button>
              )}
              {place !== "bottom" && (
                <button
                  className={styles.button}
                  onClick={() => {
                    setPlace("bottom");
                  }}
                >
                  &darr;
                </button>
              )}
              <div className={styles.offCanvasButtonSpace} />
              <button
                className={styles.button}
                onClick={() => {
                  setIsOpen(false);
                  onClose?.();
                }}
              >
                &times;
              </button>
            </>
          )}
        </header>
        {children}
      </div>
    </>
  );
};
