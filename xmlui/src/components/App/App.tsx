import type { CSSProperties, ReactNode } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ComponentDef } from "@abstractions/ComponentDefs";
import type { AppLayoutType, IAppLayoutContext } from "./AppLayoutContext";
import { AppLayoutContext, appLayouts } from "./AppLayoutContext";
import type { ComponentDescriptor } from "@abstractions/ComponentDescriptorDefs";
import { useLocation } from "@remix-run/react";
import { noop } from "lodash-es";
import classnames from "@components-core/utils/classnames";

import styles from "./App.module.scss";
import { createComponentRenderer } from "@components-core/renderers";
import { useAppContext } from "@components-core/AppContext";
import { Sheet, SheetContent } from "@components/App/Sheet";
import { ScrollContext } from "@components-core/ScrollContext";
import { desc, nestedComp } from "@components-core/descriptorHelper";
import { parseScssVar } from "@components-core/theming/themeVars";
import {AppContextAwareAppHeader, AppHeader} from "@components/AppHeader/AppHeader";
import { useResizeObserver } from "@components-core/utils/hooks";
import { useTheme } from "@components-core/theming/ThemeContext";
import type { JSX } from "react/jsx-runtime";
import {RenderChildFn} from "@abstractions/RendererDefs";

type Props = {
  children: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
  navPanel?: ReactNode;
  style: CSSProperties;
  layout?: AppLayoutType;
  loggedInUser?: any;
  scrollWholePage: boolean;
  onReady?: () => void;
  navPanelDef?: ComponentDef;
  logoContentDef?: ComponentDef;
  renderChild: RenderChildFn;
};

