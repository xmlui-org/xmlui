# Plan: AI-Ready Workspace for Stereotype Tasks

## Goal

Make every AI assistant session in this workspace immediately productive for common development tasks — without requiring the AI to analyze source code from scratch. The assistant should:

1. **Find** the right documentation and conventions instantly for the task at hand
2. **Follow** a tested step-by-step workflow specific to each task type
3. **Produce** code, tests, and documentation that conform to project conventions

---

## Current State

### What exists

| Mechanism | Location | What it does | Gap |
|-----------|----------|-------------|-----|
| `AGENTS.md` | repo root | High-level project orientation; loaded automatically by Copilot agents | Lists `.ai/xmlui/` docs but doesn't reference the 25-topic `dev-docs/guide/` set. No task-specific routing. |
| `.ai/xmlui/` (28 files) | AI reference docs | Concise, LLM-optimized reference for all 25 architecture topics + 9 component authoring sub-files | Not wired into task workflows. An AI must know to look here. |
| `dev-docs/guide/` (24 files) | Human-readable docs | Deeper narrative for the same 25 topics | Not referenced from any AI entry point. |
| `guidelines.md` | repo root | ~300 lines of rules from all 25 topics | Not auto-loaded. AI must be told to read it. |
| `.github/instructions/` (2 files) | Copilot instructions | Auto-attached by file pattern: `components/**` and `components-core/**` | Only two file-pattern triggers. No task-based triggers. Don't reference the 25-topic docs. |
| `.github/prompts/` (3 files) | Copilot prompt files | Workflows for: create component, extend component, refactor core | Incomplete coverage: no prompts for bug fix, QA review, extension package creation, adding E2E tests, documentation. Reference old doc paths. |

### Stereotype tasks needing coverage

| # | Task | Existing prompt? | Gaps |
|---|------|-----------------|------|
| T1 | Create a new component (core) | `create-component.prompt.md` ✓ | Doesn't reference 25-topic docs, doesn't include E2E/a11y checklist |
| T2 | Create a new component (extension package) | ✗ | No prompt at all |
| T3 | Create a new extension package | ✗ | No prompt at all |
| T4 | Fix a bug with regression tests | ✗ | No prompt at all |
| T5 | Extend an existing component | `extend-component.prompt.md` ✓ | Doesn't reference 25-topic docs, no E2E section |
| T6 | QA review an existing component | ✗ | QA checklist exists (`.ai/xmlui/qa-checklist.md`) but no prompt workflow |
| T7 | Add E2E tests to a component | ✗ | Testing conventions exist but no prompt |
| T8 | Refactor core code | `refactor-core.prompt.md` ✓ | References old doc paths |
| T9 | Write documentation for a component | ✗ | No prompt at all |

---

## Options (Ranked)

### Option 1: Prompt Files + Updated Instructions (Recommended)

**Effort: Medium · Impact: Highest · Maintenance: Low**

Expand `.github/prompts/` with one prompt file per stereotype task. Each prompt file is a self-contained workflow that tells the AI exactly which docs to read, what steps to follow, what outputs to produce, and what checks to run. Update `.github/instructions/` to reference the 25-topic docs by subsystem.

**How it works:**
- User invokes a prompt by name: `#create-extension-component` in the chat
- Copilot loads the prompt file, which contains the full workflow + doc pointers
- The AI reads only the docs relevant to that task (not everything)

**Deliverables:**

1. **Update 3 existing prompts** to reference the 25-topic AI docs (`dev-docs/guide/`, `.ai/xmlui/`) and `guidelines.md`
2. **Create 6 new prompt files** for the missing tasks (T2, T3, T4, T6, T7, T9)
3. **Update 2 instruction files** to point to relevant guide docs by subsystem
4. **Update `AGENTS.md`** to list all available prompts and when to use each
5. **Update `guidelines.md`** header to make it self-describing (so AI knows to read it)

**Prompt file structure** (consistent across all):

```markdown
---
agent: agent
description: One-line purpose
---

# Task Title

## Before starting
- Read these docs: [specific list based on task]
- Read guidelines.md rules from: [specific topic sections]
- Examine: [specific existing code to study]

## Inputs (from user)
- What information the user provides (component name, bug description, etc.)

## Step-by-step workflow
1. Step with specific actions
2. Step with verification criteria
...

## Outputs checklist
- [ ] Files created/modified
- [ ] Tests passing
- [ ] Documentation updated (if applicable)
- [ ] Changeset added (if applicable)

## Commands reference
```bash
# Relevant commands for this task
```
```

**Pros:**
- Prompt files are invocable by name — the user explicitly selects the workflow
- Each prompt is self-contained; the AI doesn't need to discover what to read
- Works with VS Code Copilot's existing `.github/prompts/` mechanism
- Easy to maintain: update one file when a convention changes
- No changes to repository structure or build process

