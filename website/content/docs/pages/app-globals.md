# App Globals Reference

The `appGlobals` object in your app's configuration file is a flexible key-value store for application-wide settings. These settings are available throughout your app via the `appGlobals` global and affect the behavior of the XMLUI engine, components, and API communication.

```ts
// config.ts (Vite / built mode)
const App: StandaloneAppDescription = {
  name: "My App",
  appGlobals: {
    apiUrl: "https://api.example.com",
    useHashBasedRouting: false,
    disableInlineStyle: false,
    // ...
  },
};
```

```json
// config.json (standalone / buildless mode)
{
  "appGlobals": {
    "apiUrl": "https://api.example.com",
    "useHashBasedRouting": false
  }
}
```

You can read any value from inside markup or scripts:

```xmlui
<Text>{appGlobals.apiUrl}</Text>
```

---

## Settings

### `apiUrl`

```ts
apiUrl?: string;
```

The base URL prepended to all relative API request URLs. When set, data sources and API calls that use a relative URL (e.g. `/api/contacts`) are automatically resolved against this base.

```ts
appGlobals: {
  apiUrl: "https://api.example.com",
}
```

---

### `applyLayoutProperties`

```ts
applyLayoutProperties?: "all" | "dims" | "spacing" | "none";
```

Controls which layout properties the rendering engine applies to components. This restriction applies to both base properties (e.g. `backgroundColor`) and responsive variants (e.g. `backgroundColor-lg`). Useful for embedding XMLUI into a host application that manages its own layout.

| Value | Behavior |
|---|---|
| `"all"` | All layout properties are applied (default). |
| `"dims"` | Only dimension properties are applied: `width`, `height`, `minWidth`, `maxWidth`, `minHeight`, `maxHeight`. |
| `"spacing"` | Dimension properties plus spacing: `gap`, `padding*`, `margin*` and their variants. Other properties like borders, colors, and typography are ignored. |
| `"none"` | No layout properties are applied — the markup values are silently ignored. |

```ts
appGlobals: {
  applyLayoutProperties: "spacing",
}
```

---

### `blog`

```ts
blog?: {
  posts: BlogPost[];
};
```

Configuration for the `Blog` component. Must contain at least a `posts` array of blog post objects. Additional layout behavior (list style, table of contents, tags) is controlled via theme variables on the `Blog` component.

---

### `codeHighlighter`

```ts
codeHighlighter?: CodeHighlighter;
```

An object conforming to the `CodeHighlighter` interface that provides syntax highlighting for code blocks inside `Markdown` and `CodeFence` components. When not set, code blocks are rendered as plain text.

---

### `defaultToOptionalMemberAccess`

```ts
defaultToOptionalMemberAccess?: boolean; // default: true
```

When `true` (the default), property access expressions in XMLScript use optional chaining semantics — accessing a property of `undefined` or `null` returns `undefined` rather than throwing an error. Set to `false` to use strict member access and surface access errors explicitly.

```ts
appGlobals: {
  defaultToOptionalMemberAccess: false,
}
```

---

### `disableInlineStyle`

```ts
disableInlineStyle?: boolean; // default: false
```

When `true`, inline style properties (such as `backgroundColor`, `color`, `padding`, etc.) set directly on components in markup are not applied. Dimension-related properties (`width`, `height`, and their min/max variants) are still applied as they participate in flex layout. Use this when the host application manages styling exclusively through its own CSS.

> [!NOTE] Individual `Theme` components can override this per-subtree via their own `disableInlineStyle` property.

```ts
appGlobals: {
  disableInlineStyle: true,
}
```

---

### `headers`

```ts
headers?: Record<string, string>;
```

A dictionary of HTTP headers added to every outgoing API request. Headers specified per-request override these defaults.

```ts
appGlobals: {
  headers: {
    Authorization: "Bearer my-token",
    "X-App-Version": "1.0.0",
  },
}
```

---

### `lintSeverity`

```ts
lintSeverity?: "warning" | "error" | "strict" | "skip"; // default: "warning"
```

Controls how the XMLUI engine reports markup linting issues at startup.

