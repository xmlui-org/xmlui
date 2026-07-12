import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createRoot, hydrateRoot, type Root } from "react-dom/client";
import hotToast from "react-hot-toast";

import { evaluateExpressionOrText } from "./rendering/bindings";
import { createRenderContext, XmluiNodeRenderer } from "./rendering/renderer";
import {
  createRuntimeScope,
  initializeStateValuesIntoStore,
  type RuntimeScope,
  useRuntimeStateStore,
} from "./state";
import { RuntimeRoutingStore, type RoutingMode } from "./routing";
import { XmluiAppContextProvider, type XmluiAppContextValue } from "./appContext";
import { StyleProvider, XmluiThemeRoot } from "./rendering/theme";
import { createToastService, type ToastService } from "./services/toast";
import { GlobalLiveRegion } from "../components/LiveRegion/LiveRegionReact";
import { IconProvider } from "../components/IconProvider";
import { LegacyThemeProvider, useThemes } from "../components-core/theming/ThemeContext";
import { ThemedButton as Button } from "../components/Button/Button";
import { Dialog } from "../components/ModalDialog/Dialog";
import { ThemedStack as Stack } from "../components/Stack/Stack";
import { NotificationToast } from "../components/Theme/NotificationToast";
import { defaultProps as themeDefaultProps } from "../components/Theme/Theme.defaults";
import { createRuntimeI18n, type RuntimeI18n } from "./i18n";
import type { XmluiDocumentInput, XmluiModule, XmluiComponentModule } from "./types";
import { listRegisteredExtensions, normalizeExtensions, type Extension } from "../extensions";
import { ensureXmluiDebugBridge } from "./debug";
import type { ThemeTone } from "../styling";
import type { ThemeDefinition } from "../abstractions/ThemingDefs";
import { responsiveBreakpoints } from "../styling/contracts";

ensureXmluiDebugBridge();

export function createXmluiModule(
  document: XmluiDocumentInput,
  components: XmluiModule[] = [],
  options: { extensions?: Iterable<Extension> } = {},
): XmluiModule {
  const componentMap: Record<string, XmluiComponentModule> = {};
  for (const component of components) {
    if (component.kind === "component") {
      componentMap[component.name] = component;
    }
  }

  if (document.kind === "component") {
    return {
      kind: "component",
      name: document.name,
      root: document.root,
      components: componentMap,
    };
  }

  const normalizedExtensions = normalizeExtensions(options.extensions ?? []);
  return {
    kind: "app",
    root: document.root,
    components: componentMap,
    extensionRenderers: normalizedExtensions.renderers,
    extensionFunctions: normalizedExtensions.functions,
  };
}

export function renderXmluiApp(
  module: XmluiModule,
  container: HTMLElement,
  options: MountXmluiAppOptions = {},
): void {
  if (module.kind !== "app") {
    throw new Error("renderXmluiApp expected an app module.");
  }

  mountXmluiApp(module, container, options);
}

export type MountXmluiAppOptions = {
  hydrate?: boolean;
  initialUrl?: string;
  isolateRouting?: boolean;
  defaultTone?: ThemeTone;
  extensions?: Iterable<Extension>;
  appGlobals?: Record<string, unknown>;
  icons?: Record<string, string>;
  resources?: Record<string, string>;
  themes?: Array<ThemeDefinition>;
  defaultTheme?: string;
  testProbe?: (probe: XmluiRuntimeTestProbe) => void;
};

export type XmluiRuntimeTestProbe = {
  hasLocal(name: string): boolean;
  readLocal(name: string): unknown;
  readGlobal(name: string): unknown;
  readReference(name: string): unknown;
};

