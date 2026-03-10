# Use generated CSS styles for responsive layout

Currently, components turn layout properties into dynamic CSS classes. See these locations for more information:

- Layout property resolution: xmlui/src/components-core/theming/layout-resolver.ts, resolveLayoutProps
- Generating the dynamic CSS: xmlui/src/components-core/rendering/ComponentAdapter.tsx

When we declare a component, the dynamically generated CSS is passed to a component's renderer function in the className property lik in this sample (Avatar.tsx):

```typescript
export const avatarComponentRenderer = createComponentRenderer(
  COMP,
  AvatarMd,
  ({ node, extractValue, lookupEventHandler, className, extractResourceUrl }) => {
    return (
      <Avatar
        className={className}
        size={extractValue.asOptionalString(node.props?.size)}
        url={node.props.url ? extractResourceUrl(node.props.url) : undefined}
        name={extractValue(node.props.name)}
        onClick={lookupEventHandler("click")}
        onContextMenu={lookupEventHandler("contextMenu")}
      />
    );
  },
);
```

The current approcah has these two issues:
- no responsive CSS styles
- "parts" within components are not handled

## New layout CSS class generation

I want to move toward a new way of generating dynamic CSS classes:
- I want to generate multiple CSS classes for a components: a CSS class for the outermost DOM element, and multiple CSS classes to component parts.
- I want to generate responsive CSS classes that apply the style using media queries for the current viewport size.

Parts are named segments of the rendered DOM for a component. Use these files to better understand the part concept:

- xmlui/src/components/DateInput/DateInput.tsx, xmlui/src/components/DateInput/DateInputNative.tsx
- xmlui/src/components/Link/Link.tsx, xmlui/src/components/Link/LinkNative.tsx
- xmlui/src/components/RatingInput/RatingInput.tsx, xmlui/src/components/RatingInput/RatingInputNative.tsx

(There are many other components using parts.)

I have a function in xmlui/src/components-core/theming/parse-layout-props.ts (parseLayoutProperty) to parse a particular layout property name into a structure, which helps using them.

## Implementation Plan

### Implementation Flow (apply after every change)

1. **Lint check**: after modifying any file, verify there are no TypeScript/lint errors.
2. **New tests**: after creating unit or E2E tests, run them and fix any failures before proceeding.
3. **Full component suite**: after migrating a component and adding E2E tests for it, run the complete E2E test suite for that component to confirm no regressions.

### Design Decisions

- **Parallel operation**: `className` (existing) and `classes` (new) coexist. Components opt-in to `classes` one at a time.
- **`classes` shape**: `Record<string, string>` where keys are part names (`"-component"` for the outermost element, `"label"`, `"input"`, etc.) and values are CSS class names.
- **`"-component"` class** = same value as `className` initially, later contains responsive rules too.
- **Responsive CSS**: instead of the current JS-side breakpoint switch (`sizeIndex`), generate real `@media (min-width: …)` rules. `StyleRegistry._processNestedRule` already handles `@media` blocks, so no changes needed there.
- **Part-targeted props**: props like `fontSize-label-md` target a specific part at a specific breakpoint. Parsed via `parseLayoutProperty`.

### Breakpoint → media-query mapping (mobile-first)

| Breakpoint | min-width |
|---|---|
| xs | 0 (no query, base rule) |
| sm | 576px |
| md | 768px |
| lg | 992px |
| xl | 1200px |
| xxl | 1400px |

### Step 1 — Add `classes` to `RendererContext`

**Files**: `RendererDefs.ts`, `ComponentAdapter.tsx`

1. Add `classes?: Record<string, string>` to `RendererContext` in `RendererDefs.ts`.
2. In `ComponentAdapter.tsx`, initially set `classes: { "-component": className }` and pass it into `rendererContext`.

**Test**: existing tests pass; `classes["-component"]` equals `className`.

### Step 2 — Build the responsive layout class generator

**New file**: `theming/responsive-layout.ts`

Create a function:

