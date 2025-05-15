# Global Functions and Variables

XMLUI offers dozens of global functions and properties for use in XMLScript code. This document provides a detailed description of them.

## Actions Namespace

XMLUI provides an `Actions` namespace to collect frequently used application actions you can invoke from scripts. When calling them, use the `Actions` namespace like in the following example:

```ts
Actions.callApi({ url: "/api/contacts/123", method: "delete" });
```

### `Actions.callApi`

```ts
function Actions.callApi(options: { 
  method: "get" | "post" | "put" | "delete";
  url: string;
  rawBody?: any;
  body?: any;
  queryParams?: Record<string, any>;
  headers?: Record<string, any>;
  payloadType?: string;
  invalidates?: string | string[];
  updates?: string | string[];
  confirmTitle?: string;
  confirmMessage?: string;
  confirmButtonLabel?: string;
  beforeRequest?: string;
  onSuccess?: string;
  onProgress?: string;
  onError?: string;
  params: any;
  optimisticValue: any;
  when: string;
  getOptimisticValue: string;
  inProgressNotificationMessage?: string;
  completedNotificationMessage?: string;
  errorNotificationMessage?: string;
  uid?: string;
}): Promise<any>;
```

This function invokes an API endpoint with the specified options.

### `Actions.download`

```ts
function Actions.download(options: { 
  fileName: string;
  params: any;
  method: "get" | "post" | "put" | "delete";
  url: string;
  rawBody?: any;
  body?: any;
  queryParams?: Record<string, any>;
  headers?: Record<string, any>;
  payloadType?: string;
}): Promise<any>;
```

This function downloads a file from the specified URL.

### `Actions.upload`

```ts 
function Actions.upload(options: { 
  file: File;
  formParams?: Record<string, any>;
  asForm?: boolean;
  method: "get" | "post" | "put" | "delete";
  url: string;
  rawBody?: any;
  body?: any;
  queryParams?: Record<string, any>;
  headers?: Record<string, any>;
  payloadType?: string;
  invalidates?: string | string[];
  params: any;
  chunkSizeInBytes?: number;
  onError?: string;
  onProgress?: (...args: any) => void;
}): Promise<any>;
```

This function uploads a file to the specified URL.

## App-Specific Globals

### `appGlobals`

```ts
get appGlobals: Record<string, any>;
```

This property returns a hash object containing all application-global settings defined in the app's configuration file.

### `environment`

```ts
get environment: {
  isWindowFocused: boolean;
};
```

Returns an object with some properties of the current environment.

### `mediaSize`

```ts
get mediaSize: {
  phone: boolean;
  landscapePhone: boolean;
  tablet: boolean;
  desktop: boolean;
  largeDesktop: boolean;
  xlDesktop: boolean;
  smallScreen: boolean;
  largeScreen: boolean;
  size: "xs" | "sm" | "md" | "lg" | "xl" | "xxl";
};
```

This property returns an object with information about the current media size. The `phone`, `landscapePhone`, `tablet`, `desktop`, `largeDesktop`, and `xlDesktop` flogs indicate the current app window's viewport size. Only one of these flags is `true`; the others are `false`.
`smallScreen` is set to `true` if the current size is less than `desktop`. `largeScreen` is set to `true` if the current size is `desktop` or bigger.

### `standalone`

```ts
get standalone: boolean;
```

This property returns `true` if the app is a standalone XMLUI app; otherwise (for example, as part of a website), it returns `false`.

## Date Utilities

### `differenceInMinutes`

```ts
function differenceInMinutes: (date1: number | Date, date2: number | Date): number;
```

This function returns the difference between the two date parameters in minutes.

### `formatDate`

```ts
function formatDate(date: string | Date): string;
```

This function formats the specified value's date part into a local date string (according to the machine's local settings).

### `formatDateTime`

```ts
function formatDateTime(date: string | Date): string;
```

This function formats the specified value into a local date and time string (according to the machine's local settings).

### `formatDateWithoutYear`

```ts
function formatDateWithoutYear(date: string | Date): string;
```

This function formats the specified value's date part (without year) into a local date string (according to the machine's local settings).

### `formatTime`

```ts
function formatTime(date: string | Date): string;
```

