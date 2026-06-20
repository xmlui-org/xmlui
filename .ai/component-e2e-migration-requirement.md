# Component E2E Migration Requirement

Date: 2026-06-20

## Decision

A component migration is not complete until the corresponding original XMLUI
component E2E tests have been transferred or explicitly recorded as blocked
compatibility debt.

## What Happened

During the Wave 4 primitive component slice, `Text` and `Heading`/`H1` were
initially migrated with new focused E2E tests, but the old component E2E suites
from `/Users/dotneteer/source/xmlui/xmlui/src/components` were not transferred.
That left important old behavior unverified.

The old tests uncovered real compatibility gaps:

- `Heading` and `H2`-`H6` had to be registered together with `H1`.
- Shortcut headings must accept a `level` prop and ignore it.
- `Text` and heading components must accept `id` so component APIs can be
  referenced from event handlers.
- Adapter API registration must be stable to avoid React update loops.
- `Heading maxLines > 1` needs multiline clamp behavior.
- `Text.hasOverflow()` must detect overflow against constrained parent layout.

## Rule For Future Waves

- Inspect the original component folder before declaring a migrated component
  complete.
- Transfer original component E2E tests into the migrated component folder,
  colocated with the implementation.
- Keep the test intent and assertions as close to the original as the current
  harness allows.
- If a test cannot yet be transferred because another component or framework
  feature is missing, record the exact missing dependency and source test file
  in `.ai/` and keep it visible in the plan.
- New focused tests are useful, but they do not replace old-suite migration.

## Current Transfer

- Original source:
  `/Users/dotneteer/source/xmlui/xmlui/src/components/Text/Text.spec.ts`
- Transferred suite:
  `xmlui/src/components/Text/Text-old-e2e.spec.ts`
- Original source:
  `/Users/dotneteer/source/xmlui/xmlui/src/components/Heading/Heading.spec.ts`
- Original source:
  `/Users/dotneteer/source/xmlui/xmlui/src/components/Heading/HeadingShortcuts.spec.ts`
- Transferred suite:
  `xmlui/src/components/Heading/Heading-old-e2e.spec.ts`
