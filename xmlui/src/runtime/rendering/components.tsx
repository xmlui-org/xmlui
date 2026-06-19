import React, { useEffect, useId, useMemo, useRef } from "react";

import { initializeStateValuesIntoStore, createRuntimeOwnerId, createRuntimeScope, type RuntimeScope } from "../state";
import type { XmluiComponentModule } from "../types";
import { evaluateExpressionOrText, evaluateProps } from "./bindings";
import type { RenderContext } from "./types";
import { useBindingRevision } from "./reactive";
import type { XmluiElement } from "../../compiler/ir";

export function ScopedElement({
  context,
  node,
  parentScope,
  props,
}: {
  context: RenderContext;
  node: XmluiElement;
  parentScope: RuntimeScope;
  props: Record<string, unknown>;
}) {
  const reactId = useId();
  const ownerId = useMemo(() => createRuntimeOwnerId("element", reactId), [reactId]);
  const initializedRef = useRef(false);

  if (!initializedRef.current) {
    const initialScope = createRuntimeScope({
      store: parentScope.store,
      localOwnerId: ownerId,
      parent: parentScope,
      props,
    });
    parentScope.store.createLocalOwner(ownerId);
    initializeStateValuesIntoStore({
      kind: "local",
      ownerId,
      expressions: node.vars,
      parsed: node.parsed?.vars,
      scope: initialScope,
      evaluate: evaluateExpressionOrText,
    });
    initializedRef.current = true;
  }

  useEffect(
    () => () => {
      parentScope.store.disposeLocalOwner(ownerId);
    },
    [ownerId, parentScope.store],
  );

  const scope = useMemo<RuntimeScope>(
    () =>
      createRuntimeScope({
        store: parentScope.store,
        localOwnerId: ownerId,
        parent: parentScope,
        props,
      }),
    [ownerId, parentScope, props],
  );

  return <>{context.renderElement(node, scope)}</>;
}

export function ComponentInstance({
  component,
  context,
  node,
  scope,
}: {
  component: XmluiComponentModule;
  context: RenderContext;
  node: XmluiElement;
  scope: RuntimeScope;
}) {
  const propDependencies = Object.values(node.parsed?.props ?? {}).flatMap((parsed) =>
    Array.isArray(parsed)
      ? parsed.flatMap((segment) => (segment.kind === "expression" ? segment.dependencies ?? [] : []))
      : parsed.dependencies ?? [],
  );
  useBindingRevision(propDependencies, scope);
  const props = useMemo(
    () => evaluateProps(node.props, node.parsed?.props, scope),
    [node.props, node.parsed?.props, scope, scope.store.getSnapshot()],
  );
  const reactId = useId();
  const ownerId = useMemo(() => createRuntimeOwnerId(`component-${component.name}`, reactId), [
    component.name,
    reactId,
  ]);
  const initializedRef = useRef(false);

  if (!initializedRef.current) {
    const initialScope = createRuntimeScope({
      store: scope.store,
      localOwnerId: ownerId,
      parent: scope,
      props,
    });
    scope.store.createLocalOwner(ownerId);
    initializeStateValuesIntoStore({
      kind: "local",
      ownerId,
      expressions: component.root.vars,
      parsed: component.root.parsed?.vars,
      scope: initialScope,
      evaluate: evaluateExpressionOrText,
    });
    initializedRef.current = true;
  }

  useEffect(() => {
    const latestScope = createRuntimeScope({
      store: scope.store,
      localOwnerId: ownerId,
      parent: scope,
      props,
    });
    for (const [name, value] of Object.entries(component.root.vars)) {
      const parsed = component.root.parsed?.vars?.[name];
      scope.store.updateReactiveEvaluator(
        { kind: "local", ownerId, name },
        () => evaluateExpressionOrText(value, parsed, latestScope),
      );
    }
    for (const name of Object.keys(props)) {
      scope.store.invalidateProp(ownerId, name);
    }
  }, [component.root.parsed?.vars, component.root.vars, ownerId, props, scope]);

  useEffect(
    () => () => {
      scope.store.disposeLocalOwner(ownerId);
    },
    [ownerId, scope.store],
  );

  const componentScope = useMemo<RuntimeScope>(
    () =>
      createRuntimeScope({
        store: scope.store,
        localOwnerId: ownerId,
        parent: scope,
        props,
      }),
    [ownerId, props, scope],
  );

  return <>{context.renderChildren(component.root.children, componentScope)}</>;
}
