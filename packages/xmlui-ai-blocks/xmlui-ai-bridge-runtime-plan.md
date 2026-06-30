# XMLUI AI Bridge Runtime Plan

`xmlui-ai-bridge` is the trusted Node-side agent runtime. It turns host requests
into model/tool work, validates generated XMLUI, repairs failures, and streams
normalized `AgentEvent` objects to `xmlui-ai-blocks`.

## Goal

Create a small, testable Node runtime with a local server. The first useful
vertical slice is validation and repair, not a broad agent framework.

## Contract

The bridge accepts `AgentRequest` and streams only normalized `AgentEvent`
objects. The shared types live in `xmlui` for now.

No AI SDK UI-message stream is part of the public bridge contract.

Core event families:

- `run.updated`
- `message.updated`
- `message.delta`
- `tool.updated`
- `approval.updated`
- `generation.updated`
- `error`

## Module Shape

Design each bridge area as a deep module with a small interface. Adapters sit
behind those interfaces where behavior varies.

### Runtime Endpoint

Responsibilities:

- parse incoming `AgentRequest`
- create a run
- invoke generation workflow
- stream `AgentEvent` objects
- expose a local HTTP server

Initial exports:

```ts
createAgentHandler(options): RequestHandler;
createLocalServer(options): Promise<ServerHandle>;
```

### Event Stream

Responsibilities:

- serialize normalized events
- support local tests without HTTP
- support HTTP streaming for the local server
- keep ordering deterministic in fake-model tests

### Model Communication

Responsibilities:

- wrap AI SDK provider calls
- support OpenAI and Anthropic later
- support a deterministic fake model first
- expose no provider-specific UI state

Initial adapters:

- `FakeModelAdapter`
- `AiSdkModelAdapter`

Default tests use only `FakeModelAdapter`.

### Prompt And Context

Responsibilities:

- assemble system prompt and user context
- include current XMLUI code
- include host entities
- include host styling/theme information
- include MCP-backed evidence when available
- compact conversation history

Initial context sources:

- MCP
- host entities
- host styling

### Tool Providers

Responsibilities:

- provide XMLUI MCP tools
- provide host tools
- provide curated public API discovery later if still useful
- log selected tools

Initial interface:

```ts
type AgentToolProvider = {
  getTools(context: AgentContext): Promise<Record<string, unknown>>;
};
```

Adapters:

- `XmluiMcpToolProvider`
- `HostToolProvider`
- `NoopToolProvider`

### XMLUI Validation

Responsibilities:

- parse structured model responses
- validate XMLUI envelope shape
- compile generated XMLUI when the runtime is available
- reject raw HTML tags and invented component names
- validate known DataSource pitfalls
- return precise diagnostics for repair

Initial validation gates:

- complete `<App>...</App>` source
- balanced XMLUI tags
- no raw HTML tags
- no known invalid component aliases
- known component names or locally defined components
- safe `DataSource` patterns where practical
- no obvious truncated output

### Repair Orchestrator

Responsibilities:

- run one or two hidden repair turns
- feed exact validation/compile diagnostics back to the model
- stream `generation.updated` with `status: "repairing"`
- return accepted code, clarification, or structured failure

The generated UI should not be presented as ready until validation and repair
complete successfully.

### Policy And Approvals

Responsibilities:

- classify sensitive operations
- emit approval requests when needed
- consume approve/reject decisions
- enforce final policy server-side

First pass:

- approve/reject only
- no editable approval payloads
- no browser-side policy enforcement

### Logging And Diagnostics

Responsibilities:

- structured run logs
- provider/model/tool usage
- validation and repair diagnostics
- no secrets in logs

### Evaluation

Responsibilities:

- deterministic fixtures
- generated XMLUI sanity checks
- repair success/failure scenarios
- later model quality evaluations

## First Vertical Slice

Build validation and repair end to end with a fake model and local server.

Flow:

1. Local server receives `AgentRequest`.
2. Fake model returns an invalid XMLUI envelope.
3. Bridge parses the envelope.
4. Validator returns diagnostics.
5. Bridge streams `generation.updated` with `status: "repairing"`.
6. Fake model returns repaired XMLUI.
7. Validator accepts it.
8. Bridge streams accepted `generation.updated` and final run/message events.

Exit criteria:

- No provider key is needed.
- Tests verify successful repair and exhausted repair failure.
- Local server can be consumed by `AiThread` fixture/integration tests.
- The stream uses only normalized `AgentEvent` objects.

## Implementation Phases

### Phase 1: Package And Local Server

- create `packages/xmlui-ai-bridge`
- add local server entry point
- add request parsing
- add event stream helper
- add fake model adapter
- add contract serialization tests

### Phase 2: Validation

- port and clean up useful A2XMLUI validation samples
- validate XMLUI envelopes and code
- compile XMLUI in Node where available
- add regression fixtures for known bad outputs

### Phase 3: Repair

- implement bounded repair loop
- stream progress events
- test repair success, repair failure, clarification, and invalid response

### Phase 4: Context And MCP

- add context assembly for MCP, host entities, and host styling
- add MCP tool provider adapter
- keep tool selection deterministic and testable

### Phase 5: Real Provider Adapter

- add AI SDK adapter for OpenAI/Anthropic
- keep fake model as the default test path
- add opt-in smoke command for real providers

### Phase 6: Policy And Approvals

- add policy classifier
- emit approval events
- add approval resolution helper
- enforce decisions in the bridge

## Test Strategy

Default tests:

- request parsing
- event serialization
- fake model workflow
- response parsing
- XMLUI validation samples
- repair success
- repair exhausted
- tool-provider selection with mocks
- approval policy classification
- local server smoke with fake model

Generated XMLUI sanity checks:

- code parses as XMLUI
- root is `<App>`
- no raw HTML tags
- no invented component names
- DataSource patterns pass known guard checks
- accepted output is the only output marked ready

Opt-in tests:

- real provider smoke
- live MCP integration
- model quality evaluations

## Evaluation Notes

Start with small deterministic suites:

- dashboard generation
- form generation
- live data request requiring clarification
- host-entity CRUD UI
- host-styling alignment
- invalid first response repaired successfully
- invalid first response fails after repair budget

Track:

- accepted on first pass
- accepted after repair
- failed with useful diagnostics
- clarification correctness
- invalid component rate
- DataSource pitfall rate
- token usage when real providers are enabled

## Deferred

- persistence and saved micro-app artifacts
- AI SDK UI-message compatibility
- browser provider calls
- editable code workflows
- multi-file app generation
- hosted deployment recipes beyond local server

