# XMLUI Config Reference

`xmluiConfig` is the home for framework and runtime settings that change how the XMLUI engine behaves. Use it for routing mode, inline-style handling, validation severity, XMLScript diagnostics, and other runtime-level switches.

Application-specific values belong under [`appGlobals`](/docs/app-globals). `appGlobals` is exposed to markup as the global identifier `appGlobals`; `xmluiConfig` is read by the framework and is not exposed as a separate global.

When the engine looks up a runtime setting, it reads a merged view where `xmluiConfig` overrides the same key in `appGlobals`, and any key not set in `xmluiConfig` falls back to `appGlobals`. This keeps existing apps working while giving new apps a dedicated place for runtime settings.

> [!WARNING] **Deprecation notice**: placing framework / runtime settings under `appGlobals` is still supported today via the fallback mechanism, but this behaviour will be **deprecated in an upcoming minor release**. Move framework settings such as `apiUrl`, `headers`, `notifications`, `prefetchedContent`, `showHeadingAnchors`, `useHashBasedRouting`, `disableInlineStyle`, `xsVerbose`, and the `strict*` family to `xmluiConfig`. Application-specific values remain under [`appGlobals`](/docs/app-globals).

```ts
// config.ts (Vite / built mode)
const App: StandaloneAppDescription = {
  name: "My App",
  appGlobals: {
    currentUser: { displayName: "Ada" },
  },
  xmluiConfig: {
    apiUrl: "https://api.example.com",
    headers: { "X-App-Version": "1.0.0" },
    useHashBasedRouting: false,
    disableInlineStyle: false,
    lintSeverity: "warning",
    xsVerbose: false,
  },
};
```

```json
// config.json (standalone / buildless mode)
{
  "appGlobals": {
    "currentUser": { "displayName": "Ada" }
  },
  "xmluiConfig": {
    "apiUrl": "https://api.example.com",
    "useHashBasedRouting": false,
    "lintSeverity": "warning"
  }
}
```

> [!NOTE] **Component authors** should use `useXmluiConfig()` for framework / runtime settings. It returns the merged read-only view (`xmluiConfig` overlaying `appGlobals`). Use `useAppGlobals()` only for raw application-specific values.

---

## Quick reference

| Key | Purpose |
|---|---|
| `applyLayoutProperties` | Controls which layout properties the engine applies. |
| `apiUrl` | Base URL for relative API request URLs. |
| `allowConsole` | Lets XMLScript access `console` even when DOM sandbox checks are active. |
| `allowedOrigins` | Restricts cross-origin calls made through `App.fetch()`. |
| `allowInlineRawCss` | Controls raw CSS checks in inline `style` values. |
| `auditPolicy` | Configures audit log redaction, sampling, retention, and sink delivery. |
| `autoSkipLink` | Inserts the default skip link before app content. |
| `blog` | Data consumed by the `Blog` component. |
| `codeHighlighter` | Syntax highlighter used by markdown and code fences. |
| `columnCanSortDefault` | Overrides the default sortable behavior for table columns. |
| `csrfHeaderName` | Overrides the form CSRF header name. |
| `defaultToOptionalMemberAccess` | Controls optional member access semantics in XMLScript. |
| `defaultHandlerTimeoutMs` | Sets the ambient async handler timeout. |
| `defaultLocale` | Sets the fallback locale for i18n. |
| `disableInlineStyle` | Disables inline style props while preserving layout dimensions. |
| `disposeTimeoutMs` | Sets the `onBeforeDispose` timeout budget. |
| `errorBufferSize` | Sets the size of the `App.errors` FIFO buffer. |
| `errorResponseTransform` | Transforms API error responses before XMLUI surfaces them. |
| `guardOnPopState` | Controls whether navigation guards run for browser back/forward navigation. |
| `headers` | Default HTTP headers for outgoing API requests. |
| `idempotencyHeaderName` | Overrides the form idempotency header name. |
| `interceptExternalNavigation` | Routes same-origin raw anchors and GET forms through XMLUI navigation. |
| `localeBundles` | Registers i18n locale bundles at app startup. |
| `localePersistKey` | Controls the localStorage key used for persisted locale selection. |
| `lintSeverity` | Controls standalone startup validation severity. |
| `logRestApiErrors` | Logs REST API response parsing errors. |
| `maxQueuedPerTrace` | Caps queued handlers per scheduler trace. |
| `maxZIndex` | Sets the highest allowed `zIndex` value in layout-style validation. |
| `notifications` | Toast notification defaults. |
| `prefetchedContent` | Startup content cache for pre-fetched resources. |
| `requireFormCsrf` | Requires mutating forms to provide a CSRF token. |
| `scheduler` | Selects the handler scheduler mode. |
| `searchIndexEnabled` | Enables startup search index construction. |
| `showHeadingAnchors` | Default heading anchor behavior. |
| `strictAccessibility` | Escalates accessibility diagnostics. |
| `strictAuditLogging` | Escalates audit-policy and PII diagnostics. |
| `strictConcurrency` | Escalates handler timeout diagnostics. |
| `strictDeterminism` | Enables deterministic scheduling checks and defaults. |
| `strictDomSandbox` | Enforces the DOM API sandbox. |
| `strictErrors` | Warns when non-`AppError` values enter the error pipeline. |
| `strictForms` | Escalates form validation discipline diagnostics. |
| `strictI18n` | Escalates i18n diagnostics. |
| `strictLifecycle` | Escalates lifecycle violations. |
| `strictReactiveGraph` | Escalates reactive dependency cycle warnings. |
| `strictRouting` | Escalates defended-routing diagnostics. |
| `strictTheming` | Escalates theming sandbox diagnostics. |
| `strictTypeContracts` | Controls runtime type-contract validation strictness. |
| `strictUdcSandbox` | Enforces UDC scope and capability contracts. |
| `strictVersioning` | Escalates enforced-versioning diagnostics. |
| `syncExecutionTimeout` | Sets the synchronous expression execution timeout. |
| `udcTrust` | Controls handling of UDCs marked `trust="untrusted"`. |
| `useHashBasedRouting` | Selects hash-based or history-based routing. |
| `withXSRFToken` | Adds the XSRF token header to same-origin API requests. |
| `xsVerbose` | Enables verbose XMLScript and data loader diagnostics. |
| `xsVerboseLogMax` | Limits verbose diagnostic log entries. |

