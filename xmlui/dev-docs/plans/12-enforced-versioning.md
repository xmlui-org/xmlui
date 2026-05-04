# Enforced Versioning & Deprecation — Implementation Plan

**Date:** 2026-04-30
**Status:** Proposal
**Source:** [`managed-react.md` §12 "Versioning and Backward Compatibility"](./managed-react.md) and the §17 scorecard row **"Versioning — Mechanism present, unenforced."**

---

## Goal

Close the §17 scorecard row:

> **Versioning — Mechanism present, unenforced.**
> Path to managed: *LSP deprecation diagnostics, prop-level deprecation.*

Today XMLUI versions the monorepo with Changesets (`patch` by
repo convention) and component metadata supports
`status: "stable" | "experimental" | "deprecated" | "in progress" | "internal"`
with a `deprecationMessage` field
([`ComponentDefs.ts`](../../src/abstractions/ComponentDefs.ts)
lines 249, 302, 376). Per-prop `deprecationMessage` exists on
`PropertyDef` (line 249) but no one acts on it. The CHANGELOG is
the only signal that anything has been removed.

The work is split into independently shippable steps in priority
order:

1. **Make existing metadata enforceable** — surface
   component- and prop-level `deprecationMessage` everywhere it
   matters: language-server diagnostics, parse-time warnings,
   runtime traces, doc-generation badges.
2. **Promote prop-level deprecation to a first-class channel** —
   `PropertyDef.deprecatedSince`, `removedIn`, `replacement`;
   same vocabulary on `EventDef` and `MethodDef`.
3. **Default-value, signature, and rename channels** —
   `defaultValueChangedIn` (with the old default preserved as
   an opt-in alias), `valueAliases` (with deprecation), and
   prop-rename helpers (used by the
   [forms-validation plan](./09-forms-validation-discipline.md)
   `pattern → validator` rename and the
   [routing plan](./10-defended-routing.md) for
   `<Page url>` constraint syntax).
4. **API surface diff at build time** — a script that diffs the
   exported metadata of two versions and produces a JSON report
   listing additions, modifications, removals; CI guard that
   fails a release without a matching changeset.
5. **Smarter changeset hint policy** — a small `bumpType`
   classifier that suggests `minor` for additions and `major`
   for removals, while keeping `patch` as a sensible default for
   edits and bug fixes (the existing repo convention).
6. **Strict default flip + docs** in next major.

Every step lands behind `App.appGlobals.strictVersioning: boolean`
(see Step 0).

---

## Conventions

- **Source of truth for component / prop metadata:**
  [`ComponentDefs.ts`](../../src/abstractions/ComponentDefs.ts).
  This file gains the new fields; every component author already
  fills it in.
- **Source of truth for the language server:** the existing
  `MetadataProvider` documented in
  [`language-server.md`](../../../.ai/xmlui/language-server.md).
  Diagnostics added here flow through that existing pipeline.
- **Source of truth for parse-time validation:** the same
  validator the
  [verified-type-contracts plan](./01-verified-type-contracts.md)
  introduces. Deprecation diagnostics piggyback on the same
  `TypeContractDiagnostic` traversal — one walk, multiple rule
  families.
- **Source of truth for doc generation:** the
  `MetadataProcessor` documented in
  [`doc-generation.md`](../../../.ai/xmlui/doc-generation.md).
  Deprecation badges render automatically from the same fields.
- **Existing infrastructure to reuse — do not reinvent:**
  - The
    [verified-type-contracts](./01-verified-type-contracts.md) plan's
    diagnostic traversal — deprecation is one more rule code.
  - The
    [structured-exception-model](./07-structured-exception-model.md)
    `AppError` — `category: "internal"` for "removed prop still
    used in markup at runtime" under strict mode.
  - The Changesets CLI (already in repo) — the build-time diff
    tool emits a *suggested* changeset rather than fighting the
    existing workflow.
