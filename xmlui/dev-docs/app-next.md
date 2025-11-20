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

## Table of Contents

1. Layout Definition Framework
   - UI Blocks (Building Blocks)
   - Block Arrangement Patterns
   - Layout Descriptions by Block Arrangement
   - Scroll Container Logic
2. Table of Contents (TOC) Feature (Future Enhancement)
3. AppHeader Modular Design (Future Enhancement)
4. Screen Layout Diagrams
5. Component-Based Layout Refactoring Plan (NEW APPROACH)
   - Phase 1: Create All Slot Components ✅ COMPLETED
   - Phase 2: Refactor Layouts Incrementally (One Layout at a Time)
   - Current Status

---

## Layout Definition Framework

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

## Table of Contents (TOC) Feature (Future Enhancement)

> **Note**: This section describes a planned future enhancement for the App component. It is not part of the current refactoring scope.

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

## AppHeader Modular Design (Future Enhancement)

> **Note**: This section describes a planned future enhancement for the AppHeader component. It is not part of the current refactoring scope.

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

## Part 3: Component-Based Layout Refactoring Plan

This section outlines the strategy for refactoring the App2 component to use a component-based architecture with clear separation of concerns and meaningful naming conventions.

### Refactoring Goals

1. **Eliminate Switch Statement Complexity**: Replace the 600+ line switch statement with composable layout components
2. **Introduce Layout Slot Components**: Create dedicated components for Header, Footer, NavPanel, and MainContent slots
3. **Meaningful CSS Class Names**: Replace generic names like `wrapper`, `contentWrapper`, `PagesWrapper` with semantic names
4. **Reduce CSS Nesting**: Flatten CSS structure using direct component styling instead of deep selector chains
5. **Configuration-Driven Layouts**: Use layout configuration objects instead of hardcoded JSX for each variant
6. **Improve Testability**: Make layout logic testable through isolated components
7. **Maintain Backward Compatibility**: Ensure existing tests pass without modification

### Current Problems Analysis

#### Problem 1: Monolithic Switch Statement (Lines 400-607)

**Current State:**
- 8 layout cases with ~200 lines of duplicated JSX
- Each case repeats similar structure with slight variations
- Hard to identify differences between layouts
- Difficult to add new layout variants

**Example of Duplication:**
```tsx
// Repeated across multiple cases with minor variations
<div className={styles.footerWrapper} ref={footerRefCallback}>
  {footer}
</div>
```

#### Problem 2: Confusing CSS Class Names

**Current Names:**
- `.wrapper` - Generic, doesn't convey purpose (actually the App Container)
- `.contentWrapper` - Ambiguous (sometimes scroll container, sometimes just layout wrapper)
- `.PagesWrapper` - Not clear (is it the main content area?)
- `.PagesWrapperInner` - Too generic
- `.navPanelWrapper` - Only descriptive name

**Issues:**
- Hard to understand layout structure from class names
- Multiple classes needed to identify element purpose (`.wrapper.vertical.sticky`)
- CSS overrides needed because base classes don't match intent

#### Problem 3: Deep CSS Nesting (App2.module.scss)

**Current Structure:**
```scss
.wrapper {
  &.vertical {
    .contentWrapper {
      .PagesWrapper {
        .PagesWrapperInner {
          // Actual content styles
        }
      }
    }
  }
}
```

**Issues:**
- Deep nesting makes specificity wars
- Hard to locate styles for specific elements
- Layout-specific overrides scattered throughout file
- Difficult to reason about cascade

#### Problem 4: Mixed Responsibilities in Components

**Current State:**
- `App2Native.tsx` handles:
  - Layout rendering (switch statement)
  - Scroll container logic
  - Ref management
  - Size observation
  - CSS variable calculation
  - Drawer state
  - Navigation visibility
  - Theme initialization

**Issues:**
- Single component doing too many things
- Hard to test individual concerns
- Changes to one aspect risk breaking others

### Proposed Component Architecture

#### New Component Hierarchy

```
App2Native (Coordinator)
├── AppContainer (Root layout wrapper)
│   ├── AppHeaderSlot (Header positioning & behavior)
│   │   └── {header content}
│   ├── AppNavPanelSlot (NavPanel positioning & visibility)
│   │   └── {navPanel content}
│   ├── AppMainContentSlot (Main content area with scroll)
│   │   └── {children / pages}
│   └── AppFooterSlot (Footer positioning & stickiness)
│       └── {footer content}
└── AppDrawer (Mobile drawer for NavPanel)
    └── {navPanel in drawer}
```

#### Component Responsibilities

**1. AppContainer**
- **File**: `AppContainer.tsx`
- **Purpose**: Root layout wrapper, manages overall dimensions and scroll strategy
- **Props**:
  - `layout: AppLayoutType`
  - `scrollWholePage: boolean`
  - `noScrollbarGutters: boolean`
  - `isNested: boolean`
  - `mediaSize: MediaSize`
  - `style: CSSProperties`
  - `className?: string`
  - `scrollContainerRef: RefObject`
  - `children: ReactNode`
- **Responsibilities**:
  - Apply layout-specific root classes
  - Set up scroll container (itself or delegate to child)
  - Manage scrollbar gutter compensation
  - Handle nested vs. full viewport sizing
  - Apply CSS custom properties (--header-height, --footer-height, --scrollbar-width)
- **CSS Class**: `.appContainer` with modifiers `.vertical`, `.horizontal`, `.desktop`, `.scrollWholePage`, `.noScrollbarGutters`

**2. AppHeaderSlot**
- **File**: `AppHeaderSlot.tsx`
- **Purpose**: Position and manage header behavior (static vs sticky)
- **Props**:
  - `layout: AppLayoutType`
  - `isSticky: boolean`
  - `sizeObserverRef: (element) => void`
  - `children: ReactNode`
  - `className?: string`
- **Responsibilities**:
  - Render header element with semantic HTML (`<header>`)
  - Apply sticky positioning when needed
  - Attach size observer for height tracking
  - Apply layout-specific header styles
  - Handle full-width vs. constrained width
- **CSS Class**: `.appHeaderSlot` with modifiers `.sticky`, `.fullWidth`

**3. AppNavPanelSlot**
- **File**: `AppNavPanelSlot.tsx`
- **Purpose**: Position and manage navigation panel visibility
- **Props**:
  - `layout: AppLayoutType`
  - `isVisible: boolean`
  - `placement: "left" | "top" | "none"`
  - `children: ReactNode`
  - `className?: string`
- **Responsibilities**:
  - Render nav element with semantic HTML (`<nav>` or `<aside>`)
  - Control visibility based on screen size and layout
  - Apply layout-specific positioning (left sidebar vs. top bar)
  - Handle condensed layout (embedded in header)
- **CSS Class**: `.appNavPanelSlot` with modifiers `.left`, `.top`, `.embedded`
- **Conditional Rendering**: Only renders when `isVisible && children`

**4. AppMainContentSlot**
- **File**: `AppMainContentSlot.tsx`
- **Purpose**: Main content area with optional scroll container
- **Props**:
  - `layout: AppLayoutType`
  - `isScrollContainer: boolean`
  - `scrollContainerRef?: RefObject`
  - `applyDefaultPadding: boolean`
  - `children: ReactNode`
  - `className?: string`
- **Responsibilities**:
  - Render main content with semantic HTML (`<main>`)
  - Set up scroll container when needed
  - Apply default content padding
  - Manage content max-width constraints
- **CSS Class**: `.appMainContentSlot` with modifiers `.scrollContainer`, `.withPadding`

