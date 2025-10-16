# React Fundamentals

This document is a concise reference for React patterns and hooks used in XMLUI. It assumes you're familiar with [React basics](https://react.dev/learn) and provides practical guidance for reading and maintaining XMLUI source code.

## React Hooks: Quick Overview

**What are hooks?** Functions that let you "hook into" React features from function components. They always start with `use` (e.g., `useState`, `useEffect`).

**Core hooks in XMLUI:**
- **`useState`** - Add local state to components
- **`useEffect`** - Run side effects (data fetching, subscriptions, DOM updates)
- **`useRef`** - Store mutable values that don't trigger re-renders
- **`useMemo`** - Cache expensive calculations
- **`useCallback`** - Cache function definitions
- **`useReducer`** - Manage complex state with reducer pattern
- **`useContext`** - Access context values from providers

**Two critical rules:**
1. Only call hooks at the top level (not in loops, conditions, or nested functions)
2. Only call hooks from React functions (components or custom hooks)

**Why?** React tracks hooks by call order. Breaking these rules causes state mismatches and bugs.

## Component Rendering Lifecycle

React components re-render whenever their state or props change. Understanding this cycle prevents performance issues and unexpected behavior.

**The 5-Phase Render Cycle:**

1. **Trigger** → Something requests a render:
   - Parent component re-renders
   - Props change
   - State changes (`useState`, `useReducer`)

2. **Render** → React calls your component function, which returns JSX

3. **Reconciliation** → React's diffing algorithm determines what changed in the virtual DOM

4. **Commit** → React updates the actual DOM with minimal changes

5. **Effects** → React runs effects in order:
   - `useLayoutEffect` (synchronous, blocks paint)
   - Browser paints the screen
   - `useEffect` (asynchronous, after paint)

**Key insight:** Re-rendering is cheap (just a function call), but DOM updates are expensive. React optimizes by batching and minimizing DOM changes.

**Common performance pitfalls:**
```tsx
// ❌ WRONG - Parent re-renders cause all children to re-render
function Parent() {
  const [count, setCount] = useState(0);
  return (
    <div>
      <ExpensiveChild data={data} />  {/* Re-renders unnecessarily */}
      <button onClick={() => setCount(c => c + 1)}>Update</button>
    </div>
  );
}

// ✅ CORRECT - Memoize to prevent unnecessary re-renders
const MemoizedChild = React.memo(ExpensiveChild);

function Parent() {
  const [count, setCount] = useState(0);
  const data = useMemo(() => computeData(), []); // Stable reference
  return (
    <div>
      <MemoizedChild data={data} />  {/* Only re-renders when data changes */}
      <button onClick={() => setCount(c => c + 1)}>Update</button>
    </div>
  );
}
```

## Rules of Hooks

These rules are enforced by React and ESLint. Violating them causes hard-to-debug errors.

**Rule 1: Call hooks at the top level**
```tsx
// ❌ WRONG - Conditional hook
function Bad({ show }: Props) {
  if (show) {
    const [value, setValue] = useState(""); // Hook order changes!
  }
  return <div>...</div>;
}

// ✅ CORRECT - Hook always called
function Good({ show }: Props) {
  const [value, setValue] = useState("");
  if (!show) return null;
  return <div>{value}</div>;
}
```

**Rule 2: Only call from React functions**
```tsx
// ❌ WRONG - Hook in regular function
function getUser() {
  const [user, setUser] = useState(null); // Not allowed!
  return user;
}

// ✅ CORRECT - Hook in component or custom hook
function useUser() {
  const [user, setUser] = useState(null);
  return user;
}

function Component() {
  const user = useUser(); // OK
  return <div>{user?.name}</div>;
}
```

**Why these rules exist:** React stores hook state in a sequential array tied to each component instance. The array index depends on call order. Conditional hooks break this indexing, causing state to be assigned to the wrong hooks.

---

## React State Management Patterns

Fundamental patterns for managing state in React, from local component state to shared state across component trees.

### `useState` - Local State

**Syntax:** `const [state, setState] = useState(initialValue)`

```tsx
// Basic
const [count, setCount] = useState(0);

// Functional update (when new state depends on old)
setCount(prev => prev + 1);

// Lazy initialization (expensive initial state)
const [data, setData] = useState(() => expensiveComputation());

// Immutable updates
setUser(prev => ({ ...prev, name }));
setItems(prev => [...prev, newItem]);
```

**Use when:** State is local, updates are simple, no complex transitions.  
**Consider alternatives:** Multiple components → Context, complex logic → useReducer.

---

### `useReducer` - Complex State Logic

**Syntax:** `const [state, dispatch] = useReducer(reducer, initialState)`

```tsx
type Action = { type: 'increment' } | { type: 'decrement' } | { type: 'reset' };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'increment': return { count: state.count + 1 };
    case 'decrement': return { count: state.count - 1 };
    case 'reset': return { count: 0 };
    default: return state;
  }
}

const [state, dispatch] = useReducer(reducer, { count: 0 });
dispatch({ type: 'increment' });
```

**With Immer (XMLUI pattern):**
```tsx
import produce from 'immer';

const reducer = produce((draft, action) => {
  switch (action.type) {
    case 'ADD_TODO':
      draft.todos.push(action.payload); // Direct mutation
      break;
  }
});
```

**Use when:** Multiple related state values, complex transitions, want to separate state logic.  
**Use useState when:** Simple independent values, straightforward updates.

---

### Context API - Avoid Prop Drilling

**Purpose:** Share state across component tree without passing props through every level.

**Pattern:** Create context → Provider component → Custom hook → Consume

```tsx
// 1. Create context
const AuthContext = createContext<AuthContext | null>(null);

// 2. Custom hook with validation
function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

// 3. Provider component
function AuthProvider({ children }: Props) {
  const [user, setUser] = useState<User | null>(null);
  
  const value = useMemo(() => ({
    user,
    login: async (creds: Credentials) => { /* ... */ },
    logout: () => setUser(null),
  }), [user]);
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// 4. Consume anywhere in tree
function Component() {
  const { user, logout } = useAuth(); // No prop drilling!
  return <button onClick={logout}>{user.name}</button>;
}
```

**XMLUI Example:**
```tsx
// AppLayoutContext - Provides layout state to nested navigation
const AppLayoutContext = createContext<IAppLayoutContext | null>(null);

export const App = forwardRef(function App(props, ref) {
  const layoutContextValue = useMemo(() => ({
    layout,
    navPanelVisible,
    toggleDrawer,
  }), [layout, navPanelVisible, toggleDrawer]);
  
  return (
    <AppLayoutContext.Provider value={layoutContextValue}>
      {content}
    </AppLayoutContext.Provider>
  );
});

// NavLink accesses layout directly
export const NavLink = forwardRef(function NavLink(props, ref) {
  const { layout } = useAppLayoutContext();
  // No prop drilling!
});
```

**Use when:** Many nested components need access, >3 levels of prop drilling, global state (theme, auth).  
**Don't use when:** 1-2 levels of nesting (props fine), high-frequency updates (re-renders all consumers).

**Performance tip:** Split contexts by update frequency - separate user/theme/settings contexts instead of one combined context.

---

### State Lifting

**Pattern:** Move state to common ancestor to share between siblings.

```tsx
// ❌ WRONG - Siblings can't communicate
<Parent><InputA /><InputB /></Parent>

// ✅ CORRECT - Lift state to parent
function Parent() {
  const [value, setValue] = useState('');
  return (
    <>
      <InputA value={value} onChange={setValue} />
      <InputB value={value} />
    </>
  );
}
```

**XMLUI Pattern:** Container-based state flows down automatically:
```tsx
<Stack var.selectedId="{null}">
  <Button onClick={"{() => selectedId = 'item1'}" />
  <Display value="{selectedId}" />
</Stack>
```

**Use when:** Siblings need to coordinate, parent orchestrates behavior.  
**Don't use when:** State only used by one component, excessive prop drilling (use context).

---

### Controlled vs Uncontrolled Components

**Controlled:** Parent manages state via `value` prop.
```tsx
function Controlled({ value, onChange }: Props) {
  return <input value={value} onChange={e => onChange(e.target.value)} />;
}
```

**Uncontrolled:** Component manages own state via `initialValue`.
```tsx
function Uncontrolled({ initialValue = '', onDidChange }: Props) {
  const [value, setValue] = useState(initialValue);
  return <input value={value} onChange={e => { setValue(e.target.value); onDidChange?.(e.target.value); }} />;
}
```

**Hybrid (XMLUI pattern):** Support both modes.
```tsx
function Flexible({ value, initialValue = '', onDidChange }: Props) {
  const [localValue, setLocalValue] = useState(initialValue);
  
  useEffect(() => {
    if (value !== undefined) setLocalValue(value);
  }, [value]);
  
  const handleChange = (e) => {
    setLocalValue(e.target.value);
    onDidChange?.(e.target.value);
  };
  
  return <input value={localValue} onChange={handleChange} />;
}
```

**Use controlled:** Validate/format input, value affects other UI, programmatic changes.  
**Use uncontrolled:** Simple forms (read on submit), performance critical.  
**Use hybrid:** Reusable component libraries.

---

### Compound Components

**Purpose:** Components work together as cohesive unit, sharing state via context.

```tsx
const TabsContext = createContext<{
  activeTab: string;
  setActiveTab: (id: string) => void;
} | null>(null);

function Tabs({ children }: Props) {
  const [activeTab, setActiveTab] = useState('tab1');
  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className="tabs">{children}</div>
    </TabsContext.Provider>
  );
}

function Tab({ id, children }: Props) {
  const { activeTab, setActiveTab } = useContext(TabsContext)!;
  return (
    <button
      className={activeTab === id ? 'active' : ''}
      onClick={() => setActiveTab(id)}
    >
      {children}
    </button>
  );
}

Tabs.Tab = Tab;
Tabs.Panel = TabPanel;

// Usage - Flexible composition
<Tabs>
  <Tabs.Tab id="tab1">First</Tabs.Tab>
  <Tabs.Tab id="tab2">Second</Tabs.Tab>
  <Tabs.Panel id="tab1">Content 1</Tabs.Panel>
  <Tabs.Panel id="tab2">Content 2</Tabs.Panel>
</Tabs>
```

**Use when:** Tightly coupled components (tabs, accordion), need flexible composition, building libraries.  
**Don't use when:** Simple parent-child, no shared state, prop drilling is simple.

---

### Advanced Patterns

**Provider Composition:**
```tsx
function AppProviders({ children }: Props) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <RouterProvider>
          {children}
        </RouterProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
```