- **New module location:**
  `xmlui/src/components-core/versioning/` (new directory) holds
  the diagnostic emitter, the rename helper, and the API-diff
  schema.
- **Build-time tooling location:**
  `xmlui/scripts/api-diff/` (new directory) holds the surface
  extractor, the differ, and the changeset suggester.
- **Diagnostic shape:** new `VersioningDiagnostic` carrying
  `{ code: VersioningDiagnosticCode, severity: "error" | "warn" |
  "info", componentName?, propName?, eventName?, methodName?,
  deprecatedSince?, removedIn?, replacement?, message }` where
  `VersioningDiagnosticCode ∈ { "deprecated-component",
  "deprecated-prop", "deprecated-event", "deprecated-method",
  "deprecated-value", "removed-prop", "renamed-prop",
  "experimental-use", "default-value-changed",
  "internal-component-use" }`.
- **Reporting mode:** new trace `kind: "versioning"`. Non-strict
  mode emits warns at LSP / parse / runtime level. Strict mode
  upgrades `removed-prop` and `internal-component-use` to errors;
  `deprecated-*` stay at warn (deprecation should not break the
  app, only nag).
- **Test layout:** unit tests under
  `xmlui/tests/components-core/versioning/`; one spec per step.
  End-to-end tests under `xmlui/tests-e2e/versioning/`. API-diff
  tooling tests under `xmlui/tests/scripts/api-diff/`.

Each step lists: scope, files touched, tests, acceptance criteria,
dependencies.

---

## Step 0 — Switch + Versioning Module Skeleton

**Priority:** 0 (foundational; nothing else lands without this)

### Scope

- Add `App.appGlobals.strictVersioning: boolean` (default `false`;
  flips to `true` in the next major).
- Create `xmlui/src/components-core/versioning/` with stubs:

  ```ts
  // diagnostics.ts
  export type VersioningDiagnosticCode =
    | "deprecated-component"
    | "deprecated-prop"
    | "deprecated-event"
    | "deprecated-method"
    | "deprecated-value"
    | "removed-prop"
    | "renamed-prop"
    | "experimental-use"
    | "default-value-changed"
    | "internal-component-use";
  export interface VersioningDiagnostic {
    code: VersioningDiagnosticCode;
    severity: "error" | "warn" | "info";
    componentName?: string;
    propName?: string;
    eventName?: string;
    methodName?: string;
    deprecatedSince?: string;     // semver
    removedIn?: string;           // semver
    replacement?: string;         // suggested replacement
    message: string;
  }
  ```

  ```ts
  // rename-helper.ts
  export interface PropRename {
    from: string;
    to: string;
    deprecatedSince: string;
    removedIn?: string;
    transform?: (oldValue: unknown) => unknown;  // optional value coercion
  }
  export function applyRenames(
    props: Record<string, unknown>,
    renames: readonly PropRename[],
  ): { props: Record<string, unknown>; diagnostics: VersioningDiagnostic[] };
  ```

  ```ts
  // index.ts — barrel
  ```

- Wire `"versioning"` into the
  [`XsLogEntry.kind`](../../src/components-core/inspector/inspectorUtils.ts)
  union and document the new appGlobals key in
  [`standalone.ts`](../../src/components-core/abstractions/standalone.ts).

### Files

- `xmlui/src/components-core/versioning/diagnostics.ts` (new)
- `xmlui/src/components-core/versioning/rename-helper.ts` (new)
- `xmlui/src/components-core/versioning/index.ts` (new — barrel)
- `xmlui/src/components-core/inspector/inspectorUtils.ts`
- `xmlui/src/components-core/abstractions/standalone.ts`

### Tests

- `versioning/rename-helper.test.ts` — empty rename list is a
  no-op; single rename emits one diagnostic and rewrites the prop.

### Acceptance

- `strictVersioning` reads through `App.appGlobals`.
- New module compiles; barrel exports stable.
- No existing test changes behaviour.

