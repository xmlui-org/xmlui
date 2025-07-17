# XMLUI Component Development Guide

## Component Architecture Overview

XMLUI components follow a specific architectural pattern that separates concerns between React implementation and XMLUI framework integration. Understanding this pattern is crucial for creating components that integrate properly with the XMLUI ecosystem.

## The Two-File Pattern

Every XMLUI component should be split into two files:

### 1. Native Component (`ComponentNameNative.tsx`)

This file contains the actual React component implementation:

```typescript
// ToneSwitchNative.tsx
import React from 'react';

export type ToneSwitchProps = {
  /**
   * Icon to display for light mode
   * @default "sun"
   */
  iconLight?: string;

  /**
   * Icon to display for dark mode
   * @default "moon"
   */
  iconDark?: string;
};

export function ToneSwitch({
  iconLight = "sun",
  iconDark = "moon"
}: ToneSwitchProps) {
  // React component implementation
  return <div>...</div>;
}
```

**Key characteristics:**
- Pure React component
- Exports TypeScript interface for props
- Uses standard React patterns and hooks
- Contains all component logic and rendering
- Can be used standalone outside XMLUI

### 2. XMLUI Renderer (`ComponentName.tsx`)

This file contains the XMLUI integration layer:

```typescript
// ToneSwitch.tsx
import { createComponentRenderer } from "../../components-core/renderers";
import { createMetadata } from "../metadata-helpers";
import { ToneSwitch, type ToneSwitchProps } from "./ToneSwitchNative";

const COMP = "ToneSwitch";

export const ToneSwitchMd = createMetadata({
  status: "stable",
  description: "`ToneSwitch` enables users to switch themes.",
  props: {
    iconLight: {
      type: "string",
      description: "Icon to display for light mode",
      defaultValue: "sun",
    },
    iconDark: {
      type: "string",
      description: "Icon to display for dark mode",
      defaultValue: "moon",
    },
  },
  // ... theme variables, etc.
});

export const toneSwitchComponentRenderer = createComponentRenderer(
  COMP,
  ToneSwitchMd,
  ({ node, extractValue }) => {
    return <ToneSwitch
      iconLight={extractValue(node.props.iconLight)}
      iconDark={extractValue(node.props.iconDark)}
    />;
  }
);
```

**Key characteristics:**
- Imports the native component
- Defines component metadata for documentation
- Creates the component renderer that bridges XMLUI and React
- Handles prop extraction from XMLUI markup

## Component Registration

### 1. Add to Component Metadata Registry

```typescript
// collectedComponentMetadata.ts
import { ToneSwitchMd } from "./ToneSwitch/ToneSwitch";

export const collectedComponentMetadata = {
  // ... other components
  ToneSwitch: ToneSwitchMd,
};
```

### 2. Register Component Renderer

```typescript
// ComponentProvider.tsx
import { toneSwitchComponentRenderer } from "./ToneSwitch/ToneSwitch";

// In ComponentRegistry constructor:
if (process.env.VITE_USED_COMPONENTS_ToneSwitch !== "false") {
  this.registerCoreComponent(toneSwitchComponentRenderer);
}
```

## Component Documentation Pattern

### Source Documentation (`ComponentName.md`)

Each component should have a corresponding `.md` file in its source directory (`src/components/ComponentName/ComponentName.md`) that contains template-based documentation. This source documentation uses special template markers that get processed during documentation generation.

#### Template Markers

XMLUI uses these optional template patterns for documentation generation:

- **`%-DESC-START` / `%-DESC-END`**: Main component description and examples
- **`%-PROP-START propName` / `%-PROP-END`**: Detailed property documentation
- **`%-EVENT-START eventName` / `%-EVENT-END`**: Event documentation
- **`%-API-START methodName` / `%-API-END`**: API method documentation

Use these to provide additional detail beyond what's automatically generated from the metadata.

The ToneSwitch example shows the minimal approach - just %-DESC-START/END for the main example, letting the props documentation be auto-generated from the metadata. You'd add %-PROP-START iconLight only if you wanted to elaborate on that specific prop with examples or additional context beyond "Icon to display for light mode".

