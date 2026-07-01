import type { RuntimeRoutingStore } from "./routing";
import type { ToastService } from "./services/toast";

export type XmluiAppContextObject = Record<string, unknown>;

export type CreateXmluiAppContextObjectOptions = {
  appGlobals?: Record<string, unknown>;
  mediaSize?: { sizeIndex: number };
  toast?: ToastService;
  confirm?: (...args: unknown[]) => unknown;
  routing?: RuntimeRoutingStore;
};

export function createXmluiAppContextObject({
  appGlobals = {},
  mediaSize = { sizeIndex: 4 },
  toast,
  confirm,
  routing,
}: CreateXmluiAppContextObjectOptions = {}): XmluiAppContextObject {
  let loggedInUser: unknown = (appGlobals as Record<string, unknown>).loggedInUser ?? null;
  const publishTopic = (_topic: string | number, _data?: unknown) => undefined;

  return {
    version: "0.0.0",
    Actions: {
      navigate: (target: unknown, queryParams?: Record<string, unknown>) =>
        routing?.navigate(target, queryParams),
    },
    apiInterceptorContext: {
      isMocked: () => false,
      initialized: false,
      forceInitialize: () => undefined,
      interceptorWorker: null,
      apiInstance: null,
    },
    appGlobals,
    $appGlobals: appGlobals,
    xmluiConfig: readPlainObject(appGlobals.xmluiConfig) ?? {},
    debugEnabled: false,
    decorateComponentsWithTestId: false,
    environment: {
      isWindowFocused: typeof document === "undefined" ? true : document.hasFocus(),
    },
    mediaSize,
    queryClient: null,
    standalone: false,
    appIsInShadowDom: false,
    formatDate,
    formatDateTime,
    formatDateWithoutYear,
    formatTime,
    formatTimeWithoutSeconds,
    getDate,
    getDateUntilNow,
    isoDateString,
    isToday,
    isTomorrow,
    isYesterday,
    smartFormatDate,
    smartFormatDateTime,
    differenceInMinutes,
    isSameDay,
    isThisYear,
    formatHumanElapsedTime,
    avg,
    sum,
    formatFileSizeInBytes,
    getFileExtension,
    navigate: (target: unknown, queryParams?: Record<string, unknown>) =>
      routing?.navigate(target, queryParams),
    routerBaseName: "",
    pathname: typeof window === "undefined" ? undefined : window.location.pathname,
    setNavigationHandlers: undefined,
    toast: toast?.reference,
    confirm: confirm ?? defaultConfirm,
    signError: () => undefined,
    activeThemeId: "xmlui",
    activeThemeTone: "light",
    availableThemeIds: ["xmlui"],
    setTheme: () => undefined,
    setThemeTone: () => undefined,
    toggleThemeTone: () => undefined,
    getThemeVar: (themeVar: unknown) =>
      typeof document === "undefined" || typeof themeVar !== "string"
        ? undefined
        : getComputedStyle(document.documentElement).getPropertyValue(themeVar).trim() || undefined,
    get loggedInUser() {
      return loggedInUser;
    },
    setLoggedInUser: (value: unknown) => {
      loggedInUser = value;
    },
    resources: readPlainObject(appGlobals.resources),
    capitalize,
    pluralize,
    delay,
    debounce,
    toHashObject,
    findByField,
    embed: { isInIFrame: isInIFrame() },
    distinct,
    forceRefreshAnchorScroll: () => undefined,
    scrollBookmarkIntoView,
    readLocalStorage,
    writeLocalStorage,
    deleteLocalStorage,
    clearLocalStorage,
    resetLocalStorage: clearLocalStorage,
    getAllLocalStorage,
    storageTimestamp: 0,
    AppState: {},
    Log: createLogNamespace(),
    App: createAppNamespace(),
    Clipboard: {
      copy: async (text: unknown) => {
        if (typeof navigator !== "undefined") {
          await navigator.clipboard?.writeText?.(String(text ?? ""));
        }
      },
    },
    pubSubService: {
      publish: publishTopic,
      subscribe: () => () => undefined,
      unsubscribe: () => undefined,
    },
    publishTopic,
  };
}

export function hasXmluiAppContextProperty(
  appContext: XmluiAppContextObject | undefined,
  name: string,
): boolean {
  return !!appContext && Object.prototype.hasOwnProperty.call(appContext, name);
}

function readPlainObject(value: unknown): Record<string, unknown> | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return undefined;
  }
  return value as Record<string, unknown>;
}

function getDate(date?: string | number | Date): Date {
  return date ? new Date(date) : new Date();
}

function isoDateString(date?: string | number | Date): string {
  return getDate(date).toJSON();
}

