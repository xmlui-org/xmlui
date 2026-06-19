import React, { useMemo, useRef } from "react";
import { createRoot } from "react-dom/client";

import { evaluateExpressionOrText } from "./rendering/bindings";
import { createRenderContext, XmluiNodeRenderer } from "./rendering/renderer";
import {
  createRuntimeScope,
  initializeStateValuesIntoStore,
  type RuntimeScope,
  useRuntimeStateStore,
} from "./state";
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
  const rootOwnerId = "app:root";

  if (!initializedRef.current) {
    store.createLocalOwner(rootOwnerId);
    const initialScope = createRuntimeScope({ store, localOwnerId: rootOwnerId, props: {} });
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
    () => createRuntimeScope({ store, localOwnerId: rootOwnerId, props: {} }),
    [store],
  );
  const context = useMemo(() => createRenderContext(module.components), [module.components]);

  return <XmluiNodeRenderer context={context} node={module.root} scope={scope} />;
}

export type { XmluiModule } from "./types";
