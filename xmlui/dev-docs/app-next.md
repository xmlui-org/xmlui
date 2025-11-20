# App Component Refactoring Notes

This document provides a comprehensive refactoring plan for the App2 component, focusing on simplifying the layout architecture through component-based design.

## Refactoring Rules

### Testing Command
```bash
# Run App2 e2e tests from workspace root (/Users/dotneteer/source/xmlui)
npx playwright test App2.spec.ts App2-layout.spec.ts --workers=4 --reporter=line
```

### Implementation Rules

1. **File Organization**: Use the `App2` component folder (`/Users/dotneteer/source/xmlui/xmlui/src/components/App2/`) for all files
2. **Incremental Progress**: Progress in small, reversible steps
3. **Continuous Testing**: Run the existing e2e test set after completing each step
4. **Error Handling**: 
   - If an e2e test fails, attempt up to 3 iterations to fix it
   - If all 3 iterations fail, the current step fails
   - Request review before proceeding
5. **CSS Class Names**: 
   - Slot components MUST use original `App2.module.scss` class names (e.g., `headerWrapper`, `navPanelWrapper`, `PagesWrapper`, `footerWrapper`)
   - Do NOT create new class names during refactoring (e.g., do NOT use `headerSlot`, `pagesSlot`, etc.)
   - Tests depend on these exact class names for element identification
   - CSS renaming will be done as a final step after all layouts are refactored
6. **Component Type Consistency**:
   - All layout cases must use the same wrapper component type (AppContainer)
   - This prevents React unmount/remount issues when switching layouts dynamically
   - Required for `data-testid` and class-based test selectors to work across layout changes

### Testing Requirements

- All existing tests (170 now but may be extended later) must pass after each step
- No test modifications allowed unless absolutely necessary
- Visual regressions must be caught and fixed
- Performance must not degrade

## Screen Layout Diagrams

This section presents all variants of screen layouts. The following factors determine the visual appearance and behavior of the screen:

**Configuration Properties:**
- `layout` - Defines block arrangement (horizontal, horizontal-sticky, vertical, etc.)
- `noScrollbarGutters` - Controls whether scrollbar gutters are reserved (false = reserved, true = no reservation)
- `scrollWholePage` - Determines scroll container (true = App Container, false = Main Content block only)

**Runtime Factors:**
- **Content overflow** - Whether content fits within viewport or extends beyond it
- **Scroll position** - Current scroll state (top, middle, bottom) when content overflows
- **Viewport size** - Mobile vs. desktop/tablet (affects NavPanel visibility and drawer behavior)

The diagrams below illustrate these combinations to show how the App component adapts to different scenarios.

## Horizontal Layout Diagrams

**`layout`: "horizontal"**

All horizontal layout diagrams share the following common characteristics:

- **Navigation Panel Position**: The NavPanel (N) is positioned at the top of the viewport, below the header
- **Block Arrangement**: Blocks are stacked vertically in rows: Header → NavPanel → Main Content → Footer
- **Full Width Blocks**: All blocks (H, N, M, F) span the full width of the container
- **NavPanel Behavior**: NavPanel is static (not independently scrollable) and rendered within the header area

### Horizontal Layout (scroll parent: app container, no scrollbar gutters)

- `noScrollbarGutters`: true
- `scrollWholePage`: true

![Horizontal Layout](images/horizontal-layout-diagram.svg)

Variants with overflow:

<img src="images/horizontal-layout-no-gutters-overflow-scrollbar-top.svg" alt="Horizontal Layout with Overflow and Scrollbar (Top)" width="420" /> <img src="images/horizontal-layout-no-gutters-overflow-scrollbar-bottom.svg" alt="Horizontal Layout with Overflow and Scrollbar (Bottom-Scroll)" width="420" />

### Horizontal Layout (scroll parent: app container, scrollbar gutters)

- `noScrollbarGutters`: false
- `scrollWholePage`: true

![Horizontal Layout with Gutters](images/horizontal-layout-with-gutters-diagram.svg)

Variants with overflow:

<img src="images/horizontal-layout-overflow-scrollbar-top.svg" alt="Horizontal Layout with Overflow and Scrollbar (Top)" width="420" /> <img src="images/horizontal-layout-overflow-scrollbar-bottom.svg" alt="Horizontal Layout with Overflow and Scrollbar (Bottom-Scroll)" width="420" />

