import type { ForwardedRef } from "react";
import React, { forwardRef, memo } from "react";
import classnames from "classnames";
import styles from "./SpaceFiller.module.scss";
import { COMPONENT_PART_KEY } from "../../components-core/theming/responsive-layout";

export const SpaceFiller = memo(forwardRef(function SpaceFiller(
  { className, classes, ...rest }: React.HTMLAttributes<HTMLDivElement> & { classes?: Record<string, string> },
  ref: ForwardedRef<HTMLDivElement>,
) {
  return <div {...rest} className={classnames(styles.spacer, classes?.[COMPONENT_PART_KEY], className)} ref={ref} />;
}));
