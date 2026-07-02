export interface LocaleBundle {
  locale: string;
  messages: ReadonlyMap<string, string> | Record<string, string>;
}

export interface BundleStore {
  register(bundle: LocaleBundle): void;
  available(): readonly string[];
  lookup(locale: string, key: string): string | undefined;
}

export type I18nDiagnosticCode =
  | "missing-key"
  | "missing-bundle"
  | "icu-parse-error"
  | "untranslated-literal"
  | "physical-css-property"
  | "rtl-mismatch";

export interface I18nDiagnostic {
  code: I18nDiagnosticCode;
  severity: "error" | "warn";
  locale?: string;
  key?: string;
  bundleId?: string;
  message: string;
  data?: unknown;
}

export class IcuFormatError extends Error {
  constructor(
    message: string,
    public readonly pattern: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = "IcuFormatError";
  }
}

export type LocaleBundles = Record<string, Record<string, string>>;

export interface LocaleResolverInput {
  appProp?: string;
  userOverride?: string;
  persisted?: string;
  navigatorLanguages: readonly string[];
  available: readonly string[];
  fallback: string;
}

export type LocaleSource = "app" | "user" | "persisted" | "navigator" | "fallback";

export type RuntimeI18nSnapshot = {
  locale: string;
  bundles: LocaleBundles;
  revision: number;
};

export type RuntimeI18n = {
  subscribe(listener: () => void): () => void;
  getSnapshot(): RuntimeI18nSnapshot;
  setConfig(config: { locale?: string; bundles?: unknown }, options?: { notify?: boolean }): void;
  setLocale(locale: string): void;
  translate(key: string, vars?: Record<string, unknown>): string;
  reference: {
    getLocale: () => string;
    setLocale: (locale: string) => void;
    translate: (key: string, vars?: Record<string, unknown>) => string;
  };
};

export function createBundleStore(initial: readonly LocaleBundle[] = []): BundleStore {
  const bundles = new Map<string, Map<string, string>>();
  const store: BundleStore = {
    register(bundle) {
      const messages =
        bundle.messages instanceof Map
          ? new Map(bundle.messages)
          : new Map(Object.entries(bundle.messages));
      bundles.set(bundle.locale, messages);
    },
    available() {
      return [...bundles.keys()];
    },
    lookup(locale, key) {
      return bundles.get(locale)?.get(key) ?? bundles.get(locale.split("-")[0])?.get(key);
    },
  };
  for (const bundle of initial) {
    store.register(bundle);
  }
  return store;
}

export function normalizeLocaleBundle(input: unknown): LocaleBundle | undefined {
  if (!input || typeof input !== "object") {
    return undefined;
  }
  const candidate = input as { locale?: unknown; messages?: unknown };
  if (typeof candidate.locale !== "string" || !candidate.messages || typeof candidate.messages !== "object") {
    return undefined;
  }
  return {
    locale: candidate.locale,
    messages: candidate.messages instanceof Map
      ? new Map(candidate.messages)
      : Object.fromEntries(
          Object.entries(candidate.messages as Record<string, unknown>)
            .filter(([, value]) => value !== undefined && value !== null)
            .map(([key, value]) => [key, String(value)]),
        ),
  };
}

export function isValidLocale(locale: string | undefined): locale is string {
  if (!locale) {
    return false;
  }
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
  const available = new Set(input.available.flatMap((locale) => {
    const normalized = safeNormalizeLocale(locale);
    return normalized ? [normalized] : [];
  }));

  for (const [source, candidate] of [
    ["app", input.appProp],
    ["user", input.userOverride],
    ["persisted", input.persisted],
  ] as const) {
    const normalized = safeNormalizeLocale(candidate);
    if (normalized && isAllowedLocale(normalized, available)) {
      return { locale: normalized, source };
    }
  }

  for (const candidate of input.navigatorLanguages) {
    const normalized = safeNormalizeLocale(candidate);
    if (normalized && isAllowedLocale(normalized, available)) {
      return { locale: normalized, source: "navigator" };
    }
  }

  return { locale: safeNormalizeLocale(input.fallback) ?? "en", source: "fallback" };
}

