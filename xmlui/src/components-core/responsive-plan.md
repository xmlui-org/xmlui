# Plan: Responsive `when-*` Attributes

## Resources

- Component conventions: `xmlui/dev-docs/conv-create-components.md`
- Rendering pipeline: `xmlui/dev-docs/standalone-app.md`
- Refactor template: `xmlui/conventions/refactor-template.md`

---

## Analysis

### How `when` currently works

1. **Type** (`abstractions/ComponentDefs.ts`):  
   `when?: string | boolean` stored directly on `ComponentDef`.

2. **Parser** (`parsers/xmlui-parser/transform.ts`, `collectAttribute`):  
   The attribute name `"when"` is a recognised special case → `comp.when = value`.  
   Any unrecognised attribute falls into the default branch and lands in `comp.props`.

3. **Rendering gate** (`components-core/rendering/renderChild.tsx`):  
   ```ts
   if (shouldCheckWhen && !shouldKeep(node.when, state, appContext)) return null;
   ```

4. **Init/cleanup tracking** (`components-core/rendering/ComponentAdapter.tsx`):  
   ```ts
   const currentWhenValue = shouldKeep(safeNode.when, state, appContext);
   ```
   A `useEffect` watches `currentWhenValue` to fire `init`/`cleanup` events on transitions.

5. **`shouldKeep`** (`components-core/utils/extractParam.ts`):  
   Evaluates the `when` string expression (or boolean) against the current component state
   via `extractParam`, returning a boolean.

6. **`ContainerWrapper`** (`components-core/rendering/ContainerWrapper.tsx`):  
   Re-assembles a node-like object including `when: node.when` for the ModalDialog use-case.

### Existing responsive infrastructure

- **Breakpoints** (`abstractions/AppContextDefs.ts`):  
  `MediaBreakpointKeys = ["xs", "sm", "md", "lg", "xl", "xxl"]` → index 0–5.  
  `MediaSize.sizeIndex` carries the active index.

- **`appContext.mediaSize`** flows from `AppContent.tsx` (computed via `useMediaQuery` hooks)
  through `ComponentAdapter.tsx` into `shouldKeep` / `extractParam`.

- **Layout-resolver precedent** (`components-core/theming/layout-resolver.ts`):  
  Layout props already support `width`, `width-xs`, `width-sm`, … stored in `comp.props`.  
  `transformLayoutValue` picks the best match for the current `sizeIndex`.  
  Its fallback scheme differs from Tailwind (it cascades "upward" from xs to md for small screens).

### Tailwind (min-width / mobile-first) scheme — target for `when-*`

The user explicitly requests true Tailwind semantics: `when-md` means **"at md and above ONLY"**.

**Key principle:** When ANY responsive `when-*` attributes are defined, they become the exclusive source of truth. The base `when` is only consulted if **no** responsive attributes exist at all. If no matching responsive rule applies at a given breakpoint, the component is **hidden by default (false)**.

Resolution for a given `sizeIndex` (first defined value wins, working downward):

| Screen | Resolution order |
|--------|-----------------|
| xs (0) | `when-xs` → **false** (no lower breakpoint) |
| sm (1) | `when-sm` → `when-xs` → **false** |
| md (2) | `when-md` → `when-sm` → `when-xs` → **false** |
| lg (3) | `when-lg` → `when-md` → `when-sm` → `when-xs` → **false** |
| xl (4) | `when-xl` → `when-lg` → `when-md` → `when-sm` → `when-xs` → **false** |
| xxl (5)| `when-xxl` → `when-xl` → `when-lg` → `when-md` → `when-sm` → `when-xs` → **false** |

**Special case:** If NO responsive `when-*` attributes are set, the entire responsive resolution is skipped and the base `when` is used (preserving backward compatibility).

**Examples:**
- `<Button when="true" />` → shown at all sizes (no responsive rules, base `when` used)
- `<Button when-md="true" />` → shown only at md and above, hidden at xs/sm
- `<Button when-xs="true" when-md="false" />` → shown at xs/sm, hidden at md and above
- `<Button when="true" when-lg="false" />` → shown at all sizes below lg, hidden at lg and above

---

## Files to Change

| File | Change |
|------|--------|
| `abstractions/ComponentDefs.ts` | Add `responsiveWhen?: Partial<Record<MediaBreakpointType, string \| boolean>>` to `ComponentDef` |
| `parsers/xmlui-parser/transform.ts` | Intercept `when-xs` … `when-xxl` in `collectAttribute`; store in `comp.responsiveWhen` |
| `components-core/utils/extractParam.ts` | Add `resolveResponsiveWhen(node, state, appContext)` utility |
| `components-core/rendering/renderChild.tsx` | Call `resolveResponsiveWhen` instead of `shouldKeep(node.when, …)` |
| `components-core/rendering/ComponentAdapter.tsx` | Use `resolveResponsiveWhen` for `currentWhenValue` |
| `components-core/rendering/ContainerWrapper.tsx` | Forward `responsiveWhen: node.responsiveWhen` alongside `when` |

---

## Refactor Flow (per step)

Each step follows this sequence:
1. Implement the change.
2. Check for linting / TypeScript errors in modified files.
3. Create tests for the new behaviour.
4. Run the new tests and confirm they pass.
5. Run the broader relevant test suite and confirm nothing is broken.
6. Mark the step as **done** in this document.

---

## Step-by-step Plan

### Step 1 — Extend `ComponentDef` type  [x] done

**File:** `abstractions/ComponentDefs.ts`

