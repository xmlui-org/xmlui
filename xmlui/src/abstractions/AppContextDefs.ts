import type { To, NavigateOptions } from "react-router-dom";
import type { QueryClient } from "@tanstack/react-query";

import type {
  ToastOptions,
  Renderable,
  ValueOrFunction,
  DefaultToastOptions,
  Toast,
} from "react-hot-toast";
import type { ActionFunction } from "./ActionDefs";
import type { SetupWorker } from "msw/browser";
import type { IApiInterceptor } from "../components-core/interception/abstractions";
import type { AppState } from "../components-core/rendering/appState";
import type { PubSubService } from "../components-core/pubsub/PubSubService";
import type { ButtonThemeColor } from "../components/abstractions";
import type { LogNamespace } from "../components-core/appContext/log";
import type {
  AppUtilsNamespace,
  ClipboardNamespace,
  AppEnvironment,
} from "../components-core/appContext/app-utils";

// This interface defines the properties and services of an app context that the
// application components can use when implementing their behavior.
// Options object accepted by the `confirm` function.
export type ConfirmOptions = {
  title?: string;
  message?: string;
  actionLabel?: string;
  cancelLabel?: string;
  width?: string;
  actionThemeColor?: ButtonThemeColor;
};

export type AppContextObject = {
  // Accept other methods
  [x: string]: unknown;

  // ==============================================================================================
  // Engine-realated

  version: string;

  // ==============================================================================================
  // Actions namespace

  Actions: Record<string, ActionFunction>;

  // ==============================================================================================
  // App-Specific

  // This property returns the context object of the API interceptor.
  apiInterceptorContext: IApiInterceptorContext;

  // This property returns a hash object containing all application-global settings
  // defined in the app's configuration file.
  appGlobals?: Record<string, any>;

  // Indicates that the application is running in debug-enabled mode.
  debugEnabled?: boolean;

  // Indicates that components are decorated with test IDs used for e2e tests.
  decorateComponentsWithTestId?: boolean;

  // This property returns an object with some properties of the current environment.
  environment: { isWindowFocused: boolean };

  // This property returns an object with information about the current media size.
  mediaSize: MediaSize;

  // The `QueryClient` object of the react-query library XMLUI uses for data
  // fetching purposes
  queryClient: QueryClient | null;

  // This property returns `true` if the app is a standalone XMLUI app; otherwise
  // (for example, as part of a website), it returns `false`.
  standalone?: boolean;

  // Indicates that the app is running in a shadow DOM.
  appIsInShadowDom?: boolean;

  // ==============================================================================================
  // Date Utilities

  // This function formats the specified value's date part into a local date string
  // (according to the machine's local settings).
  formatDate: (date: string | Date) => string | undefined;

  // This function formats the specified value into a local date and time string
  // (according to the machine's local settings).
  formatDateTime: (date: any) => string | undefined;

  // This function formats the specified value's date part (without year)
  // into a local date string (according to the machine's local settings).
  formatDateWithoutYear: (date: string | Date) => string | undefined;

  // This function formats the specified value's time part into a local date
  // string (according to the machine's local settings).
  formatTime: (date: any) => string | undefined;

  // This function formats the specified value's time part (without seconds)
  // into a local date string (according to the machine's local settings).
  formatTimeWithoutSeconds: (date: string | Date) => string | undefined;

  // This function creates a date from the specified input value. If no input
  // is provided, it returns the current date and time.
  getDate: (date?: string | number | Date) => Date;

  // This function calculates the difference between the current date and the
  // provided one and returns it in a human-readable form, such as "1 month",
  // "2 weeks", etc.

  getDateUntilNow: (date?: string | number | Date, nowLabel?: string, time?: string) => string;

  // This function converts the input string into a date value and returns
  // the ISO 8601 string representation of the date. It can pass dates between
  // the UI and backend APIs in a standard format.
  isoDateString: (date?: string) => string;

  // This function checks if the specified date is today.
  isToday: (date: string | Date) => boolean;

  // This function checks if the specified date is tomorrow.
  isTomorrow: (date: string | Date) => boolean;

  // This function checks if the specified date is yesterday.
  isYesterday: (date: string | Date) => boolean;

  // This function checks the date value provided for some particular
  // values and returns accordingly. Otherwise, returns it as `formatDate` would.
  smartFormatDate: (date?: string | number | Date) => string;

  // This function checks the date value provided for some particular values and
  // returns accordingly. Otherwise, returns it as `formatDateTime` would.
  smartFormatDateTime: (date: string | Date) => string | undefined;

  // This functions creates the difference between two dates in minutes.
  differenceInMinutes: (date1: number | Date, date2: number | Date) => number;

  // This function checks if the specified dates are on the same day.
  isSameDay: (dateLeft: number | Date, dateRight: number | Date) => boolean;

  // This function checks if the specified date is in the current calendar year.
  // True, if the date is in the current year; otherwise, false.
  isThisYear: (date: Date | number) => boolean;

  // Formats a date into a human-readable elapsed time string.
  // Returns strings like "now", "12 seconds ago", "3 hours ago",
  // "today", "yesterday", "3 weeks ago", etc.
  formatHumanElapsedTime: (date: string | Date) => string;

  // ==============================================================================================
  // Math Utilities

  // This function calculates the average of the specified values and returns it.
  avg: (values: number[], decimals?: number) => number;

  // This function calculates the sum of the specified values and returns it.
  sum: (values: number[]) => number;

  // ==============================================================================================
  // File Utilities

  // This function returns the specified file size in a compact form, such as
  // "112 B", "2.0 KiB", "23.4 KiB", "2.3 MiB", etc.
  formatFileSizeInBytes: (bytes: number) => string | undefined;

  // This function returns the type of the specified file.
  getFileExtension: (fileName: string) => string | undefined;

  // ==============================================================================================
  // Navigation Utilities

  // This function navigates to the specified `url`.
  // The options extend React Router's NavigateOptions with an optional `queryParams` map
  // used internally by NavigateAction to thread query params through the willNavigate handler.
  navigate: (url: To, options?: NavigateOptions & { queryParams?: Record<string, any> }) => void;

  // This property determines the base name used for the router.
  routerBaseName: string;

  // This property returns the current URL pathname (e.g. "/about"), or undefined in non-browser environments.
  pathname: string | undefined;

  // This function sets navigation event handlers (willNavigate and didNavigate).
  // Used by the App component to register navigation events.
  setNavigationHandlers?: (
    onWillNavigate?: (to: string | number, queryParams?: Record<string, any>) => false | void | null | undefined,
    onDidNavigate?: (to: string | number, queryParams?: Record<string, any>) => void,
  ) => void;

  // ==============================================================================================
  // Notifications and Dialogs

  // Options object form for the `confirm` function.
  // Instructs the browser to display a dialog with an optional message, and to
  // wait until the user either confirms or cancels the dialog. It returns a
  // boolean indicating whether OK (`true`) or Cancel (`false`) was selected.
  // Can be called with positional arguments or with a single options object:
  //   confirm(title?, message?, actionLabel?, cancelLabel?, width?)
  //   confirm({ title?, message?, actionLabel?, cancelLabel?, width? })
  confirm: {
    (options: ConfirmOptions): Promise<boolean>;
    (
      title?: string,
      message?: string,
      actionLabel?: string,
      cancelLabel?: string,
      width?: string,
    ): Promise<boolean>;
  };

  // This method displays the specified `error` (error message) on the UI.
  signError(error: Error | string): void;

  // The toast service that displays messages in the UI.
  toast: {
    (message: Message, opts?: ToastOptions): string;
    error: ToastHandler;
    success: ToastHandler;
    loading: ToastHandler;
    custom: ToastHandler;
    dismiss(toastId?: string): void;
    remove(toastId?: string): void;
    promise<T>(
      promise: Promise<T>,
      msgs: {
        loading: Renderable;
        success: ValueOrFunction<Renderable, T>;
        error: ValueOrFunction<Renderable, any>;
      },
      opts?: DefaultToastOptions,
    ): Promise<T>;
  };

  // ==============================================================================================
  // Theme-related

  // This property returns the ID of the currently active theme.
  activeThemeId: string;

  // This property returns the tone of the currently active theme ("light" or "dark").
  activeThemeTone: "light" | "dark";

  // This property returns an array of all available theme IDs.
  availableThemeIds: string[];

  // This function sets the current theme to the one with the specified `themeId`.
  setTheme: (themId: string) => void;

  // This function sets the current theme tone to the specified `tone` value
  // ("light" or "dark").
  setThemeTone: (newTone: "light" | "dark") => void;

  // This function toggles the current theme tone from "light" to "dark" or vice versa.
  toggleThemeTone: () => void;

  // This function gets the value of the specified theme variable.
  getThemeVar: (themeVar: string) => string | undefined;

  // ==============================================================================================
  // Users

  // This property gets the information about the logged-in user. If `null`, no user is
  // logged in. The user information may have any value; the app must be able to
  // leverage this information.
  loggedInUser: LoggedInUserDto | null;

  // This function sets the information about the logged-in user. The user information
  // may have any value; the app must be able to leverage this information.
  setLoggedInUser: (loggedInUser: any) => void;

  readonly resources?: Record<string, string>;

  // ==============================================================================================
  // Various Utilities

  capitalize: (s?: string) => string;
  pluralize: (number: number, singular: string, plural: string) => string;
  delay: (timeInMs: number, callback?: any) => Promise<void>;
  debounce: <F extends (...args: any[]) => any>(delayMs: number, func: F, ...args: any[]) => void;
  toHashObject: (arr: any[], keyProp: string, valueProp: string) => any;
  findByField: (arr: any[], field: string, value: any) => any;
  readonly embed: { isInIFrame: boolean };
  distinct: (arr: any[]) => any[];
  forceRefreshAnchorScroll: () => void;
  scrollBookmarkIntoView: (bookmarkId: string, smoothScrolling?: boolean) => void;

  // ==============================================================================================
  // Local Storage Utilities

  // Reads a value from localStorage using dot-path key semantics. Returns `fallback`
  // if the key is absent, unparseable, or any error occurs.
  readLocalStorage: (key: string, fallback?: any) => any;

  // Writes a value to localStorage using dot-path key semantics. Dot-path keys
  // merge into the existing root entry rather than replacing it.
  writeLocalStorage: (key: string, value: any) => void;

  // Deletes a value from localStorage using dot-path key semantics.
  // Removes the entire entry for simple keys; unsets a sub-path for dot-path keys.
  deleteLocalStorage: (key: string) => void;

  // Clears localStorage entries. With no argument, wipes all entries.
  // With a prefix, removes only entries whose root key starts with that prefix.
  clearLocalStorage: (prefix?: string) => void;

  // Alias for clearLocalStorage. Removes localStorage entries.
  // No argument wipes all entries; with a prefix removes only matching entries.
  // Preferred name for app-level "Reset settings" actions.
  resetLocalStorage: (prefix?: string) => void;

  // Returns all current localStorage entries as a plain object, with values JSON-parsed
  // where possible. Non-JSON values are returned as raw strings.
  getAllLocalStorage: () => Record<string, any>;

  // Timestamp (Date.now()) of the last localStorage mutation performed via the XMLUI
  // storage functions. Starts at 0 (no mutations since page load). Use with ChangeListener
  // to reactively respond to any storage change:
  //   <ChangeListener listenTo="{storageTimestamp}" onChange="..." />
  storageTimestamp: number;

  // ==============================================================================================
  // AppState Global State Management

  // This object provides methods for managing global application state with support for
  // nested paths, array operations, and immutable state updates.
  AppState: AppState;

  // ==============================================================================================
  // Managed Replacement Globals (Phase 2 — dom-api-hardening.md)

  // Log.debug/info/warn/error — sanctioned replacement for the banned `console.*` APIs.
  // Each call emits a 'log:<level>' Inspector trace entry. When appGlobals.silentConsole
  // is false (default), the call also mirrors to native console.*.
  Log: LogNamespace;

  // App.randomBytes(n) — returns n random bytes (1–1024). Sanctioned replacement for
  // the banned `crypto.getRandomValues`.
  // App.now() — high-resolution timestamp. Sanctioned replacement for `performance.now()`.
  // App.mark(label) / App.measure(label, from, to?) — trace-aware timing helpers.
  // App.fetch(input, init?) — managed fetch with CSRF and allowedOrigins enforcement.
  // App.environment — curated environment snapshot (isMobile, prefersDark, etc.).
  App: typeof AppUtilsNamespace & {
    fetch: (input: string | URL, init?: RequestInit) => Promise<Response>;
    environment: AppEnvironment;
  };

  // Clipboard.copy(text) — writes text to the clipboard. Sanctioned replacement for the
  // banned `navigator.clipboard.writeText`.
  Clipboard: typeof ClipboardNamespace;

  // ==============================================================================================
  // PubSub Messaging

  // The PubSub service instance for this app, providing subscribe/unsubscribe functionality.
  // Used internally by the pubsub behavior.
  pubSubService: PubSubService;

  // Publishes a topic with optional data to all subscribers.
  // Components can subscribe to topics using the subscribeToTopic prop and onTopicReceived event.
  publishTopic: (topic: string | number, data?: any) => void;
};

export const MediaBreakpointKeys = ["xs", "sm", "md", "lg", "xl", "xxl"] as const;
export type MediaBreakpointType = (typeof MediaBreakpointKeys)[number];

export type MediaSize = {
  phone: boolean;
  landscapePhone: boolean;
  tablet: boolean;
  desktop: boolean;
  largeDesktop: boolean;
  xlDesktop: boolean;
  smallScreen: boolean;
  largeScreen: boolean;
  size: MediaBreakpointType;
  sizeIndex: number;
};

export type LoggedInUserDto = {
  id: number;
  email: string;
  name: string;
  imageRelativeUrl: string;
  permissions: Record<string, string>;
};

export interface IApiInterceptorContext {
  isMocked: (url: string) => boolean;
  initialized: boolean;
  forceInitialize: () => void;
  interceptorWorker: SetupWorker | null;
  apiInstance: IApiInterceptor | null;
}

type Message = ValueOrFunction<Renderable, Toast>;
type ToastHandler = (message: Message, options?: ToastOptions) => string;