function formatDate(date: string | number | Date, formatString?: string): string | undefined {
  return formatWithOptionalPattern(date, formatString, (value) => value.toLocaleDateString());
}

function formatDateTime(date: string | number | Date, formatString?: string): string | undefined {
  return formatWithOptionalPattern(date, formatString, (value) => value.toLocaleString());
}

function formatTime(date: string | number | Date, formatString?: string): string | undefined {
  return formatWithOptionalPattern(date, formatString, (value) => value.toLocaleTimeString());
}

function formatDateWithoutYear(date: string | number | Date): string | undefined {
  const value = getValidDate(date);
  return value?.toLocaleDateString([], { month: "numeric", day: "2-digit" });
}

function formatTimeWithoutSeconds(date: string | number | Date): string | undefined {
  const value = getValidDate(date);
  if (!value) {
    return undefined;
  }
  return `${value.getHours()}:${value.getMinutes()}`;
}

function smartFormatDate(date?: string | number | Date): string {
  if (!date) {
    return "";
  }
  if (isToday(date)) {
    return "today";
  }
  if (isYesterday(date)) {
    return "yesterday";
  }
  if (isTomorrow(date)) {
    return "tomorrow";
  }
  return formatDate(date) ?? "";
}

function smartFormatDateTime(date: string | number | Date): string | undefined {
  if (isToday(date)) {
    return formatTime(date);
  }
  if (isYesterday(date)) {
    return `yesterday ${formatTime(date) ?? ""}`.trim();
  }
  if (isTomorrow(date)) {
    return `tomorrow ${formatTime(date) ?? ""}`.trim();
  }
  return formatDateTime(date);
}

function getDateUntilNow(date?: string | number | Date, nowLabel = "now", time?: string): string {
  if (!date) {
    return "-";
  }
  const elapsed = formatHumanElapsedTime(date, nowLabel);
  return time ? `${elapsed} ${time}` : elapsed;
}

function formatHumanElapsedTime(date: string | number | Date, nowLabel = "now"): string {
  const value = getValidDate(date);
  if (!value) {
    return "";
  }
  const seconds = Math.floor((Date.now() - value.getTime()) / 1000);
  if (Math.abs(seconds) < 60) {
    return nowLabel;
  }
  const absoluteSeconds = Math.abs(seconds);
  const units: Array<[number, string]> = [
    [60 * 60 * 24 * 365, "year"],
    [60 * 60 * 24 * 30, "month"],
    [60 * 60 * 24 * 7, "week"],
    [60 * 60 * 24, "day"],
    [60 * 60, "hour"],
    [60, "minute"],
  ];
  for (const [unitSeconds, unitName] of units) {
    if (absoluteSeconds >= unitSeconds) {
      const amount = Math.floor(absoluteSeconds / unitSeconds);
      return `${amount} ${unitName}${amount === 1 ? "" : "s"} ago`;
    }
  }
  return nowLabel;
}

function differenceInMinutes(dateLeft: string | number | Date, dateRight: string | number | Date): number {
  return Math.trunc((getDate(dateLeft).getTime() - getDate(dateRight).getTime()) / 60000);
}

function isToday(date: string | number | Date): boolean {
  return isSameDay(date, new Date());
}

function isTomorrow(date: string | number | Date): boolean {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return isSameDay(date, tomorrow);
}

function isYesterday(date: string | number | Date): boolean {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return isSameDay(date, yesterday);
}

function isSameDay(dateLeft: string | number | Date, dateRight: string | number | Date): boolean {
  const left = getValidDate(dateLeft);
  const right = getValidDate(dateRight);
  return !!left &&
    !!right &&
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate();
}

function isThisYear(date: string | number | Date): boolean {
  const value = getValidDate(date);
  return !!value && value.getFullYear() === new Date().getFullYear();
}

function getValidDate(date: string | number | Date): Date | undefined {
  const value = getDate(date);
  return Number.isNaN(value.getTime()) ? undefined : value;
}

function formatWithOptionalPattern(
  date: string | number | Date,
  formatString: string | undefined,
  fallback: (date: Date) => string,
): string | undefined {
  const value = getValidDate(date);
  if (!value) {
    return undefined;
  }
  if (!formatString) {
    return fallback(value);
  }
  return formatDatePattern(value, formatString);
}

function formatDatePattern(date: Date, pattern: string): string {
  const pad = (value: number, length = 2) => String(value).padStart(length, "0");
  return pattern
    .replace(/yyyy/g, String(date.getFullYear()))
    .replace(/MM/g, pad(date.getMonth() + 1))
    .replace(/dd/g, pad(date.getDate()))
    .replace(/HH/g, pad(date.getHours()))
    .replace(/H/g, String(date.getHours()))
    .replace(/mm/g, pad(date.getMinutes()))
    .replace(/m/g, String(date.getMinutes()))
    .replace(/ss/g, pad(date.getSeconds()))
    .replace(/s/g, String(date.getSeconds()));
}