**5. AppFooterSlot**
- **File**: `AppFooterSlot.tsx`
- **Purpose**: Position and manage footer behavior (static vs sticky)
- **Props**:
  - `layout: AppLayoutType`
  - `isSticky: boolean`
  - `sizeObserverRef: (element) => void`
  - `children: ReactNode`
  - `className?: string`
- **Responsibilities**:
  - Render footer element with semantic HTML (`<footer>`)
  - Apply sticky positioning when needed
  - Attach size observer for height tracking
  - Handle non-sticky override
- **CSS Class**: `.appFooterSlot` with modifiers `.sticky`, `.nonSticky`
- **Conditional Rendering**: Only renders when `children` is provided

**6. AppDrawer**
- **File**: `AppDrawer.tsx` (wrapper around existing Sheet component)
- **Purpose**: Mobile drawer for navigation panel
- **Props**:
  - `open: boolean`
  - `onOpenChange: (open: boolean) => void`
  - `children: ReactNode`
- **Responsibilities**:
  - Wrap Sheet/SheetContent components
  - Render navigation panel in drawer context
  - Handle open/close state

---

## Refactoring Opportunities

This section provides a deep analysis of the App2 component implementation, identifying specific refactoring opportunities to improve code maintainability, readability, and performance.

### Analysis Methodology

The analysis covers three main areas:
1. **App2Native.tsx** - The native React component implementation (~742 lines)
2. **App2.tsx** - The XMLUI component definition and renderer (~774 lines)
3. **App2.module.scss** - Component styling (~435 lines)

Each opportunity is categorized by:
- **Impact**: How much the change improves the codebase (High/Medium/Low)
- **Complexity**: Implementation difficulty (Simple/Moderate/Complex)
- **Risk**: Potential for introducing bugs (Low/Medium/High)
- **Lines Saved**: Approximate reduction in code

---

## App2Native.tsx Refactoring Opportunities

### 1. Simplify CSS Variable Calculation Logic ✅ COMPLETED

**Current State**: Lines 323-360 calculate CSS variables with complex conditional logic

**Issue**:
```typescript
"--header-height":
  !scrollWholePage ||
  safeLayout === "vertical" ||
  safeLayout === "horizontal" ||
  safeLayout === "condensed"
    ? "0px"
    : safeLayout === "desktop"
    ? headerHeight + "px"
    : headerHeight + "px",
```

- Redundant conditions (desktop case and default case produce same result)
- Logic duplicated for header and footer
- Hard to understand the intent

**Opportunity**:
Extract to helper function:
```typescript
function getLayoutHeightConfig(
  safeLayout: AppLayoutType,
  scrollWholePage: boolean
): { useHeaderHeight: boolean; useFooterHeight: boolean } {
  // Non-sticky layouts don't need height compensation
  if (scrollWholePage && (
    safeLayout === "vertical" ||
    safeLayout === "horizontal" ||
    safeLayout === "condensed"
  )) {
    return { useHeaderHeight: false, useFooterHeight: false };
  }
  
  // Sticky layouts need height compensation
  return { useHeaderHeight: true, useFooterHeight: true };
}

// Usage in useMemo:
const heightConfig = getLayoutHeightConfig(safeLayout, scrollWholePage);
return {
  ...style,
  "--header-height": heightConfig.useHeaderHeight ? `${headerHeight}px` : "0px",
  "--footer-height": heightConfig.useFooterHeight ? `${footerHeight}px` : "0px",
  // ... other vars
};
```

**Benefits**:
- Clearer intent - named function explains the logic
- Eliminates redundant conditions
- Single place to understand height calculation rules
- Easier to test in isolation

**Impact**: Medium  
**Complexity**: Simple  
**Risk**: Low  
**Lines Saved**: ~15 lines

---

### 2. Consolidate Ref Callback Pattern ✅ COMPLETED

**Current State**: Lines 299-321 define separate ref callbacks for footer and header

**Issue**:
```typescript
const footerRef = useRef<HTMLDivElement | null>();
const footerRefCallback = useCallback((element: HTMLDivElement | null) => {
  footerRef.current = element;
}, []);

const headerRef = useRef<HTMLDivElement | null>();
const headerRefCallback = useCallback((element: HTMLDivElement | null) => {
  headerRef.current = element;
}, []);

useResizeObserver(footerRef, useCallback(...));
useResizeObserver(headerRef, useCallback(...));
```

- Duplicated pattern for each element
- Creates multiple callback functions

**Opportunity**:
Extract to custom hook:
```typescript
function useElementSizeObserver() {
  const ref = useRef<HTMLElement | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  
  const refCallback = useCallback((element: HTMLElement | null) => {
    ref.current = element;
  }, []);
  
  useResizeObserver(
    ref,
    useCallback((entries) => {
      const rect = entries?.[0]?.contentRect;
      if (rect) {
        setSize({ width: rect.width, height: rect.height });
      }
    }, [])
  );
  
  return { refCallback, size, height: size.height, width: size.width };
}

// Usage:
const footer = useElementSizeObserver();
const header = useElementSizeObserver();

// In JSX:
<AppHeaderSlot ref={header.refCallback}>
```

**Benefits**:
- Reusable pattern for any element
- Reduces boilerplate by ~50%
- Single pattern to understand
- Can be used by other components

**Impact**: Medium  
**Complexity**: Simple  
**Risk**: Low  
**Lines Saved**: ~12 lines

---

### 3. Extract Layout Context Value Creation ✅ COMPLETED

**Current State**: Lines 408-448 create layoutContextValue inline

**Issue**:
- 40+ lines of context value creation in main component body
- Dependencies array has 14 items
- Difficult to see what values change together

**Opportunity**:
Extract to custom hook:
```typescript
function useAppLayoutContextValue({
  hasRegisteredNavPanel,
  hasRegisteredHeader,
  navPanelVisible,
  drawerVisible,
  safeLayout,
  logo,
  logoDark,
  logoLight,
  toggleDrawer,
  navPanelDef,
  logoContentDef,
  registerSubNavPanelSlot,
  subNavPanelSlot,
  scrollWholePage,
  isNested,
}: AppLayoutContextParams): IAppLayoutContext {
  return useMemo(
    () => ({
      hasRegisteredNavPanel,
      hasRegisteredHeader,
      navPanelVisible,
      drawerVisible,
      layout: safeLayout,
      logo,
      logoDark,
      logoLight,
      showDrawer: () => setDrawerVisible(true),  // Needs setDrawerVisible passed in
      hideDrawer: () => setDrawerVisible(false),
      toggleDrawer,
      navPanelDef,
      logoContentDef,
      registerSubNavPanelSlot,
      subNavPanelSlot,
      scrollWholePage,
      isFullVerticalWidth: false,
      isNested,
    }),
    [/* all deps */]
  );
}
```

**Benefits**:
- Cleaner component body
- Context creation logic is isolated
- Easier to test context value creation
- Can share logic between App and App2

**Impact**: Low (primarily organizational)  
**Complexity**: Simple  
**Risk**: Low  
**Lines Saved**: ~10 lines from main component

---

### 4. Eliminate Switch Statement Duplication ✅ COMPLETED

**Current State**: Lines 488-698 contain 8 layout cases with significant duplication

**Issue**:
Each switch case repeats similar structure:
```typescript
case "vertical":
  content = (
    <AppContainer className={...} style={...} {...rest}>
      {navPanelVisible && <AppNavPanelSlot>{navPanel}</AppNavPanelSlot>}
      <AppContentSlot ref={pageScrollRef}>
        <AppHeaderSlot ref={headerRefCallback}>{header}</AppHeaderSlot>
        <AppPagesSlot ref={contentScrollRef}>
          <div className={pagesWrapperClasses}>{children}</div>
        </AppPagesSlot>
        <AppFooterSlot ref={footerRefCallback}>{footer}</AppFooterSlot>
      </AppContentSlot>
    </AppContainer>
  );
  break;

case "vertical-sticky":
  content = (
    <AppContainer className={...} style={...} {...rest}>
      {/* Nearly identical structure with minor class differences */}
    </AppContainer>
  );
  break;
```

