# Experiment 9: Theming, Layout, and Styling

Status: Implemented for the initial Experiment 9 compatibility slice

## Purpose

Experiment 9 adds the first compatibility-oriented styling layer to the new XMLUI runtime. The goal is not to copy the old style registry wholesale, but to preserve the author-facing behavior that XMLUI apps rely on: universal layout props, theme variables, scoped theme overrides, component parts, state-aware styles, and enough CSS delivery to support old visual tests over time.

This experiment must also decide which styling work belongs to the compiler and which must remain runtime-driven because expressions, theme scopes, routes, data loading, and component state can change after startup.

## Compatibility Baseline

The original XMLUI implementation is the source of truth. The main compatibility references are:

- `/Users/dotneteer/source/xmlui/xmlui/src/components-core/theming/layout-resolver.ts`
- `/Users/dotneteer/source/xmlui/xmlui/src/components-core/theming/component-layout-resolver.ts`
- `/Users/dotneteer/source/xmlui/xmlui/src/components-core/theming/responsive-layout.ts`
- `/Users/dotneteer/source/xmlui/xmlui/src/components-core/theming/ThemeProvider.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components-core/theming/StyleRegistry.ts`
- `/Users/dotneteer/source/xmlui/xmlui/src/components-core/theming/themeVars.ts`
- `/Users/dotneteer/source/xmlui/xmlui/src/components-core/descriptorHelper.ts`
- `/Users/dotneteer/source/xmlui/xmlui/src/abstractions/ThemingDefs.ts`
- `/Users/dotneteer/source/xmlui/xmlui/src/abstractions/RendererDefs.ts`
- `/Users/dotneteer/source/xmlui/website/content/docs/pages/styles-and-themes/layout-props.md`
- `/Users/dotneteer/source/xmlui/website/content/docs/pages/styles-and-themes/theme-variables.md`
- `/Users/dotneteer/source/xmlui/website/content/docs/pages/styles-and-themes/theme-variable-defaults.md`
- `/Users/dotneteer/source/xmlui/website/content/docs/pages/styles-and-themes/themes.md`
- `/Users/dotneteer/source/xmlui/website/content/docs/pages/styles-and-themes/common-units.md`

Observed compatibility facts to preserve:

- Layout props are a universal surface, not component-specific conveniences.
- Theme variable references use `$name` in authoring syntax and become CSS variables with the `--xmlui-` prefix.
- Theme variables follow a structured naming model:
  `<propertyName>-<part-or-aspect>-<ComponentId>-<variant>--<state>`.
- Component styling can target the base component and named component parts.
- Responsive variants use breakpoints compatible with the original framework:
  `sm`, `md`, `lg`, `xl`, and `xxl`.
- State variants include at least `hover`, `focus`, `active`, `focusVisible`, `focusWithin`, and `disabled`.
- Layout resolution expands paired props such as `paddingHorizontal`, `paddingVertical`, `marginHorizontal`, `marginVertical`, `borderHorizontal`, and `borderVertical`.
- Star sizing such as `*` and `2*` maps to flex behavior based on the surrounding layout orientation.
- `wrapContent` and `canShrink` affect flex behavior.
- The old theme layer supports theme chains, tones, built-in themes, generated palettes, resources, fonts, validation, and contrast checks. This experiment only implements the subset required to make the first styled samples and compatibility fixtures meaningful.

## Scope

This experiment implements:

- a shared layout prop inventory based on the original universal layout props;
- a pure layout resolver that converts XMLUI layout props into React-compatible CSS style objects;
- `$themeVar` resolution to `var(--xmlui-themeVar)`;
- root-level default XMLUI theme variables for the initial built-in components;
- a minimal theme provider and scoped `<Theme>` component;
- dynamic styling updates when expression-backed props change;
- initial support for component parts through stable part identifiers;
- initial state and responsive style parsing where it can be tested without a full old-style registry;
- test fixtures and samples that exercise display, data modification, and style changes.

## Non-Goals

This experiment does not complete:

- every built-in XMLUI theme;
- full tone and palette generation;
- strict theme validation and diagnostics;
- accessibility contrast validation;
- full old `StyleRegistry` behavior;
- docs generation from metadata;
- full SSG CSS extraction;
- every responsive and state suffix combination;
- full visual parity for every existing XMLUI component.

Those remain future compatibility steps once the runtime has a stable styling spine.

## Architecture Direction

The styling architecture should be split into small layers:

- **Styling contracts** define supported layout props, theme variable names, component part names, breakpoints, and state suffixes.
- **Layout resolver** converts evaluated prop values into CSS style objects. It must be pure and unit-testable.
- **Theme runtime** owns active theme variables, default variables, scoped overrides, and CSS variable application.
- **Component styling adapter** applies resolved styles and stable part identifiers to rendered components.
- **CSS delivery layer** starts with inline styles and scoped CSS variables, while preserving a path toward generated classes and SSG extraction.

