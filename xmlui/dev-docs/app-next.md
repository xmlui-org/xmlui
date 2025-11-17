# App Component Refactoring Notes

This document analyzes the current App component implementation and proposes a new design with improved modularity and flexibility.

## Table of Contents

### Part 1: Current Implementation Analysis

1. Current Problems
2. Layout Types (8 variants)
3. Key Component Props
4. Major Complexity Points
5. CSS Structure Issues
6. Theme Variables
7. Context & State Management
8. Refactoring Opportunities

### Part 2: New Design Proposal

1. Design Goals
2. Layout Definition Framework
   - UI Blocks (Building Blocks)
   - Block Arrangement Patterns
   - Layout Descriptions by Block Arrangement
   - Scroll Container Logic
3. Table of Contents (TOC) Feature
   - Configuration & Properties
   - Layout & Positioning
   - TOC Generation
   - Behavior & Interactions
   - XMLUI Markup Examples
   - Theme Variables
   - Accessibility
4. AppHeader Modular Design
   - Design Overview
   - Sub-Block Component Specifications
   - Component Usage Approaches
   - When to Use Each Approach

---

## Part 1: Current Implementation Analysis

### Current Problems

- Layout options are not straightforward enough
- Complex conditional logic for each layout type in AppNative.tsx switch statement
- Scroll behavior tied to layout type creates inflexibility
- CSS structure has deep nesting and overlapping concerns
- Header/footer positioning logic is duplicated across layouts
- NavPanel visibility logic is fragmented

### Layout Types (8 variants)

### Core Layout Axes

1. **Orientation**: vertical (NavPanel left) vs horizontal (NavPanel top) vs desktop (full viewport)
2. **Stickiness**: none vs sticky header/footer vs full sticky
3. **Header Width**: normal vs full-width (vertical-full-header only)

### Current Layouts

- `vertical` - NavPanel left, whole page scrolls
- `vertical-sticky` - NavPanel left, header/footer stick
- `vertical-full-header` - NavPanel left, header spans full width, sticky
- `horizontal` - NavPanel top, whole page scrolls
- `horizontal-sticky` - NavPanel top, header/footer stick
- `condensed` - Combined header+NavPanel, whole page scrolls
- `condensed-sticky` - Combined header+NavPanel, sticky
- `desktop` - Full viewport, zero padding, no layout constraints

## Key Component Props

### Layout Control

- `layout`: AppLayoutType (8 variants)
- `scrollWholePage`: boolean (default: true) - controls scroll container
- `noScrollbarGutters`: boolean (default: false) - removes gutter space

### Content Slots

- `AppHeader`: header content (optional, extracted from children)
- `NavPanel`: navigation panel (optional, extracted from children)
- `Footer`: footer content (optional, extracted from children)
- `Pages`: main content container
- `logoTemplate`: custom logo component

### Theme

- `defaultTone`: "light" | "dark"
- `defaultTheme`: theme ID
- `autoDetectTone`: boolean (uses system preference)

## Major Complexity Points

### 1. Child Extraction Logic (App.tsx lines 264-350)

Extracts AppHeader, Footer, NavPanel, Pages from children tree, including unwrapping from Theme components. Creates new NavPanel with auto-generated nav from Pages with `navLabel` props.

### 2. Layout Rendering Switch (AppNative.tsx lines 378-588)

Massive switch statement with 8 layout cases, each rendering different DOM structure with slight variations in:

- Container flex direction
- Scroll container location (wrapper vs inner)
- NavPanel positioning
- Header/footer sticky behavior

### 3. NavPanel Visibility Logic (AppNative.tsx)

```typescript
// Line 136-137
navPanelVisible =
  mediaSize.largeScreen ||
  (!hasRegisteredHeader && layout !== "condensed" && layout !== "condensed-sticky");
```

- Desktop: always visible (except condensed without header)
- Mobile: hidden, shown via drawer
- Condensed: always in header, needs special treatment

### 4. Scroll Container Refs (AppNative.tsx lines 202-206)

Two refs: `scrollPageContainerRef` and `noScrollPageContainerRef`

- `scrollWholePage=true` → outer wrapper scrolls
- `scrollWholePage=false` → PagesWrapper scrolls
  Choice depends on layout type and affects header/footer positioning

### 5. CSS Gutter Handling (AppNative.tsx lines 236-261)

CSS custom properties manage scrollbar width to add padding that compensates for gutters when `noScrollbarGutters=false`:

```css
--scrollbar-width: calculated | 0px;
```

Applied differently per layout via `margin-inline` and `padding-inline`

### 6. Footer Stickiness (App.tsx lines 353-367, AppNative.tsx lines 378+)

- `footerSticky` extracted from Footer component props
- Desktop layout: always sticky
- Other layouts: sticky only in -sticky variants
- Can be overridden via Footer `sticky` prop

### 7. Auto-Generated Navigation (App.tsx lines 309-332, 635-773)

Complex logic extracts Pages with `navLabel="Parent | Child"` syntax and creates hierarchical NavGroups/NavLinks, merging with existing NavPanel children.

## CSS Structure Issues

### Wrapper Classes (App.module.scss)

- Base `.wrapper` + layout modifier (`.vertical`, `.horizontal`, `.desktop`)
- Optional `.sticky` modifier
- Optional `.scrollWholePage` modifier
- Optional `.noScrollbarGutters` modifier

Results in combinations like:

```scss
.wrapper.vertical.sticky.scrollWholePage
```

### Layout-Specific Overrides

Each layout has different:

- `.contentWrapper` scroll behavior
- `.PagesWrapper` min-height calculation
- `.headerWrapper` positioning
- `.footerWrapper` positioning
- `.navPanelWrapper` dimensions and position

Desktop layout (lines 118-225) has most aggressive overrides with `!important` to reset all spacing.

### Scrollbar Gutter Compensation

Complex calc expressions in `.scrollWholePage` (lines 277-325) to handle gutter space:

```scss
margin-inline: calc(-1 * var(--scrollbar-width));
```

## Theme Variables

- `maxWidth-content-App` - content max width
- `width-navPanel-App` - NavPanel width
- `backgroundColor-navPanel-App` - NavPanel background
- `boxShadow-header-App` - header shadow
- `boxShadow-navPanel-App` - NavPanel shadow
- `backgroundColor-content-App` - content background

## Context & State Management

### AppLayoutContext

Provides to children:

- `layout`, `navPanelVisible`, `drawerVisible`
- `showDrawer()`, `hideDrawer()`, `toggleDrawer()`
- Logo URLs and content
- `registerSubNavPanelSlot()` for portal rendering
- `isNested` flag for playground/iframe usage

### SearchContext

Wraps entire app for search indexing (auto-generated from Pages)

### LinkInfoContext

Stores navigation hierarchy map for breadcrumbs/nav state

## Refactoring Opportunities

### Simplify Layout Logic

- Reduce 8 variants to composable properties:
  - `navPanelPlacement: "left" | "top" | "none"`
  - `headerSticky: boolean`
  - `footerSticky: boolean`
  - `fullViewport: boolean` (desktop mode)
  - `headerFullWidth: boolean`
- Remove switch statement, use declarative config object

### Decouple Scroll Behavior

- Make `scrollWholePage` independent of layout type
- Single scroll container strategy configurable per app needs

### Simplify CSS

- Use CSS Grid instead of nested flex containers
- Named grid areas for header/nav/content/footer
- Reduce modifier class combinations
- Remove layout-specific overrides

### Extract Sub-Components

- `AppScrollContainer` - handles scroll logic
- `AppLayoutGrid` - grid structure with named areas
- `AppNavPanelSlot` - NavPanel positioning/drawer logic
- `AppHeaderSlot` - header positioning with sub-block composition
- `AppFooterSlot` - footer positioning
- `AppLogo` - standalone logo component with theme awareness
- `AppSearchBox` - standalone search component with indexing integration
- `AppProfileMenu` - standalone profile/menu component

### Refactor AppHeader Sub-Block Architecture

- Decompose AppHeader into compositional sub-blocks
- Create dedicated components for Logo, SearchBox, and ProfileMenu
- Use template properties for all sub-blocks (logoTemplate, titleTemplate, startSlotTemplate, etc.)
- Use flex layout for sub-block arrangement
- Support flexible template slots (start, middle, end) for custom content
- Maintain proper RTL/LTR text direction support
- Enable responsive behavior (collapse/drawer for mobile)
- Built-in components can be enabled/disabled via props (searchBoxEnabled, profileMenuEnabled)

### Standardize Stickiness

- Single prop: `stickyElements: ("header" | "footer" | "navPanel")[]`
- Remove per-layout sticky variants
- CSS position: sticky with consistent offsets

### Auto-Nav Generation

- Consider moving to separate utility/hook
- Currently tightly coupled to renderer
- Makes testing difficult

### Breaking Changes Considerations

- Existing layouts need migration path
- Theme variables should remain stable
- XMLUI markup compatibility important

---

## Part 2: New Design Proposal

This section describes the proposed new architecture for the App component, including improved layout flexibility and modular AppHeader design.

### Design Goals

- Simplify layout configuration with composable properties
- Decouple scroll behavior from layout type
- Extract reusable sub-components
- Provide flexible AppHeader with multiple customization approaches
- Maintain backward compatibility where possible
- Improve testability and maintainability

---

## Layout Definition Framework

### UI Blocks (Building Blocks)

The app viewport is divided into distinct blocks that can be positioned and sized independently:

0. **App Container Block** (`C`)

   - Contains: all other blocks (H, N, M, F)
   - Properties:
     - Height: fit-content OR stretch to viewport height (100vh/100%)
     - Scrollbar gutters: stable both-edges OR auto (controlled by `noScrollbarGutters`)
     - Scroll behavior: may be scroll container OR static wrapper
   - Behavior varies by layout:
     - `desktop`: stretches to 100vw × 100vh (or 100% × 100% when nested), no gutters
     - Sticky layouts: stretches to 100% height to enable sticky positioning
     - Non-sticky layouts: fits content height
     - Gutter compensation: adds negative margins and padding to child blocks when gutters enabled

1. **Header Block** (`H`)

   - Contains: AppHeader component with sub-blocks
   - Properties: height (auto-sized by content), sticky/static positioning
   - Scroll: never scrolls independently, may stick to top or scroll with page
   - **Sub-Blocks** (ordered start → end, respects LTR/RTL):
     - `H.Logo` - Logo component (clickable, theme-aware)
     - `H.Title` - App title text
     - `H.StartSlot` - Flexible template slot for custom start content
     - `H.MiddleSlot` - Flexible template slot for custom center content
     - `H.SearchBox` - Search component (input + results dropdown)
     - `H.ProfileMenu` - Profile menu component (avatar + dropdown)
     - `H.EndSlot` - Flexible template slot for custom end content
   - Layout: Horizontal flex layout, responsive collapse on mobile
   - Template Properties: logoTemplate, titleTemplate, startSlotTemplate, middleSlotTemplate, searchBoxTemplate, profileMenuTemplate, endSlotTemplate

