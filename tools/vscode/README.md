# XMLUI Tools for Visual Studio Code

This extension adds tools for working with [XMLUI](https://docs.xmlui.org) files.

- Syntax highlighting for `.xmlui` files and `.xmlui.xs` files
- Hover for core components
- Completion for core components
- Code formatting for `.xmlui` files
- Diagnostics for errors

## Features

![](./tools/vscode/resources/xmlui-markup-syntax-highlighting.png)

## Diagnostics

The extension surfaces several categories of diagnostics in the **Problems** panel:

| Source | Category | Description |
|---|---|---|
| `xmlui` | Parse errors | XML syntax errors and unknown component/prop names |
| `xmlui-check` | Build validation | Unknown components, misspelled props, dead expressions |
| `xmlui-type-contract` | Type contracts | Prop, event, enum, and value-type mismatches against component metadata |
| `xmlui-reactive-graph` | Reactive cycles | Circular data-binding chains that would cause infinite updates |
| `xmlui-a11y` | Accessibility | Accessibility violations — see below |

### Type-contract diagnostics (`xmlui-type-contract`)

The type-contract verifier checks literal props and events against the component metadata used by XMLUI itself. Typos such as `labe`, missing required props, invalid enum values, deprecated props, and wrong literal value types are reported as warnings by default. Error-capable diagnostics escalate when `App.appGlobals.strictTypeContracts` is enabled.

### Accessibility diagnostics (`xmlui-a11y`)

The accessibility linter runs automatically on every `.xmlui` file and reports violations as **warnings** in the Problems panel. The following codes are emitted:

| Code | Severity | Description | Suggested fix |
|---|---|---|---|
| `icon-only-button-no-label` | warn/error | `<Button icon="...">` with no `label`, `aria-label`, or `title` | Add `aria-label="..."` |
| `modal-no-title` | warn/error | `<Modal>` with no `title` prop or `<ModalTitle>` slot | Add `title="..."` |
| `missing-accessible-name` | warn/error | Interactive element with no accessible name prop | Add the suggested name prop |
| `form-input-no-label` | warn/error | Form input outside `<FormItem>` and without a `label` prop | Wrap in `<FormItem label="...">` |
| `duplicate-landmark` | warn/error | More than one component with the same landmark role on a page | Remove duplicate landmark |
| `redundant-aria-role` | warn/error | Explicit ARIA role duplicates the element's implicit role | Remove the redundant `role` prop |
| `missing-skip-link` | warn/error | Navigation is present without a skip link to main content | Add `<SkipLink target="main" />` or enable `autoSkipLink` |
| `color-contrast-low` | warn/error | Theme foreground/background colors fall below WCAG AA contrast | Adjust the theme colors to at least 4.5:1 contrast |

Violations marked **warn/error** are warnings by default; they escalate to errors when `App.appGlobals.strictAccessibility` is `true`.

Quick-fix actions are available for violations that have a single concrete suggested fix.