export function translateMessage(
  key: string,
  vars: Record<string, unknown> | undefined,
  options: {
    store: BundleStore;
    locale: string;
    strict?: boolean;
    onDiagnostic?: (diagnostic: I18nDiagnostic) => void;
  },
): string {
  const pattern = options.store.lookup(options.locale, key);
  if (pattern === undefined) {
    options.onDiagnostic?.({
      code: "missing-key",
      severity: options.strict ? "error" : "warn",
      locale: options.locale,
      key,
      message: `Missing i18n key "${key}" for locale "${options.locale}".`,
    });
    return key;
  }
  try {
    return formatIcuMessage(pattern, vars, options.locale);
  } catch (error) {
    options.onDiagnostic?.({
      code: "icu-parse-error",
      severity: options.strict ? "error" : "warn",
      locale: options.locale,
      key,
      message: error instanceof Error ? error.message : String(error),
      data: { pattern },
    });
    return key;
  }
}

export const xmluiEnglishBundle: LocaleBundle = {
  locale: "en",
  messages: {
    "xmlui.form.cancel": "Cancel",
    "xmlui.form.save": "Save",
    "xmlui.form.saving": "Saving...",
    "xmlui.form.validating": "Validating...",
    "xmlui.select.searchPlaceholder": "Search...",
    "xmlui.drawer.ariaLabel": "Drawer",
    "xmlui.drawer.closeAriaLabel": "Close",
    "xmlui.modal.closeAriaLabel": "Close",
    "xmlui.validation.email": "Not a valid email address",
    "xmlui.validation.url": "Not a valid URL",
    "xmlui.validation.phone": "Not a valid phone number",
    "xmlui.validation.isoDate": "Not a valid ISO 8601 date",
    "xmlui.validation.length": "Invalid length",
    "xmlui.validation.iban": "Not a valid IBAN",
    "xmlui.validation.creditCard": "Not a valid credit card number",
    "xmlui.validation.strongPassword":
      "Password must be at least 12 characters and include upper, lower, digit, and symbol",
    "xmlui.validation.noLeadingTrailingWhitespace":
      "Value must not start or end with whitespace",
  },
};

export function createRuntimeI18n(): RuntimeI18n {
  let configuredLocale: string | undefined;
  let userLocaleOverride: string | undefined;
  let snapshot: RuntimeI18nSnapshot = {
    locale: "en",
    bundles: bundleMapFromLocaleBundles([xmluiEnglishBundle]),
    revision: 0,
  };
  const listeners = new Set<() => void>();

  const notify = () => {
    for (const listener of listeners) {
      listener();
    }
  };

  const update = (next: Omit<RuntimeI18nSnapshot, "revision">, notifyListeners = true) => {
    if (snapshot.locale === next.locale && snapshot.bundles === next.bundles) {
      return;
    }
    snapshot = {
      ...next,
      revision: snapshot.revision + 1,
    };
    if (notifyListeners) {
      notify();
    }
  };

  const runtime: RuntimeI18n = {
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    getSnapshot() {
      return snapshot;
    },
    setConfig(config, options) {
      const bundles = normalizeLocaleBundles(config.bundles) ?? snapshot.bundles;
      configuredLocale = config.locale ? String(config.locale) : undefined;
      const locale = resolveActiveLocale(configuredLocale, userLocaleOverride, bundles);
      update({ locale, bundles }, options?.notify !== false);
    },
    setLocale(locale) {
      userLocaleOverride = String(locale);
      persistLocale(userLocaleOverride);
      update({
        locale: resolveActiveLocale(configuredLocale, userLocaleOverride, snapshot.bundles),
        bundles: snapshot.bundles,
      });
    },
    translate(key, vars) {
      return translateFromLocaleBundles(String(key ?? ""), vars, snapshot.locale, snapshot.bundles);
    },
    reference: {
      getLocale: () => snapshot.locale,
      setLocale: (locale) => runtime.setLocale(locale),
      translate: (key, vars) => runtime.translate(key, vars),
    },
  };

  return runtime;
}

function resolveActiveLocale(
  appProp: string | undefined,
  userOverride: string | undefined,
  bundles: LocaleBundles,
): string {
  return resolveLocale({
    appProp,
    userOverride,
    persisted: getPersistedLocale(),
    navigatorLanguages: getNavigatorLanguages(),
    available: Object.keys(bundles),
    fallback: "en",
  }).locale;
}

function getNavigatorLanguages(): readonly string[] {
  if (typeof navigator !== "undefined" && Array.isArray(navigator.languages)) {
    return navigator.languages;
  }
  if (typeof navigator !== "undefined" && navigator.language) {
    return [navigator.language];
  }
  return ["en"];
}

function getPersistedLocale(): string | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }
  try {
    return window.localStorage.getItem("xmlui.locale") ?? undefined;
  } catch {
    return undefined;
  }
}

function persistLocale(locale: string): void {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.setItem("xmlui.locale", locale);
  } catch {
    // Locale persistence is best effort, matching browser storage availability.
  }
}