2. **Navigation Panel Block** (`N`)

   - Contains: NavPanel component with navigation links/groups
   - Properties: width (in vertical layouts) or height (in horizontal layouts), sticky/static positioning
   - Scroll: may have independent scroll in vertical layouts, static in horizontal layouts
   - Visibility: always visible on large screens, drawer on small screens (except condensed)

3. **Main Content Block** (`M`)

   - Contains: Pages component with page content
   - Properties: fills remaining space, always scrollable
   - Scroll: either block scrolls independently OR entire viewport scrolls (controlled by `scrollWholePage`)
   - Sizing: respects `maxWidth-content-App` theme variable
   - **Sub-Blocks** (when TOC enabled):
     - `M.Content` - Main page content area
     - `M.TOC` - Table of Contents sidebar (positioned to the right in LTR, left in RTL)
   - Layout: Horizontal flex when TOC visible, single column otherwise
   - TOC Control:
     - `showToc` property on Pages container - Global flag to enable TOC feature
     - `showToc` property on individual Page - Per-page override (can disable for specific pages)
     - TOC automatically generated from page headings (h2, h3, etc.)
     - TOC is sticky within the scrollable content area

4. **Footer Block** (`F`)
   - Contains: Footer component
   - Properties: height (auto-sized by content), sticky/static positioning
   - Scroll: never scrolls independently, may stick to bottom or scroll with page

### Block Arrangement Patterns

Each layout defines how these blocks are arranged in the viewport. The App Container (C) wraps all other blocks. Using a coordinate system where blocks can be:

- **Rows**: blocks stacked vertically
- **Columns**: blocks placed side-by-side
- **Overlap**: blocks positioned on top of each other (for sticky elements)

### Layout Descriptions by Block Arrangement

**`vertical`**

```
C: fit-content height, scrollbar gutters, is scroll container
Columns: [N] [H + M + F]
- N: full height, fixed width, static
- H: top of right column, static
- M: middle of right column, fills space, scrollable
- F: bottom of right column, static
- Scroll container: right column (H+M+F together)
```

**`vertical-sticky`**

```
C: stretched to 100% height, scrollbar gutters, is scroll container
Columns: [N] [H + M + F]
- N: full height, fixed width, static
- H: sticky to top of right column
- M: fills space, scrollable
- F: sticky to bottom of right column
- Scroll container: right column (H+M+F together)
```

**`vertical-full-header`**

```
C: stretched to 100% height, scrollbar gutters, is scroll container
Row 1: [H spanning full width]
Row 2 columns: [N] [M]
Row 3: [F spanning full width]
- H: sticky to viewport top, spans entire width
- N: fixed width, sticky to top (below H), height = viewport - H - F
- M: fills remaining width, scrollable
- F: sticky to viewport bottom, spans entire width
- Scroll container: entire viewport
```

**`horizontal`**

```
C: fit-content height, scrollbar gutters, is scroll container
Rows: [H + N] [M] [F]
- H: full width, static
- N: full width, static (inside header area)
- M: fills space, scrollable
- F: full width, static
- Scroll container: entire viewport (all blocks scroll together)
```

**`horizontal-sticky`**

```
C: stretched to min 100% height, scrollbar gutters, is scroll container
Rows: [H + N] [M] [F]
- H: full width, sticky to top
- N: full width, static (inside sticky header)
- M: fills space, scrollable
- F: full width, sticky to bottom
- Scroll container: entire viewport
```

**`condensed`**

```
C: fit-content height, scrollbar gutters, is scroll container
Rows: [H (with N embedded)] [M] [F]
- H: full width, static, contains hamburger menu for N
- N: rendered in drawer on small screens, embedded in H on large screens
- M: fills space, scrollable
- F: full width, static
- Scroll container: entire viewport (all blocks scroll together)
- Special: if no H defined, auto-generates H with hamburger menu
```

**`condensed-sticky`**

```
C: fit-content height, scrollbar gutters, is scroll container
Rows: [H (with N embedded)] [M] [F]
- H: full width, sticky to top, contains hamburger menu for N
- N: rendered in drawer on small screens, embedded in H on large screens
- M: fills space, scrollable
- F: full width, static or sticky to bottom (configurable)
- Scroll container: entire viewport
- Special: if no H defined, auto-generates H with hamburger menu
```

**`desktop`**

```
C: stretched to 100vw × 100vh (100% × 100% when nested), no gutters, static wrapper
Rows: [H?] [M] [F?]
- H: optional, full width, sticky to top, zero padding/margins
- M: fills all available space, scrollable, zero padding/margins
- F: optional, full width, sticky to bottom, zero padding/margins
- Scroll container: M block only
- Special: stretches to 100vw x 100vh (or 100% x 100% when nested)
- No NavPanel rendering in this layout
```

### Scroll Container Logic

Two fundamental scroll strategies that determine App Container behavior:

1. **Whole Page Scroll** (`scrollWholePage=true`)

   - Container: App Container (C) is the scroll container
   - Behavior: H, N, M, F scroll together as one unit
   - Sticky elements: position relative to scrolling container
   - C properties: `overflow: auto`, `scrollbar-gutter: stable both-edges`
   - Gutter compensation: C applies negative margins, H/F get compensating padding
   - Used by: vertical, horizontal, condensed (non-sticky variants)

2. **Content-Only Scroll** (`scrollWholePage=false`)
   - Container: M block only is the scroll container
   - Behavior: H, N, F remain static, only M scrolls
   - Sticky elements: fixed relative to viewport
   - C properties: `overflow: hidden`, acts as layout wrapper
   - M properties: `overflow: auto`, `scrollbar-gutter: stable both-edges`
   - Used by: vertical-sticky, vertical-full-header, horizontal-sticky, condensed-sticky, desktop

---

## Table of Contents (TOC) Feature

### Overview

The Table of Contents feature provides automatic navigation within page content, displaying a sidebar with links to page headings.

### Configuration

**Pages Container Property**:

- `showToc`: boolean (default: false) - Global flag to enable TOC feature for all pages

**Individual Page Property**:

- `showToc`: boolean (optional) - Per-page override to show/hide TOC for specific pages
- Overrides the Pages container setting
- `showToc={false}` hides TOC even if enabled globally
- `showToc={true}` shows TOC even if disabled globally

### Layout and Positioning

**TOC Positioning**:

- **LTR (Left-to-Right)**: TOC appears on the right side of the content
- **RTL (Right-to-Left)**: TOC appears on the left side of the content
- Respects text direction automatically

**Layout Structure**:

```
┌─────────────────────────────────────┐
│  Main Content Block (M)             │
├──────────────────────┬──────────────┤
│                      │              │
│  Page Content        │  TOC Sidebar │
│  (M.Content)         │  (M.TOC)     │
│                      │              │
│  - Heading 1         │  • Heading 1 │
│  - Heading 2         │    - Sub 1   │
│    - Sub-heading 1   │    - Sub 2   │
│    - Sub-heading 2   │  • Heading 2 │
│  - Heading 3         │  • Heading 3 │
│                      │              │
└──────────────────────┴──────────────┘
```

**Responsive Behavior**:

- Desktop: TOC visible in sidebar
- Tablet: TOC may collapse to a toggle button
- Mobile: TOC hidden or accessible via menu

### TOC Generation

**Automatic Generation**:

- TOC is automatically generated from page content headings
- Scans for heading elements: `<h2>`, `<h3>`, `<h4>`, `<h5>`, `<h6>`
- Creates hierarchical navigation structure
- `<h1>` is typically the page title and excluded from TOC

**TOC Entry Structure**:

```typescript
{
  id: string;        // Anchor link ID (e.g., "heading-1")
  text: string;      // Heading text content
  level: number;     // Heading level (2-6)
  children?: TOCEntry[]; // Nested headings
}
```

### Behavior

**Sticky Positioning**:

- TOC sidebar uses sticky positioning within scrollable content
- Remains visible as user scrolls through content
- Constrained to the height of the content area

**Active State Highlighting**:

- Current section is highlighted in TOC
- Automatically updates as user scrolls
- Uses intersection observer for accurate tracking

**Click Navigation**:

- Clicking TOC entry smoothly scrolls to corresponding heading
- Updates URL hash (e.g., `#heading-1`)
- Respects `scroll-margin-top` for proper positioning under sticky headers

**Keyboard Navigation**:

- TOC entries are keyboard accessible
- Tab navigation through TOC links
- Enter/Space to navigate to section

### XMLUI Markup Examples

**Enable TOC globally for all pages**:

```xml
<App>
  <Pages showToc={true}>
    <Page url="/" navLabel="Home">
      <!-- TOC will be shown -->
      <h2>Section 1</h2>
      <h3>Subsection 1.1</h3>
      <h2>Section 2</h2>
    </Page>

    <Page url="/about" navLabel="About">
      <!-- TOC will be shown -->
      <h2>Our Story</h2>
      <h2>Our Team</h2>
    </Page>
  </Pages>
</App>
```

**Override TOC for specific pages**:

```xml
<App>
  <Pages showToc={true}>
    <Page url="/" navLabel="Home" showToc={false}>
      <!-- TOC hidden for this page -->
      <h2>Welcome</h2>
    </Page>

    <Page url="/docs" navLabel="Documentation">
      <!-- TOC shown (inherits from Pages) -->
      <h2>Getting Started</h2>
      <h3>Installation</h3>
      <h3>Configuration</h3>
      <h2>API Reference</h2>
    </Page>
  </Pages>
</App>
```

**Enable TOC only for specific pages**:

```xml
<App>
  <Pages showToc={false}>
    <Page url="/" navLabel="Home">
      <!-- No TOC -->
      <h2>Welcome</h2>
    </Page>

    <Page url="/docs" navLabel="Documentation" showToc={true}>
      <!-- TOC shown only for this page -->
      <h2>Getting Started</h2>
      <h3>Installation</h3>
      <h2>API Reference</h2>
    </Page>
  </Pages>
</App>
```

### Theme Variables

**TOC Styling**:

- `width-toc-Pages` - TOC sidebar width (default: e.g., 240px)
- `backgroundColor-toc-Pages` - TOC background color
- `borderColor-toc-Pages` - TOC border color
- `color-tocEntry-Pages` - TOC entry text color
- `color-tocEntry-active-Pages` - Active TOC entry color
- `fontSize-tocEntry-Pages` - TOC entry font size
- `padding-tocEntry-Pages` - TOC entry padding
- `indent-tocEntry-Pages` - Indentation per heading level

**Layout Variables**:

- `gap-content-toc-Pages` - Gap between content and TOC sidebar
- `top-toc-Pages` - Top offset for sticky positioning
- `maxHeight-toc-Pages` - Maximum height of TOC sidebar

### Accessibility

**ARIA Attributes**:

- TOC container: `role="navigation"`, `aria-label="Table of Contents"`
- TOC entries: Semantic `<nav>` with `<ul>` and `<li>` structure
- Current section: `aria-current="location"` on active entry

**Screen Reader Support**:

- TOC is announced as navigation landmark
- Heading levels are preserved in structure
- Skip link available to bypass TOC

---

## AppHeader Modular Design

The new AppHeader design provides a flexible, modular architecture with multiple customization approaches.

### Design Overview

The AppHeader component is composed of several sub-blocks that flow horizontally from start to end, respecting the current text direction (LTR/RTL). Each sub-block can be customized via template properties or by completely redefining the header structure.

### Sub-Block Order (Default, Start → End)

1. **Logo** - Complete component for app logo/branding
2. **App Title** - Text display for application name
3. **Start Slot** - Flexible template slot for custom content at the start
4. **Middle Slot** - Flexible template slot for custom content in the center
5. **Search Box** - Complete component for search functionality
6. **Profile Menu** - Complete component for user profile/menu
7. **End Slot** - Flexible template slot for custom content at the end

### AppHeader Template Properties

The AppHeader component accepts template properties for each sub-block:

- `logoTemplate` - Custom logo content (overrides default AppLogo)
- `titleTemplate` - Custom title content (overrides default text title)
- `startSlotTemplate` - Custom content for start slot
- `middleSlotTemplate` - Custom content for middle slot
- `searchBoxTemplate` - Custom search box content (overrides default AppSearchBox)
- `profileMenuTemplate` - Custom profile menu content (overrides default AppProfileMenu)
- `endSlotTemplate` - Custom content for end slot

### Layout Behavior

- Sub-blocks follow flex layout with appropriate spacing
- Components can be hidden/shown based on props or by omitting template properties
- Respects text direction (LTR/RTL) for proper ordering
- Mobile responsive: some slots may collapse or move to drawer

---

## AppHeader Sub-Block Component Specifications

### 1. AppLogo Component (or `<Logo>` in AppHeader children)

**Purpose**: Display application logo with theme-aware variants and navigation functionality.

**Usage in AppHeader**:

- As property: `<AppHeader logo="/logo.svg" logoDark="/dark.svg" logoLight="/light.svg" />`
- As template: `<AppHeader logoTemplate={customLogoDef} />`
- As child: `<AppHeader><Logo src="/logo.svg" /></AppHeader>` (Approach 4)

**Properties**:

- `src`: string - Default logo image URL
- `srcDark`: string (optional) - Logo variant for dark theme
- `srcLight`: string (optional) - Logo variant for light theme
- `alt`: string - Alternative text for accessibility
- `href`: string (default: "/") - Navigation target when clicked
- `width`: string | number (optional) - Logo width
- `height`: string | number (optional) - Logo height
- `onClick`: (event) => void (optional) - Custom click handler

**Behavior**:

- Automatically switches between light/dark variants based on active theme
- Clickable by default, navigates to `href` location
- Respects custom onClick handlers
- Lazy loads images for performance
- Falls back to default logo if theme-specific variant unavailable

**Theme Variables**:

- `width-logo-AppHeader` - Default logo width
- `height-logo-AppHeader` - Default logo height
- `margin-inline-end-logo-AppHeader` - Spacing after logo

---

### 1b. AppTitle Component (or `<AppTitle>` in AppHeader children)

**Purpose**: Display application title text.

**Usage in AppHeader**:

- As property: `<AppHeader title="My Application" />`
- As template: `<AppHeader titleTemplate={customTitleDef} />`
- As child: `<AppHeader><AppTitle>My App</AppTitle></AppHeader>` (Approach 4)

**Properties**:

- `text`: string (optional) - Title text
- `children`: ReactNode (optional) - Title content (alternative to text)

**Behavior**:

- Displays as text in the header
- Can include inline styling or nested components

**Theme Variables**:

- `fontSize-title-AppHeader` - Title font size
- `fontWeight-title-AppHeader` - Title font weight
- `color-title-AppHeader` - Title text color
- `margin-inline-end-title-AppHeader` - Spacing after title

---

### 2. AppSearchBox Component (or `<AppSearchBox>` in AppHeader children)

**Purpose**: Provide search functionality with dropdown results and keyboard navigation.

**Usage in AppHeader**:

- As enabled prop: `<AppHeader searchBoxEnabled={true} />`
- As template: `<AppHeader searchBoxTemplate={customSearchDef} />`
- As child: `<AppHeader><AppSearchBox /></AppHeader>` (Approach 4)

**Properties**:

- `src`: string - Default logo image URL
- `srcDark`: string (optional) - Logo variant for dark theme
- `srcLight`: string (optional) - Logo variant for light theme
- `alt`: string - Alternative text for accessibility
- `href`: string (default: "/") - Navigation target when clicked
- `width`: string | number (optional) - Logo width
- `height`: string | number (optional) - Logo height
- `onClick`: (event) => void (optional) - Custom click handler

**Behavior**:

- Automatically switches between light/dark variants based on active theme
- Clickable by default, navigates to `href` location
- Respects custom onClick handlers
- Lazy loads images for performance
- Falls back to default logo if theme-specific variant unavailable

**Theme Variables**:

- `width-logo-AppHeader` - Default logo width
- `height-logo-AppHeader` - Default logo height
- `margin-inline-end-logo-AppHeader` - Spacing after logo

---

### 2. AppSearchBox Component

**Purpose**: Provide search functionality with dropdown results and keyboard navigation.

**Properties**:

- `placeholder`: string (default: "Search...") - Input placeholder text
- `searchIndex`: SearchIndex - Search index data source
- `maxResults`: number (default: 10) - Maximum results to display
- `debounceMs`: number (default: 300) - Search debounce delay
- `onResultClick`: (result) => void (optional) - Custom result click handler
- `onSearch`: (query: string) => void (optional) - Search event handler
- `shortcut`: string (default: "Ctrl+K" / "⌘K") - Keyboard shortcut hint
- `disabled`: boolean - Disable search functionality

**Behavior**:

- Real-time search with debouncing
- Dropdown results with keyboard navigation (↑/↓, Enter, Esc)
- Click outside to close results
- Keyboard shortcut to focus (Ctrl+K or Cmd+K)
- Highlights matching text in results
- Integrates with App's SearchContext for indexing

**Events**:

- `search` - Fires when search query changes
- `resultClick` - Fires when a result is selected
- `open` - Fires when dropdown opens
- `close` - Fires when dropdown closes

**Theme Variables**:

- `width-searchBox-AppHeader` - Search box width
- `backgroundColor-searchBox-AppHeader` - Search input background
- `borderColor-searchBox-AppHeader` - Search input border
- `backgroundColor-searchResults-AppHeader` - Results dropdown background
- `boxShadow-searchResults-AppHeader` - Results dropdown shadow

---

### 3. AppProfileMenu Component (or `<AppProfileMenu>` in AppHeader children)

**Purpose**: Display user profile with dropdown menu for account actions.

**Usage in AppHeader**:

- As enabled prop: `<AppHeader profileMenuEnabled={true} profileMenuUser={$currentUser} />`
- As template: `<AppHeader profileMenuTemplate={customProfileDef} />`
- As child: `<AppHeader><AppProfileMenu user={$currentUser} /></AppHeader>` (Approach 4)

**Properties**:

- `user`: object - User data { name, email, avatar, ... }
- `avatarSrc`: string (optional) - User avatar image URL
- `userName`: string - Display name
- `userEmail`: string (optional) - User email
- `showAvatar`: boolean (default: true) - Show/hide avatar
- `showName`: boolean (default: true) - Show/hide name on desktop
- `menuItems`: MenuItem[] - Array of menu items
- `onMenuItemClick`: (item) => void (optional) - Menu item click handler
- `onSignOut`: () => void (optional) - Sign out handler

**MenuItem Structure**:

```typescript
{
  id: string;
  label: string;
  icon?: string | ReactNode;
  href?: string;
  onClick?: () => void;
  separator?: boolean; // Renders a separator instead
  disabled?: boolean;
}
```

**Behavior**:

- Displays user avatar with fallback to initials
- Dropdown menu on click/hover
- Keyboard navigation in menu (↑/↓, Enter, Esc)
- Click outside to close menu
- Responsive: may show avatar only on mobile

**Events**:

- `menuOpen` - Fires when menu opens
- `menuClose` - Fires when menu closes
- `menuItemClick` - Fires when menu item selected

**Theme Variables**:

- `size-avatar-profileMenu-AppHeader` - Avatar size
- `backgroundColor-menu-profileMenu-AppHeader` - Menu background
- `boxShadow-menu-profileMenu-AppHeader` - Menu dropdown shadow
- `spacing-menu-profileMenu-AppHeader` - Menu item spacing

---

### 4. Flexible Slot Templates (StartSlot, MiddleSlot, EndSlot)

**Purpose**: Provide customizable template slots within the AppHeader for application-specific controls.

**Usage in AppHeader**:

- As template properties: `<AppHeader startSlotTemplate={def} middleSlotTemplate={def} endSlotTemplate={def} />`
- As inline templates:
  ```xml
  <AppHeader>
    <startSlotTemplate>
      <Breadcrumb />
    </startSlotTemplate>
  </AppHeader>
  ```
- As child slots (Approach 4):
  ```xml
  <AppHeader>
    <Slot name="startSlotTemplate" />
    <Logo />
    <Slot name="middleSlotTemplate" />
    <AppSearchBox />
    <Slot name="endSlotTemplate" />
  </AppHeader>
  ```

**AppHeader Template Properties**:

- `startSlotTemplate`: ComponentDef - Template content for start slot
- `middleSlotTemplate`: ComponentDef - Template content for middle slot
- `endSlotTemplate`: ComponentDef - Template content for end slot

**Slot Component**:
When using Approach 4 (total redefinition), the `<Slot>` component references a named template:

- `name`: "startSlotTemplate" | "middleSlotTemplate" | "endSlotTemplate" - The template slot to render
- Content is defined via corresponding template property on AppHeader

**Slot Rendering**:

- Slots render template content provided via AppHeader properties
- If template property is not defined, slot is not rendered
- Template content can be any XMLUI components

**Layout Behavior**:

- **StartSlot**: Positioned after logo and title, before middle
  - Use for: breadcrumbs, quick actions, context indicators
- **MiddleSlot**: Positioned in center, uses flex-grow
  - Use for: tabs, filters, page-level controls
- **EndSlot**: Positioned before search/profile, at the end
  - Use for: notifications, help icon, theme toggle, settings

**Responsive Behavior**:

- Slots may collapse or move to hamburger menu on mobile
- Priority order for collapse: MiddleSlot → StartSlot → EndSlot
- Essential components (Logo, SearchBox, ProfileMenu) remain visible longer

---

### AppHeader Component Usage

The AppHeader component supports multiple approaches for customization:

#### Approach 1: Template Properties (Declarative)

Using template properties for standard layout with customization:

