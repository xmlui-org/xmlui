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

## `useState` - Local State Management

**Purpose:** Manage component-local state that triggers re-renders when updated.

**Syntax:** `const [state, setState] = useState(initialValue)`

### Basic Usage

```tsx
function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}
```

### Functional Updates

Use functional updates when the new state depends on the previous state. This avoids stale closure issues.

```tsx
function Counter() {
  const [count, setCount] = useState(0);
  
  const incrementTwice = () => {
    // ❌ WRONG - Both updates use the same `count` value
    setCount(count + 1);
    setCount(count + 1); // Still increments by 1 total
    
    // ✅ CORRECT - Each update uses the latest state
    setCount(prev => prev + 1);
    setCount(prev => prev + 1); // Increments by 2 total
  };
  
  return <button onClick={incrementTwice}>+2</button>;
}
```

### Lazy Initialization

For expensive initial state calculations, pass a function to `useState`. It only runs once on mount.

```tsx
function ExpensiveComponent() {
  // ❌ WRONG - Runs on every render
  const [data, setData] = useState(expensiveComputation());
  
  // ✅ CORRECT - Runs only once
  const [data, setData] = useState(() => expensiveComputation());
  
  return <div>{data}</div>;
}
```

### Object and Array State

State updates must be immutable. Create new objects/arrays instead of mutating existing ones.

```tsx
function UserForm() {
  const [user, setUser] = useState({ name: "", email: "" });
  const [items, setItems] = useState<string[]>([]);
  
  // Update object - spread to create new object
  const updateName = (name: string) => {
    setUser(prev => ({ ...prev, name }));
  };
  
  // Update array - use immutable methods
  const addItem = (item: string) => {
    setItems(prev => [...prev, item]);
  };
  
  const removeItem = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };
  
  return <div>...</div>;
}
```

### State Batching

React batches multiple state updates in event handlers into a single re-render for performance.

```tsx
function Form() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  
  const handleSubmit = () => {
    // Both updates batched - component re-renders once
    setName("");
    setEmail("");
  };
  
  return <form onSubmit={handleSubmit}>...</form>;
}
```

### Common Patterns in XMLUI

**Form Input State:**
```tsx
function TextInput({ initialValue, onDidChange }: Props) {
  const [value, setValue] = useState(initialValue || "");
  
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    onDidChange?.(newValue);
  };
  
  return <input value={value} onChange={handleChange} />;
}
```

**Toggle State:**
```tsx
function Collapsible({ children }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div>
      <button onClick={() => setIsOpen(prev => !prev)}>
        {isOpen ? "Collapse" : "Expand"}
      </button>
      {isOpen && <div>{children}</div>}
    </div>
  );
}
```

**Derived State (Avoid):**
```tsx
// ❌ WRONG - Redundant state that can be computed
function SearchList({ items }: Props) {
  const [query, setQuery] = useState("");
  const [filtered, setFiltered] = useState(items);
  
  useEffect(() => {
    setFiltered(items.filter(item => item.includes(query)));
  }, [items, query]);
}

// ✅ CORRECT - Compute during render
function SearchList({ items }: Props) {
  const [query, setQuery] = useState("");
  const filtered = items.filter(item => item.includes(query));
}
```

### When to Use useState

**Use `useState` when:**
- State is local to a single component
- State updates are simple (primitives, simple objects)
- No complex state transitions or validation logic

**Consider alternatives when:**
- State is shared across components → Use `useContext` or prop drilling
- State logic is complex → Use `useReducer`
- State synchronizes with external systems → Use `useEffect` + `useState` or `useSyncExternalStore`

---

## `useEffect` - Side Effects and Lifecycle

**Purpose:** Run side effects after render (data fetching, subscriptions, DOM manipulation).

**Syntax:** `useEffect(() => { /* effect */ return () => { /* cleanup */ } }, [dependencies])`

### Basic Usage

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

**With async/await (using IIFE):**
```tsx
function UserProfile({ userId }: Props) {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    // Can't make useEffect callback async directly, so use IIFE
    (async () => {
      const res = await fetch(`/api/users/${userId}`);
      const data = await res.json();
      setUser(data);
    })();
  }, [userId]);
  
  return <div>{user?.name}</div>;
}
```

### Cleanup Functions

Return a cleanup function to prevent memory leaks and cancel ongoing operations.

