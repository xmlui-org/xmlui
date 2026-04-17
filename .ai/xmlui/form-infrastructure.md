# Form Infrastructure

Internal architecture for Form, FormItem, validation, submission, and data binding. For user-facing patterns, see `.ai/xmlui/data.md`.

## Architecture

```
FormWithContextVar (renderer)
  → useReducer(formReducer, initialState)    // Immer-backed
  → exposes $data, $validationIssues, $hasValidationIssue context vars
  → Form (FormNative)
      → <form> element + FormContext.Provider
      → handles submit/cancel/reset, button row, validation summary
      → FormItem (FormItemNative)
          → subscribes to FormContext via useFormContextPart() (context-selector)
          → dispatches field actions
          → runs useValidation() pipeline
          → renders input + label + validation feedback
```

**Key invariant:** Form owns ALL state via `useReducer`. FormItems are stateless consumers that dispatch actions and read context slices.

## FormState

```typescript
interface FormState {
  subject: any;                                         // Current form data (nested object)
  validationResults: Record<string, ValidationResult>;  // Per-field
  generalValidationResults: SingleValidationResult[];   // Form-level errors
  interactionFlags: Record<string, InteractionFlags>;   // Per-field UI tracking
  noSubmitFields: Record<string, boolean>;              // Fields excluded from submit
  submitInProgress?: boolean;
  resetVersion?: number;                                // Increments on reset → forces re-mount via key
}
```

## Reducer Actions

| Action | Trigger | Effect |
|--------|---------|--------|
| `FIELD_INITIALIZED` | FormItem mount | Sets initial value (if not dirty), registers noSubmit |
| `FIELD_VALUE_CHANGED` | User input | `set(state.subject, uid, value)`, marks `isDirty` |
| `FIELD_VALIDATED` | useValidation | Stores `ValidationResult`, handles `partial` flag |
| `FIELD_FOCUSED` | Input focus | Snapshots `isValidOnFocus` |
| `FIELD_LOST_FOCUS` | Input blur | Sets `afterFirstDirtyBlur`, clears `invalidToValid` |
| `FIELD_REMOVED` | FormItem unmount | Deletes validation/interaction/noSubmit entries |
| `TRIED_TO_SUBMIT` | Submit clicked | Sets `forceShowValidationResult: true` on ALL fields |
| `SUBMITTING` | doSubmit starts | `submitInProgress = true` |
| `SUBMITTED` | doSubmit succeeds | Clears interaction flags, removes backend errors |
| `BACKEND_VALIDATION_ARRIVED` | API error | Maps `issue.field` → field results, no-field → general |
| `RESET` | Reset button | Fresh state, increments `resetVersion` |

Reducer uses Immer's `produce()` — direct mutations become immutable updates. Lodash `set()` handles nested paths like `address.city`.

## InteractionFlags

```typescript
type InteractionFlags = {
  isDirty: boolean;                  // Value changed from initial
  invalidToValid: boolean;           // Was invalid, just became valid
  isValidOnFocus: boolean;           // Valid when focused
  isValidLostFocus: boolean;         // Valid when blurred
  focused: boolean;                  // Currently focused
  afterFirstDirtyBlur: boolean;      // Lost focus after first edit
  forceShowValidationResult: boolean; // Submit attempted
};
```

Purpose: drive the "late error" validation display pattern. Show errors as late as possible, clear them early.

## FormContext & Performance

**Problem:** Standard `useContext` re-renders ALL consumers on any state change.

**Solution:** `use-context-selector` library — each FormItem subscribes to specific slices:

```typescript
// Only re-renders when THIS field's value changes
const value = useFormContextPart(ctx => getByPath(ctx?.subject, bindTo));
```

**IFormContext fields:** `subject`, `originalSubject`, `validationResults`, `interactionFlags`, `dispatch`, `enabled`, `itemLabelWidth`, `itemLabelBreak`, `itemLabelPosition`, `itemRequireLabelMode`, `verboseValidationFeedback`, validation icons.

## Data Binding

### bindTo paths

```xml
<FormItem bindTo="email" />           <!-- subject.email -->
<FormItem bindTo="address.city" />    <!-- subject.address.city -->
<FormItem bindTo="items[0].name" />   <!-- subject.items[0].name -->
```

Uses Lodash `get()`/`set()` for path resolution. `set()` mutates — safe inside Immer's `produce()`.

### Unbound fields

Fields without `bindTo` get synthetic ID: `${defaultId}__UNBOUND_FIELD__`. Filtered out on submit.

### noSubmit

`noSubmit={true}` excludes field from cleaned submit data but keeps it in `subject` for cross-field validation.

## FormBinding Behavior

Auto-attaches to components with `bindTo` that aren't FormItems:

```typescript
canAttach(context, node, metadata) {
  const bindTo = extractValue(node.props?.bindTo, true);
  const hasValueApiPair = !!metadata?.apis?.value && !!metadata?.apis?.setValue;
  return !!(bindTo && hasValueApiPair && node.type !== "FormItem");
}
```

Wraps in `FormBindingWrapper` — same state management as FormItem (dispatches, subscribes, validates).

## Validation Pipeline

### Stage 1: Sync (preValidate)

Runs in order — stops on first `required` failure:

1. **Required** → `isInputEmpty(value)`
2. **Length** → `minLength`/`maxLength`
3. **Range** → `minValue`/`maxValue`
4. **Pattern** → `"email"`, `"phone"`, `"url"` (built-in regex)
5. **Regex** → custom regex string

Returns `ValidationResult` with `partial: true` if `onValidate` exists.

### Stage 2: Async (custom)

