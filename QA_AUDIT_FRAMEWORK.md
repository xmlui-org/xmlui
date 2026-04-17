# XMLUI Component QA Audit Framework
**Consolidated Reference** — sections 1–9 of the QA checklist + critical absolute rules for component review

---

## 🚨 CRITICAL ABSOLUTE RULES (Hard Prohibitions)

These violations **must be fixed** on every review. No exceptions.

### 1. **Never set `displayName` on components**
- Hard prohibition on directly-declared components
- Also applies to components created by factory functions (e.g., `createSlot`, `createPart`): remove any `Slot.displayName = ...` inside the factory
- **Fix:** Delete all `displayName` assignments

### 2. **Never use `useImperativeHandle`**
- Register APIs via `registerComponentApi` instead
- **Fix:** Convert to `registerComponentApi` callback pattern (see Section 4 pattern below)

### 3. **Event handler props MUST NOT be in `defaultProps`**
- Event handlers like `onReady`, `onClick`, `onKeyDown` should default directly in destructuring to `noop`/`undefined`, not in `defaultProps`
- Reason: `defaultProps` is consumed by the metadata system and must only contain user-visible prop values
- **Fix:** Move event handler defaults to function parameter destructuring

### 4. **Never call `composeRefs(...)` in render or with guards**
- Violates stable hook pattern
- **Fix:** Use `const composedRef = useComposedRefs(ref, innerRef)` instead (always stable, handles null internally)

### 5. **Never use `as any` in TypeScript**
- **Fix:** Use `as unknown as T` when unavoidable; `any` in type-guard params → `unknown`

### 6. **Every event in `createMetadata` must have a corresponding renderer entry**
- Metadata declares `events: { didChange: ... }` but renderer's `wrapComponent({ events: { didChange: "onDidChange" } })` is missing → event fires but never wires to prop
- **Fix:** Add event mapping to `wrapComponent` config's `events` object

---

## The 9 QA Checklist Sections

### **SECTION 1: File Structure**

**Checklist items:**
- [ ] No `index.ts` in component folders (exception: `Input/index.ts` is known violation)
- [ ] Implementation file named `*React.tsx`, not `*Native.tsx`
  - Before renaming: grep `xmlui/src/` for **all** importers (not just co-located metadata) and update each
- [ ] Simple non-visual components may use single file; use dual-file pattern for meaningful React logic

**Key rules:**
- Component folders contain: metadata file (`ComponentName.tsx`), native file (`ComponentNameReact.tsx` or `ComponentNameNative.tsx`), optional SCSS
- No package.json, example files, or loose JS utilities in component folder
- Never create `index.ts` to re-export — creates ambiguity with dual-file imports

---

### **SECTION 2: Metadata (`createMetadata`)**

**Checklist items:**
- [ ] All props, events, APIs, contextVars, themeVars declared in `createMetadata`
- [ ] Prop field keys correct: `type`, `description`, `defaultValue`, `availableValues` (NOT `valueType` — silently ignored)
- [ ] `defaultValue` references `defaultProps.<prop>` — never a literal
- [ ] Event helper keys match strings passed to `lookupEventHandler(...)` in renderer
- [ ] `label` declared in `props` when component renders its own label (prevents behavior double-wrapping)
- [ ] `nonVisual: true` + no SCSS/themeVars for non-visual components
- [ ] `themeVars: parseScssVar(styles.themeVars)` present for all visual components
- [ ] `parts` declared for multi-element components; `defaultPart` points to layout-receiving element
- [ ] Every part rendered with `<Part partId={PART_*}>` appears in `parts` metadata

**Critical integration:**
- Metadata's `valueType` field **must** be set accurately for `wrapComponent` auto-detection to work
- Use helper functions: `d()` (generic), `dClick()`, `dInit()`, `dGotFocus()`, `dLostFocus()`, `dContextMenu()` for common events
- Template properties use `valueType: "ComponentDef"` (converted to render-prop callbacks)

---

### **SECTION 3: Renderer**

