# TableOfContents Component - Refactoring Review

**Review Date:** January 28, 2026  
**Component:** TableOfContents  
**Status:** Stable

## Overview

The TableOfContents component is a navigation component that collects Heading and Bookmark elements within the current page and displays them in a navigable tree structure. After reviewing the component against XMLUI conventions, I've identified several high-priority refactorings to improve code clarity and maintainability.

## Top Priority Refactorings

### 1. **Eliminate Redundant CSS Classes and Dynamic Class Generation**
**Priority:** HIGH  
**Location:** `TableOfContentsNative.tsx` (lines 130-135)  
**Impact:** Code readability, maintainability

**Current Issue:**
```typescript
className={classnames(styles.link, {
  [styles.head_1]: value.level === 1,
  [styles.head_2]: value.level === 2,
  [styles.head_3]: value.level === 3,
  [styles.head_4]: value.level === 4,
  [styles.head_5]: value.level === 5,
  [styles.head_6]: value.level === 6,
})}
```

**Problem:** Uses verbose conditional class assignment with 6 separate checks. This pattern is difficult to read and maintain.

**Solution:** Use CSS attribute selector with data attribute for level-specific styling:
```typescript
className={styles.link}
data-level={value.level}
```

Then in SCSS, use attribute selectors:
```scss
.link {
  // Common styles
  &[data-level="1"] { /* level 1 styles */ }
  &[data-level="2"] { /* level 2 styles */ }
  // etc.
}
```

**Rationale:** This eliminates 6 class checks per item, uses a standard HTML pattern (data attributes), and makes the component more scalable if heading levels need to change.

**Testing:** Run existing e2e tests to ensure styling still works correctly.

---

### 2. **Extract Indicator Positioning Logic into Separate Hook**
**Priority:** HIGH  
**Location:** `TableOfContentsNative.tsx` (lines 81-101)  
**Impact:** Code organization, readability, testability

**Current Issue:**
Large `useEffect` hook with complex DOM manipulation logic is embedded directly in the component, making it hard to understand the component's structure at a glance.

**Problem:**
```typescript
useEffect(() => {
  if (activeAnchorId && tocRef?.current && indicatorRef?.current) {
    const activeItem = tocRef.current.querySelector(`li.${styles.active}`);
    if (activeItem) {
      const navRect = tocRef.current.getBoundingClientRect();
      const itemRect = activeItem.getBoundingClientRect();
      const relativeTop = itemRect.top - navRect.top + tocRef.current.scrollTop;
      const relativeLeft = itemRect.left - navRect.left;

      indicatorRef.current.style.top = `${relativeTop}px`;
      indicatorRef.current.style.left = `${relativeLeft}px`;
      indicatorRef.current.style.height = `${itemRect.height}px`;
      indicatorRef.current.style.display = "block";
    }
  } else if (indicatorRef?.current) {
    indicatorRef.current.style.display = "none";
  }
}, [activeAnchorId, headings]);
```

**Solution:** Extract into custom hook:
```typescript
// New file: useIndicatorPosition.ts
function useIndicatorPosition(
  activeAnchorId: string | null,
  containerRef: RefObject<HTMLElement>,
  indicatorRef: RefObject<HTMLDivElement>,
  activeClassName: string
) {
  useEffect(() => {
    if (!activeAnchorId || !containerRef.current || !indicatorRef.current) {
      if (indicatorRef.current) {
        indicatorRef.current.style.display = "none";
      }
      return;
    }

    const activeItem = containerRef.current.querySelector(`li.${activeClassName}`);
    if (!activeItem) return;

    const navRect = containerRef.current.getBoundingClientRect();
    const itemRect = activeItem.getBoundingClientRect();
    
    const position = {
      top: itemRect.top - navRect.top + containerRef.current.scrollTop,
      left: itemRect.left - navRect.left,
      height: itemRect.height,
    };

    Object.assign(indicatorRef.current.style, {
      top: `${position.top}px`,
      left: `${position.left}px`,
      height: `${position.height}px`,
      display: "block",
    });
  }, [activeAnchorId, containerRef, indicatorRef, activeClassName]);
}
```

**Rationale:** 
- Separates concerns (indicator positioning vs. component rendering)
- Makes the logic reusable and testable in isolation
- Improves component readability by reducing cognitive load
- Uses `Object.assign` for cleaner style updates

**Testing:** Run existing e2e tests, particularly those checking active item highlighting.

---

### 3. **Simplify Active Item Scrolling Logic**
**Priority:** MEDIUM-HIGH  
**Location:** `TableOfContentsNative.tsx` (lines 67-79)  
**Impact:** Code readability, error handling

