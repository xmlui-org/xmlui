import { useSyncExternalStore } from "react";

const listeners = new Set<() => void>();
let inspectMode = false;

export function getInspectMode(): boolean {
  return inspectMode;
}

export function setInspectMode(value: boolean | ((previous: boolean) => boolean)): void {
  inspectMode = typeof value === "function" ? value(inspectMode) : value;
  for (const listener of [...listeners]) {
    listener();
  }
}

export function useInspectMode(): [boolean, typeof setInspectMode] {
  const value = useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    getInspectMode,
    getInspectMode,
  );
  return [value, setInspectMode];
}
