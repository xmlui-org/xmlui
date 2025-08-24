# Build a Hello World component

In this tutorial we'll build a HelloWorld component that demonstrates the core patterns for XMLUI component development.

The XMLUI repository contains two types of components:

**Core components** are built into the main XMLUI library and available by default. Components like Button, Text, Card, and Stack live in `xmlui/xmlui/src/components/` and are always available in any XMLUI app.

**Extension packages** are standalone components that can be optionally included. They live in `xmlui/packages` and are built, distributed, and imported separately.

We'll build an extension package so the HelloWorld component can:

- Live separately from the core XMLUI library
- Be optionally included in standalone apps
- Be distributed and reused across different projects

Extensions are the recommended approach for custom components that aren't needed by every XMLUI application. By the end of this guide, you'll have created a HelloWorld component that:

- Displays a customizable greeting message
- Features an interactive click counter
- Uses XMLUI's standard theming system
- Defines event handlers
- Provides callable methods


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

## Step 1: Prepare the workspace

Since you'll be working in the same XMLUI repository that creates this site, you'll need to clear out the existing HelloWorld component to start fresh.

Switch to the directory into which you cloned the XMLUI repo.

**Windows**

```xmlui copy
cd packages/xmlui-hello-world
rmdir /s /q src
mkdir src
```

**Mac / WSL / Linux**

```xmlui copy
cd packages/xmlui-hello-world
rm -rf src/*
```

This clears out the existing HelloWorld component files so you can build it from scratch.

> [!INFO]
> This page includes playground examples that use the HelloWorld component. They are available here because this site loads the final extension package that you'll build. Rebooting the package will change how the examples would work in a local preview of the site, but you won't be doing a local preview, you will load the component as an extension into a standalone app and observe the progression of examples there.

## Step 2: Create the package configuration

