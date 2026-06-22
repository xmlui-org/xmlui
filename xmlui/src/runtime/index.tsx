import React, { useEffect, useMemo, useRef } from "react";
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
import { XmluiThemeRoot } from "./rendering/theme";
import { createToastService, ToastHost, type ToastService } from "./services/toast";
import type { XmluiDocumentInput, XmluiModule, XmluiComponentModule } from "./types";
import { listRegisteredExtensions, normalizeExtensions, type Extension } from "../extensions";
import { ensureXmluiDebugBridge } from "./debug";

ensureXmluiDebugBridge();

export function createXmluiModule(
  document: XmluiDocumentInput,
  components: XmluiModule[] = [],
  options: { extensions?: Iterable<Extension> } = {},
): XmluiModule {
  if (document.kind === "component") {
    return {
      kind: "component",
      name: document.name,
      root: document.root,
    };
  }

  const componentMap: Record<string, XmluiComponentModule> = {};
  for (const component of components) {
    if (component.kind === "component") {
      componentMap[component.name] = component;
    }
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
  extensions?: Iterable<Extension>;
  testProbe?: (probe: XmluiRuntimeTestProbe) => void;
};

export type XmluiRuntimeTestProbe = {
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
        extensions={options.extensions}
        testProbe={options.testProbe}
      />,
    );
  }
  const root = createRoot(container);
  root.render(
    <XmluiRoot
      module={module}
      initialUrl={options.initialUrl}
      extensions={options.extensions}
      testProbe={options.testProbe}
    />,
  );
  return root;
}

export function XmluiRoot({
  module,
  initialUrl,
  extensions,
  testProbe,
}: {
  module: Extract<XmluiModule, { kind: "app" }>;
  initialUrl?: string;
  extensions?: Iterable<Extension>;
  testProbe?: (probe: XmluiRuntimeTestProbe) => void;
}) {
  const store = useRuntimeStateStore();
  const initializedRef = useRef(false);
  const referencesRef = useRef<Record<string, unknown>>({});
  const toastRef = useRef<ToastService>();
  if (!toastRef.current) {
    toastRef.current = createToastService();
  }
  const rootOwnerId = "app:root";
  const routeMode = routeModeFromApp(module.root.props.useHashBasedRouting);
  const routingRef = useRef<RuntimeRoutingStore>();
  if (!routingRef.current) {
    routingRef.current = new RuntimeRoutingStore(routeMode, () => store.invalidateRoute(), initialUrl);
  }
  const normalizedExtensions = useMemo(
    () => normalizeExtensions([
      ...listRegisteredExtensions(),
      ...(extensions ?? []),
    ]),
    [extensions],
  );
  useEffect(() => routingRef.current?.attach(), []);
  useEffect(() => {
    testProbe?.({
      readLocal: (name) => store.readLocal(rootOwnerId, name),
      readGlobal: (name) => store.readGlobal(name),
    });
  }, [store, testProbe]);

  if (!initializedRef.current) {
    store.createLocalOwner(rootOwnerId);
    const initialScope = createRuntimeScope({
      store,
      localOwnerId: rootOwnerId,
      props: {},
      references: referencesRef.current,
      routing: routingRef.current,
      toast: toastRef.current,
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
      references: referencesRef.current,
      routing: routingRef.current,
      toast: toastRef.current,
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
    <XmluiThemeRoot>
      <XmluiNodeRenderer context={context} node={module.root} scope={scope} />
      <ToastHost service={toastRef.current} />
    </XmluiThemeRoot>
  );
}

export type { XmluiDocumentInput, XmluiModule } from "./types";

function routeModeFromApp(value: string | undefined): RoutingMode {
  if (value === "false" || value === "{false}") {
    return "history";
  }
  return "hash";
}
