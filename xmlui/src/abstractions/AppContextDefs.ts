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

/**
 * This interface defines the properties and services of an app context that the application components can use when
 * implementing their behavior.
 */
export type AppContextObject = {
  /**
   * Accept other methods
   */
  [x: string]: unknown;

  // ==============================================================================================
  // Engine-realated

  version: string;

  // ==============================================================================================
  // Actions namespace

  Actions: Record<string, ActionFunction>;

  // ==============================================================================================
  // App-Specific

  /**
   * This property returns the context object of the API interceptor.
   * @internal
   */
  apiInterceptorContext: IApiInterceptorContext;

  /**
   * This property returns a hash object containing all application-global settings
   * defined in the app's configuration file.
   */
  appGlobals?: Record<string, any>;

  /**
   * Indicates that the application is running in debug-enabled mode.
   * @internal
   */
  debugEnabled?: boolean;

  /**
   * Indicates that components are decorated with test IDs used for e2e tests.
   * @internal
   */
  decorateComponentsWithTestId?: boolean;

  /**
   * This property returns an object with some properties of the current environment.
   */
  environment: { isWindowFocused: boolean };

  /**
   * This property returns an object with information about the current media size.
   */
  mediaSize: MediaSize;

  /**
   * The `QueryClient` object of the react-query library XMLUI uses for data fetching purposes
   * @internal
   */
  queryClient: QueryClient | null;

  /**
   * This property returns `true` if the app is a standalone XMLUI app; otherwise
   * (for example, as part of a website), it returns `false`.
   */
  standalone?: boolean;

  // ==============================================================================================
  // Date Utilities

  /**
   * This function formats the specified value's date part into a local date string
   * (according to the machine's local settings).
   * @param date Date to format
   */
  formatDate: (date: string | Date) => string | undefined;

  /**
   * This function formats the specified value into a local
   * date and time string (according to the machine's local settings).
   * @param date Date to format
   */
  formatDateTime: (date: any) => string | undefined;

  /**
   * This function formats the specified value's date part (without year)
   * into a local date string (according to the machine's local settings).
   * @param date Date to format
   */
  formatDateWithoutYear: (date: string | Date) => string | undefined;

  /**
   * This function formats the specified value's time part into a local date
   * string (according to the machine's local settings).
   * @param date Date to format
   */
  formatTime: (date: any) => string | undefined;

  /**
   * This function formats the specified value's time part (without seconds)
   * into a local date string (according to the machine's local settings).
   * @param date Date to format
   */
  formatTimeWithoutSeconds: (date: string | Date) => string | undefined;

  /**
   * This function creates a date from the specified input value. If no input
   *  is provided, it returns the current date and time.
   */
  getDate: (date?: string | number | Date) => Date;

  /**
   * This function calculates the difference between the current date and the
   * provided one and returns it in a human-readable form, such as "1 month", "2 weeks", etc.
   * @param date
   * @param nowLabel
   * @param time
   * @returns
   */
  getDateUntilNow: (date?: string | number | Date, nowLabel?: string, time?: string) => string;

  /**
   * This function converts the input string into a date value and returns
   * the ISO 8601 string representation of the date. It can pass dates between
   * the UI and backend APIs in a standard format.
   * @param date Date to format
   */
  isoDateString: (date?: string) => string;

  /**
   * This function checks if the specified date is today.
   * @param date Date to check
   */
  isToday: (date: string | Date) => boolean;

  /**
   * This function checks if the specified date is tomorrow.
   * @param date Date to check
   */
  isTomorrow: (date: string | Date) => boolean;

  /**
   * This function checks if the specified date is yesterday.
   * @param date Date to check
   */
  isYesterday: (date: string | Date) => boolean;

  /**
   * This function checks the date value provided for some particular
   * values and returns accordingly. Otherwise, returns it as `formatDate` would.
   * @param date Date to format
   */
  smartFormatDate: (date?: string | number | Date) => string;

  /**
   * This function checks the date value provided for some particular values and
   * returns accordingly. Otherwise, returns it as `formatDateTime` would.
   * @param date Date to format
   */
  smartFormatDateTime: (date: string | Date) => string | undefined;

  /**
   * This functions creates the difference between two dates in minutes.
   * @param date1 First date
   * @param date2 Second date
   * @returns The difference in minutes
   */
  differenceInMinutes: (date1: number | Date, date2: number | Date) => number;

  /**
   * This function checks if the specified dates are on the same day.
   * @param dateLeft First date
   * @param dateRight Second Date
   * @returns True, if the dates are on the same day; otherwise, false.
   */
  isSameDay: (dateLeft: number | Date, dateRight: number | Date) => boolean;

  /**
   * This function checks if the specified date is in the current calendar year.
   * @param date Date to check
   * @returns True, if the date is in the current year; otherwise, false.
   */
  isThisYear: (date: Date | number) => boolean;

  // ==============================================================================================
  // Math Utilities

  /**
   * This function calculates the average of the specified values and returns it.
   * @param values Values to calculate the average
   * @param decimals Number of decimal places to round the result
   */
  avg: (values: number[], decimals?: number) => number;

  /**
   * This function calculates the sum of the specified values and returns it.
   * @param values Values to calculate the sum
   */
  sum: (values: number[]) => number;

  // ==============================================================================================
  // File Utilities

  /**
   * This function returns the specified file size in a compact form, such as
   * "112 B", "2.0 KiB", "23.4 KiB", "2.3 MiB", etc.
   * @param bytes Number of bytes to format
   */
  formatFileSizeInBytes: (bytes: number) => string | undefined;

  /**
   * This function returns the type of the specified file.
   * @param fileName Filename to check for extension
   */
  getFileExtension: (fileName: string) => string | undefined;

  // ==============================================================================================
  // Navigation Utilities

  /**
   * This function navigates to the specified `url`.
   * @param url New app location
   * @param options Navigation options
   */
  navigate: (url: To, options?: NavigateOptions) => void;

  /**
   * This property determines the base name used for the router.
   */
  routerBaseName: string;

  // ==============================================================================================
  // Notifications and Dialogs

  /**
   * Instructs the browser to display a dialog with an optional message, and to wait until the
   * user either confirms or cancels the dialog. It returns a boolean indicating whether OK
   * (`true`) or Cancel (`false`) was selected.
   * @param title Dialog title
   * @param message Confirmation message
   * @param actionLabel Optional action label
   * @return True, if the user confirmed the action; otherwise, false.
   */
  confirm: (title: string, message?: string, actionLabel?: string) => Promise<boolean>;

  /**
   * This method displays the specified `error` (error message) on the UI.
   * @param error Error to display
   */
  signError(error: Error | string): void;

  /**
   * The toast service that displays messages in the UI.
   */
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

  /**
   * This property returns the ID of the currently active theme.
   */
  activeThemeId: string;

  /**
   * This property returns the tone of the currently active theme ("light" or "dark").
   */
  activeThemeTone: "light" | "dark";

  /**
   * This property returns an array of all available theme IDs.
   */
  availableThemeIds: string[];

  /**
   * This function sets the current theme to the one with the specified `themeId`.
   * @param themId New theme to set
   */
  setTheme: (themId: string) => void;

  /**
   * This function sets the current theme tone to the specified `tone` value ("light" or "dark").
   * @param newTone New tone to set
   */
  setThemeTone: (newTone: "light" | "dark") => void;

  /**
   * This function toggles the current theme tone from "light" to "dark" or vice versa.
   */
  toggleThemeTone: () => void;

  // ==============================================================================================
  // Users

  /**
   * This property gets the information about the logged-in user. If `null`, no user is
   * logged in. The user information may have any value; the app must be able to leverage
   * this information.
   */
  loggedInUser: LoggedInUserDto | null;

  /**
   * This function sets the information about the logged-in user. The user information
   * may have any value; the app must be able to leverage this information.
   * @param loggedInUser Logged-in user information
   */
  setLoggedInUser: (loggedInUser: any) => void;

  readonly resources?: Record<string, string>;

  // ==============================================================================================
  // Various Utilities

  capitalize: (s?: string) => string;
  pluralize: (number: number, singular: string, plural: string) => string;
  delay: (timeInMs: number, callback?: any) => Promise<void>;
  toHashObject: (arr: any[], keyProp: string, valueProp: string) => any;
  findByField: (arr: any[], field: string, value: any) => any;
  readonly embed: { isInIFrame: boolean };
  distinct: (arr: any[]) => any[];
  forceRefreshAnchorScroll: ()=>void;
};

export type MediaBreakpointType = "xs" | "sm" | "md" | "lg" | "xl" | "xxl";

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
  interceptorWorker: SetupWorker | null;
}

type Message = ValueOrFunction<Renderable, Toast>;
type ToastHandler = (message: Message, options?: ToastOptions) => string;
