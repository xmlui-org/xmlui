# Select

A dropdown component for selecting options from a list, built on top of Ark UI's Select component.

## Overview

`Select` provides a powerful dropdown interface for choosing from a list of options, built using `@ark-ui/react`. It offers robust accessibility, keyboard navigation, and extensive customization capabilities.

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
<Select>
  <Option value="1" label="Option 1"/>
  <Option value="2" label="Option 2"/>
  <Option value="3" label="Option 3"/>
</Select>
```

### Multi-Select

```xml
<Select multiSelect="{true}" clearable="{true}">
  <Option value="1" label="Option 1"/>
  <Option value="2" label="Option 2"/>
  <Option value="3" label="Option 3"/>
</Select>
```

### Searchable

```xml
<Select searchable="{true}" placeholder="Search options...">
  <Option value="1" label="Apple"/>
  <Option value="2" label="Banana"/>
  <Option value="3" label="Cherry"/>
</Select>
```

### With Initial Value

```xml
<Select initialValue="{2}">
  <Option value="1" label="Option 1"/>
  <Option value="2" label="Option 2"/>
  <Option value="3" label="Option 3"/>
</Select>
```

### With Grouping

You can group options by any custom property. Just add the property to each `Option` and specify its name in `groupBy`:

```xml
<Select groupBy="type">
  <Option value="apple" label="Apple" type="fruit"/>
  <Option value="banana" label="Banana" type="fruit"/>
  <Option value="carrot" label="Carrot" type="vegetable"/>
  <Option value="lettuce" label="Lettuce" type="vegetable"/>
</Select>
```

You can use any property name for grouping:

```xml
<Select groupBy="category">
  <Option value="react" label="React" category="Frontend"/>
  <Option value="node" label="Node.js" category="Backend"/>
  <Option value="postgres" label="PostgreSQL" category="Database"/>
</Select>
```

Combined with multi-select, searchable, and clearable:

```xml
<Select multiSelect="{true}" searchable="{true}" clearable="{true}" groupBy="type">
  <Option value="apple" label="Apple" type="fruit"/>
  <Option value="banana" label="Banana" type="fruit"/>
  <Option value="carrot" label="Carrot" type="vegetable"/>
  <Option value="lettuce" label="Lettuce" type="vegetable"/>
</Select>
```

### Dynamic Options with Items

```xml
<Select>
  <Items data="{['React', 'Vue', 'Angular']}">
    <Option value="{$itemIndex}" label="{$item}" />
  </Items>
</Select>
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

## Key Implementation Features

- Built on Ark UI's accessible Select component for best-in-class accessibility
- Robust keyboard navigation and screen reader support
- Smart positioning and portal handling
- Future-proof implementation based on modern UI primitives

## Implementation Details

- Built on `@ark-ui/react` Select component
- Uses `createListCollection` for managing options
- Maintains backward compatibility with string/number value types
- Supports the same styling classes as the original Select
- Reuses existing Select styles and theme variables
