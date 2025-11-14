import {
  type CSSProperties,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { JSX } from "react/jsx-runtime";
import { Helmet } from "react-helmet-async";
import { useLocation } from "@remix-run/react";
import { noop } from "lodash-es";
import classnames from "classnames";

import styles from "./App.module.scss";

import type { ComponentDef } from "../../abstractions/ComponentDefs";
import type { RenderChildFn, RegisterComponentApiFn } from "../../abstractions/RendererDefs";
import { useAppContext } from "../../components-core/AppContext";
import { useIsomorphicLayoutEffect, useResizeObserver } from "../../components-core/utils/hooks";
import { useTheme, useThemes } from "../../components-core/theming/ThemeContext";
import { useScrollbarWidth } from "../../components-core/utils/css-utils";
import { Sheet, SheetContent } from "../../components/App/Sheet";
import { AppContextAwareAppHeader } from "../../components/AppHeader/AppHeaderNative";
import type { AppLayoutType, IAppLayoutContext } from "./AppLayoutContext";
import { AppLayoutContext } from "./AppLayoutContext";
import { SearchContextProvider } from "./SearchContext";
import type { NavHierarchyNode } from "../NavPanel/NavPanelNative";
import { LinkInfoContext } from "./LinkInfoContext";
import { EMPTY_OBJECT } from "../../components-core/constants";
import { shouldKeep } from "../../components-core/utils/extractParam";

type Props = {
  children: ReactNode;
  logoContent?: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
  navPanel?: ReactNode;
  navPanelInDrawer?: ReactNode;
  style?: CSSProperties;
  className?: string;
  layout?: AppLayoutType;
  loggedInUser?: any;
  scrollWholePage: boolean;
  noScrollbarGutters?: boolean;
  onReady?: () => void;
  onMessageReceived?: (data: any, event: MessageEvent) => void;
  navPanelDef?: ComponentDef;
  logoContentDef?: ComponentDef;
  renderChild?: RenderChildFn;
  name?: string;
  logo?: string;
  logoDark?: string;
  logoLight?: string;
  defaultTone?: string;
  defaultTheme?: string;
  autoDetectTone?: boolean;
  applyDefaultContentPadding?: boolean;
  registerComponentApi?: RegisterComponentApiFn;
  footerSticky?: boolean;
};

export const defaultProps: Pick<
  Props,
  | "scrollWholePage"
  | "noScrollbarGutters"
  | "defaultTone"
  | "defaultTheme"
  | "autoDetectTone"
  | "onReady"
  | "onMessageReceived"
> = {
  scrollWholePage: true,
  noScrollbarGutters: false,
  defaultTone: undefined,
  defaultTheme: undefined,
  autoDetectTone: false,
  onReady: noop,
  onMessageReceived: noop,
};

export function App({
  children,
  style = EMPTY_OBJECT,
  layout,
  loggedInUser,
  scrollWholePage = defaultProps.scrollWholePage,
  noScrollbarGutters = defaultProps.noScrollbarGutters,
  onReady = defaultProps.onReady,
  onMessageReceived = defaultProps.onMessageReceived,
  header,
  navPanel,
  footer,
  navPanelDef,
  logoContentDef,
  logo,
  logoDark,
  logoLight,
  defaultTone,
  defaultTheme,
  autoDetectTone = defaultProps.autoDetectTone,
  renderChild,
  name,
  className,
  applyDefaultContentPadding,
  registerComponentApi,
  footerSticky = true,
  ...rest
}: Props) {
  const { getThemeVar } = useTheme();
  const { setActiveThemeTone, setActiveThemeId, themes } = useThemes();
  const mounted = useRef(false);

  const layoutWithDefaultValue = layout || getThemeVar("layout-App") || "condensed-sticky";
  const safeLayout = layoutWithDefaultValue
    ?.trim()
    .replace(/[\u2013\u2014\u2011]/g, "-") as AppLayoutType; //It replaces all &ndash; (–) and &mdash; (—) and non-breaking hyphen '‑' symbols with simple dashes (-).
  const appContext = useAppContext();
  const { setLoggedInUser, mediaSize, forceRefreshAnchorScroll, appGlobals } = appContext;
  const hasRegisteredHeader = header !== undefined;
  
  // --- Check if NavPanel's "when" condition allows it to be rendered
  // --- This ensures the drawer and hamburger menu are hidden when NavPanel.when evaluates to false
  const navPanelShouldRender = useMemo(() => {
    if (!navPanelDef) return false;
    // Use shouldKeep to evaluate the NavPanel's when condition
    // Pass empty state {} and appContext since we're evaluating at the App level
    return shouldKeep(navPanelDef.when, {}, appContext);
  }, [navPanelDef, appContext]);
  
  const hasRegisteredNavPanel = navPanelDef !== undefined && navPanelShouldRender;

  useEffect(() => {
    setLoggedInUser(loggedInUser);
  }, [loggedInUser, setLoggedInUser]);

  useEffect(() => {
    if (mounted.current) return;
    mounted.current = true;
    
    if (defaultTone === "dark" || defaultTone === "light") {
      setActiveThemeTone(defaultTone as any);
    } else if (autoDetectTone) {
      // Auto-detect system theme preference when no defaultTone is set
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const detectedTone = systemPrefersDark ? "dark" : "light";
      setActiveThemeTone(detectedTone);
    }
    
    if (defaultTheme) {
      setActiveThemeId(defaultTheme);
    }

    return () => {
      mounted.current = false;
    };
  }, [defaultTone, defaultTheme, autoDetectTone, setActiveThemeTone, setActiveThemeId, themes]);

  useEffect(() => {
    onReady();
  }, [onReady]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      onMessageReceived?.(event.data, event);
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [onMessageReceived]);

  // Listen for system theme changes when autoDetectTone is enabled
  useEffect(() => {
    if (!autoDetectTone || defaultTone) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleThemeChange = (e: MediaQueryListEvent) => {
      const detectedTone = e.matches ? "dark" : "light";
      setActiveThemeTone(detectedTone);
    };

    mediaQuery.addEventListener('change', handleThemeChange);

    return () => {
      mediaQuery.removeEventListener('change', handleThemeChange);
    };
  }, [autoDetectTone, defaultTone, setActiveThemeTone]);

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
  const scrollbarWidth = useScrollbarWidth();

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
      "--header-height":
        !scrollWholePage ||
        safeLayout === "vertical" ||
        safeLayout === "horizontal" ||
        safeLayout === "condensed"
          ? "0px"
          : safeLayout === "desktop"
          ? headerHeight + "px"
          : headerHeight + "px",
      "--footer-height":
        !scrollWholePage ||
        safeLayout === "vertical" ||
        safeLayout === "horizontal" ||
        safeLayout === "condensed"
          ? "0px"
          : safeLayout === "desktop"
          ? footerHeight + "px"
          : footerHeight + "px",
      "--header-abs-height": headerHeight + "px",
      "--footer-abs-height": footerHeight + "px",
      "--scrollbar-width": noScrollbarGutters ? "0px" : scrollbarWidth + "px",
    } as CSSProperties;
  }, [
    footerHeight,
    headerHeight,
    noScrollbarGutters,
    safeLayout,
    scrollWholePage,
    scrollbarWidth,
    style,
  ]);

  const [drawerVisible, setDrawerVisible] = useState(false);
  const location = useLocation();

  const toggleDrawer = useCallback(() => {
    setDrawerVisible((prev) => !prev);
  }, []);

  useIsomorphicLayoutEffect(() => {
    scrollContainerRef.current?.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant", // Optional if you want to skip the scrolling animation
    });
  }, [location.pathname]);

  useEffect(() => {
    requestAnimationFrame(() => {
      // we have to force refresh the anchor scroll to pos, because it depends on the header height (scroll-margin-top on anchors)
      forceRefreshAnchorScroll();
    });
  }, [forceRefreshAnchorScroll]);

  const [subNavPanelSlot, setSubNavPanelSlot] = useState(null);

  const registerSubNavPanelSlot = useCallback((element) => {
    setSubNavPanelSlot(element);
  }, []);

  const [linkMap, setLinkMap] = useState<Map<string, NavHierarchyNode>>(new Map());
  const registerLinkMap = useCallback((newLinkMap: Map<string, NavHierarchyNode>) => {
    setLinkMap(newLinkMap);
  }, []);

  const layoutContextValue = useMemo<IAppLayoutContext>(() => {
    return {
      hasRegisteredNavPanel,
      hasRegisteredHeader,
      navPanelVisible,
      drawerVisible,
      layout: safeLayout,
      logo: logo,
      logoDark: logoDark,
      logoLight: logoLight,
      showDrawer: () => {
        setDrawerVisible(true);
      },
      hideDrawer: () => {
        setDrawerVisible(false);
      },
      toggleDrawer,
      navPanelDef,
      logoContentDef,
      registerSubNavPanelSlot,
      subNavPanelSlot,
      isNested: appGlobals?.isNested || false,
    };
  }, [
    hasRegisteredNavPanel,
    hasRegisteredHeader,
    navPanelVisible,
    drawerVisible,
    safeLayout,
    logo,
    logoDark,
    logoLight,
    toggleDrawer,
    navPanelDef,
    logoContentDef,
    registerSubNavPanelSlot,
    subNavPanelSlot,
    appGlobals?.isNested,
  ]);

  const linkInfoContextValue = useMemo(() => {
    return {
      linkMap,
      registerLinkMap,
    };
  }, [linkMap, registerLinkMap]);

  useEffect(() => {
    if (navPanelVisible) {
      setDrawerVisible(false);
    }
  }, [navPanelVisible]);

  useEffect(() => {
    setDrawerVisible(false);
  }, [location, safeLayout]);

  const wrapperBaseClasses = [
    className,
    styles.wrapper,
    {
      [styles.scrollWholePage]: scrollWholePage,
      [styles.noScrollbarGutters]: noScrollbarGutters,
      [styles.noFooter]: !footerSticky,
      "media-large": mediaSize.largeScreen,
      "media-small": mediaSize.smallScreen,
      "media-desktop": mediaSize.desktop,
      "media-phone": mediaSize.phone,
      "media-tablet": mediaSize.tablet,
      "nested-app": appGlobals?.isNested || false,
    },
  ];

  let content: string | number | boolean | Iterable<ReactNode> | JSX.Element;
  let pagesWrapperClasses = classnames(styles.PagesWrapperInner, {
    [styles.withDefaultContentPadding]: applyDefaultContentPadding,
  });
  
  // Determine if footer should have nonSticky class (when sticky=false for non-desktop layouts)
  const footerShouldBeNonSticky = !footerSticky && safeLayout !== "desktop";
  
  switch (safeLayout) {
    case "vertical":
      content = (
        <div
          {...rest}
          className={classnames(wrapperBaseClasses, styles.vertical)}
          style={styleWithHelpers}
        >
          {navPanelVisible && <div className={classnames(styles.navPanelWrapper)}>{navPanel}</div>}
          <div className={styles.contentWrapper} ref={scrollPageContainerRef}>
            <header ref={headerRefCallback} className={classnames(styles.headerWrapper)}>
              {header}
            </header>
            <div className={styles.PagesWrapper} ref={noScrollPageContainerRef}>
              <div className={pagesWrapperClasses}>{children}</div>
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
          {...rest}
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
              <div className={pagesWrapperClasses}>{children}</div>
            </div>
            <div 
              className={classnames(styles.footerWrapper, {
                [styles.nonSticky]: footerShouldBeNonSticky,
              })} 
              ref={footerRefCallback}
            >
              {footer}
            </div>
          </div>
        </div>
      );
      break;
    case "vertical-full-header":
      content = (
        <div
          {...rest}
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
                <div className={pagesWrapperClasses}>{children}</div>
              </div>
            </main>
          </div>
          <div 
            className={classnames(styles.footerWrapper, {
              [styles.nonSticky]: footerShouldBeNonSticky,
            })} 
            ref={footerRefCallback}
          >
            {footer}
          </div>
        </div>
      );
      break;
    case "condensed":
    case "condensed-sticky":
      content = (
        <div
          {...rest}
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
              <AppContextAwareAppHeader renderChild={renderChild} />
            )}
            {header}
          </header>
          <div className={styles.PagesWrapper} ref={noScrollPageContainerRef}>
            <div className={pagesWrapperClasses}>{children}</div>
          </div>
          <div 
            className={classnames(styles.footerWrapper, {
              [styles.nonSticky]: footerShouldBeNonSticky,
            })} 
            ref={footerRefCallback}
          >
            {footer}
          </div>
        </div>
      );
      break;
    case "horizontal": {
      content = (
        <div
          {...rest}
          className={classnames(wrapperBaseClasses, styles.horizontal)}
          style={styleWithHelpers}
          ref={scrollPageContainerRef}
        >
          <header className={classnames(styles.headerWrapper)} ref={headerRefCallback}>
            {header}
            {navPanelVisible && <div className={styles.navPanelWrapper}>{navPanel}</div>}
          </header>
          <div className={styles.PagesWrapper} ref={noScrollPageContainerRef}>
            <div className={pagesWrapperClasses}>{children}</div>
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
          {...rest}
          className={classnames(wrapperBaseClasses, styles.horizontal, styles.sticky)}
          style={styleWithHelpers}
          ref={scrollPageContainerRef}
        >
          <header
            className={classnames(styles.headerWrapper, styles.sticky)}
            ref={headerRefCallback}
          >
            {header}
            {navPanelVisible && <div className={styles.navPanelWrapper}>{navPanel}</div>}
          </header>
          <div className={styles.PagesWrapper} ref={noScrollPageContainerRef}>
            <div className={pagesWrapperClasses}>{children}</div>
          </div>
          <div 
            className={classnames(styles.footerWrapper, {
              [styles.nonSticky]: footerShouldBeNonSticky,
            })} 
            ref={footerRefCallback}
          >
            {footer}
          </div>
        </div>
      );
      break;
    case "desktop":
      content = (
        <div
          {...rest}
          className={classnames(wrapperBaseClasses, styles.desktop)}
          style={styleWithHelpers}
        >
          {header && (
            <header
              className={classnames(styles.headerWrapper, styles.sticky)}
              ref={headerRefCallback}
            >
              {header}
            </header>
          )}
          <div className={styles.PagesWrapper} ref={noScrollPageContainerRef}>
            <div className={styles.PagesWrapperInner}>{children}</div>
          </div>
          {footer && (
            <div className={classnames(styles.footerWrapper, styles.sticky)} ref={footerRefCallback}>
              {footer}
            </div>
          )}
        </div>
      );
      break;
    default:
      throw new Error("layout type not supported: " + safeLayout);
  }

  // Memoize the rendered nav panel in drawer to prevent unnecessary re-renders
  const memoizedNavPanelInDrawer = useMemo(
    () => (renderChild && navPanelDef ? renderChild(navPanelDef, { inDrawer: true }) : null),
    [renderChild, navPanelDef],
  );

  // Memoize the helmet component
  const memoizedHelmet = useMemo(
    () =>
      name !== undefined ? <Helmet defaultTitle={name} titleTemplate={`%s | ${name}`} /> : null,
    [name],
  );

  // Memoize the onOpenChange callback
  const handleOpenChange = useCallback((open) => {
    setDrawerVisible(open);
  }, []);

  return (
    <>
      {memoizedHelmet}
      <AppLayoutContext.Provider value={layoutContextValue}>
        <LinkInfoContext.Provider value={linkInfoContextValue}>
          <SearchContextProvider>
            <Sheet open={drawerVisible} onOpenChange={handleOpenChange}>
              <SheetContent side={"left"}>{memoizedNavPanelInDrawer}</SheetContent>
            </Sheet>
            {content}
          </SearchContextProvider>
        </LinkInfoContext.Provider>
      </AppLayoutContext.Provider>
    </>
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
