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
- `Link`: original `Link.spec.ts` is migrated.
  Verification: `npm --workspace xmlui run test:e2e -- src/components/Link/Link.spec.ts`
  passed 54 tests with 1 old `fixme` skipped. The full migrated E2E suite then
  passed 803 tests with 7 skipped. The component transfer audit reported
  850/1764 old component tests accounted for by transferred old E2E specs.
- `TextBox`: original `TextBox.spec.ts` is copied into the source-adjacent
  component folder, but TextBox migration is not complete until the deferred
  form-owned assertions are closed. Verification so far:
  `npm --workspace xmlui run test -- --run`, `npm --workspace xmlui run
  check:metadata`, and `npm --workspace xmlui run
  compatibility:component-transfer` pass. The component E2E audit now reports
  978/1764 old component tests accounted for. The full copied TextBox suite now
  runs with `143 passed` and `21 skipped/fixme`. The passing surface includes
  basic rendering, initial values, input changes, disabled and read-only states,
  autofocus, native input assistance attributes, core label cases, events,
  APIs, adornments, `PasswordInput`, TextBox theme variables, validation status
  theme variables, width/layout behavior, parts, tooltips, animations, and
  responsive breakpoint width props. Per the 2026-06-20 user decision, the
  copied Form/FormItem validation, require-label, and `bindTo` E2E groups are
  marked fixme and should be completed later when `Form` and `FormItem` are
  migrated.
- `TextArea`: original `TextArea.spec.ts` is copied into the source-adjacent
  component folder. Verification: `npm --workspace xmlui run test -- --run`,
  `npm --workspace xmlui run check:metadata`,
  `npm --workspace xmlui run compatibility:component-transfer`,
  `npm --workspace xmlui run compatibility:component-e2e-audit`, and
  `XMLUI_REUSE_DEV_SERVER=0 npm --workspace xmlui run test:e2e --
  src/components/TextArea/TextArea.spec.ts` pass for the current slice. The
  copied TextArea suite now runs with 134 passing tests and 25 skipped/fixme.
  The passing surface includes rendering, labels, initial values including
  object/function edge cases normalized for current parser limits, multiline
  editing, autosize/min/max rows, assistance attributes, events, APIs,
  integration without form binding, layout width, root layout props, component
  parts, tooltips, animation, and TextArea theme variables across validation
  statuses. Deferred tests cover `Form`/`bindTo`, enter-submit/reset behavior
  through `Form`, require-label modes, validation feedback, and custom variant
  theme variables.
- `NumberBox`: original `NumberBox.spec.ts` and `NumberBox.md` are copied into
  the source-adjacent component folder. Verification:
  `npm --workspace xmlui exec -- tsc -p tsconfig.build.json --noEmit`,
  `npm --workspace xmlui run test -- --run`,
  `npm --workspace xmlui run check:metadata`,
  `npm --workspace xmlui run compatibility:component-transfer`,
  `npm --workspace xmlui run compatibility:component-e2e-audit`, and
  `XMLUI_REUSE_DEV_SERVER=0 npm --workspace xmlui run test:e2e --
  src/components/NumberBox/NumberBox.spec.ts` pass for the current slice. The
  copied NumberBox suite now runs with 185 passing tests and 21 skipped/fixme.
  The passing surface includes rendering, labels, initial values, disabled and
  read-only states, autofocus, min/max/step behavior, spinner buttons, arrow
  keys, integer and zero-positive constraints, scientific notation, partial
  numeric editing states, paste helper coverage, decimal precision stepping,
  events, APIs, adornments, layout width, theme variables across validation
  statuses, parts, tooltips, and animation. Deferred tests cover
  `Form`/`bindTo`, FormItem integration, require-label modes, validation
  feedback, and custom variant theme variables.
