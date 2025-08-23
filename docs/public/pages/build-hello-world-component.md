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

1. Native React component (`HelloWorldNative.tsx`) - The actual React implementation
2. Component metadata (`HelloWorld.tsx`) - Describes props and integrates with XMLUI
3. Component registration (`ComponentProvider.tsx`) - Registers the component with XMLUI

This separation allows XMLUI to understand your component's interface while maintaining clean React code.

## Prerequisites

- Familiarity with React and TypeScript
- Basic understanding of XMLUI markup
- A local clone of [https://github.com/xmlui-org/xmlui](https://github.com/xmlui-org/xmlui)

**Core components vs extensions**

The XMLUI repository contains two types of components.

**Core components** are built into the main XMLUI library and available by default. Components like Button, Text, Card, and Stack live in `xmlui/xmlui/src/components/` and are always available in any XMLUI app.

**Extension packages** are standalone components that can be optionally included. They live in `xmlui/packages` and are built, distributed, and imported separately.

We're building an extension package so the HelloWorld component can:

- Live separately from the core XMLUI library
- Be optionally included in standalone apps
- Be distributed and reused across different projects

Extensions are the recommended approach for custom components that aren't needed by every XMLUI application.

## Step 1: Create the component's directory

Switch to the directory into which you cloned the XMLUI repo.

Copy/paste this command to create a new directory for your component.

**Windows**

```xmlui copy
mkdir packages/xmlui-hello-world/src
cd packages/xmlui-hello-world
```

**Mac / WSL / Linux**
```xmlui copy
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
  "module": "./dist/xmlui-hello-world.mjs",
  "exports": {
    ".": {
      "import": "./dist/xmlui-hello-world.mjs",
      "require": "./dist/xmlui-hello-world.js"
    }
  },
  "files": [
    "dist"
  ]
}
EOF
```

The build system will generate both:

- xmlui-hello-world.js (CommonJS/UMD for browser script tags)
- xmlui-hello-world.mjs (ES modules for import statements)

 `xmlui-hello-world.js` is the file you'll pull into a standalone XMLUI app using a `<script>` tag.

## Step 3: Create the React component

Copy/paste this command to create `src/HelloWorldNative.tsx` with the core React implementation.

```xmlui copy
cat > src/HelloWorldNative.tsx << 'EOF'
import React, { useState } from "react";
import styles from "./HelloWorld.module.scss";

type Props = {
  id?: string;
  message?: string;
};

export const defaultProps = {
  message: "Hello, World!",
};

export function HelloWorld({
  id,
  message = defaultProps.message,
}: Props) {
  const [clickCount, setClickCount] = useState(0);

  const handleClick = () => {
    setClickCount(clickCount + 1);
  };

  return (
    <div className={styles.container} id={id}>
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

- Essential props (message, theme, id)
- Internal click counter

## Step 4: Create basic styles

```xmlui copy
cat > src/HelloWorld.module.scss << 'EOF'
// XMLUI provides great defaults - no custom styling needed!
EOF
```

## Step 5: Create component metadata and renderer

Copy/paste these commands to create `HelloWorld.tsx`.

```xmlui copy
cat > src/HelloWorld.tsx << 'EOF'
import styles from "./HelloWorld.module.scss";
import { createComponentRenderer, createMetadata } from "xmlui";
import { HelloWorld, defaultProps } from "./HelloWorldNative";

const HelloWorldMd = createMetadata({
  description: "`HelloWorld` is a demonstration component.",
  status: "experimental",
  props: {
    message: {
      description: "The message to display.",
      isRequired: false,
      type: "string",
      defaultValue: defaultProps.message,
    },
  },
});

export const helloWorldComponentRenderer = createComponentRenderer(
  "HelloWorld",
  HelloWorldMd,
  ({ node, extractValue }) => {
    return (
      <HelloWorld
        id={extractValue.asOptionalString(node.props?.id)}
        message={extractValue.asOptionalString(node.props?.message)}
      />
    );
  }
);
EOF
```


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

Since we've integrated it into the docs site, you can see it live right here.

```xmlui-pg
---app display
<App xmlns:Extensions="component-ns:XMLUIExtensions">
  <VStack gap="2rem" padding="2rem">
    <Heading>HelloWorld Component Live Demo</Heading>

    <Card>
      <Extensions:HelloWorld message="Hello from the docs site!" />
    </Card>

  </VStack>
</App>
```

But you will want to see it in a standalone app. Switch to the xmlui repo home and run this tool.

```xmlui copy
node tools/create-xmlui-hello-world/index.js /path/to/test_folder
```

Then switch to that folder.

```xmlui copy
cd /path/to/test_folder
```

This creates:

```xmlui-pg noHeader
---app
<TreeDisplay content="
test-folder
  Main.xmlui
  index.html
  xmlui
    xmlui-hello-world.js
    xmlui-latest.js
 " />
```

To run the app with Python.

```xmlui copy
python -m http.server # visit 8000
```

With Node.js.

```xmlui copy
npx server # visit 3000
```


## Step 9: Customize the theme

You might have noticed that the "success" theme works even though we didn't explicitly define those colors. This is because XMLUI's theming system automatically generates CSS variables for common semantic variants and provides default values.

**How XMLUI's theme system works**

The SCSS file compiles to CSS variables:

```xmlui
&.success {
  background-color: createThemeVar("backgroundColor-#{$component}--success");
  color: createThemeVar("textColor-#{$component}--success");
}
```

Becomes:
```xmlui
._container_mm3fe_13._success_mm3fe_22{
  background-color:var(--xmlui-backgroundColor-HelloWorld--success);
  color:var(--xmlui-textColor-HelloWorld--success)
}
```

XMLUI's theme system automatically provides values for these CSS variables, even without explicit definitions. The system has:
- Default success colors: Green backgrounds, dark text
- Semantic color mapping: `success` → green, `error` → red, etc.
- Fallback values: Uses defaults when no specific theme is defined

**Adding custom theme variables**

Let's customize the component with our own colors. Update `HelloWorld.module.scss`:

```xmlui copy
@use "xmlui/themes.scss" as t;

$themeVars: ();
@function createThemeVar($componentVariable) {
  $themeVars: t.appendThemeVar($themeVars, $componentVariable) !global;
  @return t.getThemeVar($themeVars, $componentVariable);
}

$component: "HelloWorld";

// Define basic theme variables
$backgroundColor: createThemeVar("backgroundColor-#{$component}");
$textColor: createThemeVar("textColor-#{$component}");

.container {
  background-color: $backgroundColor;
  color: $textColor;
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
  display: inline-block;
  min-width: 200px;
}

.message {
  margin: 0 0 1rem 0;
  font-size: 1.5rem;
}

.button {
  background-color: #4a90e2;
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

:export {
  themeVars: t.json-stringify($themeVars);
}
```

**Understanding the theme system**

The XMLUI theming system is sophisticated enough to:

1. Auto-generate CSS variables for component styling
2. Provide semantic defaults for common design tokens
3. Allow theme overrides when needed
4. Maintain consistency across all components

The component works because:
- CSS variables exist: `--xmlui-backgroundColor-HelloWorld` and `--xmlui-textColor-HelloWorld`
- XMLUI provides defaults: Surface background, primary text color
- Theme system is comprehensive: Handles design tokens automatically
- Fallback mechanism: If no specific theme is defined, use semantic defaults

*Rebuild and test

After updating the SCSS, rebuild the extension:

```xmlui copy
npm run build:extension
```

The component will now use your custom theme variables, but will fall back to XMLUI's semantic defaults if no specific values are provided.

**Test the customized theme**

Let's see the updated component with custom theme variables.

```xmlui-pg
---app display
<App xmlns:Extensions="component-ns:XMLUIExtensions">
  <VStack gap="2rem" padding="2rem">
    <Heading>HelloWorld with Custom Theme Variables</Heading>

    <Card>
      <Heading level="h2">Default Theme</Heading>
      <Extensions:HelloWorld message="Default styling" />
    </Card>

    <Card>
      <Heading level="h2">Custom Theme Variables</Heading>
      <Extensions:HelloWorld message="Custom colors" />
    </Card>

    <Card>
      <Heading level="h2">Dynamic Theme Override</Heading>
      <Theme
        backgroundColor-HelloWorld="#ff6b6b"
        textColor-HelloWorld="#ffffff"
      >
        <Extensions:HelloWorld message="Dynamically themed!" />
      </Theme>
    </Card>
  </VStack>
</App>
```

Notice how the component now uses your custom theme variables. The earlier example in Step 8 continues to work unchanged - it just uses XMLUI's default semantic colors.

**Understanding the three theming approaches**

1. Default styling: Uses the component's default colors
2. Custom theme variables: Your SCSS-defined colors (from the component)
3. Dynamic theme override: Runtime color changes using the `<Theme>` component

The `<Theme>` component allows you to override any CSS custom property at runtime, making your components incredibly flexible for different contexts and user preferences.

## Step 10: Add event handling

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


Step 10: Add