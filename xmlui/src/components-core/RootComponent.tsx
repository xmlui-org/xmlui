import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BrowserRouter, HashRouter, MemoryRouter } from "react-router-dom";
import { useLocation, useNavigate } from "@remix-run/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { get } from "lodash-es";
import { Helmet, HelmetProvider } from "react-helmet-async";
import toast from "react-hot-toast";
import { enableMapSet } from "immer";

import type {
  ComponentDef,
  CompoundComponentDef,
  ComponentLike,
} from "@abstractions/ComponentDefs";
import type { MemoedVars } from "./abstractions/ComponentRenderer";
import type { ActionRendererDef } from "@abstractions/ActionDefs";
import type { ContainerComponentDef } from "./container/ContainerComponentDef";
import type { ApiInterceptorDefinition } from "@components-core/interception/abstractions";
import type { AppContextObject, MediaBreakpointType } from "@abstractions/AppContextDefs";
import type { ThemeDefinition, ThemeTone } from "@components-core/theming/abstractions";
import type { IAppStateContext } from "@components/App/AppStateContext";
import type { ComponentRendererDef } from "@abstractions/RendererDefs";

import { ErrorBoundary } from "./ErrorBoundary";
import ThemeProvider from "@components-core//theming/ThemeProvider";
import { renderRoot } from "./container/Container";
import { delay, formatFileSizeInBytes, getFileExtension } from "@components-core/utils/misc";
import { unPackTree } from "./utils/treeUtils";
import { EMPTY_OBJECT } from "@components-core/constants";
import { IconProvider } from "@components/IconProvider";
import { differenceInMinutes, isSameDay, isThisYear, isToday } from "date-fns";
import { AppContext } from "@components-core/AppContext";
import { useApiInterceptorContext } from "@components-core/interception/useApiInterceptorContext";
import { getVarKey } from "@components-core/theming/themeVars";
import { resetErrors } from "@components-core/reportEngineError";
import { useThemes } from "@components-core/theming/ThemeContext";
import { dateFunctions } from "./appContext/date-functions";
import { miscellaneousUtils } from "./appContext/misc-utils";
import { useComponentRegistry } from "@components/ViewComponentRegistryContext";
import { ThemeToneKeys } from "@components-core/theming/abstractions";
import { ComponentProvider } from "@components/ComponentProvider";
import {
  ConfirmationModalContextProvider,
  useConfirm,
} from "@components/ModalDialog/ConfirmationModalContextProvider";
import { AppStateContext } from "@components/App/AppStateContext";
import {
  useDocumentKeydown,
  useIsomorphicLayoutEffect,
  useMediaQuery,
  useIsInIFrame,
  useIsWindowFocused,
} from "./utils/hooks";
import { InspectorProvider } from "@components-core/InspectorContext";

// --- We want to enable the produce method of `immer` on Map objects
enableMapSet();

// =====================================================================================================================
/**
 * The properties of the root component
 */
export type RootComponentProps = {
  /**
   * View component definition
   */
  node: ComponentLike;

  /**
   * Display the component in preview mode?
   */
  previewMode?: boolean;
  servedFromSingleFile?: boolean;

  /**
   * The name used as the base name in the router definition
   */
  baseName?: string;

  /**
   * An object that describes how other external components extend the application with external components
   */
  contributes: ContributesDefinition;

  /**
   * Arbitrary set of global properties
   */
  globalProps?: GlobalProps;
  resources?: Record<string, string>;

  /**
   * Indicates that the root component represents a standalone application
   */
  standalone?: boolean;
  decorateComponentsWithTestId?: boolean;
  debugEnabled?: boolean;

  apiInterceptor?: ApiInterceptorDefinition;

  defaultTheme?: string;
  defaultTone?: ThemeTone;
  resourceMap?: Record<string, string>;
  sources?: Record<string, string>;
};

// =====================================================================================================================
/**
 * This type represents an arbitrary set of global properties (name and value pairs).
 */