**Async Initialization:**
```tsx
function AuthProvider({ children }: Props) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    checkAuth().then(user => { setUser(user); setLoading(false); });
  }, []);
  
  if (loading) return <LoadingScreen />;
  return <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>;
}
```

**Reducer with Immer (XMLUI):**
```tsx
// StateContainer reducer
export function createContainerReducer(debugView: IDebugViewContext) {
  return produce((state: ContainerState, action: ContainerAction) => {
    switch (action.type) {
      case ContainerActionKind.COMPONENT_STATE_CHANGED:
        state[uid] = { ...state[uid], ...action.payload.state };
        break;
    }
  });
}
```

---

## React Performance Optimization Patterns

This section covers React's performance optimization tools and patterns. **Always profile before optimizing**—premature optimization adds complexity without real benefits.

### Core Optimization Hooks

#### `useMemo` - Computation Caching

Cache expensive calculations between renders.

```tsx
const filtered = useMemo(() => 
  items.filter(item => item.includes(filter)), 
  [items, filter]
);
```

**Use when:** Computation is expensive (>10ms), creating objects/arrays for memoized children, or calculations in dependency arrays.  
**Don't use when:** Computation is cheap (<1ms), result used only once, or component rarely re-renders.

#### `useCallback` - Function Caching

Cache function definitions to prevent child re-renders.

```tsx
const handleClick = useCallback(() => {
  doSomething(value);
}, [value]);
```

**Use when:** Passing callbacks to memoized children or to dependency arrays.  
**Don't use when:** Function isn't passed to memoized components or deps arrays.

**Note:** `useCallback(fn, deps)` is equivalent to `useMemo(() => fn, deps)`.

#### `useTransition` - Non-Urgent Updates

Mark state updates as low-priority to keep UI responsive.

```tsx
const [isPending, startTransition] = useTransition();

startTransition(() => {
  setExpensiveState(newValue); // Won't block UI
});
```

**Use when:** Updating expensive state that doesn't need immediate feedback (filtering large lists, complex calculations).

#### `memo` - Component Memoization

Prevent re-renders when props haven't changed.

```tsx
const MemoChild = memo(function MemoChild({ data }: Props) {
  return <div>{data.value}</div>;
});
```

**Use when:** Component renders frequently with same props, has expensive rendering, or is in large lists.  
**Don't use when:** Component rarely re-renders, props change every render, or rendering is cheap.

**Important:** `memo` only works if props are stable. Use `useMemo`/`useCallback` for object/function props.

---

### Memoization Strategy Pattern

**Principle:** `memo` + `useMemo` + `useCallback` work together. `memo` prevents re-renders, but only if props stay stable. Use `useMemo`/`useCallback` to keep props stable.

#### The Memoization Cascade

```tsx
// ❌ ANTI-PATTERN - memo without stable props
const Child = memo(({ data, onClick }: Props) => <div onClick={onClick}>{data.value}</div>);

function Parent() {
  return <Child data={{ value: 123 }} onClick={() => {}} />; // New refs every render!
}

// ✅ CORRECT - memo with stable props
function Parent() {
  const data = useMemo(() => ({ value: 123 }), []);
  const onClick = useCallback(() => console.log('clicked'), []);
  return <Child data={data} onClick={onClick} />;
}
```

#### Decision Tree

1. **Performance problem?** No → Don't optimize. Yes → Step 2.
2. **What's the cause?**
   - Parent re-renders often → Use `memo()` on child
   - Expensive computation → Use `useMemo()` on calculation  
   - New function props → Use `useCallback()` on function
3. **Passing objects/arrays/functions to memoized component?** Yes → Memoize those too.

#### Common Patterns

```tsx
// Pattern 1: Context values
const contextValue = useMemo(() => ({
  state,
  setState,
  isLoading: state.status === 'loading',
}), [state]);

// Pattern 2: Event handlers with deps
const handleSearch = useCallback(() => {
  if (query.length >= minLength) onSearch(query);
}, [query, minLength, onSearch]);

// Pattern 3: Expensive selectors
const filteredData = useMemo(() => {
  return data.filter(item => item.name.includes(filter)).sort((a, b) => a.name.localeCompare(b.name));
}, [data, filter]);

// Pattern 4: Derived state
const summary = useMemo(() => ({
  total: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
  itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
}), [items]);
```

#### Anti-Patterns

```tsx
// ❌ Over-memoization
const greeting = useMemo(() => `Hello, ${name}`, [name]); // Too simple!

// ❌ Incomplete chain
<MemoChild config={{ theme: 'dark' }} />; // New object defeats memo

// ❌ Unstable dependencies
useMemo(() => formatUser(user), [user]); // user object recreated every render
// ✅ Fix: useMemo(() => formatUser(user), [user.id, user.name]);
```

#### Checklist

**✅ DO memoize:**
- Components rendering frequently with same props
- Expensive computations (>10ms)
- Objects/arrays/functions passed to memoized children
- Context values

**❌ DON'T memoize:**
- Cheap operations (<1ms)
- Values that change every render
- Without profiling first

---

### Virtualization Pattern

**Purpose:** Render only visible items in large lists by using "windowing." Instead of rendering 10,000 items, render only ~10 visible items.

**Libraries:** XMLUI uses two based on component needs:
- **virtua** (Tree, List) - Chat interfaces, reverse scrolling, auto-sizing, fixed-size lists
- **@tanstack/react-virtual** (Table) - Dynamic measurements, flexible

**Library Comparison:**

| Feature | virtua | @tanstack/react-virtual |
|---------|--------|------------------------|
| **Bundle Size** | ~6KB | ~4KB |
| **API** | Render props | Hooks |
| **Dynamic heights** | Automatic | Automatic |
| **Reverse scroll** | ✅ Built-in | Manual |
| **Auto-sizing** | ✅ Built-in | Manual |
| **XMLUI Usage** | Tree, List | Table |

**virtua Example (XMLUI List):**

```tsx
import { Virtualizer } from 'virtua';

function ChatList({ messages }: Props) {
  return (
    <Virtualizer count={messages.length}>
      {(index) => {
        const msg = messages[index];
        return (
          <div key={msg.id}>
            <div>{msg.author}</div>
            <div>{msg.content}</div>
          </div>
        );
      }}
    </Virtualizer>
  );
}
```

**@tanstack/react-virtual Example:**

```tsx
import { useVirtualizer } from '@tanstack/react-virtual';

function DataTable({ rows }: Props) {
  const tableRef = useRef<HTMLDivElement>(null);
  
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => tableRef.current,
    estimateSize: () => 30,
    overscan: 5,
  });
  
  return (
    <div ref={tableRef} style={{ height: '400px', overflow: 'auto' }}>
      {rowVirtualizer.getVirtualItems().map((virtualRow) => (
        <div
          key={virtualRow.index}
          ref={(el) => rowVirtualizer.measureElement(el)}
          style={{ transform: `translateY(${virtualRow.start}px)` }}
        >
          {rows[virtualRow.index].content}
        </div>
      ))}
    </div>
  );
}
```

**Critical Rules:**
1. **Memoize row components** - Use `React.memo()`
2. **Apply transform/style** - Required for positioning (@tanstack)
3. **Memoize data** - Prevent row re-renders
4. **Handle scroll container** - Each library handles sizing differently

**Performance Impact:**

| Items | Normal | Virtualized | Improvement |
|-------|--------|-------------|-------------|
| 100 | 50ms | 10ms | 5x faster |
| 1,000 | 500ms | 10ms | 50x faster |
| 10,000 | 5s | 10ms | 500x faster |

**When to Use:**
- ✅ >100 items
- ✅ Uniform item sizes
- ✅ Scrollable datasets
- ❌ <100 items (overhead not worth it)
- ❌ Already paginated
- ❌ Complex/unpredictable heights

---

### Rate Limiting: Debouncing and Throttling

**Purpose:** Control the frequency of expensive operations during high-frequency events (user input, scrolling, resizing).

**Key Difference:**
- **Debouncing**: Wait until activity **stops** (search, autosave)
- **Throttling**: Execute at **regular intervals** during activity (scroll, mousemove)

```tsx
// User types "search" continuously

// DEBOUNCING: Executes ONCE after user stops typing
// Timeline: [type...type...type...STOP] → Execute

// THROTTLING: Executes EVERY 200ms while typing  
// Timeline: Execute → [200ms] → Execute → [200ms] → Execute...
```

#### Debouncing Solutions

**1. useDeferredValue (React 18+) - Recommended**

```tsx
function Search() {
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  
  const results = useMemo(() => {
    if (deferredQuery.length < 2) return [];
    return performSearch(deferredQuery);
  }, [deferredQuery]);
  
  return (
    <>
      <input value={query} onChange={e => setQuery(e.target.value)} />
      <ResultsList results={results} />
    </>
  );
}
```

**2. Custom useDebounce Hook**

```tsx
function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  
  return debouncedValue;
}

// Usage
const debouncedQuery = useDebounce(query, 300);
```

**3. Lodash debounce**

```tsx
const debouncedSave = useMemo(
  () => debounce((text: string) => saveToServer(text), 1000),
  []
);

useEffect(() => {
  return () => debouncedSave.cancel();
}, [debouncedSave]);
```

#### Throttling Solutions

**1. Custom useThrottle Hook**

```tsx
function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 200
): T {
  const lastRun = useRef(Date.now());
  
  return useCallback((...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastRun.current >= delay) {
      lastRun.current = now;
      return callback(...args);
    }
  }, [callback, delay]) as T;
}

// Usage
const handleScroll = useThrottle(() => {
  setScrollPos(window.scrollY);
}, 200);
```

**2. Lodash throttle**

```tsx
const throttledScroll = useMemo(
  () => throttle(() => {
    updateScrollPosition();
  }, 200, {
    leading: true,   // Execute on first call
    trailing: true   // Execute after interval ends
  }),
  []
);

useEffect(() => {
  return () => throttledScroll.cancel();
}, [throttledScroll]);
```

#### XMLUI Examples

**Debounced Search (Search.tsx):**
```tsx
function Search({ data, limit }: Props) {
  const [inputValue, setInputValue] = useState("");
  const debouncedValue = useDeferredValue(inputValue);
  
  const results = useMemo(() => {
    if (debouncedValue.length <= 1) return [];
    return fuse.search(debouncedValue, { limit });
  }, [debouncedValue, limit]);
  
  return (
    <>
      <input value={inputValue} onChange={e => setInputValue(e.target.value)} />
      <SearchResults results={results} />
    </>
  );
}
```

