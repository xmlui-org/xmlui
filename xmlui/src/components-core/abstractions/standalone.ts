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
   * - `allowedOrigins` (string[], default `undefined`) — when set, `App.fetch()` rejects any
   *   request whose target origin is not in this list before reaching the network. Origins
   *   must be fully-qualified (e.g. `"https://api.example.com"`). Same-origin requests are
   *   always permitted regardless of this list.
   * - `withXSRFToken` (boolean, default `true`) — when `true`, `App.fetch()` automatically
   *   injects the `X-XSRF-TOKEN` header from the `XSRF-TOKEN` cookie for same-origin
   *   requests. Set to `false` to disable this behaviour.
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