#### Example Source Documentation

```markdown
%-DESC-START

xmlui-pg {4} copy display name="Example: using ToneSwitch"
<App>
  <AppHeader>
    <SpaceFiller />
    <ToneSwitch />
  </AppHeader>
  <Card
    title="Tone Switch"
    subtitle="Toggle the switch to change the tone."
  />
</App>

%-DESC-END

### Generated Documentation

When you run `npm run generate-all-docs` from `xmlui/xmlui`, the source documentation gets processed and generates the final documentation files in `docs/content/components/`.

The generated documentation includes:
- Component description from `%-DESC-START/END` blocks
- Properties section with details from metadata and `%-PROP-START/END` blocks
- Events section (if any events are defined)
- Exposed methods section (if any API methods are defined)
- Styling section with theme variables table

#### Generated Documentation Example

```markdown
# ToneSwitch [#toneswitch]

ToneSwitch enables the user to switch between light and dark modes using a switch control.

xmlui-pg {4} copy display name="Example: using ToneSwitch"
<App>
  <AppHeader>
    <SpaceFiller />
    <ToneSwitch />
  </AppHeader>
  <Card
    title="Tone Switch"
    subtitle="Toggle the switch to change the tone."
  />
</App>

## Properties [#properties]

### iconDark (default: "moon") [#icondark-default-moon]

Icon to display for dark mode

### iconLight (default: "sun") [#iconlight-default-sun]

Icon to display for light mode

## Events [#events]

This component does not have any events.

## Exposed Methods [#exposed-methods]

This component does not expose any methods.

## Styling [#styling]

### Theme Variables [#theme-variables]

