import type { CompiledEventContext, CompiledExpressionContext } from "../../compiler/scriptSemantics";
import { managedFetchService } from "../data";
import { getXmluiDebugBridge } from "../debug";
import type { RuntimeI18n } from "../i18n";
import type { RuntimeRoutingStore } from "../routing";
import type { ToastService } from "../services/toast";
import type { RuntimeStateStore } from "./store";
import type { StateOwnerId } from "./types";

export type RuntimeScope = {
  store: RuntimeStateStore;
  localOwnerId?: StateOwnerId;
  parent?: RuntimeScope;
  props: Record<string, unknown>;
  contextValues: Record<string, unknown>;
  references: Record<string, unknown>;
  slots: Record<string, unknown>;
  routing?: RuntimeRoutingStore;
  toast?: ToastService;
  i18n?: RuntimeI18n;
  emitEvent?: (name: string, args: unknown[]) => unknown | Promise<unknown>;
  extensionFunctions: Record<string, (...args: unknown[]) => unknown>;
};

export function createRuntimeScope({
  store,
  localOwnerId,
  parent,
  props = {},
  contextValues = {},
  references = {},
  slots = {},
  routing,
  toast,
  i18n,
  emitEvent,
  extensionFunctions,
}: {
  store: RuntimeStateStore;
  localOwnerId?: StateOwnerId;
  parent?: RuntimeScope;
  props?: Record<string, unknown>;
  contextValues?: Record<string, unknown>;
  references?: Record<string, unknown>;
  slots?: Record<string, unknown>;
  routing?: RuntimeRoutingStore;
  toast?: ToastService;
  i18n?: RuntimeI18n;
  emitEvent?: (name: string, args: unknown[]) => unknown | Promise<unknown>;
  extensionFunctions?: Record<string, (...args: unknown[]) => unknown>;
}): RuntimeScope {
  return {
    store,
    localOwnerId,
    parent,
    props,
    contextValues,
    references,
    slots,
    routing: routing ?? parent?.routing,
    toast: toast ?? parent?.toast,
    i18n: i18n ?? parent?.i18n,
    emitEvent: emitEvent ?? parent?.emitEvent,
    extensionFunctions: extensionFunctions ?? parent?.extensionFunctions ?? {},
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
    readContext: (name) => readContext(scope, name),
    readReference: (name) => readBuiltInReference(scope, name) ?? readReference(scope, name),
    debug: getXmluiDebugBridge(),
  };
}