```tsx
function Chat({ roomId }: Props) {
  useEffect(() => {
    const connection = createConnection(roomId);
    connection.connect();
    
    // Cleanup runs before next effect and on unmount
    return () => {
      connection.disconnect();
    };
  }, [roomId]);
  
  return <div>Connected to {roomId}</div>;
}
```

### Dependency Array Patterns

```tsx
// ❌ WRONG - Missing dependencies (stale closure bug)
useEffect(() => {
  console.log(count); // Always logs initial count value
}, []); // Should include [count]

// ❌ WRONG - Object in dependencies (runs every render)
useEffect(() => {
  fetchData(config);
}, [config]); // config is recreated every render

// ✅ CORRECT - Destructure or memoize objects
useEffect(() => {
  fetchData(config);
}, [config.id, config.filter]); // Only primitive values

// ✅ CORRECT - Empty array = run once on mount
useEffect(() => {
  initializeApp();
  return () => cleanupApp();
}, []); // No dependencies

// ✅ CORRECT - No array = run after every render (rarely needed)
useEffect(() => {
  updateDocumentTitle();
}); // Runs after every render
```

### Common Patterns in XMLUI

**Data Fetching:**
```tsx
function DataComponent({ url }: Props) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    let cancelled = false;
    
    setLoading(true);
    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (!cancelled) {
          setData(data);
          setLoading(false);
        }
      });
    
    return () => { cancelled = true; };
  }, [url]);
  
  if (loading) return <div>Loading...</div>;
  return <div>{JSON.stringify(data)}</div>;
}
```

**Event Listeners:**
```tsx
function WindowSize() {
  const [size, setSize] = useState({ width: 0, height: 0 });
  
  useEffect(() => {
    const handleResize = () => {
      setSize({ width: window.innerWidth, height: window.innerHeight });
    };
    
    window.addEventListener('resize', handleResize);
    handleResize(); // Initial size
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return <div>{size.width} x {size.height}</div>;
}
```

**Syncing with External Systems:**
```tsx
function ExternalStore({ store }: Props) {
  const [value, setValue] = useState(store.getValue());
  
  useEffect(() => {
    // Subscribe to external store
    const unsubscribe = store.subscribe(newValue => {
      setValue(newValue);
    });
    
    return unsubscribe;
  }, [store]);
  
  return <div>{value}</div>;
}
```

### When to Use useEffect

**Use `useEffect` when:**
- Fetching data from APIs
- Setting up subscriptions or event listeners
- Manually manipulating DOM elements
- Integrating with non-React libraries
- Logging or analytics

**Avoid `useEffect` when:**
- Computing derived values → Use direct calculation or `useMemo`
- Handling user events → Use event handlers
- Initializing state → Use `useState` initializer or `useMemo`

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

## `useMemo` - Expensive Computation Caching

**Purpose:** Cache expensive calculation results between renders.

**Syntax:** `const memoized = useMemo(() => computeValue(), [dependencies])`

### Basic Usage

```tsx
function FilteredList({ items, filter }: Props) {
  // Only recomputes when items or filter changes
  const filtered = useMemo(() => {
    console.log('Filtering...');
    return items.filter(item => item.includes(filter));
  }, [items, filter]);
  
  return <ul>{filtered.map(item => <li key={item}>{item}</li>)}</ul>;
}
```

### Referential Stability

```tsx
function Parent() {
  const [count, setCount] = useState(0);
  
  // ❌ WRONG - New object every render
  const config = { theme: 'dark', size: 'large' };
  
  // ✅ CORRECT - Same object reference until dependencies change
  const config = useMemo(() => ({ theme: 'dark', size: 'large' }), []);
  
  return <ExpensiveChild config={config} />;
}

const ExpensiveChild = React.memo(({ config }: Props) => {
  // Only re-renders when config reference changes
  return <div>{config.theme}</div>;
});
```

### Complex Computations

```tsx
function DataAnalysis({ data }: Props) {
  const statistics = useMemo(() => {
    return {
      mean: data.reduce((a, b) => a + b, 0) / data.length,
      median: [...data].sort()[Math.floor(data.length / 2)],
      mode: findMode(data),
      stdDev: calculateStdDev(data),
    };
  }, [data]);
  
  return <div>{JSON.stringify(statistics)}</div>;
}
```

### When to Use useMemo

**Use `useMemo` when:**
- Computation is expensive (>10ms)
- Creating objects/arrays passed to memoized children
- Calculations used in dependency arrays

