# Build a Hello World Component

This guide will walk you through creating a complete React-based component for XMLUI, from initial setup to registration and testing. We'll build a functional HelloWorld component that demonstrates all the key patterns for XMLUI component development.

## What You'll Build

By the end of this guide, you'll have created a HelloWorld component that:

- Displays a customizable greeting message
- Features an interactive click counter
- Supports multiple visual themes (default, success, warning, error)
- Handles events (onClick, onReset)
- Exposes component APIs (reset(), getClickCount())
- Supports nested children content
- Follows all XMLUI patterns and conventions

## XMLUI Component Architecture

XMLUI components consist of three main parts:

1. **Native React Component** (`HelloWorldNative.tsx`) - The actual React implementation
2. **Component Metadata** (`HelloWorld.tsx`) - Describes props, events, APIs, and theme variables
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
import React, { useRef, useImperativeHandle, useState } from "react";
import classnames from "classnames";
import styles from "./HelloWorld.module.scss";

type Props = {
  id?: string;
  message?: string;
  theme?: "default" | "success" | "warning" | "error";
  showCounter?: boolean;
  children?: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
  // Event handlers
  onClick?: (clickCount: number) => void;
  onReset?: () => void;
  // XMLUI API registration
  registerComponentApi?: (api: HelloWorldRef) => void;
};

// Define the ref interface for exposed methods
export interface HelloWorldRef {
  reset: () => void;
  getClickCount: () => number;
}

export const defaultProps: Partial<Props> = {
  message: "Hello, World!",
  theme: "default",
  showCounter: true,
};