export function createEventContext(scope: RuntimeScope): CompiledEventContext {
  return {
    ...createExpressionContext(scope),
    writeLocal: (name, value) => writeLocal(scope, name, value),
    writeGlobal: (name, value) => writeGlobal(scope, name, value),
    delay: (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
    emitEvent: (name, args) => scope.emitEvent?.(name, args),
    call: (target, methodName, args) => {
      const method = (target as Record<string, unknown> | null | undefined)?.[methodName];
      if (typeof method !== "function") {
        return undefined;
      }
      return method.apply(target, args);
    },
    complete: completeValue,
    navigate: (target, queryParams) => scope.routing?.navigate(target, queryParams),
    callFunction: (name, args) => scope.extensionFunctions[name]?.(...args),
    yieldIfNeeded: (iteration) => {
      if (iteration % 100 !== 0) {
        return undefined;
      }
      return new Promise((resolve) => setTimeout(resolve, 0));
    },
  };
}

export function readContext(scope: RuntimeScope | undefined, name: string): unknown {
  if (!scope) {
    return undefined;
  }
  if (Object.prototype.hasOwnProperty.call(scope.contextValues, name)) {
    return scope.contextValues[name];
  }
  const routeValue = readRouteContext(scope, name);
  if (routeValue !== undefined) {
    return routeValue;
  }
  const builtInReference = readBuiltInReference(scope, name);
  if (builtInReference !== undefined) {
    return builtInReference;
  }
  return readContext(scope.parent, name);
}

export function readReference(scope: RuntimeScope | undefined, name: string): unknown {
  if (!scope) {
    return undefined;
  }
  if (Object.prototype.hasOwnProperty.call(scope.references, name)) {
    return scope.references[name];
  }
  return readReference(scope.parent, name);
}

async function completeValue(value: unknown): Promise<unknown> {
  const settled = await value;
  if (Array.isArray(settled)) {
    return Promise.all(settled.map(completeValue));
  }
  if (isPlainObject(settled)) {
    const entries = await Promise.all(
      Object.entries(settled).map(async ([key, entryValue]) => [
        key,
        await completeValue(entryValue),
      ] as const),
    );
    return Object.fromEntries(entries);
  }
  return settled;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== "object") {
    return false;
  }
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function createActionsReference(scope?: RuntimeScope) {
  return {
    navigate: (target: unknown, queryParams?: Record<string, unknown>) =>
      scope?.routing?.navigate(target, queryParams),
    callApi: async (input: Record<string, unknown>) => {
      if (requiresActionConfirmation(input) && !window.confirm(actionConfirmationMessage(input))) {
        return undefined;
      }
      showActionToast(scope, "loading", input.inProgressNotificationMessage, {});
      const request = managedFetchService.buildRequest(input);
      try {
        const response = await managedFetchService.execute(request);
        invalidateActionDataSources(scope, input.invalidates);
        showActionToast(scope, "success", input.completedNotificationMessage, { result: response.data });
        return response.data;
      } catch (error) {
        showActionToast(scope, "error", input.errorNotificationMessage, { error });
        throw error;
      }
    },
  };
}

function requiresActionConfirmation(input: Record<string, unknown>): boolean {
  return Boolean(
    input.confirmTitle ||
    input.confirmMessage ||
    input.confirmButtonLabel ||
    input.cancelButtonLabel,
  );
}

function actionConfirmationMessage(input: Record<string, unknown>): string {
  return [input.confirmTitle, input.confirmMessage].filter(Boolean).map(String).join("\n") || "Confirm";
}

function invalidateActionDataSources(scope: RuntimeScope | undefined, invalidates: unknown): void {
  const names = Array.isArray(invalidates)
    ? invalidates
    : typeof invalidates === "string"
      ? invalidates.split(",").map((name) => name.trim()).filter(Boolean)
      : [];
  for (const name of names) {
    const api = readReference(scope, String(name)) as { refetch?: () => unknown } | undefined;
    void api?.refetch?.();
  }
}

function showActionToast(
  scope: RuntimeScope | undefined,
  kind: "loading" | "success" | "error",
  message: unknown,
  context: Record<string, unknown>,
): void {
  if (!message) {
    return;
  }
  const reference = scope?.toast?.reference as Record<string, unknown> | undefined;
  const fn = reference?.[kind];
  if (typeof fn === "function") {
    fn.call(reference, interpolateActionTemplate(String(message), context));
  }
}

function interpolateActionTemplate(template: string, context: Record<string, unknown>): string {
  return template.replace(/\{\$([a-zA-Z0-9_]+)(?:\.([^}]+))?\}/g, (_match, name: string, path: string) => {
    const root = context[name];
    const value = path ? readActionPath(root, path) : root;
    return value == null ? "" : String(value);
  });
}

function readActionPath(value: unknown, path: string): unknown {
  return path.split(".").reduce((current, part) => {
    if (current == null) {
      return undefined;
    }
    return (current as Record<string, unknown>)[part];
  }, value);
}

function readBuiltInReference(scope: RuntimeScope | undefined, name: string): unknown {
  if (name === "window") {
    return typeof window === "undefined" ? undefined : window;
  }
  if (name === "Array") {
    return Array;
  }
  if (name === "JSON") {
    return JSON;
  }
  if (name === "Object") {
    return Object;
  }
  if (name === "Date") {
    return Date;
  }
  if (name === "Math") {
    return Math;
  }
  if (name === "getDate") {
    return getDate;
  }
  if (name === "Symbol") {
    return Symbol;
  }
  if (name === "BigInt") {
    return BigInt;
  }
  if (name === "Actions") {
    return createActionsReference(scope);
  }
  if (name === "App") {
    return scope?.i18n?.reference;
  }
  if (name === "toast") {
    return scope?.toast?.reference;
  }
  return undefined;
}

function getDate(date?: string | number | Date): Date {
  return date ? new Date(date) : new Date();
}

function readRouteContext(scope: RuntimeScope, name: string): unknown {
  const snapshot = scope.routing?.getSnapshot();
  if (!snapshot) {
    return undefined;
  }
  switch (name) {
    case "$pathname":
      return snapshot.pathname;
    case "$queryParams":
      return snapshot.queryParams;
    case "$queryString":
      return snapshot.search;
    case "$routeParams":
      return {};
    default:
      return undefined;
  }
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
