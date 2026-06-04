# Enforced Versioning

XMLUI treats component lifecycle metadata as a first-class, machine-checkable contract. Every prop, event, method, value, and component can declare when it was deprecated, when it will be removed, and how to migrate. The framework surfaces those declarations in the editor (LSP), at parse-time in the running app, in generated docs, and at release-time as an API-diff gate that blocks under-staged changesets.

This chapter covers the developer-facing versioning machinery. Application-author guidance lives at `/docs/managed-react/enforced-versioning`.

## Vocabulary

| Field | Where it lives | Purpose |
| --- | --- | --- |
| `status: "stable" \| "experimental" \| "deprecated" \| "internal" \| "in progress"` | `ComponentMetadata`, `ComponentPropertyMetadata`, `ComponentEventMetadata`, `ComponentApiMetadata` | Lifecycle label. Drives doc badges and `experimental-use` / `internal-component-use` / `deprecated-*` diagnostics. |
| `deprecationMessage` | Any metadata entry | Free-form migration text echoed verbatim in diagnostics and docs. |
| `deprecatedSince` | Prop / event / method / component | Semver version that started the deprecation. |
| `removedIn` | Prop / event / method / component | Semver version that will drop the surface. Required for `removed-prop` escalation. |
| `replacement` | Prop / event / method / component | Symbolic pointer to the new API. Doc badges format as <code>use \`replacement\` instead</code>. |
| `valueAliases?: ReadonlyArray<{ from; to; deprecatedSince; removedIn? }>` | Prop only | Legacy enum values. The runtime rewrites `from` → `to` and emits `deprecated-value`. |
| `defaultValueChangedIn?: ReadonlyArray<{ version; previousDefault; note? }>` | Prop only | Records framework default flips. The app can opt back via `appGlobals.preserveLegacyDefaults`. |
| `renamedProps?: Readonly<Record<string, { since; removedIn?; canonical }>>` | Component metadata | Drives the rename helper used by the verifier. |

## Diagnostic Codes

The verifier emits one of ten `VersioningDiagnosticCode` values. Default severity is `warn` for deprecation codes and `info` for `default-value-changed`. `appGlobals.strictVersioning === true` escalates only `removed-prop` and `internal-component-use` to `error`; deprecation diagnostics intentionally stay at `warn`.

| Code | Default | Strict | When |
| --- | --- | --- | --- |
| `deprecated-component` | warn | warn | `<X>` whose metadata has `status: "deprecated"`. |
| `deprecated-prop` | warn | warn | Prop with `status: "deprecated"`. |
| `deprecated-event` | warn | warn | Event with `status: "deprecated"`. |
| `deprecated-method` | warn | warn | Method with `status: "deprecated"`. |
| `deprecated-value` | warn | warn | Markup value matched a `valueAliases.from`. |
| `removed-prop` | warn | **error** | Prop is present *and* `removedIn` ≤ current version. |
| `renamed-prop` | warn | warn | Markup used the old name; the rename helper rewrote it. |
| `experimental-use` | warn | warn | Component with `status: "experimental"`. |
| `default-value-changed` | info | info | App opted into a legacy default via `preserveLegacyDefaults`. |
| `internal-component-use` | warn | **error** | Component with `status: "internal"` used outside the framework. |

## Pipeline

1. **Authoring time (LSP)** — `language-server/services/versioning-diagnostic.ts` runs `verifyVersioning()` against the parsed document and surfaces results as `xmlui-versioning` Problems entries.
2. **Build time** — the analyzer rule family in `components-core/analyzer/rules/versioning.ts` emits the same diagnostics through `xmlui check` and the Vite plugin.
3. **Parse / mount time** — `rendering/AppContent.tsx` walks the mounted tree once after a `rootContainer` change and forwards diagnostics to `emitVersioningDiagnostics()`, which dedups per `(componentName, propName, code)` and pushes `kind: "versioning"` entries onto the inspector trace.
4. **Prop-coercion time** — components opt in via `applyValueAliases()` and `applyPreserveLegacyDefault()` from `components-core/versioning/propCoercion.ts` so legacy enum values are rewritten transparently and pinned defaults are honoured.
5. **Release time** — `scripts/api-diff/extract.ts` snapshots the component surface; `diff.ts` classifies deltas into `patch / minor / major`; `suggest-changeset.ts` checks staged `.changeset/*.md` files; the `release-guard.yml` workflow fails PRs that under-stage the bump.

## Authoring Recipes

### Mark a prop deprecated

```ts
export const FormItemMd: ComponentMetadata = {
  props: {
    pattern: {
      description: "Regex pattern validator.",
      status: "deprecated",
      deprecatedSince: "1.4.0",
      removedIn: "2.0.0",
      replacement: "validator",
      deprecationMessage: "Use the new <Validator> child instead.",
    },
  },
};
```

The LSP emits `deprecated-prop` immediately. Docs render an orange badge with the migration text. If a consumer ships `pattern` after version `2.0.0`, the verifier upgrades it to `removed-prop` and strict mode blocks the render.

### Rename a prop

```ts
export const ModalMd: ComponentMetadata = {
  renamedProps: {
    modal: { since: "1.3.0", canonical: "open" },
  },
  props: {
    open: { description: "Controls visibility." },
  },
};
```

`applyRenames()` (called by the verifier) rewrites the legacy attribute to the canonical name, emits `renamed-prop`, and lets the rest of the pipeline see the canonical key.

### Deprecate an enum value

```ts
props: {
  size: {
    description: "Modal width preset.",
    valueAliases: [
      { from: "huge", to: "xl", deprecatedSince: "1.5.0", removedIn: "2.0.0" },
    ],
  },
}
```

Components read the prop through `applyValueAliases("Modal", "size", value, propMeta)` to get the rewritten value and have the `deprecated-value` diagnostic emitted automatically.

### Roll a default forward without breaking apps

```ts
props: {
  submitPolicy: {
    description: "When to submit the form.",
    defaultValue: "valid",
    defaultValueChangedIn: [
      { version: "1.5.0", previousDefault: "any", note: "Strict forms by default." },
    ],
  },
}
```

If an app declares `<App preserveLegacyDefaults="{['Form.submitPolicy']}">`, calls to `applyPreserveLegacyDefault("Form", "submitPolicy", propMeta, appGlobals)` return `"any"` instead of the new framework default and emit `default-value-changed`.

## Migrating `pattern` → `validator`

`FormItem.pattern` is the canonical worked example for the rename pipeline. The metadata declares the deprecation; the rename helper rewrites markup; the analyzer rule surfaces it everywhere; the Inspector "Versioning" tab aggregates a "Copy migration report"; the release-guard CI ensures the changeset bump matches the surface change.

When `removedIn` (`2.0.0`) lands, strict mode escalates the prop to `error`. Apps that pin the legacy behaviour must drop the prop, swap in `<Validator>`, or list `Form.pattern` in `preserveLegacyDefaults` to delay the break.

## Rule Reference

| Rule (analyzer) | Code emitted | Notes |
| --- | --- | --- |
| `versioning/deprecated-component` | `deprecated-component` | Always warn. |
| `versioning/deprecated-prop` | `deprecated-prop` | Always warn. |
| `versioning/deprecated-event` | `deprecated-event` | Always warn. |
| `versioning/deprecated-method` | `deprecated-method` | Always warn. |
| `versioning/deprecated-value` | `deprecated-value` | Always warn. Emitted from runtime; the analyzer rule fires when markup uses the literal alias. |
| `versioning/removed-prop` | `removed-prop` | Strict → error. Requires `removedIn` in metadata. |
| `versioning/renamed-prop` | `renamed-prop` | Always warn. |
| `versioning/experimental-use` | `experimental-use` | Always warn. |
| `versioning/default-value-changed` | `default-value-changed` | Info only. Strict does not escalate. |
| `versioning/internal-component-use` | `internal-component-use` | Strict → error. |

## Release Guard

The `release-guard.yml` workflow runs on every PR that touches `xmlui/src/components/**` or `ComponentDefs.ts`:

1. Builds the metadata bundle for the PR branch.
2. Builds the metadata bundle for the merge-base.
3. Runs `tsx xmlui/scripts/api-diff/extract-cli.ts` against each to produce `ApiSurface` JSON.
4. Diffs them via `diffApiSurfaces()`.
5. Reads `.changeset/*.md` and runs `suggestChangeset()`.
6. Fails the workflow (and the PR) when the staged bump is lower than required, unless the workflow was invoked with `--allow-patch`.

Local mirror: `npm --prefix xmlui run check:api-diff -- --prev prev.json --next next.json --changesets .changeset`.

## Where to Look in the Code

- `xmlui/src/components-core/versioning/diagnostics.ts` — taxonomy + `VersioningDiagnostic` shape (now includes `sourceOffset`).
- `xmlui/src/components-core/versioning/verifier.ts` — pure parse-time walker; accepts a `ReadonlyMap` *or* a lookup function (`VersioningRegistry`).
- `xmlui/src/components-core/versioning/runtime.ts` — `emitVersioningDiagnostics()`, `collectVersioningReport()`, `formatMigrationPlan()`.
- `xmlui/src/components-core/versioning/propCoercion.ts` — `applyValueAliases`, `applyPreserveLegacyDefault`.
- `xmlui/src/components-core/analyzer/rules/versioning.ts` — analyzer rule family wired into the unified diagnostic pipeline.
- `xmlui/src/language-server/services/versioning-diagnostic.ts` — LSP provider chained from `diagnostic.ts`.
- `xmlui/src/components-core/rendering/AppContent.tsx` — one-shot parse-time hook bound to `rootContainer`.
- `xmlui/scripts/api-diff/` — extract / diff / suggest-changeset / release-guard CLIs.
- `xmlui/tests/components-core/versioning/` and `xmlui/tests/components-core/analyzer/rules/versioning.test.ts` — verifier, runtime, rename, propCoercion, and analyzer-rule tests.
