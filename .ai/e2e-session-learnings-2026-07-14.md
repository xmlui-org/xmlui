# E2E Session Learnings

Date: 2026-07-14

Context: During the final theme/style old-pattern migration sweep, the
standard XMLUI E2E gate passed only after stale compatibility expectations and
several real full-suite flakes were fixed. The important lesson is that a
green focused run is useful evidence, but the full `test:e2e` gate is the
contract for migration steps.

## Gate Discipline

- Use the normal full gate for migration-step closure:
  `npm --workspace xmlui run test:e2e -- --max-failures=10`.
- The full gate takes about seven minutes in this workspace. Do not start it
  unless the current step is ready to be verified, and do not leave it running
  when ending a turn.
- A Playwright run can exit successfully while reporting flaky retries. Treat
  that as incomplete unless the plan explicitly allows the flake and the
  focused rerun proves it. Prefer fixing the flake when it is in touched or
  nearby tests.
- Do not run multiple independent Playwright commands in parallel against the
  same XMLUI dev server. That can create misleading failures. If concurrency
  evidence is needed, run one Playwright command with an explicit worker model
  such as `--workers=1`, `--workers=4`, or the default suite settings.
- For focused repeats, keep the command small and explicit:
  `npx playwright test <spec> --grep "<title>" --repeat-each=10 --workers=1`
  is useful for proving a single interaction no longer races.

## What Counted as a Real Fix

- Fix stale expectations first when a compatibility sweep reports tests that
  disagree with the current public contract. In this session that included
  root package scripts, package artifact exports, HSL color formatting, and a
  VS Code parser diagnostic fixture.
- For E2E flakes, rewrite the assertion around observable app behavior rather
  than internal timing. A fixed test should pass a focused repeat and then the
  full E2E gate.
- When a full run reports flaky tests even with exit code 0, capture the exact
  file and title, run the focused repeat, fix if repeatable or test-quality
  related, and run the full gate again before closing the step.

## Stable Test Patterns From This Session

- Timer enabled/disabled behavior should start from a known disabled state,
  assert the counter remains stable, enable through the public control, then
  assert stop and resume behavior after state has settled. Avoid depending on
  the race between initial render and the first interval tick.
- Select `didChange` should be asserted through rendered XMLUI state or visible
  output. Reading an API value immediately after an option click can observe a
  stale value in the shared-page suite.
- Switch API trigger buttons used only as test controls can use
  `locator.dispatchEvent("click")` after the control is attached. That avoids
  Playwright actionability/timing noise for invisible or harness-adjacent test
  controls while still exercising the XMLUI event handler.
- Website parity canaries should use focused XMLUI E2E fixtures when the
  website workspace has no local `test:e2e` script. Keep the fixture small and
  test the public route/theme contract rather than importing untransformed
  website runtime files directly into Playwright.

## Full-Suite Noise to Recognize

- Vite/React warnings such as ResizeObserver loop notifications, React Router
  future-flag warnings, duplicate-key warnings from intentional edge-case
  tests, and theme validation warnings may appear during a passing full suite.
  Do not treat them as failures unless Playwright reports failed/flaky tests or
  the warning is the behavior under test.
- `check:metadata` can pass while logging a sandbox-only Vite WebSocket
  `EPERM` warning. Record it as noise if the command exits successfully.

## Recording Results

- Plans should record the final full E2E summary exactly: passed count, skipped
  count, and whether flaky retries were reported.
- If a step is split, record the substeps in the plan before continuing.
- Closure notes should separate green test gates from broader build blockers.
  In this session, E2E was green while `build:production`, `build:ssg`, and
  `compatibility:sweep` remained blocked by existing production TypeScript debt
  and a missing optional native VS Code esbuild dependency.
