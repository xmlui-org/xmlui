/**
 * Gets a proxy function for one that does not support async operations
 * @param fn Function to replace with a proxy
 * @param origArgs Original function arguments
 * @param context Function context ("this" of the function invocation)
 * @return The proxy, if found; otherwise the original function
 */
export function getSyncProxy(fn: Function, origArgs: any[], context: any): Function {
  const proxyFn = syncProxies.get(fn);
  if (!proxyFn) return fn;

  origArgs.unshift(context);
  return proxyFn;
}

// Async implementations for JavaScript functions that do not support async arguments
const syncProxies = new Map<Function, Function>();
syncProxies.set(Array.prototype.sort, slicedSort);

type CompareFn = (a: any, b: any) => number;

function slicedSort(array: any[], compareFn: CompareFn): any[] {
  return array.slice().sort(compareFn);
}
