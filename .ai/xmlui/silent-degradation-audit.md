# Silent Degradation Audit

Working catalog for runtime paths where XMLUI intentionally continues after a
failure or invalid input. Prefer observability-only fixes first: console context,
Inspector trace entries, stable diagnostic codes, or documentation. Avoid
changing control flow unless the degraded behavior is unsafe.

## Classification

| Class | Meaning | Default action |
|-------|---------|----------------|
| Expected fallback | A documented fallback path, such as invalid JSON returning a caller fallback | Document; do not trace every occurrence |
| Recoverable platform failure | Browser capability/storage/security failure where XMLUI can continue | Emit an Inspector trace when available |
| User-code failure | Handler/action/lifecycle code throws | Sign or report through existing error path; include component/source context |
| Internal observability failure | Inspector/audit sink cannot record or forward an entry | Emit an `audit` self-diagnostic when possible |
| Parser control flow | Parser returns `null` while collecting syntax errors | Do not treat as silent degradation by itself |

## Current Findings

| Area | Current behavior | Risk | Action |
|------|------------------|------|--------|
| Event handler failures | Error is signed; console and `handler:error` include component/event context, handler source, `diagnosticCode`, and `diagnosticHint` | Low | Handled |
| Host callback failure isolation | A failing callback should not poison sibling/later callbacks | Medium | Regression-covered for handler/subscriber cases |
| localStorage access failures | Read/write/delete/clear degrade to fallback/no-op on `SecurityError`, quota errors, or unavailable storage | Low | Handled with `kind: "storage"`, `code: "storage-operation-failed"` traces |
| localStorage invalid JSON | `readLocalStorage` returns fallback; `getAllLocalStorage` can show raw strings | Low | Expected fallback; intentionally not traced |
| Parser `return null` paths | Parser records errors while returning `null` internally | Low | Not a runtime degradation; leave unchanged |
| Optional-by-default member access | `.`/`[]`/`()` behave like optional access and return `undefined` on nullish receivers | Medium | Documented behavior; do not trace by default |
| Data loader transform/query failures | Errors generally sign or trace through loader paths, but console context varies by loader kind | Medium | Candidate for a focused follow-up |
| Tree lazy load failures | Console errors exist, but component/source context appears ad hoc | Medium | Candidate for a focused follow-up |
| App locale/theme persistence reads | Some startup storage reads catch and continue quietly | Low | Candidate for storage helper consolidation |

## Implemented Trace Codes

| Code | Kind | Meaning |
|------|------|---------|
| `handler-assignment-target` | `handler:error` | Assignment target was not writable or not in XMLUI scope |
| `handler-await-syntax` | `handler:error` | Handler used unsupported `async`/`await` syntax |
| `handler-unresolved-identifier` | `handler:error` | Handler referenced a name that was not visible in scope |
| `storage-operation-failed` | `storage` | Managed localStorage operation failed but XMLUI continued |

## Next Low-Risk Slices

1. Normalize DataLoader console/trace diagnostics for CSV/text/SQL transform
   failures without changing error propagation.
2. Add contextual `Tree` lazy-load failure traces instead of ad hoc
   `console.error` only.
3. Consolidate App startup theme/locale persistence reads through the managed
   localStorage helpers so storage failures use the same observability surface.