| Variable | Default Value (Light) | Default Value (Dark) |
| --- | --- | --- |
| [backgroundColor](../styles-and-themes/common-units/#color)-ToneSwitch-dark | $color-primary-500 | $color-primary-500 |
| [backgroundColor](../styles-and-themes/common-units/#color)-ToneSwitch-light | $color-surface-200 | $color-surface-700 |
```

**Important distinction**: The source `.md` files in `src/components/` are templates that use special markers, while the generated files in `docs/content/components/` are the final documentation that gets published. Always edit the source files, not the generated ones.

## Component Metadata Best Practices

### Props Definition

```typescript
props: {
  propName: {
    type: "string" | "boolean" | "number",
    description: "Clear description of what this prop does",
    defaultValue: "default value if any",
    required?: true, // if prop is required
  },
}
```

### Theme Variables

```typescript
// Include if component has custom styling
themeVars: parseScssVar(styles.themeVars),
limitThemeVarsToComponent: true,
defaultThemeVars: {
  [`backgroundColor-${COMP}`]: "$color-surface-200",
  [`color-${COMP}`]: "$color-text-primary",

  // Dark mode variants
  dark: {
    [`backgroundColor-${COMP}`]: "$color-surface-700",
  }
},
```

## Component Renderer Patterns

### Basic Prop Extraction

```typescript
export const componentRenderer = createComponentRenderer(
  COMP,
  ComponentMd,
  ({ node, extractValue }) => {
    return <Component
      title={extractValue(node.props.title)}
      enabled={extractValue.asOptionalBoolean(node.props.enabled)}
      count={extractValue.asOptionalNumber(node.props.count)}
    />;
  }
);
```

### Common Extract Value Methods

- `extractValue(prop)` - Extract string value
- `extractValue.asOptionalString(prop)` - Extract optional string
- `extractValue.asOptionalBoolean(prop)` - Extract optional boolean
- `extractValue.asOptionalNumber(prop)` - Extract optional number

## Extending Existing Components

### Using inputRenderer Pattern

When extending components like Toggle, use the `inputRenderer` pattern:

```typescript
export function CustomSwitch({ icon }: CustomSwitchProps) {
  return (
    <Toggle
      variant="switch"
      inputRenderer={(contextVars) => (
        <div className="custom-switch">
          <Icon name={contextVars.$checked ? "on" : "off"} />
        </div>
      )}
    />
  );
}
```

**Context Variables Available:**
- `$checked` - Current boolean state
- `$setChecked` - Function to update state

## Theme Integration

### Using Theme Context

```typescript
import { useThemes, useTheme } from "../../components-core/theming/ThemeContext";

function ThemeAwareComponent() {
  // For reading/writing theme state
  const { activeThemeTone, setActiveThemeTone } = useThemes();

  // For accessing theme properties
  const theme = useTheme();

  return <div data-theme={activeThemeTone}>...</div>;
}
```

## File Structure

```
src/components/MyComponent/
├── MyComponent.tsx           # XMLUI renderer & metadata
├── MyComponentNative.tsx     # React implementation
├── MyComponent.module.scss   # Component styles
├── MyComponent.md           # Component documentation template
```

## Documentation Generation Workflow

1. **Create source documentation**: Write your component documentation in `src/components/ComponentName/ComponentName.md` using the template markers
2. **Generate documentation**: Run `npm run generate-all-docs` from `xmlui/xmlui`
3. **Review generated docs**: Check the generated files in `docs/content/components/` to ensure they look correct
4. **Iterate as needed**: Update source documentation and regenerate as needed

The documentation generation process:
- Extracts component metadata from your component renderer
- Processes template markers in source `.md` files
- Combines metadata with template content
- Generates final documentation with proper formatting, property tables, and theme variable documentation

## Common Pitfalls to Avoid

### 1. Don't Mix Concerns
- Keep React logic in Native component
- Keep XMLUI integration in renderer component
- Don't put XMLUI-specific code in Native component

### 2. Always Export Props Type
```typescript
// Good
export type MyComponentProps = { ... };
export function MyComponent(props: MyComponentProps) { ... }

// Bad
export function MyComponent({ title }: { title: string }) { ... }
```

### 3. Handle Prop Extraction Properly
```typescript
// Good - handles undefined props
iconLight={extractValue(node.props.iconLight)}

// Bad - assumes props exist
iconLight={node.props.iconLight}
```

### 4. Include Proper Default Values
```typescript
// Good - consistent defaults
export function Component({
  title = "Default Title"
}: ComponentProps) { ... }

// In metadata:
defaultValue: "Default Title"
```

### 5. Don't Edit Generated Documentation
```typescript
// Good - edit source template
// src/components/MyComponent/MyComponent.md

// Bad - editing generated files (gets overwritten)
// docs/content/components/MyComponent.md
```

## Testing Your Component

### 1. Test Native Component Standalone
```typescript
// Can be tested as regular React component
render(<ToneSwitch iconLight="custom" iconDark="custom" />);
```

### 2. Test XMLUI Integration
```xmlui
<ToneSwitch iconLight="brightness" iconDark="nightMode" />
```

### 3. Verify Documentation Generation
- Check that props appear in generated docs
- Verify default values are correct
- Ensure descriptions are helpful
- Test example code snippets

## Documentation Guidelines

### Component Description
- Start with backticks around component name
- Be concise but descriptive
- Focus on what the component does, not how

### Prop Descriptions
- Use clear, actionable language
- Mention default behavior
- Include examples when helpful
- Avoid implementation details

### Examples
- Show basic usage first
- Include common customization scenarios
- Use realistic prop values
- Use `xmlui-pg` blocks for interactive examples

### Template Marker Usage
- Use `%-DESC-START/END` for main description and primary examples
- Use `%-PROP-START propName/END` for detailed property documentation
- Use `%-EVENT-START eventName/END` for event documentation
- Use `%-API-START methodName/END` for API method documentation

## Summary Checklist

Before submitting a new XMLUI component:

- [ ] Split into Native and Renderer files
- [ ] Proper TypeScript interfaces exported
- [ ] Component registered in ComponentProvider
- [ ] Metadata added to collectedComponentMetadata
- [ ] Props properly documented with defaults
- [ ] Theme variables defined if needed
- [ ] Source documentation created with template markers
- [ ] Documentation generated and reviewed
- [ ] Examples include usage scenarios
- [ ] Component follows established patterns
- [ ] No XMLUI-specific code in Native component
- [ ] Proper prop extraction in renderer
- [ ] Generated documentation is accurate and helpful