**Observations**:
- AppContainer wraps all cases (already consistent)
- Main differences are:
  - Container class names (`styles.vertical`, `styles.horizontal`, etc.)
  - Header/footer sticky classes
  - NavPanel position (side column vs inside header)
  - Which ref gets the scroll container
  - Presence of intermediate wrappers (`.content` in vertical-full-header)

**Opportunity**:
Create layout configuration system:
```typescript
interface LayoutConfig {
  containerClasses: string[];
  headerClasses: string[];
  footerClasses: string[];
  scrollRef: "page" | "content";
  navPanelPosition: "side" | "header" | "none";
  useContentWrapper: boolean;
  useContentDiv: boolean; // For vertical-full-header
}

const layoutConfigs: Record<AppLayoutType, LayoutConfig> = {
  "vertical": {
    containerClasses: [styles.vertical],
    headerClasses: [],
    footerClasses: [],
    scrollRef: "page",
    navPanelPosition: "side",
    useContentWrapper: true,
    useContentDiv: false,
  },
  "vertical-sticky": {
    containerClasses: [styles.vertical, styles.sticky],
    headerClasses: [styles.sticky],
    footerClasses: [], // conditionally add nonSticky
    scrollRef: "page",
    navPanelPosition: "side",
    useContentWrapper: true,
    useContentDiv: false,
  },
  // ... etc for all 8 layouts
};

// Single JSX template using config:
const config = layoutConfigs[safeLayout];
const scrollRef = config.scrollRef === "page" ? pageScrollRef : contentScrollRef;

content = (
  <AppContainer
    className={classnames(wrapperBaseClasses, ...config.containerClasses)}
    style={styleWithHelpers}
    ref={config.scrollRef === "page" ? scrollRef : undefined}
    {...rest}
  >
    {config.navPanelPosition === "side" && navPanelVisible && (
      <AppNavPanelSlot>{navPanel}</AppNavPanelSlot>
    )}
    {/* Conditional rendering based on config */}
  </AppContainer>
);
```

**Benefits**:
- Eliminates ~150+ lines of duplicated JSX
- Layout variants defined as data, not code
- Easier to add new layouts
- Clearer to see differences between layouts
- Single template to maintain

**Challenges**:
- Requires careful handling of conditional wrappers
- `vertical-full-header` has unique structure with `.content` div
- May need nested conditionals in template
- Must preserve exact DOM structure for tests

**Alternative Approach**: Keep switch statement but extract common rendering logic:
```typescript
function renderLayout(config: LayoutConfig) {
  // Returns JSX based on config
}

switch (safeLayout) {
  case "vertical":
    content = renderLayout(verticalConfig);
    break;
  // ...
}
```

**Impact**: High (major code reduction)  
**Complexity**: Complex (requires careful testing)  
**Risk**: Medium (must preserve exact DOM structure)  
**Lines Saved**: ~150+ lines

---

### 5. Simplify Drawer State Management ✅ COMPLETED

**Current State**: Lines 364-372, 460-462 manage drawer state

**Issue**:
```typescript
const toggleDrawer = useCallback(() => {
  setDrawerVisible((prev) => !prev);
}, []);

// Separate effect
useEffect(() => {
  setDrawerVisible(false);
}, [navPanelVisible, location, safeLayout]);

// Separate callback
const handleOpenChange = useCallback((open) => {
  setDrawerVisible(open);
}, []);
```

- Three different ways to update drawer state
- Logic scattered across component

**Opportunity**:
Extract to custom hook:
```typescript
function useDrawerState(
  location: Location,
  navPanelVisible: boolean,
  safeLayout: AppLayoutType
) {
  const [drawerVisible, setDrawerVisible] = useState(false);
  
  const toggleDrawer = useCallback(() => {
    setDrawerVisible(prev => !prev);
  }, []);
  
  const handleOpenChange = useCallback((open: boolean) => {
    setDrawerVisible(open);
  }, []);
  
  // Auto-close drawer on navigation or layout change
  useEffect(() => {
    setDrawerVisible(false);
  }, [location, navPanelVisible, safeLayout]);
  
  return {
    drawerVisible,
    toggleDrawer,
    handleOpenChange,
    showDrawer: () => setDrawerVisible(true),
    hideDrawer: () => setDrawerVisible(false),
  };
}
```

**Benefits**:
- All drawer logic in one place
- Easier to test drawer behavior
- Clearer dependencies
- Can be reused if needed

**Impact**: Low (primarily organizational)  
**Complexity**: Simple  
**Risk**: Low  
**Lines Saved**: ~8 lines

---

### 6. Memoize Static Drawer Content ✅ COMPLETED (Already Optimal)

**Current State**: Lines 700-703 create memoized nav panel in drawer

**Issue**:
```typescript
const memoizedNavPanelInDrawer = useMemo(
  () => (renderChild && navPanelDef ? renderChild(navPanelDef, { inDrawer: true }) : null),
  [renderChild, navPanelDef],
);
```

- Already well-optimized with useMemo
- Good pattern for expensive render operations

**Opportunity**: No changes needed - this is already optimal

**Analysis**: This pattern should be documented as a best practice:
- Memoize expensive child renders
- Use specific dependencies (renderChild, navPanelDef)
- Avoid unnecessary re-renders of drawer content

**Impact**: None (already optimal)

---

### 7. Improve Layout Input Validation ✅ COMPLETED

**Current State**: Lines 204-211 validate and sanitize layout input

**Issue**:
```typescript
const layoutWithDefaultValue = layout || getThemeVar("layout-App") || "condensed-sticky";
const sanitizedLayout = layoutWithDefaultValue?.trim().replace(/[\u2013\u2014\u2011]/g, "-");
const safeLayout = (sanitizedLayout || "condensed-sticky") as AppLayoutType;
```

- Good sanitization, but type assertion bypasses TypeScript checking
- Error is thrown by switch default case, not at validation point

**Opportunity**:
Add explicit validation:
```typescript
const VALID_LAYOUTS: AppLayoutType[] = [
  "vertical",
  "vertical-sticky",
  "vertical-full-header",
  "horizontal",
  "horizontal-sticky",
  "condensed",
  "condensed-sticky",
  "desktop",
];

function validateLayout(
  layout: string | undefined,
  getThemeVar: (key: string) => any
): AppLayoutType {
  const layoutWithDefault = layout || getThemeVar("layout-App") || "condensed-sticky";
  const sanitized = layoutWithDefault.trim().replace(/[\u2013\u2014\u2011]/g, "-");
  const normalized = sanitized || "condensed-sticky";
  
  if (!VALID_LAYOUTS.includes(normalized as AppLayoutType)) {
    console.warn(`Invalid layout "${normalized}", falling back to "condensed-sticky"`);
    return "condensed-sticky";
  }
  
  return normalized as AppLayoutType;
}

const safeLayout = validateLayout(layout, getThemeVar);
```

**Benefits**:
- Explicit validation with helpful warning
- Fails gracefully instead of throwing error
- Self-documenting list of valid layouts
- Can be tested independently

**Impact**: Low (improves error handling)  
**Complexity**: Simple  
**Risk**: Low  
**Lines Saved**: ~5 lines (net), but clearer

---