```typescript
type ClassesMap = Record<string, string>; // partName → className

function resolveResponsiveClasses(
  allProps: Record<string, any>,        // all node.props (raw, evaluated)
  layoutContext: LayoutContext,
  descriptor: ComponentMetadata,        // for knowing declared parts
  themeDisableInlineStyle?: boolean,
): ClassesMap
```

**Logic**:

1. Iterate all keys in `allProps`. For each key, call `parseLayoutProperty(key)`.
   - Skip keys that return an error string (not a layout prop).
   - Skip keys parsed with a `component` field (those are theme-level overrides, not layout props).
2. Group the successful `ParsedLayout` results by `part` (default: `"-component"` when `part` is undefined).
3. For each part, group props by breakpoint (using `screenSizes`, default: no breakpoint = base rule).
4. Build a style object compatible with `useStyles`:
   ```typescript
   {
     "&": { /* base CSS props */ },
     "@media (min-width: 576px)": { "&": { /* sm props */ } },
     "@media (min-width: 768px)": { "&": { /* md props */ } },
     // …
   }
   ```
   Use `toCssPropertyName()` from `parse-layout-props.ts` to convert camelCase → kebab-case for CSS.
   Keep using `toCssVar()` from `layout-resolver.ts` for `$theme-var` substitution.
5. For each part, call `useStyles()` on the assembled style object → get a className.
6. Return the resulting `ClassesMap`.

**Responsive fallback semantics** (same as visibility, mobile-first):
- Base rule = no `@media` wrapper, applies at all widths.
- Breakpoint-specific rule uses `@media (min-width: Xpx)`.
- CSS cascade handles fallback automatically: a `sm` rule overrides `xs` when viewport ≥ 576px, etc. No JS-side switch needed.

**Test**: unit test in `tests/components-core/theming/responsive-layout.test.ts`. Verify:
- Simple prop → single base class.
- `fontSize-sm` → `@media (min-width: 576px)` containing `font-size`.
- `padding-label` → separate class for part `"label"`.
- `width-label-md` → part `"label"`, `@media (min-width: 768px)`, `width`.
- State suffixes (`--hover`) are parsed but not yet applied (future work).

### Step 3 — Collect all layout-related props in ComponentAdapter

**File**: `ComponentAdapter.tsx`

Currently, only base `layoutOptionKeys` are extracted from `safeNode.props`. Extended props (with breakpoint/part suffixes) are ignored.

1. After the existing `layoutOptionKeys.forEach(...)` loop, add a second pass: iterate all keys in `safeNode.props`, call `parseLayoutProperty(key)` on each. If it returns a valid `ParsedLayout` (not an error string) AND `(result.part || result.screenSizes)`, include it in a separate `extendedLayoutProps` map (evaluated via `valueExtractor`).
2. Pass `extendedLayoutProps` to `resolveResponsiveClasses()` (from Step 2).
3. Merge the result into `classes`:
   - `"-component"` value = `${className} ${responsiveClasses["-component"] ?? ""}`.
   - Other parts: pass through directly.

**Test**: pass a node with `fontSize-sm="14px"` and verify `classes["-component"]` contains a class with `@media (min-width: 576px) { font-size: 14px }`.

### Step 4 — Migrate a simple component to use `classes`

Pick a simple component like **Avatar** or **Text** that has no parts.

1. In the renderer function, destructure `classes` from the context.
2. Replace `className={className}` with `className={classes?.["-component"] ?? className}`.
3. Verify nothing changes visually (since `classes["-component"]` starts equal to `className`).

**Test**: E2E for the chosen component still passes. Add a unit test verifying responsive prop produces correct CSS.

### Step 5 — Migrate a component with parts

Pick a component like **DateInput** (has parts: `day`, `month`, `year`, `clearButton`).

1. In the renderer, destructure `classes`.
2. Apply `classes["-component"]` on the outermost DOM element.
3. For each part, apply `classes["day"]`, `classes["month"]`, etc. alongside the existing SCSS module classes.
4. In the native component, accept the `classes` prop and merge part classes onto the corresponding `<Part>` wrapper or DOM element.

