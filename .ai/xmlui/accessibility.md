# XMLUI Accessibility — AI Reference

Authoritative reference for accessibility principles, component ARIA conventions, known issues, and testing patterns in XMLUI. For contributors adding new components or fixing a11y issues.

---

## Core Principles

1. **Semantic HTML first** — use proper elements (`<header>`, `<main>`, `<footer>`, `<nav>`, `<button>`) before reaching for ARIA roles
2. **ARIA sparingly** — sites using custom ARIA roles have 34% more ARIA-related problems; only add roles where no semantic HTML alternative exists
3. **Every interactive element must be keyboard-reachable** — `Tab` traversal, `Enter`/`Space` activation, arrow keys for menu/list navigation, `Escape` for dismissal
4. **Visible focus indicator required** — outline or equivalent for all focused elements
5. **Minimum touch target: 44×44px** (WCAG 2.1 mobile); for pointer-only: 24×24px
6. **Color contrast ≥ 4.5:1** for text; 3:1 for large text and UI components

---

## ARIA Patterns by Component Type

### Buttons and interactive elements

```tsx
// Icon-only button: aria-label required
<button aria-label="Close dialog">
  <Icon name="close" aria-hidden="true" />
</button>

// Button with icon + label: icon hidden from tree
<button>
  <Icon name="save" aria-hidden="true" />
  Save
</button>
```

### Expandable/collapsible (ExpandableItem)

Required attributes on the trigger:
```html
<div role="button"
     aria-expanded="false|true"
     aria-controls="content-region-id"
     aria-disabled="false|true"
     tabindex="0">
  Summary text
</div>
```

Content region:
```html
<div role="region"
     id="content-region-id"
     aria-labelledby="trigger-id">
  ...content...
</div>
```

### Form inputs (TextBox, Select, etc.)

```html
<!-- Label association -->
<label for="email-input">Email address</label>
<input id="email-input" type="email" aria-describedby="email-hint" />
<span id="email-hint">Enter your work email</span>

<!-- Multiple related inputs: use fieldset -->
<fieldset>
  <legend>Shipping address</legend>
  <input .../>
</fieldset>
```

- `aria-describedby` must point to hint text element ID
- `aria-invalid="true"` when validation fails
- `aria-disabled="true"` on readonly elements that look disabled

### Toggle / Switch

```html
<button role="switch" aria-checked="true|false" aria-label="Dark mode">
```

### Navigation

```html
<nav aria-label="Main navigation">...</nav>  <!-- not role="navigation" on <nav> -->
<nav aria-label="Breadcrumb">...</nav>       <!-- multiple navs need distinguishing labels -->
```

### Modal dialogs

```html
<div role="dialog" aria-modal="true" aria-labelledby="modal-title">
  <h2 id="modal-title">Confirm deletion</h2>
  ...
</div>
```

Focus must move to the modal on open, and return to the trigger on close.

### Lists

```html
<ul role="listbox" aria-label="Options">
  <li role="option" aria-selected="true">Item 1</li>
</ul>
```

### Tabs

```html
<div role="tablist">
  <button role="tab" aria-selected="true" aria-controls="panel-1" id="tab-1">Tab 1</button>
</div>
<div role="tabpanel" id="panel-1" aria-labelledby="tab-1">...</div>
```

### Status/alerts

```html
<!-- Live region for dynamic updates -->
<div role="status" aria-live="polite">Loading...</div>
<div role="alert" aria-live="assertive">Error: something went wrong</div>
```

### Decorative elements

```html
<!-- Never in accessibility tree -->
<img src="..." alt="" aria-hidden="true" />
<Icon aria-hidden="true" />
```

---

## Keyboard Navigation Requirements

| Component type | Tab enters | Arrow keys | Enter/Space | Escape |
|---------------|-----------|-----------|-------------|--------|
| Button | ✓ | — | Activate | — |
| Link | ✓ | — | Follow | — |
| TextBox/Input | ✓ | — | — | — |
| Select/Combobox | ✓ | Navigate options | Open/select | Close |
| RadioGroup | ✓ (to group) | Navigate within group | — | — |
| Tabs | ✓ (to selected) | Navigate tabs | — | — |
| ExpandableItem | ✓ | — | Toggle | — |
| Modal | trapped inside | — | — | Close |
| Menu/Dropdown | ✓ | Navigate items | Activate | Close |

