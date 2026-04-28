type XmluiBuildMode = "CONFIG_ONLY" | "INLINE_ALL" | "ALL";

type XmluiBooleanLike = boolean | string | undefined | null;

export type XmluiRuntimeFlags = {
  buildMode: XmluiBuildMode;
  devMode: boolean;
  standalone: boolean;
};

export type XmluiAppDefineOptions = XmluiRuntimeFlags & {
  mockEnabled?: XmluiBooleanLike;
  mockWorkerLocation?: string;
  includeAllComponents?: XmluiBooleanLike;
  inspectUserComponents?: XmluiBooleanLike;
  appVersion?: string;
  additionalDefines?: Record<string, string | boolean | number | undefined>;
};

export const XMLUI_PRESERVED_DEFINE_KEYS = {
  buildMode: "import.meta.__XMLUI_BUILD_MODE__",
  devMode: "import.meta.__XMLUI_DEV_MODE__",
  standalone: "import.meta.__XMLUI_STANDALONE__",
} as const;

export const XMLUI_RUNTIME_ENV_KEYS = {
  buildMode: "import.meta.env.VITE_BUILD_MODE",
  devMode: "import.meta.env.VITE_DEV_MODE",
  standalone: "import.meta.env.VITE_STANDALONE",
  mockEnabled: "import.meta.env.VITE_MOCK_ENABLED",
  mockWorkerLocation: "import.meta.env.VITE_MOCK_WORKER_LOCATION",
  includeAllComponents: "import.meta.env.VITE_INCLUDE_ALL_COMPONENTS",
  inspectUserComponents: "import.meta.env.VITE_USER_COMPONENTS_Inspect",
  appVersion: "import.meta.env.VITE_APP_VERSION",
} as const;

export function normalizeXmluiBoolean(value: XmluiBooleanLike, fallback = false): boolean {
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

export function toDefineBoolean(value: XmluiBooleanLike, fallback = false): boolean {
  return normalizeXmluiBoolean(value, fallback);
}

export function toDefineString(value: string | undefined | null): string {
  return JSON.stringify(value ?? "");
}

export function createXmluiModeDefines(flags: XmluiRuntimeFlags): Record<string, string | boolean> {
  return {
    [XMLUI_RUNTIME_ENV_KEYS.buildMode]: JSON.stringify(flags.buildMode),
    [XMLUI_RUNTIME_ENV_KEYS.devMode]: flags.devMode,
    [XMLUI_RUNTIME_ENV_KEYS.standalone]: flags.standalone,

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
    [XMLUI_RUNTIME_ENV_KEYS.mockEnabled]: toDefineBoolean(mockEnabled, false),
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

export function createXmluiLibPreserveDefines(): Record<string, string> {
  return {
    [XMLUI_RUNTIME_ENV_KEYS.devMode]: XMLUI_PRESERVED_DEFINE_KEYS.devMode,
    [XMLUI_RUNTIME_ENV_KEYS.buildMode]: XMLUI_PRESERVED_DEFINE_KEYS.buildMode,
    [XMLUI_RUNTIME_ENV_KEYS.standalone]: XMLUI_PRESERVED_DEFINE_KEYS.standalone,
  };
}
