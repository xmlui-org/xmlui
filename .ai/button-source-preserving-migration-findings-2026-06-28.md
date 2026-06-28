# Button Source-Preserving Migration Findings

Date: 2026-06-28

## Source Files

- Copied from `/Users/dotneteer/source/xmlui/xmlui/src/components/Button`:
  - `ButtonReact.tsx`
  - `Button.module.scss`
  - `Button.defaults.ts`
- Kept `Button.tsx` as the rewrite metadata/renderer boundary.
- Did not edit `Button.spec.ts` or `Button-style.spec.ts`.

## Compatibility Work

- Renderer maps rewrite props/events/root attrs into the old React component:
  `enabled` to `disabled`, label/children precedence, focus/context/click
  events, `classes[COMPONENT_PART_KEY]`, and `data-testid`.
- Renderer converts the public `icon` string to a `ThemedIcon` React node, so
  Button depends on the already migrated Icon provider/registry path.
- Added old-compatible shims for `Part`, `VisuallyHidden`,
  `components-core/parts`, `components-core/theming/responsive-layout`, and
  Button abstraction aliases.
- Declared concrete Button variant/state theme variable names in metadata,
  because the current SCSS extractor does not expand Sass-interpolated
  `createThemeVar()` calls from the copied old SCSS.

## Shared Findings

- Source-preserved Button exposed a shared theme-pipeline issue: Button
  hover/active tone fallbacks were generated, then overwritten by default
  component variables. Generated Button tone variables must be merged after base
  variables.
- Border shorthand precedence must match old behavior. Shorthand `border-*`
  fills missing longhands and can feed hover fallbacks, but explicit longhands
  such as `borderColor-*` override shorthand-derived colors.
- The Button documentation visual case with `width="200px"`, `icon="drive"`,
  and `contentPosition` center/start/end exposed an embedded Icon bridge issue:
  standalone Icon received `rootAttrs().style`, but `ThemedIcon` only applied
  the theme class. In the rewrite, component theme CSS variables live in the
  returned style object, so embedded icons were `0px`. `ThemedIcon` now merges
  `themeClass.style` with caller style, restoring visible default icon sizing.
- A follow-up visual check showed Button padding, border radius, and font size
  were still off. The copied SCSS requests variant-specific vars such as
  `fontSize-Button-primary-solid` and `borderRadius-Button-primary-solid`; old
  theming fills those from hierarchical fallbacks. The rewrite now resolves
  declaration fallback names while emitting component CSS variables, so the
  reported markup computes to `14px` font, `4px` radius, and `33px` height.
- The old Button docs use `iconPosition="right"`. Old `ButtonReact` treats
  every non-`start` value as the trailing position, so the icon appears after
  the label. The rewrite renderer now preserves that legacy alias explicitly by
  mapping `right` to `end` and `left` to `start`.
- A visual check of `themeColor="secondary"` showed the secondary solid button
  border color was too close to the fill tone. Old metadata provides
  `borderColor-Button-secondary` as a light border default, while copied SCSS
  asks for `borderColor-Button-secondary-solid`. Generated Button tones must
  resolve the same hierarchical fallback names used during CSS variable
  emission, so the specific `*-secondary-solid` lookup can find the old
  `*-secondary` default instead of falling back to generated tone colors.
- A visual check with Button children under `<Theme width-Button="120px">`
  inside an `HStack` showed the scoped Theme wrapper was participating in
  layout. Old Theme renders the non-root scope wrapper with `display: contents`,
  so themed children remain layout-transparent to parent flex containers. The
  rewrite `ThemeScope` now applies `display: contents` while still carrying the
  scoped CSS variables.
- This validates the migration diagnostic hypothesis: with copied React/SCSS
  and unchanged specs, the remaining failures were in shared rendering/theming
  infrastructure, not Button's old source.

## Verification

- `npx tsc -p xmlui/tsconfig.build.json --noEmit`
- `npm --workspace xmlui run test:e2e -- src/components/Button/Button.spec.ts src/components/Button/Button-style.spec.ts --workers=1`
  - 153 passed, 6 skipped
- `npm --workspace xmlui run test:e2e -- src/components/Icon/Icon.spec.ts src/components/Button/Button.spec.ts src/components/Button/Button-style.spec.ts --workers=1`
  - 197 passed, 6 skipped
- `npm --workspace xmlui run test:e2e -- src/components/Theme/Theme.spec.ts src/components/Button/Button.spec.ts src/components/Button/Button-style.spec.ts --workers=1`
  - 158 passed, 6 skipped
- `npm --workspace xmlui run test:e2e -- src/components/ProgressBar/ProgressBar.spec.ts src/components/Avatar/Avatar.spec.ts src/components/Icon/Icon.spec.ts src/components/Button/Button.spec.ts src/components/Button/Button-style.spec.ts --workers=1`
  - 315 passed, 6 skipped
- Browser probe for the reported markup measured the embedded `drive` SVG at
  about `19.2px` square after the fix, instead of `0px`.
- Browser probe after theme fallback emission measured the reported Button
  defaults at `14px` font size, `4px` border radius, `7px 14px` padding, and
  `33px` height.
- Browser probe for the `iconPosition="right"` docs markup confirmed the
  `Right` icon is after the text in LTR, and `start`/`end` still flip correctly
  under `direction="rtl"`.
- Browser probe for the reported secondary themeColor markup measured the
  secondary solid button with a `1px` solid border and light secondary border
  color after fallback lookup was corrected.
- The reported Theme/Button/HStack markup now uses a layout-transparent Theme
  scope instead of a normal wrapper box, matching the original horizontal layout
  contract.

## Residual Risk

- Full repository-wide `npm --workspace xmlui run test:e2e` was not rerun in
  this closure. The required side-by-side migrated component gate is green.