**Checklist items:**
- [ ] No React hooks inside renderer functions (plain factory functions, not components)
- [ ] All prop values extracted via `extractValue.*` helpers — never raw `node.props.foo`
- [ ] Pass `classes` (not `className`) to native components; `className` is legacy VariantBehavior only
- [ ] `state`/`updateState` forwarded when component exposes reactive bindings
- [ ] `registerComponentApi` forwarded when imperative APIs documented
- [ ] Event handlers use `lookupEventHandler("key")` matching metadata key exactly
- [ ] Every event in metadata has renderer `events` entry (e.g., `didChange: "onDidChange"`)
- [ ] Children rendered via `renderChild(node.children)`
- [ ] Void elements (`<br>`, `<img>`, `<input>`) never pass `renderChild(node.children)` inside

**Integration patterns:**

**Pattern 1: createComponentRenderer (baseline)**
```typescript
const componentNameComponentRenderer = createComponentRenderer(
  "ComponentName",
  ComponentNameMd,
  ({ node, extractValue, state, updateState, renderChild,
     lookupEventHandler, registerComponentApi, classes }) => {
    return (
      <ComponentNameNative
        label={extractValue.asDisplayText(node.props.label)}
        value={state.value}
        updateState={updateState}
        registerComponentApi={registerComponentApi}
        onClick={lookupEventHandler("click")}
        classes={classes}
      >
        {renderChild(node.children)}
      </ComponentNameNative>
    );
  },
);
```

**Pattern 2: wrapComponent (preferred, ~90% of cases)**
```typescript
const componentNameComponentRenderer = wrapComponent(
  "ComponentName",
  ComponentNameNative,
  ComponentNameMd,
  {
    events: ["click", "gotFocus"],      // auto-detected from metadata; explicit override available
    exposeRegisterApi: true,             // pass registerComponentApi to native
    resourceUrls: ["src"],               // extract via extractResourceUrl
    renderers: {
      optionTemplate: {
        contextVars: ["$item"],
      },
    },
  },
);
```

**extractValue methods:**
- `extractValue(expr)` — raw value
- `extractValue.asString(expr)` — coerce to string; throws if undefined
- `extractValue.asDisplayText(expr)` — string for display, collapses spaces
- `extractValue.asOptionalString(expr, def?)` — string or default
- `extractValue.asNumber(expr)` / `asOptionalNumber(expr, def?)`
- `extractValue.asBoolean(expr)` / `asOptionalBoolean(expr, def?)`
- `extractValue.asSize(expr)` — CSS size, resolves theme vars

---

### **SECTION 4: Native Component**

**Checklist items (Structure):**
- [ ] Wrapped with `memo(forwardRef(function ComponentName(...) { ... }))` — both required
- [ ] Non-visual components: `memo(function Name(...))` only (no `forwardRef` for null output)
- [ ] NO `displayName` setting (absolute rule)
- [ ] NO `useImperativeHandle` (absolute rule)
- [ ] `defaultProps` exported as const; destructuring defaults reference it
- [ ] Event handler props **NOT** in `defaultProps`
- [ ] Void elements self-closing; no children

**Checklist items (Refs):**
- [ ] Forwarded `ref` connected to root DOM element
- [ ] When both forwarded + internal refs needed: `const composedRef = useComposedRefs(ref, innerRef)` (stable hook)
- [ ] `forwardRef` callback param: `ForwardedRef<T>` (not `Ref<T>` or `Ref<any>`)
- [ ] `useRef<T>` type matches actual rendered element
- [ ] ThemedFoo wrapper ref union type when element varies: `forwardRef<HTMLImageElement | HTMLDivElement>`

**Checklist items (Props interface):**
- [ ] `Props extends React.HTMLAttributes<HTMLElement>` (or element-specific base)
- [ ] When narrowing HTML attr to component-specific union: `Omit<HTMLAttributes, "type"> & { type?: ButtonType }`
- [ ] Also `Omit` any HTML attribute aliased under different prop name (e.g., `formId` aliasing `form`)
- [ ] `{...rest}` spread **before** internal props (so internal handlers like `onKeyDown` take precedence)
- [ ] Infrastructure props (`updateState?`, `registerComponentApi?`) typed optional
- [ ] No dead props (declared but unused); check `defaultProps` for orphaned keys
- [ ] After Props refactor, remove orphaned type imports

**Checklist items (classnames):**
- [ ] Root `className` built: `classnames(styles.foo, classes?.[COMPONENT_PART_KEY], className)`
- [ ] Use `COMPONENT_PART_KEY` constant (never raw string `"-component"`)
- [ ] Part containers: `<Part partId={PART_*}>` for `[data-part-id]` selectors in tests

