import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BrowserRouter, HashRouter, MemoryRouter } from "react-router-dom";
import { useLocation, useNavigate } from "@remix-run/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { get } from "lodash-es";
import { Helmet, HelmetProvider } from "react-helmet-async";
import toast from "react-hot-toast";
import { enableMapSet } from "immer";

import type { ComponentDef, ComponentLike } from "@abstractions/ComponentDefs";
import type { MemoedVars } from "./abstractions/ComponentRenderer";
import type { ContainerComponentDef } from "./container/ContainerComponentDef";
import type { ApiInterceptorDefinition } from "@components-core/interception/abstractions";
import type { AppContextObject, MediaBreakpointType } from "@abstractions/AppContextDefs";
import type { ThemeTone } from "@components-core/theming/abstractions";
import type { IAppStateContext } from "@components/App/AppStateContext";

import { ErrorBoundary } from "./ErrorBoundary";
import ThemeProvider from "@components-core//theming/ThemeProvider";
import { delay, formatFileSizeInBytes, getFileExtension } from "@components-core/utils/misc";
import { EMPTY_OBJECT, noop } from "@components-core/constants";
import { IconProvider } from "@components/IconProvider";
import { differenceInMinutes, isSameDay, isThisYear, isToday } from "date-fns";
import { AppContext } from "@components-core/AppContext";
import { useApiInterceptorContext } from "@components-core/interception/useApiInterceptorContext";
import { getVarKey } from "@components-core/theming/themeVars";
import { resetErrors } from "@components-core/reportEngineError";
import { useThemes } from "@components-core/theming/ThemeContext";
import { dateFunctions } from "./appContext/date-functions";
import { miscellaneousUtils } from "./appContext/misc-utils";
import { useComponentRegistry } from "@components/ComponentRegistryContext";
import { ThemeToneKeys } from "@components-core/theming/abstractions";
import { ComponentProvider, ContributesDefinition } from "@components/ComponentProvider";
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
import StandaloneComponentManager from "./StandaloneComponentManager";
import { DebugViewProvider, useDebugView } from "./DebugViewProvider";
import { version } from "../../package.json";
import { mathFunctions } from "./appContext/math-function";
import { renderChild } from "./rendering/renderChild";

// --- We want to enable the produce method of `immer` on Map objects
enableMapSet();

// --- This type represents an arbitrary set of global properties (name
// --- and value pairs).
type GlobalProps = Record<string, any>;

// --- We use this object in the app context to represent the `QlientQuery`
// --- of the react-query package.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

// --- We pass these functions to the global app context
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

// --- We pass this funtion to the global app context
function signError(error: Error | string) {
  toast.error(typeof error === "string" ? error : error.message || "Something went wrong");
}

// --- The properties of the AppContent component
type AppContentProps = {
  rootContainer: ContainerComponentDef;
  routerBaseName: string;
  globalProps?: GlobalProps;
  standalone?: boolean;
  trackContainerHeight?: boolean;
  decorateComponentsWithTestId?: boolean;
  debugEnabled?: boolean;
};

/**
 *  This component wraps the entire app into a container with these particular
 *  responsibilities:
 *  - Managing the application state
 *  - Helping the app with viewport-related functionality (e.g., information
 *    of viewport size, supporting responsive apps)
 *  - Providing xmlui-defined methods and properties for apps, such as
 *    `activeThemeId`, `navigate`, `toast`, and many others.
 */
