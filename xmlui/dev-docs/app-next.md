# App Component Refactoring Notes

## Current Problems
- Layout options are not straightforward enough
- Complex conditional logic for each layout type in AppNative.tsx switch statement
- Scroll behavior tied to layout type creates inflexibility
- CSS structure has deep nesting and overlapping concerns
- Header/footer positioning logic is duplicated across layouts
- NavPanel visibility logic is fragmented

## AppHeader Sub-Blocks

The Header Block (AppHeader component) is composed of several sub-blocks that flow horizontally from start to end, respecting the current text direction (LTR/RTL). Each sub-block can be customized via template properties on the AppHeader component.

### Sub-Block Order (Start → End)
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

### Complete Components
- **Logo Component**: Handles logo display with theme-aware variants (light/dark), clickable navigation to home
- **Search Box Component**: Full-featured search input with dropdown results, keyboard navigation, and search indexing integration
- **Profile Menu Component**: User profile display with dropdown menu for account actions, settings, logout

### Flexible Slots
- **Start Slot**: Template slot for custom content after the logo and title (e.g., quick actions, navigation breadcrumbs)
- **Middle Slot**: Template slot for custom content in the center (e.g., tabs, filters, context-specific controls)
- **End Slot**: Template slot for custom content before or instead of search/profile (e.g., notifications, help icon, theme toggle)

### Layout Behavior
- Sub-blocks follow flex layout with appropriate spacing
- Components can be hidden/shown based on props or by omitting template properties
- Respects text direction (LTR/RTL) for proper ordering
- Mobile responsive: some slots may collapse or move to drawer

## Layout Types (8 variants)

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
navPanelVisible = mediaSize.largeScreen || 
  (!hasRegisteredHeader && layout !== "condensed" && layout !== "condensed-sticky")
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
--scrollbar-width: calculated | 0px
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

## Breaking Changes Considerations
- Existing layouts need migration path
- Theme variables should remain stable
- XMLUI markup compatibility important

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

## AppHeader Sub-Block Component Specifications

### 1. AppLogo Component

**Purpose**: Display application logo with theme-aware variants and navigation functionality.

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

### 3. AppProfileMenu Component

**Purpose**: Display user profile with dropdown menu for account actions.

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

**AppHeader Template Properties**:
- `startSlotTemplate`: ComponentDef - Template content for start slot
- `middleSlotTemplate`: ComponentDef - Template content for middle slot
- `endSlotTemplate`: ComponentDef - Template content for end slot

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

The AppHeader component composes all sub-blocks using template properties:

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

**Alternative: Custom Templates Override Defaults**
```xml
<AppHeader 
  logoTemplate={customLogoDef}
  titleTemplate={customTitleDef}
  searchBoxTemplate={customSearchDef}
  profileMenuTemplate={customProfileDef}
/>
```

**XMLUI Markup Example with Inline Templates**:
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

**Default Rendering Order** (LTR):
```
[Logo] [Title] [StartSlot] [MiddleSlot] [SearchBox] [ProfileMenu] [EndSlot]
```

**RTL Support**: Order automatically reverses in RTL text direction.

**Visibility Control**: Each sub-block can be shown/hidden via:
- Omitting template properties (slot not rendered)
- Using `*Enabled` props for built-in components (e.g., `searchBoxEnabled={false}`)
- Conditional rendering within template content
