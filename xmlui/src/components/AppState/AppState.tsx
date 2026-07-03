import { wrapComponent } from "../../components-core/wrapComponent";
import { createMetadata } from "../metadata-helpers";
import { defaultProps } from "./AppState.defaults";
import { AppState } from "./AppStateReact";
import { useEffect, useRef } from "react";
import { runEvent } from "../../runtime/rendering/bindings";
import { useEvaluatedProp, useStringProp } from "../../runtime/rendering/props";
import { useBindingRevision } from "../../runtime/rendering/reactive";
import type { XmluiBuiltInRenderer } from "../../runtime/rendering/types";

const COMP = "AppState";

export const AppStateMd = createMetadata({
  status: "stable",
  description:
    "`AppState` is an invisible component that provides global state management " +
    "across your entire application. Unlike component variables that are scoped " +
    "locally, AppState allows any component to access and update shared state " +
    "without prop drilling.",
  deprecationMessage:
    "The AppState component is deprecated. We will remove it in a future release. " +
    "Please use [global variables](/docs/guides/markup#global-variables) instead.",
  events: {
    didUpdate: {
      description:
        "This event is fired when the AppState value is updated. The event provides " +
        "the new state value as its parameter.",
      signature: "(updateInfo: { bucket: string; value: any; previousValue: any }) => void",
      parameters: {
        updateInfo:
          "An object containing the bucket name, the new state value, and the previous value.",
      },
    },
  },
  props: {
    bucket: {
      description:
        `This property is the identifier of the bucket to which the \`${COMP}\` instance is bound. ` +
        `Multiple \`${COMP}\` instances with the same bucket will share the same state object: any ` +
        `of them updating the state will cause the other instances to view the new, updated state.`,
      valueType: "string",
      defaultValue: defaultProps.bucket,
    },
    initialValue: {
      description:
        `This property contains the initial state value. Though you can use multiple \`${COMP}\`` +
        `component instances for the same bucket with their \`initialValue\` set, it may result ` +
        `in faulty app logic. When xmlui instantiates an \`${COMP}\` with an explicit initial ` +
        `value, that value is immediately merged with the existing state. ` +
        `The issue may come from the behavior that \`initialValue\` is set (merged) only when a component mounts. ` +
        `By default, the bucket's initial state is undefined.`,
    },
  },
  apis: {
    update: {
      signature: "update(newState: Record<string, any>)",
      description:
        "This method updates the application state object bound to the `AppState` instance.",
      parameters: {
        newState: "An object that specifies the new state value.",
      },
    },
    appendToList: {
      signature: "appendToList(key: string, id: any)",
      description:
        "This method appends an item to an array in the application state object bound to the" +
        " `AppState` instance.",
      parameters: {
        key: "The key of the array in the state object.",
        id: "The item to append to the array.",
      },
    },
    removeFromList: {
      signature: "removeFromList(key: string, id: any)",
      description:
        "This method removes an item from an array in the application state object bound to the" +
        " `AppState` instance.",
      parameters: {
        key: "The key of the array in the state object.",
        id: "The item to remove from the array.",
      },
    },
    listIncludes: {
      signature: "listIncludes(key: string, id: any)",
      description:
        "This method checks if an array in the application state object contains a specific item.",
      parameters: {
        key: "The key of the array in the state object.",
        id: "The item to check for in the array.",
      },
    },
  },
  nonVisual: true,
});

export const appStateComponentRenderer = wrapComponent(COMP, AppState, AppStateMd, {
  exposeRegisterApi: true,
  events: {
    didUpdate: "onDidUpdate",
  },
});

type BucketState = {
  values: Map<string, Record<string, unknown> | undefined>;
  references: Map<string, Set<string>>;
};

const appStateBuckets = new WeakMap<Parameters<XmluiBuiltInRenderer>[0]["scope"]["store"], BucketState>();

