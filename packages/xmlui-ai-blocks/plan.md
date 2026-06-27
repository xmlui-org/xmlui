# xmlui-ai-blocks Plan

`xmlui-ai-blocks` is the client-side XMLUI package for AI-assisted app-building interfaces. It owns headless browser-side controllers, the small set of AI-specific UI primitives that normal XMLUI markup cannot cover well, and an optional builder frame for arranging chat, preview, code, and status surfaces. It does not own provider credentials, filesystem access, MCP processes, model policy, trusted tool execution, or a mandatory chat/workspace shell.

The near-term reference implementation is `D:\Projects\albacrm\a2xmlui`. In that project, the useful client-side shape is the XMLUI extension `AgentChat`: it is headless, talks to a configurable chat endpoint, tracks generated XMLUI code, exposes state through `value`, and lets XMLUI markup render the chat/preview/code UI however it wants. `xmlui-ai-blocks` should generalize that pattern.

Related plans:

- [agent-harness-plan.md](./agent-harness-plan.md): overall contract and three-tier architecture.
- [xmlui-ai-bridge-plan.md](./xmlui-ai-bridge-plan.md): trusted Node/runtime bridge plan.

## Package Boundary

This package contains:

- XMLUI extension components for AI thread state, normalized stream handling, message-part rendering, approval affordances, code view, and XMLUI preview.
- An optional visual builder frame that can host the package primitives and place known child surfaces into a coherent app-generation layout without taking over provider policy, persistence, or transport.
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
- Optional host frame: the package may include a layout shell for the common UI-generator workspace, but every child surface must remain usable standalone and replaceable.
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
- `xmlui-app/src/components/ChatPane.xmlui`: reference recipe markup proving the UI can be replaced while keeping the controller. This is source material for XMLUI recipes, not a component to port wholesale.
- `src/agent/xmluiAgentContract.ts`: contract ideas only; shared schemas should move into `xmlui` or a common contract module, not stay app-specific.

Avoid copying the A2XMLUI shell wholesale. The package should preserve the harness behavior and expose better primitives.

### XMLUI Studio Migration Notes

The separate XMLUI Studio app at
`D:\Projects\albacrm\xmlui-studio\packages\a2xmlui\xmlui-app` is useful as
reference source material for the same extraction path, but it should not become
the package UI. Migrate behavior and layout lessons selectively:

- `src/extensions/AgentChat/AgentChat.tsx` proves the headless controller shape:
  message projection, busy/status labels, generated code, last-successful code,
  queued steering, full-replacement confirmation, and imperative APIs. Port these
  ideas into `AiThread` and generation state, but do not port its provider calls,
  AI SDK transport coupling, repair prompts, diagnostics posting, host save
  implementation, or local-storage persistence into browser visual components.
- `src/extensions/XmluiPreview/XmluiPreview.tsx` is good source material for
  compile diagnostics, runtime error isolation, theme/tone forwarding, sandbox
  globals, and bounded preview scrolling. Do not copy its silent fallback behavior:
  `XmluiPreviewPane` must render the selected revision and keep broken current
  generations inspectable unless the user explicitly selects `lastWorking`.
- `src/extensions/CodeView/CodeView.tsx` is a useful secondary reference for a
  lightweight XMLUI formatter, line-number gutter, tone-aware token colors, and
  scroll isolation. Keep `XmluiCodeView` read-only in the first pass and expose
  copy/selection through events or recipe chrome rather than turning it into an
  editor.
- `src/extensions/PromptInput/PromptInput.tsx` contains real hard-to-compose
  composer behavior: auto-resize, Enter-to-submit, ArrowUp recall, queue/stop
  mode, drag/drop attachments, file validation, portal positioning, searchable
  grouped model selection, and persisted selection. Treat this as evidence for a
  possible future `AiPromptInput`, not as an immediate component. It must pass
  the Promotion Gate before being added.
- `src/extensions/ChainOfThought` and `src/extensions/ReasoningBlock` should be
  consolidated into the existing message/timeline strategy. Simple reasoning
  belongs in `AiMessageParts`; structured run progress belongs in a run timeline
  recipe unless repeated host integrations justify a dedicated component.
- `src/components/ChatPane.xmlui`, the workspace header, save dialog, model
  selector, preview toolbar, status messages, and saved-app workflow are recipe
  source material only. They contain host copy, policy, persistence, and shell
  decisions that must remain swappable.
- `src/themes/*` should inform the default frame tone only at the level of
  restrained product styling: thin borders, stable scroll regions, compact
  controls, minimal shadow, and panel radii no larger than 8px by default. Do not
  copy the Studio brand palette into `xmlui-ai-blocks` defaults.

## Component Scope Audit

