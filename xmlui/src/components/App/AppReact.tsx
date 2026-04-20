import {
  type CSSProperties,
  type ReactNode,
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { JSX } from "react/jsx-runtime";
import { Helmet } from "react-helmet-async";
import { useLocation, useNavigationType } from "react-router-dom";
import { noop, debounce } from "lodash-es";
import classnames from "classnames";

import styles from "./App.module.scss";

import type { ComponentDef } from "../../abstractions/ComponentDefs";
import type { RenderChildFn, RegisterComponentApiFn } from "../../abstractions/RendererDefs";
import { useAppContext } from "../../components-core/AppContext";
import {
  useIsomorphicLayoutEffect,
  useResizeObserver,
  useDocumentKeydown,
  useDocumentKeyup,
} from "../../components-core/utils/hooks";
import { useTheme, useThemes } from "../../components-core/theming/ThemeContext";
import { useScrollbarWidth } from "../../components-core/utils/css-utils";
import { Sheet, SheetContent } from "./Sheet";
import { AppContextAwareAppHeader } from "../AppHeader/AppHeaderReact";
import { AppHeaderMd } from "../AppHeader/AppHeader";
import { useComponentThemeClass } from "../../components-core/theming/utils";
import type { AppLayoutType, IAppLayoutContext } from "../App/AppLayoutContext";
import { AppLayoutContext } from "../App/AppLayoutContext";
import { SearchContextProvider } from "./SearchContext";
import type { NavHierarchyNode } from "../NavPanel/NavPanelReact";
import { LinkInfoContext } from "./LinkInfoContext";
import { EMPTY_OBJECT } from "../../components-core/constants";
import { writeLocalStorage } from "../../components-core/appContext/local-storage-functions";
import { Part } from "../Part/Part";
import { COMPONENT_PART_KEY } from "../../components-core/theming/responsive-layout";

// --- Slot Components ---

// --- Slot Components Factory ---

function createSlot<T extends HTMLElement = HTMLDivElement>(
  className?: string,
  elementType: keyof JSX.IntrinsicElements = "div",
) {
  const Slot = forwardRef<T, React.HTMLAttributes<T>>(
    ({ className: customClass, children, ...rest }, ref) => {
      const Element = elementType as any;
      return (
        <Element {...rest} className={classnames(className, customClass)} ref={ref}>
          {children}
        </Element>
      );
    },
  );
  return Slot;
}

const AppContainer = createSlot();
const AppHeaderSlot = createSlot<HTMLElement>(styles.headerWrapper, "header");
const AppFooterSlot = createSlot(styles.footerWrapper);
const AppNavPanelSlot = createSlot(styles.navPanelWrapper);
const AppContentSlot = createSlot(styles.mainContentArea);
const AppPagesSlot = createSlot(styles.pagesContainer);

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
  classes?: Record<string, string>;
  layout?: AppLayoutType;
  loggedInUser?: any;
  scrollWholePage: boolean;
  noScrollbarGutters?: boolean;
  fitContent?: boolean;
  onReady?: () => void;
  onMessageReceived?: (data: any, event: MessageEvent) => void;
  onKeyDown?: (event: KeyboardEvent) => void;
  onKeyUp?: (event: KeyboardEvent) => void;
  onWillNavigate?: (to: string | number, queryParams?: Record<string, any>) => false | void | null | undefined;
  onDidNavigate?: (to: string | number, queryParams?: Record<string, any>) => void;
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
  persistTheme?: boolean;
  toneStorageKey?: string;
  themeStorageKey?: string;
  applyDefaultContentPadding?: boolean;
  registerComponentApi?: RegisterComponentApiFn;
  footerSticky?: boolean;
};

export const defaultProps: Pick<
  Props,
  | "scrollWholePage"
  | "noScrollbarGutters"
  | "fitContent"
  | "defaultTone"
  | "defaultTheme"
  | "autoDetectTone"
  | "persistTheme"
  | "toneStorageKey"
  | "themeStorageKey"
