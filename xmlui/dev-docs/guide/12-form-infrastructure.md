# Form Infrastructure

XMLUI's form system provides automatic data management, validation, and submission for user input. Instead of wiring up value/onChange pairs manually, developers declare `bindTo` paths and the framework handles state synchronization, validation timing, backend error mapping, and submission lifecycle. Under the hood it is a `useReducer`-based state machine backed by Immer, with a context-selector optimization that prevents render cascades across dozens of fields.

Understanding the form infrastructure matters for framework developers because it touches behaviors (FormBinding), the reducer pattern shared with containers, context variable injection, and the event handler exception where form handlers are awaited rather than fire-and-forget.

<!-- DIAGRAM: Form architecture — FormWithContextVar → Form → FormContext → FormItem → Input + Validation -->

---

## The Architecture at a Glance

The form system has a clear ownership hierarchy:

1. **FormWithContextVar** (renderer) — creates the `useReducer(formReducer, initialState)` and exposes `$data`, `$validationIssues`, and `$hasValidationIssue` as context variables
2. **Form** (FormNative) — renders the HTML `<form>` element, wraps children in `FormContext.Provider`, manages the button row (Save/Cancel/Reset), and orchestrates submission
3. **FormItem** (FormItemNative) — subscribes to specific slices of FormContext, dispatches field-level actions, runs the validation pipeline, and renders the appropriate input component with label and validation feedback

**Key design principle:** Form owns ALL state via a single reducer. FormItems are stateless consumers — they dispatch actions and read context slices. There is no field-level state.

---

## FormState: The Single Source of Truth

All form state lives in one structure managed by Immer's `produce()`:

```typescript
interface FormState {
  subject: any;                                         // Current form data (nested object)
  validationResults: Record<string, ValidationResult>;  // Per-field validation
  generalValidationResults: SingleValidationResult[];   // Form-level errors (no field)
  interactionFlags: Record<string, InteractionFlags>;   // Per-field UI tracking
  noSubmitFields: Record<string, boolean>;              // Fields excluded from submit
  submitInProgress?: boolean;                           // True while onSubmit executing
  resetVersion?: number;                                // Increments on reset → key-based re-mount
}
```

The `subject` is the form's data object. `subject.email` holds the email field value. Nested paths like `address.city` are supported via Lodash `get()`/`set()` — the `set()` calls mutate in place, which is safe inside Immer's `produce()` but dangerous elsewhere.

### The Reducer

The form reducer handles 11 action types (defined in `FormActionKind` enum):

| Action | Trigger | Effect |
|--------|---------|--------|
| `FIELD_INITIALIZED` | FormItem mounts | Sets initial value (unless already dirty), tracks noSubmit flag |
| `FIELD_VALUE_CHANGED` | User types | `set(state.subject, uid, value)`, marks `isDirty: true` |
| `FIELD_VALIDATED` | Validation completes | Stores `ValidationResult`, handles partial flag for async |
| `FIELD_FOCUSED` | Input gains focus | Snapshots `isValidOnFocus` |
| `FIELD_LOST_FOCUS` | Input loses focus | Sets `afterFirstDirtyBlur`, clears `invalidToValid` |
| `FIELD_REMOVED` | FormItem unmounts | Deletes validation, interaction, and noSubmit entries |
| `TRIED_TO_SUBMIT` | Submit clicked with errors | Sets `forceShowValidationResult: true` on ALL fields |
| `SUBMITTING` | doSubmit starts | `submitInProgress = true` |
| `SUBMITTED` | doSubmit succeeds | Clears interaction flags, removes backend validation errors |
| `BACKEND_VALIDATION_ARRIVED` | API returns errors | Maps `issue.field` → field results; no field → general results |
| `RESET` | Reset button | Returns fresh initial state, increments `resetVersion` |

The `resetVersion` increment is a clever trick: the Form renders with `key={formState.resetVersion}`, so incrementing it forces React to unmount and remount the entire form, clearing all uncontrolled input state.

---

## Interaction Flags: The Validation Timing Engine

Each field tracks detailed interaction state:

```typescript
type InteractionFlags = {
  isDirty: boolean;                  // Value changed from initial
  invalidToValid: boolean;           // Was invalid, just became valid (shows brief "valid" message)
  isValidOnFocus: boolean;           // Snapshot of validity when focused
  isValidLostFocus: boolean;         // Snapshot of validity when blurred
  focused: boolean;                  // Currently has focus
  afterFirstDirtyBlur: boolean;      // Lost focus after first edit
  forceShowValidationResult: boolean; // Submit attempted → show everything
};
```

These flags exist to implement the **"late error" pattern** — a UX research-backed approach where errors appear as late as possible to avoid frustrating users while they're actively typing valid input, but once shown, errors clear immediately when fixed.

The `useValidationDisplay` hook consumes these flags and the current validation mode to decide whether to show feedback:

| Mode | Behavior |
|------|----------|
| `errorLate` (default) | Show errors on first blur after editing; once shown, update per keystroke until valid |
| `onChanged` | Show immediately on any change |
| `onLostFocus` | Show/hide only when field loses focus |

---

## FormContext and the Performance Problem

