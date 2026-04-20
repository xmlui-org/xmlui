import { type ForwardedRef, forwardRef, memo, type HTMLAttributes, type ReactNode } from "react";

import styles from "./Backdrop.module.scss";
import classNames from "classnames";
import { COMPONENT_PART_KEY } from "xmlui";

type Props = HTMLAttributes<HTMLDivElement> & {
  classes?: Record<string, string>;
  overlayTemplate?: ReactNode;
  opacity?: string;
  backgroundColor?: string;
};

export const Backdrop = memo(
  forwardRef(function Backdrop(
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
}),
);
