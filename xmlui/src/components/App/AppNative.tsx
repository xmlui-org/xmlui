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
import { useLocation, useNavigationType } from "react-router-dom";
import { noop, debounce } from "lodash-es";
import classnames from "classnames";

import styles from "./App.module.scss";

import type { ComponentDef } from "../../abstractions/ComponentDefs";
import type { RenderChildFn, RegisterComponentApiFn } from "../../abstractions/RendererDefs";
import { useAppContext } from "../../components-core/AppContext";
import { useIsomorphicLayoutEffect, useResizeObserver } from "../../components-core/utils/hooks";
import { useTheme, useThemes } from "../../components-core/theming/ThemeContext";
import { useScrollbarWidth } from "../../components-core/utils/css-utils";
import { Sheet, SheetContent } from "./Sheet";
import { AppContextAwareAppHeader } from "../AppHeader/AppHeaderNative";
import type { AppLayoutType, IAppLayoutContext } from "../App/AppLayoutContext";
import { AppLayoutContext } from "../App/AppLayoutContext";
import { SearchContextProvider } from "./SearchContext";
import type { NavHierarchyNode } from "../NavPanel/NavPanelNative";
import { LinkInfoContext } from "./LinkInfoContext";
import { EMPTY_OBJECT } from "../../components-core/constants";

// --- Slot Components ---

// --- Slot Components Factory ---

function createSlot<T extends HTMLElement = HTMLDivElement>(
  displayName: string,
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
  Slot.displayName = displayName;
  return Slot;
}

const AppContainer = createSlot("AppContainer");
const AppHeaderSlot = createSlot<HTMLElement>("AppHeaderSlot", styles.headerWrapper, "header");
const AppFooterSlot = createSlot("AppFooterSlot", styles.footerWrapper);
const AppNavPanelSlot = createSlot("AppNavPanelSlot", styles.navPanelWrapper);
const AppContentSlot = createSlot("AppContentSlot", styles.mainContentArea);
const AppPagesSlot = createSlot("AppPagesSlot", styles.pagesContainer);

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

/**
 * List of valid layout types for the App component.
 * Used for runtime validation to provide helpful error messages.
 */
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

/**
 * Determines whether the NavPanel should be visible inline (not in a drawer).
 *
 * @param hasNavPanel - Whether a NavPanel is defined and rendered
 * @param isLargeScreen - Whether the viewport is large enough for sidebar layout
 * @param hasHeader - Whether a header is registered
 * @param layout - Current layout type
 * @returns true if NavPanel should be shown inline, false if it should be in a drawer
 *
 * Logic:
 * - If no NavPanel exists, return false
 * - On large screens: always show inline
 * - On small screens: show inline only if there's no header to contain the drawer button,
 *   except for condensed layouts which always use the header for the drawer button
 */

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
  const { setLoggedInUser, mediaSize, forceRefreshAnchorScroll, appGlobals } = appContext;
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

  // Initialize theme and tone settings
  useThemeInitialization({
    defaultTone,
    defaultTheme,
    autoDetectTone,
    setActiveThemeTone,
    setActiveThemeId,
  });

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      onMessageReceived?.(event.data, event);
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [onMessageReceived]);

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
      saveScroll.flush();
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

  const registerSubNavPanelSlot = useCallback((element) => {
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
    styles.appContainer,
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

  const pagesWrapperClasses = classnames(styles.pageContentContainer, {
    [styles.withDefaultContentPadding]: applyDefaultContentPadding,
  });

  const config = layoutConfigs[safeLayout];
  if (!config) {
    throw new Error("layout type not supported: " + safeLayout);
  }

  // Helper functions for rendering slots
  const renderHeaderSlot = () => (
    <AppHeaderSlot
      ref={headerSize.refCallback}
      className={classnames(
        config.showCondensedHeader && "app-layout-condensed",
        config.headerClasses,
      )}
      data-part-header
    >
      {config.showCondensedHeader && !hasRegisteredHeader && hasRegisteredNavPanel && (
        <AppContextAwareAppHeader renderChild={renderChild} />
      )}
      {header}
      {config.navPanelInHeader && navPanelVisible && <AppNavPanelSlot>{navPanel}</AppNavPanelSlot>}
    </AppHeaderSlot>
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
        [styles.navPanelCollapsed]: navPanelVisible && navPanelCollapsed && config.useVerticalFullHeaderStructure,
      })}
      style={styleWithHelpers}
      ref={shouldContainerScroll ? pageScrollRef : undefined}
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
 * Custom hook to manage theme and tone initialization.
 * Handles initial theme setup and system theme preference detection.
 *
 * @param defaultTone - Initial tone preference ("dark", "light", or undefined for auto-detect)
 * @param defaultTheme - Initial theme ID to activate
 * @param autoDetectTone - Whether to auto-detect system theme preference
 * @param setActiveThemeTone - Function to set the active theme tone
 * @param setActiveThemeId - Function to set the active theme ID
 */
function useThemeInitialization({
  defaultTone,
  defaultTheme,
  autoDetectTone,
  setActiveThemeTone,
  setActiveThemeId,
}: {
  defaultTone?: string;
  defaultTheme?: string;
  autoDetectTone: boolean;
  setActiveThemeTone: (tone: "dark" | "light") => void;
  setActiveThemeId: (id: string) => void;
}) {
  const mounted = useRef(false);

  // Initial theme and tone setup - runs once on mount
  useEffect(() => {
    if (mounted.current) return;
    mounted.current = true;

    // Set tone: explicit defaultTone, or auto-detect from system
    if (defaultTone === "dark" || defaultTone === "light") {
      setActiveThemeTone(defaultTone as any);
    } else if (autoDetectTone) {
      const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const detectedTone = systemPrefersDark ? "dark" : "light";
      setActiveThemeTone(detectedTone);
    }

    // Set theme ID if provided
    if (defaultTheme) {
      setActiveThemeId(defaultTheme);
    }

    return () => {
      mounted.current = false;
    };
  }, [defaultTone, defaultTheme, autoDetectTone, setActiveThemeTone, setActiveThemeId]);

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

/**
 * Custom hook to manage drawer state with auto-close behavior.
 * Consolidates all drawer-related state updates in one place.
 */
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

/**
 * Custom hook for observing element size changes.
 * Returns a ref callback and the observed height.
 */
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

/**
 * Layout configuration interface defining how each layout variant should be rendered.
 */
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

/**
 * Base layout configuration with common defaults.
 */
const baseLayoutConfig: LayoutConfig = {
  containerClasses: [],
  headerClasses: [],
  footerClasses: [],
  navPanelPosition: "none",
  contentWrapperRef: "content",
};

/**
 * Layout configurations for all supported layout types.
 * Defines the structure and styling for each layout variant.
 */
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

/**
 * Custom hook for creating the App layout context value.
 * Encapsulates the logic for building the layout context and its dependencies.
 */
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
