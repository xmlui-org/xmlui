# Option-Based Components — AI Reference

## Overview

The option-based architecture is a shared pattern for components that present a fixed set of
selectable choices: **Select**, **AutoComplete**, and **RadioGroup**. The pattern has two
orthogonal concerns:

1. **Data collection** — how child `<Option>` elements register their data with the parent.
2. **Rendering dispatch** — how the parent tells `Option` which visual component to render.

These two concerns are solved by two separate React contexts: `OptionContext` (data) and
`OptionTypeProvider` (rendering).

---

## The `Option` Type

Defined in `xmlui/src/components/abstractions.ts`:

```ts
export type Option = {
  label: string;                                        // Display text; falls back to value if absent
  value: string;                                        // Underlying form value
  enabled?: boolean;                                    // default true; false = visible but not selectable
  style?: CSSProperties;
  className?: string;
  readOnly?: boolean;
  keywords?: string[];                                  // Extra search terms
  children?: ReactNode;                                 // Rich content replaces plain label
  optionRenderer?: (contextVars: any) => ReactNode;    // Per-option custom renderer function
  [key: string]: any;                                   // Extension fields (e.g., for groupBy)
};
```

**Value normalization** (`convertOptionValue` in `OptionNative.tsx`):
- Valid types: `string`, `number`, `boolean`, `null`
- Any other type (objects, arrays, NaN) → `""` (empty string)

**Label fallback chain:**
1. `label` prop if defined
2. Single TextNode child content
3. `value` cast to string

---

## Two-Context Architecture

### OptionContext — Data Collection

```ts
// xmlui/src/components/Select/OptionContext.ts
type OptionContextValue = {
  onOptionAdd: (option: Option) => void;
  onOptionRemove: (option: Option) => void;
};

export const OptionContext = createContext<OptionContextValue>({
  onOptionAdd: () => {},
  onOptionRemove: () => {},
});

export function useOption() {
  return useContext(OptionContext);
}
```

**How it works:**
- Parent component (Select, AutoComplete) provides `onOptionAdd`/`onOptionRemove` callbacks.
- `HiddenOption` renderer calls `onOptionAdd` in a `useEffect` on mount, `onOptionRemove` on unmount.
- Parent stores collected options in a `Set<Option>` state variable.
- Set membership ensures automatic deduplication.
- Dynamic options (options added/removed based on runtime data) are handled automatically.

**Used by:** Select (advanced mode), AutoComplete. NOT used by RadioGroup (see below).

### OptionTypeProvider — Renderer Dispatch

```ts
// xmlui/src/components/Option/OptionTypeProvider.tsx
const OptionTypeContext = React.createContext<ComponentType<Option>>(null);

export function useOptionType() {
  return React.useContext(OptionTypeContext);
}

function OptionTypeProvider({ children, Component }: {
  children: ReactNode;
  Component: ComponentType<Option>;
}) {
  return <OptionTypeContext.Provider value={Component}>{children}</OptionTypeContext.Provider>;
}
```

**How it works:**
- Parent wraps its children in `<OptionTypeProvider Component={SomeRenderer}>`.
- `OptionNative` calls `useOptionType()` and delegates all rendering to that component.
- Different parents supply different renderers → same `<Option>` markup renders differently in each context.

### OptionNative — The Bridge

```ts
// xmlui/src/components/Option/OptionNative.tsx
export const OptionNative = memo((props: Option) => {
  const OptionType = useOptionType();
  if (!OptionType) return null;
  return <OptionType {...props} />;
});
```

`OptionNative` is the React component the `Option` renderer produces. It has no own rendering
logic — it purely delegates to whatever the `OptionTypeProvider` has specified.

---

## Concrete Renderers

