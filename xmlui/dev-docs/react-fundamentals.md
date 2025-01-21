# React Fundamentals

The current implementation of xmlui is built with React. Though the concepts behind the framework are not React-specific, we chose this platform because of its simplicity, the dev team's existing knowledge, and the large number of available third-party components.

The xmlui framework uses React hooks in its components. This article overviews the fundamental React hook concepts that may help you read, understand, and maintain the xmlui source code.

We assume that you are familiar with the React fundamentals (you already went through the [Quick Start](https://react.dev/learn).

## Component Rendering

Most issues with faulty React components (unexpected display or behavior) result from a lack of understanding of React's rendering loop. Here is a summary:

1. **Render Trigger**. The loops starts with something that triggers the rendering of a particular component. There are a few of them:
  - The parent of the component is re-rendered.
  - Any property of a component is changed.
  - Any state variable of the component is changed.
2. **Render Phase**. React calls your component function or render() method, which returns a new virtual DOM structure.
3. **Reconciliation**. React compares the new virtual DOM (returned by the `render()` method) with the old virtual DOM using its diffing algorithm, and it determines the minimal set of changes needed for the real DOM.
4. **Commit Phase**. React updates the real DOM based on the changes found during reconciliation. It runs any layout effects and then runs side-effect callbacks (e.g., useEffect).
5. **Post-Render Cleanup**. Cleanup functions from useEffect (or similar) run to tidy up before the subsequent renders.

When designing your components, you can implement components with poor performance. Keep these suggestions in mind:
- Re-rendering parent components renders all nested children (even if no child has been changed), so use a design that changes only a minimal part of the UI.
- Use memoization (`useMemo`) to re-render only the children that have been changed.

## How to Use React Hooks

There are a few things to consider when using React hooks. Ignoring one of these may result in difficult-to-resolve issues.

**The order of hook calls must be consistent between renders; if the particular component is rendered multiple times, all renders must invoke the same hooks in the same order.** Take care of the following:
- Place hooks at the top of your component or custom hook above any early returns or logic branches.
- Don’t use hooks in regular JavaScript functions or classes.
- Don’t call hooks in nested functions, loops, or conditionals.

Here is an antipattern of using a hook:

```tsx
import React, { useState } from 'react';

// ❌ ANTIPATTERN: Calls `useState` inside an if-statement
function ConditionalStateExample({ isEnabled }: { isEnabled: boolean }) {
  if (isEnabled) {
    // This breaks the Rules of Hooks because 'useState' 
    // might not run on every render (only runs when isEnabled is true).
    const [count, setCount] = useState(0);
    return (
      <div>
        <p>Count is: {count}</p>
        <button onClick={() => setCount(count + 1)}>
          Increment
        </button>
      </div>
    );
  } else {
    // When this branch is taken, the 'useState' call never occurs,
    // leading to inconsistent Hook ordering between renders.
    return <div>Disabled</div>;
  }
}

export default ConditionalStateExample;
```

Most hooks have an argument describing a dependency list. The hook is invoked only if any of the dependencies changes. When you define a hook, use the appropriate dependency list.

You should use the correct hook for a particular job. In this section, you will learn more detail.

### `useState`

[`useState`](https://react.dev/reference/react/useState) adds a state variable to a particular component. State variables store values that directly influence components' rendering (appearance). Whenever a particular state changes, the component is re-rendered.

```tsx
import React, { useState } from 'react';

function Counter() {
  // Declare a piece of state for the counter
  const [count, setCount] = useState(0);

  // Increment and decrement handlers
  const increment = () => setCount(prev => prev + 1);
  const decrement = () => setCount(prev => prev - 1);

  // Return JSX to render
  return (
    <div>
      <h1>Count: {count}</h1>
      <button onClick={increment}>+1</button>
      <button onClick={decrement}>-1</button>
    </div>
  );
}
```

### `useMemo`

The `useMemo` hook caches the result of a calculation between re-renders. You can use it to optimize an expensive calculation or derivation in a React component.

The following scenario has an extensive list of items and filters them based on a search query. Using useMemo, you avoid performing the expensive filter operation on every render unless the input (data or search query) changes.

```tsx
import React, { useState, useMemo } from 'react';

interface Item {
  id: number;
  name: string;
}

interface FilterableListProps {
  data: Item[];
}

function FilterableList({ data }: FilterableListProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // useMemo to memoize filtered results
  const filteredData = useMemo(() => {
    // 🛠️ Simulate an expensive operation: filtering a large dataset
    console.log('Filtering data...'); // For demonstration
    return data.filter(item =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [data, searchQuery]);

  return (
    <div>
      <input
        placeholder="Search items..."
        value={searchQuery}
        onChange={e => setSearchQuery(e.target.value)}
      />

      <ul>
        {filteredData.map(item => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
    </div>
  );
}

export default FilterableList;
```

### `useCallback`

This React hook lets you cache a function definition between re-renders. We use this hook heavily in xmlui, as our components may have callback functions running xmlui scripts and expressions. For example, the `click` event handler of an xmlui `Button` component caches the event handler code to execute via `useCallback`.