**Don't use `useMemo` when:**
- Computation is cheap (<1ms) - premature optimization
- Result only used once in render
- Component rarely re-renders

---

## `useCallback` - Function Reference Caching

**Purpose:** Cache function definitions between renders to prevent child re-renders.

**Syntax:** `const memoized = useCallback(() => { /* function */ }, [dependencies])`

### Basic Usage

```tsx
function Parent() {
  const [count, setCount] = useState(0);
  
  // ❌ WRONG - New function every render
  const handleClick = () => {
    console.log('Clicked');
  };
  
  // ✅ CORRECT - Same function reference
  const handleClick = useCallback(() => {
    console.log('Clicked');
  }, []);
  
  return <MemoizedChild onClick={handleClick} />;
}

const MemoizedChild = React.memo(({ onClick }: Props) => {
  console.log('Child rendered');
  return <button onClick={onClick}>Click</button>;
});
```

### With Dependencies

```tsx
function TodoList() {
  const [todos, setTodos] = useState([]);
  const [filter, setFilter] = useState('all');
  
  const addTodo = useCallback((text: string) => {
    setTodos(prev => [...prev, { id: Date.now(), text }]);
  }, []); // No dependencies needed with functional updates
  
  const filterTodos = useCallback((todos) => {
    return filter === 'all' 
      ? todos 
      : todos.filter(t => t.status === filter);
  }, [filter]); // Recreated when filter changes
  
  return <TodoForm onAdd={addTodo} />;
}
```

### Common Pattern in XMLUI

```tsx
function Form({ onSubmit }: Props) {
  const [name, setName] = useState('');
  
  const handleSubmit = useCallback(() => {
    onSubmit({ name });
  }, [name, onSubmit]); // Include all used values
  
  return (
    <form onSubmit={handleSubmit}>
      <input value={name} onChange={e => setName(e.target.value)} />
      <SubmitButton onSubmit={handleSubmit} />
    </form>
  );
}
```

### useCallback vs useMemo

```tsx
// These are equivalent:
const memoized = useCallback(() => doSomething(), [dep]);
const memoized = useMemo(() => () => doSomething(), [dep]);

// useCallback is just sugar for useMemo returning a function
```

---

## `useReducer` - Complex State Logic

**Purpose:** Manage complex state with predictable state transitions using reducer pattern.

**Syntax:** `const [state, dispatch] = useReducer(reducer, initialState)`

### Basic Usage

```tsx
type State = { count: number };
type Action = { type: 'increment' } | { type: 'decrement' } | { type: 'reset' };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'increment':
      return { count: state.count + 1 };
    case 'decrement':
      return { count: state.count - 1 };
    case 'reset':
      return { count: 0 };
    default:
      return state;
  }
}

function Counter() {
  const [state, dispatch] = useReducer(reducer, { count: 0 });
  
  return (
    <div>
      Count: {state.count}
      <button onClick={() => dispatch({ type: 'increment' })}>+</button>
      <button onClick={() => dispatch({ type: 'decrement' })}>-</button>
      <button onClick={() => dispatch({ type: 'reset' })}>Reset</button>
    </div>
  );
}
```

### With Immer for Immutability

```tsx
import produce from 'immer';

const reducer = produce((state, action) => {
  switch (action.type) {
    case 'ADD_TODO':
      state.todos.push(action.payload); // Direct mutation with Immer
      break;
    case 'TOGGLE_TODO':
      const todo = state.todos.find(t => t.id === action.payload);
      if (todo) todo.completed = !todo.completed;
      break;
  }
});
```

### Common Pattern in XMLUI (Form State)

```tsx
type FormState = {
  values: Record<string, any>;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
};

type FormAction =
  | { type: 'SET_VALUE'; field: string; value: any }
  | { type: 'SET_ERROR'; field: string; error: string }
  | { type: 'TOUCH_FIELD'; field: string }
  | { type: 'RESET' };

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case 'SET_VALUE':
      return {
        ...state,
        values: { ...state.values, [action.field]: action.value },
      };
    case 'SET_ERROR':
      return {
        ...state,
        errors: { ...state.errors, [action.field]: action.error },
      };
    case 'TOUCH_FIELD':
      return {
        ...state,
        touched: { ...state.touched, [action.field]: true },
      };
    case 'RESET':
      return { values: {}, errors: {}, touched: {} };
    default:
      return state;
  }
}
```