### Horizontal Layout (scroll parent: main content, no scrollbar gutters)

- `noScrollbarGutters`: true
- `scrollWholePage`: false

![Horizontal Layout with Content-Only Scroll (No Overflow)](images/horizontal-layout-content-scroll-no-gutters.svg)

Variants with overflow:

<img src="images/horizontal-layout-content-scroll-no-gutters-top.svg" alt="Horizontal Layout with Content-Only Scroll (Top)" width="420" /> <img src="images/horizontal-layout-content-scroll-no-gutters-bottom.svg" alt="Horizontal Layout with Content-Only Scroll (Bottom)" width="420" />

### Horizontal Layout (scroll parent: main content, scrollbar gutters)

- `noScrollbarGutters`: false
- `scrollWholePage`: false

![Horizontal Layout with Content-Only Scroll and Gutters (No Overflow)](images/horizontal-layout-content-scroll-with-gutters-diagram.svg)

Variants with overflow:

<img src="images/horizontal-layout-content-scroll-with-gutters-top.svg" alt="Horizontal Layout with Content-Only Scroll and Gutters (Top)" width="420" /> <img src="images/horizontal-layout-content-scroll-with-gutters-bottom.svg" alt="Horizontal Layout with Content-Only Scroll and Gutters (Bottom)" width="420" />

## Horizontal-Sticky Layout Diagrams

**`layout`: "horizontal-sticky"**

All horizontal-sticky layout diagrams share the following common characteristics:

- **Header Sticky**: The Header (H) is always docked to the top of the viewport using sticky positioning
- **NavPanel Sticky**: The NavPanel (N) is always docked to the top, below the header, using sticky positioning
- **Footer Sticky**: The Footer (F) is always docked to the bottom of the viewport using sticky positioning
- **Content Scroll**: Only the Main Content (M) area scrolls between the sticky header/navpanel and footer
- **Scroll Container**: Can be either the App Container (C) when `scrollWholePage=true` or the Main Content block (M) when `scrollWholePage=false`

### Horizontal-Sticky Layout (scroll parent: app container, no scrollbar gutters)

- `noScrollbarGutters`: true
- `scrollWholePage`: true

![Horizontal-Sticky Layout](images/horizontal-sticky-layout.svg)

Variants with overflow:

<img src="images/horizontal-sticky-layout-overflow-top.svg" alt="Horizontal-Sticky Layout with Overflow (Top)" width="420" /> <img src="images/horizontal-sticky-layout-overflow-bottom.svg" alt="Horizontal-Sticky Layout with Overflow (Bottom)" width="420" />

### Horizontal-Sticky (scroll parent: app container, scrollbar gutters)

- `noScrollbarGutters`: false
- `scrollWholePage`: true

![Horizontal-Sticky Layout with Gutters](images/horizontal-sticky-layout-with-gutters.svg)

Variants with overflow:

<img src="images/horizontal-sticky-layout-with-gutters-overflow-top.svg" alt="Horizontal-Sticky Layout with Gutters and Overflow (Top)" width="420" /> <img src="images/horizontal-sticky-layout-overflow-bottom.svg" alt="Horizontal-Sticky Layout with Overflow Bottom-Scroll" width="420" />

### Horizontal-Sticky (scroll parent: main content, no scrollbar gutters)

- `noScrollbarGutters`: true
- `scrollWholePage`: false

![Horizontal-Sticky Layout with Content-Only Scroll (No Overflow)](images/horizontal-sticky-content-scroll-no-gutters.svg)

Variants with overflow:

<img src="images/horizontal-sticky-content-scroll-no-gutters-top.svg" alt="Horizontal-Sticky Layout with Content-Only Scroll (Top)" width="420" /> <img src="images/horizontal-sticky-content-scroll-no-gutters-bottom.svg" alt="Horizontal-Sticky Layout with Content-Only Scroll (Bottom)" width="420" />

### Horizontal-Sticky (scroll parent: main content, scrollbar gutters)

- `noScrollbarGutters`: false
- `scrollWholePage`: false