### Dependencies

None.

---

## Phase 1 — Surface Existing Deprecation Metadata

### Step 1.1 — LSP Diagnostics for `status: "deprecated"` and `deprecationMessage`

**Priority:** 1

#### Scope

- The language server's metadata-driven validation walk emits
  `deprecated-component` (severity `info`, surfaced as VS Code's
  strikethrough / hint) when:
  - the component's `status === "deprecated"`,
  - the message is the metadata's `deprecationMessage` (with a
    sensible default if absent).
- Same treatment for `status: "experimental"` →
  `experimental-use` (severity `info` only — does not warn, but
  marks the component so apps can audit).
- Same treatment for `status: "internal"` →
  `internal-component-use` (severity `warn`; strict-mode `error`).
- Per-prop: any prop with `deprecationMessage` in its `PropertyDef`
  emits `deprecated-prop` (severity `warn`).

#### Files

- `xmlui/src/components-core/lsp/MetadataProvider.ts` (or the
  current LSP validator entry point)
- `xmlui/src/components-core/versioning/diagnostics.ts`

#### Tests

- LSP-fixture tests under `xmlui/tests/components-core/lsp/`:
  - Using a deprecated component produces the diagnostic with
    the message text from metadata.
  - Using a deprecated prop produces the diagnostic.
  - Using an `internal` component produces a warn.

#### Acceptance

- Hovering a deprecated component in VS Code shows the
  deprecation message in the hover popup.
- The diagnostic includes a `replacement` field when the
  metadata provides one (Step 2.1 enriches this).

#### Dependencies

Step 0.

---

### Step 1.2 — Parse-Time and Runtime Echo

**Priority:** 2

#### Scope

- The same diagnostics emitted by the LSP also fire at parse time
  when `.xmlui` files are loaded (whether by Vite at build time or
  by the standalone runtime at startup) — gives developers the
  same warnings even outside the editor.
- One-shot deduplication: the same `(componentName, propName,
  diagnosticCode)` tuple emits at most once per app session, so
  hot loops with `Map`-typed children do not flood the trace.
- Each diagnostic appears as a `kind: "versioning"` trace entry
  in the Inspector.

#### Files

- `xmlui/src/components-core/rendering/renderChild.tsx` (or the
  current top-of-render validation hook)
- `xmlui/src/components-core/versioning/diagnostics.ts`

#### Tests

- `versioning/runtime-echo.test.ts` — a deprecated component used
  in markup produces exactly one Inspector entry per session.

#### Acceptance

- The Inspector "Versioning" tab (Step 4.1) lists every
  deprecation finding for the running app.

#### Dependencies

Step 1.1; verified-type-contracts plan Step 2.1 (the parse-time
validator the diagnostic piggybacks on).

---

### Step 1.3 — Doc Generation Badges

**Priority:** 3

#### Scope

- Every component / prop / event with non-stable status renders a
  badge in the generated docs:
  - `Experimental` — orange.
  - `Deprecated` — red, with `deprecationMessage` shown verbatim.
  - `Internal` — grey, "do not use in user markup".
- Each deprecated entry shows `Deprecated since <version>` and
  `Replaced by <replacement>` when those fields are present
  (Step 2.1 adds them).

#### Files

- `xmlui/scripts/generate-docs/MetadataProcessor.ts` (existing)
- `xmlui/dev-docs/templates/component.tpl` (existing — render
  badges)

#### Tests

- Snapshot tests under
  `xmlui/tests/scripts/generate-docs/badges.test.ts`.

#### Acceptance

- The docs site shows the badge on at least one existing
  deprecated entry.

#### Dependencies

Step 1.1.

---

## Phase 2 — First-Class Prop / Event / Method Deprecation Channel

### Step 2.1 — `deprecatedSince`, `removedIn`, `replacement`

**Priority:** 4

#### Scope