export type GlobalProps = Record<string, any>;

// External contributions to the application (provided by a contributing package)
export type ContributesDefinition = {
  // Component definitions
  components?: ComponentRendererDef[];

  // Action definitions
  actions?: ActionRendererDef[];

  // Compound component definitions
  compoundComponents?: CompoundComponentDef[];

  // Themes extending the current ones
  themes?: ThemeDefinition[];
};

// =====================================================================================================================
/**
 * We use this object in the app context to represent the `QlientQuery` of the react-query package.
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

const Transforms = {
  unPackTree,
};

const DateUtils = {
  differenceInMinutes: (date1: string | Date, date2: string | Date) => {
    return differenceInMinutes(new Date(date1), new Date(date2));
  },
  isSameDay: (dateLeft: string | Date | undefined, dateRight: string | Date | undefined) => {
    // console.log("IS SAME DAY", dateLeft, dateRight);
    if (!dateLeft || !dateRight) {
      return false;
    }
    return isSameDay(new Date(dateLeft), new Date(dateRight));
  },
  isToday: (date: string | Date | number) => {
    return isToday(new Date(date));
  },
  isThisYear: (date: string | Date | number) => {
    return isThisYear(new Date(date));
  },
};

function signError(error: Error | string) {
  toast.error(typeof error === "string" ? error : error.message || "Something went wrong");
}

/**
 *  This React component implements the innermost part of the root component with access to the app and view state
 *  contexts.
 */
