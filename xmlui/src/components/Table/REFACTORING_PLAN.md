# Table Component Refactoring Plan: @tanstack/react-virtual → virtua

## Overview

This document outlines the plan to refactor the Table component from using `@tanstack/react-virtual` to using the `virtua` package, aligning with the patterns already established in the List and Tree components.

**Current State:**
- Table uses: `@tanstack/react-virtual` (v3.10.8)
- List uses: `virtua` (v0.48.2)
- Tree uses: `virtua` (v0.48.2)

**Goal:** Adopt `virtua` for consistency and to leverage existing XMLUI patterns.

## Architecture Analysis

### Current Implementation (Table with @tanstack/react-virtual)

**Files:**
- `TableNative.tsx` - Main component with virtualization logic
- `useRowSelection.ts` - Row selection state management
- `react-table-config.d.ts` - TanStack Table type merging

**Key Components:**
- Uses `useReactTable()` from `@tanstack/react-table` for table logic
- Uses `useVirtualizer()` from `@tanstack/react-virtual` for row virtualization
- Manual column resizing with `columnResizeMode: "onChange"`
- Custom row selection checkbox with hover states
- Pagination support via `getPaginationRowModel()`
- Column pinning support

**Virtualization Approach:**
- Estimates row heights dynamically
- Manages scroll position with padding top/bottom calculation
- Overscan set to 5 items
- Supports both inside and outside scroll parents

### Reference Implementations

**List Component (virtua):**
```typescript
import { Virtualizer, type CustomItemComponent, type VirtualizerHandle } from "virtua";

// Fixed or measured item size
<Virtualizer
  shift={shouldShift}
  onScroll={onScroll}
  ref={virtualizerRef}
  scrollElement={scrollElementRef.current}
  itemSize={measuredItemSize || 67}
>
  {rows.map((row, index) => (
    <Item key={key}>
      {itemRenderer(row, key, index, rowCount)}
    </Item>
  ))}
</Virtualizer>
```

**Tree Component (virtua):**
- Uses `Virtualizer` with fixed `itemHeight` (32px)
- Manages 1000s of nodes efficiently
- Keyboard navigation integrated

**Key Differences:**
1. **API:** virtua uses simpler prop-based API vs. TanStack's hook-based approach
2. **Item Sizing:** virtua supports fixed, measured, or variable sizes; TanStack requires manual estimation
3. **Scroll Handling:** virtua has simpler `onScroll` callback
4. **Ref API:** virtua's `VirtualizerHandle` has simpler methods (`scrollToIndex`, `findItemIndex`)
5. **DOM Structure:** virtua renders items in a flat list; TanStack works with React Table's row model

## Critical Challenges Identified

### Height Calculation Complexity

Based on the List migration experience, the height calculation is **the most challenging aspect**:

1. **TanStack Virtual:**
   - Uses `estimateSize` callback with dynamic measurement
   - Calls `measureElement()` on each row to get actual height
   - Automatically adjusts virtual scrolling based on measured heights
   - Handles variable row heights well

2. **virtua:**
   - Requires `itemSize` prop (fixed size or measured size)
   - For variable heights: needs `undefined` itemSize (but this has edge cases)
   - For fixed heights: works great but all rows must be same height
   - Height measurement timing is critical (must happen before render)

3. **Table-Specific Issues:**
   - Row heights vary based on cell content
   - Column resizing changes row heights dynamically
   - Cell wrapping can cause unpredictable heights
   - Checkbox tolerance feature needs precise positioning

### Risk Assessment

| Risk | Severity | Impact |
|------|----------|--------|
| Variable row heights break virtualization | **HIGH** | Scrolling jumps, incorrect positioning |
| Loss of dynamic height measurement | **HIGH** | Layout issues with wrapped content |
| Column resizing causes height recalculation | **MEDIUM** | Performance degradation |
| Checkbox tolerance positioning breaks | **MEDIUM** | UX regression |
| Test failurStaged Implementation (If Phase 2 succeeds - Estimated 6-8 hours)

**Approach:** Implement in small, testable increments. Each step must pass tests before proceeding.