**Test**: E2E for DateInput still passes. Add a test with `fontSize-day-md="18px"` verifying the class is applied to the `day` part.

### Step 6 — Deprecation path for old responsive logic

Once several components are migrated:

1. The JS-side breakpoint switch in `transformLayoutValue` (layout-resolver.ts) becomes unnecessary for migrated components. Keep it for non-migrated components.
2. Optionally add a `useResponsiveClasses` flag to component metadata. When `true`, ComponentAdapter uses `resolveResponsiveClasses` for that component; when `false`, falls back to the current `resolveLayoutProps`.
3. Migrate remaining components incrementally.

### File change summary

| File | Change |
|---|---|
| `RendererDefs.ts` | Add `classes?: Record<string, string>` |
| `ComponentAdapter.tsx` | Collect extended layout props, call resolver, pass `classes` |
| `theming/responsive-layout.ts` (**new**) | `resolveResponsiveClasses()` |
| `theming/parse-layout-props.ts` | No changes (already complete) |
| `theming/layout-resolver.ts` | No changes (parallel operation) |
| `theming/StyleRegistry.ts` | No changes (`@media` already supported) |
| Per-component `*.tsx` | Opt-in: use `classes` instead of / alongside `className` |
| `tests/…/responsive-layout.test.ts` (**new**) | Unit tests for resolver |

---

## Migration Learnings (from Spinner)

### Native component API convention

Keep **both** `classes` and `className` in the native component's prop type:

```typescript
type Props = {
  classes?: Record<string, string>;
  className?: string;  // kept for VariantBehavior compatibility
  // ...
};
```

Apply them merged in the `classnames()` call on the root element:

```typescript
classnames(styles["base-class"], classes?.[COMPONENT_PART_KEY], className)
```

**Why `className` must stay**: `VariantBehavior` (and potentially other behaviors) uses `cloneElement(renderedNode, { className: variantClass })`. If the native component drops `className`, the injected class goes into `...rest` but is then immediately overridden by the explicit `className={classnames(...)}` in JSX — so the variant styling silently disappears. Keeping `className` in the signature and forwarding it preserves behavior-injected classes.

### Renderer function: drop `className`, use `classes` directly

```typescript
({ node, classes, extractValue }) => {
  return <NativeComp classes={classes} ... />;
}
```

No need for `className?.[COMPONENT_PART_KEY] ?? className` — `classes` already contains the full merged class (theme + layout + responsive) under the `COMPONENT_PART_KEY` key, computed by `ComponentAdapter`.

### ThemedComp wrapper: build `classes` from themeClass + incoming `className`

```typescript
type ThemedProps = Omit<React.ComponentProps<typeof NativeComp>, "classes"> & { className?: string };
export const ThemedComp = React.forwardRef<HTMLDivElement, ThemedProps>(
  function ThemedComp({ className, ...props }, ref) {
    const themeClass = useComponentThemeClass(CompMd);
    const combinedClass = [themeClass, className].filter(Boolean).join(" ");
    return <NativeComp {...props} classes={{ [COMPONENT_PART_KEY]: combinedClass }} ref={ref} />;
  },
);
```

### CSS injection order matters

`useStyles` injects a `<style>` tag the **first time** a style object is seen. Tags injected later have higher source order (win ties in CSS cascade). For responsive overrides to win over base rules, the responsive `useStyles` call in `ComponentAdapter` must come **after** `useComponentStyle` and `useComponentThemeClass`.

### COMPONENT_PART_KEY = `"-component"`

Import from `../../components-core/theming/responsive-layout` in both the native component file and the renderer file.

---

## Recommended Components for Migration

### Step 4 — Simple components (no parts)

#### 1. Spinner
- **Props**: 2 (delay, fullScreen)
- **Current className usage**: Simple `classnames(className, ...)` merge
- **Migration**: Swap `className` → `classes?.["-component"] ?? className`
- **Why first**: Minimal surface, cleanest test case