### 8. Extract Theme Initialization Logic ✅ COMPLETED

**Current State**: Lines 229-263 handle theme/tone initialization

**Issue**:
- 35 lines of theme logic in main component
- Multiple useEffects for related concerns
- System theme detection embedded in component

**Opportunity**:
Extract to custom hook:
```typescript
function useThemeInitialization({
  defaultTone,
  defaultTheme,
  autoDetectTone,
  setActiveThemeTone,
  setActiveThemeId,
}: ThemeInitializationParams) {
  const mounted = useRef(false);
  
  // Initial theme setup
  useEffect(() => {
    if (mounted.current) return;
    mounted.current = true;
    
    if (defaultTone === "dark" || defaultTone === "light") {
      setActiveThemeTone(defaultTone);
    } else if (autoDetectTone) {
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setActiveThemeTone(systemPrefersDark ? "dark" : "light");
    }
    
    if (defaultTheme) {
      setActiveThemeId(defaultTheme);
    }
  }, [defaultTone, defaultTheme, autoDetectTone, setActiveThemeTone, setActiveThemeId]);
  
  // System theme change listener
  useEffect(() => {
    if (!autoDetectTone || defaultTone) return;
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleThemeChange = (e: MediaQueryListEvent) => {
      setActiveThemeTone(e.matches ? "dark" : "light");
    };
    
    mediaQuery.addEventListener('change', handleThemeChange);
    return () => mediaQuery.removeEventListener('change', handleThemeChange);
  }, [autoDetectTone, defaultTone, setActiveThemeTone]);
}
```

**Benefits**:
- Cleaner component body
- Theme logic is isolated and testable
- Can be reused in other components
- Easier to add new theme features

**Impact**: Low (primarily organizational)  
**Complexity**: Simple  
**Risk**: Low  
**Lines Saved**: ~10 lines from main component

---

### 9. Optimize NavPanel Visibility Logic ✅ COMPLETED

**Current State**: Lines 220-223, 287-291 determine NavPanel visibility

**Issue**:
```typescript
// Line 220-223: Determine if NavPanel actually rendered
const navPanelActuallyRendered = navPanel !== null && navPanel !== undefined;
const hasRegisteredNavPanel = navPanelDef !== undefined && navPanelActuallyRendered;

// Line 287-291: Determine if NavPanel should be visible
const navPanelVisible =
  mediaSize.largeScreen ||
  (!hasRegisteredHeader && safeLayout !== "condensed" && safeLayout !== "condensed-sticky");
```

- Two related but separate pieces of logic
- `hasRegisteredNavPanel` checks if it exists and rendered
- `navPanelVisible` checks if it should be displayed

**Opportunity**:
Clarify the distinction with better naming and comments:
```typescript
// Whether a NavPanel exists in markup and its 'when' condition is true
const hasNavPanelToRender = navPanelDef !== undefined && navPanel !== null;

// Whether the NavPanel should be visible (not in drawer)
// On large screens: always visible if it exists
// On small screens: visible only if there's no header (unless condensed layout)
const showNavPanelInline =
  hasNavPanelToRender &&
  (mediaSize.largeScreen ||
    (!hasRegisteredHeader && !["condensed", "condensed-sticky"].includes(safeLayout)));
```

**Alternative**: Extract to helper function:
```typescript
function shouldShowNavPanelInline(
  hasNavPanel: boolean,
  isLargeScreen: boolean,
  hasHeader: boolean,
  layout: AppLayoutType
): boolean {
  if (!hasNavPanel) return false;
  if (isLargeScreen) return true;
  
  // On small screens, show inline only if no header (except condensed layouts)
  return !hasHeader && !["condensed", "condensed-sticky"].includes(layout);
}
```

**Benefits**:
- Clearer logic flow
- Self-documenting conditions
- Easier to test edge cases
- Better separation of concerns

**Impact**: Low (improves clarity)  
**Complexity**: Simple  
**Risk**: Low  
**Lines Saved**: ~2 lines (but clearer)

---

## App2.tsx Refactoring Opportunities

**File Overview**: App2.tsx (774 lines)
- Component renderer that wraps App2Native.tsx
- Handles XMLUI component definition and transformation
- Extracts and processes navigation hierarchy from Pages
- Implements search indexing functionality
- Total lines: 774

### 1. Extract Navigation Helper Functions Outside Component ✅ COMPLETED

**Current State**: Lines 160-238 contained helper functions inside AppNode component

**Issue**:
- 80+ lines of helper logic embedded in component
- useMemo wrappers added complexity without benefit
- Hard to unit test these functions independently
- Cache implementations tied to component lifecycle
- Functions recreated on every component mount

**Completed Solution**:
Extracted helper functions to end of App2.tsx file (before renderer export):
```typescript
// --- Navigation Helper Functions ---

function createParseHierarchyLabels() {
  const cache = new Map<string, string[]>();
  return (labelText: string): string[] => {
    // Parse logic with caching
  };
}

function createLabelExistsInHierarchy() {
  const cache = new Map<string, boolean>();
  return (searchLabel: string, hierarchy: any[]): boolean => {
    // Recursive search logic with caching
  };
}

function findOrCreateNavGroup(navItems: any[], groupLabel: string): any {
  // Group creation logic (no memoization needed)
}

// Usage in AppNode:
const parseHierarchyLabels = useMemo(() => createParseHierarchyLabels(), []);
const labelExistsInHierarchy = useMemo(() => createLabelExistsInHierarchy(), []);
// findOrCreateNavGroup used directly
```

**Benefits**:
- Functions can be unit tested independently
- Removes 80+ lines from component body
- Better encapsulation of caching logic
- Reusable across other components if needed
- Clearer separation of concerns
- No unnecessary useMemo wrappers for simple functions

**Impact**: High (major code organization improvement)  
**Complexity**: Simple (pure extraction)  
**Risk**: Low (no logic changes)  
**Lines Saved**: ~80 lines from AppNode component body
**Tests**: All 170 tests passing
  
**Benefits**:
- Functions can be unit tested independently
- Removes 80+ lines from component body
- Better encapsulation of caching logic
- Reusable across other components
- Clearer separation of concerns
- No unnecessary useMemo wrappers

**Impact**: High (major code organization improvement)  
**Complexity**: Simple (pure extraction)  
**Risk**: Low (no logic changes)  
**Lines Saved**: ~80 lines from AppNode component

---

### 2. Extract Child Component Extraction Logic ✅ COMPLETED

**Completed Implementation**:

Three helper functions added to App2.tsx (before navigation helper functions):

1. **`extractAppComponents()`** - Main extraction logic
   - Processes children array to find AppHeader, Footer, NavPanel, Pages
   - Delegates to specialized functions based on node type
   - Returns ExtractedComponents interface with all found components
   - Immutable approach using result object

2. **`extractFromThemeWrapper()`** - Theme unwrapping logic
   - Extracts special components from within Theme nodes
   - Preserves Theme wrapper for non-special children
   - Handles empty Theme nodes (skips them)
   - Creates new Theme nodes with remaining children

3. **`enhanceNavPanelWithPageNav()`** - Navigation enhancement
   - Separates nav enhancement from extraction
   - Calls extractNavPanelFromPages to get extra nav items
   - Merges with existing NavPanel or creates new one
   - Returns enhanced NavPanel or original if no enhancement needed