function normalizeLocaleBundles(input: unknown): LocaleBundles | undefined {
  const normalizedBundles = normalizeLocaleBundleInput(input);
  if (normalizedBundles.length > 0) {
    return {
      ...bundleMapFromLocaleBundles([xmluiEnglishBundle]),
      ...bundleMapFromLocaleBundles(normalizedBundles),
    };
  }
  if (!input || typeof input !== "object") {
    return undefined;
  }
  const bundles: LocaleBundles = {};
  for (const [locale, messages] of Object.entries(input as Record<string, unknown>)) {
    if (!messages || typeof messages !== "object") {
      continue;
    }
    bundles[locale] = Object.fromEntries(
      Object.entries(messages as Record<string, unknown>)
        .filter(([, value]) => value !== undefined && value !== null)
        .map(([key, value]) => [key, String(value)]),
    );
  }
  return {
    ...bundleMapFromLocaleBundles([xmluiEnglishBundle]),
    ...bundles,
  };
}

function bundleMapFromLocaleBundles(bundles: readonly LocaleBundle[]): LocaleBundles {
  return Object.fromEntries(
    bundles.map((bundle) => [
      bundle.locale,
      bundle.messages instanceof Map
        ? Object.fromEntries(bundle.messages)
        : Object.fromEntries(
            Object.entries(bundle.messages)
              .filter(([, value]) => value !== undefined && value !== null)
              .map(([key, value]) => [key, String(value)]),
          ),
    ]),
  );
}

function normalizeLocaleBundleInput(input: unknown): LocaleBundle[] {
  if (input == null) {
    return [];
  }
  if (typeof input === "string") {
    return [];
  }
  if (Array.isArray(input)) {
    return input.flatMap(normalizeLocaleBundleInput);
  }
  const singleBundle = normalizeLocaleBundle(input);
  if (singleBundle) {
    return [singleBundle];
  }
  if (typeof input === "object") {
    return Object.entries(input as Record<string, unknown>)
      .filter(([, messages]) => messages && typeof messages === "object")
      .map(([locale, messages]) => ({
        locale,
        messages: Object.fromEntries(
          Object.entries(messages as Record<string, unknown>)
            .filter(([, value]) => value !== undefined && value !== null)
            .map(([key, value]) => [key, String(value)]),
        ),
      }));
  }
  return [];
}

function translateFromLocaleBundles(
  key: string,
  vars: Record<string, unknown> | undefined,
  locale: string,
  bundles: LocaleBundles,
): string {
  const pattern = lookupMessage(locale, key, bundles);
  if (pattern === undefined) {
    return key;
  }
  try {
    return formatIcuMessage(pattern, vars, locale);
  } catch {
    return key;
  }
}

function lookupMessage(locale: string, key: string, bundles: LocaleBundles): string | undefined {
  return bundles[locale]?.[key] ?? bundles[normalizeLanguage(locale)]?.[key] ?? bundles.en?.[key];
}

function normalizeLanguage(locale: string): string {
  return locale.split("-")[0] || locale;
}

function safeNormalizeLocale(locale: string | undefined): string | undefined {
  if (!isValidLocale(locale)) {
    return undefined;
  }
  return normalizeLocale(locale);
}

function isAllowedLocale(locale: string, available: Set<string>): boolean {
  return available.size === 0 || available.has(locale) || available.has(locale.split("-")[0]);
}

export function formatIcuMessage(pattern: string, vars: Record<string, unknown> = {}, locale = "en"): string {
  try {
    return formatSegment(pattern, vars, locale);
  } catch (error) {
    if (error instanceof IcuFormatError) {
      throw error;
    }
    throw new IcuFormatError(error instanceof Error ? error.message : String(error), pattern, error);
  }
}

function formatSegment(segment: string, vars: Record<string, unknown>, locale: string): string {
  let output = "";
  let index = 0;
  while (index < segment.length) {
    const open = segment.indexOf("{", index);
    if (open < 0) {
      output += segment.slice(index);
      break;
    }
    output += segment.slice(index, open);
    const close = findMatchingBrace(segment, open);
    if (close < 0) {
      throw new Error("Unmatched ICU placeholder brace.");
    }
    output += formatPlaceholder(segment.slice(open + 1, close).trim(), vars, locale);
    index = close + 1;
  }
  return output;
}