**Checklist items (State & Effects):**
- [ ] `useMemo(() => value, [value])` — no-op, remove it
- [ ] `useCallback` inlined; factory pattern `useCallback(() => (e) => {...}, [])` defeats memoization
- [ ] `registerComponentApi` callbacks extracted to individual `useCallback` **before** effect, listed in deps
- [ ] Lodash `debounce`/`throttle` cancelled in cleanup: `useEffect(() => () => fn.cancel?.(), [fn])`
- [ ] Every resource-acquiring effect (`subscription`, `timeout`, `interval`) returns cleanup function
- [ ] Deps arrays complete; no stale closures
- [ ] No variable shadowing (e.g., don't name `setTimeout` return `id` when `id` is a prop)
- [ ] `updateState` called when public value changes
- [ ] External prop → local state sync uses ref guard to prevent loops
- [ ] Never mutate setState callback object: `setItems(prev => new Set([...prev, x]))` not `prev.add(x); return prev`
- [ ] Keyboard handlers use runtime element order (`findIndex` on refs), not hard-coded field sequences
- [ ] Pure constants and utilities at module scope, not inside component body

**Native component pattern:**
```typescript
export const defaultProps = {
  enabled: true,
  variant: "primary" as const,
};

export const ComponentNameNative = memo(forwardRef<HTMLDivElement, Props>(
  function ComponentNameNative(
    { label, enabled = defaultProps.enabled, updateState, registerComponentApi,
      style, className, classes, ...rest },
    ref,
  ) {
    const innerRef = useRef<HTMLDivElement>(null);
    const composedRef = useComposedRefs(ref, innerRef);  // ✅ stable hook

    useEffect(() => {
      registerComponentApi?.({
        focus: () => innerRef.current?.focus(),
      });
    }, [registerComponentApi]);

    return (
      <div
        ref={composedRef}
        className={classnames(styles.component, classes?.[COMPONENT_PART_KEY], className)}
        style={style}
        {...rest}
      >
        {label && <label>{label}</label>}
      </div>
    );
  },
));
ComponentNameNative.displayName; // ❌ DELETE THIS LINE
```

---

### **SECTION 5: SCSS / Theming**

**Checklist items:**
- [ ] Every themed property uses `createThemeVar(...)` — no hardcoded values
- [ ] Variable names follow: `property-ComponentName`, `property-ComponentName-Variant`, `property-ComponentName--State`
- [ ] `:export { themeVars: t.json-stringify($themeVars); }` at bottom of every SCSS module
- [ ] `defaultThemeVars` in metadata covers every SCSS variable
- [ ] No duplicate `$themeVars: t.composeFooVars(...)` calls — each compose function called once
- [ ] Sub-element `:focus` uses element-scoped variables (e.g. `$outlineColor-button-Foo--focused`), not component-root variable
- [ ] Duplicate layout CSS across variant classes extracted to shared base class

**Theme variable naming convention:**
```
property[-partNameOrScreenSize][-ComponentName][-variantName][--stateName][--stateName2]
```

| Position | Case | Example |
|----------|------|---------|
| property | camelCase (lowercase start) | `backgroundColor`, `fontSize`, `borderColor` |
| partName or screenSize | camelCase or xs/sm/md/lg/xl | `label` part, `sm` screen size |
| ComponentName | PascalCase (uppercase start) | `Button`, `TextBox`, `Input` |
| variantName | camelCase | `primary`, `secondary`, `ghost` |
| stateName (after `--`) | camelCase, repeatable | `focus`, `hover`, `focus--hover` |

**Examples:**
- `backgroundColor-Button` — property + component
- `fontSize-sm-Text` — property + screenSize + component
- `backgroundColor-label-Button` — property + part + component
- `backgroundColor-Button-primary` — property + component + variant
- `borderColor-Input--focus` — property + component + state
- `backgroundColor-Button-primary--hover` — full pattern

**SCSS boilerplate:**
```scss
@use "../../components-core/theming/themes" as t;

$themeVars: ();
@function createThemeVar($v) {
  $themeVars: t.appendThemeVar($themeVars, $v) !global;
  @return t.getThemeVar($themeVars, $v);
}

$backgroundColor-Foo: createThemeVar("backgroundColor-Foo");
$textColor-Foo:       createThemeVar("textColor-Foo");

.component { 
  background-color: $backgroundColor-Foo; 
  color: $textColor-Foo; 
}

:export { 
  themeVars: t.json-stringify($themeVars);  // ← MANDATORY
}
```

**In metadata:**
```typescript
themeVars: parseScssVar(styles.themeVars),
defaultThemeVars: {
  "backgroundColor-Foo": "transparent",
  "textColor-Foo":       "$textColor",
},
```

---

### **SECTION 6: Parts & Accessibility**

**Checklist items:**
- [ ] `PART_*` constants in `components-core/parts.ts` — import everywhere (component, driver, tests); never redeclare locally
- [ ] Remove dead IE/legacy-browser checks (`isIEOrEdgeLegacy`, UA sniffing)
- [ ] Interactive elements have correct ARIA roles or semantic HTML
- [ ] `aria-disabled={!enabled}` set on disabled elements
- [ ] `aria-label` present for icon-only controls
- [ ] Keyboard navigation complete: Enter/Space (activate), Escape (dismiss), arrows (group navigation)

**Accessibility patterns:**

**Icon-only button:**
```tsx
<button aria-label="Close dialog">
  <Icon name="close" aria-hidden="true" />
</button>
```

**Expandable item (required attributes):**
```html
<div role="button"
     aria-expanded="false|true"
     aria-controls="content-region-id"
     aria-disabled="false|true"
     tabindex="0">
  Summary
</div>
<div role="region" id="content-region-id" aria-labelledby="trigger-id">
  ...content...
</div>
```

**Form input (with label + hint):**
```html
<label for="email-input">Email</label>
<input id="email-input" type="email" aria-describedby="email-hint" />
<span id="email-hint">Enter your work email</span>
```

**Modal dialog:**
```html
<div role="dialog" aria-modal="true" aria-labelledby="modal-title">
  <h2 id="modal-title">Confirm deletion</h2>
  ...
</div>
```

**Keyboard navigation matrix:**

| Component | Tab | Arrow | Enter/Space | Escape |
|-----------|-----|-------|-------------|--------|
| Button | ✓ | — | Activate | — |
| TextBox | ✓ | — | — | — |
| Select/Combobox | ✓ | Navigate options | Open/select | Close |
| RadioGroup | ✓ (to group) | Navigate within | — | — |
| Tabs | ✓ (to selected) | Navigate tabs | — | — |
| ExpandableItem | ✓ | — | Toggle | — |
| Modal | trapped | — | — | Close |
| Menu/Dropdown | ✓ | Navigate items | Activate | Close |

**Minimum touch target:** 44×44px (WCAG 2.1 mobile); pointer-only: 24×24px  
**Color contrast:** ≥ 4.5:1 for text; 3:1 for large text and UI components

---

### **SECTION 7: E2E Tests**

**Checklist items:**
- [ ] Test file co-located in component folder; import from `../../testing/fixtures`
- [ ] Tests grouped with `test.describe`: Basic Functionality, Accessibility, Theme Variables, Behaviors and Parts, Edge Cases
- [ ] Event assertions use `testState` + `expect.poll` — never synchronous after user interaction
- [ ] Keyboard tests verify `toBeFocused()` before pressing keys
- [ ] `await expect(element).toBeVisible()` before clicking
- [ ] Semantic locators preferred: `getByRole`, `getByLabel`, `getByTestId` (last resort)
- [ ] Theme variable tests use exact `rgb(...)` values
- [ ] No `async`/`await` or `new` in XMLUI script strings; use `delay(ms)` not `setTimeout`
- [ ] Template props use `<property name="...">` wrapper
- [ ] Component drivers used for complex components (Select, Table, DatePicker)

**Test structure:**
```typescript
import { test, expect } from "../../testing/fixtures";
import { SKIP_REASON } from "../../testing/skip-reasons";

test.describe("ComponentName", () => {
  test.describe("Basic Functionality", () => { ... });
  test.describe("Accessibility", () => { ... });
  test.describe("Theme Variables", () => { ... });     // if component has theme vars
  test.describe("Behaviors and Parts", () => { ... }); // if applicable
  test.describe("Other Edge Cases", () => { ... });
});
```

**Event testing pattern:**
```typescript
test("fires onClick when clicked", async ({ initTestBed, page }) => {
  const { testStateDriver } = await initTestBed(`
    <Button onClick="testState = 'clicked'"/>
  `);
  await page.getByRole("button").click();
  await expect.poll(testStateDriver.testState).toEqual("clicked");  // poll, not synchronous
});
```

**Keyboard navigation pattern:**
```typescript
const button = page.getByRole("button");
await button.focus();
await expect(button).toBeFocused();  // ✅ ALWAYS verify focus before pressing
await page.keyboard.press("Enter");
```

**XMLUI scripting constraints:**
- ❌ No `new` operator → use `throw "error"` not `throw new Error("...")`
- ❌ No `async`/`await` → XMLUI handles async automatically
- ❌ No `Promise` chains → use `delay(ms)` for pauses
- ✅ Template properties require wrapper: `<property name="..."><Button/></property>`

**Parallel execution check:**
```bash
# Development (single worker, faster iteration)
npx playwright test ComponentName.spec.ts --workers=1 --reporter=line

# Stability check (high parallelism)
npx playwright test ComponentName.spec.ts --workers=10
```
Tests passing at `--workers=1` but failing at `--workers=10` usually indicate missing `toBeFocused()` or `toBeVisible()` waits.

---

### **SECTION 8: Types & Linting**

**Checklist items:**
- [ ] No TypeScript errors after any change
- [ ] No duplicate import declarations (tsc ignores but Vite Babel pre-transform fails)
- [ ] No `as any` — use `as unknown as T` when unavoidable
- [ ] Ref on `forwardRef` callback: `ForwardedRef<T>` not `Ref<T>` or `Ref<any>`
- [ ] Inline `style={{ ... }}` in memo component → `useMemo(() => ({ ... }), [deps])`
- [ ] Shared event handlers typed via `HTMLElement` base when element type varies
- [ ] `children?: ReactNode` (not `ReactNode | ReactNode[]`)
- [ ] No JSDoc block comments on exports — descriptions belong in `createMetadata`
- [ ] Expanded identifier names (not `abbrevName`, `calcFs`)

**Type patterns:**

**forwardRef parameter — correct vs. incorrect:**
```typescript
// ✅ CORRECT
export const ComponentNameNative = memo(forwardRef<HTMLDivElement, Props>(
  function ComponentNameNative(props, ref: ForwardedRef<HTMLDivElement>) { ... }
));

// ❌ INCORRECT
function ComponentNameNative(props, ref: Ref<HTMLDivElement>) { ... }
function ComponentNameNative(props, ref: Ref<any>) { ... }
```

**Props extending HTML base:**
```typescript
// ✅ CORRECT — extends base, inherits style/className/children/events
interface Props extends React.HTMLAttributes<HTMLDivElement> {
  customProp?: string;
}

// ❌ INCORRECT — redundant re-declaration
interface Props extends React.HTMLAttributes<HTMLDivElement> {
  style?: React.CSSProperties;
  className?: string;
  children?: ReactNode;
}
```

**Omit when narrowing HTML attribute:**
```typescript
// ✅ CORRECT
type ButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type"> & {
  type?: "submit" | "reset" | "button";
};

// ❌ INCORRECT — Pick re-declares what base provides
type ButtonProps = Pick<ButtonHTMLAttributes<HTMLButtonElement>, "type"> & {
  type?: "submit" | ...;
};
```

**useRef matching actual element:**
```typescript
// ✅ CORRECT — useRef type matches rendered element
const innerRef = useRef<HTMLDivElement>(null);
return <div ref={innerRef}>...</div>;

// ❌ INCORRECT — type mismatch
const innerRef = useRef<HTMLAnchorElement>(null);
return <div ref={innerRef}>...</div>;
```

**useMemo for styles in memo component:**
```typescript
// ✅ CORRECT
const containerStyle = useMemo(() => ({ 
  padding: `${spacing}px`, 
  color: theme.text 
}), [spacing, theme.text]);

return <div style={containerStyle}>...</div>;

// ❌ INCORRECT — recreated every render, defeats memo
return <div style={{ padding: `${spacing}px` }}>...</div>;
```

---

### **SECTION 9: Registration**

**Checklist items:**
- [ ] Registered in `ComponentProvider.tsx` via `registerCoreComponent(fooComponentRenderer)`
- [ ] Import is the named `*ComponentRenderer` export from metadata file
- [ ] No duplicate registration

**Registration pattern:**
```typescript
// In xmlui/src/components-core/ComponentProvider.tsx

import { componentNameComponentRenderer } from "../components/ComponentName/ComponentName";

export class ComponentProvider {
  constructor() {
    // ... other registrations ...
    this.registerCoreComponent(componentNameComponentRenderer);
  }
}
```

**Export from metadata file:**
```typescript
// In ComponentName.tsx
export const componentNameComponentRenderer = wrapComponent(
  "ComponentName",
  ComponentNameNative,
  ComponentNameMd,
  { /* config */ },
);
```

---

## Integration Rules (Cross-Cutting Concerns)

### Behaviors (8 framework behaviors, auto-attach by prop)

| # | Name | Trigger prop | Skip conditions |
|---|------|---|---|
| 1 | `label` | `label` on instance | Metadata has `label` prop; formBinding will handle |
| 2 | `animation` | `animation` | ModalDialog injects `externalAnimation=true` instead |
| 3 | `tooltip` | `tooltip`, `tooltipMarkdown` | — |
| 4 | `variant` | `variant` | Button/Badge skip built-in variants |
| 5 | `bookmark` | `bookmark` | — |
| 6 | `formBinding` | `bindTo` + value/setValue APIs | Also handles label rendering |
| 7 | `validation` | `bindTo` + APIs, or FormItem type | — |
| 8 | `displayWhen` | `displayWhen` | Outermost wrapper; uses `display:none` |

**Key rule:** When component declares `label` in metadata (`props: { label: { ... } }`), the label behavior skips to prevent double-wrapping.

### wrapComponent Config Integration

**Auto-detection from metadata:**
- `booleans` ← `valueType: "boolean"` → `extractValue.asOptionalBoolean`
- `numbers` ← `valueType: "number"` → `extractValue.asOptionalNumber`
- `strings` ← `valueType: "string"` → `extractValue.asOptionalString`
- `events` ← all keys in `metadata.events` → auto-mapped to React props
- `stateful` ← `metadata.props.initialValue` or `metadata.events.didChange` → auto-detected

**Props BLOCKED from forwarding:**
- `id` (XMLUI id, not DOM attr)
- `ref` (never forward as string ref)
- `style` (theme variables only)
- Layout props (`width`, `height`, `padding`, etc.)
- `bindTo`, `onValidate`, `bubbleEvents`
- `aria-label` (handled by cascade)

---

## Quick Reference Checklist

**Before final submission, verify all 9 sections:**

```
□ 1. File Structure    – No index.ts, *React.tsx naming, dual-file pattern
□ 2. Metadata          – All props/events/APIs/themeVars declared, correct field names, defaults via defaultProps
□ 3. Renderer          – No hooks, extractValue.* everywhere, events wired, children rendered
□ 4. Native Component  – memo+forwardRef, no displayName, composeRefs, Props extends HTMLAttributes
□ 5. SCSS/Theming      – createThemeVar everywhere, correct variable names, :export at bottom
□ 6. Parts/A11y        – PART_* constants, semantic HTML, ARIA roles, keyboard nav
□ 7. E2E Tests         – Grouped by category, event assertions use expect.poll, focus verified before keys
□ 8. Types/Linting     – No errors, no as any, ForwardedRef<T>, useMemo for inline styles in memo
□ 9. Registration      – registerCoreComponent in ComponentProvider, no duplicates
```

**Absolute rules (every review):**
- ❌ NO `displayName` setting
- ❌ NO `useImperativeHandle`
- ❌ NO event handlers in `defaultProps`
- ❌ NO `composeRefs(...)` in render
- ❌ NO `as any`
- ✅ Event in metadata ⟹ Event in renderer `events` map

---

## Key Files for Review

| Concern | Location |
|---------|----------|
| Metadata creation | `xmlui/src/components-core/metadata-helpers.ts` |
| wrapComponent | `xmlui/src/components-core/wrapComponent.tsx` |
| ValueExtractor | `xmlui/src/components-core/rendering/valueExtractor.ts` |
| Components | `xmlui/src/components/` |
| Part constants | `xmlui/src/components-core/parts.ts` |
| Theme utilities | `xmlui/src/components-core/theming/utils.ts` |
| ComponentProvider | `xmlui/src/components-core/ComponentProvider.tsx` |
| E2E fixtures | `xmlui/src/testing/fixtures/` |
| Canonical E2E example | `xmlui/src/components/Checkbox/Checkbox.spec.ts` |

