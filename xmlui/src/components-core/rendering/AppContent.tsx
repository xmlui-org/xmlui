import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { GlobalProps, queryClient } from "./AppRoot";
import { ContainerComponentDef } from "./ContainerComponent";
import { useDebugView } from "@components-core/DebugViewProvider";
import { useComponentRegistry } from "@components/ComponentRegistryContext";
import { useLocation, useNavigate } from "react-router-dom";
import { useConfirm } from "@components/ModalDialog/ConfirmationModalContextProvider";
import { useThemes } from "@components-core/theming/ThemeContext";
import {
  useDocumentKeydown,
  useIsInIFrame,
  useIsomorphicLayoutEffect,
  useIsWindowFocused,
  useMediaQuery,
} from "@components-core/utils/hooks";
import { ThemeToneKeys } from "@components-core/theming/abstractions";
import { getVarKey } from "@components-core/theming/themeVars";
import { AppContextObject, MediaBreakpointType } from "@abstractions/AppContextDefs";
import { useApiInterceptorContext } from "@components-core/interception/useApiInterceptorContext";
import { EMPTY_OBJECT, noop } from "@components-core/constants";
import { AppStateContext, IAppStateContext } from "@components/App/AppStateContext";
import { MemoedVars } from "@components-core/abstractions/ComponentRenderer";
import { renderChild } from "./renderChild";
import { AppContext } from "@components-core/AppContext";
import { delay, formatFileSizeInBytes, getFileExtension } from "@components-core/utils/misc";
import { differenceInMinutes, isSameDay, isThisYear, isToday } from "date-fns";
import { miscellaneousUtils } from "@components-core/appContext/misc-utils";
import { get } from "lodash-es";
import toast from "react-hot-toast";
import { version } from "../../../package.json";
import { dateFunctions } from "@components-core/appContext/date-functions";
import { mathFunctions } from "@components-core/appContext/math-function";

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
export function AppContent({
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
    statePartChanged: noop,
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
