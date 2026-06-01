import type { ReactNode } from "react";
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { get } from "lodash-es";
import toast from "react-hot-toast";

import { version } from "../../../package.json";
import { AppError } from "../errors/app-error";

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
import { localStorageFunctions, setStorageChangeListener } from "../appContext/local-storage-functions";
import { createLog } from "../appContext/log";
import { AppUtilsNamespace, ClipboardNamespace, appCancel, createAppFetch, getAppEnvironment } from "../appContext/app-utils";
import { announceLiveRegion, GlobalLiveRegion } from "../../components/LiveRegion/LiveRegionReact";
import { SkipLink } from "../../components/SkipLink/SkipLinkReact";
import {
  compare,
  formatCurrency,
  formatList,
  formatNumber,
  formatRelativeTime,
  pluralRules,
  resolveLocale,
  isValidLocale,
  createBundleStore,
  normalizeLocaleBundle,
  translateMessage,
  xmluiEnglishBundle,
  type LocaleBundle,
} from "../i18n";
import { createScheduler, type ScheduledTask, type Scheduler } from "../scheduler";
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
  createLogEntry,
  pushTrace,
  popTrace,
  splicePreservingInteractions,
} from "../inspector/inspectorUtils";
import {
  collectComponentDefGraph,
  findCycles,
  formatCycle,
  cycleHash,
} from "../reactive-graph";
import {
  configureValidatorRegistry,
  registerValidator as registerValidatorImpl,
} from "../forms";
import { verifyVersioning } from "../versioning/verifier";
import { emitVersioningDiagnostics } from "../versioning/runtime";
import {
  setAuditPolicy,
  setStrictAudit,
  registerAuditSink as registerAuditSinkImpl,
  registerAuditHeuristic as registerAuditHeuristicImpl,
} from "../audit";

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

