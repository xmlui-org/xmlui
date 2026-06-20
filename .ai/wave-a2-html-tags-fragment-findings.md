# Wave A2: HTML Tags, Br, and Fragment Findings

Date: 2026-06-20

Phase 5 Wave 4 / Wave A2 migrated the current compatibility slice for
`HtmlTags`, `Br`, and `Fragment`.

Key findings:

- The original `Fragment` is a no-wrapper grouping component. Its important
  visible contract is that child elements are rendered directly into the parent
  without an extra DOM element.
- The original `Fragment` relies on the universal `when` property for
  conditional rendering. In the rewrite this belongs in the shared behavior
  pipeline, not in the Fragment renderer.
- `when="{false}"` removes the affected component/group from the DOM. It does
  not leave a hidden placeholder element.
- The original HTML tag wrappers are numerous lower-case component names. The
  rewrite now keeps their inventory in `xmlui/src/component-core/htmlTags.ts`
  so compiler contracts, IR lowering, renderers, metadata, and registry
  reporting share one source.
- `HtmlTags` uses component-specific theme variable names such as
  `width-HtmlTable`; these should continue to come from metadata/SCSS patterns
  as migration matures.
- Shortcut or alias components may share implementation files while still
  having component-specific docs and registry paths. Keep registry fields
  precise; tests expect `H1` documentation to stay at `Heading/H1.md` even
  though implementation is shared with `Heading`.

Verification:

- Focused transferred E2E:
  `npm --workspace xmlui run test:e2e -- src/components/Br/Br-old-e2e.spec.ts src/components/Fragment/Fragment-old-e2e.spec.ts src/components/HtmlTags/HtmlTags-old-e2e.spec.ts`
- Compiler/component unit slice:
  `npm --workspace xmlui run test -- tests/compiler 'src/components/**/*.spec.tsx'`
- Full compatibility gate:
  `npm --workspace xmlui run compatibility:sweep`

Visual sample:

- Start `npm run dev`.
- Open `http://127.0.0.1:5173/?example=htmlTagsFragment`.
