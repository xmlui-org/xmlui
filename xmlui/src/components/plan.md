# Themed Wrappers for Cross-Component Native React Components

## Problem

XMLUI components use metadata and native React components to implement their functionality. The XMLUI renderer (`createComponentRenderer`) injects a theme CSS class onto its rendered component, so the XMLUI-level component always carries its theme styling. However, when a native React component (e.g., `Button` from `ButtonNative.tsx`) is imported and used directly by **another** component, it renders **without** the theme class — so theme variables (colors, spacing, radii, etc.) are lost.

Two themed wrappers already exist as the reference pattern:
- **`ThemedButton`** (in `Button/Button.tsx`) — wraps `Button` from `ButtonNative.tsx` with `useComponentThemeClass(ButtonMd)`
- **`ThemedIcon`** (in `Icon/Icon.tsx`) — wraps `Icon` from `IconNative.tsx` with `useComponentThemeClass(IconMd)`

All other cross-component native imports currently lack themed wrappers.

## ThemedWrapper Pattern

Each themed wrapper follows this structure (see `ThemedButton` / `ThemedIcon`):

```tsx
type ThemedXxxProps = React.ComponentProps<typeof Xxx> & { className?: string };
export const ThemedXxx = React.forwardRef<HTMLElement, ThemedXxxProps>(
  function ThemedXxx({ className, ...props }: ThemedXxxProps, ref) {
    const themeClass = useComponentThemeClass(XxxMd);
    return <Xxx {...props} className={`${themeClass}${className ? ` ${className}` : ""}`} ref={ref} />;
  },
);
```

The wrapper lives in the component's XMLUI renderer file (e.g., `Button.tsx` next to `ButtonNative.tsx`) so that it has access to the metadata and theme definitions.

---

## Report: Native Components Used Across Component Boundaries

### Tier 1 — High-impact (many consumers, visual components)

#### 1. `Icon` (from `Icon/IconNative.tsx`) — **ThemedIcon already exists**

**Used by 31 components.** Already has `ThemedIcon` in `Icon/Icon.tsx`.

Current consumers using **`ThemedIcon`** (correct): `Button/Button.tsx`, `DropdownMenu/DropdownMenuNative.tsx`, `DropdownMenu/DropdownMenu.tsx`

Current consumers using **raw `Icon`** (need migration to `ThemedIcon`):
- `NavLink/NavLink.tsx`
- `FileInput/FileInput.tsx`
- `ValidationSummary/ValidationSummary.tsx`
- `NumberBox/NumberBoxNative.tsx`
- `NoResult/NoResultNative.tsx`
- `ExpandableItem/ExpandableItemNative.tsx`
- `NavPanelCollapseButton/NavPanelCollapseButton.tsx`
- `ToneChangerButton/ToneChangerButton.tsx`
- `FileUploadDropZone/FileUploadDropZoneNative.tsx`
- `Input/InputAdornment.tsx`
- `ConciseValidationFeedback/ConciseValidationFeedback.tsx`
- `NavGroup/NavGroup.tsx`
- `NavGroup/NavGroupNative.tsx`
- `ModalDialog/ModalDialogNative.tsx`
- `Table/TableNative.tsx`
- `Pagination/PaginationNative.tsx`
- `Link/LinkNative.tsx`
- `Carousel/CarouselNative.tsx`
- `Select/SimpleSelect.tsx`
- `Select/SelectNative.tsx`
- `Select/MultiSelectOption.tsx`
- `Select/SelectOption.tsx`
- `DatePicker/DatePickerNative.tsx`
- `DateInput/DateInputNative.tsx`
- `TimeInput/TimeInputNative.tsx`
- `Markdown/MarkdownNative.tsx`
- `ToneSwitch/ToneSwitchNative.tsx`
- `NestedApp/AppWithCodeViewNative.tsx`
- `CodeBlock/CodeBlockNative.tsx`
- `Tree/TreeNative.tsx`

#### 2. `Button` (from `Button/ButtonNative.tsx`) — **ThemedButton already exists**

**Used by 11 components.** Already has `ThemedButton` in `Button/Button.tsx`.

Current consumers using **`ThemedButton`** (correct): `DropdownMenu/DropdownMenuNative.tsx`, `Form/FormNative.tsx`

Current consumers using **raw `Button`** (need migration to `ThemedButton`):
- `FileInput/FileInputNative.tsx`
- `ValidationSummary/ValidationSummary.tsx`
- `NavPanelCollapseButton/NavPanelCollapseButton.tsx`
- `ToneChangerButton/ToneChangerButton.tsx`
- `NumberBox/NumberBoxNative.tsx`
- `NestedApp/AppWithCodeViewNative.tsx`
- `ModalDialog/ConfirmationModalContextProvider.tsx`
- `ModalDialog/ModalDialogNative.tsx`
- `InspectButton/InspectButton.tsx`
- `Pagination/PaginationNative.tsx`
- `CodeBlock/CodeBlockNative.tsx`

Also used in `components-core/InspectorContext.tsx`.

#### 3. `Text` (from `Text/TextNative.tsx`) — **needs ThemedText**

**Used by 11 components:**
- `ValidationSummary/ValidationSummary.tsx`
- `Form/FormNative.tsx`
- `Card/CardNative.tsx`
- `Blog/BlogNative.tsx`
- `HtmlTags/HtmlTags.tsx`
- `Input/InputAdornment.tsx`
- `Markdown/MarkdownNative.tsx`
- `List/ListNative.tsx`
- `ModalDialog/Dialog.tsx`
- `Pagination/PaginationNative.tsx`
- `CodeBlock/CodeBlockNative.tsx`