#### 2. Avatar
- **Props**: 3 (size, name, url)
- **Current className usage**: `classnames(className, styles.container, size classes, ...)`
- **Migration**: Same swap; test responsive layout props (e.g., `width-md`, `height-lg`)
- **Why second**: Small, real visual component; exercises responsive props

#### 3. Badge
- **Props**: 5+ (children, variant, color, colorMap, onContextMenu)
- **Current className usage**: `classnames({ variant styles }, className)`
- **Migration**: Same swap; verify variant-conditional SCSS still composes correctly
- **Why third**: Slightly richer, validates that old SCSS + new classes can coexist

### Step 5 — Components with parts

#### 1. RatingInput
- **Parts**: 1 (`input`)
- **Props**: ~12 (initialValue, maxRating, validationStatus, etc.)
- **Part usage**: Single `<Part partId={PART_INPUT}>` wrapping star buttons
- **Migration**: 
  - Accept `classes` in native component
  - Apply `classes["-component"]` on outer container
  - Apply `classes["input"]` on the `<Part>` wrapper
- **Why first**: Single part = simplest introduction to part targeting

#### 2. Checkbox
- **Parts**: 2 (`label`, `input`)
- **Props**: ~10 (initialValue, indeterminate, required, etc.)
- **Special**: Single-file component; delegates rendering to Toggle but maintains own parts metadata
- **Migration**:
  - Thread `classes` through to underlying Toggle component
  - Apply part classes for `label` and `input`
- **Why second**: Two parts; tests part delegation pattern

#### 3. TextBox
- **Parts**: 4 (`label`, `startAdornment`, `endAdornment`, `input`) + validation feedback
- **Props**: 20+ (placeholder, initialValue, startIcon, endIcon, showPasswordToggle, etc.)
- **Part usage**: Multiple `<Part>` wrappers for adornments, input, feedback sections
- **Migration**:
  - Accept `classes` in native component
  - Apply per-part classes for each `<Part partId={...}>` alongside SCSS module classes
  - Test that responsive part-targeted props (e.g., `fontSize-label-md`) work
- **Why third**: Complex multi-part validation; confirms the system scales

---

## Component Migration Inventory

### Category 1 — Already migrated to `classes`

