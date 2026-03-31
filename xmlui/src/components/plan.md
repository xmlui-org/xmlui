# How-To Article Plan

Topics for new how-to articles, grouped by theme. Each entry has a short title (≤50 chars) and a one-line description of what the article teaches.

---

## 1 · Forms & Validation

| # | Title | What to document |
|---|---|---|
| 1 | Validate dependent fields together | Cross-field validation (e.g. "confirm password" must match "password") using `willSubmit` or custom validation logic. |
| 2 | Build a multi-step wizard form | Split a long form across steps using Tabs or conditional rendering, collect data across steps, submit once. |
| 3 | Reset a form after submission | Use `dataAfterSubmit` to clear/reset/keep data and give visual feedback after a successful submit. |
| 4 | Persist form drafts across sessions | Use `persist` on Form to save in-progress input to localStorage and restore on revisit. |
| 5 | Prefill a form from an API response | Load data with DataSource, feed it into Form's `data` prop so fields start pre-populated for editing. |
| 6 | Make a form read-only conditionally | Toggle all inputs to read-only based on a permission flag or user role. |
| 7 | Arrange form fields side by side | Use HStack inside Form or configure `itemLabelPosition="left"` and widths to get a horizontal field layout. |
| 8 | Show validation on blur, not on type | Configure `customValidationsDebounce` and patterns so errors appear only after the user leaves the field. |
| 9 | Add an async uniqueness check | Call an API inside a custom FormItem validator with debounce to check if a username or email is already taken. |
| 10 | Submit a form with file uploads | Combine FileInput / FileUploadDropZone inside a Form and handle multipart submission. |

---

## 2 · Data Loading & API Communication

| # | Title | What to document |
|---|---|---|
| 11 | Poll an API at regular intervals | Use `pollIntervalInSeconds` on DataSource to refresh data periodically without user interaction. |
| 12 | Transform nested API responses | Use `resultSelector` and `transformResult` to flatten or reshape deeply nested JSON before rendering. |
| 13 | Show a skeleton while data loads | Combine DataSource `inProgress` / `loaded` with conditional rendering to show placeholders. |
| 14 | Retry a failed API call | Detect an error on APICall, show a retry button, and call `execute()` again. |
| 15 | Track a long-running server task | Use APICall deferred mode (202 Accepted) with polling strategies and progress UI. |
| 16 | Send custom headers per request | Set headers on a single DataSource or APICall to add auth tokens or custom metadata. |
| 17 | Invalidate related data after a write | After an APICall succeeds, trigger refetch on one or more DataSources using query invalidation. |
| 18 | Use mock data during development | Set `mockData` on DataSource to work on the UI without a running backend. |
| 19 | Download a file from an API | Use the FileDownload action to fetch and save a file triggered by a button click. |
| 20 | Cancel a deferred API operation | Use `cancel()` and `stopPolling()` on APICall to let users abort a long-running server task. |

---

## 3 · Tables & Data Display

| # | Title | What to document |
|---|---|---|
| 21 | Pin columns in a wide table | Use `pinTo="left"` or `pinTo="right"` on Column to freeze key columns during horizontal scroll. |
| 22 | Add row actions with a context menu | Attach a ContextMenu to table rows and pass `$item` context to perform edit/delete per row. |
| 23 | Render a custom cell with components | Use Column children as a cell template with Badge, Icon, Link, or Button for rich cell content. |
| 24 | Enable multi-row selection in a table | Turn on `rowsSelectable` + `enableMultiRowSelection`, read the selection, and act on it (bulk delete, etc.). |
| 25 | Sort a table by a computed value | Use `sortValue` or `sortBy` with a derived expression to sort rows by something not directly in the data. |
| 26 | Highlight rows conditionally | Apply per-row styling (background color, bold) based on data values using Column templates and expressions. |
| 27 | Build a master–detail layout | Click a table row to show details in an adjacent panel or ModalDialog, passing the selected row data. |
| 28 | Auto-size column widths with star | Mix fixed-pixel, percentage, and star (`*`, `2*`) widths to divide remaining space proportionally. |

