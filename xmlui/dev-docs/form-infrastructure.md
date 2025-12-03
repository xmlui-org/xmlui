# XMLUI Form Infrastructure

A deep dive into XMLUI's Form and FormItem components - how they manage state, bind data, validate input, and handle submission.

## What Forms Do

Forms in XMLUI provide **automatic data management** for user input. You declare fields with `bindTo`, and the framework handles:

- **State synchronization** - Input changes automatically update the form's data model
- **Validation** - Built-in and custom validation with flexible display timing
- **Submission** - Coordinated save with pre-validation and backend error handling
- **Context propagation** - Child components access form data via `$data`

From a developer perspective:
- **Declare, don't wire**: Use `bindTo="email"` instead of managing `value`/`onChange`
- **Validate declaratively**: Set `required`, `pattern="email"`, or custom `onValidate`
- **Access data anywhere**: Reference `$data.email` in any child component
- **Handle errors gracefully**: Backend validation errors display on the correct fields

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         FormWithContextVar                              │
│                                                                         │
│   Creates useReducer(formReducer, initialState)                         │
│   Exposes $data context variable                                        │
│                              ↓                                          │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                          Form (Native)                             │  │
│  │  • Wraps children in <form> element                               │  │
│  │  • Provides FormContext.Provider                                  │  │
│  │  • Handles submit/cancel/reset                                    │  │
│  │  • Shows ValidationSummary + button row                           │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                              ↓                                          │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                     FormContext.Provider                           │  │
│  │  subject, originalSubject, validationResults, interactionFlags,   │  │
│  │  dispatch, enabled, itemLabelWidth, itemLabelBreak, itemLabelPos  │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                              ↓                                          │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                        FormItem                                    │  │
│  │  • Subscribes to FormContext via useFormContextPart()             │  │
│  │  • Dispatches field actions (init, change, focus, blur)           │  │
│  │  • Runs validation via useValidation() hook                       │  │
│  │  • Renders control + label + validation feedback                  │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

**Key insight:** Form owns all state via `useReducer`. FormItems are stateless consumers that dispatch actions and read slices of context.

## File Organization

```
src/components/Form/
├── Form.tsx              # Metadata + component renderer entry
├── FormNative.tsx        # Form + FormWithContextVar implementations
├── FormContext.ts        # Context types, hooks, validation types
├── formActions.ts        # Action creators and action types
├── Form.module.scss      # Styles and theme variables
└── Form.md               # User documentation

src/components/FormItem/
├── FormItem.tsx          # Metadata + component renderer entry
├── FormItemNative.tsx    # FormItem implementation
├── ItemWithLabel.tsx     # Label wrapper component
├── HelperText.tsx        # Validation message display
├── Validations.ts        # Validation logic + useValidation hook
├── FormItem.module.scss  # Styles and theme variables
└── FormItem.md           # User documentation
```

---

## State Management

Form uses `useReducer` with Immer for immutable updates. All form state lives in one place.

### FormState Structure

```typescript
interface FormState {
  subject: any;                                    // Current form data
  validationResults: Record<string, ValidationResult>;  // Per-field validation
  generalValidationResults: Array<SingleValidationResult>;  // Form-level errors
  interactionFlags: Record<string, InteractionFlags>;  // Per-field UI state
  noSubmitFields: Record<string, boolean>;         // Fields excluded from submit
  submitInProgress?: boolean;                      // Submission in flight
  resetVersion?: number;                           // Forces re-mount on reset
}
```

**Why `subject`?** The form's data object. `subject.email` holds the email field's value.

**Why `interactionFlags`?** Tracks user interaction per field to control validation display timing (dirty, focused, blurred, etc.).

### Interaction Flags

Each field tracks UI interaction state:

```typescript
type InteractionFlags = {
  isDirty: boolean;              // Value changed from initial
  invalidToValid: boolean;       // Just became valid (for late error mode)
  isValidOnFocus: boolean;       // Was valid when focused
  isValidLostFocus: boolean;     // Was valid when blurred
  focused: boolean;              // Currently has focus
  afterFirstDirtyBlur: boolean;  // Lost focus after first edit
  forceShowValidationResult: boolean;  // Force display (submit attempted)
};
```

**Why so many flags?** Supports the "late error" validation pattern - show errors as late as possible to avoid frustrating users typing valid input.

### Action Types