- Extend `PropertyDef`, `EventDef`, `MethodDef`, and the
  component-level metadata with three new fields:

  ```ts
  deprecatedSince?: string;   // semver, e.g. "0.10.0"
  removedIn?: string;         // semver, e.g. "1.0.0"
  replacement?: string;       // free text or "<componentName>.<propName>"
  ```

- Behaviour:
  - `deprecatedSince` set, `removedIn` unset → diagnostic at
    `warn`.
  - `deprecatedSince` and `removedIn` both set, current version
    < `removedIn` → diagnostic at `warn` with the removal
    timeline in the message.
  - Current version ≥ `removedIn` → the prop is treated as
    removed: parse-time `removed-prop` diagnostic (warn in
    non-strict, error in strict); runtime ignores the value.
- The build-time API-diff tool (Phase 3) reads these fields to
  validate the changeset bump.

#### Files

- `xmlui/src/abstractions/ComponentDefs.ts` (extend types)
- `xmlui/src/components-core/versioning/diagnostics.ts` (read the
  fields)
- `.ai/xmlui/component-architecture.md` (document the fields)

#### Tests

- `versioning/lifecycle.test.ts` — three matrix cases (warn,
  warn-with-removal, removed) produce expected diagnostics.

#### Acceptance

- `deprecationMessage` continues to work without the new fields
  (backward compatible).

#### Dependencies

Step 1.1.

---

### Step 2.2 — Value-Level Deprecation

**Priority:** 5

#### Scope

- Some props deprecate specific *values* not the whole prop
  (e.g. `<Modal size="huge">` if `huge` is renamed to `xl`).
  Extend the value-aliases mechanism on `PropertyDef`:

  ```ts
  valueAliases?: ReadonlyArray<{
    from: string;
    to: string;
    deprecatedSince: string;
    removedIn?: string;
  }>;
  ```

- Aliases are resolved transparently at coercion time; the old
  value still produces the new behaviour, with a
  `deprecated-value` diagnostic.

#### Files

- `xmlui/src/abstractions/ComponentDefs.ts`
- `xmlui/src/components-core/rendering/valueExtractor.ts`
- `xmlui/src/components-core/versioning/rename-helper.ts`

#### Tests

- `versioning/value-aliases.test.ts` — `size="huge"` continues to
  produce the `xl` size and emits one diagnostic.

#### Acceptance

- The
  [verified-type-contracts plan](./01-verified-type-contracts.md)
  enum coercion table understands `valueAliases` (delegates back
  to this module).

#### Dependencies

Step 2.1; verified-type-contracts plan Step 1.2.

---

### Step 2.3 — Default-Value Change Channel

**Priority:** 6

#### Scope

- A prop's default value sometimes changes between versions
  (e.g. `<Form submitPolicy>` defaults to `"single-flight"` in
  the [forms-validation plan](./09-forms-validation-discipline.md)
  Step 4.1). Extend `PropertyDef`:

  ```ts
  defaultValueChangedIn?: ReadonlyArray<{
    version: string;       // semver
    previousDefault: unknown;
    note?: string;
  }>;
  ```

- A new `<App preserveLegacyDefaults>` array prop opts a specific
  prop back to its previous default for migration:

  ```xmlui
  <App preserveLegacyDefaults="{['Form.submitPolicy']}">
    ...
  </App>
  ```

- When an app uses `preserveLegacyDefaults`, the framework emits
  a `default-value-changed` diagnostic per affected component
  (severity `info`).

#### Files

- `xmlui/src/abstractions/ComponentDefs.ts`
- `xmlui/src/components-core/rendering/valueExtractor.ts`
- `xmlui/src/components/App/App.tsx`

#### Tests

- `versioning/default-change.test.ts` — opting back to a previous
  default produces the previous behaviour and emits the
  diagnostic.

#### Acceptance

- The forms-validation plan's `submitPolicy` rollout uses this
  channel — apps can stay on the old "no guard" default by
  listing `Form.submitPolicy` in `preserveLegacyDefaults`.

