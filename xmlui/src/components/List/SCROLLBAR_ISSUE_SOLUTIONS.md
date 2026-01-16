# Scrollbar Position Issue - Solution Options

## Problem
Virtua's scrollbar doesn't accurately reflect position with dynamic-sized items because it uses estimated sizes for unmeasured (virtualized) items. This causes the scrollbar to jump unpredictably, especially in reverse/infinite scroll scenarios (issue [#710](https://github.com/inokawa/virtua/issues/710)).

## Root Cause
Virtual scrollers can't know actual sizes of unmeasured items, so they estimate. As items come into view and get measured, the scroller compensates both sizes and scroll position in real-time, causing unnatural behavior.

## Decision
**For fixed-size items:** Implement Option 1 (auto-measurement)  
**For dynamic-size items:** Accept current Virtua behavior

## Solution Options

### 1. **Fixed Item Heights with Auto-Measurement** ⭐ (Selected)
When items have consistent heights (unknown to user), measure the first item and pass `itemSize` to Virtua.

**Pros:**
- Eliminates estimation entirely once measured
- Perfect scrollbar accuracy after measurement
- Best performance
- Users only declare `fixedItemSize={true}`, no pixel values needed

**Cons:**
- Only works when all items have identical heights
- Not suitable for dynamic content
- Requires initial render to measure
- One-time layout shift when size is determined
- Complex implementation: measure → update → remount virtualizer

**Implementation approach:**
1. User sets `fixedItemSize={true}` prop
2. Render first item non-virtualized to measure
3. Store measured height
4. Re-render with `itemSize` prop set
5. Handle edge cases: empty lists, item changes, responsive layouts

**Challenges:**
- Measurement timing (useLayoutEffect vs useEffect)
- Handling responsive resizes
- Avoiding infinite render loops
- Initial flash/reflow as virtualizer remounts

### 2. **Accept Limitation for Dynamic Items** (Selected for dynamic content)
Acknowledge this as an inherent tradeoff of dynamic virtualization.

**Pros:**
- Zero implementation cost
- All dynamic virtualizers have this issue (FlashList, react-virtuoso, etc.)
- Industry-standard behavior

**Cons:**
- Scrollbar position inaccuracy for dynamic content

## Rejected Options

### Custom Scrollbar
**Rejected** - Complex, loses native behavior, accessibility issues, maintenance burden

### Non-virtualized Fallback
**Rejected** - Performance degradation, defeats purpose of virtualization

### Better Estimation Tuning
**Rejected** - Only marginal improvement, still fundamentally limited

## Implementation Plan

### Phase 1: Auto-Measurement for Fixed-Size Items

**New API:**
```tsx
<List fixedItemSize={true} ... />
```

### Approach Comparison

#### Approach A: Pre-Mount Single Measurement (Recommended)
**Concept:** Measure ONE item before mounting Virtualizer, then use that size for all items.

**Implementation:**
1. When `fixedItemSize={true}` and items available:
   - Render first item in hidden container (off-screen or visibility:hidden)
   - Use `ResizeObserver` or `getBoundingClientRect()` to measure height
   - Store measured height in component state
2. Once measured, mount Virtualizer with `itemSize` prop
3. Re-measure on:
   - Item data changes (first item changes)
   - Window resize (debounced)
   - Responsive breakpoints

**Pros:**
- ✅ Simple: measure once, use everywhere
- ✅ Clear state flow: unmeasured → measuring → measured
- ✅ Can defer Virtualizer mount until size known
- ✅ No per-item measurement overhead
- ✅ Minimal layout shift (measurement happens before visible render)

**Cons:**
- ⚠️ Requires items array to have at least one item
- ⚠️ Initial delay before list appears (measurement phase)
- ⚠️ Must handle measurement failures gracefully

**State machine:**
```
UNMEASURED → MEASURING → MEASURED
                ↓           ↓
           (render hidden) (render Virtualizer)
```

#### Approach B: Lazy Per-Item Measurement
**Concept:** As Virtualizer requests each item, measure it on-demand in hidden state first.

**Implementation:**
1. Maintain measurement cache: `Map<itemId, height>`
2. When Virtualizer requests item:
   - Check cache for measured height
   - If not cached: render hidden, measure, store in cache
   - If cached: render normally with known size
3. Update Virtualizer when measurements change

**Pros:**
- ✅ Progressive measurement (only measure what's needed)
- ✅ No upfront delay
- ✅ Can handle items added dynamically

**Cons:**
- ❌ More complex state management
- ❌ Virtua doesn't support per-item sizes (requires uniform `itemSize`)
- ❌ Measurement phase for each new item causes flickering
- ❌ Cache invalidation complexity
- ❌ Doesn't solve the original problem (Virtua needs a single `itemSize`)

**Verdict:** Not viable - Virtua's `itemSize` prop expects a single value for all items.

### Selected Approach: A (Pre-Mount Single Measurement)

**Rationale:** 
- Matches Virtua's API (single `itemSize` value)
- Simpler implementation
- Better UX (one measurement phase vs ongoing flicker)
- Aligns with "fixed-size items" assumption

### Implementation Details

**1. Measurement Strategy**

```tsx
// State management
const [itemHeight, setItemHeight] = useState<number | null>(null);
const [isMeasuring, setIsMeasuring] = useState(false);
const measurementRef = useRef<HTMLDivElement>(null);

// Trigger measurement
useEffect(() => {
  if (fixedItemSize && rows.length > 0 && itemHeight === null && !isMeasuring) {
    setIsMeasuring(true);
    // Measurement happens in next render
  }
}, [fixedItemSize, rows.length, itemHeight, isMeasuring]);

// Perform measurement
useLayoutEffect(() => {
  if (isMeasuring && measurementRef.current) {
    const observer = new ResizeObserver((entries) => {
      const height = entries[0].contentRect.height;
      if (height > 0) {
        setItemHeight(height);
        setIsMeasuring(false);
      }
    });
    
    observer.observe(measurementRef.current);
    return () => observer.disconnect();
  }
}, [isMeasuring]);
```

**2. Rendering Logic**

```tsx
// Phase 1: Measuring (render first item hidden)
if (fixedItemSize && isMeasuring && rows.length > 0) {
  return (
    <div style={{ position: 'absolute', visibility: 'hidden', pointerEvents: 'none' }}>
      <div ref={measurementRef}>
        {itemRenderer(rows[0], rows[0][idKey], 0, 1)}
      </div>
    </div>
  );
}

// Phase 2: Measured (render Virtualizer with itemSize)
if (fixedItemSize && itemHeight !== null) {
  return (
    <Virtualizer
      itemSize={itemHeight}  // Use measured height
      {...otherProps}
    />
  );
}

// Phase 3: Dynamic sizing (no fixedItemSize)
return (
  <Virtualizer
    // No itemSize prop
    {...otherProps}
  />
);
```

**3. Re-measurement Triggers**

```tsx
// Re-measure when first item changes
useEffect(() => {
  if (fixedItemSize && rows.length > 0) {
    const firstItemId = rows[0][idKey];
    if (firstItemId !== prevFirstItemId.current) {
      prevFirstItemId.current = firstItemId;
      setItemHeight(null); // Trigger re-measurement
    }
  }
}, [fixedItemSize, rows, idKey]);

// Re-measure on resize (debounced)
useEffect(() => {
  if (!fixedItemSize || !itemHeight) return;
  
  const handleResize = debounce(() => {
    setItemHeight(null); // Trigger re-measurement
  }, 300);
  
  window.addEventListener('resize', handleResize);
  return () => {
    window.removeEventListener('resize', handleResize);
    handleResize.cancel();
  };
}, [fixedItemSize, itemHeight]);
```

**4. Edge Cases**

| Case | Handling |
|------|----------|
| Empty list | Skip measurement, show empty state normally |
| SSR | Skip measurement server-side, measure on client hydration |
| Measurement fails (height = 0) | Fallback to dynamic sizing (no itemSize) |
| Items change during measurement | Cancel current measurement, restart |
| Rapid prop changes | Debounce re-measurements |
| Component unmounted during measurement | Clean up ResizeObserver |

**5. Performance Optimizations**

- Use `useLayoutEffect` for measurement (before paint)
- Debounce resize events (300ms)
- Memoize item renderer to prevent unnecessary re-renders
- Cache measurement per item template (if template changes, re-measure)

**6. Testing Strategy**

```typescript
test("measures first item before rendering Virtualizer", async ({ initTestBed, page }) => {
  await initTestBed(`
    <List2 fixedItemSize={true} data="{[{id: 1, name: 'Item 1'}]}">
      <Card title="{$item.name}" />
    </List2>
  `);
  
  // Should render Virtualizer after measurement
  await expect(page.getByText("Item 1")).toBeVisible();
});

test("re-measures when first item changes", async ({ initTestBed, page }) => {
  const { testStateDriver } = await initTestBed(`
    <List2 fixedItemSize={true} data="{testState.items}">
      <Card title="{$item.name}" />
    </List2>
    <script>
      testState = { items: [{id: 1, name: 'Short'}] };
    </script>
  `);
  
  await expect(page.getByText("Short")).toBeVisible();
  
  // Change to taller item
  await testStateDriver.setState({ 
    items: [{id: 2, name: 'Very\nLong\nMultiline\nItem'}] 
  });
  
  // Should re-measure and display correctly
  await expect(page.getByText(/Very.*Long/)).toBeVisible();
});
```

**7. Critical Requirements**

- ✅ Measurement must complete before Virtualizer mounts
- ✅ Handle measurement phase without visible UI changes
- ✅ Clean up observers on unmount
- ✅ Graceful fallback if measurement fails
- ✅ Re-measure on legitimate changes only (avoid loops)
- ✅ Document behavior clearly in component docs

### Phase 2: Documentation

Document the limitation clearly:
- Explain scrollbar behavior with dynamic items
- Note this is common across all virtualizers
- Recommend `fixedItemSize={true}` where possible
- Show examples of when to use fixed vs dynamic sizing

## Testing Checklist

- [ ] Fixed-size items with various heights (50px, 100px, 200px)
- [ ] Empty lists → populated lists transition
- [ ] Responsive resize handling
- [ ] SSR/hydration scenarios
- [ ] Item changes (content updates)
- [ ] Reverse scroll + fixed size
- [ ] Infinite scroll + fixed size
- [ ] Performance with large datasets
