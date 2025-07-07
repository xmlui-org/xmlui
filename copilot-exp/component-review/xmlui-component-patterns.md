# XMLUI Component Architecture: A Developer's Guide

This document provides a concise overview of the architectural patterns used in the XMLUI component library. It's intended for developers with React experience to quickly grasp the core concepts and design principles.

## Core Architecture: The Three-Tier Structure

At the heart of every XMLUI component is a consistent three-file structure that promotes a clean separation of concerns:

1.  **`[Component]Native.tsx` - The Pure UI**:
    *   This is a pure, presentational React component.
    *   It contains the core JSX, event handlers, and local state.
    *   It receives props and renders the UI, but it's unaware of the larger XMLUI rendering engine.
    *   It often uses `forwardRef` to allow parent components to access the underlying DOM element.

2.  **`[Component].tsx` - The Integration Layer**:
    *   This file acts as a bridge between the native component and the XMLUI framework.
    *   **Metadata**: It defines comprehensive metadata for the component using a `createMetadata` helper. This includes prop descriptions, types, default values, events, and theme variables. This metadata is crucial for documentation, design-time tooling, and validation.
    *   **Renderer**: It creates a `componentRenderer` using `createComponentRenderer`. This function tells the XMLUI engine how to render the native component, mapping framework-specific "node" properties to the native component's props.

3.  **`[Component].module.scss` - The Styling**:
    *   This file contains all component-specific styles using SCSS modules for encapsulation.
    *   It integrates deeply with the theming system, defining and consuming CSS variables for colors, spacing, typography, etc.
    *   It exports a `themeVars` object that makes the component's theme variables available to the integration layer (`[Component].tsx`).

## Key Architectural Patterns

Beyond the file structure, XMLUI employs several powerful patterns to create a robust and scalable system.

### 1. Metadata-Driven Development

Every component is self-documenting. The metadata defined in `[Component].tsx` is not just for show; it drives the entire system. The rendering engine uses it to understand how to handle props, and it can be used to automatically generate documentation pages and provide rich IntelliSense in IDEs.

### 2. The Component Renderer System

XMLUI doesn't just render React components directly. It uses a higher-level rendering engine that works with a tree of "nodes." The `createComponentRenderer` function for each component is a factory that tells the engine how to take a node from this tree and translate its properties into the props expected by the `Native` React component. This abstraction allows for powerful features like dynamic value extraction and layout management.

### 3. Comprehensive Theming

Theming is a first-class citizen. Components define their own themeable CSS variables in their `.scss` files. A central theming system collects these variables, allowing for global theme changes (e.g., light/dark mode) and component-level overrides.

### 4. Advanced State Management

XMLUI uses different strategies for state management depending on the component's complexity:

*   **React Context**: For sharing state across a component tree, as seen in `Form` and `ModalDialog`. This avoids prop-drilling.
*   **Reducers (`useReducer`)**: For complex components with intricate state transitions, like `Form` and `Queue`. This provides a predictable and robust way to manage state, inspired by Redux patterns.

### 5. Foundational Layout System

The `Stack` component (and its `HStack`/`VStack` variants) is the cornerstone of layout. It's a simple, powerful Flexbox-based utility for arranging components, promoting composition over complex, monolithic layout components.

### 6. Specialized Component Patterns

*   **Controller Pattern (`FormItem`)**: `FormItem` acts as a controller that wraps and manages various input controls. It handles data binding, validation, and layout, decoupling the individual inputs from the form's logic.
*   **Registry Pattern (`Icon`)**: The `Icon` component uses a central registry to look up and render icons. This decouples the component from the icon assets, making the icon set easily extensible.
*   **Imperative APIs (`ModalDialog`, `Queue`)**: For components whose lifecycle isn't tied directly to the render cycle (like modals or background task queues), the framework exposes imperative APIs (e.g., `modal.open()`, `queue.enqueueItem()`). These are registered with the framework using the `registerComponentApi` function.

This architecture results in a component library that is consistent, reusable, highly customizable, and self-documenting.

## Example: The `Badge` Component

Let's look at a simple component, `Badge`, to see the three-tier structure in action. A `Badge` is a small visual indicator, often used for counts or statuses.

### 1. `BadgeNative.tsx` (The Pure UI)

This file contains the straightforward React component. It takes props like `children` and `title` and renders a `span` element with the appropriate styles.

```tsx
// Simplified from BadgeNative.tsx
import React from "react";
import classnames from "classnames";
import styles from "./Badge.module.scss";

export const Badge = React.forwardRef(function Badge(
  { children, title, ...rest },
  ref
) {
  return (
    <span
      {...rest}
      ref={ref}
      title={title}
      className={classnames(styles.base)}
    >
      {children}
    </span>
  );
});
```

### 2. `Badge.tsx` (The Integration Layer)

This file connects the `BadgeNative` component to the XMLUI framework. It defines the component's public API (its props) through metadata and provides a renderer function.

```tsx
// Simplified from Badge.tsx
import { createComponentRenderer } from "../../components-core/renderers";
import { createMetadata } from "../metadata-helpers";
import { Badge } from "./BadgeNative";

// 1. Metadata Definition
export const BadgeMd = createMetadata({
  description: "A badge is a small status descriptor for a UI element.",
  props: {
    value: { description: "The content to display inside the badge." },
    // ... other props
  },
  themeVars: { /* ... theme variables ... */ },
});

// 2. Component Renderer
export const badgeComponentRenderer = createComponentRenderer(
  "Badge",
  BadgeMd,
  ({ node, extractValue, layoutCss }) => {
    // Maps the framework's `node` object to the `Badge` component's props
    return (
      <Badge style={layoutCss}>
        {extractValue.asString(node.props.value)}
      </Badge>
    );
  },
);
```

### 3. `Badge.module.scss` (The Styling)

This file defines the visual appearance of the `Badge` and its themeable properties.

```scss
// Simplified from Badge.module.scss
@use "../../components-core/theming/themes" as t;

// Helper function to register and use theme variables
$themeVars: ();
@function createThemeVar($componentVariable) {
  $themeVars: t.appendThemeVar($themeVars, $componentVariable) !global;
  @return t.getThemeVar($themeVars, $componentVariable);
}

// Component styles using theme variables
.base {
  display: inline-flex;
  padding: createThemeVar("padding-Badge");
  background-color: createThemeVar("backgroundColor-Badge");
  color: createThemeVar("textColor-Badge");
  border-radius: createThemeVar("borderRadius-Badge");
}

// Export variables for the integration layer
:export {
  themeVars: t.json-stringify($themeVars);
}
```

This example shows how the three tiers work together to create a component that is both a well-structured React component and a fully integrated citizen of the XMLUI framework.
