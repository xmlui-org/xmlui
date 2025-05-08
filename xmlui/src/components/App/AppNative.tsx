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

type Props = {
  children: ReactNode;
  logoContent?: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
  navPanel?: ReactNode;
  navPanelInDrawer?: ReactNode;
  style: CSSProperties;
  layout?: AppLayoutType;
  loggedInUser?: any;
  scrollWholePage: boolean;
  noScrollbarGutters?: boolean;
  onReady?: () => void;
  navPanelDef?: ComponentDef;
  logoContentDef?: ComponentDef;
  renderChild?: RenderChildFn;
  name?: string;
  logo?: string;
  logoDark?: string;
  logoLight?: string;
  defaultTone?: string;
  defaultTheme?: string;
};

export function App({
  children,
  style,
  layout,
  loggedInUser,
  scrollWholePage,
  noScrollbarGutters = false,
  onReady = noop,
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
}: Props) {
  const { getThemeVar } = useTheme();
  const { setActiveThemeTone, setActiveThemeId, themes } = useThemes();

  const mounted = useRef(false);

  const layoutWithDefaultValue = layout || getThemeVar("layout-App") || "condensed-sticky";
  const safeLayout = layoutWithDefaultValue
    ?.trim()
    .replace(/[\u2013\u2014\u2011]/g, "-") as AppLayoutType; //It replaces all &ndash; (–) and &mdash; (—) and non-breaking hyphen '‑' symbols with simple dashes (-).
  const { setLoggedInUser, mediaSize, forceRefreshAnchorScroll } = useAppContext();
  const hasRegisteredHeader = header !== undefined;
  const hasRegisteredNavPanel = navPanelDef !== undefined;

  const pagesWrapperInnerStyle = useMemo(() => {
    const { padding, paddingLeft, paddingRight, paddingTop, paddingBottom, ...rest } = style;
    return {
      ...rest,
      "--page-padding-left": padding || paddingLeft,
      "--page-padding-right": padding || paddingRight,
      "--page-padding-top": padding || paddingTop,
      "--page-padding-bottom": padding || paddingBottom,
    };
  }, [style]);

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

  return (
    <>
      {name !== undefined && <Helmet defaultTitle={name} titleTemplate={`%s | ${name}`} />}
      <AppLayoutContext.Provider value={layoutContextValue}>
        <Sheet open={drawerVisible} onOpenChange={(open) => setDrawerVisible(open)}>
          <SheetContent side={"left"}>{renderChild(navPanelDef, { inDrawer: true })}</SheetContent>
        </Sheet>
        {content}
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