**AppNode Changes**:
```typescript
// Before: 83 lines of complex inline logic in useMemo
const { AppHeader, Footer, NavPanel, Pages, restChildren } = useMemo(() => {
  // 83 lines of extraction + Theme handling + nav enhancement
}, [node.children, extractValue, parseHierarchyLabels, labelExistsInHierarchy]);

// After: Clean separation of concerns
const extracted = useMemo(
  () => extractAppComponents(node.children),
  [node.children]
);

const enhancedNavPanel = useMemo(
  () => enhanceNavPanelWithPageNav(
    extracted,
    processedNavRef,
    extractValue,
    parseHierarchyLabels,
    labelExistsInHierarchy,
    findOrCreateNavGroup,
  ),
  [extracted, extractValue, parseHierarchyLabels, labelExistsInHierarchy]
);

const { AppHeader, Footer, Pages, restChildren } = extracted;
const NavPanel = enhancedNavPanel;
```

**Benefits Achieved**:
- ✅ Removed 83 lines from AppNode component body (reduced to ~20 lines)
- ✅ Separated three concerns: extraction, Theme handling, nav enhancement
- ✅ Immutable approach eliminates transformedChild reassignment
- ✅ Each function is independently testable
- ✅ Clearer control flow with explicit function calls
- ✅ Reduced cognitive complexity in AppNode
- ✅ Better dependency tracking (separate useMemo for each concern)

**Test Results**: All 170 tests passing

**Impact**: High (major refactoring)  
**Complexity**: Moderate (required careful testing)  
**Risk**: Medium (complex logic, needed thorough testing)  
**Lines Saved**: ~60 lines from AppNode component body

---

### 3. Move SearchIndexCollector to Separate File ✅ COMPLETED

**Completed Implementation**:

Created new file: `/xmlui/src/components/App2/SearchIndexCollector.tsx`

**File Structure**:
```
App2/
  ├── App2.tsx (reduced by 167 lines)
  ├── App2Native.tsx
  ├── SearchIndexCollector.tsx (NEW - 180 lines)
  └── ... other files
```

**SearchIndexCollector.tsx** exports:
1. **`SearchIndexCollector` component** - Main search indexing orchestrator
   - Manages page indexing queue and state
   - Renders one PageIndexer at a time using portals
   - Handles client-side detection and indexing lifecycle
   - Uses transitions for low-priority updates

2. **`PageIndexer` component** (internal) - Single page indexer
   - Renders page content off-screen for text extraction
   - Uses DOM cloning to extract searchable content
   - Removes style/script tags and extracts h1 title
   - Signals completion to parent for next page processing

**App2.tsx Changes**:
```typescript
// Before: 167 lines of SearchIndexCollector code embedded
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { IndexerContext } from "./IndexerContext";
import { createPortal } from "react-dom";
import { useAppContext } from "../../components-core/AppContext";
import { useSearchContextSetIndexing, useSearchContextUpdater } from "./SearchContext";

// ... 167 lines of SearchIndexCollector and PageIndexer implementation ...

// After: Simple import statement
import { useCallback, useMemo, useRef } from "react";
import { SearchIndexCollector } from "./SearchIndexCollector";

// Usage remains identical:
<SearchIndexCollector Pages={Pages} renderChild={renderChild} />
```

**Benefits Achieved**:
- ✅ Reduced App2.tsx by 167 lines (from 774 to 607 lines, 22% reduction)
- ✅ SearchIndexCollector can now be tested independently
- ✅ Clearer file organization - search concerns separated
- ✅ Can optimize search indexing without modifying App2.tsx
- ✅ Easier to understand both files in isolation
- ✅ Reduced import clutter in App2.tsx (removed 5 unused imports)
- ✅ Could be reused by other components if needed

**Test Results**: All 170 tests passing

**Impact**: High (major organization improvement)  
**Complexity**: Simple (just moved code)  
**Risk**: Low (no logic changes)  
**Lines Saved**: ~167 lines from App2.tsx

---

### 4. Extract Navigation Extraction Functions to Separate Module ✅ COMPLETED

**Completed Implementation**:

Following the pattern established in Step 1 (keeping functions in the same file), the navigation extraction functions have been better organized within App2.tsx with improved documentation.

**Changes Made**:
1. **Added clear section header**: `// --- Navigation Extraction Functions ---`
2. **Enhanced JSDoc comments** for both functions with detailed parameter documentation
3. **Improved function organization**: Functions remain after the renderer export, maintaining file cohesion

**Key Functions Organized**:

1. **`processNavItems()`** (~65 lines)
   - Recursively processes navigation items (NavLink and NavGroup)
   - Builds hierarchical navigation tree structure
   - Extracts labels and paths from component props
   - Handles nested NavGroup structures

2. **`extractNavPanelFromPages()`** (~95 lines)
   - Extracts navigation from Pages component based on navLabel props
   - Creates hierarchical navigation using pipe-separated labels
   - Prevents duplicate navigation items
   - Integrates with existing NavPanel structure
   - Handles multi-level hierarchies (e.g., "Parent|Child|Grandchild")

**Benefits Achieved**:
- ✅ Better code organization with clear section header
- ✅ Comprehensive JSDoc documentation for complex functions
- ✅ Functions grouped logically at end of file
- ✅ Easier to understand navigation extraction logic
- ✅ Maintains file cohesion (consistent with Step 1 approach)
- ✅ Functions remain easily accessible for future modifications
- ✅ No separate module management needed

**Test Results**: All 170 tests passing

**Note**: Unlike the original documentation suggestion to create a separate module, this implementation keeps functions in the same file to maintain consistency with the user's preference established in Step 1. This approach provides better organization through documentation and structure while avoiding the overhead of module management.

**Impact**: Medium (improved organization and documentation)  
**Complexity**: Simple (documentation and structure improvement)  
**Risk**: Low (no logic changes)  
**Lines Improved**: ~160 lines better documented and organized

---

### 5. Optimize Footer Sticky Property Extraction

**Current State**: Lines 348-366 extract sticky property with nested conditionals

**Issue**:
```typescript
const { AppHeader, Footer, NavPanel, Pages, restChildren } = useMemo(() => {
  let AppHeader: ComponentDef;
  let Footer: ComponentDef;
  let NavPanel: ComponentDef;
  let Pages: ComponentDef;
  const restChildren: any[] = [];
  
  node.children?.forEach((rootChild) => {
    let transformedChild = { ...rootChild };
    if (rootChild.type === "Theme") {
      // 15+ lines handling Theme wrapper
      transformedChild.children = rootChild.children?.filter((child) => {
        if (child.type === "AppHeader") {
          AppHeader = { ...rootChild, children: [child] };
          return false;
        }
        // ... similar for Footer, NavPanel
      });
      if (!transformedChild.children.length) {
        transformedChild = null;
      }
    }
    // 10+ more lines handling direct children
    if (rootChild.type === "AppHeader") {
      AppHeader = rootChild;
    }
    // ... similar for Footer, NavPanel, Pages
  });
  
  // 20+ lines calling extractNavPanelFromPages
  const extraNavs = extractNavPanelFromPages(...);
  if (extraNavs?.length) {
    // Merge logic
  }
  
  return { AppHeader, Footer, NavPanel, Pages, restChildren };
}, [node.children, extractValue, ...]);
```

**Problems**:
- 83 lines of complex extraction logic in useMemo
- Mixes three concerns: component extraction, Theme unwrapping, nav enhancement
- Mutation-heavy code (transformedChild reassignment)
- Hard to understand flow with nested conditionals
- Large dependency array

