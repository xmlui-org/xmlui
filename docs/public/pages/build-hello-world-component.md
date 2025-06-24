# Build a Hello World Component

This guide will walk you through creating a complete React-based component for XMLUI, from initial setup to registration and testing. We'll build a functional HelloWorld component that demonstrates the core patterns for XMLUI component development.

## What You'll Build

By the end of this guide, you'll have created a HelloWorld component that:

- Displays a customizable greeting message
- Features an interactive click counter
- Supports nested children content
- Follows all XMLUI patterns and conventions

## XMLUI Component Architecture

XMLUI components consist of three main parts:

1. **Native React Component** (`HelloWorldNative.tsx`) - The actual React implementation
2. **Component Metadata** (`HelloWorld.tsx`) - Describes props and integrates with XMLUI
3. **Component Registration** (`ComponentProvider.tsx`) - Registers the component with XMLUI

This separation allows XMLUI to understand your component's interface while maintaining clean React code.

## Prerequisites

- Familiarity with React and TypeScript
- Basic understanding of XMLUI markup
- A working XMLUI development environment

## Step 1: Create the Component Directory

Create a new directory for your component:

```bash
mkdir -p xmlui/src/components/HelloWorld
```

All XMLUI components follow this structure with the component name as the directory.

## Step 2: Create the Native React Component

Create `xmlui/src/components/HelloWorld/HelloWorldNative.tsx`:

```xmlui copy
import React, { useRef, useState } from "react";
import classnames from "classnames";
import styles from "./HelloWorld.module.scss";
import type { RegisterComponentApiFn } from "../../abstractions/RendererDefs";

type Props = {
  id?: string;
  message?: string;
  children?: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
};

export const defaultProps: Partial<Props> = {
  message: "Hello, World!",
};

export const HelloWorld = React.forwardRef<HTMLDivElement, Props>(
  function HelloWorld(
    {
      id,
      message = defaultProps.message,
      children,
      style,
      className,
      ...rest
    },
    ref
  ) {
    const [clickCount, setClickCount] = useState(0);

    const handleClick = () => {
      const newCount = clickCount + 1;
      setClickCount(newCount);
    };

    const handleReset = () => {
      setClickCount(0);
    };

    return (
      <div
        {...rest}
        id={id}
        ref={ref}
        className={classnames(className, styles.helloWorld)}
        style={style}
      >
        <div className={styles.content}>
          <h3 className={styles.message}>{message}</h3>

          {children && (
            <div className={styles.children}>{children}</div>
          )}

          <div className={styles.interactive}>
            <button
              className={styles.clickButton}
              onClick={handleClick}
            >
              Click me!
            </button>

            <div className={styles.counter}>
              Clicks: <span className={styles.count}>{clickCount}</span>
            </div>

            {clickCount > 0 && (
              <button
                className={styles.resetButton}
                onClick={handleReset}
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }
);
```

### Key Patterns in the Native Component:

- **Props Interface**: Defines all component properties that XMLUI can set
- **forwardRef**: Allows XMLUI to get a reference to the DOM element
- **React State**: Uses `useState` for interactive behavior
- **Event Handlers**: Standard React click handlers for interactivity
- **Classnames**: Uses the `classnames` library for conditional CSS classes

## Step 3: Create Component Styles

Create `xmlui/src/components/HelloWorld/HelloWorld.module.scss`:

```xmlui copy
.helloWorld {
  background-color: #fafafa;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  padding: 24px;
  color: #111827;
  font-family: system-ui, -apple-system, sans-serif;
  transition: all 0.2s ease-in-out;
  max-width: 400px;
}

.content {
  text-align: center;
}

.message {
  margin: 0 0 16px 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.children {
  margin: 16px 0;
  padding: 12px;
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: 4px;
  font-style: italic;
}

.interactive {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.clickButton {
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 12px 24px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #2563eb;
  }

  &:active {
    transform: translateY(1px);
  }
}

.counter {
  font-size: 1.1rem;
  font-weight: 500;
}

.count {
  display: inline-block;
  background-color: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: 700;
  min-width: 24px;
  text-align: center;
}

.resetButton {
  background-color: #6b7280;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #4b5563;
  }
}
```