export const HelloWorld = React.forwardRef<HelloWorldRef, Props>(
  function HelloWorld(
    {
      id,
      message = defaultProps.message,
      theme = defaultProps.theme,
      showCounter = defaultProps.showCounter,
      children,
      style,
      className,
      onClick,
      onReset,
      registerComponentApi,
      ...rest
    },
    ref
  ) {
    const innerRef = useRef<HTMLDivElement>(null);
    const [clickCount, setClickCount] = useState(0);

    const apiRef = useRef<HelloWorldRef>({
      reset: () => {
        setClickCount(0);
        onReset?.();
      },
      getClickCount: () => clickCount,
    });

    // Update the API ref when clickCount changes
    apiRef.current.getClickCount = () => clickCount;

    useImperativeHandle(ref, () => apiRef.current);

    // Register the API with XMLUI when component mounts
    React.useEffect(() => {
      if (registerComponentApi) {
        registerComponentApi(apiRef.current);
      }
    }, [registerComponentApi]);

    const handleClick = () => {
      const newCount = clickCount + 1;
      setClickCount(newCount);
      onClick?.(newCount);
    };

    const handleReset = () => {
      setClickCount(0);
      onReset?.();
    };

    return (
      <div
        {...rest}
        id={id}
        ref={innerRef}
        className={classnames(className, styles.helloWorld, {
          [styles.success]: theme === "success",
          [styles.warning]: theme === "warning",
          [styles.error]: theme === "error",
          [styles.default]: theme === "default",
        })}
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

            {showCounter && (
              <div className={styles.counter}>
                Clicks: <span className={styles.count}>{clickCount}</span>
              </div>
            )}

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

- **Props Interface**: Defines all component properties including XMLUI-specific ones
- **Ref Interface**: Exposes methods that can be called from XMLUI
- **forwardRef**: Required for XMLUI component APIs
- **registerComponentApi**: Pattern for exposing methods to XMLUI
- **Event Handlers**: Call parent-provided functions with relevant data

## Step 3: Create Component Styles

Create `xmlui/src/components/HelloWorld/HelloWorld.module.scss`:

```xmlui copy
// Export theme variables for XMLUI's theming system
:export {
  themeVars: backgroundColor-HelloWorld borderColor-HelloWorld borderRadius-HelloWorld padding-HelloWorld textColor-HelloWorld backgroundColor-HelloWorld-success borderColor-HelloWorld-success textColor-HelloWorld-success backgroundColor-HelloWorld-warning borderColor-HelloWorld-warning textColor-HelloWorld-warning backgroundColor-HelloWorld-error borderColor-HelloWorld-error textColor-HelloWorld-error backgroundColor-button-HelloWorld textColor-button-HelloWorld backgroundColor-button-HelloWorld--hover;
}

.helloWorld {
  background-color: var(--backgroundColor-HelloWorld, #fafafa);
  border: 2px solid var(--borderColor-HelloWorld, #e5e7eb);
  border-radius: var(--borderRadius-HelloWorld, 8px);
  padding: var(--padding-HelloWorld, 24px);
  color: var(--textColor-HelloWorld, #111827);
  font-family: system-ui, -apple-system, sans-serif;
  transition: all 0.2s ease-in-out;
  max-width: 400px;

  &.success {
    background-color: var(--backgroundColor-HelloWorld-success, #f0fdf4);
    border-color: var(--borderColor-HelloWorld-success, #bbf7d0);
    color: var(--textColor-HelloWorld-success, #166534);
  }

  &.warning {
    background-color: var(--backgroundColor-HelloWorld-warning, #fefce8);
    border-color: var(--borderColor-HelloWorld-warning, #fde047);
    color: var(--textColor-HelloWorld-warning, #ca8a04);
  }

  &.error {
    background-color: var(--backgroundColor-HelloWorld-error, #fef2f2);
    border-color: var(--borderColor-HelloWorld-error, #fecaca);
    color: var(--textColor-HelloWorld-error, #dc2626);
  }
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
  background-color: var(--backgroundColor-button-HelloWorld, #3b82f6);
  color: var(--textColor-button-HelloWorld, white);
  border: none;
  border-radius: 6px;
  padding: 12px 24px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: var(--backgroundColor-button-HelloWorld--hover, #2563eb);
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

- **`:export` block**: Required for XMLUI theme integration
- **CSS Variables**: Enable runtime theming
- **Fallback values**: Provide defaults when theme variables aren't set
- **Theme variants**: Different styles for success/warning/error states

## Step 4: Create Component Metadata and Renderer

Create `xmlui/src/components/HelloWorld/HelloWorld.tsx`:

```xmlui copy
import styles from "./HelloWorld.module.scss";
import { createMetadata } from "../../abstractions/ComponentDefs";
import { createComponentRenderer } from "../../components-core/renderers";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { HelloWorld, defaultProps, HelloWorldRef } from "./HelloWorldNative";

const COMP = "HelloWorld";

export const HelloWorldMd = createMetadata({
  description:
    "`HelloWorld` is a demonstration component that shows basic XMLUI patterns. " +
    "It displays a customizable greeting message with an interactive click counter " +
    "and supports different visual themes.",
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
    theme: {
      description: "Sets the visual theme of the component.",
      isRequired: false,
      type: "string",
      availableValues: [
        { value: "default", description: "Default theme" },
        { value: "success", description: "Success theme (green)" },
        { value: "warning", description: "Warning theme (yellow)" },
        { value: "error", description: "Error theme (red)" },
      ],
      defaultValue: defaultProps.theme,
    },
    showCounter: {
      description: "Whether to show the click counter.",
      type: "boolean",
      defaultValue: defaultProps.showCounter,
    },
  },
  events: {
    click: {
      description: `This event is triggered when the ${COMP} button is clicked. Receives the current click count as a parameter.`,
    },
    reset: {
      description: `This event is triggered when the reset button is clicked.`,
    },
  },
  apis: {
    reset: {
      description: `Resets the click counter to zero.`,
    },
    getClickCount: {
      description: `Returns the current click count.`,
      returnType: "number",
    },
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    [`backgroundColor-${COMP}`]: "$color-surface-50",
    [`borderColor-${COMP}`]: "$color-surface-200",
    [`borderRadius-${COMP}`]: "$borderRadius",
    [`padding-${COMP}`]: "$space-6",
    [`textColor-${COMP}`]: "$color-surface-900",

    // Theme colors
    [`backgroundColor-${COMP}-success`]: "$color-success-50",
    [`borderColor-${COMP}-success`]: "$color-success-200",
    [`textColor-${COMP}-success`]: "$color-success-800",

    [`backgroundColor-${COMP}-warning`]: "$color-warning-50",
    [`borderColor-${COMP}-warning`]: "$color-warning-200",
    [`textColor-${COMP}-warning`]: "$color-warning-800",

    [`backgroundColor-${COMP}-error`]: "$color-danger-50",
    [`borderColor-${COMP}-error`]: "$color-danger-200",
    [`textColor-${COMP}-error`]: "$color-danger-800",

    // Button styles
    [`backgroundColor-button-${COMP}`]: "$color-primary-500",
    [`textColor-button-${COMP}`]: "$color-surface-50",
    [`backgroundColor-button-${COMP}--hover`]: "$color-primary-600",
  },
});

export const helloWorldComponentRenderer = createComponentRenderer(
  COMP,
  HelloWorldMd,
  ({
    node,
    extractValue,
    renderChild,
    lookupEventHandler,
    layoutCss,
    registerComponentApi
  }) => {
    return (
      <HelloWorld
        id={extractValue.asOptionalString(node.props.id)}
        message={extractValue.asOptionalString(node.props.message)}
        theme={extractValue.asOptionalString(node.props.theme)}
        showCounter={extractValue.asOptionalBoolean(node.props.showCounter)}
        style={layoutCss}
        onClick={(clickCount) => {
          const handler = lookupEventHandler("click");
          if (handler) {
            handler({ clickCount });
          }
        }}
        onReset={() => {
          const handler = lookupEventHandler("reset");
          if (handler) {
            handler();
          }
        }}
        registerComponentApi={registerComponentApi}
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
- **Events**: Describes what events the component can trigger
- **APIs**: Exposes methods that can be called from XMLUI
- **Theme variables**: Integrates with XMLUI's theming system
- **`createComponentRenderer`**: Bridges XMLUI markup to React component

### Renderer Patterns:

- **`extractValue`**: Safely extracts prop values from XMLUI nodes
- **`lookupEventHandler`**: Gets event handlers from XMLUI
- **`renderChild`**: Renders nested XMLUI content
- **`registerComponentApi`**: Exposes component methods to XMLUI

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
    <!-- Basic usage -->
    <HelloWorld />

    <!-- Custom message and theme -->
    <HelloWorld
      message="Welcome to XMLUI!"
      theme="success"
    />

    <!-- With event handling -->
    <HelloWorld
      message="Click me!"
      theme="warning"
      onClick="toast(`You clicked ${clickCount} times!`)"
      onReset="toast('Counter reset!')"
    />

    <!-- With nested content -->
    <HelloWorld
      message="I have children:"
      theme="error"
    >
      <Text>This is nested content!</Text>
      <Text>Pretty cool, right?</Text>
    </HelloWorld>

    <!-- Without counter -->
    <HelloWorld
      message="Clean version"
      showCounter="false"
    />
  </VStack>
</App>
```

### Component APIs Example

```xmlui-pg
<App var.message="Hello">
  <VStack spacing="4">
    <HelloWorld id="myHello" message="{message}" />

    <HStack spacing="2">
      <Button
        label="Reset Counter"
        onClick="myHello.reset()"
      />
      <Button
        label="Show Count"
        onClick="toast(`Current count: ${myHello.getClickCount()}`)"
      />
      <Button
        label="Change Message"
        onClick="message = message === 'Hello' ? 'Goodbye' : 'Hello'"
      />
    </HStack>
  </VStack>
</App>
```

## Common Patterns Explained

### Value Extraction
Use the appropriate `extractValue` methods in your renderer:

- `extractValue.asString()` - Required string
- `extractValue.asOptionalString()` - Optional string
- `extractValue.asOptionalBoolean()` - Optional boolean with default
- `extractValue.asDisplayText()` - For display text with formatting

### Event Handling
Always use `lookupEventHandler()` to get event handlers:

```tsx
onClick={(clickCount) => {
  const handler = lookupEventHandler("click");
  if (handler) {
    handler({ clickCount });
  }
}}
```

### Child Rendering
Use `renderChild()` for nested XMLUI content:

```tsx
{renderChild(node.children)}
// Or with default container:
{renderChild(node.children, { type: "Stack", orientation: "horizontal" })}
```

### Component APIs
For components that expose methods, use the `registerComponentApi` prop pattern:

```tsx
// In native component
React.useEffect(() => {
  if (registerComponentApi) {
    registerComponentApi(apiRef.current);
  }
}, [registerComponentApi]);

// In renderer
registerComponentApi={registerComponentApi}
```

### Theme Integration
Always prefix theme variables with your component name and use the `:export` pattern:

```scss
:export {
  themeVars: backgroundColor-HelloWorld borderColor-HelloWorld textColor-HelloWorld;
}

.helloWorld {
  background-color: var(--backgroundColor-HelloWorld, #defaultValue);
}
```

## Common Pitfalls to Avoid

1. **Infinite Render Loops**: Don't call `updateState` unnecessarily in event handlers
2. **Ref Callback Issues**: Use the `registerComponentApi` prop pattern instead of ref callbacks
3. **Missing Theme Export**: Always include the `:export` block in SCSS
4. **Incorrect Value Extraction**: Use the right `extractValue` method for each prop type
5. **Event Handler Errors**: Always check if handlers exist before calling them

## Next Steps

Now that you understand the basics, you can:

- Add more complex props and validation
- Implement advanced theming with light/dark mode support
- Create compound components with multiple child components
- Add form integration capabilities
- Build more sophisticated state management

This HelloWorld component demonstrates all the essential patterns for building XMLUI components. Use it as a reference when creating your own components!
