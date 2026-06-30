# XMLUI AI Extension Strategy

This package is the planning home for the XMLUI AI extension work while the
contracts and runtime are still incubating. The old A2XMLUI compatibility path is
not part of the target architecture. A2XMLUI remains reference source material,
not a contract to preserve.

## Target Split

The offering has two extension packages.

`xmlui-ai-blocks` is the browser/UI package. It owns XMLUI extension components,
headless client state, normalized event reducers, preview/code surfaces, and
recipe-friendly UI primitives.

`xmlui-ai-bridge` is the trusted Node runtime. It owns provider communication,
AI SDK integration, tools, MCP communication, XMLUI validation and repair,
policy, approval enforcement, logging, evaluation, and a local server.

The shared agent contract lives in `xmlui` for now. It can move later when the
shape is stable.

## Owner Decisions

- Remove the old broad plans and stop investing in the A2XMLUI compatibility
  contract.
- Stream only normalized `AgentEvent` objects between bridge and UI.
- Use `xmlui` as the temporary home for `AgentRequest`, `AgentEvent`,
  generation, tool-call, approval, and validation shapes.
- Stabilize UI styling through XMLUI theme variables. The source of truth is the
  XMLUI theme-variable system and default theme-variable catalog:
  - https://xmlui.org/docs/styles-and-themes/theme-variables
  - https://xmlui.org/docs/styles-and-themes/theme-variable-defaults
- On the UI side, implementation tasks modify one component at a time unless a
  task explicitly says it is a cross-component design-system change.
- `AiToolCall` is for inline transcript rendering first.
- `AiApprovalRequest` supports approve/reject only in the first pass.
- The client decides when generated code becomes `lastWorkingCode`.
- The generated UI is not shown until it is ready. During generation and hidden
  repair, the UI shows progress such as `generating`, `validating`, and
  `repairing`.
- The bridge first vertical slice prioritizes validation and repair.
- Initial context sources are MCP, host entities, and host styling.
- Persistence and saved micro-app artifacts are deferred.
- Tests use deterministic fake-model flows by default. Real providers are opt-in
  smoke checks only.
- `xmlui-ai-bridge` includes a local server from the beginning.

## Current UI State

`xmlui-ai-blocks` already contains these components:

- `XmluiBuilderFrame`
- `AiMessageParts`
- `AiPromptInput`
- `AppPreview`
- `CodeView`
- `AiToolCall`
- `AiApprovalRequest`
- `AiThread`

The rough areas are:

- `AiToolCall`: needs an inline-transcript design pass, compact disclosure, and
  better status vocabulary.
- `AiApprovalRequest`: needs an approve/reject-only workflow and resolved-state
  transcript rendering.
- `AiThread`: must drop the A2XMLUI final-response flow and become an
  `AgentEvent` reducer/controller.
- `AppPreview`: should align with the "do not show generated UI until ready"
  model, while still publishing progress and diagnostics.

`XmluiBuilderFrame` remains an optional layout shell. It must not own transport,
validation, repair, preview acceptance, provider selection, persistence, or
approval policy.

## Plan Documents

- [ui-stabilization-plan.md](./ui-stabilization-plan.md): browser/UI
  stabilization, theming, component slicing, and client controller work.
- [xmlui-ai-bridge-runtime-plan.md](./xmlui-ai-bridge-runtime-plan.md): Node
  bridge modules, validation/repair loop, local server, tests, context, and
  evaluation.

Frame-specific notes can remain separate when they target one component, such as
`XmluiBuilderFrame-full-height-pane-plan.md` and
`XmluiBuilderFrame-preview-issues-plan.md`.

## Work Slicing

UI work is sliced on two axes.

The component axis is the default implementation axis. Each task targets exactly
one component and lists the files it is allowed to modify.

The design axis records shared decisions such as radius, border treatment,
surface density, status colors, focus states, and disclosure behavior. A design
axis task may produce guidance or theme-variable proposals, but it does not
change multiple components unless the task explicitly grants that scope.

Bridge work is sliced by deep modules. Each module has a small interface and
internal adapters where implementation varies.

Recommended bridge modules:

- request and contract parsing
- event streaming
- model communication
- prompt and context assembly
- tool/MCP providers
- XMLUI validation
- repair orchestration
- policy and approvals
- logging and diagnostics
- evaluation
- local server

## Reference Use

Use `D:\Projects\albacrm\xmlui-studio\packages\a2xmlui` as reference material
for behavior and lessons only:

- useful: XMLUI generation prompt hardening, validation samples, repair prompts,
  provider selection ideas, MCP/public API tool selection, message compaction,
  preview/code lessons, prompt-input ergonomics
- not useful as contract: final A2XMLUI response envelopes, AI SDK UI-message
  streams, host persistence, local storage, Studio shell, diagnostics posting,
  save flows, and app-specific host config

## Deferred

- Persistence and saved micro-app artifacts
- First-class AI SDK UI-message stream compatibility
- Browser-side provider calls
- Tool execution from browser components
- Editable code view
- Approval editing payloads
- Multi-file workspaces
- A fixed all-in-one chat/workspace shell