```typescript
enum FormActionKind {
  FIELD_INITIALIZED,        // Field mounted with initial value
  FIELD_REMOVED,            // Field unmounted
  FIELD_VALUE_CHANGED,      // User changed value
  FIELD_VALIDATED,          // Validation completed
  FIELD_FOCUSED,            // Field gained focus
  FIELD_LOST_FOCUS,         // Field lost focus
  TRIED_TO_SUBMIT,          // Submit attempted (forces validation display)
  BACKEND_VALIDATION_ARRIVED, // Server returned validation errors
  SUBMITTING,               // Submit in progress
  SUBMITTED,                // Submit succeeded
  RESET,                    // Form reset
}
```

### Reducer Pattern

```typescript
const formReducer = produce((state: FormState, action: FormAction) => {
  const { uid } = action.payload;
  
  // Auto-initialize interaction flags for new fields
  if (uid !== undefined && !state.interactionFlags[uid]) {
    state.interactionFlags[uid] = {
      isDirty: false,
      invalidToValid: false,
      isValidOnFocus: false,
      isValidLostFocus: false,
      focused: false,
      afterFirstDirtyBlur: false,
      forceShowValidationResult: false,
    };
  }
  
  switch (action.type) {
    case FormActionKind.FIELD_VALUE_CHANGED:
      set(state.subject, uid, action.payload.value);  // Lodash set for nested paths
      state.interactionFlags[uid].isDirty = true;
      break;
    // ... other cases
  }
});
```

**Key insight:** Immer's `produce()` allows direct mutations that become immutable updates. Lodash `set()` handles nested paths like `address.city`.

---

## Context System

Form provides context; FormItem consumes it. But there's a performance optimization.

### The Problem

Standard `useContext` re-renders every consumer when *any* context value changes:

```tsx
// ❌ PROBLEM - Re-renders on every form state change
function FormItem({ bindTo }) {
  const { subject, dispatch } = useContext(FormContext);
  // Re-renders when ANY field changes, not just this one
}
```

### The Solution: use-context-selector

Form uses `use-context-selector` to subscribe to specific state slices:

```tsx
// ✅ SOLUTION - Re-renders only when this field's value changes
function FormItem({ bindTo }) {
  const value = useFormContextPart((ctx) => getByPath(ctx.subject, bindTo));
  const dispatch = useFormContextPart((ctx) => ctx.dispatch);
  // Re-renders only when value at 'bindTo' path changes
}
```

**Pattern:**
```typescript
export function useFormContextPart<T>(selector: (value?: IFormContext) => T) {
  return useContextSelector(FormContext, selector);
}
```

**Use when:** Component needs only part of context.  
**Benefit:** 100 form fields don't all re-render when one field changes.

---

## Data Binding

### The bindTo Property

Links a FormItem to a path in the form's data:

```xml
<!-- Simple path -->
<FormItem bindTo="email" />           <!-- $data.email -->

<!-- Nested path -->
<FormItem bindTo="address.city" />    <!-- $data.address.city -->

<!-- Array index -->
<FormItem bindTo="items[0].name" />   <!-- $data.items[0].name -->
```

**Implementation:** Uses Lodash `get()` and `set()` for path resolution:

```typescript
// Reading
const value = useFormContextPart((ctx) => getByPath(ctx.subject, formItemId));

// Writing
dispatch(fieldChanged(formItemId, newValue));
// Reducer uses: set(state.subject, uid, action.payload.value)
```

### Unbound Fields

Fields without `bindTo` still participate in the form but aren't submitted:

```typescript
const UNBOUND_FIELD_SUFFIX = "__UNBOUND_FIELD__";
const safeBindTo = bindTo || `${defaultId}${UNBOUND_FIELD_SUFFIX}`;
```

**Use case:** Helper fields that affect other fields but shouldn't be sent to the server.

### noSubmit Flag

Explicitly exclude a field from submission:

```xml
<FormItem bindTo="confirmPassword" noSubmit="{true}" />
```

**Use case:** Confirmation fields, computed display fields.

### Data Cleanup on Submit

```typescript
function cleanUpSubject(subject: any, noSubmitFields: Record<string, boolean>) {
  return Object.entries(subject || {}).reduce((acc, [key, value]) => {
    if (!key.endsWith(UNBOUND_FIELD_SUFFIX) && !noSubmitFields[key]) {
      acc[key] = value;
    }
    return acc;
  }, {});
}
```

---

## Validation System

### Validation Types

```typescript
type ValidationResult = {
  isValid: boolean;
  validations: Array<SingleValidationResult>;
  validatedValue: any;           // Value that was validated
  partial: boolean;              // True if async validation pending
};

type SingleValidationResult = {
  isValid: boolean;
  severity: 'error' | 'warning' | 'valid' | 'none';
  invalidMessage?: string;
  validMessage?: string;
  async?: boolean;               // From async validation
  stale?: boolean;               // Previous async result being replaced
  fromBackend?: boolean;         // From server validation
};
```

