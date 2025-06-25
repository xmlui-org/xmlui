# Generate Component Reference Documentation

This document describes how to generate and maintain component reference documentation for XMLUI components, including automated documentation extraction from source code and manual documentation creation.

## Overview

XMLUI component reference documentation is generated from multiple sources:
- **Component Metadata** - The XMLUI framework has a particular metadata structure that describes an XMLUI component including its properties, events, exposed methods, and other component traits. Each component must define its metadata.
- **Component Documentation Files** - Markdown files with directive-based content injection. These files can declare additional metadata content in markdown format, such as code samples, tables, additional explanations, etc. While the component metadata is available within the framework and its tools (and also for external tools), the content in component documentation files is just for generating the reference documentation of components.

## Documentation Generation Workflow

1. **Build component metadata** (`npm run prepare-docs-data`) - Export component metadata to a JSON file
2. **Start merging script** (`npm run generate-docs`) - Merge component metadata with component documentation files
3. **Generate individual documentation** - Script processes components one by one to create complete documentation
4. **Output to docs folder** - Place generated documents into `docs/content/components/`
5. **Create overview document** - Generate a components overview document and save it to `docs/content/components/`

> **Note**
> The `npm run generate-docs-with-refresh` command extracts the metadata and runs the generator script in a single command.

## Sample Component Folder Structure

```bash
xmlui/src/components/
├── ...
├── Button/
│   ├── Button.tsx              # Component implementation (includes metadata) 📖 used for docs
│   ├── ButtonNative.tsx        # Underlying React component
│   ├── Button.md               # Component documentation file 📖 used for docs
│   ├── Button.module.scss      # Component styles
│   ├── Button.spec.ts          # Component tests
│   └── Button-style.spec.ts    # Style-specific tests
├── ...
├── Text/
│   ├── Text.tsx                # Component implementation (includes metadata) 📖 used for docs
│   ├── TextNative.tsx          # Underlying React component
│   ├── Text.md                 # Component documentation file 📖 used for docs
│   ├── Text.module.scss        # Component styles
│   └── Text.spec.ts            # Component tests
└── ...
```

The system uses a sophisticated multi-stage process involving npm scripts and Node.js modules to automatically generate comprehensive component documentation.

## Sample Component Metadata

```typescript
export const AvatarMd = createMetadata({
  description:
    "`Avatar` displays a user or entity's profile picture as a circular image, " +
    "with automatic fallback to initials when no image is provided. It's commonly " +
    "used in headers, user lists, comments, and anywhere you need to represent a " +
    "person or organization.",
  props: {
    size: {
      description: `This property defines the display size of the Avatar.`,
      availableValues: sizeMd,
      valueType: "string",
      defaultValue: defaultProps.size,
    },
    name: {
      description:
        `This property sets the name value the Avatar uses to display initials. If neither ` +
        "this property nor \`url\` is defined, an empty avatar is displayed.",
      valueType: "string",
    },
    url: {
      description:
        `This property specifies the URL of the image to display in the Avatar. ` +
        "If neither this property nor \`name\` is defined, an empty avatar is displayed.",
      valueType: "string",
    },
  },
  events: {
    click: d("This event is triggered when the avatar is clicked."),
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    [`borderRadius-Avatar`]: "4px",
    [`boxShadow-Avatar`]: "inset 0 0 0 1px rgba(4,32,69,0.1)",
    [`textColor-Avatar`]: "$textColor-secondary",
    [`fontWeight-Avatar`]: "$fontWeight-bold",
    [`border-Avatar`]: "0px solid $color-surface-400A80",
    [`backgroundColor-Avatar`]: "$color-surface-100",
  },
});
```

This metadata structure includes:

- **`description`** - A comprehensive description of the component's purpose and usage
- **`props`** - Component properties with descriptions, value types, available values, and default values
- **`events`** - Event handlers the component supports (e.g., click events)
- **`themeVars`** - Theme variables extracted from the component's SCSS module
- **`defaultThemeVars`** - Default values for theme variables used for styling customization

The metadata is created using the `createMetadata()` function and exported so it can be collected and processed during documentation generation.

## Component Documentation File Directives

Component documentation files (e.g., `Button.md`) use special directive markers to inject auto-generated content from the component metadata. These directives allow manual documentation to be seamlessly merged with extracted metadata.

**Directive Format:**
```markdown
%-SECTION_NAME-START [optional_parameter]
Content goes here
%-SECTION_NAME-END
```

**Available Directives:**

- **`%-DESC-START` / `%-DESC-END`** - Component description from metadata
- **`%-PROP-START propName` / `%-PROP-END`** - Specific property documentation with details from metadata
- **`%-EVENT-START eventName` / `%-EVENT-END`** - Event documentation from metadata
- **`%-API-START apiName` / `%-API-END`** - API method documentation from metadata
- **`%-STYLE-START` / `%-STYLE-END`** - Styling information and theme variables

**Example Usage:**

Here's the actual content from `Avatar.md` showing how directives are used:

````text
%-DESC-START

**Key features:**
- **Automatic fallback**: Shows initials when no image URL is provided or image fails to load
- **Multiple sizes**: From `xs` (extra small) to `lg` (large) to fit different contexts
- **Clickable**: Supports click events for profile actions, modals, or navigation
- **Accessible**: Automatically generates appropriate alt text from the name

%-DESC-END

%-PROP-START name

```xmlui-pg copy display name="Example: name"
<App>
  <Avatar name="John, Doe" />
</App>
```
%-PROP-END

%-PROP-START size

```xmlui-pg copy display name="Example: size"
<App>
  <HStack>
    <Avatar name="Dorothy Ellen Fuller" />
    <Avatar name="Xavier Schiller" size="xs" />
    <Avatar name="Sebastien Moore" size="sm" />
    <Avatar name="Molly Dough" size="md" />
    <Avatar name="Lynn Gilbert" size="lg" />
  </HStack>
</App>
```

%-PROP-END

%-PROP-START url

```xmlui-pg copy display name="Example: url"
<App>
  <Avatar url="https://i.pravatar.cc/100" size="md" />
</App>
```

%-PROP-END

%-EVENT-START click

```xmlui-pg copy display name="Example: click"
<App>
  <HStack verticalAlignment="center">
    <Avatar name="Molly Dough" size="md" onClick="toast('Avatar clicked')" />
    Click the avatar!
  </HStack>
</App>
```

%-EVENT-END
````

