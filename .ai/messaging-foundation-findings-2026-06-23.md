# Messaging Foundation Findings - 2026-06-23

## Scope

Phase 5 Wave F4A migrated the first compatibility slice for these non-visual
messaging components:

- `MessageListener`
- `EventSource`
- `WebSocket`

## Original Sources Inspected

- `/Users/dotneteer/source/xmlui/xmlui/src/components/MessageListener/MessageListener.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/MessageListener/MessageListenerReact.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/MessageListener/MessageListener.spec.ts`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/EventSource/EventSource.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/EventSource/EventSourceReact.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/WebSocket/WebSocket.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/WebSocket/WebSocketReact.tsx`

## Preserved Foundation Behavior

- `MessageListener` listens to `window.message`, calls
  `onMessageReceived(data, event)`, and renders children without introducing a
  wrapper element.
- `EventSource` is non-visual, respects `url`, `enabled`, and
  `withCredentials`, emits `open`, `message`, `error`, and `close`, and parses
  JSON-looking message payloads before invoking the message handler.
- `WebSocket` is non-visual, respects `url`, `enabled`, `reconnect`, and
  `reconnectDelayMs`, emits `open`, `message`, `error`, and `close`, and parses
  JSON-looking message payloads before invoking the message handler.

## Implementation Notes

- Metadata, docs, renderers, registry mappings, built-in contracts, and IR
  lowering registrations were added for all three components.
- A runnable `npm run dev` sample is available as
  `?example=messagingFoundation`.
- The fake WebSocket fixture must account for Vite's own HMR WebSocket; tests
  should look for the component socket by URL rather than assuming the first
  constructed socket belongs to XMLUI markup.

## Deferred Compatibility Debt

- Literal old `MessageListener.spec.ts` transfer is not complete.
- `EventSource` close/error/retry behavior needs a real streaming compatibility
  harness before the old tests can be copied literally.
- `WebSocket` event delivery, disabled state, close/error, and reconnect tests
  need the same streaming harness and a careful comparison with the original
  implementation.

## Verification

- `npm --workspace xmlui exec -- playwright test src/components/MessageListener/MessageListener.spec.ts src/components/EventSource/EventSource.spec.ts src/components/WebSocket/WebSocket.spec.ts`
  - 6 passed, 5 explicit fixme skips.
- `npm --workspace xmlui exec -- tsc -p tsconfig.build.json --noEmit`
- `npm --workspace xmlui test`
  - 37 files, 263 tests passed.
- `npm --workspace xmlui run compatibility:css-module-import-audit`
