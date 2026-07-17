import React, { useEffect, useId, useMemo, useRef } from "react";
import { isEqual } from "lodash-es";

import { initializeStateValuesIntoStore, createRuntimeOwnerId, createRuntimeScope, type RuntimeScope } from "../state";
import type { XmluiComponentModule } from "../types";
import { evaluateExpressionOrText, evaluateProps, normalizeDependencies, runEvent } from "./bindings";
import type { RenderContext, RuntimeRenderLayoutContext } from "./types";
import { useBindingRevision } from "./reactive";
import type { XmluiElement, XmluiNode } from "../../compiler/ir";
import { supportedLayoutPropNames } from "../../styling";
import { stripDirectChildProps } from "../../abstractions/layout-context-utils";

export type RenderFragment = {
  children: XmluiNode[];
  scope: RuntimeScope;
};

export function createSlotScope(baseScope: RuntimeScope, contextValues: Record<string, unknown>): RuntimeScope {
  return createRuntimeScope({
    store: baseScope.store,
    parent: baseScope,
    props: baseScope.props,
    contextValues,
    i18n: baseScope.i18n,
  });
}

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
      references: parentScope.references,
      slots: parentScope.slots,
      i18n: parentScope.i18n,
      emitEvent: parentScope.emitEvent,
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
        references: parentScope.references,
        slots: parentScope.slots,
        i18n: parentScope.i18n,
        emitEvent: parentScope.emitEvent,
      }),
    [ownerId, parentScope, props],
  );

  useEffect(() => {
    for (const [name, value] of Object.entries(node.vars)) {
      const parsedValue = node.parsed?.vars?.[name];
      const hasReactiveDependencies = normalizeDependencies(parsedValue?.dependencies, scope).some(
        (dependency) =>
          dependency.kind === "local" ||
          dependency.kind === "global" ||
          dependency.kind === "props" ||
          dependency.kind === "route",
      );
      if (!hasReactiveDependencies) {
        continue;
      }
      const nextValue = evaluateExpressionOrText(value, parsedValue, scope);
      if (!isEqual(parentScope.store.readLocal(ownerId, name), nextValue)) {
        parentScope.store.writeLocal(ownerId, name, nextValue);
      }
    }
  });

  return <>{context.renderElement(node, scope)}</>;
}

export function ComponentInstance({
  component,
  context,
  node,
  scope,
  layoutContext,
}: {
  component: XmluiComponentModule;
  context: RenderContext;
  node: XmluiElement;
  scope: RuntimeScope;
  layoutContext?: RuntimeRenderLayoutContext;
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
  const componentScopeRef = useRef<RuntimeScope>();
  const componentReferences = useMemo<Record<string, unknown>>(() => ({}), []);
  const api = useMemo<Record<string, (...args: unknown[]) => Promise<unknown>>>(() => {
    const methods: Record<string, (...args: unknown[]) => Promise<unknown>> = {};
    for (const [name, method] of Object.entries(component.root.parsed?.methods ?? {})) {
      methods[name] = (...args: unknown[]) => {
        const methodScope = componentScopeRef.current;
        return methodScope ? Promise.resolve(runEvent(method, methodScope, args)) : Promise.resolve(undefined);
      };
    }
    return methods;
  }, [component.root.parsed?.methods]);

  if (!initializedRef.current) {
    const initialScope = createRuntimeScope({
      store: scope.store,
      localOwnerId: ownerId,
      parent: scope,
      props,
      references: componentReferences,
      i18n: scope.i18n,
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
      references: componentReferences,
      i18n: scope.i18n,
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
  }, [component.root.parsed?.vars, component.root.vars, componentReferences, ownerId, props, scope]);

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
        references: componentReferences,
        slots: createSlots(node, scope),
        i18n: scope.i18n,
        emitEvent: (eventName, args) => runEvent(node.parsed?.events?.[eventName], scope, args),
      }),
    [componentReferences, node, ownerId, props, scope],
  );
  componentReferences.$self = api;
  componentScopeRef.current = componentScope;
  const componentContext = useMemo(
    () =>
      component.components && Object.keys(component.components).length > 0
        ? context.withComponents(component.components)
        : context,
    [component.components, context],
  );
  const childLayoutContext = useMemo(
    () => stripDirectChildProps(layoutContext as any) as RuntimeRenderLayoutContext | undefined,
    [layoutContext],
  );
  const renderedRootChildren = useMemo(
    () => forwardSingleRootLayoutProps(component.root.children, props),
    [component.root.children, props],
  );

  useEffect(() => {
    const id = typeof props.id === "string" ? props.id : undefined;
    if (!id) {
      return;
    }
    scope.references[id] = api;
    return () => {
      if (scope.references[id] === api) {
        delete scope.references[id];
      }
    };
  }, [api, props.id, scope.references]);

  return <>{componentContext.renderChildren(renderedRootChildren, componentScope, undefined, childLayoutContext)}</>;
}

const layoutPropNames = new Set([
  ...supportedLayoutPropNames,
]);

function forwardSingleRootLayoutProps(
  children: XmluiNode[],
  props: Record<string, unknown>,
): XmluiNode[] {
  if (children.length !== 1 || children[0].kind !== "element") {
    return children;
  }
  const forwardedProps = Object.fromEntries(
    Object.entries(props).filter(([name]) => layoutPropNames.has(name as never)),
  );
  if (Object.keys(forwardedProps).length === 0) {
    return children;
  }
  const [root] = children;
  return [{
    ...root,
    props: {
      ...forwardedProps,
      ...root.props,
    },
  }];
}

function createSlots(node: XmluiElement, scope: RuntimeScope): Record<string, RenderFragment> {
  const slots: Record<string, RenderFragment> = {};
  const defaultChildren: XmluiNode[] = [];

  for (const child of node.children) {
    if (child.kind === "element" && child.type === "property") {
      const name = child.props.name;
      if (name) {
        slots[name] = { children: child.children, scope };
      }
      continue;
    }
    defaultChildren.push(child);
  }

  if (defaultChildren.length > 0) {
    slots.default = { children: defaultChildren, scope };
  }

  return slots;
}