```xml
<AppHeader
  logo="/logo.svg"
  logoDark="/logo-dark.svg"
  logoLight="/logo-light.svg"
  title="My Application"
  startSlotTemplate={startSlotDef}
  middleSlotTemplate={middleSlotDef}
  searchBoxEnabled={true}
  profileMenuEnabled={true}
  profileMenuUser={$currentUser}
  profileMenuItems={$userMenuItems}
  endSlotTemplate={endSlotDef}
/>
```

#### Approach 2: Custom Templates Override Defaults

Override specific sub-blocks while keeping standard order:

```xml
<AppHeader
  logoTemplate={customLogoDef}
  titleTemplate={customTitleDef}
  searchBoxTemplate={customSearchDef}
  profileMenuTemplate={customProfileDef}
/>
```

#### Approach 3: Inline Template Definitions

Define template content inline as child elements:

```xml
<AppHeader title="My App" logo="/logo.svg">
  <startSlotTemplate>
    <Breadcrumb items={$breadcrumbs} />
  </startSlotTemplate>

  <middleSlotTemplate>
    <TabBar tabs={$mainTabs} />
  </middleSlotTemplate>

  <endSlotTemplate>
    <IconButton icon="notifications" onClick={@showNotifications} />
    <IconButton icon="settings" onClick={@showSettings} />
  </endSlotTemplate>
</AppHeader>
```

#### Approach 4: Total Redefinition with Custom Order

Completely redefine the AppHeader structure and sub-block order using predefined components:

```xml
<AppHeader>
  <Slot name="startSlotTemplate" />
  <Logo />
  <AppSearchBox />
  <AppProfileMenu />
  <Slot name="endSlotTemplate" />
</AppHeader>
```

This approach allows you to:

- Reorder any sub-block components
- Omit unwanted components (e.g., no title, no middle slot)
- Insert custom components between sub-blocks
- Use predefined sub-block components: `<Logo>`, `<AppTitle>`, `<AppSearchBox>`, `<AppProfileMenu>`
- Reference template slots by name: `<Slot name="startSlotTemplate" />`, `<Slot name="middleSlotTemplate" />`, `<Slot name="endSlotTemplate" />`

**Example: Custom order with all options**

```xml
<AppHeader>
  <Logo src="/logo.svg" />
  <Slot name="startSlotTemplate" />
  <AppTitle>My App</AppTitle>
  <Spacer />
  <Slot name="middleSlotTemplate" />
  <AppSearchBox />
  <Divider orientation="vertical" />
  <AppProfileMenu user={$currentUser} />
  <Slot name="endSlotTemplate" />
</AppHeader>
```

**Example: Minimal custom header**

```xml
<AppHeader>
  <Logo />
  <AppTitle>Dashboard</AppTitle>
  <Spacer />
  <AppProfileMenu />
</AppHeader>
```

**Default Rendering Order** (LTR, when using Approach 1-3):

```
[Logo] [Title] [StartSlot] [MiddleSlot] [SearchBox] [ProfileMenu] [EndSlot]
```

**RTL Support**: Order automatically reverses in RTL text direction.

**Visibility Control**: Each sub-block can be shown/hidden via:

- Omitting template properties (slot not rendered) - Approaches 1-3
- Not including components in markup - Approach 4
- Using `*Enabled` props for built-in components (e.g., `searchBoxEnabled={false}`) - Approach 1
- Conditional rendering within template content

---

### When to Use Each Approach

**Approach 1 (Template Properties)**: Best for most use cases

- ✅ Simple, declarative API
- ✅ Standard layout with custom slots
- ✅ Uses built-in components with easy configuration
- ✅ Good for consistent headers across pages
- Use when: You want the standard header layout with some customization

**Approach 2 (Custom Templates Override)**: Advanced customization

- ✅ Replace specific sub-blocks with custom implementations
- ✅ Maintain standard order and spacing
- ✅ Good for themed or branded variants
- Use when: You need custom Logo, SearchBox, or ProfileMenu implementations

**Approach 3 (Inline Templates)**: Quick customization

- ✅ Define slot content inline for readability
- ✅ Good for simple, page-specific content
- ✅ Keeps markup self-contained
- Use when: Slot content is simple and specific to one page

**Approach 4 (Total Redefinition)**: Maximum flexibility

- ✅ Complete control over order and composition
- ✅ Can insert custom components between sub-blocks
- ✅ Can omit any sub-block
- ✅ Use predefined components (`<Logo>`, `<AppSearchBox>`, etc.) or custom ones
- ⚠️ More verbose, requires understanding of all sub-blocks
- Use when: You need a completely custom header layout or non-standard order

**Predefined Sub-Block Components** (available in Approach 4):

- `<Logo>` - AppLogo component
- `<AppTitle>` - App title text
- `<AppSearchBox>` - Search functionality
- `<AppProfileMenu>` - User profile menu
- `<Slot name="startSlotTemplate">` - Start slot reference
- `<Slot name="middleSlotTemplate">` - Middle slot reference
- `<Slot name="endSlotTemplate">` - End slot reference

---

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
- **Variants**: The diagrams below demonstrate different combinations of scroll behavior (`scrollWholePage`), gutter reservation (`noScrollbarGutters`), and scroll positions

### Horizontal Layout (scroll parent: app container, no scrollbar gutters)

- `noScrollbarGutters`: true
- `scrollWholePage`: true

![Horizontal Layout](images/horizontal-layout-diagram.svg)

![Horizontal Layout with Overflow and Scrollbar (Top)](images/horizontal-layout-no-gutters-overflow-scrollbar-top.svg)

![Horizontal Layout with Overflow and Scrollbar (Mid-Scroll)](images/horizontal-layout-no-gutters-overflow-scrollbar-mid.svg)

![Horizontal Layout with Overflow and Scrollbar (Bottom-Scroll)](images/horizontal-layout-no-gutters-overflow-scrollbar-bottom.svg)

### Horizontal Layout (scroll parent: app container, scrollbar gutters)

- `noScrollbarGutters`: false
- `scrollWholePage`: true

![Horizontal Layout with Gutters](images/horizontal-layout-with-gutters-diagram.svg)

![Horizontal Layout with Overflow and Scrollbar (Top)](images/horizontal-layout-overflow-scrollbar-top.svg)

![Horizontal Layout with Overflow and Scrollbar (Mid-Scroll)](images/horizontal-layout-overflow-scrollbar-mid.svg)

![Horizontal Layout with Overflow and Scrollbar (Bottom-Scroll)](images/horizontal-layout-overflow-scrollbar-bottom.svg)

### Horizontal Layout (scroll parent: main content, no scrollbar gutters)

- `noScrollbarGutters`: true
- `scrollWholePage`: false

![Horizontal Layout with Content-Only Scroll (No Overflow)](images/horizontal-layout-content-scroll-no-gutters-diagram.svg)

![Horizontal Layout with Content-Only Scroll (Top)](images/horizontal-layout-content-scroll-no-gutters-top.svg)

![Horizontal Layout with Content-Only Scroll (Mid-Scroll)](images/horizontal-layout-content-scroll-no-gutters-mid.svg)

![Horizontal Layout with Content-Only Scroll (Bottom)](images/horizontal-layout-content-scroll-no-gutters-bottom.svg)

## Horizontal-Sticky Layout Diagrams

**`layout`: "horizontal-sticky"**

All horizontal-sticky layout diagrams share the following common characteristics:

- **Header Sticky**: The Header (H) is always docked to the top of the viewport using sticky positioning
- **NavPanel Sticky**: The NavPanel (N) is always docked to the top, below the header, using sticky positioning
- **Footer Sticky**: The Footer (F) is always docked to the bottom of the viewport using sticky positioning
- **Content Scroll**: Only the Main Content (M) area scrolls between the sticky header/navpanel and footer
- **Scroll Container**: Can be either the App Container (C) when `scrollWholePage=true` or the Main Content block (M) when `scrollWholePage=false`
- **Variants**: The diagrams below demonstrate different combinations of `scrollWholePage` and `noScrollbarGutters` settings

### Horizontal-Sticky Layout (scroll parent: app container, no scrollbar gutters)

- `noScrollbarGutters`: true
- `scrollWholePage`: true

![Horizontal-Sticky Layout](images/horizontal-sticky-layout.svg)

![Horizontal-Sticky Layout with Overflow (Top)](images/horizontal-sticky-layout-overflow-top.svg)

![Horizontal-Sticky Layout with Overflow (Mid-Scroll)](images/horizontal-sticky-layout-overflow-mid.svg)

![Horizontal-Sticky Layout with Overflow (Bottom)](images/horizontal-sticky-layout-overflow-bottom.svg)

### Horizontal-Sticky (scroll parent: app container, scrollbar gutters)

- `noScrollbarGutters`: false
- `scrollWholePage`: true

![Horizontal-Sticky Layout with Gutters](images/horizontal-sticky-layout-with-gutters.svg)

![Horizontal-Sticky Layout with Gutters and Overflow (Top)](images/horizontal-sticky-layout-with-gutters-overflow-top.svg)

![Horizontal-Sticky Layout with Overflow Mid-Scroll](images/horizontal-sticky-layout-overflow-mid.svg)

![Horizontal-Sticky Layout with Overflow Bottom-Scroll](images/horizontal-sticky-layout-overflow-bottom.svg)

### Horizontal-Sticky (scroll parent: main content, no scrollbar gutters)

- `noScrollbarGutters`: true
- `scrollWholePage`: false

![Horizontal-Sticky Layout with Content-Only Scroll (No Overflow)](images/horizontal-sticky-content-scroll-no-gutters.svg)

![Horizontal-Sticky Layout with Content-Only Scroll (Top)](images/horizontal-sticky-content-scroll-no-gutters-top.svg)

![Horizontal-Sticky Layout with Content-Only Scroll (Mid-Scroll)](images/horizontal-sticky-content-scroll-no-gutters-mid.svg)

![Horizontal-Sticky Layout with Content-Only Scroll (Bottom)](images/horizontal-sticky-content-scroll-no-gutters-bottom.svg)

### Horizontal-Sticky Layout with Content-Only Scroll and Gutters (No Overflow)

- `layout`: horizontal-sticky
- `noScrollbarGutters`: false
- `scrollWholePage`: false

**Note:** Content fits within viewport; scroll gutters reserved only for Main Content area. Header, NavPanel, and Footer are docked. Main Content block is the scroll parent.

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ H: Header (docked to top)                                                    │
├──────────────────────────────────────────────────────────────────────────────┤
│ N: Navigation Panel (docked to top)                                          │
├─┬──────────────────────────────────────────────────────────────────────────┬─┤
│ │ M: Main Content                                                          │ │
│ │                                                                          │ │
│ │                                                                          │ │
│ │                                                                          │ │
│ │                                                                          │ │
│ │                                                                          │ │
│ │                                                                          │ │
│ │                                                                          │ │
│ │                                                                          │ │
│ │                                                                          │ │
│ │                                                                          │ │
│ │                                                                          │ │
│ │                                                                          │ │
│ │                                                                          │ │
│ │                                                                          │ │
│ │                                                                          │ │
│ │                                                                          │ │
├─┴──────────────────────────────────────────────────────────────────────────┴─┤
│ F: Footer (docked to bottom)                                                 │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Horizontal-Sticky Layout with Content-Only Scroll (Mid-Scroll)