/** Decode URL-encoded hash (e.g. %20 → space) for getElementById; avoids breaking on malformed % sequences. */
function safeDecodeHash(hash: string): string {
  try {
    return decodeURIComponent(hash);
  } catch {
    return hash;
  }
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

  // Bumped to Date.now() on every localStorage mutation — allows markup to react
  // to storage changes via ChangeListener listenTo="{storageTimestamp}"
  const [storageTimestamp, setStorageTimestamp] = useState<number>(0);
  useEffect(() => {
    setStorageChangeListener(() => setStorageTimestamp(Date.now()));
    return () => setStorageChangeListener(null);
  }, []);

  // --- Navigation event handlers state
  const [navigationHandlers, setNavigationHandlersState] = useState<{
    onWillNavigate?: (to: string | number, queryParams?: Record<string, any>) => false | void | null | undefined;
    onDidNavigate?: (to: string | number, queryParams?: Record<string, any>) => void;
  }>({});

  const setNavigationHandlers = useCallback(
    (
      onWillNavigate?: (to: string | number, queryParams?: Record<string, any>) => false | void | null | undefined,
      onDidNavigate?: (to: string | number, queryParams?: Record<string, any>) => void,
    ) => {
      setNavigationHandlersState({ onWillNavigate, onDidNavigate });
    },
    [],
  );

  // --- App.onError handler state (plan #07 Step 2.1).
  // The handler is registered by `<App onError="...">` via setErrorHandler.
  // signError invokes it after toasting, passing an `AppError` and a
  // `preventDefault` shaped event payload. The handler may return `false` or
  // call `event.preventDefault()` to suppress the toast.
  const errorHandlerRef = useRef<((err: AppError, event: { preventDefault(): void; defaultPrevented: boolean }) => void | boolean | Promise<void | boolean>) | undefined>(undefined);
  const setErrorHandler = useCallback(
    (handler?: (err: AppError, event: { preventDefault(): void; defaultPrevented: boolean }) => void | boolean | Promise<void | boolean>) => {
      errorHandlerRef.current = handler;
    },
    [],
  );

  // --- App.errors reactive stream (FIFO buffer of recent AppErrors).
  // The buffer size is read from appGlobals.errorBufferSize (default 50).
  const [errors, setErrors] = useState<ReadonlyArray<AppError>>(() => Object.freeze([]) as ReadonlyArray<AppError>);

  const debugView = useDebugView();
  const componentRegistry = useComponentRegistry();
  const navigateRouter = useNavigate();
  const { confirm } = useConfirm();

  const location = useLocation();
  const previousLocationRef = useRef(location.pathname + location.search + location.hash);
  const isInitialRenderRef = useRef(true);
  const programmaticNavigationRef = useRef<string | undefined>();
  const [appLocaleOverride, setAppLocaleOverride] = useState<string | undefined>();
  const [userLocaleOverride, setUserLocaleOverride] = useState<string | undefined>();
  const [directionOverride, setDirectionOverride] = useState<"ltr" | "rtl" | "auto">("auto");
  const [schedulerOverride, setSchedulerOverride] = useState<"concurrent" | "fifo" | undefined>();
  const [maxQueuedPerTraceOverride, setMaxQueuedPerTraceOverride] = useState<number | undefined>();
  const bundleStoreRef = useRef(createBundleStore([xmluiEnglishBundle]));
  const [bundleVersion, setBundleVersion] = useState(0);
  const bundleSourcesRef = useRef(new Map<string, string>());

  // --- We extract the global properties from the app configuration and pass them to the app context.
  const appGlobals = useMemo(() => {
    return (globalProps ?? EMPTY_OBJECT) as Record<string, any>;
  }, [globalProps]);

  // --- W5-1 / plan #09 Step 0: wire the forms validator registry to this app's
  // strict-mode flag and trace sink. Re-runs whenever `appGlobals` identity
  // changes so `strictForms` toggling is observed without re-importing the
  // registry module.
  useMemo(() => {
    configureValidatorRegistry({
      isStrict: () => (appGlobals as any)?.strictForms === true,
      emit: (d) => {
        pushXsLog({ kind: "forms", ts: Date.now(), ...d });
      },
    });
  }, [appGlobals]);

  // --- Plan #15: wire `appGlobals.strictAuditLogging` and `appGlobals.auditPolicy`
  // into the audit pipeline. The policy is normalised by `setAuditPolicy()` and
  // the strict flag governs whether `audit-redaction-missing` /
  // `audit-policy-conflict` escalate to errors.
  useMemo(() => {
    setStrictAudit((appGlobals as any)?.strictAuditLogging === true);
    const declared = (appGlobals as any)?.auditPolicy;
    if (declared && typeof declared === "object") {
      setAuditPolicy({
        redact: Array.isArray(declared.redact) ? declared.redact : [],
        sample: declared.sample ?? {},
        retention: declared.retention ?? { bufferSize: 200, onOverflow: "drop-oldest" },
        sink: declared.sink,
      });
    }
  }, [appGlobals]);

  // W8-1: `strictDeterminism` default flipped from `false` to `true`.
  // Reads use `!== false` so undefined / missing keys resolve to strict.
  const strictDeterminism = appGlobals?.strictDeterminism !== false;
  const schedulerMode: "concurrent" | "fifo" =
    strictDeterminism
      ? "fifo"
      : (schedulerOverride ?? appGlobals?.scheduler ?? "concurrent");
  const maxQueuedPerTrace =
    maxQueuedPerTraceOverride ??
    (typeof appGlobals?.maxQueuedPerTrace === "number" ? appGlobals.maxQueuedPerTrace : 64);
  const schedulerRef = useRef<Scheduler | undefined>();
  const schedulerConfigRef = useRef<string>("");
  const schedulerConfigKey = `${schedulerMode}:${maxQueuedPerTrace}:${strictDeterminism}`;
  if (!schedulerRef.current || schedulerConfigRef.current !== schedulerConfigKey) {
    schedulerConfigRef.current = schedulerConfigKey;
    schedulerRef.current = createScheduler(schedulerMode, {
      maxQueuedPerTrace,
      strict: strictDeterminism,
      onDiagnostic: (diagnostic) => {
        pushXsLog({
          kind: "scheduler",
          ts: Date.now(),
          ...diagnostic,
        });
      },
    });
  }

  const setScheduler = useCallback((mode: "concurrent" | "fifo", options?: { maxQueuedPerTrace?: number }) => {
    setSchedulerOverride(mode);
    if (options?.maxQueuedPerTrace !== undefined) {
      setMaxQueuedPerTraceOverride(options.maxQueuedPerTrace);
    }
  }, []);

  const scheduleHandler = useCallback(
    (task: Omit<ScheduledTask, "enqueuedAt">) => {
      return schedulerRef.current!.enqueue({
        ...task,
        enqueuedAt: Date.now(),
      });
    },
    [],
  );

  // --- Wrapped navigate function that respects willNavigate/didNavigate events
  // Note: willNavigate only works for programmatic navigation (navigate(), Actions.navigate())
  // because we can await the async handler. Cannot work with Link clicks due to React Router limitations.
  // didNavigate fires for all navigation types (see useEffect below)
  //
  // Phase 2 hardening (Step 2.3): the only sanctioned way to open an external
  // tab from XMLUI markup. When `options.target === "_blank"`, navigate uses
  // `window.open(url, "_blank", "noopener,noreferrer")` — never bare
  // `window.open` — and emits a `kind: "navigate"` trace entry.
  const navigate = useCallback(
    async (to: any, options?: any) => {
      const { onWillNavigate } = navigationHandlers;

      // Extract queryParams if exists in options (for NavigateAction compatibility)
      const queryParams = options?.queryParams;
      const target = options?.target;

      // Remove queryParams + target from options before passing to navigateRouter
      const { queryParams: _qp, target: _t, ...navigateOptions } = options || {};

      // Call willNavigate handler if defined (only for programmatic navigation)
      if (onWillNavigate) {
        const result = await onWillNavigate(to, queryParams);
        // Cancel navigation if willNavigate returns false
        if (result === false) {
          return;
        }
      }

      // Step 2.3: target="_blank" opens an external tab via the audited helper.
      // Forces noopener,noreferrer so the new tab cannot reach back to window.opener.
      if (target === "_blank") {
        const href = typeof to === "string" ? to : (to?.pathname ?? "") + (to?.search ?? "") + (to?.hash ?? "");
        pushXsLog({
          kind: "navigate",
          ts: Date.now(),
          to: href,
          target: "_blank",
        });
        if (typeof window !== "undefined") {
          window.open(href, "_blank", "noopener,noreferrer");
        }
        return;
      }

      // Trace same-tab navigation as well so all routing flows are auditable.
      pushXsLog({
        kind: "navigate",
        ts: Date.now(),
        to: typeof to === "string" ? to : (to?.pathname ?? ""),
        target: target ?? "_self",
      });

      // Perform the actual navigation
      programmaticNavigationRef.current = typeof to === "string" ? to : (to?.pathname ?? "");
      navigateRouter(to, navigateOptions);

      // didNavigate will be fired by the useEffect that watches location changes
    },
    [navigateRouter, navigationHandlers],
  );

  // Fire didNavigate after any location change (works for all navigation types)
  useEffect(() => {
    // Skip firing didNavigate on initial render
    if (isInitialRenderRef.current) {
      isInitialRenderRef.current = false;
      return;
    }

    const currentPath = location.pathname + location.search + location.hash;
    const previousPath = previousLocationRef.current;

    if (currentPath !== previousPath) {
      const { onWillNavigate } = navigationHandlers;
      const isProgrammatic = programmaticNavigationRef.current === currentPath || programmaticNavigationRef.current === location.pathname;
      programmaticNavigationRef.current = undefined;

      if (
        onWillNavigate &&
        !isProgrammatic &&
        appGlobals?.guardOnPopState !== false
      ) {
        void Promise.resolve(onWillNavigate(currentPath, undefined)).then((result) => {
          if (result === false) {
            pushXsLog({
              kind: "navigate",
              ts: Date.now(),
              from: previousPath,
              to: currentPath,
              routingDiagnostic: {
                code: "guard-bypass-attempt",
                severity: appGlobals?.strictRouting !== false ? "error" : "warn",
                message: "Navigation was rejected by willNavigate after a browser-driven route change.",
              },
            });
            navigateRouter(previousPath, { replace: true });
          }
        });
      }

      previousLocationRef.current = currentPath;

      const { onDidNavigate } = navigationHandlers;
      if (onDidNavigate) {
        void onDidNavigate(currentPath, undefined);
      }
    }
  }, [appGlobals?.guardOnPopState, appGlobals?.strictRouting, location, navigateRouter, navigationHandlers]);

  // --- Plan #10 Step 2.1 — Anchor + form interception (opt-in).
  // When `appGlobals.interceptExternalNavigation === true`, same-origin
  // anchor clicks and same-origin form submissions are routed through
  // `appContext.navigate` so the `willNavigate` guard, per-page guards,
  // and the `kind:"navigate"` trace pipeline observe them. Cross-origin
  // links, modifier-key clicks, `target="_blank"`, and explicit
  // `data-xmlui-bypass-router` opt-outs are passed through unchanged.
  useEffect(() => {
    if (appGlobals?.interceptExternalNavigation !== true) return;
    if (typeof document === "undefined") return;

    const sameOrigin = (href: string): string | null => {
      try {
        const url = new URL(href, window.location.href);
        if (url.origin !== window.location.origin) return null;
        return url.pathname + url.search + url.hash;
      } catch {
        return null;
      }
    };

    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented) return;
      if (event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const target = event.target as Element | null;
      const anchor = target?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!anchor) return;
      if (anchor.dataset.xmluiBypassRouter !== undefined) return;
      const targetAttr = anchor.getAttribute("target");
      if (targetAttr && targetAttr !== "_self") return;
      if (anchor.hasAttribute("download")) return;
      if (anchor.getAttribute("rel")?.includes("external")) return;
      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("javascript:") || href.startsWith("mailto:") || href.startsWith("tel:")) {
        return;
      }
      const path = sameOrigin(href);
      if (!path) return;
      event.preventDefault();
      void navigate(path);
    };

    const onSubmit = (event: SubmitEvent) => {
      if (event.defaultPrevented) return;
      const form = event.target as HTMLFormElement | null;
      if (!form || form.tagName !== "FORM") return;
      if (form.dataset.xmluiBypassRouter !== undefined) return;
      const method = (form.method || "get").toLowerCase();
      if (method !== "get") return;
      if (form.target && form.target !== "_self") return;
      const action = form.getAttribute("action") || window.location.pathname;
      const path = sameOrigin(action);
      if (!path) return;
      const params = new URLSearchParams(new FormData(form) as any);
      const query = params.toString();
      const url = path.split("?")[0] + (query ? `?${query}` : "");
      event.preventDefault();
      void navigate(url);
    };

    document.addEventListener("click", onClick, true);
    document.addEventListener("submit", onSubmit, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("submit", onSubmit, true);
    };
  }, [appGlobals?.interceptExternalNavigation, navigate]);

  // --- Create PubSubService with stable reference across renders
  const pubSubServiceRef = useRef(createPubSubService());
  const pubSubService = pubSubServiceRef.current;

  // --- Prepare theme-related variables. We will use them to manage the selected theme
  // --- and also pass them to the app context.
  const {
    activeThemeId,
    activeThemeTone,
    activeTheme,
    setActiveThemeId,
    setActiveThemeTone,
    availableThemeIds,
    toggleThemeTone,
  } = useThemes();

  const { root, getThemeVar: themeGetThemeVar } = useTheme();

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

  const prevVpRef = useRef<{ size: string; index: number }>({ size: "lg", index: 3 });

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
  } else {
    vpSize = prevVpRef.current.size;
    vpSizeIndex = prevVpRef.current.index;
  }

  prevVpRef.current = { size: vpSize, index: vpSizeIndex };

  // --- Collect information about the current environment
  const isInIFrame = useIsInIFrame();
  const isWindowFocused = useIsWindowFocused();
  const apiInterceptorContext = useApiInterceptorContext();

  const lastHash = useRef("");
  const [scrollForceRefresh, setScrollForceRefresh] = useState(0);
  const tableOfContentsContext = useContext(TableOfContentsContext);
  const isNestedApp = globalProps?.isNested;

  useEffect(() => {
    onInit?.();
  }, [onInit]);

  // --- Reactive cycle detection — Plan #03.
  // --- Phase 1 (W2-7) probe: runs once per AppContent mount, after children
  // --- have been mounted; detects cycles in the var/function/loader
  // --- dependency graph and emits one `kind:"reactive-cycle"` trace entry
  // --- per unique cycle.
  // --- Phase 2 (W6-7) enforcement: when
  // --- `appGlobals.strictReactiveGraph === true`, `warn`-severity hits
  // --- escalate to `severity:"error"`, fire a `console.error`, and surface
  // --- a single dismissable `toast.error()` per cycle so authors see the
  // --- failure even with the inspector closed. `info`-severity
  // --- (pure-conditional) cycles never toast and never escalate; they
  // --- continue to log at info level only.
  const reportedCyclesRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    if (!rootContainer) return;
    let hits;
    try {
      const graph = collectComponentDefGraph(rootContainer);
      hits = findCycles(graph);
    } catch (err) {
      // Analyzer must never break the app — swallow and stop.
      if (typeof console !== "undefined" && console.warn) {
        console.warn("[xmlui] reactive-graph analyzer failed:", err);
      }
      return;
    }
    if (!hits || hits.length === 0) return;

    // W8-1: `strictReactiveGraph` default flipped from `false` to `true`.
    const strict = (appGlobals as any)?.strictReactiveGraph !== false;
    const seen = reportedCyclesRef.current;

    for (const hit of hits) {
      const id = cycleHash(hit);
      if (seen.has(id)) continue;
      seen.add(id);

      const message = formatCycle(hit);
      const hitSeverity = hit.severity ?? "warn";
      // Strict mode escalates `warn` (true cycles) to `error`; `info`
      // (pure-conditional) hits keep their original severity so they
      // never block a build / pop a toast.
      const severity =
        strict && hitSeverity === "warn" ? "error" : hitSeverity;

      // Always make the cycle visible in the dev console so it shows up
      // even when xsVerbose is off (this is the warn-mode probe).
      if (typeof console !== "undefined") {
        if (severity === "error" && console.error) {
          console.error(`[xmlui]\n${message}`);
        } else if (console.warn) {
          console.warn(`[xmlui]\n${message}`);
        }
      }

      // Phase 2 (W6-7): strict-mode one-shot toast so the author sees
      // the failure even with the inspector closed. Dedup is by `cycleId`
      // (already enforced by `seen` above — each cycle toasts at most once
      // per session).
      if (severity === "error") {
        try {
          toast.error(message, { id: `reactive-cycle:${id}`, duration: 8000 });
        } catch {
          // Toast container may not be mounted yet — silent fallback;
          // the console.error and trace entry above are authoritative.
        }
      }

      // And push to the trace pipeline so the Inspector tab can list it.
      pushXsLog(
        createLogEntry("reactive-cycle", {
          severity,
          cycleId: id,
          cycle: hit.cycle,
          nodes: hit.nodes.map((n) => ({
            id: n.id,
            kind: n.kind,
            uri: n.uri,
            range: n.range,
          })),
          message,
        }),
        xsLogMax,
      );
    }
    // Intentionally not depending on `appGlobals` — we want one detection per
    // mount, not per appGlobals identity change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rootContainer]);

  // --- Plan #12 Step 1.2 (parse-time hook): walk the mounted component tree
  // once and emit `VersioningDiagnostic` entries via the runtime echo. The
  // echo dedups per-session so repeated mounts (e.g. route changes that
  // remount the same node) do not flood the trace. Strict mode escalates
  // `removed-prop` and `internal-component-use` only.
  useEffect(() => {
    if (!rootContainer || !componentRegistry) return;
    try {
      const strict = (appGlobals as any)?.strictVersioning === true;
      const diags = verifyVersioning(
        rootContainer as any,
        (name: string) =>
          componentRegistry.lookupComponentRenderer(name)?.descriptor as any,
        { strict },
      );
      if (diags.length > 0) {
        emitVersioningDiagnostics(diags);
      }
    } catch (err) {
      if (typeof console !== "undefined" && console.warn) {
        console.warn("[xmlui] versioning verifier failed:", err);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rootContainer, componentRegistry]);

  // useEffect(()=>{
  //   if(isWindowFocused){
  //     if ("serviceWorker" in navigator) {
  //       // Manually Activate the MSW again
  //       // console.log("REACTIVATE MSW");
  //       navigator.serviceWorker.controller?.postMessage("MOCK_ACTIVATE");
  //     }
  //   }
  // }, [isWindowFocused]);

  // --- For nested apps (which use MemoryRouter), listen to MemoryRouter location changes
  // --- This allows xmlui-pg examples to respond to hash navigation within the nested app
  useEffect(() => {
    if (!isNestedApp) return;

    const hash = location.hash.slice(1); // Remove the '#' prefix
    if (hash && lastHash.current !== hash) {
      lastHash.current = hash;
      const rootNode = root?.getRootNode();
      const scrollBehavior = "smooth";
      requestAnimationFrame(() => {
        if (!rootNode) return;
        if (typeof ShadowRoot !== "undefined" && rootNode instanceof ShadowRoot) {
          const id = safeDecodeHash(hash);
          // ShadowRoot doesn't have getElementById; use querySelector instead
          const el = (rootNode as ShadowRoot).querySelector(`#${CSS.escape(id)}`);
          if (el) {
            // For nested apps, only scroll within the shadow DOM (don't cross into host document)
            scrollAncestorsToView(el as HTMLElement, scrollBehavior, true);
          }
        }
      });
    }
  }, [isNestedApp, location, root]);

  // --- Listen to location change using useEffect with location as dependency
  // https://jasonwatmore.com/react-router-v6-listen-to-location-route-change-without-history-listen
  // https://dev.to/mindactuate/scroll-to-anchor-element-with-react-router-v6-38op
  useEffect(() => {
    // Skip router location changes for nested apps - we handle browser hash changes separately
    if (isNestedApp) return;

    let hash = "";
    if (location.hash) {
      hash = location.hash.slice(1); // safe hash for further use after navigation
    }
    if (lastHash.current !== hash) {
      lastHash.current = hash;

      const rootNode = root?.getRootNode();
      // Default behavior is instant; TableOfContentsContext (and others) can override via location.state
      const scrollBehavior: ScrollBehavior =
        (location.state as any)?.hashScrollBehavior === "smooth" ? "smooth" : "instant";

      requestAnimationFrame(() => {
        if (!rootNode) return;
        // --- Hash from URL may be encoded (e.g. %20 for space); decode for element lookup
        const id = safeDecodeHash(lastHash.current);
        // ShadowRoot doesn't have getElementById; use querySelector instead
        const el =
          typeof ShadowRoot !== "undefined" && rootNode instanceof ShadowRoot
            ? (rootNode as ShadowRoot).querySelector(`#${CSS.escape(id)}`)
            : document.getElementById(id);
        if (!el) return;
        if (typeof ShadowRoot !== "undefined" && rootNode instanceof ShadowRoot) {
          scrollAncestorsToView(el as HTMLElement, scrollBehavior);
        } else {
          (el as HTMLElement).scrollIntoView({ behavior: scrollBehavior, block: "start" });
        }
      });
    }
  }, [location, scrollForceRefresh, root, isNestedApp]);

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
        // ShadowRoot doesn't have getElementById; use querySelector instead
        const el =
          typeof ShadowRoot !== "undefined" && rootNode instanceof ShadowRoot
            ? (rootNode as ShadowRoot).querySelector(`#${CSS.escape(bookmarkId)}`)
            : document.getElementById(bookmarkId);
        if (el) {
          if (typeof ShadowRoot !== "undefined" && rootNode instanceof ShadowRoot) {
            scrollAncestorsToView(el as HTMLElement, smoothScrolling ? "smooth" : "auto");
          } else {
            (el as HTMLElement).scrollIntoView({ behavior: smoothScrolling ? "smooth" : "auto", block: "start" });
          }
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

  const localePersistKey =
    appGlobals?.localePersistKey === null ? null : (appGlobals?.localePersistKey ?? "xmlui.locale");
  const persistedLocale = useMemo(() => {
    if (!localePersistKey || typeof window === "undefined") return undefined;
    return window.localStorage.getItem(localePersistKey) ?? undefined;
  }, [localePersistKey, storageTimestamp]);
  const availableLocales = useMemo(() => {
    const configured = appGlobals?.availableLocales;
    const configuredLocales = Array.isArray(configured)
      ? configured.filter((v) => typeof v === "string")
      : [];
    return [...new Set([...bundleStoreRef.current.available(), ...configuredLocales])];
  }, [appGlobals?.availableLocales, bundleVersion]);
  const activeLocale = useMemo(
    () =>
      resolveLocale({
        appProp: appLocaleOverride,
        userOverride: userLocaleOverride,
        persisted: persistedLocale,
        navigatorLanguages:
          typeof navigator !== "undefined" && Array.isArray(navigator.languages)
            ? navigator.languages
            : ["en"],
        available: availableLocales,
        fallback: appGlobals?.defaultLocale ?? "en",
      }),
    [appGlobals?.defaultLocale, appLocaleOverride, availableLocales, persistedLocale, userLocaleOverride],
  );

  const setLocale = useCallback(
    (locale: string, options?: { source?: "app" | "user" }) => {
      if (!isValidLocale(locale)) {
        pushXsLog({
          kind: "i18n",
          ts: Date.now(),
          code: "missing-bundle",
          severity: appGlobals?.strictI18n === true ? "error" : "warn",
          locale,
          message: `Invalid locale "${locale}".`,
        });
        return;
      }
      if (options?.source === "app") {
        setAppLocaleOverride(locale);
      } else {
        setUserLocaleOverride(locale);
        if (localePersistKey && typeof window !== "undefined") {
          window.localStorage.setItem(localePersistKey, locale);
          setStorageTimestamp(Date.now());
        }
      }
    },
    [appGlobals?.strictI18n, localePersistKey],
  );

  const registerLocaleBundle = useCallback(
    (bundle: LocaleBundle) => {
      bundleStoreRef.current.register(bundle);
      setBundleVersion((version) => version + 1);
    },
    [],
  );

  const reportI18nDiagnostic = useCallback(
    (diagnostic: Record<string, unknown>) => {
      pushXsLog({
        kind: "i18n",
        ts: Date.now(),
        ...diagnostic,
      });
    },
    [],
  );

  const registerLocaleBundles = useCallback(
    async (input: unknown) => {
      const loadedSourceByLocale = new Map<string, string>();
      const bundles = await resolveLocaleBundleInput(input, async (url) => {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Failed to load locale bundle "${url}": ${response.status} ${response.statusText}`);
        }
        const json = await response.json();
        const locale = inferLocaleFromBundleUrl(url);
        const loadedLocale = typeof (json as any)?.locale === "string" ? (json as any).locale : locale;
        if (loadedLocale) {
          bundleSourcesRef.current.set(loadedLocale, url);
          loadedSourceByLocale.set(loadedLocale, url);
        }
        if (locale && json && typeof json === "object" && !(json as any).locale) {
          return { locale, messages: json };
        }
        return json;
      });
      for (const bundle of bundles) {
        registerLocaleBundle(bundle);
        const source = loadedSourceByLocale.get(bundle.locale);
        if (source) {
          bundleSourcesRef.current.set(bundle.locale, source);
        }
      }
    },
    [registerLocaleBundle],
  );

  const reloadLocale = useCallback(
    async (locale: string) => {
      const source = bundleSourcesRef.current.get(locale);
      if (!source) return false;
      await registerLocaleBundles(source);
      return true;
    },
    [registerLocaleBundles],
  );

  useEffect(() => {
    if (appGlobals?.localeBundles === undefined) return;
    void registerLocaleBundles(appGlobals.localeBundles).catch((error) => {
      reportI18nDiagnostic({
        code: "missing-bundle",
        severity: appGlobals?.strictI18n === true ? "error" : "warn",
        message: error instanceof Error ? error.message : String(error),
      });
    });
  }, [appGlobals?.localeBundles, appGlobals?.strictI18n, registerLocaleBundles, reportI18nDiagnostic]);

  const translate = useCallback(
    (key: string, vars?: Record<string, unknown>) => {
      return translateMessage(key, vars, {
        store: bundleStoreRef.current,
        locale: activeLocale.locale,
        strict: appGlobals?.strictI18n === true,
        onDiagnostic: (diagnostic) => {
          reportI18nDiagnostic(diagnostic as any);
        },
      });
    },
    [activeLocale.locale, appGlobals?.strictI18n, bundleVersion, reportI18nDiagnostic],
  );

  const isRtlLocale = useCallback((locale?: string) => /^(ar|fa|he|ps|ur)(-|$)/i.test(locale ?? activeLocale.locale), [activeLocale.locale]);

  const resolvedDirection = useMemo(() => {
    if (directionOverride === "ltr" || directionOverride === "rtl") return directionOverride;
    return isRtlLocale(activeLocale.locale) ? "rtl" : "ltr";
  }, [directionOverride, isRtlLocale, activeLocale.locale]);

  // --- We prepare the helper infrastructure for the `AppState` component, which manages
  // --- app-wide state using buckets (state sections).
  const [appState, setAppState] = useState<Record<string, Record<string, any>>>(EMPTY_OBJECT);

  const xsVerbose = (appGlobals as any)?.xsVerbose === true;
  const xsLogMax = Number((appGlobals as any)?.xsVerboseLogMax ?? 200);

  // Initialize startup trace early during render, BEFORE children mount
  // This ensures DataLoader can capture the trace when useQuery triggers fetches
  if (xsVerbose && typeof window !== "undefined") {
    const w = window as any;
    // Initialize _xsLogs early so DataSource startup fetches are traced.
    // Without this, pushXsLog() noops because _xsLogs doesn't exist yet.
    if (!Array.isArray(w._xsLogs)) {
      w._xsLogs = [];
    }
    if (!w._xsStartupTrace) {
      w._xsStartupTrace = `startup-${Date.now().toString(36)}`;
    }
    if (!w._xsCurrentTrace) {
      w._xsCurrentTrace = w._xsStartupTrace;
    }
    // Expose tracing flag and helpers for state-layers method:call instrumentation
    w.__xsVerbose = true;
    if (!w.__xsTraceHelpers) {
      w.__xsTraceHelpers = { pushTrace, popTrace, pushXsLog, createLogEntry };
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
      const componentTypeEl = target?.closest?.("[data-component-type]") as HTMLElement | null;
      const nearest = inspectEl || testIdEl || componentTypeEl || target;

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
            // Check for aria-label without role (e.g. div with aria-label)
            // — the label identifies the element even without a semantic role
            if (el.getAttribute?.("aria-label")) {
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
        // For table rows, derive accessible name from the row content.
        // Prefer the nearest-component text if short (user clicked a specific cell),
        // otherwise use the first cell's text (the name column).
        if (!ariaName && ariaRole === "row") {
          if (text && text.length < 50) {
            ariaName = text;
          } else {
            const firstCell = ariaTarget.querySelector?.("td");
            const cellText = firstCell?.textContent?.trim();
            if (cellText && cellText.length < 50) {
              ariaName = cellText;
            }
          }
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
      pushXsLog({
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
        ariaRole: detail.ariaRole,
        ariaName: detail.ariaName,
        detail,
        text: safeStringify(detail),
      }, xsLogMax);
    };

    const types = ["click", "dblclick", "contextmenu", "keydown"];
    types.forEach((type) => document.addEventListener(type, capture, true));

    return () => {
      types.forEach((type) => document.removeEventListener(type, capture, true));
    };
  }, [xsVerbose, xsLogMax]);

  // --- Create AppState object with global state management functions
  const appStateKeys = Array.isArray((appGlobals as any)?.appStateKeys)
    ? ((appGlobals as any)?.appStateKeys as string[])
    : undefined;
  const AppState = useMemo(
    () => createAppState(appStateContextValue, { allowedKeys: appStateKeys }),
    [appStateContextValue, appStateKeys],
  );

  // --- Phase 2 managed replacement globals
  const silentConsole = (appGlobals as any)?.silentConsole === true;
  const Log = useMemo(() => createLog(silentConsole), [silentConsole]);

  // --- Wrap toast to log calls to _xsLogs for test trace capture
  const tracedToast = useMemo(() => {
    function logToast(type: string, message: unknown) {
      pushXsLog({
        ts: Date.now(),
        perfTs: typeof performance !== "undefined" ? performance.now() : undefined,
        traceId: typeof window !== "undefined" ? (window as any)._xsCurrentTrace : undefined,
        kind: "toast",
        toastType: type,
        message: typeof message === "string" ? message : String(message),
      });
    }
    const wrapper: any = (message: unknown, opts?: any) => {
      logToast("default", message);
      announceLiveRegion(message);
      return toast(message as any, opts);
    };
    wrapper.success = (message: unknown, opts?: any) => {
      logToast("success", message);
      announceLiveRegion(message);
      return toast.success(message as any, opts);
    };
    wrapper.error = (message: unknown, opts?: any) => {
      logToast("error", message);
      announceLiveRegion(message, "assertive");
      return toast.error(message as any, opts);
    };
    wrapper.loading = (message: unknown, opts?: any) => {
      logToast("loading", message);
      announceLiveRegion(message);
      return toast.loading(message as any, opts);
    };
    wrapper.custom = (message: unknown, opts?: any) => {
      logToast("custom", message);
      return toast.custom(message as any, opts);
    };
    wrapper.dismiss = toast.dismiss.bind(toast);
    wrapper.remove = toast.remove.bind(toast);
    wrapper.promise = toast.promise.bind(toast);
    return wrapper;
  }, []);

  // --- Plan #07 Step 2.1: structured `signError` that maintains the
  // `App.errors` buffer and invokes a markup `<App onError>` handler.
  const signErrorWithHandler = useCallback(
    (error: Error | AppError | string | unknown) => {
      const appError = AppError.from(error);

      // Plan #07 Step 5.2 (W8-1): when strictErrors is on (default true), warn
      // whenever a non-AppError value reaches the pipeline so authors are
      // nudged toward `throw new AppError({ code, category, message })`.
      const strictErrors = (appGlobals as any)?.strictErrors !== false;
      if (strictErrors && !(error instanceof AppError)) {
        pushXsLog({
          ts: Date.now(),
          perfTs: typeof performance !== "undefined" ? performance.now() : undefined,
          traceId: typeof window !== "undefined" ? (window as any)._xsCurrentTrace : undefined,
          kind: "errors",
          severity: "warn",
          code: "unhandled-error",
          source: "handler",
          message:
            `[strictErrors] A non-AppError was thrown: ` +
            `${String((error as any)?.message ?? error)}. ` +
            `Use \`throw new AppError({ code, category, message })\` for structured error handling.`,
        });
      }

      // Build event payload with preventDefault — handler can suppress toast.
      let defaultPrevented = false;
      const event = {
        preventDefault() { defaultPrevented = true; },
        get defaultPrevented() { return defaultPrevented; },
      };

      // Append to App.errors buffer (FIFO, capped).
      const bufferSize = Math.max(
        0,
        typeof (appGlobals as any)?.errorBufferSize === "number"
          ? (appGlobals as any).errorBufferSize
          : 50,
      );
      if (bufferSize > 0) {
        setErrors((prev) => {
          const next = prev.concat(appError);
          return Object.freeze(
            next.length > bufferSize ? next.slice(next.length - bufferSize) : next,
          ) as ReadonlyArray<AppError>;
        });
      }

      // Invoke registered onError handler (may run async). Errors thrown by
      // the handler are swallowed to avoid feedback loops.
      const handler = errorHandlerRef.current;
      let handlerResult: void | boolean | Promise<void | boolean> | undefined;
      if (handler) {
        try {
          handlerResult = handler(appError, event);
        } catch (e) {
          console.error("[xmlui] onError handler threw:", e);
        }
      }

      const showToast = () => {
        if (defaultPrevented || handlerResult === false) return;
        signError(appError);
      };

      // Async handlers can still call preventDefault before settling.
      if (handlerResult && typeof (handlerResult as any).then === "function") {
        (handlerResult as Promise<void | boolean>).then(
          (result) => {
            if (result === false) return;
            // If the handler hasn't called preventDefault yet, still show toast.
            if (!defaultPrevented) signError(appError);
          },
          () => {
            // Handler rejected — still show toast.
            if (!defaultPrevented) signError(appError);
          },
        );
      } else {
        showToast();
      }
    },
    [appGlobals],
  );

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

      // --- Local storage utilities
      ...localStorageFunctions,
      storageTimestamp,

      // --- File Utilities
      formatFileSizeInBytes,
      getFileExtension,

      // --- Navigation-related
      navigate,
      routerBaseName,
      get pathname() { return globalThis?.location?.pathname; },
      setNavigationHandlers,

      // --- Notifications and dialogs
      confirm,
      signError: signErrorWithHandler,
      toast: tracedToast,

      // --- Theme-related
      activeThemeId,
      activeThemeTone,
      availableThemeIds,
      setTheme: setActiveThemeId,
      setThemeTone: setActiveThemeTone,
      toggleThemeTone,
      getThemeVar: themeGetThemeVar,

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

      // --- Phase 2 managed replacement globals
      Log,
      App: {
        ...AppUtilsNamespace,
        fetch: createAppFetch(appGlobals),
        environment: getAppEnvironment(),
        locale: activeLocale.locale,
        localeSource: activeLocale.source,
        availableLocales,
        setLocale,
        setAppDirection: (dir: "ltr" | "rtl" | "auto") => setDirectionOverride(dir),
        registerLocaleBundle,
        registerLocaleBundles,
        reloadLocale,
        translate,
        t: translate,
        isRtlLocale,
        direction: resolvedDirection,
        formatNumber: (value: number, options?: Intl.NumberFormatOptions) =>
          formatNumber(value, activeLocale.locale, options),
        formatCurrency: (value: number, currency: string, options?: Intl.NumberFormatOptions) =>
          formatCurrency(value, currency, activeLocale.locale, options),
        formatList: (values: readonly string[], options?: Intl.ListFormatOptions) =>
          formatList(values, activeLocale.locale, options),
        formatRelativeTime: (
          value: number,
          unit: Intl.RelativeTimeFormatUnit,
          options?: Intl.RelativeTimeFormatOptions,
        ) => formatRelativeTime(value, unit, activeLocale.locale, options),
        compare: (a: string, b: string, options?: Intl.CollatorOptions) =>
          compare(a, b, activeLocale.locale, options),
        pluralRules: (value: number, options?: Intl.PluralRulesOptions) =>
          pluralRules(value, activeLocale.locale, options),
        scheduler: schedulerMode,
        maxQueuedPerTrace,
        setScheduler,
        scheduleHandler,
        // --- W5-1 / plan #09 Step 1.2: register a named validator from markup.
        registerValidator: registerValidatorImpl,
        // --- Plan #15 Step 4.1 + 2.3: register custom audit sinks and PII heuristics.
        registerAuditSink: registerAuditSinkImpl,
        registerAuditHeuristic: registerAuditHeuristicImpl,
        // --- Plan #15 Step 2.2: replace the active audit policy from markup.
        setAuditPolicy: (policy: unknown) => {
          if (policy && typeof policy === "object") {
            const p = policy as Record<string, unknown>;
            setAuditPolicy({
              redact: Array.isArray(p.redact) ? (p.redact as any) : [],
              sample: (p.sample as any) ?? {},
              retention:
                (p.retention as any) ?? { bufferSize: 200, onOverflow: "drop-oldest" },
              sink: p.sink as any,
            });
          }
        },
        // --- Plan #07 Step 2.1: structured error sink.
        // `App.errors` is a FIFO buffer of recent `AppError`s (default 50, see
        // `appGlobals.errorBufferSize`).  `setErrorHandler` is used by
        // `<App onError>` to register a markup handler that runs after the
        // default toast; the handler may call `event.preventDefault()` to
        // suppress the toast.
        errors,
        setErrorHandler,
        // --- Plan #6 Step 1.2: cooperative handler cancellation.
        cancel: appCancel,
      },
      Clipboard: ClipboardNamespace,

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
    setNavigationHandlers,
    confirm,
    signErrorWithHandler,
    errors,
    setErrorHandler,
    activeThemeId,
    activeThemeTone,
    availableThemeIds,
    setActiveThemeId,
    setActiveThemeTone,
    toggleThemeTone,
    themeGetThemeVar,
    loggedInUser,
    embed,
    apiInterceptorContext,
    forceRefreshAnchorScroll,
    scrollBookmarkIntoView,
    root,
    AppState,
    Log,
    pubSubService,
    storageTimestamp,
    activeLocale,
    availableLocales,
    setLocale,
    registerLocaleBundle,
    registerLocaleBundles,
    reloadLocale,
    translate,
    isRtlLocale,
    resolvedDirection,
    schedulerMode,
    maxQueuedPerTrace,
    setScheduler,
    scheduleHandler,
  ]);

  return (
    <AppContext.Provider value={appContextValue}>
      <AppStateContext.Provider value={appStateContextValue}>
        <GlobalLiveRegion />
        {(appGlobals as any)?.autoSkipLink === true && <SkipLink />}
        <StandaloneComponent node={rootContainer}>{children}</StandaloneComponent>
      </AppStateContext.Provider>
    </AppContext.Provider>
  );
}