Switch to `packages/xmlui-hello-world` and copy/paste this command to recreate `package.json`.

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
.container {
  background-color: #f5f5f5;
  color: #333;
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
    <H1>HelloWorld Component Live Demo</H1>

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


## Step 9: Add theming support

So far, our HelloWorld component uses hardcoded colors. Let's integrate it with XMLUI's theming system to make it more flexible and consistent with the rest of the UI.

**Understanding XMLUI's theme system**

XMLUI provides a sophisticated theming system that:
- Uses semantic design tokens (like `$color-surface-50`, `$color-content-primary`)
- Automatically supports light and dark modes
- Maintains consistency across all components
- Allows runtime customization via the `<Theme>` component

**Adding theme variables**

Let's update our SCSS to use XMLUI's theme system:

```xmlui copy
cat > src/HelloWorld.module.scss << 'EOF'
@use "xmlui/themes.scss" as t;

$themeVars: ();
@function createThemeVar($componentVariable) {
  $themeVars: t.appendThemeVar($themeVars, $componentVariable) !global;
  @return t.getThemeVar($themeVars, $componentVariable);
}

$component: "HelloWorld";

// Define theme variables for our component
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
EOF
```

**What changed**

Instead of hardcoded colors like `#f5f5f5` and `#333`, we now use:
- `$backgroundColor` - Uses XMLUI's surface color tokens
- `$textColor` - Uses XMLUI's content color tokens

The `createThemeVar()` function registers these variables with XMLUI's theme system, making them available for customization.

**Update component metadata**

We also need to tell XMLUI about our theme variables. Update the metadata in `HelloWorld.tsx`:

```xmlui copy
cat > src/HelloWorld.tsx << 'EOF'
import styles from "./HelloWorld.module.scss";
import { createComponentRenderer, parseScssVar, createMetadata } from "xmlui";
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
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    [`backgroundColor-HelloWorld`]: "$color-surface-50",
    [`textColor-HelloWorld`]: "$color-content-primary",
    dark: {
      [`backgroundColor-HelloWorld`]: "$color-surface-800",
      // No textColor override needed - $color-content-primary should auto-adapt
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

**Rebuild and test**

```xmlui copy
npm run build:extension
```

Now your component uses XMLUI's theme system! It will automatically adapt to light/dark modes and can be customized using the `<Theme>` component.

**Test the themed component**

```xmlui-pg
---app display
<App xmlns:Extensions="component-ns:XMLUIExtensions">
  <VStack gap="2rem" padding="2rem">
    <H1>HelloWorld with Theme Variables</H1>

    <Extensions:HelloWorld message="Default styling" />

    <Card>
      <H2>Custom Colors</H2>
      <Theme
        backgroundColor-HelloWorld="$color-warn-300"
        textColor-HelloWorld="$textColor-primary"
      >
        <Extensions:HelloWorld message="Custom colors!" />
      </Theme>
    </Card>

    <ToneSwitch />
  </VStack>
</App>
```

Notice how the component now uses theme variables instead of hardcoded colors. The `<Theme>` component allows you to override any theme variable at runtime, making your components incredibly flexible for different contexts and user preferences.

## Step 10: Add event handling

The HelloWorld component has a click handler that increments a counter, and a reset that sets the count to zero. Let's add event definitions to signal parent components when these events happen.

**Add event definitions**

Update the component metadata in `src/HelloWorld.tsx`:

```xmlui copy
cat > src/HelloWorld.tsx << 'EOF'
import styles from "./HelloWorld.module.scss";
import { createComponentRenderer, parseScssVar, createMetadata } from "xmlui";
import { HelloWorld, defaultProps } from "./HelloWorldNative";

const COMP = "HelloWorld";

export const HelloWorldMd = createMetadata({
  description:
    "`HelloWorld` is a demonstration component that shows basic XMLUI patterns. " +
    "It displays a customizable greeting message with an interactive click counter.",
  status: "experimental",
  props: {
    message: {
      description: "The greeting message to display.",
      type: "string",
      defaultValue: defaultProps.message,
    },
  },
  events: {
    onClick: {
      description:
        "Triggered when the click button is pressed. " + "Receives the current click count.",
      type: "function",
    },
    onReset: {
      description:
        "Triggered when the reset button is pressed. " + "Called when count is reset to 0.",
      type: "function",
    },
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    [`backgroundColor-HelloWorld`]: "$color-surface-50",
    [`textColor-HelloWorld`]: "$color-content-primary",
    dark: {
      [`backgroundColor-HelloWorld`]: "$color-surface-800",
      // No textColor override needed - $color-content-primary should auto-adapt
    },
  },
});

export const helloWorldComponentRenderer = createComponentRenderer(
  COMP,
  HelloWorldMd,

  ({ node, extractValue, lookupEventHandler, className }) => {
    return (
      <HelloWorld
        id={extractValue.asOptionalString(node.props?.id)}
        message={extractValue.asOptionalString(node.props?.message)}
        onClick={lookupEventHandler("onClick")}
        onReset={lookupEventHandler("onReset")}
        className={className}
      />
    );
  },
);
EOF
```

**Update the native component**

Update `src/HelloWorldNative.tsx` to accept and call the event handler.

```xmlui copy
cat > src/HelloWorldNative.tsx << 'EOF'
import React, { useState, useEffect } from "react";
import styles from "./HelloWorld.module.scss";

type Props = {
  id?: string;
  message?: string;
  onClick?: (event: React.MouseEvent) => void;
  onReset?: (event: React.MouseEvent) => void;
};

export const defaultProps = {
  message: "Hello, World!",
};

export const HelloWorld = React.forwardRef<HTMLDivElement, Props>(
  function HelloWorld(
    {
      id,
      message = defaultProps.message,
      onClick,
      onReset
    },
    ref
  ) {
    const [clickCount, setClickCount] = useState(0);

    const handleClick = (event: React.MouseEvent) => {
      const newCount = clickCount + 1;
      setClickCount(newCount);
      onClick?.(event);
    };

    const handleReset = (event: React.MouseEvent) => {
      setClickCount(0);
      onReset?.(event);
    };

    return (
      <div className={styles.container} id={id}>
        <h2 className={styles.message}>{message}</h2>
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
    );
  }
);

EOF
```

**Rebuild the extension**

```xmlui copy
npm run build:extension
```

**Test Event Handling**

Now you can use the component with event handling:

```xmlui-pg
---app display
<App xmlns:Extensions="component-ns:XMLUIExtensions">
    <Extensions:HelloWorld
          onClick="handleHelloClick"
          onReset="handleHelloReset"
        />
</App>
```

This demonstrates how XMLUI components can expose events while maintaining their own internal functionality.