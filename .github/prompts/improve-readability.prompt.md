---
agent: agent
description: Refactor code for readability without changing logic
---

# Improve Readability of $subject$

The goal is to make the code easier to follow for everyday developers. All changes must be **logic-neutral** unless explicitly asked otherwise.

## Before starting

1. Read `feature.md` at the repo root — it names the files in scope and any decisions already made.
2. Read `guidelines.md` at the repo root — focus on rules from Topics 4–5, 7, 23.
3. Read these docs only if they are relevant to the files in scope:
   - `.ai/xmlui/component-architecture.md` — if touching any component files
   - `.ai/xmlui/wrapcomponent.md` — if the component uses `wrapComponent`
   - `.ai/xmlui/testing-conventions.md` — always, for running and writing tests

## Readability principles

Apply **only** the techniques that genuinely improve understanding for the specific code at hand. Do not apply them mechanically.

### File structure
- Put the most important code near the top of the file (public API, main logic, exports).
- Move private helper functions to the bottom of the file.
- Group related declarations with a blank line between groups.

### Comments
- Add very concise **synopsis comments** before methods and significant variables — one or two lines describing intent, not mechanics.
- For methods or classes with complex or non-obvious logic, add a brief summary of *what* the algorithm does (not *how* line by line) in the synopsis comment.
- Add very concise **section comments** marking logical blocks within a method body (e.g., `// validate inputs`, `// build response`).
- Do not add comments to helper variables or self-evident code.
- When the user asks to review only comments, change **only** comments — do not alter any logic, structure, or names.

### Naming
- If a variable or method name is ambiguous or misleading, rename it to reflect its purpose.
- If the symbol is **module-private** (not exported, not part of a public API), rename it directly.
- If the symbol is **visible outside its module** (exported, part of a public type, used in tests), list the rename opportunity but **ask the user for approval** before changing it.

### Conditions and expressions
- Replace complex boolean expressions with a named `const` that states the predicate's intent (e.g., `const isReadyToSubmit = ...`).
- Replace magic literals with named constants (`const MAX_RETRIES = 3`).
- Replace deeply nested `if-else` chains with early returns (guard clauses) to flatten the structure.

### Repetition and length
- If a code block is repeated two or more times within a method, extract it into a named helper (at the bottom of the file).
- Do **not** decompose a long method solely because it is long. Decompose only when: (a) a sub-block is duplicated, or (b) a clearly separable phase has a name that makes the outer method more readable as a result.
- Where a `.filter().map()` chain reads more clearly than an imperative loop, prefer it — but only when intent is genuinely more obvious.

## Planning

1. Scan the files in scope and collect all opportunities as a short list with a category tag:
   - `[structure]` — file-level organization
   - `[comment]` — missing or misleading comments
   - `[name]` — rename candidate
   - `[name/external]` — rename candidate requiring user approval
   - `[condition]` — guard clause, named predicate, or named constant
   - `[duplication]` — repeated block worth extracting
2. Present the list to the user. For each `[name/external]` item, explicitly ask for approval before renaming.
3. Group the approved items into small sequential steps, each verifiable independently.
4. Record the plan in `feature.md` under a "Readability Plan" section.

## Refactor flow

Assume all unit tests and E2E tests pass at the start.

For each step:
1. Implement the change.
2. Verify no TypeScript/lint errors (Problems pane in VS Code).
3. Run the unit tests for the affected module.
4. If the step touches a component, run its E2E spec as a quick sanity check.
5. Update the step's status in `feature.md`.
6. Ask for approval before moving to the next step.

## Commands

Run all commands from the workspace root (`/Users/dotneteer/source/xmlui`):

```bash
# Type-check without full build (fast)
npx tsc --noEmit -p xmlui/tsconfig.json

# Unit tests for xmlui package (fast, ~40s for all)
npm run test:unit -w xmlui

# E2E — single component (fast feedback)
npx playwright test ComponentName.spec.ts --reporter=line

# E2E — stability check (10 workers)
npx playwright test ComponentName.spec.ts --workers=10
```

After completing all steps, run the full unit test suite. For E2E, run only the specs for affected components. If you believe the changes are broad enough to warrant running the full E2E suite, **tell the user and ask for permission — do not run it yourself**.

## Key rules

- Never change logic, behaviour, or test assertions — readability only.
- Never rename external symbols without user approval.
- Never add comments to trivial or self-evident code.
- Never decompose a method purely for length; only do so to eliminate duplication or to give a separable phase a meaningful name that improves the outer function's readability.
- If the user says "review only the comments", make zero changes outside of comments.
