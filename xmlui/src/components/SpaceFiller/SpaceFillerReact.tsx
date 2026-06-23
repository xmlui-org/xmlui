import { forwardRef, memo, type HTMLAttributes } from "react";

import styles from "./SpaceFiller.module.scss";

export const SpaceFiller = memo(forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function SpaceFiller({ className, ...rest }, ref) {
    return (
      <div
        {...rest}
        ref={ref}
        className={[styles.xmluiSpaceFiller, className].filter(Boolean).join(" ")}
      />
    );
  },
));
