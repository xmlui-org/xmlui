# WebSocket Remigration Findings - 2026-07-10

Scope: strict remigration of `WebSocket` from
`/Users/dotneteer/source/xmlui/xmlui/src/components/WebSocket`.

Protected files restored from the original source:

- `WebSocket.tsx`
- `WebSocketReact.tsx`
- `WebSocket.defaults.ts`

Host adaptation:

- Appended the rewrite runtime renderer to `WebSocket.tsx`, below the copied
  original source.
- The runtime renderer delegates connection lifecycle to the original
  `WebSocketConnection` implementation and maps `open`, `message`, `error`, and
  `close` events through the rewrite adapter.

Verification:

- `node xmlui/scripts/verify-protected-component-copy.mjs WebSocket` reports
  copied files as `identical` or `entry-adapted`.
- Focused WebSocket E2E coverage passed.
