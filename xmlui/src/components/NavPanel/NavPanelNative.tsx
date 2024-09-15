import React, { forwardRef, type ReactNode, useRef } from "react";
import styles from "./NavPanel.module.scss";
import classnames from "@components-core/utils/classnames";
import { Logo } from "@components/Logo/Logo";
import { ScrollContext } from "@components-core/ScrollContext";
import { useAppLayoutContext } from "@components/App/AppLayoutContext";
import { getAppLayoutOrientation } from "@components/App/App";
import { composeRefs } from "@radix-ui/react-compose-refs";

interface INavPanelContext {
  inDrawer: boolean;
}

export const NavPanelContext = React.createContext<INavPanelContext | null>(null);

const contextValue = {
  inDrawer: true,
};

export function DrawerNavPanel({
  logoContent,
  children,
  className,
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  logoContent?: ReactNode;
}) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  return (
    <NavPanelContext.Provider value={contextValue}>
      <div ref={scrollContainerRef} className={classnames(styles.wrapper, className)}>
        <ScrollContext.Provider value={scrollContainerRef}>
          <div className={classnames(styles.logoWrapper, styles.inDrawer)}>
            {logoContent || <Logo inDrawer={true} />}
          </div>
          <div className={styles.wrapperInner} style={style}>
            {children}
          </div>
        </ScrollContext.Provider>
      </div>
    </NavPanelContext.Provider>
  );
}

export const NavPanel = forwardRef(function NavPanel(
  {
    children,
    style,
    logoContent,
    className,
  }: {
    children: ReactNode;
    className?: string;
    style?: React.CSSProperties;
    logoContent?: ReactNode;
  },
  forwardedRef,
) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const ref = forwardedRef ? composeRefs(scrollContainerRef, forwardedRef) : scrollContainerRef;
  const appLayoutContext = useAppLayoutContext();
  const horizontal = getAppLayoutOrientation(appLayoutContext?.layout) === "horizontal";
  const showLogo =
    appLayoutContext?.layout === "vertical" || appLayoutContext?.layout === "vertical-sticky";
  const isCondensed = appLayoutContext?.layout?.startsWith("condensed");

  console.log(appLayoutContext);

  return (
    <div
      ref={ref}
      className={classnames(styles.wrapper, className, {
        [styles.horizontal]: horizontal,
        [styles.condensed]: isCondensed,
      })}
    >
      <ScrollContext.Provider value={scrollContainerRef}>
        {showLogo && (
          <div className={classnames(styles.logoWrapper)}>{logoContent || <Logo />}</div>
        )}
        <div className={styles.wrapperInner} style={style}>
          {children}
        </div>
      </ScrollContext.Provider>
    </div>
  );
});
