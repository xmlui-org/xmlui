---
agent: agent
description: Create a new prompt file for a repeatable task pattern (stereotype)
---

# Add a New Stereotype Task

A "stereotype" is a repeatable task pattern with a defined workflow, reference docs, and expected outputs. Each stereotype becomes a prompt file in `.github/prompts/` that AI assistants can follow.

## Before starting

1. Identify the task pattern: what does the user repeatedly ask the AI to do?
2. Read existing prompt files in `.github/prompts/` to understand the structure.
3. Read `AGENTS.md` — the "Task Quick Reference" table lists all current stereotypes.

## Prompt file structure

Every prompt file follows this template:

```markdown
---
agent: agent
description: One-line purpose of the task
---

# Task Title

## Before starting

1. Read `feature.md` at the repo root — [what it should contain for this task].
2. Read `guidelines.md` at the repo root — focus on rules from Topics [N, M, ...].
3. Read these reference files:
   - `.ai/xmlui/<doc>.md` — [why this doc is needed] (always | conditional)
   - [list only the docs relevant to this task]
4. [Any other preparation: read existing code, find examples, etc.]

## Implementation steps

### Step 1 — [Action]
[Specific instructions]

### Step 2 — [Action]
[Specific instructions]

...

### Step N — Verify
[How to verify the work is correct]

### Step N+1 — Add a changeset (if applicable)
[Standard changeset instructions]

## Commands

```bash
# [Commands relevant to this task]
```

## Key warnings / Absolute rules

- [Rules specific to this task]
```

## Implementation steps

### Step 1 — Create the prompt file

Create `.github/prompts/<task-name>.prompt.md` following the template above.

Key design principles:
- **Self-contained**: list every doc the AI needs to read — don't say "look around"
- **Specific doc references**: point to `.ai/xmlui/<doc>.md` files, not vague directories
- **Step-by-step**: break the workflow into numbered steps with verification after each
- **Under 200 lines**: if it's longer, the task should be split into multiple stereotypes
- **Include commands**: provide the exact CLI commands for building, testing, verifying

### Step 2 — Reference the right docs

Use the documentation map in `AGENTS.md` to identify which AI docs are relevant:

| Task focus | Likely docs |
|-----------|-------------|
| Any component work | `component-architecture.md`, `wrapcomponent.md` |
| Visual components | `theming-styling.md`, `components/styling.md` |
| Interactive components | `accessibility.md`, `behaviors.md` |
| Form components | `form-infrastructure.md`, `behaviors.md` |
| Data components | `data-operations.md` |
| Extension packages | `extension-packages.md`, `build-system.md` |
| Testing | `testing-conventions.md` |
| Documentation | `doc-generation.md` |
| Core internals | `rendering-pipeline.md`, `container-state.md` |

Always include `guidelines.md` with the specific topic numbers.

### Step 3 — Register in AGENTS.md

Add a row to the "Task Quick Reference" table in `AGENTS.md`:

```markdown
| Task description | `#prompt-name` | Brief description of when to use |
```

### Step 4 — Test the prompt

Invoke the new prompt in a fresh chat session:
1. Type `#prompt-name` in VS Code Copilot chat
2. Provide a realistic task description
3. Verify the AI reads the correct docs and follows the workflow
4. Adjust the prompt based on what the AI missed or did wrong

## Checklist

- [ ] Prompt file created in `.github/prompts/`
- [ ] File follows the standard template (frontmatter, Before starting, Steps, Commands, Rules)
- [ ] All referenced docs exist in `.ai/xmlui/`
- [ ] Guidelines.md topic numbers are correct
- [ ] Row added to `AGENTS.md` → Task Quick Reference table
- [ ] Prompt is under 200 lines
- [ ] Tested in a real chat session