| Renderer | Component | Role |
|---|---|---|
| `SelectOption` | Select (simple mode) | Radix UI `Select.Item` wrapper, visible in dropdown |
| `MultiSelectOption` | Select (advanced mode) | Custom item with checkbox, visible in Popover |
| `HiddenOption` | Select (advanced) + AutoComplete | Registers data, renders nothing visible (`display:none`) |
| `RadioGroupOption` | RadioGroup | Radix radio item + label, always visible |

`HiddenOption` is the critical enabler for advanced modes. Options render twice:
once as `HiddenOption` to collect data, once as `MultiSelectOption`/`AutoCompleteOption` to
display — the parent controls both with two separate `OptionTypeProvider` scopes.

---

## Component Details

### Select — Two Rendering Modes

**Mode selection logic:**

```ts
const useSimpleSelect = !searchable && !multiSelect;
```

| Mode | Trigger | Base UI | Options Rendered As | Data Collected By |
|---|---|---|---|---|
| Simple | `searchable=false` + `multiSelect=false` | Radix Select primitive | `SelectOption` | Radix handles internally |
| Advanced | `searchable=true` OR `multiSelect=true` | Radix Popover | `MultiSelectOption` | `HiddenOption` via `OptionContext` |

**Simple mode pattern:**
```tsx
<OptionTypeProvider Component={SelectOption}>
  <SimpleSelect {...props}>{children}</SimpleSelect>
</OptionTypeProvider>
```

**Advanced mode pattern:**
```tsx
// Children render as HiddenOption (data collection)
<OptionTypeProvider Component={HiddenOption}>
  <OptionContext.Provider value={{ onOptionAdd, onOptionRemove }}>
    {children}
  </OptionContext.Provider>
</OptionTypeProvider>

// Visible rendering from collected options
<Popover>
  <PopoverContent>
    {filteredOptions.map((option) => (
      <MultiSelectOption key={option.value} {...option} isHighlighted={index === selectedIndex} />
    ))}
  </PopoverContent>
</Popover>
```

**Filtering:**
```ts
const filteredOptions = useMemo(() => {
  if (!searchTerm?.trim()) return Array.from(options);
  const searchLower = searchTerm.toLowerCase();
  return Array.from(options).filter((option) => {
    const extendedValue =
      option.value + " " + option.label + " " + (option.keywords || []).join(" ");
    return extendedValue.toLowerCase().includes(searchLower);
  });
}, [options, searchTerm]);
```

Searches across `value`, `label`, and `keywords[]` joined with spaces. Case-insensitive
substring match. No debouncing — runs on every keystroke.

**Grouping** (Select-only, via `groupBy` prop):
```ts
const groupedOptions = useMemo(() => {
  if (!groupBy) return null;
  const groups: Record<string, Option[]> = {};
  optionsToGroup.forEach((option) => {
    const key = (option as any)[groupBy] ?? "Ungrouped";
    (groups[key] = groups[key] ?? []).push(option);
  });
  // "Ungrouped" first, then alphabetical by group key
  return sortedGroups;
}, [groupBy, filteredOptions, searchTerm, options]);
```

Uses any extra field on `Option` (e.g., `category`, `region`) as the group key.

---

### AutoComplete

Key differences from Select:

- Always uses `HiddenOption` (no simple mode).
- Filtering is driven by the text input value, not a separate search box.
- `creatable` prop: if `true`, a "Create X" option appears when `searchTerm` matches no existing option.
- State: `inputValue` (what the input shows) and `searchTerm` (what drives filtering) are tracked independently.

**Creatable logic:**
```ts
const shouldShowCreatable = useMemo(() => {
  if (!creatable || !searchTerm?.trim()) return false;
  const exists = Array.from(options).some(
    (o) => o.value === searchTerm || o.label === searchTerm
  );
  return !exists && value !== searchTerm && filteredOptions.length === 0;
}, [creatable, searchTerm, options, value, filteredOptions]);
```

The "creatable" item appears at the TOP of the dropdown list, before the filtered options.
Selecting it calls `onOptionAdd` (adding it to the option set) and `onItemCreated`.

