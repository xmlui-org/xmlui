# Components with Options

This document explains XMLUI's architecture for components that use `Option` to define selectable choices, covering the provider pattern for context-aware rendering and implementation details of Select, AutoComplete, RadioGroup, and Pagination components.

## Option Component Overview

**Option** is a non-visual data structure describing selectable choices. It provides a consistent interface for value and display representation across multiple component types.

```xml
<Select>
  <Option value="1" label="First Choice" />
  <Option value="2" label="Second Choice" />
  <Option value="3" label="Third Choice" enabled="false" />
</Select>
```

**Key Features:** Non-visual data structure, flexible display (labels or rich content), context-aware rendering via provider pattern, keyword-based search, enabled/disabled state tracking.

## Option Type and Implementation

### Type Definition

```typescript
export type Option = {
  label: string;              // Display text
  value: string;              // Underlying value
  enabled?: boolean;          // Selectable state (default: true)
  keywords?: string[];        // Search terms
  children?: ReactNode;       // Rich content
  optionRenderer?: (contextVars: any) => ReactNode;
  // style, className, readOnly properties also available
};
```

### Core Renderer

Option renderer transforms XMLUI markup into React components, with label/value fallback logic and optimized child handling:

```typescript
export const optionComponentRenderer = createComponentRenderer(COMP, OptionMd,
  ({ node, extractValue, renderChild, layoutContext }) => {
    const label = extractValue.asOptionalString(node.props.label);
    let value = extractValue(node.props.value);
    
    if (label === undefined && value === undefined) return null;

    const hasTextNodeChild = node.children?.length === 1 && 
      (node.children[0].type === "TextNode" || node.children[0].type === "TextNodeCData");

    return (
      <OptionNative
        label={label || (hasTextNodeChild ? renderChild(node.children) : undefined)}
        value={value ?? label}
        enabled={extractValue.asOptionalBoolean(node.props.enabled)}
        keywords={extractValue.asOptionalStringArray(node.props.keywords)}
        optionRenderer={node.children?.length > 0 && !hasTextNodeChild 
          ? (contextVars) => <MemoizedItem node={node.children} renderChild={renderChild} 
                                           contextVars={contextVars} layoutContext={layoutContext} />
          : undefined}
      >
        {!hasTextNodeChild && renderChild(node.children)}
      </OptionNative>
    );
  }
);
```

### OptionNative Adapter

Delegates to context-provided renderer:

```typescript
export const OptionNative = memo((props: Option) => {
  const OptionType = useOptionType();
  return OptionType ? <OptionType {...props} /> : null;
});
```


## Provider Patterns

### OptionTypeProvider

Enables parent components to control option rendering through context:

```typescript
const OptionTypeContext = React.createContext<ComponentType<Option>>(null);
export const useOptionType = () => React.useContext(OptionTypeContext);

function OptionTypeProvider({ children, Component }: { 
  children: ReactNode; 
  Component: ComponentType<Option> 
}) {
  return <OptionTypeContext.Provider value={Component}>{children}</OptionTypeContext.Provider>;
}
```

**Usage:** Parent wraps children in `OptionTypeProvider` with specific renderer (SelectOption, HiddenOption, RadioGroupOption, etc.). Child Options retrieve renderer via `useOptionType()`.

**Concrete Renderers:**
- **SelectOption** - Radix UI Select.Item for simple dropdown
- **MultiSelectOption** - Custom dropdown items with checkboxes
- **HiddenOption** - Data collection without visible UI
- **RadioGroupOption** - Radio button controls

### OptionContext

Manages option registration lifecycle:

```typescript
type OptionContextValue = {
  onOptionAdd: (option: Option) => void;
  onOptionRemove: (option: Option) => void;
};
```

**Lifecycle:** Options register on mount (`onOptionAdd`), unregister on unmount (`onOptionRemove`). Parents collect options in Sets/Arrays for selection, filtering, and navigation.

```typescript
// In option renderers
useEffect(() => {
  onOptionAdd(opt);
  return () => onOptionRemove(opt);
}, [opt, onOptionAdd, onOptionRemove]);
```


## Components Using Options

### Select Component

Select provides single/multi-value selection from dropdown lists with two rendering modes:

**Simple Mode** (default): Radix UI Select primitive, non-searchable, single-select, uses SelectOption.

**Advanced Mode** (searchable/multiSelect): Radix UI Popover, searchable with filtering, multi-select with badges, uses HiddenOption for data collection and MultiSelectOption for rendering.

#### State and Context

```typescript
const [open, setOpen] = useState(false);
const [options, setOptions] = useState(new Set<Option>());
const [searchTerm, setSearchTerm] = useState("");
const [selectedIndex, setSelectedIndex] = useState(-1);

// Option collection
const onOptionAdd = useCallback((option: Option) => {
  setOptions((prev) => new Set(prev).add(option));
}, []);

// Contexts provided
const selectContextValue = { multiSelect, value, onChange: toggleOption, 
                             setOpen, setSelectedIndex, options, optionRenderer };
const optionContextValue = { onOptionAdd, onOptionRemove };
```

#### Filtering