- `layout`: horizontal-sticky
- `noScrollbarGutters`: true
- `scrollWholePage`: false

**Note:** Content overflows; scrollbar visible on right side only for Main Content area. Header, NavPanel, and Footer remain docked and don't scroll. Scrollbar at mid-position. Main Content block is the scroll parent.

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ H: Header (docked to top)                                                    │
├──────────────────────────────────────────────────────────────────────────────┤
│ N: Navigation Panel (docked to top)                                          │
├────────────────────────────────────────────────────────────────────────────┬─┤
│ ↑ Content above (hidden)                                                   │ │
│                                                                            │ │
│                                                                            │ │
│ M: Main Content (scrollable, mid-scroll position)                          │█│
│                                                                            │█│
│                                                                            │█│
│                                                                            │ │
│                                                                            │ │
│                                                                            │ │
│                                                                            │ │
│                                                                            │ │
│                                                                            │ │
│                                                                            │ │
│                                                                            │ │
│                                                                            │ │
│                                                                            │ │
│                                                                            │ │
│ ↓ Content below (hidden)                                                   │ │
├────────────────────────────────────────────────────────────────────────────┴─┤
│ F: Footer (docked to bottom)                                                 │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Horizontal-Sticky Layout with Content-Only Scroll and Gutters (Mid-Scroll)

- `layout`: horizontal-sticky
- `noScrollbarGutters`: false
- `scrollWholePage`: false

**Note:** Content overflows; scrollbar visible in right gutter only for Main Content area. Header, NavPanel, and Footer remain docked and don't scroll. Scrollbar at mid-position. Main Content block is the scroll parent.

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ H: Header (docked to top)                                                    │
├──────────────────────────────────────────────────────────────────────────────┤
│ N: Navigation Panel (docked to top)                                          │
├─┬──────────────────────────────────────────────────────────────────────────┬─┤
│ │ ↑ Content above (hidden)                                                 │ │
│ │                                                                          │ │
│ │                                                                          │█│
│ │ M: Main Content (scrollable, mid-scroll position)                        │█│
│ │                                                                          │█│
│ │                                                                          │ │
│ │                                                                          │ │
│ │                                                                          │ │
│ │                                                                          │ │
│ │                                                                          │ │
│ │                                                                          │ │
│ │                                                                          │ │
│ │                                                                          │ │
│ │                                                                          │ │
│ │                                                                          │ │
│ │                                                                          │ │
│ │ ↓ Content below (hidden)                                                 │ │
├─┴──────────────────────────────────────────────────────────────────────────┴─┤
│ F: Footer (docked to bottom)                                                 │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Horizontal-Sticky Layout with Content-Only Scroll (Scrolled to Bottom)

- `layout`: horizontal-sticky
- `noScrollbarGutters`: true
- `scrollWholePage`: false

**Note:** Content scrolled to bottom; scrollbar at bottom position only for Main Content area. Header, NavPanel, and Footer remain docked. End of content visible. Main Content block is the scroll parent.

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ H: Header (docked to top)                                                    │
├──────────────────────────────────────────────────────────────────────────────┤
│ N: Navigation Panel (docked to top)                                          │
├────────────────────────────────────────────────────────────────────────────┬─┤
│ ↑ Content above (hidden)                                                   │ │
│                                                                            │ │
│                                                                            │ │
│ M: Main Content (scrollable, scrolled to bottom)                           │ │
│                                                                            │ │
│                                                                            │ │
│                                                                            │ │
│                                                                            │ │
│                                                                            │ │
│                                                                            │ │
│                                                                            │ │
│                                                                            │ │
│                                                                            │ │
│                                                                            │ │
│                                                                            │ │
│                                                                            │ │
│ (end of content)                                                           │█│
├────────────────────────────────────────────────────────────────────────────┴─┤
│ F: Footer (docked to bottom)                                                 │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Horizontal-Sticky Layout with Content-Only Scroll and Gutters (Scrolled to Bottom)

- `layout`: horizontal-sticky
- `noScrollbarGutters`: false
- `scrollWholePage`: false

**Note:** Content scrolled to bottom; scrollbar at bottom position in right gutter only for Main Content area. Header, NavPanel, and Footer remain docked. End of content visible. Main Content block is the scroll parent.

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ H: Header (docked to top)                                                    │
├──────────────────────────────────────────────────────────────────────────────┤
│ N: Navigation Panel (docked to top)                                          │
├─┬──────────────────────────────────────────────────────────────────────────┬─┤
│ │ ↑ Content above (hidden)                                                 │ │
│ │                                                                          │ │
│ │                                                                          │ │
│ │ M: Main Content (scrollable, scrolled to bottom)                         │ │
│ │                                                                          │ │
│ │                                                                          │ │
│ │                                                                          │ │
│ │                                                                          │ │
│ │                                                                          │ │
│ │                                                                          │ │
│ │                                                                          │ │
│ │                                                                          │ │
│ │                                                                          │ │
│ │                                                                          │ │
│ │                                                                          │ │
│ │                                                                          │ │
│ │ (end of content)                                                         │█│
├─┴──────────────────────────────────────────────────────────────────────────┴─┤
│ F: Footer (docked to bottom)                                                 │
└──────────────────────────────────────────────────────────────────────────────┘
```

## Condensed Layout Diagrams

All condensed layout diagrams share the following common characteristics:

- **Header and NavPanel Combined**: The Header (H) and NavPanel (N) share the same row at the top of the viewport
- **Block Arrangement**: Blocks are stacked vertically in rows: Header/NavPanel → Main Content → Footer
- **Full Width Blocks**: All blocks span the full width of the container
- **NavPanel in Header**: NavPanel is embedded within the header area (hamburger menu on small screens, inline on large screens)
- **Variants**: The diagrams below demonstrate different combinations of scroll behavior (`scrollWholePage`), gutter reservation (`noScrollbarGutters`), and scroll positions

### Condensed Layout (No Overflow)

- `layout`: condensed
- `noScrollbarGutters`: true
- `scrollWholePage`: true

**Note:** Content fits within viewport; no scrollbar visible. Header/NavPanel combined at top, Footer at bottom.

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ H/N: Header and Navigation Panel                                             │
├──────────────────────────────────────────────────────────────────────────────┤
│ M: Main Content                                                              │
│                                                                              │
│                                                                              │
│                                                                              │
│                                                                              │
│                                                                              │
│                                                                              │
│                                                                              │
│                                                                              │
│                                                                              │
│                                                                              │
│                                                                              │
│                                                                              │
│                                                                              │
│                                                                              │
│                                                                              │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│ F: Footer                                                                    │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ (remaining space below footer)                                               │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Condensed Layout with Scroll Gutters (No Overflow)

- `layout`: condensed
- `noScrollbarGutters`: false
- `scrollWholePage`: true

**Note:** Content fits within viewport; scroll gutters reserved on both sides.

```
┌─┬──────────────────────────────────────────────────────────────────────────┬─┐
│ │ H/N: Header and Navigation Panel                                         │ │
│ ├──────────────────────────────────────────────────────────────────────────┤ │
│ │ M: Main Content                                                          │ │
│ │                                                                          │ │
│ │                                                                          │ │
│ │                                                                          │ │
│ │                                                                          │ │
│ │                                                                          │ │
│ │                                                                          │ │
│ │                                                                          │ │
│ │                                                                          │ │
│ │                                                                          │ │
│ │                                                                          │ │
│ │                                                                          │ │
│ │                                                                          │ │
│ │                                                                          │ │
│ │                                                                          │ │
│ │                                                                          │ │
│ ├──────────────────────────────────────────────────────────────────────────┤ │
│ │ F: Footer                                                                │ │
│ ├──────────────────────────────────────────────────────────────────────────┤ │
│ │                                                                          │ │
│ │ (remaining space below footer)                                           │ │
│ │                                                                          │ │
└─┴──────────────────────────────────────────────────────────────────────────┴─┘
```

### Condensed Layout with Overflow and Scrollbar

- `layout`: condensed
- `noScrollbarGutters`: false
- `scrollWholePage`: true

**Note:** Content overflows; scrollbar visible in right gutter at top position. Footer extends below visible screen.

```
┌─┬──────────────────────────────────────────────────────────────────────────┬─┐
│ │ H/N: Header and Navigation Panel                                         │█│
│ ├──────────────────────────────────────────────────────────────────────────┤█│
│ │ M: Main Content                                                          │█│
│ │                                                                          │█│
│ │                                                                          │█│
│ │                                                                          │█│
│ │                                                                          │█│
│ │                                                                          │█│
│ │                                                                          │█│
│ │                                                                          │█│
│ │                                                                          │█│
│ │                                                                          │█│
│ │                                                                          │ │
│ │                                                                          │ │
│ │                                                                          │ │
│ │                                                                          │ │
│ │                                                                          │ │
│ │                                                                          │ │
│ │                                                                          │ │
│ │                                                                          │ │
│ │                                                                          │ │
│ │                                                                          │ │
└─┴──────────────────────────────────────────────────────────────────────────┴─┘
  │                                                                          │
  ├──────────────────────────────────────────────────────────────────────────┤
  │ F: Footer                                                                │
  └──────────────────────────────────────────────────────────────────────────┘
```

### Condensed Layout with Overflow (No Gutter Reservation)

- `layout`: condensed
- `noScrollbarGutters`: true
- `scrollWholePage`: true

**Note:** Content overflows; scrollbar visible on right side. No scroll gutters reserved. Footer extends below visible screen.

```
┌────────────────────────────────────────────────────────────────────────────┬─┐
│ H/N: Header and Navigation Panel                                           │█│
├────────────────────────────────────────────────────────────────────────────┤█│
│ M: Main Content                                                            │█│
│                                                                            │█│
│                                                                            │█│
│                                                                            │█│
│                                                                            │█│
│                                                                            │█│
│                                                                            │█│
│                                                                            │█│
│                                                                            │█│
│                                                                            │█│
│                                                                            │ │
│                                                                            │ │
│                                                                            │ │
│                                                                            │ │
│                                                                            │ │
│                                                                            │ │
│                                                                            │ │
│                                                                            │ │
│                                                                            │ │
│                                                                            │ │
└────────────────────────────────────────────────────────────────────────────┴─┘
  │                                                                            │
  ├────────────────────────────────────────────────────────────────────────────┤
  │ F: Footer                                                                  │
  └────────────────────────────────────────────────────────────────────────────┘
