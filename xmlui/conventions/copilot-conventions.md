# XMLUI Coding Conventions

## Default Values Convention

### Overview

XMLUI components follow a specific pattern for handling default values to ensure consistency between the component metadata and their React Native implementations. The convention ensures that default values are defined in a single location and referenced throughout the codebase, preventing duplication and inconsistencies.

### Convention Rules

1. **Define Default Values in Native Component**:
   - Default values should be defined in a `defaultProps` object in the Native component implementation file (e.g., `ComponentNameNative.tsx`).
   - The `defaultProps` object should explicitly type which properties it's defining defaults for using TypeScript's `Pick` type.

2. **Reference Default Values in Component Implementation**:
   - When destructuring props in the component implementation, reference the `defaultProps` values as defaults.
   - Example: `{ propName = defaultProps.propName } = props`

3. **Reference Default Values in Component Metadata**:
   - In the component metadata file (e.g., `ComponentName.tsx`), import the `defaultProps` from the Native component.
   - Use these default values in the component metadata's `defaultValue` fields.
   - Example: `defaultValue: defaultProps.propName`

4. **Resolution of Inconsistencies**:
   - If inconsistencies are found between metadata and implementation, the XMLUI (metadata) default value prevails.
   - Update the implementation to match the metadata default value.

### Example Implementation

#### ComponentNameNative.tsx
```typescript
type Props = {
  size?: string;
  color?: string;
  // other props...
};

export const defaultProps: Pick<Props, "size" | "color"> = {
  size: "medium",
  color: "primary",
};

export const ComponentName = forwardRef(function ComponentName(
  { 
    size = defaultProps.size,
    color = defaultProps.color,
    // other props with defaults...
  }: Props,
  forwardedRef: ForwardedRef<HTMLDivElement>
) {
  // Component implementation...
});
```

#### ComponentName.tsx
```typescript
import { createMetadata } from "../../abstractions/ComponentDefs";
import { ComponentName, defaultProps } from "./ComponentNameNative";

export const ComponentNameMd = createMetadata({
  props: {
    size: {
      description: "The size of the component",
      valueType: "string",
      defaultValue: defaultProps.size,
    },
    color: {
      description: "The color of the component",
      valueType: "string", 
      defaultValue: defaultProps.color,
    },
    // other props...
  },
  // other metadata...
});

export const componentNameComponentRenderer = createComponentRenderer(
  "ComponentName",
  ComponentNameMd,
  ({ node, extractValue, layoutCss }) => {
    return (
      <ComponentName
        size={extractValue(node.props.size)}
        color={extractValue(node.props.color)}
        style={layoutCss}
      >
        {/* component content */}
      </ComponentName>
    );
  }
);
```

### Common Mistakes to Avoid

1. **Duplicate Default Definitions**:
   - Don't define default values both in `defaultProps` and inline in the component.
   
2. **Inconsistent Types**:
   - Ensure the type of default values is the same in both metadata and implementation (e.g., `"0.1"` string vs `0.1` number).

3. **Setting `defaultProps` on ComponentMetadata**:
   - The `ComponentMetadata` type doesn't have a `defaultProps` property, so avoid lines like:
   ```typescript
   // Do NOT do this as it causes TypeScript errors
   ComponentNameMd.defaultProps = defaultProps;
   ```

4. **Incomplete Default Props Coverage**:
   - Make sure all props with default values follow this convention, not just some of them.

By following these conventions, we ensure that default values are consistently defined and referenced throughout the XMLUI codebase, making maintenance easier and reducing the likelihood of bugs related to default values.

## GitHub Copilot Conventions

### Conversation Context Summary

When GitHub Copilot summarizes the conversation context for the XMLUI project, it should include the following:

1. **Include Conventions File**:
   - Always read the content of the `/Users/dotneteer/source/xmlui/xmlui/conventions/copilot-conventions.md` file into the context summary.
   - This ensures that all conventions are available to Copilot when continuing work on the project.

2. **Maintain Record of Components Processed**:
   - Keep track of which components have been analyzed and modified.
   - List the component file paths that have been worked on.

3. **Record Code Changes**:
   - Summarize the nature of changes made to components.
   - Include specific details about what default prop patterns were implemented or fixed.

4. **Track Inconsistencies Found**:
   - Document any inconsistencies found between component metadata and implementations.
   - Note how these inconsistencies were resolved.

