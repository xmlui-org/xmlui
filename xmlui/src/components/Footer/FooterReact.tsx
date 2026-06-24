import type { HTMLAttributes, ReactNode } from "react";
import { forwardRef } from "react";

import { defaultProps } from "./Footer.defaults";
import styles from "./Footer.module.scss";

export type FooterProps = HTMLAttributes<HTMLDivElement> & {
  children?: ReactNode;
  sticky?: boolean;
};

export const FooterComponent = forwardRef<HTMLDivElement, FooterProps>(function FooterComponent(
  {
    children,
    className,
    sticky = defaultProps.sticky,
    ...rest
  },
  ref,
) {
  return (
    <div
      {...rest}
      className={styles.outerWrapper}
      data-sticky={sticky}
      data-xmlui-component="Footer"
      ref={ref}
      role="contentinfo"
    >
      <div className={[styles.wrapper, styles.full, className].filter(Boolean).join(" ")} data-xmlui-part="content">
        {children}
      </div>
    </div>
  );
});