### The Problem

A form with 100 fields using standard `useContext` would re-render all 100 FormItems on every keystroke in any field — O(n) re-renders per character typed.

### The Solution

Form uses the `use-context-selector` library. Each FormItem subscribes only to the specific slice of context it needs:

```typescript
// Only re-renders when THIS field's value changes
const value = useFormContextPart(ctx => getByPath(ctx?.subject, bindTo));
const validationResult = useFormContextPart(ctx => ctx?.validationResults[bindTo]);
const flags = useFormContextPart(ctx => ctx?.interactionFlags[bindTo]);
```

The `useFormContextPart` wrapper around `useContextSelector` is the critical performance optimization that makes large forms viable.

### What FormContext Contains

```typescript
interface IFormContext {
  subject: Record<string, any>;           // Current data
  originalSubject: Record<string, any>;   // Initial data (for isDirty comparison)
  validationResults: Record<string, ValidationResult>;
  interactionFlags: Record<string, InteractionFlags>;
  dispatch: Dispatch<FormAction>;
  enabled?: boolean;
  itemLabelWidth?: string;                // Fixed label width for alignment
  itemLabelBreak?: boolean;               // Allow label text wrapping
  itemLabelPosition?: string;             // "top" | "start" | "end" | "float"
  itemRequireLabelMode?: RequireLabelMode;
  verboseValidationFeedback?: boolean;
  validationIconSuccess?: string;
  validationIconError?: string;
}
```

---

## Data Binding

### The bindTo Property

Links a FormItem to a path in the form's `subject`:

```xml
<FormItem bindTo="email" />           <!-- subject.email -->
<FormItem bindTo="address.city" />    <!-- subject.address.city -->
<FormItem bindTo="items[0].name" />   <!-- subject.items[0].name -->
```

Nested path resolution uses Lodash `get()` for reading and `set()` for writing (inside the Immer-wrapped reducer).

### Unbound and NoSubmit Fields

- **Unbound:** Fields without `bindTo` get a synthetic ID (`${defaultId}__UNBOUND_FIELD__`). Filtered out before submit.
- **NoSubmit:** `noSubmit={true}` keeps the field in `subject` (accessible for cross-field validation) but excludes it from the cleaned submit data.

### FormBinding Behavior

Components that aren't FormItems but have a `bindTo` prop are automatically wrapped by the `FormBindingBehavior`. The behavior checks:

1. Component has `bindTo` prop
2. Component metadata exposes both `value` and `setValue` APIs
3. Component is not already a FormItem

If all conditions met, it wraps the component in `FormBindingWrapper`, which provides the same state management as FormItem — dispatches, subscriptions, validation.

---

## Validation Pipeline

Validation runs in three stages, from fast to slow:

### Stage 1: Sync Pre-Validation

`FormItemValidator.preValidate()` runs built-in validators in order:

1. **Required** — `isInputEmpty(value)`. If empty and required, stops here.
2. **Length** — `minLength`/`maxLength` string length
3. **Range** — `minValue`/`maxValue` numeric comparison
4. **Pattern** — built-in patterns: `"email"`, `"phone"`, `"url"`
5. **Regex** — custom regex string

Each validator can specify `severity` (`"error"`, `"warning"`) and custom `invalidMessage`. Returns a `ValidationResult` with `partial: true` if an async `onValidate` handler exists.

### Stage 2: Async Custom Validation

The `onValidate` event handler runs after sync validators pass:

```xml
<FormItem bindTo="username" onValidate="async (value) => {
  const exists = await checkExists(value);
  return exists ? 'Username taken' : true;
}" />
```

Return formats: `true`/`false`, `string` (error message), `SingleValidationResult`, or `Array<SingleValidationResult>`.

Debounced via `customValidationsDebounce` prop. Previous async results are marked `stale: true` while new validation runs, allowing the UI to dim outdated messages. Cancelled via `AbortController` on unmount or value change.

### Stage 3: Backend Validation

After submission fails, if the error has shape `{ errorCategory: "GenericBackendError", details: { issues: [...] } }`:

- Issues with `field` property → mapped to `fieldValidationResults[field]`
- Issues without `field` → added to `generalValidationResults`
- All marked `fromBackend: true`

### Validation Types

```typescript
type ValidationResult = {
  isValid: boolean;
  validations: SingleValidationResult[];
  validatedValue: any;     // The value that was validated
  partial: boolean;        // true = async validation still pending
};

type SingleValidationResult = {
  isValid: boolean;
  severity: "error" | "warning" | "valid" | "none";
  invalidMessage?: string;
  validMessage?: string;
  async?: boolean;         // From onValidate handler
  stale?: boolean;         // Previous async result being replaced
  fromBackend?: boolean;   // From API error response
};
```

The `partial` flag is key: when `true`, the Save button shows "Validating..." and disables, preventing submission while async validation is in flight.

---

## Submission Flow

The `doSubmit` function in FormNative orchestrates the full submission lifecycle:

1. **Validate** — runs `doValidate()`. If errors exist → `dispatch(triedToSubmit)` (forces all validation visible) → abort
2. **Check warnings** — if only warnings → show confirmation modal → wait for user
3. **Start submit** — `dispatch(formSubmitting)` → `submitInProgress = true`
4. **Clean data** — `cleanUpSubject()` removes unbound and noSubmit fields → `cleanedData`
5. **onWillSubmit** — `await onWillSubmit(cleanedData, fullData)`
   - Returns `false` → cancel submission
   - Returns object → use that object as submit data
   - Returns void → continue with `cleanedData`
6. **onSubmit** — `await onSubmit(dataToSubmit)`
7. **Finish** — `dispatch(formSubmitted)`, delete persisted localStorage, `await onSuccess(result)`
8. **Post-submit** — `dataAfterSubmit` controls: `"keep"` (default), `"reset"`, or `"clear"`
9. **Error handling** — catch block parses `GenericBackendError` → `dispatch(backendValidationArrived)`

**Critical:** All three event handlers (`onWillSubmit`, `onSubmit`, `onSuccess`) are **awaited** and their return values are observed. This is the exception to the general XMLUI pattern where event handlers are fire-and-forget.

The `cleanUpSubject` vs `cleanUpSubjectForWillSubmit` distinction matters: `onWillSubmit` receives both cleaned data (excluding noSubmit fields) AND full data (including them), so cross-field validation involving noSubmit fields is possible.

---

## FormItem Input Types

FormItem uses a large switch statement to map the `type` prop to an input component:

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
| `autocomplete` | AutoComplete | Searchable select |
| `datePicker` | DatePicker | |
| `radioGroup` | RadioGroup | |
| `slider` | Slider | |
| `colorpicker` | ColorPicker | |
| `items` | Items | Array editing via ArrayLikeFormItem |
| `custom` | children | Exposes `$value`, `$setValue`, `$validationResult` context vars |

Each control receives: `value`, `updateState({value})` callback, `onFocus`/`onBlur` dispatchers, `enabled`, `validationStatus`, and `invalidMessages`.

For `type="items"`, nested FormItems construct paths automatically: parent `"contacts"` + index `0` + child `"name"` → `"contacts[0].name"`.

---

## Context Variables

### Form-Level

| Variable | Description |
|----------|-------------|
| `$data` | Current form data object + `update()` method for programmatic changes |
| `$validationIssues` | Map of field → only invalid `SingleValidationResult[]` |
| `$hasValidationIssue(field?)` | Without arg: any field has errors. With arg: specific field has errors |

### Custom FormItem (type="custom")

| Variable | Description |
|----------|-------------|
| `$value` | Current field value |
| `$setValue` | Function to update field value |
| `$validationResult` | Full validation state for this field |

---

## Form API

Exposed via `registerComponentApi`:

| Method | Description |
|--------|-------------|
| `reset()` | Reset to initial state (increments `resetVersion` → full re-mount) |
| `update(data)` | Update specific fields — dispatches `fieldChanged` per entry |
| `validate()` | Run validation without submitting. Returns `{ isValid, data, errors, warnings }` |
| `getData()` | Deep clone of current form data |
| `isDirty()` | Whether any field has been modified |

Usage in markup: `<Button onClick="myForm.reset()" />` or `<Button onClick="myForm.update({ status: 'draft' })" />`

---

## Persistence

Form supports automatic localStorage persistence:

- `persist={true}` — saves form data on every change
- `storageKey` — custom localStorage key (defaults to form ID)
- `doNotPersistFields` — array of bindTo names to exclude
- `keepOnCancel` — whether to keep persisted data when user cancels
- On successful submit, persisted data is deleted

---

## Known Issues

See `xmlui/dev-docs/form-infrastructure-issues.md` for tracked issues:

- **Async validation race condition** — `ignore` flag prevents stale dispatches but doesn't cancel in-flight async operations. Should use `AbortController`.
- **Multiple FormItems with same `bindTo`** — field removal deletes shared tracking entries, causing inconsistency.
- **Falsy initial values** — edge case handling for `0`, `false`, `""` in initialValue vs originalSubject.

---

## Key Takeaways

- **Single-reducer architecture** — Form owns all state. FormItems are stateless dispatchers/subscribers. No field-level state.
- **Context selectors are critical** — `useFormContextPart` prevents O(n) re-renders. Without it, large forms would be unusable.
- **Validation is three-stage** — sync built-in → async custom → backend errors. The `partial` flag bridges the gap between instant and deferred results.
- **InteractionFlags drive display timing** — seven boolean flags implement sophisticated "late error" UX. The `errorLate` default mode is research-backed.
- **Form handlers are the awaited exception** — `onWillSubmit`, `onSubmit`, `onSuccess` are all awaited with return values observed. `onWillSubmit` returning `false` cancels; returning an object replaces the data.
- **FormBinding behavior auto-wraps** — components with `bindTo` + `value`/`setValue` APIs get FormItem-like binding automatically, without explicit `<FormItem>` wrapper.
- **Reset via key** — `resetVersion` increments → React unmounts/remounts → all uncontrolled state cleared.
- **Backend errors map to fields** — `GenericBackendError` issues with `field` property display on the correct FormItem; issues without `field` appear in the form-level validation summary.
