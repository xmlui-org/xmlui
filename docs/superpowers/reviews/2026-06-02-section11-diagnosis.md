# Section 11 Diagnosis — Cross-`.xs` Import Resolution Gap

**Date:** 2026-06-02
**Status:** Task 0 Complete

## Findings

The diagnosis (Task 0) confirmed that the myworkdrive narrowing issues are caused by **G1/G2 (Resolution/re-optimize ordering is wrong on the dev path)**.

### Evidence
- In `StandaloneApp.tsx`, the dev-mode/inline branch (around L1247) calls `setStandaloneApp(appDef)` directly but **never calls `collectImportsFromStandaloneSources`**.
- This means any `.xs` imports in the dev environment remain unmerged, leaving `hasUnresolvableImports: true` on the component definitions.
- Consequently, the optimizer (correctly but conservatively) blocks narrowing for these nodes, resulting in the ~35 containers being un-optimized.
- In contrast, the standalone fetch path (~L1743) correctly calls `collectImportsFromStandaloneSources` and follows it with a `computeUsesForTree` re-run if anything was resolved.

### Conclusion
The primary fix (Task 4) must be to mirror the resolution + re-optimize logic from the fetch path into the dev-mode branch in `StandaloneApp.tsx`.

## Next Steps
- [x] Task 0: Diagnosis (this doc)
- [ ] Task 1: Unit test direct caller global reads (computedGlobalUses)
- [ ] Task 2: Unit test child propagation (§10 path)
- [ ] Task 3: End-to-end resolver test
- [ ] Task 4: Apply wiring fix to `StandaloneApp.tsx`
- [ ] Task 5: Conservative fallback test
- [ ] Task 6: Re-audit
