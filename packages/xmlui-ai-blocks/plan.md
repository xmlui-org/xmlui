# xmlui-ai-blocks Plan

`xmlui-ai-blocks` is the client-side XMLUI package for AI-assisted app-building interfaces. It owns headless browser-side controllers and the small set of AI-specific UI primitives that normal XMLUI markup cannot cover well. It does not own provider credentials, filesystem access, MCP processes, model policy, trusted tool execution, or a fixed chat/workspace shell.

The near-term reference implementation is `D:\Projects\albacrm\a2xmlui`. In that project, the useful client-side shape is the XMLUI extension `AgentChat`: it is headless, talks to a configurable chat endpoint, tracks generated XMLUI code, exposes state through `value`, and lets XMLUI markup render the chat/preview/code UI however it wants. `xmlui-ai-blocks` should generalize that pattern.

Related plans:

- [agent-harness-plan.md](./agent-harness-plan.md): overall contract and three-tier architecture.
- [xmlui-ai-bridge-plan.md](./xmlui-ai-bridge-plan.md): trusted Node/runtime bridge plan.

## Package Boundary

This package contains:

- XMLUI extension components for AI thread state, normalized stream handling, message-part rendering, approval affordances, code view, and XMLUI preview.
- Headless client controllers such as `AiThread` that expose XMLUI-native state, APIs, and events.
- Client-side transport adapters that call host-provided endpoints and consume normalized stream events.
- Browser-side state machines for messages, active runs, generated code, pending approvals, selected provider/model, selected session, and preview status.
- Pure client reducers for applying contract events to UI state.

This package does not contain:

- OpenAI, Anthropic, or other provider secrets.
- Node server code.
- MCP stdio process management.
- Server-side validation and repair loops.
- Trusted policy enforcement for commands, file writes, or external tools.
- Host-specific auth, billing, quota, logging, or deployment code.

## Design Principles

- Provider-neutral: the components render and orchestrate, but do not bake in a provider.
- XMLUI-native: state is exposed through `value`, context variables, APIs, events, and normal XMLUI bindings.
- Headless first: the harness logic must be usable without the bundled visual components.
- XMLUI-composed UI: built-in XMLUI components should create most chat, preview, code, session, and approval screens.
- Minimal visual surface: add a visual component only when the missing behavior is AI-specific, stateful, accessibility-sensitive, or hard to express repeatedly in XMLUI markup.
- Swappable surface: host apps can replace every visible piece independently.
- Streaming-first: partial assistant text, tool progress, generated code, and preview updates are first-class states.
- Inspectable: model calls, tool calls, approvals, file changes, preview updates, and errors have visible state.
- Safe by default: sensitive operations appear as approval requests unless the trusted bridge says otherwise.

## Relationship To A2XMLUI

Candidate client-side pieces to extract or redesign from `a2xmlui`:

- `xmlui-app/src/extensions/AgentChat/AgentChat.tsx`: source for the first headless `AiThread` / XMLUI generation controller.
- `xmlui-app/src/extensions/XmluiPreview/XmluiPreview.tsx`: source for `XmluiPreviewPane`, including compile errors, runtime errors, preview revision handling, and theme integration.
- `xmlui/src/components/Markdown/MarkdownReact.tsx` and `xmlui/src/components/NestedApp/AppWithCodeViewReact.tsx`: source for the first `XmluiCodeView` shape. The existing `NestedAppAndCodeViewReact` path already proves a read-only XMLUI code view can be built from Markdown code rendering and the nested-app UI/XML toggle.
- `xmlui-app/src/extensions/CodeView/CodeView.tsx`: secondary source for a basic XMLUI code viewer if A2XMLUI has behavior not covered by the core Markdown/NestedApp path.
- `xmlui-app/src/components/ChatPane.xmlui`: reference markup proving the UI can be replaced while keeping the controller.
- `src/agent/xmluiAgentContract.ts`: contract ideas only; shared schemas should move into `xmlui` or a common contract module, not stay app-specific.

Avoid copying the A2XMLUI shell wholesale. The package should preserve the harness behavior and expose better primitives.

## Component Scope Audit

