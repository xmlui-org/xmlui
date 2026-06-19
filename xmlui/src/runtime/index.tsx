import React, { useEffect, useMemo, useRef } from "react";
import { createRoot } from "react-dom/client";

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
import type { XmluiDocumentInput, XmluiModule, XmluiComponentModule } from "./types";

export function createXmluiModule(
  document: XmluiDocumentInput,
  components: XmluiModule[] = [],
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

  return {
    kind: "app",
    root: document.root,
    components: componentMap,
  };
}

export function renderXmluiApp(module: XmluiModule, container: HTMLElement): void {
  if (module.kind !== "app") {
    throw new Error("renderXmluiApp expected an app module.");
  }

  createRoot(container).render(<XmluiRoot module={module} />);
}

function XmluiRoot({ module }: { module: Extract<XmluiModule, { kind: "app" }> }) {
  const store = useRuntimeStateStore();
  const initializedRef = useRef(false);
  const referencesRef = useRef<Record<string, unknown>>({});
  const rootOwnerId = "app:root";
  const routeMode = routeModeFromApp(module.root.props.useHashBasedRouting);
  const routingRef = useRef<RuntimeRoutingStore>();
  if (!routingRef.current) {
    routingRef.current = new RuntimeRoutingStore(routeMode, () => store.invalidateRoute());
  }
  useEffect(() => routingRef.current?.attach(), []);

  if (!initializedRef.current) {
    store.createLocalOwner(rootOwnerId);
    const initialScope = createRuntimeScope({
      store,
      localOwnerId: rootOwnerId,
      props: {},
      references: referencesRef.current,
      routing: routingRef.current,
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
    }),
    [store],
  );
  const context = useMemo(() => createRenderContext(module.components), [module.components]);

  return (
    <XmluiThemeRoot>
      <XmluiNodeRenderer context={context} node={module.root} scope={scope} />
    </XmluiThemeRoot>
  );
}

export type { XmluiModule } from "./types";

function routeModeFromApp(value: string | undefined): RoutingMode {
  if (value === "false" || value === "{false}") {
    return "history";
  }
  return "hash";
}
