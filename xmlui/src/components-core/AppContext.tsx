import { createContext, useContext, useMemo } from "react";

import type { AppContextObject } from "../abstractions/AppContextDefs";
import {
  compare,
  formatCurrency,
  formatList,
  formatNumber,
  formatRelativeTime,
  pluralRules,
  type LocaleProfile,
} from "./i18n";
import { useLocaleProfile } from "./i18n/LocaleContext";

/**
 * Stores the object that holds the global functions and methods of xmlui.
 */
export const AppContext = createContext<AppContextObject | undefined>(undefined);

/**
 * This React hook makes the current context of application services available
 * within any component logic using the hook.
 */
export function useAppContext () {
  const appContext = useContext(AppContext)!;
  const localeProfile = useLocaleProfile();
  return useMemo(
    () => composeAppContextWithLocaleProfile(appContext, localeProfile),
    [appContext, localeProfile],
  );
}

export function composeAppContextWithLocaleProfile(
  appContext: AppContextObject,
  localeProfile: LocaleProfile,
): AppContextObject {
  if (!hasScopedLocaleProfile(appContext, localeProfile)) {
    return appContext;
  }
  const baseApp = appContext.App;
  const translate = (key: string, vars?: Record<string, unknown>) =>
    baseApp.translateForLocale(localeProfile.locale, key, vars);
  return {
    ...appContext,
    App: {
      ...baseApp,
      translate,
      t: translate,
      formatNumber: (value: number, options?: Intl.NumberFormatOptions) =>
        formatNumber(value, localeProfile, options),
      formatCurrency: (value: number, currency?: string, options?: Intl.NumberFormatOptions) =>
        formatCurrency(value, currency, localeProfile, options),
      formatList: (values: readonly string[], options?: Intl.ListFormatOptions) =>
        formatList(values, localeProfile.locale, options),
      formatRelativeTime: (
        value: number,
        unit: Intl.RelativeTimeFormatUnit,
        options?: Intl.RelativeTimeFormatOptions,
      ) => formatRelativeTime(value, unit, localeProfile.locale, options),
      compare: (a: string, b: string, options?: Intl.CollatorOptions) =>
        compare(a, b, localeProfile.locale, options),
      pluralRules: (value: number, options?: Intl.PluralRulesOptions) =>
        pluralRules(value, localeProfile.locale, options),
    },
  };
}

function hasScopedLocaleProfile(
  appContext: AppContextObject,
  localeProfile: LocaleProfile,
): boolean {
  return (
    localeProfile.locale !== appContext.App.locale ||
    localeProfile.decimalSeparator !== undefined ||
    localeProfile.groupSeparator !== undefined ||
    localeProfile.minusSign !== undefined ||
    localeProfile.currency !== undefined ||
    localeProfile.numberingSystem !== undefined
  );
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