```typescript
const filteredOptions = useMemo(() => {
  if (!searchTerm?.trim()) return Array.from(options);
  const searchLower = searchTerm.toLowerCase();
  return Array.from(options).filter((option) => {
    const extendedValue = option.value + " " + option.label + " " + 
                          (option.keywords || []).join(" ");
    return extendedValue.toLowerCase().includes(searchLower);
  });
}, [options, searchTerm]);
```

#### Rendering Modes

```typescript
// Simple: Options render as SelectOption
<OptionTypeProvider Component={SelectOption}>
  <SimpleSelect {...props}>{children}</SimpleSelect>
</OptionTypeProvider>

// Advanced: Options hidden, manual MultiSelectOption rendering
<OptionTypeProvider Component={HiddenOption}>
  <Popover>
    <PopoverContent>
      {filteredOptions.map((option) => <MultiSelectOption {...option} />)}
    </PopoverContent>
  </Popover>
  {children}
</OptionTypeProvider>
```


### AutoComplete Component

AutoComplete provides searchable input with dropdown suggestions, supporting single/multi-select and optional item creation.

**Key Features:** Input-driven filtering, creatable options (`creatable` prop), badge UI for multi-select, always uses HiddenOption for data collection.

#### State and Creatable Logic

```typescript
const [inputValue, setInputValue] = useState("");   // Display in input
const [searchTerm, setSearchTerm] = useState("");   // Filter query

const shouldShowCreatable = useMemo(() => {
  if (!creatable || !searchTerm?.trim()) return false;
  const exists = Array.from(options).some(o => 
    o.value === searchTerm || o.label === searchTerm);
  if (exists || value === searchTerm) return false;
  return filteredOptions.length === 0;
}, [creatable, searchTerm, options, value, filteredOptions]);

// Combined list for unified keyboard navigation
const allItems = useMemo(() => {
  const items = [];
  if (shouldShowCreatable) {
    items.push({ type: "creatable", value: searchTerm, label: `Create "${searchTerm}"` });
  }
  filteredOptions.forEach(option => items.push({ type: "option", ...option }));
  return items;
}, [shouldShowCreatable, searchTerm, filteredOptions]);
```

#### Creating New Options

```typescript
// When user selects creatable item
if (selectedItem.type === "creatable") {
  const newOption = { value: searchTerm, label: searchTerm, enabled: true };
  onOptionAdd(newOption);
  onItemCreated(searchTerm);
  toggleOption(searchTerm);
}
```

#### Context

```typescript
const autoCompleteContextValue = {
  multi, value, onChange: toggleOption, options,
  inputValue, searchTerm, open, setOpen, setSelectedIndex, optionRenderer
};
```


### RadioGroup Component

RadioGroup provides mutually exclusive selection using radio button controls with Radix UI primitives.

**Key Features:** All options always visible (no dropdown), visual radio controls, no search, custom RadioGroupStatusContext (not OptionContext).

#### RadioGroupStatusContext

```typescript
const RadioGroupStatusContext = createContext<{
  value?: string;
  setValue?: (value: string) => void;
  status: ValidationStatus;
  enabled?: boolean;
}>({ status: "none", enabled: true });
```

Communicates: current value, value setter, validation status, enabled state.

#### RadioGroupOption Renderer

```typescript
export const RadioGroupOption = ({ value, label, enabled, optionRenderer }: Option) => {
  const radioGroupContext = useContext(RadioGroupStatusContext);
  
  const statusStyles = {
    [styles.disabled]: !radioGroupContext.enabled || !enabled,
    [styles.error]: value === radioGroupContext.value && radioGroupContext.status === "error",
    // ... other validation states
  };

  const item = (
    <>
      <UnwrappedRadioItem id={id} value={value} 
        checked={value === radioGroupContext.value} disabled={!enabled} />
      <label htmlFor={id}>{label ?? value}</label>
    </>
  );

  return optionRenderer ? (
    <label>
      {item}
      {optionRenderer({ $checked: value === radioGroupContext.value, 
                        $setChecked: radioGroupContext.setValue })}
    </label>
  ) : item;
};
```

**Why Not OptionContext?** All options always visible, no filtering/search needed. Radix manages selection. Simpler direct rendering.


### Pagination Component

Pagination uses Select internally for page size selection, generating options programmatically:

```typescript
<Select
  enabled={enabled}
  value={`${pageSize}`}
  onDidChange={(newPageSize) => handlePageSizeChange(Number(newPageSize))}
>
  {pageSizeOptions.map((option) => (
    <OptionNative key={option} value={`${option}`} label={`${option} / page`} />
  ))}
</Select>
```

**Key Points:** Uses `OptionNative` directly (bypasses XMLUI markup), generates options from `pageSizeOptions` prop array, formatted labels ("10 / page"), nested Select handles all option logic.



## Advanced Features

### Custom Rendering

**Child Content:**
```xml
<Option value="user1">
  <HStack gap="sm">
    <Avatar src="..." />
    <VStack><Text>John Doe</Text><Text size="sm">john@example.com</Text></VStack>
  </HStack>
</Option>
```

