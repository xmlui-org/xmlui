# Forms Infrastructure Summary

## Core Architecture

**State Management**: Centralized `formReducer` using Immer manages form state via dispatched actions.

**Key State Objects**:
- `subject`: Form data (key-value pairs by field ID)
- `validationResults`: Per-field validation outcomes
- `interactionFlags`: Per-field user interaction tracking (dirty, focused, blur states)
- `noSubmitFields`: Fields excluded from submission
- `generalValidationResults`: Form-level validation errors

## Component Hierarchy

**Form** → provides FormContext → **FormItem**(s) → wraps input controls

FormContext exposes: `subject`, `validationResults`, `interactionFlags`, `dispatch`, `enabled`, label props

## Data Flow

1. **Initialization**: `fieldInitialized` action sets initial values, registers noSubmit flag
2. **User Input**: `fieldChanged` action updates `subject[fieldId]`, marks field dirty
3. **Validation**: `fieldValidated` action stores validation results (supports async, partial, backend validations)
4. **Focus Tracking**: `fieldFocused`/`fieldLostFocus` actions track interaction state for validation display logic
5. **Submit**: 
   - `triedToSubmit` forces validation display on all fields
   - `formSubmitting` sets submit-in-progress flag
   - Filters out unbound fields (suffix `__UNBOUND_FIELD__`) and noSubmit fields via `cleanUpSubject()`
   - Calls `onWillSubmit` (can cancel), then `onSubmit`, then `onSuccess`
   - On success: closes modal (if applicable), resets form if initial data was empty
   - On error: `backendValidationArrived` action populates field/general validation results
   - `formSubmitted` clears interaction flags and backend validations

## FormItem Mechanics

- **Binding**: `bindTo` prop creates field ID (supports nested arrays via parent context + itemIndex)
- **Control Types**: Maps to TextBox, NumberBox, Select, Toggle, DatePicker, etc.
- **Validation Modes**: `errorLate` (default), `onChanged`, `onLostFocus` control when errors display
- **Context Variables**: Exposes `$value`, `$setValue`, `$validationResult` for custom controls
- **Validation Display**: Based on interaction flags + validation mode (e.g., show errors after first dirty blur)

## Validation System

**Built-in**: required, minLength/maxLength, minValue/maxValue, pattern, regex (with custom messages/severity)

**Custom**: `validate` event handler returns boolean/SingleValidationResult/array

**Backend**: Errors from API mapped to field-level or general validations via `GenericBackendError.details.issues`

**Partial Validation**: Async validations marked as stale while awaiting results

## Key Features

- **Dirty Tracking**: Per-field `isDirty` flag
- **Modal Integration**: Auto-close on successful submit (unless `keepModalOpenOnSubmit`)
- **Warning Confirmation**: Modal prompts before submit if warnings present
- **Reset**: `formReset` action clears all state (triggered by reset button or auto on success for empty initial data)
- **APIs**: Form exposes `reset()`, `update(data)` methods; FormItem exposes `addItem()`, `removeItem()` for array-like fields
- **Context Variable**: `$data` exposes cleaned form data + `update()` method throughout form

---

## New Feature: Validate-Only Mode (Multi-Action Forms)

### Use Case
Forms where multiple operations can be performed on the same validated data (e.g., calculate perimeter vs. area of a triangle). Each button triggers different logic but requires the same validation.

### Architecture Changes

#### ✅ IMPLEMENTED: New Form API Method
- **`validate()`**: `Promise<{ isValid: boolean, data: Record<string, any>, errors: ValidationResult[], warnings: ValidationResult[], validationResults: Record<string, ValidationResult> }>`
  - Manually triggers validation without submitting
  - Shows all validation errors (via `triedToSubmit` action)
  - Returns validation state + cleaned data
  - Returns separate arrays for errors and warnings
  - Includes full validation results for detailed inspection
  - Does NOT call `onWillSubmit` or `onSubmit` handlers
  - Does NOT close modal or reset form
  - Does NOT modify form submission state

#### Implementation Details

**Validation Logic Extraction**: The validation logic has been extracted from `doSubmit` into a separate `doValidate` function that:
1. Dispatches `triedToSubmit` action to force validation display on all fields
2. Groups validation results by severity (errors vs warnings)
3. Cleans the form data (removes unbound fields and noSubmit fields)
4. Returns comprehensive validation result object

**Reusability**: The `doSubmit` function now uses `doValidate` internally, ensuring consistent validation behavior between manual validation and form submission.

**API Registration**: The `validate` method is registered via `registerComponentApi` alongside `reset` and `update`, making it accessible through component refs and XMLUI's API system.

### XMLUI Markup Example - Triangle Calculator

```xml
<Form 
  ref="triangleForm"
  hideButtonRow="true"
  itemLabelPosition="top"
>
  <FormItem 
    bindTo="sideA" 
    type="number" 
    label="Side A"
    required="true"
    minValue="0.1"
    rangeInvalidMessage="Side must be positive"
  />
  
  <FormItem 
    bindTo="sideB" 
    type="number" 
    label="Side B"
    required="true"
    minValue="0.1"
    rangeInvalidMessage="Side must be positive"
  />
  
  <FormItem 
    bindTo="sideC" 
    type="number" 
    label="Side C"
    required="true"
    minValue="0.1"
    rangeInvalidMessage="Side must be positive"
  >
    <validate>
      // Custom validation: Triangle inequality theorem
      const { sideA, sideB, sideC } = $data;
      if (sideA + sideB <= sideC || 
          sideA + sideC <= sideB || 
          sideB + sideC <= sideA) {
        return {
          isValid: false,
          severity: "error",
          invalidMessage: "These sides cannot form a valid triangle"
        };
      }
      return true;
    </validate>
  </FormItem>
  
  <HStack gap="$space-3" marginTop="$space-4">
    <Button onClick="calculatePerimeter">
      Calculate Perimeter
    </Button>
    
    <Button onClick="calculateArea">
      Calculate Area
    </Button>
  </HStack>
  
  <Text if="{$result}" marginTop="$space-3">
    Result: {$result}
  </Text>
  
  <script>
    async function calculatePerimeter() {
      const validation = await $refs.triangleForm.validate();
      if (!validation.isValid) return;
      
      const { sideA, sideB, sideC } = validation.data;
      $result = `Perimeter: ${sideA + sideB + sideC}`;
    }
    
    async function calculateArea() {
      const validation = await $refs.triangleForm.validate();
      if (!validation.isValid) return;
      
      const { sideA, sideB, sideC } = validation.data;
      const s = (sideA + sideB + sideC) / 2; // semi-perimeter
      const area = Math.sqrt(s * (s - sideA) * (s - sideB) * (s - sideC));
      $result = `Area: ${area.toFixed(2)}`;
    }
  </script>
</Form>
```