function avg(values: unknown, decimals?: number): number {
  const numbers = Array.isArray(values) ? values.map(Number).filter(Number.isFinite) : [];
  if (!numbers.length) {
    return 0;
  }
  const value = sum(numbers) / numbers.length;
  return typeof decimals === "number" ? Number(value.toFixed(decimals)) : value;
}

function sum(values: unknown): number {
  return Array.isArray(values)
    ? values.map(Number).filter(Number.isFinite).reduce((total, value) => total + value, 0)
    : 0;
}

function formatFileSizeInBytes(bytes: unknown): string | undefined {
  const value = Number(bytes);
  if (!value || !Number.isFinite(value)) {
    return "-";
  }
  const units = ["B", "KiB", "MiB", "GiB", "TiB"];
  let size = value;
  let unitIndex = 0;
  while (Math.abs(size) >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }
  return `${unitIndex === 0 ? size.toFixed(0) : size.toFixed(1)} ${units[unitIndex]}`;
}

function getFileExtension(fileName: unknown): string | undefined {
  if (typeof fileName !== "string") {
    return undefined;
  }
  const extension = fileName.split(".").pop();
  return extension && extension !== fileName ? extension.toLowerCase() : undefined;
}

function capitalize(value?: unknown): string {
  const text = value == null ? "" : String(value);
  return text ? `${text.charAt(0).toUpperCase()}${text.slice(1)}` : "";
}

function pluralize(number: number, singular: string, plural: string): string {
  return `${number} ${number === 1 ? singular : plural}`;
}

async function delay(timeInMs: unknown, callback?: () => unknown): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, Number(timeInMs) || 0));
  callback?.();
}

function debounce<F extends (...args: unknown[]) => unknown>(
  delayMs: unknown,
  func: F,
  ...args: Parameters<F>
): void {
  setTimeout(() => func(...args), Number(delayMs) || 0);
}

function toHashObject(arr: unknown, keyProp: string, valueProp: string): Record<string, unknown> {
  if (!Array.isArray(arr)) {
    return {};
  }
  return arr.reduce<Record<string, unknown>>((result, item) => {
    if (item && typeof item === "object") {
      const entry = item as Record<string, unknown>;
      result[String(entry[keyProp])] = entry[valueProp];
    }
    return result;
  }, {});
}

function findByField(arr: unknown, field: string, value: unknown): unknown {
  return Array.isArray(arr)
    ? arr.find((item) => item && typeof item === "object" && (item as Record<string, unknown>)[field] === value)
    : undefined;
}

function distinct(arr: unknown): unknown[] {
  return Array.isArray(arr) ? Array.from(new Set(arr)) : [];
}

function scrollBookmarkIntoView(bookmarkId: unknown, smoothScrolling?: unknown): void {
  if (typeof document === "undefined" || typeof bookmarkId !== "string") {
    return;
  }
  document.getElementById(bookmarkId)?.scrollIntoView({
    behavior: smoothScrolling ? "smooth" : "auto",
  });
}

function readLocalStorage(key: string, fallback?: unknown): unknown {
  try {
    const [rootKey, ...path] = key.split(".");
    const rootValue = parseLocalStorageValue(window.localStorage.getItem(rootKey));
    if (rootValue === undefined) {
      return fallback;
    }
    return path.length ? readPath(rootValue, path) ?? fallback : rootValue;
  } catch {
    return fallback;
  }
}

function writeLocalStorage(key: string, value: unknown): void {
  try {
    const [rootKey, ...path] = key.split(".");
    if (!path.length) {
      window.localStorage.setItem(rootKey, JSON.stringify(value));
      return;
    }
    const root = readPlainObject(parseLocalStorageValue(window.localStorage.getItem(rootKey))) ?? {};
    writePath(root, path, value);
    window.localStorage.setItem(rootKey, JSON.stringify(root));
  } catch {
    // Ignore localStorage access failures to match the original helper contract.
  }
}

function deleteLocalStorage(key: string): void {
  try {
    const [rootKey, ...path] = key.split(".");
    if (!path.length) {
      window.localStorage.removeItem(rootKey);
      return;
    }
    const root = readPlainObject(parseLocalStorageValue(window.localStorage.getItem(rootKey)));
    if (root) {
      deletePath(root, path);
      window.localStorage.setItem(rootKey, JSON.stringify(root));
    }
  } catch {
    // Ignore localStorage access failures to match the original helper contract.
  }
}

