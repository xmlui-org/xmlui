# XMLUI Component QA Checklist

A focused checklist for auditing and refactoring XMLUI component implementations. Each rule is actionable and maps to a concrete pattern or prohibition in the codebase.

---

## 1. File Structure

- [ ] **No `index.ts` in component folders.** Remove any found (`Input/index.ts` is a known violation). Consumers must import directly from the specific file.
- [ ] **File layout is `ComponentName.tsx` + `ComponentNameReact.tsx` + optional `ComponentName.module.scss`.** The React implementation file is named `*React.tsx`, not `*Native.tsx`. No extra files unless they serve a clear sub-component role.
- [ ] **Simple components may use the single-file pattern** (metadata, renderer, and React implementation together). Use the dual-file pattern for anything non-trivial to keep the React implementation independently usable.
- [ ] **Before renaming a `*React.tsx` file, search the entire `xmlui/src/` tree for all import sites.** Not only the co-located metadata file, but also framework infrastructure files (e.g. `components-core/behaviors/`) may import from the component. Update every import before running tests.

---

## 2. Metadata (`ComponentName.tsx`)

- [ ] **All props, events, APIs, contextVars, and themeVars are declared in `createMetadata`.** Missing entries break IntelliSense, docs, and validation.
- [ ] **`defaultValue` in metadata references `defaultProps.<prop>` from the native file.** Never hardcode literal defaults in metadata.
- [ ] **Events use the correct helper** (`dClick`, `dInit`, `dGotFocus`, `dLostFocus`, `d`, `dInternal`). Check that event key strings in metadata match the keys passed to `lookupEventHandler(...)` in the renderer.
- [ ] **Label behavior conflict is avoided.** If the component renders its own label (e.g. Checkbox, RadioGroup), `label` must be declared in `props` metadata so the behavior does not double-wrap it.
- [ ] **`nonVisual: true`** is set for components that produce no DOM output (Queue, Timer, DataSource, etc.). These should have no SCSS module or `themeVars`.
- [ ] **`themeVars: parseScssVar(styles.themeVars)`** is present for visual components and absent for non-visual ones.
- [ ] **`parts` metadata is declared** for any component with multiple stylable sub-elements (label, input, adornment, etc.), and `defaultPart` points to the element that receives layout props.

---

## 3. Renderer (`ComponentName.tsx` — `createComponentRenderer`)

- [ ] **No React hooks inside renderer functions.** Renderer functions are plain factory functions, not React components. `useState`, `useEffect`, `useRef`, `useMemo`, `useCallback`, and all other hooks are forbidden here — move them to the native component.
- [ ] **All prop values flow through `extractValue` helpers.** Never read `node.props.foo` raw and pass it as a typed prop without going through `extractValue`, `extractValue.asString`, `extractValue.asOptionalBoolean`, etc.
- [ ] **`classes` (not `className`) is passed to the native component** for new or migrated components. `className` may remain for legacy VariantBehavior compatibility but `classes` should be primary.
- [ ] **`state` and `updateState` are forwarded** to the native component whenever the component exposes reactive state to markup bindings (e.g. `{myComponent.value}`).
- [ ] **`registerComponentApi` is forwarded** to the native component whenever the component documentation advertises imperative API methods.
- [ ] **Event handlers use `lookupEventHandler("eventKeyInMetadata")`** — the key string must exactly match the event declared in `createMetadata`.
- [ ] **Children are rendered via `renderChild(node.children)`**, not by accessing them directly or mapping them imperatively.

---

## 4. Native Component (`ComponentNameNative.tsx`)

### Structure
- [ ] **Component is wrapped with `forwardRef`.** Every native component must accept a forwarded ref so parent contexts and tests can hold a DOM reference.
- [ ] **Component is wrapped with `React.memo`.** Prevents unnecessary re-renders when the parent re-renders with unchanged props. (`memo(forwardRef(function ComponentNameNative(...) { ... }))`).
- [ ] **`displayName` is NOT set anywhere in the file** (or in any wrapper/sub-component defined nearby). This is a hard prohibition. Known violations: `FormNative.tsx`, `ColorPickerNative.tsx`, `TextBox.tsx` (PasswordBox), `Table.tsx`, `ModalDialogNative.tsx`, `SliderNative.tsx`, `OptionNative.tsx`.
- [ ] **`useImperativeHandle` is NOT used.** Use `registerComponentApi` instead. Known violation: `StackNative.tsx`.
- [ ] **`defaultProps` is exported** as a named const object from the native file, and destructuring defaults in the function signature reference those values.

### Ref handling
- [ ] **When both a forwarded ref and an internal ref are needed, use `composeRefs(ref, internalRef)`.** Never ignore the forwarded ref.
- [ ] **When only an internal ref is needed and the forwardedRef may be null**, guard: `const composedRef = ref ? composeRefs(ref, innerRef) : innerRef;`