- `Switch`: original `Switch.spec.ts` and `Switch.md` are copied into the
  source-adjacent component folder. Verification:
  `npm --workspace xmlui exec -- tsc -p tsconfig.build.json --noEmit`,
  `npm --workspace xmlui run test -- --run`,
  `npm --workspace xmlui run check:metadata`,
  `npm --workspace xmlui run compatibility:component-transfer`,
  `npm --workspace xmlui run compatibility:component-e2e-audit`, and
  `XMLUI_REUSE_DEV_SERVER=0 npm --workspace xmlui run test:e2e --
  src/components/Switch/Switch.spec.ts` pass for the current slice. The copied
  Switch suite now runs with 89 passing tests and 15 skipped/fixme. The passing
  surface includes rendering, labels, checked/value coercion, click/keyboard
  toggling, disabled/read-only states, autofocus, accessibility attributes,
  label positions, events, APIs, switch-specific track/thumb styling, theme
  variables, validation status colors, layout contexts, conditional rendering,
  parts, tooltips, animation smoke coverage, and responsive breakpoint width
  props. Deferred tests cover `Form`/`bindTo`, Form integration, require-label
  modes, and custom variant theme variables.
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
- `Switch` currently preserves the old user-visible toggle behavior directly
  through the migrated internal `Toggle` primitive. Keep the copied Switch E2E
  suite in place whenever shared Toggle behavior changes so primitive changes
  cannot regress Switch track/thumb behavior.
- `Switch` and `Checkbox` copied tests both expect expression `NaN` to coerce
  to checked. Preserve that expectation unless a later compatibility review
  deliberately reconciles it with the old low-level `Toggle` helper.
- Switch focus outline CSS needs explicit literal fallbacks for outline width,
  color, style, and offset. Some old tests override only one outline theme
  variable, and missing fallback custom properties can otherwise compute the
  outline width to `0px`.
- `Toggle`: the old project has `Toggle.tsx`, `Toggle.defaults.ts`, and
  `Toggle.module.scss` as a shared low-level primitive for `Checkbox` and
  `Switch`, but no colocated public E2E suite. In the rewrite, keep Toggle as
  internal shared behavior rather than a public built-in renderer. Verification
  for Toggle changes should run the copied `Checkbox.spec.ts` and
  `Switch.spec.ts` together. Current verification:
  `XMLUI_REUSE_DEV_SERVER=0 npm --workspace xmlui run test:e2e --
  src/components/Checkbox/Checkbox.spec.ts src/components/Switch/Switch.spec.ts`
  passed with 184 tests and 38 existing skips after extracting shared coercion,
  state, autofocus, indeterminate, API, and Switch transition suppression into
  `useToggleController`.
- Keep component visuals in the public component stylesheets even when sharing
  Toggle behavior. The migrated Toggle owns behavior; `Checkbox.module.scss`
  and `Switch.module.scss` own their visible input classes and theme-variable
  declarations.
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
- The current SCSS loader/test shim emits component classes as global class
  names. Avoid generic migrated class names such as `truncateOverflow`,
  `content`, or `icon`; prefix new component classes with the component name
  until CSS module scoping is fully restored. Link initially used a generic
  `truncateOverflow` class and broke Heading's `maxLines` E2E behavior.
- Metadata files imported by compiler contracts can run during Vite config
  loading. If importing `ComponentName.module.scss?xmlui-theme-vars` or a
  renderer would pull virtual CSS queries into that config-time path, keep the
  runtime stylesheet in `main.tsx` or the runtime renderer boundary and use an
  inline `createThemeVar(...)` source string in metadata as a temporary bridge.
- Link currently renders a lightweight visible icon marker for old
  `Link.spec.ts` icon-part assertions instead of importing the full `Icon`
  runtime. Revisit this when the metadata/runtime import boundary is redesigned
  so runtime renderers can depend on other component renderers without pulling
  CSS virtual queries into compiler config loading.
- Large input suites are cross-component compatibility suites in disguise.
  `TextBox.spec.ts` covers `TextBox`, `PasswordInput`, `Form`, `FormItem`,
  `bindTo`, validation summaries, require-label modes, and theme variants.
  Copy the full old spec to preserve the target, but do not mark the component
  complete until every old assertion either passes or is explicitly moved to
  the owning shared-infrastructure slice with a source-linked rationale.
- `PasswordInput` is not a separate component folder in the old project. It is
  declared in `TextBox.tsx` as metadata derived from `TextBoxMd` and rendered
  by forwarding to the themed TextBox renderer with `type="password"`. Preserve
  that source organization in the rewrite.
