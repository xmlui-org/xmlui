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