function App({
  children,
  style,
  layout,
  loggedInUser,
  scrollWholePage,
  onReady = noop,
  header,
  navPanel,
  footer,
  navPanelDef,
  logoContentDef,
  renderChild
}: Props) {
  const { getThemeVar } = useTheme();
  const layoutWithDefaultValue = layout || getThemeVar("layout-App") || "condensed-sticky";
  const safeLayout = layoutWithDefaultValue
    ?.trim()
    .replace(/[\u2013\u2014\u2011]/g, "-") as AppLayoutType; //It replaces all &ndash; (–) and &mdash; (—) and non-breaking hyphen '‑' symbols with simple dashes (-).
  const { setLoggedInUser, mediaSize } = useAppContext();
  const hasRegisteredHeader = header !== undefined;
  const hasRegisteredNavPanel = navPanelDef !== undefined;

  useEffect(() => {
    setLoggedInUser(loggedInUser);
  }, [loggedInUser, setLoggedInUser]);

  useEffect(() => {
    onReady();
  }, [onReady]);

  // --- We don't hide the nav panel if there's no header; in that case, we don't have a show drawer
  // --- button. The exception is the condensed layout because we render a header in that case (otherwise,
  // --- we couldn't show the NavPanel)
  const navPanelVisible =
    mediaSize.largeScreen ||
    (!hasRegisteredHeader && safeLayout !== "condensed" && safeLayout !== "condensed-sticky");

  const scrollPageContainerRef = useRef(null);
  const noScrollPageContainerRef = useRef(null);

  const scrollContainerRef = scrollWholePage ? scrollPageContainerRef : noScrollPageContainerRef;
  const [footerHeight, setFooterHeight] = useState(0);
  const [headerHeight, setHeaderHeight] = useState(0);

  const footerRef = useRef<HTMLDivElement | null>();
  const footerRefCallback = useCallback((element: HTMLDivElement | null) => {
    footerRef.current = element;
  }, []);

  const headerRef = useRef<HTMLDivElement | null>();
  const headerRefCallback = useCallback((element: HTMLDivElement | null) => {
    headerRef.current = element;
  }, []);

  useResizeObserver(
    footerRef,
    useCallback((entries) => {
      setFooterHeight(entries?.[0]?.contentRect?.height);
    }, []),
  );

  useResizeObserver(
    headerRef,
    useCallback((entries) => {
      setHeaderHeight(entries?.[0]?.contentRect?.height);
    }, []),
  );

  const styleWithHelpers = useMemo(() => {
    return {
      ...style,
      "--header-height": !scrollWholePage ? 0 : headerHeight + "px",
      "--footer-height": !scrollWholePage ? 0 : footerHeight + "px",
    };
  }, [footerHeight, headerHeight, scrollWholePage, style]);

  const [drawerVisible, setDrawerVisible] = useState(false);
  const location = useLocation();

  const toggleDrawer = useCallback(() => {
    setDrawerVisible((prev) => !prev);
  }, []);

  const layoutContextValue = useMemo<IAppLayoutContext>(() => {
    return {
      hasRegisteredNavPanel,
      hasRegisteredHeader,
      navPanelVisible,
      drawerVisible,
      layout: safeLayout,
      showDrawer: () => {
        setDrawerVisible(true);
      },
      hideDrawer: () => {
        setDrawerVisible(false);
      },
      toggleDrawer,
      navPanelDef,
      logoContentDef,
    };
  }, [
    hasRegisteredNavPanel,
    hasRegisteredHeader,
    navPanelVisible,
    drawerVisible,
    safeLayout,
    toggleDrawer,
    navPanelDef,
    logoContentDef,
  ]);

  useEffect(() => {
    if (navPanelVisible) {
      setDrawerVisible(false);
    }
  }, [navPanelVisible]);

  useEffect(() => {
    setDrawerVisible(false);
  }, [location, safeLayout]);

  const wrapperBaseClasses = [
    styles.wrapper,
    {
      [styles.scrollWholePage]: scrollWholePage,
      "media-large": mediaSize.largeScreen,
      "media-small": mediaSize.smallScreen,
      "media-desktop": mediaSize.desktop,
      "media-phone": mediaSize.phone,
      "media-tablet": mediaSize.tablet,
    },
  ];

  let content: string | number | boolean | Iterable<ReactNode> | JSX.Element;
  switch (safeLayout) {
    case "vertical":
      content = (
        <div className={classnames(wrapperBaseClasses, styles.vertical)} style={styleWithHelpers}>
          {navPanelVisible && <div className={classnames(styles.navPanelWrapper)}>{navPanel}</div>}
          <div className={styles.contentWrapper} ref={scrollPageContainerRef}>
            <header ref={headerRefCallback} className={classnames(styles.headerWrapper)}>
              {header}
            </header>
            <div className={styles.PagesWrapper} ref={noScrollPageContainerRef}>
              <ScrollContext.Provider value={scrollContainerRef}>
                <div className={styles.PagesWrapperInner}>{children}</div>
              </ScrollContext.Provider>
            </div>
            <div className={styles.footerWrapper} ref={footerRefCallback}>
              {footer}
            </div>
          </div>
        </div>
      );
      break;
    case "vertical-sticky":
      content = (
        <div
          className={classnames(wrapperBaseClasses, styles.vertical, styles.sticky)}
          style={styleWithHelpers}
        >
          {navPanelVisible && <div className={classnames(styles.navPanelWrapper)}>{navPanel}</div>}
          <div className={styles.contentWrapper} ref={scrollPageContainerRef}>
            <header
              ref={headerRefCallback}
              className={classnames(styles.headerWrapper, styles.sticky)}
            >
              {header}
            </header>
            <div className={styles.PagesWrapper} ref={noScrollPageContainerRef}>
              <ScrollContext.Provider value={scrollContainerRef}>
                <div className={styles.PagesWrapperInner}>{children}</div>
              </ScrollContext.Provider>
            </div>
            <div className={styles.footerWrapper} ref={footerRefCallback}>
              {footer}
            </div>
          </div>
        </div>
      );
      break;
    case "vertical-full-header":
      content = (
        <div
          className={classnames(wrapperBaseClasses, styles.verticalFullHeader)}
          style={styleWithHelpers}
          ref={scrollPageContainerRef}
        >
          <header
            className={classnames(styles.headerWrapper, styles.sticky)}
            ref={headerRefCallback}
          >
            {header}
          </header>
          <div className={styles.content}>
            {navPanelVisible && <aside className={styles.navPanelWrapper}>{navPanel}</aside>}
            <main className={styles.contentWrapper}>
              <div className={styles.PagesWrapper} ref={noScrollPageContainerRef}>
                <ScrollContext.Provider value={scrollContainerRef}>
                  <div className={styles.PagesWrapperInner}>{children}</div>
                </ScrollContext.Provider>
              </div>
            </main>
          </div>
          <div className={styles.footerWrapper} ref={footerRefCallback}>
            {footer}
          </div>
        </div>
      );
      break;
    case "condensed":
    case "condensed-sticky":
      content = (
        <div
          className={classnames(wrapperBaseClasses, styles.horizontal, {
            [styles.sticky]: safeLayout === "condensed-sticky",
          })}
          style={styleWithHelpers}
          ref={scrollPageContainerRef}
        >
          <header
            className={classnames("app-layout-condensed", styles.headerWrapper, {
              [styles.sticky]: safeLayout === "condensed-sticky",
            })}
            ref={headerRefCallback}
          >
            {!hasRegisteredHeader && hasRegisteredNavPanel && (
              <AppContextAwareAppHeader renderChild={renderChild}/>
            )}
            {header}
          </header>
          <div className={styles.PagesWrapper} ref={noScrollPageContainerRef}>
            <ScrollContext.Provider value={scrollContainerRef}>
              <div className={styles.PagesWrapperInner}>{children}</div>
            </ScrollContext.Provider>
          </div>
          <div className={styles.footerWrapper} ref={footerRefCallback}>
            {footer}
          </div>
        </div>
      );
      break;
    case "horizontal": {
      content = (
        <div
          className={classnames(wrapperBaseClasses, styles.horizontal)}
          style={styleWithHelpers}
          ref={scrollPageContainerRef}
        >
          <header className={classnames(styles.headerWrapper)} ref={headerRefCallback}>
            <div>{header}</div>
            {navPanelVisible && <div className={styles.navPanelWrapper}>{navPanel}</div>}
          </header>
          <div className={styles.PagesWrapper} ref={noScrollPageContainerRef}>
            <ScrollContext.Provider value={scrollContainerRef}>
              <div className={styles.PagesWrapperInner}>{children}</div>
            </ScrollContext.Provider>
          </div>
          <div className={styles.footerWrapper} ref={footerRefCallback}>
            {footer}
          </div>
        </div>
      );
      break;
    }
    case "horizontal-sticky":
      content = (
        <div
          className={classnames(wrapperBaseClasses, styles.horizontal, styles.sticky)}
          style={styleWithHelpers}
          ref={scrollPageContainerRef}
        >
          <header
            className={classnames(styles.headerWrapper, styles.sticky)}
            ref={headerRefCallback}
          >
            <div>{header}</div>
            {navPanelVisible && <div className={styles.navPanelWrapper}>{navPanel}</div>}
          </header>
          <div className={styles.PagesWrapper} ref={noScrollPageContainerRef}>
            <ScrollContext.Provider value={scrollContainerRef}>
              <div className={styles.PagesWrapperInner}>{children}</div>
            </ScrollContext.Provider>
          </div>
          <div className={styles.footerWrapper} ref={footerRefCallback}>
            {footer}
          </div>
        </div>
      );
      break;
    default:
      throw new Error("layout type not supported: " + safeLayout);
  }

  return (
    <AppLayoutContext.Provider value={layoutContextValue}>
      <Sheet open={drawerVisible} onOpenChange={(open) => setDrawerVisible(open)}>
        <SheetContent side={"left"}>{renderChild(navPanelDef, { inDrawer: true })}</SheetContent>
      </Sheet>
      {content}
    </AppLayoutContext.Provider>
  );
}

