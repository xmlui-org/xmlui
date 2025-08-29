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

> [!WARNING]
> I think we don't need this. They don't have to know about the ComponentProvider
> But, we need the HelloWorld.module.scss file

This separation allows XMLUI to understand your component's interface while maintaining clean React code.

## Prerequisites

- Familiarity with React and TypeScript
- Basic understanding of XMLUI markup
- A local clone of [https://github.com/xmlui-org/xmlui](https://github.com/xmlui-org/xmlui)

> [!WARNING]
> We don't need this. You can use the local installed xmlui npm package, it has binaries (it contains the build-lib bin)

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
> This page includes playground examples that use the HelloWorld component. They are available here because this site loads the final extension package that you will build. That means the live playground examples here reflect the final state, not the interim states described as we go along. But in the standalone app that you'll create you will see the progression exactly as described here.

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

- Essential props (id, message)
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

This SCSS module defines the basic visual styling for our HelloWorld component:
- `.container` - Main wrapper with background, padding, and layout
- `.message` - Styling for the greeting text
- `.button` - Interactive button with hover effects
- `.counter` - Display for the click count

At this stage, we use hardcoded colors. In Step 9, we'll replace these theme variables.


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

**What we're creating**

This file bridges the gap between XMLUI markup and React components.

- Metadata (`HelloWorldMd`) - Documents the component's props, behavior, and usage
- Renderer (`helloWorldComponentRenderer`) - Converts XMLUI markup to React component calls

**The renderer pattern**

The renderer function receives XMLUI context (node, extractValue, etc.) and returns a React component.

It:

- Extracts prop values from XMLUI markup using `extractValue.asOptionalString()`
- Passes them to the native React component
- Handles optional props gracefully (undefined becomes default values)


This pattern enables XMLUI to:

- Validate markup against metadata
- Provide IntelliSense and documentation
- Handle prop type conversion automatically
- Support XMLUI-specific features like theming (step 9) and event handling (Step 10)

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

> [!WARNING]
> we could mention that the XMLUIExtensions namespace is optional


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

> [!WARNING]
> we should include all classes in @layer components{...}

**What changed**

Instead of hardcoded colors like `#f5f5f5` and `#333`, we now use:
- `$backgroundColor` - Uses XMLUI's surface color tokens
- `$textColor` - Uses XMLUI's content color tokens

The `createThemeVar()` function registers these variables with XMLUI, making them available for customization via the `<Theme>` component and automatic light/dark mode adaptation.

The `:export { themeVars: t.json-stringify($themeVars); }` exports the theme variables so XMLUI can read them.

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

Copy the new `xmlui-hello-world.js` into your standalone app's `xmlui` folder, and update its `Main.xmlui`.

```xmlui-pg
---app display copy
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


## MISSING PIECE
> [!WARNING]
> we provide a className in the renderer. This classname contains all the styles that comes from inline styling. The component developer should pass it to the right component inside.

## Step 10: Add event handling

The HelloWorld component has a click handler that increments a counter, and a reset that sets the count to zero. Let's add event definitions to signal parent components when these events happen.

> [!WARNING]
> basic mouse event handling is automatically assigned to components, so you don't need explicit lookupEventHandler for onClick (but you do for onReset)

**Add event definitions**

Update the component metadata in `src/HelloWorld.tsx`:

```xmlui copy
cat > src/HelloWorld.tsx << 'EOF'
import styles from "./HelloWorld.module.scss";
import { createComponentRenderer, parseScssVar, createMetadata } from "xmlui";
import { HelloWorld, defaultProps } from "./HelloWorldNative";

const HelloWorldMd = createMetadata({
  description:  "`HelloWorld` is a demonstration component.",
  status: "experimental",
  props: {
    message: {
      description: "The message to display.",
      isRequired: false,
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
  "HelloWorld",
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

**New props**
- `onClick?: (event: React.MouseEvent) => void` - Called when the click button is pressed
- `onReset?: (event: React.MouseEvent) => void` - Called when the reset button is pressed

**Event handler changes:**
- `handleClick` now calls `onClick?.(event)` after updating internal state
- `handleReset` now calls `onReset?.(event)` after resetting the counter
- Both pass the DOM event object (not custom data) to match XMLUI's event system

**Update the native component**

Update `src/HelloWorldNative.tsx` to accept and call the event handler.

```xmlui copy
cat > src/HelloWorldNative.tsx << 'EOF'
import React, { useState } from "react";
import styles from "./HelloWorld.module.scss";

type Props = {
  id?: string;
  message?: string;
  className?: string;
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
      className,
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
      <div className={`${styles.container} ${className || ''}`} id={id}>
        <h2 className={styles.message}>{message}</h2>
        <button
           className={styles.button}
              onClick={handleClick}
            >
              Click me!
            </button>
            <div className={styles.counter}>
              Clicks: <span className={styles.count}>{clickCount}</span>
            </div>

            {clickCount > 0 && (
              <button
                className={styles.button}
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

**Metadata changes:**
- Added `events` section defining `onClick` and `onReset` event handlers
- Each event includes description and type information for documentation

**Renderer changes:**
- Added `lookupEventHandler` to the renderer context
- `lookupEventHandler("onClick")` and `lookupEventHandler("onReset")` convert XMLUI event bindings to function references
- These function references are passed to the native React component

**The event flow:**
1. XMLUI markup: `<HelloWorld onClick="handleHelloClick" />`
2. Renderer: `lookupEventHandler("onClick")` finds the `handleHelloClick` function
3. Native component: Receives the function as `onClick` prop
4. User interaction: Triggers the function with the DOM event

**Rebuild the extension**

```xmlui copy
npm run build:extension
```

**Define the handlers**

This site's `index.html` defines these handler functions. For your standalone app you'll need to add them into its `index.html`.

```xmlui copy
<script>
window.handleHelloClick = function(event) {
  console.log('Hello World clicked!', event);
  alert('Button clicked!');
};

window.handleHelloReset = function(event) {
  console.log('Hello World reset!', event);
  alert('Counter was reset!');
};
</script>
```

> [!WARNING]
> I think we should just simply inline the event handlers, not put them to the index.html

**Test event handling**

Copy the new `xmlui-hello-world.js` into your standalone app's `xmlui` folder, and update its `Main.xmlui`.

Now you can use the component with event handling.

```xmlui-pg
---app display copy
<App xmlns:Extensions="component-ns:XMLUIExtensions">
    <Extensions:HelloWorld
          onClick="handleHelloClick"
          onReset="handleHelloReset"
        />
</App>
```

## Step 11: Add component APIs (external methods)

Update `src/HelloWorldNative.tsx`.


```xmlui copy
cat > src/HelloWorldNative.tsx << 'EOF'
import React, { useState, useEffect } from "react";
import styles from "./HelloWorld.module.scss";
import type { RegisterComponentApiFn } from "xmlui";

type Props = {
  id?: string;
  message?: string;
  className?: string;
  onClick?: (event: React.MouseEvent) => void;
  onReset?: (event: React.MouseEvent) => void;
  registerComponentApi?: RegisterComponentApiFn;
};

export const defaultProps = {
  message: "Hello, World!",
};

export const HelloWorld = React.forwardRef<HTMLDivElement, Props>(
  function HelloWorld(
    {
      id,
      message = defaultProps.message,
      className,
      onClick,
      onReset,
      registerComponentApi
    },
    ref
  ) {
    const [clickCount, setClickCount] = useState(0);

    // Create setValue method for external API access
    const setValue = (newCount: number) => {
      setClickCount(newCount);
    };

    // Register component API
    useEffect(() => {
      registerComponentApi?.({
        setValue,
        value: clickCount,
      });
    }, [registerComponentApi, setValue, clickCount]);

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
      <div className={`${styles.container} ${className || ''}`} id={id} ref={ref}>
        <h2 className={styles.message}>{message}</h2>
        <button
           className={styles.button}
              onClick={handleClick}
            >
              Click me!
            </button>
            <div className={styles.counter}>
              Clicks: <span className={styles.count}>{clickCount}</span>
            </div>

            {clickCount > 0 && (
              <button
                className={styles.button}
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

**New props**
- `registerComponentApi?: RegisterComponentApiFn` - Function to register component APIs with XMLUI

**New imports:**
- `useEffect` from React - For API registration and state synchronization
- `RegisterComponentApiFn` type from "xmlui" - Type for the API registration function

**API registration:**
- `setValue` method - Allows external code to set the click count
- `useEffect` hook registers the API with XMLUI, exposing both `setValue` and `value`
- API updates whenever `clickCount` changes, ensuring `value` is always current

This enables XMLUI markup to directly call `demo.setValue(5)` and read `demo.value`.

Update `src/HelloWorldNative.tsx`.

```xmlui copy
cat > src/HelloWorld.tsx << 'EOF'
import styles from "./HelloWorld.module.scss";
import { createComponentRenderer, parseScssVar, createMetadata } from "xmlui";
import { HelloWorld, defaultProps } from "./HelloWorldNative";

const HelloWorldMd = createMetadata({
  description:
    "`HelloWorld` is a demonstration component that shows basic XMLUI patterns.",
  status: "experimental",
  props: {
    message: {
      description: "The greeting message to display.",
      isRequired: false,
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
  apis: {
    value: {
      description: "The current click count value.",
      type: "number",
    },
    setValue: {
      description: "Set the click count to a specific value.",
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
  "HelloWorld",
  HelloWorldMd,

  ({ node, extractValue, lookupEventHandler, className, registerComponentApi }) => {
    return (
      <HelloWorld
        id={extractValue.asOptionalString(node.props?.id)}
        message={extractValue.asOptionalString(node.props?.message)}
        onClick={lookupEventHandler("onClick")}
        onReset={lookupEventHandler("onReset")}
        className={className}
        registerComponentApi={registerComponentApi}
      />
    );
  },
);
EOF
```

**Metadata**
- Added `apis` section defining `value` (number) and `setValue` (function) APIs

**Renderer Changes**
- Added `registerComponentApi` to the renderer context
- Passes `registerComponentApi` to the native component for API registration

**The API flow:**
1. XMLUI markup: `<HelloWorld id="demo" />` creates component with ID
2. Renderer: Registers component APIs via `registerComponentApi`
3. External access: `demo.setValue(5)` calls the component's setValue method
4. State reading: `demo.value` returns the current click count

```xmlui copy
npm run build:extension
```

Copy the new `xmlui-hello-world.js` into your standalone app's `xmlui` folder, and update its `Main.xmlui` to see this final version.

```xmlui-pg
---app display copy
<App xmlns:Extensions="component-ns:XMLUIExtensions">

    <Extensions:HelloWorld id="demo" message="API Demo" />

    <CHStack>
      <Button onClick="{ console.log('demo.value', demo.value) }">Get Count</Button>
      <Button onClick="{ demo.setValue(5) }">Set to 5</Button>
      <Button onClick="{ demo.setValue(0) }">Reset</Button>
    </CHStack>

</App>
  ```


## ALTERNATIVE
- you can use extensions without building them
    - -> IN PROGRESS have an extensions folder in the src, if it's not a standalone app, it will work
    - right now, if you are using as a react component, instantiate StandaloneExtensionManager and register it there, OR
    - if you are using create-xmlui-app, you can just simply use the second parameter of startApp in index
- we could have template project for extensions (if they want to publish), similar to create-xmlui-app


I think the simplest way would be right now to demonstrate how to do local extension, and then there could be an extra step, if you want to publish it, or have a standalone build for distribution

steps (RIGHT NOW):
1. npx create-xmlui-app
1. create the extension
1. use import them to index.ts, or separate extensions ts, and use it as the second parameter

steps (IDEAL?):
1. npx create-xmlui-app
1. create the extension in the extensions folder
