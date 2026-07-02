import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { createRoot, hydrateRoot, type Root } from "react-dom/client";

import { evaluateExpressionOrText } from "./rendering/bindings";
import { createRenderContext, XmluiNodeRenderer } from "./rendering/renderer";
import {
  createRuntimeScope,
  initializeStateValuesIntoStore,
  type RuntimeScope,
  useRuntimeStateStore,
} from "./state";
import { RuntimeRoutingStore, type RoutingMode } from "./routing";
import { XmluiAppContextProvider } from "./appContext";
import { StyleProvider, XmluiThemeRoot } from "./rendering/theme";
import { createToastService, ToastHost, type ToastService } from "./services/toast";
import { GlobalLiveRegion } from "../components/LiveRegion/LiveRegionReact";
import { IconProvider } from "../components/IconProvider";
import { LegacyThemeProvider } from "../components-core/theming/ThemeContext";
import { createRuntimeI18n, type RuntimeI18n } from "./i18n";
import type { XmluiDocumentInput, XmluiModule, XmluiComponentModule } from "./types";
import { listRegisteredExtensions, normalizeExtensions, type Extension } from "../extensions";
import { ensureXmluiDebugBridge } from "./debug";
import type { ThemeTone } from "../styling";

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
  resources?: Record<string, string>;
  testProbe?: (probe: XmluiRuntimeTestProbe) => void;
};

export type XmluiRuntimeTestProbe = {
  hasLocal(name: string): boolean;
  readLocal(name: string): unknown;
  readGlobal(name: string): unknown;
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
        resources={options.resources}
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
      resources={options.resources}
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
  resources = {},
  testProbe,
}: {
  module: Extract<XmluiModule, { kind: "app" }>;
  initialUrl?: string;
  isolateRouting?: boolean;
  defaultTone?: ThemeTone;
  extensions?: Iterable<Extension>;
  appGlobals?: Record<string, unknown>;
  resources?: Record<string, string>;
  testProbe?: (probe: XmluiRuntimeTestProbe) => void;
}) {
  const store = useRuntimeStateStore();
  const initializedRef = useRef(false);
  const referencesRef = useRef<Record<string, unknown>>({});
  const [confirmDialog, setConfirmDialog] = useState<{ title: string; message?: string; okLabel?: string } | undefined>();
  const toastRef = useRef<ToastService>();
  if (!toastRef.current) {
    toastRef.current = createToastService();
  }
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
  const confirm = useCallback((title: unknown, message?: unknown, okLabel?: unknown) => {
    setConfirmDialog({
      title: String(title ?? "Confirm"),
      message: message == null ? undefined : String(message),
      okLabel: okLabel == null ? undefined : String(okLabel),
    });
    return true;
  }, []);
  referencesRef.current.confirm = confirm;
  useEffect(() => {
    testProbe?.({
      hasLocal: (name) => store.hasLocal(rootOwnerId, name),
      readLocal: (name) => store.readLocal(rootOwnerId, name),
      readGlobal: (name) => store.readGlobal(name),
    });
  }, [store, testProbe]);

  if (!initializedRef.current) {
    store.createLocalOwner(rootOwnerId);
    store.setInitialGlobalValue("appGlobals", appGlobals);
    const initialScope = createRuntimeScope({
      store,
      localOwnerId: rootOwnerId,
      props: {},
      contextValues: { appGlobals, $appGlobals: appGlobals },
      references: referencesRef.current,
      routing: routingRef.current,
      toast: toastRef.current,
      i18n: i18nRef.current,
      extensionFunctions: {
        ...(module.extensionFunctions ?? {}),
        ...normalizedExtensions.functions,
      },
    });
    initializeStateValuesIntoStore({
      kind: "global",
      expressions: module.root.globals,
      parsed: module.root.parsed?.globals,
      scope: initialScope,
      evaluate: evaluateExpressionOrText,
    });
    initializeStateValuesIntoStore({
      kind: "local",
      ownerId: rootOwnerId,
      expressions: module.root.vars,
      parsed: module.root.parsed?.vars,
      scope: initialScope,
      evaluate: evaluateExpressionOrText,
    });
    initializedRef.current = true;
  }

  const scope = useMemo<RuntimeScope>(
    () => createRuntimeScope({
      store,
      localOwnerId: rootOwnerId,
      props: {},
      contextValues: { appGlobals, $appGlobals: appGlobals },
      references: referencesRef.current,
      routing: routingRef.current,
      toast: toastRef.current,
      i18n: i18nRef.current,
      extensionFunctions: {
        ...(module.extensionFunctions ?? {}),
        ...normalizedExtensions.functions,
      },
    }),
    [module.extensionFunctions, normalizedExtensions.functions, store],
  );
  const context = useMemo(
    () => createRenderContext(module.components, {
      ...(module.extensionRenderers ?? {}),
      ...normalizedExtensions.renderers,
    }),
    [module.components, module.extensionRenderers, normalizedExtensions.renderers],
  );

  return (
    <StyleProvider>
      <XmluiAppContextProvider value={{ appGlobals, mediaSize: { sizeIndex: 4 } }}>
        <IconProvider icons={{}}>
          <XmluiThemeRoot tone={defaultTone}>
            <LegacyThemeProvider resources={resources}>
              <XmluiNodeRenderer context={context} node={module.root} scope={scope} />
              {renderConfirmDialog(confirmDialog, () => setConfirmDialog(undefined))}
              <GlobalLiveRegion />
              <ToastHost service={toastRef.current} />
            </LegacyThemeProvider>
          </XmluiThemeRoot>
        </IconProvider>
      </XmluiAppContextProvider>
    </StyleProvider>
  );
}

function renderConfirmDialog(
  confirmDialog: { title: string; message?: string; okLabel?: string } | undefined,
  close: () => void,
) {
  if (!confirmDialog) {
    return null;
  }
  const dialog = (
    <div
      data-xmlui-confirm-layer=""
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10000,
        background: "rgba(0, 0, 0, 0.2)",
      }}
      onMouseDown={(event) => {
        event.stopPropagation();
        close();
      }}
    >
      <div
        role="dialog"
        aria-label={confirmDialog.title}
        style={{
          position: "fixed",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          minWidth: "18rem",
          padding: "1rem",
          borderRadius: "4px",
          background: "var(--xmlui-color-surface-0, #fff)",
          boxShadow: "var(--xmlui-boxShadow-md, 0 8px 24px rgba(0, 0, 0, 0.18))",
        }}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div>{confirmDialog.title}</div>
        {confirmDialog.message ? <div>{confirmDialog.message}</div> : null}
        <button type="button" onClick={close}>
          {confirmDialog.okLabel ?? "OK"}
        </button>
      </div>
    </div>
  );
  return typeof document === "undefined" ? dialog : createPortal(dialog, document.body);
}

export type { XmluiDocumentInput, XmluiModule } from "./types";

export { startApp } from "./startApp";

function routeModeFromApp(value: string | undefined, configValue: unknown): RoutingMode {
  if (value === "false" || value === "{false}" || configValue === false) {
    return "history";
  }
  return "hash";
}
