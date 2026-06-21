# AGENTS.md

This repository is an experimental rewrite workspace for the XMLUI framework.
The goal is to rebuild the implementation while preserving XMLUI's behavior,
public APIs, authoring model, toolchain, and developer experience exactly from
the perspective of existing users and contributors.

## Mission

- Treat the existing XMLUI framework as the compatibility contract.
- Preserve user-facing XMLUI syntax, semantics, component behavior, styling
  expectations, routing behavior, data binding, event handling, extension
  points, and error behavior unless a migration plan explicitly says otherwise.
- Preserve XMLUI's tool compatibility, including project creation, builds,
  development servers, package scripts, extension packaging, editor support,
  documentation generation, playground behavior, integration tests, release
  checks, and CI-facing workflows.
- Prefer small, verifiable steps over broad rewrites.
- Document assumptions before implementing them.
- Keep migration work reproducible for future agents and humans.

## Repository Layout

- `.ai/` stores AI-facing notes, research summaries, compatibility findings,
  trace analyses, and decision records that are useful across sessions.
- `.plans/` stores implementation and migration plans. Plans should be written
  before substantial changes and updated as discoveries change the work.
- `AGENTS.md` is the root instruction file for agents working in this repo.

Future source directories should be added only when a plan describes their role.

## Compatibility First

Before changing or implementing behavior, identify the corresponding behavior in
the original XMLUI framework. Record the source of truth in a plan or note:

- original source file, documentation page, example app, or test;
- observed runtime behavior, including edge cases;
- compatibility risks and unresolved questions;
- proposed implementation strategy;
- verification method.

When behavior is ambiguous, prefer the behavior of the existing implementation
over a cleaner or more conventional design. This rewrite should be invisible to
users until a deliberate compatibility-breaking decision is documented.

The local source checkout at `/Users/dotneteer/source/xmlui` is the primary
reference for the current XMLUI implementation when it is available. Use it to
inspect behavior, package layout, scripts, tests, metadata, examples, docs, and
tooling contracts before designing replacement behavior.

### Tooling Compatibility

The rewrite must preserve not only the core framework package but also the
surrounding XMLUI ecosystem. Treat these original-repo areas as compatibility
targets:

- `xmlui/`: main framework package, runtime, parser, renderer, component
  registry, language-server metadata, tests, and build outputs.
- `tools/create-app/`: project creation utility and generated app layouts.
- `tools/vscode/`: VS Code extension behavior, language support, diagnostics,
  completions, packaging, and release artifact shape.
- `tools/preview-ssg/`: preview/static-site tooling behavior.
- `tools/xmlui-claude/` and `tools/xmlui-codex/`: AI tool integrations where
  they are part of the developer workflow.
- `website/` and `playground/`: documentation and playground apps, including
  their build and runtime expectations.
- `packages/*`: extension package authoring, registration, build, and runtime
  compatibility.
- `integration-tests/`: end-to-end compatibility fixtures for app creation,
  extension loading, standalone mode, and Vite/plugin mode.
- root scripts and CI workflows: commands such as `build-xmlui`,
  `build-vscode-extension`, `build-extensions`, `build-docs`,
  `build-playground`, `generate-docs`, `test`, `test-smoke`, and
  `test-integration`.

When planning tooling work, record the exact old command, generated files,
inputs, outputs, exit behavior, and user-visible messages when those details
matter. Generated projects and packaged artifacts are part of the public
contract.

## Planning Rules

Use `.plans/` for durable plans. A good plan includes:

- scope and non-goals;
- current XMLUI behavior to preserve;
- proposed architecture or implementation approach;
- staged tasks;
- compatibility tests or fixtures to add;
- known risks and open questions.

Keep plans current. If implementation discoveries invalidate part of a plan,
update the plan instead of leaving stale instructions behind.

New experiments should include data modification, not only static display. Each
experiment plan should describe at least one user-visible state update path and
should include tests proving that the update changes the rendered result.

### Plan Snapshots