![Horizontal-Sticky Layout with Content-Only Scroll and Gutters (No Overflow)](images/horizontal-sticky-content-scroll-with-gutters.svg)

Variants with overflow:

<img src="images/horizontal-sticky-content-scroll-with-gutters-top.svg" alt="Horizontal-Sticky Layout with Content-Only Scroll and Gutters (Top)" width="420" /> <img src="images/horizontal-sticky-content-scroll-with-gutters-bottom.svg" alt="Horizontal-Sticky Layout with Content-Only Scroll and Gutters (Bottom)" width="420" />

## Condensed Layout Diagrams

**`layout`: "condensed"**

All condensed layout diagrams share the following common characteristics:

- **Header and NavPanel Combined**: The Header (H) and NavPanel (N) share the same row at the top of the viewport
- **Block Arrangement**: Blocks are stacked vertically in rows: Header/NavPanel → Main Content → Footer
- **Full Width Blocks**: All blocks span the full width of the container
- **NavPanel in Header**: NavPanel is embedded within the header area (hamburger menu on small screens, inline on large screens)

### Condensed Layout (scroll parent: app container, no scrollbar gutters)

- `noScrollbarGutters`: true
- `scrollWholePage`: true

![Condensed Layout (No Overflow)](images/condensed-layout-no-overflow.svg)

Variants with overflow:

<img src="images/condensed-layout-no-gutters-top.svg" alt="Condensed Layout with Overflow (Top)" width="420" /> <img src="images/condensed-layout-no-gutters-bottom.svg" alt="Condensed Layout with Overflow (Bottom)" width="420" />

### Condensed Layout (scroll parent: app container, scrollbar gutters)

- `noScrollbarGutters`: false
- `scrollWholePage`: true

![Condensed Layout with Gutters (No Overflow)](images/condensed-layout-with-gutters-no-overflow.svg)

Variants with overflow:

<img src="images/condensed-layout-with-gutters-top.svg" alt="Condensed Layout with Gutters and Overflow (Top)" width="420" /> <img src="images/condensed-layout-with-gutters-bottom.svg" alt="Condensed Layout with Gutters and Overflow (Bottom)" width="420" />

### Condensed Layout (scroll parent: main content, no scrollbar gutters)

- `noScrollbarGutters`: true
- `scrollWholePage`: false

![Condensed Layout with Content-Only Scroll (No Overflow)](images/condensed-layout-content-scroll-no-gutters-no-overflow.svg)

Variants with overflow:

<img src="images/condensed-layout-content-scroll-no-gutters-top.svg" alt="Condensed Layout with Content-Only Scroll (Top)" width="420" /> <img src="images/condensed-layout-content-scroll-no-gutters-bottom.svg" alt="Condensed Layout with Content-Only Scroll (Bottom)" width="420" />

### Condensed Layout (scroll parent: main content, scrollbar gutters)

- `noScrollbarGutters`: false
- `scrollWholePage`: false

![Condensed Layout with Content-Only Scroll and Gutters (No Overflow)](images/condensed-layout-content-scroll-with-gutters-no-overflow.svg)

Variants with overflow:

<img src="images/condensed-layout-content-scroll-with-gutters-top.svg" alt="Condensed Layout with Content-Only Scroll and Gutters (Top)" width="420" /> <img src="images/condensed-layout-content-scroll-with-gutters-bottom.svg" alt="Condensed Layout with Content-Only Scroll and Gutters (Bottom)" width="420" />

## Condensed-Sticky Layout Diagrams

**`layout`: "condensed-sticky"**

All condensed-sticky layout diagrams share the following common characteristics:

- **Header/NavPanel Sticky**: The combined Header and Navigation Panel (H/N) is always docked to the top of the viewport using sticky positioning
- **Footer Sticky**: The Footer (F) is always docked to the bottom of the viewport using sticky positioning
- **Content Scroll**: Only the Main Content (M) area scrolls between the sticky header/navpanel and footer
- **Combined Header**: Header and NavPanel share the same row (hamburger menu on small screens, inline on large screens)
- **Scroll Container**: Can be either the App Container (C) when `scrollWholePage=true` or the Main Content block (M) when `scrollWholePage=false`
- **Variants**: The diagrams below demonstrate different combinations of `scrollWholePage` and `noScrollbarGutters` settings