#### Step 3.1: Parallel Implementation (Do NOT remove TanStack Virtual yet)

1. **Add virtua alongside existing code:**
   ```typescript
   // Keep both imports
   import { useVirtualizer } from "@tanstack/react-virtual";
   import { Virtualizer, type VirtualizerHandle } from "virtua";
   ```

2. **Add feature flag in TableNative.tsx:**
   ```typescript
   const USE_VIRTUA = false; // Toggle for testing
   ```

3. **Implement virtua path conditionally:**
   - Wrap virtua implementation in `if (USE_VIRTUA) { ... }`
   - Keep existing TanStack Virtual as fallback
   - Both paths coexist in same file

4. **Test with flag toggling:**
   - Run tests with `USE_VIRTUA = false` (baseline)
   - Run tests with `USE_VIRTUA = true` (new implementation)
   - Compare results

**Benefits:**
- Safe: Can always fall back to working version
- Easy comparison: Toggle flag to see differences
- Low risk: Not removing working code yet

#### Step 3.2: Fixed Height Implementation

1. **Row Height Strategy:**
   - Start with **fixed height: 40px** (measured from current default)
   - Add to defaultProps:
     ```typescript
     export const defaultProps = {
       // ... existing
       rowHeight: 40,
     };
     ```

2. **Simple virtua integration:**
   ```typescript
   if (USE_VIRTUA) {
     return (
       <Virtualizer
         ref={virtualizerRef}
         itemSize={rowHeight || 40}
       >
         {rows.map((row, rowIndex) => (
           <tr key={row.id}>{/* render cells */}</tr>
         ))}
       </Virtualizer>
     );
   }
   ```

3. **Handle table structure:**
   - virtua expects flat list of items
   - Table needs `<table><tbody>` wrapper
   - Solution: Render table structure around Virtualizer

**Test Checkpoint:** Run basic rendering tests. Must pass before proceeding.

#### Step 3.3: Measured Height Implementation (If fixed height isn't sufficient)

1. **Follow List pattern exactly:**
   ```typescript
   const firstRowRef = useRef<HTMLTableRowElement>(null);
   const [measuredRowHeight, setMeasuredRowHeight] = useState<number | undefined>(undefined);
   
   useEffect(() => {
     if (firstRowRef.current && !measuredRowHeight && rows.length > 0) {
       requestAnimationFrame(() => {
         if (firstRowRef.current) {
           const height = firstRowRef.current.offsetHeight;
           if (height > 0) {
             setMeasuredRowHeight(height);
           }
         }
       });
     }
   }, [measuredRowHeight, rows.length]);
   ```

2. **Render first row with ref:**
   ```typescript
   const isFirstRow = rowIndex === 0;
   <tr ref={isFirstRow ? firstRowRef : undefined}>
   ```

3. **Use measured or fallback:**
   ```typescript
   itemSize={measuredRowHeight || 40}
   ```

**Test Checkpoint:** Verify measured height works with various content types.

#### Step 3.4: Scroll Management
hase 4.1: Baseline Testing**

1. **Establish baseline with TanStack Virtual:**
   ```bash
   npm run test Table.spec.ts -- --reporter=line
   ```
   - Document: How many pass/fail
   - Capture: Any warnings or errors
   - Save: Test output for comparison

2. **Test with feature flag disabled:**
   ```typescript
   USE_VIRTUA = false
   ```
   - Should match baseline exactly
   - Confirms parallel implementation doesn't break existing code

**Phase 4.2: Incremental Testing (During Implementation)**

Test after EVERY step in Phase 3:

1. **After Step 3.1 (Parallel Setup):**
   ```bash
   # Test with flag off
   USE_VIRTUA=false npm run test Table.spec.ts
   # Should pass all baseline tests
   ```

