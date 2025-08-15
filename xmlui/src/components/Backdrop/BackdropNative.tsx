import { type CSSProperties, type ForwardedRef, forwardRef, type ReactNode } from "react";

import styles from "./Backdrop.module.scss";
import classNames from "classnames";

type Props = {
  style?: CSSProperties;
  className?: string;
  children?: ReactNode;
  overlayTemplate?: ReactNode;
  opacity?: string;
  backgroundColor?: string;
};

export const Backdrop = forwardRef(function Backdrop(
  {
    style,
    className,
    children,
    overlayTemplate,
    backgroundColor,
    opacity,
  }: Props,
  forwardedRef: ForwardedRef<HTMLDivElement>,
) {
  return (
    <div
      className={classNames(styles.backdropContainer, className)}
      ref={forwardedRef}
      style={style}
    >
      {children}
      <div className={styles.backdrop} style={{ backgroundColor, opacity }} />
      {overlayTemplate && <div className={styles.overlay}>{overlayTemplate}</div>}
    </div>
  );
});