### Condensed-Sticky Layout (scroll parent: app container, no scrollbar gutters)

- `noScrollbarGutters`: true
- `scrollWholePage`: true

![Condensed-Sticky Layout (No Overflow)](images/condensed-sticky-layout-no-overflow.svg)

Variants with overflow:

<img src="images/condensed-sticky-layout-no-gutters-top.svg" alt="Condensed-Sticky Layout with Overflow (Top)" width="420" /> <img src="images/condensed-sticky-layout-no-gutters-bottom.svg" alt="Condensed-Sticky Layout with Overflow (Bottom)" width="420" />

### Condensed-Sticky Layout (scroll parent: app container, scrollbar gutters)

- `noScrollbarGutters`: false
- `scrollWholePage`: true

![Condensed-Sticky Layout with Gutters (No Overflow)](images/condensed-sticky-layout-with-gutters-no-overflow.svg)

Variants with overflow:

<img src="images/condensed-sticky-layout-with-gutters-top.svg" alt="Condensed-Sticky Layout with Gutters and Overflow (Top)" width="420" /> <img src="images/condensed-sticky-layout-with-gutters-bottom.svg" alt="Condensed-Sticky Layout with Gutters and Overflow (Bottom)" width="420" />

### Condensed-Sticky Layout (scroll parent: main content, no scrollbar gutters)

- `noScrollbarGutters`: true
- `scrollWholePage`: false

![Condensed-Sticky Layout with Content-Only Scroll (No Overflow)](images/condensed-sticky-content-scroll-no-gutters-no-overflow.svg)

Variants with overflow:

<img src="images/condensed-sticky-content-scroll-no-gutters-top.svg" alt="Condensed-Sticky Layout with Content-Only Scroll (Top)" width="420" /> <img src="images/condensed-sticky-content-scroll-no-gutters-bottom.svg" alt="Condensed-Sticky Layout with Content-Only Scroll (Bottom)" width="420" />

### Condensed-Sticky Layout (scroll parent: main content, scrollbar gutters)

- `noScrollbarGutters`: false
- `scrollWholePage`: false

![Condensed-Sticky Layout with Content-Only Scroll and Gutters (No Overflow)](images/condensed-sticky-content-scroll-with-gutters-no-overflow.svg)

Variants with overflow:

<img src="images/condensed-sticky-content-scroll-with-gutters-top.svg" alt="Condensed-Sticky Layout with Content-Only Scroll and Gutters (Top)" width="420" /> <img src="images/condensed-sticky-content-scroll-with-gutters-bottom.svg" alt="Condensed-Sticky Layout with Content-Only Scroll and Gutters (Bottom)" width="420" />

## Vertical Layout Diagrams

**`layout`: "vertical"**

All vertical layout diagrams share the following common characteristics:

- **Navigation Panel Position**: The Navigation Panel (N) is positioned to the left of the Main Content (M)
- **Layout Structure**: Header (H) at top, then a row containing NavPanel (N) on the left and Main Content (M) on the right, Footer (F) at bottom
- **Scroll Container**: Can be either the App Container (C) when `scrollWholePage=true` or the Main Content block (M) when `scrollWholePage=false`
- **Variants**: The diagrams below demonstrate different combinations of `scrollWholePage` and `noScrollbarGutters` settings

### Vertical Layout (scroll parent: app container, no scrollbar gutters)

- `noScrollbarGutters`: true
- `scrollWholePage`: true

![Vertical Layout (No Overflow)](images/vertical-layout-no-gutters.svg)

Variants with overflow:

<img src="images/vertical-layout-no-gutters-overflow-top.svg" alt="Vertical Layout with Overflow (Top)" width="420" /> <img src="images/vertical-layout-no-gutters-overflow-bottom.svg" alt="Vertical Layout with Overflow (Bottom)" width="420" />

### Vertical Layout (scroll parent: app container, scrollbar gutters)

- `noScrollbarGutters`: false
- `scrollWholePage`: true

![Vertical Layout with Gutters (No Overflow)](images/vertical-layout-with-gutters.svg)

Variants with overflow:

<img src="images/vertical-layout-with-gutters-overflow-top.svg" alt="Vertical Layout with Gutters and Overflow (Top)" width="420" /> <img src="images/vertical-layout-with-gutters-overflow-bottom.svg" alt="Vertical Layout with Gutters and Overflow (Bottom)" width="420" />

### Vertical Layout (scroll parent: main content, no scrollbar gutters)

- `noScrollbarGutters`: true
- `scrollWholePage`: false

![Vertical Layout with Content-Only Scroll (No Overflow)](images/vertical-layout-content-scroll-no-gutters.svg)

Variants with overflow:

<img src="images/vertical-layout-content-scroll-no-gutters-overflow-top.svg" alt="Vertical Layout with Content-Only Scroll (Top)" width="420" /> <img src="images/vertical-layout-content-scroll-no-gutters-overflow-bottom.svg" alt="Vertical Layout with Content-Only Scroll (Bottom)" width="420" />

### Vertical Layout (scroll parent: main content, scrollbar gutters)

- `noScrollbarGutters`: false
- `scrollWholePage`: false

![Vertical Layout with Content-Only Scroll and Gutters (No Overflow)](images/vertical-layout-content-scroll-with-gutters.svg)

Variants with overflow:

<img src="images/vertical-layout-content-scroll-with-gutters-overflow-top.svg" alt="Vertical Layout with Content-Only Scroll and Gutters (Top)" width="420" /> <img src="images/vertical-layout-content-scroll-with-gutters-overflow-bottom.svg" alt="Vertical Layout with Content-Only Scroll and Gutters (Bottom)" width="420" />

## Vertical-Sticky Layout Diagrams

**`layout`: "vertical-sticky"**

All vertical-sticky layout diagrams share the following common characteristics:

- **Navigation Panel Position**: The Navigation Panel (N) is positioned to the left of the Main Content (M) with sticky positioning
- **Header Sticky**: The Header (H) is always docked to the top of the right column using sticky positioning
- **Footer Sticky**: The Footer (F) is always docked to the bottom of the right column using sticky positioning
- **Layout Structure**: NavPanel (N) on the left spanning full height, then Header (H), Main Content (M), and Footer (F) stacked vertically on the right
- **Content Scroll**: Only the Main Content (M) area scrolls between the sticky header and footer
- **Scroll Container**: Can be either the App Container (C) when `scrollWholePage=true` or the Main Content block (M) when `scrollWholePage=false`

### Vertical-Sticky Layout (scroll parent: app container, no scrollbar gutters)

- `noScrollbarGutters`: true
- `scrollWholePage`: true

![Vertical-Sticky Layout (No Overflow)](images/vertical-sticky-layout-no-gutters.svg)

Variants with overflow:

<img src="images/vertical-sticky-layout-no-gutters-overflow-top.svg" alt="Vertical-Sticky Layout with Overflow (Top)" width="420" /> <img src="images/vertical-sticky-layout-no-gutters-overflow-bottom.svg" alt="Vertical-Sticky Layout with Overflow (Bottom)" width="420" />

### Vertical-Sticky Layout (scroll parent: app container, scrollbar gutters)

- `noScrollbarGutters`: false
- `scrollWholePage`: true

![Vertical-Sticky Layout with Gutters (No Overflow)](images/vertical-sticky-layout-with-gutters.svg)

Variants with overflow:

<img src="images/vertical-sticky-layout-with-gutters-overflow-top.svg" alt="Vertical-Sticky Layout with Gutters and Overflow (Top)" width="420" /> <img src="images/vertical-sticky-layout-with-gutters-overflow-bottom.svg" alt="Vertical-Sticky Layout with Gutters and Overflow (Bottom)" width="420" />

### Vertical-Sticky Layout (scroll parent: main content, no scrollbar gutters)

- `noScrollbarGutters`: true
- `scrollWholePage`: false

![Vertical-Sticky Layout with Content-Only Scroll (No Overflow)](images/vertical-sticky-content-scroll-no-gutters.svg)

Variants with overflow:

<img src="images/vertical-sticky-content-scroll-no-gutters-overflow-top.svg" alt="Vertical-Sticky Layout with Content-Only Scroll (Top)" width="420" /> <img src="images/vertical-sticky-content-scroll-no-gutters-overflow-bottom.svg" alt="Vertical-Sticky Layout with Content-Only Scroll (Bottom)" width="420" />