---

## 4 · Lists, Trees & Iteration

| # | Title | What to document |
|---|---|---|
| 29 | Build a grouped list with headers | Use `groupBy`, `groupHeaderTemplate`, and `groupFooterTemplate` on List to display categorized data. |
| 30 | Lazy-load tree children on expand | Set `dynamic` on Tree and use `onLoadChildren` to fetch child nodes from an API on demand. |
| 31 | Pre-select a tree node on load | Set `selectedValue` on Tree to a data-driven value so the correct node is highlighted immediately. |
| 32 | Render a flat list with custom cards | Use List `itemTemplate` to replace default rows with Card-based, richly styled list items. |
| 33 | Add drag-and-drop reordering to a list | Combine List with keyboard or pointer events to let users reorder items (if supported). |
| 34 | Iterate without a container element | Use Items instead of List when you need to stamp out children inline without extra wrapper markup. |
| 35 | Display an empty-state illustration | Use `emptyListTemplate` on List or Select to show a friendly message or graphic when there is no data. |

---

## 5 · Navigation & Routing

| # | Title | What to document |
|---|---|---|
| 36 | Add breadcrumb navigation | Combine Link components with `$pathname` / `$routeParams` to build a breadcrumb bar. |
| 37 | Protect a page with an auth guard | Use Redirect + a login state variable to bounce unauthenticated users to a sign-in page. |
| 38 | Deep-link to a tab or section | Read `$queryParams` or `$routeParams` on load to select the right Tab or scroll to a Bookmark. |
| 39 | Build nested page routes | Use Pages inside Pages to create a multi-level URL hierarchy (e.g. `/settings/profile`). |
| 40 | Switch between hash and history routing | Set `useHashBasedRouting` in appGlobals and configure server-side rewrites for history mode. |
| 41 | Navigate programmatically | Use the `navigate()` global function from a script block or event handler instead of a Link. |
| 42 | Highlight the active nav link | Use NavLink's built-in active state to style the current route in a sidebar or header menu. |
| 43 | Collapse the nav panel on mobile | Combine NavPanel with `NavPanelCollapseButton` and responsive `when-*` attributes. |

---

## 6 · Layout & Responsive Design

| # | Title | What to document |
|---|---|---|
| 44 | Build a holy-grail layout | Use App layout modes, NavPanel, Footer, and content area to create header + sidebar + content + footer. |
| 45 | Center content on the page | Use CVStack or CHStack, or `horizontalAlignment`/`verticalAlignment` on Stack. |
| 46 | Create a resizable split view | Use Splitter / HSplitter / VSplitter with min/max constraints for an IDE-style panel layout. |
| 47 | Make a sticky header in a scroll area | Use StickyBox or StickySection inside a scrollable VStack to keep a banner visible while scrolling. |
| 48 | Build a responsive card grid | Use TileGrid or HStack with `wrapContent` and responsive width to reflow cards on different screens. |
| 49 | Show different content per breakpoint | Use responsive `when-xs`, `when-md`, `when-lg` attributes to swap components at breakpoints. |
| 50 | Push a footer to the bottom | Use SpaceFiller between main content and Footer so the footer stays at the viewport bottom. |
| 51 | Dock elements to panel edges | Use `dock` on Stack children to pin items to top/bottom/left/right of a container. |
| 52 | Limit content width on large screens | Wrap content in a Stack with `maxWidth` and center it, so ultrawide monitors stay readable. |

---

## 7 · Modals, Drawers & Overlays

