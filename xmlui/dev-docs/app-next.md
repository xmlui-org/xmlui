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