---

### RadioGroup

RadioGroup is the **exception** to the OptionContext pattern. It does NOT use `OptionContext` or
`OptionTypeProvider`. Reasons:
- All options are always visible — no filtering, no hidden rendering phase.
- Radix UI `RadioGroup` primitive manages selection natively.
- Simpler direct rendering is sufficient.

Instead it uses `RadioGroupStatusContext`:

```ts
const RadioGroupStatusContext = createContext<{
  value?: string;
  setValue?: (value: string) => void;
  status: ValidationStatus;
  enabled?: boolean;
}>({ status: "none", enabled: true });
```

`RadioGroupOption` reads this context for selection state, validation status, and enabled flag.
`optionRenderer` on RadioGroupOption receives `{ $checked, $setChecked }`.

---

### Pagination

Pagination uses Select internally. It generates its options **programmatically** using `OptionNative`
directly (bypassing XMLUI markup):

```tsx
{pageSizeOptions.map((option) => (
  <OptionNative key={option} value={`${option}`} label={`${option} / page`} />
))}
```

Pagination owns no option-specific logic itself — it delegates entirely to the nested Select.

---

## How the Option Renderer Is Created

`Option.tsx` (the component renderer) handles child content vs optionRenderer vs plain label:

```ts
return (
  <OptionNative
    label={label || (hasTextNodeChild ? renderChild(node.children) : undefined)}
    value={value ?? label}
    enabled={extractValue.asOptionalBoolean(node.props.enabled)}
    keywords={extractValue.asOptionalStringArray(node.props.keywords)}
    optionRenderer={
      hasNonTextChildren
        ? (contextVars) => (
            <MemoizedItem node={node.children} renderChild={renderChild}
                          contextVars={contextVars} layoutContext={layoutContext} />
          )
        : undefined
    }
  >
    {!hasTextNodeChild && renderChild(node.children)}
  </OptionNative>
);
```

**Child content rules:**
- Single TextNode child → used as `label`, NOT passed as `children`
- Multiple/complex children → passed as both `children` (for React tree) and `optionRenderer` function

---

## Custom Option Rendering — Three Levels

### Level 1: Rich Child Content (most common)

```xml
<Option value="user1">
  <HStack gap="sm">
    <Avatar src="{user.avatar}" />
    <Text>{user.name}</Text>
  </HStack>
</Option>
```

The child content becomes `children` on the `Option` object. In `SelectOption`, if `children`
is present, it renders instead of the plain label.

### Level 2: Per-Option optionRenderer

```xml
<Option value="fr" label="France">
  <HStack gap="xs">
    <Icon name="flag-fr" />
    <Text>France</Text>
  </HStack>
</Option>
```

The `optionRenderer` function receives `contextVars` which include `$checked`, `$setChecked`
for RadioGroup, and component-specific vars for others.

### Level 3: Component-Level optionRenderer Prop (Select only)

```xml
<Select optionRenderer="(option, selectedValue, inTrigger) => option.label + (inTrigger ? ' ✓' : '')">
  <Option value="a" label="Alpha" />
</Select>
```

The component-level `optionRenderer` in `SelectContext` is checked when no per-option renderer exists.

**Priority order:**
1. `option.children` (complex React nodes) — renders children
2. `option.optionRenderer` (per-option function)
3. Component-level `optionRenderer` in context
4. `option.label` (plain string)

---

## Disabled Options

```ts
enabled?: boolean;  // default: true
```

- **Visible**: always rendered in the list
- **Not clickable**: `handleClick` guards with `if (enabled)`
- **Not keyboard-navigable**: RadioGroup excludes via `querySelectorAll('[role="radio"]:not(:disabled)')`
- **Visually styled**: `disabledOption` CSS class applied

---

## Form Integration

Option-based components integrate with the Form system via the `FormBinding` behavior
(auto-attached when inside a `<Form>` or with `bindTo` prop):

