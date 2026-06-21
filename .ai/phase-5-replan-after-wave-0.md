# Phase 5 Replan After Wave 0

Date: 2026-06-20

Context:

- The workspace was rolled back to the end of Phase 5 Wave 0.
- The previous Wave A-D approach produced source-adjacent component renderers
  but did not preserve old component outlook because it skipped the old shared
  metadata, theming, behavior, documentation, and rendering-adapter systems.

Decision:

- Post-Wave-0 component migration is blocked until shared component
  infrastructure is rebuilt.
- The rewrite should migrate old semantics, principles, and visible interfaces,
  not necessarily old internals.
- Component metadata should remain close to the old shape and become the source
  for compiler contracts, LSP metadata, docs, behaviors, and theme metadata.
- The old theming/default-style model must be migrated or recreated
  semantically before components are marked visually compatible.
- Behaviors must remain a shared wrapper system rather than being absorbed into
  every component renderer.
- `ComponentName.md` remains part of the component contract.
- Old component file naming patterns should be preserved where they improve
  traceability: `Component.tsx`, `ComponentReact.tsx`,
  `Component.defaults.ts`, `Component.module.scss`, `Component.md`, and tests.

New sequence:

1. Wave 1A: old-shaped metadata compatibility.
2. Wave 1B: theme variable/default styling compatibility.
3. Wave 1C: behavior compatibility.
4. Wave 1D: component docs format compatibility.
5. Wave 1E: lightweight managed rendering adapter compatibility.
6. Wave 2: migrate `App` main content layout as the first proof component.
7. Wave 3: migrate the exact Experiment 1 components (`Button`, `Text` or text
   rendering, `Heading`/`H1`, and any needed layout primitive) to prove the
   concept on the increment-button samples.
8. Continue broader component waves only after the proof passes with old-visible
   metadata, styling, behaviors, docs, tests, and mutation paths.

