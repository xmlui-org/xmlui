<!-- Audience: component authors / reviewers. Actionable audit checklist. -->

# XMLUI Component QA Checklist

Quick reference for auditing and refactoring XMLUI components. Each item is
actionable and maps to a concrete, verifiable pattern.

---

## 1. File Structure

- [ ] No `index.ts` in component folders. (Known violation: `Input/index.ts`)
- [ ] Implementation file named `*React.tsx`, not `*Native.tsx`. Before renaming, grep `xmlui/src/` for **all** importers (not just the co-located metadata file) and update each.
- [ ] Simple non-visual components may use a single file; use the dual-file pattern for anything with meaningful React logic.

---

## 2. Metadata

- [ ] All props, events, APIs, contextVars, and themeVars declared in `createMetadata`.
- [ ] All prop field keys use the correct names: `type`, `description`, `defaultValue`, `availableValues`. The key `valueType` is silently ignored by the metadata system — TypeScript will not catch it.
- [ ] `defaultValue` references `defaultProps.<prop>` — never a literal.
- [ ] Event helper keys match the strings passed to `lookupEventHandler(...)` in the renderer.
- [ ] `label` declared in `props` when the component renders its own label (prevents behavior double-wrapping).
- [ ] `nonVisual: true` + no SCSS/themeVars for components with no DOM output.
- [ ] `themeVars: parseScssVar(styles.themeVars)` present for all visual components.
- [ ] `parts` declared for components with multiple stylable sub-elements; `defaultPart` points to the layout-receiving element.
- [ ] Every part rendered with `<Part partId={PART_*}>` in the native component appears in `parts` metadata.

---

## 3. Renderer

- [ ] No React hooks inside renderer functions (they are plain factory functions, not components).
- [ ] All prop values go through `extractValue.*` helpers — never raw `node.props.foo`.
- [ ] Pass `classes` (not `className`) to native components; `className` is legacy VariantBehavior only.
- [ ] `state`/`updateState` forwarded when the component exposes reactive bindings.
- [ ] `registerComponentApi` forwarded when imperative APIs are documented.
- [ ] Event handlers use `lookupEventHandler("key")` matching the metadata key exactly.
- [ ] Every event declared in `createMetadata({ events: {...} })` has a corresponding entry in the `wrapComponent` renderer's `events` map (e.g. `didChange: "onDidChange"`). Missing entries mean the event fires in the metadata but is never wired to the prop.
- [ ] Children rendered via `renderChild(node.children)`.
- [ ] Renderer components that wrap void elements (`<br>`, `<img>`, `<input>`) must not pass `renderChild(node.children)` inside the element.

---

## 4. Native Component

### Structure
- [ ] Wrapped with `memo(forwardRef(function ComponentName(...) { ... }))`. Both wrappers required.
- [ ] **Non-visual components** (renders `null`, `nonVisual: true` in metadata) — wrap with `memo(function Name(...))` only. `forwardRef` is only needed when the component exposes a DOM node.
- [ ] `displayName` NOT set — hard prohibition. Applies to directly-declared components AND components created by a factory function (e.g. `createSlot`, `createPart`): remove any `Slot.displayName = ...` inside the factory.
- [ ] `useImperativeHandle` NOT used — use `registerComponentApi`.
- [ ] `defaultProps` exported as a const; function signature destructuring defaults reference it. **Event handler props (`onReady`, `onKeyDown`, etc.) must NOT appear in `defaultProps`** — they are renderer-wired and should default to `noop`/`undefined` directly in the destructuring.
- [ ] Void elements (`<br />`, `<img />`, `<input />`) self-closing with no children.

### Refs
- [ ] Forwarded `ref` connected to the root DOM element (silently disconnected ref compiles fine but returns `null` to callers).
- [ ] When both forwarded and internal refs are needed: `const composedRef = useComposedRefs(ref, innerRef)` (hook, stable). Never call `composeRefs(...)` in JSX/render, and never guard with `ref ? composeRefs(...) : inner` — `useComposedRefs` handles null/undefined internally.
- [ ] `forwardRef` callback parameter typed `ForwardedRef<T>`, not `Ref<T>`.
- [ ] `useRef<T>` type matches the actual element the ref is attached to.
- [ ] `ThemedFoo` wrapper ref type is a union when the rendered element varies: `forwardRef<HTMLImageElement | HTMLDivElement, ...>`.