### When to Use useReducer

**Use `useReducer` when:**
- Multiple related state values
- Complex state transitions
- Next state depends on previous state
- Want to separate state logic from component

**Use `useState` when:**
- Simple independent state values
- State updates are straightforward
- No complex validation or transformation

---

## `useContext` - Consume Context Values

**Purpose:** Access values from React Context without prop drilling. Always used with `createContext` - see that section for full pattern.

**Syntax:** `const value = useContext(MyContext)`

### Basic Usage

```tsx
// Assuming ThemeContext was created with createContext
const ThemeContext = createContext<'light' | 'dark'>('light');

// Consumer component
function ThemedButton() {
  const theme = useContext(ThemeContext);
  
  return <button className={`btn-${theme}`}>Click</button>;
}
```

### Creating Custom Hooks

Wrap `useContext` in custom hooks for better error messages and type safety:

```tsx
// ❌ Using useContext directly - no error if outside provider
function Component() {
  const auth = useContext(AuthContext); // Might be null!
  return <div>{auth?.user?.name}</div>; // Need null checks everywhere
}

// ✅ Custom hook with validation
function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context; // TypeScript knows it's not null
}

function Component() {
  const { user } = useAuth(); // Guaranteed to exist or throw
  return <div>{user.name}</div>; // No null checks needed
}
```

### Common Pattern in XMLUI

```tsx
// Pattern: Create context + custom hook together
const FormContext = createContext<FormContextValue | null>(null);

export function useFormContext() {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('Form fields must be used within a Form component');
  }
  return context;
}

// Usage in components
function FormField({ name }: Props) {
  const { values, errors, setFieldValue } = useFormContext();
  
  return (
    <div>
      <input
        value={values[name]}
        onChange={e => setFieldValue(name, e.target.value)}
      />
      {errors[name] && <span>{errors[name]}</span>}
    </div>
  );
}
```

### When to Use useContext

**Use `useContext` for:**
- Consuming values from context created with `createContext`
- Avoiding prop drilling through many component levels
- Accessing global/shared state (theme, auth, config)

**Always:**
- Wrap in custom hook with error checking
- Document that component must be used within a provider

**Note:** See `createContext` section for complete examples of creating contexts, providers, and performance optimization.

---

## `useTransition` - Non-Urgent Updates

**Purpose:** Mark state updates as non-urgent to keep UI responsive during slow updates.

**Syntax:** `const [isPending, startTransition] = useTransition()`

### Basic Usage

```tsx
function SearchResults() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isPending, startTransition] = useTransition();
  
  const handleSearch = (value: string) => {
    setQuery(value); // Urgent: Update input immediately
    
    startTransition(() => {
      // Non-urgent: Filter can be slow, won't block input
      const filtered = largeDataset.filter(item => item.includes(value));
      setResults(filtered);
    });
  };
  
  return (
    <div>
      <input value={query} onChange={e => handleSearch(e.target.value)} />
      {isPending && <div>Loading...</div>}
      <ul>{results.map(r => <li key={r.id}>{r.name}</li>)}</ul>
    </div>
  );
}
```

### Usage in XMLUI

XMLUI uses `useTransition` in container infrastructure to batch state changes during script execution, preventing excessive re-renders.

```tsx
function StatementExecutor({ statements }: Props) {
  const [, startTransition] = useTransition();
  
  const executeStatements = () => {
    startTransition(() => {
      // Multiple state changes batched as low-priority
      statements.forEach(stmt => {
        executeStatement(stmt); // May trigger multiple state updates
      });
    });
  };
  
  return <button onClick={executeStatements}>Execute</button>;
}
```

---

## `useLayoutEffect` - Synchronous DOM Effects

**Purpose:** Run effects synchronously after DOM mutations but before browser paint.

**Syntax:** `useLayoutEffect(() => { /* effect */ }, [dependencies])`

### When to Use

```tsx
function Tooltip() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const ref = useRef<HTMLDivElement>(null);
  
  // ✅ CORRECT - Use useLayoutEffect to measure DOM before paint
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

// ❌ WRONG - useEffect causes flicker as position updates after paint
useEffect(() => {
  // DOM measurements happen after screen paint
  // User sees element jump from old to new position
}, []);
```

### Use Cases

- Measuring DOM elements before paint
- Synchronizing scrollbar position
- Preventing layout shift/flicker
- Integrating with DOM-based libraries