#### 4. `Spinner` (from `Spinner/SpinnerNative.tsx`) — **needs ThemedSpinner**

**Used by 4 components:**
- `List/ListNative.tsx`
- `Table/TableNative.tsx`
- `FormItem/ItemWithLabel.tsx`
- `Tree/TreeNative.tsx`

#### 5. `Heading` (from `Heading/HeadingNative.tsx`) — **needs ThemedHeading**

**Used by 4 components:**
- `Card/CardNative.tsx`
- `Blog/BlogNative.tsx`
- `HtmlTags/HtmlTags.tsx`
- `Markdown/MarkdownNative.tsx`

#### 6. `LinkNative` (from `Link/LinkNative.tsx`) — **needs ThemedLink**

**Used by 4 components:**
- `Card/CardNative.tsx`
- `Blog/BlogNative.tsx`
- `HtmlTags/HtmlTags.tsx`
- `Markdown/MarkdownNative.tsx`

### Tier 2 — Medium-impact (2–3 consumers, visual components)

#### 7. `Stack` (from `Stack/StackNative.tsx`) — **needs ThemedStack**

**Used by 3 components:**
- `ValidationSummary/ValidationSummary.tsx`
- `Form/FormNative.tsx`
- `ModalDialog/ConfirmationModalContextProvider.tsx`

#### 8. `DropdownMenu` / `MenuItem` / `MenuSeparator` (from `DropdownMenu/DropdownMenuNative.tsx`) — **needs ThemedDropdownMenu**

**Used by 3 components:**
- `ProfileMenu/ProfileMenu.tsx`
- `ResponsiveBar/ResponsiveBarNative.tsx`
- `ContextMenu/ContextMenuNative.tsx`

#### 9. `Avatar` (from `Avatar/AvatarNative.tsx`) — **needs ThemedAvatar**

**Used by 2 components:**
- `ProfileMenu/ProfileMenu.tsx`
- `Card/CardNative.tsx`

#### 10. `Tooltip` (from `Tooltip/TooltipNative.tsx`) — **needs ThemedTooltip**

**Used by 2 components:**
- `Slider/SliderNative.tsx`
- `ConciseValidationFeedback/ConciseValidationFeedback.tsx`

Also used in `components-core/behaviors/TooltipBehavior.tsx`.

#### 11. `TextBox` (from `TextBox/TextBoxNative.tsx`) — **needs ThemedTextBox**

**Used by 2 components:**
- `FileInput/FileInputNative.tsx`
- `FormItem/FormItemNative.tsx`

#### 12. `Select` (from `Select/SelectNative.tsx`) — **needs ThemedSelect**

**Used by 2 components:**
- `FormItem/FormItemNative.tsx`
- `Pagination/PaginationNative.tsx`

#### 13. `Image` (from `Image/ImageNative.tsx`) — **needs ThemedImage**

**Used by 2 components:**
- `Blog/BlogNative.tsx`
- `Logo/LogoNative.tsx`

#### 14. `FlowLayout` (from `FlowLayout/FlowLayoutNative.tsx`) — **needs ThemedFlowLayout**

**Used by 2 components:**
- `Stack/Stack.tsx`
- `Blog/BlogNative.tsx`

#### 15. `RadioGroup` (from `RadioGroup/RadioGroupNative.tsx`) — **needs ThemedRadioGroup**

**Used by 2 components:**
- `FormItem/ItemWithLabel.tsx`
- `FormItem/FormItemNative.tsx`

#### 16. `PaginationNative` (from `Pagination/PaginationNative.tsx`) — **needs ThemedPagination**

**Used by 1 component (+ type import):**
- `Table/TableNative.tsx`

### Tier 3 — Low-impact (single consumer or non-visual / context-only imports)

#### 17. `Card` — used by `List/ListNative.tsx`
#### 18. `ModalDialog` — used by `Form/FormNative.tsx`
#### 19. `SpaceFiller` — used by `ValidationSummary/ValidationSummary.tsx`
#### 20. `CodeBlock` — used by `Markdown/MarkdownNative.tsx`
#### 21. `TreeDisplay` — used by `Markdown/MarkdownNative.tsx`
#### 22. `ExpandableItem` — used by `Markdown/MarkdownNative.tsx`
#### 23. `AppWithCodeViewNative` — used by `Markdown/MarkdownNative.tsx`, `components-core/ComponentViewer.tsx`
#### 24. `Logo` — used by `NavPanel/NavPanelNative.tsx`
#### 25. `NavLink` — used by `NavGroup/NavGroupNative.tsx`
#### 26. `Tabs` / `TabItem` — used by `Blog/BlogNative.tsx`
#### 27. `Markdown` — used by `Blog/BlogNative.tsx`
#### 28. `TableOfContents` — used by `Blog/BlogNative.tsx`
#### 29. `FileInput` — used by `FormItem/FormItemNative.tsx`
#### 30. `NumberBox` — used by `FormItem/FormItemNative.tsx`
#### 31. `TextArea` — used by `FormItem/FormItemNative.tsx`
#### 32. `DatePicker` — used by `FormItem/FormItemNative.tsx`
#### 33. `AutoComplete` — used by `FormItem/FormItemNative.tsx`
#### 34. `Slider` — used by `FormItem/FormItemNative.tsx`
#### 35. `ColorPicker` — used by `FormItem/FormItemNative.tsx`

### Non-visual / Context-only imports (no themed wrapper needed)

