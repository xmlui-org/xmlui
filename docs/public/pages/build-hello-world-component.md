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

To run the app you'll need a local webserver. Here are two options.

```xmlui
python -m http.server # visit localhost:8000
```

If you have Node.js:

```xmlui
npx serve # visit localhost:3000
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

