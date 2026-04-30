type XmluiBuildMode = "CONFIG_ONLY" | "INLINE_ALL" | "ALL";

type XmluiBooleanLike = boolean | string | undefined | null;

type XmluiAppDefineOptions = {
  buildMode: XmluiBuildMode;
  mockEnabled?: XmluiBooleanLike;
  mockWorkerLocation?: string;
  includeAllComponents?: XmluiBooleanLike;
  inspectUserComponents?: XmluiBooleanLike;
  appVersion?: string;
  additionalDefines?: Record<string, string | boolean | number | undefined>;
};

// All application-level env vars that the xmlui CLI sets at app-build time.
// These map 1-to-1 to import.meta.env references that are preserved as
// pass-throughs in the framework lib build (vite build --mode lib).
const XMLUI_APP_DEFINE_KEYS = {
  buildMode: "import.meta.env.VITE_XMLUI_BUILD_MODE",
  mockEnabled: "import.meta.env.VITE_MOCK_ENABLED",
  mockWorkerLocation: "import.meta.env.VITE_MOCK_WORKER_LOCATION",
  includeAllComponents: "import.meta.env.VITE_INCLUDE_ALL_COMPONENTS",
  inspectUserComponents: "import.meta.env.VITE_USER_COMPONENTS_Inspect",
  appVersion: "import.meta.env.VITE_APP_VERSION",
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
  if (["true", "1", "yes", "on"].includes(normalized)) {
    return true;
  }
  if (["false", "0", "no", "off"].includes(normalized)) {
    return false;
  }
  return fallback;
}

export function createXmluiAppDefines(
  options: XmluiAppDefineOptions,
): Record<string, string | boolean | number | undefined> {
  const {
    buildMode,
    mockEnabled,
    mockWorkerLocation,
    includeAllComponents,
    inspectUserComponents,
    appVersion,
    additionalDefines,
  } = options;

  return {
    [XMLUI_APP_DEFINE_KEYS.buildMode]: JSON.stringify(buildMode),
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
    ...additionalDefines,
  };
}
