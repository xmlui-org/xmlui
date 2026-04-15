# XMLUI Variables and State — A Practical Explanation

This document answers three focused questions:
1. Where are variables and component state actually stored?
2. How do global variables work and how do they reach every component?
3. How can a variable appear in multiple containers yet only one update fires when you change it?

---

## Where Variables Live

Every container owns a flat key-value object (`ContainerState = Record<string | symbol, any>`). There are two distinct stores inside each explicit container:

| Store | Managed by | Contains |
|---|---|---|
| **Component reducer state** | `useReducer` | Runtime-changed local vars, loader results, event-in-progress flags |
| **Global vars snapshot** | `useGlobalVariables` hook | Evaluated copies of global variables visible to this container |

Local variables declared with `var.foo`, `<script>`, or code-behind start as static initial values and are _re-evaluated_ on every render from expressions. When a mutation (`foo++`) is detected, the new value lands in the **component reducer state** under the same key. From then on the reducer value shadows the initial expression.

A container that is **implicit** (automatically created for any `<Stack var.x>`) shares its parent's reducer dispatcher and registration callback. It forms no boundary of its own — it just contributes its local vars to the merged view.

An **explicit** container (`<Container>` or any node with `uses=`) owns its own `useReducer`, so state updates stop there.

---

## The 6-Layer State View

When a container renders, it assembles a single `finalState` object for its children by merging layers in priority order (later layers win):

```
1. Parent state   ← everything the parent sees, optionally filtered by `uses`
2. Reducer state  ← loader results, event flags, mutated local vars
3. Component APIs ← methods exposed by named children (e.g. myTable.getSelectedRows)
4. Context vars   ← framework-injected: $item, $routeParams, $value, …
5. Global vars    ← evaluated globals, can be shadowed by local vars
6. Local vars     ← var.*, script/code-behind declarations (highest priority)
   + Routing params ($pathname, $queryParams — always available)
```

This merged object is passed as `parentState` to every child container.  
**Nothing is copied permanently.** A child always reads the current merged view from its parent; there is no separate cache of the parent's values inside the child.

---

## Global Variables

Global variables are declared once — in `Globals.xs`, `global.*` attributes on the root `<App>`, or `<global>` tags — and stored in the root container's `globalVars` record.

Each container receives `parentGlobalVars` as a prop. The `useGlobalVariables` hook re-evaluates any globals whose expressions depend on other globals that have changed, producing a stable `currentGlobalVars` object that is merged into the final state (layer 5).

Because globals are **passed down as a prop** (not copied into child reducer state), every container in the tree always sees the same root-owned values after each render.

---

## Why Changing a Variable Updates Only One Place

This is the key subtlety. Children do **not** store their own copies of inherited variables. They only hold a merged, read-only view. All writes are routed back to the owning container via a proxy.

### The Proxy

Whenever a variable is accessed inside an event handler or expression evaluator, the framework hands the handler a **[Proxy](../src/components-core/rendering/buildProxy.ts)** wrapping the current state. The proxy records the full path of any `set` or `deleteProperty` operation and calls a `statePartChanged` callback.

### The Owner-Routing Callback

`statePartChanged` in `StateContainer.tsx` decides where to send the change:

```
Is the changed key a LOCAL var of this container?
  → dispatch to THIS container's useReducer  ✓

Is it a GLOBAL var and this is the ROOT container?
  → dispatch to root's useReducer  ✓

Is it a GLOBAL var but this is NOT root?
  → bubble up: call parentStatePartChanged(...)  ↑

Is it neither (inherited from parent)?
  → bubble up: call parentStatePartChanged(...)  ↑
```

Bubbling continues up the chain until the container that owns the variable is reached, and only that container's reducer fires. React then re-renders that container and propagates the new value **back down** as `parentState` to all children — the normal React data-flow.

### Concrete Example

```xml
<!-- root: global var count = 0 -->
<App global.count="{0}">
  <MyComponent />   <!-- child A -->
  <MyComponent />   <!-- child B -->
</App>
```

**Initial state — two children, one source of truth:**