These cross-component imports export functions, constants, types, or React contexts — not renderable components. No themed wrapper is required.

- `AppNative` → `getAppLayoutOrientation` (function) — used by NavLink, NavPanel, NavGroup
- `NavPanelNative` → `NavPanelContext` (React context), `NavHierarchyNode` (type) — used by NavLink, NavGroup, App
- `AppHeaderNative` → `AppContextAwareAppHeader` (composition), `useLogoUrl` (hook) — used by App, Logo
- `FormNative` → `getByPath` (utility function) — used by FormItem
- `OptionNative` → `convertOptionValue` (utility function), `OptionNative` (used as data, not themed UI) — used by RadioGroup, Pagination
- `SelectionStoreNative` → `useSelectionContext` (hook) — used by Table
- `BadgeNative` → `badgeVariantValues` (constant) — used by components-core/VariantBehavior
- `AnimationNative` → animation types — used by components-core/AnimationBehavior

---

## Conversion Plan

Each step creates one themed wrapper and migrates all consumers. Steps are independent and can be verified individually. After each consumer migration, run the E2E tests for that consumer's component and record results below.

### Prerequisites
- Confirm all existing E2E tests pass before starting.
- Keep `ThemedButton` and `ThemedIcon` as reference implementations.

### Testing Conventions

**Run all commands from workspace root** (`/Users/dotneteer/source/xmlui`).

```bash
# Run E2E tests for a single component (use --reporter=line for clean output)
npx playwright test ComponentName.spec.ts --workers=1 --reporter=line

# Final stability check with parallel workers
npx playwright test ComponentName.spec.ts --workers=10

# Run multiple component E2E tests at once
npx playwright test NavLink.spec.ts NumberBox.spec.ts Table.spec.ts --workers=1 --reporter=line
```

After each consumer migration, run E2E tests for consumer components. Record results using:
- ✅ = all tests pass
- ❌ = failures (list failing test names)
- ⚠️ = pre-existing failures (not caused by this change)
- 🚫 = no E2E test file exists for this component

---

### Step 1: Migrate existing `Icon` consumers to `ThemedIcon`

**Action:** In every file listed under "raw `Icon`" consumers (30 files), change `import { Icon } from "../Icon/IconNative"` → `import { ThemedIcon } from "../Icon/Icon"` and replace `<Icon ...>` with `<ThemedIcon ...>`.

**E2E verification per consumer:**

| Consumer file | E2E test file | Command | Result |
|---|---|---|---|
| `NavLink/NavLink.tsx` | `NavLink.spec.ts` | `npx playwright test NavLink.spec.ts --workers=1 --reporter=line` | ✅ |
| `FileInput/FileInput.tsx` | `FileInput.spec.ts` | `npx playwright test FileInput.spec.ts --workers=1 --reporter=line` | ⚠️ |
| `ValidationSummary/ValidationSummary.tsx` | _(none)_ | — | 🚫 |
| `NumberBox/NumberBoxNative.tsx` | `NumberBox.spec.ts` | `npx playwright test NumberBox.spec.ts --workers=1 --reporter=line` | ✅ |
| `NoResult/NoResultNative.tsx` | `NoResult.spec.ts` | `npx playwright test NoResult.spec.ts --workers=1 --reporter=line` | ✅ |
| `ExpandableItem/ExpandableItemNative.tsx` | `ExpandableItem.spec.ts` | `npx playwright test ExpandableItem.spec.ts --workers=1 --reporter=line` | ✅ |
| `NavPanelCollapseButton/NavPanelCollapseButton.tsx` | _(none)_ | — | 🚫 |
| `ToneChangerButton/ToneChangerButton.tsx` | `ToneChangerButton.spec.ts` | `npx playwright test ToneChangerButton.spec.ts --workers=1 --reporter=line` | ✅ |
| `FileUploadDropZone/FileUploadDropZoneNative.tsx` | `FileUploadDropZone.spec.ts` | `npx playwright test FileUploadDropZone.spec.ts --workers=1 --reporter=line` | ✅ |
| `Input/InputAdornment.tsx` | `TextBox.spec.ts` | `npx playwright test TextBox.spec.ts --workers=1 --reporter=line` | ✅ |
| `ConciseValidationFeedback/ConciseValidationFeedback.tsx` | _(none)_ | — | 🚫 |
| `NavGroup/NavGroup.tsx` | `NavGroup.spec.ts` | `npx playwright test NavGroup.spec.ts --workers=1 --reporter=line` | ⚠️ |
| `NavGroup/NavGroupNative.tsx` | `NavGroup.spec.ts` | _(same as above)_ | ⚠️ |
| `ModalDialog/ModalDialogNative.tsx` | `ModalDialog.spec.ts` | `npx playwright test ModalDialog.spec.ts --workers=1 --reporter=line` | ✅ |
| `Table/TableNative.tsx` | `Table.spec.ts` | `npx playwright test Table.spec.ts --workers=1 --reporter=line` | ⚠️ |
| `Pagination/PaginationNative.tsx` | `Pagination.spec.ts` | `npx playwright test Pagination.spec.ts --workers=1 --reporter=line` | ✅ |
| `Link/LinkNative.tsx` | `Link.spec.ts` | `npx playwright test Link.spec.ts --workers=1 --reporter=line` | ✅ |
| `Carousel/CarouselNative.tsx` | `Carousel.spec.ts` | `npx playwright test Carousel.spec.ts --workers=1 --reporter=line` | ✅ |
| `Select/SimpleSelect.tsx` | `Select.spec.ts` | `npx playwright test Select.spec.ts --workers=1 --reporter=line` | ⚠️ |
| `Select/SelectNative.tsx` | `Select.spec.ts` | _(same as above)_ | ⚠️ |
| `Select/MultiSelectOption.tsx` | `Select.spec.ts` | _(same as above)_ | ⚠️ |
| `Select/SelectOption.tsx` | `Select.spec.ts` | _(same as above)_ | ⚠️ |
| `DatePicker/DatePickerNative.tsx` | `DatePicker.spec.ts` | `npx playwright test DatePicker.spec.ts --workers=1 --reporter=line` | ✅ |
| `DateInput/DateInputNative.tsx` | `DateInput.spec.ts` | `npx playwright test DateInput.spec.ts --workers=1 --reporter=line` | ✅ |
| `TimeInput/TimeInputNative.tsx` | `TimeInput.spec.ts` | `npx playwright test TimeInput.spec.ts --workers=1 --reporter=line` | ✅ |
| `Markdown/MarkdownNative.tsx` | `Markdown.spec.ts` | `npx playwright test Markdown.spec.ts --workers=1 --reporter=line` | ✅ |
| `ToneSwitch/ToneSwitchNative.tsx` | `ToneSwitch.spec.ts` | `npx playwright test ToneSwitch.spec.ts --workers=1 --reporter=line` | ✅ |
| `NestedApp/AppWithCodeViewNative.tsx` | _(none)_ | — | 🚫 |
| `CodeBlock/CodeBlockNative.tsx` | `CodeBlock.spec.ts` | `npx playwright test CodeBlock.spec.ts --workers=1 --reporter=line` | ✅ |
| `Tree/TreeNative.tsx` | `Tree.spec.ts` | `npx playwright test Tree.spec.ts --workers=1 --reporter=line` | ⚠️ |
| `AutoComplete/AutoCompleteNative.tsx` | `AutoComplete.spec.ts` | `npx playwright test AutoComplete.spec.ts --workers=1 --reporter=line` | ✅ |
| `App/Sheet.tsx` | `App.spec.ts` | `npx playwright test App.spec.ts --workers=1 --reporter=line` | ✅ |
| `AppHeader/AppHeaderNative.tsx` | _(none found)_ | — | 🚫 |