function formatPlaceholder(body: string, vars: Record<string, unknown>, locale: string): string {
  const [name, type, rest] = splitTopLevel(body);
  if (!name) {
    return "";
  }
  if (!type) {
    return stringify(vars[name]);
  }
  switch (type.trim()) {
    case "plural":
      return formatPlural(name.trim(), rest ?? "", vars, locale);
    case "select":
      return formatSelect(name.trim(), rest ?? "", vars, locale);
    case "number":
      return new Intl.NumberFormat(locale, parseNumberStyle(rest)).format(Number(vars[name.trim()] ?? 0));
    case "date":
      return formatDate(name.trim(), rest, vars, locale);
    case "time":
      return formatTime(name.trim(), rest, vars, locale);
    default:
      return stringify(vars[name.trim()]);
  }
}

function formatPlural(name: string, body: string, vars: Record<string, unknown>, locale: string): string {
  const value = Number(vars[name] ?? 0);
  const options = parseOptions(body);
  const exact = options[`=${value}`];
  const category = new Intl.PluralRules(locale).select(value);
  const selected = exact ?? options[category] ?? options.other;
  if (selected === undefined) {
    throw new Error("ICU plural requires an other branch.");
  }
  return formatSegment(selected.replace(/#/g, new Intl.NumberFormat(locale).format(value)), vars, locale);
}

function formatSelect(name: string, body: string, vars: Record<string, unknown>, locale: string): string {
  const options = parseOptions(body);
  const selected = options[String(vars[name])] ?? options.other;
  if (selected === undefined) {
    throw new Error("ICU select requires an other branch.");
  }
  return formatSegment(selected, vars, locale);
}

function parseOptions(body: string): Record<string, string> {
  const options: Record<string, string> = {};
  let index = 0;
  while (index < body.length) {
    while (/\s/.test(body[index] ?? "")) {
      index++;
    }
    const keyStart = index;
    while (index < body.length && !/\s|\{/.test(body[index])) {
      index++;
    }
    const key = body.slice(keyStart, index);
    while (/\s/.test(body[index] ?? "")) {
      index++;
    }
    if (!key || body[index] !== "{") {
      break;
    }
    const close = findMatchingBrace(body, index);
    if (close < 0) {
      throw new Error("Unmatched ICU option brace.");
    }
    options[key] = body.slice(index + 1, close);
    index = close + 1;
  }
  return options;
}

function splitTopLevel(body: string): [string, string?, string?] {
  const parts: string[] = [];
  let depth = 0;
  let start = 0;
  for (let index = 0; index < body.length; index++) {
    const ch = body[index];
    if (ch === "{") {
      depth++;
    }
    if (ch === "}") {
      depth--;
    }
    if (ch === "," && depth === 0) {
      parts.push(body.slice(start, index).trim());
      start = index + 1;
      if (parts.length === 2) {
        break;
      }
    }
  }
  parts.push(body.slice(start).trim());
  return [parts[0], parts[1], parts.slice(2).join(",").trim() || undefined];
}

function findMatchingBrace(text: string, open: number): number {
  let depth = 0;
  for (let index = open; index < text.length; index++) {
    if (text[index] === "{") {
      depth++;
    }
    if (text[index] === "}") {
      depth--;
      if (depth === 0) {
        return index;
      }
    }
  }
  return -1;
}

function parseNumberStyle(style?: string): Intl.NumberFormatOptions | undefined {
  switch (style?.trim()) {
    case "integer":
      return { maximumFractionDigits: 0 };
    case "percent":
      return { style: "percent" };
    default:
      return undefined;
  }
}

function formatDate(
  name: string,
  style: string | undefined,
  vars: Record<string, unknown>,
  locale: string,
): string {
  const date = new Date(vars[name] as never);
  return new Intl.DateTimeFormat(locale, dateTimeStyle(style)).format(date);
}

function formatTime(
  name: string,
  style: string | undefined,
  vars: Record<string, unknown>,
  locale: string,
): string {
  const date = new Date(vars[name] as never);
  return new Intl.DateTimeFormat(locale, timeStyle(style)).format(date);
}

function dateTimeStyle(style?: string): Intl.DateTimeFormatOptions {
  switch (style?.trim()) {
    case "short":
    case "medium":
    case "long":
    case "full":
      return { dateStyle: style.trim() as Intl.DateTimeFormatOptions["dateStyle"] };
    default:
      return {};
  }
}

function timeStyle(style?: string): Intl.DateTimeFormatOptions {
  switch (style?.trim()) {
    case "short":
    case "medium":
    case "long":
    case "full":
      return { timeStyle: style.trim() as Intl.DateTimeFormatOptions["timeStyle"] };
    default:
      return {};
  }
}

function stringify(value: unknown): string {
  return value === undefined || value === null ? "" : String(value);
}
