/**
 * Factory for building the `appContextValue` object that is injected into every
 * XMLUI expression scope via the React context (see `AppContent.tsx`).
 *
 * This module is the SINGLE SOURCE OF TRUTH for the shape of `appContextValue`.
 * - `buildAppContextValue(deps)` — called in `AppContent.tsx` inside `useMemo`.
 * - `APP_CONTEXT_KEYS` — the set of all keys the factory produces, derived once
 *   at module load via `Object.keys`. `FrameworkGlobals.ts` re-exports it as
 *   `XMLUI_GLOBAL_NAMES` so the `computedUses` optimizer can filter them out.
 *
 * MAINTENANCE: to add a new framework global, add it HERE only:
 *   1. Extend `AppContextDeps` with the new live dep (if hook-derived).
 *   2. Add the property to the return object of `buildAppContextValue`.
 *   3. Pass the value in `AppContent.tsx` when calling `buildAppContextValue`.
 * Everything else (the optimizer filter set) updates automatically.
 */

import { get } from "lodash-es";
import packageJson from "../../../package.json" with { type: "json" };
const { version } = packageJson;
import type { AppContextObject } from "../../abstractions/AppContextDefs";
import { dateFunctions } from "../appContext/date-functions";
import { mathFunctions } from "../appContext/math-function";
import { localStorageFunctions } from "../appContext/local-storage-functions";
import { miscellaneousUtils } from "../appContext/misc-utils";
import { ClipboardNamespace } from "../appContext/app-utils";
import { delay, formatFileSizeInBytes, getFileExtension } from "../utils/misc";

// ---------------------------------------------------------------------------
// Deps interface — all live values produced by hooks / context in AppContent.tsx
// STRICT: no index signature — TypeScript errors on missing or extra keys.
// ---------------------------------------------------------------------------
export interface AppContextDeps {
  Actions: AppContextObject["Actions"];
  appGlobals: AppContextObject["appGlobals"];
  xmluiConfig: AppContextObject["xmluiConfig"];
  debugEnabled: AppContextObject["debugEnabled"];
  decorateComponentsWithTestId: AppContextObject["decorateComponentsWithTestId"];
  environment: AppContextObject["environment"];
  mediaSize: AppContextObject["mediaSize"];
  queryClient: AppContextObject["queryClient"];
  standalone: AppContextObject["standalone"];
  appIsInShadowDom: AppContextObject["appIsInShadowDom"];
  storageTimestamp: AppContextObject["storageTimestamp"];
  navigate: AppContextObject["navigate"];
  routerBaseName: AppContextObject["routerBaseName"];
  setNavigationHandlers: AppContextObject["setNavigationHandlers"];
  confirm: AppContextObject["confirm"];
  signError: AppContextObject["signError"];
  toast: AppContextObject["toast"];
  activeThemeId: AppContextObject["activeThemeId"];
  activeThemeTone: AppContextObject["activeThemeTone"];
  availableThemeIds: AppContextObject["availableThemeIds"];
  setTheme: AppContextObject["setTheme"];
  setThemeTone: AppContextObject["setThemeTone"];
  toggleThemeTone: AppContextObject["toggleThemeTone"];
  getThemeVar: AppContextObject["getThemeVar"];
  loggedInUser: AppContextObject["loggedInUser"];
  setLoggedInUser: AppContextObject["setLoggedInUser"];
  embed: AppContextObject["embed"];
  apiInterceptorContext: AppContextObject["apiInterceptorContext"];
  forceRefreshAnchorScroll: AppContextObject["forceRefreshAnchorScroll"];
  scrollBookmarkIntoView: AppContextObject["scrollBookmarkIntoView"];
  AppState: AppContextObject["AppState"];
  Log: AppContextObject["Log"];
  /**
   * The `App` global namespace — built in `AppContent.tsx` from `AppUtilsNamespace`
   * extended with locale/translate/scheduler/error-handler hooks. Passed as a dep
   * so the factory stays the single source of TOP-LEVEL keys without owning the
   * complete `App.*` shape.
   */
  App: AppContextObject["App"];
  pubSubService: AppContextObject["pubSubService"];
  publishTopic: AppContextObject["publishTopic"];
}