### Vertical-Sticky Layout (scroll parent: main content, scrollbar gutters)

- `noScrollbarGutters`: false
- `scrollWholePage`: false

![Vertical-Sticky Layout with Content-Only Scroll and Gutters (No Overflow)](images/vertical-sticky-content-scroll-with-gutters.svg)

Variants with overflow:

<img src="images/vertical-sticky-content-scroll-with-gutters-overflow-top.svg" alt="Vertical-Sticky Layout with Content-Only Scroll and Gutters (Top)" width="420" /> <img src="images/vertical-sticky-content-scroll-with-gutters-overflow-bottom.svg" alt="Vertical-Sticky Layout with Content-Only Scroll and Gutters (Bottom)" width="420" />

## Vertical-Full-Header Layout Diagrams

**`layout`: "vertical-full-header"**

All vertical-full-header layout diagrams share the following common characteristics:

- **Header Full Width**: The Header (H) spans the entire viewport width at the top with sticky positioning
- **Footer Full Width**: The Footer (F) spans the entire viewport width at the bottom with sticky positioning
- **Navigation Panel Position**: The Navigation Panel (N) is positioned to the left of the Main Content (M), below the header and above the footer
- **Layout Structure**: Header (H) spanning full width at top, then NavPanel (N) on left and Main Content (M) on right in middle row, Footer (F) spanning full width at bottom
- **Sticky Elements**: Header and Footer are sticky to viewport edges, NavPanel is sticky within its column
- **Content Scroll**: Only the Main Content (M) area scrolls, constrained by the sticky header and footer
- **Scroll Container**: Typically uses content-only scroll (`scrollWholePage=false`) due to sticky positioning requirements

### Vertical-Full-Header Layout (scroll parent: app container, no scrollbar gutters)

- `noScrollbarGutters`: true
- `scrollWholePage`: true

![Vertical-Full-Header Layout (No Overflow)](images/vertical-full-header-layout-no-gutters.svg)

Variants with overflow:

<img src="images/vertical-full-header-layout-no-gutters-overflow-top.svg" alt="Vertical-Full-Header Layout with Overflow (Top)" width="420" /> <img src="images/vertical-full-header-layout-no-gutters-overflow-bottom.svg" alt="Vertical-Full-Header Layout with Overflow (Bottom)" width="420" />

### Vertical-Full-Header Layout (scroll parent: app container, scrollbar gutters)

- `noScrollbarGutters`: false
- `scrollWholePage`: true

![Vertical-Full-Header Layout with Gutters (No Overflow)](images/vertical-full-header-layout-with-gutters.svg)

Variants with overflow:

<img src="images/vertical-full-header-layout-with-gutters-overflow-top.svg" alt="Vertical-Full-Header Layout with Gutters and Overflow (Top)" width="420" /> <img src="images/vertical-full-header-layout-with-gutters-overflow-bottom.svg" alt="Vertical-Full-Header Layout with Gutters and Overflow (Bottom)" width="420" />

### Vertical-Full-Header Layout (scroll parent: main content, no scrollbar gutters)

- `noScrollbarGutters`: true
- `scrollWholePage`: false

![Vertical-Full-Header Layout with Content-Only Scroll (No Overflow)](images/vertical-full-header-content-scroll-no-gutters.svg)

Variants with overflow:

<img src="images/vertical-full-header-content-scroll-no-gutters-overflow-top.svg" alt="Vertical-Full-Header Layout with Content-Only Scroll (Top)" width="420" /> <img src="images/vertical-full-header-content-scroll-no-gutters-overflow-bottom.svg" alt="Vertical-Full-Header Layout with Content-Only Scroll (Bottom)" width="420" />

### Vertical-Full-Header Layout (scroll parent: main content, scrollbar gutters)

- `noScrollbarGutters`: false
- `scrollWholePage`: false

![Vertical-Full-Header Layout with Content-Only Scroll and Gutters (No Overflow)](images/vertical-full-header-content-scroll-with-gutters.svg)

Variants with overflow:

<img src="images/vertical-full-header-content-scroll-with-gutters-overflow-top.svg" alt="Vertical-Full-Header Layout with Content-Only Scroll and Gutters (Top)" width="420" /> <img src="images/vertical-full-header-content-scroll-with-gutters-overflow-bottom.svg" alt="Vertical-Full-Header Layout with Content-Only Scroll and Gutters (Bottom)" width="420" />

## Desktop Layout Diagrams

**`layout`: "desktop"**

All desktop layout diagrams share the following common characteristics:

- **Full Viewport**: The App Container (C) stretches to 100vw × 100vh (or 100% × 100% when nested in iframe)
- **Zero Padding/Margins**: All blocks have zero padding and margins for maximum screen utilization
- **No Navigation Panel**: The Navigation Panel (N) is not rendered in desktop layout
- **Minimal Structure**: Only Header (H, optional), Main Content (M), and Footer (F, optional) blocks are used
- **Content-Only Scroll**: Main Content (M) is always the scroll container (`scrollWholePage=false` effectively)
- **No Scrollbar Gutters**: Desktop layout ignores `noScrollbarGutters` setting and never reserves gutter space
- **Sticky Positioning**: Header and Footer use sticky positioning relative to the viewport

### Desktop Layout (no scrollbar gutters, content scroll)

- `noScrollbarGutters`: ignored (always true)
- `scrollWholePage`: ignored (always false)

![Desktop Layout (No Overflow)](images/desktop-layout-no-overflow.svg)

Variants with overflow:

<img src="images/desktop-layout-overflow-top.svg" alt="Desktop Layout with Overflow (Top)" width="420" /> <img src="images/desktop-layout-overflow-bottom.svg" alt="Desktop Layout with Overflow (Bottom)" width="420" />

---

## Refactoring Opportunities

After reviewing the App2 component against the requirements of **reducing code lines** and **minimizing file hops**, the following opportunities have been identified:

### ✅ RECOMMENDED: Opportunities That Reduce Lines AND Minimize Hops

#### 1. Inline and Simplify Navigation Processing

**Current State:**
- 300+ lines of navigation logic across multiple helper functions
- Functions like `createParseHierarchyLabels`, `createLabelExistsInHierarchy` create closures with internal caches
- Complex function nesting makes code hard to follow

**Opportunity:**
Simplify inline without creating new files:
- Remove factory pattern (`createParseHierarchyLabels`, `createLabelExistsInHierarchy`) - use simple functions
- Remove unnecessary caching (premature optimization)
- Inline small helper functions directly where used
- Simplify hierarchy parsing logic

**Impact:** 
- **Lines saved:** ~100 lines
- **Hops:** 0 new files, everything stays in App2.tsx
- **Readability:** Much better - linear flow instead of nested closures

#### 2. Consolidate Layout Rendering Logic

**Current State:**
- 250+ lines of conditional rendering for 8 layout variants
- 90% of JSX is duplicated across variants
- Hard to see what's actually different between layouts

**Opportunity:**
Extract common structure, use configuration for differences:
```typescript
// Single render function using configuration
const config = layoutConfigs[safeLayout];
return (
  <AppContainer {...containerProps}>
    {config.headerPosition === 'top' && renderHeader()}
    {config.contentStructure === 'side-by-side' ? (
      <div className={styles.content}>
        {config.showNavPanel && renderNavPanel()}
        <main>{renderMainContent()}</main>
      </div>
    ) : (
      <>
        {config.showNavPanel && renderHeader && renderNavPanel()}
        <main>{renderMainContent()}</main>
      </>
    )}
    {renderFooter()}
  </AppContainer>
);
```

**Impact:**
- **Lines saved:** ~150 lines
- **Hops:** 0 new files, everything in same component
- **Readability:** Dramatically better - differences are configuration, not code duplication

#### 3. Eliminate Unnecessary Memoization

**Current State:**
- Extensive `useMemo` and `useCallback` usage with large dependency arrays
- `appProps` object with 16+ dependencies that's only used once
- Premature optimization that adds complexity

**Opportunity:**
Remove unnecessary memoization:
- Delete `appProps` memoization - just pass props directly
- Remove `useMemo` for simple calculations that aren't expensive
- Keep only memoization that prevents actual performance issues

**Impact:**
- **Lines saved:** ~40 lines
- **Hops:** None - simplification within same file
- **Readability:** Better - less noise from memoization logic

