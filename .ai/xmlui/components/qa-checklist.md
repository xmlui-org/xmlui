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
- [ ] **Verify the forwarded `ref` is actually connected to a DOM element.** `forwardRef<T, Props>` can compile without error even if the `ref` parameter is never used. Confirm the ref is applied (directly or via `useComposedRefs`) to the root element. A silently disconnected ref means `refs.current` is always `null` for callers.
- [ ] **When both a forwarded ref and an internal ref are needed, use `useComposedRefs(ref, internalRef)` (from `@radix-ui/react-compose-refs`).** Never use `composeRefs(...)` directly — it returns a new callback ref object on every render, causing React to needlessly detach and reattach the ref. `useComposedRefs` wraps the result in `useCallback` for stability.
- [ ] **Do not guard `useComposedRefs` with `ref ?` — it handles `null`/`undefined` refs internally.** `const composedRef = ref ? composeRefs(ref, innerRef) : innerRef;` should become `const composedRef = useComposedRefs(ref, innerRef);`.
- [ ] **The `forwardRef` callback's ref parameter must be typed `ForwardedRef<T>`, not `Ref<T>`.** `ForwardedRef` is the precise type React passes to `forwardRef` callbacks. `Ref<T>` is broader (includes deprecated string refs). Both come from `"react"` and must be explicitly imported as named types.

### Props interface
- [ ] **`Props` must extend `React.HTMLAttributes<HTMLElement>` (or the appropriate element base).** This ensures `...rest` has a defined type that includes ARIA attributes, `data-*`, and standard event handlers — not `{}`. When extending `HTMLAttributes`, **remove** the now-redundant explicit declarations of `style`, `className`, `children`, and any picked event handlers — they are all inherited and duplicating them causes confusion about which declaration governs the type.
- [ ] **Check for orphaned imports after removing explicit prop declarations.** When `children?: React.ReactNode` is removed from Props because it's inherited from `HTMLAttributes`, the `ReactNode` import becomes unused — remove it.
- [ ] **When `Props` extends `HTMLAttributes`, place `{...rest}` BEFORE all internally-controlled props** in any spread object (e.g. a `sharedProps` helper). This ensures internal accessibility props (`onKeyDown`, `tabIndex`) take precedence over user-supplied values from `rest`.
- [ ] **`...rest` is spread onto the root DOM element** so arbitrary HTML attributes (ARIA, data-*, event handlers) pass through.
- [ ] **`style` is accepted explicitly and applied to the root element.** The renderer passes `layoutCss` via `style` to control size/position.
- [ ] **`ThemedFoo` wrappers must use a ref type that matches the union of possible rendered elements.** For example, if `Avatar` renders either `<img>` or `<div>` depending on props, the `ThemedAvatar` wrapper must be typed `React.forwardRef<HTMLImageElement | HTMLDivElement, ...>` (not `HTMLDivElement` alone). Using a single concrete element type is a silent type lie when the ref might point to a different element at runtime.
- [ ] **Infrastructure props (`updateState`, `registerComponentApi`) are typed as optional** (`updateState?: ...`). The native component must work standalone without them.

### Classes / classnames
- [ ] **Root element `className` is built with `classnames(...)`.** Always merge: SCSS module class, `classes?.[COMPONENT_PART_KEY]` (for theme/responsive styles), and the forwarded `className` prop (for legacy VariantBehavior support).
- [ ] **Named parts use `partClassName(PART_*)` alongside their SCSS module class** so tests can locate them via `[data-part-id='partName']`.

