# SCSS to Runtime CSS Migration Plan

## Executive Summary

This document outlines a comprehensive, low-risk migration strategy to transition XMLUI components from SCSS-based styling to runtime JS-to-CSS generation using the `useStyles` hook and dynamic CSS injection. The migration will be incremental, component-by-component, with the Avatar component serving as the prototype.

## Goals

1. **Eliminate SCSS/CSS files** - Replace static stylesheet files with JavaScript-based style definitions
2. **Runtime CSS generation** - Use `useStyles` hook for dynamic class name generation and style injection
3. **Declarative styling** - Maintain or improve the declarative nature of component styling
4. **Zero breaking changes** - Existing components and tests continue to work throughout migration
5. **Gradual migration** - Enable coexistence of old and new approaches during transition
6. **Performance optimization** - Leverage runtime CSS benefits (tree-shaking, code splitting, dynamic theming)

## Current Architecture Analysis

### Current SCSS-Based Approach

**Components involved:**
- `AvatarNative.tsx` - React component implementation
- `Avatar.module.scss` - SCSS styles with theme variables
- `Avatar.tsx` - Component renderer with metadata
- `Avatar.spec.ts` - E2E test suite (1993 lines)

**SCSS Structure:**
```scss
// Theme variable registration
$themeVars: ();
@function createThemeVar($componentVariable) {
  $themeVars: t.appendThemeVar($themeVars, $componentVariable) !global;
  @return t.getThemeVar($themeVars, $componentVariable);
}

// Variable definitions (top-level)
$backgroundColor-Avatar: createThemeVar("backgroundColor-#{$component}");
$boxShadow-Avatar: createThemeVar("boxShadow-#{$component}");
$textColor-Avatar: createThemeVar("textColor-#{$component}");

// CSS Layers with styles
@layer components {
  .container {
    background-color: $backgroundColor-Avatar;
    color: $textColor-Avatar;
    // ... more styles
    
    &.xs { width: t.$space-8; }
    &.sm { width: t.$space-12; }
    &.md { width: t.$space-16; }
    // ... size variants
  }
}

// Export for component metadata
:export {
  themeVars: t.json-stringify($themeVars);
}
```

**Current Flow:**
1. SCSS compiled at build time → CSS files
2. `createThemeVar()` registers variables in SCSS
3. Variables exported via `:export` block
4. Component imports styles via `import styles from "./Avatar.module.scss"`
5. ClassNames applied: `styles.container`, `styles.xs`, etc.
6. Theme variables become CSS custom properties: `var(--xmlui-backgroundColor-Avatar)`

### Target Runtime CSS Approach

**Inspired by:** `CoreBehaviors.tsx` - `VariantWrapper` component

**New Flow:**
1. Define styles in JavaScript/TypeScript objects
2. Call `useStyles(styleObject)` → generates unique className
3. `StyleRegistry.register()` creates hash and CSS string
4. CSS injected into DOM via `<style>` tag with `@layer dynamic`
5. Theme variables referenced as CSS custom properties
6. Component applies generated className

**Key APIs:**
- `useStyles(styles)` - Main hook for style injection
- `useComponentStyle(styles)` - Wrapper for component-level styles
- `toCssVar(varName)` - Converts `$varName` to `var(--xmlui-varName)`
- `parseLayoutProperty()` - Parses theme variable structure
- `toCssPropertyName()` - Converts camelCase to kebab-case

## Migration Strategy

### Phase 1: Prototype Implementation (Avatar2)

**Objective:** Create Avatar2 as proof-of-concept with complete test coverage

**Steps:**

#### 1.1 Create Avatar2 Component Structure

**Files to create:**
- `Avatar2Native.tsx` - New implementation with runtime CSS
- `Avatar2.tsx` - Component renderer (clone of Avatar.tsx)
- `Avatar2.spec.ts` - Cloned test suite from Avatar.spec.ts