> = {
  scrollWholePage: true,
  noScrollbarGutters: false,
  fitContent: false,
  defaultTone: undefined,
  defaultTheme: undefined,
  autoDetectTone: false,
  persistTheme: false,
  toneStorageKey: "appTone",
  themeStorageKey: "appTheme",
};

const VALID_LAYOUTS: AppLayoutType[] = [
  "vertical",
  "vertical-sticky",
  "vertical-full-header",
  "horizontal",
  "horizontal-sticky",
  "condensed",
  "condensed-sticky",
  "desktop",
];

export const App = memo(function App({
  children,
  style = EMPTY_OBJECT,
  layout,
  loggedInUser,
  scrollWholePage = defaultProps.scrollWholePage,
  noScrollbarGutters = defaultProps.noScrollbarGutters,
  fitContent = defaultProps.fitContent,
  onReady = noop,
  onMessageReceived = noop,
  onKeyDown = noop,
  onKeyUp = noop,
  onWillNavigate,
  onDidNavigate,
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
  persistTheme = defaultProps.persistTheme,
  toneStorageKey = defaultProps.toneStorageKey,
  themeStorageKey = defaultProps.themeStorageKey,
  renderChild,
  name,
  className,
  classes,
  applyDefaultContentPadding,
  registerComponentApi,
  footerSticky = true,
  ...rest
}: Props) {
  const { getThemeVar } = useTheme();
  const { setActiveThemeTone, setActiveThemeId, activeThemeTone, activeThemeId, themes } = useThemes();
  const mounted = useRef(false);

  // Validate and sanitize layout input with explicit validation
  const layoutWithDefault = layout || getThemeVar("layout-App") || "condensed-sticky";
  const sanitized = layoutWithDefault.trim().replace(/[\u2013\u2014\u2011]/g, "-");
  const normalized = sanitized || "condensed-sticky";

  if (!VALID_LAYOUTS.includes(normalized as AppLayoutType)) {
    console.error(
      `App: layout type not supported: ${normalized}. Falling back to "condensed-sticky". Valid layouts: ${VALID_LAYOUTS.join(", ")}`,
    );
  }

  const safeLayout = VALID_LAYOUTS.includes(normalized as AppLayoutType)
    ? (normalized as AppLayoutType)
    : "condensed-sticky";
  const appContext = useAppContext();
  const { setLoggedInUser, setNavigationHandlers, mediaSize, forceRefreshAnchorScroll, appGlobals } = appContext;
  const hasRegisteredHeader = header !== undefined;

  // Check if NavPanel exists and is actually displayed
  // navPanel is null when the 'when' condition evaluates to false
  // navPanelDef !== undefined means a NavPanel is defined in the markup
  // navPanel !== null means the NavPanel actually rendered (when condition is true)
  const navPanelActuallyRendered = navPanel !== null && navPanel !== undefined;
  const hasRegisteredNavPanel = navPanelDef !== undefined && navPanelActuallyRendered;

  useEffect(() => {
    setLoggedInUser(loggedInUser);
  }, [loggedInUser, setLoggedInUser]);

  // Set navigation event handlers
  useEffect(() => {
    if (setNavigationHandlers) {
      setNavigationHandlers(onWillNavigate, onDidNavigate);
    }
  }, [onWillNavigate, onDidNavigate, setNavigationHandlers]);

  // Initialize theme and tone settings
  useThemeInitialization({
    defaultTone,
    defaultTheme,
    autoDetectTone,
    persistTheme,
    toneStorageKey,
    themeStorageKey,
    setActiveThemeTone,
    setActiveThemeId,
  });

  // Persist tone and theme ID to localStorage whenever they change (when persistTheme is true).
  // Use writeLocalStorage so that storageTimestamp is updated and ChangeListener consumers are notified.
  useEffect(() => {
    if (!persistTheme) return;
    writeLocalStorage(toneStorageKey, activeThemeTone);
  }, [persistTheme, toneStorageKey, activeThemeTone]);

  useEffect(() => {
    if (!persistTheme) return;
    writeLocalStorage(themeStorageKey, activeThemeId);
  }, [persistTheme, themeStorageKey, activeThemeId]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      onMessageReceived?.(event.data, event);
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [onMessageReceived]);

  useDocumentKeydown((event: KeyboardEvent) => {
    onKeyDown?.(event);
  });

  useDocumentKeyup((event: KeyboardEvent) => {
    onKeyUp?.(event);
  });

  // Determine if NavPanel should be visible inline (not in drawer)
  // On large screens: always show inline
  // On small screens: show inline only if there's no header to contain the drawer button,
  // except for condensed layouts which always use the header for the drawer button
  const isCondensedLayout = safeLayout === "condensed" || safeLayout === "condensed-sticky";
  const navPanelVisible =
    hasRegisteredNavPanel &&
    (mediaSize.largeScreen || (!hasRegisteredHeader && !isCondensedLayout));

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
    // Non-sticky layouts with whole-page scroll don't need height compensation
    const needsHeightCompensation = !(
      scrollWholePage &&
      (safeLayout === "vertical" || safeLayout === "horizontal" || safeLayout === "condensed")
    );

    return {
      ...style,
      "--header-height": needsHeightCompensation ? `${headerSize.height}px` : "0px",
      "--footer-height": needsHeightCompensation ? `${footerSize.height}px` : "0px",
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

  const location = useLocation();
  const navigationType = useNavigationType();
  const [scrollRestorationEnabled, setScrollRestorationEnabled] = useState(false);
  const { drawerVisible, toggleDrawer, handleOpenChange, showDrawer, hideDrawer } = useDrawerState(
    location,
    navPanelVisible,
    safeLayout,
  );

  const [navPanelCollapsed, setNavPanelCollapsedState] = useState(false);
  const setNavPanelCollapsed = useCallback((collapsed: boolean) => {
    setNavPanelCollapsedState(collapsed);
  }, []);
  const toggleNavPanelCollapsed = useCallback(() => {
    setNavPanelCollapsedState((prev) => !prev);
  }, []);

  useIsomorphicLayoutEffect(() => {
    if (window.history.scrollRestoration !== "manual") {
      window.history.scrollRestoration = "manual";
    }

    if (scrollRestorationEnabled && navigationType === "POP") {
      const key = `xmlui_scroll_${location.key}`;
      const saved = sessionStorage.getItem(key);

      if (saved) {
        try {
          const { x, y } = JSON.parse(saved);

          requestAnimationFrame(() => {
            scrollContainerRef.current?.scrollTo({
              top: y,
              left: x,
              behavior: "instant",
            });
          });
          return;
        } catch (e) {
          // ignore error
        }
      }
    }
    if (navigationType !== "POP") {
      scrollContainerRef.current?.scrollTo({
        top: 0,
        left: 0,
        behavior: "instant", // Optional if you want to skip the scrolling animation
      });
    }
  }, [location.key, scrollRestorationEnabled, navigationType]);

  useEffect(() => {
    if (!scrollRestorationEnabled) return;
    const el = scrollContainerRef.current;
    if (!el) return;

    const saveScroll = debounce(() => {
      const key = `xmlui_scroll_${location.key}`;
      const pos = { x: el.scrollLeft, y: el.scrollTop };
      sessionStorage.setItem(key, JSON.stringify(pos));
    }, 100);

    el.addEventListener("scroll", saveScroll);
    return () => {
      el.removeEventListener("scroll", saveScroll);
      saveScroll.cancel?.();
    };
  }, [scrollRestorationEnabled, location.key, scrollContainerRef]);

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

  const registerSubNavPanelSlot = useCallback((element: HTMLElement | null) => {
    setSubNavPanelSlot(element);
  }, []);

  const [linkMap, setLinkMap] = useState<Map<string, NavHierarchyNode>>(new Map());
  const registerLinkMap = useCallback((newLinkMap: Map<string, NavHierarchyNode>) => {
    setLinkMap(newLinkMap);
  }, []);

  const layoutContextValue = useAppLayoutContextValue({
    hasRegisteredNavPanel,
    hasRegisteredHeader,
    navPanelVisible,
    navPanelCollapsed,
    setNavPanelCollapsed,
    toggleNavPanelCollapsed,
    drawerVisible,
    showDrawer,
    hideDrawer,
    layout: safeLayout,
    logo,
    logoDark,
    logoLight,
    toggleDrawer,
    navPanelDef,
    logoContentDef,
    registerSubNavPanelSlot,
    subNavPanelSlot,
    scrollWholePage,
    isNested: appGlobals?.isNested || false,
    setScrollRestorationEnabled,
  });

  const linkInfoContextValue = useMemo(() => {
    return {
      linkMap,
      registerLinkMap,
    };
  }, [linkMap, registerLinkMap]);

  const wrapperBaseClasses = [
    className,
    classes?.[COMPONENT_PART_KEY],
    styles.appContainer,
    {
      [styles.scrollWholePage]: scrollWholePage && !fitContent,
      [styles.fitContent]: fitContent,
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

  const tableOfContentsEnabled = getThemeVar("tableOfContents") !== "false";
  const isBlogPageWithToc =
    tableOfContentsEnabled &&
    (location.pathname === "/" ||
      location.pathname === "/blog" ||
      location.pathname.startsWith("/blog/"));

  const pagesWrapperClasses = classnames(styles.pageContentContainer, {
    [styles.withDefaultContentPadding]: applyDefaultContentPadding,
    [styles.withToc]: isBlogPageWithToc,
  });

  const config = layoutConfigs[safeLayout];
  if (!config) {
    throw new Error("layout type not supported: " + safeLayout);
  }

  // Compute the AppHeader theme class so the auto-generated header (which bypasses
  // the component registry) still gets its CSS variables (e.g. --xmlui-height-AppHeader).
  const appHeaderThemeClass = useComponentThemeClass(AppHeaderMd);

  // Helper functions for rendering slots
  const renderHeaderSlot = () => (
    <Part partId="header">
      <AppHeaderSlot
        ref={headerSize.refCallback}
        className={classnames(
          config.showCondensedHeader && "app-layout-condensed",
          config.headerClasses,
        )}
      >
        {config.showCondensedHeader && !hasRegisteredHeader && hasRegisteredNavPanel && (
          <AppContextAwareAppHeader renderChild={renderChild} className={appHeaderThemeClass} />
        )}
        {header}
        {config.navPanelInHeader && navPanelVisible && (
          <AppNavPanelSlot>{navPanel}</AppNavPanelSlot>
        )}
      </AppHeaderSlot>
    </Part>
  );

  const renderFooterSlot = () => {
    // For desktop layout, always render footer wrapper to maintain flex structure
    // even if footer content is undefined
    if (safeLayout === "desktop") {
      return (
        <AppFooterSlot
          className={classnames({ [styles.nonSticky]: !footerSticky })}
          ref={footerSize.refCallback}
        >
          {footer}
        </AppFooterSlot>
      );
    }

    // For other layouts, only render if footer is defined
    return footer !== undefined ? (
      <AppFooterSlot
        className={classnames({ [styles.nonSticky]: !footerSticky })}
        ref={footerSize.refCallback}
      >
        {footer}
      </AppFooterSlot>
    ) : null;
  };

  const renderPagesSlot = () => (
    <AppPagesSlot ref={contentScrollRef}>
      <div className={pagesWrapperClasses}>{children}</div>
    </AppPagesSlot>
  );

  // Unified rendering based on layout configuration
  // When scrollWholePage is false, the container should not scroll (even for layouts with containerScrollRef)
  const shouldContainerScroll = config.containerScrollRef && scrollWholePage;

  const content = (
    <AppContainer
      className={classnames(wrapperBaseClasses, ...config.containerClasses, {
        [styles.navPanelCollapsed]:
          navPanelVisible && navPanelCollapsed && config.useVerticalFullHeaderStructure,
      })}
      style={styleWithHelpers}
      ref={shouldContainerScroll ? pageScrollRef : undefined}
      // Stable hook for embedding code: when fitContent is on, parent pages
      // (e.g. iframe hosts auto-resizing the embed) can find this element via
      // [data-xmlui-app-fit-content] without depending on hashed CSS module
      // class names.
      data-xmlui-app-fit-content={fitContent ? "true" : undefined}
      {...rest}
    >
      {config.useVerticalFullHeaderStructure ? (
        <>
          {renderHeaderSlot()}
          <div className={styles.mainContentRow}>
            {navPanelVisible && (
              <aside
                className={classnames(styles.navPanelWrapper, {
                  [styles.navPanelWrapperCollapsed]: navPanelCollapsed,
                })}
              >
                <AppNavPanelSlot>{navPanel}</AppNavPanelSlot>
              </aside>
            )}
            <main className={styles.mainContentArea}>{renderPagesSlot()}</main>
          </div>
          {renderFooterSlot()}
        </>
      ) : config.navPanelPosition === "side" ? (
        <>
          {navPanelVisible && (
            <AppNavPanelSlot
              className={navPanelCollapsed ? styles.navPanelWrapperCollapsed : undefined}
            >
              {navPanel}
            </AppNavPanelSlot>
          )}
          <AppContentSlot ref={pageScrollRef}>
            {renderHeaderSlot()}
            {renderPagesSlot()}
            {renderFooterSlot()}
          </AppContentSlot>
        </>
      ) : (
        <>
          {(header ||
            (config.showCondensedHeader && !hasRegisteredHeader && hasRegisteredNavPanel) ||
            (config.navPanelInHeader && navPanelVisible)) &&
            renderHeaderSlot()}
          {renderPagesSlot()}
          {renderFooterSlot()}
        </>
      )}
    </AppContainer>
  );

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
});

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

function useThemeInitialization({
  defaultTone,
  defaultTheme,
  autoDetectTone,
  persistTheme,
  toneStorageKey,
  themeStorageKey,
  setActiveThemeTone,
  setActiveThemeId,
}: {
  defaultTone?: string;
  defaultTheme?: string;
  autoDetectTone: boolean;
  persistTheme: boolean;
  toneStorageKey: string;
  themeStorageKey: string;
  setActiveThemeTone: (tone: "dark" | "light") => void;
  setActiveThemeId: (id: string) => void;
}) {
  const mounted = useRef(false);

  // Initial theme and tone setup - runs once on mount.
  // useLayoutEffect fires synchronously before the browser paints, preventing
  // a flash where the default tone/theme is visible before the stored values load.
  // NOTE: the stored tone/theme are pre-applied at the ThemeProvider level
  // (via AppWrapper's resolveStoredTheme helper), so this effect is mainly a
  // safety net for edge cases where that synchronous read is unavailable.
  useLayoutEffect(() => {
    if (mounted.current) return;
    mounted.current = true;

    // Resolve tone: persisted value wins, then explicit defaultTone, then auto-detect
    let resolvedTone: "dark" | "light" | undefined;

    if (persistTheme) {
      try {
        const stored = localStorage.getItem(toneStorageKey);
        if (stored !== null) {
          const parsed = JSON.parse(stored);
          if (parsed === "dark" || parsed === "light") {
            resolvedTone = parsed;
          }
        }
      } catch {
        // Corrupt value — fall through to other strategies
      }
    }

    if (!resolvedTone) {
      if (defaultTone === "dark" || defaultTone === "light") {
        resolvedTone = defaultTone;
      } else if (autoDetectTone) {
        const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        resolvedTone = systemPrefersDark ? "dark" : "light";
      }
    }

    if (resolvedTone) {
      setActiveThemeTone(resolvedTone);
    }

    // Resolve theme ID: persisted value wins, then explicit defaultTheme
    let resolvedTheme: string | undefined;
    if (persistTheme) {
      try {
        const stored = localStorage.getItem(themeStorageKey);
        if (stored !== null) {
          const parsed = JSON.parse(stored);
          if (typeof parsed === "string" && parsed.length > 0) {
            resolvedTheme = parsed;
          }
        }
      } catch {
        // Corrupt value — fall through to defaultTheme
      }
    }
    if (!resolvedTheme && defaultTheme) {
      resolvedTheme = defaultTheme;
    }
    if (resolvedTheme) {
      setActiveThemeId(resolvedTheme);
    }

    return () => {
      mounted.current = false;
    };
  }, [defaultTone, defaultTheme, autoDetectTone, persistTheme, toneStorageKey, themeStorageKey, setActiveThemeTone, setActiveThemeId]);

  // Listen for system theme changes when autoDetectTone is enabled
  useEffect(() => {
    if (!autoDetectTone || defaultTone) return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleThemeChange = (e: MediaQueryListEvent) => {
      const detectedTone = e.matches ? "dark" : "light";
      setActiveThemeTone(detectedTone);
    };

    mediaQuery.addEventListener("change", handleThemeChange);

    return () => {
      mediaQuery.removeEventListener("change", handleThemeChange);
    };
  }, [autoDetectTone, defaultTone, setActiveThemeTone]);
}

function useDrawerState(
  location: ReturnType<typeof useLocation>,
  navPanelVisible: boolean,
  safeLayout: AppLayoutType,
) {
  const [drawerVisible, setDrawerVisible] = useState(false);

  const toggleDrawer = useCallback(() => {
    setDrawerVisible((prev) => !prev);
  }, []);

  const handleOpenChange = useCallback((open: boolean) => {
    setDrawerVisible(open);
  }, []);

  // Close drawer when: 1) nav panel becomes visible (large screen), 2) location/layout changes
  // This ensures drawer is closed when it's no longer needed or context has changed
  useEffect(() => {
    setDrawerVisible(false);
  }, [navPanelVisible, location, safeLayout]);

  return {
    drawerVisible,
    toggleDrawer,
    handleOpenChange,
    showDrawer: useCallback(() => setDrawerVisible(true), []),
    hideDrawer: useCallback(() => setDrawerVisible(false), []),
  };
}

function useElementSizeObserver() {
  const ref = useRef<HTMLElement | null>(null);
  const [height, setHeight] = useState(0);

  const refCallback = useCallback((element: HTMLElement | null) => {
    ref.current = element;
  }, []);

  useResizeObserver(
    ref,
    useCallback((entries) => {
      const rect = entries?.[0]?.contentRect;
      if (rect) {
        setHeight(rect.height);
      }
    }, []),
  );

  return { refCallback, height };
}

interface LayoutConfig {
  containerClasses: string[];
  containerScrollRef?: boolean;
  headerClasses: string[];
  footerClasses: string[];
  navPanelPosition: "side" | "header" | "none";
  contentWrapperRef: "page" | "content";
  useVerticalFullHeaderStructure?: boolean;
  navPanelInHeader?: boolean;
  showCondensedHeader?: boolean;
}

const baseLayoutConfig: LayoutConfig = {
  containerClasses: [],
  headerClasses: [],
  footerClasses: [],
  navPanelPosition: "none",
  contentWrapperRef: "content",
};

const layoutConfigs: Record<AppLayoutType, LayoutConfig> = {
  vertical: {
    ...baseLayoutConfig,
    containerClasses: [styles.vertical],
    navPanelPosition: "side",
    contentWrapperRef: "page",
  },
  "vertical-sticky": {
    ...baseLayoutConfig,
    containerClasses: [styles.vertical, styles.sticky],
    headerClasses: [styles.sticky],
    navPanelPosition: "side",
    contentWrapperRef: "page",
  },
  "vertical-full-header": {
    ...baseLayoutConfig,
    containerClasses: [styles.verticalFullHeader],
    containerScrollRef: true,
    headerClasses: [styles.sticky],
    navPanelPosition: "side",
    useVerticalFullHeaderStructure: true,
  },
  horizontal: {
    ...baseLayoutConfig,
    containerClasses: [styles.horizontal],
    containerScrollRef: true,
    navPanelPosition: "header",
    navPanelInHeader: true,
  },
  "horizontal-sticky": {
    ...baseLayoutConfig,
    containerClasses: [styles.horizontal, styles.sticky],
    containerScrollRef: true,
    headerClasses: [styles.sticky],
    navPanelPosition: "header",
    navPanelInHeader: true,
  },
  condensed: {
    ...baseLayoutConfig,
    containerClasses: [styles.horizontal],
    containerScrollRef: true,
    showCondensedHeader: true,
  },
  "condensed-sticky": {
    ...baseLayoutConfig,
    containerClasses: [styles.horizontal, styles.sticky],
    containerScrollRef: true,
    headerClasses: [styles.sticky],
    showCondensedHeader: true,
  },
  desktop: {
    ...baseLayoutConfig,
    containerClasses: [styles.desktop],
  },
};

function useAppLayoutContextValue({
  hasRegisteredNavPanel,
  hasRegisteredHeader,
  navPanelVisible,
  navPanelCollapsed,
  setNavPanelCollapsed,
  toggleNavPanelCollapsed,
  drawerVisible,
  showDrawer,
  hideDrawer,
  layout,
  logo,
  logoDark,
  logoLight,
  toggleDrawer,
  navPanelDef,
  logoContentDef,
  registerSubNavPanelSlot,
  subNavPanelSlot,
  scrollWholePage,
  isNested,
  setScrollRestorationEnabled,
}: {
  hasRegisteredNavPanel: boolean;
  hasRegisteredHeader: boolean;
  navPanelVisible: boolean;
  navPanelCollapsed: boolean;
  setNavPanelCollapsed: (collapsed: boolean) => void;
  toggleNavPanelCollapsed: () => void;
  drawerVisible: boolean;
  showDrawer: () => void;
  hideDrawer: () => void;
  layout: AppLayoutType;
  logo?: string;
  logoDark?: string;
  logoLight?: string;
  toggleDrawer: () => void;
  navPanelDef?: ComponentDef;
  logoContentDef?: ComponentDef;
  registerSubNavPanelSlot: (element: any) => void;
  subNavPanelSlot: any;
  scrollWholePage: boolean;
  isNested: boolean;
  setScrollRestorationEnabled: (enabled: boolean) => void;
}): IAppLayoutContext {
  return useMemo<IAppLayoutContext>(
    () => ({
      hasRegisteredNavPanel,
      hasRegisteredHeader,
      navPanelVisible,
      navPanelCollapsed,
      setNavPanelCollapsed,
      toggleNavPanelCollapsed,
      drawerVisible,
      layout,
      logo,
      logoDark,
      logoLight,
      showDrawer,
      hideDrawer,
      toggleDrawer,
      navPanelDef,
      logoContentDef,
      registerSubNavPanelSlot,
      subNavPanelSlot,
      scrollWholePage,
      isFullVerticalWidth: false,
      isNested,
      setScrollRestorationEnabled,
    }),
    [
      hasRegisteredNavPanel,
      hasRegisteredHeader,
      navPanelVisible,
      navPanelCollapsed,
      setNavPanelCollapsed,
      toggleNavPanelCollapsed,
      drawerVisible,
      layout,
      logo,
      logoDark,
      logoLight,
      showDrawer,
      hideDrawer,
      toggleDrawer,
      navPanelDef,
      logoContentDef,
      registerSubNavPanelSlot,
      subNavPanelSlot,
      scrollWholePage,
      isNested,
      setScrollRestorationEnabled,
    ],
  );
}