**Why `partial`?** Sync validations complete immediately; async validations take time. `partial: true` means "sync done, async in progress."

**Why `stale`?** When async validation starts, previous async results show as stale (dimmed) until new results arrive.

### Built-in Validations

FormItem supports these out of the box:

| Property | Description | Example |
|----------|-------------|---------|
| `required` | Field must have value | `required="{true}"` |
| `minLength` / `maxLength` | String length bounds | `minLength="{3}"` |
| `minValue` / `maxValue` | Numeric range | `minValue="{0}"` |
| `pattern` | Predefined pattern | `pattern="email"` |
| `regex` | Custom regex | `regex="^[A-Z]"` |

**Available patterns:** `email`, `phone`, `url`

### Validation Order

The `FormItemValidator` class runs validations in order:

1. **Required** - Empty check (stops here if empty and required)
2. **Length** - `minLength` / `maxLength`
3. **Range** - `minValue` / `maxValue`
4. **Pattern** - Built-in patterns
5. **Regex** - Custom regex
6. **Custom** - `onValidate` handler (async)

```typescript
preValidate = () => {
  const requiredResult = this.validateRequired();
  let results = [requiredResult];
  
  // Only run other validations if required passes (or field not required)
  if (!requiredResult || requiredResult.isValid) {
    results.push(
      this.validateLength(),
      this.validateRange(),
      this.validatePattern(),
      this.validateRegex(),
    );
  }
  // ...
};
```

### Custom Validation

```xml
<FormItem 
  bindTo="username" 
  onValidate="async (value) => {
    const exists = await checkUsernameExists(value);
    return exists 
      ? { isValid: false, invalidMessage: 'Username taken', severity: 'error' }
      : true;
  }"
/>
```

**Return formats:**
- `true` / `false` - Simple valid/invalid
- `SingleValidationResult` - Detailed single result
- `Array<SingleValidationResult>` - Multiple messages

### useValidation Hook

Orchestrates sync and async validation:

```typescript
export function useValidation(
  validations: FormItemValidations,
  onValidate: ValidateEventHandler,
  value: any,
  dispatch: Dispatch<FormAction>,
  bindTo: string,
  throttleWaitInMs: number = 0,
) {
  const deferredValue = useDeferredValue(value);

  useEffect(function runAllValidations() {
    const abortController = new AbortController();
    const validator = new FormItemValidator(validations, onValidate, deferredValue);
    
    // Sync validations run immediately
    const partialResult = validator.preValidate();
    dispatch(fieldValidated(bindTo, partialResult));
    
    // Async validations run if present
    if (partialResult.partial) {
      void (async () => {
        const result = await throttledAsyncValidate(validations, onValidate, deferredValue);
        if (!abortController.signal.aborted) {
          dispatch(fieldValidated(bindTo, result));
        }
      })();
    }
    
    return () => abortController.abort();
  }, [bindTo, deferredValue, dispatch, onValidate, validations]);
}
```

**Key patterns:**
- `useDeferredValue` - Debounces validation during rapid typing
- `AbortController` - Cancels stale async validations on unmount/value change
- Partial dispatch - Shows sync results while async runs

### Validation Display Modes

When to show validation errors:

| Mode | Description |
|------|-------------|
| `errorLate` (default) | Show on blur; once shown, update per keystroke until valid |
| `onChanged` | Show immediately on any change |
| `onLostFocus` | Show only when field loses focus |

**Why `errorLate`?** Research shows users prefer not seeing errors while actively typing valid input. Show errors late, clear them early.

### useValidationDisplay Hook

Determines if validation should be visible:

```typescript
export function useValidationDisplay(
  bindTo: string,
  value: any,
  validationResult: ValidationResult | undefined,
  validationMode: ValidationMode = 'errorLate',
): {
  isHelperTextShown: boolean;
  validationStatus: ValidationSeverity;
}
```

**Logic for `errorLate` mode:**
1. Don't show if not dirty (user hasn't touched field)
2. Show if lost focus and invalid
3. Show if focused + previously blurred + was invalid on focus + hasn't just become valid
4. Always show if `forceShowValidationResult` (submit attempted)

---

## FormItem Control Types

FormItem renders different controls based on `type`:

| Type | Component | Notes |
|------|-----------|-------|
| `text` | TextBox | Default |
| `password` | TextBox | type="password" |
| `textarea` | TextArea | Multi-line |
| `checkbox` | Toggle | variant="checkbox" |
| `switch` | Toggle | variant="switch" |
| `number` | NumberBox | Numeric |
| `integer` | NumberBox | integersOnly=true |
| `file` | FileInput | File upload |
| `select` | Select | Dropdown |
| `autocomplete` | AutoComplete | Searchable dropdown |
| `datePicker` | DatePicker | Date selection |
| `radioGroup` | RadioGroup | Radio buttons |
| `slider` | Slider | Range slider |
| `colorpicker` | ColorPicker | Color selection |
| `items` | Items | Array editing |
| `custom` | children | Your component |

**Custom type pattern:**
```xml
<FormItem bindTo="rating">
  <StarRating value="{$value}" onChange="{$setValue}" />
</FormItem>
```

Context variables for custom controls:
- `$value` - Current field value
- `$setValue` - Function to update value
- `$validationResult` - Current validation state

---

## Submission Flow

```
User clicks Save
      ↓
doSubmit()
      ↓
Check isEnabled → false? Return
      ↓
doValidate()
  ├─ dispatch(triedToSubmit()) → forces validation display
  └─ Check for errors
      ↓
Errors? → Return (don't submit)
      ↓
Warnings only? → Show confirmation modal
      ↓
dispatch(formSubmitting())
      ↓
onWillSubmit(cleanedData)
  ├─ Return false → Cancel submission
  ├─ Return object → Submit that object instead
  └─ Return null/undefined → Continue with original data
      ↓
onSubmit(data, { passAsDefaultBody: true })
      ↓
dispatch(formSubmitted())
      ↓
onSuccess(result)
      ↓
No initial data? → Reset form
      ↓
Close modal if applicable
```

### Backend Validation Integration

When submission fails, server errors map back to fields:

```typescript
catch (e) {
  if (e.errorCategory === "GenericBackendError" && e.details?.issues) {
    e.details.issues.forEach((issue) => {
      const result = {
        isValid: false,
        invalidMessage: issue.message,
        severity: issue.severity || "error",
        fromBackend: true,
      };
      
      if (issue.field !== undefined) {
        fieldValidationResults[issue.field].push(result);
      } else {
        generalValidationResults.push(result);
      }
    });
  }
  
  dispatch(backendValidationArrived({
    generalValidationResults,
    fieldValidationResults,
  }));
}
```

**Server response format:**
```json
{
  "errorCategory": "GenericBackendError",
  "details": {
    "issues": [
      { "field": "email", "message": "Email already registered", "severity": "error" },
      { "message": "Please try again later", "severity": "warning" }
    ]
  }
}
```

---

## Component APIs

### Form API

```typescript
// Exposed via registerComponentApi
{
  reset: () => void;                    // Reset to initial state
  update: (data: object) => void;       // Update specific fields
  validate: () => Promise<{             // Trigger validation
    isValid: boolean;
    data: object;
    errors: ValidationResult[];
    warnings: ValidationResult[];
  }>;
  getData: () => object;                // Get deep clone of current data
  isDirty: () => boolean;               // Any field modified?
}
```

**Usage in XMLUI:**
```xml
<Form id="myForm">
  <!-- fields -->
</Form>
<Button onClick="myForm.reset()">Reset</Button>
<Button onClick="myForm.update({ status: 'draft' })">Save Draft</Button>
```

### FormItem API (type="items")

```typescript
{
  addItem: (data: any) => void;         // Append to list
  removeItem: (index: number) => void;  // Remove by index
}
```

---

## Context Variables

### $data (Form)

Available to all Form children:

```typescript
const $data = useMemo(() => ({
  ...cleanUpSubject(formState.subject, formState.noSubmitFields),
  update: updateData,  // Shortcut to Form.update()
}), [formState.subject, formState.noSubmitFields]);
```

**Usage:**
```xml
<Form data="{{ name: '', showEmail: false }}">
  <FormItem bindTo="showEmail" type="checkbox" label="Show email?" />
  <FormItem bindTo="email" enabled="{$data.showEmail}" />
  <Text>Current name: {$data.name}</Text>
</Form>
```

### Custom FormItem Context

For `type="custom"`, FormItem injects:

| Variable | Description |
|----------|-------------|
| `$value` | Current field value |
| `$setValue` | `(newValue) => void` |
| `$validationResult` | Current validation state |

---

## Nested FormItem Support

FormItem supports nested data structures for array editing:

```xml
<FormItem bindTo="contacts" type="items">
  <property name="inputTemplate">
    <Card>
      <FormItem bindTo="name" label="Name" />    <!-- contacts[0].name -->
      <FormItem bindTo="email" label="Email" />  <!-- contacts[0].email -->
    </Card>
  </property>
</FormItem>
```