- `Select`, `AutoComplete`, `RadioGroup` all expose `value`/`onDidChange` as their form binding interface.
- `bindTo="fieldName"` maps the component's `value` to a form field.
- Validation applies the standard `required`, `pattern`, and custom validation rules.
- Form reset clears the `value` back to `initialValue`.

---

## Adding Option Support to a New Component

1. **Provide `OptionContext`** in the native component if you need dynamic option collection:

```tsx
const [options, setOptions] = useState(new Set<Option>());
const onOptionAdd = useCallback((opt) => setOptions((p) => new Set(p).add(opt)), []);
const onOptionRemove = useCallback((opt) => setOptions((p) => { const s = new Set(p); s.delete(opt); return s; }), []);
```

2. **Provide `OptionTypeProvider`** with the renderer that makes sense for your component:

```tsx
<OptionTypeProvider Component={HiddenOption}>
  <OptionContext.Provider value={{ onOptionAdd, onOptionRemove }}>
    {children}
  </OptionContext.Provider>
</OptionTypeProvider>
```

3. **Render from collected options** in your own UI (dropdown, list, etc.):

```tsx
{Array.from(options).map((opt) => (
  <MyOptionItem key={opt.value} {...opt} onSelect={() => onChange(opt.value)} />
))}
```

4. If you DON'T need dynamic collection (options are always all rendered), use
   `RadioGroupStatusContext`-style direct rendering instead — skip `OptionContext` entirely.

---

## Key Files

| File | Purpose |
|---|---|
| `xmlui/src/components/abstractions.ts` | `Option` type definition |
| `xmlui/src/components/Option/OptionNative.tsx` | `OptionNative` adapter + `convertOptionValue` |
| `xmlui/src/components/Option/OptionTypeProvider.tsx` | `OptionTypeProvider` + `useOptionType` |
| `xmlui/src/components/Option/Option.tsx` | Component renderer for `<Option>` in markup |
| `xmlui/src/components/Select/OptionContext.ts` | `OptionContext` + `useOption` |
| `xmlui/src/components/Select/SelectNative.tsx` | Select — main logic, filtering, groupBy |
| `xmlui/src/components/Select/HiddenOption.tsx` | Data-collection renderer (no UI) |
| `xmlui/src/components/Select/SelectOption.tsx` | Simple-mode dropdown item renderer |
| `xmlui/src/components/Select/MultiSelectOption.tsx` | Advanced-mode dropdown item renderer |
| `xmlui/src/components/Select/SimpleSelect.tsx` | Radix UI Select wrapper for simple mode |
| `xmlui/src/components/AutoComplete/AutoCompleteNative.tsx` | AutoComplete logic + creatable options |
| `xmlui/src/components/RadioGroup/RadioGroupNative.tsx` | RadioGroup + `RadioGroupOption` + `RadioGroupStatusContext` |
| `xmlui/src/components/Pagination/PaginationNative.tsx` | Pagination (uses Select + OptionNative directly) |
| `xmlui/dev-docs/components-with-options.md` | Existing architecture reference doc |

---

## Anti-Patterns

| Anti-Pattern | Problem | Correct Approach |
|---|---|---|
| Generating options with `items` prop instead of `<Option>` children | `items` is a separate flat-list prop; not all components support it | Use `<Option>` children for rich/dynamic options |
| Putting function references in Option `value` | `convertOptionValue` converts non-scalars to `""` | Only use string/number/boolean/null as `value` |
| Accessing `window.options` or external state in option content | Not reactive | Bind option label/content to reactive expressions in markup |
| Skipping `HiddenOption` in advanced modes | Options won't register, no items appear | Always pair `OptionContext.Provider` with `HiddenOption` renderer |
| Using RadioGroup's `RadioGroupStatusContext` pattern for new filterable components | No collection mechanism | Use `OptionContext` + `HiddenOption` for any component needing search/filtering |