```

### Condensed Layout Scrolled to Bottom

- `layout`: condensed
- `noScrollbarGutters`: false
- `scrollWholePage`: true

**Note:** Page scrolled to bottom; header/navpanel and top of main content overflow at top. Scrollbar at bottom position. Footer visible at bottom.

```
  ┌──────────────────────────────────────────────────────────────────────────┐
  │ H/N: Header and Navigation Panel                                         │
  ├──────────────────────────────────────────────────────────────────────────┤
  │ M: Main Content                                                          │
  │                                                                          │
  │                                                                          │
  │                                                                          │
┌─┼──────────────────────────────────────────────────────────────────────────┼─┐
│ │                                                                          │ │
│ │                                                                          │ │
│ │                                                                          │ │
│ │                                                                          │ │
│ │                                                                          │ │
│ │                                                                          │ │
│ │                                                                          │ │
│ │                                                                          │ │
│ │                                                                          │ │
│ │                                                                          │ │
│ │                                                                          │ │
│ │                                                                          │ │
│ │                                                                          │ │
│ │                                                                          │ │
│ │                                                                          │ │
│ │                                                                          │ │
│ │                                                                          │ │
│ │                                                                          │ │
│ │                                                                          │ │
│ ├──────────────────────────────────────────────────────────────────────────┤█│
│ │ F: Footer                                                                │█│
└─┴──────────────────────────────────────────────────────────────────────────┴─┘
```

### Condensed Layout with Content-Only Scroll

- `layout`: condensed
- `noScrollbarGutters`: false
- `scrollWholePage`: false

**Note:** Only main content scrolls; header/navpanel and footer remain docked. Scrollbar belongs to main content block. Content overflow indicated with arrows.

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ H/N: Header and Navigation Panel (docked to top)                             │
├─┬──────────────────────────────────────────────────────────────────────────┬─┤
│ │ ↑ Content above (hidden)                                                 │ │
│ │                                                                          │ │
│ │                                                                          │█│
│ │ M: Main Content (scrollable, mid-scroll position)                        │█│
│ │                                                                          │█│
│ │                                                                          │█│
│ │                                                                          │ │
│ │                                                                          │ │
│ │                                                                          │ │
│ │                                                                          │ │
│ │                                                                          │ │
│ │                                                                          │ │
│ │                                                                          │ │
│ │                                                                          │ │
│ │                                                                          │ │
│ │ ↓ Content below (hidden)                                                 │ │
├─┴──────────────────────────────────────────────────────────────────────────┴─┤
│ F: Footer (docked to bottom)                                                 │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Condensed Layout with Content-Only Scroll (No Gutter Reservation)

- `layout`: condensed
- `noScrollbarGutters`: true
- `scrollWholePage`: false

**Note:** Only main content scrolls; header/navpanel and footer remain docked. Scrollbar on right side of main content only. Content overflow indicated with arrows.

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ H/N: Header and Navigation Panel (docked to top)                             │
├────────────────────────────────────────────────────────────────────────────┬─┤
│ ↑ Content above (hidden)                                                   │ │
│                                                                            │ │
│                                                                            │ │
│ M: Main Content (scrollable, mid-scroll position)                          │█│
│                                                                            │█│
│                                                                            │█│
│                                                                            │ │
│                                                                            │ │
│                                                                            │ │
│                                                                            │ │
│                                                                            │ │
│                                                                            │ │
│                                                                            │ │
│                                                                            │ │
│                                                                            │ │
│                                                                            │ │
│                                                                            │ │
│ ↓ Content below (hidden)                                                   │ │
├────────────────────────────────────────────────────────────────────────────┴─┤
│ F: Footer (docked to bottom)                                                 │
└──────────────────────────────────────────────────────────────────────────────┘
```

## Condensed-Sticky Layout Diagrams

All condensed-sticky layout diagrams share the following common characteristics:

- **Header/NavPanel Sticky**: The combined Header and Navigation Panel (H/N) is always docked to the top of the viewport using sticky positioning
- **Footer Sticky**: The Footer (F) is always docked to the bottom of the viewport using sticky positioning
- **Content Scroll**: Only the Main Content (M) area scrolls between the sticky header/navpanel and footer
- **Combined Header**: Header and NavPanel share the same row (hamburger menu on small screens, inline on large screens)
- **Scroll Container**: Can be either the App Container (C) when `scrollWholePage=true` or the Main Content block (M) when `scrollWholePage=false`
- **Variants**: The diagrams below demonstrate different combinations of `scrollWholePage` and `noScrollbarGutters` settings

### Condensed-Sticky Layout (No Overflow)

- `layout`: condensed-sticky
- `noScrollbarGutters`: true
- `scrollWholePage`: true

**Note:** Content fits within viewport; no scrollbar visible. Header/NavPanel and Footer are docked.

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ H/N: Header and Navigation Panel (docked to top)                             │
├──────────────────────────────────────────────────────────────────────────────┤
│ M: Main Content                                                              │
│                                                                              │
│                                                                              │
│                                                                              │
│                                                                              │
│                                                                              │
│                                                                              │
│                                                                              │
│                                                                              │
│                                                                              │
│                                                                              │
│                                                                              │
│                                                                              │
│                                                                              │
│                                                                              │
│                                                                              │
│                                                                              │
│                                                                              │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│ F: Footer (docked to bottom)                                                 │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Condensed-Sticky Layout with Scroll Gutters (No Overflow)

- `layout`: condensed-sticky
- `noScrollbarGutters`: false
- `scrollWholePage`: true

**Note:** Content fits within viewport; scroll gutters reserved on both sides. Header/NavPanel and Footer are docked. App Container is the scroll parent.

```
┌─┬──────────────────────────────────────────────────────────────────────────┬─┐
│ │ H/N: Header and Navigation Panel (docked to top)                         │ │
│ ├──────────────────────────────────────────────────────────────────────────┤ │
│ │ M: Main Content                                                          │ │
│ │                                                                          │ │
│ │                                                                          │ │
│ │                                                                          │ │
│ │                                                                          │ │
│ │                                                                          │ │
│ │                                                                          │ │
│ │                                                                          │ │
│ │                                                                          │ │
│ │                                                                          │ │
│ │                                                                          │ │
│ │                                                                          │ │
│ │                                                                          │ │
│ │                                                                          │ │
│ │                                                                          │ │
│ │                                                                          │ │
│ │                                                                          │ │
│ │                                                                          │ │
│ ├──────────────────────────────────────────────────────────────────────────┤ │
│ │ F: Footer (docked to bottom)                                             │ │
└─┴──────────────────────────────────────────────────────────────────────────┴─┘
```

### Condensed-Sticky Layout with Content Overflow (Mid-Scroll)

- `layout`: condensed-sticky
- `noScrollbarGutters`: true
- `scrollWholePage`: true

**Note:** Content overflows; scrollbar visible on right side spanning entire viewport. Header/NavPanel and Footer remain docked. Scrollbar at mid-position. App Container is the scroll parent.

```
┌────────────────────────────────────────────────────────────────────────────┬─┐
│ H/N: Header and Navigation Panel (docked to top)                           │ │
├────────────────────────────────────────────────────────────────────────────┤ │
│ ↑ Content above (hidden)                                                   │ │
│                                                                            │ │
│                                                                            │ │
│ M: Main Content (scrollable, mid-scroll position)                          │ │
│                                                                            │ │
│                                                                            │ │
│                                                                            │ │
│                                                                            │█│
│                                                                            │█│
│                                                                            │█│
│                                                                            │ │
│                                                                            │ │
│                                                                            │ │
│                                                                            │ │
│                                                                            │ │
│                                                                            │ │
│ ↓ Content below (hidden)                                                   │ │
├────────────────────────────────────────────────────────────────────────────┤ │
│ F: Footer (docked to bottom)                                               │ │
└────────────────────────────────────────────────────────────────────────────┴─┘
```

### Condensed-Sticky Layout with Content Overflow and Scroll Gutters (Mid-Scroll)

- `layout`: condensed-sticky
- `noScrollbarGutters`: false
- `scrollWholePage`: true

**Note:** Content overflows; scrollbar visible in right gutter spanning entire viewport. Header/NavPanel and Footer remain docked. Scrollbar at mid-position. App Container is the scroll parent.

```
┌─┬──────────────────────────────────────────────────────────────────────────┬─┐
│ │ H/N: Header and Navigation Panel (docked to top)                         │ │
│ ├──────────────────────────────────────────────────────────────────────────┤ │
│ │ ↑ Content above (hidden)                                                 │ │
│ │                                                                          │ │
│ │                                                                          │ │
│ │ M: Main Content (scrollable, mid-scroll position)                        │ │
│ │                                                                          │ │
│ │                                                                          │ │
│ │                                                                          │ │
│ │                                                                          │ │
│ │                                                                          │█│
│ │                                                                          │█│
│ │                                                                          │█│
│ │                                                                          │ │
│ │                                                                          │ │
│ │                                                                          │ │
│ │                                                                          │ │
│ │ ↓ Content below (hidden)                                                 │ │
│ ├──────────────────────────────────────────────────────────────────────────┤ │
│ │ F: Footer (docked to bottom)                                             │ │
└─┴──────────────────────────────────────────────────────────────────────────┴─┘
```

### Condensed-Sticky Layout Scrolled to Bottom

- `layout`: condensed-sticky
- `noScrollbarGutters`: true
- `scrollWholePage`: true

**Note:** Content scrolled to bottom; scrollbar at bottom position spanning entire viewport. Header/NavPanel and Footer remain docked. End of content visible. App Container is the scroll parent.

```
┌────────────────────────────────────────────────────────────────────────────┬─┐
│ H/N: Header and Navigation Panel (docked to top)                           │ │
├────────────────────────────────────────────────────────────────────────────┤ │
│ ↑ Content above (hidden)                                                   │ │
│                                                                            │ │
│                                                                            │ │
│ M: Main Content (scrollable, scrolled to bottom)                           │ │
│                                                                            │ │
│                                                                            │ │
│                                                                            │ │
│                                                                            │ │
│                                                                            │ │
│                                                                            │ │
│                                                                            │ │
│                                                                            │ │
│                                                                            │ │
│                                                                            │ │
│                                                                            │ │
│ (end of content)                                                           │█│
├────────────────────────────────────────────────────────────────────────────┤█│
│ F: Footer (docked to bottom)                                               │█│
└────────────────────────────────────────────────────────────────────────────┴─┘
```

### Condensed-Sticky Layout Scrolled to Bottom with Scroll Gutters

- `layout`: condensed-sticky
- `noScrollbarGutters`: false
- `scrollWholePage`: true

**Note:** Content scrolled to bottom; scrollbar at bottom position in right gutter spanning entire viewport. Header/NavPanel and Footer remain docked. End of content visible. App Container is the scroll parent.

