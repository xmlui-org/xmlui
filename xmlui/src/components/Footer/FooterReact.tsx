import type { ForwardedRef, ReactNode } from "react";
import type React from "react";
import { forwardRef, memo } from "react";
import classnames from "classnames";

import styles from "./Footer.module.scss";

import { useAppLayoutContext } from "../App/AppLayoutContext";
import { COMPONENT_PART_KEY } from "../../components-core/theming/responsive-layout";
import { defaultProps } from "./Footer.defaults";

// =====================================================================================================================
// React Footer component implementation

export const Footer = memo(forwardRef(function Footer(
  {
    children,
    style,
    contentStyle,
    className,
    classes,
    sticky = defaultProps.sticky,
    ...rest
  }: {
    children: ReactNode;
    style?: React.CSSProperties;
    contentStyle?: React.CSSProperties;
    className?: string;
    classes?: Record<string, string>;
    sticky?: boolean;
  },
  forwardedRef: ForwardedRef<HTMLDivElement>,
) {
  const { layout } = useAppLayoutContext() || {};
  const canRestrictContentWidth = layout !== "vertical-full-header";
  return (
    <div 
      {...rest} 
      className={classnames(styles.outerWrapper, classes?.[COMPONENT_PART_KEY], className)}
      ref={forwardedRef} 
      style={style} 
      role="contentinfo"
      data-sticky={sticky}
    >
      <div
        data-part-id="content"
        className={classnames(styles.wrapper, {
          [styles.full]: !canRestrictContentWidth,
        })}
        style={contentStyle}
      >
        {children}
      </div>
    </div>
  );
}));