| # | Title | What to document |
|---|---|---|
| 53 | Open a confirmation before delete | Use the global `confirm()` function or APICall's `confirmTitle`/`confirmMessage` to gate destructive actions. |
| 54 | Build a fullscreen modal dialog | Set `fullScreen` on ModalDialog for a takeover experience (e.g. image gallery, multi-step flow). |
| 55 | Show a slide-in settings drawer | Use Drawer with `position="right"` and a headerTemplate for a non-blocking side panel. |
| 56 | Return data from a closed dialog | Use `onClose` to pass a result back to the parent, or write to a shared variable before closing. |
| 57 | Open a context menu on right-click | Bind `onContextMenu` on a Stack/Table row, call `ContextMenu.openAt(event, $item)`. |

---

## 8 · Theming & Styling

| # | Title | What to document |
|---|---|---|
| 58 | Create a custom color theme | Define a new theme JSON, register it, and set it as default or let the user switch to it. |
| 59 | Override a component's theme vars | Use Theme with component-scoped variables (`backgroundColor-Button`, etc.) to restyle one subtree. |
| 60 | Implement a dark-mode toggle | Add ToneSwitch or ToneChangerButton, persist the choice with `persistTheme`, and handle tone-aware images. |
| 61 | Style text with custom variants | Define Text or Heading variants in theme variables to reuse branded typography across the app. |
| 62 | Scope a theme to a card or section | Wrap a part of the UI in a `<Theme>` tag to apply a different tone or colors locally. |
| 63 | Adjust spacing globally | Override `gap-*`, `padding-*`, and `margin-*` theme variables at the app root to tighten or loosen spacing everywhere. |

---

## 9 · User-Defined Components

| # | Title | What to document |
|---|---|---|
| 64 | Create a reusable component | Extract repeated markup into a `.xmlui` file with properties and slots. |
| 65 | Pass a template slot to a component | Use named `Slot` elements (ending in "Template") to let callers inject custom markup. |
| 66 | Emit a custom event from a component | Define an event property in a user-defined component and fire it from an inner handler. |
| 67 | Set default property values | Declare defaults in the component definition so callers only override what they need. |
| 68 | Compose components with nesting | Build higher-order components that wrap others while forwarding props and slots. |

---

## 10 · Scripting & Reactivity

| # | Title | What to document |
|---|---|---|
| 69 | React to value changes with debounce | Use ChangeListener with `debounceWaitInMs` to delay processing until the user stops typing. |
| 70 | Derive a value from multiple sources | Bind an expression that combines two or more variables; it auto-updates when any input changes. |
| 71 | Use accessors for complex expressions | Store a frequently used expression in an accessor (`value.` prefix) to keep markup readable. |
| 72 | Run a one-time action on page load | Use Timer with `once=true` or a DataSource `loaded` event to trigger initialization logic. |
| 73 | Communicate between sibling components | Use a shared variable or ChangeListener to pass data between components that are not parent–child. |
| 74 | Throttle rapid value updates | Use ChangeListener with `throttleWaitInMs` to emit at most one update per interval. |

---

## 11 · Menus & Toolbars

| # | Title | What to document |
|---|---|---|
| 75 | Build a toolbar with overflow menu | Use ResponsiveBar so items that don't fit collapse into a "More" dropdown automatically. |
| 76 | Add a dropdown menu to a button | Use DropdownMenu with MenuItem and SubMenuItem for hierarchical actions. |
| 77 | Disable menu items conditionally | Bind `enabled` on MenuItem to a reactive expression (e.g. nothing selected → delete disabled). |
| 78 | Create a multi-level submenu | Nest SubMenuItem inside DropdownMenu for two or more levels of menu hierarchy. |

---

## 12 · Media & Rich Content

| # | Title | What to document |
|---|---|---|
| 79 | Render a Markdown file as a page | Load a `.md` file via DataSource and display it with the Markdown component. |
| 80 | Embed an external site in an IFrame | Use IFrame with `sandbox` and `allow` for secure third-party embeds. |
| 81 | Lazy-load images for performance | Set `lazyLoad` on Image to defer offscreen images and improve initial load time. |
| 82 | Generate a QR code from user input | Bind QRCode `value` to a TextBox so the code updates live as the user types. |
| 83 | Display a PDF document inline | Use the xmlui-pdf Pdf component to embed a viewer for uploaded or server-hosted PDFs. |
| 84 | Add entrance animations to content | Use xmlui-animations FadeInAnimation / SlideInAnimation to reveal sections on scroll or mount. |