function AppContent({
  rootContainer,
  routerBaseName,
  globalProps,
  standalone,
  trackContainerHeight,
  decorateComponentsWithTestId,
  debugEnabled,
}: AppContentProps) {
  const [loggedInUser, setLoggedInUser] = useState(null);
  const debugView = useDebugView();
  const componentRegistry = useComponentRegistry();
  const navigate = useNavigate();
  const { confirm } = useConfirm();

  // --- Prepare theme-related variables. We will use them to manage the selected theme
  // --- and also pass them to the app context.
  const {
    activeThemeId,
    activeThemeTone,
    setActiveThemeId,
    setActiveThemeTone,
    availableThemeIds,
    root,
    toggleThemeTone,
  } = useThemes();

  // --- Handle special key combinations to change the theme and tone
  useDocumentKeydown((event: KeyboardEvent) => {
    // --- Alt + Ctrl + Shift + T changes the current theme
    if (event.code === "KeyT" && event.altKey && event.ctrlKey && event.shiftKey) {
      setActiveThemeId(
        availableThemeIds[
          (availableThemeIds.indexOf(activeThemeId) + 1) % availableThemeIds.length
        ],
      );
    }

    // --- Alt + Ctrl + Shift + O changes the current theme tone
    if (event.code === "KeyO" && event.altKey && event.ctrlKey && event.shiftKey) {
      setActiveThemeTone(
        ThemeToneKeys[(ThemeToneKeys.indexOf(activeThemeTone) + 1) % ThemeToneKeys.length],
      );
    }

    // --- Alt + Ctrl + Shift + S toggles the current state view
    if (event.code === "KeyS" && event.altKey && event.ctrlKey && event.shiftKey) {
      debugView.setDisplayStateView(!debugView.displayStateView);
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

  // --- We create a lower dimension value for the media query using a range
  const createLowerDimensionValue = (dimension: string) => {
    const match = dimension.match(/^(\d+)px$/);
    return match ? `${parseInt(match[1]) - 0.02}px` : "0";
  };

  // --- Whenever the size of the viewport changes, we update the values
  // --- related to viewport size
  const observer = useRef<ResizeObserver>();
  useIsomorphicLayoutEffect(() => {
    if (trackContainerHeight) {
      if (root && root !== document.body) {
        // --- We are already observing old element
        if (observer?.current) {
          observer.current.unobserve(root);
        }
        observer.current = new ResizeObserver((entries) => {
          root.style.setProperty("--containerHeight", entries[0].contentRect.height + "px");
        });
        if (observer.current) {
          observer.current.observe(root);
        }
      }
    }
    return () => {
      if (observer?.current) {
        observer.current.unobserve(root);
      }
    };
  }, [root, observer, trackContainerHeight]);

  // --- Whenever the application root DOM object or the active theme changes, we sync
  // --- with the theme variable values (because we can't use css var in media queries)
  useIsomorphicLayoutEffect(() => {
    const mwPhone = getComputedStyle(root!).getPropertyValue(getVarKey("media-max-width-phone"));
    setMaxWidthPhone(mwPhone);
    setMaxWidthPhoneLower(createLowerDimensionValue(mwPhone));
    const mwLandscapePhone = getComputedStyle(root!).getPropertyValue(
      getVarKey("media-max-width-landscape-phone"),
    );
    setMaxWidthLandscapePhone(mwLandscapePhone);
    setMaxWidthLandscapePhoneLower(createLowerDimensionValue(mwLandscapePhone));
    const mwTablet = getComputedStyle(root!).getPropertyValue(getVarKey("media-max-width-tablet"));
    setMaxWidthTablet(mwTablet);
    setMaxWidthTabletLower(createLowerDimensionValue(mwTablet));
    const mwDesktop = getComputedStyle(root!).getPropertyValue(
      getVarKey("media-max-width-desktop"),
    );
    setMaxWidthDesktop(mwDesktop);
    setMaxWidthDesktopLower(createLowerDimensionValue(mwDesktop));
    const mwLargeDesktop = getComputedStyle(root!).getPropertyValue(
      getVarKey("media-max-width-large-desktop"),
    );
    setMaxWidthLargeDesktop(mwLargeDesktop);
    setMaxWidthLargeDesktopLower(createLowerDimensionValue(mwLargeDesktop));
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

  // --- Collect information about the current environment
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

  // --- We collect all the actions defined in the app and pass them to the app context
  const Actions = useMemo(() => {
    const ret: Record<string, any> = {
      _SUPPORT_IMPLICIT_CONTEXT: true,
    };
    for (const [key, value] of componentRegistry.actionFunctions) {
      ret[key] = value;
    }
    return ret;
  }, [componentRegistry.actionFunctions]);

  // --- We collect information about app embedding and pass it to the app context
  const embed = useMemo(() => {
    return {
      isInIFrame: isInIFrame,
    };
  }, [isInIFrame]);

  // --- We collect information about the current environment and pass it to the app context
  const environment = useMemo(() => {
    return {
      isWindowFocused,
    };
  }, [isWindowFocused]);

  // --- We collect information about the current media size and pass it to the app context
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

  // --- We extract the global properties from the app configuration and pass them to the app context
  const appGlobals = useMemo(() => {
    return globalProps ? { ...globalProps } : EMPTY_OBJECT;
  }, [globalProps]);

  // --- We assemble the app context object form the collected information
  const appContextValue = useMemo(() => {
    const ret: AppContextObject = {
      // --- Engine-related
      version,

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

      // --- Math-related
      ...mathFunctions,

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
    toggleThemeTone,
    standalone,
  ]);

  // --- We prepare the helper infrastructure for the `AppState` component, which manages
  // --- app-wide state using buckets (state sections).
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

  const memoedVarsRef = useRef<MemoedVars>(new Map());
  const renderedRoot = renderChild({
    node: rootContainer,
    state: EMPTY_OBJECT,
    dispatch: noop,
    appContext: undefined,
    lookupAction: noop,
    lookupSyncCallback: noop,
    registerComponentApi: noop,
    renderChild: noop,
    stateFieldPartChanged: noop,
    cleanup: noop,
    memoedVarsRef,
  });

  return (
    <AppContext.Provider value={appContextValue}>
      <AppStateContext.Provider value={appStateContextValue}>
        {renderedRoot}
      </AppStateContext.Provider>
    </AppContext.Provider>
  );
}

type AppWrapperProps = {
  // --- The root node of the application definition; the internal
  // --- representation of the entire app to run
  node: ComponentLike;

  // --- If set to `true`, the app is displayed in preview mode (uses
  // --- different routing and changes some aspects of browser integration).
  previewMode?: boolean;

  // --- (seems obsolete) Indicates if the app is served from a single `index.html` file.
  servedFromSingleFile?: boolean;

  // --- The name used as the base name in the router definition
  routerBaseName?: string;

  // --- Apps can provide their custom (third-party) components, themes,
  // --- resources (and, in the future, other artifacts) used in the
  // --- application code and markup. This property contains these artifacts.
  contributes?: ContributesDefinition;

  // --- Apps can define global configuration values (connection strings,
  // --- titles, names, etc.) used within the app through the `appGlobals`
  // --- property. This property contains the values to pass to `appGlobals`.
  globalProps?: GlobalProps;

  // --- Apps may use external resources (images, text files, icons, etc.).
  // --- This property contains the dictionary of these resources.
  resources?: Record<string, string>;

  // --- This property indicates that the xmlui app runs in a standalone app.
  // --- Its value can be queried in the app code via the `standalone` global
  // --- property.
  standalone?: boolean;

  // --- This property indicates whether the app should track the height of
  // --- the app container. We created this property for the preview component
  // --- used in the documentation platform. It has no other use.
  trackContainerHeight?: boolean;

  // --- This property signs that we use the app in the end-to-end test
  // --- environment. Components should use their IDs as test IDs added to the
  // --- rendered DOM so that test cases can refer to the particular DOM elements.
  decorateComponentsWithTestId?: boolean;

  // --- This property signs that app rendering runs in debug mode. Components
  // --- may display additional information in the browser's console when this
  // --- property is set.
  debugEnabled?: boolean;

  // --- If the app has an emulated API, this property contains the
  // --- corresponding API endpoint descriptions.
  apiInterceptor?: ApiInterceptorDefinition;

  // --- The ID of the default theme to use when the app starts.
  defaultTheme?: string;

  // --- The default tone to use when the app starts ("light" or "dark").
  defaultTone?: ThemeTone;

  // --- The app can map resource names to URIs used to access a particular
  // --- resource. This dictionary contains these mappings.
  resourceMap?: Record<string, string>;

  // --- An app can display the source code for learning (and debugging)
  // --- purposes. This property is a dictionary of filename and file content
  // --- pairs.
  sources?: Record<string, string>;
};

/**
 * This React component is intended to be the root component in a browser window. It handles the application state
 * changes, routing, and theming, provides an error boundary, and handles a few other aspects.
 */
const AppWrapper = ({
  node,
  previewMode = false,
  servedFromSingleFile = false,
  routerBaseName: baseName = "",
  contributes = EMPTY_OBJECT,
  globalProps,
  standalone,
  trackContainerHeight,
  decorateComponentsWithTestId,
  debugEnabled,
  defaultTheme,
  defaultTone,
  resources,
  resourceMap,
  sources,
}: AppWrapperProps) => {
  if (previewMode) {
    //to prevent leaking the meta items to the parent document, if it lives in an iframe (e.g. docs)
    HelmetProvider.canUseDOM = false;
  }

  const siteName = globalProps?.name || "XMLUI app";
  const useHashBasedRouting = globalProps?.useHashBasedRouting ?? true;

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
              <AppContent
                rootContainer={node as ContainerComponentDef}
                routerBaseName={baseName}
                globalProps={globalProps}
                standalone={standalone}
                trackContainerHeight={trackContainerHeight}
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
    : servedFromSingleFile || useHashBasedRouting
      ? HashRouter
      : BrowserRouter;

  return (
    <React.StrictMode>
      <ErrorBoundary node={node} location={"root-outer"}>
        <QueryClientProvider client={queryClient}>
          {(typeof window === "undefined" || process.env.VITE_REMIX) && dynamicChildren}
          {!(typeof window === "undefined" || process.env.VITE_REMIX) && (
            <Router basename={Router === HashRouter ? undefined : baseName}>
              {dynamicChildren}
            </Router>
          )}
          {/*<ReactQueryDevtools initialIsOpen={true} />*/}
        </QueryClientProvider>
      </ErrorBoundary>
    </React.StrictMode>
  );
};

/**
 * This component runs the app in the context of the registered components
 * (including the core xmlui components and external ones passed to this
 * component.
 */
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
  trackContainerHeight,
  routerBaseName,
  previewMode,
  servedFromSingleFile,
  resourceMap,
  sources,
  componentManager,
}: AppWrapperProps & { componentManager?: StandaloneComponentManager }) {
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
      uid: "root",
      children: [themedRoot],
      uses: [],
    };
  }, [node]);

  resetErrors();

  return (
    <ComponentProvider contributes={contributes} componentManager={componentManager}>
      <DebugViewProvider debugConfig={globalProps?.debug}>
        <AppWrapper
          resourceMap={resourceMap}
          apiInterceptor={apiInterceptor}
          node={rootNode as ComponentLike}
          contributes={contributes}
          resources={resources}
          routerBaseName={routerBaseName}
          decorateComponentsWithTestId={decorateComponentsWithTestId}
          debugEnabled={debugEnabled}
          defaultTheme={defaultTheme}
          defaultTone={defaultTone}
          globalProps={globalProps}
          standalone={standalone}
          trackContainerHeight={trackContainerHeight}
          previewMode={previewMode}
          servedFromSingleFile={servedFromSingleFile}
          sources={sources}
        />
      </DebugViewProvider>
    </ComponentProvider>
  );
}

export default AppRoot;