function clearLocalStorage(prefix?: string): void {
  try {
    if (!prefix) {
      window.localStorage.clear();
      return;
    }
    for (const key of Object.keys(getAllLocalStorage())) {
      if (key.startsWith(prefix)) {
        window.localStorage.removeItem(key);
      }
    }
  } catch {
    // Ignore localStorage access failures to match the original helper contract.
  }
}

function getAllLocalStorage(): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  try {
    for (let index = 0; index < window.localStorage.length; index += 1) {
      const key = window.localStorage.key(index);
      if (key) {
        result[key] = parseLocalStorageValue(window.localStorage.getItem(key));
      }
    }
  } catch {
    return {};
  }
  return result;
}

function parseLocalStorageValue(value: string | null): unknown {
  if (value == null) {
    return undefined;
  }
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function readPath(root: unknown, path: string[]): unknown {
  return path.reduce<unknown>((current, part) => {
    if (!current || typeof current !== "object") {
      return undefined;
    }
    return (current as Record<string, unknown>)[part];
  }, root);
}

function writePath(root: Record<string, unknown>, path: string[], value: unknown): void {
  let current = root;
  for (const part of path.slice(0, -1)) {
    const next = readPlainObject(current[part]) ?? {};
    current[part] = next;
    current = next;
  }
  current[path[path.length - 1]] = value;
}

function deletePath(root: Record<string, unknown>, path: string[]): void {
  let current: Record<string, unknown> | undefined = root;
  for (const part of path.slice(0, -1)) {
    current = readPlainObject(current[part]);
    if (!current) {
      return;
    }
  }
  delete current[path[path.length - 1]];
}

function defaultConfirm(title?: unknown, message?: unknown): Promise<boolean> {
  if (typeof window === "undefined" || typeof window.confirm !== "function") {
    return Promise.resolve(false);
  }
  return Promise.resolve(window.confirm([title, message].filter(Boolean).join("\n") || "Confirm"));
}

function createLogNamespace() {
  const noop = () => undefined;
  return {
    debug: noop,
    info: noop,
    warn: noop,
    error: noop,
  };
}

function createAppNamespace() {
  return {
    randomBytes: (count: unknown) => new Uint8Array(Math.max(0, Math.min(Number(count) || 0, 1024))),
    now: () =>
      typeof performance === "undefined" || typeof performance.now !== "function"
        ? Date.now()
        : performance.now(),
    mark: () => undefined,
    measure: () => undefined,
    fetch: (input: RequestInfo | URL, init?: RequestInit) => fetch(input, init),
    environment: {},
    locale: "en-US",
    localeSource: "default",
    availableLocales: ["en-US"],
    setLocale: () => undefined,
    setAppDirection: () => undefined,
    registerLocaleBundle: () => undefined,
    registerLocaleBundles: async () => undefined,
    reloadLocale: async () => false,
    translate: (key: unknown) => String(key ?? ""),
    t: (key: unknown) => String(key ?? ""),
    isRtlLocale: () => false,
    direction: "ltr",
    formatNumber: (value: number, options?: Intl.NumberFormatOptions) =>
      new Intl.NumberFormat(undefined, options).format(value),
    formatCurrency: (value: number, currency: string, options?: Intl.NumberFormatOptions) =>
      new Intl.NumberFormat(undefined, { ...options, style: "currency", currency }).format(value),
    formatList: (values: readonly string[], options?: Intl.ListFormatOptions) =>
      new Intl.ListFormat(undefined, options).format(values),
    formatRelativeTime: (
      value: number,
      unit: Intl.RelativeTimeFormatUnit,
      options?: Intl.RelativeTimeFormatOptions,
    ) => new Intl.RelativeTimeFormat(undefined, options).format(value, unit),
    compare: (a: string, b: string, options?: Intl.CollatorOptions) =>
      new Intl.Collator(undefined, options).compare(a, b),
    pluralRules: (value: number, options?: Intl.PluralRulesOptions) =>
      new Intl.PluralRules(undefined, options).select(value),
    scheduler: "concurrent",
    maxQueuedPerTrace: 0,
    setScheduler: () => undefined,
    scheduleHandler: async (task: { handler: () => Promise<void> }) => task.handler(),
    registerValidator: () => undefined,
    registerAuditSink: () => undefined,
    registerAuditHeuristic: () => undefined,
    setAuditPolicy: () => undefined,
    errors: [],
    setErrorHandler: () => undefined,
    cancel: () => undefined,
  };
}

function isInIFrame(): boolean {
  try {
    return typeof window !== "undefined" && window.self !== window.top;
  } catch {
    return true;
  }
}
