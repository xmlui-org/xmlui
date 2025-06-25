# Build a Hello World Component


This guide will walk you through creating a complete React-based component for XMLUI, from initial setup to registration and testing. We'll build a functional HelloWorld component that demonstrates the core patterns for XMLUI component development.


## What You'll Build

By the end of this guide, you'll have created a HelloWorld component that:

- Displays a customizable greeting message
- Features an interactive click counter
- Supports theme variants (default, success)
- Uses XMLUI's standard theming system
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
import React, { useState } from "react";
import classnames from "classnames";
import styles from "./HelloWorld.module.scss";

type Props = {
  id?: string;
  message?: string;
  theme?: "default" | "success";
  children?: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
};

export const defaultProps: Partial<Props> = {
  message: "Hello, World!",
  theme: "default",
};

export const HelloWorld = React.forwardRef<HTMLDivElement, Props>(
  function HelloWorld(
    {
      id,
      message = defaultProps.message,
      theme = defaultProps.theme,
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
        className={classnames(className, styles.helloWorld, {
          [styles.success]: theme === "success",
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

## Step 3: Create Component Styles with XMLUI Theming

Create `xmlui/src/components/HelloWorld/HelloWorld.module.scss`:

```xmlui copy
@use "../../components-core/theming/themes" as t;

// --- This code snippet is required to collect the theme variables used in this module
$themeVars: ();
@function createThemeVar($componentVariable) {
  $themeVars: t.appendThemeVar($themeVars, $componentVariable) !global;
  @return t.getThemeVar($themeVars, $componentVariable);
}

$component: "HelloWorld";

// Compose standard theme variable sets
$themeVars: t.composePaddingVars($themeVars, $component);
$themeVars: t.composeBorderVars($themeVars, $component);
$themeVars: t.composeTextVars($themeVars, $component, $component);

// Add success theme variant
$themeVars: t.composeBorderVars($themeVars, "#{$component}-success");
$themeVars: t.composeTextVars($themeVars, "#{$component}-success", $component);

.helloWorld {
  @include t.paddingVars($themeVars, $component);
  @include t.borderVars($themeVars, $component);
  @include t.textVars($themeVars, $component);

  border-radius: createThemeVar("borderRadius-#{$component}");
  font-family: system-ui, -apple-system, sans-serif;
  transition: all 0.2s ease-in-out;
  max-width: 400px;

  &.success {
    @include t.borderVars($themeVars, "#{$component}-success");
    @include t.textVars($themeVars, "#{$component}-success");
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

// --- We export the theme variables to add them to the component renderer
:export {
  themeVars: t.json-stringify($themeVars);
}
```

### Key XMLUI Theming Patterns:

**XMLUI uses a standardized theming system that all components must follow:**

- **`@use "../../components-core/theming/themes" as t;`** - Import the XMLUI theming system
- **`$themeVars: ();`** - Initialize the theme variables collection
- **`createThemeVar()` function** - Helper to create individual theme variables
- **`t.compose*Vars()` functions** - Generate complete sets of related theme variables:
  - `composePaddingVars()` - Creates padding variables (top, bottom, left, right, horizontal, vertical)
  - `composeBorderVars()` - Creates border variables (color, width, style, radius)
  - `composeTextVars()` - Creates text variables (color, font-family, font-size, background-color, etc.)
- **`@include t.*Vars()` mixins** - Apply the theme variables to CSS properties
- **`:export { themeVars: t.json-stringify($themeVars); }`** - Export variables for XMLUI's runtime system

**Theme Variants:**
- Create variants by composing additional theme variable sets (e.g., `"#{$component}-success"`)
- Apply variants using SCSS classes and mixins
- This ensures consistent theming across all component states

**Why This Approach:**
- **Consistency** - All XMLUI components use the same theming patterns
- **Completeness** - Automatically generates comprehensive theme variable sets
- **Performance** - Programmatic generation is more efficient than manual string parsing
- **Browser Compatibility** - Works reliably across all browsers including Edge

## Step 4: Create Component Metadata and Renderer

Create `xmlui/src/components/HelloWorld/HelloWorld.tsx`:

```xmlui copy
import styles from "./HelloWorld.module.scss";
import { createMetadata } from "../../abstractions/ComponentDefs";
import { createComponentRenderer } from "../../components-core/renderers";
import { parseScssVar } from "../../components-core/theming/themeVars";
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
    theme: {
      description: "Sets the visual theme of the component.",
      type: "string",
      availableValues: [
        { value: "default", description: "Default theme" },
        { value: "success", description: "Success theme (green)" },
      ],
    },
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    // Standard HelloWorld theme variables using XMLUI semantic tokens
    [`backgroundColor-${COMP}`]: "$color-surface-50",
    [`borderColor-${COMP}`]: "$color-surface-200",
    [`borderWidth-${COMP}`]: "$space-2",
    [`borderStyle-${COMP}`]: "solid",
    [`borderRadius-${COMP}`]: "$borderRadius",
    [`padding-${COMP}`]: "$space-4",
    [`textColor-${COMP}`]: "$color-primary",

    // Success theme variant
    [`backgroundColor-${COMP}-success`]: "$color-success-50",
    [`borderColor-${COMP}-success`]: "$color-success-200",
    [`textColor-${COMP}-success`]: "$color-success-800",
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
        theme={extractValue.asOptionalString(node.props.theme)}
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
- **Theme integration**: `themeVars` and `defaultThemeVars` enable theming support

### Renderer Patterns:

- **`createComponentRenderer`**: Bridges XMLUI markup to React component
- **`extractValue`**: Safely extracts prop values from XMLUI nodes
- **`renderChild`**: Renders nested XMLUI content
- **`layoutCss`**: Provides XMLUI layout styling

## Step 5: Add Event Handling

To demonstrate event handling, you need to define the event handler functions first. These functions can live in your `index.html` file or in [code-behind files](/code). For this documentation site, we define them in `index.html` as we do for other global functions.

### Add event handlers

The XMLUI documentation site already includes these functions in its `index.html`:

```javascript
window.handleHelloClick = function(event) {
  console.log('Hello World clicked!', event);
  alert('Button clicked!');
};

window.handleHelloReset = function(event) {
  console.log('Hello World reset!', event);
  alert('Counter was reset!');
};
```

### Use the event handlers

Now you can use the HelloWorld component with event handling:

```xmlui-pg display
<App>
  <HelloWorld
    message="Event handling example"
    onClick="handleHelloClick"
    onReset="handleHelloReset"
  />
</App>
```

**What happens:**
- Clicking the button triggers `handleHelloClick` with the DOM event
- Clicking reset triggers `handleHelloReset` with the DOM event
- Both functions show alerts and log to console
- The component's internal state still works (counter increments/resets)

**Note:** Event handler functions can be defined in your `index.html` file (as shown) or in [code-behind files](/code). See the [Code guide](/code) for more details on organizing JavaScript functions in XMLUI applications.

## Step 6: Component API (Exposed Methods)

Components can expose methods that allow XMLUI applications to interact with them programmatically. This enables external control of component state and behavior beyond just props and events.

### Add registerComponentApi prop to HelloWorldNative.tsx

First, add the prop to the Props interface:
```xmlui
type Props = {
  // ... existing props
  registerComponentApi?: (api: any) => void;
};
```

Then inside the component function, add useEffect to register the API:
```xmlui
import React, { useState, useEffect } from "react";

// Inside the component function:
useEffect(() => {
  registerComponentApi?.({
    get value() {
      return clickCount;
    },
    setValue: (newCount: number) => {
      setClickCount(newCount);
    },
  });
}, [clickCount, registerComponentApi]);
```

### Add exposed methods to HelloWorld.tsx metadata

```tsx
export const HelloWorldMd = createMetadata({
  // ... existing metadata
  apis: {
    value: dValue(),
    setValue: dSetValueApi(),
  },
  // ... rest of metadata
});
```

**Update HelloWorld.tsx renderer:**
```xmlui
export const helloWorldComponentRenderer = createComponentRenderer(
  COMP,
  HelloWorldMd,
  ({ node, extractValue, renderChild, layoutCss, lookupEventHandler, registerComponentApi }) => {
    return (
      <HelloWorld
        id={extractValue.asOptionalString(node.props.id)}
        message={extractValue.asOptionalString(node.props.message)}
        theme={extractValue.asOptionalString(node.props.theme)}
        onClick={lookupEventHandler("onClick")}
        onReset={lookupEventHandler("onReset")}
        registerComponentApi={registerComponentApi}
        style={layoutCss}
      >
        {renderChild(node.children)}
      </HelloWorld>
    );
  }
);
```

This pattern allows XMLUI applications to:
- Get the current click count: `demo.value` (through XMLUI's built-in state system)
- Set the click count programmatically: `demo.setValue(5)` (through component API)
- Control component state from code-behind or other components

**Key insight:** The `updateState({ value: newCount })` calls are what make `demo.value` accessible in XMLUI markup. This syncs the component's internal state with XMLUI's state management system.

**Live example:**

Test the Component API methods with this interactive example:

```xmlui-pg display
<App>
  <VStack spacing="4">
    <HelloWorld id="demo" message="API Demo" />

    <HStack spacing="2">
      <Button onClick="() => alert('Current count: ' + demo.value)">Get Count</Button>
      <Button onClick="() => demo.setValue(5)">Set to 5</Button>
      <Button onClick="() => demo.setValue(0)">Reset</Button>
    </HStack>

    <Text>Current count: {demo.value}</Text>
  </VStack>
</App>
```

This demonstrates:
- Getting the current value with `demo.value` (XMLUI's automatic state access)
- Setting values with `demo.setValue()` (component API method)
- Reactive updates when the component state changes

## Step 7: Register the Component

Add your component to `xmlui/src/components/ComponentProvider.tsx`.

First, add the import near the top with other component imports:

```xmlui
import { buttonComponentRenderer } from "./Button/Button";
import { helloWorldComponentRenderer } from "./HelloWorld/HelloWorld";
```

Then register the component in the `ComponentRegistry` constructor:

```xmlui
if (process.env.VITE_USED_COMPONENTS_Button !== "false") {
  this.registerCoreComponent(buttonComponentRenderer);
}
if (process.env.VITE_USED_COMPONENTS_HelloWorld !== "false") {
  this.registerCoreComponent(helloWorldComponentRenderer);
}
```

## Step 8: Test Your Component

You can now use your HelloWorld component in XMLUI markup:

### Basic Usage
```xml
<App>
  <HelloWorld />
</App>
```

### Interactive Examples

Try these examples in the XMLUI playground:

```xmlui-pg display
<App>
  <VStack spacing="4">
    <!-- Custom message -->
    <HelloWorld message="Hello World!" />

    <!-- With nested content -->
    <HelloWorld message="Nested content">
      <Text>Nested text</Text>
    </HelloWorld>

    <!-- Theme variant -->
    <HelloWorld message="Success theme" theme="success" />

  </VStack>
</App>
```
## Common Patterns Explained

### Value Extraction
Use the appropriate `extractValue` methods in your renderer:

- `extractValue.asString()` - Required string value
- `extractValue.asOptionalString()` - Optional string value (returns undefined if not set)
- `extractValue.asNumber()` - Required number value
- `extractValue.asOptionalNumber()` - Optional number value
- `extractValue.asBoolean()` - Required boolean value
- `extractValue.asOptionalBoolean()` - Optional boolean value

### State Management
Use standard React hooks for component state:

```xmlui
const [clickCount, setClickCount] = useState(0);
```

### Event Handling
XMLUI components can expose events that XMLUI apps can handle. This involves several steps:

**1. Add event props to your component's Props interface:**
```xmlui
type Props = {
  // ... other props
  onClick?: string;
  onReset?: string;
};
```

**2. Use event handler props in your component:**
```xmlui
const handleClick = () => {
  const newCount = clickCount + 1;
  setClickCount(newCount);
  // Call XMLUI event handler if provided
  onClick?.();
};

const handleReset = () => {
  setClickCount(0);
  // Call XMLUI event handler if provided
  onReset?.();
};
```

**3. Declare events in your component metadata:**
```xmlui
events: {
  onClick: {
    description: "Triggered when the click button is pressed. Receives the current click count.",
    type: "function",
  },
  onReset: {
    description: "Triggered when the reset button is pressed. Called when count is reset to 0.",
    type: "function",
  },
},
```

**4. Use lookupEventHandler in the renderer:**
```xmlui
// In the renderer function
return (
  <HelloWorld
    onClick={lookupEventHandler("onClick")}
    onReset={lookupEventHandler("onReset")}
    // ... other props
  />
);
```

This pattern allows XMLUI apps to handle component events while maintaining the component's internal behavior.

### Conditional Rendering
Use React conditional rendering for dynamic content:

```xmlui
{clickCount > 0 && (
  <button onClick={handleReset}>Reset</button>
)}
```

## Advanced Theming Patterns

### Understanding XMLUI's Theming System

XMLUI uses a sophisticated theming system that automatically generates comprehensive CSS custom properties for consistent styling across all components. This system provides several key benefits:

**Automatic Variable Generation**: Instead of manually defining individual CSS variables, XMLUI's theme functions generate complete sets of related variables. For example, `composePaddingVars()` creates all padding-related variables including `padding-{component}`, `paddingTop-{component}`, `paddingBottom-{component}`, etc.

**Semantic Token Integration**: Theme variables reference semantic design tokens like `$color-surface-50` and `$space-4`, ensuring consistent design across your application.

**Runtime Customization**: The exported theme variables enable runtime theming and customization through XMLUI's theming API.

### Theme Variable Composition Functions

XMLUI provides several composition functions for common styling patterns:

#### Padding Variables
```scss
$themeVars: t.composePaddingVars($themeVars, $component);
```
Generates: `padding-{component}`, `paddingTop-{component}`, `paddingBottom-{component}`, `paddingLeft-{component}`, `paddingRight-{component}`, `paddingHorizontal-{component}`, `paddingVertical-{component}`

#### Border Variables
```scss
$themeVars: t.composeBorderVars($themeVars, $component);
```
Generates: `borderColor-{component}`, `borderWidth-{component}`, `borderStyle-{component}`, `borderRadius-{component}`, plus variants for each side (Top, Bottom, Left, Right)

#### Text Variables
```scss
$themeVars: t.composeTextVars($themeVars, $component, $component);
```
Generates: `textColor-{component}`, `backgroundColor-{component}`, `fontSize-{component}`, `fontFamily-{component}`, `fontWeight-{component}`, `lineHeight-{component}`, `textAlign-{component}`

### Creating Theme Variants

To create theme variants (like our "success" theme), compose additional variable sets with variant names:

```scss
// Standard variables
$themeVars: t.composeBorderVars($themeVars, $component);
$themeVars: t.composeTextVars($themeVars, $component, $component);

// Success variant
$themeVars: t.composeBorderVars($themeVars, "#{$component}-success");
$themeVars: t.composeTextVars($themeVars, "#{$component}-success", $component);
```

Then apply them conditionally in your styles:

```scss
.helloWorld {
  @include t.borderVars($themeVars, $component);
  @include t.textVars($themeVars, $component);

  &.success {
    @include t.borderVars($themeVars, "#{$component}-success");
    @include t.textVars($themeVars, "#{$component}-success");
  }
}
```

### Default Theme Variables

In your component metadata, provide sensible defaults using XMLUI's semantic tokens:

```xmlui
defaultThemeVars: {
  // Use semantic color tokens
  [`backgroundColor-${COMP}`]: "$color-surface-50",
  [`borderColor-${COMP}`]: "$color-surface-200",
  [`textColor-${COMP}`]: "$color-primary",

  // Use spacing tokens
  [`padding-${COMP}`]: "$space-4",
  [`borderWidth-${COMP}`]: "$space-2",

  // Use design tokens
  [`borderRadius-${COMP}`]: "$borderRadius",
  [`borderStyle-${COMP}`]: "solid",

  // Variant defaults
  [`backgroundColor-${COMP}-success`]: "$color-success-50",
  [`borderColor-${COMP}-success`]: "$color-success-200",
  [`textColor-${COMP}-success`]: "$color-success-800",
}
```

### Why This Theming Approach?

**Consistency**: All XMLUI components follow the same theming patterns, ensuring a cohesive design system.

**Completeness**: The composition functions generate comprehensive variable sets, so you don't miss important styling properties.

**Performance**: Programmatic generation is more efficient than parsing strings at runtime.

**Maintainability**: Centralized theming functions make it easy to update theming patterns across all components.

**Browser Compatibility**: This approach works reliably across all browsers, including older versions of Edge.

### Common Testing Scenarios

1. **Default State**: Verify the component renders correctly with no props
2. **Custom Props**: Test each prop individually and in combination
3. **Theme Variants**: Ensure all theme variants render correctly
4. **Children Content**: Test with various types of nested content
5. **Interactive Behavior**: Test all interactive features (clicks, state changes)
6. **Edge Cases**: Test with empty strings, very long text, etc.


## Summary

You've successfully created a complete XMLUI component that demonstrates:

- **React Integration**: Clean separation between React implementation and XMLUI integration
- **Theming System**: Full integration with XMLUI's standardized theming approach
- **Interactive Features**: State management and event handling
- **Component Metadata**: Type-safe prop definitions and documentation
- **Theme Variants**: Multiple visual styles using XMLUI theming patterns
- **Children Support**: Rendering nested XMLUI content

This foundation will serve you well as you build more complex XMLUI components. The patterns demonstrated here scale to components of any complexity while maintaining consistency with the broader XMLUI ecosystem.

