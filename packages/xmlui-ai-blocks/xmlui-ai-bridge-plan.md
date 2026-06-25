# xmlui-ai-bridge Plan

`xmlui-ai-bridge` is the trusted agent runtime package. It provides the Node-side bridge between XMLUI builder clients and AI providers, tools, MCP servers, validation, repair, policy, logging, and streaming.

The near-term source material is `D:\Projects\albacrm\a2xmlui`, especially `src/agent/chatEndpoint.ts`, `scripts/chat-server.mjs`, and the contract helpers in `src/agent/xmluiAgentContract.ts`.

Related plans:

- [agent-harness-plan.md](./agent-harness-plan.md): overall contract and three-tier architecture.
- [plan.md](./plan.md): client-side `xmlui-ai-blocks` plan.

## Package Boundary

This package contains:

- Node server helpers and middleware for an agent endpoint.
- Provider adapters for OpenAI, Anthropic, and host-provided gateways.
- XMLUI generation system prompt/ruleset.
- XMLUI response parsing, validation, repair, and result normalization.
- MCP/tool wiring, including XMLUI documentation/tools and curated public API discovery.
- Policy and approval decisions for sensitive operations.
- Usage logging, diagnostics, and runtime health checks.
- Streaming response conversion into the shared contract.

This package does not contain:

- XMLUI visual components.
- Browser-only UI state.
- Host application shell layout.
- User secrets in client code.
- Provider-specific UI assumptions.

## Relationship To A2XMLUI

Candidate runtime pieces to move or redesign:

- `src/agent/chatEndpoint.ts`: reference endpoint responder, provider selection, AI SDK streaming, MCP tool setup, public API discovery.
- `scripts/chat-server.mjs`: standalone local development HTTP wrapper.
- `src/agent/providerSelection.ts`: provider/model/env normalization.
- `src/agent/toolSelection.ts`: XMLUI MCP tool selection and initial tool-use heuristics.
- `src/agent/chatRequestOptimization.ts`: message compaction.
- `src/agent/usageLogging.ts`: runtime usage logs.
- `src/agent/diagnosticsLog.ts`: diagnostic sink.
- `src/agent/xmluiAgentContract.ts`: XMLUI response envelope and validation rules, after shared contract types are moved into `xmlui`.

The bridge should start as a reusable version of the A2XMLUI backend, not as a large agent framework.

Persistence note: accepted generated XMLUI should be emitted as a persistable micro-app artifact, but durable storage remains host-owned. The bridge can provide payloads and optional callbacks; it should not require a particular database.

## Trusted Responsibilities

### Provider Calls

- Keep provider credentials server-side.
- Support OpenAI and Anthropic first, matching A2XMLUI behavior.
- Allow hosts to inject custom provider/model factories.
- Normalize provider/model selection into shared contract fields.

### Tool And MCP Access

- Start XMLUI MCP tools through Node when configured.
- Select XMLUI documentation/example/search tools based on prompt intent.
- Include public API discovery for DataSource generation.
- Keep browser clients unaware of stdio/process details.

### XMLUI Generation Rules

- Provide the XMLUI app-building system prompt.
- Require structured response envelopes.
- Encourage MCP-backed component and API decisions.
- Keep A2XMLUI hardening rules, but remove app-specific naming.

### Validation And Repair

- Parse model responses into shared XMLUI response envelopes.
- Validate generated XMLUI root shape, raw HTML tags, aliases, DataSource pitfalls, and resultSelector mistakes.
- Compile generated XMLUI server-side when XMLUI runtime is available.
- Run one or two hidden repair turns with exact validation/compile errors.
- Return only a compiled app, a clarification, or a structured failure.
- Emit accepted generated XMLUI as a persistable artifact that hosts may save for later reuse.

### Policy And Approval

- Classify sensitive operations such as file writes, command execution, external network calls, preview server changes, and destructive actions.
- Emit `approval.requested` events when policy requires user consent.
- Consume `approval.resolved` decisions from the client.
- Keep final enforcement in the bridge, not in UI components.