The first pass should deliberately avoid recreating a full [AI Elements](https://elements.ai-sdk.dev/components)-style visual kit. AI Elements is useful as a feature checklist, not as a target component count. Its current component index groups needs into chatbot UI, code/agent UI, voice, workflow, and utilities; for XMLUI app generation the relevant gaps are mostly chatbot state, generated-code/preview state, streaming, sources, reasoning, tools, and approvals.

XMLUI already has enough general-purpose components to build most visible shell pieces:

- Layout and chrome: `Stack`, `HStack`, `VStack`, `Card`, `Splitter`, `Tabs`, `Drawer`, `ModalDialog`, `ScrollViewer`, `StickyBox`.
- Basic conversation UI: `Items`, `Text`, `Markdown`, `Avatar`, `Badge`, `Spinner`, `ProgressBar`, `Button`, `Tooltip`, `LiveRegion`.
- Composer and controls: `Form`, `TextArea`, `TextBox`, `Select`, `Option`, `Switch`, `FileInput`, `FileUploadDropZone`.
- Data and operation lists: `List`, `Table`, `Tree`, `Accordion`, `ExpandableItem`, `CodeBlock`.
- Preview surfaces: `NestedApp`, `IFrame`, `EventSource`, `WebSocket`, `Toast`.

`ChatPane.xmlui` in A2XMLUI proves that a usable chat interface can be composed from these primitives. It covers transcript layout, role-based bubbles, model selection, busy state, errors, full-replacement confirmation, and send/stop composer controls without custom visual React. The package should treat it as a recipe source, not as a planned `ChatPane` or `AiChatPane` component.

The missing higher-level visual piece is a frame for the complete XMLUI generator workspace: a chat panel, app preview, code view, status/toolbar area, and optional side surfaces that need to be placed together consistently. This frame should behave like XMLUI's `App` recognizing `Header` and `Footer`: it can identify intended child regions and arrange them, while the children still render correctly outside the frame.

What XMLUI does not cover by itself is the AI-specific interpretation layer:

- Streaming event reduction from provider or bridge streams into stable XMLUI state.
- Message-part normalization across text, reasoning, tool calls, sources, clarifications, and errors.
- Accessible live updates for partial assistant output and long-running runs.
- Tool-call, approval, generation, and preview lifecycle semantics.
- XMLUI preview compilation, runtime-error isolation, current-vs-last-working revision handling, diagnostics display, and generated-source formatting.

The rule for this package: build components for those gaps, include one optional builder frame for the common app-generation workspace, then express the rest of the UI around them as XMLUI recipes. Promote any additional recipe into a bundled visual component only after it repeats enough to justify a stable abstraction.

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

The visual surface should stay intentionally small. A chat pane should remain a recipe built from XMLUI primitives, with `xmlui-ai-blocks` supplying only the pieces that carry AI-specific semantics.

### Must Build

- `AiMessageParts`: renders normalized message parts, including streaming text, reasoning summaries, sources, tool-call references, clarifications, and errors. This is the main replacement for generic `Text` bubbles when the message is no longer simple text.
- `AiApprovalRequest`: compact approve/reject/edit surface for bridge-generated approval requests. Approval UX is policy-sensitive enough to deserve a stable component. It provides user feedback for system/bridge events and actions when a human decision is required, but it does not decide whether approval is required.
- `AiToolCall`: status renderer for a single normalized tool call, with pending/running/succeeded/failed/cancelled states and optional input/output disclosure. It provides user feedback about system/tool progress and results, but it does not execute tools, retry tools, or decide whether a tool is allowed to run.
- `XmluiPreviewPane`: preview generated XMLUI code or a host-provided preview URL, preserving compile errors, runtime errors, selectable current/last-working rendering, warnings, theme, and tone behavior.
- `XmluiCodeView`: read-only XMLUI source formatting and syntax highlighting, based first on the existing `NestedAppAndCodeViewReact` code-view behavior and only then on A2XMLUI `CodeView` if it adds missing behavior.
- `XmluiBuilderFrame`: optional visual shell for the common UI-generator workspace. It hosts chat, preview, code, toolbar/status, and auxiliary regions, and applies responsive layout rules to them. It does not own the thread controller, provider/model selection, bridge transport, persistence, approval policy, generated-code lifecycle, or save/publish actions.

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

```xml
<!-- Optional frame for the complete XMLUI app-generation workspace. The frame
     places known child regions while each child remains usable standalone. -->
<XmluiBuilderFrame
  layout="auto"
  chatPlacement="start"
  workspaceMode="{appGlobals.isMobile ? 'tabs' : 'split'}"
  activePanel="{workspace.value.activePanel}"
  onPanelChange="workspace.setActivePanel($event.panel)">
  <property name="chatTemplate">
    <VStack height="100%" gap="$space-3">
      <Transcript thread="{agent}" />
      <Composer thread="{agent}" />
    </VStack>
  </property>
  <property name="toolbarTemplate">
    <PreviewToolbar builder="{builder}" />
  </property>
  <property name="previewTemplate">
    <XmluiPreviewPane
      code="{builder.value.code}"
      lastWorkingCode="{builder.value.lastWorkingCode}"
      selectedRevision="{builder.value.selectedPreviewRevision}" />
  </property>
  <property name="codeTemplate">
    <XmluiCodeView
      code="{builder.value.selectedPreviewRevision === 'lastWorking'
        ? builder.value.lastWorkingCode
        : builder.value.code}" />
  </property>
</XmluiBuilderFrame>
```

`XmluiBuilderFrame` should solve layout-level concerns that are awkward to repeat in every host: desktop split view, mobile tab/stack behavior, stable scroll containment, panel resizing defaults, preview/code placement, and consistent status/toolbar anchoring. It may expose named templates or named child-region components, whichever best matches XMLUI component conventions at implementation time.

Studio-informed frame behavior:

- Chat and composer must be separate vertical regions. The transcript/chat region
  scrolls; `composerTemplate` stays anchored at the bottom of the chat column in
  split and stack layouts. Do not put both templates inside one shared scroll
  container.
- Workspace, preview, code, timeline, and auxiliary regions each need explicit
  `min-height: 0`, `min-width: 0`, and stable overflow ownership so nested
  previews and code views do not force the whole frame to scroll.
- Tabs should behave like tabs, not only styled buttons: `role="tablist"`,
  `role="tab"`, associated `tabpanel` regions, selected state, keyboard
  left/right or up/down navigation, and focus treatment belong to the frame
  because the frame owns panel switching.
- If the split handle is interactive, it should be keyboard-accessible and expose
  separator semantics. If that is too much for the first pass, make resizing opt-in
  or keep the handle visually simple until the accessible behavior is implemented.
- Default styling should be quiet and product-oriented: thin border, no large
  shadow, radius no larger than 8px, toolbar/status as bands, and panels that feel
  like bounded work regions rather than nested cards.
- The demo should avoid placing `Card` chrome inside every frame region. Use flat
  XMLUI primitives inside the frame unless the child content is a genuinely
  repeated item, modal, or standalone tool.

The frame must remain a host, not a controller:

- It accepts child content, templates, or component children; it should not create an `AiThread` internally.
- It can provide context variables for active panel, available regions, layout mode, and compact/mobile state.
- It can apply known layout styling to `XmluiPreviewPane`, `XmluiCodeView`, transcript/composer recipes, and status surfaces.
- It cannot decide approval policy, persist micro-apps, call providers, select models, repair code, or hide failed current generations.
- It should support a degraded plain layout when only one or two regions are supplied.

### Chat Pane Decision

Do not build a separate `ChatPane` or `AiChatPane` visual component in the initial package.

The chat pane is mostly composition:

- Transcript layout is `ScrollViewer`/`VStack`/`Items` plus `AiMessageParts`.
- Tool and approval activity is `Items`, `Accordion`, `AiToolCall`, and `AiApprovalRequest`.
- Composer behavior is `Form` plus `TextArea` and send/cancel buttons until a real `AiComposer` need emerges.
- Model/provider controls, connection status, replacement confirmation, and errors are ordinary XMLUI controls bound to `AiThread` or `XmluiGenerationSession`.

The non-rendering components should own the state and actions:

- `AiThread` owns messages, running state, tool calls, approvals, send/cancel/approve/reject APIs, and stream reduction.
- `XmluiGenerationSession`, if implemented separately, owns generated-code state, selected preview revision, last-working state, and replacement confirmation state.
- `XmluiBuilderFrame` owns only outer region placement and responsive workspace layout.

Adding `ChatPane`/`AiChatPane` now would mostly bundle host-specific layout, copy, ordering, and policy choices behind another visual abstraction. That would overlap with `XmluiBuilderFrame` for shell layout and with `AiThread` for chat state, while adding little AI-specific behavior that cannot already be expressed through recipes.

Promotion remains possible later, but only through the normal Promotion Gate. A future chat-pane component would need repeated duplication plus hard-to-compose concerns such as focus restoration across transcript/composer, live-region behavior that cannot live in `AiMessageParts`, transcript auto-scroll semantics, attachment management, or consistent keyboard handling across send/cancel/composition events.

### Conditional

- `AiComposer` or `AiPromptInput`: build only if it adds real behavior beyond `Form` + `TextArea`: enter-to-submit consistency, send/cancel switching, attachment collection, composition events, and accessibility details. Otherwise keep it as a recipe.
- XMLUI Studio's `PromptInput` is the reference for what would justify promotion:
  auto-resizing text input, ArrowUp recall, queue-while-running behavior,
  attachment validation and previews, drag/drop handling, and an accessible
  searchable model picker. Do not promote it only to bundle model selection or
  app-specific composer styling.

### Recipe First

These should be documented as XMLUI markup recipes before becoming components:

- Transcript: use `ScrollViewer`/`VStack`/`Items` plus `AiMessageParts`.
- Run timeline: compose `Items`, `Accordion`, `AiToolCall`, `AiApprovalRequest`, and normal XMLUI status components.
- Session list: compose with `List`, `Items`, `Button`, `Badge`, and host-owned data.
- Model selector: compose with `Select`/`Option` unless provider capability filtering becomes complex enough to centralize.
- Connection status: compose with `Badge`, `Spinner`, `Tooltip`, and host health state.
- Workspace panel: compose from `Tabs`, `XmluiCodeView`, `XmluiPreviewPane`, and host-owned status controls when the full `XmluiBuilderFrame` is not desired.
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

<VStack height="100%" gap="$space-3">
  <Transcript thread="{agent}" />
  <Composer thread="{agent}" />
</VStack>
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

Or use the optional frame when the host wants the standard generator workspace
arrangement without hand-composing the outer split/tabs layout:

```xml
<XmluiBuilderFrame workspaceMode="auto">
  <property name="chatTemplate">
    <VStack height="100%" gap="$space-3">
      <Transcript thread="{agent}" />
      <Composer thread="{agent}" />
    </VStack>
  </property>
  <property name="previewTemplate">
    <XmluiPreviewPane
      code="{builder.value.code}"
      lastWorkingCode="{builder.value.lastWorkingCode}"
      selectedRevision="{builder.value.selectedPreviewRevision}" />
  </property>
  <property name="codeTemplate">
    <XmluiCodeView
      code="{builder.value.selectedPreviewRevision === 'lastWorking'
        ? builder.value.lastWorkingCode
        : builder.value.code}" />
  </property>
</XmluiBuilderFrame>
```

The first shipped demo should use a transcript/composer recipe backed by `AiThread`. Do not add a `ChatPane`, `AiChatPane`, or conversation wrapper as a public architectural layer; it would hide the main extension point without adding meaningful capability.

## Builder Agent Handoff Constraints

Use these constraints when handing this plan to an implementation agent:

- Implement only the Must Build components and headless controllers needed by the current phase. Do not add recipe-first components unless the Promotion Gate is explicitly satisfied and recorded.
- Treat `AiThread` as the primary client-side architecture. Do not introduce `AiConversation` or another conversation wrapper as a public layer unless this plan is updated first.
- Do not add `ChatPane` or `AiChatPane` as an initial visual component. Keep transcript and composer as recipes unless the Promotion Gate is satisfied later.
- Keep visible chat, session, model-picker, status, and toolbar layouts as XMLUI recipes composed from existing XMLUI primitives unless they are provided as child content to `XmluiBuilderFrame`.
- `XmluiBuilderFrame` is the only planned outer shell component. It may arrange child regions, but it must not instantiate controllers, hide extension points, or make the package depend on one fixed app UI.
- Do not add artifact chip/card components. The current target is a single generated XMLUI micro-app represented through generation state, preview state, and code view state.
- Keep `XmluiCodeView` read-only for the first implementation. Editing support must be added later as an explicit mode with XMLUI-style value/change/apply events.
- `XmluiPreviewPane` must not silently replace a broken current generation with the last working app. It should show current diagnostics and offer a clear selector for current vs last-working revisions.
- Keep provider credentials, trusted bridge execution, server-side validation/repair, persistence, billing, auth, and host policy outside this package.
- Add fixture-driven tests before real provider integrations. Package tests should not call real AI providers or external services.

## Implementation Phases

Use this section as the handoff checklist for builder agents. Each phase should be
implemented as a small PR-sized step with fixture data and demos before wiring a real
bridge endpoint. When a phase includes owner questions, ask them before implementing
that phase if the answer materially changes the public API; otherwise choose the
recommended default and record the assumption in the PR notes.

### Phase 1: Rework Foundation

Goal: prepare the package so later components can be built against stable local
fixtures and the compact shared contract from `xmlui`.

Deliverables:

- Remove `AiConversation`. Do not extend it.
- Add shared contract imports from `xmlui` in a small local module, for example
  `src/contract.ts`, so future renames are isolated.
- Add local fixtures under `src/fixtures/` for messages, runs, tool calls,
  approvals, generation states, and complete fake event sequences.
- Add pure reducer helpers under `src/state/` only if needed by fixtures or demos.
- Update the demo to render fixture-backed AI state, even before `AiThread` exists.

Builder rules:

- Do not add a transport, endpoint calls, provider selection, preview rendering, or
  persistence in this phase.
- Keep fixtures plain TypeScript objects using exported `xmlui` contract types.
- Include only contract part kinds that exist today: `text`, `reasoning`, `source`,
  `tool-call`, `clarification`, and `error`.

Example fixture:

```ts
import type { AgentEvent, AiMessage, AiToolCall } from "xmlui";

export const assistantStreamingMessage: AiMessage = {
  id: "msg_assistant_1",
  role: "assistant",
  status: "streaming",
  parts: [{ kind: "text", text: "Building the dashboard...", streaming: true }],
};

export const docsSearchToolCall: AiToolCall = {
  id: "tool_docs_1",
  name: "xmlui_search",
  status: "running",
  inputSummary: "Search XMLUI docs for DataSource and Table examples",
};

export const happyPathEvents: AgentEvent[] = [
  { type: "run.updated", run: { id: "run_1", status: "running", provider: "openai", model: "gpt-5.2" } },
  { type: "message.updated", message: assistantStreamingMessage },
  { type: "tool.updated", toolCall: docsSearchToolCall },
  { type: "message.delta", messageId: "msg_assistant_1", text: " I found the components." },
  {
    type: "generation.updated",
    generation: {
      status: "accepted",
      code: "<App><Text value=\"Hello\" /></App>",
      summary: "Created a starter app.",
    },
  },
];
```

Tests and checks:

- `npm --prefix packages/xmlui-ai-blocks run build:extension`
- Add a lightweight fixture import test if the package already has a test harness.
- If there is no test harness yet, keep the phase to fixture/demo/build changes only.

Exit criteria:

- A builder can import contract types from one local place.
- The package has representative fake data for the next three phases.
- The demo still builds without real providers or network calls.

Owner questions before implementation:

- Decision: use stable human-readable fixture IDs such as `msg_user_1`,
  `msg_assistant_1`, `run_1`, and `tool_docs_1`.
- Decision: replace `AiConversation` with `AiThread` immediately. Do not spend any
  implementation effort making the placeholder fixture-aware.

### Phase 2: Builder Frame Scaffold

Goal: implement `XmluiBuilderFrame` early so the package can test whether the
smaller components and recipes fit naturally into the intended host frame before
their public surfaces settle.

Deliverables:

- `XmluiBuilderFrame` as an optional host shell for chat, preview, code,
  toolbar/status, and auxiliary regions.
- Metadata, defaults, SCSS module, extension registration, and demo examples for
  the frame.
- Placeholder/demo region content using ordinary XMLUI primitives and fixture data,
  not the later AI-specific visual components.
- A demo that mounts transcript, composer, preview placeholder, code placeholder,
  toolbar, and status regions inside the frame.

Builder rules:

- Keep `XmluiBuilderFrame` focused on layout and region placement. It does not own
  `AiThread`, `XmluiGenerationSession`, preview revision state, provider/model
  selection, persistence, approval policy, or save/publish flows.
- Use placeholder region content until `AiMessageParts`, `AiToolCall`,
  `AiApprovalRequest`, `XmluiCodeView`, and `XmluiPreviewPane` exist.
- Do not introduce `ChatPane` or `AiChatPane`; the chat region is transcript and
  composer recipe content hosted by the frame.
- Render `chatTemplate` and `composerTemplate` as separate frame regions. The chat
  transcript area owns scrolling; the composer is anchored and remains visible.
- Keep all frame-owned regions bounded with `min-height: 0`, `min-width: 0`, and
  explicit overflow rules so `XmluiPreviewPane`, `XmluiCodeView`, and long
  transcripts can scroll internally without resizing the shell.
- Implement tab semantics and keyboard navigation for frame-owned top-level and
  workspace tabs.
- Make the resize handle accessible if it is enabled by default; otherwise defer
  enabled resizing until separator semantics and keyboard resizing are present.
- Support a useful degraded layout when only one or two regions are supplied.
- Keep route/viewport controls as recipes unless they need component-owned behavior.
- Keep styles compact, theme-variable based, and visually quiet: thin borders,
  minimal or no shadow, radius at or below 8px, and toolbar/status bands rather
  than nested card-like chrome.
- Keep the demo flat. Avoid wrapping every region in `Card`; use cards only for
  repeated items, modals, or genuinely framed child tools.

Recommended `XmluiBuilderFrame` props:

```ts
layout?: "auto" | "split" | "tabs" | "stack";
chatPlacement?: "start" | "end" | "hidden";
workspaceMode?: "auto" | "preview" | "code" | "split" | "tabs";
activePanel?: "chat" | "preview" | "code" | "timeline";
resizable?: boolean;
compactBreakpoint?: string;
```

Recommended `XmluiBuilderFrame` templates or child regions:

```ts
chatTemplate?: ComponentTemplate;
composerTemplate?: ComponentTemplate;
toolbarTemplate?: ComponentTemplate;
statusTemplate?: ComponentTemplate;
previewTemplate?: ComponentTemplate;
codeTemplate?: ComponentTemplate;
timelineTemplate?: ComponentTemplate;
auxiliaryTemplate?: ComponentTemplate;
```

Recommended event:

```ts
onPanelChange -> { panel: "chat" | "preview" | "code" | "timeline" }
```

Example XMLUI frame smoke:

```xml
<XmluiBuilderFrame
  layout="auto"
  activePanel="{workspace.value.activePanel}"
  onPanelChange="workspace.setActivePanel($event.panel)">
  <property name="chatTemplate">
    <Items data="{fixture.messages}">
      <Text value="{$item.role}: {$item.parts[0].text}" />
    </Items>
  </property>
  <property name="composerTemplate">
    <Form>
      <TextArea id="prompt" rows="4" />
    </Form>
  </property>
  <property name="toolbarTemplate">
    <HStack gap="$space-2">
      <Button label="Preview" onClick="workspace.setActivePanel('preview')" />
      <Button label="Code" onClick="workspace.setActivePanel('code')" />
    </HStack>
  </property>
  <property name="previewTemplate">
    <Text value="Preview placeholder" />
  </property>
  <property name="codeTemplate">
    <CodeBlock value="{fixture.generation.code}" language="xmlui" />
  </property>
</XmluiBuilderFrame>
```

Tests and checks:

- Frame tests for missing optional regions, desktop split layout, compact tab/stack
  layout, panel-change events, and stable scroll containment.
- Frame tests that the composer remains visible while transcript content scrolls.
- Keyboard/a11y tests for frame-owned tabs and, if enabled, the split resize
  handle.
- Demo smoke test with placeholder region content.
- `npm --prefix packages/xmlui-ai-blocks run build:extension`
- `npm --prefix packages/xmlui-ai-blocks run build:meta` if metadata changed.

Exit criteria:

- A host can mount the standard generator workspace frame before the smaller visual
  primitives exist.
- The frame proves how transcript/composer, tool timeline, preview, code, toolbar,
  and status regions are expected to fit together.
- The frame layout can host Studio-derived preview and code surfaces without
  introducing nested scroll bugs or hiding extension points.
- No frame behavior owns transport, policy, persistence, generation state, or
  preview state.

#### Current Component Update Handoff

Use this handoff when updating the current `XmluiBuilderFrame`,
`AiMessageParts`, `AiToolCall`, `AiApprovalRequest`, and demo implementation:

1. Update `XmluiBuilderFrameNative` so chat and composer are separate structural
   regions. The chat transcript region scrolls; the composer remains anchored.
2. Revise `XmluiBuilderFrame.module.scss` defaults to the quiet product frame
   style described above: thin border, little/no shadow, radius no larger than
   8px, bounded regions, toolbar/status bands, and no card-inside-card feel.
3. Add proper tab/tabpanel semantics and keyboard navigation for both top-level
   compact tabs and workspace tabs. Keep `onPanelChange` payload unchanged.
4. Either make the split handle accessible with separator semantics and keyboard
   resizing, or switch the default `resizable` behavior to a noninteractive/static
   split until that accessibility work is complete.
5. Update the demo to use flatter region content and the existing visual
   primitives without promoting `ChatPane`, `PromptInput`, model selection, or
   save/publish UI into package components.
6. Leave `AiMessageParts`, `AiToolCall`, and `AiApprovalRequest` focused on their
   current AI-specific rendering responsibilities. Only adjust spacing, borders,
   and tone as needed so they fit the quieter frame; do not add transport,
   provider, persistence, or layout ownership.

Owner questions before implementation:

- Decision: implement named templates first. Consider marker child components later
  only if template ergonomics are poor.
- Decision: initial responsive behavior should support desktop split and compact
  tabs/stack. Fine-grained viewport controls can stay recipe-owned.
- Decision: use fixture data and placeholder XMLUI primitives for the first frame
  demo; do not wait for Phase 3 visual primitives.

### Phase 3: AI-Specific Visual Primitives

Goal: implement the smallest visual components that cannot be expressed cleanly with
generic XMLUI primitives, using the Phase 2 frame demo to validate how they fit in
the host workspace.

Deliverables:

- `AiMessageParts`: renders one `AiMessage`.
- `AiToolCall`: renders one `AiToolCall`.
- `AiApprovalRequest`: renders one `AiApprovalRequest` and emits user decisions.
- Metadata, defaults, SCSS module, extension registration, and demo examples for
  each component.
- Update the `XmluiBuilderFrame` demo to replace placeholders with these visual
  primitives where appropriate.

Builder rules:

- Do not implement `AiComposer` yet. Document a `Form` + `TextArea` recipe instead.
- Do not add markdown parsing beyond what existing XMLUI `Markdown` can already do.
  The current contract has `text`, not `markdown`.
- Do not execute tools or approvals. Components render state and emit events only.
- Keep styles compact and theme-variable based. Do not add another chat-shell layout
  component; use `XmluiBuilderFrame` when a host frame is needed.

Recommended XMLUI-facing props:

```ts
// AiMessageParts
message: AiMessage;
streaming?: boolean;
collapseReasoning?: boolean;
showSources?: boolean;

// AiToolCall
toolCall: AiToolCall;
defaultOpen?: boolean;
showInput?: "none" | "summary";
showOutput?: "none" | "summary";

// AiApprovalRequest
request: AiApprovalRequest;
running?: boolean;
```

Recommended events:

```ts
// AiApprovalRequest
onApprove -> { requestId: string; decisionPayload?: unknown }
onReject -> { requestId: string; reason?: string }
// onEdit is deferred until an explicit edit UI exists.
```

Example XMLUI recipe:

```xml
<Items data="{agent.value.messages}">
  <AiMessageParts
    message="{$item}"
    streaming="{$item.status === 'streaming'}"
    collapseReasoning="true" />
</Items>

<Items data="{agent.value.toolCalls}">
  <AiToolCall
    toolCall="{$item}"
    defaultOpen="{$item.status === 'running' || $item.status === 'failed'}"
    showInput="summary"
    showOutput="summary" />
</Items>

<Items data="{agent.value.pendingApprovals}">
  <AiApprovalRequest
    request="{$item}"
    running="{agent.value.isRunning}"
    onApprove="agent.approve($event.requestId, $event.decisionPayload)"
    onReject="agent.reject($event.requestId, $event.reason)" />
</Items>
```

Tests and checks:

- Component render tests for empty/missing optional fields, streaming text, reasoning
  collapsed/expanded, source links, tool running/succeeded/failed, approval pending
  and resolved states.
- Keyboard tests for approval buttons and any disclosure controls.
- `npm --prefix packages/xmlui-ai-blocks run build:extension`
- `npm --prefix packages/xmlui-ai-blocks run build:meta` if metadata changed.

Exit criteria:

- Recipes can render transcript, tool timeline, and approvals from fixture data.
- The Phase 2 frame demo can host the visual primitives without special-case layout
  code in the smaller components.
- No visual component owns transport, policy, persistence, or shell layout.

Owner questions before implementation:

- Decision: render message sources as inline links. Reuse the existing link behavior
  used by Markdown where practical, such as `Link`/`LinkNative`.
- Decision: defer `AiApprovalRequest` edit UI and `onEdit`. The first implementation
  should only support approve and reject.
- Decision: render tool input/output summaries as text only. Do not add JSON
  disclosure fallback in the first pass.

### Phase 4: Headless Thread Controller

Goal: replace the placeholder conversation with `AiThread`, the primary headless
controller for browser-side AI thread state.

Deliverables:

- `AiThread` component registered as an XMLUI extension component.
- A pure `applyAgentEvent(state, event)` reducer.
- A fake transport that replays fixture events with optional delay.
- XMLUI APIs: `send`, `cancel`, `appendMessage`, `setMessages`, `clear`, `approve`,
  and `reject`.
- Demo recipe using `AiThread` plus Phase 3 visual primitives.

Builder rules:

- `AiThread` is the public controller. Do not introduce `AiConversation`,
  `AiChat`, or another wrapper.
- Apply only the compact event names exported by `xmlui`: `run.updated`,
  `message.updated`, `message.delta`, `tool.updated`, `approval.updated`,
  `generation.updated`, and `error`.
- Unknown event names should be ignored and optionally recorded as nonfatal
  diagnostics in local state.
- Keep preview-specific state out of the shared contract. Local value may include
  `generation.code`; preview revision selection belongs to Phase 5/6.

Recommended local value shape:

```ts
type AiThreadValue = {
  messages: AiMessage[];
  activeRun?: AiRun;
  isRunning: boolean;
  status: "idle" | "running" | "awaiting-approval" | "complete" | "error" | "cancelled";
  error?: string;
  toolCalls: AiToolCall[];
  pendingApprovals: AiApprovalRequest[];
  generation: XmluiGenerationState;
  provider?: string;
  model?: string;
};
```

Example reducer behavior:

```ts
case "message.delta":
  // Append text to the last text part for messageId, or create a text part if needed.
  // Mark the message as streaming.

case "approval.updated":
  // Replace by id. pendingApprovals derives from status === "requested".

case "generation.updated":
  // Replace generation snapshot. Do not infer preview success here.
```

Example XMLUI usage:

```xml
<AiThread
  id="agent"
  provider="openai"
  model="gpt-5.2"
  transport="fixture"
  currentCode="{builder.value.code}">
  <VStack gap="$space-4">
    <Items data="{agent.value.messages}">
      <AiMessageParts message="{$item}" />
    </Items>
    <Form onSubmit="agent.send(prompt.value); prompt.setValue('')">
      <TextArea id="prompt" rows="4" enabled="{!agent.value.isRunning}" />
      <Button type="submit" label="Send" enabled="{!agent.value.isRunning}" />
      <Button type="button" label="Stop" when="{agent.value.isRunning}" onClick="agent.cancel()" />
    </Form>
  </VStack>
</AiThread>
```

Tests and checks:

- Unit tests for `applyAgentEvent`.
- Controller tests for `send`, fake replay, cancellation, approval resolution, and
  clearing state.
- Demo smoke with fixture transport only.
- `npm --prefix packages/xmlui-ai-blocks run build:extension`

Exit criteria:

- A host can build a complete fixture-backed chat with `AiThread` and XMLUI recipes.
- No real provider calls or bridge server are required.

Owner questions before implementation:

- Should the first transport prop be a string mode such as `transport="fixture"`, a
  callback prop, or only `sendAction` URL plus a fake demo helper?
- Should `send(prompt)` immediately append a user message client-side, or wait for a
  `message.updated` echo from the bridge?
- Should `cancel()` only stop local fake replay in this phase, or call a supplied
  `cancelAction` when present?

### Phase 5: XMLUI Generation Client State

Goal: add XMLUI-generation state around `AiThread` without turning the package into
a full IDE.

Recommended default: implement `XmluiGenerationSession` as a separate headless
component only if the state cannot stay cleanly inside `AiThread.value.generation`.
For the first implementation, prefer an `AiThread` generation mode plus recipe state
unless owner answers say otherwise.

Deliverables:

- Generated-code state with `code`, `lastWorkingCode`, `lastAcceptedCode` only if
  needed locally.
- Selected preview revision: `current` and `lastWorking` first; defer
  `lastAccepted` until persistence exists.
- Replacement confirmation state for destructive full replacement requests.
- `XmluiCodeView` as a read-only source viewer.
- Recipe markup for generation status and replacement confirmation.

Builder rules:

- Server-side repair orchestration remains outside this package.
- Do not add persistence, save buttons, publish flows, or artifact cards.
- Do not make `XmluiCodeView` an editor.
- Do not silently copy `lastWorkingCode` over broken current code.
- When mining XMLUI Studio `CodeView`, keep only viewer concerns: formatting,
  line numbers, tone-aware token styling, scroll isolation, displayed-code
  updates, and optional copy/selection events. Do not port workspace header,
  save/copy buttons, or file naming chrome as component-owned UI.

Recommended local generation value:

```ts
type XmluiGenerationClientState = {
  code?: string;
  lastWorkingCode?: string;
  selectedPreviewRevision: "current" | "lastWorking";
  summary?: string;
  diagnostics: XmluiValidationIssue[];
  replacementPending: boolean;
  status: "idle" | "generating" | "repairing" | "clarification" | "accepted" | "failed";
};
```

Example revision selector recipe:

```xml
<Select
  initialValue="{builder.value.selectedPreviewRevision}"
  onDidChange="builder.selectPreviewRevision($event)">
  <Option value="current" label="Current generation" />
  <Option value="lastWorking" label="Last working" enabled="{!!builder.value.lastWorkingCode}" />
</Select>

<XmluiCodeView
  code="{builder.value.selectedPreviewRevision === 'lastWorking'
    ? builder.value.lastWorkingCode
    : builder.value.code}"
  language="xmlui"
  readOnly="true"
  showLineNumbers="true" />
```

Tests and checks:

- Reducer/state tests for accepted generation, failed generation, repair status,
  replacement confirmation, and revision selection.
- `XmluiCodeView` tests for empty code, line numbering, copy event, and displayed
  code changes.
- `npm --prefix packages/xmlui-ai-blocks run build:extension`

Exit criteria:

- Fixture events can produce generated XMLUI code visible in `XmluiCodeView`.
- A broken current generation can remain selected and inspectable.

Owner questions before implementation:

- Should `XmluiGenerationSession` be a real component in Phase 5, or should
  `AiThread` expose enough generation state for now?
- Should `lastWorkingCode` update only after local preview succeeds, or immediately
  when the bridge sends `generation.status === "accepted"`?
- Should replacement confirmation live in headless state, or entirely in XMLUI
  recipe markup?

### Phase 6: Preview And Workspace

Goal: render generated XMLUI safely while preserving the current-vs-last-working
inspection model, then plug the preview and code surfaces into the frame introduced
in Phase 2.

Deliverables:

- `XmluiPreviewPane` with direct code preview first.
- Local preview state: `idle`, `compiling`, `ready`, `warning`, `error`.
- Compile diagnostics and runtime error display.
- Hooks/events for preview state changes so `lastWorkingCode` can update outside
  the component.
- Recipe markup for workspace tabs and preview toolbar.
- Update the Phase 2 `XmluiBuilderFrame` demo to use `XmluiPreviewPane` and
  `XmluiCodeView` together.

Builder rules:

- Prefer existing XMLUI rendering primitives, especially `NestedApp`; do not
  reimplement XMLUI rendering.
- Do not add iframe/URL mode in the first pass unless owner explicitly asks.
- Do not auto-switch to last-working when current fails. Show the current failure.
- Keep route/viewport controls as recipes unless they need component-owned behavior.
- Do not expand `XmluiBuilderFrame` beyond layout to make preview/code integration
  work; preview lifecycle stays in `XmluiPreviewPane` and generation/session state.
- When mining XMLUI Studio `XmluiPreview`, keep compile diagnostics, runtime error
  boundary behavior, sandbox globals, theme/tone forwarding, bounded scrolling,
  and warning reporting. Replace its silent `lastSuccessfulCode` fallback with
  explicit `selectedRevision` handling.

Recommended props:

```ts
code?: string;
lastWorkingCode?: string;
selectedRevision?: "current" | "lastWorking";
activeTheme?: string;
activeTone?: string;
showDiagnostics?: boolean;
```

Recommended value/event:

```ts
value: {
  status: "idle" | "compiling" | "ready" | "warning" | "error";
  selectedRevision: "current" | "lastWorking";
  diagnostics: XmluiValidationIssue[];
  runtimeError?: string;
};

onPreviewStateChange -> value
```

Example workspace recipe:

```xml
<Tabs>
  <TabItem label="Preview">
    <XmluiPreviewPane
      id="preview"
      code="{builder.value.code}"
      lastWorkingCode="{builder.value.lastWorkingCode}"
      selectedRevision="{builder.value.selectedPreviewRevision}"
      showDiagnostics="true"
      onPreviewStateChange="builder.setPreviewState($event)" />
  </TabItem>
  <TabItem label="Code">
    <XmluiCodeView
      code="{builder.value.selectedPreviewRevision === 'lastWorking'
        ? builder.value.lastWorkingCode
        : builder.value.code}" />
  </TabItem>
</Tabs>
```

Example frame usage:

```xml
<XmluiBuilderFrame
  layout="auto"
  activePanel="{workspace.value.activePanel}"
  onPanelChange="workspace.setActivePanel($event.panel)">
  <property name="chatTemplate">
    <Transcript thread="{agent}" />
  </property>
  <property name="composerTemplate">
    <Composer thread="{agent}" />
  </property>
  <property name="toolbarTemplate">
    <PreviewToolbar builder="{builder}" />
  </property>
  <property name="previewTemplate">
    <XmluiPreviewPane
      code="{builder.value.code}"
      lastWorkingCode="{builder.value.lastWorkingCode}"
      selectedRevision="{builder.value.selectedPreviewRevision}" />
  </property>
  <property name="codeTemplate">
    <XmluiCodeView
      code="{builder.value.selectedPreviewRevision === 'lastWorking'
        ? builder.value.lastWorkingCode
        : builder.value.code}" />
  </property>
</XmluiBuilderFrame>
```

Tests and checks:

- Preview tests for valid XMLUI, parse errors, runtime errors if practical, empty
  code, and revision selection.
- Visual smoke demo with current failure and last-working selection, both in the
  standalone workspace recipe and inside `XmluiBuilderFrame`.
- `npm --prefix packages/xmlui-ai-blocks run build:extension`

Exit criteria:

- The user can inspect broken generated code and manually switch to last-working.
- Preview status is available to XMLUI recipes through value/events.
- The existing `XmluiBuilderFrame` can host real preview and code surfaces without
  taking over preview revision state.

Owner questions before implementation:

- Should `XmluiPreviewPane` own uncontrolled revision selection when no
  `selectedRevision` prop is provided, or require the host/controller to own it?
- Should iframe/URL preview be explicitly deferred, or implemented behind
  `mode="url"` in the same component now?
- What should count as "last working": parse success, render success, or bridge
  accepted status?

### Phase 7: Recipes And Promotion Review

Goal: prove that the package stays composable by shipping recipes before promoting
more components.

Deliverables:

- Recipe XMLUI files for transcript, composer, run timeline, model selector,
  connection status, workspace panel, builder-frame usage, preview toolbar, and
  saved micro-app list.
- Fixture-backed demos for each recipe.
- Promotion review notes for each recipe.

Builder rules:

- Do not promote recipes during this phase unless every Promotion Gate condition is
  satisfied and the decision is documented.
- Saved micro-app list remains host-owned fake data. Do not add persistence APIs.
- Model selector remains `Select`/`Option` unless provider capability filtering is
  implemented for real.

Example recipe index:

```text
recipes/
  Transcript.xmlui
  Composer.xmlui
  RunTimeline.xmlui
  ModelSelector.xmlui
  ConnectionStatus.xmlui
  WorkspacePanel.xmlui
  BuilderFrame.xmlui
  PreviewToolbar.xmlui
  SavedMicroAppList.xmlui
```

Promotion review template:

```md
## Recipe: RunTimeline

- Duplicated in demos: 1
- Hard-to-compose concerns: disclosure only
- Host policy owned by recipe: no
- Recommendation: keep as recipe
```

Tests and checks:

- Recipe smoke tests or demo build checks.
- Approval callback payload tests if the recipe wires approval actions.
- `npm --prefix packages/xmlui-ai-blocks run build:demo`

Exit criteria:

- A host can compose a complete builder UI from recipes plus the small component set.
- Promotion decisions are explicit and conservative.

Owner questions before implementation:

- Which recipes should ship as public examples versus internal demos?
- Should recipe files live in `demo/`, `recipes/`, or docs-oriented examples?
- Is saved micro-app browsing important enough to include as a fake-data recipe now,
  or should it wait for persistence design?

### Phase 8: Demos

Goal: provide clear, fake-data demos that exercise the package integration paths
without requiring a bridge server or provider keys.

Deliverables:

- Demo 1: `AiThread` with recipe-composed chat.
- Demo 2: custom chat UI using only `AiThread.value` and APIs.
- Demo 3: XMLUI generation workspace with code view and preview.
- Demo 4: fake bridge event replay, including tool and approval flow.
- Demo 5: error and recovery scenario with current generation failing and
  last-working still available.

Builder rules:

- Demos must run without provider credentials, network calls, MCP, or a bridge.
- Keep demos small enough to read. Avoid a polished product shell.
- Prefer multiple focused demos over one giant builder app.

Example demo switcher:

```xml
<Tabs>
  <TabItem label="Thread">
    <DemoThread />
  </TabItem>
  <TabItem label="Custom UI">
    <DemoHeadlessCustom />
  </TabItem>
  <TabItem label="Generation">
    <DemoGenerationWorkspace />
  </TabItem>
  <TabItem label="Approvals">
    <DemoApprovalFlow />
  </TabItem>
</Tabs>
```

Tests and checks:

- `npm --prefix packages/xmlui-ai-blocks run build:demo`
- `npm --prefix packages/xmlui-ai-blocks run build:extension`
- Add smoke coverage if the package has an E2E harness by then.

Exit criteria:

- New adopters can see the headless, recipe-composed, generation, and approval
  integration paths without reading implementation internals.
- No demo requires secrets or a running server.

Owner questions before implementation:

- Should demos target the existing package demo app only, or should some become docs
  examples later?
- Should the first demo mimic A2XMLUI visually, or intentionally use a plain XMLUI
  layout to prove swappability?
- Which fake generated XMLUI examples best represent the intended host use cases:
  full app, dashboard fragment, CRM widget, or form-heavy workflow?

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
- Should `XmluiBuilderFrame` use named templates only, marker child components, or both for region placement?

## Testing Strategy

- Unit tests for event reducers and controller state transitions.
- Component tests for the AI-specific visual primitives: message parts, tool calls, approvals, code view, and preview.
- Component tests for `XmluiBuilderFrame` region detection, omitted regions, responsive layout modes, panel switching, resize behavior if enabled, and scroll containment.
- Recipe smoke tests for transcript, composer, session list, model picker, connection status, workspace panel, builder-frame usage, and preview toolbar.
- Accessibility checks for streaming transcript updates, composer controls, approvals, tool-call disclosure, code view, preview errors, and builder-frame panel navigation.
- Demo smoke tests using fake bridge events and no provider calls.
- No real provider calls in package tests.