**Opportunity**:
Extract to utility functions:
```typescript
// App2/utils/componentExtraction.ts
interface ExtractedComponents {
  AppHeader?: ComponentDef;
  Footer?: ComponentDef;
  NavPanel?: ComponentDef;
  Pages?: ComponentDef;
  restChildren: ComponentDef[];
}

export function extractAppComponents(
  children: ComponentDef[] | undefined
): ExtractedComponents {
  const result: ExtractedComponents = { restChildren: [] };
  
  if (!children) return result;
  
  for (const child of children) {
    if (child.type === "Theme") {
      extractFromTheme(child, result);
    } else {
      extractDirectChild(child, result);
    }
  }
  
  return result;
}

function extractFromTheme(
  themeNode: ComponentDef,
  result: ExtractedComponents
): void {
  const specialTypes = ["AppHeader", "Footer", "NavPanel"];
  const otherChildren: ComponentDef[] = [];
  
  themeNode.children?.forEach((child) => {
    if (child.type === "AppHeader") {
      result.AppHeader = { ...themeNode, children: [child] };
    } else if (child.type === "Footer") {
      result.Footer = { ...themeNode, children: [child] };
    } else if (child.type === "NavPanel") {
      result.NavPanel = { ...themeNode, children: [child] };
    } else {
      otherChildren.push(child);
    }
  });
  
  if (otherChildren.length > 0) {
    result.restChildren.push({ ...themeNode, children: otherChildren });
  }
}

function extractDirectChild(
  child: ComponentDef,
  result: ExtractedComponents
): void {
  switch (child.type) {
    case "AppHeader":
      result.AppHeader = child;
      break;
    case "Footer":
      result.Footer = child;
      break;
    case "NavPanel":
      result.NavPanel = child;
      break;
    case "Pages":
      result.Pages = child;
      result.restChildren.push(child);
      break;
    default:
      result.restChildren.push(child);
  }
}

export function enhanceNavPanelWithPageNav(
  extracted: ExtractedComponents,
  processedRef: React.MutableRefObject<boolean>,
  extractValue: any,
  navHelper: NavigationHierarchyParser
): ComponentDef | undefined {
  if (!extracted.Pages || processedRef.current) {
    return extracted.NavPanel;
  }
  
  const extraNavs = extractNavPanelFromPages(
    extracted.Pages,
    extracted.NavPanel,
    extractValue,
    navHelper
  );
  
  if (!extraNavs?.length) {
    return extracted.NavPanel;
  }
  
  if (extracted.NavPanel) {
    return {
      ...extracted.NavPanel,
      children: [
        ...(extracted.NavPanel.children || []),
        ...extraNavs
      ],
    };
  }
  
  return {
    type: "NavPanel",
    props: {},
    children: extraNavs,
  };
}

// Usage in AppNode:
const extracted = useMemo(
  () => extractAppComponents(node.children),
  [node.children]
);

const enhancedNavPanel = useMemo(
  () => enhanceNavPanelWithPageNav(
    extracted,
    processedNavRef,
    extractValue,
    navHelper
  ),
  [extracted, extractValue, navHelper]
);
```

**Benefits**:
- Separates three distinct concerns into functions
- Immutable approach (no reassignments)
- Much easier to test each piece
- Clearer control flow
- Reduces AppNode by 60+ lines
- Can reuse extraction logic

**Impact**: High (major refactoring)  
**Complexity**: Moderate (requires careful testing)  
**Risk**: Medium (complex logic, needs thorough testing)  
**Lines Saved**: ~60 lines from AppNode

---

### 5. Optimize Footer Sticky Property Extraction

**Current State**: Lines 348-366 extract sticky property with nested conditionals

**Issue**:
```typescript
const footerSticky = useMemo(() => {
  if (!Footer) return true;
  
  let footerNode = Footer;
  if (Footer.type === "Theme" && Footer.children?.length > 0) {
    footerNode = Footer.children.find((child) => child.type === "Footer");
  }
  
  if (footerNode?.type === "Footer" && footerNode.props?.sticky !== undefined) {
    return extractValue.asOptionalBoolean(footerNode.props.sticky, true);
  }
  
  return true;
}, [Footer, extractValue]);
```

**Problems**:
- Nested conditionals make logic hard to follow
- Pattern repeated for every prop extraction
- Theme unwrapping logic duplicated from component extraction
- Could be part of component extraction utility

**Opportunity**:
Add to componentExtraction utils:
```typescript
// App2/utils/componentExtraction.ts (addition)
export function extractComponentProp<T>(
  component: ComponentDef | undefined,
  propName: string,
  defaultValue: T,
  extractValue: any,
  asBoolean = false
): T {
  if (!component) return defaultValue;
  
  // Unwrap Theme if present
  let targetNode = component;
  if (component.type === "Theme" && component.children?.length > 0) {
    targetNode = component.children.find(
      (child) => child.type === component.type
    );
  }
  
  if (!targetNode?.props?.[propName]) {
    return defaultValue;
  }
  
  return asBoolean
    ? extractValue.asOptionalBoolean(targetNode.props[propName], defaultValue)
    : extractValue(targetNode.props[propName]) ?? defaultValue;
}

// Usage in AppNode:
const footerSticky = useMemo(
  () => extractComponentProp(Footer, "sticky", true, extractValue, true),
  [Footer, extractValue]
);
```

**Benefits**:
- Reusable for any component prop extraction
- Single place for Theme unwrapping logic
- More concise and readable
- Can extract multiple props easily
- Type-safe with generics

**Impact**: Low (code quality improvement)  
**Complexity**: Simple  
**Risk**: Low  
**Lines Saved**: ~5 lines, but adds reusability

---

### 6. Reduce Component Rendering Memoization

**Current State**: Lines 414-417 memoize all rendered components

**Issue**:
```typescript
const renderedHeader = useMemo(() => renderChild(AppHeader), [AppHeader, renderChild]);
const renderedFooter = useMemo(() => renderChild(Footer), [Footer, renderChild]);
const renderedNavPanel = useMemo(() => renderChild(NavPanel), [NavPanel, renderChild]);
const renderedContent = useMemo(() => renderChild(restChildren), [restChildren, renderChild]);
```

**Problems**:
- Premature optimization - renderChild is already optimized in XMLUI renderer
- Creates 4 memoization closures
- renderChild dependency rarely changes
- Component definitions (AppHeader, Footer, etc.) already memoized from extraction
- Adds complexity without proven benefit

**Analysis**:
The XMLUI renderer already handles efficient component rendering. These useMemo calls likely provide minimal benefit since:
1. renderChild is stable (from renderer context)
2. Component definitions only change when node.children changes (already memoized)
3. App2Component is already optimized with React.memo in App2Native.tsx

**Opportunity**:
Remove unnecessary memoization:
```typescript
// Direct rendering - let XMLUI renderer handle optimization
return (
  <App2Component
    {...appProps}
    header={renderChild(AppHeader)}
    footer={renderChild(Footer)}
    navPanel={renderChild(enhancedNavPanel)}
    navPanelDef={enhancedNavPanel}
    logoContentDef={node.props.logoTemplate}
    renderChild={renderChild}
    registerComponentApi={registerComponentApi}
  >
    {renderChild(extracted.restChildren)}
    <SearchIndexCollector Pages={extracted.Pages} renderChild={renderChild} />
  </App2Component>
);
```

**Benefits**:
- Simpler code, less cognitive overhead
- Removes 4 memoization closures
- Trusts renderer's optimization
- Still benefits from component definition memoization

**Challenges**:
- Need performance testing to confirm no regression
- May need to keep for specific use cases

**Impact**: Low (micro-optimization)  
**Complexity**: Simple  
**Risk**: Low-Medium (needs performance validation)  
**Lines Saved**: ~4 lines

---

### Summary of App2.tsx Refactoring Opportunities

