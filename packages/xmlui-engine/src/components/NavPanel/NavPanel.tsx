import React, { type ReactNode, useId, useRef } from "react";
import styles from "./NavPanel.module.scss";
import type { ComponentDef } from "@abstractions/ComponentDefs";
import { createComponentRenderer } from "@components-core/renderers";
import classnames from "@components-core/utils/classnames";
import { Logo } from "@components/Logo/Logo";
import { ScrollContext } from "@components-core/ScrollContext";
import type { ComponentDescriptor } from "@abstractions/ComponentDescriptorDefs";
import { parseScssVar } from "@components-core/theming/themeVars";
import { borderSubject } from "@components-core/theming/themes/base-utils";
import { useAppLayoutContext } from "@components/App/AppLayoutContext";
import { createPortal } from "react-dom";
import { getAppLayoutOrientation } from "@components/App/App";
import { useIsomorphicLayoutEffect } from "@components-core/utils/hooks";

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

function NavPanel({
  children,
  style,
  logoContent,
  className,
}: {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  logoContent?: ReactNode;
}) {
  const id = useId();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const appLayoutContext = useAppLayoutContext();
  const horizontal = getAppLayoutOrientation(appLayoutContext?.layout) === "horizontal";
  const showLogo = appLayoutContext?.layout === "vertical" || appLayoutContext?.layout === "vertical-sticky";

  const registered = useRef(false);
  useIsomorphicLayoutEffect(() => {
    if (!appLayoutContext || registered.current) {
      return;
    }
    appLayoutContext.registerNavPanel(id);
    registered.current = true;
    return () => {
      registered.current = false;
      appLayoutContext.unregisterNavPanel(id);
    };
  }, [appLayoutContext, id]);

  if (appLayoutContext) {
    const { navPanelRoot, navPanelVisible, drawerVisible, drawerRoot } = appLayoutContext;
    return (
      <>
        {navPanelRoot &&
          navPanelVisible &&
          createPortal(
            <div
              ref={scrollContainerRef}
              className={classnames(styles.wrapper, className, {
                [styles.horizontal]: horizontal,
              })}
            >
              <ScrollContext.Provider value={scrollContainerRef}>
                {showLogo && <div className={classnames(styles.logoWrapper)}>{logoContent || <Logo />}</div>}
                <div className={styles.wrapperInner} style={style}>
                  {children}
                </div>
              </ScrollContext.Provider>
            </div>,
            navPanelRoot
          )}
        {drawerRoot &&
          drawerVisible &&
          createPortal(
            <DrawerNavPanel className={className} style={style} logoContent={logoContent}>
              {children}
            </DrawerNavPanel>,
            drawerRoot
          )}
      </>
    );
  }

  return (
    <div
      ref={scrollContainerRef}
      className={classnames(styles.wrapper, className, {
        [styles.horizontal]: horizontal,
      })}
    >
      <ScrollContext.Provider value={scrollContainerRef}>
        {showLogo && <div className={classnames(styles.logoWrapper)}>{logoContent || <Logo />}</div>}
        <div className={styles.wrapperInner} style={style}>
          {children}
        </div>
      </ScrollContext.Provider>
    </div>
  );
}

// =====================================================================================================================
// XMLUI NavPanel component definition

/**
 * \`NavPanel\` is a placeholder within `App` to define the app's navigation (menu) structure.
 *
 * > **Note**: You can learn more details about using this component [here](../learning/app-component).
 */
export interface NavPanelComponentDef extends ComponentDef<"NavPanel"> {
  props: {
    /** @descriptionRef */
    logoTemplate?: string;
  };
}

const metadata: ComponentDescriptor<NavPanelComponentDef> = {
  displayName: "NavPanel",
  description: "Display an avatar associated with an entity",
  props: {
    logoTemplate: {
      description:
        "Optional logo template for the navigation panel. " + "It may be different than the one used for the app",
      valueType: "ComponentDef",
    },
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    "color-bg-NavPanel": "transparent",
    ...borderSubject("NavPanel", {}),
    "padding-horizontal-NavPanel": "$space-4",
    "padding-vertical-logo-NavPanel": "$space-4",
    "padding-horizontal-logo-NavPanel": "$space-4",
    "margin-bottom-logo-NavPanel": "$space-4",
    light: {
      "shadow-NavPanel-vertical": "4px 0 4px 0 rgb(0 0 0 / 10%)",
    },
    dark: {
      "shadow-NavPanel-vertical": "4px 0 6px 0 rgba(0, 0, 0, 0.2)",
    },
  },
};

export const navPanelRenderer = createComponentRenderer<NavPanelComponentDef>(
  "NavPanel",
  ({ node, renderChild, layoutCss, layoutContext }) => {
    return (
      <NavPanel
        style={layoutCss}
        logoContent={renderChild(node.props.logoTemplate) || layoutContext?.logoContent}
        className={layoutContext?.themeClassName}
      >
        {renderChild(node.children)}
      </NavPanel>
    );
  },
  metadata
);
