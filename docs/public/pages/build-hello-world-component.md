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

But you will want to see it in a standalone app.


Create a new test app to verify your component works independently:

### Option 1: Use the create-xmlui-hello-world tool (Recommended)

```bash
node tools/create-xmlui-hello-world/index.js my-test-app
cd my-test-app
npm install
npm run build:extension
cd test-app
xmlui start
```

This creates a complete test environment with all the files you need!

### Option 2: Manual setup

```xmlui copy
cat > test-app/Main.xmlui << 'EOF'
<App xmlns:Extensions="component-ns:XMLUIExtensions">
  <VStack gap="2rem" padding="2rem">
    <Heading>HelloWorld Component Test</Heading>

    <Extensions:HelloWorld message="Hello from standalone app!" />

    <Extensions:HelloWorld message="Success message" theme="success" />
  </VStack>
</App>
EOF
```

Add the component script to your test app's `index.html`:

```html copy
<script src="../../packages/xmlui-hello-world/dist/xmlui-hello-world.js"></script>
```

Then start your test app:

```bash
cd test-app
xmlui start
```

Visit `http://localhost:5173` to see your HelloWorld component running in a standalone XMLUI application!


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


## Step 10: Test the component

Now let's test our HelloWorld component to make sure everything works correctly.

Update your test app to use the component:

```xmlui copy
cat > Main.xmlui << 'EOF'
<App xmlns:Extensions="component-ns:XMLUIExtensions">
  <VStack gap="2rem" padding="2rem">
    <Heading>HelloWorld Demo</Heading>

    <Extensions:HelloWorld message="Hello from XMLUI!" />

    <Extensions:HelloWorld message="Success message" theme="success" />

    <Extensions:HelloWorld id="demo" message="Click the button to see the counter!" />
  </VStack>
</App>
EOF
```

## Step 11: Integrate into the XMLUI docs site

Now that we have a working HelloWorld component, let's integrate it into the XMLUI docs site so it can be used alongside other components like Search and Playground.

### Update package.json for docs integration

First, let's update the package.json to include the scripts and configuration needed for docs integration:

```xmlui copy
cat > package.json << 'EOF'
{
  "name": "xmlui-hello-world",
  "version": "0.1.0",
  "sideEffects": false,
  "type": "module",
  "scripts": {
    "start": "xmlui start",
    "preview": "xmlui preview",
    "build:extension": "xmlui build-lib",
    "build-watch": "xmlui build-lib --watch",
    "build:demo": "xmlui build",
    "build:meta": "xmlui build-lib --mode=metadata"
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
    },
    "./*.css": {
      "import": "./dist/*.css",
      "require": "./dist/*.css"
    }
  },
  "files": [
    "dist"
  ],
  "engines": {
    "node": ">=18.0.0"
  },
  "author": "",
  "license": "ISC",
  "description": ""
}
EOF
```

### Add to docs extensions

Add the HelloWorld component to the docs site by updating `docs/extensions.ts`:

```xmlui copy
cat > docs/extensions.ts << 'EOF'
import playground from "xmlui-playground";
import search from "xmlui-search";
import helloWorld from "xmlui-hello-world";

export default [playground, search, helloWorld];
EOF
```

### Add as dependency

Add the HelloWorld component as a dependency in `docs/package.json`:

```xmlui copy
cat > docs/package.json << 'EOF'
{
  "name": "xmlui-docs",
  "private": true,
  "version": "0.0.5",
  "scripts": {
    "start": "echo '====================================================================\nExecuting \"npm run watch-docs-content\" in the project root,\nyou get automatic content generation based on xmlui metadata!\n====================================================================\n' && xmlui start",
    "preview": "xmlui preview",
    "gen:releases": "node scripts/get-releases.js --output 'public/resources/files/releases.json'",
    "gen:download-latest-xmlui-release": "node scripts/download-latest-xmlui.js",
    "build:docs": "xmlui build --buildMode=INLINE_ALL --withMock && npm run gen:download-latest-xmlui-release",
    "build-optimized": "npm run gen:releases && npm run gen:download-latest-xmlui-release && npx xmlui-optimizer",
    "release-ci-optimized": "npm run build-optimized && xmlui zip-dist --source=xmlui-optimized-output --target=ui-optimized.zip"
  },
  "dependencies": {
    "@shikijs/langs": "3.4.2",
    "shiki": "^3.3.0",
    "xmlui": "*",
    "xmlui-playground": "*",
    "xmlui-search": "*",
    "xmlui-hello-world": "*"
  },
  "msw": {
    "workerDirectory": [
      "public"
    ]
  },
  "devDependencies": {
    "@emotion/is-prop-valid": "^1.3.1",
    "@octokit/rest": "^22.0.0",
    "remark-parse": "11.0.0",
    "remark-stringify": "11.0.0",
    "strip-markdown": "6.0.0",
    "unified": "11.0.5"
  }
}
EOF
```

### Build and test

Now build the component, install dependencies, and start the docs site:

```xmlui copy
npm run build:extension
cd ../../docs
npm install
npm run start
```

Visit the docs site and you can now use the HelloWorld component in any XMLUI markup:

```xmlui
<App xmlns:Extensions="component-ns:XMLUIExtensions">
  <Extensions:HelloWorld message="Hello from the docs site!" />
</App>
```

The HelloWorld component is now fully integrated into the XMLUI ecosystem and can be used in:
- Standalone XMLUI applications (via script tag)
- The XMLUI docs site (via import)
- Any other XMLUI project that imports the extension

