import { type CSSProperties, type ForwardedRef, forwardRef, type ReactNode } from "react";

import styles from "./Backdrop.module.scss";

type Props = {
  style?: CSSProperties;
  children?: ReactNode;
  overlayTemplate?: ReactNode;
  opacity?: string;
  backgroundColor?: string;
};

export const defaultProps: Pick<Props, "backgroundColor" | "opacity"> = {
  backgroundColor: "black",
  opacity: "0.1",
};

export const Backdrop = forwardRef(function Backdrop(
  {
    style,
    children,
    overlayTemplate,
    backgroundColor = defaultProps.backgroundColor,
    opacity = defaultProps.opacity,
  }: Props,
  forwardedRef: ForwardedRef<HTMLDivElement>,
) {
  const styleWithoutDims = { ...style, width: undefined };
  return (
    <div
      className={styles.backdropContainer}
      style={{ width: style.width ?? "fit-content" }}
      ref={forwardedRef}
    >
      {children}
      <div className={styles.backdrop} style={{ ...styleWithoutDims, backgroundColor, opacity }} />
      {overlayTemplate && <div className={styles.overlay}>{overlayTemplate}</div>}
    </div>
  );
});
