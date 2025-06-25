# Generate Component Reference Documentation

This document describes how to generate and maintain component reference documentation for XMLUI components, including automated documentation extraction from source code and manual documentation creation.

## Overview

XMLUI component reference documentation is generated from multiple sources:
- **Component Metadata** - TypeScript interfaces, JSDoc comments, and component definitions
- **Component Documentation Files** - Markdown files with directive-based content injection

The system uses a sophisticated multi-stage process involving npm scripts and Node.js modules to automatically generate comprehensive component documentation.

## Component Documentation Sources

### Core Framework Components

Component metadata is collected from:
```bash
xmlui/src/components/collectedComponentMetadata.ts
```

This file imports and aggregates metadata from individual component files:
```typescript
// Example component metadata structure
export const collectedComponentMetadata = {
  Button: ButtonMd,
  Text: TextMd,
  Stack: StackMd,
  // ... all other components
};
```

### Extension Package Components

Extension packages define their metadata in:
```bash
packages/*/meta/componentsMetadata.ts
```

Example structure:
```typescript
export const componentMetadata = {
  name: "AnimationPackage",
  description: "Animation components with React Spring integration",
  state: "experimental", // or "stable", "deprecated", "internal"
  metadata: {
    FadeIn: FadeInMd,
    SlideOut: SlideOutMd,
    // ... extension components
  },
};
```

## Documentation Generation Process

### NPM Scripts Overview

The documentation generation involves several coordinated npm scripts:

```bash
# 1. Build metadata from TypeScript definitions
npm run prepare-docs-data
# → npm run build:xmlui-metadata (Vite build --mode metadata)

# 2. Generate component documentation
npm run generate-docs
# → node scripts/generate-docs/get-docs.mjs && npm run generate-docs-summaries

# 3. Complete refresh cycle
npm run generate-docs-with-refresh
# → npm run prepare-docs-data && npm run generate-docs

# 4. Full documentation build including extensions
npm run generate-all-docs
# → npm run build:xmlui-metadata && npm run build:ext-meta && npm run generate-docs
```

### Metadata Build Process

**Step 1: TypeScript Metadata Extraction**
```bash
npm run build:xmlui-metadata
```

This command uses Vite with `--mode metadata` to:
- Compile `src/components/collectedComponentMetadata.ts`
- Extract TypeScript interface definitions
- Process JSDoc comments and annotations
- Generate `dist/metadata/xmlui-metadata.mjs`

**Step 2: Extension Metadata Build**
```bash
npm run build:ext-meta
```

Processes extension packages by:
- Scanning `packages/*/meta/componentsMetadata.ts`
- Building metadata for each extension package
- Creating unified metadata structure

### Documentation Generation Pipeline

**Main Entry Point: `get-docs.mjs`**

The script performs these operations:
1. **Load metadata** from `dist/metadata/xmlui-metadata.mjs`
2. **Filter components** by properties (e.g., exclude HTML tags)
3. **Process each component** through `DocsGenerator` class
4. **Generate summary files** for component collections

**Core Classes:**

**`DocsGenerator` Class:**
- Orchestrates the documentation generation process
- Manages metadata expansion and filtering
- Excludes components by status (e.g., "in progress", "deprecated")

**`MetadataProcessor` Class:**
- Processes individual component documentation
- Handles directive-based content injection
- Manages file I/O and markdown generation

### Directive-Based Documentation System

The system uses special directive markers in markdown files to inject generated content:

**Directive Format:**
```markdown
%-SECTION_NAME-START [optional_parameter]
Content goes here
%-SECTION_NAME-END
```

**Available Directives:**
- `%-IMPORT-START` / `%-IMPORT-END` - Import statements
- `%-DESC-START` / `%-DESC-END` - Component description
- `%-PROP-START propName` / `%-PROP-END` - Specific property documentation
- `%-EVENT-START eventName` / `%-EVENT-END` - Event documentation
- `%-API-START apiName` / `%-API-END` - API method documentation
- `%-STYLE-START` / `%-STYLE-END` - Styling information
- `%-CONTEXT_VAR-START` / `%-CONTEXT_VAR-END` - Context variables

**Component Documentation Structure:**

Generated markdown includes these sections:
1. **Imports** - Import statements with transformed paths
2. **Component Title** - With anchor ID
3. **Status Disclaimers** - For experimental/deprecated components
4. **Parent/Sibling Links** - Component hierarchy navigation
5. **Description** - From metadata or markdown files
6. **Context Variables** - Available during execution
7. **Children Template** - If component supports template children
8. **Properties** - Auto-generated from TypeScript interfaces
9. **Events** - Component event handlers
10. **APIs** - Exposed component methods
11. **Styling** - Theme variables and style information

### File Structure and Output

**Source Documentation Files:**
```bash
docs/content/components/
├── Button/
│   ├── Button.md              # Main documentation with directives
│   └── doc-resources/         # Assets (images, examples)
└── Text/
    ├── Text.md
    └── doc-resources/
```

**Generated Output:**
```bash
docs/pages/components/
├── Button.md                  # Complete generated documentation
├── Text.md
└── _overview.md              # Component summary/index
```

### Configuration Files

**Component Configuration:**
```bash
scripts/generate-docs/components-config.json
```
```json
{
  "excludeComponentStatuses": ["in progress", "deprecated"],
  "cleanFolder": true
}
```

**Folder Paths:**
```bash
scripts/generate-docs/folders.mjs
```
Defines all paths used in the generation process.

### Advanced Features

**Import Path Transformation:**
- Automatically processes import statements in documentation
- Transforms relative paths for generated files
- Copies referenced assets to appropriate locations

**Theme Variable Documentation:**
- Extracts CSS custom properties from component styles
- Auto-generates theme variable tables
- Links to styling documentation

**Component Hierarchy:**
- Processes `specializedFrom` relationships
- Generates parent/child component links
- Creates component family navigation

**Status-Based Filtering:**
- Excludes components by development status
- Supports: "stable", "experimental", "deprecated", "in progress", "internal"

### Example Component Metadata

```typescript
export const ButtonMd = createMetadata({
  description: "A versatile button component for user interactions",
  status: "stable",
  props: {
    variant: {
      description: "Visual style variant",
      valueType: "string",
      availableValues: ["default", "primary", "secondary", "danger"],
      defaultValue: "default",
    },
    disabled: {
      description: "Whether button is disabled",
      valueType: "boolean", 
      defaultValue: false,
    },
    onClick: {
      description: "Click event handler",
      valueType: "function",
    },
  },
  events: {
    click: {
      description: "Fired when button is clicked",
    },
  },
  apis: {
    focus: {
      description: "Programmatically focus the button",
    },
  },
});
```

This comprehensive system ensures that component documentation stays synchronized with the codebase while allowing for rich, manually-authored content through the directive system.

