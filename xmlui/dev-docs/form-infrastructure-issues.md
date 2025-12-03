# Form Infrastructure - Known Issues and Code Smells

This document tracks potential bugs, inconsistencies, and code smells identified in the Form/FormItem infrastructure. Items should be addressed or documented with rationale for the current approach.

## Potential Bugs

### 1. Race Condition in Async Validation (Priority: Medium)

**Location:** `src/components/FormItem/Validations.ts` - `useValidation` hook

**Description:** The async validation cleanup doesn't cancel in-flight async operations. The `ignore` flag prevents stale dispatches but the async validation still runs to completion, wasting resources.

```typescript
useEffect(function runAllValidations() {
  let ignore = false;
  // ...
  void (async () => {
    const result = await throttledAsyncValidate(validations, onValidate, deferredValue);
    if (!ignore) {
      dispatch(fieldValidated(bindTo, result));
    }
  })();
  return () => {
    ignore = true;  // Only prevents dispatch, doesn't cancel the async operation
  };
}, [/* deps */]);
```

**Impact:** Resource waste when users type quickly or navigate away. Could cause performance issues with expensive validation operations.

**Proposed Solution:** Use `AbortController` to properly cancel async validations.

---

### 2. Memory Leak in noSubmitFields Tracking (Priority: Low)

**Location:** `src/components/Form/FormNative.tsx` - `formReducer`

**Description:** When a field is removed, its `noSubmitFields` entry is deleted. However, if multiple FormItems share the same `bindTo` and one is removed, the tracking could become inconsistent.

```typescript
case FormActionKind.FIELD_REMOVED: {
  delete state.validationResults[uid];
  delete state.interactionFlags[uid];
  delete state.noSubmitFields[uid];  // What if another FormItem still uses this bindTo?
  break;
}
```

**Impact:** Edge case - only affects forms with multiple FormItems bound to the same field where one has `noSubmit={true}`.

**Proposed Solution:** Reference count fields or track which FormItem instances are using each bindTo.

---

### 3. initialValue vs originalSubject Handling of Falsy Values (Priority: Low)

**Location:** `src/components/FormItem/FormItemNative.tsx`

**Description:** The condition doesn't handle all falsy values correctly:

```typescript
const initialValue =
  (initialValueFromSubject === undefined || initialValueFromSubject === null) 
    ? initialValueFromProps 
    : initialValueFromSubject;
```

**Impact:** `false`, `0`, and `""` from `originalSubject` are used even if developer wants `initialValueFromProps` to override. However, this might be intentional behavior.

**Proposed Solution:** Document the precedence rules or use a more explicit opt-in override mechanism.

---

## Code Smells

### 4. Inconsistent Type Usage (Priority: Low)

**Location:** `src/components/Form/FormNative.tsx` - Props type

```typescript
itemLabelPosition?: string; // type LabelPosition
```

**Recommendation:** Use the actual `LabelPosition` type for type safety.

---

### 5. Magic String for UNBOUND_FIELD_SUFFIX (Priority: Very Low)

**Location:** `src/components/Form/formActions.ts`

```typescript
export const UNBOUND_FIELD_SUFFIX = "__UNBOUND_FIELD__";
```

**Risk:** Could theoretically collide with user-defined field names.

**Recommendation:** Consider a more unique suffix or use Symbol.

---

### 6. Duplicated cleanUpSubject Logic (Priority: Medium)

**Location:** `src/components/Form/FormNative.tsx`

The `cleanUpSubject` function is used in two places with different copy semantics:

```typescript
// In Form component - uses cloneDeep
const getData = useCallback(() => {
  return cloneDeep(cleanUpSubject(formState.subject, formState.noSubmitFields));
}, [formState.subject, formState.noSubmitFields]);

// In FormWithContextVar - uses spread (shallow copy)
const $data = useMemo(() => {
  return { ...cleanUpSubject(formState.subject, formState.noSubmitFields), update: updateData };
}, [formState.subject, formState.noSubmitFields]);
```

**Impact:** Inconsistent deep vs shallow copy could lead to unexpected mutation issues with nested data.

**Recommendation:** Standardize the copy behavior or document the intentional difference.

---

### 7. Proliferation of `any` Types (Priority: Medium)

**Locations:** Multiple files

```typescript
const value = useFormContextPart<any>((value) => getByPath(value?.subject, formItemId));
const initialValue = extractValue(node.props.data);  // returns any
```

**Recommendation:** Gradually introduce stricter types, possibly with generics for form data shape.

---

### 8. Performance Issue with isDirty Computation (Priority: Low)

**Location:** `src/components/Form/FormNative.tsx`

```typescript
const isDirty = useMemo(() => {
  return Object.entries(formState.interactionFlags).some(([key, flags]) => {
    if (flags.isDirty) {
      return true;
    }
    return false;
  });
}, [formState.interactionFlags]);
```

**Impact:** Recalculates on every `interactionFlags` change, even for unrelated fields.

**Recommendation:** Track dirty count in reducer state instead of computing.

---

### 9. Validation Severity "none" Inconsistency (Priority: Very Low)

**Location:** `src/components/FormItem/FormItem.tsx`

```typescript
const filteredValidationSeverityValues = validationSeverityValues.filter(
  (value) => value !== "none",
);
```

**Observation:** `"none"` is filtered out from docs but still exists in the type, suggesting it's internal-only.

**Recommendation:** Consider separate internal vs public types.

---

### 10. Double Submission Possible via Confirmation Modal (Priority: Low)

**Location:** `src/components/Form/FormNative.tsx`

```typescript
<Button onClick={() => doSubmit()} autoFocus={true}>
  Yes, proceed
</Button>
```

**Observation:** `doSubmit()` is called without the event, relying on `event?.preventDefault()` being optional.

**Recommendation:** The current approach works but could be more explicit.

---

### 11. Missing Error Boundaries (Priority: Medium)

**Location:** Form/FormItem components

**Description:** No error boundary handling exists. If a FormItem throws during render, the entire form crashes.

**Recommendation:** Add error boundaries around FormItem rendering with graceful fallback.

---

### 12. Lodash `set()` Mutation Risk (Priority: Low)

**Location:** `src/components/Form/FormNative.tsx`

```typescript
import { cloneDeep, get, set } from "lodash-es";
// set() mutates - safe in Immer draft, risky elsewhere
```

**Observation:** `set()` mutates objects. Safe inside Immer's `produce()` but could cause issues if used elsewhere.

**Recommendation:** Document this constraint or create a wrapper that enforces Immer context.

---

## Resolution Tracking

| Issue # | Status | Resolution | Date |
|---------|--------|------------|------|
| 1 | Fixed | Replaced `ignore` flag with `AbortController` pattern | 2025-12-03 |
| 2 | Open | - | - |
| 3 | Open | - | - |
| 4 | Open | - | - |
| 5 | Open | - | - |
| 6 | Open | - | - |
| 7 | Open | - | - |
| 8 | Open | - | - |
| 9 | Open | - | - |
| 10 | Open | - | - |
| 11 | Open | - | - |
| 12 | Open | - | - |
