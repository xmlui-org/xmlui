---
"xmlui": patch
---

Wave 1 — Exception model Phase 1: AppError integration in signError and ErrorBoundary

Updates `signError()` in `AppContent.tsx` to accept `Error | AppError | string | unknown` and normalize via `AppError.from()`. Updates `ErrorBoundary.componentDidCatch()` to normalize the caught error through `AppError.from()` and include the `category` field in the trace log. See `dev-docs/plans/07-structured-exception-model.md`.