5. **Note Pending Work**:
   - Maintain a list of components or tasks still pending review or updates.

This convention ensures continuity in long-running tasks and helps maintain a consistent approach to code modifications across the XMLUI project.

## Layout Properties Convention

### Overview

XMLUI has a comprehensive system for handling layout properties that affect component styling and positioning. These properties need to be consistently defined, documented, and integrated throughout the codebase. This convention ensures that any new layout property is properly added to all relevant parts of the system.

### Convention Rules

1. **Layout Property Definition**:
   - All layout properties must be added to the `layoutOptionKeys` array in `descriptorHelper.ts`.
   - Properties should be added in alphabetical order within their logical grouping.

2. **Layout Resolver Integration**:
   - Add the property to the `LayoutProps` type definition in `layout-resolver.ts`.
   - Include the property in the `layoutPatterns` object with appropriate pattern validation.
   - Group properties logically (Dimensions, Typography, Animations, etc.) with clear comments.

3. **Documentation Requirements**:
   - Each layout property requires documentation in two places:
     - `layout-props.md`: A concise definition with a link to detailed documentation.
     - `common-units.md`: Detailed explanation of allowed values, examples, and visual demos.

4. **Theme Keyword Links**:
   - Add the property to the `themeKeywordLinks` object in `MetadataProcessor.mjs`.
   - Link format: `"propertyName": "[propertyName](../styles-and-themes/common-units/#anchor-name)"`.
   - Ensure the anchor name exists in the common-units.md file.

### Implementation Process

When adding a new layout property, follow these steps:

1. **Update Type Definitions**:
   ```typescript
   // In layout-resolver.ts
   export type LayoutProps = {
     // ...existing properties
     
     // Add new property in appropriate section with comment
     newProperty?: string | number;
   };
   ```

2. **Update Layout Patterns**:
   ```typescript
   // In layout-resolver.ts - layoutPatterns object
   const layoutPatterns: Record<keyof LayoutProps, RegExp[]> = {
     // ...existing patterns
     
     // Add new property (with validation patterns if needed)
     newProperty: [],
   };
   ```

3. **Update Property Keys**:
   ```typescript
   // In descriptorHelper.ts
   export const layoutOptionKeys = [
     // ...existing keys
     "newProperty",
   ];
   ```

4. **Add Documentation in `layout-props.md`**:
   ```markdown
   ## `newProperty`

   This property [describes what it does](/styles-and-themes/common-units#anchor-name).
   ```

5. **Add Detailed Documentation in `common-units.md`**:
   ```markdown
   ## New Property Values [#anchor-name]

   This value [detailed description of what it does and how it works]...
   
   | Value | Description |
   | ----- | ----------- |
   | `value1` | Description of value1 |
   | `value2` | Description of value2 |
   
   ```xmlui-pg name="Example name"
   <App>
     // Example showing the property in use
   </App>
   ```
   ```

6. **Add Theme Keyword Link**:
   ```javascript
   // In MetadataProcessor.mjs - themeKeywordLinks object
   const themeKeywordLinks = {
     // ...existing links
     newProperty: "[newProperty](../styles-and-themes/common-units/#anchor-name)",
   };
   ```

### Common Patterns for Layout Properties

1. **Size Properties**:
   - Support standard CSS units (`px`, `rem`, `em`, `%`, etc.)
   - May support special values like `auto`, `inherit`, etc.
   - Anchor: `#size`

2. **Color Properties**:
   - Support color names, hex values, rgb/rgba, hsl/hsla
   - May support theme variables with `$` prefix
   - Anchor: `#color`

3. **Style Properties**:
   - Usually support enumerated string values (`solid`, `dashed`, etc.)
   - Document all possible values in a table
   - Create property-specific anchor (e.g., `#border-style`)

4. **Animation Properties**:
   - Document component parts (duration, timing function, etc.)
   - Include examples with visual demonstrations
   - Anchor: specific to property (e.g., `#transition`)

5. **Text and Typography Properties**:
   - Group related properties together in documentation
   - Include visual examples showing differences
   - Anchors: specific to property (e.g., `#text-align`, `#word-spacing`)

### Example Implementation

#### Adding the `transition` Layout Property

1. **Update Layout Properties Type**:
   ```typescript
   // In layout-resolver.ts
   export type LayoutProps = {
     // ...existing properties
     
     // --- Animation
     transition?: string;
   };
   ```