### Props interface
- [ ] **`...rest` is spread onto the root DOM element** so arbitrary HTML attributes (ARIA, data-*, event handlers) pass through.
- [ ] **`style` is accepted explicitly and applied to the root element.** The renderer passes `layoutCss` via `style` to control size/position.
- [ ] **Infrastructure props (`updateState`, `registerComponentApi`) are typed as optional** (`updateState?: ...`). The native component must work standalone without them.

### Classes / classnames
- [ ] **Root element `className` is built with `classnames(...)`.** Always merge: SCSS module class, `classes?.[COMPONENT_PART_KEY]` (for theme/responsive styles), and the forwarded `className` prop (for legacy VariantBehavior support).
- [ ] **Named parts use `partClassName(PART_*)` alongside their SCSS module class** so tests can locate them via `[data-part-id='partName']`.

### State management
- [ ] **Local UI state (`useState`) is used for immediate feedback** (e.g. caret position, open/closed). Never route every keystroke through `updateState` — that causes caret-jumping in text inputs.
- [ ] **`updateState` is called when the public value changes** (after debounce/blur if appropriate) so markup bindings stay in sync.
- [ ] **External prop changes are synced into local state via `useEffect`**, with a ref guard to avoid loops:
  ```typescript
  useEffect(() => {
    if (externalValue !== lastSynced.current) {
      setLocalValue(externalValue ?? "");
      lastSynced.current = externalValue;
    }
  }, [externalValue]);
  ```
- [ ] **`registerComponentApi` is called in a `useEffect`** and all referenced functions are in the dependency array:
  ```typescript
  useEffect(() => {
    registerComponentApi?.({ focus, setValue });
  }, [registerComponentApi, focus, setValue]);
  ```
- [ ] **`useCallback` wraps functions passed as event handlers or into `registerComponentApi`** to maintain stable references and avoid effect re-fires.
- [ ] **`useMemo` is used for expensive derived values** (e.g. filtered lists, sorted data, virtual row computation) — not for trivial derivations.

### `useEffect` hygiene
- [ ] **Every `useEffect` that creates a subscription, timeout, or interval returns a cleanup function.**
- [ ] **Dependency arrays are complete and accurate.** No empty arrays when the effect uses props/state. Use ESLint `exhaustive-deps` rule as a guide.
- [ ] **No stale closures.** If a callback inside an effect references mutable state, wrap the callback with `useCallback` and include the state in its dependency array — or use a ref to hold the latest value.

---

## 5. SCSS / Theming

- [ ] **Duplicate layout CSS across variant classes is extracted into a shared base class.** When `.badge` and `.pill` (or similar variant classes) repeat the same layout rules verbatim, extract them into a `.container` class applied alongside the variant class in the component. This is the CSS equivalent of DRY and prevents divergence.
- [ ] **Every themed property uses `createThemeVar(...)` (not a hardcoded value).** Hardcoded colors/sizes in SCSS prevent theme overrides.
- [ ] **Theme variable names follow the convention:** `property-ComponentName`, `property-ComponentName-Variant`, `property-ComponentName-State`.
- [ ] **`:export { themeVars: t.json-stringify($themeVars); }` is present** at the bottom of every SCSS module so `parseScssVar` can read them.
- [ ] **`defaultThemeVars` in metadata provides light-mode fallbacks** for every variable declared in SCSS.
- [ ] **Disabled state uses `opacity` + `pointer-events: none`** (via a `.disabled` CSS class), not `filter: grayscale` or inline styles.

---

## 6. Accessibility

- [ ] **Interactive elements have correct ARIA roles** (`role="button"`, `role="checkbox"`, etc.) or use the correct semantic HTML element.
- [ ] **`aria-disabled={!enabled}`** is set when the component is disabled (instead of or in addition to the `disabled` attribute, depending on the element type).
- [ ] **`aria-label` or visible label is always present** for icon-only controls (buttons, inputs without text).
- [ ] **Keyboard navigation is complete**: focusable elements respond to Enter/Space (activation), Escape (dismiss), and arrow keys (navigation within groups).

---

## 7. E2E Tests (`ComponentName.spec.ts`)

- [ ] **Test file is co-located in the component folder**, not in a separate `tests/` directory.
- [ ] **Import is from `../../testing/fixtures`**, not from `@playwright/test` directly.
- [ ] **Tests are grouped with `test.describe`** into categories: Basic Functionality, Accessibility, Theme Variables, Behaviors and Parts, Edge Cases.
- [ ] **Event tests use `testState` + `expect.poll`** for async assertions. Never assert synchronously after a user interaction.
- [ ] **Keyboard tests always verify focus with `toBeFocused()` before pressing keys.** Skipping this causes flakiness under parallel execution.
- [ ] **Click tests `await expect(element).toBeVisible()` before clicking**, especially immediately after `initTestBed`.
- [ ] **Semantic locators are preferred** (`getByRole`, `getByLabel`, `getByTestId`) over raw `page.locator('div.foo')`.
- [ ] **Theme variable tests use exact `rgb(...)` colors**, not named colors like `"red"`.
- [ ] **No `async`/`await` inside XMLUI script strings** — the framework handles async automatically. Use `delay(ms)` instead of `setTimeout`.
- [ ] **No `new` operator in XMLUI script strings** — e.g. `throw "error"` not `throw new Error("error")`.
- [ ] **Template props use `<property name="...">` wrapper**, not a shorthand child tag.
- [ ] **Component drivers are used for complex interactions** (Select, Table, DatePicker) instead of raw Playwright locators.

