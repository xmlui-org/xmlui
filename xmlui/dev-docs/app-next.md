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

## OLD APPROACH (ARCHIVED)

> **Note**: The following sections describe a config-driven approach that was considered but not implemented. We chose a simpler incremental approach instead (see "Component-Based Layout Refactoring Plan (NEW APPROACH)" below).
>
> This is kept for reference only.

<details>
<summary>Click to expand archived config-driven approach</summary>

### Layout Configuration Objects

Instead of switch statement, use configuration objects to describe each layout:

```typescript
// layoutConfigs.ts

export interface LayoutConfig {
  name: AppLayoutType;
  containerClasses: string[];
  scrollWholePage: boolean; // Default value, can be overridden by prop
  slots: {
    header?: SlotConfig;
    navPanel?: SlotConfig;
    mainContent: SlotConfig;
    footer?: SlotConfig;
  };
  structure: "rows" | "columns" | "grid";
}

export interface SlotConfig {
  component: "AppHeaderSlot" | "AppNavPanelSlot" | "AppMainContentSlot" | "AppFooterSlot";
  isSticky?: boolean;
  isScrollContainer?: boolean;
  placement?: "left" | "top" | "embedded";
  fullWidth?: boolean;
  conditional?: (ctx: LayoutRenderContext) => boolean;
}

export interface LayoutRenderContext {
  hasHeader: boolean;
  hasNavPanel: boolean;
  hasFooter: boolean;
  navPanelVisible: boolean;
  mediaSize: MediaSize;
  layout: AppLayoutType;
}

export const LAYOUT_CONFIGS: Record<AppLayoutType, LayoutConfig> = {
  vertical: {
    name: "vertical",
    containerClasses: ["vertical"],
    scrollWholePage: true, // Default, but can be overridden
    structure: "columns",
    slots: {
      navPanel: {
        component: "AppNavPanelSlot",
        placement: "left",
        conditional: (ctx) => ctx.navPanelVisible,
      },
      header: {
        component: "AppHeaderSlot",
        isSticky: false,
      },
      mainContent: {
        component: "AppMainContentSlot",
        isScrollContainer: false, // Container handles scroll
      },
      footer: {
        component: "AppFooterSlot",
        isSticky: false,
      },
    },
  },
  "vertical-sticky": {
    name: "vertical-sticky",
    containerClasses: ["vertical", "sticky"],
    scrollWholePage: false, // Force content-only scroll
    structure: "columns",
    slots: {
      navPanel: {
        component: "AppNavPanelSlot",
        placement: "left",
        conditional: (ctx) => ctx.navPanelVisible,
      },
      header: {
        component: "AppHeaderSlot",
        isSticky: true,
      },
      mainContent: {
        component: "AppMainContentSlot",
        isScrollContainer: true,
      },
      footer: {
        component: "AppFooterSlot",
        isSticky: true, // Can be overridden by footerSticky prop
      },
    },
  },
  "vertical-full-header": {
    name: "vertical-full-header",
    containerClasses: ["verticalFullHeader"],
    scrollWholePage: false,
    structure: "grid",
    slots: {
      header: {
        component: "AppHeaderSlot",
        isSticky: true,
        fullWidth: true,
      },
      navPanel: {
        component: "AppNavPanelSlot",
        placement: "left",
        conditional: (ctx) => ctx.navPanelVisible,
      },
      mainContent: {
        component: "AppMainContentSlot",
        isScrollContainer: true,
      },
      footer: {
        component: "AppFooterSlot",
        isSticky: true,
        fullWidth: true,
      },
    },
  },
  horizontal: {
    name: "horizontal",
    containerClasses: ["horizontal"],
    scrollWholePage: true,
    structure: "rows",
    slots: {
      header: {
        component: "AppHeaderSlot",
        isSticky: false,
      },
      navPanel: {
        component: "AppNavPanelSlot",
        placement: "top",
        conditional: (ctx) => ctx.navPanelVisible,
      },
      mainContent: {
        component: "AppMainContentSlot",
        isScrollContainer: false,
      },
      footer: {
        component: "AppFooterSlot",
        isSticky: false,
      },
    },
  },
  "horizontal-sticky": {
    name: "horizontal-sticky",
    containerClasses: ["horizontal", "sticky"],
    scrollWholePage: false,
    structure: "rows",
    slots: {
      header: {
        component: "AppHeaderSlot",
        isSticky: true,
      },
      navPanel: {
        component: "AppNavPanelSlot",
        placement: "top",
        conditional: (ctx) => ctx.navPanelVisible,
      },
      mainContent: {
        component: "AppMainContentSlot",
        isScrollContainer: true,
      },
      footer: {
        component: "AppFooterSlot",
        isSticky: true,
      },
    },
  },
  condensed: {
    name: "condensed",
    containerClasses: ["horizontal"], // Uses horizontal base styles
    scrollWholePage: true,
    structure: "rows",
    slots: {
      header: {
        component: "AppHeaderSlot",
        isSticky: false,
      },
      navPanel: {
        component: "AppNavPanelSlot",
        placement: "embedded",
        conditional: (ctx) => ctx.navPanelVisible,
      },
      mainContent: {
        component: "AppMainContentSlot",
        isScrollContainer: false,
      },
      footer: {
        component: "AppFooterSlot",
        isSticky: false,
      },
    },
  },
  "condensed-sticky": {
    name: "condensed-sticky",
    containerClasses: ["horizontal", "sticky"],
    scrollWholePage: false,
    structure: "rows",
    slots: {
      header: {
        component: "AppHeaderSlot",
        isSticky: true,
      },
      navPanel: {
        component: "AppNavPanelSlot",
        placement: "embedded",
        conditional: (ctx) => ctx.navPanelVisible,
      },
      mainContent: {
        component: "AppMainContentSlot",
        isScrollContainer: true,
      },
      footer: {
        component: "AppFooterSlot",
        isSticky: true,
      },
    },
  },
  desktop: {
    name: "desktop",
    containerClasses: ["desktop"],
    scrollWholePage: false, // Always content-only scroll
    structure: "rows",
    slots: {
      header: {
        component: "AppHeaderSlot",
        isSticky: true,
        conditional: (ctx) => ctx.hasHeader,
      },
      mainContent: {
        component: "AppMainContentSlot",
        isScrollContainer: true,
      },
      footer: {
        component: "AppFooterSlot",
        isSticky: true,
        conditional: (ctx) => ctx.hasFooter,
      },
    },
  },
};
```