| Component | Parts | Notes |
|---|---|---|
| Avatar | — | Simple component, no parts |
| Badge | — | Simple component, no parts |
| Spinner | — | Simple component, no parts |
| Checkbox | label, input | Delegates to Toggle; `classes` threaded through |
| Switch | label, input | Delegates to Toggle; `classes` threaded through |
| RatingInput | input | Single part; root div IS the input part |
| TextBox | label, startAdornment, endAdornment, input | Multi-part; ThemedTextBox merges theme class into `classes` |
| Backdrop | — | Simple overlay |
| Blog | — | `classes` merged into className passed to sub-views |
| Br | — | No native component; `classes` applied directly on `<br>` |
| ContentSeparator | — | Simple divider |
| Column | — | Passes `classes?.[COMPONENT_PART_KEY]` as className to column metadata |
| FlowLayout | — | ThemedFlowLayout merges theme class into `classes`; native Scroller gets merged className |
| Footer | — | Renderer merges `layoutContext.themeClassName` into `classes[COMPONENT_PART_KEY]` |
| HtmlTags | — | Bulk-migrated; all deprecated HTML tag renderers use `classes?.[COMPONENT_PART_KEY]` |
| IFrame | — | Simple element; `classes?.[COMPONENT_PART_KEY]` merged on `<iframe>` |
| Icon | — | `ThemedIcon` merges theme class + `classes[COMPONENT_PART_KEY]` into className on `<Icon>` |
| Image | — | `ThemedImage` merges theme class + `classes[COMPONENT_PART_KEY]` into className on `<Image>` |
| InspectButton | — | Renderer passes `classes?.[COMPONENT_PART_KEY]` as className to `<InspectButton>` |
| List | — | `classes` passed to ListNative; `classes?.[COMPONENT_PART_KEY]` merged on root div |
| Logo | — | `classes?.[COMPONENT_PART_KEY]` forwarded as className to LogoNative/Image |
| Option | — | `classes?.[COMPONENT_PART_KEY]` passed as className to OptionNative |
| Pages | — | `classes` passed to RouteWrapper; `classes?.[COMPONENT_PART_KEY]` merged on page root div |
| QRCode | — | `classes` passed to QRCodeNative; `classes?.[COMPONENT_PART_KEY]` merged on container div |
| ResponsiveBar | — | `classes` passed to ResponsiveBarNative; `classes?.[COMPONENT_PART_KEY]` merged on root div |
| ScrollViewer | — | `classes` passed to ScrollViewerNative; `classes?.[COMPONENT_PART_KEY]` merged on root element in both render paths |
| SpaceFiller | — | Native accepts `classes`/`className` for VariantBehavior compat; renderer intentionally ignores layout props (preserves flex-grow-spacer behavior) |
| Stack | — | `classes` passed through `RenderStackPars` helper; `classes?.[COMPONENT_PART_KEY]` merged on StackNative root; all 5 renderers (Stack, VStack, HStack, CVStack, CHStack) updated |
| StickyBox | — | `classes` passed to StickyBoxNative; `classes?.[COMPONENT_PART_KEY]` merged into `wrapperClassName` |
| StickySection | — | `classes` passed to StickySectionNative; `classes?.[COMPONENT_PART_KEY]` merged on root div |
| ToneSwitch | — | `classes` passed to ToneSwitchNative; `classes?.[COMPONENT_PART_KEY]` merged on root div |
| Accordion | — | `classes` passed to AccordionNative; `classes?.[COMPONENT_PART_KEY]` merged on RAccordion.Root |
| AccordionItem | — | `classes` passed to AccordionItemNative; `classes?.[COMPONENT_PART_KEY]` merged on RAccordion.Item |
| App | — | `classes` passed to App (AppNative); `classes?.[COMPONENT_PART_KEY]` added to `wrapperBaseClasses` |
| AppHeader | — | `classes` passed through `AppContextAwareAppHeader` → `AppHeader`; `classes?.[COMPONENT_PART_KEY]` merged on root div; `layoutContext?.themeClassName` kept as `className` |
| AutoComplete | — | `classes` passed to AutoComplete; `classes?.[COMPONENT_PART_KEY]` merged on root trigger div |
| Carousel | — | `classes` passed to CarouselComponent; `classes?.[COMPONENT_PART_KEY]` merged on root div |
| DatePicker | — | `classes` passed to DatePicker; `classes?.[COMPONENT_PART_KEY]` merged on both inline root and PopoverTrigger className |
| Drawer | — | `classes` passed to DrawerNative; `classes?.[COMPONENT_PART_KEY]` added to portal container className and Dialog.Content classnames |
| FormItem | — | `classes` passed to FormItem; `classnames` import added to FormItemNative; `classes?.[COMPONENT_PART_KEY]` merged on ItemWithLabel root |
| Heading | — | `classes` passed through renderHeading helper to Heading; all 7 renderers (Heading, H1–H6) updated; `classes?.[COMPONENT_PART_KEY]` merged on root heading element |
| Markdown | — | `classes` propagated renderer → TransformedMarkdown → Markdown native; `classes?.[COMPONENT_PART_KEY]` merged on root div |
| NoResult | — | `classes` passed to NoResult; `classes?.[COMPONENT_PART_KEY]` merged on root div |
| NavGroup | — | `classes` passed to NavGroup; `classes?.[COMPONENT_PART_KEY]` merged on root div of ExpandableNavGroup (DropDownNavGroup has no className) |
| ProgressBar | — | `classes` passed to ProgressBar; `classes?.[COMPONENT_PART_KEY]` merged on wrapper div |
| Tabs | — | `classes` passed to Tabs; `classes?.[COMPONENT_PART_KEY]` merged on root element in both accordion and standard views |
| TabItem | — | `classes` passed to TabItemComponent; `classes?.[COMPONENT_PART_KEY]` merged with tabsContent on Content root; `classes?` added to shared `Tab` type in abstractions.ts |
| Text | — | `classes` passed to Text; `classes?.[COMPONENT_PART_KEY]` merged on root element classnames |
| Tooltip | — | `classes` passed to Tooltip; `classes?.[COMPONENT_PART_KEY]` merged on RadixTooltip.Content root |
| Tree | — | `classes` passed to TreeComponent; `classes?.[COMPONENT_PART_KEY]` merged on Scroller (root wrapper) |
| TreeDisplay | — | `classes` passed to TreeDisplay; `classes?.[COMPONENT_PART_KEY]` merged on root div |
| DateInput | day, month, year, clearButton, conciseValidationFeedback | `classes` passed to DateInput; `classes?.[COMPONENT_PART_KEY]` merged on root wrapper div |
| ExpandableItem | summary, content | `classes` passed to ExpandableItem; `classes?.[COMPONENT_PART_KEY]` merged on root div |
| Form | buttonRow, validationSummary | `classes` passed through FormWithContextVar → Form; `classes?.[COMPONENT_PART_KEY]` merged on root `<form>` element |
| Link | icon | `classes` passed to LinkNative; `classes?.[COMPONENT_PART_KEY]` merged on root Node element |
| ModalDialog | content, title | `classes` passed to ModalDialog; `classes?.[COMPONENT_PART_KEY]` merged on Dialog.Content root |
| NavPanel | footer | `classes` passed through NavPanelWithBuiltNavHierarchy → NavPanel; `classes?.[COMPONENT_PART_KEY]` merged on root div in both NavPanel and DrawerNavPanel; `classnames` import removed from renderer |
| NumberBox | label, startAdornment, endAdornment, input, spinnerButtonUp, spinnerButtonDown | `classes` passed to NumberBox; `classes?.[COMPONENT_PART_KEY]` merged on root div |

