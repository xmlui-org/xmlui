export interface LocaleResolverInput {
  appProp?: string;
  userOverride?: string;
  persisted?: string;
  navigatorLanguages: readonly string[];
  available: readonly string[];
  fallback: string;
}

export type LocaleSource = "app" | "user" | "persisted" | "navigator" | "fallback";

export function isValidLocale(locale: string | undefined): locale is string {
  if (!locale) return false;
  try {
    Intl.getCanonicalLocales(locale);
    return true;
  } catch {
    return false;
  }
}

export function normalizeLocale(locale: string): string {
  return Intl.getCanonicalLocales(locale)[0] ?? locale;
}

export function resolveLocale(input: LocaleResolverInput): { locale: string; source: LocaleSource } {
  const available = new Set(input.available.map((l) => safeNormalize(l)).filter(Boolean));

  for (const [source, candidate] of [
    ["app", input.appProp],
    ["user", input.userOverride],
    ["persisted", input.persisted],
  ] as const) {
    const normalized = safeNormalize(candidate);
    if (normalized && isAllowed(normalized, available)) {
      return { locale: normalized, source };
    }
  }

  for (const candidate of input.navigatorLanguages) {
    const normalized = safeNormalize(candidate);
    if (normalized && isAllowed(normalized, available)) {
      return { locale: normalized, source: "navigator" };
    }
  }

  return { locale: safeNormalize(input.fallback) ?? "en", source: "fallback" };
}

function safeNormalize(locale: string | undefined): string | undefined {
  if (!isValidLocale(locale)) return undefined;
  return normalizeLocale(locale);
}

function isAllowed(locale: string, available: Set<string>): boolean {
  return available.size === 0 || available.has(locale) || available.has(locale.split("-")[0]);
}