function RootContentComponent({
  rootContainer,
  routerBaseName,
  globalProps,
  standalone,
  decorateComponentsWithTestId,
  debugEnabled,
}: {
  rootContainer: ContainerComponentDef;
  routerBaseName: string;
  globalProps?: GlobalProps;
  standalone?: boolean;
  decorateComponentsWithTestId?: boolean;
  debugEnabled?: boolean;
}) {
  const [loggedInUser, setLoggedInUser] = useState(null);
  const componentRegistry = useComponentRegistry();
  const navigate = useNavigate();
  const { confirm } = useConfirm();
  const {
    activeThemeId,
    activeThemeTone,
    setActiveThemeId,
    setActiveThemeTone,
    availableThemeIds,
    root,
    toggleThemeTone,
  } = useThemes();

  useDocumentKeydown((event: KeyboardEvent) => {
    if (event.code === "KeyT" && event.altKey && event.ctrlKey && event.shiftKey) {
      setActiveThemeId(
        availableThemeIds[
          (availableThemeIds.indexOf(activeThemeId) + 1) % availableThemeIds.length
        ],
      );
    }
    if (event.code === "KeyO" && event.altKey && event.ctrlKey && event.shiftKey) {
      setActiveThemeTone(
        ThemeToneKeys[(ThemeToneKeys.indexOf(activeThemeTone) + 1) % ThemeToneKeys.length],
      );
    }
  });

  // --- We use the state variables to store the current media query values
  const [maxWidthPhone, setMaxWidthPhone] = useState("0");
  const [maxWidthPhoneLower, setMaxWidthPhoneLower] = useState("0");
  const [maxWidthLandscapePhone, setMaxWidthLandscapePhone] = useState("0");
  const [maxWidthLandscapePhoneLower, setMaxWidthLandscapePhoneLower] = useState("0");
  const [maxWidthTablet, setMaxWidthTablet] = useState("0");
  const [maxWidthTabletLower, setMaxWidthTabletLower] = useState("0");
  const [maxWidthDesktop, setMaxWidthDesktop] = useState("0");
  const [maxWidthDesktopLower, setMaxWidthDesktopLower] = useState("0");
  const [maxWidthLargeDesktop, setMaxWidthLargeDesktop] = useState("0");
  const [maxWidthLargeDesktopLower, setMaxWidthLargeDesktopLower] = useState("0");

  const createLowerDimension = (dimension: string) => {
    const match = dimension.match(/^(\d+)px$/);
    return match ? `${parseInt(match[1]) - 0.02}px` : "0";
  };

  // we sync with the theme variable value (because we can't use css var in media queries)
  useIsomorphicLayoutEffect(() => {
    const mwPhone = getComputedStyle(root!).getPropertyValue(getVarKey("media-max-width-phone"));
    setMaxWidthPhone(mwPhone);
    setMaxWidthPhoneLower(createLowerDimension(mwPhone));
    const mwLandscapePhone = getComputedStyle(root!).getPropertyValue(
      getVarKey("media-max-width-landscape-phone"),
    );
    setMaxWidthLandscapePhone(mwLandscapePhone);
    setMaxWidthLandscapePhoneLower(createLowerDimension(mwLandscapePhone));
    const mwTablet = getComputedStyle(root!).getPropertyValue(getVarKey("media-max-width-tablet"));
    setMaxWidthTablet(mwTablet);
    setMaxWidthTabletLower(createLowerDimension(mwTablet));
    const mwDesktop = getComputedStyle(root!).getPropertyValue(
      getVarKey("media-max-width-desktop"),
    );
    setMaxWidthDesktop(mwDesktop);
    setMaxWidthDesktopLower(createLowerDimension(mwDesktop));
    const mwLargeDesktop = getComputedStyle(root!).getPropertyValue(
      getVarKey("media-max-width-large-desktop"),
    );
    setMaxWidthLargeDesktop(mwLargeDesktop);
    setMaxWidthLargeDesktopLower(createLowerDimension(mwLargeDesktop));
  }, [activeThemeId, root]);

  // --- Set viewport size information
  const isViewportPhone = useMediaQuery(`(max-width: ${maxWidthPhoneLower})`);
  const isViewportLandscapePhone = useMediaQuery(
    `(min-width: ${maxWidthPhone}) and (max-width: ${maxWidthLandscapePhoneLower})`,
  );
  const isViewportTablet = useMediaQuery(
    `(min-width: ${maxWidthLandscapePhone}) and (max-width: ${maxWidthTabletLower})`,
  );
  const isViewportDesktop = useMediaQuery(
    `(min-width: ${maxWidthTablet}) and (max-width: ${maxWidthDesktopLower})`,
  );
  const isViewportLargeDesktop = useMediaQuery(
    `(min-width: ${maxWidthDesktop}) and (max-width: ${maxWidthLargeDesktopLower})`,
  );
  let vpSize: MediaBreakpointType = "xs";
  let vpSizeIndex = 0;
  const isViewportXlDesktop = useMediaQuery(`(min-width: ${maxWidthLargeDesktop})`);
  if (isViewportXlDesktop) {
    vpSize = "xxl";
    vpSizeIndex = 5;
  } else if (isViewportLargeDesktop) {
    vpSize = "xl";
    vpSizeIndex = 4;
  } else if (isViewportDesktop) {
    vpSize = "lg";
    vpSizeIndex = 3;
  } else if (isViewportTablet) {
    vpSize = "md";
    vpSizeIndex = 2;
  } else if (isViewportLandscapePhone) {
    vpSize = "sm";
    vpSizeIndex = 1;
  }

  const isInIFrame = useIsInIFrame();
  const isWindowFocused = useIsWindowFocused();
  const apiInterceptorContext = useApiInterceptorContext();

  const location = useLocation();
  const lastHash = useRef("");

  // listen to location change using useEffect with location as dependency
  // https://jasonwatmore.com/react-router-v6-listen-to-location-route-change-without-history-listen
  useEffect(() => {
    if (location.hash) {
      lastHash.current = location.hash.slice(1); // safe hash for further use after navigation
    }

    if (lastHash.current) {
      setTimeout(() => {
        document
          .getElementById(lastHash.current)
          ?.scrollIntoView({ behavior: "instant", block: "start" });
        lastHash.current = "";
      }, 100);
    }
  }, [location]);

  const Actions = useMemo(() => {
    const ret: Record<string, any> = {
      _SUPPORT_IMPLICIT_CONTEXT: true,
    };
    for (const [key, value] of componentRegistry.actionFunctions) {
      ret[key] = value;
    }
    return ret;
  }, [componentRegistry.actionFunctions]);

  const embed = useMemo(() => {
    return {
      isInIFrame: isInIFrame,
    };
  }, [isInIFrame]);

  const environment = useMemo(() => {
    return {
      isWindowFocused,
    };
  }, [isWindowFocused]);

  const mediaSize = useMemo(() => {
    return {
      phone: isViewportPhone,
      landscapePhone: isViewportLandscapePhone,
      tablet: isViewportTablet,
      desktop: isViewportDesktop,
      largeDesktop: isViewportLargeDesktop,
      xlDesktop: isViewportXlDesktop,
      smallScreen: isViewportPhone || isViewportLandscapePhone || isViewportTablet,
      largeScreen: !(isViewportPhone || isViewportLandscapePhone || isViewportTablet),
      size: vpSize,
      sizeIndex: vpSizeIndex,
    };
  }, [
    isViewportPhone,
    isViewportLandscapePhone,
    isViewportTablet,
    isViewportDesktop,
    isViewportLargeDesktop,
    isViewportXlDesktop,
    vpSize,
    vpSizeIndex,
  ]);

  const appGlobals = useMemo(() => {
    return globalProps ? { ...globalProps } : EMPTY_OBJECT;
  }, [globalProps]);

  const appContextValue = useMemo(() => {
    const ret: AppContextObject = {
      // --- Actions namespace
      Actions,
      
      // --- App-specific
      appGlobals,
      debugEnabled,
      decorateComponentsWithTestId,
      environment,
      mediaSize,
      queryClient,
      standalone,


      // --- Date-related
      ...dateFunctions,

      // --- File Utilities
      formatFileSizeInBytes,
      getFileExtension,

      // --- Navigation-related
      navigate,
      routerBaseName,

      // --- Notifications and dialogs
      confirm,
      signError,
      toast,

      // --- Theme-related
      activeThemeId,
      activeThemeTone,
      availableThemeIds,
      setTheme: setActiveThemeId,
      setThemeTone: setActiveThemeTone,
      toggleThemeTone,

      // --- User-related
      loggedInUser,
      setLoggedInUser,

      delay,
      Transforms,
      DateUtils,
      embed,
      apiInterceptorContext,
      getPropertyByPath: get,

      // --- Various utils
      ...miscellaneousUtils,
    };
    return ret;
  }, [
    Actions,
    activeThemeId,
    activeThemeTone,
    apiInterceptorContext,
    availableThemeIds,
    confirm,
    debugEnabled,
    decorateComponentsWithTestId,
    embed,
    environment,
    appGlobals,
    loggedInUser,
    mediaSize,
    navigate,
    routerBaseName,
    setActiveThemeId,
    setActiveThemeTone,
    standalone,
    get,
  ]);

  const [appState, setAppState] = useState<Record<string, Record<string, any>>>(EMPTY_OBJECT);
  const registerAppState = useCallback((bucket: string, initialValue: any) => {
    setAppState((prev) => {
      return { ...prev, [bucket]: initialValue };
    });
  }, []);

  const update = useCallback((bucket: string, patch: any) => {
    setAppState((prev) => {
      return {
        ...prev,
        [bucket]: {
          ...(prev[bucket] || {}),
          ...patch,
        },
      };
    });
  }, []);

  const appStateContextValue: IAppStateContext = useMemo(() => {
    return {
      registerAppState,
      appState,
      update,
    };
  }, [appState, registerAppState, update]);

  const memoedVars = useRef<MemoedVars>(new Map());

  return (
    <AppContext.Provider value={appContextValue}>
      <AppStateContext.Provider value={appStateContextValue}>
        {renderRoot(rootContainer, memoedVars)}
      </AppStateContext.Provider>
    </AppContext.Provider>
  );
}

