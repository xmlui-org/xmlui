import type { CompoundComponentDef, ComponentLike } from "../../abstractions/ComponentDefs";
import type { ThemeDefinition } from "../../abstractions/ThemingDefs";
import type { ApiInterceptorDefinition } from "../interception/abstractions";

// This type describes a standalone app
export type StandaloneAppDescription = {
  // Application name
  name?: string;

  // Application version
  version?: string;

  // The apps entry point; rendering starts here
  entryPoint?: ComponentLike;

  // Optional components used by the app in the entry point
  components?: CompoundComponentDef[];

  // Optional themes used by the app
  themes?: ThemeDefinition[];

  // The ID of the default theme
  defaultTheme?: string;

  // The default tone ("dark" or "light")
  defaultTone?: string;

  // Resource definitions for the app
  resources?: Record<string, string>;

  
  // Resource map for the app
  resourceMap?: Record<string, string>;
  /**
   * Arbitrary key/value settings accessible as `appContext.appGlobals` throughout the framework.
   *
   * Well-known keys:
   * - `xsVerbose` (boolean) — enable Inspector trace logging.
   * - `xsVerboseLogMax` (number) — max trace buffer size (default 200).
   * - `xsVerboseLogBucket` (string) — optional bucket label for trace entries.
   * - `defaultToOptionalMemberAccess` (boolean) — treat all member accesses as optional
   *   (default `true`).
   * - `maxCompoundDepth` (number) — max recursion depth for compound components.
   * - `strictDomSandbox` (boolean, default `false`) — when `true`, any expression that
   *   accesses a banned DOM API throws a `BannedApiError` immediately. When `false`
   *   (the rollout warn phase default), the access proceeds but a `console.warn` is
   *   emitted and a `"sandbox:warn"` Inspector trace entry is pushed so teams can audit
   *   usages before flipping to `true`. See `dev-docs/plans/dom-api-hardening.md`.
   * - `silentConsole` (boolean, default `false`) — controls whether `Log.*` calls mirror
   *   to the native `console.*` in addition to the Inspector trace. When `false` (default),
   *   `Log.info("x")` writes both to the trace and to `console.info`. When `true`, only the
   *   trace entry is emitted — nothing reaches the browser console. Useful in production
   *   deployments where trace data is exported to a server sink. This flag does NOT re-enable
   *   direct `console` access from expressions; that is governed by `strictDomSandbox`.
   * - `allowConsole` (boolean, default `true`) — when `true` (the default), expressions may
   *   freely access `console.*` methods (e.g. `console.log(msg)`). Set to `false` to enforce
   *   the sandbox ban and migrate call sites to `Log.*()` functions. Unlike `strictDomSandbox`
   *   which controls throw-vs-warn for *all* banned APIs, `allowConsole` is a targeted opt-out
   *   exclusively for `console`. When `false`, a `strictDomSandbox: true` config throws
   *   `BannedApiError`; without strict mode it emits a `sandbox:warn` trace entry.
   * - `allowedOrigins` (string[], default `undefined`) — when set, `App.fetch()` rejects any
   *   request whose target origin is not in this list before reaching the network. Origins
   *   must be fully-qualified (e.g. `"https://api.example.com"`). Same-origin requests are
   *   always permitted regardless of this list.
   * - `withXSRFToken` (boolean, default `true`) — when `true`, `App.fetch()` automatically
   *   injects the `X-XSRF-TOKEN` header from the `XSRF-TOKEN` cookie for same-origin
   *   requests. Set to `false` to disable this behaviour.
   * - `appStateKeys` (string[], default `undefined`) — when set, `AppState` rejects any
   *   call whose top-level bucket name is not in the list, throwing
   *   `AppStateSchemaError`. When unset, AppState is permissive — any bucket name is
   *   accepted. Use this in production to lock the global state surface to a declared
   *   schema and prevent accidental key sprawl. See
   *   `dev-docs/plans/dom-api-hardening.md` Step 2.1.
   * - `strictBuildValidation` (boolean, default `false`) — when `true`, all build-time
   *   validation diagnostics escalate one severity step (info → warn → error) and the
   *   `xmlui check` CLI exits non-zero on any `error`-severity finding. Flips to `true`
   *   in the next major release. See `dev-docs/plans/13-build-validation-analyzers.md`.
   * - `strictErrors` (boolean, default `false`) — when `true`, throwing a plain `Error`
   *   from script logs a `kind:"errors"` warn diagnostic with a migration hint to use
   *   `AppError`. Flips to `true` in the next major release. See
   *   `dev-docs/plans/07-structured-exception-model.md`.
   * - `errorCorrelationIdHeader` (string, default `"X-Correlation-Id"`) — the HTTP
   *   response header from which `AppError.correlationId` is read when a fetch fails.
   *   See `dev-docs/plans/07-structured-exception-model.md`.
   * - `strictAuditLogging` (boolean, default `false`) — when `true`, the default
   *   redaction policy blocks on un-redacted PII fields and the sink behaviour changes
   *   from "drop on backpressure" to "bounded buffer then drop with `audit-loss`
   *   diagnostic". Flips to `true` in the next major release. See
   *   `dev-docs/plans/15-audit-grade-observability.md`.
   * - `strictAccessibility` (boolean, default `false`) — when `true`, accessibility
   *   linter findings (`icon-only-button-no-label`, `modal-no-title`,
   *   `missing-accessible-name`, `form-input-no-label`) escalate from `warn` to
   *   `error`, causing the Vite build to fail if any are present. In non-strict mode
   *   they are warnings only. See `dev-docs/plans/05-enforced-accessibility.md`.
   * - `strictReactiveGraph` (boolean, default `false`) — when `true`, every
   *   detected reactive cycle (var ↔ var, var ↔ DataSource, function-mediated)
   *   produces a `kind:"reactive-cycle"` error trace entry plus a one-shot toast
   *   (planned for W6). When `false` (the rollout warn phase default — W2-7), the
   *   detector still runs at startup and emits a single `kind:"reactive-cycle"`
   *   warn entry per unique cycle so teams can audit existing apps before the
   *   strict default flips. See `dev-docs/plans/03-reactive-cycle-detection.md`.
   */
  appGlobals?: Record<string, any>;
  apiInterceptor?: ApiInterceptorDefinition;
  sources?: Record<string, string>;

  icons?: Record<string, string>;
};


export type StandaloneJsonConfig = {
  name?: string;
  appGlobals?: Record<string, any>;
  entryPoint?: string;
  components?: string[];
  themes?: string[];
  defaultTheme?: string;
  resources?: Record<string, string>;
  resourceMap?: Record<string, string>;
  apiInterceptor?: ApiInterceptorDefinition;
};
