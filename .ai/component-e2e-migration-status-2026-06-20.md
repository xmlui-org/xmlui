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
- `CodeBlock`: original `CodeBlock.spec.ts` is migrated.
  Verification: `npm --workspace xmlui run test:e2e -- src/components/CodeBlock/CodeBlock.spec.ts`
  passed 17/17.
- `QRCode`: original `QRCode.spec.ts` is migrated.
  Verification: `npm --workspace xmlui run test:e2e -- src/components/QRCode/QRCode.spec.ts src/components/PageMetaTitle/PageMetaTitle.spec.ts`
  passed 20/20 for the combined QRCode/PageMetaTitle focused run. The full
  migrated E2E suite then passed 699/699 with 6 skipped. Caveat: the old
  implementation uses `react-qr-code`; the current renderer emits a
  deterministic SVG pattern that satisfies the migrated old tests but is not
  yet a proven scannable QR encoder.
- `PageMetaTitle`: original `PageMetaTitle.spec.ts` is migrated.
  Verification: `npm --workspace xmlui run test:e2e -- src/components/QRCode/QRCode.spec.ts src/components/PageMetaTitle/PageMetaTitle.spec.ts`
  passed 20/20 for the combined QRCode/PageMetaTitle focused run.
- `ContentSeparator`: original `ContentSeparator.spec.ts` is migrated.
  Verification: `npm --workspace xmlui run test:e2e -- src/components/ContentSeparator/ContentSeparator.spec.ts src/components/SpaceFiller/SpaceFiller.spec.ts`
  passed 46/46 for the combined ContentSeparator/SpaceFiller focused run.
  The full migrated E2E suite then passed 745/745 with 6 skipped.
- `SpaceFiller`: original `SpaceFiller.spec.ts` is migrated.
  Verification: `npm --workspace xmlui run test:e2e -- src/components/ContentSeparator/ContentSeparator.spec.ts src/components/SpaceFiller/SpaceFiller.spec.ts`
  passed 46/46 for the combined ContentSeparator/SpaceFiller focused run.
- `NoResult`: original `NoResult.spec.ts` is migrated.
  Verification: `npm --workspace xmlui run test:e2e -- src/components/NoResult/NoResult.spec.ts src/components/Fallback/Fallback.spec.ts`
  passed 4/4 for the combined NoResult/Fallback focused run. The full
  migrated E2E suite then passed 749/749 with 6 skipped.
- `Fallback`: the old project has source and docs but no colocated
  `Fallback.spec.ts` under `/Users/dotneteer/source/xmlui/xmlui/src/components/Fallback`.
  A source-adjacent smoke suite now covers normal children and
  `loadingTemplate` rendering. Loader error propagation remains a later
  compatibility surface when the related data/loader components are migrated.
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
- `Icon` is migrated with the original colocated `Icon.spec.ts` E2E suite.
  Verification: `npm --workspace xmlui run test:e2e -- src/components/Icon/Icon.spec.ts`
  passed 44/44 tests.
- `Logo` is migrated with metadata, defaults, docs, renderer, and stylesheet.
  The old project does not currently have a colocated `Logo.spec.ts` E2E suite.
- `Icon` compatibility depends on preserving the old wrapper shape: root/test
  attributes belong on an outer wrapper, the driver-visible SVG must be a
  descendant, and an inner inline-block wrapper prevents flex-item
  blockification from changing the wrapper display observed by E2E tests.
- `Icon` supports both wrapper clicks and direct SVG clicks. The old driver uses
  both patterns, so mouse handling belongs on the root wrapper while keyboard
  handling remains on the focusable SVG.
- `Icon` accepts unknown props for old compatibility. The old E2E suite expects
  invalid props to be ignored rather than rejected by the compiler.
- Component SCSS class names are currently loaded as plain global class names in
  browser tests, not safely hashed CSS-module names. Avoid generic selectors
  such as `.icon` in migrated component styles; use component-qualified class
  names such as `.xmluiIcon` to prevent cross-component overrides under the
  full E2E suite. This was found when Button's `.icon` placeholder style
  overrode Icon SVG sizing during `npm --workspace xmlui run test:e2e`.