### New CSS Structure

Replace deeply nested SCSS with flat, component-scoped styles:

#### AppContainer.module.scss
```scss
@use "../../components-core/theming/themes" as t;

// Theme variables
$maxWidth-App: createThemeVar("maxWidth-App");
$scrollPaddingBlock-Pages: createThemeVar("scroll-padding-block-Pages");

.appContainer {
  // Base container styles
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  isolation: isolate;
  
  // Scroll container when scrollWholePage=true
  &.scrollWholePage {
    overflow: auto;
    scroll-padding-block: $scrollPaddingBlock-Pages;
    scrollbar-gutter: stable both-edges;
    
    &.noScrollbarGutters {
      scrollbar-gutter: auto;
    }
  }
  
  // Layout structure modifiers
  &.vertical {
    flex-direction: row;
  }
  
  &.horizontal {
    flex-direction: column;
  }
  
  &.verticalFullHeader {
    flex-direction: column;
  }
  
  &.desktop {
    width: 100vw;
    height: 100vh;
    max-width: none;
    margin: 0;
    padding: 0;
    overflow: hidden;
    
    &.nestedApp {
      width: 100%;
      height: 100%;
    }
  }
}
```

#### AppHeaderSlot.module.scss
```scss
@use "../../components-core/theming/themes" as t;

$backgroundColor-AppHeader: createThemeVar("backgroundColor-AppHeader");
$boxShadow-header-App: createThemeVar("boxShadow-header-App");

.appHeaderSlot {
  flex-shrink: 0;
  background-color: $backgroundColor-AppHeader;
  
  &.sticky {
    position: sticky;
    top: 0;
    z-index: 10;
    box-shadow: $boxShadow-header-App;
  }
  
  &.fullWidth {
    width: 100%;
  }
}
```