2. **Update Layout Patterns**:
   ```typescript
   // In layout-resolver.ts - layoutPatterns object
   const layoutPatterns: Record<keyof LayoutProps, RegExp[]> = {
     // ...existing patterns
     
     // --- Animation
     transition: [],
   };
   ```

3. **Update Property Keys**:
   ```typescript
   // In descriptorHelper.ts
   export const layoutOptionKeys = [
     // ...existing keys
     "transition",
   ];
   ```

4. **Add Property Documentation in `layout-props.md`**:
   ```markdown
   ## `transition`

   This property is a shorthand for [transition effects](/styles-and-themes/common-units#transition) that specify the CSS property to which a transition effect should be applied, the duration and timing of the transition, and any delay.
   ```

5. **Add Detailed Documentation in `common-units.md`** (simplified example):
   ```markdown
   ## Transition Values [#transition]

   This value specifies the CSS property to animate, the duration, timing function, and delay...
   
   | Timing Function Values | Description |
   | --------------------- | ----------- |
   | `ease`                | Starts slow, becomes fast, then ends slowly... |
   
   ```xmlui-pg name="Transition examples"
   <App>
     // Examples showing transitions
   </App>
   ```
   ```

6. **Add Theme Keyword Link**:
   ```javascript
   // In MetadataProcessor.mjs - themeKeywordLinks object
   const themeKeywordLinks = {
     // ...existing links
     transition: "[transition](../styles-and-themes/common-units/#transition)",
   };
   ```

By following these conventions, we ensure consistent implementation and documentation of layout properties across the XMLUI codebase, making the system more maintainable and easier to extend.

## End-to-End Testing Convention

### Overview

XMLUI components require comprehensive end-to-end testing using Playwright to ensure reliability, accessibility, and performance. This convention establishes patterns for creating thorough test suites that cover all aspects of component behavior, from basic functionality to edge cases and performance optimizations.

### Component Test Location Map

| Component Type | Component Location | Test File Location |
| -------------- | ----------------- | ----------------- |
| Standard Components | `/xmlui/src/components/ComponentName/ComponentName.tsx` | `/xmlui/src/components/ComponentName/ComponentName.spec.ts` |
| Container Components | `/xmlui/src/components/Container/Container.tsx` | `/xmlui/src/components/Container/Container.spec.ts` |
| Form Components | `/xmlui/src/components/FormControl/FormControl.tsx` | `/xmlui/src/components/FormControl/FormControl.spec.ts` |

**Critical Rules for Test Creation:**
1. ✅ ALL component tests MUST be placed in the same folder as the component itself
2. ✅ ALL newly created tests MUST use the `.skip` modifier
3. ✅ Each skipped test MUST include the comment: `// TODO: review these Copilot-created tests`
4. ❌ NEVER place tests in the global test directory (`/tests/tests/`)
5. ❌ NEVER create non-skipped tests for new components

### Convention Rules

1. **Test Structure and Organization**:
   - Tests should be organized into logical sections with clear comments and separators.
   - Use descriptive test names that clearly indicate what behavior is being tested.
   - Group related tests together (e.g., "Size Property Tests", "Edge Cases and Name Processing").

2. **Comprehensive Test Coverage**:
   - **Basic Functionality**: Core component behavior and prop handling
   - **Accessibility**: ARIA attributes, keyboard navigation, screen reader compatibility
   - **Visual States**: Different visual configurations and state transitions
   - **Edge Cases**: Null/undefined props, empty values, special characters
   - **Performance**: Memoization, rapid prop changes, memory stability
   - **Integration**: Component behavior in different layout contexts

3. **Test Implementation Patterns**:
   - Use `initTestBed` for component setup with proper XMLUI markup
   - Create driver instances for component interaction
   - Use `expect.poll()` for async state verification
   - Implement proper cleanup and isolation between tests

4. **Accessibility Testing Requirements**:
   - Verify correct ARIA attributes (`aria-label`, `role`)
   - Test keyboard navigation and focus management
   - Ensure proper alt text for images
   - Validate screen reader compatibility

5. **Performance Testing Patterns**:
   - Test memoization behavior through functional verification
   - Verify efficient prop change handling
   - Test memory stability with multiple component instances
   - Ensure smooth state transitions

### Test Categories and Implementation