#### 4. Simplify Footer Sticky Logic

**Current State:**
- `footerSticky` extracted via complex `extractComponentProp` function
- Then negated to `footerShouldBeNonSticky`
- Used in multiple places with confusing naming

**Opportunity:**
Inline and simplify:
```typescript
const footerSticky = Footer?.props?.sticky ?? true;
```

**Impact:**
- **Lines saved:** ~30 lines (removes `extractComponentProp` function)
- **Hops:** None
- **Readability:** Much clearer

#### 5. Inline Small Utility Functions

**Current State:**
- Many small utility functions defined separately: `shouldShowNavPanelInline`, `validateLayout`, `getLayoutHeightConfig`
- Each requires mental context switch

**Opportunity:**
Inline directly where used since they're only called once:
```typescript
// Instead of separate function
const navPanelVisible = shouldShowNavPanelInline(hasNavPanel, isLarge, hasHeader, layout);

// Inline the logic
const navPanelVisible = hasNavPanel && (isLargeScreen || (!hasHeader && !isCondensed));
```

**Impact:**
- **Lines saved:** ~50 lines
- **Hops:** None - reduces jumping around in same file
- **Readability:** Better - logic visible where it's used

#### 6. Remove `AppNode` Wrapper Component

**Current State:**
- `AppNode` component wraps the main logic but only serves to organize code
- Adds extra indirection without clear benefit
- All logic could be in the renderer directly

**Opportunity:**
Move all `AppNode` logic directly into the renderer function:

**Impact:**
- **Lines saved:** ~15 lines (component declaration overhead)
- **Hops:** None - one less function to trace through
- **Readability:** Better - flatter structure

### ⚠️ RECONSIDER: Opportunities That Add Hops or Don't Save Lines

#### ❌ Extract Navigation Processing to Separate Module
**Rejected because:** Creates new file to jump to, doesn't reduce lines (just moves them)

#### ❌ Layout Strategy Pattern
**Rejected because:** Creates 8+ new files, dramatically increases hops, actually adds ~200 lines of boilerplate

#### ❌ Extract Slot Components
**Rejected because:** Creates new file, adds import/export overhead, these are simple and local to App2

#### ❌ Extract Custom Hooks (useThemeInitialization, useDrawerState, etc.)
**Rejected because:** Creates new files or adds indirection within same file without reducing complexity

#### ❌ Extract Element Size Observer
**Rejected because:** Only used in App2, extracting adds file hop without benefit

#### ❌ Separate Layout Components per Variant
**Rejected because:** Creates 8 new files, massively increases hops, doesn't reduce total lines

### 🤔 NEUTRAL: Minor Improvements

#### 7. Use Positive Naming Convention
- Change `noScrollbarGutters` → `reserveScrollbarGutters` throughout
- Change `footerShouldBeNonSticky` → `footerIsSticky`
- **Impact:** Same lines, same hops, better clarity

#### 8. Simplify Ref Management Inline
- Remove conditional logic by always creating both refs
- **Impact:** ~5 lines saved, no new hops

### Recommended Implementation Order

1. **Quick Wins (Do First):**
   - #3: Eliminate Unnecessary Memoization (~40 lines)
   - #4: Simplify Footer Sticky Logic (~30 lines)
   - #5: Inline Small Utility Functions (~50 lines)
   - #6: Remove AppNode Wrapper (~15 lines)
   - **Total: ~135 lines saved, 0 new files**

2. **Major Refactor (Do Second):**
   - #2: Consolidate Layout Rendering Logic (~150 lines)
   - **Total: ~150 lines saved, 0 new files**

3. **Deep Simplification (Do Third):**
   - #1: Inline and Simplify Navigation Processing (~100 lines)
   - **Total: ~100 lines saved, 0 new files**

4. **Polish (Optional):**
   - #7: Positive Naming Convention
   - #8: Simplify Ref Management (~5 lines)

### Expected Total Impact

- **Lines Reduced:** ~385 lines from current ~993 lines = **~39% reduction**
- **New Files Created:** 0
- **File Hops Reduced:** Significant - removes factory patterns, wrapper components, utility indirection
- **Readability:** Dramatically improved through consolidation and simplification

---

