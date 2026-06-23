# APICall

`APICall` is a non-visual component that exposes an imperative `execute` API.

This migration slice implements the foundation behavior used by the current
experiments: scripted execution, managed fetch execution, `beforeRequest`,
`success`/`error` events, and data-source invalidation.