// =====================================================================================================================
/**
 * This React component is intended to be the root component in a browser window. It handles the application state
 * changes, routing, and theming, provides an error boundary, and handles a few other aspects.
 */
const RootComponent = ({
  node,
  previewMode = false,
  servedFromSingleFile = false,
  baseName = "",
  contributes = EMPTY_OBJECT,
  globalProps,
  standalone,
  decorateComponentsWithTestId,
  debugEnabled,
  defaultTheme,
  defaultTone,
  resources,
  resourceMap,
  sources,
}: RootComponentProps) => {
  if (previewMode) {
    //to prevent leaking the meta items to the parent document, if it lives in an iframe (e.g. docs)
    HelmetProvider.canUseDOM = false;
  }

  const siteName = globalProps?.name || "XMLUI app";

  const dynamicChildren = (
    <HelmetProvider>
      <Helmet defaultTitle={siteName} titleTemplate={`%s | ${siteName}`} />
      <IconProvider>
        <ThemeProvider
          resourceMap={resourceMap}
          themes={contributes.themes}
          defaultTheme={defaultTheme}
          defaultTone={defaultTone}
          resources={resources}
        >
          <InspectorProvider sources={sources}>
            <ConfirmationModalContextProvider>
              <RootContentComponent
                rootContainer={node as ContainerComponentDef}
                routerBaseName={baseName}
                globalProps={globalProps}
                standalone={standalone}
                decorateComponentsWithTestId={decorateComponentsWithTestId}
                debugEnabled={debugEnabled}
              />
            </ConfirmationModalContextProvider>
          </InspectorProvider>
        </ThemeProvider>
      </IconProvider>
    </HelmetProvider>
  );

  const Router = previewMode
    ? MemoryRouter
    : servedFromSingleFile || (globalProps?.useHashBasedRouting ?? true)
      ? HashRouter
      : BrowserRouter;

  return (
    <React.StrictMode>
      <ErrorBoundary node={node} location={"root-outer"}>
        <QueryClientProvider client={queryClient}>
          {(typeof window === "undefined" || process.env.VITE_REMIX) && dynamicChildren}
          {!(typeof window === "undefined" || process.env.VITE_REMIX) && (
            <Router basename={baseName}>{dynamicChildren}</Router>
          )}
          {/*<ReactQueryDevtools initialIsOpen={true} />*/}
        </QueryClientProvider>
      </ErrorBoundary>
    </React.StrictMode>
  );
};