**Current Issue:**
```typescript
useEffect(() => {
  if (activeAnchorId && tocRef?.current) {
    const activeAnchor = tocRef.current.querySelector(`#${activeAnchorId}`);
    if (activeAnchor) {
      scrollIntoView(activeAnchor, {
        block: "center",
        inline: "center",
        behavior: "smooth",
        scrollMode: "always",
        boundary: tocRef.current,
      });
    }
  }
}, [activeAnchorId, headings]);
```

**Problem:** 
- Multiple null checks that could be combined
- Magic string selector (`#${activeAnchorId}`) that's not safe if ID contains special characters
- Hard-coded scroll options that could be a constant

**Solution:**
```typescript
// At top of file
const SCROLL_OPTIONS = {
  block: "center" as const,
  inline: "center" as const,
  behavior: "smooth" as const,
  scrollMode: "always" as const,
} as const;

// In component
useEffect(() => {
  if (!activeAnchorId || !tocRef.current) return;
  
  const activeAnchor = tocRef.current.querySelector(`[id="${CSS.escape(activeAnchorId)}"]`);
  if (activeAnchor) {
    scrollIntoView(activeAnchor, {
      ...SCROLL_OPTIONS,
      boundary: tocRef.current,
    });
  }
}, [activeAnchorId, headings]);
```

**Rationale:**
- Early return pattern is clearer than nested conditions
- `CSS.escape()` prevents CSS injection if IDs have special characters
- Extracting options makes them reusable and easier to modify
- More defensive against edge cases

**Testing:** Run e2e tests that verify scrolling to active items works correctly.

---

### 4. **Remove Unused `smoothScrolling` Parameter in Active Item Subscription**
**Priority:** MEDIUM  
**Location:** `TableOfContentsNative.tsx` (line 60)  
**Impact:** Code correctness, API clarity

**Current Issue:**
```typescript
useEffect(() => {
  if (activeAnchorId && tocRef?.current) {
    const activeAnchor = tocRef.current.querySelector(`#${activeAnchorId}`);
    if (activeAnchor) {
      scrollIntoView(activeAnchor, {
        block: "center",
        inline: "center",
        behavior: "smooth", // Always smooth, ignoring smoothScrolling prop
        scrollMode: "always",
        boundary: tocRef.current,
      });
    }
  }
}, [activeAnchorId, headings]);
```

**Problem:** The `smoothScrolling` prop is passed to `scrollToAnchor` on click (line 139), but the automatic scrolling in the useEffect always uses `behavior: "smooth"`. This is inconsistent behavior.

**Solution:** Make the automatic scrolling behavior consistent with the prop:
```typescript
useEffect(() => {
  if (!activeAnchorId || !tocRef.current) return;
  
  const activeAnchor = tocRef.current.querySelector(`[id="${CSS.escape(activeAnchorId)}"]`);
  if (activeAnchor) {
    scrollIntoView(activeAnchor, {
      block: "center",
      inline: "center",
      behavior: smoothScrolling ? "smooth" : "auto",
      scrollMode: "always",
      boundary: tocRef.current,
    });
  }
}, [activeAnchorId, headings, smoothScrolling]);
```

**Rationale:** Makes the component behavior consistent and respects the user's `smoothScrolling` preference for all scrolling operations, not just clicks.

**Testing:** Run e2e tests for the `smoothScrolling` property to ensure both modes work correctly.

---

### 5. **Improve Event Handler Readability**
**Priority:** MEDIUM  
**Location:** `TableOfContentsNative.tsx` (lines 137-141)  
**Impact:** Code readability

**Current Issue:**
```typescript
onClick={(event) => {
  // cmd/ctrl + click - open in new tab, don't prevent that
  if (!event.ctrlKey && !event.metaKey) {
    event.preventDefault();
  }
  scrollToAnchor(value.id, smoothScrolling);
}}
```

**Problem:** The logic is inline and the comment could be clearer about what behavior we're actually implementing.

**Solution:** Extract to a named function:
```typescript
// At component level
const handleLinkClick = useCallback(
  (anchorId: string) => (event: React.MouseEvent<HTMLAnchorElement>) => {
    // Allow cmd/ctrl+click to open in new tab via browser default behavior
    const shouldAllowDefault = event.ctrlKey || event.metaKey;
    
    if (!shouldAllowDefault) {
      event.preventDefault();
      scrollToAnchor(anchorId, smoothScrolling);
    }
  },
  [scrollToAnchor, smoothScrolling]
);

// In render
<Link
  ...
  onClick={handleLinkClick(value.id)}
