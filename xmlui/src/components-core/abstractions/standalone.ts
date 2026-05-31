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
   * - `strictErrors` (boolean, default `true`) — when `true`, throwing a plain `Error`
   *   or non-`AppError` value from script logs a `kind:"errors"` warn diagnostic with a
   *   migration hint to use `AppError`. Set to `false` for warn-only (migration) mode.
   *   See `dev-docs/plans/07-structured-exception-model.md`.
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
   * - `autoSkipLink` (boolean, default `false`) — when `true`, XMLUI inserts a
   *   default `<SkipLink>` before the app content so keyboard users can jump to
   *   the main region.
   * - `strictReactiveGraph` (boolean, default `true` — flipped from `false` in W8-1)
   *   — when `true`, every
   *   detected reactive cycle (var ↔ var, var ↔ DataSource, function-mediated)
   *   produces a `kind:"reactive-cycle"` error trace entry plus a one-shot toast
   *   (planned for W6). When `false` (the rollout warn phase default — W2-7), the
   *   detector still runs at startup and emits a single `kind:"reactive-cycle"`
   *   warn entry per unique cycle so teams can audit existing apps before the
   *   strict default flips. See `dev-docs/plans/03-reactive-cycle-detection.md`.
   * - `strictTypeContracts` (boolean, default `true`) — when `true`, parse-time
   *   prop / event / value-type violations surfaced by the type-contract verifier
   *   escalate from `warn` to `error`: the LSP reports `DiagnosticSeverity.Error`,
   *   the Vite plugin fails the build on `unknown-prop`, `wrong-type`,
   *   `missing-required`, and `value-not-in-enum`, and the runtime emits a
   *   `kind:"type-contract"` error trace entry. Set to `false` to keep the
   *   Wave 3 rollout behaviour where the verifier emits warn-level diagnostics. See
   *   `dev-docs/plans/01-verified-type-contracts.md`.
   * - `strictLifecycle` (boolean, default `true`) — when `true`, lifecycle
   *   violations (async `onUnmount` handler, throw inside a lifecycle handler,
   *   exceeded `disposeTimeoutMs`) escalate to `error`: a `kind:"lifecycle"`
   *   error trace entry plus a `console.error` and a one-shot toast. Set to
   *   `false` to revert to warn-only mode for apps that need an audit window.
   *   See `dev-docs/plans/04-managed-lifecycle-vocabulary.md`.
   * - `disposeTimeoutMs` (number, default `250`) — millisecond budget for
   *   container `onBeforeDispose` handlers (Phase 3 of plan #04). Exceeding
   *   the budget emits a `kind:"lifecycle"` violation with
   *   `reason:"timeout"` and lets the unmount proceed.
   * - `strictConcurrency` (boolean, default `false`) — when `true`, the
   *   handler-coordinator (plan #06) escalates `concurrency-handler-timeout`
   *   diagnostics from `warn` to `error`: in addition to the
   *   `kind:"concurrency"` trace entry the runtime emits a `console.error`
   *   and routes the timeout through `App.signError` so it surfaces on the
   *   global error channel. When `false` (the default during the W3-6/W7-1
   *   rollout) timeouts are warn-only and only visible in the Inspector.
   *   Cancellation, supersession, and drop outcomes are always info-level —
   *   they are expected outcomes of the policies, not failures. Flips to
   *   `true` in the next major. See
   *   `dev-docs/plans/06-cooperative-concurrency.md`.
   * - `defaultHandlerTimeoutMs` (number, default `30000`) — millisecond
   *   budget after which an in-flight event handler is automatically
   *   cancelled with `CancellationReason="timeout"` and a
   *   `kind:"concurrency"` `code:"concurrency-handler-timeout"` trace
   *   entry. Per-invocation `timeoutMs` overrides this default. The W3-6
   *   risk-probe ships the configuration surface only; the dispatcher
   *   wiring that enforces the budget lands in W7-1.
   * - `strictForms` (boolean, default `false`) — when `true`, forms
   *   diagnostics (`unknown-validator`, `duplicate-validator`,
   *   `validator-throw`, `server-error-unmapped`, `submit-while-busy`,
   *   `csrf-token-missing`) escalate from `warn` to `error` and the
   *   validator registry refuses registrations whose `name` is already
   *   taken. When `false` (the W5-1..W5-4 rollout default — risk-probe
   *   phase) the new surface is fully functional but only emits
   *   warn-level diagnostics so apps can audit before the strict
   *   default flips. Flips to `true` in the next major. See
   *   `dev-docs/plans/09-forms-validation-discipline.md`.
   * - `csrfHeaderName` (string, default `"X-CSRF-Token"`) — HTTP header name
   *   used to carry the `<Form csrfToken>` value on the built-in submit
   *   request. See `dev-docs/plans/09-forms-validation-discipline.md` Step 5.1.
   * - `idempotencyHeaderName` (string, default `"Idempotency-Key"`) — HTTP
   *   header name used to carry the `<Form idempotencyKey>` value on the
   *   built-in submit request.
   * - `requireFormCsrf` (boolean, default `false`) — when `true`, any
   *   `<Form>` whose submit method is non-GET/HEAD and which does not
   *   supply a `csrfToken` emits the `csrf-token-missing` diagnostic
   *   (warn). Under `strictForms` the diagnostic is escalated to error.
   *   Use this to enforce a per-app CSRF policy without having to flip
   *   `strictForms` globally.
   * - `strictRouting` (boolean, default `true`) — when `true` (the default),
   *   defended-routing diagnostics such as rejected constraints and
   *   non-canonical URLs escalate to errors and `nonCanonicalUrl` defaults to
   *   `"redirect"`. Set to `false` to revert to the pre-1.0 lax behaviour
   *   (warn-only, no automatic redirect). See `dev-docs/plans/10-defended-routing.md`.
   * - `guardOnPopState` (boolean, default `true`) — when `true`, browser-driven
   *   navigations (back/forward, direct URL entry) that the global
   *   `willNavigate` handler rejects are reverted and emit a
   *   `kind:"navigate"` `guard-bypass-attempt` diagnostic. Set to `false`
   *   to opt out (only the programmatic `navigate()` path is guarded).
   * - `interceptExternalNavigation` (boolean, default `false`) — when `true`,
   *   same-origin anchor clicks and GET form submissions are routed through
   *   `appContext.navigate` so that the `willNavigate` guard, per-page guards,
   *   and the `kind:"navigate"` trace pipeline observe them. Cross-origin links,
   *   modifier-key clicks, `target` other than `_self`, `download` anchors, and
   *   elements with `data-xmlui-bypass-router` are passed through unchanged.
   * - `urlCase` (`"preserve" | "lower"`, default `"preserve"`) — URL path
   *   canonicalisation policy. When `"lower"`, paths are lower-cased before
   *   matching.
   * - `urlTrailingSlash` (`"preserve" | "always" | "never"`, default `"preserve"`)
   *   — trailing-slash canonicalisation policy.
   * - `urlQueryParamOrder` (`"preserve" | "alphabetical"`, default `"preserve"`)
   *   — query-parameter ordering canonicalisation policy.
   * - `nonCanonicalUrl` (`"warn" | "rewrite" | "redirect"`, default `"warn"` in
   *   non-strict, `"redirect"` in strict) — what to do when the incoming URL
   *   differs from the canonical form.
   * - `strictI18n` (boolean, default `false`) — when `true`, missing locale
   *   bundles/keys and invalid ICU patterns escalate to errors. Wave 4 keeps
   *   fallback rendering in non-strict mode.
   * - `defaultLocale` (string, default `"en"`) — fallback BCP-47 locale for
   *   `App.locale` resolution.
   * - `localePersistKey` (string | null, default `"xmlui.locale"`) — localStorage
   *   key for user-selected locales; `null` disables persistence.
   * - `strictDeterminism` (boolean, default `true` — flipped from `false` in W8-1)
   *   — when `true`, determinism
   *   diagnostics escalate and the handler scheduler defaults to FIFO.
   * - `scheduler` (`"concurrent" | "fifo"`, default `"concurrent"`) — selects
   *   immediate handler execution or deterministic per-trace FIFO ordering.
   * - `maxQueuedPerTrace` (number, default `64`) — bounds deterministic handler
   *   queues before `determinism-convergence-failed` is emitted.
   * - `strictTheming` (boolean, default `true` — flipped from `false`
   *   as a W8 risk probe) — when `true`, theming
   *   diagnostics (`invalid-theme-value`, `unknown-theme-variable`,
   *   `raw-css-in-prop`, `important-blocked`, `url-in-style`,
   *   `position-fixed-blocked`) escalate from `warn` to `error`. In
   *   strict mode, blocked declarations are dropped before they reach
   *   the DOM; set to `false` for legacy warn-only behaviour. See
   *   `dev-docs/plans/08-sealed-theming-sandbox.md`.
   * - `allowInlineRawCss` (boolean, default `true`) — when `false`,
   *   the `style` prop refuses `url(...)` values and `!important`
   *   flags. Flips to `false` together with `strictTheming` in the
   *   next major release.
   * - `maxZIndex` (number, default `9999`) — ceiling for `zIndex`
   *   layout-prop values. Higher values are clamped with a
   *   `kind:"theming"` warn entry; the clamp applies in both strict
   *   and non-strict modes.
   * - `strictUdcSandbox` (boolean, default `false`) — when `true`,
   *   UDC sandboxing diagnostics (`udc-prop-undeclared`,
   *   `udc-scope-leak`, `udc-capability-missing`, etc.) escalate from
   *   `info` / `warn` to `error`. In strict mode, undeclared prop
   *   accesses and capability violations are blocked at runtime.
   *   Requires UDCs to carry explicit `<Prop>`, `<Event>`, `<Method>`,
   *   and `<Slot>` declarations. Flips to `true` in the next major
   *   release. See `dev-docs/plans/14-udc-sandbox.md`.
   * - `strictVersioning` (boolean, default `false`) — when `true`,
   *   versioning diagnostics (`removed-prop`, `internal-component-use`)
   *   escalate from `warn` to `error`; markup using a removed prop is
   *   blocked at render time. `deprecated-*` diagnostics always stay at
   *   `warn` (deprecation should nag, not break the app). Flips to
   *   `true` in the next major release. See
   *   `dev-docs/plans/12-enforced-versioning.md`.
   * - `preserveLegacyDefaults` (string[], default `[]`) — opts the
   *   listed `<Component>.<prop>` entries back to their previous default
   *   value when the framework rolls a default forward via
   *   `defaultValueChangedIn`. Emits a `default-value-changed` info
   *   diagnostic per affected component on use.
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
