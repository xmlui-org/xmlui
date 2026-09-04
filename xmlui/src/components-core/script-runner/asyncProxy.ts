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
asyncProxies.set(Array.prototype.reduce, asyncReduce);
asyncProxies.set(Array.prototype.reduceRight, asyncReduceRight);
asyncProxies.set(Array.prototype.sort, asyncSort);
if ((Array.prototype as any).toSorted) {
  asyncProxies.set((Array.prototype as any).toSorted, asyncToSorted);
}
if (Array.prototype.findLast) {
  asyncProxies.set(Array.prototype.findLast, asyncFindLast);
}
if (Array.prototype.findLastIndex) {
  asyncProxies.set(Array.prototype.findLastIndex, asyncFindLastIndex);
}

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

// The async implementation of Array.prototype.asyncFindLast
async function asyncFindLast(arr: any[], predicate: (...args: any[]) => boolean) {
  const results = await Promise.all(arr.map(predicate));
  return arr.findLast((_v, index) => results[index]);
}

// The async implementation of Array.prototype.asyncFindLastIndex
async function asyncFindLastIndex(arr: any[], predicate: (...args: any[]) => boolean) {
  const results = await Promise.all(arr.map(predicate));
  return arr.findLastIndex((_v, index) => results[index]);
}

/**
 * The async implementation of `Array.prototype.sort`.
 *
 * XMLScript callbacks are asynchronous, and the native `sort` coerces the promise a
 * comparator returns to `NaN` — so every comparison compared equal and `sort(cmp)`
 * silently left the array untouched, while the argument-less `sort()` worked. This
 * awaits each comparison instead, sorts stably (as the native one does), and writes
 * the result back in place before returning the same array.
 */
async function asyncSort(arr: any[], comparator?: (...args: any[]) => any) {
  if (typeof comparator !== "function") {
    return arr.sort(comparator as undefined);
  }
  const sorted = await asyncSortedCopy(arr, comparator);
  for (let i = 0; i < sorted.length; i++) {
    arr[i] = sorted[i];
  }
  return arr;
}

// The async implementation of Array.prototype.toSorted (leaves the receiver alone)
async function asyncToSorted(arr: any[], comparator?: (...args: any[]) => any) {
  if (typeof comparator !== "function") {
    return (arr as any).toSorted(comparator);
  }
  return await asyncSortedCopy(arr, comparator);
}

/**
 * Stable merge sort with awaited comparisons. `undefined` entries take no part in the
 * comparisons and land at the end, as the specified `sort` behaviour requires.
 */
async function asyncSortedCopy(arr: any[], comparator: (...args: any[]) => any): Promise<any[]> {
  const values: any[] = [];
  let undefinedCount = 0;
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === undefined) {
      undefinedCount++;
    } else {
      values.push(arr[i]);
    }
  }
  const sorted = await asyncMergeSort(values, comparator);
  for (let i = 0; i < undefinedCount; i++) {
    sorted.push(undefined);
  }
  return sorted;
}

async function asyncMergeSort(values: any[], comparator: (...args: any[]) => any): Promise<any[]> {
  if (values.length <= 1) {
    return values;
  }
  const middle = values.length >> 1;
  const left = await asyncMergeSort(values.slice(0, middle), comparator);
  const right = await asyncMergeSort(values.slice(middle), comparator);
  const merged: any[] = [];
  let leftIndex = 0;
  let rightIndex = 0;
  while (leftIndex < left.length && rightIndex < right.length) {
    const order = Number(await comparator(left[leftIndex], right[rightIndex]));
    // --- `<= 0` (and `NaN`, which compares false) keeps the left element first —
    // --- that is what makes the merge stable.
    if (order > 0) {
      merged.push(right[rightIndex++]);
    } else {
      merged.push(left[leftIndex++]);
    }
  }
  while (leftIndex < left.length) merged.push(left[leftIndex++]);
  while (rightIndex < right.length) merged.push(right[rightIndex++]);
  return merged;
}

// The async implementation of Array.prototype.asyncReduce
async function asyncReduce(
  arr: any[],
  callback: (...args: any[]) => any,
  initialValue?: any,
) {
  const hasInitialValue = arguments.length >= 3;
  let accumulator = initialValue;
  let startIndex = 0;

  if (!hasInitialValue) {
    const firstIndex = findFirstPresentIndex(arr);
    if (firstIndex < 0) {
      throw new TypeError("Reduce of empty array with no initial value");
    }
    accumulator = arr[firstIndex];
    startIndex = firstIndex + 1;
  }

  for (let i = startIndex; i < arr.length; i++) {
    if (i in arr) {
      accumulator = await callback(accumulator, arr[i], i, arr);
    }
  }
  return accumulator;
}

// The async implementation of Array.prototype.asyncReduceRight
async function asyncReduceRight(
  arr: any[],
  callback: (...args: any[]) => any,
  initialValue?: any,
) {
  const hasInitialValue = arguments.length >= 3;
  let accumulator = initialValue;
  let startIndex = arr.length - 1;

  if (!hasInitialValue) {
    const lastIndex = findLastPresentIndex(arr);
    if (lastIndex < 0) {
      throw new TypeError("Reduce of empty array with no initial value");
    }
    accumulator = arr[lastIndex];
    startIndex = lastIndex - 1;
  }

  for (let i = startIndex; i >= 0; i--) {
    if (i in arr) {
      accumulator = await callback(accumulator, arr[i], i, arr);
    }
  }
  return accumulator;
}

function findFirstPresentIndex(arr: any[]): number {
  for (let i = 0; i < arr.length; i++) {
    if (i in arr) return i;
  }
  return -1;
}

function findLastPresentIndex(arr: any[]): number {
  for (let i = arr.length - 1; i >= 0; i--) {
    if (i in arr) return i;
  }
  return -1;
}
