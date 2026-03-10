# App [#app]

The `App` component is the root container that defines your application's overall structure and layout. It provides a complete UI framework with built-in navigation, header, footer, and content areas that work together seamlessly.

## Behaviors [#behaviors]

This component supports the following behaviors:

| Behavior | Properties |
| --- | --- |
| Bookmark | `bookmark`, `bookmarkLevel`, `bookmarkTitle`, `bookmarkOmitFromToc` |
| Publish/Subscribe | `subscribeToTopic` |
| Styling Variant | `variant` |

## Properties [#properties]

### `autoDetectTone` [#autodetecttone]

> [!DEF]  default: **false**

This boolean property enables automatic detection of the system theme preference. When set to true and no defaultTone is specified, the app will automatically use "light" or "dark" tone based on the user's system theme setting. The app will also respond to changes in the system theme preference.

### `defaultTheme` [#defaulttheme]

This property sets the app's default theme.

### `defaultTone` [#defaulttone]

This property sets the app's default tone ("light" or "dark").

Available values: `light`, `dark`

### `layout` [#layout]

This property sets the layout template of the app. This setting determines the position and size of the app parts (such as header, navigation bar, footer, etc.) and the app's scroll behavior.

Available values:

| Value | Description |
| --- | --- |
| `vertical` | This layout puts the navigation bar on the left side and displays its items vertically. The main content is aligned to the right (including the header and the footer), and its content is a single scroll container; every part of it moves as you scroll the page. This layout does not display the logo in the app header. |
| `vertical-sticky` | Similar to `vertical`, the header and the navigation bar dock to the top of the main content's viewport, while the footer sticks to the bottom. This layout does not display the logo in the app header. |
| `vertical-full-header` | Similar to `vertical-sticky`. However, the header and the navigation bar dock to the top of the app's window, while the footer sticks to the bottom. |
| `condensed` | Similar to `horizontal`. However, the header and the navigation bar are in a single header block. (default) |
| `condensed-sticky` | However, the header and the navigation bar are in a single header block. |
| `horizontal` | This layout stacks the layout sections in a single column in this order: header, navigation bar, main content, and footer. The application is a single scroll container; every part moves as you scroll the page. |
| `horizontal-sticky` | Similar to `horizontal`, the header and the navigation bar dock to the top of the viewport, while the footer sticks to the bottom. |
| `desktop` | This layout is designed for desktop applications with a fixed viewport structure. The app fills the entire browser viewport (100vw × 100vh) with zero padding and margins. The header remains fixed at the top, the footer remains fixed at the bottom, and the main content dynamically fills all remaining vertical space between them. When the content overflows, only the main content area scrolls while the header and footer remain visible. This creates a classic desktop application layout with persistent header and footer regions. |

### `loggedInUser` [#loggedinuser]

Stores information about the currently logged-in user. By not defining this property, you can indicate that no user is logged in.

### `logo` [#logo]

Optional logo path

### `logo-dark` [#logo-dark]

Optional logo path in dark tone

### `logo-light` [#logo-light]

Optional logo path in light tone

### `logoTemplate` [#logotemplate]

Optional template of the app logo

### `name` [#name]

Optional application name (visible in the browser tab). When you do not define this property, the tab name falls back to the one defined in the app's configuration. If the name is not configured, "XMLUI App" is displayed in the tab.

### `noScrollbarGutters` [#noscrollbargutters]

> [!DEF]  default: **false**

This boolean property specifies whether the scrollbar gutters should be hidden.

### `scrollWholePage` [#scrollwholepage]

> [!DEF]  default: **true**

This boolean property specifies whether the whole page should scroll (`true`) or just the content area (`false`). The default value is `true`.

## Events [#events]

### `didNavigate` [#didnavigate]

This event fires after the app has completed any navigation (including Link clicks, browser back/forward, and programmatic navigation).

**Signature**: `(to: string | number, queryParams?: Record<string, any>) => Promise<void>`

- `to`: The path that was navigated to.
- `queryParams`: Query parameters (only available for programmatic navigation).

### `keyDown` [#keydown]

This event fires when a key is pressed while the `App` has focus or when the event reaches the app level without being consumed by a child component.

**Signature**: `(event: KeyboardEvent) => void`

- `event`: The keyboard event object.

### `keyUp` [#keyup]

This event fires when a key is released while the `App` has focus or when the event reaches the app level without being consumed by a child component.

**Signature**: `(event: KeyboardEvent) => void`

- `event`: The keyboard event object.

### `messageReceived` [#messagereceived]

This event fires when the `App` component receives a message from another window or iframe via the window.postMessage API.

**Signature**: `(data: any) => void`

- `data`: The data sent from the other window via postMessage.

### `ready` [#ready]

This event fires when the `App` component finishes rendering on the page.

**Signature**: `() => void`

### `willNavigate` [#willnavigate]

This event fires before the app is about to navigate programmatically via `navigate()` or `Actions.navigate()`. The event handler receives the target path and optional query parameters. Returning `false` cancels the navigation; returning `null`, `undefined`, or any other value proceeds with normal navigation. Note: This event does NOT fire for Link clicks or browser back/forward navigation due to React Router limitations (event handlers are async, but router blocking is synchronous).

**Signature**: `(to: string | number, queryParams?: Record<string, any>) => Promise<false | void | null | undefined>`

- `to`: The target path or history delta (e.g., -1 for back) to navigate to.
- `queryParams`: Optional query parameters to include in the navigation.

## Exposed Methods [#exposed-methods]

This component does not expose any methods.

## Styling [#styling]

### Theme Variables [#theme-variables]

| Variable | Default Value (Light) | Default Value (Dark) |
| --- | --- | --- |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-AppHeader | *none* | *none* |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-content-App | $backgroundColor | $backgroundColor |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-navPanel-App | $backgroundColor | $backgroundColor |
| [borderBottom](/docs/styles-and-themes/common-units/#border)-AppHeader | *none* | *none* |
| [borderLeft](/docs/styles-and-themes/common-units/#border)-content-App | *none* | *none* |
| [borderRight](/docs/styles-and-themes/common-units/#border)-navPanelWrapper-App | 1px solid $borderColor | 1px solid $borderColor |
| [boxShadow](/docs/styles-and-themes/common-units/#boxShadow)-header-App | none | none |
| [boxShadow](/docs/styles-and-themes/common-units/#boxShadow)-navPanel-App | none | none |
| [maxWidth](/docs/styles-and-themes/common-units/#size-values)-App | $maxWidth-content | $maxWidth-content |
| [maxWidth-content](/docs/styles-and-themes/common-units/#size-values)-App | $maxWidth-content | $maxWidth-content |
| [maxWidth-content](/docs/styles-and-themes/common-units/#size-values)-App--withToc | *none* | *none* |
| [width](/docs/styles-and-themes/common-units/#size-values)-navPanel-App | $space-64 | $space-64 |
| [width](/docs/styles-and-themes/common-units/#size-values)-navPanel-collapsed-App | 48px | 48px |

### Variable Explanations [#variable-explanations]

| Theme Variable | Description |
| --- | --- |
| **`maxWidth-content-App`** | This theme variable defines the maximum width of the main content. If the main content is broader, the engine adds margins to keep the expected maximum size. |
| **`boxShadow‑header‑App`** | This theme variable sets the shadow of the app's header section. |
| **`boxShadow‑navPanel‑App`** | This theme variable sets the shadow of the app's navigation panel section (visible only in vertical layouts). |
| **`width‑navPanel‑App`** | This theme variable sets the width of the navigation panel when the app is displayed with one of the vertical layouts. |