| Value | Behavior |
|---|---|
| `"warning"` | Issues are printed to the browser console as warnings (default). |
| `"error"` | Issues block app rendering and are displayed as an error screen. |
| `"strict"` | Issues are displayed as toast notifications in the UI and also printed to the browser console. |
| `"skip"` | Linting is disabled entirely. |

```ts
appGlobals: {
  lintSeverity: "error",
}
```

---

### `logRestApiErrors`

```ts
logRestApiErrors?: boolean; // default: false
```

When `true`, REST API response parsing errors are logged to the browser console. Useful during development to diagnose unexpected API response shapes.

```ts
appGlobals: {
  logRestApiErrors: true,
}
```

---

### `notifications`

```ts
notifications?: {
  duration?: number;
  position?: "top-start" | "top-center" | "top-end" | "bottom-start" | "bottom-center" | "bottom-end";
};
```

Configuration for toast notifications.

- `duration` — how long (in milliseconds) a notification is visible before auto-dismissing.
- `position` — where notifications appear on screen. Defaults to `"bottom-end"`.

| Position value | Description |
|---|---|
| `"top-start"` | Top-left corner. |
| `"top-center"` | Top edge, horizontally centered. |
| `"top-end"` | Top-right corner. |
| `"bottom-start"` | Bottom-left corner. |
| `"bottom-center"` | Bottom edge, horizontally centered. |
| `"bottom-end"` | Bottom-right corner (default). |

```ts
appGlobals: {
  notifications: {
    duration: 5000,
    position: "top-end",
  },
}
```

---

### `prefetchedContent`

```ts
prefetchedContent?: Record<string, string>;
```

A dictionary mapping URL paths to pre-fetched content strings. When a `DataSource` or data loader would normally fetch a URL, it first checks this map and uses the cached value if found. Used to avoid redundant network requests for content that is already available at app startup (e.g. server-side rendered or statically generated content).

---

### `searchIndexEnabled`

```ts
searchIndexEnabled?: boolean; // default: false
```

When `true`, the `Pages` component walks all `Page` children at startup and builds an in-memory search index. Required for full-text search to work in apps that use the search components.

```ts
appGlobals: {
  searchIndexEnabled: true,
}
```

---

### `showHeadingAnchors`

```ts
showHeadingAnchors?: boolean; // default: false
```

When `true`, heading components (`H1`–`H6`) automatically display a clickable anchor icon that lets users link directly to that heading. Individual headings can override this via their own `showAnchor` property.

```ts
appGlobals: {
  showHeadingAnchors: true,
}
```

---

### `syncExecutionTimeout`

```ts
syncExecutionTimeout?: number; // default: 1000ms
```

Affects the synchronous expression (bindings in markup attributes) execution timeout.
If an expression times out, an error is thrown.

```ts
appGlobals: {
  syncExecutionTimeout: 500,
}
```

---

### `useHashBasedRouting`

```ts
useHashBasedRouting?: boolean; // default: true (standalone mode)
```

Selects the routing strategy used by the app.

| Value | Behavior |
|---|---|
| `true` | Hash-based routing (`/#/path`). Works on any static file server without server-side URL rewriting. |
| `false` | History-based routing (`/path`). Requires the server to serve `index.html` for all routes. |

```ts
appGlobals: {
  useHashBasedRouting: false,
}
```

---

### `withXSRFToken`

```ts
withXSRFToken?: boolean; // default: true
```

When `true` (the default), the engine reads the `XSRF-TOKEN` cookie and includes it as an `X-XSRF-TOKEN` header on all same-origin API requests. Set to `false` to disable this behavior if your backend does not use XSRF token validation.

```ts
appGlobals: {
  withXSRFToken: false,
}
```

---

### `xsVerbose`

```ts
xsVerbose?: boolean; // default: false
```

When `true`, the engine emits detailed diagnostic logs for XMLScript expression evaluation and data loader activity to the browser console. Useful for debugging reactive data flows and script execution.

```ts
appGlobals: {
  xsVerbose: true,
}
```

---

### `xsVerboseLogMax`

```ts
xsVerboseLogMax?: number; // default: 200
```

Limits the number of log entries emitted when `xsVerbose` is `true`. Prevents the console from being overwhelmed in apps with many reactive expressions.

```ts
appGlobals: {
  xsVerbose: true,
  xsVerboseLogMax: 50,
}
```