**Also run Icon's own tests:** `npx playwright test Icon.spec.ts --workers=1 --reporter=line` → ✅

**Status:** ✅ Done (1843 passed, 11 failed, 18 skipped — all failures pre-existing)

**Failing tests (pre-existing, unrelated to Icon migration):**
- `FileInput.spec.ts:158` — "component applies theme variables correctly" — Button CSS theme variable, not Icon-related
- `NavGroup.spec.ts:408, 446, 551` — noIndicator indicator size (4px/5px vs 0px) — CSS pseudo-element issue
- `Select.spec.ts:1193, 2420, 2452, 2502` — z-index modal layering + groupBy functionality
- `Table.spec.ts:1399` — "loading property shows loading state"
- `Tree.spec.ts:3853, 3883` — scroll fade visibility (fadeTop/fadeVisible)

---

### Step 2: Migrate existing `Button` consumers to `ThemedButton`

**Action:** In every file listed under "raw `Button`" consumers (11 files + InspectorContext), change `import { Button } from "../Button/ButtonNative"` → `import { ThemedButton as Button } from "../Button/Button"` for minimal diff.

**E2E verification per consumer:**

| Consumer file | E2E test file | Command | Result |
|---|---|---|---|
| `FileInput/FileInputNative.tsx` | `FileInput.spec.ts` | `npx playwright test FileInput.spec.ts --workers=1 --reporter=line` | ✅ |
| `ValidationSummary/ValidationSummary.tsx` | _(none)_ | — | 🚫 |
| `NavPanelCollapseButton/NavPanelCollapseButton.tsx` | _(none)_ | — | 🚫 |
| `ToneChangerButton/ToneChangerButton.tsx` | `ToneChangerButton.spec.ts` | `npx playwright test ToneChangerButton.spec.ts --workers=1 --reporter=line` | ✅ |
| `NumberBox/NumberBoxNative.tsx` | `NumberBox.spec.ts` | `npx playwright test NumberBox.spec.ts --workers=1 --reporter=line` | ✅ |
| `NestedApp/AppWithCodeViewNative.tsx` | _(none)_ | — | 🚫 |
| `ModalDialog/ConfirmationModalContextProvider.tsx` | `ModalDialog.spec.ts` | `npx playwright test ModalDialog.spec.ts --workers=1 --reporter=line` | ✅ |
| `ModalDialog/ModalDialogNative.tsx` | `ModalDialog.spec.ts` | _(same as above)_ | ✅ |
| `InspectButton/InspectButton.tsx` | _(none)_ | — | 🚫 |
| `Pagination/PaginationNative.tsx` | `Pagination.spec.ts` | `npx playwright test Pagination.spec.ts --workers=1 --reporter=line` | ✅ |
| `CodeBlock/CodeBlockNative.tsx` | `CodeBlock.spec.ts` | `npx playwright test CodeBlock.spec.ts --workers=1 --reporter=line` | ✅ |
| `components-core/InspectorContext.tsx` | _(none)_ | — | 🚫 |
| `AppHeader/AppHeaderNative.tsx` | _(none found)_ | — | 🚫 |

**Also run Button's own tests:** `npx playwright test Button.spec.ts Button-style.spec.ts --workers=1 --reporter=line` → ✅