```
┌────────────────────────────────────────────────────────────────┐
│  Root Container (App)                                          │
│  useReducer  ← owns { count: 0 }   (global var, one copy)      │
│  globalVars = { count: 0 }                                     │
│                         │                                      │
│           parentGlobalVars passed down as prop                 │
│                  ┌──────┴──────┐                               │
│                  ▼             ▼                               │
│  ┌───────────────────┐  ┌───────────────────┐                  │
│  │  Child A          │  │  Child B          │                  │
│  │  (MyComponent)    │  │  (MyComponent)    │                  │
│  │                   │  │                   │                  │
│  │  merged view:     │  │  merged view:     │                  │
│  │    count: 0  ←──┐ │  │    count: 0  ←──┐ │                  │
│  │  (read-only)    │ │  │  (read-only)    │ │                  │
│  └─────────────────│─┘  └─────────────────│─┘                  │
│                    └─────────┘  same value  │                  │
└────────────────────────────────────────────────────────────────┘
```

**The same structure as JavaScript objects** — `(*ref1*)` marks the single object that both children point to:

```js
// The one object owned by root's useReducer:
const globalVars = { count: 0 }  // (*ref1*)

RootContainer = {
  reducerState: (*ref1*),          // ← the authoritative copy
  globalVars:   (*ref1*),          // ← same reference

  // finalState passed as parentState prop to both children:
  finalState: (*ref1*),            // ← same reference again (just globalVars merged in)

  children: {
    childA: {
      parentGlobalVars: (*ref1*),  // ← prop received from root, same reference
      mergedView: {
        // assembled each render by merging layers — count read from (*ref1*)
        count: (*ref1*).count      // value: 0  (no local copy stored)
      }
    },
    childB: {
      parentGlobalVars: (*ref1*),  // ← same reference
      mergedView: {
        count: (*ref1*).count      // value: 0  (no local copy stored)
      }
    }
  }
}
```

There is exactly **one** `{ count: 0 }` object. The children hold a reference to it (passed as a prop), not independent copies. When `count` changes, only `(*ref1*)` is updated — and both children automatically see the new value on the next render.

**What happens when Child A executes `count++`:**

```
  Child A event handler runs: count++
       │
       │  proxy intercepts the write on "count"
       ▼
  statePartChanged("count", 1)   ← fired inside Child A's StateContainer
       │
       │  "count" is NOT a local var of Child A
       │  "count" IS a global var, but Child A is not root
       │
       │  → bubble up to parentStatePartChanged
       ▼
  Root Container receives statePartChanged("count", 1)
       │
       │  "count" IS a global var AND this IS root
       │
       │  → dispatch( STATE_PART_CHANGED )  ← ONE reducer call, here only
       ▼
  Root useReducer updates: { count: 1 }
       │
       │  Root re-renders, passes parentGlobalVars = { count: 1 } down
       ├──────────────────────────────────┐
       ▼                                  ▼
  Child A merged view: count=1      Child B merged view: count=1
```

Only **one reducer dispatch** happens, in the root. Neither child stores count independently.

### Local Variable Shadow Example

```xml
<App global.count="{0}">
  <Button label="{count}" onClick="count++" />          <!-- uses global -->
  <Button var.count="{0}" label="{count}" onClick="count++" />  <!-- uses local shadow -->
</App>
```

**Two buttons, two different owners of "count":**

```
┌──────────────────────────────────────────────────────────────┐
│  Root Container (App)                                        │
│  useReducer owns global: { count: 0 }                        │
│                                                              │
│  ┌──────────────────────┐  ┌──────────────────────────────┐  │
│  │  Button 1            │  │  Button 2                    │  │
│  │  (no var.count)      │  │  var.count="{0}"             │  │
│  │                      │  │  → implicit container        │  │
│  │  merged view:        │  │  useReducer owns local:      │  │
│  │    count: 0  ←───────┼──┼── (root global)              │  │
│  │                      │  │                              │  │
│  │                      │  │  merged view:                │  │
│  │                      │  │    count: 0  ← local var     │  │
│  │                      │  │    (shadows the global)      │  │
│  └──────────────────────┘  └──────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

**The same structure as JavaScript objects** — two separate owner objects, same key name:

```js
// (*ref:global*) — owned by root's useReducer
const rootGlobal = { count: 0 }   // (*ref:global*)

// (*ref:local*) — owned by Button 2's implicit container
const btn2Local  = { count: 0 }   // (*ref:local*)

