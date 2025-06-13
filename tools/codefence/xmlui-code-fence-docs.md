# XMLUI Code Fence Syntax Documentation

This document describes the various syntax options supported in XMLUI markdown code fences.

## Basic Fence Types

### Standard Code Display: `xmlui`
```xmlui
<Button label="Hello World" />
```
Basic code fence for showing XMLUI code without any special features.

### Playground: `xmlui-pg`
```xmlui-pg
<Button label="Interactive Button" />
```
Creates an interactive playground where the XMLUI code can be executed and displayed inline.

### Application Context: `---app`
```
---app
<App>
  <Button label="Full App Example" />
</App>
```
Used for showing complete application examples with full App context.

### Component Context: `---comp`
```
---comp
<Button label="Component Example" />
```
Used for showing component-level examples.

## Supported Modifiers

### `copy`
Adds a copy button to the code block, allowing users to copy the code to clipboard.

```xmlui copy
<Button label="Copyable Code" />
```

```xmlui-pg copy
<Button label="Copyable Playground" />
```

### `display`
Shows the rendered output alongside or instead of just the code.

```xmlui-pg copy display
<Button label="Both Code and Output" />
```

### `name="Example Name"`
Provides a descriptive name for the example.

```xmlui-pg copy display name="Example: Basic Button"
<Button label="Named Example" />
```

### `height="XXXpx"`
Sets a specific height for the playground container.

```xmlui-pg copy display height="200px"
<VStack>
  <Button label="Button 1" />
  <Button label="Button 2" />
</VStack>
```

### `filename="filename.xmlui"`
Specifies a filename for the code block, useful for multi-file examples.

```xmlui copy filename="Main.xmlui"
<App>
  <Button label="Main App" />
</App>
```

## Line Highlighting: `{line-numbers}`

Highlights specific lines in the code block. Supports various formats:

### Single Line
```xmlui copy {3}
<App>
  <VStack>
    <Button label="This line is highlighted" />
  </VStack>
</App>
```

### Multiple Lines (comma-separated)
```xmlui copy {2, 4, 6}
<App>
  <VStack>
    <Button label="Button 1" />
    <Button label="Button 2" />
    <Button label="Button 3" />
  </VStack>
</App>
```

### Line Ranges
```xmlui copy {2-4}
<App>
  <VStack>
    <Button label="Button 1" />
    <Button label="Button 2" />
  </VStack>
</App>
```

### Mixed Ranges and Individual Lines
```xmlui copy {2-4, 7, 10-12}
<!-- Complex highlighting example -->
```

## Attribute Highlighting: `/attribute/`

Highlights specific attributes, values, or patterns within the code using forward slash delimiters.

### Highlight Specific Attributes
```xmlui copy /variant="outlined"/ /themeColor="primary"/
<Button label="Highlighted Attributes" variant="outlined" themeColor="primary" />
```

### Highlight Attribute Names Only
```xmlui copy /name/ /size/
<Icon name="star" size="large" />
```

### Highlight Specific Values
```xmlui copy /direction="rtl"/
<Button label="Right-to-Left" direction="rtl" />
```

### Highlight IDs or References
```xmlui copy /#red/ /#green/ /#blue/ /id="red"/ /id="green"/ /id="blue"/
<VStack>
  <Bookmark id="red" />
  <Bookmark id="green" />
  <Bookmark id="blue" />
</VStack>
```

### Highlight Method Names or Complex Values
```xmlui copy /onSelect="(emoji) => { selected = emoji }"/
<EmojiSelector onSelect="(emoji) => { selected = emoji }" />
```

```xmlui copy /loggedInUser="{{ name: 'Joe', token: '1234' }}"/
<App loggedInUser="{{ name: 'Joe', token: '1234' }}" />
```

### Multiple Attribute Highlights
You can highlight multiple different attributes in the same code block:

```xmlui copy /orientation="horizontal"/ /showAvatar="true"/ /subtitle="Example"/
<Card orientation="horizontal" showAvatar="true" subtitle="Example" />
```

### Red Border Highlighting: `!/pattern/`
Using `!` before the forward slash delimiters produces a red border instead of the standard highlight:

```xmlui !/{ 6 * 7 }/
<Text value="Life, the universe, and everything: { 6 * 7 }" />
```

## Complete Examples

### Full-Featured Playground
```xmlui-pg copy display name="Example: Button Variants" height="300px" {3-5}
<App>
  <VStack gap="8px">
    <Button label="Solid" variant="solid" />
    <Button label="Outlined" variant="outlined" />
    <Button label="Ghost" variant="ghost" />
  </VStack>
</App>
```

### Multi-File Example with App Context
```
---app copy display filename="Main.xmlui" height="200px"
<App>
  <Component1 />
</App>

---comp copy display filename="Component1.xmlui"
<VStack>
  <Button label="Component Button" />
</VStack>
```

## Modifier Combinations

All modifiers can be combined in various ways:

- `copy + display` = Shows both code and rendered output with copy functionality
- `copy + display + name` = Named example with copy and display
- `copy + display + height` = Sized playground with copy and display
- `copy + {lines}` = Copyable code with line highlighting
- `filename + any combination` = File-specific examples

## Context-Specific Usage

### In Component Documentation
- Use `xmlui-pg` for interactive examples that users can modify
- Use `xmlui copy` for code snippets users will copy into their projects
- Use line highlighting to draw attention to specific properties or patterns

### In Multi-File Examples
- Use `---app` for the main application file
- Use `---comp` for individual component files
- Always include `filename` for clarity in multi-file scenarios

### For Complex Layouts
- Use `height` to ensure adequate space for the rendered output
- Use `name` to provide clear context for what the example demonstrates
- Combine `display` with appropriate sizing for optimal presentation


### Descriptions

Use `---desc` to inject narrative markdown. 