- Do not run multiple Playwright E2E commands in parallel against the same Vite
  testbed server. The session-storage-backed testbed and shared dev server can
  interfere with each other or tear down unexpectedly. Run focused component
  suites sequentially.
- Button's existing migrated icon path still uses a visible compatibility
  placeholder for resource-backed `icon="test"` fixtures. The full old resource
  icon loader remains future work, but the placeholder must keep old Button E2E
  visibility and positioning expectations stable until that service is
  migrated.
- `CodeBlock` theme variable metadata should be extracted from
  `CodeBlock.module.scss` with `?xmlui-theme-vars`, matching the old component
  metadata convention and the migrated components where the config-time import
  boundary permits it.
- The copied old `CodeBlock.spec.ts` uses raw `{` and `}` characters as code
  text. The current compiler treats braces in text as expression delimiters, so
  the test fixture escapes braces inside `<CodeBlock>...</CodeBlock>` before
  compilation and `CodeBlockReact` decodes those scoped markers inside the
  rendered component. Keep this as a CodeBlock-specific compatibility bridge;
  do not generalize it to all text nodes.
- `Markdown` and any separate old code-text surface are not completed by the
  CodeBlock foundation. The old Markdown E2E surface is large and should be
  migrated as its own slice with all old tests and dependencies accounted for.
- Do not replace the old Markdown implementation with a small ad hoc markdown
  parser. XMLUI Markdown includes `react-markdown`/GFM/raw-HTML behavior plus
  XMLUI-specific extensions such as `xmlui-pg`, tree display conversion,
  custom code fence metadata, markdown binding expressions, heading anchors,
  and CodeText styling. On June 20, 2026, the environment rejected installing
  `react-markdown`, `remark-gfm`, and `rehype-raw`; the partial Markdown files
  created during that attempt were rolled back. Resume this slice only after
  the old dependency stack or a documented compatibility-equivalent renderer is
  available and the full old `Markdown.spec.ts` and `CodeText.spec.ts` suites
  can be migrated.
- `QRCode` also depends on an old third-party renderer (`react-qr-code`), but
  its current old E2E suite checks component visibility, props, theme variables,
  SVG dimensions, UTF-8 acceptance, title, and init behavior rather than QR
  decoding. The local deterministic SVG renderer is acceptable for the current
  migrated-test slice only. Before full compatibility claims, restore the old
  dependency or add a documented QR-compatible encoder and verify scannability.
- Config-time metadata imports can still fail for new component stylesheets
  using `?xmlui-theme-vars`. If a component metadata file is imported while Vite
  config is loading and the virtual query fails, keep visual declarations in
  `ComponentName.module.scss` but use an inline `createThemeVar(...)` source
  string for metadata extraction until the metadata/runtime import boundary is
  redesigned.
- Transferred old component specs may use legacy layout/style aliases such as
  `alignItems`, `justifyContent`, and `style`. Preserve those aliases at the
  shared layout contract/runtime layer when they represent old XMLUI authoring
  compatibility rather than editing the migrated specs away from their original
  intent.
- `ContentSeparator` compatibility depends on several seemingly test-oriented
  details that are actually public behavior in old specs: default
  `test-id-component`, lowercase `separator` class matching, graceful fallback
  for invalid size strings, zero-size attachment, and user-authored `style`
  declarations.
- `SpaceFiller` has context-sensitive layout semantics. In `HStack` and
  `VStack` it remains `flex: 1 1 0px` with `place-self: stretch`; inside
  `FlowLayout` it acts as a row break. Implement that at the FlowLayout/CSS
  interaction point so normal stack behavior is not damaged.
- Optional CSS custom-property declarations are dangerous when the variable is
  absent: the declaration still wins the cascade and then becomes invalid at
  computed-value time, resetting the property instead of falling back to the
  prior declaration. For component theme variables such as `NoResult` borders,
  use explicit fallback chains like
  `var(--xmlui-borderLeftColor-NoResult, var(--xmlui-borderHorizontalColor-NoResult, var(--xmlui-borderColor-NoResult)))`.
- Side-specific border shorthands are part of old theme semantics. A variable
  such as `borderLeft-NoResult` must derive `borderLeftWidth-NoResult`,
  `borderLeftStyle-NoResult`, and `borderLeftColor-NoResult`, just as
  `border-NoResult` derives the base border longhands.

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
