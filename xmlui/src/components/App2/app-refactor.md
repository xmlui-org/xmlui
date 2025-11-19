# App Component Refactoring Plan

## Objective
Simplify the App component architecture by creating a cleaner, more maintainable implementation.

## Approach

### Phase 1: Clone and Setup ✅ COMPLETE
- ✅ Clone entire App component to App2 (experimental version)
- ✅ Clone all associated files (tsx, scss, contexts, etc.)
- ✅ Rename files to use App2 prefix (App2.tsx, App2Native.tsx, App2.module.scss, etc.)
- ✅ Update component registration for App2 in ComponentProvider
- ✅ Update component metadata (App2Md, app2Renderer, COMP="App2")
- ✅ Update all imports to reference renamed files

### Phase 2: Test Infrastructure ✅ COMPLETE
- ✅ Create e2e tests for App2 component (tests-e2e/app2-component.spec.ts)
- ✅ Ensure test coverage for core functionality (16 tests covering layouts, navigation, themes)
- ✅ Tests validate App2 works independently
- ✅ All tests passing

### Phase 3: Incremental CSS Rebuild (Next Step)
- Delete App2.module.scss file
- Rebuild styles incrementally following layout plans in app-next.md
- Implement one layout variant at a time
- Test each layout before proceeding to next

## Layout Implementation Order
Follow the layout definitions from app-next.md:
1. Desktop layout (simplest - full viewport)
2. Vertical layout (basic column arrangement)
3. Vertical-sticky layout
4. Horizontal layout
5. Horizontal-sticky layout
6. Condensed layout
7. Condensed-sticky layout
8. Vertical-full-header layout

## Success Criteria
- App2 compiles without errors
- Core layouts work as specified in app-next.md
- No responsive layout complexity
- Cleaner, more maintainable code structure
- All e2e tests pass

## Future Work
- Once App2 is stable and validated, consider migration path from App to App2
- Evaluate if App2 should replace App or coexist as alternative

---

## App2Native Component Analysis

### Simplification Opportunities

#### 1. **Eliminate Repeated Ref Callback Pattern**
**Current:** Lines 210-217 use separate `useCallback` for `footerRefCallback` and `headerRefCallback`
**Issue:** Creates two separate callback functions when one reusable pattern could work
**Suggestion:** Extract into a custom hook `useElementSizeObserver` that returns both the ref callback and the current size
**Impact:** Reduces code duplication, improves readability
**Estimated Lines Saved:** ~10 lines

#### 2. **Simplify CSS Variable Calculation Logic**
**Current:** Lines 233-260 have complex conditional logic for `--header-height` and `--footer-height`
**Issue:** Duplicated conditions for header and footer (safeLayout checks repeated)
**Suggestion:** Extract helper function `getLayoutHeightConfig(safeLayout, scrollWholePage)` that returns `{ headerHeight, footerHeight }` multipliers (0 or 1)
**Impact:** Reduces duplication, makes height logic clearer
**Estimated Lines Saved:** ~15 lines

#### 3. **Extract Nav Panel Visibility Logic**
**Current:** Lines 197-199 calculate `navPanelVisible` inline
**Issue:** Logic is fragmented and combines mediaSize, header presence, and layout type
**Suggestion:** Extract to separate hook `useNavPanelVisibility(safeLayout, hasRegisteredHeader, mediaSize, hasRegisteredNavPanel)`
**Impact:** Clearer separation of concerns, easier to test
**Estimated Lines Saved:** ~5 lines, better testability

#### 4. **Consolidate CSS Class Generation**
**Current:** Lines 358-373 build `wrapperBaseClasses` with manual object construction
**Issue:** Media size classes are manually added, creating maintenance burden
**Suggestion:** Extract to helper function `getWrapperClasses(mediaSize, scrollWholePage, noScrollbarGutters, footerSticky, appGlobals, className)`
**Impact:** Cleaner component code, reusable logic
**Estimated Lines Saved:** ~8 lines

#### 5. **Deduplicate Layout JSX Structure**
**Current:** Lines 378-588 contain 8 switch cases with significant duplication
**Issue:** Each case repeats similar wrapper structure with slight variations
**Observation:** Key differences are:
  - Container class names (styles.vertical, styles.horizontal, styles.desktop)
  - Header/footer sticky classes
  - NavPanel position (inside header, before content, or in side panel)
  - Scroll container ref placement
