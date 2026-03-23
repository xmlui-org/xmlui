import React, { useEffect, useRef, useState } from "react";
import classnames from "classnames";

import styles from "./Inspector.module.scss";
import type { RegisterComponentApiFn } from "../../abstractions/RendererDefs";
import { COMPONENT_PART_KEY } from "../../components-core/theming/responsive-layout";
import { normalizePath } from "../../components-core/utils/misc";
import SearchCodeIcon from "../Icon/svg/l-search-code.svg?react";

type Props = {
  src?: string;
  tooltip?: string;
  dialogTitle?: string;
  dialogWidth?: string;
  dialogHeight?: string;
  classes?: Record<string, string>;
  registerComponentApi?: RegisterComponentApiFn;
};

export const defaultProps = {
  src: "xmlui/xs-diff.html",
  tooltip: "Inspector",
  dialogTitle: "XMLUI Inspector",
  dialogWidth: "95vw",
  dialogHeight: "95vh",
};

export function Inspector({
  src = defaultProps.src,
  tooltip = defaultProps.tooltip,
  dialogTitle = defaultProps.dialogTitle,
  dialogWidth = defaultProps.dialogWidth,
  dialogHeight = defaultProps.dialogHeight,
  classes,
  registerComponentApi,
}: Props) {
  const [open, setOpen] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    registerComponentApi?.({
      open: () => setOpen(true),
      close: () => setOpen(false),
    });
  }, [registerComponentApi]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) setOpen(false);
  };

  return (
    <>
      <span
        className={classnames(styles.iconButton, classes?.[COMPONENT_PART_KEY])}
        onClick={() => setOpen(true)}
        title={tooltip}
        role="button"
        aria-label="Inspector"
        data-testid="Inspector"
      >
        <SearchCodeIcon className={styles.icon} />
      </span>
      {open && (
        <div
          ref={overlayRef}
          className={styles.overlay}
          onClick={handleOverlayClick}
          data-testid="InspectorDialog"
        >
          <div
            className={styles.dialog}
            style={{ minWidth: dialogWidth, minHeight: dialogHeight }}
          >
            <div className={styles.header}>
              <span className={styles.title}>{dialogTitle}</span>
              <button className={styles.closeButton} onClick={() => setOpen(false)}>
                &times;
              </button>
            </div>
            <iframe
              src={normalizePath(src)}
              className={styles.iframe}
              data-testid="InspectorFrame"
            />
          </div>
        </div>
      )}
    </>
  );
}