RootContainer = {
  reducerState: (*ref:global*),    // root reducer holds the global
  globalVars:   (*ref:global*),

  children: {
    button1: {
      // no var.count → no local container of its own
      parentGlobalVars: (*ref:global*),
      mergedView: {
        count: (*ref:global*).count   // reads from global, value: 0
      }
    },
    button2: {
      // var.count="{0}" → implicit container with a separate local
      reducerState: (*ref:local*),
      parentGlobalVars: (*ref:global*),  // global is still passed in but…
      mergedView: {
        count: (*ref:local*).count       // layer 6 local shadows layer 5 global
        // (*ref:global*).count is not visible here — overridden by local layer
      }
    }
  }
}
```

After each button is clicked once independently:

```js
// Button 1 clicked → only (*ref:global*) changes:
(*ref:global*) = { count: 1 }   // root reducer updated
(*ref:local*)  = { count: 0 }   // untouched

// Button 2 clicked (starting from initial state) → only (*ref:local*) changes:
(*ref:global*) = { count: 0 }   // untouched
(*ref:local*)  = { count: 1 }   // Button 2's own reducer updated
```

Two objects, two keys named `count`, zero interference.

**Click Button 1 (`count++` → global):**
```
  "count" is NOT local → bubble to root → root reducer: global count = 1
  Button 1 re-renders: count=1   ✓
  Button 2 re-renders: local count still 0  (local var shadows the global)
```

**Click Button 2 (`count++` → local):**
```
  "count" IS local to Button 2's container → Button 2's own reducer: local count = 1
  Button 2 re-renders: count=1   ✓
  Button 1 / root: global count unchanged, still 0
```

- The second Button declares `var.count`. This creates a local variable in its own container.
- When it fires `count++`, the proxy callback sees that `count` **is a local var** of this container → dispatches locally.
- The global `count` is never touched. The first Button is unaffected.

---

## 6-Layer State: Illustrated Examples

The following three examples each spotlight different layers of the pipeline on real components.

### Example 1 — Local vars flowing to children (layers 1 & 6)

```xml
<Stack var.name="{''}">
  <TextBox onChange="name = $value" placeholder="Your name" />
  <Text>Hello, {name}!</Text>
</Stack>
```

**Container structure:**

```
┌──────────────────────────────────────────────────────────┐
│  Stack (implicit container)                              │
│  Layer 6 — local var: name = ''                          │
│                                                          │
│  finalState for children: { name: '' }                   │
│                                                          │
│  ┌──────────────────────┐  ┌──────────────────────────┐  │
│  │  TextBox             │  │  Text                    │  │
│  │  Layer 1 (parent):   │  │  Layer 1 (parent):       │  │
│  │    name = ''         │  │    name = ''             │  │
│  │  Layer 4 (context):  │  │                          │  │
│  │    $value = <input>  │  │  renders: "Hello, !"     │  │
│  │  onChange writes     │  │  (re-renders when name   │  │
│  │    name = $value     │  │    changes)              │  │
│  └──────────────────────┘  └──────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

**JavaScript objects:**

```js
const localVars = { name: '' }   // (*ref:L6*) — owned by Stack's implicit container

StackContainer = {
  reducerState: {},              // layer 2 — empty (no loaders here)
  localVars: (*ref:L6*),         // layer 6

  // assembled finalState passed as parentState prop to each child:
  finalState: { name: (*ref:L6*).name },   // (*ref:final*)

  children: {
    textBox: {
      parentState: (*ref:final*),   // layer 1 — sees name = ''
      // layer 4 injects $value during onChange event
      // onChange writes: name = $value → proxy routes to Stack's reducer
    },
    text: {
      parentState: (*ref:final*),   // layer 1 — sees name = '', re-renders on change
    }
  }
}
```

When the user types, `name = $value` is detected by the proxy → Stack's reducer updates `(*ref:L6*)` → both TextBox and Text receive the new `name` via `(*ref:final*)` on the next render.

---

### Example 2 — DataSource loader state (layer 2)

```xml
<App>
  <DataSource id="users" url="/api/users" />
  <Text>{users.inProgress ? 'Loading...' : users.value.length + ' users'}</Text>
  <Button label="Reload" onClick="users.reload()" />
</App>
```

**Container structure:**

```
┌──────────────────────────────────────────────────────────────────┐
│  Root Container (App)                                            │
│                                                                  │
│  Layer 2 — reducer state (populated by DataSource):             │
│    users = {                                                     │
│      inProgress: true,    ← true while fetching                 │
│      loaded:     false,                                          │
│      error:      null,                                           │
│      value:      null     ← array of rows when fetch completes   │
│    }                                                             │
│                                                                  │
│  Layer 3 — component API (registered by DataSource):            │
│    users.reload()   ← method callable from any child            │
│                                                                  │
│  ┌──────────────────────────────┐  ┌────────────────────────┐   │
│  │  Text                        │  │  Button                │   │
│  │  Layer 1 (parent):           │  │  Layer 1 (parent):     │   │
│  │    users.inProgress = true   │  │    users.reload = fn() │   │
│  │  → renders "Loading..."      │  │  onClick: users.reload │   │
│  └──────────────────────────────┘  └────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

**JavaScript objects — while loading:**

```js
// Layer 2: root's useReducer holds the loader state
const loaderState = {
  inProgress: true,   // (*ref:users*)
  loaded:     false,
  error:      null,
  value:      null,
}