**Throttled Change Listener (ChangeListenerNative.tsx):**
```tsx
function ChangeListener({ listenTo, onChange, throttleWaitInMs = 0 }: Props) {
  const throttledOnChange = useMemo(() => {
    if (throttleWaitInMs !== 0 && onChange) {
      return throttle(onChange, throttleWaitInMs, { leading: true });
    }
    return onChange;
  }, [onChange, throttleWaitInMs]);
  
  useEffect(() => {
    if (throttledOnChange) {
      throttledOnChange({ prevValue, newValue: listenTo });
    }
  }, [listenTo, throttledOnChange]);
}
```

**Async Throttle for Validation (misc.ts):**
```tsx
function asyncThrottle<F extends (...args: any[]) => Promise<any>>(
  func: F,
  wait?: number,
  options?: ThrottleSettings
) {
  const throttled = throttle(
    (resolve, reject, args: Parameters<F>) => {
      void func(...args).then(resolve).catch(reject);
    },
    wait,
    options
  );
  
  return (...args: Parameters<F>): ReturnType<F> =>
    new Promise((resolve, reject) => {
      throttled(resolve, reject, args);
    }) as ReturnType<F>;
}
```

#### Decision Guide

| Scenario | Solution | Timing |
|----------|----------|--------|
| Search input | Debounce | 300ms |
| Form validation | Debounce | 500ms |
| Autosave | Debounce | 1000ms |
| Scroll position | Throttle | 100-200ms |
| Window resize | Throttle | 200-300ms |
| Mouse tracking | Throttle | 50-100ms |
| API rate limiting | Throttle | 500-1000ms |

#### Performance Impact

| Operation | Without | With (300ms) | Improvement |
|-----------|---------|--------------|-------------|
| Search (6 chars typed) | 6 API calls | 1 API call | 83% reduction |
| Scroll (1s) | ~60 events | 5 events | 92% reduction |
| Window resize | ~30 events | 5 events | 83% reduction |

#### Critical Rules

**1. Always memoize** rate-limited functions:
```tsx
// ❌ WRONG - Creates new function every render
const handle = debounce(() => search(), 500);

// ✅ CORRECT - Memoized
const handle = useMemo(() => debounce(() => search(), 500), []);
```

**2. Always cleanup**:
```tsx
useEffect(() => {
  return () => debouncedFn.cancel();
}, [debouncedFn]);
```

**3. Don't rate-limit UI state** - only side effects:
```tsx
// ❌ WRONG - UI lags
const handleChange = debounce((e) => setValue(e.target.value), 300);

// ✅ CORRECT - Immediate UI, debounced side effect
const handleChange = (e) => {
  setValue(e.target.value); // Instant
  debouncedSearch(e.target.value); // Delayed
};
```

**4. Choose appropriate delays**:
- Search: 300ms
- Autosave: 1000ms  
- Scroll/resize: 100-200ms
- Mousemove: 50ms

#### When to Use

**Debouncing:**
- ✅ Search, autosave, validation
- ✅ Wait for user to finish action
- ❌ Don't use for immediate feedback

**Throttling:**
- ✅ Scroll, resize, mousemove
- ✅ Execute during continuous activity
- ❌ Don't use when only final value matters

#### Resources