// ---------------------------------------------------------------------------
// Factory — the only place that decides the shape of appContextValue
// ---------------------------------------------------------------------------

/**
 * Builds the full `appContextValue` object from live hook deps.
 * Module-constant values (version, utility spreads, lodash `get`, etc.) are
 * imported directly — they do not belong in `deps`.
 */
export function buildAppContextValue(d: AppContextDeps): AppContextObject {
  return {
    // --- Engine
    version,

    // --- Actions namespace
    Actions: d.Actions,

    // --- App-specific
    appGlobals: d.appGlobals,
    // --- Framework / runtime settings (merged view: xmluiConfig overlaid on appGlobals)
    xmluiConfig: d.xmluiConfig,
    debugEnabled: d.debugEnabled,
    decorateComponentsWithTestId: d.decorateComponentsWithTestId,
    environment: d.environment,
    mediaSize: d.mediaSize,
    queryClient: d.queryClient,
    standalone: d.standalone,
    appIsInShadowDom: d.appIsInShadowDom,

    // --- Date-related (spread — auto-discovered via Object.keys at module load)
    ...dateFunctions,

    // --- Math-related (spread)
    ...mathFunctions,

    // --- Local storage utilities (spread)
    ...localStorageFunctions,
    storageTimestamp: d.storageTimestamp,

    // --- File Utilities
    formatFileSizeInBytes,
    getFileExtension,

    // --- Navigation-related
    navigate: d.navigate,
    routerBaseName: d.routerBaseName,
    get pathname() {
      return globalThis?.location?.pathname;
    },
    setNavigationHandlers: d.setNavigationHandlers,

    // --- Notifications and dialogs
    confirm: d.confirm,
    signError: d.signError,
    toast: d.toast,

    // --- Theme-related
    activeThemeId: d.activeThemeId,
    activeThemeTone: d.activeThemeTone,
    availableThemeIds: d.availableThemeIds,
    setTheme: d.setTheme,
    setThemeTone: d.setThemeTone,
    toggleThemeTone: d.toggleThemeTone,
    getThemeVar: d.getThemeVar,

    // --- User-related
    loggedInUser: d.loggedInUser,
    setLoggedInUser: d.setLoggedInUser,

    delay,
    embed: d.embed,
    apiInterceptorContext: d.apiInterceptorContext,
    getPropertyByPath: get,

    // --- Various utils (spread)
    ...miscellaneousUtils,

    forceRefreshAnchorScroll: d.forceRefreshAnchorScroll,
    scrollBookmarkIntoView: d.scrollBookmarkIntoView,

    // --- AppState global state management
    AppState: d.AppState,

    // --- Phase 2 managed replacement globals
    Log: d.Log,
    App: d.App,
    Clipboard: ClipboardNamespace,

    // --- PubSub messaging
    pubSubService: d.pubSubService,
    publishTopic: d.publishTopic,
  };
}

// ---------------------------------------------------------------------------
// Key set — derived once at module load, no manual list required
// ---------------------------------------------------------------------------

/**
 * Proxy stub: returns `undefined` for any property access.
 * Safe because the factory only assigns values (never calls them directly —
 * chained accesses like `d.pubSubService.publishTopic` are avoided by listing
 * `publishTopic` as a top-level dep; lazy getters guard `App.fetch` / `App.environment`).
 */
const STUB_DEPS = new Proxy({}, { get: () => undefined }) as AppContextDeps;

/**
 * Names of XMLUI framework globals wired into every expression scope via
 * `appContextValue`. Derived automatically — no manual list required.
 *
 * Consumed by `FrameworkGlobals.ts` → `computedUses` optimizer to filter out
 * non-state identifiers, preventing false StateContainer promotion.
 */
export const XMLUI_GLOBAL_NAMES: ReadonlySet<string> = Object.freeze(
  new Set(Object.keys(buildAppContextValue(STUB_DEPS))),
) as ReadonlySet<string>;
