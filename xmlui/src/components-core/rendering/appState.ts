import { cloneDeep, get as lodashGet, set as lodashSet, isEqual } from "lodash-es";
import type { IAppStateContext } from "../../components/App/AppStateContext";

/**
 * AppState type definition for global state management
 */
export type AppState = {
  define(bucket: string, initialState: any): any;
  get(bucket: string, path?: string): any;
  set(bucket: string, pathOrValue: string | any, value?: any): any;
  update(bucket: string, pathOrUpdater: string | Function, updater?: Function): any;
  updateWith(bucket: string, updater: (prev: any) => any | Promise<any>): Promise<any>;
  remove(bucket: string, path?: string): void;
  removeAt(bucket: string, index: number): any;
  append(bucket: string, value: any): any;
  push(bucket: string, value: any): any;
  pop(bucket: string): any;
  shift(bucket: string): any;
  unshift(bucket: string, value: any): any;
  insertAt(bucket: string, index: number, value: any): any;
};

/**
 * Recursively freezes an object and all its nested properties
 */
function deepFreeze<T>(obj: T): T {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }

  Object.freeze(obj);

  Object.getOwnPropertyNames(obj).forEach((prop) => {
    const value = (obj as any)[prop];
    if (value !== null && typeof value === "object" && !Object.isFrozen(value)) {
      deepFreeze(value);
    }
  });

  return obj;
}

/**
 * Creates an AppState object that provides global state management methods
 */
