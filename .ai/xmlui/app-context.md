# Global Context & Utilities (AppContext) — AI Reference

## Overview

`AppContextObject` is the global utility bag available in every XMLUI expression and event handler.
It is assembled in `AppContent.tsx`, stored in a React context, and injected into the expression
evaluation environment alongside each component's own state. Accessing `formatDate(x)` or
`navigate("/path")` in markup works because AppContext spreads these functions into the global
scope of every expression.

**Source of truth:** `xmlui/src/abstractions/AppContextDefs.ts`  
**Implementation:** `xmlui/src/components-core/rendering/AppContent.tsx`

---

## How AppContext Reaches Expressions

1. `AppContent` assembles `appContextValue` with `useMemo()` and wraps the tree in `<AppContext.Provider>`.
2. `StateContainer` calls `useAppContext()` to retrieve the value.
3. The value is spread into each component's expression evaluation context alongside container state.
4. Expressions call AppContext functions directly: `navigate("/home")`, `formatDate(date)`, `avg([1,2,3])`.

AppContext is **NOT** one of the 6 state composition layers. It is a separate evaluation context
injected alongside state layers, not merged into container state.

---

## Complete Function & Property Reference

### Engine

| Name | Type | Description |
|---|---|---|
| `version` | `string` | XMLUI framework version string |

---

### Actions Namespace

| Name | Type | Description |
|---|---|---|
| `Actions` | `Record<string, ActionFunction>` | All registered action functions from core, app, and extensions |

`Actions.myActionName(args)` invokes an action registered in the ComponentRegistry. Actions run
in the full action execution pipeline (async, with success/error handling), unlike direct function calls.

---

### App Configuration & Environment

| Name | Type | Description |
|---|---|---|
| `appGlobals` | `Record<string, any>` | App-level globals from `config.json` or `App` props |
| `standalone` | `boolean \| undefined` | `true` if running as a standalone XMLUI app |
| `appIsInShadowDom` | `boolean \| undefined` | `true` if app root is inside a Shadow DOM |
| `debugEnabled` | `boolean \| undefined` | Debug mode active |
| `decorateComponentsWithTestId` | `boolean \| undefined` | Adds `data-testid` attrs for testing |
| `environment` | `{ isWindowFocused: boolean }` | Browser tab focus state |
| `mediaSize` | `MediaSize` | Current viewport breakpoint (see below) |
| `queryClient` | `QueryClient \| null` | @tanstack/react-query client instance |
| `embed` | `{ isInIFrame: boolean }` | Embedding context |
| `resources` | `Record<string, string> \| undefined` | Localization string map |

#### MediaSize Type

```ts
type MediaSize = {
  phone: boolean;          // xs (≤ mobile)
  landscapePhone: boolean; // sm
  tablet: boolean;         // md
  desktop: boolean;        // lg
  largeDesktop: boolean;   // xl
  xlDesktop: boolean;      // xxl
  smallScreen: boolean;    // phone || landscapePhone
  largeScreen: boolean;    // desktop || largeDesktop || xlDesktop
  size: "xs" | "sm" | "md" | "lg" | "xl" | "xxl";
  sizeIndex: number;       // 0–5 for xs–xxl
};
```

Usage: `<HStack visible="{mediaSize.desktop}">` or `<Text>{mediaSize.size}</Text>`

---

### Date Utilities

All functions are wrappers over **date-fns**. Locale follows the machine's system locale.

| Function | Signature | Returns | Example Output |
|---|---|---|---|
| `getDate` | `(date?) → Date` | `Date` object | — |
| `isoDateString` | `(date?) → string` | ISO 8601 string | `"2026-04-16T14:30:00.000Z"` |
| `formatDate` | `(date) → string \| undefined` | Local date string | `"4/16/2026"` |
| `formatDateWithoutYear` | `(date) → string \| undefined` | Date without year | `"Apr 16"` |
| `formatDateTime` | `(date) → string \| undefined` | Date + time | `"4/16/2026, 2:30 PM"` |
| `formatTime` | `(date) → string \| undefined` | Time only | `"2:30:00 PM"` |
| `formatTimeWithoutSeconds` | `(date) → string \| undefined` | Time without seconds | `"2:30 PM"` |
| `smartFormatDate` | `(date?) → string` | "Today", "Yesterday", or date | `"Today"`, `"Apr 15"` |
| `smartFormatDateTime` | `(date) → string \| undefined` | Smart date + time | `"Today, 2:30 PM"` |
| `getDateUntilNow` | `(date?, nowLabel?, time?) → string` | Human elapsed | `"2 weeks"`, `"1 month"` |
| `formatHumanElapsedTime` | `(date) → string` | Elapsed string | `"now"`, `"3 hours ago"`, `"yesterday"` |
| `isToday` | `(date) → boolean` | Date is today | — |
| `isYesterday` | `(date) → boolean` | Date is yesterday | — |
| `isTomorrow` | `(date) → boolean` | Date is tomorrow | — |
| `isThisYear` | `(date) → boolean` | Date is in current year | — |
| `isSameDay` | `(d1, d2) → boolean` | Two dates are the same day | — |
| `differenceInMinutes` | `(d1, d2) → number` | Minutes between two dates | — |