**Warning:** Blocks visual updates. Use `useEffect` unless you specifically need synchronous behavior.

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

## `useInsertionEffect` - Style Injection

**Purpose:** Insert styles into DOM before layout effects run. Used by CSS-in-JS libraries.

**Syntax:** `useInsertionEffect(() => { /* insert styles */ }, [dependencies])`

### Typical Usage (CSS-in-JS libraries)

```tsx
function useCSS(rule: string) {
  useInsertionEffect(() => {
    // Inject styles before layout reads
    const style = document.createElement('style');
    style.textContent = rule;
    document.head.appendChild(style);
    
    return () => document.head.removeChild(style);
  }, [rule]);
}
```

**Note:** Rarely used directly in application code. Primarily for library authors building CSS-in-JS solutions. XMLUI uses this in `StyleContext` for theme style injection.

**Effect execution order:**
1. `useInsertionEffect` - Insert styles
2. `useLayoutEffect` - Measure layout
3. Browser paints
4. `useEffect` - Other side effects

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

## `memo` - Component Memoization

**Purpose:** Prevent unnecessary re-renders by memoizing components. Re-renders only when props actually change.

**Syntax:** `const MemoizedComponent = memo(Component, arePropsEqual?)`

### Basic Usage

```tsx
const ExpensiveComponent = memo(function ExpensiveComponent({ data }: Props) {
  console.log('Rendering ExpensiveComponent'); // Only logs when data changes
  
  return (
    <div>
      {data.map(item => <Item key={item.id} {...item} />)}
    </div>
  );
});

function Parent() {
  const [count, setCount] = useState(0);
  const data = useMemo(() => computeData(), []); // Stable reference
  
  return (
    <div>
      <ExpensiveComponent data={data} /> {/* Doesn't re-render when count changes */}
      <button onClick={() => setCount(c => c + 1)}>Count: {count}</button>
    </div>
  );
}
```

### How memo Works

```tsx
// ❌ WITHOUT memo - re-renders every time parent renders
function Child({ name }: Props) {
  console.log('Child rendered'); // Logs on every parent render
  return <div>{name}</div>;
}

// ✅ WITH memo - only re-renders when props change
const Child = memo(function Child({ name }: Props) {
  console.log('Child rendered'); // Only logs when name changes
  return <div>{name}</div>;
});

function Parent() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <Child name="Alice" /> {/* With memo: doesn't re-render when count changes */}
      <button onClick={() => setCount(c => c + 1)}>Count: {count}</button>
    </div>
  );
}
```

### Custom Comparison Function

```tsx
// Default: shallow comparison of props
const DefaultMemo = memo(Component);

// Custom: deep comparison or specific logic
const CustomMemo = memo(Component, (prevProps, nextProps) => {
  // Return true if props are equal (skip re-render)
  // Return false if props changed (do re-render)
  return prevProps.id === nextProps.id && 
         prevProps.data.length === nextProps.data.length;
});

// Example: Only re-render if specific props change
const SmartComponent = memo(
  function SmartComponent({ id, data, onChange }: Props) {
    return <div onClick={onChange}>{data[id]}</div>;
  },
  (prev, next) => {
    // Ignore onChange function changes, only check id and data
    return prev.id === next.id && prev.data === next.data;
  }
);
```

### Combining memo with forwardRef

```tsx
// Correct order: memo(forwardRef(...))
export const IFrame = memo(forwardRef(function IFrame(
  { src, title, style }: Props,
  ref: ForwardedRef<HTMLIFrameElement>,
) {
  return <iframe ref={ref} src={src} title={title} style={style} />;
}));

// Also works with TypeScript generics
export const Avatar = memo(forwardRef<HTMLDivElement, AvatarProps>(
  function Avatar({ name, src, size }, ref) {
    return <div ref={ref} className={`avatar-${size}`}>{name}</div>;
  }
));
```

### Common Pattern in XMLUI

```tsx
// Container components are memoized to prevent re-renders
export const Container = memo(
  forwardRef(function Container(props, ref) {
    // Complex rendering logic
    return <div ref={ref}>...</div>;
  })
);

// List row components are memoized for performance
const TreeRow = memo(({ index, style, data }: ListChildComponentProps) => {
  const item = data.items[index];
  return <div style={style}>{item.name}</div>;
});

// Option components memoized to prevent re-renders during filtering
export const OptionNative = memo((props: Option) => {
  return <div className="option">{props.label}</div>;
});
```

