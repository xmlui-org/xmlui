---
"xmlui": patch
---

W6-4 / W6-5 / W6-6 — Enforced versioning (plan #12) Step 0 + Phases 1–4 land
the versioning surface:

- New `src/components-core/versioning/` module with `VersioningDiagnostic`
  taxonomy (10 codes), `verifyVersioning()` walker, per-session
  `emitVersioningDiagnostics()` echo (dedup by `(componentName, propName,
  code)`), `applyRenames()` prop-rename helper, and the
  `collectVersioningReport()` + `formatMigrationPlan()` aggregator that
  backs the Inspector "Versioning" tab.
- `App.appGlobals.strictVersioning: boolean` (default `false`) flips
  `removed-prop` and `internal-component-use` from `warn` to `error`;
  `deprecated-*` always stays at `warn` so deprecation nags but never
  breaks an app.
- `XsLogEntry.kind` documents the new `"versioning"` kind.
- `ComponentPropertyMetadata`, `ComponentEventMetadata`, and
  `ComponentApiMetadata` gain `deprecatedSince`, `removedIn`,
  `replacement`; `ComponentPropertyMetadata` adds `valueAliases` and
  `defaultValueChangedIn`; `ComponentMetadata` adds `renamedProps`.
- New build-time tooling under `scripts/api-diff/`:
  `extract.ts` produces deterministic `ApiSurface` snapshots,
  `diff.ts` classifies deltas to `patch | minor | major`, and
  `suggest-changeset.ts` checks staged changesets against the required
  bump (with `--allow-patch` override to honour the repo's `patch`-default
  convention when intentional).
- Unit tests under `tests/components-core/versioning/` (verifier, rename
  helper, runtime echo, report) and `tests/scripts/api-diff/` (extract +
  diff + suggester).
