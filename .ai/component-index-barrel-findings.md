# Component Folder Barrel Files

Date: 2026-06-20

## Decision

Do not create `index.ts` barrel files inside individual component folders.

## Reasoning

- The migrated component registry imports explicit implementation files such as
  `xmlui/src/components/Button/Button.tsx`,
  `xmlui/src/components/Text/Text.tsx`, and
  `xmlui/src/components/Heading/Heading.tsx`.
- Per-component `index.ts` files did not provide a compatibility contract from
  the original XMLUI framework.
- The barrel files obscured where metadata, renderers, defaults, docs, and
  React implementations actually live.
- Component transfer should keep the source organization direct and inspectable:
  `ComponentName.tsx`, `ComponentNameReact.tsx`, `ComponentName.defaults.ts`,
  `ComponentName.module.scss`, `ComponentName.md`, and colocated tests.

## Migration Guidance

- New component migrations should not add `xmlui/src/components/<Name>/index.ts`.
- Import component contracts, renderers, metadata, defaults, or React
  implementations from the explicit file that defines them.
- Shared component infrastructure belongs under `xmlui/src/component-core`, not
  in `xmlui/src/components`.
