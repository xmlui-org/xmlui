# AI Assistance Optimization Plan

## Problem

Context windows fill up quickly. AI assistants repeatedly need the same project orientation — architecture, conventions, current tasks — before they can be useful. This costs tokens and limits how much real work fits in a session.

This plan is organized around three frequently executed chores that need high-quality AI support:

1. **Implementing a new XMLUI component**
2. **Extending an existing XMLUI component**
3. **Refactoring some part of the core framework**

---

## What Already Exists

| Asset | Location | Purpose |
|---|---|---|
| `AGENTS.md` | Repo root | Agent orientation: what XMLUI is, repo layout, tooling |
| `xmlui/conventions/xmlui-in-a-nutshell.md` | Conventions | Framework overview |
| `xmlui/conventions/component-qa-checklist.md` | Conventions | Component review checklist |
| `xmlui/conventions/refactor-template.md` | Conventions | Refactoring template/prompt |
| `xmlui/dev-docs/conv-create-components.md` | Dev docs | Creating components (very large ~3k lines) |
| `xmlui/dev-docs/conv-e2e-testing.md` | Dev docs | E2E test conventions |
| `xmlui/dev-docs/conv-unit-testing.md` | Dev docs | Unit test conventions |
| `feature.md` | Repo root | Currently empty — intended for current workstream |
| `/memories/repo/` | Copilot memory | Repo-scoped persistent facts (sparse) |

---

## Chore Profiles

### Chore 1: Implement a New Component

**What the AI needs to know:**
- What XMLUI is and how components fit in (orientation)
- File/naming conventions, registration in `ComponentProvider.tsx`
- Metadata API (`createMetadata`, `d`, `dClick`, …)
- Renderer context (`extractValue`, `lookupEventHandler`, `registerComponentApi`)
- Native component pattern (`forwardRef`, `defaultProps`)
- SCSS module + theme variable structure
- Parts pattern (if applicable)
- Unit and E2E test conventions
- What the new component should do (current task context)

**Gaps:**
- The AI must currently read ~3k-line `conv-create-components.md` entirely — most of it may be irrelevant for any single component
- "What the component should do" is never written down; the AI infers it from conversation
- No prompt file exists to kick off this chore reproducibly
- No scoped instruction file guides the AI when opening files in `xmlui/src/components/`

**Actions needed:**
- [ ] **Split `conv-create-components.md`** into focused sub-files (metadata, renderer, native, styling, parts, state) so only relevant sections are loaded
- [ ] **Create `.github/prompts/create-component.prompt.md`** — the full recipe, referencing the split sub-files
- [ ] **Create `.github/instructions/components.instructions.md`** — auto-injected when editing `xmlui/src/components/**`; contains key rules (no index.ts, register in ComponentProvider, dual-file pattern)
- [ ] **Establish `feature.md` convention** — fill before each new component session (component name, proposed API: props/events/methods, design notes)

---

### Chore 2: Extend an Existing Component

**What the AI needs to know:**
- Same fundamentals as Chore 1, but less of them (component pattern is already established)
- The existing component's current API (props, events, theme variables, parts)
- What is being added and why
- How to avoid breaking existing behavior (no regressions in existing tests)
- Whether the change requires a changeset

**Gaps:**
- No "extend component" prompt exists — sessions re-explain the same boilerplate
- The AI often reads the wrong file (e.g., `ComponentNameNative.tsx` for metadata instead of `ComponentName.tsx`)
- Changesets are often forgotten

**Actions needed:**
- [ ] **Create `.github/prompts/extend-component.prompt.md`** — workflow: read existing component metadata → identify what to add → implement → run tests → add changeset if user-facing
- [ ] **Update `.github/instructions/components.instructions.md`** — include: "Metadata is in `ComponentName.tsx` not `ComponentNameNative.tsx`; always read both files before editing"
- [ ] **Add changeset reminder** to the prompt: check if change is user-facing; if yes, follow changeset process in `AGENTS.md`
- [ ] **Use `feature.md`** to record: component name, what is being added, links to relevant files, current status

---

### Chore 3: Refactor Core Framework

**What the AI needs to know:**
- The subject of the refactoring (which file/subsystem)
- Architecture of that subsystem (rendering pipeline, state containers, theming, etc.)
- Refactoring goals and constraints (readability, line count, linear flow)
- Step-by-step plan with test checkpoints
- Test commands (unit: `test:unit`, E2E: run from workspace root)

**Gaps:**
- `refactor-template.md` exists and is good — but it references `plan.md` beside the subject, which creates clutter
- The template lists resources but the AI still has to discover which architecture doc covers the specific subsystem
- No scoped instruction file for `xmlui/src/components-core/**`

**Actions needed:**
- [ ] **Update `refactor-template.md`**: change plan file location to `feature.md` at repo root (already exists, reserved for this purpose); remove `$additional_resources$` placeholder and replace with a table mapping subsystems to their architecture docs
- [ ] **Create `.github/instructions/core.instructions.md`** — auto-injected when editing `xmlui/src/components-core/**`; references `standalone-app.md`, `containers.md`, `theming-styling.md`
- [ ] **Add subsystem-to-doc map** somewhere accessible (possibly inside `AGENTS.md` or a new `xmlui/dev-docs/subsystem-map.md`)

---

## General Infrastructure (Supports All Chores)

### `.github/copilot-instructions.md`
Create this file (auto-loaded by GitHub Copilot for every session):
- 3-sentence project description
- Pointer to `AGENTS.md` for full orientation  
- List of available prompt files and when to use each

### `feature.md` convention
Establish a strict convention: **before starting any chore**, fill `feature.md` with:
- Chore type (new component / extend component / refactor)
- Subject (component name, subsystem name)
- Goal (1–2 sentences)
- Files in scope
- Current status: what's done, what's next
- Known decisions or constraints

This file replaces the need to re-explain context at the start of every session. Attach it explicitly when starting.

### `/memories/repo/` hygiene
After each session, capture confirmed facts:
- `build.md` — verified build/test commands, timing expectations
- `patterns.md` — patterns confirmed to work (e.g., keyboard test pattern, APIInterceptor `$state`)
- `gotchas.md` — things that went wrong and the correct approach

---

## Priority Order

| # | Item | Chore | Effort | Value |
|---|---|---|---|---|
| 1 | `feature.md` convention | All | Low | High |
| 2 | `.github/copilot-instructions.md` | All | Low | High |
| 3 | Split `conv-create-components.md` | 1, 2 | Medium | High |
| 4 | `create-component.prompt.md` | 1 | Medium | High |
| 5 | `extend-component.prompt.md` | 2 | Low | High |
| 6 | `components.instructions.md` | 1, 2 | Low | High |
| 7 | Update `refactor-template.md` | 3 | Low | Medium |
| 8 | `core.instructions.md` | 3 | Low | Medium |
| 9 | `/memories/repo/` hygiene | All | Low (ongoing) | Medium |

---

## Notes

- Prompt files succeed by eliminating what the AI must guess — keep them short and precise.
- Instruction files (auto-injected) should contain only what applies to every edit in that file glob. Save the detail for prompt files.
- When in doubt: one small accurate file beats one large complete file.