#### 1. Basic Functionality Tests
```typescript
test("component renders with basic props", async ({ initTestBed, createComponentDriver }) => {
  await initTestBed(`<ComponentName prop="value"/>`, {});
  const driver = await createComponentDriver();
  
  await expect(driver.component).toBeVisible();
  await expect(driver.component).toContainText("Expected Content");
});
```

#### 2. Accessibility Tests
```typescript
test("component has correct accessibility attributes", async ({ initTestBed, createComponentDriver }) => {
  await initTestBed(`<ComponentName name="Test User"/>`, {});
  const driver = await createComponentDriver();
  
  await expect(driver.component).toHaveAttribute('aria-label', 'Expected Label');
  await expect(driver.component).toHaveAttribute('role', 'expected-role');
});

test("component is keyboard accessible when interactive", async ({ initTestBed, createComponentDriver }) => {
  const { testStateDriver } = await initTestBed(`
    <ComponentName 
      name="Test User"
      onClick="testState = 'keyboard-activated'"
    />
  `, {});
  
  const driver = await createComponentDriver();
  
  await driver.component.focus();
  await expect(driver.component).toBeFocused();
  
  await driver.component.press('Enter');
  await expect.poll(testStateDriver.testState).toEqual('keyboard-activated');
});
```

#### 3. Visual State Tests
```typescript
test("component handles different visual states", async ({ initTestBed, createComponentDriver }) => {
  // Test initial state
  await initTestBed(`<ComponentName state="initial"/>`, {});
  const driver1 = await createComponentDriver();
  await expect(driver1.component).toHaveClass(/initial-state/);
  
  // Test changed state
  await initTestBed(`<ComponentName state="changed"/>`, {});
  const driver2 = await createComponentDriver();
  await expect(driver2.component).toHaveClass(/changed-state/);
});
```

#### 4. Edge Case Tests
```typescript
test("component handles null and undefined props gracefully", async ({ initTestBed, createComponentDriver }) => {
  // Test with undefined props
  await initTestBed(`<ComponentName/>`, {});
  const driver1 = await createComponentDriver();
  await expect(driver1.component).toBeVisible();
  
  // Test with empty string props
  await initTestBed(`<ComponentName prop=""/>`, {});
  const driver2 = await createComponentDriver();
  await expect(driver2.component).toBeVisible();
});

test("component handles special characters correctly", async ({ initTestBed, createComponentDriver }) => {
  await initTestBed(`<ComponentName name="José María"/>`, {});
  const driver = await createComponentDriver();
  await expect(driver.component).toBeVisible();
  // Test specific behavior with special characters
});
```

#### 5. Performance Tests
```typescript
test("component memoization prevents unnecessary re-renders", async ({ initTestBed, createComponentDriver }) => {
  const { testStateDriver } = await initTestBed(`
    <ComponentName 
      name="Test User"
      onClick="testState = ++testState || 1"
    />
  `, {});
  
  const driver = await createComponentDriver();
  
  // Test that memoization works through stable behavior
  await driver.component.click();
  await expect.poll(testStateDriver.testState).toEqual(1);
  
  await driver.component.click();
  await expect.poll(testStateDriver.testState).toEqual(2);
  
  // Component should maintain consistent behavior
  await expect(driver.component).toBeVisible();
});

test("component handles rapid prop changes efficiently", async ({ initTestBed, createComponentDriver }) => {
  // Test multiple rapid prop changes
  await initTestBed(`<ComponentName prop="value1"/>`, {});
  const driver1 = await createComponentDriver();
  await expect(driver1.component).toBeVisible();
  
  await initTestBed(`<ComponentName prop="value2"/>`, {});
  const driver2 = await createComponentDriver();
  await expect(driver2.component).toBeVisible();
  
  // Verify final state is correct
  await expect(driver2.component).toContainText("Expected Final Content");
});
```

#### 6. Integration Tests
```typescript
test("component works correctly in different layout contexts", async ({ initTestBed, createComponentDriver }) => {
  await initTestBed(`<ComponentName name="Layout Test"/>`, {});
  const driver = await createComponentDriver();
  
  // Test basic layout integration
  await expect(driver.component).toBeVisible();
  
  // Test bounding box and dimensions
  const boundingBox = await driver.component.boundingBox();
  expect(boundingBox).not.toBeNull();
  expect(boundingBox!.width).toBeGreaterThan(0);
  expect(boundingBox!.height).toBeGreaterThan(0);
});
```

