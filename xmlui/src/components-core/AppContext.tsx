import { createContext, useContext } from "react";

import type { AppContextObject } from "../abstractions/AppContextDefs";

/**
 * Stores the object that holds the global functions and methods of xmlui.
 */
export const AppContext = createContext<AppContextObject | undefined>(undefined);

/**
 * This React hook makes the current context of application services available
 * within any component logic using the hook.
 */
export function useAppContext () {
  return useContext(AppContext)!;
}

/**
 * Returns the application-global settings (the raw `appGlobals` object from
 * the app's configuration). Use this for app-specific values consumed by
 * application markup and scripts.
 *
 * For framework / runtime settings (e.g. `disableInlineStyle`,
 * `useHashBasedRouting`, `xsVerbose`, the `strict*` family), prefer
 * `useXmluiConfig()` — it returns a merged view that falls back to
 * `appGlobals` when a key is not set under `xmluiConfig`.
 */
export function useAppGlobals(): Record<string, any> {
  return useContext(AppContext)?.appGlobals ?? EMPTY_GLOBALS;
}

/**
 * Returns the framework / runtime configuration as a merged read-only view:
 * values from the configuration's `xmluiConfig` override values from
 * `appGlobals`. Any framework setting not defined under `xmluiConfig` falls
 * back to the same key in `appGlobals`, so apps that historically kept all
 * framework settings inside `appGlobals` continue to work unchanged.
 */
export function useXmluiConfig(): Record<string, any> {
  return useContext(AppContext)?.xmluiConfig ?? EMPTY_GLOBALS;
}

const EMPTY_GLOBALS: Record<string, any> = Object.freeze({});

/**
 * Pure helper used by the appContext factory and tests to merge a raw
 * `xmluiConfig` object on top of `appGlobals`. The result is a frozen object
 * containing every key from both sources, with `xmluiConfig` values winning
 * on conflict and `undefined` values in `xmluiConfig` falling back to
 * `appGlobals`.
 */
export function mergeXmluiConfig(
  appGlobals: Record<string, any> | undefined,
  xmluiConfig: Record<string, any> | undefined,
): Record<string, any> {
  if (!appGlobals && !xmluiConfig) return EMPTY_GLOBALS;
  const merged: Record<string, any> = { ...(appGlobals ?? {}) };
  if (xmluiConfig) {
    for (const key of Object.keys(xmluiConfig)) {
      const value = xmluiConfig[key];
      if (value !== undefined) {
        merged[key] = value;
      }
    }
  }
  return Object.freeze(merged);
}