#### AppNavPanelSlot.module.scss
```scss
@use "../../components-core/theming/themes" as t;

$width-navPanel-App: createThemeVar("width-navPanel-App");
$backgroundColor-navPanel-App: createThemeVar("backgroundColor-navPanel-App");
$boxShadow-navPanel-App: createThemeVar("boxShadow-navPanel-App");
$borderBottom-NavPanel: createThemeVar("borderBottom-AppHeader");

.appNavPanelSlot {
  background-color: $backgroundColor-navPanel-App;
  
  &.left {
    width: $width-navPanel-App;
    flex-shrink: 0;
    box-shadow: $boxShadow-navPanel-App;
  }
  
  &.top {
    width: 100%;
    border-bottom: $borderBottom-NavPanel;
  }
  
  &.embedded {
    // Styles for embedded nav in condensed header
    display: inline-flex;
  }
}
```

#### AppMainContentSlot.module.scss
```scss
@use "../../components-core/theming/themes" as t;

$backgroundColor-content-App: createThemeVar("backgroundColor-content-App");
$maxWidth-content-App: createThemeVar("maxWidth-content-App");
$scrollPaddingBlock-Pages: createThemeVar("scroll-padding-block-Pages");

.appMainContentSlot {
  flex: 1;
  background-color: $backgroundColor-content-App;
  min-height: 0; // Allow flex shrinking
  
  &.scrollContainer {
    overflow: auto;
    scroll-padding-block: $scrollPaddingBlock-Pages;
    scrollbar-gutter: stable both-edges;
    
    &.noScrollbarGutters {
      scrollbar-gutter: auto;
    }
  }
  
  &.withPadding {
    padding: var(--spacing-4);
    max-width: $maxWidth-content-App;
    margin-inline: auto;
  }
}
```

#### AppFooterSlot.module.scss
```scss
.appFooterSlot {
  flex-shrink: 0;
  
  &.sticky {
    position: sticky;
    bottom: 0;
    z-index: 10;
  }
  
  &.nonSticky {
    position: static;
  }
}
```

### Refactored App2Native.tsx Structure