>
```

**Rationale:**
- More descriptive naming makes intent clearer
- Extracting to `useCallback` prevents recreation on every render
- Better comment explains the actual behavior
- More testable as a separate function

**Testing:** Run e2e tests that verify navigation works correctly.

---

### 6. **Simplify Filter Logic in Render**
**Priority:** MEDIUM  
**Location:** `TableOfContentsNative.tsx` (lines 117-120)  
**Impact:** Code readability, performance

**Current Issue:**
```typescript
{headings.map((value) => {
  if (value.level <= maxHeadingLevel && (!omitH1 || value.level !== 1)) {
    return (
      // ... render item
    );
  }
  return null;
})}
```

**Problem:** Using `map` with conditional `return null` is less clear and less performant than filtering first.

**Solution:**
```typescript
const filteredHeadings = useMemo(
  () => headings.filter(
    (heading) => heading.level <= maxHeadingLevel && (!omitH1 || heading.level !== 1)
  ),
  [headings, maxHeadingLevel, omitH1]
);

// In render
{filteredHeadings.map((value) => (
  <li
    key={value.id}
    className={classnames(styles.listItem, {
      [styles.active]: value.id === activeAnchorId,
    })}
  >
    {/* ... render content */}
  </li>
))}
```

**Rationale:**
- Separates filtering logic from rendering logic
- More performant (no need to render and return null)
- Memoization prevents unnecessary refiltering
- More declarative and easier to understand

**Testing:** Run all e2e tests to ensure filtering behavior is unchanged.

---

## Refactoring Steps Plan

To ensure safe refactoring with e2e test validation after each step:

### Step 1: CSS Class Simplification
- Replace conditional class assignment with data-level attribute
- Update SCSS to use attribute selectors
- **Test:** `npx playwright test TableOfContents.spec.ts --reporter=line`

### Step 2: Simplify Render Filter Logic
- Extract heading filtering into `useMemo`
- Remove conditional returns in map
- **Test:** `npx playwright test TableOfContents.spec.ts --reporter=line`

### Step 3: Improve Event Handler
- Extract `handleLinkClick` with `useCallback`
- Improve comment clarity
- **Test:** `npx playwright test TableOfContents.spec.ts --grep "navigates" --reporter=line`

### Step 4: Fix smoothScrolling Consistency
- Add `smoothScrolling` prop to automatic scroll behavior
- Update useEffect dependency array
- **Test:** `npx playwright test TableOfContents.spec.ts --grep "smoothScrolling" --reporter=line`

### Step 5: Simplify Active Item Scrolling
- Add early returns and CSS.escape
- Extract scroll options constant
- **Test:** `npx playwright test TableOfContents.spec.ts --grep "active" --reporter=line`

### Step 6: Extract Indicator Positioning Hook
- Create `useIndicatorPosition` custom hook
- Replace useEffect with hook usage
- **Test:** `npx playwright test TableOfContents.spec.ts --reporter=line`

---

## Non-Priority Items (Skipped)

These items were identified but are considered lower priority or "nice-to-have":

- **SCSS Variables:** While there's some repetition in the SCSS with level-specific theme variables, this follows XMLUI patterns and provides necessary theming flexibility
- **TypeScript Types:** Props interface is simple and adequate for the component's needs
- **Component Size:** The component is reasonably sized and doesn't need splitting
- **Documentation:** Existing metadata documentation is clear and complete

---

## Expected Benefits

After completing these refactorings:

1. **Readability:** Reduced cognitive load when reading the component code
2. **Maintainability:** Easier to modify behavior without introducing bugs
3. **Consistency:** Behavior matches user expectations across all interactions
4. **Performance:** Minor improvements from better memoization and filtering
5. **Safety:** Better handling of edge cases (CSS injection, null checks)
6. **Testability:** Extracted logic can be tested in isolation

---

## Estimated Time

- **Total refactoring time:** 2-3 hours
- **Testing time per step:** 5-10 minutes
- **Total with validation:** 3-4 hours

---

## Refactoring Progress

### Step 1: CSS Class Simplification
**Status:** ✅ Completed  
**Started:** January 28, 2026  
**Completed:** January 28, 2026

**Changes Made:**
- Replaced conditional class assignment (`head_1`, `head_2`, etc.) with `data-level` attribute in TableOfContentsNative.tsx
- Updated SCSS to use attribute selectors (`&[data-level="1"]`) instead of class selectors (`.head_1`)
- Applied changes to base styles, hover states, and active states

**Results:**
- ✅ No linting issues
- ✅ All 33 e2e tests passed (1 skipped)
- Code is now cleaner and more maintainable with single data attribute instead of 6 conditional classes

---

## Risk Assessment

**Risk Level:** LOW

All refactorings are:
- Non-breaking changes to component behavior
- Covered by existing e2e tests
- Incremental and reversible
- Focused on code structure, not logic changes

The step-by-step approach with test validation after each change ensures any issues are caught immediately.