**Cons:**
- User must know to invoke the prompt (mitigated by listing in AGENTS.md)
- Only applies to VS Code Copilot (not other AI tools)

---

### Option 2: Enhanced AGENTS.md with Task Router

**Effort: Low · Impact: Medium · Maintenance: Low**

Expand `AGENTS.md` with a "Task Quick Reference" section that maps each stereotype task to the exact files to read and the workflow to follow. Since `AGENTS.md` is auto-loaded, every AI session gets the routing table for free.

**Deliverables:**

1. **Add a task routing table to `AGENTS.md`:**

```markdown
## Task Quick Reference

| Task | Prompt file | Key AI docs | Key guide docs | Guidelines section |
|------|-------------|------------|----------------|-------------------|
| New component (core) | `.github/prompts/create-component.prompt.md` | `.ai/xmlui/component-architecture.md`, `.ai/xmlui/components/` | `dev-docs/guide/04-component-architecture.md` | Topics 4, 5, 7, 9 |
| Bug fix | `.github/prompts/fix-bug.prompt.md` | `.ai/xmlui/testing-conventions.md` | `dev-docs/guide/23-testing-conventions.md` | Topics 17, 23 |
| ... | ... | ... | ... | ... |
```

2. **Add a "Documentation Map" section** that lists all 28 AI docs with one-line descriptions so the AI can find the right one by scanning the table.

**Pros:**
- Zero new files — just expanding an existing auto-loaded file
- Works with any AI tool that reads `AGENTS.md`
- Task routing is visible to every session automatically

**Cons:**
- `AGENTS.md` becomes longer (risk of context dilution)
- No detailed step-by-step workflows (just pointers)
- Cannot enforce a workflow — only suggests what to read

---

### Option 3: Instruction Files Per Task Type (File-Pattern Triggered)

**Effort: Medium · Impact: Medium · Maintenance: Medium**

Add more `.github/instructions/` files with `applyTo` patterns that trigger based on file paths the AI is editing. For example, an instruction file that triggers when editing `packages/*/` and reminds the AI about extension package conventions.

**Deliverables:**

1. **New instruction files:**
   - `extension-packages.instructions.md` → `applyTo: "packages/**"`
   - `e2e-tests.instructions.md` → `applyTo: "**/*.spec.ts"`
   - `docs.instructions.md` → `applyTo: "docs/**"`
   - `theming.instructions.md` → `applyTo: "**/*.module.scss"`

2. **Each instruction file** references the relevant subset of 25-topic docs and `guidelines.md` rules.

**Pros:**
- Automatic activation — no user action needed
- Context is scoped to what's being edited
- Stacks with prompt files (complementary, not competing)

**Cons:**
- File-pattern matching is coarse — editing a `.spec.ts` file doesn't distinguish "writing new tests" from "fixing existing ones"
- Cannot drive a multi-step workflow (only provides context/rules)
- Doesn't cover tasks that span multiple file types (e.g., creating a component touches `.tsx`, `.scss`, `.spec.ts`, and `ComponentProvider.tsx`)

---

### Option 4: Task-Specific AI Doc Index Files

**Effort: Low · Impact: Low-Medium · Maintenance: Low**

Create task-oriented index files in `.ai/xmlui/tasks/` that bundle the reading list for each stereotype task into a single file the AI can be told to read.

**Deliverables:**

```
.ai/xmlui/tasks/
├── create-component.md       # Reads: component-architecture, wrapcomponent, theming, testing
├── create-extension.md       # Reads: extension-packages, build-system, monorepo-structure
├── fix-bug.md                # Reads: error-handling, testing-conventions, inspector-debugging
├── qa-review.md              # Reads: accessibility, qa-checklist, testing-conventions
└── add-feature.md            # Reads: component-architecture, behaviors, form-infrastructure
```

Each file is a curated reading list + condensed rules for that task type, pulling from the 25-topic docs and `guidelines.md`.

**Pros:**
- Lightweight — just markdown files
- Can be referenced from prompt files or AGENTS.md
- Tool-agnostic: works with any AI that can read files

**Cons:**
- Another layer of indirection (AI reads index → then reads actual docs)
- Doesn't enforce a workflow
- Duplicates some content from prompt files if both exist

---

## Recommended Approach: Option 1 + Option 2 Combined

Use **prompt files as the primary mechanism** for driving stereotype tasks (Option 1), and **enhance `AGENTS.md` as the discovery layer** that helps the AI find the right prompt (Option 2). This gives both:

- **Explicit invocation**: user says `#fix-bug` and the AI follows a tested workflow
- **Automatic discovery**: if the user doesn't invoke a prompt, `AGENTS.md` routes the AI to the right docs based on what it's doing

### Implementation Plan

#### Phase 1: Update existing infrastructure

