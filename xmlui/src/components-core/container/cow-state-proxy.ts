import { isArrowExpressionObject } from "../../abstractions/InternalMarkers";
import type { ProxyCallbackArgs } from "../rendering/buildProxy";

// Private symbol used to identify and unwrap CoW sub-proxies.
// The `get` trap returns the `liveNode` getter when this symbol is accessed,
// allowing the `set` trap to extract the real (unwrapped) value before
// dispatching to Immer — preventing a Proxy from leaking into immutable state.
const COW_LIVE_NODE = Symbol("cowLiveNode");

/**
 * Wraps `workingState` (a shallow copy of the original container state) in a
 * Copy-on-Write Proxy.
 *
 * - Reads pass through to the original node at virtually zero cost.
 * - On the first write to a node, that node is lazily shallow-cloned (arrays via
 *   `[...]`, objects via `{...}`); subsequent reads/writes target the clone, so
 *   the original is never mutated. Unaffected subtrees keep pointing to originals.
 * - Each node's Proxy wraps the ORIGINAL node as its target. This is essential:
 *   `Array.isArray`, array `length` semantics, prototype methods, and Symbol-keyed
 *   properties all rely on the target being the real value, not a stand-in object.
 * - Emits `ProxyCallbackArgs` identical to `buildProxy`, so the downstream
 *   `changes`-array / dispatch pipeline requires no changes.
 *
 * Replaces both `cloneDeep` (upfront isolation) and `buildProxy` (change tracking)
 * in `getComponentStateClone`.
 */
export function createCoWStateProxy(
  workingState: Record<string, any>,
  onWrite: (changeInfo: ProxyCallbackArgs) => void,
): any {
  function wrap(original: any, pathArr: (string | symbol)[]): any {
    // Lazily-created shallow clone; null until the first write to this node.
    // Writes mutate the clone, never `original`, giving copy-on-write isolation.
    let writable: any = null;
    // Stable sub-proxy identity per property key (Symbols allowed — no stringify).
    const subProxies = new Map<string | symbol, any>();

    const liveNode = () => writable ?? original;
    const ensureWritable = () => {
      if (!writable) {
        writable = Array.isArray(original) ? [...original] : { ...original };
      }
      return writable;
    };

    // Proxy target must be extensible/mutable to satisfy JS Proxy invariants when
    // new properties are added (e.g. Array.prototype.push on a non-extensible frozen
    // array would violate the [[Set]] invariant if we used `original` as the target).
    // We use a shallow clone as the target solely for invariant compliance; all reads
    // go through `liveNode()` (= original until the first write) and all writes go
    // through `ensureWritable()` (a separate clone), so the target stays in sync
    // lazily via `syncTarget()` only when proxy invariants require it.
    //
    // Array.isArray(proxy) and array prototype semantics work because the target is
    // itself an Array when `original` is an Array.
    const proxyTarget: any = Array.isArray(original) ? [...original] : { ...original };

    // Keep proxyTarget in sync after writes so invariant checks always pass.
    const syncTarget = (prop: string | symbol, value: any) => {
      proxyTarget[prop as any] = value;
    };
    const syncTargetDelete = (prop: string | symbol) => {
      delete proxyTarget[prop as any];
    };

    return new Proxy(proxyTarget, {
      get(_t, prop, receiver) {
        if (prop === COW_LIVE_NODE) return liveNode;
        const value = Reflect.get(liveNode(), prop, receiver);
        if (
          value &&
          typeof value === "object" &&
          !isArrowExpressionObject(value)
        ) {
          const ctor = (value as any).constructor;
          if (ctor && (ctor.name === "Array" || ctor.name === "Object")) {
            let sub = subProxies.get(prop);
            if (!sub) {
              sub = wrap(value, [...pathArr, prop]);
              subProxies.set(prop, sub);
            }
            return sub;
          }
        }
        return value;
      },

      set(_t, prop, value) {
        // Unwrap any CoW sub-proxy so that Immer never receives a Proxy as a
        // state value (proxy-in-Immer causes invariant violations after freeze).
        const rawValue = extractRawValue(value);
        const previousValue = Reflect.get(liveNode(), prop);
        // No-op skip — match buildProxy behaviour.
        if (previousValue === rawValue) return true;
        if (
          previousValue != null &&
          rawValue != null &&
          typeof previousValue === "object" &&
          typeof rawValue === "object"
        ) {
          try {
            if (JSON.stringify(previousValue) === JSON.stringify(rawValue)) return true;
          } catch {
            // JSON.stringify can throw on circular refs; proceed with the update.
          }
        }
        const target = ensureWritable();
        subProxies.delete(prop);
        Reflect.set(target, prop, rawValue);
        syncTarget(prop, rawValue);
        const fullPath = [...pathArr, prop];
        onWrite({
          action: "set",
          path: pathToString(fullPath),
          pathArray: fullPath,
          target,
          newValue: rawValue,
          previousValue,
        });
        return true;
      },

      deleteProperty(_t, prop) {
        const existed = Reflect.has(liveNode(), prop);
        const target = ensureWritable();
        subProxies.delete(prop);
        Reflect.deleteProperty(target, prop);
        syncTargetDelete(prop);
        if (existed) {
          const fullPath = [...pathArr, prop];
          onWrite({
            action: "unset",
            path: pathToString(fullPath),
            pathArray: fullPath,
            target,
          });
        }
        return true;
      },

      has(_t, prop) {
        return Reflect.has(liveNode(), prop);
      },

      ownKeys(_t) {
        return Reflect.ownKeys(liveNode());
      },

      getOwnPropertyDescriptor(_t, prop) {
        const desc = Reflect.getOwnPropertyDescriptor(liveNode(), prop);
        if (desc === undefined) return undefined;
        // Proxy invariant: a property cannot be reported as non-configurable unless
        // the proxy target also has it as non-configurable. Our proxyTarget is an
        // extensible shallow copy, so we must reflect its configurable/writable flags.
        const targetDesc = Reflect.getOwnPropertyDescriptor(proxyTarget, prop);
        if (targetDesc) {
          return { ...desc, configurable: targetDesc.configurable, writable: targetDesc.writable };
        }
        // Property exists in liveNode but not in proxyTarget — return configurable.
        return { ...desc, configurable: true };
      },
    });
  }

  return wrap(workingState, []);
}

// Human-readable dotted path for `ProxyCallbackArgs.path`. Symbol segments are
// rendered via `toString()` so a Symbol key never throws during stringification.
function pathToString(pathArr: (string | symbol)[]): string {
  return pathArr.map((k) => (typeof k === "symbol" ? k.toString() : k)).join(".");
}

// Unwraps a CoW sub-proxy to its current live value so that Immer never stores
// a Proxy in the frozen state tree. Non-proxy values are returned as-is.
function extractRawValue(value: any): any {
  if (value !== null && typeof value === "object") {
    const getLiveNode = value[COW_LIVE_NODE];
    if (typeof getLiveNode === "function") {
      return getLiveNode();
    }
  }
  return value;
}
