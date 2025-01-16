/**
 * Gets a proxy function for one that does not support async operations
 * @param fn Function to replace with a proxy
 * @param origArgs Original function arguments
 * @param context Function context ("this" of the function invocation)
 * @return The proxy, if found; otherwise the original function
 */
export function getAsyncProxy(fn: Function, origArgs: any[], context: any): Function {
  const proxyFn = asyncProxies.get(fn);
  if (!proxyFn) return fn;

  origArgs.unshift(context);
  return proxyFn;
}

// Async implementations for JavaScript functions that do not support async arguments
const asyncProxies = new Map<Function, Function>();
asyncProxies.set(Array.prototype.filter, asyncFilter);
asyncProxies.set(Array.prototype.forEach, asyncForEach);
asyncProxies.set(Array.prototype.map, asyncMap);
asyncProxies.set(Array.prototype.every, asyncEvery);
asyncProxies.set(Array.prototype.findIndex, asyncFindIndex);
asyncProxies.set(Array.prototype.find, asyncFind);
asyncProxies.set(Array.prototype.flatMap, asyncFlatMap);
asyncProxies.set(Array.prototype.some, asyncSome);
asyncProxies.set(Array.prototype.sort, asyncSort);

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

// Recursively sorts an array using an async comparison function (merge sort).
async function asyncSort(array: any[], compareFn: AsyncCompareFn): Promise<any[]> {
  console.log('asyncSort');
  if (array.length <= 1) {
    return array;
  }

  const mid = Math.floor(array.length / 2);
  const left = array.slice(0, mid);
  const right = array.slice(mid);

  // Sort the left and right halves
  const [sortedLeft, sortedRight] = await Promise.all([
    asyncSort(left, compareFn),
    asyncSort(right, compareFn),
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
