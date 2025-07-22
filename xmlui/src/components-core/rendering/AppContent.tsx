import type { ReactNode } from "react";
import {
  cloneElement,
  isValidElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { get } from "lodash-es";
import toast from "react-hot-toast";

import { version } from "../../../package.json";

import type { AppContextObject } from "../../abstractions/AppContextDefs";
import { useComponentRegistry } from "../../components/ComponentRegistryContext";
import { useConfirm } from "../../components/ModalDialog/ConfirmationModalContextProvider";
import { useThemes } from "../theming/ThemeContext";
import {
  useDocumentKeydown,
  useIsInIFrame,
  useIsomorphicLayoutEffect,
  useIsWindowFocused,
  useMediaQuery,
} from "../utils/hooks";
import { getVarKey } from "../theming/themeVars";
import { useApiInterceptorContext } from "../interception/useApiInterceptorContext";
import { EMPTY_OBJECT, noop } from "../constants";
import type { IAppStateContext } from "../../components/App/AppStateContext";
import { AppStateContext } from "../../components/App/AppStateContext";
import type { MemoedVars } from "../abstractions/ComponentRenderer";
import { delay, formatFileSizeInBytes, getFileExtension } from "../utils/misc";
import { useDebugView } from "../DebugViewProvider";
import { miscellaneousUtils } from "../appContext/misc-utils";
import { dateFunctions } from "../appContext/date-functions";
import { mathFunctions } from "../appContext/math-function";
import { AppContext } from "../AppContext";
import { renderChild } from "./renderChild";
import type { GlobalProps } from "./AppRoot";
import { queryClient } from "./AppRoot";
import type { ContainerWrapperDef } from "./ContainerWrapper";
import { useLocation, useNavigate } from "@remix-run/react";
import type { TrackContainerHeight } from "./AppWrapper";
import { ThemeToneKeys } from "../theming/utils";

// --- The properties of the AppContent component
type AppContentProps = {
  rootContainer: ContainerWrapperDef;
  routerBaseName: string;
  globalProps?: GlobalProps;
  standalone?: boolean;
  trackContainerHeight?: TrackContainerHeight;
  decorateComponentsWithTestId?: boolean;
  debugEnabled?: boolean;
  children?: ReactNode;
  onInit?: () => void;
};

function safeGetComputedStyle(root?: HTMLElement) {
  return getComputedStyle(root || document.body);
}

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
  children,
  onInit,
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
        if (trackContainerHeight === "auto") {
          root.style.setProperty("--containerHeight", "auto");
        } else {
          observer.current = new ResizeObserver((entries) => {
            root.style.setProperty("--containerHeight", entries[0].contentRect.height + "px");
          });
        }
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
    const mwPhone = safeGetComputedStyle(root).getPropertyValue(getVarKey("maxWidth-phone"));
    setMaxWidthPhone(mwPhone);
    setMaxWidthPhoneLower(createLowerDimensionValue(mwPhone));
    const mwLandscapePhone = safeGetComputedStyle(root).getPropertyValue(
      getVarKey("maxWidth-landscape-phone"),
    );
    setMaxWidthLandscapePhone(mwLandscapePhone);
    setMaxWidthLandscapePhoneLower(createLowerDimensionValue(mwLandscapePhone));
    const mwTablet = safeGetComputedStyle(root).getPropertyValue(getVarKey("maxWidth-tablet"));
    setMaxWidthTablet(mwTablet);
    setMaxWidthTabletLower(createLowerDimensionValue(mwTablet));
    const mwDesktop = safeGetComputedStyle(root).getPropertyValue(getVarKey("maxWidth-desktop"));
    setMaxWidthDesktop(mwDesktop);
    setMaxWidthDesktopLower(createLowerDimensionValue(mwDesktop));
    const mwLargeDesktop = safeGetComputedStyle(root).getPropertyValue(
      getVarKey("maxWidth-large-desktop"),
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
  let vpSize;
  let vpSizeIndex;
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
  } else if (isViewportPhone) {
    vpSize = "xs";
    vpSizeIndex = 0;
  }

  // --- Collect information about the current environment
  const isInIFrame = useIsInIFrame();
  const isWindowFocused = useIsWindowFocused();
  const apiInterceptorContext = useApiInterceptorContext();

  const location = useLocation();
  const lastHash = useRef("");
  const [scrollForceRefresh, setScrollForceRefresh] = useState(0);

  useEffect(() => {
    onInit?.();
  }, [onInit]);

  // useEffect(()=>{
  //   if(isWindowFocused){
  //     if ("serviceWorker" in navigator) {
  //       // Manually Activate the MSW again
  //       // console.log("REACTIVATE MSW");
  //       navigator.serviceWorker.controller?.postMessage("MOCK_ACTIVATE");
  //     }
  //   }
  // }, [isWindowFocused]);

  // --- Listen to location change using useEffect with location as dependency
  // https://jasonwatmore.com/react-router-v6-listen-to-location-route-change-without-history-listen
  // https://dev.to/mindactuate/scroll-to-anchor-element-with-react-router-v6-38op
  useEffect(() => {
    let hash = "";
    if (location.hash) {
      hash = location.hash.slice(1); // safe hash for further use after navigation
    }
    if (lastHash.current !== hash) {
      lastHash.current = hash;
      if (!location.state?.preventHashScroll) {
        const rootNode = root?.getRootNode();
        const scrollBehavior = "instant";
        requestAnimationFrame(() => {
          if (!rootNode) return;
          // --- If element is in shadow DOM (string-based type checking)
          // --- Check constructor.name to avoid direct ShadowRoot type dependency
          // --- More precise than duck typing, works reliably across different environments
          if (typeof ShadowRoot !== 'undefined' && rootNode instanceof ShadowRoot) {
            const el = (rootNode as any).getElementById(lastHash.current);
            if (!el) return;
            scrollAncestorsToView(el, scrollBehavior);
          } else {
          // --- If element is in light DOM
            document
              .getElementById(lastHash.current)
              ?.scrollIntoView({ behavior: scrollBehavior, block: "start" });
          }
        });
      }
    }
  }, [location, scrollForceRefresh, root]);

  const forceRefreshAnchorScroll = useCallback(() => {
    lastHash.current = "";
    setScrollForceRefresh((prev) => prev + 1);
  }, []);

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
      // String-based type checking: Use constructor.name to identify ShadowRoot
      // This avoids direct ShadowRoot type dependency while being more explicit than duck typing
      appIsInShadowDom: typeof ShadowRoot !== 'undefined' && root?.getRootNode() instanceof ShadowRoot,

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
      embed,
      apiInterceptorContext,
      getPropertyByPath: get,

      // --- Various utils
      ...miscellaneousUtils,

      forceRefreshAnchorScroll,
    };
    return ret;
  }, [
    Actions,
    appGlobals,
    debugEnabled,
    decorateComponentsWithTestId,
    environment,
    mediaSize,
    standalone,
    navigate,
    routerBaseName,
    confirm,
    activeThemeId,
    activeThemeTone,
    availableThemeIds,
    setActiveThemeId,
    setActiveThemeTone,
    toggleThemeTone,
    loggedInUser,
    embed,
    apiInterceptorContext,
    forceRefreshAnchorScroll,
    root,
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
        {!!children && isValidElement(renderedRoot)
          ? cloneElement(renderedRoot, null, children)
          : renderedRoot}
      </AppStateContext.Provider>
    </AppContext.Provider>
  );
}