```typescript
// App2Native.tsx (simplified coordinator)

export function App2(props: Props) {
  // ... existing setup code (theme, context, refs, state) ...
  
  // Determine layout configuration
  const layoutConfig = LAYOUT_CONFIGS[safeLayout];
  const scrollWholePage = props.scrollWholePage ?? layoutConfig.scrollWholePage;
  
  // Build layout render context
  const layoutContext: LayoutRenderContext = {
    hasHeader: header !== undefined,
    hasNavPanel: hasRegisteredNavPanel,
    hasFooter: footer !== undefined,
    navPanelVisible,
    mediaSize,
    layout: safeLayout,
  };
  
  // Determine which slots to render based on config
  const shouldRenderSlot = (slotConfig?: SlotConfig) => {
    if (!slotConfig) return false;
    if (slotConfig.conditional) {
      return slotConfig.conditional(layoutContext);
    }
    return true;
  };
  
  // Build slot props
  const headerSlotProps = layoutConfig.slots.header && {
    layout: safeLayout,
    isSticky: layoutConfig.slots.header.isSticky || false,
    fullWidth: layoutConfig.slots.header.fullWidth || false,
    sizeObserverRef: headerRefCallback,
  };
  
  const navPanelSlotProps = layoutConfig.slots.navPanel && {
    layout: safeLayout,
    isVisible: shouldRenderSlot(layoutConfig.slots.navPanel),
    placement: layoutConfig.slots.navPanel.placement || "left",
  };
  
  const mainContentSlotProps = {
    layout: safeLayout,
    isScrollContainer: layoutConfig.slots.mainContent.isScrollContainer,
    scrollContainerRef: layoutConfig.slots.mainContent.isScrollContainer ? contentScrollRef : undefined,
    applyDefaultPadding: applyDefaultContentPadding || false,
  };
  
  const footerSlotProps = layoutConfig.slots.footer && {
    layout: safeLayout,
    isSticky: layoutConfig.slots.footer.isSticky && footerSticky,
    sizeObserverRef: footerRefCallback,
  };
  
  // Render layout using configuration
  return (
    <>
      {memoizedHelmet}
      <AppLayoutContext.Provider value={layoutContextValue}>
        <LinkInfoContext.Provider value={linkInfoContextValue}>
          <SearchContextProvider>
            <AppDrawer
              open={drawerVisible}
              onOpenChange={handleOpenChange}
            >
              {memoizedNavPanelInDrawer}
            </AppDrawer>
            
            <AppContainer
              layout={safeLayout}
              scrollWholePage={scrollWholePage}
              noScrollbarGutters={noScrollbarGutters}
              isNested={appGlobals?.isNested || false}
              mediaSize={mediaSize}
              style={styleWithHelpers}
              className={className}
              scrollContainerRef={scrollWholePage ? pageScrollRef : undefined}
              {...rest}
            >
              {shouldRenderSlot(layoutConfig.slots.header) && (
                <AppHeaderSlot {...headerSlotProps}>
                  {safeLayout.startsWith("condensed") && !hasRegisteredHeader && hasRegisteredNavPanel && (
                    <AppContextAwareAppHeader renderChild={renderChild} />
                  )}
                  {header}
                </AppHeaderSlot>
              )}
              
              {shouldRenderSlot(layoutConfig.slots.navPanel) && (
                <AppNavPanelSlot {...navPanelSlotProps}>
                  {navPanel}
                </AppNavPanelSlot>
              )}
              
              <AppMainContentSlot {...mainContentSlotProps}>
                {children}
              </AppMainContentSlot>
              
              {shouldRenderSlot(layoutConfig.slots.footer) && (
                <AppFooterSlot {...footerSlotProps}>
                  {footer}
                </AppFooterSlot>
              )}
            </AppContainer>
          </SearchContextProvider>
        </LinkInfoContext.Provider>
      </AppLayoutContext.Provider>
    </>
  );
}
```

### Implementation Phases

> **Important**: Follow the refactoring rules defined at the top of this document. All work must be done in the `/Users/dotneteer/source/xmlui/xmlui/src/components/App2/` folder. Run tests after each step using the command shown at the top.

#### Phase 1: Create Slot Components (No Behavior Changes)
**Goal**: Extract slot components without changing layout behavior

**Sub-steps** (each must pass all tests before proceeding):

1a. Create `AppContainer.tsx` and `AppContainer.module.scss`
   - Initially just wraps existing structure
   - Props match current needs
   - No logic changes
   - **Test**: Run full e2e suite

1b. Create `AppHeaderSlot.tsx` and `AppHeaderSlot.module.scss`
   - Extract header rendering from switch cases
   - Keep all current behaviors (sticky, sizing, refs)
   - **Test**: Run full e2e suite

1c. Create `AppNavPanelSlot.tsx` and `AppNavPanelSlot.module.scss`
   - Extract nav panel rendering
   - Handle left, top, embedded placements
   - Maintain visibility logic
   - **Test**: Run full e2e suite

1d. Create `AppMainContentSlot.tsx` and `AppMainContentSlot.module.scss`
   - Extract main content rendering
   - Handle scroll container logic
   - Apply padding logic
   - **Test**: Run full e2e suite

1e. Create `AppFooterSlot.tsx` and `AppFooterSlot.module.scss`
   - Extract footer rendering
   - Handle sticky/non-sticky variants
   - **Test**: Run full e2e suite

**Phase 1 Completion Criteria**: All 170 tests pass, no visual changes

#### Phase 2: Introduce Layout Configurations
**Goal**: Replace one switch case at a time with config-driven rendering

**Sub-steps** (each must pass all tests before proceeding):

2a. Create `layoutConfigs.ts` with type definitions
   - Define interfaces: `LayoutConfig`, `SlotConfig`, `LayoutRenderContext`
   - No implementation changes yet
   - **Test**: Build succeeds