**Path construction:**
```typescript
const formItemId = useMemo(() => {
  if (parentFormItemId && itemIndex !== undefined) {
    // Parent is "contacts", index is 0, bindTo is "name"
    // Result: "contacts[0].name"
    return `${parentFormItemId}[${itemIndex}].${bindTo}`;
  }
  return bindTo;
}, [parentFormItemId, itemIndex, bindTo]);
```

---

## Theme Variables

### Form

```scss
$gap-Form                    // Gap between form elements (default: $space-4)
$gap-buttonRow-Form          // Gap between buttons (default: $space-4)
$marginTop-buttonRow-Form    // Margin above button row (default: $space-4)
```

### FormItem Labels

```scss
$textColor-FormItemLabel
$fontSize-FormItemLabel              // default: $fontSize-sm
$fontWeight-FormItemLabel            // default: $fontWeight-medium
$fontStyle-FormItemLabel
$textTransform-FormItemLabel
$textColor-FormItemLabel-requiredMark  // default: $color-danger-400
```

### Validation Display

```scss
$backgroundColor-ValidationDisplay-error    // default: $color-danger-100
$backgroundColor-ValidationDisplay-warning  // default: $color-warn-100
$backgroundColor-ValidationDisplay-valid    // default: $color-success-100
$color-accent-ValidationDisplay-*
$textColor-ValidationDisplay-*
```

---

## Implementation Notes

### Performance: Context Selector Pattern

Uses `use-context-selector` to prevent render cascades. Each FormItem subscribes only to its specific data slice.

**Critical:** Standard `useContext` would re-render all 100 fields when any field changes. Context selectors make forms with many fields performant.

### Path Resolution: Lodash set/get

Uses Lodash for nested path support:
```typescript
import { get, set } from 'lodash-es';

// Read: get(subject, "address.city")
// Write: set(state.subject, "address.city", "Seattle")
```

**Warning:** `set()` mutates objects. Safe inside Immer's `produce()`, dangerous elsewhere.

### Reset Mechanism

`resetVersion` forces React to re-mount the form:
```tsx
<form key={formState.resetVersion}>
```

**Why?** Unmounting clears all uncontrolled input state, ensuring a clean slate.

### Form Inside Form Guard

FormItem throws if not inside a Form:
```typescript
const isInsideForm = useIsInsideForm();
if (!isInsideForm) {
  throw new Error("FormItem must be used inside a Form");
}
```

### Auto-Animate

Both Form and FormItem use `@formkit/auto-animate` for smooth validation message transitions:
```tsx
const [animateContainerRef] = useAutoAnimate({ duration: 100 });
return <div ref={animateContainerRef}>{validationMessages}</div>;
```

---

## Quick Reference

### When to Use What

| Need | Solution |
|------|----------|
| Simple text input | `<FormItem bindTo="name" />` |
| Required field | `<FormItem bindTo="name" required />` |
| Email validation | `<FormItem bindTo="email" pattern="email" />` |
| Custom async validation | `<FormItem bindTo="username" onValidate="..." />` |
| Exclude from submit | `<FormItem bindTo="confirm" noSubmit />` |
| Show errors only on blur | `validationMode="onLostFocus"` |
| Custom control | `<FormItem bindTo="x"><MyControl value={$value} onChange={$setValue}/></FormItem>` |
| Programmatic update | `myForm.update({ field: value })` |
| Conditional field | `<FormItem enabled="{$data.showField}" />` |

### Common Patterns

**Dependent fields:**
```xml
<Form data="{{ country: '', state: '' }}">
  <FormItem bindTo="country" type="select">
    <Option value="US">United States</Option>
    <Option value="CA">Canada</Option>
  </FormItem>
  <FormItem bindTo="state" type="select" enabled="{$data.country !== ''}">
    <!-- Options based on $data.country -->
  </FormItem>
</Form>
```

**Confirmation field:**
```xml
<FormItem bindTo="password" type="password" />
<FormItem 
  bindTo="confirmPassword" 
  type="password" 
  noSubmit
  onValidate="(val) => val === $data.password || 'Passwords must match'"
/>
```

**Custom submit handling:**
```xml
<Form 
  onWillSubmit="(data) => {
    if (data.age < 18) {
      toast.error('Must be 18+');
      return false;
    }
    return { ...data, submittedAt: new Date() };
  }"
  onSubmit="(data) => api.save(data)"
  onSuccess="() => toast.success('Saved!')"
/>
```
