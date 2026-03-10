# XMLUI Component QA Checklist

Use this when reviewing or verifying XMLUI components against conventions. For implementation details, see the sub-files listed in `guidelines/xmlui/components/overview.md`.

## Scope

**Skip `HtmlTags.tsx`** — those components are deprecated and scheduled for removal. Focus reviews on core, form, layout, and advanced components.

---

## File structure

- [ ] Folder name matches component name (PascalCase)
- [ ] `ComponentName.tsx` — metadata + renderer (no native implementation)
- [ ] `ComponentNameNative.tsx` — React implementation only (no metadata)
- [ ] `ComponentName.module.scss` — present for visual components; absent for non-visual
- [ ] `ComponentName.spec.ts` — E2E tests in the same folder
- [ ] No `index.ts` file

---

## Metadata (`ComponentName.tsx`)

- [ ] Uses `createMetadata` with `status`, `description`, `props`, `events`
- [ ] All props have `description`, `valueType`, `defaultValue` (referencing `defaultProps`)
- [ ] Enum props have `availableValues`
- [ ] Required props marked `isRequired: true`
- [ ] Theme variables: `themeVars: parseScssVar(styles.themeVars)` + `defaultThemeVars`
- [ ] Default theme variable names follow `propertyName-ComponentName[-VariantName]`
- [ ] Events use helpers: `dClick`, `dGotFocus`, `dLostFocus`, `dInit`, `d(...)`
- [ ] `nonVisual: true` for non-visual components
- [ ] `parts` declared when component has named sub-elements

---

## Renderer (`ComponentName.tsx`)

- [ ] Uses `createComponentRenderer`
- [ ] **No React hooks** (`useState`, `useEffect`, etc.) inside the renderer function — hooks belong in the native component
- [ ] Every prop extracted with the correct `extractValue.*` method
- [ ] Events wired with `lookupEventHandler("eventName")` matching metadata event keys
- [ ] `style={layoutCss}` always passed to the native component
- [ ] `updateState` and `registerComponentApi` passed through when the component holds state or exposes APIs
- [ ] Registration uses the conditional guard:
  ```typescript
  if (process.env.VITE_USED_COMPONENTS_ComponentName !== "false") {
    this.registerCoreComponent(componentNameComponentRenderer);
  }
  ```

---

## Native component (`ComponentNameNative.tsx`)

- [ ] Uses `forwardRef` with a named function (`function ComponentNameNative(...)`)
- [ ] Wrapped with `React.memo`
- [ ] Exports `defaultProps` object — referenced by metadata
- [ ] `Props` interface defined; optional props use `?`
- [ ] Spreads `...rest` onto the root element
- [ ] Accepts and applies `style` prop explicitly (passes `layoutCss` through)
- [ ] Uses `composeRefs` when internal ref is needed alongside forwarded ref
- [ ] Does NOT use `useImperativeHandle` — uses `registerComponentApi` instead
- [ ] Does NOT set `displayName`
- [ ] Has no XMLUI-specific dependencies (works standalone)
- [ ] Imperative APIs registered in `useEffect` via `registerComponentApi?.({...})`
- [ ] Calls `updateState?.({...})` when value changes

---

## Styling (`ComponentName.module.scss`)

- [ ] Includes the required `$themeVars` boilerplate (see `styling.md`)
- [ ] All theme variables declared with `createThemeVar(...)`
- [ ] Ends with `:export { themeVars: t.json-stringify($themeVars); }`
- [ ] CSS class names use camelCase in SCSS, applied via `classnames`

---

## Parts

- [ ] Parts declared in metadata `parts: { ... }` when component has stylable sub-elements
- [ ] `partClassName(PART_*)` applied to corresponding DOM elements in the native component
- [ ] `defaultPart` set when a sub-element should receive layout properties

---

## Accessibility

- [ ] Interactive elements are keyboard-accessible (`tabIndex={0}`, Enter/Space handlers)
- [ ] `aria-disabled` used for disabled state
- [ ] `aria-label` or `aria-labelledby` for elements without visible text
- [ ] `aria-expanded` for expandable elements
- [ ] Non-interactive elements are not focusable

---

## Testing

- [ ] E2E spec covers: basic rendering, key props, events, accessibility, theme variables
- [ ] Theme variable tests use exact CSS color values (e.g., `"rgb(255, 0, 0)"` not `"red"`)
- [ ] Keyboard tests wait for `toBeFocused()` before pressing keys (race condition prevention)
- [ ] No hooks or `async/await` in XMLUI markup expressions
- [ ] Event handlers use `on` prefix (`onClick=`, not `click=`)