### State management
- [ ] **Remove dead props — props declared in the type but never used in the component body.** A common example is `gap?: string | number` that got superseded by a CSS theme variable. Dead props pollute IntelliSense, can shadow `...rest` values, and silently swallow user-provided attributes that should have reached the DOM.
- [ ] **Avoid variable shadowing inside `useEffect` closures.** If a prop is named `id`, do not declare `const id = setTimeout(...)` inside an effect — rename the timer handle to `timeoutId`. Shadowing makes cleanup code (`clearTimeout(id)`) ambiguous at a glance.
- [ ] **Prefer simple boolean expressions in filter predicates.** `!!string.trim().length` is a double negation converting `number→boolean→boolean` unnecessarily. Use `string.trim().length > 0` or just `string.trim()` for clarity.
- [ ] **`children?: React.ReactNode` — do not write `React.ReactNode | React.ReactNode[]`.** `ReactNode` already includes array forms (`ReactFragment`).
- [ ] **Mix named imports with namespace imports consistently.** If `memo` is a named import from `"react"`, don't use `React.forwardRef` alongside it. Destructure `forwardRef` and `ForwardedRef` as named imports: `import React, { forwardRef, type ForwardedRef, memo, ... } from "react"`.
- [ ] **`COMPONENT_PART_KEY` constant (from `../../components-core/theming/responsive-layout`) must be imported and used instead of the raw string `"-component"`.** Hardcoding `"-component"` is a magic string anti-pattern.
- [ ] **`useMemo` must perform a real computation.** `useMemo(() => value, [value])` is a no-op — it recomputes exactly when `value` changes and returns it unchanged. This adds memo overhead with zero benefit. Replace with a simple `const x = value` assignment, or remove the intermediate variable entirely.
- [ ] **`useCallback` must not use a factory pattern in the render body.** `const createHandler = useCallback(() => (event) => {...}, [])` followed by `const handler = createHandler()` unconditionally in the render body defeats the purpose of `useCallback` — `handler` is a new function every render. Inline the handler directly: `const handler = useCallback((event) => {...}, [deps])`.
- [ ] **Keyboard navigation that relies on element order must use the runtime order, not a hard-coded sequence.** If field layout can vary (e.g. controlled by a `dateFormat` prop), arrow-key handlers must use the computed field order (`getInputRefs()` or equivalent) to locate prev/next, not a hard-coded `month→day→year` path.
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
- [ ] **SCSS must have no duplicate calls.** A copy-paste accident like two consecutive `$themeVars: t.composePaddingVars($themeVars, $componentName)` lines silently doubles the number of registered padding vars in `$themeVars`. Search for consecutive identical `$themeVars: t.compose*` calls.
- [ ] **Sub-element `:focus` SCSS rules must use the sub-element's own theme variables.** A `button:focus` rule in a component's SCSS should use a button-scoped variable (e.g. `$outlineColor-button-DateInput--focused`), not the component-root variable (e.g. `$outlineColor-DateInput--focus`). Mismatches mean the user cannot independently control the button focus ring.

---

- [ ] **Part constants (`PART_DAY`, `PART_CLEAR_BUTTON`, etc.) that may be shared across components (drivers, specs, related components) must live in `components-core/parts.ts`, not be redeclared locally.** Add the constant to `parts.ts` and import it everywhere. Local redeclaration diverges silently when the string changes.
- [ ] **`parts` metadata must list every part wrapped in `<Part partId={...}>` in the native component.** If a part is rendered but missing from `createMetadata({ parts: { ... } })`, end users cannot target it via `classes` and it is invisible to documentation.
- [ ] **Remove dead browser-compatibility checks.** Variables like `isIEOrEdgeLegacy` that target IE or legacy Edge are dead in modern XMLUI apps. If the variable is declared but never changes behavior, delete it and simplify the guarded code path.

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

## 10. HTML Void Elements

- [ ] **`<br>`, `<img>`, `<input>`, `<hr>`, `<meta>`, `<link>` are void elements and must be self-closing in JSX.** Never pass children to them: `<br>{...}</br>` is invalid HTML and causes a React warning. Use `<br />` (or `<br className={...} />` etc.) instead.
- [ ] **Custom renderer components that wrap void elements must not pass `renderChild(node.children)` inside the element.** Drop both `renderChild` from the destructured render context and any `{renderChild(node.children)}` inside the void element.

---

## 11. `useRef` Type Accuracy

- [ ] **`useRef<T>` must use the type of the element the ref is actually attached to.** A common mistake is using `useRef<HTMLAnchorElement>` when the rendered element is a `<span>` (which requires `useRef<HTMLSpanElement>`). TypeScript may not catch this at the call site — check visually.
- [ ] **`forwardRef` parameter type and the element the ref is attached to must agree.** `ForwardedRef<HTMLSpanElement>` must go onto a `<span>`, not a `<div>` or `<a>`.

---

## 12. JSDoc in Component Files