### When to Use memo

**Use `memo` when:**
- Component re-renders frequently with same props
- Component has expensive rendering logic
- Component is in a large list (virtualized rows)
- Parent re-renders often but child props rarely change

**Don't use `memo` when:**
- Component already re-renders rarely
- Props change on every render anyway
- Rendering is cheap (<1ms)
- Premature optimization (profile first!)

### Common Pitfalls

```tsx
// ❌ WRONG - New object/array/function on every render defeats memo
function Parent() {
  const [count, setCount] = useState(0);
  
  return (
    <>
      <MemoChild data={{ value: 123 }} /> {/* New object every render! */}
      <MemoChild items={[1, 2, 3]} /> {/* New array every render! */}
      <MemoChild onClick={() => {}} /> {/* New function every render! */}
    </>
  );
}

// ✅ CORRECT - Stable references with useMemo/useCallback
function Parent() {
  const [count, setCount] = useState(0);
  const data = useMemo(() => ({ value: 123 }), []);
  const items = useMemo(() => [1, 2, 3], []);
  const handleClick = useCallback(() => {}, []);
  
  return (
    <>
      <MemoChild data={data} /> {/* Same reference */}
      <MemoChild items={items} /> {/* Same reference */}
      <MemoChild onClick={handleClick} /> {/* Same reference */}
    </>
  );
}
```

---

## `createContext` - Context Creation

**Purpose:** Create a context for sharing state across component trees without prop drilling.

**Syntax:** `const MyContext = createContext(defaultValue)`

### Basic Pattern

```tsx
import { createContext, useContext, useState } from 'react';

// 1. Create context with default value
const ThemeContext = createContext<'light' | 'dark'>('light');

// 2. Create provider component
function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  
  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
}

// 3. Create custom hook for consuming context
function useTheme() {
  return useContext(ThemeContext);
}

// 4. Use in components
function Button() {
  const theme = useTheme();
  return <button className={`btn-${theme}`}>Click</button>;
}
```

### Context with Complex State

```tsx
type SelectContextValue = {
  multiSelect?: boolean;
  value: ValueType | null;
  onChange?: (selectedValue: SingleValueType) => void;
  setOpen: (open: boolean) => void;
  options: Set<Option>;
};

export const SelectContext = createContext<SelectContextValue>({
  value: null,
  onChange: () => {},
  setOpen: () => {},
  options: new Set(),
});

export function useSelect() {
  return useContext(SelectContext);
}

// Provider usage
function Select({ children }: Props) {
  const [value, setValue] = useState(null);
  const [open, setOpen] = useState(false);
  
  const contextValue = useMemo(() => ({
    value,
    onChange: setValue,
    setOpen,
    options: new Set(),
  }), [value, open]);
  
  return (
    <SelectContext.Provider value={contextValue}>
      {children}
    </SelectContext.Provider>
  );
}
```

### Context with Type Safety

```tsx
// Require context to be used within provider
type AuthContext = {
  user: User | null;
  login: (credentials: Credentials) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContext | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

function AuthProvider({ children }: Props) {
  const [user, setUser] = useState<User | null>(null);
  
  const value = useMemo(() => ({
    user,
    login: async (creds: Credentials) => { /* ... */ },
    logout: () => setUser(null),
  }), [user]);
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
```

### Common Patterns in XMLUI

**Form Context:**
```tsx
const FormContext = createContext<FormContextValue | null>(null);

export function useFormContext() {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('Form fields must be used within a Form component');
  }
  return context;
}
```

**List Context:**
```tsx
export const ListContext = React.createContext<IExpandableListContext>({
  expandedItems: new Set(),
  toggleExpand: () => {},
  isExpanded: () => false,
});
```

**Modal Context:**
```tsx
const ModalStateContext = React.createContext(null);

export function useModalState() {
  return useContext(ModalStateContext);
}
```

### When to Use createContext

**Use `createContext` when:**
- State needs to be accessed by many nested components
- Prop drilling becomes cumbersome (>3 levels)
- Theme, authentication, or configuration data
- Component coordination (tabs, forms, modals)

**Don't use when:**
- State is only needed by 1-2 components
- Simple parent-child relationships
- Performance-critical frequent updates (context triggers all consumers)

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

## React Hooks and Patterns Used in XMLUI