**Changes made:**
- Added `import type { MediaBreakpointType } from "./AppContextDefs";` at the top
- Added `responsiveWhen?: Partial<Record<MediaBreakpointType, string | boolean>>` property to `ComponentDefCore` interface, right after the `when` property

**Test result:** ✅ All 8464 unit tests passed (no regressions)

---

### Step 2 — Parse `when-xs` … `when-xxl` attributes  [x] done

**File:** `parsers/xmlui-parser/transform.ts`, function `collectAttribute`

**Changes made:**
- Added import: `import { MediaBreakpointKeys } from "../../abstractions/AppContextDefs";`
- Added logic in the `default` case of `collectAttribute` to intercept `when-*` attributes:
  - Checks if attribute name starts with `"when-"`
  - Extracts the breakpoint name (e.g., `md` from `when-md`)
  - Validates it against `MediaBreakpointKeys`
  - Stores in `comp.responsiveWhen` instead of `comp.props`
  - Unknown `when-*` suffixes (like `when-zz`) still land in `comp.props`

**Tests created (in `tests/parsers/xmlui/transform.attr.test.ts`):**
- ✓ `when-md` responds attribute is parsed correctly
- ✓ Multiple `when-*` attributes are parsed correctly
- ✓ Invalid `when-*` suffix lands in props
- ✓ `when-*` and `when` coexist

**Test result:** ✅ All 8472 unit tests passed (including 4 new responsive tests, 0 regressions)

---

### Step 3 — `resolveResponsiveWhen` utility  [x] done

**File:** `components-core/utils/extractParam.ts`

**Changes made:**
- Added imports: `MediaBreakpointType` and `MediaBreakpointKeys` from `AppContextDefs`
- Implemented `resolveResponsiveWhen()` function that:
  - Delegates to `shouldKeep()` if no responsive rules exist (backward compatibility)
  - Falls back to base `when` if `sizeIndex` is undefined
  - Walks from current breakpoint down to "xs" (Tailwind mobile-first)
  - Returns first defined responsive value found
  - Returns false if no responsive rule matches (hidden by default)

**Tests created (in `tests/components-core/utils/resolveResponsiveWhen.test.ts`):**
24 comprehensive test cases covering:
- ✓ No responsiveWhen (uses base when)
- ✓ Single responsive rules at exact breakpoints
- ✓ Rules inherited upward (Tailwind mobile-first)
- ✓ No matching rule below defined breakpoint (returns false)
- ✓ Multiple rules + precedence (most specific wins)
- ✓ With base `when` (responsive wins)
- ✓ Boolean literals and expression strings
- ✓ sizeIndex undefined (falls back to base when)
- ✓ Full cascade tests

**Test result:** ✅ All 8496 unit tests passed (including 24 new resolveResponsiveWhen tests, 0 regressions)

---

### Step 4 — Wire `resolveResponsiveWhen` into rendering  [x] done

**Files:**
- `components-core/rendering/renderChild.tsx`
- `components-core/rendering/ComponentAdapter.tsx`
- `components-core/rendering/ContainerWrapper.tsx`

**renderChild.tsx** — replace:
```ts
if (shouldCheckWhen && !shouldKeep(node.when, state, appContext)) {
```
with:
```ts
if (shouldCheckWhen && !resolveResponsiveWhen(node.when, node.responsiveWhen, state, appContext)) {
```

**ComponentAdapter.tsx** — replace:
```ts
const currentWhenValue = shouldKeep(safeNode.when, state, appContext);
```
with:
```ts
const currentWhenValue = resolveResponsiveWhen(safeNode.when, safeNode.responsiveWhen, state, appContext);
```

**ContainerWrapper.tsx** — extend the re-assembled node object to also carry `responsiveWhen`:
```ts
when: node.when,
responsiveWhen: node.responsiveWhen,
```

**Tests:**
Write E2E rendering specs (using `initTestBed` + `page.setViewportSize`) covering:
- `<Text testId="t" when-md="true" />` is **hidden** at xs/sm and **visible** at md and above (true Tailwind semantics).
- `<Text testId="t" when="true" when-md="false" />` is **visible** at xs/sm, **hidden** at md and above.
- `<Text testId="t" when="true" />` is **visible** at all sizes (no responsive rules, base `when` used).
- `<Text testId="t" when-xs="true" when-lg="false" />` is **visible** at xs/sm/md, **hidden** at lg and above.
- A component with only a base `when` (no responsive keys) behaves exactly as before (backward compat).
- `init` and `cleanup` events fire correctly on responsive `when` transitions (viewport resize).

Run the new specs: `npx playwright test <spec-file>` from the workspace root.  
Then run the full unit suite: `npm run test:unit` to verify no existing tests broke.

---

### Step 5 — Changeset  [x] done

Create `.changeset/<unique-name>.md`:

```
---
"xmlui": patch
---

Add responsive `when-xs`, `when-sm`, `when-md`, `when-lg`, `when-xl`, `when-xxl` attributes
that control component visibility per breakpoint, following Tailwind's mobile-first (min-width)
convention. A responsive `when-*` attribute overrides the base `when` for its applicable
screen-size range.
```

Verify with `npx changeset status` at the monorepo root.

---

## Commands

```bash
# Build check (slow, ~2 min)
cd xmlui && npm run build:xmlui-standalone

# Unit tests (fast, ~40 s)
cd xmlui && npm run test:unit

# Single test file
cd xmlui && npm run test:unit -- extractParam
```
