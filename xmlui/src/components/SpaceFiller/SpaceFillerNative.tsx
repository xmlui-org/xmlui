import type { ForwardedRef } from "react";
import { forwardRef } from "react";
import classnames from "classnames";
import styles from "./SpaceFiller.module.scss";
import { COMPONENT_PART_KEY } from "../../components-core/theming/responsive-layout";

export const SpaceFiller = forwardRef(function SpaceFiller(
  { className, classes }: { className?: string; classes?: Record<string, string> },
  ref: ForwardedRef<HTMLDivElement>,
) {
  return <div className={classnames(styles.spacer, classes?.[COMPONENT_PART_KEY], className)} ref={ref} />;
});
