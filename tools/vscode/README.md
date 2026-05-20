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
| `xmlui-reactive-graph` | Reactive cycles | Circular data-binding chains that would cause infinite updates |
| `xmlui-a11y` | Accessibility | Accessibility violations — see below |

### Accessibility diagnostics (`xmlui-a11y`)

The accessibility linter runs automatically on every `.xmlui` file and reports violations as **warnings** in the Problems panel. The following codes are emitted:

| Code | Severity | Description | Suggested fix |
|---|---|---|---|
| `icon-only-button-no-label` | warn/error | `<Button icon="...">` with no `label`, `aria-label`, or `title` | Add `aria-label="..."` |
| `modal-no-title` | warn/error | `<Modal>` with no `title` prop or `<ModalTitle>` slot | Add `title="..."` |
| `missing-accessible-name` | warn/error | Interactive element with no accessible name prop | Add the suggested name prop |
| `form-input-no-label` | warn/error | Form input outside `<FormItem>` and without a `label` prop | Wrap in `<FormItem label="...">` |
| `duplicate-landmark` | warn | More than one component with the same landmark role on a page | Remove duplicate landmark |
| `redundant-aria-role` | warn | Explicit ARIA role duplicates the element's implicit role | Remove the redundant `role` prop |

Violations marked **warn/error** are warnings by default; they escalate to errors when `App.appGlobals.strictAccessibility` is `true`.

Quick-fix actions are available for violations that have a single concrete suggested fix.

