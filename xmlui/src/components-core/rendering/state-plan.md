# Global app state methods

XMLUI has an AppState component. I want to create global functions and add them to AppContextObject so that I can use app state through methods and not only through components.

I want to keep the current implementation of managing state, which uses AppStateContext. These are the implementation details I want to add:

I want to use the "AppState" name in AppContextObject to reach the app state management functionality. The object behind "AppState" should provide these methods:

```ts
type AppState = {
  define(bucket: string, initialState: any): any; // Define a bucket with the specified initial state. Returns the initial value (frozen/cloned if object).
  get(bucket: string, path?: string): any; // Returns the current state of the bucket or nested property. Objects/arrays are deep-cloned and frozen; primitives returned as-is.
  set(bucket: string, pathOrValue: string | any, value?: any): any; // Two forms: set(bucket, value) replaces entire bucket; set(bucket, path, value) sets nested property. Returns the new value (frozen/cloned if object).
  update(bucket: string, pathOrUpdater: string | any, updater?: any): any; // Two forms: update(bucket, patch) merges object into bucket (only for object buckets); update(bucket, path, updater) updates nested property. Returns updated value.
  updateWith(bucket: string, updater: (prev: any) => any | Promise<any>): Promise<any>; // Updates bucket using updater function that receives current value and returns new value. Works with primitives, objects, and arrays. Supports both sync and async updater functions. Returns the new value.

  // The following methods work when the bucket's content is an array. Otherwise, they log a warning and have no effect.
  remove(bucket: string, value: any): void; // Removes the first item matching with "value" from the array bucket. Uses deep equality comparison (all properties must match).
  removeBy(bucket: string, predicate: (item: any) => boolean): void; // Removes the first item where predicate returns true. Useful for partial matching or complex conditions.
  removeAt(bucket: string, index: number): any; // Removes the item at the specified index from the array bucket. Returns a frozen deep-cloned instance of the removed item.
  append(bucket: string, value: any): any; // Appends a new item to the array. Returns the updated array (frozen/cloned).
  push(bucket: string, value: any): any; // An alias to "append"
  pop(bucket: string): any; // Pops the item from the array. Returns a frozen deep-cloned object of the popped item.
  shift(bucket: string): any; // Removes the first item from the array. Returns a frozen deep-cloned object of the removed item.
  unshift(bucket: string, value: any): any; // Adds a new item to the beginning of the array. Returns the updated array (frozen/cloned).
  insertAt(bucket: string, index: number, value: any): any; // Inserts a new item at the specified index. Returns the updated array (frozen/cloned).
}
```

The "bucket" string is a property key using the lodash style property name. For example, if it is "a.b", the the bucket is the the "b" property within the object represented by "a" in the app state.

Put the implementation methods into the xmlui/src/components-core/rendering/appState.ts file.

## Implementation Steps

1. Create `appState.ts` file with `AppState` type definition and implementation methods
2. Use lodash `cloneDeep` for deep-cloning; implement recursive `deepFreeze` for immutability
3. Add bucket path parsing using lodash `get` and `set` for nested property access
4. Implement core state methods: `define`, `get`, `set`, `update`, `updateWith`
5. Implement array methods: `remove`, `removeAt`, `append/push`, `pop`, `shift`, `unshift`, `insertAt`
6. Add validation: check if bucket exists, check if bucket contains array for array methods
7. Create factory function `createAppState(appStateContext: IAppStateContext)` that returns `AppState` object
8. In `AppContent.tsx`, create state management infrastructure before `appContextValue`
9. Create `appStateContextValue` with `{ appState, update }` from useState/useCallback
10. Create `AppState` object using factory: `useMemo(() => createAppState(appStateContextValue), [appStateContextValue])`
11. Add `AppState` to `AppContextObject` in `appContextValue` and its dependency array
12. Add error handling: log warnings to console and return undefined on errors

**Pattern Notes:**
- Always access `appStateContext.appState` directly (not via destructuring) to get latest state
- The context's `update(bucket, patch)` function **merges** objects, not replaces
- For primitives/arrays, wrap in `{ __value__: actualValue }` structure when storing
- Unwrap `__value__` when reading with `getBucketValue` helper
- The context expects top-level bucket keys; use lodash for nested paths within buckets
- Return frozen deep-cloned values for objects/arrays; return primitives as-is
- Error handling: log warning to console with `console.warn`, return undefined (no exceptions thrown)