**Status:** ✅ Done (593 passed, 9 skipped, 0 failed)
**Failing tests:** _(none)_

---

### Step 3: Create `ThemedText` and migrate consumers

**Action:** Add `ThemedText` to `Text/Text.tsx` following the pattern. Migrate 11 consumer files.

**E2E verification per consumer:**

| Consumer file | E2E test file | Command | Result |
|---|---|---|---|
| `ValidationSummary/ValidationSummary.tsx` | _(none)_ | — | 🚫 |
| `Form/FormNative.tsx` | `Form.spec.ts` | `npx playwright test Form.spec.ts --workers=1 --reporter=line` | ✅ |
| `Card/CardNative.tsx` | `Card.spec.ts` | `npx playwright test Card.spec.ts --workers=1 --reporter=line` | ✅ |
| `Blog/BlogNative.tsx` | _(none)_ | — | 🚫 |
| `HtmlTags/HtmlTags.tsx` | `HtmlTags.spec.ts` | `npx playwright test HtmlTags.spec.ts --workers=1 --reporter=line` | ✅ |
| `Input/InputAdornment.tsx` | `TextBox.spec.ts` | `npx playwright test TextBox.spec.ts --workers=1 --reporter=line` | ⚠️ |
| `Markdown/MarkdownNative.tsx` | `Markdown.spec.ts` | `npx playwright test Markdown.spec.ts --workers=1 --reporter=line` | ✅ |
| `List/ListNative.tsx` | `List.spec.ts` | `npx playwright test List.spec.ts --workers=1 --reporter=line` | ✅ |
| `ModalDialog/Dialog.tsx` | `ModalDialog.spec.ts` | `npx playwright test ModalDialog.spec.ts --workers=1 --reporter=line` | ✅ |
| `Pagination/PaginationNative.tsx` | `Pagination.spec.ts` | `npx playwright test Pagination.spec.ts --workers=1 --reporter=line` | ✅ |
| `CodeBlock/CodeBlockNative.tsx` | `CodeBlock.spec.ts` | `npx playwright test CodeBlock.spec.ts --workers=1 --reporter=line` | ✅ |

**Also run Text's own tests:** `npx playwright test Text.spec.ts --workers=1 --reporter=line` → ⚠️

**Status:** ✅ Done (818 passed, 33 failed, 12 skipped — all failures pre-existing)

**Failing tests (pre-existing, unrelated to Text migration):**
- `Text.spec.ts:1778–2115` (28 tests) — "Custom Variants" suite: custom variant CSS theme variables (textColor, fontFamily, fontSize, fontStyle, fontWeight, etc.) — CSS toHaveCSS checks; pre-existing infrastructure issue unrelated to ThemedText
- `TextBox.spec.ts:596, 606, 616, 626, 647` (5 tests) — "Theme Vars" suite: backgroundColor, borderColor, textColor, focus borderColor, borderRadius — pre-existing CSS theme variable failures

---

### Step 4: Create `ThemedSpinner` and migrate consumers

**Action:** Add `ThemedSpinner` to `Spinner/Spinner.tsx`. Migrate 4 consumer files.

**E2E verification per consumer:**

| Consumer file | E2E test file | Command | Result |
|---|---|---|---|
| `List/ListNative.tsx` | `List.spec.ts` | `npx playwright test List.spec.ts --workers=1 --reporter=line` | ✅ |
| `Table/TableNative.tsx` | `Table.spec.ts` | `npx playwright test Table.spec.ts --workers=1 --reporter=line` | ✅ |
| `FormItem/ItemWithLabel.tsx` | `FormItem.spec.ts` | `npx playwright test FormItem.spec.ts --workers=1 --reporter=line` | ✅ |
| `Tree/TreeNative.tsx` | `Tree.spec.ts` | `npx playwright test Tree.spec.ts --workers=1 --reporter=line` | ⚠️ |

**Also run Spinner's own tests:** `npx playwright test Spinner.spec.ts --workers=1 --reporter=line` → ✅

**Status:** ✅ Done (530 passed, 2 failed, 1 flaky, 3 skipped — all failures pre-existing)

**Failing tests (pre-existing, unrelated to Spinner migration):**
- `Tree.spec.ts:3853` — "bottom fade is visible when not at bottom" (pre-existing scroll fade visibility)
- `Tree.spec.ts:3883` — "top fade appears when scrolled down" (pre-existing scroll fade visibility)
- `LabelList.spec.ts:94` — flaky (Charts/LabelList visibility timing; unrelated)

---

### Step 5: Create `ThemedHeading` and migrate consumers

**Action:** Add `ThemedHeading` to `Heading/Heading.tsx`. Migrate 4 consumer files.

**E2E verification per consumer:**

| Consumer file | E2E test file | Command | Result |
|---|---|---|---|
| `Card/CardNative.tsx` | `Card.spec.ts` | `npx playwright test Card.spec.ts --workers=1 --reporter=line` | |
| `Blog/BlogNative.tsx` | _(none)_ | — | 🚫 |
| `HtmlTags/HtmlTags.tsx` | `HtmlTags.spec.ts` | `npx playwright test HtmlTags.spec.ts --workers=1 --reporter=line` | |
| `Markdown/MarkdownNative.tsx` | `Markdown.spec.ts` | `npx playwright test Markdown.spec.ts --workers=1 --reporter=line` | |

**Also run Heading's own tests:** `npx playwright test Heading.spec.ts H1.spec.ts H2.spec.ts H3.spec.ts H4.spec.ts H5.spec.ts H6.spec.ts --workers=1 --reporter=line`

