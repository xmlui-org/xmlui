import type { ForwardedRef, ReactNode } from "react";
import type React from "react";
import { forwardRef, memo } from "react";
import classnames from "classnames";

import { defaultProps } from "./Footer.defaults";
import styles from "./Footer.module.scss";
import { useAppLayoutContext } from "../App/AppLayoutContext";
import { COMPONENT_PART_KEY } from "../../components-core/theming/responsive-layout";

export type FooterProps = {
  children: ReactNode;
  style?: React.CSSProperties;
  className?: string;
  classes?: Record<string, string>;
  sticky?: boolean;
};

export const Footer = memo(forwardRef(function Footer(
  {
    children,
    style,
    className,
    classes,
    sticky = defaultProps.sticky,
    ...rest
  }: FooterProps,
  forwardedRef: ForwardedRef<HTMLDivElement>,
) {
  const { layout } = useAppLayoutContext() || {};
  const canRestrictContentWidth = layout !== "vertical-full-header";
  return (
    <div
      {...rest}
      className={styles.outerWrapper}
      data-sticky={sticky}
      ref={forwardedRef}
      role="contentinfo"
      style={style}
    >
      <div
        className={classnames(styles.wrapper, classes?.[COMPONENT_PART_KEY], className, {
          [styles.full]: !canRestrictContentWidth,
        })}
        data-xmlui-part="content"
      >
        {children}
      </div>
    </div>
  );
}));
