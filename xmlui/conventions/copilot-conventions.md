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