---

## 13 · Miscellaneous Patterns

| # | Title | What to document |
|---|---|---|
| 85 | Show toast notifications from code | Call the global `toast()` function from event handlers or scripts to display success/error messages. |
| 86 | Set the page title dynamically | Use PageMetaTitle with a bound `value` expression to update the browser tab per route. |
| 87 | Receive postMessage from an iframe | Use MessageListener to react to messages sent from embedded content or a parent window. |
| 88 | Build a batch-processing queue | Use Queue to enqueue items, process them sequentially with progress feedback, and handle errors. |
| 89 | Add custom icons to the app | Register SVG icons via config and reference them by name in any component's `icon` property. |
| 90 | Generate a table of contents | Place TableOfContents alongside Markdown/Heading content to auto-build a navigable outline. |
| 91 | Use local storage for user prefs | Assign `storageKey` on a global variable to persist a user preference (e.g. sidebar collapsed) across sessions. |
| 92 | Redirect users after login | Combine an auth state variable with Redirect to send users to the original target page post-authentication. |

---

## 14 · Advanced Theming

| # | Title | What to document |
|---|---|---|
| 93 | Theme Button variant×color combos | Override Button theme vars for solid/outlined/ghost × primary/secondary/attention (100+ vars). |
| 94 | Style per-level Heading sizes | Configure per-level theme vars (h1–h6) for font-size, weight, line-height, and margin. |
| 95 | Theme TableOfContents by depth | Customize active, hover, and default styles per nesting level (items 1–6, 200+ vars). |
| 96 | Customize Select & AutoComplete menus | Style menu, badges, items, and disabled states via component-specific theme vars (80–90 vars). |
| 97 | Theme form inputs for all states | Set TextBox/NumberBox/TextArea vars for error, warning, success, disabled, focus, and hover states. |
| 98 | Style Markdown admonition variants | Override colors and borders for note/tip/warning/danger admonition blocks and blockquote styling. |
| 99 | Customize Tooltip appearance | Adjust animation, arrow, typography, and background via Tooltip theme vars (45+ vars). |
| 100 | Theme ExpandableItem transitions | Control content/summary styles and expand/collapse animation with ExpandableItem theme vars. |
| 101 | Style NavPanel for horizontal mode | Override NavPanel theme vars for vertical vs horizontal layouts, logo, footer, and content parts. |
| 102 | Theme multi-level NavGroup nesting | Customize styles for up to 4 nesting levels and dropdown overlays in NavGroup. |
| 103 | Style ModalDialog overlay and parts | Control content, title bar, close button, and backdrop overlay styles via theme vars. |
| 104 | Customize Link focus & decoration | Set icon gap, padding, border, focus outline, and text decoration vars for Link (60+ vars). |
| 105 | Theme DatePicker calendar items | Style calendar grid, selected day, disabled dates, range highlights, and menu via DatePicker vars. |
| 106 | Style Slider track, thumb, and range | Override track color, thumb size, and range fill for normal, hover, and disabled states. |
| 107 | Define custom Text variants in a theme | Use the `{cssProperty}-Text-{variantName}` pattern to create reusable branded text styles. |
| 108 | Theme Badge colors and sizes | Customize background, text, border-radius, and padding per Badge variant. |
| 109 | Style Card and NoResult placeholders | Override Card (20+ vars) and NoResult (30+ vars) theme vars for consistent empty/container styling. |

---

## 15 · Complex Property Patterns

