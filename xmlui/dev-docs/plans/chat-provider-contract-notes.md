# XMLUI AI Chat Provider Prototype Plan

**Status:** Draft prototype plan  
**Target package:** `packages/xmlui-ai-chat` or the chat subset of `packages/xmlui-ai-blocks`  
**Primary dependency:** Vercel AI SDK, isolated behind an internal adapter  
**Goal:** scaffold a small XMLUI extension that provides chat state, transport, provider configuration, and streaming message rendering while leaving the rest of the UI to ordinary XMLUI components.

## 1. Product Goal

Build the thinnest useful XMLUI chat extension:

- `ChatProvider` owns transport, model selection, orchestration, messages, streaming state, errors, and a `$chat` API.
- `ChatAdapter` declares provider/model defaults and safe generation options.
- `ChatMessages` renders message history and streaming text with templates.

Everything else should be composed from existing XMLUI components such as `TextArea`, `Button`, `Select`, `Markdown`, `Card`, `Spinner`, `Text`, `HStack`, and `VStack`.

```xml
<App var.prompt="">
  <ChatProvider id="assistant" endpoint="/api/chat">
    <ChatAdapter provider="ollama" model="qwen3:4b" />

    <VStack gap="$space-3">
      <ChatMessages>
        <property name="messageTemplate">
          <Card>
            <Text variant="strong">{$message.role}</Text>
            <Markdown value="{$message.content}" />
          </Card>
        </property>
      </ChatMessages>

      <Text visible="{$status === 'streaming'}">Thinking...</Text>
      <Text visible="{$error}" color="$color-danger">{$error.message}</Text>

      <HStack gap="$space-2">
        <TextArea
          id="promptBox"
          initialValue="{prompt}"
          placeholder="Ask about this customer..."
          enabled="{$status !== 'submitted' && $status !== 'streaming'}"
          onDidChange="prompt = $value"
        />
        <Button
          label="Send"
          enabled="{prompt && $status !== 'submitted' && $status !== 'streaming'}"
          onClick="
            $chat.send(prompt);
            prompt = '';
            promptBox.setValue('');
          "
        />
        <Button
          label="Stop"
          visible="{$status === 'submitted' || $status === 'streaming'}"
          onClick="$chat.stop()"
        />
      </HStack>
    </VStack>
  </ChatProvider>
</App>
```

The extension should feel like XMLUI: state is exposed through context variables and component APIs, composition happens through child components and templates, and backend/provider selection stays behind a stable server contract.

## 2. Design Principles

- Keep the component surface small. Add a component only when ordinary XMLUI composition cannot express the behavior.
- Keep the XMLUI-facing contract stable even if the Vercel AI SDK, model provider, or stream protocol changes.
- Keep credentials, base URLs, and provider factories server-side.
- Prefer child configuration components for human-authored composition, with plain object props only as escape hatches.
- Make `ChatProvider` the orchestration boundary: it is the single component that talks to transport and owns chat state.
- Let app authors design the composer, toolbar, status area, model picker, and error display with existing XMLUI components.
- Treat provider/model values from the browser as hints. The server validates and resolves them.

## 3. Non-Goals For The Prototype

- No direct browser-to-provider calls.
- No client-side API keys.
- No attempt to expose the full Vercel AI SDK surface in XMLUI.
- No `ChatComposer`, `ChatStatus`, `ChatStopButton`, or `ChatModelSelect` components in the first scaffold.
- No custom behavior registration; XMLUI `Extension` packages cannot register behaviors.
- No global `AppContext` additions. If helper functions are needed, export them through the extension `functions` map.
- No built-in transcript persistence beyond optional session IDs and messages returned by the server.

## 4. Minimal Package Shape

Create a standard XMLUI extension package:

```text
packages/xmlui-ai-chat/
  src/
    index.tsx
    ChatProvider.tsx
    ChatProviderNative.tsx
    ChatMessages.tsx
    ChatMessagesNative.tsx
    ChatAdapter.tsx
    chat-contract.ts
    chat-context.tsx
    ai-sdk-transport.ts
    *.spec.tsx
  demo/
    Main.xmlui
    server/
      chat-route.ts
  package.json
  index.ts
```

The package should export a default `Extension` object:

```ts
export default {
  namespace: "XMLUIExtensions",
  themeNamespacePrefix: "AiChat",
  components: [
    chatProviderRenderer,
    chatAdapterRenderer,
    chatMessagesRenderer,
  ],
};
```

Use `wrapComponent` for `ChatAdapter` and likely `ChatMessages`. Use `createComponentRenderer` or `wrapComponent` with `customRender` for `ChatProvider`, because it needs to render children with additional context variables and optionally inspect child `ChatAdapter` declarations.

## 5. Component Contract

### `ChatProvider`