The user's primary planning document is expected to be
`.plans/master-plan.md`. The user also wants to preserve the history of that
document as source material for later blog posts, articles, or books.

When the user asks for a plan snapshot:

- Snapshot the plan document the user names. If the user does not name a plan
  and no active plan subject has been explicitly set for the current work,
  ask which plan should be snapshotted before creating files. There is
  currently no active plan subject.
- Create a versioned copy of that plan file.
- Use two-digit sequential names based on the plan filename:
  `.plans/master-plan-01.md`, `.plans/master-plan-02.md`,
  `.plans/master-plan-03.md`, and so on; for `.plans/parser-plan.md`, use
  `.plans/parser-plan-01.md`, `.plans/parser-plan-02.md`, and so on.
- Choose the next number by inspecting existing snapshot files. Do not overwrite
  an existing snapshot.
- Create a matching diff/history note based on the plan filename:
  `.plans/plan-diff-01.md`, `.plans/plan-diff-02.md`,
  `.plans/plan-diff-03.md`, and so on for `master-plan.md`; for
  `parser-plan.md`, use `.plans/parser-plan-diff-01.md`,
  `.plans/parser-plan-diff-02.md`, and so on.
- The diff/history note must contain, in historical order:
  - the user's substantive prompts since the previous snapshot, lightly edited
    to fix grammar, typos, and obvious wording issues while preserving intent;
  - the assistant's summary of edits made in response to that prompt, including
    removals, insertions, and significant updates.
- If there were multiple relevant user prompts since the previous snapshot,
  include them in chronological order.
- Do not record prompts that only ask to take a snapshot, because they do not
  add useful history beyond the existence of the snapshot files.
- If the user explicitly asks to omit a prompt from the diff/history note, do
  not record that prompt.
- If the target plan file does not exist, ask before creating a snapshot.

Snapshot files preserve the plan state. Diff/history notes preserve the working
conversation around that state. Keep both concise, factual, and useful for later
writing.

## AI Notes

Use `.ai/` for information that helps future agents resume context quickly:

- research notes about original XMLUI behavior;
- extracted API or component inventories;
- comparisons between old and new behavior;
- investigation logs;
- design decision records;
- useful commands and verification procedures.

Prefer concise, source-linked notes over long transcripts.

## Development Standards

- Follow the existing style once source code exists.
- Keep public behavior stable even if internal architecture changes.
- Add tests for compatibility-sensitive behavior.
- Component visual styling must live in the component's stylesheet and be
  applied through CSS classes, following the original XMLUI component pattern.
  Do not reimplement component visuals with React-computed inline `style`
  objects. Inline `style` may carry layout props, emitted theme CSS variables,
  or genuinely dynamic values that cannot reasonably be represented by classes,
  but those exceptions should remain small and documented.
- Do not introduce new dependencies, formats, or frameworks without documenting
  why they are needed in `.plans/`.
- Keep generated files out of the repository unless a plan explicitly calls for
  them.
- Avoid speculative abstractions. Add structure when it is needed by implemented
  behavior.

## Verification

Every meaningful change should say how it was verified. Depending on the work,
verification may include:

- unit tests;
- integration tests;
- fixture comparisons against original XMLUI output;
- browser/runtime checks;
- documentation/example parity checks;
- manual reproduction steps saved in `.ai/` or `.plans/`.

If verification cannot be completed, record the reason and the remaining risk.

## Working With Git

- Assume the worktree may contain user changes.
- Do not revert or overwrite changes you did not make unless explicitly asked.
- Keep commits focused when commits are requested.
- Do not commit plans, notes, generated fixtures, or implementation work unless
  the user asks for a commit.

## Agent Conduct

- Read the relevant plans and notes before implementing.
- If no plan exists for a substantial task, create or update one first.
- Ask only when a decision cannot be safely inferred from the compatibility goal.
- Prefer concrete evidence from the original framework over assumptions.
- Leave the repository easier for the next agent to understand.