**Implementation Details:**
- `deepFreeze`: Recursively freeze objects/arrays to ensure immutability
- `getBucketValue`: Gets value from `appStateContext.appState`, unwraps `__value__` if present
- `setBucketValue`: Wraps primitives/arrays in `{ __value__ }` for storage compatibility
- `get(bucket, path?)`: Support optional path parameter for nested property access
- `set(bucket, pathOrValue, value?)`: Two-argument form replaces bucket; three-argument form sets nested property
- `update(bucket, pathOrUpdater, updater?)`: Merges objects only; warns if trying to merge into primitive
- `updateWith(bucket, updater)`: New method that accepts function `(prev) => next` for functional updates
- Only freeze/clone objects and arrays; primitives are immutable by nature

## Counter Example

This example demonstrates basic state management methods with a simple counter:

```xml
<App>
  <!-- Initialize counter with primitive value -->
  <Button onClick="AppState.define('counter', 0)">Initialize Counter</Button>
  
  <!-- Use set() for simple updates -->
  <Button onClick="AppState.set('counter', AppState.get('counter') + 1)">Increment</Button>
  <Button onClick="AppState.set('counter', AppState.get('counter') - 1)">Decrement</Button>
  <Button onClick="AppState.set('counter', 0)">Reset</Button>
  
  <!-- Display counter value -->
  <Text>Counter: {AppState.get('counter')}</Text>
  
  <!-- Use updateWith() for functional updates -->
  <Button onClick="AppState.updateWith('counter', (c) => c + 10)">Add 10</Button>
  <Button onClick="AppState.updateWith('counter', (c) => c * 2)">Double</Button>
  
  <!-- Object-based counter with nested state -->
  <Button onClick="AppState.define('stats', { count: 0, total: 0 })">Initialize Stats</Button>
  <Button onClick="AppState.set('stats', 'count', AppState.get('stats', 'count') + 1)">
    Increment Count (nested)
  </Button>
  <Button onClick="AppState.update('stats', { total: AppState.get('stats', 'total') + 5 })">
    Add 5 to Total (merge)
  </Button>
  <Text>Count: {AppState.get('stats', 'count')}, Total: {AppState.get('stats', 'total')}</Text>
</App>
```

## Array Example

This example demonstrates array manipulation methods for a todo list:

```xml
<App>
  <!-- Initialize todos array -->
  <Button onClick="AppState.define('todos', [])">Initialize Todos</Button>
  
  <!-- Add items to the array -->
  <Button onClick="AppState.append('todos', { id: Date.now(), text: 'Buy groceries', done: false })">
    Add Todo (append)
  </Button>
  <Button onClick="AppState.push('todos', { id: Date.now(), text: 'Walk dog', done: false })">
    Add Todo (push)
  </Button>
  <Button onClick="AppState.unshift('todos', { id: Date.now(), text: 'Urgent: Call doctor', done: false })">
    Add Urgent Todo (unshift)
  </Button>
  
  <!-- Remove items from the array -->
  <Button onClick="AppState.pop('todos')">Remove Last Todo</Button>
  <Button onClick="AppState.shift('todos')">Remove First Todo</Button>
  <Button onClick="AppState.removeAt('todos', 1)">Remove Second Todo</Button>
  
  <!-- Remove by matching property (most common use case) -->
  <Button onClick="AppState.removeBy('todos', (item) => item.text === 'Buy groceries')">
    Remove 'Buy groceries'
  </Button>
  
  <!-- Remove by predicate (complex matching) -->
  <Button onClick="AppState.removeBy('todos', (item) => item.done === true)">
    Remove First Completed Todo
  </Button>
  
  <!-- Insert at specific position -->
  <Button onClick="AppState.insertAt('todos', 1, { id: Date.now(), text: 'Review code', done: false })">
    Insert at Position 1
  </Button>
  
  <!-- Display todos -->
  <Items data="{AppState.get('todos')}">
    <HStack>
      <Text>{$item.text}</Text>
      <Text when="{$item.done}">✓</Text>
    </HStack>
  </Items>
  
  <!-- Nested array example -->
  <Button onClick="AppState.define('project.tasks', [])">Initialize Project Tasks</Button>
  <Button onClick="AppState.append('project.tasks', 'Design UI')">Add Task</Button>
  <Text>Tasks: {JSON.stringify(AppState.get('project.tasks'))}</Text>
</App>
```

