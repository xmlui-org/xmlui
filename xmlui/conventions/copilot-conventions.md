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

### Additional Learnings from Component Updates

#### Handling Chart and Visualization Components

1. **Using ResponsiveContainer with className**:
   - When working with visualization libraries like recharts that use ResponsiveContainer, the `className` prop can be passed directly to the ResponsiveContainer.
   - Example with BarChart:
     ```tsx
     // In BarChartNative.tsx
     return (
       <ResponsiveContainer className={className}>
         {/* Chart components */}
       </ResponsiveContainer>
     );
     ```
   - No need for an extra wrapper div when the library's container components already support className.

#### Maintaining Styling Best Practices

1. **Consistency in Style Application**:
   - When applying styles via className, be consistent with how the styles are applied to the component's root element.
   - For components with complex rendering logic (like Avatar's conditional rendering based on url/name), ensure the className is properly applied regardless of the rendering path.

2. **Style and Background Properties**:
   - When a component has both `style` and `className` props, and style contains important visual properties:
     ```tsx
     // In AvatarNative.tsx
     <div
       className={classnames(className, styles.container, {...})}
       style={{ backgroundImage: url ? `url(${url})` : "none", ...style }}
     >
     ```
   - Consider if certain inline style properties can be moved to CSS classes for better maintainability.

3. **Removing Unnecessary Style Properties**:
   - When converting from `layoutCss`/`style` to `className`, review if all style properties are still needed.
   - Properties like positioning, margins, and layout should generally move to CSS classes rather than remain as inline styles.

#### Component Refactoring Patterns

1. **Staged Refactoring**:
   - For complex components, a staged approach works best:
     1. First, update SCSS to use `@layer components`
     2. Next, add `className` prop to component props
     3. Update renderer to use `className` instead of `layoutCss`
     4. Finally, review and update any component-specific styling logic

2. **Testing Visual Components After Update**:
   - After updating styling patterns, verify that:
     - Component renders correctly at all sizes/variants
     - Any conditional styling still works (hover states, active states, etc.)
     - Layout and positioning remain consistent
   - Use the component in various contexts to ensure it behaves as expected with the new styling approach.

These learnings help maintain consistent styling patterns across the XMLUI component library while addressing the specific needs and challenges of different component types.
