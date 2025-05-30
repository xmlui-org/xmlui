s # XMLUI Formatter

The XMLUI extension includes a custom formatter that helps you keep your XMLUI files properly indented and formatted.

## Usage

To format an XMLUI file:
- Open any `.xmlui` file
- Use the Format Document command (Shift+Alt+F on Windows/Linux, Shift+Option+F on macOS)
- Alternatively, right-click in the document and select "Format Document"

## Configuration

You can customize the formatter behavior through VS Code settings:

- `xmlui.format.enabled`: Enable/disable the XMLUI formatter (default: `true`)
- `xmlui.format.preserveAttributeLineBreaks`: Preserve line breaks in attributes (default: `true`)
- `xmlui.format.preserveScriptContent`: Preserve formatting in script blocks (default: `true`)
- `xmlui.format.maxLineLength`: Maximum line length before wrapping attributes (default: `120`)
- `xmlui.format.indentBindingExpressions`: Format and indent binding expressions (default: `false`)
- `xmlui.format.sortAttributes`: Sort element attributes alphabetically (default: `false`)

## Features

- XML-based formatting with special handling for XMLUI syntax
- Preserves formatting in script blocks
- Handles XMLUI binding expressions like `{variable}` and template literals like `` {`Hello, ${name}!`} ``
- Properly formats App variable declarations 
- Special handling for comments and other XMLUI-specific elements
- Attribute wrapping and organization
- Respects VS Code editor settings for tabs vs spaces and indentation size

## Known Issues

- Complex nested expressions might not format perfectly
- Some edge cases with very complex layouts might require manual adjustment

Please report any issues or suggestions for improvement in the GitHub repository.