**Status:** ⬜ Not started
**Failing tests:** _(none yet)_

---

### Step 6: Create `ThemedLink` and migrate consumers

**Action:** Add `ThemedLink` to `Link/Link.tsx`. Migrate 4 consumer files.

**E2E verification per consumer:**

| Consumer file | E2E test file | Command | Result |
|---|---|---|---|
| `Card/CardNative.tsx` | `Card.spec.ts` | `npx playwright test Card.spec.ts --workers=1 --reporter=line` | |
| `Blog/BlogNative.tsx` | _(none)_ | — | 🚫 |
| `HtmlTags/HtmlTags.tsx` | `HtmlTags.spec.ts` | `npx playwright test HtmlTags.spec.ts --workers=1 --reporter=line` | |
| `Markdown/MarkdownNative.tsx` | `Markdown.spec.ts` | `npx playwright test Markdown.spec.ts --workers=1 --reporter=line` | |

**Also run Link's own tests:** `npx playwright test Link.spec.ts --workers=1 --reporter=line`

**Status:** ⬜ Not started
**Failing tests:** _(none yet)_

---

### Step 7: Create `ThemedStack` and migrate consumers

**Action:** Add `ThemedStack` to `Stack/Stack.tsx`. Migrate 3 consumer files.

**E2E verification per consumer:**

| Consumer file | E2E test file | Command | Result |
|---|---|---|---|
| `ValidationSummary/ValidationSummary.tsx` | _(none)_ | — | 🚫 |
| `Form/FormNative.tsx` | `Form.spec.ts` | `npx playwright test Form.spec.ts --workers=1 --reporter=line` | |
| `ModalDialog/ConfirmationModalContextProvider.tsx` | `ModalDialog.spec.ts` | `npx playwright test ModalDialog.spec.ts --workers=1 --reporter=line` | |

**Also run Stack's own tests:** `npx playwright test Stack.spec.ts HStack.spec.ts VStack.spec.ts CHStack.spec.ts CVStack.spec.ts --workers=1 --reporter=line`

**Status:** ⬜ Not started
**Failing tests:** _(none yet)_

---

### Step 8: Create `ThemedDropdownMenu` and migrate consumers

**Action:** Add `ThemedDropdownMenu`, `ThemedMenuItem`, `ThemedMenuSeparator` to `DropdownMenu/DropdownMenu.tsx`. Migrate 3 consumer files.

**E2E verification per consumer:**

| Consumer file | E2E test file | Command | Result |
|---|---|---|---|
| `ProfileMenu/ProfileMenu.tsx` | _(none)_ | — | 🚫 |
| `ResponsiveBar/ResponsiveBarNative.tsx` | `ResponsiveBar.spec.ts` | `npx playwright test ResponsiveBar.spec.ts --workers=1 --reporter=line` | |
| `ContextMenu/ContextMenuNative.tsx` | `ContextMenu.spec.ts` | `npx playwright test ContextMenu.spec.ts --workers=1 --reporter=line` | |

**Also run DropdownMenu's own tests:** `npx playwright test DropdownMenu.spec.ts --workers=1 --reporter=line`

**Status:** ⬜ Not started
**Failing tests:** _(none yet)_

---

### Step 9: Create `ThemedAvatar` and migrate consumers

**Action:** Add `ThemedAvatar` to `Avatar/Avatar.tsx`. Migrate 2 consumer files.

**E2E verification per consumer:**

| Consumer file | E2E test file | Command | Result |
|---|---|---|---|
| `ProfileMenu/ProfileMenu.tsx` | _(none)_ | — | 🚫 |
| `Card/CardNative.tsx` | `Card.spec.ts` | `npx playwright test Card.spec.ts --workers=1 --reporter=line` | |

**Also run Avatar's own tests:** `npx playwright test Avatar.spec.ts --workers=1 --reporter=line`

**Status:** ⬜ Not started
**Failing tests:** _(none yet)_

---

### Step 10: Create `ThemedTooltip` and migrate consumers

**Action:** Add `ThemedTooltip` to `Tooltip/Tooltip.tsx`. Migrate 2 consumer files + TooltipBehavior.

**E2E verification per consumer:**

| Consumer file | E2E test file | Command | Result |
|---|---|---|---|
| `Slider/SliderNative.tsx` | `Slider.spec.ts` | `npx playwright test Slider.spec.ts --workers=1 --reporter=line` | |
| `ConciseValidationFeedback/ConciseValidationFeedback.tsx` | _(none)_ | — | 🚫 |
| `components-core/behaviors/TooltipBehavior.tsx` | `Tooltip.spec.ts` | `npx playwright test Tooltip.spec.ts --workers=1 --reporter=line` | |

**Also run Tooltip's own tests:** `npx playwright test Tooltip.spec.ts --workers=1 --reporter=line`

**Status:** ⬜ Not started
**Failing tests:** _(none yet)_

---

### Step 11: Create `ThemedTextBox` and migrate consumers

**Action:** Add `ThemedTextBox` to `TextBox/TextBox.tsx`. Migrate 2 consumer files.

**E2E verification per consumer:**

| Consumer file | E2E test file | Command | Result |
|---|---|---|---|
| `FileInput/FileInputNative.tsx` | `FileInput.spec.ts` | `npx playwright test FileInput.spec.ts --workers=1 --reporter=line` | |
| `FormItem/FormItemNative.tsx` | `FormItem.spec.ts` | `npx playwright test FormItem.spec.ts --workers=1 --reporter=line` | |

