# xmlui-ai-blocks Implementation Plan

`xmlui-ai-blocks` will provide the UI and orchestration primitives for building AI-assisted XMLUI authoring tools: chat clients, project copilots, model pickers, run logs, artifact previews, and approval flows. The package should stay provider-neutral at the component layer while allowing apps to connect their own subscription, API gateway, or local agent runtime.

The initial package intentionally ships only one placeholder component, `AiConversation`. It is a visual anchor for demos and early layout work, not a production AI client.

## Product Shape

The target application is an XMLUI app-building agent with three major panes:

- Sessions panel: lists projects, conversations, branches, or tasks.
- Chat panel: sends user instructions, streams assistant responses, shows tool calls, and collects approvals.
- Preview pane: renders the XMLUI app currently being built and exposes refresh, route, viewport, and inspection controls.

The extension should make these panes easy to compose without forcing a single application shell. Apps may use the blocks as a full client, a narrow embedded assistant, or a project-specific command surface.

## Design Principles

- Provider-neutral: components should not bake in OpenAI, Anthropic, local, or custom gateway specifics.
- App-owned secrets: API keys and subscription tokens should be handled by the host app or backend, not stored inside visual components.
- Streaming-first: message rendering, response state, and tool-call surfaces should assume partial output.
- Inspectable operations: every model call, tool call, file change, command, and preview update should have a visible status.
- XMLUI-native data flow: components expose state, events, and APIs that work naturally with `bindTo`, `DataSource`, `APICall`, and expression bindings.
- Safe by default: destructive operations, external commands, and file writes should be represented as approval requests unless the host app explicitly configures otherwise.

## Placeholder Component

### `AiConversation`

Current status: implemented as a placeholder.

Role:
- Provides a stable visual target for app shell layouts.
- Displays title, provider, model, status, empty chat area, and disabled composer.
- Lets early demos look like the intended chat panel while the real primitives are designed.

Planned evolution:
- Either become the high-level composed chat surface, or remain as a demo wrapper around lower-level blocks such as `AiThread`, `AiMessageList`, and `AiComposer`.

## Planned Components

### Connection And Model Selection

#### `AiProviderConfig`

Non-visual or minimally visual component that describes available providers and connection modes.

Responsibilities:
- Register provider labels, supported auth modes, model catalogs, default model, and feature flags.
- Accept static config or load config from a host-provided endpoint.
- Expose provider availability and selected provider state to children.

Important props:
- `providers`
- `selectedProvider`
- `modelCatalog`
- `capabilities`
- `authMode`

Events:
- `didSelectProvider`
- `didLoadCatalog`
- `didFailConnection`

#### `AiModelSelect`

Model picker with provider-aware grouping and capability hints.

Responsibilities:
- Display models grouped by provider or family.
- Show context window, pricing tier labels, tool-use support, vision support, and reasoning mode.
- Emit selected provider and model.

Important props:
- `providers`
- `models`
- `value`
- `showCapabilities`
- `filterByCapability`

Events:
- `didChange`

APIs:
- `setValue(provider, model)`
- `focus()`

#### `AiConnectionStatus`

Compact status indicator for subscription, provider gateway, or local agent availability.

Responsibilities:
- Show disconnected, connecting, ready, rate-limited, degraded, or error states.
- Provide optional retry action.

Important props:
- `state`
- `message`
- `lastCheckedAt`

Events:
- `retry`

### Conversation

#### `AiThread`

Stateful conversation container that coordinates messages, selected model, request state, streaming state, and tool calls.

Responsibilities:
- Hold the canonical thread state.
- Provide context variables to children, including current messages, active run, selected provider, selected model, and pending approvals.
- Connect visual blocks to host-provided send/cancel/resume functions.

Important props:
- `threadId`
- `messages`
- `provider`
- `model`
- `temperature`
- `systemPrompt`
- `sendAction`
- `cancelAction`
- `resumeAction`
- `stream`

Events:
- `didStartRun`
- `didReceiveDelta`
- `didReceiveMessage`
- `didFinishRun`
- `didFailRun`
- `didRequestApproval`

Context variables:
- `$thread`
- `$messages`
- `$activeRun`
- `$provider`
- `$model`
- `$isRunning`
- `$pendingApprovals`

