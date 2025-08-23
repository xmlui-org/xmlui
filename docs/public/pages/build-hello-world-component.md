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
import classnames from "classnames";
import styles from "./HelloWorld.module.scss";

type Props = {
  id?: string;
  message?: string;
  theme?: "default" | "success";
};

export const defaultProps = {
  message: "Hello, World!",
  theme: "default" as const,
};

export function HelloWorld({
  id,
  message = defaultProps.message,
  theme = defaultProps.theme,
}: Props) {
  const [clickCount, setClickCount] = useState(0);

  const handleClick = () => {
    setClickCount(clickCount + 1);
  };

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

- Essential props (message, theme, id)
- Internal click counter
- Theme variant support
- Simple styling


## Step 4: Create basic styles

```xmlui copy
cat > src/HelloWorld.module.scss << 'EOF'
.container {
  background-color: #f5f5f5;
  color: #333;
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
  display: inline-block;
  min-width: 200px;

  &.success {
    background-color: #d4edda;
    color: #155724;
  }
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
```

## Step 5: Create component metadata and renderer

Copy/paste these commands to create `HelloWorld.tsx`.

```bash
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
    theme: {
      description: "Visual theme variant.",
      isRequired: false,
      type: "string",
      availableValues: ["default", "success"],
      defaultValue: defaultProps.theme,
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
        theme={extractValue.asOptionalString(node.props?.theme)}
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

```xmlui-pg display noHeader
---app
<App xmlns:Extensions="component-ns:XMLUIExtensions">
  <VStack gap="2rem" padding="2rem">
    <Heading>HelloWorld Component Live Demo</Heading>

    <Card>
      <Heading level="h2">Basic Usage</Heading>
      <Extensions:HelloWorld message="Hello from the docs site!" />
    </Card>

    <Card>
      <Heading level="h2">With Success Theme</Heading>
      <Extensions:HelloWorld message="Success message" theme="success" />
    </Card>
  </VStack>
</App>
```

But you will want to see it in a standalone app. Switch to the xmlui repo home and run this tool.

```xmlui
node tools/create-xmlui-hello-world/index.js /path/to/test_folder
cd /path/to/test_folder
```

To run the app with Python.

```xmlui copy
python -m http.server # visit 8000
```

With Node.js.

```xmlui copy
npx server # visit 3000
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


Step 10: Add 