// Layer 3: component API registered by DataSource
const usersApi = { reload: () => { /* triggers re-fetch */ } }

RootContainer = {
  reducerState: { users: (*ref:users*) },   // layer 2
  componentApis: { users: usersApi },       // layer 3

  // finalState merges layers 2 + 3 (users object gets .reload added):
  finalState: {
    users: {
      ...(*ref:users*),        // inProgress, loaded, error, value
      reload: usersApi.reload  // layer 3 method merged in
    }
  },

  children: {
    text:   { parentState: finalState },  // reads users.inProgress → "Loading..."
    button: { parentState: finalState },  // calls users.reload()
  }
}
```

When the fetch completes, the reducer replaces `(*ref:users*)` with `{ inProgress: false, loaded: true, value: [...] }`. Both children receive the updated `users` object and re-render.

---

### Example 3 — Context variables in a List (layer 4)

```xml
<Stack var.colors="{['red', 'green', 'blue']}">
  <List data="{colors}">
    <Text>{$itemIndex + 1}. {$item}</Text>
  </List>
</Stack>
```

**Container structure — one row context per item:**

```
┌─────────────────────────────────────────────────────────────┐
│  Stack (implicit container)                                 │
│  Layer 6 — local var: colors = ['red', 'green', 'blue']     │
│                                                             │
│  └── List (iterates colors, injects a row context each time)│
│        │                                                    │
│        ├── Row 0 container                                  │
│        │   Layer 4: $item = 'red',   $itemIndex = 0         │
│        │   ┌─────────────────────────────────────────────┐  │
│        │   │  Text                                       │  │
│        │   │  mergedView: { colors:[...], $item:'red',   │  │
│        │   │               $itemIndex:0 }                │  │
│        │   │  renders: "1. red"                          │  │
│        │   └─────────────────────────────────────────────┘  │
│        │                                                    │
│        ├── Row 1 container  ($item='green', $itemIndex=1)   │
│        │   Text renders: "2. green"                         │
│        │                                                    │
│        └── Row 2 container  ($item='blue',  $itemIndex=2)   │
│            Text renders: "3. blue"                          │
└─────────────────────────────────────────────────────────────┘
```

**JavaScript objects for Row 0:**

```js
// Layer 6: Stack owns the array
const stackLocal = { colors: ['red', 'green', 'blue'] }   // (*ref:colors*)

// Layer 4: List injects a fresh context object per row
const row0ctx = { $item: 'red', $itemIndex: 0 }           // (*ref:ctx0*)
const row1ctx = { $item: 'green', $itemIndex: 1 }         // (*ref:ctx1*)
const row2ctx = { $item: 'blue',  $itemIndex: 2 }         // (*ref:ctx2*)

Row0Container = {
  parentState:  { colors: (*ref:colors*) },  // layer 1: inherited from Stack
  contextVars:  (*ref:ctx0*),                // layer 4: injected by List for this row

  mergedView: {
    colors:     (*ref:colors*),              // layer 1
    $item:      (*ref:ctx0*).$item,          // layer 4 — 'red'
    $itemIndex: (*ref:ctx0*).$itemIndex,     // layer 4 — 0
  },

  children: {
    text: { /* renders "1. red" from mergedView */ }
  }
}
// Row 1 and Row 2 are identical in structure, each with their own (*ref:ctx1*) / (*ref:ctx2*).
// Changing $item for one row never affects another — each row owns its own context object.
```

---

## Summary

| Question | Answer |
|---|---|
| Where is state stored? | In a `useReducer` instance inside the owning container. |
| How do children read parent variables? | Via a merged `parentState` prop passed on every render — no copying. |
| How do globals reach every component? | Passed as `parentGlobalVars` prop down the tree; re-evaluated by each container's `useGlobalVariables` hook. |
| Why does only one update fire per mutation? | The proxy callback routes every write back to the *owning* container (local → local reducer, global → root reducer, other → bubble). No child holds its own writable copy. |