### Streaming And Events

- Accept the shared `AgentRequest`.
- Stream shared `AgentEvent` objects.
- Optionally support AI SDK UI message streams through an adapter while the contract settles.
- Include run, message, tool, approval, artifact, preview, completion, and failure events.

## Initial Endpoint Shape

```ts
type AgentRequest = {
  threadId?: string;
  sessionId?: string;
  messages: AiMessage[];
  currentCode?: string;
  selectedProvider?: string;
  selectedModel?: string;
  requestDirectives?: RequestDirectives;
  context?: Record<string, unknown>;
};
```

Response should be a stream of normalized events:

```ts
type AgentEvent =
  | { type: "run.started"; runId: string }
  | { type: "message.created"; runId: string; message: AiMessage }
  | { type: "message.delta"; runId: string; messageId: string; delta: string }
  | { type: "tool.started"; runId: string; toolCall: AiToolCall }
  | { type: "tool.completed"; runId: string; toolCallId: string; result?: unknown }
  | { type: "approval.requested"; runId: string; request: AiApprovalRequest }
  | { type: "artifact.created"; runId: string; artifact: AiArtifact }
  | { type: "generation.accepted"; runId: string; artifact: XmluiMicroAppArtifact }
  | { type: "preview.updated"; runId: string; preview: XmluiPreviewState }
  | { type: "run.completed"; runId: string }
  | { type: "run.failed"; runId: string; error: string };
```

## Implementation Phases

### Phase 1: Extract Reference Runtime

- Create the package skeleton when ready.
- Move or copy A2XMLUI backend code behind clean exports.
- Preserve the standalone Node server wrapper.
- Keep OpenAI/Anthropic support and environment-based configuration.
- Add fake-provider mode for tests.

### Phase 2: Shared Contract Integration

- Replace A2XMLUI-specific request/response types with shared contract types from `xmlui`.
- Add event stream helpers.
- Add adapter support for AI SDK UI messages if needed by early clients.
- Add contract tests for request parsing and event serialization.

### Phase 3: Validation And Repair

- Move XMLUI response parsing and validation into bridge utilities.
- Add server-side XMLUI compile validation.
- Implement hidden repair turns with bounded retries.
- Return structured failure events when repair is exhausted.
- Add regression tests for known bad XMLUI samples.

### Phase 4: Tool Provider Abstraction

- Extract `AgentToolProvider`.
- Implement Node XMLUI MCP provider.
- Implement curated public API discovery provider.
- Allow hosts to add or remove tools by policy.
- Log selected tools per run.

### Phase 5: Policy And Approvals

- Define approval policy inputs and defaults.
- Emit approval requests for sensitive operations.
- Add approval resolution endpoint/helper.
- Keep enforcement server-side even when UI hides or customizes approvals.

### Phase 6: Host Recipes

- Provide local Node server recipe.
- Provide Vite middleware recipe.
- Provide Tauri sidecar/command notes.
- Provide hosted API/serverless notes if feasible.
- Document how `xmlui-ai-blocks` connects to the bridge.

## Open Questions

- Should the bridge stream only normalized events, or keep first-class AI SDK stream compatibility?
- Should XMLUI compile validation use `xmlui` directly in Node, or a smaller validation package?
- How should long-lived sessions and artifacts be stored: host-owned callbacks, filesystem, or in-memory demo store?
- Should the bridge expose persistence callbacks for accepted micro-apps, or only emit artifacts and let the host save them?
- What validation/provenance metadata should be attached before a host persists generated XMLUI?
- How much provider selection belongs in the bridge versus host configuration?
- Should `xmlui-ai-bridge` include an executable CLI, or only library/server helpers?

## Testing Strategy

- Node tests for provider selection, request validation, contract events, parsing, and repair.
- Fake model tests for successful code, clarification, invalid code, repair success, and repair failure.
- Tool-selection tests with mocked MCP tools.
- Policy tests for approval-required operations.
- No tests that require real provider keys by default.
