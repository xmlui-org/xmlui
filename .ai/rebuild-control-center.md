# XMLUI Rebuild Control Center

Status: Phase 0 operational

This note tells future agents where to update compatibility control data before
and after rebuild work.

## Core Files

- `.plans/rebuild-plan.md`: phase ordering and definition of compatibility.
- `.ai/compatibility-inventory.md`: surface and component inventory.
- `.ai/compatibility-debt.md`: known gaps, blocked work, intentional
  deviations, obsolete old-test decisions, and verification required to close.
- `.ai/component-compatibility-closure-template.md`: template for component
  closure notes.
- `.ai/verification-command-matrix.md`: verification command selection.
- `.ai/experiment-15-full-compatibility-sweep-findings.md`: first sweep result
  and operational notes.

## Standard Workflow

1. Find the old behavior in `/Users/dotneteer/source/xmlui`.
2. Update `.ai/compatibility-inventory.md` with source anchors and status.
3. Add or update `.ai/compatibility-debt.md` if compatibility is missing,
   blocked, intentionally different, or needs investigation.
4. For components, create `.ai/<component>-compatibility-closure.md` from the
   template before marking the component `parity-tested` or `closed`.
5. Implement the smallest compatible slice.
6. Run commands from `.ai/verification-command-matrix.md`.
7. Update inventory, debt, and closure notes with the result.

## Current Control Commands

```text
npm --workspace xmlui run compatibility:sweep
npm --workspace xmlui run compatibility:perf
```

## Phase 0 Exit Status

- Compatibility inventory exists.
- Compatibility debt log exists and all current rows are classified.
- Original component set is listed in the inventory.
- Standard component closure template exists.
- Verification command matrix exists.
- First compatibility sweep and performance baseline commands exist.

Phase 0 remains a living control center; future phases must maintain these
files as compatibility work changes.