The first pass should deliberately avoid recreating a full [AI Elements](https://elements.ai-sdk.dev/components)-style visual kit. AI Elements is useful as a feature checklist, not as a target component count. Its current component index groups needs into chatbot UI, code/agent UI, voice, workflow, and utilities; for XMLUI app generation the relevant gaps are mostly chatbot state, generated-code/preview state, streaming, sources, reasoning, tools, and approvals.

XMLUI already has enough general-purpose components to build the visible shell:

- Layout and chrome: `Stack`, `HStack`, `VStack`, `Card`, `Splitter`, `Tabs`, `Drawer`, `ModalDialog`, `ScrollViewer`, `StickyBox`.
- Basic conversation UI: `Items`, `Text`, `Markdown`, `Avatar`, `Badge`, `Spinner`, `ProgressBar`, `Button`, `Tooltip`, `LiveRegion`.
- Composer and controls: `Form`, `TextArea`, `TextBox`, `Select`, `Option`, `Switch`, `FileInput`, `FileUploadDropZone`.
- Data and operation lists: `List`, `Table`, `Tree`, `Accordion`, `ExpandableItem`, `CodeBlock`.
- Preview surfaces: `NestedApp`, `IFrame`, `EventSource`, `WebSocket`, `Toast`.

`ChatPane.xmlui` in A2XMLUI proves that a usable chat interface can be composed from these primitives. It covers transcript layout, role-based bubbles, model selection, busy state, errors, full-replacement confirmation, and send/stop composer controls without custom visual React.

What XMLUI does not cover by itself is the AI-specific interpretation layer:

- Streaming event reduction from provider or bridge streams into stable XMLUI state.
- Message-part normalization across text, reasoning, tool calls, sources, attachments, clarifications, summaries, and errors.
- Accessible live updates for partial assistant output and long-running runs.
- Tool-call, approval, generation, and preview lifecycle semantics.
- XMLUI preview compilation, runtime-error isolation, current-vs-last-working revision handling, diagnostics display, and generated-source formatting.

The rule for this package: build components for those gaps, then express the UI around them as XMLUI recipes. Promote a recipe into a bundled visual component only after it repeats enough to justify a stable abstraction.

## Core Contract Dependency

For now, shared AI contract types can live in `xmlui` because XMLUI is the medium the builder targets. `xmlui-ai-blocks` should import or mirror those contract types rather than inventing private shapes.

Minimum shared shapes needed by the client:

- `AiMessage`
- `AiMessagePart`
- `AiRun`
- `AiRunStatus`
- `AiToolCall`
- `AiApprovalRequest`
- `XmluiGenerationState`
- `AgentRequest`
- `AgentEvent`
- `XmluiAgentResponseEnvelope`
- `RequestDirectives`

Preview state, session lists, and persistable micro-app artifacts should stay local to
`xmlui-ai-blocks` or host recipes until Tier 2 proves the shape is reusable across
more than one component.

## Headless Components

### `AiThread`

Primary browser-side controller. Generalizes the A2XMLUI `AgentChat` pattern.

Responsibilities:

- Hold canonical client thread state.
- Submit prompts to a host-provided endpoint or callback.
- Consume normalized contract events.
- Track active run, messages, tool calls, approvals, generated XMLUI state, preview state, and errors.
- Expose APIs such as `send`, `cancel`, `appendMessage`, `clear`, `approve`, and `reject`.
- Publish `value` for XMLUI bindings.
- Emit lifecycle events for host markup.

Important props:

- `threadId`
- `messages`
- `provider`
- `model`
- `sendAction`
- `cancelAction`
- `resumeAction`
- `transport`
- `currentCode`
- `requestDirectives`
- `autoRepairStatus`

Exposed `value`:

- `messages`
- `activeRun`
- `isRunning`
- `status`
- `error`
- `pendingApprovals`
- `generation`
- `preview`
- `toolCalls`
- `provider`
- `model`

### `XmluiGenerationSession`

Specialized headless controller for XMLUI app generation.

Responsibilities:

- Track `currentCode`, `lastWorkingCode`, selected preview revision, generated summary, and generated diagnostics.
- Handle "modify current" vs "create new app" confirmation state.
- Accept generated-code events from `AiThread`.
- Represent accepted generated XMLUI as a persistable micro-app artifact for host-owned storage.
- Keep preview and code view in sync while allowing users to inspect a broken current generation and switch back to the last working version.
- Stay client-side; server-side validation/repair belongs to `xmlui-ai-bridge`.

This may be a mode of `AiThread` instead of a separate component if the implementation stays simple.

### `AiProviderConfig`

Optional headless/minimal component for provider and model catalog state.

Responsibilities:

- Receive static catalogs or fetch them from a host endpoint.
- Track selected provider/model.
- Expose connection status and capabilities to children.

## Visual Component Strategy

The visual surface should stay intentionally small. `ChatPane.xmlui` should remain the reference for building a complete chat/workspace UI from XMLUI primitives, with `xmlui-ai-blocks` supplying only the pieces that carry AI-specific semantics.

### Must Build

- `AiMessageParts`: renders normalized message parts, including streaming text, markdown, generated XMLUI summaries, reasoning summaries, sources, attachments, tool-call references, and errors. This is the main replacement for generic `Text` bubbles when the message is no longer simple text.
- `AiApprovalRequest`: compact approve/reject/edit surface for bridge-generated approval requests. Approval UX is policy-sensitive enough to deserve a stable component. It provides user feedback for system/bridge events and actions when a human decision is required, but it does not decide whether approval is required.
- `AiToolCall`: status renderer for a single normalized tool call, with pending/running/succeeded/failed/cancelled states and optional input/output disclosure. It provides user feedback about system/tool progress and results, but it does not execute tools, retry tools, or decide whether a tool is allowed to run.
- `XmluiPreviewPane`: preview generated XMLUI code or a host-provided preview URL, preserving compile errors, runtime errors, selectable current/last-working rendering, warnings, theme, and tone behavior.
- `XmluiCodeView`: read-only XMLUI source formatting and syntax highlighting, based first on the existing `NestedAppAndCodeViewReact` code-view behavior and only then on A2XMLUI `CodeView` if it adds missing behavior.

Proposed XMLUI-facing shapes:

```xml
<!-- Render a full normalized message, including text deltas, clarification
     text, summary text, reasoning, source links, tool references, and errors.
     Generated code itself is shown in XmluiPreviewPane and XmluiCodeView. -->
<AiMessageParts
  message="{$item}"
  streaming="{agent.value.streamingMessageId === $item.id}"
  collapseReasoning="true"
  showMetadata="false"
  onOpenSource="sources.open($event.sourceId)" />
```

```xml
<!-- Render one bridge approval request. The host still owns the decision
     policy; this component only presents and emits the user's choice. -->
<AiApprovalRequest
  request="{$item}"
  running="{agent.value.isRunning}"
  onApprove="agent.approve($event.requestId, $event.decisionPayload)"
  onReject="agent.reject($event.requestId, $event.reason)"
  onEdit="agent.approve($event.requestId, $event.editedPayload)" />
```

`AiApprovalRequest` should render both pending and resolved approval states. Pending requests show the reason, requested operation, impact/risk summary, optional editable fields, and approve/reject actions. Resolved requests show approved/rejected/expired status so the transcript or timeline remains understandable after the decision.

Callback payload names are provisional and should be finalized with the shared contract:

- `onApprove`: emits `{ requestId, decisionPayload? }`.
- `onReject`: emits `{ requestId, reason? }`.
- `onEdit`: emits `{ requestId, editedPayload }`; hosts may treat this as approve-with-edits or route it through a separate bridge action.

```xml
<!-- Render one normalized tool call. Use inside recipe timelines or message
     parts when the host wants tool activity visible. -->
<AiToolCall
  toolCall="{$item}"
  defaultOpen="{$item.status === 'running' || $item.status === 'failed'}"
  showInput="summary"
  showOutput="summary" />
```

`AiToolCall` should stay compact by default and expand only when the user needs detail. Typical rows include XMLUI docs search, examples lookup, public API discovery, XMLUI validation, preview compilation, and repair attempts. It may show input/output summaries and errors, but execution, retry, cancellation, and policy enforcement stay in `AiThread` and `xmlui-ai-bridge`.

```xml
<!-- In-process XMLUI preview, with state exposed through preview.value for
     recipe-composed toolbar and error displays. -->
<XmluiPreviewPane
  id="preview"
  code="{builder.value.code}"
  lastWorkingCode="{builder.value.lastWorkingCode}"
  selectedRevision="{builder.value.selectedPreviewRevision}"
  previewUrl="{builder.value.previewUrl}"
  mode="{builder.value.previewUrl ? 'url' : 'code'}"
  activeTheme="{appGlobals.activeTheme}"
  activeTone="{appGlobals.activeTone}"
  showDiagnostics="true"
  onPreviewStateChange="builder.setPreviewState($event)" />
```

`XmluiPreviewPane` should delegate in-process rendering to `NestedApp` rather than reimplement XMLUI rendering. Its value is the AI-builder lifecycle around `NestedApp`: compile/runtime diagnostics, warning display, selected preview revision, and safe defaults for generated code.

Do not silently hide a broken current generation by always rendering the last working app. The user must be able to inspect the current generated state and its errors. The default view may auto-select `current` when new code arrives, show diagnostics if it fails, and offer a simple revision selector such as:

- `Current generation`
- `Last working`
- `Last accepted` if host persistence provides it

When `selectedRevision` is `current`, the preview attempts to render `code` and shows compile/runtime issues inline. When `selectedRevision` is `lastWorking`, it renders `lastWorkingCode` and should clearly label that the preview is not showing the current generated code.

```xml
<!-- Generated XMLUI source view. Host-owned actions such as save/copy are
     triggered through events rather than owned by the code viewer. -->
<XmluiCodeView
  code="{builder.value.selectedPreviewRevision === 'lastWorking' ? builder.value.lastWorkingCode : builder.value.code}"
  language="xmlui"
  readOnly="true"
  showLineNumbers="true"
  highlightLines="{builder.value.changedLines}"
  onCopy="toast('Code copied')"
  onSelectionChange="workspace.setSelectedCodeRange($event.range)" />
```

For the first implementation, `XmluiCodeView` should stay a viewer, not an editor. The existing `NestedAppAndCodeViewReact` code display is sufficient as the baseline: show generated XMLUI with syntax highlighting, copy affordance, line numbers if practical, selected-line highlighting, and clear status when the displayed source is not the current generation.

Later editing support should be additive and explicit, not assumed by the viewer:

- `readOnly="false"` or `editable="true"` enables editing.
- `value` / `initialValue` / `onDidChange` follow normal XMLUI input-style conventions.
- `onApply` can hand edited code back to `XmluiGenerationSession` for validation and preview.
- Editing must preserve the revision model: editing last-working code should create a new current draft rather than mutating the stored last-working revision in place.
- Rich editor dependencies, formatting, diagnostics gutters, undo/redo, and multi-file editing are deferred until a real host workflow needs them.

### Conditional

- `AiComposer` or `AiPromptInput`: build only if it adds real behavior beyond `Form` + `TextArea`: enter-to-submit consistency, send/cancel switching, attachment collection, composition events, and accessibility details. Otherwise keep it as a recipe.

### Recipe First

These should be documented as XMLUI markup recipes before becoming components:

- Transcript: use `ScrollViewer`/`VStack`/`Items` plus `AiMessageParts`.
- Run timeline: compose `Items`, `Accordion`, `AiToolCall`, `AiApprovalRequest`, and normal XMLUI status components.
- Session list: compose with `List`, `Items`, `Button`, `Badge`, and host-owned data.
- Model selector: compose with `Select`/`Option` unless provider capability filtering becomes complex enough to centralize.
- Connection status: compose with `Badge`, `Spinner`, `Tooltip`, and host health state.
- Workspace panel: compose from `Tabs`, `XmluiCodeView`, `XmluiPreviewPane`, and host-owned status controls.
- Preview toolbar: compose from `Button`, `Select`, `Tabs`, `Slider`, and host preview state.
- Saved micro-app list: host-owned persistence recipe, likely built from `List`, `Card`, `Badge`, and future stored micro-app metadata.

### Promotion Gate

Default rule for implementation agents: do not turn recipe-first items into React/XMLUI extension components during the initial implementation. Build recipe XMLUI files and fixture coverage first.

A recipe may be promoted to a component only when all of these are true:

- The same UI pattern appears in at least 3 independent demos, recipes, or host integration sketches, or the same 40+ lines of XMLUI markup are duplicated in at least 2 places.
- The repeated pattern has at least 2 hard-to-compose concerns, such as coordinated keyboard behavior, accessible live-region behavior, focus management, nontrivial state derivation, repeated event payload shaping, complex theme variables, or cross-part rendering rules.
- The component can expose a small stable prop/API surface without owning host policy, persistence, provider selection, or application layout.
- The component can still be bypassed by using `AiThread` state and normal XMLUI markup directly.
- The promotion decision is recorded in this plan or a follow-up design note before implementation.

If these conditions are not met, keep the item as a recipe even if a component would be convenient.

### Defer Or Avoid

- Voice components such as speech input, transcription, personas, mic/voice selectors, and audio players.
- Workflow/canvas components such as nodes, edges, panels, connections, and generic toolbars.
- General coding-agent views such as commit cards, environment variable editors, package info, terminal emulators, test-result dashboards, stack traces, sandbox managers, and file trees, unless XMLUI generation needs a focused subset later.
- Artifact chip/card components for generated files or multi-file workspaces. The current target is a single generated XMLUI micro-app shown through preview/code state, not a file-artifact gallery.
- Generic prompt suggestions, shimmer effects, queues, and plan/task/checkpoint cards where normal XMLUI markup can express the state.

## Initial Markup Target

The important goal is that apps can compose a full AI UI around `AiThread` with normal XMLUI markup:

```xml
<AiThread id="agent" sendAction="{appGlobals.chatApiUrl}">
  <ScrollViewer height="*">
    <Items data="{agent.value.messages}">
      <AiMessageParts message="{$item}" streaming="{agent.value.streamingMessageId === $item.id}" />
    </Items>
  </ScrollViewer>

  <Form onSubmit="agent.send(prompt.value); prompt.setValue('')">
    <TextArea id="prompt" rows="4" enterSubmits="true" enabled="{!agent.value.isRunning}" />
    <property name="buttonRowTemplate">
      <HStack horizontalAlignment="end" gap="$space-2">
        <Button type="button" label="Stop" when="{agent.value.isRunning}" onClick="agent.cancel()" />
        <Button type="submit" label="Send" when="{!agent.value.isRunning}" />
      </HStack>
    </property>
  </Form>
</AiThread>
```

Or replace all visible pieces:

```xml
<AiThread id="agent" sendAction="{appGlobals.chatApiUrl}" />

<CustomChatPanel thread="{agent}" />
<CustomWorkspace code="{agent.value.currentCode}" />
```

For XMLUI generation:

```xml
<XmluiGenerationSession id="builder" thread="{agent}" />

<ChatPane chat="{builder}" />
<Select initialValue="{builder.value.selectedPreviewRevision}" onDidChange="builder.selectPreviewRevision($event)">
  <Option value="current" label="Current generation" />
  <Option value="lastWorking" label="Last working" enabled="{!!builder.value.lastWorkingCode}" />
</Select>
<XmluiPreviewPane
  code="{builder.value.code}"
  lastWorkingCode="{builder.value.lastWorkingCode}"
  selectedRevision="{builder.value.selectedPreviewRevision}" />
<XmluiCodeView
  code="{builder.value.selectedPreviewRevision === 'lastWorking' ? builder.value.lastWorkingCode : builder.value.code}" />
```

The first shipped demo should use a `ChatPane.xmlui`-style recipe backed by `AiThread`. Do not add a conversation wrapper as a public architectural layer; it would hide the main extension point without adding meaningful capability.

## Builder Agent Handoff Constraints

Use these constraints when handing this plan to an implementation agent:

- Implement only the Must Build components and headless controllers needed by the current phase. Do not add recipe-first components unless the Promotion Gate is explicitly satisfied and recorded.
- Treat `AiThread` as the primary client-side architecture. Do not introduce `AiConversation` or another conversation wrapper as a public layer unless this plan is updated first.
- Keep visible chat, workspace, session, model-picker, status, and toolbar layouts as XMLUI recipes composed from existing XMLUI primitives.
- Do not add artifact chip/card components. The current target is a single generated XMLUI micro-app represented through generation state, preview state, and code view state.
- Keep `XmluiCodeView` read-only for the first implementation. Editing support must be added later as an explicit mode with XMLUI-style value/change/apply events.
- `XmluiPreviewPane` must not silently replace a broken current generation with the last working app. It should show current diagnostics and offer a clear selector for current vs last-working revisions.
- Keep provider credentials, trusted bridge execution, server-side validation/repair, persistence, billing, auth, and host policy outside this package.
- Add fixture-driven tests before real provider integrations. Package tests should not call real AI providers or external services.

## Implementation Phases

### Phase 1: Rework Foundation

- Treat the existing conversation placeholder as temporary scaffolding; replace the demo anchor with `AiThread` as soon as the controller exists.
- Add this plan and link to bridge/overall plans.
- Define the first shared contract import strategy from `xmlui`.
- Create local fixture data for messages, runs, approvals, tool calls, generated code, clarification responses, and preview state.
- Add fixture cases based on the AI Elements gap checklist: streaming text, reasoning, sources, attachments, tool calls, approvals, generated XMLUI summaries, clarification responses, preview errors, and cancellation.
- Validate extension build still works.

### Phase 2: AI-Specific Visual Primitives

- Implement `AiMessageParts`.
- Implement `AiToolCall` and `AiApprovalRequest`.
- Decide whether `AiComposer` adds enough behavior beyond `Form` + `TextArea`; if not, ship it as a documented recipe instead of a component.
- Keep all data host-owned through props/events.
- Add component tests for empty, loading, streaming, partial markdown, reasoning, sources, tool states, approval decisions, errors, keyboard, and accessibility states.

### Phase 3: Headless Thread Controller

- Implement `AiThread`.
- Add normalized event application for messages, runs, tool calls, approvals, generated code, preview state, and errors.
- Expose XMLUI APIs for `send`, `cancel`, `appendMessage`, `setMessages`, `clear`, `approve`, and `reject`.
- Provide a fake transport for tests and demo.

### Phase 4: XMLUI Generation Client State

- Implement `XmluiGenerationSession` or equivalent `AiThread` mode.
- Port the client-side pieces of A2XMLUI `AgentChat`: generated code state, last working code, selected preview revision, replacement confirmation, status labels, diagnostics, and XMLUI state exposure.
- Keep repair orchestration server-owned, but display repair progress and final validation results.
- Port `XmluiCodeView`.
- Keep model selection, status badges, and replacement confirmation as XMLUI recipe markup unless they need centralized behavior.

### Phase 5: Preview And Workspace

- Port `XmluiPreviewPane` from A2XMLUI.
- Support direct code preview first.
- Add optional iframe/URL preview mode later.
- Preserve compile error, runtime error, warnings, theme, and tone behavior.
- Add current-vs-last-working preview selection so users can inspect broken generated code and quickly return to the last working app.
- Add recipe markup for preview toolbar, route/viewport controls, revision selector, diagnostics display, and code/preview tabs instead of dedicated components.

### Phase 6: Recipes And Promotion Review

- Build recipe XMLUI files for transcript, run timeline, session list, model selector, connection status, workspace panel, and saved micro-app list.
- Wire recipes to contract event shapes through `AiThread` fixture data.
- Evaluate recipes against the Promotion Gate. Do not promote a recipe unless it satisfies every gate condition.
- Add tests for approval states, event payloads, and recipe smoke coverage.

### Phase 7: Demos

- Add demo XMLUI apps showing:
  - `AiThread` with recipe-composed chat,
  - custom chat with headless controller,
  - XMLUI generation with preview and code view,
  - fake bridge events,
  - approval flow.

## Open Questions

- Should `XmluiGenerationSession` be separate, or should `AiThread` own generation-specific fields through a mode?
- Should the client accept AI SDK UI message streams directly, normalized contract streams, or both through adapters?
- How much local XMLUI compile validation belongs in the browser after server-side validation exists?
- Should `XmluiPreviewPane` default to in-process `StandaloneApp` preview or iframe preview?
- Should preview revision selection live entirely in `XmluiGenerationSession`, or should `XmluiPreviewPane` own a small local selected-revision state when uncontrolled?
- Where should shared contract exports live inside `xmlui` while they are incubating?
- What client events should represent save/reuse of accepted micro-apps without owning the host database?
- Should saved micro-app browsing ever become a first-class component, or should it remain a host-owned recipe built from micro-app metadata and host data?
- Are the Promotion Gate thresholds too strict or too loose after the first host integration?
- Should `AiComposer` be a real component, or should the package only document a `Form` + `TextArea` recipe?
- What exact `onApprove`, `onReject`, and `onEdit` payload signatures should `AiApprovalRequest` expose once `AiApprovalRequest` contract fields settle?

## Testing Strategy

- Unit tests for event reducers and controller state transitions.
- Component tests for the AI-specific visual primitives: message parts, tool calls, approvals, code view, and preview.
- Recipe smoke tests for transcript, composer, session list, model picker, connection status, workspace panel, and preview toolbar.
- Accessibility checks for streaming transcript updates, composer controls, approvals, tool-call disclosure, code view, and preview errors.
- Demo smoke tests using fake bridge events and no provider calls.
- No real provider calls in package tests.