export const appStateRenderer: XmluiBuiltInRenderer = ({ node, scope }) => {
  const id = useStringProp(node, scope, "id", "") || useStringProp(node, scope, "ref", "");
  const bucket = useStringProp(node, scope, "bucket", defaultProps.bucket);
  const initialValue = useEvaluatedProp(node, scope, "initialValue", undefined);
  const apiRef = useRef<Record<string, unknown>>();
  const previousValueRef = useRef<unknown>(undefined);
  const initialValueAppliedRef = useRef(false);
  useBindingRevision(undefined, scope);

  if (!apiRef.current) {
    apiRef.current = createAppStateApi(bucket, scope);
  }

  useEffect(() => {
    if (!id) {
      return;
    }
    scope.references[id] = apiRef.current!;
    registerBucketReference(scope.store, bucket, id);
    scope.store.invalidateReference(id);
  }, [bucket, id, scope]);

  useEffect(() => {
    if (!initialValueAppliedRef.current && initialValue !== undefined) {
      initialValueAppliedRef.current = true;
      mergeBucket(scope.store, bucket, initialValue);
      invalidateBucket(scope, bucket);
    }
  }, [bucket, initialValue, scope, scope.store]);

  const value = bucketValue(scope.store, bucket);
  apiRef.current.value = value;
  apiRef.current.update = (patch: unknown) => {
    const previousValue = bucketValue(scope.store, bucket);
    mergeBucket(scope.store, bucket, patch);
    const nextValue = bucketValue(scope.store, bucket);
    apiRef.current!.value = nextValue;
    invalidateBucket(scope, bucket);
    void runEvent(node.parsed?.events?.didUpdate, scope, [
      { bucket, value: nextValue, previousValue },
    ]);
  };
  apiRef.current.appendToList = (key: string, item: unknown) => {
    const current = normalizeObject(bucketValue(scope.store, bucket));
    const list = Array.isArray(current[key]) ? current[key] as unknown[] : [];
    if (!list.includes(item)) {
      (apiRef.current!.update as (patch: unknown) => void)({ [key]: [...list, item] });
    }
  };
  apiRef.current.removeFromList = (key: string, item: unknown) => {
    const current = normalizeObject(bucketValue(scope.store, bucket));
    const list = Array.isArray(current[key]) ? current[key] as unknown[] : [];
    (apiRef.current!.update as (patch: unknown) => void)({
      [key]: list.filter((entry) => entry !== item),
    });
  };
  apiRef.current.listIncludes = (key: string, item: unknown) => {
    const current = normalizeObject(bucketValue(scope.store, bucket));
    const list = Array.isArray(current[key]) ? current[key] as unknown[] : [];
    return list.includes(item);
  };

  useEffect(() => {
    if (!Object.is(previousValueRef.current, value)) {
      const previousValue = previousValueRef.current;
      previousValueRef.current = value;
      void runEvent(node.parsed?.events?.didUpdate, scope, [
        { bucket, value, previousValue },
      ]);
    }
  }, [bucket, node.parsed?.events?.didUpdate, scope, value]);

  return null;
};

function createAppStateApi(
  bucket: string,
  scope: Parameters<XmluiBuiltInRenderer>[0]["scope"],
): Record<string, unknown> {
  return {
    value: bucketValue(scope.store, bucket),
    update: () => undefined,
    appendToList: () => undefined,
    removeFromList: () => undefined,
    listIncludes: () => false,
  };
}

function mergeBucket(
  store: Parameters<XmluiBuiltInRenderer>[0]["scope"]["store"],
  bucket: string,
  patch: unknown,
): void {
  if (patch === undefined) {
    return;
  }
  const bucketState = getBucketState(store);
  const current = normalizeObject(bucketState.values.get(bucket));
  const next = isPlainObject(patch) ? { ...current, ...patch } : patch;
  bucketState.values.set(bucket, next as Record<string, unknown> | undefined);
}

function bucketValue(
  store: Parameters<XmluiBuiltInRenderer>[0]["scope"]["store"],
  bucket: string,
): Record<string, unknown> | undefined {
  return getBucketState(store).values.get(bucket);
}

function getBucketState(
  store: Parameters<XmluiBuiltInRenderer>[0]["scope"]["store"],
): BucketState {
  const existing = appStateBuckets.get(store);
  if (existing) {
    return existing;
  }
  const state = {
    values: new Map<string, Record<string, unknown> | undefined>(),
    references: new Map<string, Set<string>>(),
  };
  appStateBuckets.set(store, state);
  return state;
}

function registerBucketReference(
  store: Parameters<XmluiBuiltInRenderer>[0]["scope"]["store"],
  bucket: string,
  id: string,
): void {
  if (!id) {
    return;
  }
  const state = getBucketState(store);
  const references = state.references.get(bucket) ?? new Set<string>();
  references.add(id);
  state.references.set(bucket, references);
}

function invalidateBucket(
  scope: Parameters<XmluiBuiltInRenderer>[0]["scope"],
  bucket: string,
): void {
  for (const referenceId of getBucketState(scope.store).references.get(bucket) ?? []) {
    scope.store.invalidateReference(referenceId);
  }
}

function normalizeObject(value: unknown): Record<string, unknown> {
  return isPlainObject(value) ? value : {};
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}
