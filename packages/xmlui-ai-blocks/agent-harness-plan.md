# XMLUI AI Harness Plan

This is the overall three-tier plan for turning the A2XMLUI prototype into a reusable XMLUI AI app-building harness.

The core split:

- `xmlui`: shared contract and XMLUI-specific validation surface while the API incubates.
- `xmlui-ai-blocks`: client-side XMLUI components, headless controllers, visual blocks, preview/code surfaces, and transport/event reducers.
- `xmlui-ai-bridge`: trusted Node-side agent runtime for providers, tools, MCP, validation, repair, policy, approvals, logging, and streaming.

## Goal

Enable host apps to build AI-assisted XMLUI authoring experiences without accepting a fixed UI shell. A host should be able to compose chat/preview/session UI from XMLUI recipes, replace every visible component, or embed only the headless controller.

XMLUI's portability is a core advantage of this harness:

- Generated XMLUI can be embedded into many JavaScript environments, not only XMLUI-first apps.
- Preview/rendering does not have to depend on iframes; `NestedApp` can render inside a shadow DOM hosted by vanilla JavaScript, React, Svelte, or other clients.
- Host applications can keep their own shell, design system, auth, data, and deployment model while using XMLUI as the generated UI layer.
- The harness should therefore optimize for integration and portability, not for becoming a full IDE or general coding assistant.

The reusable product loop is:

1. User asks for a new XMLUI app or a modification.
2. Client sends an `AgentRequest` through a configured bridge endpoint.
3. Bridge calls models/tools under host policy.
4. Bridge validates and repairs generated XMLUI.
5. Bridge streams normalized `AgentEvent` objects.
6. Client applies events into thread/generation/preview state.
7. Host XMLUI markup renders chat, tools, approvals, generated-code status, code view, and preview.
8. Host may persist the accepted XMLUI micro-app for later reuse.

## Tier 1: Shared Contract In `xmlui`

The contract can live in `xmlui` initially because XMLUI is both the target language and the runtime medium. This avoids inventing a separate package before the shapes settle.

Shared responsibilities:

- Type definitions for messages, runs, tool calls, approvals, sessions, generated XMLUI, preview state, persistable micro-apps, requests, and events.
- XMLUI generation response envelope.
- Request directives such as `allowFullReplacement`, `allowMockData`, and future policy hints.
- Event names and payload schemas.
- Basic XMLUI generation validation helpers that are safe to share across client and server.

Initial shared shapes:

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

```ts
type RequestDirectives = {
  allowFullReplacement?: boolean;
  allowMockData?: boolean;
  approvalPolicy?: "default" | "strict" | "host-managed";
};
```

```ts
type XmluiAgentResponseEnvelope =
  | {
      kind: "code";
      operation: "create" | "modify";
      summary: string;
      code: string;
      metadata?: {
        title?: string;
        notes?: string[];
        changedFiles?: string[];
        componentsUsed?: string[];
        dataSourcesUsed?: string[];
        mcpEvidence?: Array<{ tool: string; query: string }>;
        assumptions?: string[];
      };
    }
  | {
      kind: "clarification";
      question: string;
      choices?: string[];
      reason?: string;
    };
```

Canonical event families:

- `run.*`
- `message.*`
- `tool.*`
- `approval.*`
- `artifact.*`
- `preview.*`
- `generation.*`
- `persistence.*`

### Persistable Micro-Apps

Generated XMLUI is interpreted source, so an accepted result can be stored and reused later. Persistence is host-owned because the host controls users, tenancy, auth, database schema, deployment, versioning, and lifecycle.

The shared contract should still make persistence easy by defining portable payloads and events:

- `XmluiMicroAppArtifact`: generated XMLUI source plus metadata such as title, summary, version, dependencies, theme expectations, created/updated timestamps, and provenance.
- `generation.accepted`: bridge/client event indicating that generated XMLUI passed validation and is suitable for saving.
- `persistence.requested`: optional client event asking the host to save, fork, publish, or update a stored micro-app.
- `persistence.completed` / `persistence.failed`: optional host events that let UI components show saved/reusable status.

The harness should not require a database, but it should make the save/reuse path explicit enough that a host can persist generated apps in SQL, document stores, local files, CMS records, CRM metadata, or any other app-owned storage.

## Tier 2: `xmlui-ai-blocks`

Client-side package.

Responsibilities:

- Render AI UI blocks.
- Provide headless controllers such as `AiThread`.
- Apply streamed contract events to browser state.
- Expose XMLUI-native `value`, APIs, events, and context variables.
- Render generated XMLUI preview and code view.
- Keep UI swappable.

Key components:

- `AiThread`
- `XmluiGenerationSession`
- `AiMessageParts`
- `AiToolCall`
- `AiApprovalRequest`
- `XmluiPreviewPane`
- `XmluiCodeView`

Recipe-first UI patterns:

- Transcript
- Composer
- Session list
- Model selector
- Connection status
- Run timeline
- Workspace panel
- Saved micro-app list

This package can perform client-side validation for fast feedback, but final acceptance of generated XMLUI belongs to the bridge.

## Tier 3: `xmlui-ai-bridge`

Trusted runtime package.

Responsibilities:

- Expose Node server/middleware helpers.
- Keep provider credentials server-side.
- Call model providers and model gateways.
- Attach XMLUI MCP tools and curated public API discovery.
- Run system prompt/ruleset.
- Parse model responses.
- Validate and repair generated XMLUI.
- Enforce approval policy.
- Stream normalized contract events.
- Log diagnostics and usage.

Reference source material:

- `D:\Projects\albacrm\a2xmlui\src\agent\chatEndpoint.ts`
- `D:\Projects\albacrm\a2xmlui\scripts\chat-server.mjs`
- `D:\Projects\albacrm\a2xmlui\src\agent\toolSelection.ts`
- `D:\Projects\albacrm\a2xmlui\src\agent\providerSelection.ts`
- `D:\Projects\albacrm\a2xmlui\src\agent\chatRequestOptimization.ts`
- `D:\Projects\albacrm\a2xmlui\docs\portable-agent-runtime.md`
- `D:\Projects\albacrm\a2xmlui\docs\xmlui-generation-hardening.md`

## Data Flow

```text
Host XMLUI app
  -> xmlui-ai-blocks headless controller
  -> AgentRequest
  -> xmlui-ai-bridge endpoint
  -> provider + tools + MCP + policy
  -> validation + repair
  -> AgentEvent stream
  -> xmlui-ai-blocks reducers
  -> host XMLUI markup renders any UI
```

## Extraction Order

### Step 1: Contract Draft

- Add contract types under `xmlui` in an incubating namespace.
- Port the A2XMLUI XMLUI response envelope.
- Define normalized events.
- Add tests for validation helpers and envelope parsing.

### Step 2: Client Harness

- Rework `xmlui-ai-blocks` around `AiThread`.
- Add `AiMessageParts`, tool-call, and approval primitives.
- Port generated-code state from A2XMLUI `AgentChat`.
- Port `XmluiPreviewPane` and `XmluiCodeView`.
- Build demos with fake bridge events.

### Step 3: Runtime Bridge

- Create `xmlui-ai-bridge`.
- Extract the A2XMLUI Node backend.
- Replace app-specific contracts with shared XMLUI contract types.
- Add fake provider tests.
- Provide standalone server and Vite middleware recipes.

### Step 4: Validation Hardening

- Move final XMLUI validation and repair into the bridge.
- Keep optional client validation for responsiveness.
- Add metadata fields for components, DataSources, MCP evidence, and assumptions.
- Reject or repair high-risk invalid output before streaming success.

### Step 5: Approvals And Tools

- Define policy defaults.
- Add approval events.
- Add approval UI blocks.
- Add server-side enforcement in the bridge.
- Add timeline recipes and tool/approval views.

### Step 6: Product Recipes

- Document three integration paths:
  - full bundled UI,
  - headless controller with custom UI,
  - host-owned bridge with custom provider/tools.
- Keep A2XMLUI as a proving app, not the package boundary.

## Success Criteria

- A host app can use `xmlui-ai-blocks` without `xmlui-ai-bridge` by feeding fake or custom events.
- A host app can use `xmlui-ai-bridge` without accepting a fixed chat UI.
- Generated XMLUI can be validated and repaired server-side before becoming accepted output.
- Accepted XMLUI micro-apps can be represented as persistable micro-app payloads without requiring a specific database or storage layer.
- Chat, sessions, preview, code, approvals, and saved micro-app browsing are independently replaceable.
- Provider secrets and MCP/process access never move into browser components.

## Open Decisions

- Exact location and naming of shared contract exports inside `xmlui`.
- Whether normalized contract streams replace AI SDK UI streams immediately or sit beside them.
- Whether `XmluiGenerationSession` is separate from `AiThread`.
- Whether `xmlui-ai-bridge` ships a CLI executable.
- Persistence strategy for sessions and generated XMLUI micro-apps.
- What metadata is required for a saved micro-app: title, description, schema version, dependencies, theme, permissions, source app, creator, and validation status?
- Should persistence events represent `save`, `fork`, `publish`, `restore`, and `archive`, or should those remain host-specific actions?
- Should stored micro-apps be immutable versioned records, mutable records, or both?
