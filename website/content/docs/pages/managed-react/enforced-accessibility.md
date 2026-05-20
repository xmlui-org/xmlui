# Enforced Accessibility

XMLUI now treats common accessibility requirements as framework contracts instead of informal component conventions.

The accessibility pass checks parsed markup in the language server and the Vite plugin, adds reusable runtime primitives for keyboard and screen-reader flows, validates theme contrast during theme resolution, and exposes a stable `automationId` surface for test and assistive automation tooling.

## What problems this prevents

- Icon-only buttons and interactive controls that ship without an accessible name.
- Modals without a title and form controls that are not associated with a label.
- Duplicate landmarks and pages with navigation but no skip-link path to main content.
- Themes that produce low text/background contrast for the framework's well-known color pairs.
- Tests coupled to incidental DOM structure instead of a stable `data-automation-id`.

## How it works

The linter reads component metadata from the same registry used by type-contract validation. Components can declare their accessibility role, accessible-name props, and landmark role in metadata, and `lintComponentDef()` reports diagnostics against the parsed XMLUI tree.

Those diagnostics surface in the LSP while editing and in the Vite plugin during builds. Vite supports the same rollout modes used by the other managed-react analyzers: off, warn, and strict.

XMLUI also ships three accessibility primitives:

- `<SkipLink>` renders a focus-visible skip link to the main content region.
- `<FocusScope>` centralizes focus trapping, initial focus, and focus restoration for overlays.
- `<LiveRegion>` provides polite/assertive screen-reader announcements. Toasts and runtime errors announce through the shared global live region.

Theme resolution runs a contrast checker over known foreground/background token pairs. In development it warns; with strict accessibility enabled it escalates those findings.

## Enabling strict mode

`strictAccessibility` remains opt-in for the current migration window:

```xml
<App appGlobals="{{ strictAccessibility: true }}">
  <Pages />
</App>
```

With strict mode enabled, warn-level accessibility diagnostics escalate to errors and can fail the Vite build. The default flip is reserved for the next major release so existing apps get a warning-first path.

For navigation-heavy apps, `autoSkipLink` can insert the default skip link before the app content:

```xml
<App appGlobals="{{ autoSkipLink: true }}">
  <Pages />
</App>
```

Use `automationId` when a component needs a stable automation hook:

```xml
<Button automationId="save-order" label="Save" />
```

XMLUI renders this as `data-automation-id="save-order"` on the component decorator without making the value part of the public visual design.

## Related

- [Verified Type Contracts](/docs/managed-react/verified-type-contracts)
- [Build Validation Analyzers](/docs/managed-react/build-validation-analyzers)
- [Managed Lifecycle Vocabulary](/docs/managed-react/managed-lifecycle-vocabulary)
