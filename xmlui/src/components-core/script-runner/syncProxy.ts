import { StatementExecutionError } from "@components-core/EngineError";

type ProxyInfo = {
  // --- The replacement for the original function
  proxyFn: Function;

  // --- Validate if the proxy function can be used; return the error message
  validator?: (context: any) => string | null;
};

/**
 * Gets a proxy function for one that does not support async operations
 * @param fn Function to replace with a proxy
 * @param origArgs Original function arguments
 * @param context Function context ("this" of the function invocation)
 * @return The proxy, if found; otherwise the original function
 */
export function getSyncProxy(fn: Function, origArgs: any[], context: any): Function {
  const proxyInfo = syncProxies.get(fn);
  if (!proxyInfo) return fn;

  if (proxyInfo.validator) {
    const message = proxyInfo.validator(origArgs);
    if (message) {
      throw new StatementExecutionError(message);
    }
  }
  origArgs.unshift(context);
  return proxyInfo.proxyFn;
}

// Async implementations for JavaScript functions that do not support async arguments
const syncProxies = new Map<Function, ProxyInfo>();
syncProxies.set(Array.prototype.sort, { proxyFn: sortAborter });

function sortAborter(): any[] {
  throw new Error(
    "The script engine does not support the sort() method as it " +
      "sorts an array in-place. Use the toSorted() function instead.",
  );
}