export function mountXmluiApp(
  module: XmluiModule,
  container: HTMLElement,
  options: MountXmluiAppOptions = {},
): Root {
  if (module.kind !== "app") {
    throw new Error("mountXmluiApp expected an app module.");
  }
  if (options.hydrate) {
    return hydrateRoot(
      container,
      <XmluiRoot
        module={module}
        initialUrl={options.initialUrl}
        isolateRouting={options.isolateRouting}
        defaultTone={options.defaultTone}
        extensions={options.extensions}
        appGlobals={options.appGlobals}
        icons={options.icons}
        resources={options.resources}
        themes={options.themes}
        defaultTheme={options.defaultTheme}
        testProbe={options.testProbe}
      />,
    );
  }
  const root = createRoot(container);
  root.render(
    <XmluiRoot
      module={module}
      initialUrl={options.initialUrl}
      isolateRouting={options.isolateRouting}
      defaultTone={options.defaultTone}
        extensions={options.extensions}
        appGlobals={options.appGlobals}
        icons={options.icons}
        resources={options.resources}
        themes={options.themes}
        defaultTheme={options.defaultTheme}
      testProbe={options.testProbe}
    />,
  );
  return root;
}

export function XmluiRoot({
  module,
  initialUrl,
  isolateRouting = false,
  defaultTone,
  extensions,
  appGlobals = {},
  icons = {},
  resources = {},
  themes = [],
  defaultTheme,
  testProbe,
}: {
  module: Extract<XmluiModule, { kind: "app" }>;
  initialUrl?: string;
  isolateRouting?: boolean;
  defaultTone?: ThemeTone;
  extensions?: Iterable<Extension>;
  appGlobals?: Record<string, unknown>;
  icons?: Record<string, string>;
  resources?: Record<string, string>;
  themes?: Array<ThemeDefinition>;
  defaultTheme?: string;
  testProbe?: (probe: XmluiRuntimeTestProbe) => void;
}) {
  const store = useRuntimeStateStore();
  const referencesRef = useRef<Record<string, unknown>>({});
  const [loggedInUser, setLoggedInUser] = useState<unknown>(undefined);
  const updateLoggedInUser = useCallback((user: unknown) => {
    setLoggedInUser((current: unknown) => areContextValuesEqual(current, user) ? current : user);
  }, []);
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState | undefined>();
  const toastRef = useRef<ToastService>();
  if (!toastRef.current) {
    toastRef.current = createToastService();
  }
  useEffect(() => {
    hotToast.dismiss();
    hotToast.remove();
    return () => {
      hotToast.dismiss();
      hotToast.remove();
    };
  }, []);
  const i18nRef = useRef<RuntimeI18n>();
  if (!i18nRef.current) {
    i18nRef.current = createRuntimeI18n();
  }
  const rootOwnerId = "app:root";
  const routeMode = routeModeFromApp(module.root.props.useHashBasedRouting, appGlobals.useHashBasedRouting);
  const routingRef = useRef<RuntimeRoutingStore>();
  if (!routingRef.current) {
    routingRef.current = new RuntimeRoutingStore(
      routeMode,
      () => store.invalidateRoute(),
      initialUrl,
      isolateRouting,
    );
  }
  const normalizedExtensions = useMemo(
    () => normalizeExtensions([
      ...listRegisteredExtensions(),
      ...(extensions ?? []),
    ]),
    [extensions],
  );
  useEffect(() => routingRef.current?.attach(), []);
  const confirm = useCallback((title: unknown, message?: unknown, okLabel?: unknown, cancelLabel?: unknown) => {
    return new Promise<boolean>((resolve) => {
      setConfirmDialog({
        title: String(title ?? "Confirm"),
        message: message == null ? undefined : String(message),
        okLabel: okLabel == null ? undefined : String(okLabel),
        cancelLabel: cancelLabel == null ? undefined : String(cancelLabel),
        resolve,
      });
    });
  }, []);
  const signError = useCallback((error: unknown) => {
    const message = errorMessage(error);
    hotToast.error(message);
    console.error("[xmlui]", message);
  }, []);
  useEffect(() => {
    testProbe?.({
      hasLocal: (name) => store.hasLocal(rootOwnerId, name),
      readLocal: (name) => store.readLocal(rootOwnerId, name),
      readGlobal: (name) => store.readGlobal(name),
      readReference: (name) => referencesRef.current[name],
    });
  }, [store, testProbe]);

  const context = useMemo(
    () => createRenderContext(module.components, {
      ...(module.extensionRenderers ?? {}),
      ...normalizedExtensions.renderers,
    }),
    [module.components, module.extensionRenderers, normalizedExtensions.renderers],
  );
  const mediaSize = useRuntimeMediaSize();

  return (
    <StyleProvider>
      <XmluiAppContextProvider value={{
        appGlobals,
        loggedInUser,
        setLoggedInUser: updateLoggedInUser,
        confirm,
        signError,
        mediaSize,
      }}>
        <IconProvider icons={icons}>
          <XmluiThemeRoot tone={defaultTone}>
            <LegacyThemeProvider resources={resources} themes={themes} defaultTheme={defaultTheme}>
              <XmluiRuntimeContent
                appGlobals={appGlobals}
                confirm={confirm}
                context={context}
                extensionFunctions={{
                  ...(module.extensionFunctions ?? {}),
                  ...normalizedExtensions.functions,
                }}
                i18n={i18nRef.current}
                loggedInUser={loggedInUser}
                module={module}
                references={referencesRef.current}
                rootOwnerId={rootOwnerId}
                routing={routingRef.current}
                signError={signError}
                store={store}
                toast={toastRef.current}
              />
              {renderConfirmDialog(confirmDialog, (confirmed) => {
                confirmDialog?.resolve(confirmed);
                setConfirmDialog(undefined);
              })}
              <GlobalLiveRegion />
              <NotificationToast
                toastDuration={themeDefaultProps.toastDuration}
                notificationPosition={themeDefaultProps.notificationPosition}
              />
            </LegacyThemeProvider>
          </XmluiThemeRoot>
        </IconProvider>
      </XmluiAppContextProvider>
    </StyleProvider>
  );
}

