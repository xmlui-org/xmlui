import type { To, NavigateOptions } from "react-router-dom";
import type { QueryClient } from "@tanstack/react-query";
import type { ToastOptions, Renderable, ValueOrFunction, DefaultToastOptions, Toast } from "react-hot-toast";

import type { ActionFunction } from "./ActionDefs";

/**
 * This interface defines the properties and services of an app context that the application components can use when
 * implementing their behavior.
 */
export type AppContextObject = {
  /**
   * Accept other methods
   */
  [x: string]: unknown;

  /**
   * Navigate from the current location to the specified one using the given options.
   * @param to New app location
   * @param options Navigation options
   */
  readonly navigate: (to: To, options?: NavigateOptions) => void;

  /**
   * Display a confirmation dialog in the UI and retrieve the confirmation result.
   * @param title Dialog title
   * @param message Confirmation message
   * @param actionMessage Optional action message
   * @return True, if the user confirmed the action; otherwise, false.
   */
  readonly confirm: (title: string, message?: string, actionMessage?: string) => Promise<boolean>;

  /**
   * Get the information about the logged-in user. If null, no user is logged in.
   */
  readonly loggedInUser: LoggedInUserDto | null;
  readonly setLoggedInUser: (loggedInUser: any) => void;

  /**
   * The `QueryClient` object of the react-query library AppEngine uses for data fetching purposes
   */
  readonly queryClient: QueryClient | null;

  /**
   * The base name of the router
   */
  readonly routerBaseName: string;

  /**
   * Get an unformatted Date string that is JSON friendly.
   * If no input param is set, use the current date time.
   * @param date Potential Date string
   */
  readonly isoDateString: (date?: string) => string;

  /**
   * A function that formats a date value to a string
   * @param date Date to format
   */
  readonly formatDate: (date: string | Date) => string | undefined;

  /**
   * A function that formats a date and time value to a string
   * @param date Date to format
   */
  readonly formatDateTime: (date: any) => string | undefined;

  /**
   * A function that formats a time value to a string
   * @param date Date to format
   */
  readonly formatTime: (date: any) => string | undefined;

  /**
   * A function that formats a file size number to a friendly string
   * @param bytes Number of bytes to format
   */
  readonly formatFileSizeInBytes: (bytes: number) => string | undefined;

  /**
   * A function that retrieves the extension of the specified file name
   * @param fileName Filename to check for extension
   */
  readonly getFileExtension: (fileName: string) => string | undefined;

  /**
   * Indicates that the root component represents a standalone application that runs without interacting with the
   * storage engine.
   */
  readonly standalone?: boolean;
  readonly decorateComponentsWithTestId?: boolean;
  readonly debugEnabled?: boolean;

  readonly signError: (error: Error | string) => void;
  readonly toast: {
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
      opts?: DefaultToastOptions
    ): Promise<T>;
  };

  readonly activeThemeUid: string;
  readonly availableThemeUids: string[];
  readonly setTheme: (newTheme: string) => void;
  readonly globals?: Record<string, any>;
  readonly resources?: Record<string, string>;

  readonly apiInterceptorContext: IApiInterceptorContext;
  readonly formatTimeWithoutSeconds: (date: string | Date) => string | undefined;
  readonly formatDateWithoutYear: (date: string | Date) => string | undefined;
  readonly smartFormatDateTime: (date: string | Date) => string | undefined;
  readonly smartFormatDate: (date: string | Date) => string | undefined;
  readonly capitalize: (s?: string) => string;
  readonly pluralize: (number: number, singular: string, plural: string) => string;
  readonly delay: (timeInMs: number, callback?: any) => Promise<void>;
  readonly getDate: () => Date;
  readonly getDateUntilNow: (date?: string | number | Date, nowLabel?: string, time?: string) => string;
  readonly Actions: Record<string, ActionFunction>;
  readonly Transforms: Record<string, any>;
  readonly Utils: Record<string, any>;
  readonly DateUtils: Record<string, any>;
  readonly embed: { isInIFrame: boolean };
  readonly environment: { isWindowFocused: boolean };
  readonly mediaSize: {
    phone: boolean;
    landscapePhone: boolean;
    tablet: boolean;
    desktop: boolean;
    largeDesktop: boolean;
    xlDesktop: boolean;
    smallScreen: boolean;
    largeScreen: boolean;
  };
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
}

type Message = ValueOrFunction<Renderable, Toast>;
type ToastHandler = (message: Message, options?: ToastOptions) => string;
