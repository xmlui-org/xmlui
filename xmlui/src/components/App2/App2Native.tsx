import {
  type CSSProperties,
  type ReactNode,
  forwardRef,
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

import styles from "./App2.module.scss";

import type { ComponentDef } from "../../abstractions/ComponentDefs";
import type { RenderChildFn, RegisterComponentApiFn } from "../../abstractions/RendererDefs";
import { useAppContext } from "../../components-core/AppContext";
import { useIsomorphicLayoutEffect, useResizeObserver } from "../../components-core/utils/hooks";
import { useTheme, useThemes } from "../../components-core/theming/ThemeContext";
import { useScrollbarWidth } from "../../components-core/utils/css-utils";
import { Sheet, SheetContent } from "../../components/App/Sheet";
import { AppContextAwareAppHeader } from "../../components/AppHeader/AppHeaderNative";
import type { AppLayoutType, IAppLayoutContext } from "../App/AppLayoutContext";
import { AppLayoutContext } from "../App/AppLayoutContext";
import { SearchContextProvider } from "./SearchContext";
import type { NavHierarchyNode } from "../NavPanel/NavPanelNative";
import { LinkInfoContext } from "./LinkInfoContext";
import { EMPTY_OBJECT } from "../../components-core/constants";

// --- Slot Components ---

interface AppContainerProps extends React.HTMLAttributes<HTMLDivElement> {}

const AppContainer = forwardRef<HTMLDivElement, AppContainerProps>(
  ({ className, children, ...rest }, ref) => {
    return (
      <div {...rest} className={className} ref={ref}>
        {children}
      </div>
    );
  }
);

AppContainer.displayName = "AppContainer";

interface AppHeaderSlotProps extends React.HTMLAttributes<HTMLElement> {}

const AppHeaderSlot = forwardRef<HTMLElement, AppHeaderSlotProps>(
  ({ className, children, ...rest }, ref) => {
    return (
      <header {...rest} className={classnames(styles.headerWrapper, className)} ref={ref}>
        {children}
      </header>
    );
  }
);

AppHeaderSlot.displayName = "AppHeaderSlot";

interface AppFooterSlotProps extends React.HTMLAttributes<HTMLDivElement> {}

const AppFooterSlot = forwardRef<HTMLDivElement, AppFooterSlotProps>(
  ({ className, children, ...rest }, ref) => {
    return (
      <div {...rest} className={classnames(styles.footerWrapper, className)} ref={ref}>
        {children}
      </div>
    );
  }
);

AppFooterSlot.displayName = "AppFooterSlot";

interface AppNavPanelSlotProps extends React.HTMLAttributes<HTMLDivElement> {}

const AppNavPanelSlot = forwardRef<HTMLDivElement, AppNavPanelSlotProps>(
  ({ className, children, ...rest }, ref) => {
    return (
      <div {...rest} className={classnames(styles.navPanelWrapper, className)} ref={ref}>
        {children}
      </div>
    );
  }
);

AppNavPanelSlot.displayName = "AppNavPanelSlot";

interface AppContentSlotProps extends React.HTMLAttributes<HTMLDivElement> {}

const AppContentSlot = forwardRef<HTMLDivElement, AppContentSlotProps>(
  ({ className, children, ...rest }, ref) => {
    return (
      <div {...rest} className={classnames(styles.contentWrapper, className)} ref={ref}>
        {children}
      </div>
    );
  }
);

AppContentSlot.displayName = "AppContentSlot";

interface AppPagesSlotProps extends React.HTMLAttributes<HTMLDivElement> {}

const AppPagesSlot = forwardRef<HTMLDivElement, AppPagesSlotProps>(
  ({ className, children, ...rest }, ref) => {
    return (
      <div {...rest} className={classnames(styles.PagesWrapper, className)} ref={ref}>
        {children}
      </div>
    );
  }
);

AppPagesSlot.displayName = "AppPagesSlot";

// --- Component Types ---

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

export function App2({
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

  // Issue 1 Fix: Validate and sanitize layout input to prevent invalid values
  // 1. Get layout from props, theme, or default to "condensed-sticky"
  // 2. Trim whitespace and replace Unicode dashes (en-dash, em-dash, non-breaking hyphen) with regular hyphens
  // 3. Fall back to default if result is empty string (whitespace-only input)
  // 4. Validate against allowed layout types (error will be thrown by switch default case if invalid)
  const layoutWithDefaultValue = layout || getThemeVar("layout-App") || "condensed-sticky";
  const sanitizedLayout = layoutWithDefaultValue
    ?.trim()
    .replace(/[\u2013\u2014\u2011]/g, "-");
  const safeLayout = (sanitizedLayout || "condensed-sticky") as AppLayoutType;
  const appContext = useAppContext();
  const { setLoggedInUser, mediaSize, forceRefreshAnchorScroll, appGlobals } = appContext;
  const hasRegisteredHeader = header !== undefined;
  
  // Check if NavPanel is actually displayed by checking if it rendered (not just if it's defined)
  // navPanel is null when the 'when' condition evaluates to false
  // navPanelDef !== undefined means a NavPanel is defined in the markup
  // navPanel !== null means the NavPanel actually rendered (when condition is true)
  const navPanelActuallyRendered = navPanel !== null && navPanel !== undefined;
  const hasRegisteredNavPanel = navPanelDef !== undefined && navPanelActuallyRendered;

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

  // Refs for scroll containers - naming clarified for better understanding
  // pageScrollRef: used when scrollWholePage=true (entire page scrolls)
  // contentScrollRef: used when scrollWholePage=false (only content area scrolls)
  const pageScrollRef = useRef(null);
  const contentScrollRef = useRef(null);

  const scrollContainerRef = scrollWholePage ? pageScrollRef : contentScrollRef;
  const scrollbarWidth = useScrollbarWidth();

  const footerSize = useElementSizeObserver();
  const headerSize = useElementSizeObserver();

  const styleWithHelpers = useMemo(() => {
    // Determine if we need header/footer height compensation for sticky layouts
    const heightConfig = getLayoutHeightConfig(safeLayout, scrollWholePage);
    
    return {
      ...style,
      "--header-height": heightConfig.useHeaderHeight ? `${headerSize.height}px` : "0px",
      "--footer-height": heightConfig.useFooterHeight ? `${footerSize.height}px` : "0px",
      "--header-abs-height": headerSize.height + "px",
      "--footer-abs-height": footerSize.height + "px",
      "--scrollbar-width": noScrollbarGutters ? "0px" : scrollbarWidth + "px",
    } as CSSProperties;
  }, [
    footerSize.height,
    headerSize.height,
    noScrollbarGutters,
    safeLayout,
    scrollWholePage,
    scrollbarWidth,
    style,
  ]);

  // Track whether onReady has been called to ensure it only fires once
  const onReadyCalledRef = useRef(false);
  
  // Call onReady once after the component and its children have rendered
  // Use effect (not layout effect) to ensure it runs after paint
  useEffect(() => {
    if (!onReadyCalledRef.current) {
      onReadyCalledRef.current = true;
      onReady();
    }
    // Empty deps - only run once on mount, regardless of onReady reference changes
  }, []);

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
    const frameId = requestAnimationFrame(() => {
      // we have to force refresh the anchor scroll to pos, because it depends on the header height (scroll-margin-top on anchors)
      forceRefreshAnchorScroll();
    });
    
    // Cleanup: cancel animation frame if component unmounts before it executes
    return () => {
      cancelAnimationFrame(frameId);
    };
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
      scrollWholePage,
      isFullVerticalWidth: false,
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
    scrollWholePage,
    appGlobals?.isNested,
  ]);

  const linkInfoContextValue = useMemo(() => {
    return {
      linkMap,
      registerLinkMap,
    };
  }, [linkMap, registerLinkMap]);

  // Close drawer when: 1) nav panel becomes visible (large screen), 2) location/layout changes
  // This ensures drawer is closed when it's no longer needed or context has changed
  useEffect(() => {
    setDrawerVisible(false);
  }, [navPanelVisible, location, safeLayout]);

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
  
  // Determine if footer should have nonSticky class based on footerSticky prop
  // Desktop layout now also respects footerSticky prop for consistency
  const footerShouldBeNonSticky = !footerSticky;
  
  switch (safeLayout) {
    case "vertical":
      content = (
        <AppContainer
          className={classnames(wrapperBaseClasses, styles.vertical)}
          style={styleWithHelpers}
          {...rest}
        >
          {navPanelVisible && <AppNavPanelSlot>{navPanel}</AppNavPanelSlot>}
          <AppContentSlot ref={pageScrollRef}>
            <AppHeaderSlot ref={headerSize.refCallback}>
              {header}
            </AppHeaderSlot>
            <AppPagesSlot ref={contentScrollRef}>
              <div className={pagesWrapperClasses}>{children}</div>
            </AppPagesSlot>
            <AppFooterSlot ref={footerSize.refCallback}>
              {footer}
            </AppFooterSlot>
          </AppContentSlot>
        </AppContainer>
      );
      break;
    case "vertical-sticky":
      content = (
        <AppContainer
          className={classnames(wrapperBaseClasses, styles.vertical, styles.sticky)}
          style={styleWithHelpers}
          {...rest}
        >
          {navPanelVisible && <AppNavPanelSlot>{navPanel}</AppNavPanelSlot>}
          <AppContentSlot ref={pageScrollRef}>
            <AppHeaderSlot
              ref={headerSize.refCallback}
              className={styles.sticky}
            >
              {header}
            </AppHeaderSlot>
            <AppPagesSlot ref={contentScrollRef}>
              <div className={pagesWrapperClasses}>{children}</div>
            </AppPagesSlot>
            <AppFooterSlot
              className={classnames({
                [styles.nonSticky]: footerShouldBeNonSticky,
              })}
              ref={footerSize.refCallback}
            >
              {footer}
            </AppFooterSlot>
          </AppContentSlot>
        </AppContainer>
      );
      break;
    case "vertical-full-header":
      content = (
        <AppContainer
          className={classnames(wrapperBaseClasses, styles.verticalFullHeader)}
          style={styleWithHelpers}
          ref={pageScrollRef}
          {...rest}
        >
          <AppHeaderSlot
            className={styles.sticky}
            ref={headerSize.refCallback}
          >
            {header}
          </AppHeaderSlot>
          <div className={styles.content}>
            {navPanelVisible && <aside className={styles.navPanelWrapper}><AppNavPanelSlot>{navPanel}</AppNavPanelSlot></aside>}
            <main className={styles.contentWrapper}>
              <AppPagesSlot ref={contentScrollRef}>
                <div className={pagesWrapperClasses}>{children}</div>
              </AppPagesSlot>
            </main>
          </div>
          <AppFooterSlot
            className={classnames({
              [styles.nonSticky]: footerShouldBeNonSticky,
            })}
            ref={footerSize.refCallback}
          >
            {footer}
          </AppFooterSlot>
        </AppContainer>
      );
      break;
    case "condensed":
    case "condensed-sticky":
      content = (
        <AppContainer
          className={classnames(wrapperBaseClasses, styles.horizontal, {
            [styles.sticky]: safeLayout === "condensed-sticky",
          })}
          style={styleWithHelpers}
          ref={pageScrollRef}
          {...rest}
        >
          <AppHeaderSlot
            className={classnames("app-layout-condensed", {
              [styles.sticky]: safeLayout === "condensed-sticky",
            })}
            ref={headerSize.refCallback}
          >
            {!hasRegisteredHeader && hasRegisteredNavPanel && (
              <AppContextAwareAppHeader renderChild={renderChild} />
            )}
            {header}
          </AppHeaderSlot>
          <AppPagesSlot ref={contentScrollRef}>
            <div className={pagesWrapperClasses}>{children}</div>
          </AppPagesSlot>
          <AppFooterSlot
            className={classnames({
              [styles.nonSticky]: footerShouldBeNonSticky,
            })}
            ref={footerSize.refCallback}
          >
            {footer}
          </AppFooterSlot>
        </AppContainer>
      );
      break;
    case "horizontal": {
      content = (
        <AppContainer
          className={classnames(wrapperBaseClasses, styles.horizontal)}
          style={styleWithHelpers}
          ref={pageScrollRef}
          {...rest}
        >
          <AppHeaderSlot ref={headerSize.refCallback}>
            {header}
            {navPanelVisible && <AppNavPanelSlot>{navPanel}</AppNavPanelSlot>}
          </AppHeaderSlot>
          <AppPagesSlot ref={contentScrollRef}>
            <div className={pagesWrapperClasses}>{children}</div>
          </AppPagesSlot>
          <AppFooterSlot ref={footerSize.refCallback}>
            {footer}
          </AppFooterSlot>
        </AppContainer>
      );
      break;
    }
    case "horizontal-sticky":
      content = (
        <AppContainer
          className={classnames(wrapperBaseClasses, styles.horizontal, styles.sticky)}
          style={styleWithHelpers}
          ref={pageScrollRef}
          {...rest}
        >
          <AppHeaderSlot
            className={styles.sticky}
            ref={headerSize.refCallback}
          >
            {header}
            {navPanelVisible && <AppNavPanelSlot>{navPanel}</AppNavPanelSlot>}
          </AppHeaderSlot>
          <AppPagesSlot ref={contentScrollRef}>
            <div className={pagesWrapperClasses}>{children}</div>
          </AppPagesSlot>
          <AppFooterSlot
            className={classnames({
              [styles.nonSticky]: footerShouldBeNonSticky,
            })}
            ref={footerSize.refCallback}
          >
            {footer}
          </AppFooterSlot>
        </AppContainer>
      );
      break;
    case "desktop":
      content = (
        <AppContainer
          className={classnames(wrapperBaseClasses, styles.desktop)}
          style={styleWithHelpers}
          {...rest}
        >
          {header && (
            <AppHeaderSlot
              className={styles.sticky}
              ref={headerSize.refCallback}
            >
              {header}
            </AppHeaderSlot>
          )}
          <AppPagesSlot ref={contentScrollRef}>
            <div className={styles.PagesWrapperInner}>{children}</div>
          </AppPagesSlot>
          {footer && (
            <AppFooterSlot
              className={classnames({
                [styles.nonSticky]: footerShouldBeNonSticky,
              })}
              ref={footerSize.refCallback}
            >
              {footer}
            </AppFooterSlot>
          )}
        </AppContainer>
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

/**
 * Custom hook for observing element size changes.
 * Returns a ref callback and the current size (width and height).
 */
function useElementSizeObserver() {
  const ref = useRef<HTMLElement | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  
  const refCallback = useCallback((element: HTMLElement | null) => {
    ref.current = element;
  }, []);
  
  useResizeObserver(
    ref,
    useCallback((entries) => {
      const rect = entries?.[0]?.contentRect;
      if (rect) {
        setSize({ width: rect.width, height: rect.height });
      }
    }, [])
  );
  
  return { refCallback, size, height: size.height, width: size.width };
}

/**
 * Helper function to determine if header/footer height CSS variables should be set
 * based on the layout type and scroll strategy.
 * 
 * Non-sticky layouts (vertical, horizontal, condensed) with scrollWholePage=true don't 
 * need height compensation because the header/footer scroll with the page.
 * 
 * Sticky layouts (vertical-sticky, vertical-full-header, desktop) or content-only scroll
 * need height compensation so content can be positioned correctly.
 */
function getLayoutHeightConfig(
  layout: AppLayoutType,
  scrollWholePage: boolean
): { useHeaderHeight: boolean; useFooterHeight: boolean } {
  // Non-sticky layouts with whole-page scroll don't need height compensation
  if (scrollWholePage && (
    layout === "vertical" ||
    layout === "horizontal" ||
    layout === "condensed"
  )) {
    return { useHeaderHeight: false, useFooterHeight: false };
  }
  
  // All other cases need height compensation (sticky layouts or content-only scroll)
  return { useHeaderHeight: true, useFooterHeight: true };
}