**Suggestion:** Create layout configuration objects that define these variations, then use single JSX template
**Impact:** Major reduction in duplication, easier to maintain layouts
**Estimated Lines Saved:** ~100+ lines (consolidate 8 cases into config-driven approach)

#### 6. **Memoize Footer Stickiness Check**
**Current:** Line 377 calculates `footerShouldBeNonSticky` inline before switch
**Issue:** Small optimization, but could be clearer
**Suggestion:** Use `useMemo` for this calculation or inline it where used (only 3 places)
**Impact:** Minor code clarity improvement
**Estimated Lines Saved:** ~2 lines

#### 7. **Extract Theme Initialization Logic**
**Current:** Lines 135-163 handle theme/tone initialization in useEffect
**Issue:** Long useEffect with multiple concerns (defaultTone, autoDetectTone, defaultTheme)
**Suggestion:** Extract to custom hook `useThemeInitialization(defaultTone, defaultTheme, autoDetectTone)`
**Impact:** Better separation of concerns, more testable
**Estimated Lines Saved:** ~10 lines from component body

#### 8. **Simplify Drawer Management**
**Current:** Lines 266-273, 350-355 manage drawer state with multiple callbacks
**Issue:** Drawer management logic scattered across component
**Suggestion:** Extract to custom hook `useDrawerState(location, navPanelVisible, safeLayout)` that returns `{ drawerVisible, toggleDrawer, handleOpenChange }`
**Impact:** Consolidates drawer logic, clearer dependencies
**Estimated Lines Saved:** ~8 lines

#### 9. **Remove Redundant Default Props Pattern**
**Current:** Lines 66-78 define `defaultProps` object, then destructure in function signature
**Issue:** React 18+ doesn't need separate defaultProps object, can use default parameters directly
**Suggestion:** Remove `defaultProps` object, inline defaults in destructuring
**Impact:** Simpler, more modern React pattern
**Estimated Lines Saved:** ~15 lines

#### 10. **Consolidate Context Value Creation**
**Current:** Lines 302-344 create layoutContextValue, lines 346-350 create linkInfoContextValue
**Issue:** Context values could be created in custom hooks
**Suggestion:** Extract to `useAppLayoutContextValue(...)` and `useLinkInfoContextValue(...)`
**Impact:** Cleaner component body, reusable context logic
**Estimated Lines Saved:** ~10 lines from component

### Potential Issues

#### Issue 1: **Unsafe Dash Character Replacement** ✅ FIXED
**Location:** Lines 117-119
**Problem:** Uses regex to replace various dash characters `[\u2013\u2014\u2011]` in layout string
**Risk:** Could silently fail if unexpected characters appear, or replace dashes in unexpected places
**Severity:** Low (unlikely edge case)
**Recommendation:** Add validation that warns/errors on unexpected layout values, or use whitelist approach
**Test Coverage:** ✅ Added 6 tests in "Layout Input Validation" test group
  - Tests confirm Unicode dash replacement works correctly
  - **REVEALED BUG:** Whitespace-only layout causes component to fail (trimmed empty string not validated)
  - Test with truly invalid layout value should throw error with message "layout type not supported"
**Status:** ✅ **FIXED** - Added sanitization step that falls back to default "condensed-sticky" when trimmed layout is empty string
**Fix Details:** 
  - Separated trim/replace operations from the final type assertion
  - Added fallback: `const safeLayout = (sanitizedLayout || "condensed-sticky") as AppLayoutType;`
  - Whitespace-only layout test now passes
**Note:** Also fixed App2.spec.ts to use `<App2>` instead of `<App>` throughout (was testing wrong component)

#### Issue 2: **NavPanel `when` Condition Not Reactive - Hamburger Menu Visibility Bug** ✅ FIXED
**Location:** Lines 126-135 (App2Native.tsx)
**Problem:** Hamburger menu displayed even when `NavPanel` had `when='false'`, and didn't update reactively when `when` condition changed
**Root Cause:** 
  - Initial approach tried to pre-evaluate `when` condition with empty state `{}` in `useMemo`, which returned incorrect values
  - Attempted complex notification mechanism from NavPanel back to App2Native, but NavPanel doesn't unmount/remount when `when` changes
  - NavPanel stays mounted even when `when='false'` - `renderChild.tsx` just returns `null` instead of content
