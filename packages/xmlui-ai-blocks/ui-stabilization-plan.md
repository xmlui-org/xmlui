# UI Stabilization Plan

`xmlui-ai-blocks` provides the UI side of the AI offering. It should feel native
inside host XMLUI apps, stay themable, and expose small AI-specific primitives
instead of a fixed product shell.

## Goal

Stabilize the browser package around:

- clean, modern default styling based on XMLUI theme variables
- one-component-at-a-time implementation tasks
- normalized `AgentEvent` state through `AiThread`
- inline transcript rendering for messages, tool calls, and approvals
- generated-app progress states that hide broken or repairing UI until ready
- fixture-driven demos that do not require a bridge or provider key

## Styling Source Of Truth

All default styling should be expressed through XMLUI theme variables.

Reference docs:

- https://xmlui.org/docs/styles-and-themes/theme-variables
- https://xmlui.org/docs/styles-and-themes/theme-variable-defaults

Rules:

- Prefer existing XMLUI variables such as `$color-surface-*`, `$borderColor`,
  `$borderRadius`, `$textColor-*`, `$color-primary-*`, `$color-success-*`,
  `$color-danger-*`, `$color-warn-*`, `$space-*`, font sizes, and focus outline
  variables.
- Add AI-block theme variables only for AI-specific surfaces or parts that hosts
  reasonably need to override.
- Default AI-block variables should reference XMLUI variables instead of hard
  coded colors.
- Avoid brand-specific palette decisions in this package.
- Keep surfaces quiet: thin borders, low or no shadow, compact spacing, and
  predictable scroll containment.
- Use status color only as an accent. Do not tint entire transcript regions
  aggressively.
- Keep default radii aligned with XMLUI defaults. If a component needs a larger
  radius, define it as a theme variable and keep it modest.

## Guardrail: Component Axis

Every implementation task must state:

1. Target component.
2. Exact behavior or styling change.
3. Files expected to change.
4. Whether metadata, theme variables, tests, or docs are affected.
5. Whether the task is local or explicitly cross-component.

Default scope is one component. Cross-component style cleanup is allowed only
when a task is explicitly labeled as a design-axis change.

## Guardrail: Design Axis

Design-axis work records shared decisions without accidentally refactoring the
package.

Initial design dimensions:

- radius and border treatment
- status color semantics
- transcript density
- disclosure pattern for inline detail
- focus and keyboard states
- scroll containment
- empty, loading, validating, repairing, failed, and ready states

Each design dimension should produce:

- decision
- affected components
- theme variables to use or add
- allowed follow-up component tasks

## Component Plan

### UI-1: `AiToolCall`

Primary use case: inline transcript rendering.

Target behavior:

- Render as a compact inline status row by default.
- Show tool name, status, and short summary without forcing a large card shape.
- Use disclosure only for input/output/error details.
- Do not expose execution, retry, cancel, or policy actions.
- Handle `requested`, `running`, `succeeded`, `failed`, and `cancelled`.
- Use theme variables for background, border, text, badge, and status accents.

Exit criteria:

- Works inside `AiMessageParts` or transcript recipe without visual dominance.
- Failed tool calls are noticeable but not modal-alert-like.
- Long input/output summaries wrap without layout shifts.

### UI-2: `AiApprovalRequest`

Primary use case: inline transcript rendering.

Target behavior:

- Pending state shows requested operation, reason, details, and approve/reject.
- Resolved states show approved/rejected/expired/failed status without actions.
- First pass has no editable payload UI.
- Emits only approve/reject events.
- Does not decide whether approval is required.
- Does not enforce policy.

Exit criteria:

- Approval requests can sit in the transcript as auditable events.
- Approve/reject payloads are stable and small:

```ts
approve -> { requestId: string }
reject -> { requestId: string; reason?: string }
```

### UI-3: `AiThread`

Replace the A2XMLUI compatibility controller with the normalized event model.

Target behavior:

- Accept `AgentRequest` inputs and a host transport endpoint/callback.
- Consume only normalized `AgentEvent` streams.
- Apply events through a pure reducer.
- Expose XMLUI-native `value` and APIs.
- Support deterministic fixture replay for tests and demos.

Recommended value:

```ts
type AiThreadValue = {
  messages: AiMessage[];
  activeRun?: AiRun;
  isRunning: boolean;
  status: "idle" | "running" | "validating" | "repairing" | "awaiting-approval" | "complete" | "error" | "cancelled";
  error?: string;
  toolCalls: AiToolCall[];
  pendingApprovals: AiApprovalRequest[];
  generation: XmluiGenerationState & {
    lastWorkingCode?: string;
    selectedPreviewRevision?: "current" | "lastWorking";
  };
  provider?: string;
  model?: string;
};
```

First APIs:

```ts
send(input: string | { text?: string; files?: unknown[] }): void;
cancel(): void;
clear(): void;
approve(requestId: string): void;
reject(requestId: string, reason?: string): void;
```

Exit criteria:

- No A2XMLUI request/response parser remains in the target path.
- `applyAgentEvent()` has focused unit tests.
- Fixture replay can drive transcript, tool call, approval, generation, repair,
  and error states.

### UI-4: `AppPreview`

Target behavior:

- Do not render generated UI until the current generation is accepted by client
  preview validation.
- Show progress states while generation, validation, or repair is active.
- Client approval updates `lastWorkingCode` after local compile/render success.
- Runtime and compile failures publish diagnostics without replacing
  `lastWorkingCode`.

Exit criteria:

- Ready code renders.
- Generating/validating/repairing states show progress instead of broken UI.
- Failed current code does not overwrite the last working preview.

### UI-5: Recipes And Demo

Keep larger UI surfaces as XMLUI recipes unless a component earns promotion.

Recipes to maintain:

- transcript
- composer
- generation status
- inline tool-call rendering
- inline approval rendering
- preview/code workspace
- builder-frame usage

Demo requirements:

- no provider credentials
- no bridge required
- fixture event replay
- visible states for generating, validating, repairing, approval, failed tool,
  and accepted generation

## Verification

Default checks:

- unit tests for reducers and component state
- component tests for tool-call and approval rendering
- demo build with fixture events
- accessibility checks for disclosure, buttons, live updates, and keyboard focus

No real provider calls in default UI tests.

## Out Of Scope

- Provider credentials
- MCP process management
- Server-side repair
- Policy enforcement
- Persistence
- Save/publish flows
- Editable code view
- All-in-one chat shell

