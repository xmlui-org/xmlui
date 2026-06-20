# Component E2E migration status: 2026-06-20

When migrating a component, copy the original component E2E spec files under
their original names into the component folder and make those tests pass. Do not
use separate `*-old-e2e.spec.ts` shim files as the migration target.

Current status for the components started so far:

- `Button`: original `Button.spec.ts` and `Button-style.spec.ts` are migrated.
  Verification: `npm --workspace xmlui run test:e2e -- src/components/Button/Button.spec.ts src/components/Button/Button-style.spec.ts`
  found 159 tests; 153 passed and 6 were skipped by the suite.
- `Text`: original `Text.spec.ts` is migrated.
  Verification: `npm --workspace xmlui run test:e2e -- src/components/Text/Text.spec.ts`
  passed 140/140.
- `Heading`: original `Heading.spec.ts` and `HeadingShortcuts.spec.ts` are
  migrated.
  Verification: `npm --workspace xmlui run test:e2e -- src/components/Heading/Heading.spec.ts src/components/Heading/HeadingShortcuts.spec.ts`
  passed 135/135.
- `Card`: original `Card.spec.ts` is migrated.
  Verification: `npm --workspace xmlui run test:e2e -- src/components/Card/Card.spec.ts`
  passed 27/27.
- `Br`, `Fragment`, and `HtmlTags`: original `Br.spec.ts`,
  `Fragment.spec.ts`, and `HtmlTags.spec.ts` are migrated.
  Verification: `npm --workspace xmlui run test:e2e -- src/components/Br/Br.spec.ts src/components/Fragment/Fragment.spec.ts src/components/HtmlTags/HtmlTags.spec.ts`
  passed 8/8.
- `Image`: original `Image.spec.ts` is migrated.
  Verification: `XMLUI_REUSE_DEV_SERVER=0 npm --workspace xmlui run test:e2e -- src/components/Image/Image.spec.ts src/components/IFrame/IFrame.spec.ts`
  passed 98/98 for the combined Image/IFrame focused run.
- `IFrame`: original `IFrame.spec.ts` is migrated.
  Verification: `XMLUI_REUSE_DEV_SERVER=0 npm --workspace xmlui run test:e2e -- src/components/Image/Image.spec.ts src/components/IFrame/IFrame.spec.ts`
  passed 98/98 for the combined Image/IFrame focused run.
- `App`: original `App.spec.ts`, `App-layout.spec.ts`,
  `App-layout-mobile.spec.ts`, `App-navigation-events.spec.ts`, and
  `App-script-imports.spec.ts` are copied, but App migration is not complete.
  Verification currently found 220 tests; only 3 passed. The failures are broad
  App-shell migration gaps: layout modes, mobile drawer behavior, navigation
  lifecycle events, script import/function handling, ready/message/keyboard
  events, document title behavior, and desktop layout semantics.

Important learned rule: App must be split into its own focused migration wave.
It is not comparable in scope to primitive/container components because its old
E2E suite covers the full app shell, navigation, scripting, lifecycle events,
and responsive layout system.

Default E2E command behavior:

- `npm --workspace xmlui run test:e2e` excludes the incomplete App
  compatibility suite so the command reflects currently migrated behavior.
  Verification after Image/IFrame migration: 624 tests discovered; 618 passed
  and 6 skipped.
- `npm --workspace xmlui run test:e2e:app-compat` runs only the copied App
  compatibility suite and is expected to fail until the App migration wave is
  completed. Verification after the split: 220 tests discovered; 3 passed and
  the remaining failures are the known App-shell migration backlog.
- `npm --workspace xmlui run test:e2e:all` includes both migrated suites and
  known incomplete compatibility suites.

Fresh-server E2E note:

- `XMLUI_REUSE_DEV_SERVER=0 npm --workspace xmlui run test:e2e -- <specs>`
  forces the Vite dev server to restart for a component compatibility run. Use
  it when browser tests appear to be exercising stale code from an already-open
  local dev server.
- In the sandboxed Codex environment, Playwright may fail before running tests
  because it cannot bind or probe `127.0.0.1:5173` (`listen EPERM`). Treat that
  as an environment limitation, not a component failure. Run the same command in
  the user's terminal to verify the focused browser spec.

Button styling migration rule:

- Do not migrate component visual styling as React-computed inline styles. The
  old component pattern keeps visual styling in `ComponentName.module.scss` and
  has `ComponentNameReact` compose CSS classes for variants, parts, states, and
  modes.
