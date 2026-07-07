# Enforced Versioning

XMLUI's component metadata declares the lifecycle of every public
API element — components, props, events, and methods — and the
framework treats those declarations as load-bearing. When an API
element you depend on is marked `deprecated`, you get a precise
warning that names what to do next. When it's removed, you get a
loud, actionable error instead of a silent no-op at render time.
And when the framework's own release pipeline changes the public
surface, an automated diff guards that the version bump and the
changeset describe the change honestly.

This page explains the vocabulary you can rely on as an
application developer, the migration helpers the framework
provides, and how to opt into strict enforcement.

## What problems this prevents

- **Silent prop removal.** A prop you set in markup that no longer
  exists used to do nothing — your value was dropped on the floor
  during prop resolution. Now the framework recognises that the
  prop was removed in a known version, emits a
  `removed-prop` diagnostic with the suggested replacement, and
  (under strict mode) fails the render with a clear placeholder
  instead of pretending everything is fine.
- **Drifting deprecation messages.** Free-text `deprecationMessage`
  strings could go stale or contradict the changelog. Components
  now carry structured `deprecatedSince` / `removedIn` /
  `replacement` fields that the framework, the docs site, and the
  release tooling all read from the same source.
- **Unannounced default-value changes.** When a default flips
  between versions (e.g. a form's submit policy), apps that
  relied on the old behaviour broke quietly. You can now opt
  individual props back to their previous default via
  `<App preserveLegacyDefaults>` while you migrate, and the
  framework records that you did so as an `info` diagnostic.
- **Renames that quietly stop working.** When a prop is renamed,
  markup using the old name now keeps working through a
  declarative alias and emits a `renamed-prop` diagnostic
  pointing at the new name — instead of silently doing nothing.
- **Version bumps that don't match the change.** The release
  pipeline now diffs the previous and the current component
  surface, classifies each delta (`added` / `removed` /
  `prop-required-added` / `prop-type-changed` / …), and fails
  the release if the staged changeset's bump (`patch` / `minor`
  / `major`) is smaller than the diff requires.

## How it works

Every component's metadata can carry structured lifecycle fields
on the component itself and on every prop, event, and method.
At build and at runtime the framework walks the markup, looks up
each referenced API element, and emits a `kind: "versioning"`
trace entry when a lifecycle field applies. Findings are
deduplicated per session — a deprecated prop on a list of 1,000
items emits exactly one diagnostic, not 1,000.

## The vocabulary

Component authors and extension authors declare lifecycle on a
component, on individual props, on events, and on methods:

| Field | Where | Meaning |
|---|---|---|
| `status: "deprecated"` | Component | The component will be removed. Emits `deprecated-component`. |
| `status: "experimental"` | Component | API may change. Emits `experimental-use` (info). |
| `status: "internal"` | Component | Not intended for user markup. Emits `internal-component-use`. |
| `deprecationMessage` | Component / prop / event / method | Free-text guidance, shown in diagnostics and docs. |
| `deprecatedSince` | Prop / event / method | Semver of the version that deprecated this element. |
| `removedIn` | Prop / event / method | Semver of the version that removes (or removed) this element. |
| `replacement` | Prop / event / method | A short hint pointing at the migration target. |
| `valueAliases` | Prop | Specific prop *values* that were renamed (e.g. `size="huge"` → `size="xl"`). |
| `defaultValueChangedIn` | Prop | Records that the default value changed in a specific version. |
| `renamedProps` | Component | Lists `{ from, to, deprecatedSince, removedIn?, transform? }` entries. |

## Diagnostic codes

Every finding the framework emits uses one of these stable codes
so you can filter them in the Inspector, write custom severity
overrides per surface, or grep the trace stream in CI:

| Code | Default severity | Strict severity | Cause |
|---|---|---|---|
| `deprecated-component` | `warn` | `warn` | Markup uses a component with `status: "deprecated"`. |
| `deprecated-prop` | `warn` | `warn` | Markup uses a prop with `deprecationMessage` or `deprecatedSince`. |
| `deprecated-event` | `warn` | `warn` | Markup wires a deprecated event handler. |
| `deprecated-method` | `warn` | `warn` | A deprecated exposed method is invoked. |
| `deprecated-value` | `warn` | `warn` | A `valueAliases.from` value was rewritten to its new form. |
| `removed-prop` | `warn` | `error` | The prop's `removedIn` ≤ the current framework version. |
| `renamed-prop` | `warn` | `warn` | Markup uses the old name from a `renamedProps` entry. |
| `experimental-use` | `info` | `info` | Markup uses a component or prop marked `experimental`. |
| `default-value-changed` | `info` | `info` | A prop was opted back to a previous default via `preserveLegacyDefaults`. |
| `internal-component-use` | `warn` | `error` | Markup uses a component marked `internal`. |

Deprecation findings never break a running app — their job is
to surface migration debt visibly. Strict mode escalates only
the two categories where silent behaviour is dangerous:
`removed-prop` and `internal-component-use`.

## Opting into strict mode

`xmluiConfig.strictVersioning` defaults to `false` today and is
scheduled to flip to `true` in the next major release. Opt in
early to get build-failing errors for removed props and internal
component use:

```jsonc
// config.json
{
  "xmluiConfig": {
    "strictVersioning": true
  }
}
```

Once strict is on:

- `removed-prop` is an `error`. Markup using a removed prop is
  rendered with a placeholder message that points at the
  replacement; the rest of the page continues to render.
- `internal-component-use` is an `error`. Apps must use the
  public component instead.
- `deprecated-*` codes remain `warn`s — deprecation is supposed
  to *nag*, not break.

## Holding a previous default

When the framework rolls a default value forward (recorded via
`defaultValueChangedIn` on a prop's metadata), an app that
relied on the previous behaviour can opt that single prop back
to its old default while migrating:

```xmlui
<App preserveLegacyDefaults="{['Form.submitPolicy', 'TextBox.trim']}">
  ...
</App>
```

Each entry is `<ComponentName>.<propName>`. The framework emits
one `default-value-changed` info diagnostic per affected
component, so you can see at a glance which previous defaults
your app is still pinned to.

## Auditing your app's migration debt

Findings show up in the Inspector under the **Versioning** tab,
grouped by component. The same data is available as a flat list
through the global trace buffer and can be exported as a
Markdown migration checklist suitable for pasting into an issue
tracker. In CI, you can grep `kind: "versioning"` entries out of
the trace stream and fail the build on `error`-severity
findings.

## Release-time API diff

The framework's own release pipeline diffs the previous and
current component surface and classifies each delta:

- **Added** components, props, events, or methods → `minor`.
- **Removed** elements where `removedIn` matches the new
  version → consistent with the staged changeset; **without**
  that record → `major`, and the release is gated.
- **Default-value change** without a matching
  `defaultValueChangedIn` record → `major`, gated.
- **Renamed prop** without a matching `renamedProps` entry →
  `major`, gated.
- **Status change** `stable → deprecated` → `minor`.

The XMLUI repository's convention is that every change is a
`patch` unless metadata says otherwise. The diff only intervenes
to escalate when an actual API surface change demands it; pure
bug fixes and refactors stay at `patch`. Extension packages can
plug into the same diff tooling to gate their own releases.

## Related

- [Verified Type Contracts](./verified-type-contracts.md) — the
  diagnostic pipeline that the versioning verifier piggybacks on.
- [Forms Validation Discipline](./forms-validation-discipline.md)
  — uses `renamedProps` for the `pattern → validator` migration
  and `defaultValueChangedIn` for `submitPolicy`.
- [Build-Validation Analyzers](./build-validation-analyzers.md)
  — the same surface that hosts deprecation diagnostics in the
  language server and the Vite plugin.