```
┌─┬──────────────────────────────────────────────────────────────────────────┬─┐
│ │ H/N: Header and Navigation Panel (docked to top)                         │ │
│ ├──────────────────────────────────────────────────────────────────────────┤ │
│ │ ↑ Content above (hidden)                                                 │ │
│ │                                                                          │ │
│ │                                                                          │ │
│ │ M: Main Content (scrollable, scrolled to bottom)                         │ │
│ │                                                                          │ │
│ │                                                                          │ │
│ │                                                                          │ │
│ │                                                                          │ │
│ │                                                                          │ │
│ │                                                                          │ │
│ │                                                                          │ │
│ │                                                                          │ │
│ │                                                                          │ │
│ │                                                                          │ │
│ │ (end of content)                                                         │█│
│ ├──────────────────────────────────────────────────────────────────────────┤█│
│ │ F: Footer (docked to bottom)                                             │█│
└─┴──────────────────────────────────────────────────────────────────────────┴─┘
```

### Condensed-Sticky Layout with Content-Only Scroll (No Overflow)

- `layout`: condensed-sticky
- `noScrollbarGutters`: true
- `scrollWholePage`: false

**Note:** Content fits within viewport; no scrollbar visible. Header/NavPanel and Footer are docked. Main Content block is the scroll parent.

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ H/N: Header and Navigation Panel (docked to top)                             │
├──────────────────────────────────────────────────────────────────────────────┤
│ M: Main Content                                                              │
│                                                                              │
│                                                                              │
│                                                                              │
│                                                                              │
│                                                                              │
│                                                                              │
│                                                                              │
│                                                                              │
│                                                                              │
│                                                                              │
│                                                                              │
│                                                                              │
│                                                                              │
│                                                                              │
│                                                                              │
│                                                                              │
│                                                                              │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│ F: Footer (docked to bottom)                                                 │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Condensed-Sticky Layout with Content-Only Scroll and Gutters (No Overflow)

- `layout`: condensed-sticky
- `noScrollbarGutters`: false
- `scrollWholePage`: false

**Note:** Content fits within viewport; scroll gutters reserved only for Main Content area. Header/NavPanel and Footer are docked. Main Content block is the scroll parent.

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ H/N: Header and Navigation Panel (docked to top)                             │
├─┬──────────────────────────────────────────────────────────────────────────┬─┤
│ │ M: Main Content                                                          │ │
│ │                                                                          │ │
│ │                                                                          │ │
│ │                                                                          │ │
│ │                                                                          │ │
│ │                                                                          │ │
│ │                                                                          │ │
│ │                                                                          │ │
│ │                                                                          │ │
│ │                                                                          │ │
│ │                                                                          │ │
│ │                                                                          │ │
│ │                                                                          │ │
│ │                                                                          │ │
│ │                                                                          │ │
│ │                                                                          │ │
│ │                                                                          │ │
│ │                                                                          │ │
├─┴──────────────────────────────────────────────────────────────────────────┴─┤
│ F: Footer (docked to bottom)                                                 │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Condensed-Sticky Layout with Content-Only Scroll (Mid-Scroll)

- `layout`: condensed-sticky
- `noScrollbarGutters`: true
- `scrollWholePage`: false

**Note:** Content overflows; scrollbar visible on right side only for Main Content area. Header/NavPanel and Footer remain docked and don't scroll. Scrollbar at mid-position. Main Content block is the scroll parent.

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ H/N: Header and Navigation Panel (docked to top)                             │
├────────────────────────────────────────────────────────────────────────────┬─┤
│ ↑ Content above (hidden)                                                   │ │
│                                                                            │ │
│                                                                            │ │
│ M: Main Content (scrollable, mid-scroll position)                          │ │
│                                                                            │ │
│                                                                            │ │
│                                                                            │ │
│                                                                            │█│
│                                                                            │█│
│                                                                            │█│
│                                                                            │ │
│                                                                            │ │
│                                                                            │ │
│                                                                            │ │
│                                                                            │ │
│                                                                            │ │
│ ↓ Content below (hidden)                                                   │ │
├────────────────────────────────────────────────────────────────────────────┴─┤
│ F: Footer (docked to bottom)                                                 │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Condensed-Sticky Layout with Content-Only Scroll and Gutters (Mid-Scroll)

- `layout`: condensed-sticky
- `noScrollbarGutters`: false
- `scrollWholePage`: false

**Note:** Content overflows; scrollbar visible in right gutter only for Main Content area. Header/NavPanel and Footer remain docked and don't scroll. Scrollbar at mid-position. Main Content block is the scroll parent.

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ H/N: Header and Navigation Panel (docked to top)                             │
├─┬──────────────────────────────────────────────────────────────────────────┬─┤
│ │ ↑ Content above (hidden)                                                 │ │
│ │                                                                          │ │
│ │                                                                          │ │
│ │ M: Main Content (scrollable, mid-scroll position)                        │ │
│ │                                                                          │ │
│ │                                                                          │ │
│ │                                                                          │ │
│ │                                                                          │ │
│ │                                                                          │█│
│ │                                                                          │█│
│ │                                                                          │█│
│ │                                                                          │ │
│ │                                                                          │ │
│ │                                                                          │ │
│ │                                                                          │ │
│ │                                                                          │ │
│ │ ↓ Content below (hidden)                                                 │ │
├─┴──────────────────────────────────────────────────────────────────────────┴─┤
│ F: Footer (docked to bottom)                                                 │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Condensed-Sticky Layout with Content-Only Scroll (Scrolled to Bottom)

- `layout`: condensed-sticky
- `noScrollbarGutters`: true
- `scrollWholePage`: false

**Note:** Content scrolled to bottom; scrollbar at bottom position only for Main Content area. Header/NavPanel and Footer remain docked. End of content visible. Main Content block is the scroll parent.

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ H/N: Header and Navigation Panel (docked to top)                             │
├────────────────────────────────────────────────────────────────────────────┬─┤
│ ↑ Content above (hidden)                                                   │ │
│                                                                            │ │
│                                                                            │ │
│ M: Main Content (scrollable, scrolled to bottom)                           │ │
│                                                                            │ │
│                                                                            │ │
│                                                                            │ │
│                                                                            │ │
│                                                                            │ │
│                                                                            │ │
│                                                                            │ │
│                                                                            │ │
│                                                                            │ │
│                                                                            │ │
│                                                                            │█│
│ (end of content)                                                           │█│
├────────────────────────────────────────────────────────────────────────────┴─┤
│ F: Footer (docked to bottom)                                                 │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Condensed-Sticky Layout with Content-Only Scroll and Gutters (Scrolled to Bottom)

- `layout`: condensed-sticky
- `noScrollbarGutters`: false
- `scrollWholePage`: false