APIs:
- `send(message)`
- `cancel()`
- `appendMessage(message)`
- `setMessages(messages)`
- `clear()`

#### `AiMessageList`

Scrollable transcript renderer.

Responsibilities:
- Render user, assistant, system, tool, and approval messages.
- Support streaming text, markdown, code blocks, diffs, citations, and hidden reasoning summaries if the host exposes them.
- Auto-scroll while respecting manual scroll position.

Important props:
- `messages`
- `streamingMessage`
- `emptyText`
- `showToolCalls`
- `showTimestamps`

Events:
- `didSelectMessage`
- `didCopyMessage`
- `didRetryMessage`

#### `AiMessage`

Single message renderer for advanced customization.

Responsibilities:
- Render role, avatar, content, metadata, status, and actions.
- Allow templated content for custom transcript layouts.

Important props:
- `message`
- `role`
- `status`
- `parts`

Events:
- `retry`
- `copy`
- `inspect`

#### `AiComposer`

Prompt input with send controls.

Responsibilities:
- Multi-line text entry.
- Optional attachments.
- Submit on configured keyboard gesture.
- Disable or switch to cancel mode while a run is active.

Important props:
- `value`
- `placeholder`
- `disabled`
- `running`
- `attachments`
- `submitShortcut`

Events:
- `didChange`
- `send`
- `cancel`
- `attach`

APIs:
- `focus()`
- `setValue(value)`
- `clear()`

### Sessions

#### `AiSessionList`

Conversation/project/session navigator.

Responsibilities:
- Display sessions with title, status, last message, last update, model, branch, or project path.
- Support selected session, pinned sessions, search, and grouping.

Important props:
- `sessions`
- `selectedSessionId`
- `groupBy`
- `searchable`

Events:
- `didSelectSession`
- `didCreateSession`
- `didRenameSession`
- `didDeleteSession`
- `didArchiveSession`

#### `AiSessionItem`

Template-friendly row renderer for custom session lists.

Responsibilities:
- Render status, title, subtitle, unread/run indicators, and quick actions.

### Tool Calls And Approvals

#### `AiToolCallList`

Timeline of tool calls issued by the agent.

Responsibilities:
- Show command/file/API/browser/preview operations.
- Represent queued, running, succeeded, failed, skipped, and awaiting-approval states.
- Group related calls under an assistant response.

Important props:
- `toolCalls`
- `compact`
- `groupByRun`

Events:
- `inspect`
- `approve`
- `reject`
- `retry`

#### `AiToolCall`

Single tool-call renderer.

Responsibilities:
- Display tool name, arguments summary, result summary, duration, and error details.
- Defer full raw payloads to an inspect action.

#### `AiApprovalRequest`

Explicit approval UI for sensitive actions.

Responsibilities:
- Render the requested action, risk summary, affected files, and available decisions.
- Provide approve/reject/edit controls.

Important props:
- `request`
- `mode`
- `expiresAt`

Events:
- `approve`
- `reject`
- `edit`

### XMLUI App Preview

#### `XmluiPreviewPane`

Preview surface for the app being built.

Responsibilities:
- Render an iframe, local preview route, or host-provided preview target.
- Provide refresh, hard reload, viewport selection, route selection, zoom, and open-external actions.
- Surface build/runtime errors.

Important props:
- `src`
- `route`
- `viewport`
- `zoom`
- `status`
- `errors`

Events:
- `refresh`
- `routeChange`
- `viewportChange`
- `openExternal`

APIs:
- `refresh()`
- `setRoute(route)`
- `setViewport(viewport)`

#### `XmluiPreviewToolbar`

Toolbar for preview controls that can be placed inside or outside `XmluiPreviewPane`.

Responsibilities:
- Viewport presets.
- Route picker.
- Reload controls.
- Error badge.

### Artifacts And Project State

#### `AiArtifactPanel`

Displays files, patches, screenshots, command outputs, generated docs, and structured artifacts produced by the agent.

Responsibilities:
- List artifacts by run or session.
- Preview text, markdown, image, diff, and JSON artifacts.
- Emit open/apply/revert/download actions.

#### `AiPatchViewer`

Diff-focused viewer for pending or applied file changes.

Responsibilities:
- Show changed files.
- Show additions/deletions.
- Support approve/reject/apply per file or hunk when the host supports it.