---

### Math Utilities

| Function | Signature | Description |
|---|---|---|
| `avg` | `(values: number[], decimals?: number) → number` | Average of array. Returns `0` for empty input. `decimals` rounds via `toFixed`. |
| `sum` | `(values: number[]) → number` | Sum of array using `reduce`. |

Note: `min` and `max` are NOT in AppContext. Use JavaScript's `Math.min(...arr)` / `Math.max(...arr)`.

---

### File Utilities

| Function | Signature | Returns | Example |
|---|---|---|---|
| `formatFileSizeInBytes` | `(bytes: number) → string \| undefined` | Human-readable size | `"2.3 MiB"`, `"112 B"` |
| `getFileExtension` | `(fileName: string) → string \| undefined` | File extension | `"pdf"`, `"xlsx"` |

---

### Navigation

| Name | Signature / Type | Description |
|---|---|---|
| `navigate` | `(url, options?) → void` | Navigate to path. `options.queryParams` appended as `?k=v`. |
| `pathname` | `string \| undefined` | Current URL pathname. |
| `routerBaseName` | `string` | Router base path. |
| `setNavigationHandlers` | `(onWillNavigate?, onDidNavigate?) → void` | Register navigation lifecycle hooks (used by `App` component). |

---

### Notifications & Dialogs

#### confirm()

```ts
confirm(title?, message?, actionLabel?, cancelLabel?, width?): Promise<boolean>
confirm(options: ConfirmOptions): Promise<boolean>
```

Opens a modal dialog. Returns `Promise<boolean>` — `true` if confirmed, `false` if cancelled.

```xml
<Button onClick="async () => { if (await confirm('Delete?', 'This cannot be undone.')) deleteItem() }">
  Delete
</Button>
```

#### signError()

```ts
signError(error: Error | string): void
```

Displays an error message in the UI (implementation-specific to the app).

#### toast

```ts
toast(message, opts?): string           // Returns toast ID
toast.success(message, opts?): string
toast.error(message, opts?): string
toast.loading(message, opts?): string
toast.custom(message, opts?): string
toast.dismiss(id?): void               // Dismiss specific or all
toast.remove(id?): void                // Remove without animation
toast.promise<T>(promise, msgs, opts?): Promise<T>  // Auto success/error
```

Powered by **react-hot-toast**. Returns toast ID for later `dismiss()`.

```xml
<Button onClick="toast.success('Saved!')">Save</Button>
<Button onClick="toast.promise(save(), { loading: 'Saving…', success: 'Saved!', error: 'Failed' })">
  Save with promise
</Button>
```

---

### Theme Management

| Name | Type | Description |
|---|---|---|
| `activeThemeId` | `string` | ID of the currently active theme |
| `activeThemeTone` | `"light" \| "dark"` | Current tone |
| `availableThemeIds` | `string[]` | All registered theme IDs |
| `setTheme(themeId)` | `(string) → void` | Switch to a different theme |
| `setThemeTone(tone)` | `("light" \| "dark") → void` | Set light or dark mode |
| `toggleThemeTone()` | `() → void` | Toggle between light and dark |
| `getThemeVar(name)` | `(string) → string \| undefined` | Read a CSS theme variable value |

---

### User Management

| Name | Type | Description |
|---|---|---|
| `loggedInUser` | `LoggedInUserDto \| null` | Current user; `null` when no user logged in |
| `setLoggedInUser(user)` | `(any) → void` | Set current user (triggers re-renders via reactive binding) |

```ts
type LoggedInUserDto = {
  id: number;
  email: string;
  name: string;
  imageRelativeUrl: string;
  permissions: Record<string, string>;
};
```

---

### LocalStorage Utilities

All use **dot-path key semantics**: `"prefs.theme.tone"` reads `localStorage["prefs"]` then
accesses the `theme.tone` sub-path via lodash `get`.

| Function | Signature | Description |
|---|---|---|
| `readLocalStorage` | `(key, fallback?) → any` | Read value; returns `fallback` on missing/error |
| `writeLocalStorage` | `(key, value) → void` | Write value; deep-merges for dot-path keys |
| `deleteLocalStorage` | `(key) → void` | Delete by dot-path |
| `clearLocalStorage` | `(prefix?) → void` | Clear all or by root-key prefix |
| `resetLocalStorage` | `(prefix?) → void` | Alias of `clearLocalStorage` |
| `getAllLocalStorage` | `() → Record<string, any>` | Snapshot of all entries |
| `storageTimestamp` | `number` | Mutation timestamp for reactive listening |

**Reactivity:** `storageTimestamp` increments after every mutating call. Use with `ChangeListener`:

```xml
<ChangeListener listenTo="{storageTimestamp}" onChange="reloadPreferences()" />
```