// --- We pass this funtion to the global app context
function signError(error: Error | string) {
  toast.error(typeof error === "string" ? error : error.message || "Something went wrong");
}

/**
 * Scrolls all ancestors of the specified element into view up to the first shadow root the element is in.
 * @param target The element to scroll to, can be in the light or shadow DOM
 * @param scrollBehavior The scroll behavior
 */
function scrollAncestorsToView(target: HTMLElement, scrollBehavior?: ScrollBehavior) {
  const scrollables = getScrollableAncestors(target);
  // It's important to start from the outermost and work inwards.
  scrollables.reverse().forEach((container) => {
    // Compute the position of target relative to container
    const targetRect = target.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    // Scroll so that the target is visible in this container
    if (targetRect.top < containerRect.top || targetRect.bottom > containerRect.bottom) {
      // Only scroll vertically, add more logic for horizontal if needed
      const offset = targetRect.top - containerRect.top + container.scrollTop;
      container.scrollTo({ top: offset, behavior: scrollBehavior });
    }
    // Optionally handle horizontal scrolling similarly
  });

  function getScrollableAncestors(el: HTMLElement) {
    const scrollables: HTMLElement[] = [];
    let current = el;

    while (current) {
      let parent = current.parentElement;
      // If no parentElement, might be in shadow DOM
      if (!parent && current.getRootNode) {
        break;
        // NOTE: Disregard shadow DOM, because we will scroll everything otherwise
        /* const root = current.getRootNode();
        if (root && root instanceof ShadowRoot && root.host) {
          parent = root.host as (HTMLElement | null);
        } */
      }
      if (!parent) break;

      // Check if this parent is scrollable
      const style = getComputedStyle(parent);
      if (/(auto|scroll|overlay)/.test(style.overflow + style.overflowY + style.overflowX)) {
        scrollables.push(parent);
      }
      current = parent;
    }

    return scrollables;
  }
}