```xml
<FormItem bindTo="username" onValidate="async (value) => {
  const exists = await checkExists(value);
  return exists ? 'Username taken' : true;
}" />
```

Return formats: `true`/`false`, `string` (error message), `SingleValidationResult`, `Array<SingleValidationResult>`.

Debounced via `customValidationsDebounce` prop. Cancelled via `AbortController` on unmount/value change.

### Stage 3: Backend

On submit error with `errorCategory: "GenericBackendError"`:
- `issue.field` defined → mapped to `fieldValidationResults[field]`
- No `field` → added to `generalValidationResults`
- Marked `fromBackend: true`

### ValidationResult

```typescript
type ValidationResult = {
  isValid: boolean;
  validations: SingleValidationResult[];
  validatedValue: any;     // Value that was validated
  partial: boolean;        // true = async pending
};

type SingleValidationResult = {
  isValid: boolean;
  severity: "error" | "warning" | "valid" | "none";
  invalidMessage?: string;
  validMessage?: string;
  async?: boolean;         // From onValidate
  stale?: boolean;         // Previous async result being replaced
  fromBackend?: boolean;   // From API error
};
```

### Validation Display Modes

| Mode | Behavior |
|------|----------|
| `errorLate` (default) | Show on blur; once shown, update per keystroke until valid |
| `onChanged` | Show immediately on any change |
| `onLostFocus` | Show/hide only on blur |

`useValidationDisplay()` hook implements the display timing using InteractionFlags.

## Submission Flow

```
doSubmit()
  1. doValidate() → if errors → dispatch(triedToSubmit) → return
  2. if warnings → show confirmation modal → return
  3. dispatch(formSubmitting)
  4. cleanUpSubject() → remove UNBOUND + noSubmit fields → cleanedData
  5. await onWillSubmit(cleanedData, fullData)
     → false: cancel
     → object: use as dataToSubmit
     → void: use cleanedData
  6. await onSubmit(dataToSubmit)
  7. dispatch(formSubmitted)
  8. persist? delete localStorage
  9. await onSuccess(result)
  10. close modal if applicable
  11. dataAfterSubmit: "reset" | "clear" | "keep"
  CATCH: parse error → dispatch(backendValidationArrived)
```

**All three event handlers (onWillSubmit, onSubmit, onSuccess) are awaited** — return values are observed. This is the exception to the fire-and-forget pattern for XMLUI event handlers.

## FormItem Input Types

| type | Component | Notes |
|------|-----------|-------|
| `text` (default) | TextBox | |
| `password` | TextBox | type="password" |
| `textarea` | TextArea | Multi-line |
| `checkbox` | Toggle | variant="checkbox" |
| `switch` | Toggle | variant="switch" |
| `number` | NumberBox | |
| `integer` | NumberBox | integersOnly=true |
| `file` | FileInput | |
| `select` | Select | |
| `autocomplete` | AutoComplete | |
| `datePicker` | DatePicker | |
| `radioGroup` | RadioGroup | |
| `slider` | Slider | |
| `colorpicker` | ColorPicker | |
| `items` | Items | Array editing via ArrayLikeFormItem |
| `custom` | children | Exposes `$value`, `$setValue`, `$validationResult` |

## Context Variables

| Variable | Provider | Description |
|----------|----------|-------------|
| `$data` | FormWithContextVar | Current form data + `update()` method |
| `$validationIssues` | FormWithContextVar | Map of field → invalid results only |
| `$hasValidationIssue(field?)` | FormWithContextVar | Boolean: any/specific field has errors |
| `$value` | CustomFormItem | Current field value (type="custom" only) |
| `$setValue` | CustomFormItem | Update field value (type="custom" only) |
| `$validationResult` | CustomFormItem | Full validation state (type="custom" only) |

## Form API (registerComponentApi)

| Method | Description |
|--------|-------------|
| `reset()` | Reset to initial state |
| `update(data)` | Update specific fields (dispatches fieldChanged per entry) |
| `validate()` | Run validation, return `{ isValid, data, errors, warnings }` |
| `getData()` | Deep clone of current data |
| `isDirty()` | Any field modified? |

## Key Files

| File | Purpose |
|------|---------|
| `components/Form/FormNative.tsx` | FormState, formReducer, Form, FormWithContextVar (~1000 lines) |
| `components/Form/FormContext.ts` | IFormContext, InteractionFlags, ValidationResult types, useFormContextPart |
| `components/Form/formActions.ts` | FormActionKind enum, action creators |
| `components/Form/Form.tsx` | Component metadata (FormMd) |
| `components/FormItem/FormItemNative.tsx` | FormItem implementation, input type mapping (~600 lines) |
| `components/FormItem/Validations.ts` | FormItemValidator, useValidation, useValidationDisplay |
| `components/FormItem/FormBindingWrapper.tsx` | Direct bindTo wrapping (FormBinding behavior target) |
| `components/FormItem/ValidationWrapper.tsx` | Validation display, auto-animate |
| `components/FormItem/ItemWithLabel.tsx` | Label + input + validation status rendering |
| `components-core/behaviors/FormBindingBehavior.tsx` | Auto-attach bindTo behavior |

## Anti-Patterns

- **Multiple FormItems with same `bindTo`** — field removal deletes shared tracking entries, causing inconsistency
- **Lodash `set()` outside Immer** — mutates in place. Only safe inside `produce()`.
- **Blocking `onValidate`** — expensive sync work blocks the UI. Always use async with debounce.
- **Missing `noSubmit` on confirmation fields** — `confirmPassword` ends up in submit data
- **Relying on `$data` for validation timing** — `$data` excludes noSubmit/unbound fields; use `onWillSubmit(cleanedData, fullData)` for cross-field validation involving excluded fields
