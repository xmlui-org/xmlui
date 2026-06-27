export type LocaleBundle = Record<string, string>;

export type LocaleBundles = Record<string, LocaleBundle>;

export type RuntimeI18nSnapshot = {
  locale: string;
  bundles: LocaleBundles;
  revision: number;
};

export type RuntimeI18n = {
  subscribe(listener: () => void): () => void;
  getSnapshot(): RuntimeI18nSnapshot;
  setConfig(config: { locale?: string; bundles?: unknown }): void;
  setLocale(locale: string): void;
  translate(key: string, vars?: Record<string, unknown>): string;
  reference: {
    getLocale: () => string;
    setLocale: (locale: string) => void;
    translate: (key: string, vars?: Record<string, unknown>) => string;
  };
};

export function createRuntimeI18n(): RuntimeI18n {
  let snapshot: RuntimeI18nSnapshot = {
    locale: "en",
    bundles: {},
    revision: 0,
  };
  const listeners = new Set<() => void>();

  const notify = () => {
    for (const listener of listeners) {
      listener();
    }
  };

  const update = (next: Omit<RuntimeI18nSnapshot, "revision">) => {
    if (snapshot.locale === next.locale && snapshot.bundles === next.bundles) {
      return;
    }
    snapshot = {
      ...next,
      revision: snapshot.revision + 1,
    };
    notify();
  };

  const runtime: RuntimeI18n = {
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    getSnapshot() {
      return snapshot;
    },
    setConfig(config) {
      const bundles = normalizeLocaleBundles(config.bundles) ?? snapshot.bundles;
      const locale = config.locale ? String(config.locale) : snapshot.locale;
      update({ locale, bundles });
    },
    setLocale(locale) {
      update({ locale: String(locale), bundles: snapshot.bundles });
    },
    translate(key, vars) {
      return translateMessage(String(key ?? ""), vars, snapshot.locale, snapshot.bundles);
    },
    reference: {
      getLocale: () => snapshot.locale,
      setLocale: (locale) => runtime.setLocale(locale),
      translate: (key, vars) => runtime.translate(key, vars),
    },
  };

  return runtime;
}

function normalizeLocaleBundles(input: unknown): LocaleBundles | undefined {
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
  return bundles;
}

function translateMessage(
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

function formatIcuMessage(pattern: string, vars: Record<string, unknown> = {}, locale = "en"): string {
  return formatSegment(pattern, vars, locale);
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
