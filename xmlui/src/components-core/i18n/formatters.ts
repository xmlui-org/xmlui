export function formatNumber(value: number, locale = currentLocale(), options?: Intl.NumberFormatOptions): string {
  return new Intl.NumberFormat(locale, options).format(value);
}

export function formatCurrency(
  value: number,
  currency: string,
  locale = currentLocale(),
  options?: Intl.NumberFormatOptions,
): string {
  return new Intl.NumberFormat(locale, { style: "currency", currency, ...options }).format(value);
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

export function pluralRules(value: number, locale = currentLocale(), options?: Intl.PluralRulesOptions): Intl.LDMLPluralRule {
  return new Intl.PluralRules(locale, options).select(value);
}

function currentLocale(): string {
  return typeof navigator !== "undefined" ? navigator.language : "en";
}
