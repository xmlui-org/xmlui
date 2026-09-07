type XmluiBuildMode = "CONFIG_ONLY" | "INLINE_ALL";

type XmluiBooleanLike = boolean | string | undefined | null;

type XmluiAppDefineOptions = {
  buildMode: XmluiBuildMode;
  /** True for `xmlui start`. Turns on source maps for scripts compiled in the browser. */
  devServer?: XmluiBooleanLike;
  mockEnabled?: XmluiBooleanLike;
  mockWorkerLocation?: string;
  includeAllComponents?: XmluiBooleanLike;
  inspectUserComponents?: XmluiBooleanLike;
  appVersion?: string;
};

/**
 * Script-compilation settings `xmlui.config.json` states. Tri-state on purpose:
 * `undefined` means the file said nothing, so the app description keeps deciding.
 */
export type XmluiScriptCompilationDefineOptions = {
  compileScripts?: boolean;
  reportCompileFallbacks?: boolean;
};

// All application-level env vars that the xmlui CLI sets at app-build time.
// These map 1-to-1 to import.meta.env references that are preserved as
// pass-throughs in the framework lib build (vite build --mode lib).
const XMLUI_APP_DEFINE_KEYS = {
  buildMode: "import.meta.env.VITE_XMLUI_BUILD_MODE",
  devServer: "import.meta.env.VITE_XMLUI_DEV_SERVER",
  mockEnabled: "import.meta.env.VITE_MOCK_ENABLED",
  mockWorkerLocation: "import.meta.env.VITE_MOCK_WORKER_LOCATION",
  includeAllComponents: "import.meta.env.VITE_INCLUDE_ALL_COMPONENTS",
  inspectUserComponents: "import.meta.env.VITE_USER_COMPONENTS_Inspect",
  appVersion: "import.meta.env.VITE_APP_VERSION",
  compileScripts: "import.meta.env.VITE_XMLUI_COMPILE_SCRIPTS",
  reportCompileFallbacks: "import.meta.env.VITE_XMLUI_REPORT_COMPILE_FALLBACKS",
} as const;

function normalizeXmluiBoolean(value: XmluiBooleanLike, fallback = false): boolean {
  if (typeof value === "boolean") {
    return value;
  }
  if (value == null) {
    return fallback;
  }

  const normalized = String(value).trim().toLowerCase();
  if (normalized === "") {
    return fallback;
  }
  if (["true", "1"].includes(normalized)) {
    return true;
  }
  if (["false", "0"].includes(normalized)) {
    return false;
  }
  return fallback;
}

export function createXmluiAppDefines(
  options: XmluiAppDefineOptions,
): Record<string, string | boolean | number | undefined> {
  const {
    buildMode,
    devServer,
    mockEnabled,
    mockWorkerLocation,
    includeAllComponents,
    inspectUserComponents,
    appVersion,
  } = options;

  return {
    [XMLUI_APP_DEFINE_KEYS.buildMode]: JSON.stringify(buildMode),
    [XMLUI_APP_DEFINE_KEYS.devServer]: JSON.stringify(
      String(normalizeXmluiBoolean(devServer, false)),
    ),
    [XMLUI_APP_DEFINE_KEYS.mockEnabled]: normalizeXmluiBoolean(mockEnabled, false),
    ...(mockWorkerLocation
      ? {
          [XMLUI_APP_DEFINE_KEYS.mockWorkerLocation]: JSON.stringify(mockWorkerLocation),
        }
      : {}),
    [XMLUI_APP_DEFINE_KEYS.includeAllComponents]: JSON.stringify(
      String(normalizeXmluiBoolean(includeAllComponents, false)),
    ),
    [XMLUI_APP_DEFINE_KEYS.inspectUserComponents]: JSON.stringify(
      String(normalizeXmluiBoolean(inspectUserComponents, false)),
    ),
    ...(appVersion !== undefined
      ? {
          [XMLUI_APP_DEFINE_KEYS.appVersion]: JSON.stringify(appVersion),
        }
      : {}),
  };
}

/**
 * Bakes the script-compilation settings `xmlui.config.json` states into the app.
 *
 * The browser is what compiles binding expressions — prop values are parsed lazily
 * there, so bindings have no build-time artifact — but `xmlui.config.json` lives on the
 * build machine and the browser never sees it. Without these defines, an app that set
 * `compileScripts` only in that file got its handlers and declarations compiled at build
 * time and then, at runtime, neither used them nor compiled a single binding.
 *
 * Only stated settings are emitted, so an app that configures compilation in its
 * description alone is left exactly as it was.
 */
export function createXmluiScriptCompilationDefines(
  options: XmluiScriptCompilationDefineOptions = {},
): Record<string, string> {
  const { compileScripts, reportCompileFallbacks } = options;
  return {
    ...(compileScripts !== undefined
      ? { [XMLUI_APP_DEFINE_KEYS.compileScripts]: JSON.stringify(String(compileScripts)) }
      : {}),
    ...(reportCompileFallbacks !== undefined
      ? {
          [XMLUI_APP_DEFINE_KEYS.reportCompileFallbacks]: JSON.stringify(
            String(reportCompileFallbacks),
          ),
        }
      : {}),
  };
}