---

## 8. Linting & Type Safety

- [ ] **No TypeScript errors in the VS Code Problems panel.** After any refactoring, check the Problems panel (or `tsc --noEmit`) — the file must be error-free before the work is considered done.
- [ ] **No `as any` casts.** Replace with `as unknown as TargetType` where an unsafe cast is unavoidable, and prefer redesigning types to eliminate the need entirely.
- [ ] **Event handler base types match usage.** When forwarding `onClick`/`onContextMenu` through a shared props object to elements of different types (e.g. `<img>` and `<div>`), type the handlers via `HTMLElement` (the common base) rather than a specific element type to avoid assignability errors.
- [ ] **`Ref` union types are narrowed per element.** A `Ref<A | B>` cannot be directly passed to an element expecting `Ref<A>`. Either cast per-branch (`ref as Ref<HTMLImageElement>`) or keep `ref` outside the shared props object and pass it individually to each branch.
- [ ] **`Ref<any>` is replaced with the accurate element type or union.** Use `Ref<HTMLInputElement>`, `Ref<HTMLDivElement>`, etc.
- [ ] **Type guard parameters must use `unknown`, not `any`.** `any` disables type checking inside the guard body. Use `unknown` and cast after narrowing: `typeof (color as BadgeColors).label === "string"`.
- [ ] **Inline style objects built inside JSX (`style={{ ... }}`) must be extracted to `useMemo`** when the component is wrapped in `React.memo`. An inline object literal creates a new reference every render, causing `memo`'s equality check to always fail for that prop.
- [ ] **Pure constants and pure utility functions are defined at module scope**, not inside the component function body. Objects/arrays recreated on every render without `useMemo` create unnecessary GC pressure and may break referential-equality checks.
- [ ] **Abbreviated or cryptic identifier names are expanded.** Function and variable names should be self-describing: `abbreviateName` not `abbrevName`, `calculateFontSize` not `calcFs`.

---

## 9. Registration

- [ ] **Component is registered in `ComponentProvider.tsx`** via `this.registerCoreComponent(componentNameComponentRenderer)`.
- [ ] **Import is a named import of the `*ComponentRenderer` export** from the `.tsx` metadata/renderer file.
- [ ] **No duplicate registration** — search the file for the component name before adding.

---

## Quick Anti-Pattern Reference

| Anti-pattern | Rule |
|---|---|
| `ComponentName.displayName = "..."` | Remove. Hard prohibition. |
| `useImperativeHandle` in native | Replace with `registerComponentApi`. |
| Hook (`useState`, `useEffect`, …) inside renderer function | Move to native component. |
| `index.ts` in component folder | Delete the file. |
| Raw `node.props.foo` passed as typed prop without `extractValue` | Wrap in appropriate `extractValue.*` call. |
| Hardcoded colors or sizes in SCSS | Replace with `createThemeVar(...)`. |
| `defaultValue` in metadata with a literal value | Reference `defaultProps.propName` instead. |
| `useEffect` with missing deps or no cleanup for subscriptions | Fix deps array; add cleanup return. |
| `forwardRef` without `composeRefs` when internal ref is also needed | Use `composeRefs(ref, internalRef)`. |
| `...rest` not spread on root element | Add `{...rest}` to root element. |
| `style` prop not applied to root | Accept `style` explicitly and apply it. |
| Empty `[]` dep array but effect uses props/state | Audit deps; add missing values. |
| `as any` cast | Replace with `as unknown as T` or fix the type. |
| Pure constant / utility defined inside component body | Move to module scope. |
| Abbreviated identifier names (`abbrevName`, `calcFs`) | Expand to self-describing names. |
| `Ref<A \| B>` spread into element expecting `Ref<A>` | Pass `ref` per-branch with narrowing cast. |
| `Pick<HTMLAttributes<HTMLDivElement>, "onClick">` when element type varies | Use `HTMLElement` as the base type. |
| `isFoo(x: any)` — `any` in type guard parameter | Change to `unknown`; cast inside the guard after narrowing. |
| Inline `style={{ ... }}` inside `memo`-wrapped component | Extract to `useMemo` keyed on color/style deps. |
| Duplicate layout CSS in `.badge` / `.pill` variant classes | Extract shared rules to `.container` base class. |
| Stale `*Native` import after rename (e.g. in `VariantBehavior.tsx`) | Grep all `src/` importers before renaming; update each. |