**Why separate files:**
- Zero impact on existing Avatar component
- Can compare implementations side-by-side
- Easy rollback if issues discovered
- Both versions can coexist during testing

#### 1.2 Define Runtime Style Object

**Create:** `Avatar2Styles.ts` (new pattern)

```typescript
import { toCssVar } from "../../components-core/theming/layout-resolver";
import type { CSSProperties } from "react";

// Theme variable references
const THEME_VARS = {
  backgroundColor: toCssVar("$backgroundColor-Avatar"),
  boxShadow: toCssVar("$boxShadow-Avatar"),
  textColor: toCssVar("$textColor-Avatar"),
  fontWeight: toCssVar("$fontWeight-Avatar"),
  borderRadius: toCssVar("$borderRadius-Avatar"),
  borderWidth: toCssVar("$borderWidth-Avatar"),
  borderStyle: toCssVar("$borderStyle-Avatar"),
  borderColor: toCssVar("$borderColor-Avatar"),
};

// Base container styles
export const avatarContainerStyle: Record<string, CSSProperties[keyof CSSProperties]> = {
  aspectRatio: "1 / 1",
  backgroundColor: THEME_VARS.backgroundColor,
  color: THEME_VARS.textColor,
  flexShrink: 0,
  objectFit: "cover",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: THEME_VARS.fontWeight,
  whiteSpace: "nowrap",
  userSelect: "none",
  fontSize: "12px",
  boxShadow: THEME_VARS.boxShadow,
  borderRadius: THEME_VARS.borderRadius,
  borderWidth: THEME_VARS.borderWidth,
  borderStyle: THEME_VARS.borderStyle,
  borderColor: THEME_VARS.borderColor,
};

// Size variant styles
export const avatarSizeStyles = {
  xs: {
    width: "var(--xmlui-space-8)",
    height: "var(--xmlui-space-8)",
    fontSize: "var(--xmlui-space-3)",
  },
  sm: {
    width: "var(--xmlui-space-12)",
    height: "var(--xmlui-space-12)",
    fontSize: "var(--xmlui-space-4)",
  },
  md: {
    width: "var(--xmlui-space-16)",
    height: "var(--xmlui-space-16)",
    fontSize: "var(--xmlui-space-5)",
  },
  lg: {
    width: "var(--xmlui-space-24)",
    height: "var(--xmlui-space-24)",
    fontSize: "var(--xmlui-space-8)",
  },
};

// Clickable state styles
export const avatarClickableStyle = {
  cursor: "pointer",
};
```

#### 1.3 Implement Avatar2Native Component

```typescript
import { forwardRef, memo, useMemo } from "react";
import { useComponentStyle } from "../../components-core/theming/StyleContext";
import { 
  avatarContainerStyle, 
  avatarSizeStyles, 
  avatarClickableStyle 
} from "./Avatar2Styles";

export const Avatar2 = memo(forwardRef(function Avatar2(
  { size = "sm", url, name, style, className, onClick, ...rest },
  ref
) {
  // Generate styles using useComponentStyle
  const baseClassName = useComponentStyle(avatarContainerStyle);
  const sizeClassName = useComponentStyle(avatarSizeStyles[size] || avatarSizeStyles.sm);
  const clickableClassName = onClick ? useComponentStyle(avatarClickableStyle) : "";
  
  // Combine classNames
  const combinedClassName = [
    className,
    baseClassName,
    sizeClassName,
    clickableClassName
  ].filter(Boolean).join(" ");
  
  // ... rest of implementation identical to Avatar
}));
```

**Key differences:**
- No `import styles from "./Avatar.module.scss"`
- Use `useComponentStyle()` for each style group
- Combine generated classNames instead of SCSS module references
- All style logic in JavaScript/TypeScript

#### 1.4 Register Avatar2 Component

**Update:** `Avatar2.tsx`

