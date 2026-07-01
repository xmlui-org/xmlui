import { useEffect, useRef } from "react";

import { runEvent } from "../../runtime/rendering/bindings";
import { useEvaluatedProp, useStringProp } from "../../runtime/rendering/props";
import type { XmluiBuiltInRenderer } from "../../runtime/rendering/types";
import { useBindingRevision } from "../../runtime/rendering/reactive";

type BucketState = {
  values: Map<string, Record<string, unknown> | undefined>;
  references: Map<string, Set<string>>;
};

const appStateBuckets = new WeakMap<Parameters<XmluiBuiltInRenderer>[0]["scope"]["store"], BucketState>();

export const appStateRenderer: XmluiBuiltInRenderer = ({ node, scope }) => {
  const id = useStringProp(node, scope, "id", "");
  const uid = useStringProp(node, scope, "uid", "");
  const ref = useStringProp(node, scope, "ref", "");
  const referenceId = id || uid || ref;
  const bucket = useStringProp(node, scope, "bucket", "default");
  const initialValue = useEvaluatedProp(node, scope, "initialValue", undefined);
  const apiRef = useRef<Record<string, unknown>>();
  const previousValueRef = useRef<unknown>(undefined);
  const initialValueAppliedRef = useRef(false);
  useBindingRevision(undefined, scope);

  if (!apiRef.current) {
    apiRef.current = createAppStateApi(bucket, scope);
  }

  useEffect(() => {
    if (!referenceId) {
      return;
    }
    scope.references[referenceId] = apiRef.current!;
    registerBucketReference(scope.store, bucket, referenceId);
    scope.store.invalidateReference(referenceId);
  }, [bucket, referenceId, scope]);

  useEffect(() => {
    if (!initialValueAppliedRef.current && initialValue !== undefined) {
      initialValueAppliedRef.current = true;
      mergeBucket(scope.store, bucket, initialValue);
      invalidateBucket(scope, bucket);
    }
  }, [bucket, initialValue, scope.store]);

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
