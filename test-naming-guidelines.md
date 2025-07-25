# Test Naming Guidelines

## Concise Test Names
Test names should be descriptive and concise, focusing on what behavior is being tested rather than implementation details.

### Patterns to Follow:
- **Action-focused**: `"handles special characters"` instead of `"component handles special characters"`
- **Specific behavior**: `"autoFocus focuses checkbox on mount"` instead of `"autoFocus focuses input on mount"`
- **Clear validation**: `"validationStatus=error shows error styling"` instead of `"component validationStatus=error shows error styling"`
- **Accurate descriptions**: `"lostFocus event fires on blur"` instead of `"component lostFocus event fires on blur"`

### Avoid:
- Redundant "component" prefixes when context is clear
- Generic terms when specific terms are available
- Misleading descriptions (e.g., "error styling" when test shows "warning styling")