### Props interface
- [ ] `Props` extends `React.HTMLAttributes<HTMLElement>` (or the specific element base). Consequence: remove now-redundant explicit declarations of `style`, `className`, `children`, and any picked event handlers.
- [ ] When a prop narrows an HTML attribute to a component-specific union type (e.g., `type?: ButtonType` vs HTML's `type?: string`), use `Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type"> & { type?: ButtonType }` — not `Pick<>`. Also `Omit` any HTML attribute that is aliased under a different prop name (e.g., `formId` aliasing the HTML `form` attribute).
- [ ] `{...rest}` spread on root element, placed **before** internally-controlled props so internal handlers (e.g. `tabIndex`, `onKeyDown`) take precedence.
- [ ] Infrastructure props (`updateState?`, `registerComponentApi?`) typed as optional — component must work standalone.
- [ ] No dead props (declared but never used). Also check `defaultProps` for keys absent from the `Props` type.
- [ ] After any Props refactor, remove orphaned type imports.

### classnames
- [ ] Root `className` built with `classnames(styles.foo, classes?.[COMPONENT_PART_KEY], className)`. Use the `COMPONENT_PART_KEY` constant — never the raw string `"-component"`.
- [ ] Part containers: `<Part partId={PART_*}>` so `[data-part-id]` selectors work in tests.

### State & Effects
- [ ] `useMemo` only for genuine computation — `useMemo(() => value, [value])` is a no-op; remove it.
- [ ] `useCallback` inlined — the factory pattern (`useCallback(() => (e) => {...}, [])`) defeats memoization; inline the handler directly.
- [ ] `registerComponentApi` callbacks extracted to individual `useCallback` variables **before** the `useEffect`, then listed in the effect's deps.
- [ ] Lodash `debounce`/`throttle` cancelled in a cleanup effect: `useEffect(() => () => fn.cancel?.(), [fn])`.
- [ ] Every resource-acquiring `useEffect` (subscription, timeout, interval) returns a cleanup. Deps arrays are complete; no stale closures.
- [ ] No variable shadowing: don't name a `setTimeout` return value `id` when `id` is also a prop — use `timeoutId`.
- [ ] `updateState` called when the public value changes.
- [ ] External prop → local state sync uses a ref guard to prevent loops.
- [ ] Never mutate the object passed to a `setState` updater callback — always return a new value. For Sets/Maps: `setItems(prev => new Set([...prev, newItem]))`, not `prev.add(x); return prev`.
- [ ] Keyboard handlers use runtime element order (`findIndex` on refs), not hard-coded field sequences.
- [ ] Pure constants and utilities at module scope, not inside the component body.

---

## 5. SCSS / Theming

- [ ] Every themed property uses `createThemeVar(...)` — no hardcoded values.
- [ ] Variable names follow the pattern: `property-ComponentName`, `property-ComponentName-Variant`, `property-ComponentName--State`.
- [ ] `:export { themeVars: t.json-stringify($themeVars); }` at the bottom of every SCSS module.
- [ ] `defaultThemeVars` in metadata covers every SCSS variable.
- [ ] No duplicate `$themeVars: t.composeFooVars(...)` calls — each compose function called once.
- [ ] Sub-element `:focus` uses element-scoped variables (e.g. `$outlineColor-button-Foo--focused`), not the component-root variable.
- [ ] Duplicate layout CSS across variant classes extracted to a shared base class.

---

## 6. Parts & Accessibility

- [ ] `PART_*` constants in `components-core/parts.ts` — never redeclare locally; import everywhere (component, driver, tests).
- [ ] Remove dead IE/legacy-browser compatibility checks (`isIEOrEdgeLegacy`, UA sniffing).
- [ ] Interactive elements have correct ARIA roles or use the correct semantic HTML element.
- [ ] `aria-disabled={!enabled}` set on disabled elements.
- [ ] `aria-label` present for icon-only controls.
- [ ] Keyboard navigation complete: Enter/Space (activate), Escape (dismiss), arrows (group navigation).

---

## 7. E2E Tests

- [ ] Test file co-located in the component folder; import from `../../testing/fixtures`.
- [ ] Tests grouped with `test.describe`: Basic Functionality, Accessibility, Theme Variables, Behaviors and Parts, Edge Cases.
- [ ] Event assertions use `testState` + `expect.poll` — never synchronous after user interaction.
- [ ] Keyboard tests verify `toBeFocused()` before pressing keys.
- [ ] `await expect(element).toBeVisible()` before clicking.
- [ ] Semantic locators preferred (`getByRole`, `getByLabel`, `getByTestId`).
- [ ] Theme variable tests use exact `rgb(...)` values.
- [ ] No `async`/`await` or `new` in XMLUI script strings; use `delay(ms)` not `setTimeout`.
- [ ] Template props use `<property name="...">` wrapper.
- [ ] Component drivers used for complex components (Select, Table, DatePicker).

---

## 8. Types & Linting

- [ ] No TypeScript errors after any change.
- [ ] No duplicate import declarations — two `import type { Foo } from "react"` lines compile under tsc but fail Vite's Babel pre-transform. Check after any import-line refactor.
- [ ] No `as any` — use `as unknown as T` when unavoidable; `any` in type-guard parameters → `unknown`.
- [ ] `Ref<T>` on `forwardRef` callback → `ForwardedRef<T>`; `Ref<any>` → accurate element type.
- [ ] Inline `style={{ ... }}` in JSX inside a `memo`-wrapped component → `useMemo(() => ({ ... }), [deps])`.
- [ ] Shared event handlers typed via `HTMLElement` base when element type varies across render branches.
- [ ] `children?: ReactNode | ReactNode[]` → `children?: ReactNode`.
- [ ] No JSDoc block comments on exports — descriptions belong in `createMetadata`.
- [ ] Expanded identifier names (not `abbrevName`, `calcFs`).

---

## 9. Registration

- [ ] Registered in `ComponentProvider.tsx` via `registerCoreComponent(fooComponentRenderer)`.
- [ ] Import is the named `*ComponentRenderer` export from the metadata file.
- [ ] No duplicate registration.

---

## Quick Anti-Pattern Reference

| Anti-pattern | Fix |
|---|---|
| `displayName` set on component or factory output | Remove — hard prohibition (direct components and factory-created components alike). |
| `useImperativeHandle` | Replace with `registerComponentApi`. |
| Hook inside renderer function | Move to native component. |
| `index.ts` in component folder | Delete. |
| `*Native.tsx` filename | Rename to `*React.tsx`; grep all importers first. |
| Raw `node.props.foo` without `extractValue` | Wrap with `extractValue.*`. |
| Hardcoded value in SCSS | `createThemeVar(...)`. |
| Literal default in metadata | `defaultProps.propName`. |
| Event handler key in `defaultProps` (e.g. `onReady: noop`) | Remove — default directly in the destructuring. `defaultProps` is consumed by the metadata system and must only contain prop values visible to XMLUI users. |
| `forwardRef` ref not connected to DOM | `useComposedRefs(ref, innerRef)` on root. |
| `composeRefs(...)` called in render | `useComposedRefs(...)` — stable hook form. |
| `ref ? composeRefs(...) : inner` | `useComposedRefs(ref, inner)` — handles null internally. |
| `Ref<T>` / `Ref<any>` on forwardRef parameter | `ForwardedRef<T>`. |
| `useRef<HTMLAnchorElement>` on a `<span>` | Match `useRef<T>` to the actual rendered element. |
| `Props` with no HTML base type | Extend `HTMLAttributes<HTMLElement>`; remove duplicate `style`/`className`/`children`. |
| `{...rest}` after internal props | Move to front. |
| `Pick<HTMLAttributes<T>, "onClick">` when more attrs needed | Extend `HTMLAttributes<T>` directly. |
| `& Pick<HTMLAttributes<T>, "onClick" \| ...>` intersection on Props | Extend `ButtonHTMLAttributes<T>` (or the relevant element base) instead; `Pick` re-declares what the base already provides. |
| Dead prop in Props or defaultProps | Remove — may silently reach DOM via `...rest`. |
| `ThemedFoo = forwardRef<HTMLDivElement>` when element varies | Union: `forwardRef<HTMLImageElement \| HTMLDivElement>`. |
| `as any` | `as unknown as T`. |
| Duplicate `import type { Foo } from "..."` lines | Remove duplicate — tsc ignores it but Vite Babel pre-transform fails. |
| Event in `createMetadata` with no matching `events` map entry in renderer | Add `didChange: "onDidChange"` (or equivalent) to the `wrapComponent` `events` object. |
| `isFoo(x: any)` type guard | `x: unknown`; cast after narrowing. |
| Inline `style={{ ... }}` in memo component | `useMemo(() => ({ ... }), [deps])`. |
| `children?: ReactNode \| ReactNode[]` | `children?: ReactNode`. |
| `setState(prev => { prev.add(x); return prev; })` mutating callback | `setState(prev => new Set([...prev, x]))` — return a new object. |
| `useMemo(() => value, [value])` | Remove — no-op. |
| `useCallback(() => (e) => {...}, [])` factory | Inline: `useCallback((e) => {...}, [deps])`. |
| `registerComponentApi` callbacks inline in effect | Extract to `useCallback`; add to deps. |
| Lodash `debounce`/`throttle` without cancel on unmount | `useEffect(() => () => fn.cancel?.(), [fn])`. |
| `useEffect` timeout without cleanup | Return `() => clearTimeout(id)`. |
| `const id = setTimeout(...)` when `id` is a prop | Rename to `timeoutId`. |
| Empty `[]` dep array when effect uses props/state | Audit deps. |
| Pure constant / utility inside component body | Move to module scope. |
| Local `const PART_FOO = "foo"` | Add to `parts.ts`; import everywhere. |
| Part rendered but absent from `parts` metadata | Add to `createMetadata({ parts: {...} })`. |
| `isIEOrEdgeLegacy` / IE UA guard | Remove — dead code. |
| Hard-coded keyboard navigation order | `findIndex` on runtime refs. |
| Duplicate `$themeVars: t.composeFooVars(...)` in SCSS | Remove duplicate. |
| Sub-element `:focus` using component-root variable | Element-scoped outline variable. |
| Duplicate layout CSS across variant classes | Extract to shared base class. |
| `classes?.["-component"]` string literal | `classes?.[COMPONENT_PART_KEY]`. |
| `(icon as any).props` | `React.isValidElement(icon) ? (icon.props as Record<string, unknown>) : undefined`. |
| `<>{value}</>` redundant fragment | `{value}`. |
| JSDoc on `.tsx` exports | Remove; use `createMetadata`. |
| `<br>{children}</br>` or void element with children | `<br />` — void elements cannot have children. |
| `!!string.trim().length` in predicate | `string.trim().length > 0`. |
| Abbreviated names (`abbrevName`, `calcFs`) | Expand to self-describing names. |
