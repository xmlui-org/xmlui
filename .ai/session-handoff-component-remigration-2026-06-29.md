# Component Re-Migration Session Handoff

Date: 2026-06-29

## New Session Bootstrap

Start by reading:

1. `/Users/dotneteer/source/xmlui-rs/AGENTS.md`
2. `/Users/dotneteer/source/xmlui-rs/.plans/component-remigration.md`
3. The latest component notes in `/Users/dotneteer/source/xmlui-rs/.ai/*source-preserving-migration-findings*.md`

The old XMLUI project at `/Users/dotneteer/source/xmlui` is the compatibility
contract. The current rewrite workspace is
`/Users/dotneteer/source/xmlui-rs`.

## User's Migration Rules

- Preserve old React component files and `.module.scss` files literally where
  possible. Import rewrites are allowed. Tiny compatibility shims are allowed
  only when unavoidable and must be documented.
- Component metadata/defaults/renderer glue may be adapted to the rewrite.
- Do not modify the original migrated component E2E files.
- Keep `npm --workspace xmlui run test:e2e` viable with migrated and
  non-migrated components running side by side.
- After each component is migrated and verified, stop and ask the user for
  approval before moving to the next one.
- The user will run extra visual/manual checks and will report regressions.
- Record new reusable learnings in `.plans/component-remigration.md`; keep
  component-specific details in `.ai/`.

## Current Approved Components

The plan's status table is the source of truth. As of this handoff, these are
approved complete under the source-preserving migration loop:

- ProgressBar
- Avatar
- Icon
- Button
- Checkbox
- Switch
- Badge
- Br
- Text
- Heading, H1, H2, H3, H4, H5, H6
- Stack, HStack, VStack, CHStack, CVStack
- SpaceFiller
- NoResult
- FlowLayout
- Card
- Animation

## Most Recent Component: Animation

Animation is complete and approved by the user.

Key files changed for Animation:

- `xmlui/src/components/Animation/AnimationReact.tsx`
- `xmlui/src/components/Animation/Animation.defaults.ts`
- `xmlui/src/components/Animation/Animation.spec.ts`
- `xmlui/src/component-core/behaviors/definitions.tsx`
- `xmlui/package.json`
- `package-lock.json`
- `xmlui/src/types/lodash-es.d.ts`

Animation source was copied from:

- `/Users/dotneteer/source/xmlui/xmlui/src/components/Animation/AnimationReact.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/Animation/Animation.defaults.ts`

Important learning: behavior wrappers that clone children must preserve child
inline style before applying wrapper-owned dynamic style. The rewrite currently
emits many theme CSS variables through inline style, so dropping child style can
strip variant/theme variables from animated Checkbox/Switch wrappers. This is
documented in the plan and in:

- `.ai/animation-source-preserving-migration-findings-2026-06-29.md`

Residual risk: Animation combined with function-component behavior wrappers
such as TooltipBehavior emits a non-failing React ref warning. Tests pass, but a
future behavior migration may need shared ref-aware behavior composition.

## Recent Verification Baseline

The most recent Animation verification was:

- `npx tsc -p xmlui/tsconfig.build.json --noEmit`: passed.
- `npm --prefix xmlui run check:metadata`: passed.
- `npm --workspace xmlui run test:e2e -- src/components/Animation/Animation.spec.ts --workers=1`: passed 2/2.
- `npm --workspace xmlui run test:e2e -- src/components/Checkbox/Checkbox.spec.ts src/components/Switch/Switch.spec.ts --grep 'all behaviors combined with parts' --workers=1`: passed 2/2.
- Side-by-side migrated component batch including Animation: passed 947 tests,
  skipped 116, failed 0.

The side-by-side batch command used in the previous session was:

```sh
npm --workspace xmlui run test:e2e -- src/components/ProgressBar/ProgressBar.spec.ts src/components/Avatar/Avatar.spec.ts src/components/Badge/Badge.spec.ts src/components/Br/Br.spec.ts src/components/Icon/Icon.spec.ts src/components/Button/Button.spec.ts src/components/Button/Button-style.spec.ts src/components/Checkbox/Checkbox.spec.ts src/components/Switch/Switch.spec.ts src/components/Text/Text.spec.ts src/components/Heading/Heading.spec.ts src/components/Heading/HeadingShortcuts.spec.ts src/components/Heading/Heading-style.spec.ts src/components/Stack/Stack-regression.spec.ts src/components/Stack/Stack.spec.ts src/components/Stack/HStack.spec.ts src/components/Stack/VStack.spec.ts src/components/Stack/CHStack.spec.ts src/components/Stack/CVStack.spec.ts src/components/SpaceFiller/SpaceFiller.spec.ts src/components/NoResult/NoResult.spec.ts src/components/FlowLayout/FlowLayout.spec.ts src/components/FlowLayout/FlowLayout.foundation.spec.ts src/components/Card/Card.spec.ts src/components/Card/Card.foundation.spec.ts src/components/Animation/Animation.spec.ts --workers=1
```

## Worktree Caution

The worktree is intentionally dirty from ongoing migration work. Do not revert
changes you did not make. Some modified or untracked files belong to earlier
approved components and helper shims. If a future component touches them, read
the current file first and preserve existing behavior.

Known untracked files at handoff include:

- `.ai/animation-source-preserving-migration-findings-2026-06-29.md`
- `.ai/card-source-preserving-migration-findings-2026-06-29.md`
- `xmlui/src/components/Animation/Animation.defaults.ts`
- runtime-only themed helper files under Avatar, Heading, Link
- `xmlui/src/types/`

## Recommended Next-Step Pattern

For the next component:

1. Confirm the user-selected target or choose a dependency-friendly candidate
   from the status table.
2. Inventory old source with `rg --files /Users/dotneteer/source/xmlui/xmlui/src/components/<Component>`.
3. Copy protected React and `.module.scss` files from the old component.
4. Rewrite imports only, then adapt renderer/metadata/defaults at the boundary.
5. Run TypeScript and metadata checks when runtime exports or metadata changed.
6. Run focused E2E for the component.
7. Run the side-by-side migrated component batch, adding the new component's
   old specs.
8. Update `.plans/component-remigration.md` to `Awaiting approval`.
9. Add `.ai/<component>-source-preserving-migration-findings-YYYY-MM-DD.md`.
10. Stop and ask the user for approval.

Avoid broad refactors. When copied source exposes a mismatch, prefer fixing the
shared rendering/theming/layout/testbed contract over tuning the component.
