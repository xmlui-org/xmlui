/* @vitest-environment jsdom */

import React from "react";
import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  AppContext,
  useAppContext,
} from "../../../src/components-core/AppContext";
import {
  LocaleProfileProvider,
  useLocaleProfile,
  type LocaleProfile,
} from "../../../src/components-core/i18n";

function createAppContext(locale = "en-US"): any {
  return {
    App: {
      locale,
      translate: (key: string) => `${locale}:${key}`,
      t: (key: string) => `${locale}:${key}`,
      translateForLocale: (targetLocale: string, key: string) => `${targetLocale}:${key}`,
      formatNumber: (value: number, options?: Intl.NumberFormatOptions) =>
        new Intl.NumberFormat(locale, options).format(value),
      formatCurrency: (
        value: number,
        currency: string,
        options?: Intl.NumberFormatOptions,
      ) => new Intl.NumberFormat(locale, { style: "currency", currency, ...options }).format(value),
      formatList: (values: readonly string[], options?: Intl.ListFormatOptions) =>
        new Intl.ListFormat(locale, options).format(values),
      formatRelativeTime: (
        value: number,
        unit: Intl.RelativeTimeFormatUnit,
        options?: Intl.RelativeTimeFormatOptions,
      ) => new Intl.RelativeTimeFormat(locale, options).format(value, unit),
      compare: (a: string, b: string, options?: Intl.CollatorOptions) =>
        new Intl.Collator(locale, options).compare(a, b),
      pluralRules: (value: number, options?: Intl.PluralRulesOptions) =>
        new Intl.PluralRules(locale, options).select(value),
    },
  };
}

describe("LocaleProfileProvider", () => {
  it("inherits parent locale traits and overrides child traits", () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <LocaleProfileProvider
        locale="de-DE"
        decimalSeparator=","
        groupSeparator=".">
        <LocaleProfileProvider groupSeparator=" ">
          {children}
        </LocaleProfileProvider>
      </LocaleProfileProvider>
    );

    const { result } = renderHook(() => useLocaleProfile(), { wrapper });

    expect(result.current).toEqual({
      locale: "de-DE",
      source: "fallback",
      decimalSeparator: ",",
      groupSeparator: " ",
    });
  });

  it("keeps the profile identity stable when inputs stay stable", () => {
    const profile: LocaleProfile = { locale: "fr-FR", source: "app" };
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <LocaleProfileProvider profile={profile}>{children}</LocaleProfileProvider>
    );

    const { result, rerender } = renderHook(() => useLocaleProfile(), { wrapper });
    const first = result.current;
    rerender();

    expect(result.current).toBe(first);
  });
});

describe("useAppContext locale profile composition", () => {
  it("returns the original app context when there is no scoped locale override", () => {
    const appContext = createAppContext("en-US");
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AppContext.Provider value={appContext}>
        <LocaleProfileProvider profile={{ locale: "en-US" }}>
          {children}
        </LocaleProfileProvider>
      </AppContext.Provider>
    );

    const { result } = renderHook(() => useAppContext(), { wrapper });

    expect(result.current).toBe(appContext);
  });

  it("scopes App formatting helpers without changing App.locale", () => {
    const appContext = createAppContext("en-US");
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AppContext.Provider value={appContext}>
        <LocaleProfileProvider
          profile={{
            locale: "en-US",
            decimalSeparator: ",",
            groupSeparator: " ",
            currency: "EUR",
          }}>
          {children}
        </LocaleProfileProvider>
      </AppContext.Provider>
    );

    const { result } = renderHook(() => useAppContext(), { wrapper });

    expect(result.current).not.toBe(appContext);
    expect(result.current.App.locale).toBe("en-US");
    expect(result.current.App.translate("hello")).toBe("en-US:hello");
    expect(result.current.App.formatNumber(12345.5)).toBe("12 345,5");
    expect(result.current.App.formatCurrency(12345.5, "USD")).toBe("$12 345,50");
    expect(result.current.App.formatCurrency(12345.5)).toBe("€12 345,50");
  });

  it("uses the scoped locale for Intl-based helpers", () => {
    const appContext = createAppContext("en-US");
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AppContext.Provider value={appContext}>
        <LocaleProfileProvider profile={{ locale: "hu-HU" }}>
          {children}
        </LocaleProfileProvider>
      </AppContext.Provider>
    );

    const { result } = renderHook(() => useAppContext(), { wrapper });

    expect(result.current.App.locale).toBe("en-US");
    expect(result.current.App.t("hello")).toBe("hu-HU:hello");
    expect(result.current.App.formatNumber(12345.5).replace(/\s/g, " ")).toBe("12 345,5");
    expect(result.current.App.pluralRules(1)).toBe(new Intl.PluralRules("hu-HU").select(1));
  });
});
