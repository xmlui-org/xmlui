---
"xmlui": patch
---

The standalone bundle now boots when it loads after `DOMContentLoaded`.

The boot trigger was registered as a `DOMContentLoaded` listener with no fallback, so a
bundle that evaluated after the document finished parsing waited for an event that could
never fire again: a blank page, no error, nothing in the console. Every load that is not
parser-blocking hit this — dynamic `<script>` insertion, `defer`, and any module whose
top-level `await` defers evaluation past the event. The entry point now checks
`document.readyState` and boots directly when parsing is already done.

Booting is idempotent. Re-dispatching `DOMContentLoaded` was the natural workaround for
the blank page, so apps that adopted it would otherwise have booted twice once the
fallback landed; a second event — real or synthetic — is now a no-op.

Refs #3786.