---

### AppState (Global State)

| Name | Type | Description |
|---|---|---|
| `AppState` | `AppState` | Global mutable state object for cross-component data sharing |

`AppState` supports nested paths and array operations for state mutations. Changes are reactive.

---

### PubSub Messaging

| Name | Signature | Description |
|---|---|---|
| `publishTopic` | `(topic, data?) → void` | Publish a message to all subscribers |
| `pubSubService` | `PubSubService` | Full pub/sub service instance |

---

### Miscellaneous Utilities

| Function | Signature | Description |
|---|---|---|
| `capitalize` | `(s?) → string` | Capitalizes first letter (lodash) |
| `pluralize` | `(n, singular, plural) → string` | Selects singular/plural form |
| `defaultTo` | `(value, defaultValue) → any` | Returns `defaultValue` if `value` is null/undefined/NaN |
| `delay` | `(ms, callback?) → Promise<void>` | Async delay |
| `debounce` | `(ms, fn, ...args) → void` | Debounce a function call |
| `toHashObject` | `(arr, keyProp, valueProp) → object` | Convert array to keyed object |
| `findByField` | `(arr, field, value) → any` | Find first array element by field value |
| `distinct` | `(arr) → any[]` | Remove duplicates from array |
| `forceRefreshAnchorScroll` | `() → void` | Force hash-based scroll recalculation |
| `scrollBookmarkIntoView` | `(id, smooth?) → void` | Scroll to bookmarked element |

---

### API Interceptor Context

```ts
interface IApiInterceptorContext {
  isMocked(url: string): boolean;       // Is this URL mocked by MSW?
  initialized: boolean;                  // Has the interceptor been set up?
  forceInitialize(): void;              // Trigger lazy initialization
  interceptorWorker: SetupWorker | null; // MSW (Mock Service Worker) instance
  apiInstance: IApiInterceptor | null;  // Custom interceptor implementation
}
```

Access via `apiInterceptorContext.isMocked("/api/users")` in debugging scenarios.

---

## Adding New Global Functions

1. Create a new module in `xmlui/src/components-core/appContext/` (e.g., `my-utils.ts`):

```ts
export const myUtils = {
  myFunction: (arg: string): string => arg.toUpperCase(),
};
```

2. Import in `AppContent.tsx` and spread into `appContextValue`:

```ts
import { myUtils } from "../appContext/my-utils";
// ...
const appContextValue = useMemo(() => ({
  ...dateFunctions,
  ...myUtils,  // ← add here
  // ...
}), [...]);
```

3. Add to `AppContextObject` interface in `AppContextDefs.ts`:

```ts
myFunction: (arg: string) => string;
```

---

## appGlobals vs Extension functions

| Source | Access in Markup | Merge Point |
|---|---|---|
| `appGlobals` (from config.json / App props) | `appGlobals.settingName` | AppContext property; passed as-is |
| Extension `functions` | Direct call `myExtFn(x)` | Merged into `globalVars` at StandaloneApp init |
| AppContext built-ins | Direct call `formatDate(x)` | Spread into AppContext object in AppContent |

Extension functions do NOT land in `appContextValue` — they go into the expression
scope via `globalVars` in `StandaloneApp` before the first render. Both are available
in expressions, but through different paths.

---

## Key Files

| File | Role |
|---|---|
| `xmlui/src/abstractions/AppContextDefs.ts` | `AppContextObject` type definition (source of truth) |
| `xmlui/src/components-core/rendering/AppContent.tsx` | Context assembly, provider, hook wiring |
| `xmlui/src/components-core/appContext/date-functions.ts` | Date function module |
| `xmlui/src/components-core/appContext/math-function.ts` | Math function module |
| `xmlui/src/components-core/appContext/local-storage-functions.ts` | localStorage module |
| `xmlui/src/components-core/appContext/misc-utils.ts` | Miscellaneous utilities |
| `xmlui/src/components-core/utils/date-utils.ts` | Underlying date-fns wrappers |
| `xmlui/src/components-core/StandaloneApp.tsx` | Extension function merging into globalVars |

---

## Anti-Patterns

| Anti-Pattern | Problem | Correct Approach |
|---|---|---|
| Using `localStorage.getItem()` directly | Not reactive; bypasses storageTimestamp | Use `readLocalStorage()` |
| Using `window.location.href` instead of `pathname` | Not reactive; doesn't update on SPA nav | Use `pathname` from AppContext or `$pathname` |
| Treating `min`/`max` as AppContext functions | They don't exist in AppContext | Use `Math.min(...arr)`, `Math.max(...arr)` |
| Calling `setLoggedInUser()` in a render expression | Causes infinite update loops | Only call in event handlers or `onMount` |
| Adding functions to `appGlobals` for expressions | `appGlobals` is for config strings/objects only | Add true utilities to AppContext or extension `functions` |
| Importing `date-fns` directly in component code | Bypasses the wrapper; misses locale handling | Use AppContext date functions |
