import type { HTMLAttributes, ReactNode } from "react";
import { forwardRef } from "react";

import styles from "./NavPanel.module.scss";

export type NavPanelProps = HTMLAttributes<HTMLDivElement> & {
  children?: ReactNode;
  footerContent?: ReactNode;
  logoContent?: ReactNode;
  scrollStyle?: string;
};

export const NavPanelComponent = forwardRef<HTMLDivElement, NavPanelProps>(function NavPanelComponent(
  {
    children,
    className,
    footerContent,
    logoContent,
    scrollStyle = "normal",
    ...rest
  },
  ref,
) {
  return (
    <nav
      {...rest}
      className={[
        styles.wrapper,
        scrollStyle !== "normal" && styles.overlayScroll,
        className,
      ].filter(Boolean).join(" ")}
      data-xmlui-component="NavPanel"
      ref={ref}
    >
      {logoContent ? (
        <div className={styles.logo} data-xmlui-part="logo">
          {logoContent}
        </div>
      ) : null}
      <div className={styles.content} data-xmlui-part="content">
        {children}
      </div>
      {footerContent ? (
        <div className={styles.footer} data-xmlui-part="footer">
          {footerContent}
        </div>
      ) : null}
    </nav>
  );
});
