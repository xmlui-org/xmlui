# Select2

A dropdown component for selecting options from a list, built on top of Ark UI's Select component.

## Overview

`Select2` is a reimplementation of the original `Select` component using `@ark-ui/react`. It maintains 100% API compatibility with the original `Select` component while leveraging Ark UI's robust and accessible Select implementation.

## Key Features

- **Full API Compatibility**: Accepts the same props and provides the same functionality as the original Select
- **Single & Multi-Select**: Support for both single selection and multiple selection modes
- **Searchable**: Built-in search functionality to filter options
- **Clearable**: Optional clear button to reset selections
- **Custom Templates**: Support for custom value and option rendering
- **Form Integration**: Works seamlessly with XMLUI forms
- **Accessibility**: Built on Ark UI's accessible Select component

## Usage

### Basic Example

```xml
<Select2>
  <Option value="1" label="Option 1"/>
  <Option value="2" label="Option 2"/>
  <Option value="3" label="Option 3"/>
</Select2>
```

### Multi-Select

```xml
<Select2 multiSelect="{true}" clearable="{true}">
  <Option value="1" label="Option 1"/>
  <Option value="2" label="Option 2"/>
  <Option value="3" label="Option 3"/>
</Select2>
```

### Searchable

```xml
<Select2 searchable="{true}" placeholder="Search options...">
  <Option value="1" label="Apple"/>
  <Option value="2" label="Banana"/>
  <Option value="3" label="Cherry"/>
</Select2>
```

### With Initial Value

```xml
<Select2 initialValue="{2}">
  <Option value="1" label="Option 1"/>
  <Option value="2" label="Option 2"/>
  <Option value="3" label="Option 3"/>
</Select2>
```

### With Grouping

You can group options by any custom property. Just add the property to each `Option` and specify its name in `groupBy`:

```xml
<Select2 groupBy="type">
  <Option value="apple" label="Apple" type="fruit"/>
  <Option value="banana" label="Banana" type="fruit"/>
  <Option value="carrot" label="Carrot" type="vegetable"/>
  <Option value="lettuce" label="Lettuce" type="vegetable"/>
</Select2>
```

You can use any property name for grouping:

```xml
<Select2 groupBy="category">
  <Option value="react" label="React" category="Frontend"/>
  <Option value="node" label="Node.js" category="Backend"/>
  <Option value="postgres" label="PostgreSQL" category="Database"/>
</Select2>
```

Combined with multi-select, searchable, and clearable:

```xml
<Select2 multiSelect="{true}" searchable="{true}" clearable="{true}" groupBy="type">
  <Option value="apple" label="Apple" type="fruit"/>
  <Option value="banana" label="Banana" type="fruit"/>
  <Option value="carrot" label="Carrot" type="vegetable"/>
  <Option value="lettuce" label="Lettuce" type="vegetable"/>
</Select2>
```

### Dynamic Options with Items

```xml
<Select2>
  <Items data="{['React', 'Vue', 'Angular']}">
    <Option value="{$itemIndex}" label="{$item}" />
  </Items>
</Select2>
```

## Props

All props from the original `Select` component are supported:

### Basic Props
- `id`: Unique identifier
- `initialValue`: Initial selected value(s)
- `value`: Controlled value
- `enabled`: Enable/disable the select (default: true)
- `placeholder`: Placeholder text
- `autoFocus`: Auto-focus on mount
- `readOnly`: Make the select read-only
- `required`: Mark as required for forms

### Styling Props
- `style`: Custom CSS styles
- `className`: Custom CSS class names
- `dropdownHeight`: Height of the dropdown menu
- `validationStatus`: Validation state ("none", "valid", "invalid", "warning")

### Feature Props
- `searchable`: Enable search functionality (default: false)
- `multiSelect`: Enable multiple selection (default: false)
- `clearable`: Show clear button (default: false)
- `groupBy`: Group options by any custom property name (e.g., "type", "category"). Add the property to each `Option` and specify its name here.

### Event Handlers
- `onDidChange`: Called when value changes
- `onFocus`: Called when select gains focus
- `onBlur`: Called when select loses focus

### Advanced Props
- `valueRenderer`: Custom renderer for selected values (multi-select)
- `optionRenderer`: Custom renderer for options in dropdown
- `emptyListTemplate`: Custom template for empty list state
- `inProgress`: Show loading state
- `inProgressNotificationMessage`: Loading message

## API Methods

- `focus()`: Programmatically focus the select
- `setValue(value)`: Set the value programmatically
- `reset()`: Reset to initial value
- `value`: Get current value (read-only property)

## Differences from Select

While `Select2` maintains full API compatibility, it uses Ark UI's Select component internally instead of Radix UI's Popover + custom implementation. This provides:

- Better accessibility out of the box
- More robust keyboard navigation
- Better positioning and portal handling
- Future-proof implementation based on Ark UI

## Migration from Select

`Select2` is a drop-in replacement for `Select`. Simply replace:

```xml
<Select ...props>
  ...children
</Select>
```

with:

```xml
<Select2 ...props>
  ...children
</Select2>
```

All existing props, events, and API methods will work identically.

## Implementation Details

- Built on `@ark-ui/react` Select component
- Uses `createListCollection` for managing options
- Maintains backward compatibility with string/number value types
- Supports the same styling classes as the original Select
- Reuses existing Select styles and theme variables