- [useDeferredValue](https://react.dev/reference/react/useDeferredValue) - React 18 docs
- [lodash.debounce](https://lodash.com/docs/#debounce) - Debounce docs
- [lodash.throttle](https://lodash.com/docs/#throttle) - Throttle docs
- [XMLUI Search](packages/xmlui-search/src/Search.tsx) - Production example

---

## React Event Handling Patterns

Patterns for handling user interactions efficiently and correctly in React applications.

### Event Delegation Pattern

**Purpose:** Handle events for multiple children at parent level instead of attaching handlers to each child.

**Benefits:**
- Fewer event listeners (better memory usage)
- Works with dynamically added/removed children
- Simplifies event handler management

```tsx
// ❌ ANTI-PATTERN - Handler on every item
function List({ items }: Props) {
  return (
    <ul>
      {items.map(item => (
        <li key={item.id} onClick={() => handleClick(item.id)}>
          {item.name}
        </li>
      ))}
    </ul>
  );
}

// ✅ CORRECT - Single handler on parent
function List({ items }: Props) {
  const handleClick = (e: React.MouseEvent<HTMLUListElement>) => {
    const target = e.target as HTMLElement;
    const li = target.closest('li');
    if (li) {
      const itemId = li.dataset.id;
      console.log('Clicked item:', itemId);
    }
  };
  
  return (
    <ul onClick={handleClick}>
      {items.map(item => (
        <li key={item.id} data-id={item.id}>
          {item.name}
        </li>
      ))}
    </ul>
  );
}
```

**XMLUI Example (Tree component):**
```tsx
function Tree({ items }: Props) {
  // Single click handler for entire tree
  const handleTreeClick = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const treeItem = target.closest('[data-tree-item]');
    
    if (treeItem) {
      const itemId = treeItem.getAttribute('data-item-id');
      const action = target.getAttribute('data-action');
      
      if (action === 'expand') {
        toggleExpand(itemId);
      } else if (action === 'select') {
        selectItem(itemId);
      }
    }
  }, [toggleExpand, selectItem]);
  
  return (
    <div className="tree" onClick={handleTreeClick}>
      {renderTreeItems(items)}
    </div>
  );
}
```

**When to use:**
- Lists with many items (>50)
- Dynamic children (added/removed frequently)
- Multiple event types on same children
- Performance-critical rendering

**When NOT to use:**
- Few items (<10) - overhead not worth it
- Need precise event target info
- Event handler logic is complex per-item

---

### Synthetic Event Pattern

**Purpose:** React wraps native browser events in `SyntheticEvent` for cross-browser consistency.

**Key differences from native events:**

| Feature | Native Event | Synthetic Event |
|---------|-------------|-----------------|
| **Type** | Browser-specific | Unified React type |
| **Pooling (React 16)** | No | Yes (reused) |
| **Pooling (React 17+)** | No | No (deprecated) |
| **Properties** | Browser-specific | Normalized |
| **Access after handler** | ✅ Always available | ⚠️ Nullified (React 16 only) |

**Basic usage:**
```tsx
function Input() {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // e is SyntheticEvent, not native Event
    console.log(e.target.value); // ✅ Works
    console.log(e.currentTarget); // ✅ Works
    
    // Access native event if needed
    const nativeEvent = e.nativeEvent;
  };
  
  return <input onChange={handleChange} />;
}
```

**Event pooling (React 16 only):**
```tsx
// ❌ WRONG - Async access (React 16)
function Bad() {
  const handleClick = (e: React.MouseEvent) => {
    setTimeout(() => {
      console.log(e.target); // null in React 16!
    }, 1000);
  };
  return <button onClick={handleClick}>Click</button>;
}

// ✅ CORRECT - Persist event (React 16)
function Good() {
  const handleClick = (e: React.MouseEvent) => {
    e.persist(); // Keep event alive
    setTimeout(() => {
      console.log(e.target); // ✅ Works
    }, 1000);
  };
  return <button onClick={handleClick}>Click</button>;
}

// ✅ BETTER - Extract values (React 16 & 17+)
function Better() {
  const handleClick = (e: React.MouseEvent) => {
    const target = e.target; // Capture immediately
    setTimeout(() => {
      console.log(target); // ✅ Works in all versions
    }, 1000);
  };
  return <button onClick={handleClick}>Click</button>;
}
```

**Note:** React 17+ removed event pooling, so `e.persist()` is no longer needed.

**Common event types:**
```tsx
// Mouse events
const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {};
const handleDoubleClick = (e: React.MouseEvent) => {};

// Keyboard events
const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
  if (e.key === 'Enter') submitForm();
};

// Form events
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {};
const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
};

// Focus events
const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {};
const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {};

// Clipboard events
const handleCopy = (e: React.ClipboardEvent) => {};
const handlePaste = (e: React.ClipboardEvent) => {
  const text = e.clipboardData.getData('text');
};

// Drag events
const handleDragStart = (e: React.DragEvent) => {};
const handleDrop = (e: React.DragEvent) => {
  e.preventDefault();
  const data = e.dataTransfer.getData('text');
};
```

**Accessing native event:**
```tsx
function Component() {
  const handleClick = (e: React.MouseEvent) => {
    // React synthetic event
    console.log(e.currentTarget); // Element handler is attached to
    console.log(e.target); // Element that triggered event
    
    // Native browser event
    const nativeEvent = e.nativeEvent;
    console.log(nativeEvent); // MouseEvent object
  };
  
  return <button onClick={handleClick}>Click</button>;
}
```

---

### Event Callback Composition Pattern

**Purpose:** Combine multiple event handlers into a single handler, useful for library components that accept user callbacks.

**Pattern 1: Sequential execution**
```tsx
function composeHandlers<E>(...handlers: Array<((e: E) => void) | undefined>) {
  return (event: E) => {
    handlers.forEach(handler => {
      if (handler) {
        handler(event);
      }
    });
  };
}

// Usage
function Button({ onClick, onClickInternal }: Props) {
  const handleClick = composeHandlers(onClickInternal, onClick);
  return <button onClick={handleClick}>Click</button>;
}
```

**Pattern 2: Conditional execution (stop on preventDefault)**
```tsx
function composeEventHandlers<E extends React.SyntheticEvent>(
  internalHandler?: (e: E) => void,
  externalHandler?: (e: E) => void
) {
  return (event: E) => {
    internalHandler?.(event);
    
    // If internal handler called preventDefault, stop
    if (!event.defaultPrevented) {
      externalHandler?.(event);
    }
  };
}

// Usage - XMLUI pattern
function Select({ onChange, onDidChange }: Props) {
  const handleInternalChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    // Internal logic (validation, state updates)
    validateValue(e.target.value);
    
    // Prevent external handler if validation fails
    if (!isValid) {
      e.preventDefault();
    }
  };
  
  const handleChange = composeEventHandlers(handleInternalChange, onChange);
  
  return <select onChange={handleChange}>...</select>;
}
```

**Pattern 3: Merge handlers from props**
```tsx
function mergeEventHandlers<T extends React.SyntheticEvent>(
  ours: ((e: T) => void) | undefined,
  theirs: ((e: T) => void) | undefined
): ((e: T) => void) | undefined {
  if (!ours) return theirs;
  if (!theirs) return ours;
  
  return (event: T) => {
    ours(event);
    if (!event.defaultPrevented) {
      theirs(event);
    }
  };
}

// Usage - Wrapper component
function Wrapper({ children, onClick }: Props) {
  const internalClick = (e: React.MouseEvent) => {
    console.log('Wrapper clicked');
  };
  
  return cloneElement(children, {
    onClick: mergeEventHandlers(internalClick, children.props.onClick),
  });
}
```

**XMLUI Example (Container component):**
```tsx
function Container({ children, ...props }: Props, ref: Ref<HTMLElement>) {
  const renderedChild = renderChild(children);
  
  if (ref && renderedChild && isValidElement(renderedChild)) {
    // Merge event handlers from both Container and child
    const mergedProps = {
      ...renderedChild.props,
      onClick: composeEventHandlers(props.onClick, renderedChild.props.onClick),
      onKeyDown: composeEventHandlers(props.onKeyDown, renderedChild.props.onKeyDown),
      ref: composeRefs(ref, (renderedChild as any).ref),
    };
    
    return cloneElement(renderedChild, mergedProps);
  }
  
  return renderedChild;
}
```

**Pattern 4: Callback with additional args**
```tsx
function withArgs<E, T>(
  handler: ((e: E, ...args: T[]) => void) | undefined,
  ...args: T[]
) {
  if (!handler) return undefined;
  
  return (event: E) => {
    handler(event, ...args);
  };
}

// Usage
function List({ items, onItemClick }: Props) {
  return (
    <ul>
      {items.map(item => (
        <li key={item.id} onClick={withArgs(onItemClick, item.id)}>
          {item.name}
        </li>
      ))}
    </ul>
  );
}
```

**When to compose handlers:**
- Building reusable component libraries
- Wrapper components that add behavior
- Components with internal + external handlers
- Need to call parent handler conditionally

**Best practices:**
- Always check if handler exists before calling
- Respect `preventDefault()` and `stopPropagation()`
- Execute internal handlers first
- Document composition order clearly

---

## React Lifecycle and Effect Patterns

Patterns for managing side effects, synchronization, and component lifecycle in React applications.

### `useEffect` - Side Effects and Lifecycle

**Purpose:** Run side effects after render (data fetching, subscriptions, DOM manipulation).

**Syntax:** `useEffect(() => { /* effect */ return () => { /* cleanup */ } }, [dependencies])`

**Basic usage:**
```tsx
function UserProfile({ userId }: Props) {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    // Effect runs after render
    fetch(`/api/users/${userId}`)
      .then(res => res.json())
      .then(data => setUser(data));
  }, [userId]); // Re-run when userId changes
  
  return <div>{user?.name}</div>;
}
```

**With async/await:**
```tsx
useEffect(() => {
  // Can't make callback async directly, use IIFE
  (async () => {
    const res = await fetch(`/api/users/${userId}`);
    const data = await res.json();
    setUser(data);
  })();
}, [userId]);
```

**Use when:** Data fetching, subscriptions, event listeners, DOM manipulation, integrating with non-React libraries.  
**Avoid when:** Computing derived values (use `useMemo`), handling events (use handlers), initializing state (use initializer).

---

### Effect Cleanup Pattern

**Purpose:** Properly clean up subscriptions, timers, and event listeners to prevent memory leaks.

**Pattern: Always return cleanup function for subscriptions**
```tsx
function Chat({ roomId }: Props) {
  useEffect(() => {
    const connection = createConnection(roomId);
    connection.connect();
    
    // ✅ Cleanup runs before next effect and on unmount
    return () => {
      connection.disconnect();
    };
  }, [roomId]);
  
  return <div>Connected to {roomId}</div>;
}
```

**Pattern: Cancel async operations**
```tsx
function DataComponent({ url }: Props) {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    let cancelled = false;
    
    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (!cancelled) setData(data);
      });
    
    // ✅ Prevent state updates after unmount
    return () => { cancelled = true; };
  }, [url]);
  
  return <div>{JSON.stringify(data)}</div>;
}
```

**Pattern: Remove event listeners**
```tsx
function WindowSize() {
  const [size, setSize] = useState({ width: 0, height: 0 });
  
  useEffect(() => {
    const handleResize = () => {
      setSize({ width: window.innerWidth, height: window.innerHeight });
    };
    
    window.addEventListener('resize', handleResize);
    handleResize(); // Initial size
    
    // ✅ Always remove listeners
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return <div>{size.width} x {size.height}</div>;
}
```

**Pattern: Clear timers and intervals**
```tsx
function Timer() {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCount(c => c + 1);
    }, 1000);
    
    // ✅ Clear interval on unmount
    return () => clearInterval(interval);
  }, []);
  
  return <div>{count}s</div>;
}
```

**Pattern: Unsubscribe from external stores**
```tsx
function ExternalStore({ store }: Props) {
  const [value, setValue] = useState(store.getValue());
  
  useEffect(() => {
    const unsubscribe = store.subscribe(newValue => {
      setValue(newValue);
    });
    
    // ✅ Unsubscribe when component unmounts
    return unsubscribe;
  }, [store]);
  
  return <div>{value}</div>;
}
```

**Critical rules:**
- Return cleanup for subscriptions, listeners, timers
- Use cancellation flags for async operations
- Cleanup runs before next effect and on unmount
- Don't forget to remove event listeners

---

### Effect Dependencies Pattern

**Purpose:** Correctly manage dependency arrays to avoid stale closures and unnecessary re-runs.

**Anti-pattern: Missing dependencies (stale closure bug)**
```tsx
// ❌ WRONG - Stale closure
function Counter() {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    setInterval(() => {
      console.log(count); // Always logs 0!
    }, 1000);
  }, []); // Missing count
  
  return <button onClick={() => setCount(count + 1)}>Increment</button>;
}

// ✅ CORRECT - Use functional update
useEffect(() => {
  setInterval(() => {
    setCount(c => c + 1); // Uses latest value
  }, 1000);
}, []); // No dependencies needed
```

**Anti-pattern: Object/array in dependencies**
```tsx
// ❌ WRONG - Object recreated every render
function Component({ config }: Props) {
  useEffect(() => {
    fetchData(config);
  }, [config]); // Runs every render if config is new object
}

// ✅ CORRECT - Destructure primitive values
useEffect(() => {
  fetchData(config);
}, [config.id, config.filter]); // Only re-run when these change
```

**Pattern: Empty array = run once on mount**
```tsx
useEffect(() => {
  // Initialization logic
  initializeApp();
  
  return () => {
    // Cleanup on unmount
    cleanupApp();
  };
}, []); // Runs once on mount, cleanup on unmount
```

**Pattern: No array = run after every render**
```tsx
useEffect(() => {
  // Runs after every render (rarely needed)
  updateDocumentTitle(`Page - ${count}`);
}); // No dependency array
```

**Pattern: Avoid callback dependencies with useRef**
```tsx
function Component({ callback }: Props) {
  const callbackRef = useRef(callback);
  
  // Keep ref updated
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);
  
  useEffect(() => {
    const interval = setInterval(() => {
      // ✅ Always uses latest callback
      callbackRef.current();
    }, 1000);
    
    return () => clearInterval(interval);
  }, []); // No callback in deps
}
```

**Common mistakes:**
```tsx
// ❌ Wrong - Missing dependencies
useEffect(() => {
  doSomething(prop); // prop not in deps
}, []);

// ❌ Wrong - Object identity
useEffect(() => {
  fetchData(user);
}, [user]); // user object changes every render

// ❌ Wrong - Function identity
useEffect(() => {
  callback();
}, [callback]); // callback recreated every render

// ✅ Correct - Destructure objects
useEffect(() => {
  fetchData({ id: user.id, name: user.name });
}, [user.id, user.name]);

// ✅ Correct - Memoize callbacks
const memoizedCallback = useCallback(callback, [dep]);
useEffect(() => {
  memoizedCallback();
}, [memoizedCallback]);
```

**ESLint rule:** Always enable `react-hooks/exhaustive-deps` to catch dependency issues.

---

### Layout Effect Pattern

**Purpose:** Run effects synchronously after DOM mutations but before browser paint to prevent visual flickering.

**When to use `useLayoutEffect`:**

**Pattern: DOM measurements before paint**
```tsx
function Tooltip() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const ref = useRef<HTMLDivElement>(null);
  
  // ✅ CORRECT - Measure before paint
  useLayoutEffect(() => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setPosition({
        x: rect.left + rect.width / 2,
        y: rect.top - 10,
      });
    }
  }, []);
  
  return <div ref={ref} style={{ left: position.x, top: position.y }}>Tooltip</div>;
}

// ❌ WRONG - useEffect causes visible flicker
useEffect(() => {
  // DOM measurements happen AFTER paint
  // User sees element jump from old to new position
}, []);
```

**Pattern: Synchronize scroll position**
```tsx
function ScrollSync({ targetRef }: Props) {
  useLayoutEffect(() => {
    if (targetRef.current) {
      // ✅ Scroll before paint, no flicker
      targetRef.current.scrollTop = savedPosition;
    }
  }, [targetRef, savedPosition]);
}
```

**Pattern: Prevent layout shift**
```tsx
function AutoResizeTextarea({ value }: Props) {
  const ref = useRef<HTMLTextAreaElement>(null);
  
  useLayoutEffect(() => {
    if (ref.current) {
      // ✅ Adjust height before paint
      ref.current.style.height = 'auto';
      ref.current.style.height = `${ref.current.scrollHeight}px`;
    }
  }, [value]);
  
  return <textarea ref={ref} value={value} />;
}
```

**Pattern: Third-party DOM library integration**
```tsx
function Chart({ data }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useLayoutEffect(() => {
    if (containerRef.current) {
      // ✅ Initialize library before paint
      const chart = new ChartLibrary(containerRef.current);
      chart.render(data);
      
      return () => chart.destroy();
    }
  }, [data]);
  
  return <div ref={containerRef} />;
}
```

**Comparison: useEffect vs useLayoutEffect**

| Aspect | `useEffect` | `useLayoutEffect` |
|--------|------------|-------------------|
| **Timing** | After paint (async) | Before paint (sync) |
| **Blocks rendering** | ❌ No | ✅ Yes |
| **Use for** | Data fetching, subscriptions | DOM measurements, preventing flicker |
| **Performance** | Better (non-blocking) | Worse (blocks paint) |
| **SSR** | ✅ Works | ⚠️ Warning (no DOM on server) |

**When to use each:**
- **useEffect**: 99% of cases - data fetching, subscriptions, analytics
- **useLayoutEffect**: DOM measurements, scroll sync, preventing visual flicker

**Warning:** `useLayoutEffect` blocks visual updates. Only use when you need synchronous DOM access before paint.

**SSR consideration:**
```tsx
// ⚠️ useLayoutEffect doesn't run on server
useLayoutEffect(() => {
  // This code only runs in browser
  measureDOM();
}, []);

// ✅ Better: Use useEffect for SSR-compatible code
useEffect(() => {
  measureDOM();
}, []);
```

---

### Insertion Effect Pattern

**Purpose:** Insert styles into DOM before layout effects run. Used by CSS-in-JS libraries.

**Syntax:** `useInsertionEffect(() => { /* insert styles */ }, [dependencies])`

**Effect execution order:**
1. `useInsertionEffect` - Insert styles
2. `useLayoutEffect` - Measure layout (reads styles)
3. Browser paints
4. `useEffect` - Other side effects

**Pattern: CSS-in-JS style injection**
```tsx
function useCSS(rule: string) {
  useInsertionEffect(() => {
    // ✅ Inject styles before layout reads
    const style = document.createElement('style');
    style.textContent = rule;
    document.head.appendChild(style);
    
    return () => document.head.removeChild(style);
  }, [rule]);
}

// Usage
function Button({ color }: Props) {
  useCSS(`
    .button-${color} {
      background: ${color};
      border: 1px solid ${darken(color)};
    }
  `);
  
  return <button className={`button-${color}`}>Click</button>;
}
```

**Pattern: Dynamic theme injection (XMLUI)**
```tsx
function ThemeProvider({ theme, children }: Props) {
  useInsertionEffect(() => {
    // ✅ Insert theme CSS before components measure
    const styleElement = document.createElement('style');
    styleElement.id = 'theme-styles';
    styleElement.textContent = generateThemeCSS(theme);
    document.head.appendChild(styleElement);
    
    return () => {
      document.getElementById('theme-styles')?.remove();
    };
  }, [theme]);
  
  return children;
}
```

**Pattern: Critical CSS injection**
```tsx
function useCriticalCSS(css: string) {
  useInsertionEffect(() => {
    // ✅ Inject before any layout calculations
    const style = document.createElement('style');
    style.setAttribute('data-critical', 'true');
    style.textContent = css;
    document.head.insertBefore(style, document.head.firstChild);
    
    return () => style.remove();
  }, [css]);
}
```

**When to use:**
- Building CSS-in-JS libraries
- Dynamic style generation
- Theme system implementation
- Critical CSS injection

**When NOT to use:**
- Regular application code (use `useEffect`)
- Static stylesheets (use `<link>` tags)
- Non-style DOM manipulation

**Note:** Rarely used directly in application code. Primarily for library authors. XMLUI uses this in `StyleContext` for theme style injection.

**Comparison with other effects:**

```tsx
// ❌ WRONG - useEffect runs too late
useEffect(() => {
  injectStyles(); // Styles added after layout measured
}, []);

// ❌ WRONG - useLayoutEffect causes double layout
useLayoutEffect(() => {
  injectStyles(); // Layout measured, then styles added, then re-measured
}, []);

// ✅ CORRECT - useInsertionEffect runs first
useInsertionEffect(() => {
  injectStyles(); // Styles ready before any layout measurement
}, []);
```

---

### Effect Best Practices Summary

**1. Always clean up:**
```tsx
useEffect(() => {
  const subscription = subscribe();
  return () => subscription.unsubscribe(); // ✅ Cleanup
}, []);
```

**2. Handle dependencies correctly:**
```tsx
// ✅ Include all dependencies
useEffect(() => {
  doSomething(prop, state);
}, [prop, state]);

// ✅ Or use functional updates
useEffect(() => {
  setState(prev => prev + 1);
}, []); // No state dependency needed
```

**3. Choose the right effect hook:**
- `useEffect` - Default choice (async, after paint)
- `useLayoutEffect` - DOM measurements, prevent flicker (sync, before paint)
- `useInsertionEffect` - CSS-in-JS only (before layout)

**4. Avoid common pitfalls:**
```tsx
// ❌ Don't use objects in deps
useEffect(() => {}, [config]); // Runs every render

// ✅ Destructure primitive values
useEffect(() => {}, [config.id, config.name]);

// ❌ Don't make effect callback async
useEffect(async () => {}, []); // Type error

// ✅ Use IIFE for async
useEffect(() => {
  (async () => await fetch())();
}, []);
```

**5. Profile before optimizing:**
- Most effects are cheap
- Don't prematurely optimize with `useLayoutEffect`
- Measure actual performance impact

---

## `useRef` - Persistent Mutable References

**Purpose:** Store mutable values that persist across renders without triggering re-renders.

**Syntax:** `const ref = useRef(initialValue)`

### DOM References

```tsx
function TextInput() {
  const inputRef = useRef<HTMLInputElement>(null);
  
  const focusInput = () => {
    inputRef.current?.focus();
  };
  
  return (
    <div>
      <input ref={inputRef} />
      <button onClick={focusInput}>Focus</button>
    </div>
  );
}
```

### Storing Mutable Values

```tsx
function Timer() {
  const [count, setCount] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout>();
  
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setCount(c => c + 1);
    }, 1000);
    
    return () => clearInterval(intervalRef.current);
  }, []);
  
  const stop = () => {
    clearInterval(intervalRef.current);
  };
  
  return (
    <div>
      {count} seconds
      <button onClick={stop}>Stop</button>
    </div>
  );
}
```

### Avoiding Stale Closures

```tsx
function Component({ callback }: Props) {
  const callbackRef = useRef(callback);
  
  // Keep ref updated with latest callback
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);
  
  useEffect(() => {
    const interval = setInterval(() => {
      // Always uses latest callback
      callbackRef.current();
    }, 1000);
    
    return () => clearInterval(interval);
  }, []); // No callback dependency needed
  
  return <div>Running...</div>;
}
```

### Common Patterns in XMLUI

**Previous Value Tracking:**
```tsx
function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();
  
  useEffect(() => {
    ref.current = value;
  }, [value]);
  
  return ref.current;
}

function Component({ count }: Props) {
  const prevCount = usePrevious(count);
  
  return <div>Now: {count}, Before: {prevCount}</div>;
}
```

### Key Differences: useState vs useRef

| Feature | `useState` | `useRef` |
|---------|-----------|---------|
| Triggers re-render | ✅ Yes | ❌ No |
| Persists across renders | ✅ Yes | ✅ Yes |
| Use for UI state | ✅ Yes | ❌ No |
| Use for DOM access | ❌ No | ✅ Yes |
| Use for mutable timers/intervals | ❌ No | ✅ Yes |

---

## `useId` - Unique ID Generation

**Purpose:** Generate stable unique IDs for accessibility attributes.

**Syntax:** `const id = useId()`

### Basic Usage

```tsx
function FormField({ label }: Props) {
  const id = useId();
  
  return (
    <div>
      <label htmlFor={id}>{label}</label>
      <input id={id} />
    </div>
  );
}
```

### Multiple IDs

```tsx
function ComplexForm() {
  const id = useId();
  
  return (
    <div>
      <label htmlFor={`${id}-name`}>Name</label>
      <input id={`${id}-name`} aria-describedby={`${id}-name-hint`} />
      <span id={`${id}-name-hint`}>Enter your full name</span>
      
      <label htmlFor={`${id}-email`}>Email</label>
      <input id={`${id}-email`} />
    </div>
  );
}
```

**Why not just use a counter?** `useId` generates IDs that are stable across server and client rendering, preventing hydration mismatches.

---

## `forwardRef` - Ref Forwarding to Child Components

**Purpose:** Allow parent components to access DOM nodes or component instances of child components by forwarding refs through component boundaries.

**Syntax:** `const Component = forwardRef((props, ref) => { ... })`

### Basic Usage

```tsx
const TextInput = forwardRef<HTMLInputElement, Props>(
  function TextInput({ label, ...props }, forwardedRef) {
    return (
      <div>
        <label>{label}</label>
        <input ref={forwardedRef} {...props} />
      </div>
    );
  }
);

// Parent can now access the input element
function Form() {
  const inputRef = useRef<HTMLInputElement>(null);
  
  const focusInput = () => {
    inputRef.current?.focus();
  };
  
  return (
    <div>
      <TextInput ref={inputRef} label="Name" />
      <button onClick={focusInput}>Focus Input</button>
    </div>
  );
}
```

### TypeScript Generic Syntax

```tsx
// Explicitly type both the ref and props
const Component = forwardRef<RefType, PropsType>(
  function Component(props, ref) {
    return <div ref={ref}>...</div>;
  }
);

// Example with HTMLDivElement
const Card = forwardRef<HTMLDivElement, CardProps>(
  function Card({ children, className }, ref) {
    return (
      <div ref={ref} className={className}>
        {children}
      </div>
    );
  }
);
```

**Why explicit typing matters:**

Without generic syntax, TypeScript infers types from the function signature, which can lead to several issues:

```tsx
// ❌ WRONG - Without explicit generics
const Input = forwardRef(function Input(props: Props, ref) {
  // TypeScript infers ref as: ForwardedRef<unknown>
  // This means:
  // 1. No autocomplete for ref.current properties
  // 2. No type checking when assigning ref to JSX elements
  // 3. Parent components can pass wrong ref type without errors
  return <input ref={ref} />; // Type error: ref might not be compatible!
});

// Usage - TypeScript won't catch this error:
const divRef = useRef<HTMLDivElement>(null);
<Input ref={divRef} /> // Should error but doesn't - expecting HTMLInputElement!

// ✅ CORRECT - With explicit generics
const Input = forwardRef<HTMLInputElement, Props>(
  function Input(props, ref) {
    // TypeScript knows ref is: ForwardedRef<HTMLInputElement>
    // Benefits:
    // 1. Autocomplete works: ref.current?.focus()
    // 2. Type checking ensures ref matches JSX element
    // 3. Parent must pass correct ref type
    return <input ref={ref} />; // Type safe!
  }
);

// Usage - TypeScript catches the error:
const divRef = useRef<HTMLDivElement>(null);
<Input ref={divRef} /> // ❌ Type error: expected RefObject<HTMLInputElement>
```

**Key problems without explicit generics:**
1. **Loss of type safety** - Parent can pass incompatible ref types
2. **No IntelliSense** - No autocomplete for `ref.current` properties
3. **Runtime errors** - Type mismatches only discovered at runtime
4. **Harder refactoring** - Changes to ref type don't propagate to consumers

**Best practice:** Always specify both generic parameters explicitly in XMLUI components.

### Composing Multiple Refs

**The Problem:** Components often need to manage multiple refs pointing to the same DOM element:
1. **Internal ref** - Component's own logic (measurements, animations, focus)
2. **Forwarded ref** - Parent needs access to the DOM element
3. **Third-party refs** - Integration with libraries (Popper, Radix UI, etc.)

**The Solution:** Use `composeRefs` from `@radix-ui/react-compose-refs` to merge multiple refs into one.

**Why you need to compose refs:**

| Use Case | Example | Reason |
|----------|---------|--------|
| **Internal logic + parent access** | Auto-resize textarea | Component measures scrollHeight, parent needs focus() |
| **Library integration** | Popover/Tooltip | Popper needs ref for positioning, parent needs ref for control |
| **Wrapper components** | Container with single child | Parent ref applies to child, child has own ref |
| **Multiple behaviors** | Draggable element | Drag library needs ref, resize observer needs ref, parent needs ref |

**Key differences: Inner vs Forwarded refs:**

| Aspect | Inner Ref | Forwarded Ref |
|--------|-----------|---------------|
| **Created by** | Component itself with `useRef()` | Parent component |
| **Purpose** | Internal component logic | Parent needs DOM access |
| **Type** | Always `RefObject<T>` | Can be `RefObject<T>`, `RefCallback<T>`, or `null` |
| **Guaranteed to exist** | Yes - always has `.current` property | No - parent might not pass a ref |
| **When to use** | Component needs DOM access for its own behavior | Expose DOM element to parent |

**Example 1: Internal + Forwarded (most common in XMLUI):**

```tsx
import { composeRefs } from "@radix-ui/react-compose-refs";

function TextArea({ value, onChange }: Props, forwardedRef: Ref<HTMLTextAreaElement>) {
  // Inner ref: Component creates and owns this for auto-resize logic
  const innerRef = useRef<HTMLTextAreaElement>(null);
  
  // Compose both refs - textarea element needs both
  const composedRef = forwardedRef 
    ? composeRefs(innerRef, forwardedRef) 
    : innerRef;
  
  useEffect(() => {
    // ✅ CORRECT: Use innerRef for internal logic
    // It's guaranteed to exist and have .current property
    if (innerRef.current) {
      innerRef.current.style.height = 'auto';
      innerRef.current.style.height = `${innerRef.current.scrollHeight}px`;
    }
    
    // ❌ WRONG: Don't use forwardedRef directly
    // if (forwardedRef?.current) { ... } // Type error: Ref<T> might be a callback!
  }, [value]);
  
  return <textarea ref={composedRef} value={value} onChange={onChange} />;
}

export const AutoResizeTextArea = forwardRef(TextArea);

// Parent usage:
function Form() {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const focusTextarea = () => {
    textareaRef.current?.focus(); // Parent can access via forwarded ref
  };
  
  return <AutoResizeTextArea ref={textareaRef} />; // Component auto-resizes via inner ref
}
```

**Example 2: Library Integration (Popper + Forwarded):**

```tsx
function Select({ options }: Props, forwardedRef: Ref<HTMLButtonElement>) {
  // Popper library needs a ref for positioning
  const [referenceElement, setReferenceElement] = useState<HTMLButtonElement | null>(null);
  
  // Compose library ref setter with forwarded ref
  const composedRef = forwardedRef 
    ? composeRefs(setReferenceElement, forwardedRef) 
    : setReferenceElement;
  
  return (
    <>
      <button ref={composedRef}>Select</button>
      <Popper referenceElement={referenceElement}>
        {/* Dropdown content */}
      </Popper>
    </>
  );
}

export const SelectComponent = forwardRef(Select);
```

**Example 3: Wrapper Component (Parent + Child refs):**

```tsx
function Container({ children }: Props, ref: Ref<HTMLElement>) {
  const renderedChild = renderChild(children);
  
  // If single child, compose parent's ref with child's existing ref
  if (isValidElement(renderedChild)) {
    return cloneElement(renderedChild, {
      ref: composeRefs(ref, (renderedChild as any).ref),
    });
  }
  
  return renderedChild;
}

export const ContainerComponent = forwardRef(Container);
```

**Example 4: Multiple Behaviors (Drag + Resize + Forward):**

```tsx
function DraggablePanel(props: Props, forwardedRef: Ref<HTMLDivElement>) {
  const dragRef = useRef<HTMLDivElement>(null);
  const resizeObserverRef = useRef<HTMLDivElement>(null);
  
  // Compose all three refs
  const composedRef = composeRefs(
    dragRef,
    resizeObserverRef,
    forwardedRef || null
  );
  
  useDragLogic(dragRef);
  useResizeObserver(resizeObserverRef);
  
  return <div ref={composedRef}>Draggable and resizable</div>;
}
```

**When to compose refs:**
- Component needs internal ref AND parent needs access
- Integrating with libraries that require refs (Popper, React DnD, etc.)
- Wrapping components that need to forward refs to children
- Multiple hooks/effects need refs to the same element

**How `composeRefs` works:**
- Accepts multiple refs (RefObjects, callbacks, or null)
- Returns a single callback ref that updates all provided refs
- Handles both RefObject (sets `.current`) and callback refs (calls function)
- Safely ignores `null`/`undefined` refs

### When to Use forwardRef

**Use `forwardRef` when:**
- Building reusable components that wrap DOM elements
- Parent needs direct DOM access (focus, scroll, measurements)
- Integrating with third-party libraries requiring refs
- Creating form components that need imperative control

**Don't use `forwardRef` when:**
- Component doesn't wrap a single DOM element
- Refs aren't needed by parent components
- You can solve the problem with callbacks/props instead

### Common Mistakes

```tsx
// ❌ WRONG - Forgetting to attach ref to DOM element
const Bad = forwardRef((props, ref) => {
  return <div>{props.children}</div>; // ref is ignored!
});

// ✅ CORRECT - Always attach ref to actual DOM element
const Good = forwardRef((props, ref) => {
  return <div ref={ref}>{props.children}</div>;
});

// ❌ WRONG - Attaching ref to component (won't work)
const AlsoBad = forwardRef((props, ref) => {
  return <CustomComponent ref={ref} />; // CustomComponent must also use forwardRef
});

// ✅ CORRECT - Forward through nested components
const CustomComponent = forwardRef((props, ref) => {
  return <div ref={ref}>...</div>;
});

const AlsoGood = forwardRef((props, ref) => {
  return <CustomComponent ref={ref} />; // Works because CustomComponent forwards
});
```

---

## `createPortal` - Render Outside Hierarchy

**Purpose:** Render children into a DOM node outside the parent component's hierarchy.

**Syntax:** `createPortal(children, domNode, key?)`

### Basic Usage

```tsx
import { createPortal } from 'react-dom';

function Modal({ isOpen, children }: Props) {
  if (!isOpen) return null;
  
  // Render into document.body instead of parent component
  return createPortal(
    <div className="modal-overlay">
      <div className="modal-content">
        {children}
      </div>
    </div>,
    document.body
  );
}

// Usage
function App() {
  return (
    <div className="app">
      <Modal isOpen={true}>
        <h1>This renders in document.body, not .app!</h1>
      </Modal>
    </div>
  );
}
```

### Common Use Cases

**1. Tooltips/Popovers (avoid z-index issues):**
```tsx
function Tooltip({ targetRef, content }: Props) {
  return createPortal(
    <div className="tooltip" style={calculatePosition(targetRef)}>
      {content}
    </div>,
    document.body
  );
}
```

**2. Notifications/Toasts:**
```tsx
function NotificationToast() {
  const [shouldRender, setShouldRender] = useState(false);
  
  useEffect(() => {
    setShouldRender(true);
  }, []);
  
  if (!shouldRender) return null;
  
  return createPortal(
    <Toaster position="top-right">
      {(t) => <ToastBar toast={t} />}
    </Toaster>,
    document.body
  );
}
```

**3. Modal Dialogs:**
```tsx
function ModalDialog({ isOpen, children }: Props) {
  if (!isOpen) return null;
  
  return createPortal(
    <div className="modal-backdrop">
      <div className="modal-dialog">
        {children}
      </div>
    </div>,
    document.getElementById('modal-root') || document.body
  );
}
```

**4. Full-Screen Overlays:**
```tsx
function FullScreenOverlay({ show, children }: Props) {
  if (!show) return null;
  
  return createPortal(
    <div className="fullscreen-overlay">
      {children}
    </div>,
    document.body
  );
}
```

### Event Bubbling Still Works

```tsx
// Event bubbling works despite DOM hierarchy
function Parent() {
  const handleClick = () => {
    console.log('Clicked!'); // This fires even though button is portaled
  };
  
  return (
    <div onClick={handleClick}>
      <PortaledButton />
    </div>
  );
}

function PortaledButton() {
  return createPortal(
    <button>Click me</button>,
    document.body
  );
}
```

### Common Pattern in XMLUI

```tsx
// App component portals theme styles
function App({ children }: Props) {
  return (
    <>
      {children}
      {createPortal(
        <style>{themeCSS}</style>,
        document.head
      )}
    </>
  );
}

// Inspector portals debugging UI
function Inspector() {
  return createPortal(
    <div className="inspector-panel">
      {/* Debug tools */}
    </div>,
    document.body
  );
}
```

### When to Use createPortal

**Use `createPortal` when:**
- Modals, dialogs, and overlays
- Tooltips and popovers
- Notifications and toasts
- Avoiding parent overflow/z-index issues
- Rendering into different parts of DOM (head, body)

**Don't use when:**
- Normal component rendering is sufficient
- No CSS stacking or overflow issues
- Adds unnecessary complexity

---

## `Fragment` - Grouping Without DOM Nodes

**Purpose:** Group multiple elements without adding extra nodes to the DOM.

**Syntax:** `<Fragment>...</Fragment>` or `<>...</>`

### Basic Usage

```tsx
// ❌ WRONG - Adds unnecessary div wrapper
function List() {
  return (
    <div>
      <li>Item 1</li>
      <li>Item 2</li>
    </div>
  );
}

// ✅ CORRECT - No extra DOM node
function List() {
  return (
    <>
      <li>Item 1</li>
      <li>Item 2</li>
    </>
  );
}
```

### Short vs Long Syntax

```tsx
// Short syntax <> - Use for most cases
function Component() {
  return (
    <>
      <Header />
      <Content />
    </>
  );
}

// Long syntax <Fragment> - Required when you need a key
function List({ items }: Props) {
  return (
    <ul>
      {items.map(item => (
        <Fragment key={item.id}>
          <li>{item.name}</li>
          <li>{item.description}</li>
        </Fragment>
      ))}
    </ul>
  );
}
```

**Limitations of short syntax:**
- ❌ Cannot add `key` prop (use `<Fragment key={...}>` instead)
- ❌ Cannot add any other props (only `key` is allowed on Fragment)
- ✅ Use short syntax everywhere else (cleaner, less verbose)

### Common Use Cases

**1. Returning Multiple Elements:**
```tsx
function Header() {
  return (
    <>
      <h1>Title</h1>
      <nav>Navigation</nav>
    </>
  );
}
```

**2. Conditional Rendering:**
```tsx
function Component({ showExtra }: Props) {
  return (
    <div>
      <h1>Always shown</h1>
      {showExtra && (
        <>
          <p>Extra content</p>
          <button>Extra button</button>
        </>
      )}
    </div>
  );
}
```

**3. Table Rows:**
```tsx
function TableRows({ data }: Props) {
  return (
    <>
      {data.map(row => (
        <Fragment key={row.id}>
          <tr>
            <td>{row.name}</td>
            <td>{row.value}</td>
          </tr>
          {row.hasDetails && (
            <tr>
              <td colSpan={2}>{row.details}</td>
            </tr>
          )}
        </Fragment>
      ))}
    </>
  );
}
```

**4. Avoiding Invalid HTML:**
```tsx
// ❌ WRONG - div inside p is invalid HTML
function Text() {
  return (
    <p>
      <div>This is invalid!</div>
    </p>
  );
}

// ✅ CORRECT - Fragment doesn't create DOM node
function Text() {
  return (
    <p>
      <>
        <span>This is valid!</span>
      </>
    </p>
  );
}
```

### When to Use Fragment

**Use `Fragment` when:**
- Component must return multiple elements
- Avoiding wrapper divs that break CSS (flexbox, grid)
- Keeping HTML semantically valid
- Conditional rendering of multiple elements

**Don't use when:**
- Single element (no need to wrap)
- Wrapper div doesn't cause issues
- Need to attach events or refs (Fragment can't have them)

---

## `cloneElement` - Clone and Modify React Elements

**Purpose:** Clone a React element and override its props, refs, or children.

**Syntax:** `cloneElement(element, props?, ...children?)`

### Basic Usage

```tsx
import { cloneElement, isValidElement } from 'react';

function Container({ children }: Props) {
  if (!isValidElement(children)) {
    return children;
  }
  
  // Clone child and add extra props
  return cloneElement(children, {
    className: 'container-child',
    style: { padding: '10px' },
  });
}

// Usage
<Container>
  <div>Original</div> {/* Becomes <div className="container-child" style={{padding: '10px'}}>Original</div> */}
</Container>
```

### Adding Props to Children

```tsx
function Animation({ children, duration = 300 }: Props) {
  if (!isValidElement(children)) {
    return children;
  }
  
  // Add animation props to child
  return cloneElement(children, {
    style: {
      ...children.props.style,
      transition: `all ${duration}ms`,
    },
  });
}
```

### Forwarding Refs Through Clone

```tsx
function Wrapper({ children, ...rest }: Props, forwardedRef: Ref<any>) {
  if (!isValidElement(children)) {
    return children;
  }
  
  // Clone and forward ref + other props
  return cloneElement(children, {
    ...rest,
    ref: forwardedRef,
  });
}

export const WrapperComponent = forwardRef(Wrapper);
```

### Common Pattern in XMLUI

**Container with single child ref forwarding:**
```tsx
function Container({ children }: Props, ref: Ref<HTMLElement>) {
  const renderedChild = renderChild(children);
  
  // If single valid child, compose refs and merge props
  if (ref && renderedChild && isValidElement(renderedChild)) {
    return cloneElement(renderedChild, {
      ref: composeRefs(ref, (renderedChild as any).ref),
      ...mergeProps(renderedChild.props, rest),
    });
  }
  
  return renderedChild;
}
```

**Form field with label integration:**
```tsx
function ItemWithLabel({ children, label }: Props) {
  const id = useId();
  
  return (
    <div>
      <label htmlFor={id}>{label}</label>
      {cloneElement(children as ReactElement, {
        id,
        'aria-labelledby': id,
      })}
    </div>
  );
}
```

### When to Use cloneElement

**Use `cloneElement` when:**
- Wrapping components need to add props to children
- Forwarding refs through wrapper components
- Adding common behavior to arbitrary children
- Integrating with child elements you don't control

**Don't use when:**
- You can pass props directly (prefer explicit props)
- You need to modify deeply nested children (use context instead)
- Children are not React elements (check with `isValidElement` first)

### Common Mistakes

```tsx
// ❌ WRONG - Not checking if child is valid element
function Bad({ children }: Props) {
  return cloneElement(children, { className: 'bad' }); // Crashes if children is string/number
}

// ✅ CORRECT - Always validate first (see isValidElement section)
function Good({ children }: Props) {
  if (!isValidElement(children)) {
    return children;
  }
  return cloneElement(children, { className: 'good' });
}

// ❌ WRONG - Overriding all existing props
return cloneElement(child, { style: { color: 'red' } }); // Loses child's existing style

// ✅ CORRECT - Merge with existing props
return cloneElement(child, {
  style: { ...child.props.style, color: 'red' },
});
```

---

## `isValidElement` - Type Check for React Elements

**Purpose:** Check if a value is a valid React element (created with JSX or `createElement`). Always use before `cloneElement`.

**Syntax:** `isValidElement(value)`

### Basic Usage

```tsx
import { isValidElement } from 'react';

function processChild(child: React.ReactNode) {
  // child could be anything: string, number, element, array, etc.
  
  if (isValidElement(child)) {
    // TypeScript now knows child is ReactElement
    console.log(child.props); // ✅ OK - access props safely
    console.log(child.type);  // ✅ OK - access type safely
    return child;
  }
  
  // Not an element - return as is
  return child;
}
```

### Common Pattern in XMLUI

**Conditional element wrapping:**
```tsx
function ConditionalWrapper({ condition, children }: Props) {
  if (!condition) {
    return children;
  }
  
  // Only wrap if child is valid element
  return isValidElement(children) 
    ? <div className="wrapper">{children}</div>
    : children;
}
```

### What isValidElement Checks

```tsx
isValidElement(<div />);              // ✅ true - JSX element
isValidElement(React.createElement('div')); // ✅ true - created element
isValidElement(<Component />);        // ✅ true - component element
isValidElement('hello');              // ❌ false - string
isValidElement(123);                  // ❌ false - number
isValidElement(null);                 // ❌ false - null
isValidElement(undefined);            // ❌ false - undefined
isValidElement([<div key="1" />]);    // ❌ false - array of elements
```

### When to Use isValidElement

**Use `isValidElement` when:**
- Before calling `cloneElement` (required to avoid crashes)
- Type narrowing for TypeScript (ReactNode → ReactElement)
- Validating `children` prop type
- Conditional element manipulation

**Note:** See `cloneElement` section for examples of using these two functions together.

---

## `flushSync` - Synchronous State Updates

**Purpose:** Force React to flush state updates synchronously, bypassing automatic batching.

**Syntax:** `flushSync(() => { /* state updates */ })`

**Warning:** Use sparingly - breaks React's batching optimization and can hurt performance.

### Basic Usage

```tsx
import { flushSync } from 'react-dom';

function Form() {
  const [value, setValue] = useState('');
  
  const handleSubmit = () => {
    // Normal: state updates are batched
    setValue('');
    setError(null);
    // Both updates happen together
    
    // With flushSync: update happens immediately
    flushSync(() => {
      setValue('');
    });
    // DOM is updated here, before next line
    inputRef.current?.focus();
  };
}
```

### When DOM Must Update Immediately

```tsx
function Table({ data }: Props) {
  const [selectedRow, setSelectedRow] = useState(0);
  const rowRef = useRef<HTMLTableRowElement>(null);
  
  const selectRow = (index: number) => {
    // Must update DOM before scrolling
    flushSync(() => {
      setSelectedRow(index);
    });
    
    // DOM is updated, can now scroll
    rowRef.current?.scrollIntoView();
  };
}
```

### Common Pattern in XMLUI

**Form reset with focus:**
```tsx
function Form({ onSubmit }: Props) {
  const doReset = () => {
    // Reset all fields
  };
  
  const handleSuccess = () => {
    const prevFocused = document.activeElement;
    
    // Force synchronous reset before restoring focus
    flushSync(() => {
      doReset();
    });
    
    // DOM is reset, restore focus
    if (prevFocused && typeof (prevFocused as HTMLElement).focus === 'function') {
      (prevFocused as HTMLElement).focus();
    }
  };
}
```

**Table with immediate scroll:**
```tsx
function DataTable({ data }: Props) {
  const handleSort = (column: string) => {
    // Update sort synchronously before scrolling
    flushSync(() => {
      setSortColumn(column);
      setSortedData(sortData(data, column));
    });
    
    // Table is re-rendered, can scroll to top
    tableRef.current?.scrollTo(0, 0);
  };
}
```

### Why flushSync Exists

```tsx
// ❌ Problem: Without flushSync
function Component() {
  const [text, setText] = useState('');
  
  const update = () => {
    setText('new value');
    // DOM not updated yet!
    inputRef.current?.focus(); // Focuses old state
  };
}

// ✅ Solution: With flushSync
function Component() {
  const [text, setText] = useState('');
  
  const update = () => {
    flushSync(() => {
      setText('new value');
    });
    // DOM is updated
    inputRef.current?.focus(); // Focuses new state
  };
}
```

### When to Use flushSync

**Use `flushSync` when:**
- Need DOM measurements after state change
- Synchronizing with third-party libraries
- Scrolling after state update
- Focus management after state change

**Don't use when:**
- Normal state updates (let React batch)
- Performance-critical code paths
- You can solve it with `useLayoutEffect`
- Inside render (not allowed)

**Performance impact:**
```tsx
// ❌ BAD - Multiple flushSync calls
data.forEach(item => {
  flushSync(() => {
    processItem(item); // Forces re-render each time
  });
});

// ✅ GOOD - Single batch update
const processedItems = data.map(processItem);
flushSync(() => {
  setItems(processedItems); // Single re-render
});
```

---

## `createRoot` - React 18 Root API

**Purpose:** Create a root to render React components into a DOM container (React 18+).

**Syntax:** `const root = createRoot(container); root.render(<App />)`

### Basic Usage

```tsx
import { createRoot } from 'react-dom/client';

// Old way (React 17)
ReactDOM.render(<App />, document.getElementById('root'));

// New way (React 18+)
const root = createRoot(document.getElementById('root')!);
root.render(<App />);
```

### With TypeScript

```tsx
import { createRoot } from 'react-dom/client';

const container = document.getElementById('root');
if (!container) {
  throw new Error('Root element not found');
}

const root = createRoot(container);
root.render(<App />);
```

### Unmounting

```tsx
const root = createRoot(container);
root.render(<App />);

// Later: unmount
root.unmount();
```

### Common Pattern in XMLUI

**Standalone app rendering:**
```tsx
function renderStandaloneApp(rootElement: HTMLElement) {
  let contentRoot: Root;
  
  if (!contentRoot) {
    contentRoot = createRoot(rootElement);
  }
  
  contentRoot.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
  
  return contentRoot;
}
```

**Shadow DOM rendering:**
```tsx
function NestedApp({ children }: Props) {
  const shadowRef = useRef<ShadowRoot>(null);
  const contentRootRef = useRef<Root | null>(null);
  
  useEffect(() => {
    if (shadowRef.current && !contentRootRef.current) {
      // Create root in shadow DOM
      contentRootRef.current = createRoot(shadowRef.current);
      contentRootRef.current.render(<NestedContent />);
    }
    
    return () => {
      contentRootRef.current?.unmount();
    };
  }, []);
}
```

### Benefits of createRoot (React 18)

1. **Automatic batching** - All updates batched, even in promises/setTimeout
2. **Concurrent features** - Enables `useTransition`, `useDeferredValue`, etc.
3. **Improved hydration** - Better SSR support
4. **Suspense improvements** - Better streaming SSR

### When to Use createRoot

**Use `createRoot` when:**
- Starting a new React 18+ application
- Rendering React into a DOM container
- Creating multiple roots in one app
- Rendering into shadow DOM

**Migration from React 17:**
```tsx
// React 17
import ReactDOM from 'react-dom';
ReactDOM.render(<App />, container);
ReactDOM.unmountComponentAtNode(container);

// React 18
import { createRoot } from 'react-dom/client';
const root = createRoot(container);
root.render(<App />);
root.unmount();
```

---

## React Accessibility Patterns

### ARIA Attributes Pattern

**Key ARIA attributes:** `role`, `aria-label`, `aria-labelledby`, `aria-describedby`, `aria-hidden`, `aria-live`, `aria-expanded`, `aria-selected`, `aria-disabled`, `aria-current`

**Common patterns:**

```tsx
// Icon button with accessible label
<button onClick={onClick} aria-label="Close dialog">
  <Icon name="close" aria-hidden="true" />
</button>

// Form field with error/help text
function FormField({ label, error, helpText }: Props) {
  const id = useId();
  return (
    <>
      <label htmlFor={id}>{label}</label>
      <input id={id} aria-describedby={`${id}-desc`} aria-invalid={!!error} />
      <span id={`${id}-desc`} role={error ? "alert" : undefined}>
        {error || helpText}
      </span>
    </>
  );
}

// Accordion/expandable section
<button aria-expanded={isOpen} aria-controls={contentId}>
  {title}
</button>
<div id={contentId} hidden={!isOpen} role="region">
  {children}
</div>

// Live region for announcements
<div role="status" aria-live="polite" aria-atomic="true">
  {message}
</div>

// Modal dialog
<div role="dialog" aria-modal="true" aria-labelledby={titleId}>
  <h2 id={titleId}>{title}</h2>
  {children}
</div>

// Tab navigation
<div role="tablist">
  <button role="tab" aria-selected={isActive} aria-controls={panelId}>
    {label}
  </button>
</div>
<div role="tabpanel" id={panelId} aria-labelledby={tabId}>
  {content}
</div>
```

**Rules:** Use semantic HTML first, add ARIA only when needed, keep attributes in sync with state, test with screen readers.

---

### Focus Management Pattern

**Common scenarios:** Auto-focus on mount, focus traps in modals, focus restoration, roving tab index.

```tsx
// Auto-focus first element in dialog
function Dialog({ isOpen }: Props) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  useEffect(() => {
    if (isOpen) buttonRef.current?.focus();
  }, [isOpen]);
  
  return <button ref={buttonRef}>Close</button>;
}

// Focus trap + restoration in modal
function Modal({ isOpen, onClose, children }: Props) {
  const modalRef = useRef<HTMLDivElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  
  useEffect(() => {
    if (!isOpen) return;
    
    restoreFocusRef.current = document.activeElement as HTMLElement;
    modalRef.current?.querySelector<HTMLElement>('button')?.focus();
    
    return () => restoreFocusRef.current?.focus();
  }, [isOpen]);
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
    
    // Trap Tab key
    if (e.key === 'Tab') {
      const focusable = modalRef.current?.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable?.length) return;
      
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  };
  
  return (
    <div ref={modalRef} role="dialog" aria-modal="true" onKeyDown={handleKeyDown}>
      {children}
    </div>
  );
}

// Focus after delete action
function DeleteButton({ itemId, onDelete }: Props) {
  const handleDelete = () => {
    const current = document.getElementById(`item-${itemId}`);
    const next = (current?.nextElementSibling || current?.previousElementSibling)
      ?.querySelector('button') as HTMLElement;
    
    onDelete(itemId);
    setTimeout(() => next?.focus(), 0);
  };
  
  return <button onClick={handleDelete}>Delete</button>;
}

// Roving tab index for lists
function RadioGroup({ options, value, onChange }: Props) {
  const [focusedIndex, setFocusedIndex] = useState(0);
  
  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    let newIndex = index;
    if (e.key === 'ArrowDown') newIndex = (index + 1) % options.length;
    if (e.key === 'ArrowUp') newIndex = index === 0 ? options.length - 1 : index - 1;
    if (e.key === 'Home') newIndex = 0;
    if (e.key === 'End') newIndex = options.length - 1;
    
    if (newIndex !== index) {
      e.preventDefault();
      setFocusedIndex(newIndex);
    }
  };
  
  return (
    <div role="radiogroup">
      {options.map((opt, i) => (
        <div
          key={opt.id}
          role="radio"
          aria-checked={value === opt.id}
          tabIndex={focusedIndex === i ? 0 : -1}
          onClick={() => onChange(opt.id)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          onFocus={() => setFocusedIndex(i)}
        >
          {opt.label}
        </div>
      ))}
    </div>
  );
}
```

**Rules:** Always restore focus when closing modals, trap focus within modal contexts, use `focus-visible` for keyboard-only indicators, test thoroughly.

---

### Keyboard Navigation Pattern

**Standard keyboard shortcuts:** Escape (close), Tab/Shift+Tab (navigate), Arrow keys (move focus), Enter/Space (activate), Home/End (first/last).

```tsx
// Dropdown with full keyboard support
function Dropdown({ trigger, items, onSelect }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const itemsRef = useRef<(HTMLButtonElement | null)[]>([]);
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          const next = (focusedIndex + 1) % items.length;
          setFocusedIndex(next);
          itemsRef.current[next]?.focus();
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (isOpen) {
          const prev = focusedIndex === 0 ? items.length - 1 : focusedIndex - 1;
          setFocusedIndex(prev);
          itemsRef.current[prev]?.focus();
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (isOpen) {
          onSelect(items[focusedIndex]);
          setIsOpen(false);
        } else {
          setIsOpen(true);
        }
        break;
    }
  };
  
  return (
    <div onKeyDown={handleKeyDown}>
      <button onClick={() => setIsOpen(!isOpen)} aria-expanded={isOpen}>
        {trigger}
      </button>
      {isOpen && (
        <ul role="menu">
          {items.map((item, i) => (
            <li key={item.id} role="none">
              <button
                ref={el => itemsRef.current[i] = el}
                role="menuitem"
                onClick={() => { onSelect(item); setIsOpen(false); }}
                onFocus={() => setFocusedIndex(i)}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// Global keyboard shortcuts hook
function useKeyboardShortcuts(shortcuts: Record<string, () => void>) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const keys: string[] = [];
      if (e.ctrlKey || e.metaKey) keys.push('Ctrl');
      if (e.shiftKey) keys.push('Shift');
      if (e.altKey) keys.push('Alt');
      keys.push(e.key.toUpperCase());
      
      const handler = shortcuts[keys.join('+')];
      if (handler) {
        e.preventDefault();
        handler();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
}

// Usage: Editor with shortcuts
function Editor() {
  useKeyboardShortcuts({
    'Ctrl+S': handleSave,
    'Ctrl+Z': handleUndo,
    'Ctrl+Shift+Z': handleRedo,
  });
  return <div>Editor</div>;
}

// Data table with arrow key navigation
function DataTable({ columns, rows }: Props) {
  const [focusedCell, setFocusedCell] = useState({ row: 0, col: 0 });
  const cellRefs = useRef<(HTMLTableCellElement | null)[][]>([]);
  
  const handleKeyDown = (e: React.KeyboardEvent, rowIndex: number, colIndex: number) => {
    let newRow = rowIndex, newCol = colIndex;
    
    if (e.key === 'ArrowUp') newRow = Math.max(0, rowIndex - 1);
    if (e.key === 'ArrowDown') newRow = Math.min(rows.length - 1, rowIndex + 1);
    if (e.key === 'ArrowLeft') newCol = Math.max(0, colIndex - 1);
    if (e.key === 'ArrowRight') newCol = Math.min(columns.length - 1, colIndex + 1);
    if (e.key === 'Home') newCol = 0;
    if (e.key === 'End') newCol = columns.length - 1;
    
    if (newRow !== rowIndex || newCol !== colIndex) {
      e.preventDefault();
      setFocusedCell({ row: newRow, col: newCol });
      cellRefs.current[newRow]?.[newCol]?.focus();
    }
  };
  
  return (
    <table>
      <tbody>
        {rows.map((row, ri) => (
          <tr key={row.id}>
            {columns.map((col, ci) => (
              <td
                key={col.id}
                ref={el => {
                  if (!cellRefs.current[ri]) cellRefs.current[ri] = [];
                  cellRefs.current[ri][ci] = el;
                }}
                tabIndex={focusedCell.row === ri && focusedCell.col === ci ? 0 : -1}
                onKeyDown={e => handleKeyDown(e, ri, ci)}
                onFocus={() => setFocusedCell({ row: ri, col: ci })}
              >
                {row[col.id]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

**Rules:** Support standard shortcuts (Escape, Tab, Arrows), don't override browser/OS shortcuts, provide visible focus feedback, test keyboard-only navigation.

---

### Accessibility Best Practices Summary

**Key principles:**
- Use semantic HTML first (`<button>`, `<nav>`, `<main>`)
- Add ARIA only when semantic HTML isn't enough
- All interactive elements must be keyboard accessible
- Provide visible focus indicators (use `:focus-visible`)
- Keep ARIA attributes in sync with visual state
- Restore focus after closing modals/dialogs
- Test with screen readers and keyboard only

**Testing checklist:**
- [ ] Navigate entire app with keyboard only
- [ ] Focus indicators visible and high contrast
- [ ] Screen reader announces all content correctly
- [ ] Color not the only state indicator
- [ ] Text contrast ≥ 4.5:1 for normal text
- [ ] Interactive elements have accessible names
- [ ] Form fields have associated labels
- [ ] Error messages are announced

**Tools:** [axe DevTools](https://www.deque.com/axe/devtools/), [WAVE](https://wave.webaim.org/), [Lighthouse](https://developers.google.com/web/tools/lighthouse), screen readers (NVDA, JAWS, VoiceOver)
