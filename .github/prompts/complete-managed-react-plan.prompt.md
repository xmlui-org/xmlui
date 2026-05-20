---
agent: agent
description: Check and complete a specific Managed React feature plan, then document it on the website
---

# Complete a Managed React Feature Plan

A "Managed React plan" is one of the 17 feature plans in `xmlui/dev-docs/plans/`. Each plan closes
a structural gap between XMLUI as shipped and XMLUI as a fully managed React framework.

This prompt checks whether a specific plan is already complete, implements missing parts, and then
documents the feature for end users on the website.

## Before starting

1. Ask the user which plan to work on (by number or name) if not already specified.
2. Read `xmlui/dev-docs/plans/00-master-plan.md` — understand the plan's wave, risk tier,
   and the per-step workflow (Section 2: scope → implement → lint → test → docs → integrate).
3. Read the specific plan file: `xmlui/dev-docs/plans/NN-<plan-name>.md` — all phases and steps.
4. Read `xmlui/dev-docs/plans/STATUS.md` — check the plan's current status row.
5. Read `.ai/xmlui/component-architecture.md` — if the plan adds or modifies components.
6. Read `.ai/xmlui/testing-conventions.md` — for any test work.
7. Read the reference doc plan #17 (`xmlui/dev-docs/plans/17-dom-api-hardening.md`) as a model
   for what a completed plan looks like.

## Implementation steps

### Step 1 — Assess current state

Read the STATUS.md row for the plan and the plan file's phase list. Determine:

- Which phases are already done (listed as "done" in STATUS.md notes)
- Which phases remain (not mentioned, or listed as "remaining")
- Whether the plan is fully complete (all phases done)

If the plan is already complete, skip to Step 5 (documentation) and note that in your response.

If you encounter an obstacle that prevents implementation (missing prerequisite plan, architectural
conflict, insufficient context), **stop and report it clearly** before doing any implementation work.

### Step 2 — Implement missing phases

For each unimplemented phase, follow the master plan's per-step workflow from `00-master-plan.md`
Section 2:

1. **Scope**: read the plan's phase description; identify every file to create or modify
2. **Implement**: make the changes — new modules, updated types, wired call sites
3. **Lint**: run `npx tsc --noEmit` in the `xmlui/` package to catch type errors
4. **Test**: add or update unit tests under `xmlui/tests/`; run the test suite
5. **Integrate**: wire the new module into the provider/registry/AppContext where the plan specifies

Key conventions from `00-master-plan.md` Section 6 (all phases must respect):
- New modules go under `xmlui/src/components-core/<plan-slug>/`
- Every new `kind` must be registered on `XsLogEntry` in `XsLog.ts`
- Every new `appGlobals.*` flag must be documented in `AppContextDefs.ts`
- Strict-mode switches default to `false`; they flip to `true` only in W8 or a major release
- Never break existing tests; run `npx playwright test --reporter=line` before finishing

```bash
# Type-check
cd xmlui && npx tsc --noEmit

# Unit tests for your new module
npx vitest run tests/components-core/<plan-slug>/

# Full unit suite (fast)
npx vitest run

# E2E smoke check
npx playwright test --reporter=line --workers=4
```

### Step 3 — Verify implementation

Confirm the plan's stated deliverables exist in the codebase:
- Module files created under `components-core/`
- `appGlobals` flags documented
- `kind` registered
- Diagnostic codes defined
- Tests passing

### Step 4 — Update STATUS.md

In `xmlui/dev-docs/plans/STATUS.md`, update the plan's row:

- If all phases are now done, change 🔄 to ✅ and move the row to the "Closed" table
- If phases remain (deferred to W8 or later), update the Notes column with what shipped and what remains
- Set *Last updated* to the current month in `YYYY-MM` format

Follow the "How to update this file" instructions at the bottom of STATUS.md exactly.

### Step 5 — Write the user-facing feature documentation

Create a new Markdown file at:
```
website/content/docs/pages/managed-react/<plan-slug>.md
```

The document must be written **from the user's point of view**, not as an internal plan summary.
Write for an XMLUI app developer who uses the framework, not for a framework contributor.

Structure:
```markdown
# <Feature name>

<One-paragraph summary of what this feature does for the user and why it matters.>

## What problems this prevents

<Bullet list of 3–5 concrete problems the user no longer has to worry about, stated in plain
language. Each bullet should name a class of bug, mistake, or silent failure that this feature
catches or prevents. For example: "Typos in theme variable names now produce a clear warning
instead of silently having no effect.">

## How it works

<Brief explanation of the mechanism — enough for the user to understand what the framework is
doing on their behalf. Keep this short (2–4 sentences). Do NOT reproduce internal implementation
details.>

## Enabling strict mode

<If the plan has a `strictXxx` appGlobals flag, explain how to enable it and what changes:
- Warnings become errors
- Behaviour that was previously silent/advisory is now enforced
Show a short config snippet.>

## Related

<Links to related built-in components, how-to guides, or other Managed React features.>
```

### Step 6 — Add a NavLink in the website

In `website/src/Main.xmlui`, add a `<NavLink>` inside the `<NavGroup label="Managed React">` block
(around line 264). Follow the same pattern as other `<NavLink>` entries:

```xml
<NavLink
    label="<Human-readable feature name>"
    to="/docs/managed-react/<plan-slug>"
/>
```

### Step 7 — Register the Page route

In `website/src/Main.xmlui`, add a `<Page>` entry near the existing managed-react overview page
(around line 2491). Follow the exact pattern:

```xml
<Page
    url="/docs/managed-react/<plan-slug>"
>
    <DocumentPage
        content="{appGlobals.docsContent['pages/managed-react/<plan-slug>.md']}"
    />
</Page>
```

### Step 8 — Final verification

```bash
# Confirm website builds without errors
cd website && npx tsc --noEmit
```

Visually verify the new NavLink appears and the page renders by checking the route pattern
matches the content key exactly.

## Key warnings / Absolute rules

- **Stop and report obstacles** — if a prerequisite plan is unimplemented, or if an architectural
  conflict exists, do not work around it; explain the blocker clearly.
- **Strict defaults stay `false`** — do not flip `strictXxx` to `true` unless the plan explicitly
  schedules it for W8 or a major release.
- **Never edit generated files** — `website/content/docs/pages/components/*.mdx` files are
  auto-generated; do not touch them.
- **User-facing docs only** — the Markdown file you create is for app developers, not framework
  contributors; avoid internal module names, file paths, and PR references.
- **STATUS.md is the record of truth** — always update it; do not mark ✅ unless every phase
  listed in the plan file is done.
- **Follow plan conventions** — each plan file has its own "Conventions" section; obey it.