**Severity:** High (hamburger menu showing when it shouldn't, core functionality broken)
**Test Coverage:** ✅ 8 tests covering all scenarios
  - **Drawer Handling tests** (5 tests): Verify hamburger visibility matches NavPanel's actual render state
    - "Drawer displayed if NavPanel has no 'when'" - hamburger should be visible
    - "Drawer displayed if NavPanel has when='true'" - hamburger should be visible
    - "Drawer displayed if NavPanel has when='{true}'" - hamburger should be visible  
    - "Drawer not displayed if NavPanel has when='false'" - hamburger should be hidden
    - "Drawer not displayed if NavPanel has when='{false}'" - hamburger should be hidden
  - **NavPanel When Condition Reactivity tests** (3 tests): Verify reactivity when state changes
    - Test 1: NavPanel with `when="{showNav}"` - toggle button changes state, hamburger appears/disappears
    - Test 2: NavPanel with `when="{userLoggedIn}"` - login/logout changes state, hamburger appears/disappears
    - Test 3: NavPanel with `when="{count > 0 && count < 5}"` - counter changes, hamburger appears/disappears
**Status:** ✅ **FULLY FIXED** - All 8 tests passing (5 drawer + 3 reactivity)
**Solution:** Simple and elegant - check if `navPanel` prop is actually rendered
  1. `App2.tsx` calls `renderChild(NavPanel)` which evaluates the `when` condition with actual component state
  2. When `when='false'`, `renderChild` returns `null` 
  3. `App2Native` receives the rendered result as `navPanel` prop
  4. Check: `navPanelActuallyRendered = navPanel !== null && navPanel !== undefined`
  5. `hasRegisteredNavPanel = navPanelDef !== undefined && navPanelActuallyRendered`
  6. React's rendering pipeline automatically handles reactivity - when state changes, App2 re-renders, `renderChild` re-evaluates, `navPanel` prop updates
**Key Insight:** No need for complex notification mechanism - the rendered `navPanel` prop IS the notification!
**Files Changed:**
  - `App2Native.tsx` (lines 128-134): Added logic to check if navPanel actually rendered
  - Removed attempted notification mechanism from `AppLayoutContext.ts` and `NavPanelNative.tsx`
**Test Results:**
  - ✅ All 46 App2 tests passing
  - ✅ All 37 App tests passing (no regression)

#### Issue 3: **Race Condition in onReady Callback** ✅ FIXED
**Location:** Lines 162-164 (App2Native.tsx - original), now lines 272-284
**Original Problem:** 
```typescript
useEffect(() => {
  onReady();
}, [onReady]);
```
- `onReady()` would be called again if the `onReady` function reference changed
- Dependency on `[onReady]` meant effect re-ran whenever parent passed a new function reference
**Severity:** Low (minor timing issue, but could cause multiple calls)
**Solution:** ✅ **FIXED** - Use ref to track if onReady has been called, only fire once on mount
```typescript
const onReadyCalledRef = useRef(false);

useEffect(() => {
  if (!onReadyCalledRef.current) {
    onReadyCalledRef.current = true;
    onReady();
  }
  // Empty deps - only run once on mount, regardless of onReady reference changes
}, []);
```
**Fix Details:**
  - Added `onReadyCalledRef` to track whether onReady has been called
  - Changed to empty dependency array `[]` so effect only runs once on mount
  - onReady fires after initial render, regardless of what children exist (header/footer/nav panel optional)
  - No longer re-runs if onReady function reference changes
**Test Coverage:** ✅ All existing onReady tests pass
  - "ready event is triggered when App component finishes rendering" - works with minimal App
  - "ready event is triggered for App with complex content" - works with full header/footer/nav
  - "ready event fires only once during component lifecycle" - confirms no duplicate calls

#### Issue 4: **Scroll Container Ref Logic Complexity** ✅ FIXED
**Location:** Lines 199-207 (App2Native.tsx - original)
**Original Problem:** 
```typescript
const scrollPageContainerRef = useRef(null);
const noScrollPageContainerRef = useRef(null);
const scrollContainerRef = scrollWholePage ? scrollPageContainerRef : noScrollPageContainerRef;
```
- Confusing naming: `scrollPageContainerRef` sounds like it scrolls pages, but it's used when `scrollWholePage=true`
- `noScrollPageContainerRef` suggests "no scroll", but it's actually used for content-only scrolling
**Severity:** Low (works but confusing)
**Solution:** ✅ **FIXED** - Renamed refs for clarity
```typescript
// Refs for scroll containers - naming clarified for better understanding
// pageScrollRef: used when scrollWholePage=true (entire page scrolls)
// contentScrollRef: used when scrollWholePage=false (only content area scrolls)
const pageScrollRef = useRef(null);
const contentScrollRef = useRef(null);
const scrollContainerRef = scrollWholePage ? pageScrollRef : contentScrollRef;
```
**Fix Details:**
  - Renamed `scrollPageContainerRef` → `pageScrollRef` (clearer: page-level scrolling)
  - Renamed `noScrollPageContainerRef` → `contentScrollRef` (clearer: content-area scrolling)
  - Updated all 13 usages throughout the component's layout switch cases
  - Added explanatory comments to clarify the purpose of each ref
**Test Coverage:** ✅ All 46 tests passing - no behavioral changes, only naming improvements

#### Issue 5: **Missing Cleanup for forceRefreshAnchorScroll**
**Location:** Lines 283-288
**Problem:** Two refs (`scrollPageContainerRef`, `noScrollPageContainerRef`) are conditionally assigned to `scrollContainerRef`
**Risk:** Confusing logic - one is for page scroll, one for content scroll, but naming suggests inverse
**Severity:** Low (works but confusing)
**Recommendation:** Rename to `pageScrollRef` and `contentScrollRef` for clarity

#### Issue 5: **Missing Cleanup for forceRefreshAnchorScroll**
**Location:** Lines 283-288
**Problem:** Uses `requestAnimationFrame` but doesn't cancel in cleanup
**Risk:** If component unmounts before frame callback executes, could cause errors
**Severity:** Low (rare unmount timing)
**Recommendation:** Store `requestAnimationFrame` ID and cancel in effect cleanup

#### Issue 6: **Drawer State Synchronization**
**Location:** Lines 350-355 (two separate useEffects for drawer visibility)
**Problem:** Two separate effects set `drawerVisible` to false - one on navPanelVisible change, one on location/layout change
**Risk:** Could cause double renders, unclear which effect "owns" the state change
**Severity:** Low (minor performance)
**Recommendation:** Combine into single effect with clear comment explaining the logic

#### Issue 7: **Desktop Layout Always Forces Sticky Footer**
**Location:** Lines 554-583 (desktop case)
**Problem:** Desktop layout always adds `styles.sticky` to footer, ignoring `footerSticky` prop
**Risk:** Inconsistent with other layouts where `footerSticky` is respected
**Severity:** Medium (API inconsistency)
**Recommendation:** Respect `footerSticky` prop in desktop layout too, or document why desktop is special

#### Issue 8: **Helper Function Placement**
**Location:** Lines 620-628 (`getAppLayoutOrientation`)
**Problem:** Function defined after component but exported, unclear if it's used internally or public API
**Severity:** Low (organization issue)
**Recommendation:** Move to separate utils file if public API, or use as internal helper only

### Refactoring Workflow

Each refactoring step follows this workflow:

1. **Implement** the refactoring changes for the current step
2. **Test** by running `npm run test:e2e -- App2.spec.ts --reporter=line`
3. **Evaluate** the test results:
   - ✅ **All tests pass** → Stop and wait for external review before proceeding to next step
   - ❌ **Tests fail** → Begin fix iteration process (up to 3 attempts):
     - Iteration 1: Analyze failure, apply fix, re-run tests
     - Iteration 2: If still failing, try alternative fix, re-run tests
     - Iteration 3: If still failing, try final fix approach, re-run tests
   - ✅ **Fix successful** → Stop and wait for external review
   - ❌ **All 3 fix iterations failed** → Revert the entire refactoring step using git, document the issue, and stop for external review

This workflow ensures:
- Each change is validated immediately
- Broken changes are caught before moving forward
- External review confirms the component still works correctly
- Failed refactorings are safely reverted without leaving the codebase in a broken state

### Refactoring Steps (Smallest Possible)

#### Step 1: Remove defaultProps object pattern
**Files:** App2Native.tsx
**Changes:** Inline default values in function parameter destructuring, remove lines 66-78
**Testing:** Verify component still receives correct defaults
**Risk:** Low

#### Step 2: Extract useElementSizeObserver hook
**Files:** App2Native.tsx, new file App2Hooks.ts
**Changes:** Create custom hook that combines ref callback + resize observer logic
**Testing:** Verify header/footer heights still calculate correctly
**Risk:** Low

#### Step 3: Extract getLayoutHeightConfig helper
**Files:** App2Native.tsx, new file App2Utils.ts
**Changes:** Create pure function for height calculation logic
**Testing:** Verify CSS variables are set correctly
**Risk:** Low

#### Step 4: Extract useNavPanelVisibility hook
**Files:** App2Native.tsx, App2Hooks.ts
**Changes:** Move nav panel visibility logic to custom hook
**Testing:** Verify nav panel shows/hides correctly in all layouts
**Risk:** Low

#### Step 5: Extract getWrapperClasses helper
**Files:** App2Native.tsx, App2Utils.ts
**Changes:** Move class generation to pure function
**Testing:** Verify CSS classes are applied correctly
**Risk:** Low

#### Step 6: Extract useThemeInitialization hook
**Files:** App2Native.tsx, App2Hooks.ts
**Changes:** Move theme initialization logic to custom hook
**Testing:** Verify themes initialize correctly on mount
**Risk:** Low

#### Step 7: Extract useDrawerState hook
**Files:** App2Native.tsx, App2Hooks.ts
**Changes:** Consolidate drawer state management
**Testing:** Verify drawer opens/closes correctly
**Risk:** Low

#### Step 8: Extract useAppLayoutContextValue hook
**Files:** App2Native.tsx, App2Hooks.ts
**Changes:** Move context value creation to custom hook
**Testing:** Verify context consumers receive correct values
**Risk:** Low

#### Step 9: Extract useLinkInfoContextValue hook
**Files:** App2Native.tsx, App2Hooks.ts
**Changes:** Move link info context creation to custom hook
**Testing:** Verify breadcrumbs/navigation state works
**Risk:** Low

#### Step 10: Create layout configuration system
**Files:** App2Native.tsx, new file App2LayoutConfigs.ts
**Changes:** Define configuration objects for each layout variant
**Testing:** Verify all 8 layouts render correctly
**Risk:** Medium (significant structural change)

#### Step 11: Consolidate layout rendering with config-driven approach
**Files:** App2Native.tsx, App2LayoutConfigs.ts
**Changes:** Replace switch statement with single JSX template using layout configs
**Testing:** Verify all layouts work, run full e2e test suite
**Risk:** Medium (significant structural change)

#### Step 12: Fix desktop layout footer sticky inconsistency
**Files:** App2Native.tsx
**Changes:** Respect footerSticky prop in desktop layout
**Testing:** Verify desktop footer behavior matches expectations
**Risk:** Low (but may be breaking change if current behavior is relied upon)

#### Step 13: Improve scroll container ref naming
**Files:** App2Native.tsx
**Changes:** Rename `scrollPageContainerRef` → `pageScrollRef`, `noScrollPageContainerRef` → `contentScrollRef`
**Testing:** Verify scroll behavior unchanged
**Risk:** Low

#### Step 14: Add requestAnimationFrame cleanup
**Files:** App2Native.tsx
**Changes:** Store frame ID and cancel in effect cleanup
**Testing:** Verify anchor scrolling still works
**Risk:** Low

#### Step 15: Consolidate drawer visibility effects
**Files:** App2Native.tsx
**Changes:** Merge two useEffects that set drawerVisible into one
**Testing:** Verify drawer closes appropriately
**Risk:** Low

#### Step 16: Fix navPanelShouldRender memo dependencies
**Files:** App2Native.tsx
**Changes:** Review and fix appContext dependency to be more specific
**Testing:** Verify nav panel shows/hides based on when condition
**Risk:** Medium (could expose existing bugs or change behavior)

#### Step 17: Validate layout string input
**Files:** App2Native.tsx
**Changes:** Add validation/warning for unexpected layout values
**Testing:** Verify error handling for invalid layouts
**Risk:** Low

#### Step 18: Document or improve onReady timing
**Files:** App2Native.tsx
**Changes:** Add comment explaining when onReady fires, or move to useLayoutEffect
**Testing:** Verify onReady callback timing expectations
**Risk:** Low