### Component-Specific Testing Considerations

#### Container Components (like Accordion)
1. **Expansion State Testing**:
   ```typescript
   test("component expands and collapses correctly", async ({ initTestBed, createAccordionDriver }) => {
     await initTestBed(`<Accordion><AccordionItem header="Test">Content</AccordionItem></Accordion>`, {});
     const driver = await createAccordionDriver();
     
     // Test initial collapsed state
     let content = driver.component.locator(".accordion-content");
     await expect(content).not.toBeVisible();
     
     // Click to expand
     const header = driver.component.locator(".accordion-header");
     await header.click();
     
     // Test expanded state
     await expect(content).toBeVisible();
     
     // Click to collapse
     await header.click();
     
     // Test collapsed state again
     await expect(content).not.toBeVisible();
   });
   ```

2. **Multiple Item Testing**:
   ```typescript
   test("multiple items can expand independently", async ({ initTestBed, createAccordionDriver }) => {
     await initTestBed(`
       <Accordion>
         <AccordionItem header="Item 1">Content 1</AccordionItem>
         <AccordionItem header="Item 2">Content 2</AccordionItem>
       </Accordion>
     `, {});
     
     const driver = await createAccordionDriver();
     const headers = driver.component.locator(".accordion-header").all();
     
     // Expand first item
     await (await headers)[0].click();
     
     // Verify first expanded, second collapsed
     let contents = driver.component.locator(".accordion-content").all();
     await expect((await contents)[0]).toBeVisible();
     await expect((await contents)[1]).not.toBeVisible();
   });
   ```

3. **Component API Testing**:
   ```typescript
   test("component API methods work correctly", async ({ initTestBed, createAccordionDriver, page }) => {
     const { testStateDriver } = await initTestBed(`
       <Accordion ref="accordionRef">
         <AccordionItem header="API Test">Content</AccordionItem>
       </Accordion>
       <Button id="expandBtn" onClick="accordionRef.expand('0'); testState = 'expanded'">Expand</Button>
     `, {});
     
     const driver = await createAccordionDriver();
     
     // Test API method
     await page.locator("#expandBtn").click();
     await expect.poll(testStateDriver.testState).toEqual('expanded');
     
     // Verify component state changed
     const content = driver.component.locator(".accordion-content");
     await expect(content).toBeVisible();
   });
   ```

4. **Icon Rendering Testing**:
   ```typescript
   test("component displays custom icons", async ({ initTestBed, createAccordionDriver }) => {
     await initTestBed(`
       <Accordion collapsedIcon="plus" expandedIcon="minus">
         <AccordionItem header="Custom Icons">Content</AccordionItem>
       </Accordion>
     `, {});
     
     const driver = await createAccordionDriver();
     
     // Check collapsed icon
     const icon = driver.component.locator(".chevron");
     await expect(icon).toHaveAttribute("data-icon-name", "plus");
     
     // Expand and check expanded icon
     const header = driver.component.locator(".accordion-header");
     await header.click();
     await expect(icon).toHaveAttribute("data-icon-name", "minus");
   });
   ```

#### Components With Custom Templates

1. **Custom Template Rendering**:
   ```typescript
   test("component renders custom templates correctly", async ({ initTestBed, createComponentDriver }) => {
     await initTestBed(`
       <ComponentName headerTemplate={
         <div>
           <Icon name="star" />
           <Text fontWeight="bold">Custom Template</Text>
         </div>
       }>
         Content
       </ComponentName>
     `, {});
     
     const driver = await createComponentDriver();
     
     // Verify template elements rendered correctly
     await expect(driver.component.locator("svg[data-icon-name='star']")).toBeVisible();
     await expect(driver.component.locator("text=Custom Template")).toBeVisible();
   });
   ```

#### Testing Theme Variables

1. **Theme Variable Application Testing**:
   ```typescript
   test("applies theme variables to specific element parts", async ({ initTestBed, createComponentDriver }) => {
     await initTestBed(`<ComponentName />`, {
       testThemeVars: {
         "backgroundColor-header-ComponentName": "rgb(255, 0, 0)",
         "color-content-ComponentName": "rgb(0, 255, 0)",
       },
     });
     
     const driver = await createComponentDriver();
     
     // Check styles applied to specific component parts
     await expect(driver.component.locator(".header")).toHaveCSS("background-color", "rgb(255, 0, 0)");
     await expect(driver.component.locator(".content")).toHaveCSS("color", "rgb(0, 255, 0)");
   });
   ```