## E2E Test Cases

### Basic State Management Tests
- "define() initializes a new bucket with primitive value"
- "define() initializes a new bucket with object value"
- "define() initializes a new bucket with array value"
- "define() returns the initial value"
- "get() returns undefined for non-existent bucket"
- "get() returns a deep-cloned frozen object for object values"
- "get() returns primitive values as-is without cloning"
- "get() with path parameter retrieves nested property"
- "get() with path returns primitives as-is"
- "get() with path returns cloned/frozen objects"
- "get() does not return the original reference"
- "set() with two arguments replaces entire bucket"
- "set() with three arguments sets nested property"
- "set() creates bucket if it doesn't exist"
- "set() returns the new value"
- "update() merges new values into existing object bucket"
- "update() with path updates nested property"
- "update() warns when trying to merge into primitive bucket"
- "update() returns the merged value"
- "update() does not mutate original object"
- "updateWith() updates primitive bucket with function"
- "updateWith() updates object bucket with function"
- "updateWith() updates array bucket with function"
- "updateWith() receives current value in updater function"
- "updateWith() returns the new value"

### Nested Path Tests
- "define() works with nested paths (a.b.c)"
- "get() retrieves nested bucket values"
- "set() updates nested bucket values"
- "update() merges into nested buckets"
- "nested paths create intermediate objects automatically"

### Array Method Tests - Basic Operations
- "append() adds item to end of array"
- "append() returns updated frozen array"
- "push() adds item to end of array (alias)"
- "pop() removes and returns last item"
- "pop() returns frozen deep-cloned item"
- "shift() removes and returns first item"
- "shift() returns frozen deep-cloned item"
- "unshift() adds item to beginning of array"
- "unshift() returns updated frozen array"

### Array Method Tests - Advanced Operations
- "removeAt() removes item at specified index"
- "removeAt() returns the removed item"
- "removeAt() handles negative indices"
- "removeAt() handles out-of-bounds indices gracefully"
- "insertAt() inserts item at specified index"
- "insertAt() returns updated frozen array"
- "insertAt() handles negative indices"
- "insertAt() handles index at array length (append behavior)"
- "remove() removes first item matching by value from array"
- "remove() uses deep equality for object comparison"
- "remove() has no effect if value not found"
- "removeBy() removes first item matching predicate"
- "removeBy() uses predicate for partial property matching"
- "removeBy() handles complex conditions in predicate"
- "removeBy() has no effect if predicate never returns true"

### Array Method Tests - Edge Cases
- "array methods validate bucket contains an array"
- "array methods log warning for non-array buckets"
- "array methods handle empty arrays"
- "array methods work on nested array paths"
- "pop() on empty array returns undefined"
- "shift() on empty array returns undefined"
- "append() to non-existent bucket logs warning"
- "unshift() to non-existent bucket logs warning"

### Error Handling Tests
- "get() handles invalid bucket paths gracefully"
- "set() handles invalid bucket paths gracefully"
- "array methods validate bucket is an array"
- "methods handle null/undefined bucket names"
- "methods handle errors with console.warn"
- "methods return undefined on errors"

### Immutability Tests
- "returned objects are frozen"
- "returned arrays are frozen"
- "nested objects in returned values are frozen"
- "primitives are returned as-is (immutable by nature)"
- "modifying returned object throws error in strict mode"
- "modifying returned array throws error in strict mode"
- "original state is never mutated"

### Integration Tests
- "AppState is accessible from event handlers"
- "AppState changes trigger component re-renders"
- "multiple buckets can be managed independently"
- "AppState works with Items component data binding"
- "AppState works within nested component contexts"
- "AppState persists across component re-renders"
- "AppState.updateWith works with arrow functions in XMLUI"
