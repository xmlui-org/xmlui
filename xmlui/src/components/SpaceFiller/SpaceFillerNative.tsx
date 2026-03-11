import type { ForwardedRef } from "react";
import { forwardRef } from "react";
import styles from "./SpaceFiller.module.scss";

export const SpaceFiller = forwardRef(function SpaceFiller(
  { className }: { className?: string },
  ref: ForwardedRef<HTMLDivElement>,
) {
  return <div className={`${styles.spacer}${className ? ` ${className}` : ""}`} ref={ref} />;
});
