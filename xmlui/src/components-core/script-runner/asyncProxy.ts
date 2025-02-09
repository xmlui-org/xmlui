import { StatementExecutionError } from "../EngineError";

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
export function getAsyncProxy(fn: Function, origArgs: any[], context: any): Function {
  const proxyInfo = asyncProxies.get(fn);
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
const asyncProxies = new Map<Function, ProxyInfo>();
asyncProxies.set(Array.prototype.filter, { proxyFn: asyncFilter });
asyncProxies.set(Array.prototype.forEach, { proxyFn: asyncForEach });
asyncProxies.set(Array.prototype.map, { proxyFn: asyncMap });
asyncProxies.set(Array.prototype.every, { proxyFn: asyncEvery });
asyncProxies.set(Array.prototype.findIndex, { proxyFn: asyncFindIndex });
asyncProxies.set(Array.prototype.find, { proxyFn: asyncFind });
asyncProxies.set(Array.prototype.flatMap, { proxyFn: asyncFlatMap });
asyncProxies.set(Array.prototype.some, { proxyFn: asyncSome });
asyncProxies.set(Array.prototype.sort, { proxyFn: asyncSort });
asyncProxies.set(Array.prototype.toSorted, { proxyFn: asyncToSorted });

// The async implementation of Array.prototype.some
async function asyncSome(arr: any[], predicate: (...args: any[]) => boolean) {
  const results = await Promise.all(arr.map(predicate));
  return arr.some((_v, index) => results[index]);
}

// The async implementation of Array.prototype.filter
async function asyncFilter(arr: any[], predicate: (...args: any[]) => boolean) {
  const results = await Promise.all(arr.map(predicate));
  return arr.filter((_v, index) => results[index]);
}

// The async implementation of Array.prototype.forEach
async function asyncForEach(arr: any[], predicate: (...args: any[]) => void) {
  for (let i = 0; i < arr.length; i++) {
    await predicate(arr[i], i, arr);
  }
}

// The async implementation of Array.prototype.map
async function asyncMap(arr: any[], predicate: (...args: any[]) => Promise<any[]>) {
  const result = [];
  for (let i = 0; i < arr.length; i++) {
    result.push(await predicate(arr[i], i, arr));
  }
  return result;
}

// The async implementation of Array.prototype.asyncEvery
async function asyncEvery(arr: any[], callback: (...args: any[]) => any) {
  const results = await Promise.all(arr.map(callback));
  return results.every((_v, index) => results[index]);
}

// The async implementation of Array.prototype.asyncFind
async function asyncFind(arr: any[], predicate: (...args: any[]) => boolean) {
  const results = await Promise.all(arr.map(predicate));
  return arr.find((_v, index) => results[index]);
}

// The async implementation of Array.prototype.asyncFindIndex
async function asyncFindIndex(arr: any[], predicate: (...args: any[]) => boolean) {
  const results = await Promise.all(arr.map(predicate));
  return arr.findIndex((_v, index) => results[index]);
}

// The async implementation of Array.prototype.asyncFlatMap
async function asyncFlatMap(arr: any[], predicate: (...args: any[]) => boolean) {
  const results = await Promise.all(arr.map(predicate));
  return arr.flatMap((_v, index) => results[index]);
}

type AsyncCompareFn = (a: any, b: any) => Promise<number>;

function asyncSort() {
  throw new Error(
    "The script engine does not support the sort() method as it " +
    "sorts an array in-place. Use the toSorted() function instead."
  );
}

// Recursively sorts an array using an async comparison function (merge sort).
async function asyncToSorted(array: any[], compareFn: AsyncCompareFn): Promise<any[]> {
  if (array.length <= 1) {
    return array;
  }

  const mid = Math.floor(array.length / 2);
  const left = array.slice(0, mid);
  const right = array.slice(mid);

  // Sort the left and right halves
  const [sortedLeft, sortedRight] = await Promise.all([
    asyncToSorted(left, compareFn),
    asyncToSorted(right, compareFn),
  ]);

  // Merge the results
  return asyncMerge(sortedLeft, sortedRight, compareFn);

  // Merges two sorted arrays into one sorted array using an async compare function.
  async function asyncMerge(left: any[], right: any[], compareFn: AsyncCompareFn): Promise<any[]> {
    const result: any[] = [];
    let i = 0;
    let j = 0;

    while (i < left.length && j < right.length) {
      // Compare the two elements
      const comparison = await compareFn(left[i], right[j]);
      if (comparison <= 0) {
        result.push(left[i]);
        i++;
      } else {
        result.push(right[j]);
        j++;
      }
    }

    // Add any remaining elements
    return [...result, ...left.slice(i), ...right.slice(j)];
  }
}