#### `AiRunTimeline`

Operational timeline for a single agent run.

Responsibilities:
- Combine assistant text, tool calls, approvals, file changes, commands, and preview updates into a chronological view.

## Host Integration Model

The package should not directly own provider credentials. A host XMLUI app should be able to connect these blocks through one of three patterns:

1. Backend proxy: XMLUI app calls its own backend, which handles provider credentials and streams events.
2. Local agent bridge: XMLUI app talks to a local service that can read/write the project and manage preview servers.
3. Bring-your-own callbacks: advanced host apps provide `sendAction`, `cancelAction`, and event handlers directly.

For streaming, prefer a normalized event format:

```json
{
  "type": "message.delta",
  "runId": "run_123",
  "messageId": "msg_456",
  "delta": "Create a Stack with..."
}
```

Recommended event types:

- `run.started`
- `message.created`
- `message.delta`
- `message.completed`
- `tool.started`
- `tool.delta`
- `tool.completed`
- `tool.failed`
- `approval.requested`
- `approval.resolved`
- `artifact.created`
- `preview.updated`
- `run.completed`
- `run.failed`

## Suggested Data Shapes

### Message

```json
{
  "id": "msg_1",
  "role": "assistant",
  "status": "completed",
  "createdAt": "2026-05-13T10:00:00Z",
  "parts": [
    { "type": "text", "text": "I created the first XMLUI screen." },
    { "type": "artifactRef", "artifactId": "artifact_1" }
  ]
}
```

### Session

```json
{
  "id": "session_1",
  "title": "Inventory dashboard",
  "projectPath": "/work/inventory-app",
  "selectedModel": "gpt-5.2",
  "status": "idle",
  "updatedAt": "2026-05-13T10:00:00Z"
}
```

### Tool Call

```json
{
  "id": "tool_1",
  "runId": "run_1",
  "kind": "file.write",
  "title": "Update Main.xmlui",
  "status": "awaitingApproval",
  "summary": "Write the app shell layout.",
  "affectedFiles": ["Main.xmlui"]
}
```

## XMLUI Markup Snippets

### Current Placeholder In A Three-Pane Agent App

```xml
<HStack height="100vh" gap="0">
  <VStack width="280px" borderRight="1px solid $borderColor" padding="0.75rem">
    <Text variant="strong">Sessions</Text>
    <List data="{sessions}">
      <Text>{$item.title}</Text>
    </List>
  </VStack>

  <VStack width="minmax(420px, 1fr)" padding="1rem">
    <AiConversation
      title="XMLUI app builder"
      provider="{selectedProvider}"
      model="{selectedModel}"
      status="Planning"
      placeholder="Ask the assistant to create or modify the XMLUI app."
    />
  </VStack>

  <VStack width="42vw" borderLeft="1px solid $borderColor">
    <Text padding="0.75rem" variant="strong">Preview</Text>
    <iframe src="{previewUrl}" style="width: 100%; height: 100%; border: 0" />
  </VStack>
</HStack>
```

### Future Composed Conversation

```xml
<AiThread
  id="thread"
  threadId="{selectedSession.id}"
  provider="{selectedProvider}"
  model="{selectedModel}"
  messages="{messages}"
  sendAction="/api/agent/send"
  cancelAction="/api/agent/cancel"
  onDidReceiveMessage="messages = [...messages, $event.message]"
>
  <AiMessageList messages="{thread.messages}" showToolCalls="true" />

  <AiComposer
    placeholder="Describe the XMLUI app you want to build..."
    running="{thread.isRunning}"
    onSend="thread.send($event.text)"
    onCancel="thread.cancel()"
  />
</AiThread>
```

### Future Provider And Model Selection

```xml
<HStack verticalAlignment="center" gap="0.5rem">
  <AiConnectionStatus state="{connection.state}" message="{connection.message}" onRetry="checkConnection()" />

  <AiModelSelect
    providers="{providers}"
    models="{models}"
    value="{selectedModel}"
    showCapabilities="true"
    onDidChange="
      selectedProvider = $event.provider;
      selectedModel = $event.model;
    "
  />
</HStack>
```

### Future Sessions Plus Chat Plus Preview Layout