2. **Border and Padding Theme Variables**:
   ```typescript
   test("applies border and padding theme variables correctly", async ({ initTestBed, createComponentDriver }) => {
     await initTestBed(`<ComponentName />`, {
       testThemeVars: {
         "border-ComponentName": "1px solid rgb(255, 0, 0)",
         "padding-ComponentName": "10px",
       },
     });
     
     const driver = await createComponentDriver();
     
     // Check border properties
     await expect(driver.component).toHaveCSS("border-width", "1px");
     await expect(driver.component).toHaveCSS("border-style", "solid");
     await expect(driver.component).toHaveCSS("border-color", "rgb(255, 0, 0)");
     
     // Check padding
     await expect(driver.component).toHaveCSS("padding", "10px");
   });
   ```

3. **Border Side-Specific Theme Variables**:
   ```typescript
   test("prioritizes specific border sides over general border", async ({ initTestBed, createComponentDriver }) => {
     await initTestBed(`<ComponentName />`, {
       testThemeVars: {
         "border-ComponentName": "1px solid rgb(0, 0, 0)",
         "borderLeft-ComponentName": "2px dashed rgb(255, 0, 0)",
       },
     });
     
     const driver = await createComponentDriver();
     
     // Check general borders applied to most sides
     await expect(driver.component).toHaveCSS("border-top-width", "1px");
     await expect(driver.component).toHaveCSS("border-right-width", "1px");
     await expect(driver.component).toHaveCSS("border-bottom-width", "1px");
     
     // Check specific side override
     await expect(driver.component).toHaveCSS("border-left-width", "2px");
     await expect(driver.component).toHaveCSS("border-left-style", "dashed");
     await expect(driver.component).toHaveCSS("border-left-color", "rgb(255, 0, 0)");
   });
   ```

### Test Name and Organization Patterns

1. **Naming Components Tests by Feature**:
   - Avoid: `"test component with value X"`
   - Prefer: `"renders with size=small correctly"`

2. **Naming Pattern for Behavior Tests**:
   - `"{verb} {feature} {when/with} {condition}"`
   - Examples: 
     - `"expands when header is clicked"`
     - `"applies red background with danger prop"`
     - `"renders placeholder when value is empty"`

3. **Naming Pattern for Property Tests**:
   - `"prioritizes {specific-prop} over {general-prop}"`
   - `"applies {style} to {component-part} with {theme-var}"`
   - Examples:
     - `"prioritizes borderLeftWidth over borderWidth"`
     - `"applies padding to all sides with padding theme var"`

4. **Test Organization Patterns**:
   ```typescript
   // =============================================================================
   // BASIC FUNCTIONALITY TESTS
   // =============================================================================
   
   test("renders with basic props", async () => {});
   test("updates display when props change", async () => {});
   
   // =============================================================================
   // ACCESSIBILITY TESTS
   // =============================================================================
   
   test("has correct accessibility attributes", async () => {});
   test("is keyboard accessible when interactive", async () => {});
   
   // =============================================================================
   // VISUAL STATE TESTS
   // =============================================================================
   
   test("applies theme variables correctly", async () => {});
   test("handles different visual states", async () => {});
   
   // =============================================================================
   // EDGE CASE TESTS
   // =============================================================================
   
   test("handles null and undefined props gracefully", async () => {});
   test("handles special characters correctly", async () => {});
   
   // =============================================================================
   // PERFORMANCE TESTS
   // =============================================================================
   
   test("memoization prevents unnecessary re-renders", async () => {});
   
   // =============================================================================
   // INTEGRATION TESTS
   // =============================================================================
   
   test("works correctly in different layout contexts", async () => {});
   ```

By following these conventions, XMLUI components will have comprehensive, reliable, and maintainable end-to-end test suites that ensure quality and performance across all scenarios.

### Skipped Test Creation Convention

When creating skeleton tests for components, follow these guidelines to ensure consistency and maintainability across the test suite. These tests provide a roadmap for future implementation while maintaining a clear structure.

#### Convention Rules (CRITICAL)

1. **Test Structure Organization**:
   - Organize existing tests into appropriate categories (Basic Functionality, Accessibility, etc.)
   - Maintain clear section separators with consistent formatting
   - Keep related tests grouped together within their sections