#### Dependencies

Step 2.1.

---

### Step 2.4 — Prop Rename Helper

**Priority:** 7

#### Scope

- The `applyRenames()` utility (skeleton in Step 0) is wired into
  the prop-resolution path. Component metadata declares renames
  via:

  ```ts
  renamedProps?: ReadonlyArray<PropRename>;
  ```

- Behaviour:
  - If markup uses the old name, the value is rewritten to the new
    name, an optional `transform` runs, and `renamed-prop`
    diagnostic emits.
  - If markup uses both names, the new name wins and an
    additional `info` diagnostic flags the conflict.
- The
  [forms-validation plan](./09-forms-validation-discipline.md)
  `pattern → validator` rename moves to this mechanism (its
  Step 1.2 currently spells the alias inline; this plan
  centralises it).

#### Files

- `xmlui/src/abstractions/ComponentDefs.ts`
- `xmlui/src/components-core/rendering/valueExtractor.ts`
- `xmlui/src/components-core/versioning/rename-helper.ts`

#### Tests

- `versioning/rename.test.ts` — both names resolve; conflict is
  diagnosed; `transform` runs.

#### Acceptance

- After this step lands, the forms-validation plan's `pattern`
  alias migrates to a one-line `renamedProps` declaration.

#### Dependencies

Step 2.1.

---

## Phase 3 — Build-Time API Surface Diff

### Step 3.1 — Surface Extractor

**Priority:** 8

#### Scope

- New script `xmlui/scripts/api-diff/extract.ts` that walks all
  registered component metadata and emits a JSON snapshot:

  ```json
  {
    "components": {
      "Button": {
        "status": "stable",
        "props": {
          "label":  { "valueType": "string" },
          "icon":   { "valueType": "icon", "deprecatedSince": "0.9.0" },
          ...
        },
        "events": { "click": { "deprecated": false } },
        "methods": { "focus": { ... } }
      }
    },
    "version": "0.10.0"
  }
  ```

- Snapshot is emitted at every release into
  `xmlui/api-snapshots/<version>.json` (committed; small text
  file). The release CI ensures the snapshot matches the
  published version.

#### Files

- `xmlui/scripts/api-diff/extract.ts` (new)
- `xmlui/api-snapshots/.gitkeep` (new directory marker)

#### Tests

- `tests/scripts/api-diff/extract.test.ts` — the snapshot of the
  current build is stable across runs (no nondeterminism).

#### Acceptance

- The first snapshot committed becomes the baseline for Step 3.2.

#### Dependencies

Step 2.1.

---

### Step 3.2 — Differ + Changeset Suggester

**Priority:** 9

#### Scope

- New script `xmlui/scripts/api-diff/diff.ts`:
  - Compares two snapshots.
  - Classifies each delta:
    - **Added component** → `minor`.
    - **Added prop / event / method** → `minor`.
    - **Removed component / prop without `removedIn` matching the
      new version** → **`major`**, error.
    - **Status change `stable → deprecated`** → `minor`.
    - **Default value change without `defaultValueChangedIn`
      record** → **`major`**, error.
    - **Renamed prop without `renamedProps` record** → **`major`**,
      error.
  - Emits a `bumpType` recommendation (`patch | minor | major`).
- New script `xmlui/scripts/api-diff/suggest-changeset.ts`:
  - Reads the diff output.
  - Scans `.changeset/` for matching entries.
  - Emits a markdown report listing missing changeset entries
    needed to satisfy the diff. (Does not auto-create the
    changeset — that is for the human to confirm.)
- CI workflow `release-guard.yml`:
  - Runs `extract.ts` on the PR build.
  - Runs `diff.ts` against the latest published snapshot.
  - Fails the PR if the diff demands a `major` bump and no
    `major` changeset exists; warns if `minor` is suggested but
    only `patch` is staged.

#### Files