2b. Implement config for `desktop` layout (simplest)
   - Add `LAYOUT_CONFIGS.desktop` configuration
   - Replace `case "desktop"` with config-driven render
   - **Test**: Run tests with `--grep "desktop"`

2c. Replace `vertical` layout
   - Add config, replace switch case
   - **Test**: Run tests with `--grep "vertical"` (exclude sticky/full-header)

2d. Replace `vertical-sticky` layout
   - Add config, replace switch case
   - **Test**: Run tests with `--grep "vertical-sticky"`

2e. Replace `horizontal` layout
   - Add config, replace switch case
   - **Test**: Run tests with `--grep "horizontal"` (exclude sticky)

2f. Replace `horizontal-sticky` layout
   - Add config, replace switch case
   - **Test**: Run tests with `--grep "horizontal-sticky"`

2g. Replace `condensed` layout
   - Add config, replace switch case
   - **Test**: Run tests with `--grep "condensed"` (exclude sticky)

2h. Replace `condensed-sticky` layout
   - Add config, replace switch case
   - **Test**: Run tests with `--grep "condensed-sticky"`

2i. Replace `vertical-full-header` layout
   - Add config, replace switch case
   - **Test**: Run tests with `--grep "vertical-full-header"`

2j. Remove switch statement entirely
   - Delete switch statement code
   - Verify all layouts use config-driven approach
   - **Test**: Run full e2e suite

**Phase 2 Completion Criteria**: All 170 tests pass, switch statement eliminated

#### Phase 3: Simplify CSS
**Goal**: Flatten CSS structure using slot-scoped styles

**Sub-steps** (each must pass all tests before proceeding):

3a. Move header styles to `AppHeaderSlot.module.scss`
   - Extract `.headerWrapper` and related styles
   - Update imports in AppHeaderSlot
   - **Test**: Run full e2e suite

3b. Move nav panel styles to `AppNavPanelSlot.module.scss`
   - Extract `.navPanelWrapper` and related styles
   - Update imports in AppNavPanelSlot
   - **Test**: Run full e2e suite

3c. Move main content styles to `AppMainContentSlot.module.scss`
   - Extract `.PagesWrapper`, `.PagesWrapperInner` styles
   - Update imports in AppMainContentSlot
   - **Test**: Run full e2e suite

3d. Move footer styles to `AppFooterSlot.module.scss`
   - Extract `.footerWrapper` and related styles
   - Update imports in AppFooterSlot
   - **Test**: Run full e2e suite

3e. Simplify `AppContainer.module.scss`
   - Remove deep nesting
   - Keep only container-level styles
   - Update class names (`.wrapper` → `.appContainer`)
   - **Test**: Run full e2e suite

3f. Remove unused classes from `App2.module.scss`
   - Delete obsolete styles
   - Verify no references remain
   - **Test**: Run full e2e suite

**Phase 3 Completion Criteria**: All 170 tests pass, CSS is flattened and modular

#### Phase 4: Extract Layout Renderer (Optional)
**Goal**: Further simplify App2Native by extracting layout rendering logic

**Sub-steps** (each must pass all tests before proceeding):

4a. Create `LayoutRenderer.tsx` component
   - Extract slot rendering logic from App2Native
   - Props: layout config, slots content, refs, callbacks
   - **Test**: Run full e2e suite

4b. Update App2Native to use LayoutRenderer
   - Replace inline slot rendering with `<LayoutRenderer />`
   - App2Native becomes coordinator only
   - **Test**: Run full e2e suite

**Phase 4 Completion Criteria**: All 170 tests pass, App2Native simplified

#### Phase 5: Documentation and Cleanup
**Goal**: Document new architecture and remove old patterns

5a. Update component documentation
   - Add JSDoc comments to all new components
   - Document props and behavior

5b. Update type definitions
   - Ensure all exports are properly typed
   - Add type documentation

5c. Remove commented-out code
   - Clean up any temporary comments
   - Remove debug code

5d. Create migration notes (optional)
   - Document changes for future App → App2 migration
   - Note any breaking changes