### Key Styling Patterns:

- **SCSS Modules**: Scoped styles that prevent CSS conflicts
- **BEM-like naming**: Clear, descriptive class names
- **Modern CSS**: Uses flexbox, CSS transitions, and hover effects
- **Hardcoded colors**: Simple approach for getting started (we'll add theming later)

## Step 4: Create Component Metadata and Renderer

Create `xmlui/src/components/HelloWorld/HelloWorld.tsx`:

```xmlui copy
import styles from "./HelloWorld.module.scss";
import { createMetadata } from "../../abstractions/ComponentDefs";
import { createComponentRenderer } from "../../components-core/renderers";
import { HelloWorld, defaultProps } from "./HelloWorldNative";

const COMP = "HelloWorld";

export const HelloWorldMd = createMetadata({
  description:
    "`HelloWorld` is a demonstration component that shows basic XMLUI patterns. " +
    "It displays a customizable greeting message with an interactive click counter.",
  status: "experimental",
  props: {
    id: {
      description: "The unique identifier for the component.",
      type: "string",
    },
    message: {
      description: "The greeting message to display.",
      type: "string",
      defaultValue: defaultProps.message,
    },
  },
});

export const helloWorldComponentRenderer = createComponentRenderer(
  COMP,
  HelloWorldMd,
  ({ node, extractValue, renderChild, layoutCss }) => {
    return (
      <HelloWorld
        id={extractValue.asOptionalString(node.props.id)}
        message={extractValue.asOptionalString(node.props.message)}
        style={layoutCss}
      >
        {renderChild(node.children)}
      </HelloWorld>
    );
  }
);
```

### Key Metadata Patterns:

- **`createMetadata`**: Describes the component interface to XMLUI
- **Props definition**: Type-safe property descriptions with defaults
- **Status**: Indicates component maturity (experimental, stable, deprecated)

### Renderer Patterns:

- **`createComponentRenderer`**: Bridges XMLUI markup to React component
- **`extractValue`**: Safely extracts prop values from XMLUI nodes
- **`renderChild`**: Renders nested XMLUI content
- **`layoutCss`**: Provides XMLUI layout styling

## Step 5: Register the Component

Add your component to `xmlui/src/components/ComponentProvider.tsx`.

First, add the import near the top with other component imports:

```tsx
import { buttonComponentRenderer } from "./Button/Button";
import { helloWorldComponentRenderer } from "./HelloWorld/HelloWorld";
```

Then register the component in the `ComponentRegistry` constructor:

```tsx
if (process.env.VITE_USED_COMPONENTS_Button !== "false") {
  this.registerCoreComponent(buttonComponentRenderer);
}
if (process.env.VITE_USED_COMPONENTS_HelloWorld !== "false") {
  this.registerCoreComponent(helloWorldComponentRenderer);
}
```

## Step 6: Test Your Component

You can now use your HelloWorld component in XMLUI markup:

### Basic Usage
```xml
<App>
  <HelloWorld />
</App>
```

### Interactive Examples

Try these examples in the XMLUI playground:

```xmlui-pg
<App>
  <VStack spacing="4">
    <!-- Custom message -->
    <HelloWorld message="Hello World!" />

    <!-- With nested content -->
    <HelloWorld message="I have children:">
      <Text>This is nested content inside HelloWorld!</Text>
      <Text>Pretty cool, right?</Text>
    </HelloWorld>

  </VStack>
</App>
```


## Common Patterns Explained

### Value Extraction
Use the appropriate `extractValue` methods in your renderer:

- `extractValue.asString()` - Required string