| # | Title | What to document |
|---|---|---|
| 110 | Configure Tree data format and mapping | Choose between flat vs hierarchy `dataFormat`, map fields with `idField`/`labelField`/`parentField` etc. |
| 111 | Parse uploaded files as CSV or JSON | Use FileInput `parseAs` to auto-parse files, configure `csvOptions` (Papa Parse), and handle `parseError`. |
| 112 | Disable specific dates in DatePicker | Use `disabledDates` with weekday, range, before/after, array, and mixed patterns. |
| 113 | Handle Form willSubmit return values | Return `false`, a modified object, or `undefined` from `willSubmit` to cancel, transform, or proceed. |
| 114 | Use regex validation in FormItem | Write regex patterns with curly-brace quantifiers and control severity per validation type. |
| 115 | Use negative maxPrimarySize in Splitter | Set negative values on `maxPrimarySize` to calculate from the opposite edge. |
| 116 | Switch Tabs to accordion view | Override tab layout with `accordionView`, interact with `headerTemplate` and `$header` context. |
| 117 | Sync TileGrid selection across grids | Use `syncWithVar` for cross-grid selection, leverage keyboard shortcuts (Ctrl+A, Delete, Cut/Copy/Paste). |
| 118 | Configure Tooltip with string syntax | Use `tooltipOptions` semicolon-delimited syntax with boolean prefix notation for inline config. |
| 119 | Control debounce vs throttle priority | Understand ChangeListener precedence rules when both `debounceWaitInMs` and `throttleWaitInMs` are set. |
| 120 | Dock children in a Stack panel | Use the `dock` property with top/bottom/left/right/stretch semantics for DockPanel layouts. |
| 121 | Communicate with IFrame content | Use `postMessage()`, `getContentDocument()`, and `getContentWindow()` with cross-origin restrictions. |
| 122 | Handle ContentSeparator orientation | Set explicit parent height for vertical ContentSeparator display. |
| 123 | Load remote markup with IncludeMarkup | Handle CORS requirements, `didFail` error events, and know that script sections are silently ignored. |
| 124 | Stack StickySection elements | Understand stacking behavior where only the closest sticky section remains visible. |
| 125 | Auto-scroll NavPanel to active item | Use `syncWithContent` to auto-scroll the current nav item into the visible area. |
| 126 | Handle Checkbox value coercion | Understand how null, "false" strings, empty arrays, and empty objects are coerced to boolean. |

---

## 16 · Charts & Data Visualization

| # | Title | What to document |
|---|---|---|
| 127 | Build a stacked bar chart | Use BarChart with `stacked` and multiple `yKeys` to compare cumulative totals per category. |
| 128 | Format chart axis ticks | Use `tickFormatterX` / `tickFormatterY` functions on line, bar, or area charts for custom labels. |
| 129 | Add custom tooltips to a chart | Replace default tooltip rendering with `tooltipTemplate` for rich hover content. |
| 130 | Create an area chart with stacking | Use AreaChart with `stacked` and `curved` for layered time-series visualization. |
| 131 | Position labels on a pie chart | Configure `labelListPosition` with 20+ placement options on PieChart or use the LabelList component. |
| 132 | Overlay a radar chart comparison | Plot multiple data series on RadarChart with `filled`, `fillOpacity`, and `strokeWidth` tweaks. |
| 133 | Use ECharts for advanced charting | Pass a full ECharts `option` config to EChart and access the native instance with `getEchartsInstance()`. |
| 134 | Create a gauge dashboard widget | Configure Gauge `analogDisplayType` (needle/fill/line), scale positioning, and digital display. |

---

## 17 · PDF Viewer

| # | Title | What to document |
|---|---|---|
| 135 | Embed and navigate a PDF | Use Pdf `src`/`data`, page navigation methods, zoom controls, and `scrollStyle` options. |
| 136 | Add annotations to a PDF | Switch to edit mode, create/update/delete annotations, and export with `exportAnnotations()`. |
| 137 | Capture and apply PDF signatures | Use `openSignatureModal()`, `applySignature()`, `saveSignature()`, and `signatureData` round-trip. |
| 138 | Export a modified PDF | Use `exportToPdf()` to flatten annotations into a real PDF `Uint8Array` for download or upload. |

---