- `xmlui/scripts/api-diff/diff.ts` (new)
- `xmlui/scripts/api-diff/suggest-changeset.ts` (new)
- `.github/workflows/release-guard.yml` (new)

#### Tests

- `tests/scripts/api-diff/diff.test.ts` — fixture pair of
  snapshots produces the expected delta classification.
- `tests/scripts/api-diff/suggest-changeset.test.ts` — missing
  changeset is flagged.

#### Acceptance

- The release guard fails a PR that removes a prop without a
  `major` changeset.
- The release guard succeeds for the current state of the repo
  (i.e. the baseline does not retroactively flag past changes).

#### Dependencies

Step 3.1.

---

### Step 3.3 — `patch` Convention Compatibility

**Priority:** 10

#### Scope

- The repo convention "everything is `patch` unless stated"
  (`AGENTS.md` Changesets section) stays as the human default —
  the guard only escalates when the diff demands it.
- The suggester output explicitly says
  *"Repo convention is `patch`; this change requires `minor` /
  `major` for the following reasons: …"* so a maintainer
  understands why.
- A `--allow-patch` flag on the suggester accepts a documented
  override (e.g. fixing an undocumented but technically-breaking
  bug) — the override is recorded in the changeset body for
  future review.

#### Files

- `xmlui/scripts/api-diff/suggest-changeset.ts` (extended)
- `AGENTS.md` (note the new tooling)

#### Tests

- `tests/scripts/api-diff/patch-allow.test.ts` — `--allow-patch`
  produces a passing exit code with a recorded note.

#### Acceptance

- The guideline that `patch` is the default does not change; the
  guard only intervenes when metadata says otherwise.

#### Dependencies

Step 3.2.

---

## Phase 4 — Inspector Surface

### Step 4.1 — "Versioning" Inspector Tab

**Priority:** 11

#### Scope

- The Inspector gains a "Versioning" tab listing every
  `kind: "versioning"` trace entry collected during the session,
  grouped by component.
- Each row shows the diagnostic code (badge), the markup
  location, the message, and a link to the migration docs.
- A "Copy migration plan" button concatenates all findings into
  a markdown checklist suitable for a migration ticket.

#### Files

- `xmlui/src/components-core/inspector/InspectorUI.tsx` (or
  current Inspector entry point)

#### Tests

- `tests-e2e/versioning/inspector.spec.ts` — fixture page with
  three deprecations renders three rows in the tab.

#### Acceptance

- Apps can audit their entire deprecation debt from the
  Inspector without scraping the trace stream by hand.

#### Dependencies

Step 1.2.

---

## Phase 5 — Documentation & Strict Default

### Step 5.1 — Versioning Chapter

**Priority:** 12

#### Scope

- New `xmlui/dev-docs/guide/35-versioning.md` chapter.
- Updates `.ai/xmlui/component-architecture.md` with the new
  metadata fields.
- Updates [`managed-react.md` §12](./managed-react.md):
  - Mark "Deprecation is metadata-only" as resolved.
  - Mark "No prop-level deprecation channel" as resolved.
  - Mark "No API surface diff at build time" as resolved.
  - Note that `patch`-by-default convention stays, with the
    guard escalating only when metadata demands it.
- Updates the §17 scorecard row from
  *"Mechanism present, unenforced"* to
  *"Enforced — LSP diagnostics, prop-level deprecation, API-diff
  release guard."*
- Updates [`AGENTS.md` documentation map](../../../AGENTS.md).

#### Files

- `xmlui/dev-docs/guide/35-versioning.md` (new)
- `.ai/xmlui/component-architecture.md`
- `xmlui/dev-docs/plans/managed-react.md`
- `AGENTS.md`

#### Acceptance

- Chapter covers each of the new metadata fields with at least
  one worked example, plus a migration section for
  `pattern → validator` style renames.
- A "rule reference" table lists every `VersioningDiagnosticCode`
  with cause, severity in non-strict / strict, example fix.

#### Dependencies