export function createAppState(appStateContext: IAppStateContext): AppState {
  // Don't destructure - always access the latest state from context
  /**
   * Helper to get current value from a bucket path
   */
  function getBucketValue(bucket: string): any {
    try {
      const value = lodashGet(appStateContext.appState, bucket);
      // Unwrap values that were wrapped for primitives/arrays
      if (value !== null && typeof value === 'object' && !Array.isArray(value) && '__value__' in value) {
        return value.__value__;
      }
      return value;
    } catch (error) {
      console.warn(`[AppState] Error getting bucket '${bucket}':`, error);
      return undefined;
    }
  }

  /**
   * Helper to set value at bucket path
   */
  function setBucketValue(bucket: string, value: any): void {
    try {
      // Split bucket path to get the top-level key for update
      const parts = bucket.split(".");
      const topLevelKey = parts[0];
      
      if (parts.length === 1) {
        // Simple case: top-level bucket
        // The context's update function expects an object to merge
        // For primitives and arrays, we wrap them in a special structure
        
        // Always wrap the value in an object so the merge works correctly
        // We use a special key '__value__' to store the actual value
        const isObject = value !== null && typeof value === 'object' && !Array.isArray(value);
        if (isObject) {
          // For plain objects, pass them directly for merging
          appStateContext.update(topLevelKey, value);
        } else {
          // For primitives and arrays, wrap in a container object
          appStateContext.update(topLevelKey, { __value__: value });
        }
      } else {
        // Nested case: use lodash set on cloned object
        const currentTopLevel = appStateContext.appState[topLevelKey] || {};
        const clonedTopLevel = cloneDeep(currentTopLevel);
        lodashSet(clonedTopLevel, parts.slice(1).join("."), value);
        appStateContext.update(topLevelKey, clonedTopLevel);
      }
    } catch (error) {
      console.warn(`[AppState] Error setting bucket '${bucket}':`, error);
    }
  }

  /**
   * Helper to validate and get array from bucket
   */
  function getArrayFromBucket(bucket: string): any[] | undefined {
    const value = getBucketValue(bucket);
    if (!Array.isArray(value)) {
      if (value !== undefined) {
        console.warn(`[AppState] Bucket '${bucket}' does not contain an array`);
      }
      return undefined;
    }
    return value;
  }

  return {
    /**
     * Define a bucket with the specified initial state
     */
    define(bucket: string, initialState: any): any {
      try {
        setBucketValue(bucket, initialState);
        const result = deepFreeze(cloneDeep(initialState));
        return result;
      } catch (error) {
        console.warn(`[AppState] Error in define('${bucket}'):`, error);
        return undefined;
      }
    },

    /**
     * Get the current state of the bucket or a nested property (deep-cloned and frozen)
     * @param bucket - The bucket name
     * @param path - Optional nested property path (e.g., 'user.name')
     */
    get(bucket: string, path?: string): any {
      try {
        const bucketValue = getBucketValue(bucket);
        if (bucketValue === undefined) return undefined;
        
        // If no path specified, return entire bucket
        if (!path) {
          // Only clone/freeze objects and arrays, return primitives as-is
          if (bucketValue !== null && typeof bucketValue === 'object') {
            return deepFreeze(cloneDeep(bucketValue));
          }
          return bucketValue;
        }
        
        // Get nested property value
        const value = lodashGet(bucketValue, path);
        if (value === undefined) return undefined;
        
        // Only clone/freeze objects and arrays, return primitives as-is
        if (value !== null && typeof value === 'object') {
          return deepFreeze(cloneDeep(value));
        }
        return value;
      } catch (error) {
        console.warn(`[AppState] Error in get('${bucket}', '${path}'):`, error);
        return undefined;
      }
    },

    /**
     * Set the bucket's value or a nested property
     * @param bucket - The bucket name
     * @param pathOrValue - If value is provided, this is the path; otherwise the new value
     * @param value - Optional value when path is specified
     */
    set(bucket: string, pathOrValue: string | any, value?: any): any {
      try {
        // Two-argument form: set(bucket, value) - replace entire bucket
        if (value === undefined) {
          setBucketValue(bucket, pathOrValue);
          return deepFreeze(cloneDeep(pathOrValue));
        }
        
        // Three-argument form: set(bucket, path, value) - set nested property
        const bucketValue = getBucketValue(bucket) || {};
        const clonedValue = cloneDeep(bucketValue);
        lodashSet(clonedValue, pathOrValue as string, value);
        setBucketValue(bucket, clonedValue);
        return deepFreeze(cloneDeep(value));
      } catch (error) {
        console.warn(`[AppState] Error in set('${bucket}'):`, error);
        return undefined;
      }
    },

    /**
     * Update the bucket or a nested property using a merge or updater function
     * @param bucket - The bucket name
     * @param pathOrUpdater - If updater is provided, this is the path; otherwise the update value or function
     * @param updater - Optional updater function when path is specified
     */
    update(bucket: string, pathOrUpdater: string | Function | any, updater?: Function): any {
      try {
        const bucketValue = getBucketValue(bucket);
        
        // Three-argument form: update(bucket, path, updater) - update nested property
        if (updater !== undefined) {
          const path = pathOrUpdater as string;
          const currentValue = lodashGet(bucketValue, path);
          const newValue = typeof updater === 'function' ? updater(currentValue) : updater;
          const clonedValue = cloneDeep(bucketValue || {});
          lodashSet(clonedValue, path, newValue);
          setBucketValue(bucket, clonedValue);
          return deepFreeze(cloneDeep(newValue));
        }
        
        // Two-argument form: update(bucket, updaterOrValue)
        if (typeof pathOrUpdater === 'function') {
          // Updater function: update(bucket, (current) => newValue)
          const newValue = pathOrUpdater(bucketValue);
          setBucketValue(bucket, newValue);
          // Return the new value, but only clone/freeze if it's an object
          if (newValue !== null && typeof newValue === 'object') {
            return deepFreeze(cloneDeep(newValue));
          }
          return newValue;
        } else {
          // Merge object: update(bucket, { prop: value })
          // Only merge if bucket contains an object, otherwise replace
          const isPrimitive = bucketValue === null || typeof bucketValue !== 'object' || Array.isArray(bucketValue);
          if (isPrimitive) {
            console.warn(`[AppState.update] Cannot merge object into primitive bucket '${bucket}'. Use set() instead.`);
            return bucketValue;
          }
          const merged = { ...(bucketValue || {}), ...pathOrUpdater };
          setBucketValue(bucket, merged);
          return deepFreeze(cloneDeep(merged));
        }
      } catch (error) {
        console.warn(`[AppState] Error in update('${bucket}'):`, error);
        return undefined;
      }
    },

    /**
     * Update the bucket value using an updater function
     * @param bucket - The bucket name
     * @param updater - Function that receives the current value and returns the new value
     */
    async updateWith(bucket: string, updater: (prev: any) => any): Promise<any> {
      try {
        const bucketValue = getBucketValue(bucket);
        const result = updater(bucketValue);
        // Await the result in case the updater returns a promise
        const newValue = result instanceof Promise ? await result : result;
        setBucketValue(bucket, newValue);
        // Return the new value, but only clone/freeze if it's an object
        if (newValue !== null && typeof newValue === 'object') {
          return deepFreeze(cloneDeep(newValue));
        }
        return newValue;
      } catch (error) {
        console.warn(`[AppState] Error in updateWith('${bucket}'):`, error);
        return undefined;
      }
    },

    /**
     * Remove item matching with value from the array bucket
     */
    remove(bucket: string, value: any): void {
      try {
        const array = getArrayFromBucket(bucket);
        if (!array) return;

        const index = array.findIndex((item) => isEqual(item, value));
        if (index !== -1) {
          const newArray = [...array.slice(0, index), ...array.slice(index + 1)];
          setBucketValue(bucket, newArray);
        }
      } catch (error) {
        console.warn(`[AppState] Error in remove('${bucket}'):`, error);
      }
    },

    /**
     * Remove item at the specified index from the array bucket
     */
    removeAt(bucket: string, index: number): any {
      try {
        const array = getArrayFromBucket(bucket);
        if (!array) return undefined;

        if (index < 0 || index >= array.length) {
          console.warn(`[AppState] Index ${index} out of bounds for bucket '${bucket}'`);
          return undefined;
        }

        const removedItem = array[index];
        const newArray = [...array.slice(0, index), ...array.slice(index + 1)];
        setBucketValue(bucket, newArray);
        return deepFreeze(cloneDeep(removedItem));
      } catch (error) {
        console.warn(`[AppState] Error in removeAt('${bucket}', ${index}):`, error);
        return undefined;
      }
    },

    /**
     * Append a new item to the array bucket
     */
    append(bucket: string, value: any): any {
      try {
        const array = getArrayFromBucket(bucket) || [];
        const newArray = [...array, value];
        setBucketValue(bucket, newArray);
        return deepFreeze(cloneDeep(newArray));
      } catch (error) {
        console.warn(`[AppState] Error in append('${bucket}'):`, error);
        return undefined;
      }
    },

    /**
     * Alias for append
     */
    push(bucket: string, value: any): any {
      return this.append(bucket, value);
    },

    /**
     * Pop the last item from the array bucket
     */
    pop(bucket: string): any {
      try {
        const array = getArrayFromBucket(bucket);
        if (!array || array.length === 0) {
          return undefined;
        }

        const poppedItem = array[array.length - 1];
        const newArray = array.slice(0, -1);
        setBucketValue(bucket, newArray);
        return deepFreeze(cloneDeep(poppedItem));
      } catch (error) {
        console.warn(`[AppState] Error in pop('${bucket}'):`, error);
        return undefined;
      }
    },

    /**
     * Remove the first item from the array bucket
     */
    shift(bucket: string): any {
      try {
        const array = getArrayFromBucket(bucket);
        if (!array || array.length === 0) {
          return undefined;
        }

        const shiftedItem = array[0];
        const newArray = array.slice(1);
        setBucketValue(bucket, newArray);
        return deepFreeze(cloneDeep(shiftedItem));
      } catch (error) {
        console.warn(`[AppState] Error in shift('${bucket}'):`, error);
        return undefined;
      }
    },

    /**
     * Add item to the beginning of the array bucket
     */
    unshift(bucket: string, value: any): any {
      try {
        const array = getArrayFromBucket(bucket) || [];
        const newArray = [value, ...array];
        setBucketValue(bucket, newArray);
        return deepFreeze(cloneDeep(newArray));
      } catch (error) {
        console.warn(`[AppState] Error in unshift('${bucket}'):`, error);
        return undefined;
      }
    },

    /**
     * Insert item at the specified index in the array bucket
     */
    insertAt(bucket: string, index: number, value: any): any {
      try {
        const array = getArrayFromBucket(bucket) || [];
        
        // Handle negative indices
        const actualIndex = index < 0 ? Math.max(0, array.length + index) : index;
        
        // Clamp index to valid range
        const clampedIndex = Math.min(Math.max(0, actualIndex), array.length);
        
        const newArray = [
          ...array.slice(0, clampedIndex),
          value,
          ...array.slice(clampedIndex),
        ];
        setBucketValue(bucket, newArray);
        return deepFreeze(cloneDeep(newArray));
      } catch (error) {
        console.warn(`[AppState] Error in insertAt('${bucket}', ${index}):`, error);
        return undefined;
      }
    },
  };
}