## 18 · Rich Text & Masonry

| # | Title | What to document |
|---|---|---|
| 139 | Configure a TiptapEditor toolbar | Use `toolbarItems` to selectively show formatting options; retrieve content as HTML or Markdown. |
| 140 | Build a responsive masonry layout | Use Masonry with `columns`, `minColumnWidth`, and `gap` for a Pinterest-style auto-reflowing grid. |

---

## 19 · Animation & Carousel

| # | Title | What to document |
|---|---|---|
| 141 | Chain animations on scroll into view | Combine FadeInAnimation / SlideInAnimation with `animateWhenInView` and `delay` for staggered reveals. |
| 142 | Build an auto-playing carousel | Configure Carousel `autoplay`, `autoplayInterval`, `loop`, and `stopAutoplayOnInteraction`. |
| 143 | Customize carousel controls & indicators | Override Carousel theme vars for control/indicator active, hover, disabled states and sizing. |

---

## Article Body Scenarios — Category 9: User-Defined Components

All five articles share a **project task tracker** domain. This keeps vocabulary consistent and lets the reader follow a natural progression from simple extraction to full composition. The mock API provides a flat list of tasks for articles that need data.

### Shared domain model

```json
{ "id": 1, "title": "…", "priority": "low|normal|high", "status": "todo|in-progress|done", "assignee": "…", "dueDate": "YYYY-MM-DD" }
```

Priority maps to colors: low → `$color-success`, normal → `$color-info`, high → `$color-warn`.

### Learnings from code review

- **`Badge` uses `value=`**, not `label=`, for the displayed text.
- **`Badge` color mapping** uses `colorMap="{{ key: 'color' }}"` — double-brace object literal inside the attribute. Theme token strings like `'$color-warn'` are valid map values.
- **Two-column / N-column grid layouts**: use `HStack wrapContent itemWidth="50%"` (or `"33%"`). Avoid adding `gap=`, `padding=`, `alignItems=` unless there is a specific reason.
- **Keep components simple**: don't add `padding=` or `gap=` on `Card` or inner `VStack`/`HStack` unless the design requires it.
- **No `height=` on playground blocks** unless the content would overflow the viewport without it.
- **Reactive computed variables**: derive filtered data with `var.todoTasks="{allTasks.filter(t => t.status === 'todo')}"` on the `<Component>` tag rather than inlining arrow-function calls directly inside child attribute values (safer, more readable).
- **`id` is reserved**: Never use `id` as a user-defined component prop name. It is captured by the framework as the component reference (used for API access). Use descriptive names like `taskId`, `itemId`, `recordId` instead.
- **No `$param` / `$params` in event handlers**: These context variables do not exist in `on<EventName>` attribute handlers. Use arrow function syntax to receive the payload: `onDone="(taskId) => tasks = tasks.filter(t => t.id !== taskId)"`. `$param`/`$params` are only available inside `<event>` tags on built-in components like `APICall`.

---

### 64 · Create a reusable component

**Article file**: `create-a-reusable-component.md`

**Scenario**: A project dashboard renders the same task-card layout (title, priority chip, assignee, due date) in two separate panels — *My Tasks* and *All Tasks*. The markup is copy-pasted and starts to drift. Extract the repeated block into `TaskCard.xmlui`.

**Demo**:
- `---app` renders two hardcoded `<TaskCard>` instances side by side with different prop values (no API needed to keep the demo focused).
- `---comp TaskCard` wraps a `Card > VStack` with `Text` for title and assignee, a `Badge` for priority (color driven by expression on `$props.priority`), and a `Text` for the due date.
- Highlight lines on the `---comp` tab showing how `$props` is accessed.