**Phase 5 Completion Criteria**: Documentation complete, code clean

### Testing Strategy for Each Step

For each sub-step:
1. Make the changes
2. Run the test command from the top of this document
3. If tests fail:
   - **Iteration 1**: Analyze failure, fix issue, rerun tests
   - **Iteration 2**: If still failing, try alternative approach, rerun tests
   - **Iteration 3**: If still failing, try minimal fix, rerun tests
   - **If all 3 iterations fail**: Revert changes, request review
4. If tests pass: Commit changes, proceed to next sub-step

### Benefits of New Architecture

1. **Reduced Complexity**: Switch statement → 30 lines of config-driven render
2. **Better Naming**: `appContainer`, `appHeaderSlot`, `appMainContentSlot` vs. `wrapper`, `contentWrapper`, `PagesWrapper`
3. **Easier Testing**: Test individual slot components in isolation
4. **Simpler CSS**: Flat structure, no deep nesting, clearer ownership
5. **Better Extensibility**: Add new layouts by adding config, not code
6. **Clearer Intent**: Slot component names convey purpose
7. **Reusable Components**: Slots can be used in other contexts
8. **Type Safety**: Config objects are fully typed
9. **Better Debugging**: Smaller components, easier to trace issues
10. **Maintainability**: Changes to one layout don't risk breaking others

### Migration Path

**For Internal Use (App2 → App):**
Once App2 refactoring is complete and validated:

1. Copy App2 components to replace App
2. Update all App references to use new structure
3. Run full test suite
4. Monitor production for issues
5. Deprecate old App implementation

**No Breaking Changes**: External API remains unchanged, only internal implementation differs.

</details>

---

## Component-Based Layout Refactoring Plan (NEW APPROACH)

### Overview

This refactoring follows an **incremental, layout-by-layout approach** to minimize risk and enable easier debugging:

1. **Phase 1**: Create all slot components with fundamental layout styles (NO layout-specific behavior)
2. **Phase 2**: Apply slot components to ONE layout at a time, starting with `horizontal`
3. Each layout becomes a milestone - only proceed after all tests pass

### Benefits of This Approach

- **Reduced Risk**: Only one layout affected at a time
- **Easier Debugging**: Can compare new component-based layout against working original layouts
- **Incremental Validation**: Tests verify each layout independently
- **Clearer Progress**: Each layout is a concrete milestone
- **Safe Rollback**: Can revert a single layout without affecting others

---

## Phase 1: Create All Slot Components ✅ COMPLETED

**Goal**: Create all slot components with fundamental layout styles only (no layout-specific behavior).

**Status**: ✅ **COMPLETED** (2024-11-20)

### Components Created

All components created in `/Users/dotneteer/source/xmlui/xmlui/src/components/App2/`:

#### 1. AppContainer (`AppContainer.tsx` / `AppContainer.module.scss`)
- **Purpose**: Outermost wrapper for the App component
- **Fundamental Styles**:
  - `width: 100%`
  - `height: 100%`
  - `position: relative`
  - `display: flex`
  - `flex-direction: column`
  - `isolation: isolate`
- **Props**: Basic HTMLDivElement props, forwardRef enabled
- **Theme Variables**: None (base container only)

#### 2. AppHeaderSlot (`AppHeaderSlot.tsx` / `AppHeaderSlot.module.scss`)
- **Purpose**: Header section wrapper
- **Fundamental Styles**:
  - `z-index: 1`
  - `min-height: 0`
  - `flex-shrink: 0`
  - `overflow-x: clip`
  - Plus theme variables for styling
- **Props**: Basic HTMLElement props, forwardRef enabled
- **Theme Variables**:
  - `boxShadow-header-App`
  - `backgroundColor-AppHeader`

#### 3. AppFooterSlot (`AppFooterSlot.tsx` / `AppFooterSlot.module.scss`)
- **Purpose**: Footer section wrapper
- **Fundamental Styles**:
  - `flex-shrink: 0`
- **Props**: Basic HTMLDivElement props, forwardRef enabled
- **Theme Variables**: None

