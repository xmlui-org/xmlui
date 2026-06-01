# Enforced Versioning

XMLUI's component lifecycle metadata is a machine-checkable contract. The same fields that render doc badges drive parse-time diagnostics, runtime echoes, and release-time semver gating. Plan reference: `dev-docs/plans/12-enforced-versioning.md`. Human-readable companion: `dev-docs/guide/36-versioning.md`. End-user page: `/docs/managed-react/enforced-versioning`.

## Vocabulary

- Component-level: `status`, `deprecationMessage`, `deprecatedSince`, `removedIn`, `replacement`, `renamedProps`.
- Prop-level: same plus `valueAliases: ReadonlyArray<{ from; to; deprecatedSince; removedIn? }>` and `defaultValueChangedIn: ReadonlyArray<{ version; previousDefault; note? }>`.
- Event / method: status + deprecation tuple.

## Diagnostic Codes (`VersioningDiagnosticCode`)

`deprecated-component`, `deprecated-prop`, `deprecated-event`, `deprecated-method`, `deprecated-value`, `removed-prop`, `renamed-prop`, `experimental-use`, `default-value-changed`, `internal-component-use`.

Default severities are `warn` for the deprecation family and `info` for `default-value-changed`. `appGlobals.strictVersioning` (default `false`) escalates only `removed-prop` and `internal-component-use` to `error`. Deprecation codes always stay at `warn` — deprecation nags, it does not break apps.

## Pipeline

| Stage | Module |
| --- | --- |
| Pure parse-time walker | `components-core/versioning/verifier.ts` (`verifyVersioning(def, registry, opts)`). Registry can be a `Map` or a lookup function — both covered by `VersioningRegistry`. |
| Runtime echo + dedup | `components-core/versioning/runtime.ts` (`emitVersioningDiagnostics`). Dedups per `(componentName, propName, code)`. |
| Aggregated reports | Same module: `collectVersioningReport`, `formatMigrationPlan`. Backs Inspector "Versioning" tab. |
| Prop coercion | `components-core/versioning/propCoercion.ts` (`applyValueAliases`, `applyPreserveLegacyDefault`). |
| Prop rename | `components-core/versioning/rename-helper.ts` (`applyRenames`). |
| Analyzer rule family | `components-core/analyzer/rules/versioning.ts`. One rule per code; severity escalation honoured. |
| LSP provider | `language-server/services/versioning-diagnostic.ts`, chained from `diagnostic.ts`. |
| Parse-time hook | `rendering/AppContent.tsx` — `useEffect([rootContainer, componentRegistry])` calls `verifyVersioning` once per root tree, forwards to `emitVersioningDiagnostics`. |
| Release-time guard | `scripts/api-diff/extract.ts`, `diff.ts`, `suggest-changeset.ts`, plus the new CLIs `extract-cli.ts` and `release-guard.ts`. Workflow: `.github/workflows/release-guard.yml`. |
| Docs | `scripts/generate-docs/MetadataProcessor.mjs` — `lifecycleBadge()` renders per-prop/event/method badges; component-level status disclaimer now covers `experimental`, `deprecated`, `internal`. |

## App-level Knobs

- `appGlobals.strictVersioning: boolean` — escalates `removed-prop` + `internal-component-use`.
- `appGlobals.preserveLegacyDefaults: string[]` — opts back into the pre-change default for a `"Component.prop"` entry. Triggers `default-value-changed`.

## Authoring Defaults

- Every new deprecation declares `deprecatedSince`. `removedIn` is required for the verifier to ever emit `removed-prop`.
- Renames use `renamedProps`; the verifier rewrites the legacy attribute and emits `renamed-prop`.
- Enum value renames use `valueAliases` and consume `applyValueAliases()` inside the component renderer to honour the rewrite at runtime.
- Default flips ship as `defaultValueChangedIn` entries; the framework default changes immediately and the app can opt back via `preserveLegacyDefaults`.

## Forbidden

- Flipping `strictVersioning` default to `true` outside a major. Deprecation diagnostics never escalate to `error`. Strict only ever escalates `removed-prop` and `internal-component-use`.

## Tests

- `tests/components-core/versioning/{verifier,runtime,rename-helper,propCoercion}.test.ts`
- `tests/components-core/analyzer/rules/versioning.test.ts`
- `tests/scripts/api-diff/*` (extract, diff, suggest-changeset)
