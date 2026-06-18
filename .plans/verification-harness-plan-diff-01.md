# Verification Harness Plan Diff 01

Snapshot: `verification-harness-plan-01.md`  
Previous snapshot: none

## Prompt

Take a snapshot, then create a detailed plan for the "10. Verification
Harness" section of the master plan.

## Edits

- Created `.plans/verification-harness-plan.md` from the master-plan
  Verification Harness scope.
- Defined the verification slice around reusable compiler helpers, snippet
  fixtures, lightweight E2E helpers, compatibility manifests, deferred-test
  tracking, and a command matrix.
- Preserved the old XMLUI test reuse contract while explicitly avoiding the
  full old `initTestBed` and component-driver infrastructure.
- Split the work into twelve independently testable implementation steps.
- Updated `AGENTS.md` so unqualified snapshots defaulted to
  `.plans/verification-harness-plan.md`.