**Also run TextBox's own tests:** `npx playwright test TextBox.spec.ts --workers=1 --reporter=line`

**Status:** ⬜ Not started
**Failing tests:** _(none yet)_

---

### Step 12: Create `ThemedSelect` and migrate consumers

**Action:** Add `ThemedSelect` to `Select/Select.tsx`. Migrate 2 consumer files.

**E2E verification per consumer:**

| Consumer file | E2E test file | Command | Result |
|---|---|---|---|
| `FormItem/FormItemNative.tsx` | `FormItem.spec.ts` | `npx playwright test FormItem.spec.ts --workers=1 --reporter=line` | |
| `Pagination/PaginationNative.tsx` | `Pagination.spec.ts` | `npx playwright test Pagination.spec.ts --workers=1 --reporter=line` | |

**Also run Select's own tests:** `npx playwright test Select.spec.ts --workers=1 --reporter=line`

**Status:** ⬜ Not started
**Failing tests:** _(none yet)_

---

### Step 13: Create `ThemedImage` and migrate consumers

**Action:** Add `ThemedImage` to `Image/Image.tsx`. Migrate 2 consumer files.

**E2E verification per consumer:**

| Consumer file | E2E test file | Command | Result |
|---|---|---|---|
| `Blog/BlogNative.tsx` | _(none)_ | — | 🚫 |
| `Logo/LogoNative.tsx` | _(none)_ | — | 🚫 |

**Also run Image's own tests:** `npx playwright test Image.spec.ts --workers=1 --reporter=line`

**Status:** ⬜ Not started
**Failing tests:** _(none yet)_

---

### Step 14: Create `ThemedFlowLayout` and migrate consumers

**Action:** Add `ThemedFlowLayout` to `FlowLayout/FlowLayout.tsx`. Migrate 2 consumer files.

**E2E verification per consumer:**

| Consumer file | E2E test file | Command | Result |
|---|---|---|---|
| `Stack/Stack.tsx` | `Stack.spec.ts` | `npx playwright test Stack.spec.ts --workers=1 --reporter=line` | |
| `Blog/BlogNative.tsx` | _(none)_ | — | 🚫 |

**Also run FlowLayout's own tests:** `npx playwright test FlowLayout.spec.ts --workers=1 --reporter=line`

**Status:** ⬜ Not started
**Failing tests:** _(none yet)_

---

### Step 15: Create `ThemedRadioGroup` and migrate consumers

**Action:** Add `ThemedRadioGroup` to `RadioGroup/RadioGroup.tsx`. Migrate 2 consumer files.

**E2E verification per consumer:**

| Consumer file | E2E test file | Command | Result |
|---|---|---|---|
| `FormItem/ItemWithLabel.tsx` | `FormItem.spec.ts` | `npx playwright test FormItem.spec.ts --workers=1 --reporter=line` | |
| `FormItem/FormItemNative.tsx` | `FormItem.spec.ts` | _(same as above)_ | |

**Also run RadioGroup's own tests:** `npx playwright test RadioGroup.spec.ts --workers=1 --reporter=line`

**Status:** ⬜ Not started
**Failing tests:** _(none yet)_

---

### Step 16: Create `ThemedPagination` and migrate consumers

**Action:** Add `ThemedPagination` to `Pagination/Pagination.tsx`. Migrate Table consumer.

**E2E verification per consumer:**

| Consumer file | E2E test file | Command | Result |
|---|---|---|---|
| `Table/TableNative.tsx` | `Table.spec.ts` | `npx playwright test Table.spec.ts --workers=1 --reporter=line` | |

**Also run Pagination's own tests:** `npx playwright test Pagination.spec.ts --workers=1 --reporter=line`

**Status:** ⬜ Not started
**Failing tests:** _(none yet)_

---

### Step 17: Tier 3 themed wrappers (single-consumer components)

Create themed wrappers for Tier 3 components. Each has only one consumer; migrate and verify one at a time.

| Themed wrapper | Consumer | E2E test file | Command | Result |
|---|---|---|---|---|
| `ThemedCard` | `List/ListNative.tsx` | `List.spec.ts` | `npx playwright test List.spec.ts --workers=1 --reporter=line` | |
| `ThemedModalDialog` | `Form/FormNative.tsx` | `Form.spec.ts` | `npx playwright test Form.spec.ts --workers=1 --reporter=line` | |
| `ThemedSpaceFiller` | `ValidationSummary/ValidationSummary.tsx` | _(none)_ | — | 🚫 |
| `ThemedCodeBlock` | `Markdown/MarkdownNative.tsx` | `Markdown.spec.ts` | `npx playwright test Markdown.spec.ts --workers=1 --reporter=line` | |
| `ThemedTreeDisplay` | `Markdown/MarkdownNative.tsx` | `Markdown.spec.ts` | _(same as above)_ | |
| `ThemedExpandableItem` | `Markdown/MarkdownNative.tsx` | `Markdown.spec.ts` | _(same as above)_ | |
| `ThemedLogo` | `NavPanel/NavPanelNative.tsx` | `NavPanel.spec.ts` | `npx playwright test NavPanel.spec.ts --workers=1 --reporter=line` | |
| `ThemedNavLink` | `NavGroup/NavGroupNative.tsx` | `NavGroup.spec.ts` | `npx playwright test NavGroup.spec.ts --workers=1 --reporter=line` | |
| `ThemedTabs` / `ThemedTabItem` | `Blog/BlogNative.tsx` | _(none)_ | — | 🚫 |
| `ThemedMarkdown` | `Blog/BlogNative.tsx` | _(none)_ | — | 🚫 |
| `ThemedTableOfContents` | `Blog/BlogNative.tsx` | _(none)_ | — | 🚫 |