- [ ] **Do not add JSDoc block comments to exports in XMLUI component files.** Descriptions live in `createMetadata({ description: "..." })`. JSDoc blocks in `.tsx` files are redundant, increase noise, and will drift out of sync with the metadata.

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
| `composeRefs(ref, innerRef)` called in render (not a hook) | Replace with `useComposedRefs(ref, innerRef)` — stable across renders. |
| `ref ? composeRefs(ref, inner) : inner` guard | Replace with `useComposedRefs(ref, inner)` — null/undefined handled internally. |
| `Props` with no HTML base type (`...rest` typed as `{}`) | Extend `React.HTMLAttributes<HTMLElement>`; move `{...rest}` before explicit props. |
| `{...rest}` at end of spread object when Props extends HTMLAttributes | Move `{...rest}` to the FRONT so internal props (onKeyDown, tabIndex) take precedence. |
| `ThemedFoo = forwardRef<HTMLDivElement>` when Foo renders img or div | Use the union: `forwardRef<HTMLImageElement \| HTMLDivElement>`. |
| Dead prop in Props (declared, destructured, never used in body) | Remove from Props and destructuring; verify no metadata or test sets it. |
| `children?: ReactNode \| ReactNode[]` | Simplify to `children?: ReactNode` — array is already included. |
| `React.forwardRef` mixed with named `memo` import | Destructure `forwardRef` as a named import for consistency. |
| `classes?.["-component"]` raw string literal | Import and use `COMPONENT_PART_KEY` from `responsive-layout`. |
| Inline `style={{ ... }}` inside `memo`-wrapped component | Extract to `useMemo` keyed on color/style deps. |
| Duplicate layout CSS in `.badge` / `.pill` variant classes | Extract shared rules to `.container` base class. |
| Stale `*Native` import after rename (e.g. in `VariantBehavior.tsx`) | Grep all `src/` importers before renaming; update each. |
| `<br>{children}</br>` or any void element with children | Use self-closing `<br />`: void elements cannot have children. |
| `useRef<HTMLAnchorElement>` on a `<span>` element | Match `useRef<T>` type to the rendered element type exactly. |
| JSDoc block comments on exports in `.tsx` component files | Remove; descriptions belong in `createMetadata`. |
| `useEffect` timeout with no `clearTimeout` cleanup | Return `() => clearTimeout(id)` from the effect. |
| `(icon as any).props` to access icon props | Use `React.isValidElement(icon) ? (icon.props as Record<string, unknown>) : undefined`. |
| Redundant fragment wrappers `<>{value}</>` | Use `{value}` directly when no key/ref is needed. |
| `BrNative(_props: any)` placeholder | Use a typed placeholder `BrPlaceholder(_props: Record<string, never>)`. |
| `Ref<T>` on `forwardRef` callback parameter | Use `ForwardedRef<T>` — the precise type React passes to `forwardRef` callbacks. |
| `Pick<HTMLAttributes<T>, "onContextMenu">` when more attrs are needed | Extend `HTMLAttributes<T>` directly; remove explicit style/className/children. |
| Explicit `style/className/children` in Props when extending `HTMLAttributes` | Remove — they are inherited; duplicate declarations are misleading. |
| `useCallback(() => (event) => {...}, [])` factory → called in render body | Inline: `useCallback((event) => {...}, [deps])` — factory-in-render produces a new function every render, defeating memoization. |
| `useMemo(() => value, [value])` with no transformation | Remove — this recomputes on every change to `value` and returns it unchanged; use `value` directly. |
| `forwardRef` ref param never attached to DOM or composed | Connect via `useComposedRefs(ref, internalRef)` on root element; a disconnected ref returns `null` to callers without compile error. |
| Local `const PART_FOO = "foo"` when or as soon as it could be shared | Move to `components-core/parts.ts`; import from there everywhere (component, driver, tests). |
| Part rendered in native component but absent from `parts:` metadata | Add to `createMetadata({ parts: { ... } })`; undeclared parts are invisible to docs and theming. |
| `isIEOrEdgeLegacy` / IE user-agent sniffing guards | Remove — these browser checks are dead code in XMLUI; simplify the guarded path. |
| Arrow key handler navigates fields in hard-coded order | Use `getInputRefs()` + `findIndex(r => r?.current === event.currentTarget)` to navigate by computed `dateOrder`; hard-coded order breaks when field layout is configurable. |
| Duplicate consecutive `$themeVars: t.composeFooVars(...)` calls in SCSS | Each compose function must be called once; a second identical call is a copy-paste artifact — remove it. |
| Sub-element `:focus` using component-root outline variable | Declare and use dedicated part-specific outline variables, e.g. `$outlineColor-button-ComponentName--focused`; component-root vars cannot control sub-element focus rings independently. |
| Orphaned named type import after Props refactor | Check imports after every Props change; remove unused type-only imports. |
| `const id = setTimeout(...)` inside effect when `id` is also a prop | Rename the timer to `timeoutId` to avoid variable shadowing. |
| `!!string.trim().length` in filter predicate | Use `string.trim().length > 0` — no double negation. |

