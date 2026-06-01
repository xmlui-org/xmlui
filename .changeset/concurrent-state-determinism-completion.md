---
"xmlui": patch
---

Plan #16 (Concurrent-state determinism) — final piece shipped. Adds the Inspector overlay `Replay…` button in `website/public/xmlui/xs-diff.html`: loads a previously exported trace JSON, runs the `replay()` comparator against the live `window.parent._xsLogs`, and surfaces either a "Replay matches" confirmation or a `determinism-replay-divergence` modal with a side-by-side diff of the first divergent entry. Volatile timing fields (`ts`, `perfTs`, `startPerfTs`, `duration`) are stripped before comparing, matching the runtime comparator and the `xmlui replay` CLI subcommand. Ships user-facing docs page `/docs/managed-react/concurrent-state-determinism`, with a NavLink and Page route in `website/src/Main.xmlui`. Updates the §17 scorecard row from "Visual, not concurrent" to "Sealed — happens-before contract, FIFO scheduler, fixed-precision tokens, replay harness". No runtime API changes.