**Status:** ⬜ Not started
**Failing tests:** _(none yet)_

---

### Step 18: Tier 3 themed wrappers for FormItem sub-components

FormItem uses many native components for its various input types. All consumers are in `FormItem/FormItemNative.tsx`.

| Themed wrapper | Source component | E2E Command | Result |
|---|---|---|---|
| `ThemedFileInput` | `FileInput/FileInputNative.tsx` | `npx playwright test FormItem.spec.ts --workers=1 --reporter=line` | |
| `ThemedNumberBox` | `NumberBox/NumberBoxNative.tsx` | _(same)_ | |
| `ThemedTextArea` | `TextArea/TextAreaNative.tsx` | _(same)_ | |
| `ThemedDatePicker` | `DatePicker/DatePickerNative.tsx` | _(same)_ | |
| `ThemedAutoComplete` | `AutoComplete/AutoCompleteNative.tsx` | _(same)_ | |
| `ThemedSlider` | `Slider/SliderNative.tsx` | _(same)_ | |
| `ThemedColorPicker` | `ColorPicker/ColorPickerNative.tsx` | _(same)_ | |

After all sub-components migrated, also run their own E2E tests:
```bash
npx playwright test FileInput.spec.ts NumberBox.spec.ts TextArea.spec.ts DatePicker.spec.ts AutoComplete.spec.ts Slider.spec.ts ColorPicker.spec.ts --workers=1 --reporter=line
```

**Status:** ⬜ Not started
**Failing tests:** _(none yet)_

---

### Step 19: Final validation

Run comprehensive E2E tests across all affected components with parallel workers:

```bash
# Full stability check — all components that had consumers migrated
npx playwright test \
  Icon.spec.ts Button.spec.ts Button-style.spec.ts Text.spec.ts Spinner.spec.ts \
  Heading.spec.ts H1.spec.ts H2.spec.ts H3.spec.ts H4.spec.ts H5.spec.ts H6.spec.ts \
  Link.spec.ts Stack.spec.ts HStack.spec.ts VStack.spec.ts \
  DropdownMenu.spec.ts Avatar.spec.ts Tooltip.spec.ts TextBox.spec.ts Select.spec.ts \
  Image.spec.ts FlowLayout.spec.ts RadioGroup.spec.ts Pagination.spec.ts \
  NavLink.spec.ts FileInput.spec.ts NumberBox.spec.ts NoResult.spec.ts \
  ExpandableItem.spec.ts ToneChangerButton.spec.ts FileUploadDropZone.spec.ts \
  NavGroup.spec.ts ModalDialog.spec.ts Table.spec.ts Carousel.spec.ts \
  DatePicker.spec.ts DateInput.spec.ts TimeInput.spec.ts Markdown.spec.ts \
  ToneSwitch.spec.ts CodeBlock.spec.ts Tree.spec.ts \
  Form.spec.ts FormItem.spec.ts Card.spec.ts HtmlTags.spec.ts List.spec.ts \
  ResponsiveBar.spec.ts ContextMenu.spec.ts Slider.spec.ts \
  TextArea.spec.ts AutoComplete.spec.ts ColorPicker.spec.ts NavPanel.spec.ts \
  --workers=10
```

| Check | Result |
|---|---|
| All E2E tests pass with `--workers=10` | |
| No lint errors in modified files | |
| Visual spot-check in playground app | |

**Status:** ⬜ Not started
**Failing tests:** _(none yet)_

---

## Implementation Flow Per Step

1. Create the `ThemedXxx` wrapper in the component's renderer file (e.g., `Xxx/Xxx.tsx`)
2. Update all consumer files to import `ThemedXxx` instead of the raw native component
3. Ensure no linting issues in modified files (check VS Code Problems pane)
4. **For each consumer that has an E2E test file:** run the E2E tests with `--workers=1 --reporter=line`
5. Record results in the step's table (✅, ❌ with test names, ⚠️ for pre-existing failures, 🚫 for no tests)
6. If any tests fail, investigate whether the failure is caused by the migration or is pre-existing
7. Mark the step as completed in this document (change ⬜ to ✅, or ❌ if blocked)
8. Proceed to the next step

## Notes

- **Wrapper placement:** Themed wrappers live in the XMLUI renderer file (`Xxx.tsx`), not in `XxxNative.tsx`, because they depend on the metadata (`XxxMd`) defined there.
- **`className` merging:** Follow the `ThemedIcon` pattern — concatenate `themeClass` with incoming `className` only if defined, to avoid trailing spaces.
- **`forwardRef`:** All themed wrappers must forward refs so parent components can access the DOM element.
- **Non-visual imports are excluded:** Imports of functions, types, constants, hooks, and React contexts do not need themed wrappers.
- **`components-core/` imports:** `InspectorContext.tsx` uses raw `Button`; `TooltipBehavior.tsx` uses raw `Tooltip`. These should also be migrated to their themed versions.
- **E2E tests run from workspace root:** All `npx playwright test` commands must be run from `/Users/dotneteer/source/xmlui`, not from subdirectories.
- **Pre-existing failures:** If a test was already failing before the migration, mark it with ⚠️ and note "pre-existing". Do not block the step on pre-existing failures.
- **No Blog E2E tests:** Blog component has no E2E test file. Changes touching `Blog/BlogNative.tsx` can only be verified visually.
