import type { CompiledEventContext, CompiledExpressionContext } from "../../compiler/scriptSemantics";
import type { RuntimeStateStore } from "./store";
import type { StateOwnerId } from "./types";

export type RuntimeScope = {
  store: RuntimeStateStore;
  localOwnerId?: StateOwnerId;
  parent?: RuntimeScope;
  props: Record<string, unknown>;
};

export function createRuntimeScope({
  store,
  localOwnerId,
  parent,
  props = {},
}: {
  store: RuntimeStateStore;
  localOwnerId?: StateOwnerId;
  parent?: RuntimeScope;
  props?: Record<string, unknown>;
}): RuntimeScope {
  return {
    store,
    localOwnerId,
    parent,
    props,
  };
}

export function hasLocalName(scope: RuntimeScope | undefined, name: string): boolean {
  if (!scope) {
    return false;
  }
  if (scope.store.hasLocal(scope.localOwnerId, name)) {
    return true;
  }
  return hasLocalName(scope.parent, name);
}

export function readLocal(scope: RuntimeScope | undefined, name: string): unknown {
  if (!scope) {
    return undefined;
  }
  if (scope.store.hasLocal(scope.localOwnerId, name)) {
    return scope.store.readLocal(scope.localOwnerId, name);
  }
  if (scope.parent) {
    const parentValue = readLocal(scope.parent, name);
    if (parentValue !== undefined || hasLocalName(scope.parent, name)) {
      return parentValue;
    }
  }
  return scope.store.readGlobal(name);
}

export function readGlobal(scope: RuntimeScope | undefined, name: string): unknown {
  return scope?.store.readGlobal(name);
}

export function writeLocal(scope: RuntimeScope, name: string, value: unknown): void {
  const ownerId = findLocalOwner(scope, name);
  if (ownerId) {
    scope.store.writeLocal(ownerId, name, value);
    return;
  }
  if (scope.store.hasGlobal(name)) {
    scope.store.writeGlobal(name, value);
    return;
  }
  throw new Error(`Cannot assign to unknown XMLUI variable "${name}".`);
}

export function writeGlobal(scope: RuntimeScope, name: string, value: unknown): void {
  if (!scope.store.hasGlobal(name)) {
    throw new Error(`Cannot assign to unknown XMLUI global variable "${name}".`);
  }
  scope.store.writeGlobal(name, value);
}

export function createExpressionContext(scope: RuntimeScope | undefined): CompiledExpressionContext {
  return {
    props: scope?.props,
    readLocal: (name) => readLocal(scope, name),
    readGlobal: (name) => readGlobal(scope, name),
  };
}

export function createEventContext(scope: RuntimeScope): CompiledEventContext {
  return {
    ...createExpressionContext(scope),
    writeLocal: (name, value) => writeLocal(scope, name, value),
    writeGlobal: (name, value) => writeGlobal(scope, name, value),
  };
}

function findLocalOwner(scope: RuntimeScope | undefined, name: string): StateOwnerId | undefined {
  if (!scope) {
    return undefined;
  }
  if (scope.store.hasLocal(scope.localOwnerId, name)) {
    return scope.localOwnerId;
  }
  return findLocalOwner(scope.parent, name);
}

export function resolveLocalOwner(scope: RuntimeScope | undefined, name: string): StateOwnerId | undefined {
  return findLocalOwner(scope, name);
}
