import React, { forwardRef, type ReactNode, useRef } from "react";
import { composeRefs } from "@radix-ui/react-compose-refs";
import classnames from "classnames";

import styles from "./NavPanel.module.scss";

import { RenderChildFn } from "../../abstractions/RendererDefs";
import { ScrollContext } from "../../components-core/ScrollContext";
import { Logo } from "../Logo/LogoNative";
import { useAppLayoutContext } from "../App/AppLayoutContext";
import { getAppLayoutOrientation } from "../App/AppNative";

interface INavPanelContext {
  inDrawer: boolean;
}

export const NavPanelContext = React.createContext<INavPanelContext | null>(null);

const contextValue = {
  inDrawer: true,
};

function DrawerNavPanel({
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
            {logoContent || <Logo />}
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
    inDrawer,
    renderChild,
  }: {
    children: ReactNode;
    className?: string;
    style?: React.CSSProperties;
    logoContent?: ReactNode;
    inDrawer?: boolean;
    renderChild: RenderChildFn;
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
  const safeLogoContent = logoContent || renderChild(appLayoutContext?.logoContentDef);

  // console.log(appLayoutContext);

  if (inDrawer) {
    return (
      <DrawerNavPanel style={style} logoContent={safeLogoContent} className={className}>
        {children}
      </DrawerNavPanel>
    );
  }

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
          <div className={classnames(styles.logoWrapper)}>{safeLogoContent || <Logo />}</div>
        )}
        <div className={styles.wrapperInner} style={style}>
          {children}
        </div>
      </ScrollContext.Provider>
    </div>
  );
});