Steps 1–4.

---

### Step 5.2 — Default `strictVersioning: true` in Next Major

**Priority:** 13 (post-feedback)

#### Scope

- After at least one minor cycle of warn-mode telemetry, flip the
  default in the next major release: `strictVersioning: true`.
- Effects under strict mode:
  - `removed-prop` becomes an error (markup using a removed prop
    fails to render that component, with a placeholder message
    pointing at the migration).
  - `internal-component-use` becomes an error.
  - `deprecated-*` stay at warn (deprecation should never break
    the app — only nag).
- Add a changeset and migration note.

#### Files

- `xmlui/src/components-core/abstractions/standalone.ts`
- `.changeset/strict-versioning-default.md`
- `xmlui/dev-docs/guide/35-versioning.md` (migration section)

#### Tests

- Existing test suite passes with the default flipped.
- `xmlui/tests-e2e/versioning/strict-mode.spec.ts` covers each
  diagnostic under strict.

#### Acceptance

- All in-repo example apps and the docs site pass under strict
  versioning (no removed props in use).

#### Dependencies

Step 5.1.

---

## Rollout

| Phase | Steps | Behaviour | When |
|---|---|---|---|
| **Foundations** | 0 | Switch + skeleton | Next minor |
| **Surface existing metadata** | 1.1, 1.2, 1.3 | LSP, parse-time, doc badges | Next minor + 1 |
| **Lifecycle fields** | 2.1, 2.2 | `deprecatedSince`, `removedIn`, `replacement`, value aliases | Next minor + 2 |
| **Default + rename channels** | 2.3, 2.4 | `defaultValueChangedIn`, `renamedProps` | Next minor + 2 |
| **API diff** | 3.1, 3.2, 3.3 | Snapshot extractor, differ, release guard | Next minor + 3 |
| **Inspector** | 4.1 | "Versioning" tab | Next minor + 3 |
| **Docs + strict default** | 5.1, 5.2 | Guide chapter; strict default in next major | Next major |

Each step is independently revertible — the new metadata fields
are optional, the rename helper degrades to no-op without
declarations, the API-diff CI step can be removed without
affecting runtime behaviour.

---

## Step Dependency Graph

```
Step 0 (switch + skeleton)
   │
   ├─> Step 1.1 (LSP diagnostics)
   │      │
   │      ├─> Step 1.2 (parse + runtime echo)       ← verified-type-contracts Step 2.1
   │      │      │
   │      │      └─> Step 4.1 (Inspector tab)
   │      │
   │      └─> Step 1.3 (doc badges)
   │
   ├─> Step 2.1 (deprecatedSince / removedIn / replacement)
   │      │
   │      ├─> Step 2.2 (value aliases)             ← verified-type-contracts Step 1.2
   │      │
   │      ├─> Step 2.3 (default-value channel)
   │      │
   │      ├─> Step 2.4 (prop rename helper)
   │      │
   │      └─> Step 3.1 (snapshot extractor)
   │             │
   │             └─> Step 3.2 (differ + guard)
   │                    │
   │                    └─> Step 3.3 (patch compatibility)
   │
   └─────────────────────────────────────────> Step 5.1 (docs)
                                                  │
                                                  └─> Step 5.2 (strict default)
```

---

## Resolved Decisions

These are the design choices baked into the plan. Each has an
alternative noted for future revisitation.

1. **Deprecation diagnostics never break the app.** Their job is
   to surface migration debt, not to fail at runtime. Strict
   mode upgrades only the `removed-prop` and
   `internal-component-use` codes — the rest stay at `warn` /
   `info`. Alternative considered: fail-on-deprecation in strict
   — rejected because it would force preemptive migration before
   the framework has actually removed the API.

2. **Existing `deprecationMessage` field stays.** Adding new
   structured fields (`deprecatedSince`, `removedIn`,
   `replacement`) does not remove the free-text channel; they
   complement it. Alternative considered: replace `deprecationMessage`
   — rejected because it would break every existing component
   metadata file in a single release.