---

## Component a11y Status

### Confirmed acceptable

| Component | Notes |
|-----------|-------|
| Heading | Correct semantic elements |
| Text | Correct semantic elements; variant semantics are user's responsibility |
| Image | Needs `alt` text in context |
| Footer | Uses `role="contentinfo"` |
| ExpandableItem | Full ARIA with `aria-expanded`, `aria-controls`, `region` role |
| Tabs | `role="tablist"`, `role="tab"`, `aria-selected`, `aria-controls` |
| AutoComplete | `role="combobox"`, `role="listbox"`, `role="option"` |
| Toggle | `role="switch"`, `aria-checked`, `aria-label` |
| RatingInput | `role="button"`, `aria-label` per star |
| DropdownMenu | `role="menuitem"`, `role="separator"` |

### Known issues

| Component | Issue |
|-----------|-------|
| Button | No visual feedback on Enter/Space press (acceptable per WCAG) |
| Button (icon-only) | Needs `aria-label`; icon must have `aria-hidden` |
| Link | Not keyboard-focusable; ignores Enter/Space; shows as "Static Text" in accessibility tree |
| TextBox | Label not linked to input element; hint text missing `aria-describedby`; contrast insufficient between default/focus/disabled states; click area < 44px |
| FormItem | Hint text needs `id="hint-{input-id}"` + input needs `aria-describedby` |
| App | Missing semantic landmark structure (`<header>`, `<main>`, `<footer>`) |
| Icon | Decorative icons need `aria-hidden="true"`; meaningful icons need `role` + `title` |
| Select | Inherited from Radix UI; labels not passed through correctly |

---

## Adding Accessibility to a New Component

Checklist for a new interactive component:

- [ ] Uses semantic HTML element where possible (not `<div>` with `onClick`)
- [ ] `tabindex="0"` if not natively focusable (or uses a native interactive element)
- [ ] Visible focus ring (don't `outline: none` without an alternative)
- [ ] Keyboard activation: `Enter` and/or `Space` trigger the primary action
- [ ] ARIA role set if semantic element is unavailable
- [ ] ARIA state props wired: `aria-expanded`, `aria-selected`, `aria-checked`, `aria-disabled` as applicable
- [ ] `aria-label` or `aria-labelledby` for elements without visible text
- [ ] `aria-describedby` for hint/error text association
- [ ] Decorative icons have `aria-hidden="true"`
- [ ] Touch target ≥ 44×44px (or document exception)
- [ ] Color contrast ≥ 4.5:1 for all text states
- [ ] Accessibility test section in `ComponentName.spec.ts`

---

## Accessibility Testing Patterns

### E2E tests (Playwright)

Test ARIA attributes directly:

```typescript
test.describe("Accessibility", () => {
  test("has correct ARIA attributes in collapsed state", async ({ initTestBed, page }) => {
    await initTestBed(`<ExpandableItem summary="Test">Content</ExpandableItem>`);
    const trigger = page.getByRole("button", { name: "Test" });
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expect(trigger).toHaveAttribute("aria-controls");
    await expect(trigger).toHaveAttribute("tabindex", "0");
  });

  test("updates aria-expanded on toggle", async ({ initTestBed, page }) => {
    await initTestBed(`<ExpandableItem summary="Test">Content</ExpandableItem>`);
    const trigger = page.getByRole("button", { name: "Test" });
    await trigger.click();
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
  });

  test("is keyboard operable", async ({ initTestBed, page }) => {
    await initTestBed(`<ExpandableItem summary="Test">Content</ExpandableItem>`);
    const trigger = page.getByRole("button", { name: "Test" });
    await trigger.focus();
    await expect(trigger).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
  });
});
```

### Useful Playwright ARIA assertions

```typescript
await expect(el).toHaveRole("button");
await expect(el).toHaveAttribute("aria-label", "Close");
await expect(el).toHaveAttribute("aria-expanded", "true");
await expect(el).toHaveAttribute("aria-disabled", "false");
await expect(el).toHaveAttribute("aria-controls");   // just presence
await expect(el).toBeFocused();
await expect(page.getByRole("tooltip")).toHaveText("Tip text");
```

---

## Accessibility Linter (plan #05, Wave 1)

XMLUI ships a build-time accessibility linter at `xmlui/src/components-core/accessibility/`. Phase 1 implements seven rules; runtime enforcement and ARIA attribute injection land in later waves.

**Public API** (barrel: `components-core/accessibility/index.ts`):

```ts
import { lintComponentDef, type A11yDiagnostic, type A11yCode } from "@xmlui/.../accessibility";

const diagnostics: A11yDiagnostic[] = lintComponentDef(componentDef, options);
```

**Rule codes** (`A11yCode` union):

| Code | Severity | Detects |
|---|---|---|
| `missing-accessible-name` | warn | Interactive element with no accessible name |
| `icon-only-button-no-label` | warn | `<Button icon="...">` without `label` or `aria-label` |
| `modal-no-title` | warn | `<Modal>` without a `title` prop or `<ModalTitle>` slot |
| `form-input-no-label` | warn | Form input outside `<FormItem>` and without a `<Label>` |
| `duplicate-landmark` | warn | More than one component with the same landmark role on a page |
| `redundant-aria-role` | info | Explicit ARIA role duplicates the element's implicit role |
| `missing-skip-link` | info (stub) | App/Page with NavPanel but no SkipLink sibling |

**Strict mode**: `App.appGlobals.strictAccessibility: boolean` (default `false`) escalates warn-severity findings to `error`, failing the Vite build. Flips to `true` in the next major release.

**Runtime trace**: when `strictAccessibility` is truthy, findings emit `kind:"a11y"` entries to `_xsLogs` (see `inspector-debugging.md`).

### Component a11y metadata

`ComponentMetadata` carries an optional `a11y` block (see `xmlui/src/abstractions/ComponentDefs.ts`) used by the linter:

```ts
a11y?: {
  role?: "button" | "link" | "switch" | "checkbox" | "menuitem" | "tab"
       | "option" | "dialog" | "form-input" | "landmark" | "heading"
       | "list" | "image" | "decorative";
  accessibleNameProps?: readonly string[];   // e.g. ["label", "aria-label", "title"]
  requiresAccessibleName?: boolean;          // defaults true for interactive roles
  landmark?: "main" | "navigation" | "banner" | "contentinfo" | "complementary" | "search";
};
```

This block is purely advisory — no runtime behaviour changes. When authoring or extending a component, fill it in so the linter knows how to validate consumers' markup.

---

## Tools for a11y Auditing

| Tool | Use |
|------|-----|
| Chrome DevTools Accessibility panel | Visualize accessibility tree (Ctrl+Shift+P → "Enable full page accessibility") |
| [Accessibility Insights for Web](https://accessibilityinsights.io/docs/web/overview/) | Automated axe-core scans |
| [Accessible color matrix](https://toolness.github.io/accessible-color-matrix/) | Generate WCAG-compliant color palettes |
| Screen readers (NVDA, JAWS, VoiceOver) | Manual verification of role announcements |

---

## Radix UI Integration Note

Several XMLUI components are built on Radix UI primitives (Select, Dialog, Popover, etc.). Radix provides:

- Focus trapping in modals
- Keyboard navigation in dropdowns
- ARIA attributes for composite widgets

**However:** Radix labels are not passed through to XMLUI's label system. This is the source of some label-related accessibility issues. When modifying Radix-backed components, verify that label props reach the underlying Radix element.

---

## Key Files

| File | Role |
|------|------|
| `xmlui/dev-docs/accessibility.md` | Living audit document with per-component findings |
| `xmlui/src/components/ExpandableItem/ExpandableItem.spec.ts` | Reference accessibility test patterns |
| `xmlui/src/components/Toggle/Toggle.tsx` | Example of `role="switch"` + `aria-checked` + `aria-label` |
| `xmlui/src/components/Tabs/TabsNative.tsx` | Example of full tablist/tab/tabpanel ARIA |
| `xmlui/src/components/AutoComplete/AutoCompleteNative.tsx` | Example of combobox/listbox/option ARIA |
| `xmlui/src/components/Form/FormNative.tsx` | Example of `aria-label` on form element |
