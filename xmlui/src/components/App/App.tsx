import type { CSSProperties, ReactNode } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "@remix-run/react";
import { noop } from "lodash-es";
import classnames from "@components-core/utils/classnames";

import styles from "./App.module.scss";

import type { ComponentDef } from "@abstractions/ComponentDefs";
import type { AppLayoutType } from "./AppLayoutContext";
import { AppLayoutContext } from "./AppLayoutContext";
import type { ComponentDescriptor } from "@abstractions/ComponentDescriptorDefs";

import { createComponentRenderer } from "@components-core/renderers";
import { useAppContext } from "@components-core/AppContext";
import { Sheet, SheetContent } from "@components/App/Sheet";
import { ScrollContext } from "@components-core/ScrollContext";
import { desc } from "@components-core/descriptorHelper";
import { parseScssVar } from "@components-core/theming/themeVars";
import { AppHeader } from "@components/AppHeader/AppHeader";
import { useResizeObserver } from "@components-core/utils/hooks";

type Props = {
  children: ReactNode;
  logoContent?: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
  style: CSSProperties;
  layout?: AppLayoutType;
  loggedInUser?: any;
  scrollWholePage?: boolean;
  onReady?: () => void;
};

function App({
  children,
  style,
  layout = "horizontal",
  loggedInUser,
  logoContent,
  scrollWholePage = true,
  onReady = noop,
  header,
  footer,
}: Props) {
  const safeLayout = layout?.trim().replace(/[\u2013\u2014\u2011]/g, "-") as AppLayoutType; //It replaces all &ndash; (–) and &mdash; (—) and non-breaking hyphen '‑' symbols with simple dashes (-).
  const { setLoggedInUser, mediaSize } = useAppContext();
  const [registeredHeaders, setRegisteredHeaders] = useState<Record<string, boolean>>({});
  const [registeredNavPanels, setRegisteredNavPanels] = useState<Record<string, boolean>>({});
  const hasRegisteredHeader = Object.keys(registeredHeaders).length > 0 || header !== undefined;
  const hasRegisteredFooter = Object.keys(registeredHeaders).length > 0 || footer !== undefined;
  const hasRegisteredNavPanel = Object.keys(registeredNavPanels).length > 0;

  useEffect(() => {
    setLoggedInUser(loggedInUser);
  }, [loggedInUser, setLoggedInUser]);

  useEffect(() => {
    onReady();
  }, [onReady]);

  //we don't hide the nav panel if there's no header,
  // because in that case we don't have a show drawer button
  // the exception is the condensed layout, because we render a header in that case (otherwise we couldn't show the navPanel)
  const navPanelVisible =
    mediaSize.largeScreen || (!hasRegisteredHeader && safeLayout !== "condensed" && safeLayout !== "condensed-sticky");

  const scrollPageContainerRef = useRef(null);
  const noScrollPageContainerRef = useRef(null);

  const scrollContainerRef = scrollWholePage ? scrollPageContainerRef : noScrollPageContainerRef;
  const [footerHeight, setFooterHeight] = useState(0);
  const [headerHeight, setHeaderHeight] = useState(0);

  const [navPanelRoot, setNavPanelRoot] = useState<HTMLElement | null>(null);
  const [drawerRoot, setDrawerRoot] = useState<HTMLDivElement | null>(null);
  const [headerRoot, setHeaderRoot] = useState<HTMLDivElement | null>(null);
  const [footerRoot, setFooterRoot] = useState<HTMLDivElement | null>(null);

  const footerRef = useRef<HTMLDivElement | null>();
  const footerRefCallback = useCallback((element: HTMLDivElement | null) => {
    footerRef.current = element;
    setFooterRoot(element);
  }, []);

  const headerRef = useRef<HTMLDivElement | null>();
  const headerRefCallback = useCallback(
    (element: HTMLDivElement | null) => {
      headerRef.current = element;
      if (safeLayout !== "horizontal" && safeLayout !== "horizontal-sticky") {
        setHeaderRoot(element);
      }
    },
    [safeLayout],
  );

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

  const layoutContextValue = useMemo(() => {
    return {
      registerHeader: (id: string) => {
        setRegisteredHeaders((prev) => {
          if (prev[id]) {
            return prev;
          }
          return {
            ...prev,
            [id]: true,
          };
        });
      },
      unregisterHeader: (id: string) => {
        setRegisteredHeaders((prev) => {
          if (!prev[id]) {
            return prev;
          }
          const ret = { ...prev };
          delete ret[id];
          return ret;
        });
      },
      registerNavPanel: (id: string) => {
        setRegisteredNavPanels((prev) => {
          if (prev[id]) {
            return prev;
          }
          return {
            ...prev,
            [id]: true,
          };
        });
      },
      unregisterNavPanel: (id: string) => {
        setRegisteredNavPanels((prev) => {
          if (!prev[id]) {
            return prev;
          }
          const ret = { ...prev };
          delete ret[id];
          return ret;
        });
      },
      navPanelRoot,
      drawerRoot,
      headerRoot,
      footerRoot,
      navPanelVisible,
      drawerVisible,
      hasRegisteredHeader,
      hasRegisteredNavPanel,
      hasRegisteredFooter,
      layout: safeLayout,
      setNavPanelRoot: (el: HTMLElement | null) => {
        setNavPanelRoot(el);
      },
      showDrawer: () => {
        setDrawerVisible(true);
      },
      hideDrawer: () => {
        setDrawerVisible(false);
      },
      toggleDrawer: toggleDrawer,
    };
  }, [
    navPanelRoot,
    drawerRoot,
    headerRoot,
    footerRoot,
    navPanelVisible,
    drawerVisible,
    hasRegisteredHeader,
    hasRegisteredNavPanel,
    hasRegisteredFooter,
    safeLayout,
    toggleDrawer,
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

  let content;
  switch (safeLayout) {
    case "vertical":
      content = (
        <div className={classnames(wrapperBaseClasses, styles.vertical)} style={styleWithHelpers}>
          {navPanelVisible && <div className={classnames(styles.navPanelWrapper)} ref={setNavPanelRoot} />}
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
        <div className={classnames(wrapperBaseClasses, styles.vertical, styles.sticky)} style={styleWithHelpers}>
          {navPanelVisible && <div className={classnames(styles.navPanelWrapper)} ref={setNavPanelRoot} />}
          <div className={styles.contentWrapper} ref={scrollPageContainerRef}>
            <header ref={headerRefCallback} className={classnames(styles.headerWrapper, styles.sticky)}>
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
          <header className={classnames(styles.headerWrapper, styles.sticky)} ref={headerRefCallback}>
            {header}
          </header>
          <div className={styles.content}>
            {navPanelVisible && <aside className={styles.navPanelWrapper} ref={setNavPanelRoot} />}
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
            className={classnames(styles.headerWrapper, {
              [styles.sticky]: safeLayout === "condensed-sticky",
            })}
            ref={headerRefCallback}
          >
            {!hasRegisteredHeader && hasRegisteredNavPanel && (
              <AppHeader
                canRestrictContentWidth={true}
                logoContent={logoContent}
                navPanelVisible={navPanelVisible}
                toggleDrawer={toggleDrawer}
              >
                <div ref={setNavPanelRoot} style={{ minWidth: 0 }} />
              </AppHeader>
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
            <div ref={setHeaderRoot}>{header}</div>
            {navPanelVisible && <div className={styles.navPanelWrapper} ref={setNavPanelRoot} />}
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
          <header className={classnames(styles.headerWrapper, styles.sticky)} ref={headerRefCallback}>
            <div ref={setHeaderRoot}>{header}</div>
            {navPanelVisible && <div className={styles.navPanelWrapper} ref={setNavPanelRoot} />}
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
        <SheetContent side={"left"} ref={setDrawerRoot} />
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

const metadata: ComponentDescriptor<AppComponentDef> = {
  displayName: "App",
  description: "Display an app",
  props: {
    layout: desc("The layout type of the app"),
    defaultRoute: desc("The app's default route"),
    loggedInUser: desc("Optional information about the logged-in user"),
    logoTemplate: {
      description: "Optional template of the app logo",
      valueType: "ComponentDef",
    },
    scrollWholePage: desc("Whether the whole page should scroll or just the content area"),
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
    const AppHeaders: any[] = [];
    const Footers: any[] = [];
    const restChildren: any[] = [];
    node.children?.forEach((child) => {
      if (child.type === "AppHeader") {
        AppHeaders.push(child);
      } else if (child.type === "Footer") {
        Footers.push(child);
      } else {
        restChildren.push(child);
      }
    });

    const layoutType = extractValue(node.props.layout) || "condensed-sticky";

    return (
      <App
        scrollWholePage={extractValue.asOptionalBoolean(node.props.scrollWholePage)}
        style={layoutCss}
        layout={layoutType}
        loggedInUser={extractValue(node.props.loggedInUser)}
        logoContent={renderChild(node.props.logoTemplate)}
        onReady={lookupEventHandler("ready")}
        header={renderChild(AppHeaders)}
        footer={renderChild(Footers)}
      >
        {renderChild(restChildren)}
      </App>
    );
  },
  metadata,
);
