# CSS Module Import Pattern Findings - 2026-06-23

## Finding

The original XMLUI component pattern imports SCSS modules directly from the
React renderer, for example:

```ts
import styles from "./Button.module.scss";
```

The rewrite introduced interim literal class-name maps in some renderers. This
is compatibility debt. It can hide missing CSS-module behavior, increases the
risk of class-name conflicts, and makes migrated component files drift from the
old project's organization.

## Trial Result

- `ButtonReact.tsx` can use direct `Button.module.scss` imports.
- `HeadingReact.tsx` can use direct `Heading.module.scss` imports.
- Focused smoke E2E tests passed for both components after the direct import
  trial.
- `DateInputReact.tsx` was attempted and backed out. It is still reachable from
  the compiler/config import graph through component metadata, so Vite config
  bundling tried to parse raw SCSS as JavaScript before normal CSS-module
  handling could run.

## Required Rule

Migrate direct SCSS module imports in small verified chunks. Do not direct-import
SCSS in compiler/config-reachable component renderers until the compiler
metadata imports are separated from renderer/SCSS imports, or until another
verified config-time boundary prevents raw SCSS from being parsed as JavaScript.

## Verification Used

```text
npm --workspace xmlui exec -- tsc -p tsconfig.build.json --noEmit
npm --workspace xmlui run test:e2e -- src/components/Button/Button.spec.ts:16
npm --workspace xmlui run test:e2e -- src/components/Heading/Heading.spec.ts:6
npm --workspace xmlui run test:e2e -- src/components/DateInput/DateInput.spec.ts:8
```

