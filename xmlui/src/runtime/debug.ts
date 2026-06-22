import type { XmluiDebugBridge, XmluiDebugEvent } from "../compiler/scriptSemantics";

declare global {
  var __xmluiDebug: XmluiDebugBridge | undefined;
}

export function ensureXmluiDebugBridge(): XmluiDebugBridge | undefined {
  const root = globalThis as typeof globalThis & { __xmluiDebug?: XmluiDebugBridge };
  if (root.__xmluiDebug) {
    return root.__xmluiDebug;
  }
  const listeners = new Set<(event: XmluiDebugEvent) => void>();
  root.__xmluiDebug = {
    version: 1,
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    emit(event) {
      for (const listener of [...listeners]) {
        listener(event);
      }
    },
  };
  return root.__xmluiDebug;
}

export function getXmluiDebugBridge(): XmluiDebugBridge | undefined {
  return (globalThis as typeof globalThis & { __xmluiDebug?: XmluiDebugBridge }).__xmluiDebug;
}
