# List Virtualization Fix Plan

## Problem Analysis

The List component is not virtualizing - all 100 items are rendered in DOM instead of just visible items.

### Root Cause

The commit [0c69245](https://github.com/xmlui-org/xmlui/commit/0c69245c47dc303b905b1c6878e94f4826104e80) replaced ScrollContext with `useScrollParent` hook, but introduced a timing issue:

**In ListNative.tsx (lines 310-317):**
```typescript
const scrollParent = useScrollParent(parentRef.current?.parentElement);
const scrollRef = useRef(scrollParent);
scrollRef.current = scrollParent;

const hasHeight = useHasExplicitHeight(parentRef);
const hasOutsideScroll = scrollRef.current && !hasHeight;

const scrollElementRef = hasOutsideScroll ? scrollRef : parentRef;
```

**Issues:**

1. **Race condition on mount**: `parentRef.current` is `null` during initial render, so `useScrollParent(null)` returns `null`
2. **Stale ref**: `scrollRef.current = scrollParent` updates the ref but doesn't trigger re-evaluation of `hasOutsideScroll`
3. **Wrong logic**: Even when scroll parent is found, the logic incorrectly decides whether to use it

### Expected Behavior for `App layout="condensed-sticky"`

- App has `overflow: auto` on its content area (the scroll container)
- List should have NO explicit height (it fills available space via flex)
- List should detect App as scroll parent
- List should pass the App's scroll container to Virtualizer's `scrollRef`
- Virtualizer should only render visible items

### Current Broken Behavior

- `useScrollParent` returns `null` on initial render
- `hasOutsideScroll` evaluates to `false` (because `scrollRef.current` is `null`)
- `scrollElementRef` becomes `parentRef` (List itself)
- List's CSS has `overflow: auto`, so it becomes its own scroll container
- But List has no height constraint, so it expands to fit all content
- Virtualizer thinks everything is visible, renders all 100 items

## Fix Strategy

### Option 1: Fix the Hook Timing (Recommended)

Use `useLayoutEffect` to properly update scroll detection after mount:

```typescript
const parentRef = useRef<HTMLDivElement | null>(null);
const scrollParentElement = useScrollParent(parentRef.current?.parentElement);
const [scrollConfig, setScrollConfig] = useState<{
  hasOutsideScroll: boolean;
  scrollElement: HTMLElement | null;
}>({ hasOutsideScroll: false, scrollElement: null });

useIsomorphicLayoutEffect(() => {
  if (!parentRef.current) return;
  
  const hasHeight = checkHasExplicitHeight(parentRef.current);
  const hasOutsideScroll = scrollParentElement && !hasHeight;
  
  setScrollConfig({
    hasOutsideScroll,
    scrollElement: hasOutsideScroll ? scrollParentElement : parentRef.current,
  });
}, [scrollParentElement]);
```

### Option 2: Restore ScrollContext Pattern

Revert to the previous ScrollContext approach that worked reliably:
- App provides ScrollContext with its scroll container element
- List consumes ScrollContext to get the scroll parent
- This avoids DOM traversal and timing issues

### Option 3: Simplify Detection Logic

Make the detection more robust:
- Always check if List has constrained height (including flex containers)
- If List has height constraint, use List as scroll container
- If no height constraint, use parent scroll container
- Add proper re-evaluation when DOM is ready

## Recommended Fix

**Implement Option 1** because:
1. Minimal changes to existing code
2. Properly handles React lifecycle
3. Fixes the race condition
4. Maintains the hook-based approach

## Implementation Steps

1. Add diagnostic logging to understand current state
2. Move scroll detection into `useLayoutEffect`
3. Use state to trigger re-render when scroll config changes
4. Ensure Virtualizer gets correct `scrollRef` after mount
5. Test with App layouts (condensed-sticky, default, etc.)

## Diagnostic Code

Add to ListNative.tsx after line 317:

```typescript
useEffect(() => {
  console.log('List Diagnostics:', {
    hasParentRef: !!parentRef.current,
    scrollParent: scrollParent?.tagName || 'null',
    hasHeight,
    hasOutsideScroll,
    scrollElementTag: scrollElementRef.current?.tagName || 'null',
    virtualizerCount: rowCount,
  });
}, [scrollParent, hasHeight, hasOutsideScroll, rowCount]);
```

This will show us what values the List is seeing during render.
