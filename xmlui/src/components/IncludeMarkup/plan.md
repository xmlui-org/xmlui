# Plan: IncludeMarkup Component

## Background

Issue [#2264](https://github.com/xmlui-org/xmlui/issues/2264) describes a proof-of-concept `Include` component that dynamically fetches XMLUI markup from a URL and renders it inline. This plan formalises the approach as a production-ready `IncludeMarkup` component.

**Problem statement**: Users want a way to share fragments of XMLUI markup (e.g. common headers/footers) across multiple XMLUI apps by hosting them at a URL and including them at runtime.

---

## Design Decisions

### Component name
`IncludeMarkup` — unambiguous, avoids collision with future `<Include>` server-side include semantics.

### File layout
Single-file pattern (`IncludeMarkup.tsx`): the component is simple and self-contained; hooks live directly in the renderer (allowed by XMLUI's React-based renderer model). No separate `IncludeMarkupNative.tsx` or SCSS module needed.

### API

| Element | Type | Description |
|---|---|---|
| `url` | `string` prop | URL to fetch XMLUI markup from. Re-fetches when changed. |
| `loadingContent` | template prop | Optional content rendered while the request is in-flight. |
| `didLoad` | event | Fires after successful load and parse; no arguments. |
| `didFail` | event `(message: string) => void` | Fires on fetch failure or parse error. |

### Security
Fetched markup is run through `xmlUiMarkupToComponent`. The XMLUI parser does not execute `<script>` blocks, so fetched code can only use declarative XMLUI markup. CORS enforcement is delegated to the browser/server.

### Key logic (inside renderer)
1. `useState` tracks `status: 'idle' | 'loading' | 'loaded' | 'error'` and the parsed `componentDef`.
2. `useEffect` (keyed on `url`) executes the fetch + parse cycle, with `isMounted` guard for unmount safety.
3. If the top-level parsed node is a `<Component>`, its `children` are rendered (unwrapping the name declaration).
4. Errors (fetch or parse) call `errReportComponent` to show an inline error display and fire `didFail`.
5. While loading, `renderChild(node.props.loadingContent)` is rendered if provided.

### Registration
Added to the `VITE_INCLUDE_REST_COMPONENTS` block in `ComponentProvider.tsx`.

### Status
`experimental` — matches the spirit of the issue; can be promoted to `stable` later.

---

## Implementation Steps

### Step 1 — Core component (`IncludeMarkup.tsx`) [x]
Create `xmlui/src/components/IncludeMarkup/IncludeMarkup.tsx`:
- Metadata (`IncludeMarkupMd`): `url`, `loadingContent`, `didLoad`, `didFail`
- Renderer (`includeMarkupComponentRenderer`): fetch → parse → render via `renderChild`
- Handles: loading state, fetch errors, parse errors, Component-node unwrapping, URL changes, unmount cleanup

### Step 2 — Registration in ComponentProvider [x]
- Import `includeMarkupComponentRenderer` from `"./IncludeMarkup/IncludeMarkup"` in `ComponentProvider.tsx`
- Add `this.registerCoreComponent(includeMarkupComponentRenderer)` inside `VITE_INCLUDE_REST_COMPONENTS` block

### Step 3 — E2E test suite (`IncludeMarkup.spec.ts`) [x]
Create `xmlui/src/components/IncludeMarkup/IncludeMarkup.spec.ts`.

Use Playwright `page.route()` to intercept HTTP requests and return mock XMLUI markup, avoiding real network calls.

Tests to cover:

**Basic Functionality**
- Renders a fetched `<Fragment>` with children visible
- Renders a fetched `<Component>` by unwrapping to its children
- Shows `loadingContent` while the request is in-flight
- `didLoad` event fires after successful render
- `didFail` event fires on network error
- `didFail` event fires on parse error
- Re-fetches when `url` prop changes

**Accessibility**
- Rendered children are accessible (no wrapper element injected)

**Other Edge Cases**
- Renders nothing (no error) when `url` is empty/not provided
- Handles slow responses (loading state visible until response arrives)

### Step 4 — Build validation [x]

> TypeScript pre-existing error in NavigateAction.tsx (unrelated); no new errors introduced.
Run `npm run build:xmlui-standalone` to confirm the TypeScript compiles without errors.

### Step 5 — Test run [x]

All 11 tests pass with both `--workers=1` and `--workers=10`.
Run E2E tests:
```bash
npx playwright test IncludeMarkup.spec.ts --reporter=line --workers=1
```
Then final stability check:
```bash
npx playwright test IncludeMarkup.spec.ts --workers=10
```

---

## Files to Create / Modify

| File | Action |
|---|---|
| `xmlui/src/components/IncludeMarkup/IncludeMarkup.tsx` | Create |
| `xmlui/src/components/IncludeMarkup/IncludeMarkup.spec.ts` | Create |
| `xmlui/src/components/ComponentProvider.tsx` | Modify (import + register) |
