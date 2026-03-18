import { type CSSProperties, type ForwardedRef, forwardRef, type ReactNode } from "react";

import styles from "./Backdrop.module.scss";
import classNames from "classnames";

const COMPONENT_PART_KEY = "-component";

type Props = {
  style?: CSSProperties;
  classes?: Record<string, string>;
  children?: ReactNode;
  overlayTemplate?: ReactNode;
  opacity?: string;
  backgroundColor?: string;
};

export const Backdrop = forwardRef(function Backdrop(
  {
    style,
    classes,
    children,
    overlayTemplate,
    backgroundColor,
    opacity,
    ...rest
  }: Props,
  forwardedRef: ForwardedRef<HTMLDivElement>,
) {
  return (
    <div
      {...rest}
      className={classNames(styles.backdropContainer, classes?.[COMPONENT_PART_KEY])}
      ref={forwardedRef}
      style={style}
    >
      {children}
      <div className={styles.backdrop} style={{ backgroundColor, opacity }} />
      {overlayTemplate && <div className={styles.overlay}>{overlayTemplate}</div>}
    </div>
  );
});