- React `style` on migrated components is acceptable for layout attributes and
  emitted theme CSS variables, but not for approximating component visuals that
  belong in the module stylesheet.
- Component theme variables should be emitted as exact CSS variables from
  metadata/defaults/user theme layers. For border shorthand theme variables,
  derive longhand CSS variables in the theme layer so SCSS classes can keep
  using stable `border-width`, `border-style`, and `border-color` declarations.
- CSS declarations that use optional variant-specific custom properties must
  provide explicit fallbacks. A missing `var(--xmlui-specific-name)` can reset a
  property at computed-value time instead of falling back to an earlier class.
- `Heading`, `H1`, `H2`, `H3`, `H4`, `H5`, and `H6` follow the same rule:
  `HeadingReact` composes classes such as `heading`, `h1` ... `h6`, overflow
  classes, and anchor classes; `Heading.module.scss` owns the typography,
  anchor, and overflow styling.
- `Text` follows the same rule: `TextReact` composes classes for variants,
  overflow modes, max-line clamps, line-break preservation, ellipsis behavior,
  and break modes; `Text.module.scss` owns the typography, text decoration,
  border, spacing, overflow, and wrapping declarations. Custom Text variants
  still need a small CSS-variable bridge from the renderer so arbitrary
  `textColor-Text-myVariant` style theme variables can flow into the class
  declarations.
- `Br` and `Fragment` currently have no component-owned visual inline styling
  to migrate. Their remaining `style` paths are layout/theme adapter plumbing
  or absent wrapper behavior.
- `HtmlTags` has an important import constraint: modules loaded during
  config-time metadata collection must not import `?xmlui-css-module` directly.
  Put visual declarations in `HtmlTags.module.scss`, but load that stylesheet
  from a browser/runtime entry or another runtime-only path.
- `Image` and `IFrame` currently have the same config-time constraint because
  their contracts are imported by the compiler during Vite config loading.
  Keep their component visuals in `Image.module.scss` and
  `IFrame.module.scss`, compose stable literal class names in the React
  primitives, and load the stylesheets from runtime/browser entries. Do not
  pass component theme-variable bags into React primitives just to calculate
  visual inline styles.
- When a component prop selects between finite visual states, prefer a CSS
  state class over a CSS-variable bridge. Example: `Image` uses
  `xmlui-imageInline` and `Image.module.scss` owns `display: inline`; this is
  closer to the old `ImageReact` pattern and avoids browser/test ambiguity
  around custom properties in enum-like declarations such as `display`.
- Inline media needs the old wrapper pattern when rendered inside flex-based
  XMLUI containers such as the migrated App content. A direct flex item is
  blockified by CSS even if it has `display: inline`, so `Image inline="true"`
  wraps the `img` in an inline wrapper and also keeps an inline class on the
  `img`. This lets the E2E assertion check the image's computed display as
  `inline` instead of the flex-item-blockified value.
- Use small CSS-variable bridges for genuinely dynamic values with many
  possible values, such as `Image` `fit` and `aspectRatio`.
- Be careful with optional CSS variables. If a declaration like
  `aspect-ratio: var(--xmlui-aspectRatio-Image)` has no fallback and the
  variable is absent, the property becomes invalid at computed-value time. Use
  fallbacks when there is a meaningful default, and emit dynamic variables only
  when they have a value.
- `Icon` and `Logo` are not yet migrated into this workspace as component
  folders. When they are migrated, start from the old `Icon` and `Logo`
  component structure and apply the same rule: metadata and styles remain in
  the component folder, visual styling belongs in `ComponentName.module.scss`,
  and React inline styles are reserved for layout/style plumbing or small
  CSS-variable bridges.

Component contract boundary:

- Component files should not export compiler-facing `*Contract` objects. That
  extra layer visually pollutes files such as `Button.tsx` and diverges from
  the old project's metadata-centered component organization.
- Compiler contracts are now owned centrally by `compiler/contracts/builtins`.
  Config-safe components may derive contracts from metadata with
  `contractFromMetadata`; runtime-bearing component files that import CSS module
  virtual queries must not be imported by the compiler during Vite config
  loading, so their compiler contracts stay central and hand-written until the
  metadata/runtime boundary is redesigned.
- Do not reintroduce `componentMetadataToContract` or per-component exports such
  as `buttonContract`, `textContract`, or `appContract`.