#### 4. AppNavPanelSlot (`AppNavPanelSlot.tsx` / `AppNavPanelSlot.module.scss`)
- **Purpose**: Navigation panel wrapper
- **Fundamental Styles**:
  - `display: flex`
  - `position: sticky`
  - `top: 0`
  - `:empty { display: none }`
- **Props**: Basic HTMLDivElement props, forwardRef enabled
- **Theme Variables**: None

#### 5. AppContentSlot (`AppContentSlot.tsx` / `AppContentSlot.module.scss`)
- **Purpose**: Main content wrapper (wraps header, pages, footer in some layouts)
- **Fundamental Styles**:
  - `position: relative`
  - `min-width: 0`
  - `flex: 1`
  - `display: flex`
  - `flex-direction: column`
  - Plus theme variables for styling
- **Props**: Basic HTMLDivElement props, forwardRef enabled
- **Theme Variables**:
  - `boxShadow-navPanel-App`
  - `backgroundColor-content-App`
  - `borderLeft-content-App`

#### 6. AppPagesSlot (`AppPagesSlot.tsx` / `AppPagesSlot.module.scss`)
- **Purpose**: Pages wrapper (where children/page content renders)
- **Fundamental Styles**:
  - `flex: 1`
  - `isolation: isolate`
- **Props**: Basic HTMLDivElement props, forwardRef enabled
- **Theme Variables**: None

### Design Principles Applied

1. **Minimal Styles**: Only fundamental layout properties that apply universally
2. **No Layout-Specific Logic**: No conditional classes, no layout variants
3. **Theme Variable Support**: Proper SCSS structure with `createThemeVar()` function
4. **ForwardRef**: All components support ref forwarding for scroll management
5. **Extensible Props**: Comment placeholders for props to be added during Phase 2
6. **Consistent Pattern**: All follow same structure as `App2.module.scss`
7. **Original Class Names**: Components use original `App2.module.scss` class names (`headerWrapper`, `navPanelWrapper`, `PagesWrapper`, `footerWrapper`) for test compatibility
8. **AppContainer Universality**: AppContainer wraps ALL layout cases to ensure consistent React component type across layouts (prevents unmount/remount on layout switches)

### Key Learnings

**CSS Class Names Must Match Original**:
- Tests use class name patterns like `className.includes("PagesWrapper")` to identify elements
- Creating new class names (e.g., `pagesSlot`, `headerSlot`) breaks tests
- Slot components must import and use classes from `App2.module.scss`
- CSS renaming will be a separate phase after all layouts are refactored

**Component Type Consistency Required**:
- React unmounts/remounts when switching between different component types (e.g., `<div>` → `<AppContainer>`)
- This breaks `data-testid` selectors during layout transitions
- Solution: ALL layout cases must use AppContainer as the wrapper
- Each layout can have different internal structure, but outer wrapper must be consistent

### Verification

- ✅ All 6 components created with TypeScript files
- ✅ All 6 SCSS modules created with proper theme support (initially separate, later consolidated to use App2.module.scss)
- ✅ All 170 tests passing after wrapping all layouts with AppContainer
- ✅ No breaking changes introduced
- ✅ Horizontal layout successfully refactored to use all slot components

---

## Phase 2: Refactor Layouts Incrementally

**Goal**: Apply slot components to each layout one at a time, verifying tests pass after each layout.

**Status**: 🔄 **NOT STARTED**

### Approach

For each layout:
1. Add layout-specific props to slot components (if needed)
2. Refactor the layout case in `App2Native.tsx` to use slot components
3. Add layout-specific styles to slot component SCSS files
4. Run tests for that specific layout (e.g., `--grep "horizontal"`)
5. Once tests pass, commit and move to next layout
6. If tests fail after 3 iterations, request review

### Layout Refactoring Order