Keys in this table are read through the merged compatibility view, so placing them under `appGlobals` continues to work for now. Prefer `xmluiConfig` for all new code.

---

## Settings

### `apiUrl`

```ts
apiUrl?: string;
```

The base URL prepended to all relative API request URLs. When set, data sources, API calls, file actions, and managed fetches that use a relative URL, such as `/api/contacts`, are resolved against this base.

```ts
xmluiConfig: {
  apiUrl: "https://api.example.com",
}
```

---

### `applyLayoutProperties`

```ts
applyLayoutProperties?: "all" | "dims" | "spacing" | "none";
```

Controls which layout properties the rendering engine applies to components. This restriction applies to both base properties, such as `backgroundColor`, and responsive variants, such as `backgroundColor-lg`. It is useful when embedding XMLUI into a host application that manages its own layout.

| Value | Behavior |
|---|---|
| `"all"` | All layout properties are applied (default). |
| `"dims"` | Only dimension properties are applied: `width`, `height`, `minWidth`, `maxWidth`, `minHeight`, `maxHeight`. |
| `"spacing"` | Dimension properties plus spacing: `gap`, `padding*`, `margin*` and their variants. Other properties like borders, colors, and typography are ignored. |
| `"none"` | No layout properties are applied; the markup values are silently ignored. |

```ts
xmluiConfig: {
  applyLayoutProperties: "spacing",
}
```

---

### `defaultToOptionalMemberAccess`

```ts
defaultToOptionalMemberAccess?: boolean; // default: true
```

When `true`, property access expressions in XMLScript use optional chaining semantics. Accessing a property of `undefined` or `null` returns `undefined` instead of throwing an error. Set to `false` to use strict member access and surface access errors explicitly.

```ts
xmluiConfig: {
  defaultToOptionalMemberAccess: false,
}
```

---

### `blog`

```ts
blog?: {
  posts: BlogPost[];
};
```

Configuration for the `Blog` component. Must contain at least a `posts` array of blog post objects. Additional layout behavior, table of contents, and tag display are controlled via theme variables on the `Blog` component.

---

### `codeHighlighter`

```ts
codeHighlighter?: CodeHighlighter;
```

An object conforming to the `CodeHighlighter` interface that provides syntax highlighting for code blocks inside `Markdown` and `CodeFence` components. When not set, code blocks are rendered as plain text unless a global browser highlighter is present.

---

### `columnCanSortDefault`

```ts
columnCanSortDefault?: boolean;
```

Overrides the default `canSort` value for `Column` components that do not set `canSort` explicitly.

```ts
xmluiConfig: {
  columnCanSortDefault: false,
}
```

---

### `disableInlineStyle`

```ts
disableInlineStyle?: boolean; // default: false
```