- When a copied input spec includes `Form`/`FormItem` behavior, keep those tests
  source-adjacent but schedule their completion with the form migration slice
  when the user explicitly defers them. Do not delete or split them merely to
  make the input slice look complete.
- When a component spec is run by path under `src/components`, the Playwright
  config should start only the Vite dev server. Starting production and SSG
  servers for source-adjacent component tests couples the component slice to
  unrelated production-build TypeScript errors.
- TextBox theme variables must be consumed by SCSS through direct
  `var(--xmlui-...)` declarations for the migrated raw SCSS runtime/test shim.
  Sass variable indirection left several old theme assertions reading browser
  defaults even though the generated CSS variables existed on the element.
- Responsive layout attributes such as `width-md` are part of the layout
  contract family. They must be accepted by compiler contracts, filtered from
  arbitrary DOM passthrough, and merged by the runtime adapter according to the
  active viewport.
- Source-adjacent component tests expect the app testbed to start from a
  full-viewport browser baseline. Import a global reset that removes the
  default `body` margin; otherwise percentage width assertions use
  `viewport - 16px`.
- For labeled input components, old E2E tests expect the `testId` root to own a
  descendant with `data-part-id="labeledItem"`. The labeled item itself is not
  the component root in those assertions. Unlabeled inputs, however, expect the
  styled input container to be the component root.
- TextBox-like components need generated input ids when no XMLUI `id` is
  supplied; otherwise clicking a label without an explicit id does not focus
  the underlying input and the old focus event tests fail.
- Old input label positions include aliases `before` and `after`, and their
  visual mapping depends on direction. `before` means label before the input in
  writing direction, so it maps differently for LTR and RTL.
- Config-time component metadata cannot safely import new
  `?xmlui-theme-vars` or `?xmlui-css-module` virtual module paths before the
  Vite plugins are active. Until the metadata/runtime boundary is redesigned,
  TextBox-like components may use a config-safe SCSS source string for
  metadata extraction and import the runtime stylesheet from `src/main.tsx`.
- The lightweight XMLUI CSS module loader does not compile Sass mixins or
  `@include` blocks. Component styles consumed through `?xmlui-css-module`
  should remain plain CSS-compatible after XMLUI theme variable declarations
  are stripped.
- For TextArea-like components, do not duplicate `data-part-id="input"` on
  both the root and the native control. The root should expose
  `data-part-id="root"` and the textarea/input element should own
  `data-part-id="input"`.
- Numeric inputs need a separate editing representation from their committed
  numeric value. NumberBox must preserve partial values such as `-`, `e`,
  `0.`, and malformed in-progress scientific notation while typing, normalize
  replacement/paste input more aggressively, and normalize incomplete decimal
  or exponent states on blur.
- NumberBox spinner arithmetic must round according to the greater decimal
  precision of the current value and step. Plain JavaScript addition exposes
  floating-point noise such as `-0.010000000000000009`, which violates the old
  E2E expectations.
- Checkbox migration status: copied the full old `Checkbox.spec.ts` and
  `Checkbox.md` into `xmlui/src/components/Checkbox/`. The current foundation
  passes 95 E2E tests and keeps 23 skipped/fixme tests visible for deferred
  shared infrastructure: `Form`/`bindTo`, require-label modes, custom variants,
  and `inputTemplate` context variables (`$checked`, `$setChecked`).
- Checkbox boolean coercion has an old-suite-specific edge case: expression
  `NaN` is expected to produce a checked state. Preserve this explicitly even
  though normal JavaScript truthiness would treat `Boolean(NaN)` as false.
- Checkbox label tests expect `testId` on the labeled wrapper but on the native
  input when the component is unlabeled. The wrapper class also needs a
  lowercase `container` substring because old tests query `[class*=container]`.
- Checkbox focus theme tests use public variables like `outlineWidth-Checkbox`,
  not only `outlineWidth-Checkbox--focus`. Keep the non-suffixed variables as
  public aliases for focus styling.
- The current lightweight stylesheet loader strips declarations that reference
  Sass variables. Checkbox theme-backed runtime CSS must use direct
  `var(--xmlui-...)` declarations, as with the TextBox lesson.

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