| # | Opportunity | Impact | Complexity | Risk | Lines Saved |
|---|-------------|--------|------------|------|-------------|
| 1 | Extract Navigation Helpers | High | Simple | Low | ~80 |
| 2 | Extract Component Extraction | High | Moderate | Medium | ~60 |
| 3 | Move SearchIndexCollector | High | Simple | Low | ~167 |
| 4 | Extract Navigation Extraction | High | Simple | Low | ~151 |
| 5 | Optimize Prop Extraction | Low | Simple | Low | ~5 |
| 6 | Reduce Rendering Memoization | Low | Simple | Low-Med | ~4 |

**Total Potential Lines Saved**: ~467 lines (60% reduction in App2.tsx)

**Recommended Implementation Order**:
1. **Step 3** (SearchIndexCollector) - Highest impact, lowest risk, simple extraction
2. **Step 1** (Navigation Helpers) - High impact, pure functions, easy to test
3. **Step 4** (Navigation Extraction) - High impact, complements Step 1
4. **Step 2** (Component Extraction) - Most complex, save for after simpler refactors
5. **Step 5** (Prop Extraction) - Small improvement, low priority
6. **Step 6** (Memoization) - Needs performance testing, lowest priority

**Post-Refactoring File Structure**:
```
App2/
  ├── App2.tsx (~300 lines, down from 774)
  ├── App2Native.tsx
  ├── SearchIndexCollector.tsx (~170 lines)
  ├── utils/
  │   ├── navigationHelpers.ts (~90 lines)
  │   ├── navigationExtraction.ts (~160 lines)
  │   └── componentExtraction.ts (~100 lines)
  └── __tests__/
      ├── navigationHelpers.test.ts
      ├── navigationExtraction.test.ts
      └── componentExtraction.test.ts
```

---

## App2.module.scss Refactoring Opportunities

### 15. Reduce Nesting Depth and Selector Complexity

**Current State**: Lines 24-435 have deep nesting (up to 5-6 levels)

**Issue**:
```scss
.wrapper {
  &.vertical {
    flex-direction: row;
    .contentWrapper {
      overflow: auto;
      .PagesWrapper {
        min-height: initial;
      }
    }
    &.sticky {
      .footerWrapper {
        position: sticky;
        &.nonSticky {
          position: static;
        }
      }
    }
  }
}
```

- Deep nesting makes selectors highly specific
- Harder to override styles
- Difficult to understand precedence
- Performance impact (though minimal)

**Opportunity**:
Flatten selectors using direct class combinations:
```scss
.wrapper {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  isolation: isolate;
}

// Vertical layout
.wrapper.vertical {
  flex-direction: row;
  overflow: initial;
}

.wrapper.vertical .contentWrapper {
  overflow: auto;
  scroll-padding-block: $scrollPaddingBlockPage;
  scrollbar-gutter: stable both-edges;
}

.wrapper.vertical.noScrollbarGutters .contentWrapper {
  scrollbar-gutter: auto;
}

.wrapper.vertical .navPanelWrapper {
  width: $width-navPanel-App;
  flex-shrink: 0;
}

.wrapper.vertical .PagesWrapper {
  min-height: initial;
  flex: 1;
}

// Sticky vertical layout
.wrapper.vertical.sticky .footerWrapper {
  position: sticky;
  bottom: 0;
}

.wrapper.vertical.sticky .footerWrapper.nonSticky {
  position: static;
}
```

**Benefits**:
- Clearer selector intent
- Easier to override
- Flatter structure (2-3 levels max)
- Better maintainability
- Slightly better performance

**Challenges**:
- More verbose (explicit class combinations)
- Requires careful testing to ensure no style regressions
- May increase file length slightly

**Impact**: Medium (improves maintainability)  
**Complexity**: Moderate (requires careful refactoring)  
**Risk**: Medium (must test all layout combinations)  
**Lines Saved**: ~50 lines (by eliminating redundant nesting braces)

---

### 16. Extract Layout-Specific Styles

**Current State**: All 8 layout styles are in one file (435 lines)

**Issue**:
- Single file contains all layout variants
- Hard to find styles for specific layout
- Mixes common and layout-specific styles

**Opportunity**:
Split into modular files:
```scss
// App2.module.scss (base)
@use "layout-vertical";
@use "layout-horizontal";
@use "layout-desktop";
@use "layout-condensed";

.wrapper {
  /* Common wrapper styles */
}

.headerWrapper { /* Common header styles */ }
.footerWrapper { /* Common footer styles */ }
.navPanelWrapper { /* Common nav panel styles */ }
.PagesWrapper { /* Common pages styles */ }

// layout-vertical.scss
.wrapper.vertical {
  flex-direction: row;
  /* Vertical-specific styles */
}

.wrapper.vertical.sticky {
  /* Vertical-sticky-specific styles */
}

.wrapper.verticalFullHeader {
  /* Vertical-full-header-specific styles */
}

// layout-horizontal.scss
.wrapper.horizontal {
  /* Horizontal-specific styles */
}

.wrapper.horizontal.sticky {
  /* Horizontal-sticky-specific styles */
}

// layout-desktop.scss
.wrapper.desktop {
  /* Desktop-specific styles */
}

// layout-condensed.scss  
.wrapper.condensed {
  /* Condensed-specific styles */
}
```

**Benefits**:
- Easier to find layout-specific styles
- Can work on one layout without seeing others
- Better organization
- Smaller files

**Challenges**:
- More files to manage
- Need to ensure no conflicts
- Build tool must support SCSS @use
- May complicate theme variable collection

**Impact**: Medium (organizational improvement)  
**Complexity**: Simple (mostly moving code)  
**Risk**: Low  
**Lines Saved**: 0 (same total lines, better organized)

---

### 17. Document CSS Variable Usage

**Current State**: Lines 33-36 define CSS variables

**Issue**:
```scss
.wrapper {
  --footer-height: 0px;
  --header-height: 0px;
  width: 100%;
  // ...
}
```

- No comments explaining when these variables are used
- No indication they're set dynamically from TypeScript
- Other variables like `--containerHeight`, `--scrollbar-width` not shown in base

**Opportunity**:
Add comprehensive comments:
```scss
.wrapper {
  /**
   * CSS Variables set dynamically by App2Native.tsx
   * 
   * --footer-height: Height of footer in px (0px for non-sticky layouts)
   * --header-height: Height of header in px (0px for non-sticky layouts)
   * --header-abs-height: Actual header height regardless of layout
   * --footer-abs-height: Actual footer height regardless of layout
   * --scrollbar-width: Width of scrollbar for gutter compensation
   * --containerHeight: Container height (100vh or parent container height)
   * 
   * These are used in calc() expressions throughout the styles.
   */
  --footer-height: 0px;
  --header-height: 0px;
  
  width: 100%;
  height: 100%;
  // ...
}
```

**Benefits**:
- Clearer understanding of dynamic values
- Documents the TypeScript<->CSS contract
- Easier for other developers to understand
- Prevents accidental removal

**Impact**: Low (documentation only)  
**Complexity**: Simple  
**Risk**: None  
**Lines Saved**: 0 (adds documentation)

---

### 18. Consolidate Scrollbar Gutter Logic

**Current State**: Lines 55-59, 93-97, 304-310, 355-359 handle scrollbar gutters

**Issue**:
```scss
// In .vertical
.contentWrapper {
  scrollbar-gutter: stable both-edges;
}
&.noScrollbarGutters {
  .contentWrapper {
    scrollbar-gutter: auto;
  }
}

// In .horizontal
overflow: auto;
scroll-padding-block: $scrollPaddingBlockPage;
&.sticky {
  min-height: 100%;
}

// In .scrollWholePage
scrollbar-gutter: stable both-edges;
.headerWrapper { /* gutter compensation */ }
.footerWrapper { /* gutter compensation */ }

// In :not(.scrollWholePage)
overflow: hidden;
.PagesWrapper {
  scrollbar-gutter: stable both-edges;
}

// In .noScrollbarGutters
scrollbar-gutter: auto;
.PagesWrapper {
  scrollbar-gutter: auto;
}
```