2. **Test Naming Conventions**:
   - Rename existing tests to follow naming conventions (as described in Test Name and Organization Patterns)
   - Use descriptive, action-oriented names that clearly indicate what's being tested
   - Be specific about the behavior or prop being verified

3. **Skipped Test Creation** (MANDATORY):
   - ✅ ALL newly created tests MUST be skipped using the `.skip` modifier
   - ✅ ALWAYS include the standard TODO comment: `// TODO: review these Copilot-created tests`
   - ✅ Implement a complete test body that follows test patterns for that category
   - ❌ NEVER create non-skipped tests when adding skeleton tests to components

4. **Complete Implementation**:
   - Even in skipped tests, provide a complete implementation
   - Include proper assertions that verify the expected behavior
   - Structure the test to provide a clear example of how it should work when enabled

#### Implementation Process

1. **Organize Tests by Category**:
   ```typescript
   // =============================================================================
   // BASIC FUNCTIONALITY TESTS
   // =============================================================================

   // (Basic tests here)

   // =============================================================================
   // ACCESSIBILITY TESTS
   // =============================================================================

   // (Accessibility tests here)
   ```

2. **Rename Existing Tests with Clear Patterns**:
   - Before: `test("component test", async () => {...})`
   - After: `test("renders with size={size} correctly", async () => {...})`

3. **Add Skipped Tests with TODO Comments**:
   ```typescript
   test.skip("component applies correct theme variables", async ({ initTestBed, createComponentDriver }) => {
     // TODO: review these Copilot-created tests
     
     await initTestBed(`<ComponentName />`, {
       testThemeVars: {
         "backgroundColor-ComponentName": "rgb(255, 0, 0)",
       },
     });
     
     const driver = await createComponentDriver();
     await expect(driver.component).toHaveCSS("background-color", "rgb(255, 0, 0)");
   });
   ```

4. **Implement Complete Test Bodies**:
   ```typescript
   test.skip("handles keyboard navigation correctly", async ({ initTestBed, createComponentDriver }) => {
     // TODO: review these Copilot-created tests
     
     const { testStateDriver } = await initTestBed(`
       <ComponentName 
         onKeyDown="testState = 'key-pressed'"
       />
     `, {});
     
     const driver = await createComponentDriver();
     
     // Focus the component
     await driver.component.focus();
     await expect(driver.component).toBeFocused();
     
     // Test keyboard interaction
     await driver.component.press('Enter');
     await expect.poll(testStateDriver.testState).toEqual('key-pressed');
   });
   ```

#### Example Test Suite with Skipped Tests

```typescript
import { test, expect } from '@playwright/test';

// =============================================================================
// BASIC FUNCTIONALITY TESTS
// =============================================================================

test("renders with default props", async ({ initTestBed, createComponentDriver }) => {
  await initTestBed(`<ComponentName />`, {});
  const driver = await createComponentDriver();
  await expect(driver.component).toBeVisible();
});

test.skip("updates display when prop changes", async ({ initTestBed, createComponentDriver }) => {
  // TODO: review these Copilot-created tests
  
  // Test with initial prop
  await initTestBed(`<ComponentName value="initial" />`, {});
  let driver = await createComponentDriver();
  await expect(driver.component).toContainText("initial");
  
  // Test with updated prop
  await initTestBed(`<ComponentName value="updated" />`, {});
  driver = await createComponentDriver();
  await expect(driver.component).toContainText("updated");
});

// =============================================================================
// ACCESSIBILITY TESTS
// =============================================================================

test.skip("has correct accessibility attributes", async ({ initTestBed, createComponentDriver }) => {
  // TODO: review these Copilot-created tests
  
  await initTestBed(`<ComponentName label="Accessible Component" />`, {});
  const driver = await createComponentDriver();
  
  await expect(driver.component).toHaveAttribute('role', 'button');
  await expect(driver.component).toHaveAttribute('aria-label', 'Accessible Component');
  await expect(driver.component).toHaveAttribute('tabindex', '0');
});
```

### Best Practices for Skipped Tests