2. **After Step 3.2 (Fixed Height):**
   ```bash
   # Test witCleanup & Finalization (Estimated 2-3 hours)

**Phase 5.1: Remove Feature Flag (Only if Phase 4 passed 100%)**

1. **Set feature flag to true permanently:**
   ```typescript
   const USE_VIRTUA = true;
   ```

2. **Run full test suite one more time:**
   - All tests must pass
   - No warnings or errors

3. **Remove TanStack Virtual code:**
   - Delete `if (!USE_VIRTUA)` branches
   - Remove old virtualization code
   - Remove TanStack Virtual import
   - Clean up unused variables

4. **Final test run:**
   ```bash
   npm run test Table.spec.ts
   # Must pass 100%
   ```

**Phase 5.2: Documentation**

1. **Update component metadata if needed:**
   - Add `rowHeight` property if exposed
   - Document any behavior changes

2. **Update internal comments:**
   - Explain virtua integration
   - Document height measurement approach
   - Note any limitations

3. **Create migration notes:**
   - What changed
   - Why we migrated
   - Any breaking changes (should be none)

**Phase 5.3: Performance Validation**

1. **Benchmark report:**
   - Document scroll performance
   - Document memory usage
   - Compare to TanStack Virtual
   - Should be equal or better

2. **Optimize if needed:**
   - Adjust overscan (currently 5 items)
   - Fine-tune scroll handling
   - Optimize re-renders

### Phase 6: Optional Dependency Cleanup (Post-merge)

**After migration is stable in production:**

1. **Check if @tanstack/react-virtual is used elsewhere:**
   ```bash
   git grep "useVirtualizer\|@tanstack/react-virtual"
   ```

2. **If Table was the only user:**
   - Remove from package.json
   - Update lock file
   - Test full build

3. **If other components use it:**
   - Document that Table no longer uses it
   - Plan future migrations if desired
4. **After Step 3.4 (Scroll Management):**
   ```bash
   USE_VIRTUA=true npm run test Table.spec.ts
   # Goal: >90% of tests pass
   ```

5. **After Step 3.5 (Each Feature):**
   - Test specific feature category
   - Must pass before adding next feature

**Phase 4.3: Final Validation**

1. **Full test suite (virtua enabled):**
   ```bash
   USE_VIRTUA=true npm run test Table.spec.ts
   # Goal: 100% pass rate matching baseline
   ```

2. **Performance testing:**
   - Create test with 5000 rows (paginated to 100 per page)
   - Measure scroll FPS
   - Measure memory usage
   - Compare to TanStack Virtual baseline
   - **Acceptance:** No worse than 5% degradation

3. **Edge case validation:**
   - Empty data
   - Single row
   - Very wide columns
   - Wrapped cell content
   - All content types (strings, numbers, nulls)
   - Checkbox tolerance at boundaries

4. **Browser testing:**
   - Chrome (primary)
   - Safari
   - Firefox
   - Test zoom levels (100%, 125%, 150%)

**Phase 4.4: Regression Testing**

1. **Visual regression:**
   - Screenshots of key scenarios
   - Compare TanStack Virtual vs virtua
   - Verify: No visual differences

2. **Interaction testing:**
   - Click row selection
   - Keyboard navigation
   - Sorting
   - Pagination
   - Column resizing
   - Scrolling (mouse wheel, scrollbar, keyboard)
### Go/No-Go Decision Points

**After Phase 2 (Prototyping):**
- [ ] ✅ GO: Basic virtua implementation works
- [ ] ✅ GO: At least 50% of basic tests pass
- [ ] ✅ GO: Performance is acceptable
- [ ] ✅ GO: Clear path forward identified
- [ ] ❌ NO-GO: virtua can't handle table structure
- [ ] ❌ NO-GO: Performance significantly worse
- [ ] ❌ NO-GO: Height calculation unsolvable

**After Phase 4 (Testing):**
- [ ] ✅ GO: 100% test pass rate
- [ ] ✅ GO: Performance matches or exceeds baseline
- [ ] ✅ GO: No visual regressions
- [ ] ✅ GO: No accessibility regressions
- [ ] ❌ NO-GO: Cannot achieve 100% test pass
- [ ] ❌ NO-GO: Performance degradation >5%
- [ ] ❌ NO-GO: Unfixable visual issues

### Final Success Criteria

- [x] Phase 1: Plan created and documented
- [ ] Phase 2: Prototype proves viability
- [ ] Phase 3: Implementation complete with tests passing incrementally
- [ ] Phase 4: All existing tests pass (60+ tests) - **MANDATORY**
- [ ] Phase 4: Performance: No degradation >5% in scroll or memory
- [Risk Mitigation & Rollback Strategy

### Rollback Plan

If at any phase we decide to abort:

1. **During Phase 2 (Prototyping):**
   - Simply delete experimental branch
   - No impact on main codebase
   - Zero risk

2. **During Phase 3 (Implementation):**
   - Set `USE_VIRTUA = false`
   - All tests should pass with TanStack Virtual
   - Can ship with fallback enabled
   - Remove virtua code in cleanup PR

3. **During Phase 4 (Testing):**
   - If tests fail: debug or rollback
   - Set hard limit: If >2 days debugging with no progress, rollback
   - Feature flag allows shipping with old implementation

4. **After Phase 5 (Post-cleanup):**
   - Revert commit with cleanup
   - Restore feature flag
   - Set `USE_VIRTUA = false`
   - Ship hotfix if needed

### Risk Mitigation Strategies

| Risk | Mitigation |
|------|-----------|
| Variable heights break | Use measured height from first row (List pattern) |
| Tests fail | Fix incrementally; rollback if >2 days |
| Performance worse | Prototype first; NO-GO if >5% slower |
| Height timing issues | Use requestAnimationFrame (List pattern) |
| Column resize breaks height | Re-measure on resize event |
| Checkbox positioning off | Keep existing tolerance calculations |
| Scroll jumps | Use virtua's `shift` prop for prepending |
| Memory leaks | Profile both implementations; compare |

## Questions & Open Items

1. **Row Height:** Should we start with fixed 40px or implement measured height immediately?
   - **Revised Decision:** Prototype both in Phase 2, decide based on test results
   - **Fallback:** If measured height too complex, fixed is acceptable for Table
   
2. **Backward Compatibility:** Any public APIs that might break?
   - **Assessment:** No - virtualization is internal implementation detail
   - **Validation:** Will be verified in Phase 4 testing
   
3. **Performance Baseline:** Current performance with TanStack Virtual?
   - **Action:** Benchmark in Phase 2, establish acceptance threshold
   - **Threshold:** No more than 5% degradation acceptable

4. **Star-sized Columns:** Does virtua affect star-sized column calculations?
   - **Assessment:** No - handled by TanStack Table; virtua only affects row rendering
   - **Validation:** Test in Phase 3.5 (column resizing feature)

5. **Should we even do this migration?**
   - **Answer:** Phase 2 will determine this
   - **If NO-GO:** Document why, archive this plan
   - **If GO:** Proceed with confidence

6. **Time box:** Should we set a maximum time investment?
   - **Proposal:** If Phase 2+3 takes >16 hours total, stop and reassess
   - **Rationale:** Diminishing returns; consistency is nice but not critical

---

**Document Status:** Ready for Phase 2 (Prototyping)
**Last Updated:** 2026-01-22
**Version:** 2.0 (Revised for incremental approach with validation gates)
**Key Change:** Added mandatory prototyping phase with GO/NO-GO decision point
**Key Differences from Original Plan:**
- Added mandatory prototyping phase (Phase 2)
- Added GO/NO-GO decision points
- More detailed incremental testing
- Parallel implementation (feature flag approach)
- Conservative timeline with built-in validation gates
- Explicit rollback strategy

1. **Row Height Strategy**
   - **Before:** Dynamic estimation with `estimateSize` callback
   - **After:** Fixed or measured item size (similar to List pattern)
   - Decision: Start with **fixed height** (most straightforward)
     - Default to 30-40px per row
     - Add optional `rowHeight` property to component metadata
     - For future: Support measured heights using refs (like List's `fixedItemSize` approach)

2. **Scroll Parent Detection**
   - Keep existing: `useScrollParent()`, `useHasExplicitHeight()`, `useStartMargin()`
   - Adapt for virtua: Pass `scrollElement` instead of `getScrollElement` callback

3. **Virtualizer Integration**
   - Replace `useVirtualizer()` with `<Virtualizer>` component
   - Structure:
     ```typescript
     <Virtualizer
       ref={virtualizerRef}
       scrollElement={scrollElement}
       itemSize={rowHeight}
       shift={shouldShift}  // For prepending support
       onScroll={handleScroll}
     >
       {visibleRows.map((row) => renderTableRow(row))}
     </Virtualizer>
     ```

4. **Row Rendering**
   - Keep TanStack Table's `table.getRowModel().rows`
   - Map directly to virtua's children
   - Remove manual padding calculations (virtua handles this)

5. **Scroll Position Management**
   - Replace: `rowVirtualizer.getVirtualItems()`, padding calculations
   - Keep: `scrollToIndex()`, `scrollToId()` via `virtualizerRef.current?.scrollToIndex()`
   - Keep: Bottom-stick behavior with ref tracking

6. **Pagination Integration**
   - No changes needed; works independently from virtualization
   - Pagination controls pagination state
   - Virtualizer handles rendering of current page's visible rows

7. **Column Pinning & Resizing**
   - Keep: Existing CSS-based pinning with `position: sticky`
   - Keep: TanStack Table's column resizing logic
   - Adjustment: Ensure column sizing doesn't conflict with virtua's row sizing

### Phase 4: Testing & Validation (Estimated 3-4 hours)

**Pre-Refactoring:**
1. Run all existing tests to establish baseline
   ```bash
   npm run test Table.spec.ts
   ```

**During Refactoring:**
1. Incremental testing after each major change
2. Focus on test categories:
   - ✅ Basic rendering
   - ✅ Data display
   - ✅ Column headers
   - ✅ Pagination
   - ✅ Row selection
   - ✅ Sorting
   - ✅ Scrolling behavior

**Post-Refactoring:**
1. Run full test suite: `npm run test Table.spec.ts`
2. Verify test categories pass (60+ existing tests)
3. Performance testing:
   - Large datasets (1000+ rows, with pagination)
   - Scroll performance
   - Memory usage comparison
4. Edge case validation:
   - Empty data
   - Single row
   - Mixed content types
   - Checkbox tolerance (hover area)

### Phase 5: Performance & Polish (Estimated 2-3 hours)

**Performance:**
1. Benchmark virtualization with large datasets
2. Compare memory usage vs. TanStack Virtual
3. Optimize overscan settings (current: 5 items)
4. Test scroll smoothness

**Polish:**
1. Update component documentation if row height changes
2. Verify accessibility is maintained
3. Test keyboard navigation
4. Validate ARIA attributes

## API Preservation Matrix

| Feature | Current | After | Change? |
|---------|---------|-------|---------|
| Data rendering | ✅ | ✅ | No |
| Column definitions | ✅ | ✅ | No |
| Sorting | ✅ | ✅ | No |
| Pagination | ✅ | ✅ | No |
| Row selection | ✅ | ✅ | No |
| Column pinning | ✅ | ✅ | No |
| Column resizing | ✅ | ✅ | No |
| Virtualization | ✅ (TanStack) | ✅ (virtua) | Implementation |
| scrollToIndex() | ✅ | ✅ | Signature may simplify |
| Loading state | ✅ | ✅ | No |
| Context menu | ✅ | ✅ | No |
| Accessibility | ✅ | ✅ | Verify |

## Technical Considerations

### Advantages of virtua

1. **Simplicity:** Simpler API, fewer callbacks to manage
2. **Consistency:** Aligns with List and Tree implementations
3. **Maintenance:** Reduces dependencies (can eventually deprecate TanStack Virtual)
4. **Fixed Heights:** Better for table rows (typically uniform heights)
5. **Bundle Size:** Lighter weight than TanStack Virtual

### Challenges & Mitigations

| Challenge | Mitigation |
|-----------|-----------|
| Variable row heights (spanning, content) | Start with fixed height; add measured support if needed (see List pattern) |
| Column resizing compatibility | TanStack Table handles column sizing; virtua only manages row virtualization |
| Pagination + virtualization interaction | Keep pagination separate; virtualizer operates on paginated data subset |
| Star-sized columns with gap | Keep existing gap calculation; no conflict with row virtualization |
| Checkbox hover tolerance | Keep existing tolerance logic; independent of virtualization |
| Ref API differences | Map TanStack Virtual ref API to virtua equivalent (simple mapping) |

## Implementation Details

### Ref API Mapping

```typescript
// TanStack Virtual → virtua
rowVirtualizer.getVirtualItems()           // virtua: scroll calculation internal
rowVirtualizer.getTotalSize()              // virtua: handled internally
rowVirtualizer.getScrollElement()          // virtua: scrollElement prop
rowVirtualizer.measure()                   // virtua: not needed (fixed size)
rowVirtualizer.scrollToIndex(idx, align)   // virtua: virtualizerRef.current?.scrollToIndex(idx, { align })
```

### Scroll Parent Handling

**Current (TanStack Virtual):**
```typescript
getScrollElement: useCallback(() => {
  return hasOutsideScroll && scrollRef?.current 
    ? scrollRef?.current 
    : wrapperRef.current;
}, [scrollRef, hasOutsideScroll])
```

**After (virtua):**
```typescript
scrollElement={
  hasOutsideScroll && scrollRef?.current 
    ? scrollRef?.current 
    : undefined  // undefined = use virtualizer's own scroll
}
```

### Item Size Configuration

**Recommended approach (following List pattern):**
1. Add optional `rowHeight` prop to Table metadata (default: 40px)
2. Optionally support measured height for future:
   - Use `fixedItemSize` flag like List does
   - Measure first row's actual height
   - Apply to all rows (most tables have uniform heights)

## Rollout Plan

### Before Starting

1. **Create feature branch:** `refactor/table-virtua-migration`
2. **Tag current commit:** For rollback if needed
3. **Run baseline tests:** Document passing/failing status
4. **Notify team:** Communicate timeline and test requirements

### During Development

1. **Small, testable commits:**
   - Commit 1: Add virtua import, remove TanStack Virtual import
   - Commit 2: Replace virtualization logic
   - Commit 3: Adapt scroll handling
   - Commit 4: Test and fix issues

2. **Continuous testing:**
   - Run affected tests after each major change
   - Fix regressions immediately

### After Completion

1. **Full test suite:** Ensure all tests pass
2. **Performance testing:** Benchmark against baseline
3. **Code review:** Team validation
4. **Merge & monitor:** Watch for issues in real usage

## Success Criteria

- [x] Plan created and documented
- [ ] All existing tests pass (60+ tests)
- [ ] Performance: No degradation in scroll smoothness or memory usage
- [ ] Feature parity: All Table features work as before
- [ ] Code quality: Simplified virtualization code
- [ ] Consistency: Aligns with List and Tree patterns
- [ ] Documentation: Updated if public API changed

## Estimated Timeline

| Phase | Duration | Owner |
|-------|----------|-------|
| Phase 1: Planning | ✅ Complete | Done |
| Phase 2: Setup | 2-3 hours | Dev |
| Phase 3: Core Refactoring | 4-6 hours | Dev |
| Phase 4: Testing | 3-4 hours | Dev + QA |
| Phase 5: Polish | 2-3 hours | Dev |
| **Total** | **11-16 hours** | |

## References

- [virtua Documentation](https://github.com/inokawa/virtua)
- List implementation: `/src/components/List/ListNative.tsx`
- Tree implementation: `/src/components/Tree/TreeNative.tsx`
- Current Table: `/src/components/Table/TableNative.tsx`
- Table Tests: `/src/components/Table/Table.spec.ts`

## Questions & Open Items

1. **Row Height:** Should we start with fixed 40px or implement measured height immediately?
   - **Decision:** Start with fixed height (simpler), add measured height support later if needed
   
2. **Backward Compatibility:** Any public APIs that might break?
   - **Assessment:** No - virtualization is internal implementation detail
   
3. **Performance Baseline:** Current performance with TanStack Virtual?
   - **Action:** Benchmark both implementations with 1000+ rows

4. **Star-sized Columns:** Does virtua affect star-sized column calculations?
   - **Assessment:** No - handled by TanStack Table; virtua only affects row rendering

---

**Document Status:** Ready for implementation
**Last Updated:** 2026-01-22
**Version:** 1.0
