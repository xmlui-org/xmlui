# Build a Hello World Component

This guide will walk you through creating a complete React-based component for XMLUI, from initial setup to registration and testing. We'll build a functional HelloWorld component that demonstrates the core patterns for XMLUI component development.


## What you'll build

By the end of this guide, you'll have created a HelloWorld component that:

- Displays a customizable greeting message
- Features an interactive click counter
- Uses XMLUI's standard theming system
- Can embed nested children
- Follows all XMLUI patterns and conventions

## XMLUI component architecture

XMLUI components are made of three main parts:

1. **Native React Component** (`HelloWorldNative.tsx`) - The actual React implementation
2. **Component Metadata** (`HelloWorld.tsx`) - Describes props and integrates with XMLUI
3. **Component Registration** (`ComponentProvider.tsx`) - Registers the component with XMLUI

This separation allows XMLUI to understand your component's interface while maintaining clean React code.

## Prerequisites

- Familiarity with React and TypeScript
- Basic understanding of XMLUI markup
- A local clone of [https://github.com/xmlui-org/xmlui](https://github.com/xmlui-org/xmlui)

## Core components vs extensions

The XMLUI repository contains two types of components.

### Core Components

These are built into the main XMLUI library and available by default. Components like Button, Text, Card, and Stack live in `xmlui/xmlui/src/components/` and are always available in any XMLUI app.

### Extension packages

These are standalone components that can be optionally included. They live in `xmlui/packages` and are built, distributed, and imported separately.

We're building an extension package so the HelloWorld component can:

- Live separately from the core XMLUI library
- Be optionally included in standalone apps
- Be distributed and reused across different projects

Extensions are the recommended approach for custom components that aren't needed by every XMLUI application.

## Step 1: Create the component's directory

Switch to the directory into which you cloned the XMLUI repo.

Copy/paste this command to create a new directory for your component.

**Windows**

```xmlui
mkdir packages/xmlui-hello-world/src
cd packages/xmlui-hello-world
```

**Mac / WSL / Linux**
```xmlui
mkdir -p packages/xmlui-hello-world/src
cd packages/xmlui-hello-world
```

This creates:

- packages/xmlui-hello-world/ (main package directory for your extension)
- packages/xmlui-hello-world/src/ (source code for the HelloWorld component)

## Step 2: Create the package configuration

In `packages/xmlui-hello-world`, copy/paste this command to create `package.json`.

```xmlui copy
cat > package.json << 'EOF'
{
  "name": "xmlui-hello-world",
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "build:extension": "xmlui build-lib"
  },
  "devDependencies": {
    "xmlui": "*"
  },
  "main": "./dist/xmlui-hello-world.js",
  "files": [
    "dist"
  ]
}
EOF
```

This configuration:

- Sets up the extension as an ES module
- Defines the build script using XMLUI's build tools
- Includes only the built dist folder when the package is distributed

 `xmlui-hello-world.js` is the file you'll pull into a standalone XMLUI app using a `<script>` tag.

## Step 3: Create the React component

Copy/paste this command to create `src/HelloWorldNative.tsx` with the core React implementation.

```xmlui copy
cat > src/HelloWorldNative.tsx << 'EOF'
import React, { useState, useEffect } from "react";
import classnames from "classnames";
import { useEvent, RegisterComponentApiFn, UpdateStateFn } from "xmlui";
import styles from "./HelloWorld.module.scss";

type Props = {
 id?: string;
 message?: string;
 theme?: "default" | "success";
 registerComponentApi?: RegisterComponentApiFn;
 updateState?: UpdateStateFn;
 onDidClick?: (count: number) => void;
};

export const defaultProps = {
 message: "Hello, World!",
 theme: "default" as const,
};

export function HelloWorld({
 id,
 message = defaultProps.message,
 theme = defaultProps.theme,
 registerComponentApi,
 updateState,
 onDidClick,
}: Props) {
 const [clickCount, setClickCount] = useState(0);

 const handleClick = useEvent(() => {
   const newCount = clickCount + 1;
   setClickCount(newCount);
   onDidClick?.(newCount);
 });

 useEffect(() => {
   if (registerComponentApi) {
     registerComponentApi({
       getValue: () => clickCount,
       setValue: (value: number) => setClickCount(value),
     });
   }
 }, [registerComponentApi, clickCount]);

 return (
   <div className={classnames(styles.container, styles[theme])} id={id}>
     <h2 className={styles.message}>{message}</h2>
     <button className={styles.button} onClick={handleClick}>
       Click me!
     </button>
     <div className={styles.counter}>Clicks: {clickCount}</div>
   </div>
 );
}
EOF
```


This creates the core React component with:

- Props for customization (message, theme)
- Click counter functionality
- Event handling for user interactions
- API methods for programmatic control


Key patterns:

- **Props Interface**: Defines all component properties that XMLUI can set
- **forwardRef**: Allows XMLUI to get a reference to the DOM element
- **React State**: Uses `useState` for interactive behavior
- **Event Handlers**: Standard React click handlers for interactivity
- **Classnames**: Uses the `classnames` library for conditional CSS classes


## Step 4: Create the component styles

XMLUI's theming system lets your component adapt to different visual themes (light/dark mode, custom color schemes) automatically. Here's how it works:

-Component defines theme variables in SCSS.
-Component metadata provides default values.
-XMLUI generates CSS custom properties.
-Browser applies themed styles

Every theme variable includes your component name to prevent conflicts.

```xmlui
$backgroundColor: createThemeVar("backgroundColor-HelloWorld");
```

This creates a CSS custom property: `--xmlui-backgroundColor-HelloWorld`.

Instead of hardcoded colors, use XMLUI's design system tokens:

- `$color-surface-100` - Light background colors
- `$color-content-primary` - Main text color
- `$color-primary-500` - Brand/accent colors
- `$color-success-100` - Success state backgrounds

These tokens automatically adapt to light/dark themes.

Copy/paste these commands to create `HelloWorld.module.scss`.

```xmlui copy
cat > src/HelloWorld.module.scss << 'EOF'
@use "xmlui/themes.scss" as t;

// Required boilerplate for theme system
$themeVars: ();
@function createThemeVar($componentVariable) {
  $themeVars: t.appendThemeVar($themeVars, $componentVariable) !global;
  @return t.getThemeVar($themeVars, $componentVariable);
}

$component: "HelloWorld";

// Define your theme variables
$backgroundColor: createThemeVar("backgroundColor-#{$component}");
$color: createThemeVar("color-#{$component}");

.container {
  background-color: $backgroundColor;  // Uses theme variable
  color: $color;                       // Uses theme variable
  padding: 1rem;                       // Static value
  border-radius: 8px;                  // Static value
  text-align: center;
  display: inline-block;
  min-width: 200px;

  // Theme variant for success state
  &.success {
    background-color: createThemeVar("backgroundColor-#{$component}--success");
    color: createThemeVar("color-#{$component}--success");
  }
}

.message {
  margin: 0 0 1rem 0;
  font-size: 1.5rem;
}

.button {
  background-color: #4a90e2;          // Static blue (not themed)
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  margin-bottom: 1rem;

  &:hover {
    opacity: 0.9;
  }
}

.counter {
  font-size: 1.2rem;
  font-weight: bold;
}

// Required: Export theme variables for XMLUI
:export {
  themeVars: t.json-stringify($themeVars);
}
EOF
```

## Step 5: Create component metadata and renderer

Copy/paste these commands to create `HelloWorld.tsx`.

```bash
cat > src/HelloWorld.tsx << 'EOF'
import styles from "./HelloWorld.module.scss";
import { createComponentRenderer, parseScssVar, createMetadata } from "xmlui";
import { HelloWorld, defaultProps } from "./HelloWorldNative";

const HelloWorldMd = createMetadata({
  description: "`HelloWorld` demonstrates basic theming with customizable colors.",
  status: "experimental",
  props: {
    message: {
      description: "The message to display in the component.",
      isRequired: false,
      type: "string",
      defaultValue: defaultProps.message,
    },
    theme: {
      description: "The visual theme for the component.",
      isRequired: false,
      type: "string",
      availableValues: ["default", "success"],
      defaultValue: defaultProps.theme,
    },
  },
  events: {
    didClick: {
      description: "Fired when the button is clicked.",
      isRequired: false,
      type: "function",
    },
  },
  // Tell XMLUI what theme variables this component uses
  themeVars: parseScssVar(styles.themeVars),

  // Provide default values for light and dark themes
  defaultThemeVars: {
    // Light theme defaults
    [`backgroundColor-HelloWorld`]: "$color-surface-100",
    [`color-HelloWorld`]: "$color-content-primary",
    [`backgroundColor-HelloWorld--success`]: "$color-success-100",
    [`color-HelloWorld--success`]: "$color-success-800",

    // Dark theme overrides
    dark: {
      [`backgroundColor-HelloWorld`]: "$color-surface-300",
      [`color-HelloWorld`]: "$color-content-primary",
      [`backgroundColor-HelloWorld--success`]: "$color-success-300",
      [`color-HelloWorld--success`]: "$color-success-900",
    },
  },
});

export const helloWorldComponentRenderer = createComponentRenderer(
  "HelloWorld",
  HelloWorldMd,
  ({ node, extractValue, registerComponentApi, lookupEventHandler }) => {
    const onDidClick = lookupEventHandler?.("didClick");

    return (
      <HelloWorld
        id={extractValue.asOptionalString(node.props?.id)}
        message={extractValue.asOptionalString(node.props?.message, defaultProps.message)}
        theme={extractValue.asOptionalString(node.props?.theme, defaultProps.theme)}
        registerComponentApi={registerComponentApi}
        onDidClick={onDidClick}
      />
    );
  }
);
EOF
```

What happens at runtime:

1. XMLUI read your theme variables from the SCSS export
2. XMLUI applies the default values based on current theme (light/dark)
3. XMLUI injects CSS custom properties into the page
4. Your SCSS references these properties for dynamic theming

Key concepts:

- Theme variables are namespaced with your component name
- Static values (like padding) don't need theming
- XMLUI tokens (`$color-surface-100`) adapt to light/dark automatically
- Variants (`--success`) override base theme variables
- Dark theme values override light theme defaults

This system ensures your component looks consistent with the host application's theme while remaining customizable.

## Step 6: Create the extension index

Copy/paste this command to create `src/index.tsx` which exports your component as an extension.

```xmlui copy
cat > src/index.tsx << 'EOF'
import { helloWorldComponentRenderer } from "./HelloWorld";

export default {
  namespace: "XMLUIExtensions",
  components: [helloWorldComponentRenderer],
};
EOF
```

This creates the main entry point that exports your HelloWorld component under the XMLUIExtensions namespace.

## Step 7: Build the extension


First, build your HelloWorld extension.

```xmlui copy
npm run build:extension
```

This creates `xmlui-hello-world.js` in the `dist` folder.

```xmlui-pg noHeader
---app
<TreeDisplay content="
packages/xmlui-hello-world
 package.json
 src
  index.tsx
  HelloWorld.tsx
  HelloWorldNative.tsx
  HelloWorld.module.scss
 dist
  xmlui-hello-world.js
 " />
```

## Step 8: Test the extension

Copy/paste these commands to create a bare-bones XMLUI app outside the XMLUI repository.

**Windows**

```xmlui copy
cd %USERPROFILE%
mkdir test-hello-world
cd test-hello-world
mkdir xmlui
copy %USERPROFILE%\xmlui\packages\xmlui-hello-world\dist\xmlui-hello-world.js xmlui\
curl -L -o xmlui\xmlui.js https://github.com/xmlui-org/xmlui/releases/download/xmlui%400.10.1/xmlui-latest.js
```

**Mac / WSL / Linux**

```xmlui copy
cd ~
mkdir test-hello-world
cd test-hello-world
mkdir xmlui
cp ~/xmlui/packages/xmlui-hello-world/dist/xmlui-hello-world.js xmlui/
curl -L -o xmlui/xmlui.js https://github.com/xmlui-org/xmlui/releases/download/xmlui%400.10.1/xmlui-latest.js
```

Create the test HTML page.

```xmlui copy
cat > index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>HelloWorld Extension Test</title>
  <script src="xmlui/xmlui-latest.js"></script>
  <script src="xmlui/xmlui-hello-world.js"></script>
</head>
<body>
</body>
</html>
EOF
```

Create a `Main.xmlui` that uses the component we built.

```xmlui copy
cat > Main.xmlui << 'EOF'
<App xmlns:Extensions="component-ns:XMLUIExtensions">
  <Extensions:HelloWorld />
</App>
EOF
```

## Step 9: Add event handling

To demonstrate event handling, you need to define the event handler functions first. These functions can live in your `index.html` file, in [code-behind files](/code), or in [script tags](/helper-tags#script). Let's use the `index.html` approach. Add this function to your test app's `index.html`.


```xmlui copy
<script>
window.handleHelloClick = function(event) {
  console.log('Hello World clicked!', event);
  alert('Button clicked!');
};
</script>
```

Now you can use the HelloWorld component with event handling.

```xmlui copy
<App>
  <Extensions:HelloWorld
    message="Event handling example"
    onClick="handleHelloClick"
  />
</App>
```

Clicking the button triggers `handleHelloClick` which logs and alerts.


## Step 10: Enable the component API (exposed methods)

Components can expose methods that allow XMLUI applications to interact with them programmatically. Let's enhance our HelloWorld component to support both API methods and XMLUI's state system.

Update HelloWorldNative.tsx with full API support

```xmlui copy
cat > src/HelloWorldNative.tsx << 'EOF'
import React, { useState, useEffect } from "react";
import classnames from "classnames";
import { useEvent, RegisterComponentApiFn, UpdateStateFn } from "xmlui";
import styles from "./HelloWorld.module.scss";

type Props = {
  id?: string;
  message?: string;
  theme?: "default" | "success";
  registerComponentApi?: RegisterComponentApiFn;
  updateState?: UpdateStateFn;
  onDidClick?: (count: number) => void;
};

export const defaultProps = {
  message: "Hello, World!",
  theme: "default" as const,
};

export function HelloWorld({
  id,
  message = defaultProps.message,
  theme = defaultProps.theme,
  registerComponentApi,
  updateState,
  onDidClick,
}: Props) {
  const [clickCount, setClickCount] = useState(0);

  const setValue = useEvent((newCount: number) => {
    setClickCount(newCount);
    updateState?.({ value: newCount });
  });

  // Sync clickCount with XMLUI state system
  useEffect(() => {
    updateState?.({ value: clickCount });
  }, [updateState, clickCount]);

  useEffect(() => {
    if (registerComponentApi) {
      registerComponentApi({
        getValue: () => clickCount,
        setValue,
      });
    }
  }, [registerComponentApi, setValue, clickCount]);

  const handleClick = useEvent(() => {
    const newCount = clickCount + 1;
    setClickCount(newCount);
    updateState?.({ value: newCount });
    onDidClick?.(newCount);
  });

  return (
    <div className={classnames(styles.container, styles[theme])} id={id}>
      <h2 className={styles.message}>{message}</h2>
      <button className={styles.button} onClick={handleClick}>
        Click me!
      </button>
      <div className={styles.counter}>Clicks: {clickCount}</div>
    </div>
  );
}
EOF
```

Update HelloWorld.tsx renderer to pass state management props.

```xmlui copy
cat > src/HelloWorld.tsx << 'EOF'
import styles from "./HelloWorld.module.scss";
import { createComponentRenderer, parseScssVar, createMetadata } from "xmlui";
import { HelloWorld, defaultProps } from "./HelloWorldNative";

const HelloWorldMd = createMetadata({
  description:
    "`HelloWorld` is a demonstration component that shows basic XMLUI patterns. " +
    "It displays a customizable message, handles click events, and maintains internal state.",
  status: "experimental",
  props: {
    message: {
      description: "The message to display in the component.",
      isRequired: false,
      type: "string",
      defaultValue: defaultProps.message,
    },
    theme: {
      description: "The visual theme for the component.",
      isRequired: false,
      type: "string",
      availableValues: ["default", "success"],
      defaultValue: defaultProps.theme,
    },
  },
  events: {
    didClick: {
      description: "Fired when the button is clicked. Receives the current click count.",
      isRequired: false,
      type: "function",
    },
  },
  apis: {
    getValue: {
      description: "Returns the current click count.",
      signature: "getValue(): number",
    },
    setValue: {
      description: "Sets the click count.",
      signature: "setValue(value: number): void",
    },
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    [`backgroundColor-HelloWorld`]: "$color-surface-50",
    [`textColor-HelloWorld`]: "$color-content-primary",
    [`buttonBackgroundColor-HelloWorld`]: "$color-primary-500",
    [`buttonTextColor-HelloWorld`]: "$color-content-onPrimary",
    [`borderRadius-HelloWorld`]: "$borderRadius-md",
    [`padding-HelloWorld`]: "$space-4",
    [`backgroundColor-HelloWorld--success`]: "$color-success-50",
    [`textColor-HelloWorld--success`]: "$color-success-700",
    dark: {
      [`backgroundColor-HelloWorld`]: "$color-surface-200",
      [`textColor-HelloWorld`]: "$color-content-primary",
      [`backgroundColor-HelloWorld--success`]: "$color-success-200",
      [`textColor-HelloWorld--success`]: "$color-success-800",
    },
  },
});

export const helloWorldComponentRenderer = createComponentRenderer(
  "HelloWorld",
  HelloWorldMd,
  ({ node, extractValue, registerComponentApi, lookupEventHandler, updateState }) => {
    const onDidClick = lookupEventHandler?.("didClick");

    return (
      <HelloWorld
        id={extractValue.asOptionalString(node.props?.id)}
        message={extractValue.asOptionalString(node.props?.message, defaultProps.message)}
        theme={extractValue.asOptionalString(node.props?.theme, defaultProps.theme)}
        registerComponentApi={registerComponentApi}
        updateState={updateState}
        onDidClick={onDidClick}
      />
    );
  }
);
EOF
```


Update your test app to demonstrate the component API.

```xmlui copy
cat > Main.xmlui << 'EOF'
<App xmlns:Extensions="component-ns:XMLUIExtensions">
  <VStack gap="2rem" padding="2rem">
    <Heading>HelloWorld API Demo</Heading>

    <Extensions:HelloWorld id="demo" message="Click me or use the controls below" />

    <Card>
      <Heading level="{2}">API Controls</Heading>
      <HStack gap="1rem">
        <Button onClick="console.log('Current count:', demo.getValue())">
          Get Count
        </Button>
        <Button onClick="demo.setValue(5)">
          Set to 5
        </Button>
        <Button onClick="demo.setValue(10)">
          Set to 10
        </Button>
        <Button onClick="demo.setValue(0)">
          Reset to 0
        </Button>
      </HStack>
    </Card>

    <Card>
      <Heading level="{2}">Test in Console</Heading>
      <Text>Open browser console and try:</Text>
      <Text variant="codefence">demo.getValue()</Text>
      <Text variant="codefence">demo.setValue(42)</Text>
    </Card>
  </VStack>
</App>
EOF
```