**Note:** Content scrolled to bottom; scrollbar at bottom position in right gutter only for Main Content area. Header/NavPanel and Footer remain docked. End of content visible. Main Content block is the scroll parent.

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ H/N: Header and Navigation Panel (docked to top)                             │
├─┬──────────────────────────────────────────────────────────────────────────┬─┤
│ │ ↑ Content above (hidden)                                                 │ │
│ │                                                                          │ │
│ │                                                                          │ │
│ │ M: Main Content (scrollable, scrolled to bottom)                         │ │
│ │                                                                          │ │
│ │                                                                          │ │
│ │                                                                          │ │
│ │                                                                          │ │
│ │                                                                          │ │
│ │                                                                          │ │
│ │                                                                          │ │
│ │                                                                          │ │
│ │                                                                          │ │
│ │                                                                          │ │
│ │                                                                          │█│
│ │ (end of content)                                                         │█│
├─┴──────────────────────────────────────────────────────────────────────────┴─┤
│ F: Footer (docked to bottom)                                                 │
└──────────────────────────────────────────────────────────────────────────────┘
```

## Vertical Layout Diagrams

All vertical layout diagrams share the following common characteristics:

- **Navigation Panel Position**: The Navigation Panel (N) is positioned to the left of the Main Content (M)
- **Layout Structure**: Header (H) at top, then a row containing NavPanel (N) on the left and Main Content (M) on the right, Footer (F) at bottom
- **Scroll Container**: Can be either the App Container (C) when `scrollWholePage=true` or the Main Content block (M) when `scrollWholePage=false`
- **Variants**: The diagrams below demonstrate different combinations of `scrollWholePage` and `noScrollbarGutters` settings

### Vertical Layout (No Overflow)

- `layout`: vertical
- `noScrollbarGutters`: true
- `scrollWholePage`: true

**Note:** Content fits within viewport; no scrollbar visible.

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ H: Header                                                                    │
├────────────┬─────────────────────────────────────────────────────────────────┤
│ N: Nav     │ M: Main Content                                                 │
│            │                                                                 │
│            │                                                                 │
│            │                                                                 │
│            │                                                                 │
│            │                                                                 │
│            │                                                                 │
│            │                                                                 │
│            │                                                                 │
│            │                                                                 │
│            │                                                                 │
│            │                                                                 │
│            │                                                                 │
│            │                                                                 │
│            │                                                                 │
│            │                                                                 │
│            │                                                                 │
│            │                                                                 │
├────────────┴─────────────────────────────────────────────────────────────────┤
│ F: Footer                                                                    │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Vertical Layout with Scroll Gutters (No Overflow)

- `layout`: vertical
- `noScrollbarGutters`: false
- `scrollWholePage`: true

**Note:** Content fits within viewport; scroll gutters reserved on both sides.

```
┌─┬──────────────────────────────────────────────────────────────────────────┬─┐
│ │ H: Header                                                                │ │
│ ├──────────┬───────────────────────────────────────────────────────────────┤ │
│ │ N: Nav   │ M: Main Content                                               │ │
│ │          │                                                               │ │
│ │          │                                                               │ │
│ │          │                                                               │ │
│ │          │                                                               │ │
│ │          │                                                               │ │
│ │          │                                                               │ │
│ │          │                                                               │ │
│ │          │                                                               │ │
│ │          │                                                               │ │
│ │          │                                                               │ │
│ │          │                                                               │ │
│ │          │                                                               │ │
│ │          │                                                               │ │
│ │          │                                                               │ │
│ │          │                                                               │ │
│ │          │                                                               │ │
│ ├──────────┴───────────────────────────────────────────────────────────────┤ │
│ │ F: Footer                                                                │ │
└─┴──────────────────────────────────────────────────────────────────────────┴─┘
```

### Vertical Layout with Content Overflow (Mid-Scroll)

- `layout`: vertical
- `noScrollbarGutters`: true
- `scrollWholePage`: true

**Note:** Content overflows; scrollbar visible on right side spanning entire viewport. Scrollbar at mid-position.

```
┌────────────────────────────────────────────────────────────────────────────┬─┐
│ ↑ Content above (hidden)                                                   │ │
├──────────┬─────────────────────────────────────────────────────────────────┤ │
│ N: Nav   │ M: Main Content (scrollable, mid-scroll position)               │ │
│          │                                                                 │ │
│          │                                                                 │ │
│          │                                                                 │ │
│          │                                                                 │ │
│          │                                                                 │ │
│          │                                                                 │ │
│          │                                                                 │ │
│          │                                                                 │█│
│          │                                                                 │█│
│          │                                                                 │█│
│          │                                                                 │ │
│          │                                                                 │ │
│          │                                                                 │ │
│          │                                                                 │ │
│          │                                                                 │ │
│          │                                                                 │ │
│ ↓ Content below (hidden)                                                   │ │
├──────────┴─────────────────────────────────────────────────────────────────┤ │
│ ↓ Content below (hidden)                                                   │ │
└────────────────────────────────────────────────────────────────────────────┴─┘
```

### Vertical Layout with Content Overflow and Scroll Gutters (Mid-Scroll)

- `layout`: vertical
- `noScrollbarGutters`: false
- `scrollWholePage`: true

**Note:** Content overflows; scrollbar visible in right gutter spanning entire viewport. Scrollbar at mid-position.

```
┌─┬──────────────────────────────────────────────────────────────────────────┬─┐
│ │ ↑ Content above (hidden)                                                 │ │
│ ├────────┬─────────────────────────────────────────────────────────────────┤ │
│ │ N: Nav │ M: Main Content (scrollable, mid-scroll position)               │ │
│ │        │                                                                 │ │
│ │        │                                                                 │ │
│ │        │                                                                 │ │
│ │        │                                                                 │ │
│ │        │                                                                 │ │
│ │        │                                                                 │ │
│ │        │                                                                 │ │
│ │        │                                                                 │█│
│ │        │                                                                 │█│
│ │        │                                                                 │█│
│ │        │                                                                 │ │
│ │        │                                                                 │ │
│ │        │                                                                 │ │
│ │        │                                                                 │ │
│ │        │                                                                 │ │
│ │ ↓ Content below (hidden)                                                 │ │
│ ├────────┴─────────────────────────────────────────────────────────────────┤ │
│ │ ↓ Content below (hidden)                                                 │ │
└─┴──────────────────────────────────────────────────────────────────────────┴─┘
```

### Vertical Layout Scrolled to Bottom

- `layout`: vertical
- `noScrollbarGutters`: true
- `scrollWholePage`: true

**Note:** Content scrolled to bottom; scrollbar at bottom position spanning entire viewport. End of content visible.

```
┌────────────────────────────────────────────────────────────────────────────┬─┐
│ ↑ Content above (hidden)                                                   │ │
├──────────┬─────────────────────────────────────────────────────────────────┤ │
│ N: Nav   │ M: Main Content (scrollable, scrolled to bottom)                │ │
│          │                                                                 │ │
│          │                                                                 │ │
│          │                                                                 │ │
│          │                                                                 │ │
│          │                                                                 │ │
│          │                                                                 │ │
│          │                                                                 │ │
│          │                                                                 │ │
│          │                                                                 │ │
│          │                                                                 │ │
│          │                                                                 │ │
│          │                                                                 │ │
│          │                                                                 │ │
│          │                                                                 │ │
│          │ (end of content)                                                │█│
├──────────┴─────────────────────────────────────────────────────────────────┤█│
│ F: Footer                                                                  │█│
└────────────────────────────────────────────────────────────────────────────┴─┘
```

### Vertical Layout Scrolled to Bottom with Scroll Gutters

- `layout`: vertical
- `noScrollbarGutters`: false
- `scrollWholePage`: true

**Note:** Content scrolled to bottom; scrollbar at bottom position in right gutter spanning entire viewport. End of content visible.

```
┌─┬──────────────────────────────────────────────────────────────────────────┬─┐
│ │ ↑ Content above (hidden)                                                 │ │
│ ├────────┬─────────────────────────────────────────────────────────────────┤ │
│ │ N: Nav │ M: Main Content (scrollable, scrolled to bottom)                │ │
│ │        │                                                                 │ │
│ │        │                                                                 │ │
│ │        │                                                                 │ │
│ │        │                                                                 │ │
│ │        │                                                                 │ │
│ │        │                                                                 │ │
│ │        │                                                                 │ │
│ │        │                                                                 │ │
│ │        │                                                                 │ │
│ │        │                                                                 │ │
│ │        │                                                                 │ │
│ │        │                                                                 │ │
│ │        │                                                                 │ │
│ │        │ (end of content)                                                │█│
│ ├────────┴─────────────────────────────────────────────────────────────────┤█│
│ │ F: Footer                                                                │█│
└─┴──────────────────────────────────────────────────────────────────────────┴─┘
```

### Vertical Layout with Content-Only Scroll (No Overflow)

- `layout`: vertical
- `noScrollbarGutters`: true
- `scrollWholePage`: false

**Note:** Content fits within viewport; no scrollbar visible. Main Content block is the scroll parent.

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ H: Header                                                                    │
├────────────┬─────────────────────────────────────────────────────────────────┤
│ N: Nav     │ M: Main Content                                                 │
│            │                                                                 │
│            │                                                                 │
│            │                                                                 │
│            │                                                                 │
│            │                                                                 │
│            │                                                                 │
│            │                                                                 │
│            │                                                                 │
│            │                                                                 │
│            │                                                                 │
│            │                                                                 │
│            │                                                                 │
│            │                                                                 │
│            │                                                                 │
│            │                                                                 │
│            │                                                                 │
│            │                                                                 │
├────────────┴─────────────────────────────────────────────────────────────────┤
│ F: Footer                                                                    │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Vertical Layout with Content-Only Scroll and Gutters (No Overflow)

- `layout`: vertical
- `noScrollbarGutters`: false
- `scrollWholePage`: false

**Note:** Content fits within viewport; scroll gutters reserved only for Main Content area. Main Content block is the scroll parent.

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ H: Header                                                                    │
├────────────┬────────────────────────────────────────────────────────────────┬┐
│ N: Nav     │ M: Main Content                                                ││
│            │                                                                ││
│            │                                                                ││
│            │                                                                ││
│            │                                                                ││
│            │                                                                ││
│            │                                                                ││
│            │                                                                ││
│            │                                                                ││
│            │                                                                ││
│            │                                                                ││
│            │                                                                ││
│            │                                                                ││
│            │                                                                ││
│            │                                                                ││
│            │                                                                ││
│            │                                                                ││
│            │                                                                ││
├────────────┴────────────────────────────────────────────────────────────────┴┤
│ F: Footer                                                                    │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Vertical Layout with Content-Only Scroll (Mid-Scroll)

- `layout`: vertical
- `noScrollbarGutters`: true
- `scrollWholePage`: false

**Note:** Content overflows; scrollbar visible on right side only for Main Content area. Header, NavPanel, and Footer don't scroll. Scrollbar at mid-position. Main Content block is the scroll parent.

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ H: Header                                                                    │
├────────────┬─────────────────────────────────────────────────────────────┬─┤
│ N: Nav     │ ↑ Content above (hidden)                                    │ │
│            │                                                             │ │
│            │                                                             │ │
│            │ M: Main Content (scrollable, mid-scroll position)           │ │
│            │                                                             │ │
│            │                                                             │ │
│            │                                                             │ │
│            │                                                             │ │
│            │                                                             │█│
│            │                                                             │█│
│            │                                                             │█│
│            │                                                             │ │
│            │                                                             │ │
│            │                                                             │ │
│            │                                                             │ │
│            │                                                             │ │
│            │                                                             │ │
│            │ ↓ Content below (hidden)                                    │ │
├────────────┴─────────────────────────────────────────────────────────────┴─┤
│ F: Footer                                                                    │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Vertical Layout with Content-Only Scroll and Gutters (Mid-Scroll)

- `layout`: vertical
- `noScrollbarGutters`: false
- `scrollWholePage`: false

**Note:** Content overflows; scrollbar visible in right gutter only for Main Content area. Header, NavPanel, and Footer don't scroll. Scrollbar at mid-position. Main Content block is the scroll parent.

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ H: Header                                                                    │
├────────────┬─────────────────────────────────────────────────────────────┬─┬─┤
│ N: Nav     │ ↑ Content above (hidden)                                    │ │ │
│            │                                                             │ │ │
│            │                                                             │ │ │
│            │ M: Main Content (scrollable, mid-scroll position)           │ │ │
│            │                                                             │ │ │
│            │                                                             │ │ │
│            │                                                             │ │ │
│            │                                                             │ │ │
│            │                                                             │ │█│
│            │                                                             │ │█│
│            │                                                             │ │█│
│            │                                                             │ │ │
│            │                                                             │ │ │
│            │                                                             │ │ │
│            │                                                             │ │ │
│            │                                                             │ │ │
│            │ ↓ Content below (hidden)                                    │ │ │
├────────────┴─────────────────────────────────────────────────────────────┴─┴─┤
│ F: Footer                                                                    │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Vertical Layout with Content-Only Scroll (Scrolled to Bottom)

- `layout`: vertical
- `noScrollbarGutters`: true
- `scrollWholePage`: false

**Note:** Content scrolled to bottom; scrollbar at bottom position only for Main Content area. Header, NavPanel, and Footer don't scroll. End of content visible. Main Content block is the scroll parent.

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ H: Header                                                                    │
├────────────┬─────────────────────────────────────────────────────────────┬─┤
│ N: Nav     │ ↑ Content above (hidden)                                    │ │
│            │                                                             │ │
│            │                                                             │ │
│            │ M: Main Content (scrollable, scrolled to bottom)            │ │
│            │                                                             │ │
│            │                                                             │ │
│            │                                                             │ │
│            │                                                             │ │
│            │                                                             │ │
│            │                                                             │ │
│            │                                                             │ │
│            │                                                             │ │
│            │                                                             │ │
│            │                                                             │ │
│            │                                                             │ │
│            │                                                             │█│
│            │ (end of content)                                            │█│
├────────────┴─────────────────────────────────────────────────────────────┴─┤
│ F: Footer                                                                    │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Vertical Layout with Content-Only Scroll and Gutters (Scrolled to Bottom)

- `layout`: vertical
- `noScrollbarGutters`: false
- `scrollWholePage`: false

**Note:** Content scrolled to bottom; scrollbar at bottom position in right gutter only for Main Content area. Header, NavPanel, and Footer don't scroll. End of content visible. Main Content block is the scroll parent.

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ H: Header                                                                    │
├────────────┬─────────────────────────────────────────────────────────────┬─┬─┤
│ N: Nav     │ ↑ Content above (hidden)                                    │ │ │
│            │                                                             │ │ │
│            │                                                             │ │ │
│            │ M: Main Content (scrollable, scrolled to bottom)            │ │ │
│            │                                                             │ │ │
│            │                                                             │ │ │
│            │                                                             │ │ │
│            │                                                             │ │ │
│            │                                                             │ │ │
│            │                                                             │ │ │
│            │                                                             │ │ │
│            │                                                             │ │ │
│            │                                                             │ │ │
│            │                                                             │ │ │
│            │                                                             │ │ │
│            │                                                             │ │█│
│            │ (end of content)                                            │ │█│
├────────────┴─────────────────────────────────────────────────────────────┴─┴─┤
│ F: Footer                                                                    │
└──────────────────────────────────────────────────────────────────────────────┘
```