```typescript
// Same metadata structure as Avatar.tsx
export const Avatar2Md = createMetadata({
  status: "experimental", // Mark as experimental during prototype phase
  description: "...",
  props: { /* same as Avatar */ },
  events: { /* same as Avatar */ },
  themeVars: [
    "backgroundColor-Avatar",
    "boxShadow-Avatar",
    "textColor-Avatar",
    "fontWeight-Avatar",
    "borderRadius-Avatar",
    "borderWidth-Avatar",
    "borderStyle-Avatar",
    "borderColor-Avatar",
  ], // Explicitly list instead of parseScssVar
  defaultThemeVars: {
    // Same as Avatar
  },
});

export const avatar2ComponentRenderer = createComponentRenderer(
  "Avatar2",
  Avatar2Md,
  ({ node, extractValue, lookupEventHandler, className, extractResourceUrl }) => {
    return (
      <Avatar2
        className={className}
        size={node.props?.size}
        url={node.props.url ? extractResourceUrl(node.props.url) : undefined}
        name={extractValue(node.props.name)}
        onClick={lookupEventHandler("click")}
      />
    );
  },
);
```

#### 1.5 Clone and Adapt Test Suite

**Create:** `Avatar2.spec.ts`

```typescript
// Clone entire Avatar.spec.ts
// Replace all "Avatar" references with "Avatar2"
// Use find-and-replace: <Avatar → <Avatar2

test.describe("smoke tests", { tag: "@smoke" }, () => {
  test("No initials without name", async ({ initTestBed, createAvatar2Driver }) => {
    await initTestBed(`<Avatar2 />`);
    await expect((await createAvatar2Driver()).component).toBeEmpty();
  });
  
  // ... all other tests updated
});
```

**Test driver:** May need to create `createAvatar2Driver` in test fixtures if Avatar-specific

#### 1.6 Validation Checklist

- [ ] All 1993 lines of tests passing for Avatar2
- [ ] Visual regression tests pass (pixel-perfect comparison with Avatar)
- [ ] Theme variables resolve correctly
- [ ] Size variants render identically
- [ ] Click behavior works (including keyboard accessibility)
- [ ] Performance metrics acceptable (measure class name generation overhead)
- [ ] SSR/hydration works correctly
- [ ] Dynamic theme switching works
- [ ] Bundle size impact analyzed

### Phase 2: Pattern Refinement

**Objective:** Optimize the pattern based on Avatar2 learnings

**Activities:**

#### 2.1 Performance Analysis

**Metrics to measure:**
- Initial render time (Avatar vs Avatar2)
- Re-render performance
- Bundle size difference
- CSS injection overhead
- Memory usage (style cache)
- Style computation time

**Tools:**
- React DevTools Profiler
- Chrome Performance tab
- Bundle analyzer
- Custom performance markers

#### 2.2 Developer Experience Review

**Questions:**
- Is the style definition syntax intuitive?
- How verbose is the new approach vs SCSS?
- Are type errors helpful?
- Is debugging easier or harder?
- What's the learning curve?

#### 2.3 Create Helper Utilities

Based on Avatar2 experience, create reusable patterns:

```typescript
// Helper: Create style object with theme variables
export function createThemedStyles<T extends string>(
  componentName: string,
  varNames: T[]
): Record<T, string> {
  const result = {} as Record<T, string>;
  varNames.forEach(varName => {
    result[varName] = toCssVar(`$${varName}-${componentName}`);
  });
  return result;
}

// Usage:
const AVATAR_THEME = createThemedStyles("Avatar", [
  "backgroundColor",
  "textColor",
  "boxShadow"
]);
// → { backgroundColor: "var(--xmlui-backgroundColor-Avatar)", ... }
```

```typescript
// Helper: Compose multiple style objects conditionally
export function composeStyles(
  ...styleGroups: Array<Record<string, any> | undefined | null | false>
): Record<string, any> {
  return Object.assign({}, ...styleGroups.filter(Boolean));
}

// Usage:
const styles = composeStyles(
  baseStyles,
  isClickable && clickableStyles,
  size && sizeStyles[size]
);
```