```xml
<HStack height="100vh" gap="0">
  <AiSessionList
    width="300px"
    sessions="{sessions}"
    selectedSessionId="{selectedSessionId}"
    searchable="true"
    onDidSelectSession="selectedSessionId = $event.sessionId"
    onDidCreateSession="createSession()"
  />

  <VStack width="1fr">
    <AiThread
      id="agent"
      threadId="{selectedSessionId}"
      provider="{selectedProvider}"
      model="{selectedModel}"
      messages="{messages}"
      sendAction="/api/agent/send"
      cancelAction="/api/agent/cancel"
    >
      <AiRunTimeline run="{agent.activeRun}" />
      <AiMessageList messages="{agent.messages}" />
      <AiComposer running="{agent.isRunning}" onSend="agent.send($event.text)" />
    </AiThread>
  </VStack>

  <XmluiPreviewPane
    width="44vw"
    src="{preview.src}"
    route="{preview.route}"
    viewport="{preview.viewport}"
    status="{preview.status}"
    errors="{preview.errors}"
    onRefresh="refreshPreview()"
  />
</HStack>
```

### Future Approval Flow

```xml
<VStack>
  <AiToolCallList
    toolCalls="{agent.activeRun.toolCalls}"
    onInspect="selectedToolCall = $event.toolCall"
    onApprove="resolveApproval($event.toolCall.id, 'approve')"
    onReject="resolveApproval($event.toolCall.id, 'reject')"
  />

  <ModalDialog when="{agent.pendingApprovals.length > 0}">
    <AiApprovalRequest
      request="{agent.pendingApprovals[0]}"
      onApprove="agent.approve($event.requestId)"
      onReject="agent.reject($event.requestId)"
      onEdit="agent.editApproval($event.requestId, $event.patch)"
    />
  </ModalDialog>
</VStack>
```

## Implementation Phases

### Phase 1: Package Foundation

- Keep `AiConversation` as the placeholder.
- Build metadata and theme variable support.
- Add demo markup that resembles the future three-pane app.
- Validate extension build and metadata build.

### Phase 2: Stateless Visual Blocks

- Implement `AiMessage`, `AiMessageList`, `AiComposer`, `AiModelSelect`, `AiConnectionStatus`, and `AiSessionList`.
- Keep data and events host-owned.
- Add focused unit and component tests for rendering, accessibility, keyboard behavior, and event payloads.

### Phase 3: Conversation State Container

- Implement `AiThread`.
- Normalize message/run/tool-call state.
- Support streaming event application.
- Expose component APIs for `send`, `cancel`, `appendMessage`, and `clear`.

### Phase 4: Tools, Approvals, And Artifacts

- Implement `AiToolCallList`, `AiToolCall`, `AiApprovalRequest`, `AiArtifactPanel`, and `AiPatchViewer`.
- Define event payload contracts for approvals and artifact actions.
- Add snapshot-like tests for event normalization and edge states.

### Phase 5: XMLUI Preview Blocks

- Implement `XmluiPreviewPane` and `XmluiPreviewToolbar`.
- Support iframe preview, viewport presets, route changes, refresh APIs, and error display.
- Add Playwright coverage for responsive preview controls.

### Phase 6: Provider Adapters Or Recipes

- Decide whether provider-specific wiring belongs in this package or in separate packages such as `xmlui-ai-openai`.
- Provide recipes for backend proxy, local agent bridge, and custom callback integration.

## Open Questions

- Should `AiThread` own network streaming, or should it only consume normalized events supplied by a host `DataSource` or callback?
- Should model catalogs be static props, extension functions, or fetched through `DataSource`?
- How should XMLUI represent streaming server-sent events in markup-friendly APIs?
- Should preview controls be generic iframe blocks or XMLUI-specific app preview blocks?
- What is the minimum approval model needed for file writes and command execution?
- Should tool-call payloads be fully visible by default, or hidden behind inspection controls?

## Testing Strategy

- Unit tests for pure event normalization and reducers.
- Component tests for keyboard navigation, focus management, empty/error/loading states, and event payloads.
- Accessibility checks for message lists, model selection, session navigation, composer, and approval dialogs.
- Demo app smoke tests that compose sessions, chat, and preview panes.
- Provider integration tests should use fake local endpoints rather than real AI provider calls.
