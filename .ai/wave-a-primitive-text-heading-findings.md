# Wave A Primitive Text and Heading Findings

Date: 2026-06-20

Phase 5 Wave 4 has started with a narrow Wave A slice:

- `Text`
- `Heading` infrastructure for the `H1` runtime shortcut

Transferred rewrite files:

- `xmlui/src/components/Text/Text.tsx`
- `xmlui/src/components/Text/TextReact.tsx`
- `xmlui/src/components/Text/Text.defaults.ts`
- `xmlui/src/components/Text/Text.module.scss`
- `xmlui/src/components/Text/Text.md`
- `xmlui/src/components/Text/Text.spec.tsx`
- `xmlui/src/components/Text/Text-style.spec.ts`
- `xmlui/src/components/Heading/Heading.tsx`
- `xmlui/src/components/Heading/HeadingReact.tsx`
- `xmlui/src/components/Heading/Heading.defaults.ts`
- `xmlui/src/components/Heading/Heading.module.scss`
- `xmlui/src/components/Heading/Heading.md`
- `xmlui/src/components/Heading/H1.md`
- `xmlui/src/components/Heading/Heading.spec.tsx`
- `xmlui/src/components/Heading/Heading-style.spec.ts`

Visual check:

- Run `npm run dev` in `xmlui`.
- Open `http://127.0.0.1:5173/?example=primitiveTextHeading`.

Compatibility notes:

- `Text` and `H1` are now delegated through the component transfer registry
  instead of the centralized built-in renderer.
- The slice covers old-visible value/children precedence, semantic text
  variants, context-menu event, text selection, max-line overflow styling,
  heading level normalization, heading anchor generation, and a visible state
  mutation path.
- This does not close all old `Text` and `Heading` tests. The full old suites
  still need inspection/porting or explicit compatibility debt before the
  corresponding components can be marked fully closed.