Compiler responsibilities:

- Preserve layout and theme props in component IR.
- Mark static style props as static when possible.
- Keep source locations for future diagnostics.
- Avoid rendering-specific compilation. The compiler may classify style props, but it must not compile a rendered DOM or React tree.

Runtime responsibilities:

- Evaluate expression-backed styling props.
- Resolve theme scopes and CSS variables.
- Recompute styles when state, props, theme, route, or data changes.
- Apply dynamic styles without remounting unrelated component subtrees.

## Initial Compatibility Subset

Start with these layout props because they already affect existing samples or are common in old XMLUI apps:

- sizing: `width`, `minWidth`, `maxWidth`, `height`, `minHeight`, `maxHeight`;
- spacing: `gap`, `padding`, `paddingHorizontal`, `paddingVertical`, `paddingTop`, `paddingRight`, `paddingBottom`, `paddingLeft`, `margin`, `marginHorizontal`, `marginVertical`, `marginTop`, `marginRight`, `marginBottom`, `marginLeft`;
- alignment: `horizontalAlignment`, `verticalAlignment`, `orientation`;
- color and surface: `backgroundColor`, `background`, `color`, `opacity`;
- border: `border`, `borderColor`, `borderStyle`, `borderWidth`, `borderRadius`;
- overflow: `overflowX`, `overflowY`;
- flex behavior: `wrapContent`, `canShrink`, star sizing for width and height;
- text basics: `fontFamily`, `fontSize`, `fontWeight`, `fontStyle`, `textDecoration`, `textAlign`, `whiteSpace`;
- stacking: `zIndex`;
- cursor: `cursor`.

Add the remaining original layout props to the inventory as recognized-but-possibly-deferred entries, so parser/compiler/tooling behavior can reject fewer valid XMLUI apps while runtime support grows.

## Planned Samples

Add samples under `xmlui/src/examples` and route them through the existing example dispatch mechanism:

- `layout-core`: exercises `VStack`, `HStack`, `Text`, `Button`, sizing, spacing, border, background, alignment, and overflow.
- `theme-vars`: defines and consumes `$` theme variables through layout and component props.
- `theme-scope`: proves nested theme overrides affect only their subtree.
- `style-mutation`: mutates data from an event handler and changes rendered styles, such as gap, background color, width, or text color.
- `responsive-state-basics`: introduces a small, testable responsive or state-aware style case if the first resolver slice supports it.

The `style-mutation` sample is required. From this experiment onward, styling work must include at least one user-visible state update path.

## Implementation Steps

### Step 1: Compatibility Audit Note

Create a concise `.ai/` note summarizing the original theming and layout behavior that this experiment intentionally preserves. Include source files, docs, and any behavior that is deferred.

Verification:

- The note references the original files and docs used.
- The note lists implemented and deferred compatibility surfaces.

### Step 2: Styling Contract Inventory

Add a shared module for layout prop names, responsive breakpoints, state suffixes, theme variable prefixing, and component part naming.

Verification:

- Unit tests prove the inventory contains the initial supported props.
- Unit tests prove deferred original props are still recognized as known XMLUI layout props.

### Step 3: Theme Variable Resolution

Implement pure helpers that convert XMLUI theme references to CSS variables:

- `$color-primary` becomes `var(--xmlui-color-primary)`;
- non-theme values pass through unchanged;
- nested or non-string values are handled consistently with the resolver design.

Verification:

- Unit tests cover simple values, non-theme strings, empty values, numeric values, and already-resolved CSS variables.

### Step 4: Core Layout Resolver

Replace the current narrow rendering helper with a pure resolver that handles the initial compatibility subset, paired spacing props, border props, alignment, text basics, overflow, opacity, cursor, and star sizing.

Verification:

- Unit tests cover every supported initial prop group.
- Unit tests cover precedence when both shorthand and side-specific props are present.
- Unit tests cover `$` theme variable values inside layout props.

### Step 5: Layout Context and Star Sizing

Introduce a minimal layout context so child sizing can depend on parent orientation, matching the old flex-oriented behavior closely enough for stacks.

Verification:

- Unit tests cover `width="*"` and `width="2*"` in horizontal layout.
- Unit tests cover `height="*"` and `height="2*"` in vertical layout.
- Runtime tests confirm rendered elements receive the expected flex styles.

### Step 6: Apply Layout Props to Built-Ins

Update built-in components to use the new resolver:

- `App`;
- `VStack`;
- `HStack`;
- `Text`;
- `H1`;
- `Button`;
- `Items`;
- route/navigation components introduced by Experiment 8 where applicable.