### Category 4 — To migrate. Has parts, parts are used (`<Part>`) in native component

| Component | Parts | `<Part>` count in native |
|---|---|---|
| Pagination | buttonRow, pageInfo, pageSizeSelector | 3 |
| Select | clearButton, item, menu | 3 |
| Table | table, pagination | 1 |
| TextArea | label, startAdornment, endAdornment, input | 4 |
| TimeInput | hour, minute, second, ampm, clearButton | 5 |

### Category 5 — To migrate. Has parts declared but NOT used (`<Part>`) in native component

| Component | Declared parts | Notes |
|---|---|---|
| Button | icon | Icon rendered directly, no `<Part>` wrapper |
| Card | avatar, title, subtitle | Multi-element but no `<Part>` wrappers |
| CodeBlock | header, content | Sections rendered without `<Part>` |
| ContextMenu | content | No `<Part>` in native |
| DropdownMenu | content | No `<Part>` in native |
| FileInput | label, input | No `<Part>` in native |
| NavLink | indicator | No `<Part>` in native |
| RadioGroup | label | No `<Part>` in native |
| Slider | label, track, thumb | No `<Part>` in native |
| Splitter | primaryPanel, secondaryPanel | No `<Part>` in native |

### Non-visual / data-only components (no migration needed)

These components do not render visible DOM or do not accept `className`. They do not need `classes` migration:

APICall, AppState, Bookmark, Breakout, CarouselItem, ChangeListener, Fragment, HoverCard, IncludeMarkup, Items, LabelList, Legend, MessageListener, NestedApp, AppWithCodeView, NavPanelCollapseButton, PageMetaTitle, ProfileMenu, Queue, RadioItem, RealTimeAdapter, Redirect, SelectionStore, Theme, Timer, Toast, ToneChangerButton, FormSection