function XmluiRuntimeContent({
  appGlobals,
  confirm,
  context,
  extensionFunctions,
  i18n,
  loggedInUser,
  module,
  references,
  rootOwnerId,
  routing,
  signError,
  store,
  toast,
}: {
  appGlobals: Record<string, unknown>;
  confirm: (title: unknown, message?: unknown, okLabel?: unknown, cancelLabel?: unknown) => Promise<boolean>;
  context: ReturnType<typeof createRenderContext>;
  extensionFunctions: Record<string, (...args: unknown[]) => unknown>;
  i18n: RuntimeI18n | undefined;
  loggedInUser: unknown;
  module: Extract<XmluiModule, { kind: "app" }>;
  references: Record<string, unknown>;
  rootOwnerId: string;
  routing: RuntimeRoutingStore | undefined;
  signError: (error: unknown) => void;
  store: ReturnType<typeof useRuntimeStateStore>;
  toast: ToastService | undefined;
}) {
  const initializedRef = useRef(false);
  const themes = useThemes();
  const appContextValues = useMemo(
    () => ({
      activeThemeId: themes.activeThemeId,
      activeThemeTone: themes.activeThemeTone,
      appGlobals,
      $appGlobals: appGlobals,
      availableThemeIds: themes.availableThemeIds,
      confirm,
      loggedInUser,
      setTheme: themes.setActiveThemeId,
      setThemeTone: themes.setActiveThemeTone,
      signError,
      toggleThemeTone: () => {
        themes.setActiveThemeTone(themes.activeThemeTone === "dark" ? "light" : "dark");
      },
    }),
    [appGlobals, confirm, loggedInUser, signError, themes],
  );
  const scope = useMemo<RuntimeScope>(
    () => createRuntimeScope({
      store,
      localOwnerId: rootOwnerId,
      props: {},
      contextValues: appContextValues,
      references,
      routing,
      toast,
      i18n,
      extensionFunctions,
    }),
    [appContextValues, extensionFunctions, i18n, references, rootOwnerId, routing, store, toast],
  );

  if (!initializedRef.current) {
    store.createLocalOwner(rootOwnerId);
    store.setInitialGlobalValue("appGlobals", appGlobals);
    initializeStateValuesIntoStore({
      kind: "global",
      expressions: module.root.globals,
      parsed: module.root.parsed?.globals,
      scope,
      evaluate: evaluateExpressionOrText,
    });
    initializeStateValuesIntoStore({
      kind: "local",
      ownerId: rootOwnerId,
      expressions: module.root.vars,
      parsed: module.root.parsed?.vars,
      scope,
      evaluate: evaluateExpressionOrText,
    });
    initializedRef.current = true;
  }

  return <XmluiNodeRenderer context={context} node={module.root} scope={scope} />;
}

function errorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message || "Something went wrong";
  }
  if (typeof error === "string") {
    return error || "Something went wrong";
  }
  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (message != null && String(message)) {
      return String(message);
    }
  }
  return "Something went wrong";
}

type RuntimeMediaSize = XmluiAppContextValue["mediaSize"];

function useRuntimeMediaSize(): RuntimeMediaSize {
  const [mediaSize, setMediaSize] = useState<RuntimeMediaSize>(() => runtimeMediaSizeFromWidth(
    typeof window === "undefined" ? responsiveBreakpoints.xl : window.innerWidth,
  ));

  useEffect(() => {
    const update = () => setMediaSize(runtimeMediaSizeFromWidth(window.innerWidth));
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return mediaSize;
}

function runtimeMediaSizeFromWidth(width: number): RuntimeMediaSize {
  if (width >= responsiveBreakpoints.xxl) {
    return mediaSizeValue("xxl", 5);
  }
  if (width >= responsiveBreakpoints.xl) {
    return mediaSizeValue("xl", 4);
  }
  if (width >= responsiveBreakpoints.lg) {
    return mediaSizeValue("lg", 3);
  }
  if (width >= responsiveBreakpoints.md) {
    return mediaSizeValue("md", 2);
  }
  if (width >= responsiveBreakpoints.sm) {
    return mediaSizeValue("sm", 1);
  }
  return mediaSizeValue("xs", 0);
}

function mediaSizeValue(size: RuntimeMediaSize["size"], sizeIndex: number): RuntimeMediaSize {
  return {
    size,
    sizeIndex,
    phone: size === "xs",
    landscapePhone: size === "sm",
    tablet: size === "md",
    desktop: size === "lg",
    largeDesktop: size === "xl",
    xlDesktop: size === "xxl",
    smallScreen: sizeIndex <= 2,
    largeScreen: sizeIndex >= 3,
  };
}

function areContextValuesEqual(left: unknown, right: unknown): boolean {
  if (Object.is(left, right)) {
    return true;
  }
  if (!isPlainRecord(left) || !isPlainRecord(right)) {
    return false;
  }
  const leftKeys = Object.keys(left);
  const rightKeys = Object.keys(right);
  if (leftKeys.length !== rightKeys.length) {
    return false;
  }
  return leftKeys.every((key) =>
    Object.prototype.hasOwnProperty.call(right, key) && Object.is(left[key], right[key])
  );
}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== "object") {
    return false;
  }
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

type ConfirmDialogState = {
  title: string;
  message?: string;
  okLabel?: string;
  cancelLabel?: string;
  resolve: (value: boolean) => void;
};

function renderConfirmDialog(
  confirmDialog: ConfirmDialogState | undefined,
  close: (confirmed: boolean) => void,
) {
  if (!confirmDialog) {
    return null;
  }
  return (
    <Dialog
      title={confirmDialog.title}
      description={confirmDialog.message}
      isOpen={true}
      onClose={() => close(false)}
      buttons={
        <Stack
          orientation="horizontal"
          horizontalAlignment="end"
          style={{ width: "100%", gap: "1em" }}
        >
          <Button variant="ghost" themeColor="secondary" size="sm" onClick={() => close(false)}>
            {confirmDialog.cancelLabel ?? "Cancel"}
          </Button>
          <Button
            variant="solid"
            themeColor="attention"
            size="sm"
            type="submit"
            onClick={() => close(true)}
          >
            {confirmDialog.okLabel ?? "OK"}
          </Button>
        </Stack>
      }
    />
  );
}

export type { XmluiDocumentInput, XmluiModule } from "./types";

export { startApp } from "./startApp";

function routeModeFromApp(value: string | undefined, configValue: unknown): RoutingMode {
  if (value === "false" || value === "{false}" || configValue === false) {
    return "history";
  }
  return "hash";
}