This function formats the specified value's time part into a local date string (according to the machine's local settings).

### `formatTimeWithoutSeconds`

```ts
function formatTimeWithoutSeconds(date: string | Date): string;
```

Format the specified value's time part (without seconds) into a local date string (according to the machine's local settings).

### `getDate`

```ts
function function getDate(date?: string | number | Date): Date;
```

This function creates a date from the specified input value. If no input is provided, it returns the current date and time.

### `getDateUntilNow`

```ts
function function getDateUntilNow(date?: string | number | Date): string;
```

This function calculates the difference between the current date and the provided one and returns it in a human-readable form, such as "1 month", "2 weeks", etc.

### `isoDateString`

```ts
function isoDateString(date?: string): string;
```

This function converts the input string into a date value and returns the ISO 8601 string representation of the date. It can pass dates between the UI and backend APIs in a standard format.

### `differenceInMinutes`

```ts
function differenceInMinutes: (date1: number | Date, date2: number | Date): number;
```

This function returns the difference between the two date parameters in minutes.

### `isSameDay`

```ts
function isSameDay: (dateLeft: number | Date, dateRight: number | Date): boolean;
```

This function checks if the two dates specified in the parameters are on the same calendar day.

### `isThisYear`

```ts
function (date: Date | number): boolean;
```

This function checks if the specified date is in this calendar year.

### `isTomorrow`

```ts
function isTomorrow(date?: string | Date): boolean;
```

This function checks if the specified date is tomorrow.

### `isYesterday`

```ts
function isYesterday(date?: string | number | Date): boolean;
```

This function checks if the specified date is yesterday.

### `smartFormatDate`

```ts
function function smartFormatDate(date?: string | number | Date): string;
```

This function checks the date value provided for some particular values and returns accordingly. Otherwise, returns it as `formatDate` would. Special values returned:
- No date value provided: "-"
- The date is today: returns only the date value with `formatDate`
- The date is this week: return the relative time difference, such as "last Monday"

### `smartFormatDateTime`

```ts
function function smartFormatDateTime(date?: string | number | Date): string;
```

This function checks the date value provided for some particular values and returns accordingly. Otherwise, returns it as `formatDateTime` would. Special values returned:
- No date value provided: "-"
- The date is today: returns only the time value with `formatTime`
- The date is this week: return the relative time difference, such as "last Monday at 2:00 AM"

## Engine-Related Globals

### `version`

```ts
get version: string;
```

This property retrieves the version of the XMLUI engine.


## File Utilities

### `formatFileSizeInBytes`

```ts
function formatFileSizeInBytes(size?: number): string;
```

This function returns the specified file size in a compact form, such as "112 B", "2.0 KiB", "23.4 KiB", "2.3 MiB", etc.

### `getFileExtension`

```ts
function getFileExtension(filename: string, mimetype?: string): string;
```

This function returns the type of the specified file.  
- If only `filename` is specified, return the extension inferred from the file name. 
- If only `mime-type` is specified, it returns the type inferred from the type name.
- If both are specified, and the inferred file extension equals the inferred mime type, that value is returned.
- Otherwise, it returns undefined.

## Math Utilities

### `avg`

```ts 
function avg(numbers: number[], decimals?: number): number;
```

This function calculates the average of the specified numbers and rounds it to the specified number of `decimals`. If `decimals` is not specified, the result is not rounded.

### `sum`

```ts
function sum(numbers: number[]): number;
```

This function calculates the sum of the specified numbers.

## Navigation Utilities

### `navigate`

```ts
function navigate(url: string): void;
```

This function navigates to the specified `url`.

### `routerBaseName`

```ts
get routerBaseName: string;
```

This property gets the base name used for the router. 

## Notifications and Dialogs

### `confirm`

```ts
function confirm: (title: string, message?: string, actionLabel?: string): boolean
```

Instructs the browser to display a dialog with a confirmation message, and to wait until the user either confirms or cancels the dialog. It returns a boolean indicating whether OK (`true`) or Cancel (`false`) was selected.

- `title`: The title of the dialog
- `message`: The message to display
- `actionLabel`: The label of the action button

### `signError`

```ts
function signError(error: Error | string): void;
```