**Component-Level Renderer:**
```typescript
<Select optionRenderer={(option, selectedValue, inTrigger) => (
  <div><strong>{option.label}</strong><span>{option.value}</span></div>
)}>
```

**Option-Specific Renderer:**
```xml
<Option value="1" label="Option 1">
  <script>
    (contextVars) => <div>Custom for {contextVars.$label}</div>
  </script>
</Option>
```

### Keyword Search

```xml
<Option value="us" label="United States" keywords={["USA", "America", "US"]} />
```

Search matches value, label, and keywords array.

### Enabled/Disabled State

```xml
<Option value="1" enabled="true" />
<Option value="2" enabled="false" />  <!-- Disabled: non-selectable, skipped in keyboard nav -->
```

### Value Conversion

Valid types: strings, numbers (except NaN), booleans, null. Others convert to empty string.

```typescript
export function convertOptionValue(value: any): any {
  if (typeof value === "string" || typeof value === "boolean" || value === null) return value;
  if (typeof value === "number" && !isNaN(value)) return value;
  return "";
}
```


### Keyword Search

Options support additional searchable terms:

```xml
<Option 
  value="us" 
  label="United States"
  keywords={["USA", "America", "US"]}
/>
```

When filtering, Select/AutoComplete search across:
- `value` property
- `label` property  
- All strings in `keywords` array

This enables finding options by aliases and alternative names.

### Enabled/Disabled State

Options can be individually disabled:

```xml
<Option value="1" label="Available" enabled="true" />
<Option value="2" label="Out of Stock" enabled="false" />
```

Disabled options:
- Render with disabled visual styling
- Cannot be selected by clicking
- Skipped during keyboard navigation
- Remain in the option list for visibility

### Value Conversion

Option values undergo normalization:

```typescript
export function convertOptionValue(value: any): any {
  if (
    typeof value !== "string" &&
    (typeof value !== "number" || (typeof value === "number" && isNaN(value))) &&
    typeof value !== "boolean" &&
    value !== null
  ) {
    return "";  // Convert invalid values to empty string
  }
  return value;
}
```

Valid option values:
- Strings
- Numbers (except NaN)
- Booleans
- null

Other types (objects, arrays, undefined, NaN) convert to empty string.

## Implementation Guide

### Adding Option Support

**1. State for Collection:**
```typescript
const [options, setOptions] = useState(new Set<Option>());
```

**2. Registration Callbacks:**
```typescript
const onOptionAdd = useCallback((option: Option) => {
  setOptions((prev) => new Set(prev).add(option));
}, []);
const onOptionRemove = useCallback((option: Option) => {
  setOptions((prev) => { const s = new Set(prev); s.delete(option); return s; });
}, []);
```

**3. Provide Context:**
```typescript
<OptionContext.Provider value={{ onOptionAdd, onOptionRemove }}>
  <OptionTypeProvider Component={YourOptionRenderer}>
    {children}
  </OptionTypeProvider>
</OptionContext.Provider>
```

**4. Custom Renderer:**
```typescript
const YourOptionRenderer = ({ value, label, enabled, children }: Option) => {
  const { onOptionAdd, onOptionRemove } = useOption();
  const opt = useMemo(() => ({ value, label, enabled, keywords: [label] }), 
                      [value, label, enabled]);
  useEffect(() => {
    onOptionAdd(opt);
    return () => onOptionRemove(opt);
  }, [opt, onOptionAdd, onOptionRemove]);
  return <div>{children || label}</div>;
};
```

### Performance

**Use Sets:** Fast lookup/add/remove, automatic deduplication. Convert to Array for iteration/filtering.

**Memoize:** Prevent unnecessary re-renders:
```typescript
const filteredOptions = useMemo(() => /* filtering */, [options, searchTerm]);
const contextValue = useMemo(() => ({ onOptionAdd, onOptionRemove }), [onOptionAdd, onOptionRemove]);
```

**Stable Option Objects:** Ensure memoization for Set comparison:
```typescript
const opt = useMemo(() => ({ value, label, enabled }), [value, label, enabled]);
```

### Accessibility

- Use `role="option"`, `role="listbox"`, `role="combobox"`
- Implement `aria-disabled`, `aria-selected`, `aria-expanded`
- Keyboard navigation: ArrowUp/Down, Enter, Escape
- Focus management and focus trapping

### Testing Checklist

- Option registration/unregistration
- Selection handling (single/multi)
- Filtering (label, value, keywords)
- Keyboard navigation
- Custom rendering
- Edge cases (empty list, all disabled, duplicates)

## Summary

The Option architecture provides flexible, declarative selectable choices through:

1. **Non-Visual Data Model** - Pure data, parent-determined rendering
2. **Provider Pattern** - Context-specific rendering via OptionTypeProvider
3. **Registration Pattern** - Dynamic collection via OptionContext
4. **Flexible Display** - Labels, rich content, custom renderers
5. **Search Integration** - Built-in keyword support
6. **Accessibility** - ARIA attributes and keyboard navigation

This enables consistent option handling across Select, AutoComplete, RadioGroup, and Pagination with unique interaction patterns per component.