Owns the chat session, transport, model selection, message state, streaming state, errors, and API facade. It renders children with chat context variables.

Props:

| Prop | Type | Default | Notes |
|---|---|---|---|
| `endpoint` | string | `/api/chat` | Same-origin endpoint preferred. |
| `sessionId` | string | generated | Passed to the server on every request. |
| `initialMessages` | any | `[]` | Normalized to the internal message shape. |
| `headers` | any | `undefined` | Optional request headers; do not use for secrets in browser code. |
| `body` | any | `{}` | Safe app metadata merged into request body. |
| `adapter` | any | `undefined` | Object-form fallback for machine-authored config. Child `ChatAdapter` is preferred. |
| `model` | string | `undefined` | Optional safe alias. Server remains authoritative. |
| `disabled` | boolean | `false` | Disables sending through `$chat.send`. |

Events:

| Event | Signature | Notes |
|---|---|---|
| `messageSent` | `messageSent(message, messages): void` | Fires after a user message is queued. |
| `messageDelta` | `messageDelta(delta, message, messages): void` | Fires while assistant output streams. |
| `messageReceived` | `messageReceived(message, messages): void` | Fires after an assistant message completes. |
| `error` | `error(error): void` | Use `signError: false` internally so apps can decide how noisy failures should be. |
| `statusChange` | `statusChange(status): void` | Useful for telemetry and custom UI. |

APIs:

| API | Signature |
|---|---|
| `send` | `send(textOrMessage: string | ChatMessageInput, options?: object): Promise<void>` |
| `appendMessage` | `appendMessage(message: ChatMessageInput): void` |
| `stop` | `stop(): void` |
| `reload` | `reload(): Promise<void>` |
| `clear` | `clear(): void` |
| `setMessages` | `setMessages(messages: ChatMessage[]): void` |
| `getMessages` | `getMessages(): ChatMessage[]` |
| `getStatus` | `getStatus(): ChatStatus` |
| `setAdapter` | `setAdapter(adapter: ChatAdapterRequest): void` |
| `getAdapter` | `getAdapter(): ChatAdapterRequest` |

Context variables exposed to children:

| Variable | Description |
|---|---|
| `$chat` | API facade with send/stop/reload/clear/message/adapter methods. |
| `$messages` | Current normalized messages. |
| `$lastMessage` | Last message or `null`. |
| `$streamingMessage` | Assistant message currently receiving deltas, or `null`. |
| `$status` | `"idle"`, `"submitted"`, `"streaming"`, or `"error"`. |
| `$error` | Last error or `null`. |
| `$sessionId` | Effective session ID. |
| `$adapter` | Effective safe adapter request, after provider defaults are merged. |
| `$model` | Effective safe model alias/id sent to the route. |
| `$isRunning` | Convenience boolean for submitted/streaming states. |

Implementation note: `ChatProviderNative` can use the Vercel AI SDK client hook/transport internally, but the exported XMLUI contract should depend only on `chat-contract.ts`.

### `ChatAdapter`

Non-visual declaration component that describes desired provider/model defaults and safe generation options. The server remains authoritative.

```xml
<ChatProvider endpoint="/api/chat">
  <ChatAdapter provider="ollama" model="qwen3:4b" temperature="{0.2}" />
  <ChatMessages />
</ChatProvider>
```

Props:

| Prop | Type | Notes |
|---|---|---|
| `provider` | string | Safe provider key, such as `ollama`, `openai`, or `anthropic`. |
| `model` | string | Safe model alias or server-approved model id. |
| `temperature` | number | Optional safe generation setting. |
| `maxOutputTokens` | number | Optional safe generation setting. |
| `system` | string | Optional system instruction when server policy allows it. |
| `metadata` | any | Safe adapter metadata. |

Precedence:

1. Server route configuration wins for secrets, base URLs, provider factories, and policy.
2. `ChatProvider` props win for request-scoped values like `endpoint`, `sessionId`, `body`, and `model`.
3. Child `ChatAdapter` supplies defaults for provider/model/generation options.
4. Object-form `adapter` on `ChatProvider` is a fallback for generated config and should not override a child `ChatAdapter` unless explicitly documented.
5. Client-provided values are always validated server-side.

Implementation options:

- Preferred: `ChatProvider` inspects direct children for one `ChatAdapter` and turns it into a serializable adapter request.
- Simpler first scaffold: `ChatAdapter` registers with `ChatProvider` through React context. This avoids manual child AST inspection but requires the provider to handle adapter changes after first render.

### `ChatMessages`

Renders the current message list from the nearest `ChatProvider` and handles streaming text display. It is the only visual component in the minimal plugin because streaming transcript rendering has enough repeated edge cases to justify a component.

Props:

| Prop | Type | Default | Notes |
|---|---|---|---|
| `messages` | any | provider messages | Override for custom display. |
| `streamingMessage` | any | provider streaming message | Override for tests or custom transports. |
| `reverse` | boolean | `false` | Useful for bottom-up layouts. |
| `autoScroll` | boolean | `true` | Scrolls while the user is near the bottom. |
| `showStreamingCursor` | boolean | `true` | Displays a small cursor/marker while streaming. |
| `emptyTemplate` | ComponentDef | `undefined` | Rendered when no messages exist. |
| `messageTemplate` | ComponentDef | default bubble | Render-prop template. |
| `partTemplate` | ComponentDef | `undefined` | Optional renderer for non-text message parts. |

Template context:

| Variable | Description |
|---|---|
| `$message` | Current message. |
| `$messageIndex` | Zero-based index. |
| `$part` | Current part when `partTemplate` is used. |
| `$partIndex` | Zero-based part index. |
| `$isLast` | Whether this is the last message. |
| `$isStreaming` | Whether this message is currently receiving deltas. |
| `$status` | Provider status. |
| `$chat` | Provider API facade. |

Default rendering should support plain text and markdown-friendly content, but app authors should be able to replace the message template entirely.

## 6. Building The Rest With Core XMLUI

The plan intentionally avoids convenience components that duplicate core XMLUI. Common UI patterns should be documented as snippets.

### Composer

```xml
<App var.prompt="">
  <TextArea
    id="promptBox"
    initialValue="{prompt}"
    enabled="{!$isRunning}"
    placeholder="Ask a question..."
    onDidChange="prompt = $value"
  />
  <Button
    label="Send"
    enabled="{prompt && !$isRunning}"
    onClick="
      $chat.send(prompt);
      prompt = '';
      promptBox.setValue('');
    "
  />
</App>
```

### Status And Stop

```xml
<HStack verticalAlignment="center" gap="$space-2">
  <Spinner visible="{$isRunning}" />
  <Text visible="{$status === 'submitted'}">Sending...</Text>
  <Text visible="{$status === 'streaming'}">Streaming...</Text>
  <Button visible="{$isRunning}" label="Stop" onClick="$chat.stop()" />
</HStack>
```

### Model Selection

```xml
<Select
  value="{$model}"
  data="{availableModels}"
  enabled="{!$isRunning}"
  onDidChange="$chat.setAdapter({ ...$adapter, model: $value })"
/>
```

### Error Display

```xml
<Text visible="{$error}" color="$color-danger">{$error.message}</Text>
```

## 7. Stable Client/Server Contract

The browser sends one normalized request to the app-owned route:

```ts
export type ChatRequest = {
  sessionId?: string;
  messages: ChatMessage[];
  adapter?: ChatAdapterRequest;
  metadata?: Record<string, unknown>;
};

export type ChatMessage = {
  id?: string;
  role: "system" | "user" | "assistant" | "tool";
  content?: string;
  parts?: ChatMessagePart[];
  metadata?: Record<string, unknown>;
};

export type ChatMessageInput = string | {
  role?: "user" | "system" | "assistant" | "tool";
  content?: string;
  parts?: ChatMessagePart[];
  metadata?: Record<string, unknown>;
};

export type ChatAdapterRequest = {
  provider?: string;
  model?: string;
  temperature?: number;
  maxOutputTokens?: number;
  system?: string;
  metadata?: Record<string, unknown>;
};

export type ChatStatus = "idle" | "submitted" | "streaming" | "error";
```

The route returns a streaming response compatible with the internal client transport. For the prototype, prefer the Vercel AI SDK stream response format and keep that dependency inside `ai-sdk-transport.ts`. If the SDK changes, only the transport layer and demo route should change.

Server route responsibilities:

- Validate the request shape.
- Resolve provider and model from server config plus safe client hints.
- Attach credentials from environment variables or server secrets.
- Normalize XMLUI messages to the AI SDK message/input format.
- Return streaming assistant output.
- Map provider failures into a stable error object.
- Optionally persist transcripts by `sessionId`.

## 8. Prototype Server Helper

Ship a small helper for demos and app-owned routes, not a mandatory server framework:

```ts
export function createChatRoute(config: ChatRouteConfig) {
  return async function handleChatRequest(request: Request): Promise<Response> {
    // validate ChatRequest
    // resolve adapter
    // call Vercel AI SDK
    // return streaming Response
  };
}
```

Configuration sketch:

```ts
type ChatRouteConfig = {
  defaultAdapter: string;
  adapters: Record<string, ChatServerAdapter>;
  allowClientModel?: boolean | string[];
  allowClientSystem?: boolean;
  mapMetadata?: (request: ChatRequest) => Record<string, unknown>;
  onError?: (error: unknown, request: ChatRequest) => void;
};
```

The demo can include an Ollama adapter first because it is easy to run locally. OpenAI/Anthropic adapters should be additive later and should live entirely in server code.