3. **Snapshot files committed to the repo.** Reviewers can see
   the API surface change in the same diff as the code change.
   Alternative considered: snapshot computed only in CI —
   rejected because it would hide the actual delta from PR
   reviewers.

4. **`patch`-by-default convention stays.** The repo's preference
   minimises noise for legitimate bug fixes; the API-diff guard
   only intervenes when metadata indicates a real semantic
   change. Alternative considered: drop the convention and let
   the guard pick the bump for every change — rejected because
   pure refactors and bug fixes would generate `patch` either
   way and the convention saves contributor friction.

5. **Renames are declarative metadata, not code branches in
   each component.** Component authors declare `renamedProps:
   [{ from: 'pattern', to: 'validator', ... }]` and the
   framework handles aliasing, diagnostics, and the optional
   `transform`. Alternative considered: per-component if/else in
   the renderer — rejected as the pattern that produces drift
   between the rename, the diagnostic, and the docs.

6. **Default-value change requires a recorded
   `defaultValueChangedIn` entry to pass the build-time guard.**
   Forces the migration story to land alongside the change.
   Alternative considered: silent default change, only
   CHANGELOG mention — rejected because that is precisely the
   "mechanism present, unenforced" failure mode §12 calls out.

7. **API-diff guard is build-time only, not runtime.** Runtime
   does not know what the previous version looked like; the
   diff is a CI-time concern. Alternative considered: ship the
   previous snapshot in the runtime for self-diagnosis —
   rejected because it doubles the bundle for no user benefit.

8. **No automatic codemod tool ships with this plan.** The
   diagnostic includes the `replacement` text so a developer (or
   an AI agent) can apply the migration; a separate codemod
   tooling effort is a future plan if demand surfaces.

9. **`strictVersioning` default flip waits for a major.** Same
   rationale as the other plans — the warn-mode telemetry window
   is needed before failing on `removed-prop` and
   `internal-component-use`.

10. **Inspector tab is a *log* of findings, not a *control*.**
    Apps cannot dismiss or mute diagnostics from the Inspector;
    the only suppression mechanism is fixing the markup or
    declaring `preserveLegacyDefaults`. Alternative considered:
    per-app suppression list — rejected because it would
    encourage the "ignore the warning forever" anti-pattern that
    the whole plan exists to prevent.

---

## Out of Scope

- **Automatic migration codemods** (e.g. a CLI that rewrites
  `pattern="email"` to `validator="email"` across `.xmlui` files).
  Future tooling plan; the diagnostics + replacement text are
  the prerequisite this plan delivers.
- **Theme variable deprecation.** The
  [theming-sandbox plan](./08-sealed-theming-sandbox.md) and
  [themevars-namespace plan](./02-themevars-namespace.md) own theme
  variable lifecycle; this plan addresses component / prop /
  event / method only.
- **Per-page version pinning** (e.g. "this page renders against
  XMLUI 0.9 semantics"). Not requested; would multiply the
  framework's runtime surface for marginal gain.
- **Deprecation of expression-level globals**
  (`App.fetch`, `App.toast`, etc.). Possible future extension;
  the same `deprecatedSince` / `removedIn` vocabulary applies but
  needs a separate registry. Out of this plan.
- **Backporting fixes to older majors / LTS releases.** Release
  policy concern, not framework code. The release guard makes
  the bump *visible*; the maintainer chooses how to ship it.
- **Custom semver schemes.** The plan assumes standard semver
  (`major.minor.patch`); pre-release tags (`-alpha.1`) pass
  through unmodified. Calendar-versioned packages would need a
  different classifier.
- **Validating extension package versions against core.** The
  [extension-packages plan](../../../guidelines.md) — if it
  exists — owns inter-package semver; this plan applies only to
  metadata changes within `xmlui` itself and packages that
  re-export the same metadata channel.