export function getAppLayoutOrientation(appLayout?: AppLayoutType) {
  switch (appLayout) {
    case "vertical":
    case "vertical-sticky":
    case "vertical-full-header":
      return "vertical";
    default:
      return "horizontal";
  }
}

/**
 * The \`App\` component provides a UI frame for XMLUI apps. According to predefined (and run-time configurable) structure templates,
 * \`App\` allows you to display your preferred layout.
 *
 * > **Note**: You can learn more details about using this component [here](../learning/using-components/app-component).
 */
export interface AppComponentDef extends ComponentDef<"App"> {
  props: {
    /** @descriptionRef */
    layout?: AppLayoutType;
    /** @internal */
    defaultRoute?: string; // TODO: remove
    /** @descriptionRef */
    loggedInUser?: any;
    /** @internal */
    logoTemplate?: ComponentDef; // NOTE: does not seem to work (not needed because of AppHeader?)
    /**
     * @descriptionRef
     * @defaultValue true
     */
    scrollWholePage?: string;
  };
  events: {
    /** @descriptionRef */
    ready?: string;
  };
}

export const AppMd: ComponentDescriptor<AppComponentDef> = {
  displayName: "App",
  description: "The App component provides a UI frame for XMLUI apps.",
  props: {
    layout: {
      description: "The layout of the app",
      availableValues: appLayouts,
    },
    defaultRoute: desc("The app's default route", "string"),
    loggedInUser: desc("Optional information about the logged-in user"),
    logoTemplate: nestedComp("Optional template of the app logo"),
    scrollWholePage: desc(
      "Whether the whole page should scroll or just the content area",
      "boolean",
      true,
    ),
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    "width-navPanel-App": "$space-72",
    "max-content-width-App": "$max-content-width",
    "shadow-header-App": "$shadow-spread",
    "shadow-pages-App": "$shadow-spread",
    light: {
      // --- No light-specific theme vars
    },
    dark: {
      // --- No dark-specific theme vars
    },
  },
};

export const appRenderer = createComponentRenderer<AppComponentDef>(
  "App",
  ({ node, extractValue, renderChild, layoutCss, lookupEventHandler }) => {
    let AppHeader: ComponentDef;
    let Footer: ComponentDef;
    let NavPanel: ComponentDef;
    const restChildren: any[] = [];
    node.children?.forEach((child) => {
      if (child.type === "AppHeader") {
        AppHeader = child;
      } else if (child.type === "Footer") {
        Footer = child;
      } else if (child.type === "NavPanel") {
        NavPanel = child;
      } else {
        restChildren.push(child);
      }
    });

    const layoutType = extractValue(node.props.layout);

    return (
      <App
        scrollWholePage={extractValue.asOptionalBoolean(node.props.scrollWholePage, true)}
        style={layoutCss}
        layout={layoutType}
        loggedInUser={extractValue(node.props.loggedInUser)}
        onReady={lookupEventHandler("ready")}
        header={renderChild(AppHeader)}
        footer={renderChild(Footer)}
        navPanel={renderChild(NavPanel)}
        navPanelDef={NavPanel}
        logoContentDef={node.props.logoTemplate}
        renderChild={renderChild}
      >
        {renderChild(restChildren)}
      </App>
    );
  },
  AppMd,
);