```typescript
// Helper: Create variant styles
export function createVariantStyles<K extends string>(
  baseStyle: Record<string, any>,
  variants: Record<K, Record<string, any>>
): { base: Record<string, any>; variants: typeof variants } {
  return { base: baseStyle, variants };
}
```

#### 2.4 Documentation Creation

**Create:** `runtime-css-component-guide.md`

Contents:
- How to convert SCSS to runtime CSS
- Pattern examples
- Common pitfalls
- Migration checklist
- Testing guidelines
- Performance best practices

#### 2.5 Pattern Validation

**Test pattern on 2-3 additional simple components:**
- Badge (simple, has variants)
- Spinner (simple, has sizes and colors)
- Checkbox (medium complexity, has states)

**Success criteria:**
- Pattern works for different component types
- Helper utilities reduce boilerplate
- Tests pass with minimal changes
- Performance acceptable across components

### Phase 3: Incremental Component Migration

**Objective:** Systematically migrate all components

#### 3.1 Migration Priority Matrix

**Factors to consider:**
1. Component complexity (simple → complex)
2. Usage frequency (high usage = higher priority)
3. Test coverage (well-tested = lower risk)
4. Dependencies (leaf components first)
5. Active development (low churn = better timing)

**Suggested order:**

**Tier 1: Simple components (1-2 weeks)**
- Avatar ✅ (prototype complete)
- Badge
- Spinner
- SpaceFiller
- ContentSeparator
- ProgressBar
- Logo

**Tier 2: Form components (2-3 weeks)**
- Checkbox
- Switch
- RadioGroup
- RadioItem
- Toggle
- ToneSwitch

**Tier 3: Input components (3-4 weeks)**
- TextBox
- NumberBox
- Password
- TextArea
- DateInput
- TimeInput
- Select
- AutoComplete
- ColorPicker
- FileInput
- Slider

**Tier 4: Layout components (2-3 weeks)**
- Stack (HStack, VStack)
- FlowLayout
- Card
- Page
- PositionedContainer
- StickyBox

**Tier 5: Complex components (4-6 weeks)**
- Button (variants, icons, complex styling)
- Table
- Tabs
- Accordion
- Carousel
- Tree
- NavPanel
- Pagination
- Markdown

**Tier 6: Composite components (3-4 weeks)**
- Form
- FormItem
- ModalDialog
- Tooltip
- HoverCard
- DropdownMenu
- App
- AppHeader

#### 3.2 Per-Component Migration Process

**For each component:**

1. **Preparation (0.5 days)**
   - Review current SCSS implementation
   - Identify all theme variables used
   - Document size variants, states, parts
   - Check test coverage
   - Create migration issue/ticket

2. **Implementation (1-2 days)**
   - Create `{Component}Styles.ts` with style definitions
   - Update `{Component}Native.tsx` to use `useComponentStyle`
   - Update `{Component}.tsx` metadata (themeVars array)
   - Remove SCSS imports
   - Test locally

3. **Testing (0.5-1 day)**
   - Run component-specific tests
   - Run visual regression tests
   - Test theme switching
   - Test size variants
   - Test state changes (hover, focus, disabled)
   - Test SSR/hydration

4. **Review & Cleanup (0.5 days)**
   - Code review
   - Address feedback
   - Update documentation
   - Remove SCSS file (mark as deprecated first)

5. **Merge & Monitor (ongoing)**
   - Merge to main branch
   - Monitor error rates
   - Watch performance metrics
   - Gather developer feedback

**Total time per component:** 2.5-4 days (depends on complexity)

#### 3.3 Automation Opportunities

**Create migration scripts:**

```bash
# scripts/migrate-component-to-runtime-css.sh
#!/bin/bash
# Automates repetitive migration tasks:
# 1. Create {Component}Styles.ts template
# 2. Extract theme variables from SCSS
# 3. Generate style objects
# 4. Update imports in Native component
# 5. Create migration checklist

./scripts/migrate-component-to-runtime-css.sh Avatar
```