## 9. XMLUI Implementation Notes

- Use `themeNamespacePrefix: "AiChat"` so extension theme variables are namespaced.
- Mark all three components `status: "experimental"` in metadata.
- Put shared public types in `chat-contract.ts`; do not leak AI SDK types through component props or APIs.
- Use `createMetadata` with explicit `valueType` on every typed prop so `wrapComponent` extraction and type-contract diagnostics work.
- Use `registerComponentApi` for `ChatProvider` APIs rather than React refs.
- Render `ChatProvider` children with the chat context variables listed above.
- Use `ChatMessages` templates/renderers for message rows and parts, with explicit context variables.
- Keep `ChatAdapter` `nonVisual: true`; it should render `null`.
- Avoid adding composer/status/stop/model-select components until repeated app code proves they remove meaningful complexity.
- Do not add AppContext functions until the extension has a repeated cross-component need. Extension `functions` are available as expression globals and are safer for package-local helpers.

## 10. Suggested Scaffold Milestones

### Milestone 1: Contract and Skeleton

- Create the package or chat subfolder.
- Add package scripts matching other extension packages: `start`, `build:extension`, `build-watch`, `build:demo`, `build:meta`, and unit test scripts.
- Add `chat-contract.ts`.
- Register empty experimental `ChatProvider`, `ChatAdapter`, and `ChatMessages` components through `src/index.tsx`.
- Add a minimal demo app that renders without sending network requests.

Acceptance:

- `xmlui build-lib --mode=metadata` succeeds for the package.
- Demo markup can resolve all three components.

### Milestone 2: Provider State and Context

- Implement `ChatProvider` state and context without network streaming.
- Implement `ChatAdapter` config capture and precedence.
- Register provider APIs: `send`, `appendMessage`, `clear`, `getMessages`, `getStatus`, `setAdapter`, `getAdapter`.
- Add unit tests for context variables, API registration, adapter precedence, and status transitions.

Acceptance:

- A regular `TextArea` + `Button` can call `$chat.send(prompt)`.
- Sending adds a user message and can append a fake assistant response for smoke testing.

### Milestone 3: Message Rendering

- Implement `ChatMessages`.
- Support `messageTemplate`, `partTemplate`, `emptyTemplate`, streaming cursor, and auto-scroll.
- Add tests for template context variables, empty state, streaming state, and reverse order.

Acceptance:

- App authors can render a useful transcript with either the default renderer or a custom XMLUI template.

### Milestone 4: AI SDK Transport

- Add `ai-sdk-transport.ts` as the only browser-side module that knows the AI SDK client transport/hook.
- Wire `ChatProvider` to the endpoint.
- Support submitted/streaming/error status transitions.
- Implement `stop` and `reload`.
- Add tests with a mocked streaming response.

Acceptance:

- Demo can stream from a local `/api/chat` route.
- Stopping a stream leaves messages in a coherent state.

### Milestone 5: Demo Route and Ollama Adapter

- Add a demo server route helper using the Vercel AI SDK.
- Implement an Ollama server adapter.
- Validate `ChatRequest` and reject unsafe adapter/model overrides.
- Document required local environment and route setup in the package README or demo notes.

Acceptance:

- The demo can chat with a local Ollama model through `/api/chat`.
- Switching the server default model requires no XMLUI markup change.

### Milestone 6: Composition Recipes and Accessibility

- Document recipes for composer, stop button, status indicator, model picker, and error display using core XMLUI components.
- Add theme variables and SCSS modules only for `ChatMessages` default transcript styling.
- Add accessibility pass: transcript semantics, streaming announcements, keyboard-friendly examples, and focus guidance after send.
- Add E2E coverage for the demo.

Acceptance:

- The extension stays at three components.
- App authors can build the complete chat UI from documented XMLUI snippets.

## 11. Open Decisions

- Should `ChatAdapter` be captured by child inspection or context registration?
- Should object-form `adapter` on `ChatProvider` exist in the first scaffold, or should only child `ChatAdapter` be supported?
- Should `model` remain as a direct `ChatProvider` prop if `ChatAdapter` already owns model selection?
- Should message content initially be plain text only, or should the prototype preserve AI SDK message parts from day one?
- Should `ChatMessages` render markdown by default, or leave markdown entirely to `messageTemplate`?
- Should transcripts be exposed through a `DataSource`-friendly endpoint in a companion helper, or left to app code?

## 12. References

- XMLUI extension rules: `.ai/xmlui/extension-packages.md`
- XMLUI component rules: `.ai/xmlui/component-architecture.md`
- XMLUI `wrapComponent` rules: `.ai/xmlui/wrapcomponent.md`
- XMLUI AppContext and extension function distinction: `.ai/xmlui/app-context.md`
- Vercel AI SDK docs: https://ai-sdk.dev/docs
