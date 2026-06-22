# RatingInput Migration Findings - 2026-06-21

## Source Anchors

- Old component folder:
  `/Users/dotneteer/source/xmlui/xmlui/src/components/RatingInput`
- Migrated component folder:
  `xmlui/src/components/RatingInput`

## Findings

- `RatingInput` is a good first slice of the range/rating input wave because
  the old E2E suite is compact but still covers interaction, value API,
  disabled/read-only behavior, placeholder behavior, and responsive part layout.
- The old `width-input-md` behavior assumes that a single-root input component
  can be both the component root and the `input` part. The rewrite adapter
  therefore must apply default-part responsive layout props to the root element
  when a renderer calls `adapter.rootAttrs("input")`.
- Keep old copied component E2E tests source-adjacent. For this slice the only
  copied-test edit was replacing the old missing `PART_INPUT` import with a
  local `const PART_INPUT = "input"`.
- The broad `tsc --noEmit` command still reports existing strictness issues in
  previously copied component specs. Use `tsc -p tsconfig.build.json --noEmit`
  for production TypeScript verification until those copied-spec type issues
  are closed.

## Verification

- `npm --workspace xmlui exec -- tsc -p tsconfig.build.json --noEmit`
- `XMLUI_REUSE_DEV_SERVER=0 npm --workspace xmlui run test:e2e --
  src/components/RatingInput/RatingInput.spec.ts`
- `npm --workspace xmlui run check:metadata`
- `npm --workspace xmlui run compatibility:component-transfer`