**Codemod for common patterns:**
```javascript
// Transform SCSS imports to style imports
// Transform classnames usage
// Update theme variable references
```

### Phase 4: SCSS Infrastructure Removal

**Objective:** Remove SCSS build infrastructure once all components migrated

#### 4.1 Gradual Deprecation

1. **Mark SCSS files as deprecated** (add comments)
2. **Create deprecation warnings** in build logs
3. **Update documentation** to recommend runtime CSS
4. **Monitor usage** to ensure no components left behind

#### 4.2 Build Configuration Updates

**When all components migrated:**

1. Remove SCSS loaders from Vite config
2. Remove SCSS dependencies from package.json
3. Remove `*.module.scss` from source tree
4. Remove SCSS theme utilities (`_themes.scss`, etc.)
5. Update build scripts
6. Update CI/CD pipelines

#### 4.3 Documentation Updates

- Update component development guide
- Update theming documentation
- Create migration retrospective
- Document lessons learned
- Update contributor guidelines

### Phase 5: Optimization & Polish

**Objective:** Optimize the new system based on production experience

#### 5.1 Performance Optimization

**Potential optimizations:**
- Style object memoization strategies
- CSS deduplication improvements
- Bundle size optimization
- Critical CSS extraction for SSR
- Style computation caching
- Lazy style loading for code-split components

#### 5.2 Developer Tooling

**Create:**
- VS Code snippets for common patterns
- ESLint rules for style definitions
- TypeScript types for style objects
- Theme variable auto-completion
- Style debugging utilities

#### 5.3 Advanced Features

**Possible additions:**
- Style composition utilities
- Animation helpers
- Responsive breakpoint helpers
- Dark mode utilities
- RTL (right-to-left) support helpers
- Media query helpers

## Risk Mitigation

### Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Performance regression | Medium | High | Measure before/after, optimize hot paths, benchmark continuously |
| Bundle size increase | Low | Medium | Analyze bundle, implement code splitting, lazy load styles |
| Theme variable resolution breaks | Low | High | Extensive testing, gradual rollout, feature flags |
| SSR/hydration issues | Medium | High | Test SSR thoroughly, validate hydration, monitor production |
| Browser compatibility issues | Low | Medium | Test in all supported browsers, use fallbacks |
| Test failures during migration | High | Medium | Clone tests first, update incrementally, maintain both versions |
| Developer adoption resistance | Medium | Low | Clear documentation, training sessions, highlight benefits |
| Regression in visual appearance | Medium | High | Visual regression tests, pixel comparison, manual QA |

### Mitigation Strategies

#### 1. Feature Flags

```typescript
// Enable gradual rollout
const USE_RUNTIME_CSS = {
  Avatar: true,    // Migrated
  Badge: true,     // Migrated
  Button: false,   // Not yet migrated
  // ...
};

// In component renderer
export const avatarComponentRenderer = createComponentRenderer(
  COMP,
  AvatarMd,
  (context) => {
    if (USE_RUNTIME_CSS.Avatar) {
      return <Avatar2 {...props} />;
    }
    return <Avatar {...props} />;
  }
);
```

#### 2. A/B Testing

- Deploy both versions to production
- Route percentage of traffic to new version
- Monitor metrics (performance, errors, user feedback)
- Gradual rollout: 5% → 25% → 50% → 100%

#### 3. Rollback Strategy

```typescript
// Quick rollback mechanism
if (FORCE_SCSS_COMPONENTS || runtimeError) {
  return <AvatarOriginal {...props} />;
}
```

#### 4. Monitoring & Alerting

- Track component render times
- Monitor CSS injection errors
- Alert on bundle size increases
- Track style cache hit rates
- Monitor memory usage

#### 5. Parallel Testing

- Run both versions in CI
- Compare visual outputs
- Validate theme resolution
- Check performance benchmarks

## Success Metrics

### Quantitative Metrics

1. **Migration Progress**
   - % of components migrated
   - % of SCSS files removed
   - % of tests passing