- Logic scattered across multiple locations
- Different behaviors for different layouts
- Gutter compensation code duplicated

**Opportunity**:
Create utility classes:
```scss
// Scrollbar gutter utilities
%with-scrollbar-gutters {
  scrollbar-gutter: stable both-edges;
}

%without-scrollbar-gutters {
  scrollbar-gutter: auto;
}

%scrollbar-gutter-compensation {
  margin-inline: calc(-1 * var(--scrollbar-width));
  
  & > div {
    padding-inline: var(--scrollbar-width);
  }
}

// Usage
.wrapper {
  @extend %with-scrollbar-gutters;
  
  &.noScrollbarGutters {
    @extend %without-scrollbar-gutters;
  }
}

.wrapper.scrollWholePage {
  .headerWrapper {
    @extend %scrollbar-gutter-compensation;
  }
  
  .footerWrapper {
    @extend %scrollbar-gutter-compensation;
  }
}
```

**Benefits**:
- DRY principle (don't repeat yourself)
- Single place to modify gutter behavior
- Clearer intent with named placeholders
- Easier to apply consistently

**Impact**: Low (organizational)  
**Complexity**: Simple  
**Risk**: Low  
**Lines Saved**: ~15 lines

---

### 19. Simplify Desktop Layout Overrides

**Current State**: Lines 121-217 contain aggressive style resets for desktop layout

**Issue**:
```scss
&.desktop {
  .headerWrapper {
    /* ... base styles ... */
    
    & * {
      max-width: none !important;
      padding-inline: 0 !important;
      padding-left: 0 !important;
      padding-right: 0 !important;
      margin-inline: 0 !important;
      margin-left: 0 !important;
      margin-right: 0 !important;
    }
  }
  
  .footerWrapper {
    /* Duplicate the same aggressive resets */
    & * {
      max-width: none !important;
      // ... same properties repeated
    }
  }
}
```

- Aggressive `!important` usage
- Duplicated reset rules for header and footer
- Resets every descendant (`& *`)
- May conflict with nested component styles

**Opportunity**:
1. Use CSS layers to control precedence without `!important`
2. Create mixin for common resets
3. Be more selective about what to reset

```scss
// Use mixin for common resets
@mixin desktop-layout-reset {
  margin: 0;
  padding: 0;
  max-width: none;
  width: 100%;
  
  & > * {
    margin: 0;
    padding: 0;
    max-width: none;
    width: 100%;
  }
}

&.desktop {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  
  &:global(.nested-app) {
    width: 100%;
    height: 100%;
  }
  
  .headerWrapper {
    position: sticky;
    top: 0;
    flex-shrink: 0;
    z-index: 1;
    @include desktop-layout-reset;
  }
  
  .footerWrapper {
    position: sticky;
    bottom: 0;
    flex-shrink: 0;
    @include desktop-layout-reset;
  }
  
  .PagesWrapper {
    flex: 1;
    min-height: 0;
    overflow: hidden;
    @include desktop-layout-reset;
  }
}
```

**Benefits**:
- Eliminates duplicated reset code
- Removes excessive `!important` usage
- More maintainable
- Clearer intent

**Challenges**:
- May need to test that nested components still work
- Some `!important` may be necessary if conflicts exist

**Impact**: Medium (improves maintainability)  
**Complexity**: Simple  
**Risk**: Low-Medium (need to test nested components)  
**Lines Saved**: ~40 lines

---

## Summary of Refactoring Opportunities

### High Impact Opportunities (Recommended Priority)

1. **Eliminate Switch Statement Duplication** (#4)
   - Impact: High, Complexity: Complex, Risk: Medium
   - Saves ~150+ lines, major code reduction

2. **Extract Navigation Hierarchy Building Logic** (#10)
   - Impact: High, Complexity: Moderate, Risk: Low
   - Saves ~400 lines from App2.tsx (moved to separate files)

3. **Extract SearchIndexCollector Component** (#12)
   - Impact: High, Complexity: Simple, Risk: Low
   - Saves ~338 lines from App2.tsx

### Medium Impact Opportunities

4. **Simplify CSS Variable Calculation Logic** (#1)
   - Impact: Medium, Complexity: Simple, Risk: Low
   - Saves ~15 lines, improves clarity

5. **Consolidate Ref Callback Pattern** (#2)
   - Impact: Medium, Complexity: Simple, Risk: Low
   - Saves ~12 lines, reusable pattern

6. **Reduce Nesting Depth in SCSS** (#15)
   - Impact: Medium, Complexity: Moderate, Risk: Medium
   - Saves ~50 lines, improves maintainability

7. **Simplify Desktop Layout Overrides** (#19)
   - Impact: Medium, Complexity: Simple, Risk: Low-Medium
   - Saves ~40 lines, removes `!important`

### Low Impact Opportunities (Nice to Have)

8. **Extract Layout Context Value Creation** (#3)
9. **Simplify Drawer State Management** (#5)
10. **Extract Theme Initialization Logic** (#8)
11. **Optimize NavPanel Visibility Logic** (#9)
12. **Simplify Child Component Extraction** (#11)
13. **Memoize Component Definitions** (#13)
14. **Extract Layout-Specific Styles** (#16)
15. **Document CSS Variable Usage** (#17)
16. **Consolidate Scrollbar Gutter Logic** (#18)
17. **Improve Layout Input Validation** (#7)

### Total Potential Savings

- **App2Native.tsx**: ~187 lines saved (from 742 → ~555 lines)
- **App2.tsx**: ~738 lines saved (from 774 → ~36 lines + new separate files)
- **App2.module.scss**: ~90 lines saved (from 435 → ~345 lines)
- **Total**: ~1,015 lines reduced, better organized into logical modules

### Implementation Strategy

**Phase 1 - Quick Wins** (Low Risk, High Impact):
1. Extract SearchIndexCollector (#12)
2. Simplify CSS Variable Calculation (#1)
3. Consolidate Ref Callback Pattern (#2)

**Phase 2 - Major Reorganization** (Moderate Risk, High Impact):
4. Extract Navigation Hierarchy Logic (#10)
5. Simplify Desktop Layout Overrides (#19)
6. Reduce SCSS Nesting Depth (#15)

**Phase 3 - Code Quality** (Low Risk, Medium Impact):
7. Extract Theme Initialization (#8)
8. Simplify Drawer State Management (#5)
9. Extract Layout Context Value (#3)

**Phase 4 - Advanced** (Higher Risk, High Impact):
10. Eliminate Switch Statement Duplication (#4)
    - This is the most complex change
    - Requires careful testing of all 8 layouts
    - Should be done last after other refactorings stabilize

---

## Testing Strategy

After each refactoring opportunity is implemented:

1. **Run e2e tests**: `npx playwright test App2.spec.ts App2-layout.spec.ts --workers=4 --reporter=line`
2. **Verify all 170+ tests pass**
3. **Visual regression testing**: Check all layouts render identically
4. **Performance testing**: Ensure no degradation in render time
5. **Bundle size**: Check that bundle size doesn't increase significantly

### Risk Mitigation

- **Commit after each opportunity** - Allows easy rollback
- **Test incrementally** - Don't stack multiple changes
- **3-iteration rule** - If tests fail 3 times, revert and request review
- **Preserve DOM structure** - Tests rely on specific class names and structure