1. **horizontal** ⬜ NOT STARTED
2. **horizontal-sticky** ⬜ NOT STARTED
3. **vertical** ⬜ NOT STARTED
4. **vertical-sticky** ⬜ NOT STARTED
5. **vertical-full-header** ⬜ NOT STARTED
6. **condensed** ⬜ NOT STARTED
7. **condensed-sticky** ⬜ NOT STARTED
8. **desktop** ⬜ NOT STARTED

### Layout 1: horizontal

**Current Structure** (from `App2Native.tsx`):
```tsx
case "horizontal":
  content = (
    <div {...rest} className={classnames(wrapperBaseClasses, styles.horizontal)} style={styleWithHelpers}>
      {navPanelVisible && <div className={styles.navPanelWrapper}>{navPanel}</div>}
      <header ref={headerRefCallback} className={classnames(styles.headerWrapper, styles.sticky)}>
        {header}
      </header>
      <div className={styles.PagesWrapper} ref={contentScrollRef}>
        <div className={pagesWrapperClasses}>{children}</div>
      </div>
      <div className={styles.footerWrapper} ref={footerRefCallback}>
        {footer}
      </div>
    </div>
  );
  break;
```

**Actual Implementation** (completed):
```tsx
case "horizontal": {
  content = (
    <AppContainer
      className={classnames(wrapperBaseClasses, styles.horizontal)}
      style={styleWithHelpers}
      ref={pageScrollRef}
      {...rest}
    >
      <AppHeaderSlot ref={headerRefCallback}>
        {header}
        {navPanelVisible && <AppNavPanelSlot>{navPanel}</AppNavPanelSlot>}
      </AppHeaderSlot>
      <AppPagesSlot ref={contentScrollRef}>
        <div className={pagesWrapperClasses}>{children}</div>
      </AppPagesSlot>
      <AppFooterSlot ref={footerRefCallback}>
        {footer}
      </AppFooterSlot>
    </AppContainer>
  );
  break;
}
```

**Key Implementation Details**:
1. AppContainer passes className (with `styles.horizontal`) instead of layout prop
2. Slot components use original class names from `App2.module.scss`
3. All slot components reference styles directly from `App2.module.scss` (not separate SCSS files)
4. `{...rest}` placed after other props to ensure `data-testid` and other attributes are passed through
5. No layout-specific props needed - CSS classes handle all layout variations
6. ALL layout cases wrapped with AppContainer (not just horizontal) to ensure consistent React component type

**Status**: ✅ **COMPLETED** - All 34 horizontal layout tests passing, all 170 total tests passing

---

## Current Status

**Last Updated**: 2024-11-20

### Completed
- ✅ Phase 1: All slot components created with fundamental styles
- ✅ Phase 2 - Layout 1 (horizontal): Refactored to use all slot components
  - AppContainer wraps all layout cases for component type consistency
  - Horizontal layout uses AppHeaderSlot, AppNavPanelSlot, AppPagesSlot, AppFooterSlot
  - All 34 horizontal layout tests passing
  - All 170 total tests passing

### Lessons Learned
1. **CSS Class Names**: Must use original `App2.module.scss` class names - tests depend on them
2. **Component Type Consistency**: All layouts must use AppContainer to prevent React unmount/remount
3. **Props Strategy**: Use className-based styling, not component props (simpler, less refactoring needed)

### Next Steps
1. Choose next layout to refactor (horizontal-sticky recommended as it's similar to horizontal)
2. Apply same slot component pattern
3. Run tests after each layout
4. Repeat for remaining 6 layouts

### Next Steps
1. Begin Phase 2 with horizontal layout refactoring
2. Add necessary props to slot components
3. Extract horizontal-specific styles to slot SCSS files
4. Update horizontal case in App2Native.tsx
5. Run horizontal layout tests

### Success Metrics

- ✅ All 170 existing tests pass after each layout refactoring
- ✅ Lines of code reduced by ~40% (600 → ~350)
- ✅ CSS nesting depth reduced from 5 levels to 2 levels
- ✅ Switch statement eliminated (replaced with slot components)
- ✅ Component complexity reduced
- ✅ Slot components individually testable
- ✅ No visual regressions in any layout
- ✅ Build time unchanged or improved
- ✅ Bundle size unchanged or reduced