2. **Performance**
   - Initial render time ≤ current + 5%
   - Re-render time ≤ current + 3%
   - Bundle size ≤ current + 10%
   - Style injection time < 1ms per component

3. **Quality**
   - Test coverage ≥ current coverage
   - Zero regression bugs in production
   - Visual regression test pass rate = 100%

4. **Developer Experience**
   - Migration time per component ≤ 4 days
   - Code review cycle time ≤ 2 days
   - Developer satisfaction score ≥ 4/5

### Qualitative Metrics

1. **Code Quality**
   - More maintainable code
   - Better type safety
   - Easier to debug
   - More flexible styling

2. **Developer Feedback**
   - Clear mental model
   - Good documentation
   - Helpful error messages
   - Smooth migration process

## Timeline Estimate

### Conservative Estimate (Recommended)

- **Phase 1** (Prototype): 3-4 weeks
- **Phase 2** (Refinement): 2-3 weeks
- **Phase 3** (Migration): 16-24 weeks
  - Tier 1: 2 weeks
  - Tier 2: 3 weeks
  - Tier 3: 4 weeks
  - Tier 4: 3 weeks
  - Tier 5: 6 weeks
  - Tier 6: 4 weeks
- **Phase 4** (Cleanup): 2-3 weeks
- **Phase 5** (Optimization): 3-4 weeks

**Total: 26-38 weeks (6-9 months)**

### Aggressive Estimate

- Assumes dedicated team
- Multiple components in parallel
- Automated migration tools
- **Total: 16-20 weeks (4-5 months)**

## Immediate Next Steps

1. **Week 1-2: Avatar2 Prototype**
   - [ ] Create Avatar2Native.tsx with runtime CSS
   - [ ] Create Avatar2Styles.ts
   - [ ] Clone and update Avatar2.spec.ts
   - [ ] Run all tests
   - [ ] Visual regression testing

2. **Week 3: Performance Validation**
   - [ ] Benchmark Avatar vs Avatar2
   - [ ] Analyze bundle size impact
   - [ ] Test SSR/hydration
   - [ ] Profile render performance

3. **Week 4: Pattern Documentation**
   - [ ] Create migration guide
   - [ ] Document helper utilities
   - [ ] Create code examples
   - [ ] Get team feedback

4. **Week 5: Pilot Additional Components**
   - [ ] Migrate Badge
   - [ ] Migrate Spinner
   - [ ] Validate pattern scales

5. **Week 6: Decision Point**
   - [ ] Review all metrics
   - [ ] Team retrospective
   - [ ] Go/No-Go decision
   - [ ] Finalize migration schedule

## Open Questions

1. **Should we create a compatibility layer** to support SCSS during transition?
2. **How do we handle shared SCSS mixins and utilities** (e.g., `@include t.borderVars`)?
3. **Should we create TypeScript types** for all style objects?
4. **What's the strategy for runtime theme customization** (user-defined themes)?
5. **How do we handle CSS specificity conflicts** between SCSS and runtime CSS?
6. **Should we use CSS modules hash format** for backward compatibility?
7. **What's the approach for @layer ordering** (SCSS uses `@layer components`, runtime uses `@layer dynamic`)?
8. **How do we handle CSS preprocessing features** we currently use (variables, mixins, functions)?
9. **Should style objects be colocated** with components or in separate files?
10. **What's the testing strategy** for theme variable resolution?

## Conclusion

This migration plan provides a structured, low-risk approach to transitioning from SCSS to runtime CSS generation. By starting with the Avatar component as a prototype and gradually expanding to other components, we can validate the approach, refine the pattern, and ensure quality throughout the migration.

The key to success is:
- **Incremental progress** - One component at a time
- **Comprehensive testing** - No regressions
- **Clear metrics** - Measure everything
- **Team alignment** - Regular communication
- **Flexibility** - Adapt based on learnings

With careful execution, this migration will result in a more maintainable, flexible, and performant styling system for XMLUI.
