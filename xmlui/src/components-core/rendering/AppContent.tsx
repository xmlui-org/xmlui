import type { ReactNode } from "react";
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { get } from "lodash-es";
import toast from "react-hot-toast";

import { version } from "../../../package.json";

import type { AppContextObject } from "../../abstractions/AppContextDefs";
import { useComponentRegistry } from "../../components/ComponentRegistryContext";
import { createPubSubService } from "../pubsub/PubSubService";
import { useConfirm } from "../../components/ModalDialog/ConfirmationModalContextProvider";
import { useTheme, useThemes } from "../theming/ThemeContext";
import {
  useDocumentKeydown,
  useIsInIFrame,
  useIsomorphicLayoutEffect,
  useIsWindowFocused,
  useMediaQuery,
} from "../utils/hooks";
import { getVarKey } from "../theming/themeVars";
import { useApiInterceptorContext } from "../interception/useApiInterceptorContext";
import { EMPTY_OBJECT } from "../constants";
import type { IAppStateContext } from "../../components/App/AppStateContext";
import { AppStateContext } from "../../components/App/AppStateContext";
import { createAppState, type AppState } from "./appState";
import { delay, formatFileSizeInBytes, getFileExtension } from "../utils/misc";
import { useDebugView } from "../DebugViewProvider";
import { miscellaneousUtils } from "../appContext/misc-utils";
import { dateFunctions } from "../appContext/date-functions";
import { mathFunctions } from "../appContext/math-function";
import { TableOfContentsContext } from "../TableOfContentsContext";
import { AppContext } from "../AppContext";
import type { GlobalProps } from "./AppRoot";
import { queryClient } from "./AppRoot";
import type { ContainerWrapperDef } from "./ContainerWrapper";
import { useLocation, useNavigate } from "react-router-dom";
import type { TrackContainerHeight } from "./AppWrapper";
import { ThemeToneKeys } from "../theming/utils";
import StandaloneComponent from "./StandaloneComponent";
import {
  safeStringify,
  simpleStringify,
  prefixLines,
  xsConsoleLog,
  pushXsLog,
  splicePreservingInteractions,
} from "../inspector/inspectorUtils";

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
  // Note: Startup trace initialization happens during render (near xsVerbose definition)
  // to ensure it's set before children mount and trigger useQuery fetches
  const [loggedInUser, setLoggedInUser] = useState(null);
  const debugView = useDebugView();
  const componentRegistry = useComponentRegistry();
  const navigate = useNavigate();
  const { confirm } = useConfirm();

  // --- Create PubSubService with stable reference across renders
  const pubSubServiceRef = useRef(createPubSubService());
  const pubSubService = pubSubServiceRef.current;

  // --- Prepare theme-related variables. We will use them to manage the selected theme
  // --- and also pass them to the app context.
  const {
    activeThemeId,
    activeThemeTone,
    setActiveThemeId,
    setActiveThemeTone,
    availableThemeIds,
    toggleThemeTone,
  } = useThemes();

  const { root } = useTheme();

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
  const tableOfContentsContext = useContext(TableOfContentsContext);

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
          if (typeof ShadowRoot !== "undefined" && rootNode instanceof ShadowRoot) {
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

  const scrollBookmarkIntoView = useCallback(
    (bookmarkId: string, smoothScrolling: boolean = false) => {
      if (tableOfContentsContext?.scrollToAnchor) {
        tableOfContentsContext.scrollToAnchor(bookmarkId, smoothScrolling);
      } else {
        // Fallback if TableOfContentsContext is not available
        const rootNode = root?.getRootNode();
        if (typeof ShadowRoot !== "undefined" && rootNode instanceof ShadowRoot) {
          const el = (rootNode as any).getElementById(bookmarkId);
          if (el) {
            scrollAncestorsToView(el, smoothScrolling ? "smooth" : "auto");
          }
        } else {
          document
            .getElementById(bookmarkId)
            ?.scrollIntoView({ behavior: smoothScrolling ? "smooth" : "auto", block: "start" });
        }
      }
    },
    [tableOfContentsContext, root],
  );

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

  // --- We prepare the helper infrastructure for the `AppState` component, which manages
  // --- app-wide state using buckets (state sections).
  const [appState, setAppState] = useState<Record<string, Record<string, any>>>(EMPTY_OBJECT);

  const xsVerbose = (appGlobals as any)?.xsVerbose === true;
  const xsLogMax = Number((appGlobals as any)?.xsVerboseLogMax ?? 200);

  // Initialize startup trace early during render, BEFORE children mount
  // This ensures DataLoader can capture the trace when useQuery triggers fetches
  if (xsVerbose && typeof window !== "undefined") {
    const w = window as any;
    if (!w._xsStartupTrace) {
      w._xsStartupTrace = `startup-${Date.now().toString(36)}`;
    }
    if (!w._xsCurrentTrace) {
      w._xsCurrentTrace = w._xsStartupTrace;
    }
  }

  const update = useCallback(
    (bucket: string, patch: any) => {
      setAppState((prev) => {
        const before = prev[bucket];
        const after = {
          ...(prev[bucket] || {}),
          ...patch,
        };
        const next = {
          ...prev,
          [bucket]: after,
        };

        if (xsVerbose && typeof window !== "undefined") {
          const w = window as any;
          const lastInteraction = w._xsLastInteraction;
          const traceId =
            w._xsCurrentTrace ||
            (!w._xsStartupComplete ? w._xsStartupTrace : undefined) ||
            (lastInteraction && Date.now() - lastInteraction.ts < 2000 ? lastInteraction.id : undefined);
          const perfTs = typeof performance !== "undefined" ? performance.now() : undefined;

          const beforeJson = simpleStringify(before);
          const afterJson = simpleStringify(after);
          const diffPretty =
            `path: AppState:${bucket}\n` +
            `${prefixLines(beforeJson, "- ")}\n` +
            `${prefixLines(afterJson, "+ ")}`;
          const diff = {
            path: `AppState:${bucket}`,
            type: "update" as const,
            before,
            after,
            beforeJson,
            afterJson,
            diffText: `path: AppState:${bucket}\n- ${beforeJson}\n+ ${afterJson}`,
            diffPretty,
          };

          // Defer log emission to avoid triggering state updates during render.
          setTimeout(() => {
            xsConsoleLog("state:changes", { uid: bucket, eventName: `AppState:${bucket}` });
            pushXsLog({
              ts: Date.now(),
              perfTs,
              kind: "state:changes",
              eventName: `AppState:${bucket}`,
              uid: bucket,
              traceId,
              diffPretty,
              diffJson: [diff],
            }, xsLogMax);
          }, 0);
        }

        return next;
      });
    },
    [xsVerbose, xsLogMax],
  );

  const appStateContextValue: IAppStateContext = useMemo(() => {
    return {
      appState,
      update,
    };
  }, [appState, update]);

  useEffect(() => {
    if (!xsVerbose || typeof document === "undefined") return;

    if (typeof window !== "undefined") {
      const w = window as any;
      if (!w._xsStartupTrace) {
        w._xsStartupTrace = `startup-${Date.now().toString(36)}`;
      }
      if (!w._xsCurrentTrace) {
        w._xsCurrentTrace = w._xsStartupTrace;
      }
    }

    // Track processed events using WeakSet - same event object = same physical user action
    const processedEvents = new WeakSet<Event>();
    let lastEventTraceId = "";

    const capture = (event: Event) => {
      if (typeof document !== "undefined") {
        const activeEl = document.activeElement as HTMLElement | null;
        const isInspectorEl = (el: Element | null | undefined) => {
          if (!el || !(el instanceof HTMLElement)) return false;
          return (
            el.closest?.('[data-testid="InspectorDialog"]') ||
            el.closest?.('[data-testid="InspectorFrame"]') ||
            el.getAttribute?.("data-testid") === "Inspector" ||
            el.getAttribute?.("data-testid") === "InspectorDialog" ||
            el.getAttribute?.("data-testid") === "InspectorFrame" ||
            (el instanceof HTMLIFrameElement &&
              el.src &&
              el.src.includes("/xs-diff.html"))
          );
        };

        if (isInspectorEl(activeEl)) {
          return;
        }

        const path = (event as any).composedPath?.() as EventTarget[] | undefined;
        if (path) {
          for (const p of path) {
            if (isInspectorEl(p as Element)) {
              return;
            }
          }
        } else if (isInspectorEl(event.target as Element)) {
          return;
        }
      }

      // Deduplicate using event object identity - same object = same physical event
      if (processedEvents.has(event)) {
        // Same event object seen again - just update trace context, don't log
        const w = window as any;
        if (lastEventTraceId) {
          w._xsCurrentTrace = lastEventTraceId;
        }
        return;
      }
      processedEvents.add(event);

      // Skip programmatic/synthetic events - only trace real user interactions
      // event.isTrusted is true for user-initiated events, false for dispatchEvent()/click()/etc.
      if (!event.isTrusted) {
        return;
      }

      const target = event.target as HTMLElement | null;

      const composedPath = (event as any).composedPath?.() as EventTarget[] | undefined;
      const elements = (composedPath || []).filter(
        (item): item is HTMLElement => item instanceof HTMLElement,
      );

      // Find element with data-inspectid (prefer) or data-testid
      const withInspectId = elements.find((el) => el.hasAttribute("data-inspectid"));
      const withTestId = elements.find((el) => el.hasAttribute("data-testid"));
      // Also try .closest() as fallback in case composedPath missed something
      const closestInspect = target?.closest?.("[data-inspectid]") as HTMLElement | null;
      const closestTestId = target?.closest?.("[data-testid]") as HTMLElement | null;

      const inspectEl = withInspectId || closestInspect;
      const testIdEl = withTestId || closestTestId;
      const nearest = inspectEl || testIdEl || target;

      const inspectId = inspectEl?.getAttribute?.("data-inspectid") || undefined;
      const testId = testIdEl?.getAttribute?.("data-testid") || undefined;
      const componentId = testId || inspectId;
      const textContent = nearest?.textContent?.trim();
      const text =
        textContent && textContent.length > 80 ? textContent.slice(0, 77) + "…" : textContent;

      // Find all testIds in the path from target to root, for better selector options
      const testIdsInPath: string[] = [];
      for (const el of elements) {
        const tid = el.getAttribute?.("data-testid");
        if (tid && !testIdsInPath.includes(tid)) {
          testIdsInPath.push(tid);
        }
      }

      // Build a selector path from the testId element to the clicked element
      // This helps with replay - e.g., "[data-testid='tree'] >> text=foo"
      let selectorPath: string | undefined;
      if (testIdEl && target && testIdEl !== target) {
        const targetText = target.textContent?.trim();
        if (targetText && targetText.length < 50) {
          selectorPath = `[data-testid="${testId}"] >> text=${targetText}`;
        }
      }

      // Also capture the target element's own testId if it has one (different from ancestor)
      const targetTestId = target?.getAttribute?.("data-testid") || undefined;

      // Capture ARIA role and accessible name for Playwright selector generation
      let ariaRole: string | undefined;
      let ariaName: string | undefined;
      let ariaTarget = target; // may walk up to nearest ancestor with a role
      if (target) {
        // Explicit role attribute takes precedence
        ariaRole = target.getAttribute?.("role") || undefined;
        // Infer implicit ARIA role from HTML tag
        if (!ariaRole) {
          const tag = target.tagName?.toLowerCase();
          if (tag === "button") ariaRole = "button";
          else if (tag === "a" && target.hasAttribute?.("href")) ariaRole = "link";
          else if (tag === "input") {
            const type = (target as HTMLInputElement).type;
            if (type === "checkbox") ariaRole = "checkbox";
            else if (type === "radio") ariaRole = "radio";
            else ariaRole = "textbox";
          }
          else if (tag === "select") ariaRole = "combobox";
          else if (tag === "textarea") ariaRole = "textbox";
        }
        // If no role found on target (e.g. click landed on svg/use inside a
        // menuitem, or div inside a table row), walk up to the nearest
        // ancestor with an explicit or implicit role
        if (!ariaRole) {
          let el = target.parentElement;
          for (let i = 0; i < 10 && el; i++) {
            // Check explicit role attribute first
            const parentRole = el.getAttribute?.("role");
            if (parentRole) {
              ariaRole = parentRole;
              ariaTarget = el;
              break;
            }
            // Check implicit role from HTML tag
            const parentTag = el.tagName?.toLowerCase();
            if (parentTag === "tr") { ariaRole = "row"; ariaTarget = el; break; }
            if (parentTag === "button") { ariaRole = "button"; ariaTarget = el; break; }
            if (parentTag === "a" && el.hasAttribute?.("href")) { ariaRole = "link"; ariaTarget = el; break; }
            el = el.parentElement;
          }
        }
        // Accessible name: aria-label > aria-labelledby > associated label > text content
        ariaName = ariaTarget.getAttribute?.("aria-label") || undefined;
        if (!ariaName && ariaTarget.getAttribute?.("aria-labelledby")) {
          const labelEl = document.getElementById(ariaTarget.getAttribute("aria-labelledby")!);
          ariaName = labelEl?.textContent?.trim() || undefined;
        }
        // For form inputs, resolve from the associated <label> element.
        // HTMLInputElement.labels uses the for/id association, which works
        // because ItemWithLabel passes the same inputId to both <label htmlFor>
        // and cloneElement(child, { id: inputId }).
        if (!ariaName && (ariaRole === "textbox" || ariaRole === "checkbox" ||
            ariaRole === "radio" || ariaRole === "combobox")) {
          const labels = (target as HTMLInputElement).labels;
          if (labels && labels.length > 0) {
            // Strip trailing markers like "*" (required) or "(Optional)"
            let labelText = labels[0].textContent?.trim();
            if (labelText) {
              labelText = labelText.replace(/\s*\*$/, "").replace(/\s*\(Optional\)$/, "").trim();
            }
            ariaName = labelText || undefined;
          }
          if (!ariaName) {
            // Fallback: walk up DOM to find nearest <label> in the component tree
            let el = target.parentElement;
            for (let i = 0; i < 10 && el && !ariaName; i++) {
              const label = el.querySelector("label");
              if (label) {
                let labelText = label.textContent?.trim();
                if (labelText) {
                  labelText = labelText.replace(/\s*\*$/, "").replace(/\s*\(Optional\)$/, "").trim();
                }
                ariaName = labelText || undefined;
              }
              el = el.parentElement;
            }
          }
        }
        if (!ariaName && (ariaRole === "button" || ariaRole === "link" || ariaRole === "menuitem")) {
          const btnText = ariaTarget.textContent?.trim();
          if (btnText && btnText.length < 50) ariaName = btnText;
        }
        // For table rows, use the original click target's text as the
        // accessible name (the row's full textContent is too long).
        // Only when the text is short enough to be a meaningful identifier
        // (long text means the click landed on a container, not a specific item)
        if (!ariaName && ariaRole === "row" && text && text.length < 50) {
          ariaName = text;
        }
      }

      const detail: Record<string, any> = {
        componentId,
        inspectId,
        targetTag: (target && target.tagName) || undefined,
        targetTestId: targetTestId !== testId ? targetTestId : undefined,
        testIdsInPath: testIdsInPath.length > 1 ? testIdsInPath : undefined,
        selectorPath,
        text,
        ariaRole,
        ariaName,
      };
      if (event instanceof MouseEvent) {
        detail.button = event.button;
      }
      if (event instanceof KeyboardEvent) {
        detail.key = event.key;
        detail.code = event.code;
        detail.ctrlKey = event.ctrlKey;
        detail.metaKey = event.metaKey;
        detail.shiftKey = event.shiftKey;
        detail.altKey = event.altKey;
      }

      const w = window as any;
      w._xsLogs = Array.isArray(w._xsLogs) ? w._xsLogs : [];

      // Try to resolve component info from _xsInspectMap (for inspect="true" components)
      // or _xsTestIdMap (for all components with testId/uid)
      let componentInfo =
        (inspectId && w._xsInspectMap ? w._xsInspectMap[inspectId] : undefined) ||
        (testId && w._xsTestIdMap ? w._xsTestIdMap[testId] : undefined);

      // Build descriptive component info
      // Priority: componentInfo > data-component-type attribute > testId > element attributes > tag name
      const componentType = componentInfo?.componentType || nearest?.getAttribute?.("data-component-type") || undefined;
      const textHint =
        detail.text && detail.text.length < 40 ? detail.text : undefined;
      let componentLabel =
        componentInfo?.componentLabel ||
        (componentInfo?.componentType ? componentInfo.componentType : undefined) ||
        testId ||
        componentId ||
        // For better context, show the element hierarchy if we only have tag names
        (detail.targetTag && nearest !== target && nearest?.tagName
          ? `${nearest.tagName.toLowerCase()} > ${detail.targetTag.toLowerCase()}`
          : undefined) ||
        detail.targetTag?.toLowerCase() ||
        "Unknown";
      // Prefer textHint when:
      // 1. componentLabel is a generic HTML tag (button, a, div, span)
      // 2. componentLabel matches the target tag name
      // 3. componentLabel is a PascalCase component type (like "NavLink") without componentInfo
      //    (indicating it's a fallback data-testid, not an explicit user-provided testId)
      const isPascalCaseComponentType = /^[A-Z][a-zA-Z]*$/.test(componentLabel);
      if (
        textHint &&
        (componentLabel === detail.targetTag?.toLowerCase() ||
          ["button", "a", "div", "span"].includes(componentLabel) ||
          (isPascalCaseComponentType && !componentInfo))
      ) {
        componentLabel = textHint;
      }
      if (typeof window !== "undefined") {
        const w = window as any;
        // First user interaction marks startup as complete
        // After this, handlers without a user interaction won't use the startup trace
        w._xsStartupComplete = true;
        if (w._xsCurrentTrace === w._xsStartupTrace) {
          w._xsCurrentTrace = undefined;
        }
      }

      let interactionId = `i-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
      if (w._xsPendingConfirmTrace) {
        interactionId = w._xsPendingConfirmTrace;
        w._xsPendingConfirmTrace = undefined;
      }
      const perfTs = typeof performance !== "undefined" ? performance.now() : undefined;
      const logEventTs = typeof event.timeStamp === "number" ? event.timeStamp : undefined;
      w._xsLastInteraction = { id: interactionId, ts: Date.now() };
      w._xsCurrentTrace = interactionId;
      lastEventTraceId = interactionId;
      w._xsLogs.push({
        ts: Date.now(),
        perfTs,
        eventTs: logEventTs,
        kind: "interaction",
        eventName: event.type,
        uid: componentId,
        traceId: interactionId,
        componentType,
        componentLabel,
        interaction: event.type,
        detail,
        text: safeStringify(detail),
      });
      if (Number.isFinite(xsLogMax) && xsLogMax > 0 && w._xsLogs.length > xsLogMax) {
        splicePreservingInteractions(w._xsLogs, xsLogMax);
      }
    };

    const types = ["click", "dblclick", "contextmenu", "keydown"];
    types.forEach((type) => document.addEventListener(type, capture, true));

    return () => {
      types.forEach((type) => document.removeEventListener(type, capture, true));
    };
  }, [xsVerbose, xsLogMax]);

  // --- Create AppState object with global state management functions
  const AppState = useMemo(() => createAppState(appStateContextValue), [appStateContextValue]);

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
      appIsInShadowDom:
        typeof ShadowRoot !== "undefined" && root?.getRootNode() instanceof ShadowRoot,

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
      scrollBookmarkIntoView,

      // --- AppState global state management
      AppState,

      // --- PubSub messaging
      pubSubService,
      publishTopic: pubSubService.publishTopic,
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
    scrollBookmarkIntoView,
    root,
    AppState,
    pubSubService,
  ]);

  return (
    <AppContext.Provider value={appContextValue}>
      <AppStateContext.Provider value={appStateContextValue}>
        <StandaloneComponent node={rootContainer}>{children}</StandaloneComponent>
      </AppStateContext.Provider>
    </AppContext.Provider>
  );
}

// --- We pass this funtion to the global app context
function signError(error: Error | string) {
  const message = typeof error === "string" ? error : error.message || "Something went wrong";
  toast.error(message);
  // Always log to console so Playwright page.on('console') can capture it
  console.error("[xmlui]", message);
  // Also log to _xsLogs when xsVerbose is active (same guard as ErrorBoundary).
  if (typeof window !== "undefined") {
    const w = window as any;
    if (Array.isArray(w._xsLogs)) {
      w._xsLogs.push({
        ts: Date.now(),
        perfTs: typeof performance !== "undefined" ? performance.now() : undefined,
        traceId: w._xsCurrentTrace,
        kind: "error:runtime",
        error: message,
        stack: error instanceof Error ? error.stack : undefined,
      });
    }
  }
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