**Key points to cover**:
1. **File placement and naming**: The file is `components/TaskCard.xmlui`; the component name must match the filename and start with an uppercase letter.
2. **Accessing props**: Use `$props.title`, `$props.priority`, etc. — `$props` is the only way to read caller-supplied values inside a user-defined component.
3. **Graceful missing props**: Use `$props.title ?? '(untitled)'` so the component renders safely even when a prop is omitted.
4. **Scope isolation**: Variables or IDs declared on a sibling built-in component in the parent are not visible inside `TaskCard` — they must be passed as props explicitly.
5. **Why extract**: Changing the card layout (e.g. adding a status icon) now only requires editing `TaskCard.xmlui` once.

**Mock API**: Not required. All data is hardcoded inline in `---app`.

---

### 65 · Pass a template slot to a component

**Article file**: `pass-a-template-slot-to-a-component.md`

**Scenario**: Managers need *Edit* and *Delete* buttons at the bottom of each `TaskCard`; regular employees only see a *Mark Done* button. Rather than forking `TaskCard` into two variants, add an `actionsTemplate` named slot so callers inject their own action row, while an empty footer is shown when no template is provided.

**Demo**:
- `---app` shows two `<TaskCard>` instances side by side. The first passes an `actionsTemplate` with *Edit* + *Delete* buttons. The second passes an `actionsTemplate` with just *Mark Done*. A third instance has no template, demonstrating the default content.
- `---comp TaskCard` contains `<Slot name="actionsTemplate">` at the bottom of the `Card`, with a default `<Text variant="secondary">No actions</Text>` inside the slot tag as fallback.
- Highlight the `<property name="actionsTemplate">` caller syntax.

**Key points to cover**:
1. **Naming rule**: Named slot names must end in `"Template"` (e.g. `actionsTemplate`, `headerTemplate`). XMLUI displays an error for non-conforming names.
2. **Caller syntax**: Declare slot content with `<property name="actionsTemplate">…children…</property>` inside the component tag.
3. **Default slot content**: Anything placed as a child of `<Slot>…</Slot>` in the component definition is rendered when the caller provides no template.
4. **Scope of slot content**: Template markup is evaluated in the *caller's* scope, not the component's scope. The caller can reference its own variables freely.
5. **Slot context variables**: The component can expose computed values back to the template via extra attributes on `<Slot>` (e.g. `<Slot name="actionsTemplate" taskId="{$props.id}" />`), which become `$taskId` inside the caller's template.
6. **Default (unnamed) slot**: Adding `<Slot />` (no name) transposees any direct children of the component tag — useful for wrapper components.

**Mock API**: Not required.

---

### 66 · Emit a custom event from a component

**Article file**: `emit-a-custom-event-from-a-component.md`

**Scenario**: A *Mark Done* button inside `TaskCard` must notify the parent so it can update its local task list immediately — without a full refetch and without the child holding a reference to the parent's state. The parent listens for the `statusChanged` event and removes the task from the list.

**Demo**:
- `---app` has `var.tasks="{[…]}"` (three sample tasks), renders `<Items data="{tasks}"><TaskCard … onStatusChanged="tasks = tasks.filter(t => t.id !== $params[0])" /></Items>`, and shows a count below.
- `---comp TaskCard` has a *Mark Done* button whose `onClick` fires `emitEvent('statusChanged', $props.id)`. The component also displays the task title and priority.
- Highlight how `onStatusChanged` on the caller maps to `emitEvent('statusChanged', …)` inside the component.

**Key points to cover**:
1. **`emitEvent(name, payload)`**: Call it anywhere inside a user-defined component (event handlers, scripts). The first argument is the event name; everything after it is passed as `$params` array (or `$param` for the first).
2. **`on<EventName>` attribute**: The parent listens via the `onStatusChanged` attribute (camel-cased name with `on` prefix). The handler is a normal XMLUI expression.
3. **Events flow up, not down**: The child emits, the parent decides what to do. The child never holds a reference to parent state.
4. **Payload options**: Pass a scalar (id), an object (`{id, newStatus}`), or nothing at all. Accessing the payload in the parent: `$param` for the first argument, `$params[1]` for subsequent ones.
5. **Multiple events**: A single component can emit different events for different actions (e.g. `statusChanged`, `deleted`, `edited`) — just call `emitEvent` with different names.