| # | Action | Files |
|---|--------|-------|
| 1 | Update `AGENTS.md` with task routing table + 25-topic doc map | `AGENTS.md` |
| 2 | Update `create-component.prompt.md` with 25-topic doc references, E2E and a11y checklist, changeset step | `.github/prompts/create-component.prompt.md` |
| 3 | Update `extend-component.prompt.md` with 25-topic doc references, E2E section | `.github/prompts/extend-component.prompt.md` |
| 4 | Update `refactor-core.prompt.md` with corrected doc paths | `.github/prompts/refactor-core.prompt.md` |
| 5 | Update `components.instructions.md` to reference guide docs | `.github/instructions/components.instructions.md` |
| 6 | Update `core.instructions.md` to reference guide docs | `.github/instructions/core.instructions.md` |

#### Phase 2: Create new prompt files

| # | Prompt file | Stereotype task |
|---|-------------|----------------|
| 7 | `create-extension-component.prompt.md` | New component in an extension package |
| 8 | `create-extension-package.prompt.md` | New extension package with component(s) |
| 9 | `fix-bug.prompt.md` | Bug fix with regression test |
| 10 | `qa-review.prompt.md` | QA review of existing component |
| 11 | `add-e2e-tests.prompt.md` | Add E2E tests to under-tested component |
| 12 | `write-component-docs.prompt.md` | Write or update component documentation |

#### Phase 3: Add file-pattern instructions

| # | Instruction file | Pattern | Purpose |
|---|-----------------|---------|---------|
| 13 | `extension-packages.instructions.md` | `packages/**` | Extension package conventions |
| 14 | `e2e-tests.instructions.md` | `**/*.spec.ts` | E2E test patterns and anti-patterns |
| 15 | `theming.instructions.md` | `**/*.module.scss` | SCSS and theme variable conventions |

---

## Doc-to-Task Mapping

Which of the 25-topic docs each stereotype task should read:

| AI Doc (`.ai/xmlui/`) | T1 New comp | T2 Ext comp | T3 New pkg | T4 Bug fix | T5 Extend | T6 QA | T7 E2E | T8 Refactor | T9 Docs |
|------------------------|:-----------:|:-----------:|:----------:|:----------:|:---------:|:-----:|:------:|:-----------:|:-------:|
| `mental-model.md` | | | | | | | | ✓ | |
| `rendering-pipeline.md` | | | | ○ | | | | ✓ | |
| `container-state.md` | ○ | ○ | | ○ | ○ | | | ✓ | |
| `component-architecture.md` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | | | ✓ |
| `wrapcomponent.md` | ✓ | ✓ | ✓ | ○ | ✓ | ✓ | | | |
| `expression-eval.md` | | | | ○ | | | | ○ | |
| `theming-styling.md` | ✓ | ✓ | | ○ | ○ | ✓ | | | |
| `data-operations.md` | | | | ○ | | | | | |
| `behaviors.md` | ○ | ○ | | ○ | ○ | ✓ | ✓ | | |
| `action-execution.md` | | | | ○ | | | | | |
| `user-defined-components.md` | | | | | | | | | |
| `form-infrastructure.md` | ○ | ○ | | ○ | ○ | ✓ | | | |
| `routing.md` | | | | | | | | | |
| `extension-packages.md` | | ✓ | ✓ | | | | | | |
| `app-context.md` | | | | ○ | | | | | |
| `option-components.md` | ○ | ○ | | ○ | ○ | ✓ | | | |
| `error-handling.md` | | | | ✓ | | ✓ | | | |
| `parsers.md` | | | | | | | | ○ | |
| `inspector-debugging.md` | | | | ✓ | | | | | |
| `language-server.md` | | | | | | | | | |
| `build-system.md` | | | ✓ | | | | | | |
| `monorepo-structure.md` | | | ✓ | | | | | | |
| `testing-conventions.md` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | |
| `accessibility.md` | ✓ | ✓ | | | ○ | ✓ | ✓ | | |
| `components/*` (9 files) | ✓ | ✓ | ✓ | ○ | ✓ | ✓ | | | ✓ |

✓ = always read · ○ = read if relevant to the specific task

---

## User Decisions

- **Approach:** Use the recommended approach (Option 1 + Option 2 combined).
- **New guide article:** Create guide #25 about document generation (source: `xmlui/scripts/generate-docs/`). This documents the `DocsGenerator`, `MetadataProcessor`, config files, and CLI commands.
- **Extensibility:** Include an `add-stereotype.prompt.md` so new stereotype tasks can be added in the future following a consistent pattern.

---

## Success Criteria

1. A user who types `#create-component` gets a complete, tested workflow that produces conforming code without needing to say "read the conventions first"
2. A user who says "fix this bug" (without invoking a prompt) still gets good results because `AGENTS.md` routes the AI to the right docs
3. No prompt file exceeds 200 lines — workflows are concise, not bureaucratic
4. Every prompt file is self-contained: it lists exactly which docs to read, it doesn't say "look around"
5. Updating a convention in one place (e.g., `guidelines.md`) propagates to all tasks that reference it — no copy-pasted rules in prompt files