1. **Clear Reasoning**: The skipped test should clearly indicate why it's important to implement later
2. **Full Implementation**: Implement the complete test body, not just a placeholder
3. **Readable Examples**: Make the test easy to understand for developers who will enable it later
4. **Descriptive Names**: Use clear test names that explain exactly what behavior is being tested
5. **Proper Isolation**: Each skipped test should be independent of other tests
6. **Comprehensive Coverage**: Create skipped tests for all important functionality, even if it's not implemented yet

### Common Mistakes to Avoid

1. **Empty Test Bodies**: Don't create skipped tests without implementing the test body
2. **Missing Comments**: Always include the TODO comment explaining these are Copilot-created tests
3. **Vague Names**: Avoid generic test names like "test component behavior"
4. **Untestable Assertions**: Don't make assertions that can't be tested with the current implementation
5. **Incomplete Categories**: Make sure all required test categories (accessibility, etc.) are represented

By following these conventions for skipped tests, you create a valuable roadmap for future test implementation while maintaining a clear and organized test structure. This approach helps ensure comprehensive test coverage even when all tests aren't immediately ready to run.

### Test File Location Conventions (CRITICAL)

When creating component tests, follow these location conventions:

1. **Component-Level Test Location** (MANDATORY):
   - ✅ Test files MUST be located in the same directory as the component being tested
   - ✅ Use the naming convention `ComponentName.spec.ts` for test files
   - ✅ Example: For a component defined in `/components/Button/Button.tsx`, the test MUST be at `/components/Button/Button.spec.ts`
   - ❌ NEVER place test files in the global test directory (`/tests/tests/`)

2. **Test Import Paths**:
   - Import test utilities from the testing directory:
     ```typescript
     import { expect, test } from "../../testing/fixtures";
     import { getStyles } from "../../testing/component-test-helpers";
     ```
   - Adjust import paths based on the relative location of the component and testing utilities

3. **Component Driver Parameters**:
   - Use the appropriate fixture parameters based on component needs:
     ```typescript
     test.skip("basic test", async ({ initTestBed, createComponentDriver }) => {
       // For components with component drivers
     });
     ```

4. **Test Execution Context**:
   - Tests should be executed from the component's directory
   - Run specific component tests with: `npx playwright test ComponentName.spec.ts`
   - Test runners will automatically locate tests in the component directories

This location convention ensures tests are closely associated with their components, making the codebase easier to maintain and navigate. It also simplifies the process of finding and updating tests when component implementations change.

### Test Execution and Verification

### Proper Test File Structure Example

Below is an example of a correctly structured skeleton test file for a component. Note that ALL tests are marked with `.skip` and include the required TODO comment:

```typescript
import { test, expect } from "../../testing/fixtures";
import { getStyles } from "../../testing/component-test-helpers";

// Constants for testing
const RED = "rgb(255, 0, 0)";
const GREEN = "rgb(0, 255, 0)";

// =============================================================================
// BASIC FUNCTIONALITY TESTS
// =============================================================================

test.skip("component renders with basic props", async ({ initTestBed, createComponentDriver }) => {
  // TODO: review these Copilot-created tests
  
  await initTestBed(`<ComponentName prop="value"/>`);
  const driver = await createComponentDriver();
  
  await expect(driver.component).toBeVisible();
  await expect(driver.component).toContainText("Expected Content");
});

// =============================================================================
// ACCESSIBILITY TESTS
// =============================================================================

test.skip("component has correct accessibility attributes", async ({ initTestBed, createComponentDriver }) => {
  // TODO: review these Copilot-created tests
  
  await initTestBed(`<ComponentName label="Accessible Label"/>`);
  const driver = await createComponentDriver();
  
  await expect(driver.component).toHaveAttribute('role', 'button');
  await expect(driver.component).toHaveAttribute('aria-label', 'Accessible Label');
});

// =============================================================================
// VISUAL STATE TESTS
// =============================================================================

test.skip("component applies theme variables correctly", async ({ initTestBed, createComponentDriver }) => {
  // TODO: review these Copilot-created tests
  
  await initTestBed(`<ComponentName />`, {
    testThemeVars: {
      "backgroundColor-ComponentName": RED,
    },
  });
  
  const driver = await createComponentDriver();
  await expect(driver.component).toHaveCSS("background-color", RED);
});

// All remaining test categories follow the same pattern...
```

This example shows the proper structure with:
1. Correct imports from the testing directory
2. Section separators for test categories
3. ALL tests marked with `.skip`
4. Required TODO comment in each test
5. Proper test implementation following the patterns
