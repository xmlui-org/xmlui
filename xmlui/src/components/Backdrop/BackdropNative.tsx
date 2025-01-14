import { CSSProperties, ReactNode } from "react";
import styles from "./Backdrop.module.scss";

type Props = {
  style?: CSSProperties;
  children?: ReactNode;
  overlayTemplate?: ReactNode;
  opacity?: string;
  backgroundColor?: string;
};
export const Backdrop = ({
  style,
  children,
  overlayTemplate,
  backgroundColor = "black",
  opacity = "0.1",
}: Props) => {
  const styleWithoutDims = { ...style, width: undefined };
  return (
    <div className={styles.backdropContainer} style={{ width: style.width ?? "fit-content" }}>
      {children}
      <div className={styles.backdrop} style={{ ...styleWithoutDims, backgroundColor, opacity }} />
      {overlayTemplate && <div className={styles.overlay}>{overlayTemplate}</div>}
    </div>
  );
};
