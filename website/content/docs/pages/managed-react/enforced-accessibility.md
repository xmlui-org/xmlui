# Enforced Accessibility

XMLUI treats common accessibility requirements as framework contracts instead
of informal component conventions. Enforced accessibility means the framework
does three things for app authors:

- It generates predictable accessibility attributes when the component already
  has enough information.
- It asks you for missing intent when only the app author can know the right
  accessible name or label.
- It reports accessibility diagnostics through the XMLUI analyzer surfaces
  before the problem reaches users.

The accessibility analyzer checks parsed markup in the language server, the
Vite plugin, and `xmlui check --a11y`. XMLUI also adds reusable runtime
primitives for keyboard and screen-reader flows, validates theme contrast
during theme resolution, and exposes a stable `automationId` surface for test
and assistive automation tooling.

## What problems this prevents

- Icon-only buttons and interactive controls that ship without an accessible name.
- Modals without a title and form controls that are not associated with a label.
- Duplicate landmarks and pages with navigation but no skip-link path to main content.
- Themes that produce low text/background contrast for the framework's well-known color pairs.
- Tests coupled to incidental DOM structure instead of a stable `data-automation-id`.

## How it works

The XMLUI accessibility analyzer reads component metadata from the same registry
used by type-contract validation. Components declare their accessibility role,
accessible-name props, and landmark role in metadata. The analyzer reports
diagnostics against the parsed XMLUI tree, and those diagnostics appear in the
LSP, Vite builds, and the `xmlui check --a11y` CLI path.

Vite supports the same rollout modes used by the other Managed React analyzers:
`"off"`, `"warn"`, and `"strict"`.

## What XMLUI generates

XMLUI does not guess application meaning, but it does reuse meaning you already
provided in markup.

For many wrapped components, XMLUI resolves an `aria-label` in this order:
your explicit `aria-label`, a component-specific derived label, the component's
default accessibility label, and finally the component's `label` prop.

```xmlui
<TextBox label="Email address" />
<TextBox placeholder="Search orders" />
<Avatar name="Ada Lovelace" />
<Spinner />
```

These produce accessible names from existing values:

```html
<input aria-label="Email address" />
<input aria-label="Search orders" />
<div aria-label="Ada Lovelace">...</div>
<div aria-label="Loading">...</div>
```

[TextBox](/docs/reference/components/TextBox), [Avatar](/docs/reference/components/Avatar),
and [Spinner](/docs/reference/components/Spinner) all reuse values already present
in the markup. Form components such as [FormItem](/docs/reference/components/FormItem)
also connect visible labels, required state, and validation messages to the
underlying control:

```xmlui
<FormItem label="Email address" required="true">
  <TextBox bindTo="email" />
</FormItem>
```

XMLUI gives the input a stable generated `id`, connects the visible label with
`htmlFor`, marks the control with `aria-required`, and connects validation text
with `aria-describedby` when messages are shown.

Composite components generate their own navigation state where the component
knows the correct value. For example:

```xmlui
<Pagination totalItems="{250}" pageSize="{25}" />
<NavGroup label="Reports">...</NavGroup>
```

[Pagination](/docs/reference/components/Pagination) renders a navigation region
labelled `"Pagination"` and page buttons with names such as `"Next page"` or
`"Page 2 (current)"`. Disclosure-style components such as
[NavGroup](/docs/reference/components/NavGroup),
[Accordion](/docs/reference/components/Accordion), and
[ExpandableItem](/docs/reference/components/ExpandableItem) update `aria-expanded`
as they open and close.

When XMLUI cannot infer a meaningful name, the analyzer tells you what to add:

```xmlui
<!-- Reports an accessibility diagnostic: icon-only button has no name. -->
<Button icon="trash" />

<!-- OK: the action has a screen-reader name. -->
<Button icon="trash" aria-label="Delete order" />
```

XMLUI also ships dedicated accessibility components and behaviors:

- [`SkipLink`](/docs/reference/components/SkipLink) renders a focus-visible skip
  link that lets keyboard, switch-device, and screen-reader users bypass repeated
  navigation and move focus to the active page's main content. Its `target` can
  point at a DOM id, an XMLUI component id, or a test id.
- [`FocusScope`](/docs/reference/components/FocusScope) centralizes focus
  trapping, initial focus, and focus restoration for custom overlays and panels.
- [`LiveRegion`](/docs/reference/components/LiveRegion) provides polite or
  assertive screen-reader announcements for updates that should not move focus.
  Toasts and runtime errors announce through the shared global live region.
- `withLiveRegion` adds the same announcement pattern to supported text-like
  components such as [Text](/docs/reference/components/Text), headings
  ([H1](/docs/reference/components/H1)-[H6](/docs/reference/components/H6)),
  [Badge](/docs/reference/components/Badge),
  [NoResult](/docs/reference/components/NoResult), and
  [ProgressBar](/docs/reference/components/ProgressBar).

Theme resolution runs a contrast checker over known foreground/background token pairs. In development it warns; with strict accessibility enabled it escalates those findings.

## Enabling strict mode

`strictAccessibility` remains opt-in for the current migration window:

```json
{
  "xmluiConfig": {
    "strictAccessibility": true
  }
}
```

With strict mode enabled, warn-level accessibility diagnostics escalate to errors and can fail the Vite build. The default flip is reserved for the next major release so existing apps get a warning-first path.

For navigation-heavy apps, `autoSkipLink` can insert the default skip link before the app content:

```json
{
  "xmluiConfig": {
    "autoSkipLink": true
  }
}
```

Use an explicit [`SkipLink`](/docs/reference/components/SkipLink) when different
routes need different first focus targets, for example a dashboard filter on `/`
and an order search field on `/orders`.

Use `automationId` when a component needs a stable automation hook:

```xmlui
<Button automationId="save-order" label="Save" />
```

XMLUI renders this [Button](/docs/reference/components/Button) as
`data-automation-id="save-order"` on the component decorator without making the
value part of the public visual design.

## Related

- [Add a skip link to main content](/docs/howto/add-a-skip-link-to-main-content)
- [Keep keyboard focus inside a custom panel](/docs/howto/keep-keyboard-focus-inside-a-custom-panel)
- [Announce status changes with LiveRegion](/docs/howto/announce-status-changes-with-liveregion)
- [Announce text changes with withLiveRegion](/docs/howto/announce-text-changes-with-withliveregion)
- [Verified Type Contracts](/docs/managed-react/verified-type-contracts)
- [Build Validation Analyzers](/docs/managed-react/build-validation-analyzers)
- [Managed Lifecycle Vocabulary](/docs/managed-react/managed-lifecycle-vocabulary)