Verification:

- Existing tests keep passing.
- New unit or rendering tests prove built-ins forward layout props to their root element.

### Step 7: Default Theme Runtime

Add a minimal default theme variable map and root theme provider. The defaults should be intentionally small but named so future expansion can preserve original XMLUI variable naming.

Verification:

- Unit tests prove default theme variables are exposed with `--xmlui-` names.
- Rendering tests prove `$` values resolve through CSS variables.

### Step 8: Scoped Theme Component

Add a minimal `<Theme>` component that applies theme variable overrides to its subtree.

Verification:

- Rendering tests prove a nested override affects descendants.
- Rendering tests prove sibling subtrees keep the parent value.
- Dynamic update tests prove theme override expressions can react to state changes.

### Step 9: Dynamic Style Updates

Ensure expression-backed style props recompute when state changes.

Verification:

- Add `style-mutation` sample.
- E2E tests click controls and verify visible style changes through computed styles and rendered text.

### Step 10: Component Part Hooks

Add stable part identifiers to the built-ins that need them first. Prefer a small attribute contract such as `data-xmlui-part` or an internal part style hook that can evolve toward the original component-part model.

Verification:

- Unit tests prove expected parts are rendered for selected built-ins.
- Tests avoid relying on incidental DOM structure where possible.

### Step 11: State and Responsive Style Parsing

Implement the first state and responsive suffix parser compatible with the old naming conventions. Keep application narrow until there are fixtures that need the styles.

Verification:

- Unit tests cover parsing of base, part, breakpoint, and state suffixes.
- Rendering tests cover at least one state or responsive style case if the runtime layer applies it in this experiment.

### Step 12: CSS Delivery Strategy

Document and implement the initial CSS delivery strategy:

- inline styles for dynamic layout values;
- scoped CSS variables for theme values;
- stable hooks for future generated classes;
- no full SSG extraction yet, but no architecture decision that blocks it.

Verification:

- Tests prove dynamic style updates do not require full app remounts.
- The `.ai/` finding note records what remains for SSG and hydration.

### Step 13: Samples and Example Routing

Add all planned samples and expose them through the existing example query routing.

Verification:

- Manual dev-server path is documented.
- E2E tests exercise at least `layout-core`, `theme-vars`, `theme-scope`, and `style-mutation`.

### Step 14: Compatibility Test Bridge

Identify a small set of original XMLUI layout or visual tests that can be ported with minimal changes. Port or mirror the highest-value cases that fit the current component subset.

Verification:

- Unit tests cover pure resolver compatibility.
- E2E tests cover browser-computed styles.
- All existing unit, build, and E2E tests pass.

## Success Criteria

Experiment 9 is successful when:

- the new runtime supports the initial universal layout prop subset across core built-ins;
- `$` theme variable references work in layout and component props;
- scoped theme overrides work;
- expression-backed style props update after data mutation;
- the architecture can grow toward component parts, responsive styles, visual tests, SSG, and hydration without replacing the resolver;
- existing tests pass;
- new unit and E2E tests prove the styling behavior with rendered output.

## Implementation Result

Implemented:

- shared styling contracts, theme helpers, layout resolver, and selector-key parser;
- universal layout prop exposure in Managed React contracts for the initial built-ins;
- minimal runtime theme root, default CSS variables, and scoped `<Theme>` component;
- layout prop application to `App`, `AppHeader`, `H1`, `Stack`, `HStack`, `VStack`, `Text`, `Button`, `Items`, inputs, navigation, and selected shell components;
- stable `data-xmlui-component` and `data-xmlui-part` hooks;
- examples for `layoutCore`, `themeVars`, `themeScope`, `styleMutation`, and `responsiveStateBasics`;
- unit tests for styling contracts, theme variable resolution, layout expansion, star sizing, selector parsing, and contract acceptance;
- E2E tests for layout props, theme variables, theme scoping, and mutation-driven style updates.

Verification:

- `npm --workspace xmlui run test` passed with 22 files and 193 tests.
- `npm --workspace xmlui run build` passed; Vite still reports the pre-existing large chunk warning.
- `npm run test:e2e` passed with 39 tests.

## Risks and Open Questions

- The original style registry has many subtle interactions among theme variables, component parts, variants, and states. This experiment must avoid prematurely freezing a simplified model that cannot grow into those interactions.
- Inline styles are the fastest way to validate behavior, but old visual tests and SSG may eventually require generated classes or extracted CSS.
- The old theme provider performs validation, palette generation, font/resource handling, and contrast checks. The first theme runtime should leave explicit extension points for those features.
- Component parts must be stable enough for tests and future styling, but the runtime should not expose accidental DOM details as public contract.
- Responsive and state style syntax may need a more complete parser before broad component styling is enabled.