Based on the analysis of the XMLUI codebase, here is a comprehensive list of React hooks, methods, and patterns that are actually used. These represent the fundamental React concepts that developers should understand when working with XMLUI components.

### Advanced Patterns

23. **Controlled vs Uncontrolled Component Pattern** - Different approaches to form input management
24. **Compound Component Pattern** - Components that work together to form a complete UI
25. **Context Provider Pattern** - Providing context values to component trees

### State Management Patterns

26. **Reducer Pattern with Immer** - Using Immer's `produce` for immutable state updates
27. **State Lifting Pattern** - Moving state up to common ancestors
28. **Prop Drilling Solution Pattern** - Using context to avoid deep prop passing

### Performance Optimization Patterns

29. **Memoization Strategy Pattern** - Strategic use of useMemo and useCallback
30. **Virtualization Pattern** - Rendering only visible items in large lists
31. **Debouncing Pattern** - Reducing frequency of expensive operations
32. **Throttling Pattern** - Limiting execution rate of functions

### Event Handling Patterns

33. **Event Delegation Pattern** - Handling events at parent level
34. **Synthetic Event Pattern** - React's cross-browser event wrapper
35. **Event Callback Composition Pattern** - Combining multiple event handlers

### Lifecycle and Effect Patterns

36. **Effect Cleanup Pattern** - Properly cleaning up subscriptions and timers
37. **Effect Dependencies Pattern** - Managing dependency arrays correctly
38. **Layout Effect Pattern** - Using useLayoutEffect for DOM measurements
39. **Insertion Effect Pattern** - Using useInsertionEffect for style injection

### TypeScript Integration Patterns

40. **Generic Component Pattern** - Type-safe generic components
41. **ForwardRef with TypeScript Pattern** - Properly typing forwardRef components
42. **Props Interface Pattern** - Defining component prop types
43. **Ref Type Pattern** - Typing refs correctly

### Accessibility Patterns

44. **ARIA Attributes Pattern** - Adding accessibility attributes
45. **Focus Management Pattern** - Controlling focus programmatically
46. **Keyboard Navigation Pattern** - Implementing keyboard shortcuts and navigation

---

## Code Review Notes: Potential Derived State Anti-Patterns

The following files contain patterns that may warrant review for potential simplification or refactoring. These are not necessarily bugs but could indicate unnecessary complexity.

### 1. TableNative.tsx (Lines 339-348)

**Issue:** Mirrors props in local state and syncs with `useLayoutEffect`

```tsx
const [_sortBy, _setSortBy] = useState(sortBy);
const [_sortingDirection, _setSortingDirection] = useState(sortingDirection);

useLayoutEffect(() => {
  _setSortBy(sortBy);
}, [sortBy]);

useLayoutEffect(() => {
  _setSortingDirection(sortingDirection);
}, [sortingDirection]);
```

**Why it might be wrong:** If `sortBy` and `sortingDirection` props are sufficient, local state is redundant.

**Possible justification:** May be needed for controlled/uncontrolled pattern or internal sorting before syncing back to parent.

**Review action:** Determine if local state serves a purpose or can be replaced with direct prop usage.

---

### 2. TimeInputNative.tsx (Lines 189+)

**Issue:** Derives multiple state variables from parsed `localValue` in `useEffect`

```tsx
useEffect(() => {
  if (localValue) {
    const { amPm, hour, minute, second } = parseTimeString(localValue, is12HourFormat);
    setAmPm(amPm);
    setHour(hour);
    setMinute(minute);
    setSecond(second);
  }
}, [localValue]);
```

**Why it might be wrong:** Parsed values could potentially be computed directly during render with `useMemo`.

**Possible justification:** Component needs to track individual field state for complex user interactions (validation, focus management, etc.).

**Review action:** Evaluate if parsing can be memoized instead of stored in state, or if interactive state tracking justifies current approach.

---

### 3. DateInputNative.tsx (Similar pattern to TimeInput)

**Issue:** Likely uses similar derived state pattern for parsing date values into day/month/year components.

**Review action:** Check if pattern matches TimeInput and apply same analysis.

---

### General Recommendation

Before refactoring, consider:
1. Does the component need to maintain interactive state independent of props?
2. Is there a controlled/uncontrolled pattern requirement?
3. Would removing the state break existing functionality?
4. Does the current pattern create measurable performance issues?

Not all derived state is bad—the key is whether it serves a legitimate purpose beyond simple computation.

