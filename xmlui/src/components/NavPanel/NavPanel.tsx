import React, { forwardRef, type ReactNode, useRef } from "react";
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
import { getAppLayoutOrientation } from "@components/App/App";
import { composeRefs } from "@radix-ui/react-compose-refs";
import { nestedComp } from "@components-core/descriptorHelper";
import type { RenderChildFn } from "@abstractions/RendererDefs";

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

const NavPanel = forwardRef(function NavPanel(
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

// =====================================================================================================================
// XMLUI NavPanel component definition

/**
 * \`NavPanel\` is a placeholder within `App` to define the app's navigation (menu) structure.
 *
 * > **Note**: You can learn more details about using this component [here](../learning/app-component).
 */
export interface NavPanelComponentDef extends ComponentDef<"NavPanel"> {
  props: {
    /**
     * This property defines the logo template to display in the navigation panel with the `vertical` and `vertical-sticky` layout.
     * @descriptionRef
     */
    logoTemplate?: string;
  };
}

export const NavPanelMd: ComponentDescriptor<NavPanelComponentDef> = {
  displayName: "NavPanel",
  description: "Display an avatar associated with an entity",
  props: {
    logoTemplate: nestedComp(
      "Optional logo template for the navigation panel. It may be different than the one used for the app",
    ),
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    "color-bg-NavPanel": "transparent",
    ...borderSubject("NavPanel", {}),
    "padding-horizontal-NavPanel": "0",
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
        logoContent={renderChild(node.props.logoTemplate)}
        className={layoutContext?.themeClassName}
        inDrawer={layoutContext?.inDrawer}
        renderChild={renderChild}
      >
        {renderChild(node.children)}
      </NavPanel>
    );
  },
  NavPanelMd,
);
