import {
  DEFAULT_LOCALE_PROFILE,
  formatCurrencyWithLocaleProfile,
  formatNumberWithLocaleProfile,
  type LocaleProfile,
} from "./locale-profile";

type LocaleLike = string | LocaleProfile;

export function formatNumber(
  value: number,
  locale: LocaleLike = currentLocale(),
  options?: Intl.NumberFormatOptions,
): string {
  const profile = toLocaleProfile(locale);
  return formatNumberWithLocaleProfile(value, profile, options);
}

export function formatCurrency(
  value: number,
  currency?: string,
  locale: LocaleLike = currentLocale(),
  options?: Intl.NumberFormatOptions,
): string {
  const profile = toLocaleProfile(locale);
  return formatCurrencyWithLocaleProfile(value, currency, profile, options);
}

export function formatList(
  values: readonly string[],
  locale = currentLocale(),
  options?: Intl.ListFormatOptions,
): string {
  return new Intl.ListFormat(locale, options).format(values);
}

export function formatRelativeTime(
  value: number,
  unit: Intl.RelativeTimeFormatUnit,
  locale = currentLocale(),
  options?: Intl.RelativeTimeFormatOptions,
): string {
  return new Intl.RelativeTimeFormat(locale, options).format(value, unit);
}

export function compare(a: string, b: string, locale = currentLocale(), options?: Intl.CollatorOptions): number {
  return new Intl.Collator(locale, options).compare(a, b);
}

export function pluralRules(
  value: number,
  locale = currentLocale(),
  options?: Intl.PluralRulesOptions,
): Intl.LDMLPluralRule {
  return new Intl.PluralRules(locale, options).select(value);
}

function currentLocale(): string {
  return typeof navigator !== "undefined" ? navigator.language : "en";
}

function toLocaleProfile(locale: LocaleLike): LocaleProfile {
  if (typeof locale === "string") {
    return {
      ...DEFAULT_LOCALE_PROFILE,
      locale,
    };
  }
  return locale;
}