**Mock API**: Not required (purely local state manipulation).

---

### 67 · Set default property values

**Article file**: `set-default-property-values.md`

**Scenario**: A `PriorityBadge` component (reused inside `TaskCard` and standalone in a legend) accepts a `level` prop but also has optional `size`, `showIcon`, and `outlined` props. Most call sites only care about `level`. Defaults let callers skip the boilerplate.

**Demo**:
- `---app` shows four `<PriorityBadge>` instances:
  1. Only `level="high"` — all defaults in effect.
  2. `level="normal" size="lg"` — overrides size.
  3. `level="low" showIcon="{false}"` — suppresses icon.
  4. No props at all — shows the `??` fallback text `"(none)"`.
- `---comp PriorityBadge` accesses `$props.level ?? 'normal'`, `$props.size ?? 'sm'`, `$props.showIcon ?? true`, `$props.outlined ?? false`. Uses `Badge` with a `themeColor` expression.

**Key points to cover**:
1. **`??` (nullish coalescing) is the mechanism**: XMLUI has no `defaultProps` system for user-defined components. The only way to declare a default is `$props.x ?? defaultValue` in the component template.
2. **`??` vs `||`**: Use `??` not `||`. The value `false` or `0` is a valid caller-supplied boolean/number; `||` would incorrectly replace it with the default.
3. **Document defaults in the component**: Add a comment block near each `$props` access line; this doubles as the component's API documentation.
4. **Required props**: When a prop has no sensible default, let the expression fail visibly (omit the `??`) or add an explicit `when` guard rather than silently swallowing a bad state.
5. **Consistency**: Choose defaults that make the simplest call site work — the caller should never need to repeat the common case.

**Mock API**: Not required.

---

### 68 · Compose components with nesting

**Article file**: `compose-components-with-nesting.md`

**Scenario**: Build a three-column Kanban board by composing `TaskBoard > TaskColumn > TaskCard`. `TaskColumn` receives a `title`, a `themeColor`, and a `tasks` array; it renders a coloured header, an item count Badge, and a list of `TaskCard` items. `TaskBoard` hard-codes three `TaskColumn` instances (To Do / In Progress / Done), each filtered from the full task list.

**Demo**:
- `---app` renders `<TaskBoard />`.
- `---comp TaskBoard` declares `var.allTasks="{[…]}"` (six sample tasks, two per status). Renders an `HStack` with three `<TaskColumn>` instances, filtering `allTasks` for each status via an inline expression.
- `---comp TaskColumn` receives `$props.title`, `$props.themeColor`, `$props.tasks`. Renders a `VStack` with a colored header `HStack` (title + count `Badge`), then `<Items data="{$props.tasks}"><TaskCard title="{$item.title}" priority="{$item.priority}" assignee="{$item.assignee}" /></Items>`.
- `---comp TaskCard` (minimal version from article 64).
- Highlight how `$item` is used inside `TaskColumn` — not `$props.tasks[i]`.

**Key points to cover**:
1. **Passing arrays as props**: Use `tasks="{filteredArray}"` — the curly braces evaluate the expression to make it a real array, not a string.
2. **`$item` inside nested iteration**: When `TaskColumn` uses `<Items data="{$props.tasks}">`, the `$item` context refers to each task object in that array, not anything from an outer iteration.
3. **Scope isolation**: A variable declared in `TaskBoard` is invisible inside `TaskColumn` or `TaskCard`. Always pass needed data explicitly; use `Slot` when content should evaluate in the parent scope.
4. **Single responsibility**: Each component has one job — `TaskCard` renders one task, `TaskColumn` groups tasks under a label, `TaskBoard` assembles the layout. This keeps each file small and independently testable.
5. **Progressive enhancement**: Start with `TaskCard` alone (article 64), add `TaskColumn` to group it, then `TaskBoard` to orchestrate — each layer adds exactly one concern.
