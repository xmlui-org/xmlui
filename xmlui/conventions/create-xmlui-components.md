# Creating XMLUI Components

This document outlines the conventions, patterns, and best practices for creating new XMLUI components.

## Table of Contents

1. [Component Structure](#component-structure)
2. [Component Metadata](#component-metadata)
3. [Theme and Styling](#theme-and-styling)
4. [Component Implementation](#component-implementation)
5. [Registration and Export](#registration-and-export)
6. [Testing](#testing)

## Component Structure

XMLUI components are built from four crucial concepts:

1. **Native React Component**: The actual UI implementation using standard React patterns
2. **Metadata**: Complete API description including props, events, APIs, and theme variables
3. **Renderer Function**: Maps XMLUI markup to React component calls
4. **Component Registration**: Makes the component available in XMLUI markup

### Core Component Concepts

XMLUI components expose several key concepts that enable rich interactivity:

- **Properties**: Configuration values passed to components (e.g., `size`, `variant`, `disabled`)
- **Events**: User interactions that components can emit (e.g., `click`, `change`, `focus`)
- **Event Handlers**: Functions that respond to events, often updating application state
- **Exposed Methods**: Programmatic APIs that allow parent components to control child behavior (e.g., `setValue()`, `focus()`)
- **Context Variables**: Data that components expose to their children, accessible via `$variableName` syntax

### File Organization

Each component should have its own directory under `src/components/` with the following structure:

```
ComponentName/
├── ComponentName.tsx              # Component definition (required)
├── ComponentNameNative.tsx        # Native implementation (dual-file pattern)
├── ComponentName.module.scss      # Component styles (optional)
├── ComponentName.spec.ts          # End-to-end tests (suggested)
└── ComponentName.md               # Documentation examples (required)
```

**Key files:**
- **Component definition**: Always named exactly like the component (e.g., `Avatar.tsx`)
- **Native file**: Appended with "Native" suffix (e.g., `AvatarNative.tsx`)
- **SCSS module**: Always follows `.module.scss` pattern for scoped styles
- **Test files**: `.spec.ts` for end-to-end tests
- **Documentation**: `.md` file with usage examples and playground snippets

### Standard Dual-File Pattern

Most XMLUI components use a dual-file pattern that separates concerns:

- **Component Definition** (`ComponentName.tsx`)
  - Contains component metadata using `createMetadata`
  - Defines the renderer function with `createComponentRenderer`
  - Specifies theme variables and their defaults
  - Maps XMLUI props to native component props

- **Native Component** (`ComponentNameNative.tsx`)
  - Pure React implementation using `forwardRef`
  - Contains actual rendering logic and component behavior
  - Defines TypeScript interfaces for props
  - Exports `defaultProps` object

```typescript
// Example: Avatar.tsx (Component Definition)
export const avatarComponentRenderer = createComponentRenderer(
  "Avatar",
  AvatarMd,
  ({ node, extractValue, lookupEventHandler, layoutCss, extractResourceUrl }) => {
    return (
      <Avatar
        size={node.props?.size}
        url={extractResourceUrl(node.props.url)}
        name={extractValue(node.props.name)}
        style={layoutCss}
        onClick={lookupEventHandler("click")}
      />
    );
  },
);

// Example: AvatarNative.tsx (Native Implementation)
export const Avatar = forwardRef(function Avatar(
  { size = defaultProps.size, url, name, style, onClick, ...rest }: Props,
  ref: Ref<any>,
) {
  // Implementation details...
});
```

> **Note**: For very simple components, the native implementation can be included directly in the component definition file instead of creating a separate `*Native.tsx` file.

### Component Registration

After creating a component, it must be registered to be available in XMLUI markup. This is done in `ComponentProvider.tsx`:

```typescript
// Import the component renderer
import { avatarComponentRenderer } from "./Avatar/Avatar";

// Register in ComponentProvider class
this.registerCoreComponent(avatarComponentRenderer);
```

This registration makes the component available for use in XMLUI templates with its tag name (e.g., `<Avatar />`).

## Component Metadata

Component metadata is a **fundamental and critical concept** in XMLUI. It serves as the single source of truth that describes a component's complete API surface, including properties, events, exposed methods, context variables, and theme variables. This metadata is not just documentation—it's actively used by:

- **XMLUI Documentation System**: Auto-generates component documentation
- **VS Code Extension**: Provides IntelliSense, auto-completion, and validation
- **Type Checking**: Validates component usage at build time  
- **Developer Tools**: Powers debugging and inspection features
- **Code Generation**: Enables automated tooling and scaffolding

### Metadata Structure

Component metadata defines the essential elements that describe a component's complete API:

- **Properties (`props`)**: Configuration values passed to components (e.g., `size`, `variant`, `disabled`)
- **Events (`events`)**: User interactions that components can emit (e.g., `click`, `change`, `focus`) 
- **APIs (`apis`)**: Programmatic methods that allow parent components to control child behavior (e.g., `setValue()`, `focus()`)
- **Context Variables (`contextVars`)**: Data that components expose to their children, accessible via `$variableName` syntax
- **Theme Variables (`themeVars`)**: Styling customization points that enable design system integration

Some components are non-visual and do not render any UI. These components use the `nonVisual` metadata property set to `true`.

Component metadata is defined using the `createMetadata` helper:

```typescript
import { createMetadata, d, dClick } from "../metadata-helpers";

const COMP = "ComponentName";

export const ComponentNameMd = createMetadata({
  status: "stable" | "experimental" | "deprecated",
  description: "Brief description of the component and its purpose",
  
  props: {
    propName: {
      description: "What this prop does",
      type: "string" | "number" | "boolean",
      availableValues: optionsArray, // For enum-like props
      defaultValue: defaultProps.propName,
      isRequired: false,
    },
  },
  
  events: {
    onClick: dClick(COMP),
    onCustomEvent: d("Description of custom event"),
  },
  
  apis: {
    setValue: {
      description: "API method description",
      signature: "setValue(value: string): void",
    },
  },
  
  contextVars: {
    // Variables exposed to child components
  },
  
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    [`property-${COMP}`]: "defaultValue",
  },
});
```

### Metadata Helper Functions

- `d(description, availableValues?, valueType?, defaultValue?, isValid?, isRequired?)` - General property descriptor
- `dClick(componentName)` - Standard click event descriptor
- `dGotFocus(componentName)` - Focus event descriptor
- `dLostFocus(componentName)` - Blur event descriptor
- `dInternal(description?)` - Internal-only property descriptor

## Theme and Styling

Non-visual components do not use styling or theme variables.

Each visual component requires a SCSS module file with this structure:

```scss
// ComponentName.module.scss
@use "../../components-core/theming/themes" as t;

// --- This code snippet is required to collect the theme variables used in this module
$themeVars: ();
@function createThemeVar($componentVariable) {
  $themeVars: t.appendThemeVar($themeVars, $componentVariable) !global;
  @return t.getThemeVar($themeVars, $componentVariable);
}

// Define theme variables
$backgroundColor-ComponentName: createThemeVar("backgroundColor-ComponentName");
$borderColor-ComponentName: createThemeVar("borderColor-ComponentName");
$textColor-ComponentName: createThemeVar("textColor-ComponentName");

// --- This part defines the CSS styles
.componentName {
  background-color: $backgroundColor-ComponentName;
  border-color: $borderColor-ComponentName;
  color: $textColor-ComponentName;
  
  // Component-specific styles
  
  &.variantClass {
    // Variant styles
  }
}

// --- We export the theme variables to add them to the component renderer
:export{
  themeVars: t.json-stringify($themeVars)
}
```

This structure is important because it helps collect all theme variables a particular component supports for documentation purposes. The pattern uses the `createThemeVar()` function to define theme variables that can be customized through the design system, then uses those variables in CSS styles, and finally exports them for the component renderer.

## Component Implementation

Follow this implementation flow for creating new XMLUI components:

1. **Create the component metadata** - This information helps understand the component design and facilitates discussion
2. **Create the renderer function and export it** - Use the native component and pass XMLUI component properties and events to it (the code won't build yet as no native component exists)
3. **Create a rudimentary version of the native component** - Make the code compile with basic functionality
4. **Add component registration** - At this point you can test the rudimentary component in XMLUI markup
5. **Implement the native component in full** - Add complete functionality, styling, and behavior
6. **Add end-to-end tests** - Ensure component reliability and functionality
7. **Add comprehensive documentation** - Include usage patterns and working examples
8. **Tune the component according to feedback** - Refine based on user testing and requirements

### Native Component Structure

Native components must follow these patterns:

```typescript
import React, { forwardRef, useRef, useImperativeHandle, useEffect } from "react";
import classnames from "classnames";
import styles from "./ComponentName.module.scss";

// Define props interface
type Props = {
  id?: string;
  // Component-specific props
  children?: React.ReactNode;
  style?: CSSProperties;
  // Event handlers
  onClick?: (event: React.MouseEvent) => void;
  // Accessibility props
} & React.HTMLAttributes<HTMLElement>;

// Define default props
export const defaultProps: Required<Pick<Props, "prop1" | "prop2">> = {
  prop1: "defaultValue",
  prop2: "anotherDefault",
};

// Component implementation with forwardRef
export const ComponentName = forwardRef(function ComponentName(
  {
    prop1 = defaultProps.prop1,
    prop2 = defaultProps.prop2,
    children,
    style,
    onClick,
    ...rest
  }: Props,
  ref: React.ForwardedRef<HTMLElement>,
) {
  const innerRef = useRef<HTMLElement>(null);
  
  // Compose refs if needed
  const composedRef = ref ? composeRefs(ref, innerRef) : innerRef;
  
  // Component logic here
  
  return (
    <div
      ref={composedRef}
      className={classnames(styles.componentName, {
        [styles.variantClass]: condition,
      })}
      style={style}
      onClick={onClick}
      {...rest}
    >
      {children}
    </div>
  );
});
```

**Key patterns**: Always use `forwardRef`, define clear TypeScript interfaces, provide sensible defaults via `defaultProps`, use scoped CSS modules, support standard HTML attributes, and handle accessibility through proper ARIA attributes.

## Registration and Export

Components are registered in `ComponentProvider.tsx`:

```typescript
// Import the renderer
import { componentNameComponentRenderer } from "./ComponentName/ComponentName";

// Register in ComponentProvider class
if (process.env.VITE_USED_COMPONENTS_ComponentName !== "false") {
  this.registerCoreComponent(componentNameComponentRenderer);
}
```

Components use environment variables for conditional inclusion to reduce bundle size in production builds while maintaining development flexibility.


## Testing

Component testing follows established patterns and conventions detailed in [testing-conventions.md](./testing-conventions.md). This includes component driver patterns, test structure, and best practices for ensuring component reliability and functionality.