function AppRoot({
  apiInterceptor,
  contributes,
  node,
  decorateComponentsWithTestId,
  debugEnabled,
  defaultTheme,
  defaultTone,
  resources,
  globalProps,
  standalone,
  baseName,
  previewMode,
  servedFromSingleFile,
  resourceMap,
  sources,
}: RootComponentProps) {
  const rootNode = useMemo(() => {
    const themedRoot =
      (node as ComponentDef).type === "Theme"
        ? {
            ...node,
            props: {
              ...(node as ComponentDef).props,
              root: true,
            },
          }
        : {
            type: "Theme",
            props: {
              root: true,
            },
            children: [node],
          };
    return {
      type: "Container",
      children: [themedRoot],
      uses: [],
    };
  }, [node]);

  resetErrors();

  return (
    <ComponentProvider contributes={contributes}>
      <RootComponent
        resourceMap={resourceMap}
        apiInterceptor={apiInterceptor}
        node={rootNode as any}
        contributes={contributes}
        resources={resources}
        baseName={baseName}
        decorateComponentsWithTestId={decorateComponentsWithTestId}
        debugEnabled={debugEnabled}
        defaultTheme={defaultTheme}
        defaultTone={defaultTone}
        globalProps={globalProps}
        standalone={standalone}
        previewMode={previewMode}
        servedFromSingleFile={servedFromSingleFile}
        sources={sources}
      />
    </ComponentProvider>
  );
}

export default AppRoot;
