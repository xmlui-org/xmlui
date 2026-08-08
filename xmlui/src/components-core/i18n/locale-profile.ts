import { isValidLocale, normalizeLocale } from "./locale-resolver";

export interface LocaleTraits {
  decimalSeparator?: string;
  groupSeparator?: string;
  minusSign?: string;
  currency?: string;
  numberingSystem?: string;
}

export interface LocaleProfile extends LocaleTraits {
  locale: string;
  source?: string;
}

export interface LocaleProfileInput extends LocaleTraits {
  locale?: string;
  source?: string;
  thousandSeparator?: string;
}

export const DEFAULT_LOCALE_PROFILE: LocaleProfile = Object.freeze({
  locale: "en",
  source: "fallback",
});

export function normalizeLocaleProfile(
  input?: LocaleProfileInput,
  parent: LocaleProfile = DEFAULT_LOCALE_PROFILE,
  onInvalidLocale?: (locale: string) => void,
): LocaleProfile {
  const locale = normalizeProfileLocale(input?.locale, parent.locale, onInvalidLocale);
  return {
    ...parent,
    ...cleanLocaleTraits(input),
    locale,
    source: input?.source ?? parent.source,
  };
}

export function formatNumberWithLocaleProfile(
  value: number,
  profile: LocaleProfile,
  options?: Intl.NumberFormatOptions,
): string {
  return formatNumberParts(value, profile, options);
}

export function formatCurrencyWithLocaleProfile(
  value: number,
  currency: string | undefined,
  profile: LocaleProfile,
  options?: Intl.NumberFormatOptions,
): string {
  const resolvedCurrency = currency ?? profile.currency;
  return formatNumberParts(value, profile, {
    style: "currency",
    currency: resolvedCurrency,
    ...options,
  });
}

function normalizeProfileLocale(
  locale: string | undefined,
  fallback: string,
  onInvalidLocale?: (locale: string) => void,
): string {
  if (locale === undefined || locale === "") {
    return fallback;
  }
  if (isValidLocale(locale)) {
    return normalizeLocale(locale);
  }
  onInvalidLocale?.(locale);
  return fallback;
}

function cleanLocaleTraits(input?: LocaleProfileInput): LocaleTraits {
  if (!input) return {};
  const groupSeparator = firstNonEmptyString(input.groupSeparator, input.thousandSeparator);
  return {
    ...(isNonEmptyString(input.decimalSeparator) ? { decimalSeparator: input.decimalSeparator } : {}),
    ...(groupSeparator !== undefined ? { groupSeparator } : {}),
    ...(isNonEmptyString(input.minusSign) ? { minusSign: input.minusSign } : {}),
    ...(isNonEmptyString(input.currency) ? { currency: input.currency } : {}),
    ...(isNonEmptyString(input.numberingSystem) ? { numberingSystem: input.numberingSystem } : {}),
  };
}

function formatNumberParts(
  value: number,
  profile: LocaleProfile,
  options?: Intl.NumberFormatOptions,
): string {
  const formatOptions = withNumberingSystem(profile, options);
  if (!hasPartOverrides(profile)) {
    return new Intl.NumberFormat(profile.locale, formatOptions).format(value);
  }
  return new Intl.NumberFormat(profile.locale, formatOptions)
    .formatToParts(value)
    .map((part) => replaceNumberPart(part, profile))
    .join("");
}

function withNumberingSystem(
  profile: LocaleProfile,
  options?: Intl.NumberFormatOptions,
): Intl.NumberFormatOptions | undefined {
  if (!profile.numberingSystem || options?.numberingSystem) {
    return options;
  }
  return {
    ...options,
    numberingSystem: profile.numberingSystem,
  };
}

function hasPartOverrides(profile: LocaleProfile): boolean {
  return (
    profile.decimalSeparator !== undefined ||
    profile.groupSeparator !== undefined ||
    profile.minusSign !== undefined
  );
}

function replaceNumberPart(part: Intl.NumberFormatPart, profile: LocaleProfile): string {
  switch (part.type) {
    case "decimal":
      return profile.decimalSeparator ?? part.value;
    case "group":
      return profile.groupSeparator ?? part.value;
    case "minusSign":
      return profile.minusSign ?? part.value;
    default:
      return part.value;
  }
}

function firstNonEmptyString(...values: Array<string | undefined>): string | undefined {
  return values.find(isNonEmptyString);
}

function isNonEmptyString(value: string | undefined): value is string {
  return typeof value === "string" && value.length > 0;
}