This method displays the specified `error` (error message) on the UI.

### `toast`

```ts
function toast(message: string, options: ToastOptions): void;
```

This function displays a neutral toast with the specified `message`.

All toast methods allow the using an option object (`ToastOptions`) with these properties:
- `id` (string): an optional ID. This identifier can be used to remove the toast programmatically.
- `duration` (number): The timeout of the notification (in milliseconds). After this timeout, the notification is removed from the screen.
- `position` (string): The notification's position; one of these values: `top-left`, `top-center`, `top-right`,  `bottom-left`, `bottom-center`, or `bottom-right`.

Examples:
```js
// --- Message for 2 seconds
toast("Hello, world!", { duration: 2000 });

// --- Message at the top-left corner
toast("Hello, world!", { position: "top-left" });
```

### `toast.error`

```ts
function toast.error(message: string, options: ToastOptions): void;
```

This function displays a toast with the specified error notification `message`.

### `toast.loading`

```ts
function toast.loading(message: string, options: ToastOptions): void;
```

This function displays a toast with the specified notification `message` indicating an operation's in-progress state.

### `toast.remove`

```ts
function toast.remove(id: string): void;
```

This function removes the toast with the specified `id`.

### `toast.success`

```ts
function toast.success(message: string, options: ToastOptions): void;
```

This function displays a toast with the specified success notification `message`.

## Theme-Related

### `activeThemeId`

```ts
get activeThemeId: string;
```

This property returns the ID of the currently active theme.

### `activeThemeTone`

```ts
get activeThemeTone: string;
```

This property returns the tone of the currently active theme ("light" or "dark").

### `availableThemeIds`

```ts
get availableThemeIds: string[];
```

This property returns an array of all available theme IDs.

### `setTheme`

```ts
setTheme: (themId: string): void;
```

This function sets the current theme to the one with the specified `themeId`.

### `setThemeTone`

```ts
setThemeTone: (tone: string): void;
```

This function sets the current theme tone to the specified `tone` value ("light" or "dark").

### `toggleThemeTone`

```ts
toggleThemeTone: (): void;
```

This function toggles the current theme tone from "light" to "dark" or vice versa.

## Users

XMLUI does not constrain what user information may contain; it may be a single identifier or a set of user-specific properties. The app is responsible for processing and displaying this information.

### `loggedInUser`

```ts
get loggedInUser: any | null;
```

This property gets the information about the logged-in user. If `null`, no user is logged in.


### `setLoggedInUser`

```ts
setLoggedInUser: (loggedInUser: any): void;
```

This function sets the information about the logged-in user.

## Various Functions

### `capitalize`

```ts
function capitalize(input?: string): string;
```

Converts the first character of string to upper case and the remaining to lower case.

### `defaultTo`

```ts
function defaultTo(value: any, defaultValue: any): any;
```

Provides a fallback value (`defaultValue`) if the specified `value` is null or undefined.

### `delay`

```ts
function delay(ms: number): Promise<void>;
```

Delays the execution of the next line of code by the specified number of milliseconds.

### `distinct`

```ts
function distinct(arr: any[]): any[];
```

Returns an array with all duplicate values removed.

### `getPropertyByPath`

```ts
function getPropertyByPath(obj: any, path: string): any;
```

Gets the property of `obj` at the specified `path`. `path` is a string with the chained property names separated by dots.

### `pluralize`

```ts
function pluralize(value: number, singular: string, plural: string): string;
```

When the value is equal to one, returns `singular`; otherwise, `plural.`

### `toHashObject`

```ts
function toHashObject(arr: any[], keyProp: string, valueProp: string): any;
```

This function converts an array of objects into a hash object.
- `keyProp`: The name of the object property that acts as the key
- `valueProp`: The name of the object property that acts as the value

Let's assume the following array of objects:
```json
[
  { "key": "key1", "value": "value1" },
  { "key": "key2", "value": "value2" },
  { "key": "key3", "value": "value3" }
]

Invoking `toHashObject` with the following parameters:

```ts
toHashObject(arr, "key", "value");
```

Returns the following object:

```json
{
  "key1": "value1",
  "key2": "value2",
  "key3": "value3"
}
```
