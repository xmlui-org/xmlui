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
import type { RenderChildFn } from "../../abstractions/RendererDefs";
import { useAppContext } from "../../components-core/AppContext";
import { ScrollContext } from "../../components-core/ScrollContext";
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

type Props = {
  children: ReactNode;
  logoContent?: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
  navPanel?: ReactNode;
  navPanelInDrawer?: ReactNode;
  style?: CSSProperties;
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
  paddingLeft?: string;
  paddingRight ?: string;
  paddingTop?: string;
  paddingBottom ?: string;
};

export const defaultProps: Pick<
  Props,
  "scrollWholePage" | "noScrollbarGutters" | "defaultTone" | "defaultTheme" | "onReady" | "onMessageReceived"
> = {
  scrollWholePage: true,
  noScrollbarGutters: false,
  defaultTone: undefined,
  defaultTheme: undefined,
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
  renderChild,
  name,
  paddingLeft,
  paddingRight,
  paddingTop,
  paddingBottom
}: Props) {
  const { getThemeVar } = useTheme();
  const { setActiveThemeTone, setActiveThemeId, themes } = useThemes();

  const mounted = useRef(false);

  const layoutWithDefaultValue = layout || getThemeVar("layout-App") || "condensed-sticky";
  const safeLayout = layoutWithDefaultValue
    ?.trim()
    .replace(/[\u2013\u2014\u2011]/g, "-") as AppLayoutType; //It replaces all &ndash; (–) and &mdash; (—) and non-breaking hyphen '‑' symbols with simple dashes (-).
  const { setLoggedInUser, mediaSize, forceRefreshAnchorScroll, appGlobals } = useAppContext();
  const hasRegisteredHeader = header !== undefined;
  const hasRegisteredNavPanel = navPanelDef !== undefined;

  const pagesWrapperInnerStyle = useMemo(() => {
    const styleWithoutPaddings = { ...style };
    // Remove padding properties from the style object
    delete styleWithoutPaddings.padding;
    delete styleWithoutPaddings.paddingLeft;
    delete styleWithoutPaddings.paddingRight;
    delete styleWithoutPaddings.paddingTop;
    delete styleWithoutPaddings.paddingBottom;
    return {
      ...styleWithoutPaddings,
      "--page-padding-left": paddingLeft,
      "--page-padding-right": paddingRight,
      "--page-padding-top": paddingTop,
      "--page-padding-bottom": paddingBottom,
    };
  }, [paddingBottom, paddingLeft, paddingRight, paddingTop, style]);

  useEffect(() => {
    setLoggedInUser(loggedInUser);
  }, [loggedInUser, setLoggedInUser]);

  useEffect(() => {
    if (mounted.current) return;
    mounted.current = true;
    if (defaultTone === "dark" || defaultTone === "light") {
      setActiveThemeTone(defaultTone as any);
    }
    if (defaultTheme) {
      setActiveThemeId(defaultTheme);
    }

    return () => {
      mounted.current = false;
    };
  }, [defaultTone, defaultTheme, setActiveThemeTone, setActiveThemeId, themes]);

  useEffect(() => {
    onReady();
  }, [onReady]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      onMessageReceived?.(event.data, event);
    };

    window.addEventListener('message', handleMessage);
    
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [onMessageReceived]);

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
      "--header-height":
        !scrollWholePage ||
        safeLayout === "vertical" ||
        safeLayout === "horizontal" ||
        safeLayout === "condensed"
          ? "0px"
          : headerHeight + "px",
      "--footer-height":
        !scrollWholePage ||
        safeLayout === "vertical" ||
        safeLayout === "horizontal" ||
        safeLayout === "condensed"
          ? "0px"
          : footerHeight + "px",
      "--header-abs-height": headerHeight + "px",
      "--footer-abs-height": footerHeight + "px",
      "--scrollbar-width": noScrollbarGutters ? "0px" : scrollbarWidth + "px",
    } as CSSProperties;
  }, [footerHeight, headerHeight, noScrollbarGutters, safeLayout, scrollWholePage, scrollbarWidth]);

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

  const linkInfoContextValue = useMemo(()=>{
    return {
      linkMap,
      registerLinkMap
    }
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
    styles.wrapper,
    {
      [styles.scrollWholePage]: scrollWholePage,
      [styles.noScrollbarGutters]: noScrollbarGutters,
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
                <div className={styles.PagesWrapperInner} style={pagesWrapperInnerStyle}>
                  {children}
                </div>
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
                <div className={styles.PagesWrapperInner} style={pagesWrapperInnerStyle}>
                  {children}
                </div>
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
                  <div className={styles.PagesWrapperInner} style={pagesWrapperInnerStyle}>
                    {children}
                  </div>
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
              <AppContextAwareAppHeader renderChild={renderChild} />
            )}
            {header}
          </header>
          <div className={styles.PagesWrapper} ref={noScrollPageContainerRef}>
            <ScrollContext.Provider value={scrollContainerRef}>
              <div className={styles.PagesWrapperInner} style={pagesWrapperInnerStyle}>
                {children}
              </div>
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
            {header}
            {navPanelVisible && <div className={styles.navPanelWrapper}>{navPanel}</div>}
          </header>
          <div className={styles.PagesWrapper} ref={noScrollPageContainerRef}>
            <ScrollContext.Provider value={scrollContainerRef}>
              <div className={styles.PagesWrapperInner} style={pagesWrapperInnerStyle}>
                {children}
              </div>
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
            {header}
            {navPanelVisible && <div className={styles.navPanelWrapper}>{navPanel}</div>}
          </header>
          <div className={styles.PagesWrapper} ref={noScrollPageContainerRef}>
            <ScrollContext.Provider value={scrollContainerRef}>
              <div className={styles.PagesWrapperInner} style={pagesWrapperInnerStyle}>
                {children}
              </div>
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
