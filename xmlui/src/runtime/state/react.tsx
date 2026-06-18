import { useMemo, useSyncExternalStore } from "react";

import { createRuntimeStateStore, type RuntimeStateStore } from "./store";

export function useRuntimeStateStore(): RuntimeStateStore {
  return useMemo(() => createRuntimeStateStore(), []);
}

export function useRuntimeStoreRevision(store: RuntimeStateStore): number {
  return useSyncExternalStore(
    (listener) => store.subscribe(listener),
    () => store.getSnapshot(),
    () => store.getSnapshot(),
  );
}

export function createRuntimeOwnerId(prefix: string, id: string): string {
  return `${prefix}:${id.replace(/[^A-Za-z0-9_-]/g, "_")}`;
}
