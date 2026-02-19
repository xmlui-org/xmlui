// The type of action we can use with a proxy
import { isArrowExpressionObject } from "../../abstractions/InternalMarkers";

export type ProxyAction = "set" | "unset";

// Proxy operation callback parameters
export type ProxyCallbackArgs = {
  action: ProxyAction;
  path: string;
  pathArray: (string | symbol)[];
  target: string;
  newValue?: any;
  previousValue?: any;
};

/**
 * Use this function to build a JavaScript proxy for localContext objects. The 
 * responsibility of the proxy is to collect the changes within the localContext 
 * so that we can refresh the UI according to them.
 */
export function buildProxy(
  proxyTarget: any,
  callback: (changeInfo: ProxyCallbackArgs) => void,
  tree: Array<string | symbol> = [],
): any {
  // --- We identify a particular (deep) localContext property by its full path; 
  // --- this function creates the path
  const getPath = (prop: string | symbol) => tree.concat(prop).join(".");

  const proxiedValues = new WeakMap();
  // --- Create the proxy object for `proxyTarget`
  return new Proxy(proxyTarget, {
    get: function (target, prop, receiver) {
      const value = Reflect.get(target, prop, receiver);

      // --- Create proxies only for writable objects and arrays, except arrow 
      // --- function expressions.
      if (
        value &&
        typeof value === "object" &&
        !Object.isFrozen(value)
      ) {
        // Skip arrow expression objects
        if (isArrowExpressionObject(value)) {
          return value;
        }
        
        // Check if it's a plain object or array
        const obj = value as any;
        if (
          obj.constructor &&
          ["Array", "Object"].includes(obj.constructor.name)
        ) {
          // --- Just to make sure that accessing the proxied objects' field gets 
          // --- the same reference every time. e.g. this wouldn't be true otherwise: 
          // --- proxiedObject['field'] === proxiedObject['field']
          if (!proxiedValues.has(value)) {
            proxiedValues.set(value, buildProxy(value, callback, tree.concat(prop)));
          }
          return proxiedValues.get(value);
        }
      }

      // --- Do not create a proxy for other objects
      return value;
    },

    set: function (target, prop, value, receiver) {
      const previousValue = Reflect.get(target, prop, receiver);
      
      // --- Skip no-op changes to prevent unnecessary re-renders and inspector noise
      if (previousValue === value) {
        return true; // No change needed
      }
      
      // --- For objects and arrays, perform deep comparison using JSON.stringify
      // --- (consistent with variable-logging.ts)
      if (
        previousValue !== null &&
        previousValue !== undefined &&
        value !== null &&
        value !== undefined &&
        typeof previousValue === "object" &&
        typeof value === "object"
      ) {
        try {
          if (JSON.stringify(previousValue) === JSON.stringify(value)) {
            return true; // No actual change in content
          }
        } catch (e) {
          // --- JSON.stringify can fail for circular references or other issues
          // --- In such cases, proceed with the update
        }
      }
      
      // --- Invoke the callback function to sign any change in the proxied object
      callback({
        action: "set",
        path: getPath(prop),
        pathArray: tree.concat(prop),
        target,
        newValue: value,
        previousValue,
      });

      // --- Execute the change.
      // --- Note, any error raised in the callback will prevent from changing the property value
      return Reflect.set(target, prop, value, receiver);
    },

    deleteProperty: function (target, prop) {
      // --- Invoke the callback function to delete a property
      callback({ action: "unset", path: getPath(prop), pathArray: tree.concat(prop), target });

      // --- Execute the change
      // --- Note, any error raised in the callback will prevent from deleting the property value
      return Reflect.deleteProperty(target, prop);
    },
  });
}