When `true`, inline style properties such as `backgroundColor`, `color`, and `padding` set directly on components in markup are not applied. Dimension-related properties (`width`, `height`, and their min/max variants) are still applied because they participate in flex layout. Use this when the host application manages styling exclusively through its own CSS.

> [!NOTE] Individual `Theme` components can override this per-subtree via their own `disableInlineStyle` property.

```ts
xmluiConfig: {
  disableInlineStyle: true,
}
```

---

### `errorResponseTransform`

```ts
errorResponseTransform?: string;
```

An XMLScript expression that transforms API error responses before XMLUI surfaces them. The expression receives the response as `$response`.

```json
{
  "xmluiConfig": {
    "errorResponseTransform": "{ $response.message || $response.error || 'Request failed' }"
  }
}
```

---

### `headers`

```ts
headers?: Record<string, string>;
```

A dictionary of HTTP headers added to outgoing API requests. Headers specified per request override these defaults.

```ts
xmluiConfig: {
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

Controls how standalone startup validation issues are shown in the browser. These issues come from the type-contract verifier, such as unknown props, invalid literal values, missing required props, unknown events, and unknown exposed methods.

| Value | Behavior |
|---|---|
| `"warning"` | Issues are printed to the browser console as warnings (default). |
| `"error"` | Issues block app rendering and are displayed as an error screen. |
| `"strict"` | Issues are displayed as toast notifications in the UI and also printed to the browser console. |
| `"skip"` | Standalone startup validation is disabled. |

```ts
xmluiConfig: {
  lintSeverity: "error",
}
```

---

### `logRestApiErrors`

```ts
logRestApiErrors?: boolean; // default: false
```

When `true`, REST API response parsing errors are logged to the browser console. This is useful during development when diagnosing unexpected API response shapes.

```ts
xmluiConfig: {
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

| Position value | Description |
|---|---|
| `"top-start"` | Top-left corner. |
| `"top-center"` | Top edge, horizontally centered. |
| `"top-end"` | Top-right corner. |
| `"bottom-start"` | Bottom-left corner. |
| `"bottom-center"` | Bottom edge, horizontally centered. |
| `"bottom-end"` | Bottom-right corner (default). |

```ts
xmluiConfig: {
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

A dictionary mapping URL paths to pre-fetched content strings. XMLUI data loading checks this map before it needs fetched content, which helps avoid redundant network requests for content already available at startup.

```ts
xmluiConfig: {
  prefetchedContent: {
    "/pages/home.md": "# Welcome",
  },
}
```

---

### `searchIndexEnabled`

```ts
searchIndexEnabled?: boolean; // default: false
```

When `true`, the `Pages` component walks all `Page` children at startup and builds an in-memory search index. This is required for full-text search to work in apps that use the search components.

```ts
xmluiConfig: {
  searchIndexEnabled: true,
}
```

---

### `showHeadingAnchors`

```ts
showHeadingAnchors?: boolean; // default: false
```

When `true`, heading components (`H1`-`H6`) and markdown headings display a clickable anchor icon that lets users link directly to that heading. Individual headings can override this with their own `showAnchor` or `showHeadingAnchors` property.

```ts
xmluiConfig: {
  showHeadingAnchors: true,
}
```

---

### `syncExecutionTimeout`

```ts
syncExecutionTimeout?: number; // default: 1000ms
```

Affects the synchronous expression execution timeout for bindings in markup attributes. If an expression times out, an error is thrown.

```ts
xmluiConfig: {
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
xmluiConfig: {
  useHashBasedRouting: false,
}
```

---

### `withXSRFToken`

```ts
withXSRFToken?: boolean; // default: true
```

When `true`, the engine reads the `XSRF-TOKEN` cookie and includes it as an `X-XSRF-TOKEN` header on all same-origin API requests. Set to `false` to disable this behavior if your backend does not use XSRF token validation.

```ts
xmluiConfig: {
  withXSRFToken: false,
}
```

---

### `xsVerbose`

```ts
xsVerbose?: boolean; // default: false
```

When `true`, the engine emits detailed diagnostic logs for XMLScript expression evaluation and data loader activity to the browser console. This is useful for debugging reactive data flows and script execution.

```ts
xmluiConfig: {
  xsVerbose: true,
}
```

---

### `xsVerboseLogMax`

```ts
xsVerboseLogMax?: number; // default: 200
```

Limits the number of log entries emitted when `xsVerbose` is `true`. This prevents the console from being overwhelmed in apps with many reactive expressions.

```ts
xmluiConfig: {
  xsVerbose: true,
  xsVerboseLogMax: 50,
}
```

---

## Managed React settings

Managed React features use `xmluiConfig` for their framework/runtime switches. The detailed behavior is documented in the Managed React articles; this table is the central placement and default reference.

| Key | Default | See |
|---|---:|---|
| `allowConsole` | `true` | [DOM API Isolation](/docs/managed-react/dom-api-isolation) |
| `allowedOrigins` | unset | [Centralized HTTP](/docs/managed-react/http-centralization) |
| `allowInlineRawCss` | `true` | [Sealed Theming Sandbox](/docs/managed-react/sealed-theming-sandbox) |
| `auditPolicy` | unset | [Audit-Grade Observability](/docs/managed-react/audit-grade-observability) |
| `autoSkipLink` | `false` | [Enforced Accessibility](/docs/managed-react/enforced-accessibility) |
| `csrfHeaderName` | `"X-CSRF-Token"` | [Forms Validation Discipline](/docs/managed-react/forms-validation-discipline) |
| `defaultHandlerTimeoutMs` | `30000` | [Cooperative Concurrency](/docs/managed-react/cooperative-concurrency) |
| `defaultLocale` | `"en"` | [I18n Foundations](/docs/managed-react/i18n-foundations) |
| `disposeTimeoutMs` | `250` | [Managed Lifecycle Vocabulary](/docs/managed-react/managed-lifecycle-vocabulary) |
| `errorBufferSize` | `50` | [Structured Exception Model](/docs/managed-react/structured-exception-model) |
| `guardOnPopState` | `true` | [Defended Routing](/docs/managed-react/defended-routing) |
| `idempotencyHeaderName` | `"Idempotency-Key"` | [Forms Validation Discipline](/docs/managed-react/forms-validation-discipline) |
| `interceptExternalNavigation` | `false` | [Defended Routing](/docs/managed-react/defended-routing) |
| `localeBundles` | unset | [I18n Foundations](/docs/managed-react/i18n-foundations) |
| `localePersistKey` | `"xmlui.locale"` | [I18n Foundations](/docs/managed-react/i18n-foundations) |
| `maxQueuedPerTrace` | `64` | [Concurrent State Determinism](/docs/managed-react/concurrent-state-determinism) |
| `maxZIndex` | `9999` | [Sealed Theming Sandbox](/docs/managed-react/sealed-theming-sandbox) |
| `requireFormCsrf` | `false` | [Forms Validation Discipline](/docs/managed-react/forms-validation-discipline) |
| `scheduler` | `"concurrent"`; `"fifo"` when `strictDeterminism` is on | [Concurrent State Determinism](/docs/managed-react/concurrent-state-determinism) |
| `strictAccessibility` | `false` | [Enforced Accessibility](/docs/managed-react/enforced-accessibility) |
| `strictAuditLogging` | `true` | [Audit-Grade Observability](/docs/managed-react/audit-grade-observability) |
| `strictConcurrency` | `false` | [Cooperative Concurrency](/docs/managed-react/cooperative-concurrency) |
| `strictDeterminism` | `true` | [Concurrent State Determinism](/docs/managed-react/concurrent-state-determinism) |
| `strictDomSandbox` | `false` | [DOM API Isolation](/docs/managed-react/dom-api-isolation) |
| `strictErrors` | `true` | [Structured Exception Model](/docs/managed-react/structured-exception-model) |
| `strictForms` | `false` | [Forms Validation Discipline](/docs/managed-react/forms-validation-discipline) |
| `strictI18n` | `false` | [I18n Foundations](/docs/managed-react/i18n-foundations) |
| `strictLifecycle` | `true` | [Managed Lifecycle Vocabulary](/docs/managed-react/managed-lifecycle-vocabulary) |
| `strictReactiveGraph` | `true` | [Reactive Cycle Detection](/docs/managed-react/reactive-cycle-detection) |
| `strictRouting` | `true` | [Defended Routing](/docs/managed-react/defended-routing) |
| `strictTheming` | `true` | [Sealed Theming Sandbox](/docs/managed-react/sealed-theming-sandbox) |
| `strictTypeContracts` | `true` | [Verified Type Contracts](/docs/managed-react/verified-type-contracts) |
| `strictUdcSandbox` | `true` | [UDC Sandbox](/docs/managed-react/udc-sandbox) |
| `strictVersioning` | `false` | [Enforced Versioning](/docs/managed-react/enforced-versioning) |
| `udcTrust` | `"open"` | [UDC Sandbox](/docs/managed-react/udc-sandbox) |

`strictBuildValidation` is discussed in [Build Validation Analyzers](/docs/managed-react/build-validation-analyzers). Build-time strictness is currently selected through the CLI or Vite plugin; the `xmluiConfig.strictBuildValidation` name is reserved for the app-wide switch described there.
