type XmluiBuildMode = "CONFIG_ONLY" | "INLINE_ALL" | "ALL";

type XmluiBooleanLike = boolean | string | undefined | null;

type XmluiRuntimeFlags = {
  buildMode: XmluiBuildMode;
  devMode: boolean;
  standalone: boolean;
};

type XmluiAppDefineOptions = XmluiRuntimeFlags & {
  mockEnabled?: XmluiBooleanLike;
  mockWorkerLocation?: string;
  includeAllComponents?: XmluiBooleanLike;
  inspectUserComponents?: XmluiBooleanLike;
  appVersion?: string;
  additionalDefines?: Record<string, string | boolean | number | undefined>;
};

const XMLUI_PRESERVED_DEFINE_KEYS = {
  buildMode: "globalThis.__XMLUI_CONST_BUILD_MODE__",
  devMode: "globalThis.__XMLUI_CONST_DEV_MODE__",
  standalone: "globalThis.__XMLUI_CONST_STANDALONE__",
} as const;

const XMLUI_RUNTIME_ENV_KEYS = {
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

export function createXmluiModeDefines(flags: XmluiRuntimeFlags): Record<string, string | boolean> {
  return {
    [XMLUI_PRESERVED_DEFINE_KEYS.buildMode]: JSON.stringify(flags.buildMode),
    [XMLUI_PRESERVED_DEFINE_KEYS.devMode]: String(flags.devMode),
    [XMLUI_PRESERVED_DEFINE_KEYS.standalone]: String(flags.standalone),
  };
}

export function createXmluiAppDefines(
  options: XmluiAppDefineOptions,
): Record<string, string | boolean | number | undefined> {
  const {
    buildMode,
    devMode,
    standalone,
    mockEnabled,
    mockWorkerLocation,
    includeAllComponents,
    inspectUserComponents,
    appVersion,
    additionalDefines,
  } = options;

  return {
    ...createXmluiModeDefines({ buildMode, devMode, standalone }),
    [XMLUI_RUNTIME_ENV_KEYS.mockEnabled]: normalizeXmluiBoolean(mockEnabled, false),
    ...(mockWorkerLocation
      ? {
          [XMLUI_RUNTIME_ENV_KEYS.mockWorkerLocation]: JSON.stringify(mockWorkerLocation),
        }
      : {}),
    [XMLUI_RUNTIME_ENV_KEYS.includeAllComponents]: JSON.stringify(
      String(normalizeXmluiBoolean(includeAllComponents, false)),
    ),
    [XMLUI_RUNTIME_ENV_KEYS.inspectUserComponents]: JSON.stringify(
      String(normalizeXmluiBoolean(inspectUserComponents, false)),
    ),
    ...(appVersion !== undefined
      ? {
          [XMLUI_RUNTIME_ENV_KEYS.appVersion]: JSON.stringify(appVersion),
        }
      : {}),
    ...additionalDefines,
  };
}