async function resolveLocaleBundleInput(
  input: unknown,
  loadUrl: (url: string) => Promise<unknown>,
): Promise<LocaleBundle[]> {
  if (input === undefined || input === null) return [];
  if (typeof input === "string") {
    return resolveLocaleBundleInput(await loadUrl(input), loadUrl);
  }
  if (Array.isArray(input)) {
    const resolved = await Promise.all(input.map((entry) => resolveLocaleBundleInput(entry, loadUrl)));
    return resolved.flat();
  }
  const direct = normalizeLocaleBundle(input);
  if (direct) return [direct];
  if (typeof input === "object") {
    return Object.entries(input as Record<string, unknown>)
      .filter(([, messages]) => messages && typeof messages === "object")
      .map(([locale, messages]) => ({ locale, messages: messages as Record<string, string> }));
  }
  return [];
}

function inferLocaleFromBundleUrl(url: string): string | undefined {
  const filename = url.split(/[/?#]/).filter(Boolean).at(-1) ?? "";
  const match = filename.match(/(?:^|\.)([a-z]{2,3}(?:-[a-z0-9]{2,8})*)\.json$/i);
  return match?.[1];
}

// --- We pass this funtion to the global app context
// Step 1.1 normalises any thrown value into an `AppError`; Step 2.1 (`<App
// onError>`) wraps this base behaviour with handler invocation and the
// `App.errors` buffer inside the component closure (see `signErrorWithHandler`).
function signError(error: Error | AppError | string | unknown) {
  const appError = AppError.from(error);
  const message = appError.message || "Something went wrong";
  announceLiveRegion(message, "assertive");
  toast.error(message);
  // Always log to console so Playwright page.on('console') can capture it
  console.error("[xmlui]", message);
  // Also log to _xsLogs — pushXsLog is a noop when xsVerbose is off
  pushXsLog({
    ts: Date.now(),
    perfTs: typeof performance !== "undefined" ? performance.now() : undefined,
    traceId: typeof window !== "undefined" ? (window as any)._xsCurrentTrace : undefined,
    kind: "error:runtime",
    error: {
      message,
      stack: appError.cause instanceof Error ? appError.cause.stack : undefined,
    },
  });
}

/**
 * Scrolls all ancestors of the specified element into view up to the first shadow root the element is in.
 * @param target The element to scroll to, can be in the light or shadow DOM
 * @param scrollBehavior The scroll behavior
 * @param stopAtShadowBoundary If true, stops at shadow boundary instead of crossing to host document
 */
function scrollAncestorsToView(target: HTMLElement, scrollBehavior?: ScrollBehavior, stopAtShadowBoundary?: boolean) {
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
        const rootNode = current.getRootNode();
        // Cross shadow boundary to continue searching in host document (unless stopAtShadowBoundary is true)
        if (rootNode && rootNode instanceof ShadowRoot && rootNode.host) {
          if (stopAtShadowBoundary) {
            // Stop here, don't cross into host document
            break;
          }
          parent = rootNode.host as HTMLElement | null;
        }
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
