# Form Infrastructure Extension Plan

## Executive Summary

This document outlines a plan to extend XMLUI's form infrastructure to support validation-only scenarios and provide additional helpful exposed methods. The proposed changes maintain backward compatibility while enabling new use cases such as trigger-based validation without form submission.

---

## 1. Current Architecture Analysis

### 1.1 Form State Management

The form system uses React's `useReducer` with Immer for immutable state updates. The `FormState` interface includes:

```typescript
interface FormState {
  subject: Record<string, any>;              // Current field values
  originalSubject: Record<string, any>;      // Initial values for reset
  validationResults: Record<string, ValidationResult>;
  generalValidationResults: SingleValidationResult[];
  interactionFlags: Record<string, InteractionFlags>;
  noSubmitFields: Record<string, boolean>;   // Fields excluded from submission
  submitInProgress: boolean;
  resetVersion: number;
}
```

### 1.2 Form Actions

Available actions (FormActionKind enum):
- `FIELD_INITIALIZED` - Field registers with form
- `FIELD_VALUE_CHANGED` - Field value updates
- `FIELD_FOCUSED` / `FIELD_LOST_FOCUS` - Focus tracking
- `FIELD_VALIDATED` - Validation results arrive
- `FIELD_REMOVED` - Field unregisters
- `TRIED_TO_SUBMIT` - Submit attempted (triggers validation display)
- `FORM_SUBMITTING` / `FORM_SUBMITTED` - Submission lifecycle
- `FORM_RESET` - Reset to original values
- `BACKEND_VALIDATION_ARRIVED` - Server-side validation errors

### 1.3 Validation System

**FormItemValidator class** provides:
- `preValidate()` - Synchronous validations (required, length, range, pattern, regex)
- `validate()` - Full validation including async custom validators
- Built-in validators: required, minLength, maxLength, minValue, maxValue, pattern (email/phone/url), regex
- Custom async validators via `onValidate` prop

**Validation modes**:
- `errorLate` (default) - Show errors on blur, keep showing while typing if invalid
- `onChanged` - Show errors immediately on every keystroke
- `onLostFocus` - Show/hide errors only on blur

**Validation flow**:
1. FormItem dispatches field value changes
2. `useValidation` hook runs `preValidate()` (sync) immediately
3. Dispatches partial validation result to form
4. If custom `onValidate` exists, runs async validation (throttled)
5. Dispatches final validation result to form

### 1.4 Current Exposed API Methods

**Form component exposes only 2 methods**:
```typescript
reset: () => void              // Reset form to originalSubject
update: (data: any) => void    // Update form data programmatically
```

**Form events**:
- `willSubmit` - Before submission (can be used for processing)
- `submit` - Form submission (receives cleaned data)
- `success` - Successful submission
- `cancel` - Form cancelled
- `reset` - Form reset

### 1.5 Submission Flow

```typescript
const doSubmit = async () => {
  // 1. Check all fields valid
  const isAllValid = Object.values(state.validationResults).every(v => v.isValid);
  
  // 2. Fire willSubmit event
  await willSubmit?.(state.subject);
  
  // 3. Clean subject (remove UNBOUND and noSubmit fields)
  const cleanedSubject = cleanUpSubject(state.subject, state.noSubmitFields);
  
  // 4. Fire submit event
  const backendValidationResult = await submit?.(cleanedSubject);
  
  // 5. Handle backend validation errors if any
  if (backendValidationResult) {
    dispatch(backendValidationArrived(backendValidationResult));
  } else {
    success?.();
  }
};
```

---

## 2. Missing Capabilities & Gaps

### 2.1 Validation-Only Use Cases

**Current limitation**: The form infrastructure tightly couples validation with submission.

**Desired scenarios**:
1. **Trigger-based validation**: User clicks a button/link that validates form data and processes it without HTTP submission
   - Example: Multi-step wizards where "Next" validates current step
   - Example: Preview functionality that needs validated data
   - Example: Complex calculations requiring valid inputs

2. **Partial validation**: Validate specific fields or sections without full form submission
   - Example: "Check availability" button validates username field only

3. **Conditional submission paths**: Based on validation results, different actions (not just submit)
   - Example: If valid → show preview dialog, if invalid → highlight errors

### 2.2 Missing Exposed Methods

**Critical gaps**:
1. **No way to validate programmatically** - Can't trigger validation from outside form
2. **No access to validation state** - Can't check if form is valid without submitting
3. **No getData() method** - Can't get current form data (including cleaned data)
4. **No getDirtyFields()** - Can't detect which fields changed
5. **No setFieldValue()** - Limited ability to set individual field values programmatically
6. **No markFieldDirty()** - Can't force validation display on specific fields
7. **No getFieldValue()** - Can't read individual field values from outside

**Current workaround**: Developers must use `willSubmit` event and preventDefault-style patterns, which is non-intuitive.

---

## 3. Proposed Extensions

### 3.1 New Exposed API Methods

Add comprehensive API methods to Form component:

```typescript
// Validation control
validate: () => Promise<ValidationReport>
validateFields: (fieldNames: string[]) => Promise<ValidationReport>
showValidation: (fieldNames?: string[]) => void

// State access
isValid: () => boolean
isDirty: () => boolean
getData: () => any  // Returns cleaned subject
getRawData: () => any  // Returns full subject including noSubmit
getFieldValue: (fieldName: string) => any
getValidationResults: () => Record<string, ValidationResult>

// State mutation
setFieldValue: (fieldName: string, value: any) => void
setData: (data: any) => void  // Alias for existing update()
markFieldDirty: (fieldName: string) => void
clearFieldValidation: (fieldName: string) => void

// Existing methods (keep for compatibility)
reset: () => void
update: (data: any) => void  // Keep existing name
```

**ValidationReport interface**:
```typescript
interface ValidationReport {
  isValid: boolean;
  fieldResults: Record<string, ValidationResult>;
  errorCount: number;
  warningCount: number;
  invalidFields: string[];
}
```

### 3.2 New Form Event: `validate`

Add `validate` event alongside existing events:

```typescript
<Form
  validate={(data) => {
    // User-defined validation + processing logic
    // Can perform actions without submission
    // Return value: undefined (valid) or validation errors
  }}
  submit={(data) => {
    // Existing submit handler
  }}
/>
```

**Use case example**:
```xml
<Form
  validate={(data) => {
    // Validate and show preview without submitting
    showPreviewDialog(data);
  }}
>
  <FormItem bindTo="name" required />
  <FormItem bindTo="email" pattern="email" />
  
  <Button onClick={($formApi) => $formApi.validate()}>
    Preview
  </Button>
  <Button type="submit">
    Submit
  </Button>
</Form>
```

### 3.3 New FormActionKind: `VALIDATE_TRIGGERED`

Add action to support programmatic validation:

```typescript
export enum FormActionKind {
  // ... existing actions
  VALIDATE_TRIGGERED = "VALIDATE_TRIGGERED",
}

export function validateTriggered(fieldNames?: string[]) {
  return {
    type: FormActionKind.VALIDATE_TRIGGERED,
    payload: { fieldNames },
  };
}
```

**Reducer behavior**:
- Sets `forceShowValidationResult: true` for specified fields (or all if none specified)
- Does NOT submit the form

---

## 4. Implementation Strategy

### 4.1 Phase 1: Validation State Access (Low Risk)

**Goal**: Expose read-only methods to access current form state

**Changes**:
1. Add methods to FormNative.tsx:
   ```typescript
   const isValid = useCallback(() => {
     return Object.values(state.validationResults).every(v => v.isValid);
   }, [state.validationResults]);

   const isDirty = useCallback(() => {
     return Object.values(state.interactionFlags).some(f => f.isDirty);
   }, [state.interactionFlags]);

   const getData = useCallback(() => {
     return cleanUpSubject(state.subject, state.noSubmitFields);
   }, [state.subject, state.noSubmitFields]);

   const getRawData = useCallback(() => {
     return { ...state.subject };
   }, [state.subject]);

   const getFieldValue = useCallback((fieldName: string) => {
     return state.subject[fieldName];
   }, [state.subject]);

   const getValidationResults = useCallback(() => {
     return { ...state.validationResults };
   }, [state.validationResults]);
   ```

2. Register in formApi:
   ```typescript
   registerApi(formId, {
     reset,
     update,
     isValid,
     isDirty,
     getData,
     getRawData,
     getFieldValue,
     getValidationResults,
   });
   ```

3. Update Form.tsx metadata to expose new methods

**Risk**: Very low - read-only methods, no state mutations

**Testing**: Unit tests + e2e tests for each method

---

### 4.2 Phase 2: Programmatic Validation (Medium Risk)

**Goal**: Allow triggering validation without submission

**Changes**:
1. Add `VALIDATE_TRIGGERED` action to formActions.ts
2. Update reducer to handle `VALIDATE_TRIGGERED`:
   ```typescript
   case FormActionKind.VALIDATE_TRIGGERED: {
     const fieldNames = action.payload.fieldNames;
     if (fieldNames) {
       fieldNames.forEach(name => {
         if (state.interactionFlags[name]) {
           state.interactionFlags[name].forceShowValidationResult = true;
         }
       });
     } else {
       Object.values(state.interactionFlags).forEach(flags => {
         flags.forceShowValidationResult = true;
       });
     }
     break;
   }
   ```

3. Add validation methods to FormNative.tsx:
   ```typescript
   const validate = useCallback(async () => {
     dispatch(validateTriggered());
     
     // Wait for validation to complete
     // Return validation report
     const report: ValidationReport = {
       isValid: Object.values(state.validationResults).every(v => v.isValid),
       fieldResults: { ...state.validationResults },
       errorCount: Object.values(state.validationResults)
         .filter(v => !v.isValid && v.validations.some(s => s.severity === 'error'))
         .length,
       warningCount: Object.values(state.validationResults)
         .filter(v => v.validations.some(s => !s.isValid && s.severity === 'warning'))
         .length,
       invalidFields: Object.entries(state.validationResults)
         .filter(([_, v]) => !v.isValid)
         .map(([name, _]) => name),
     };
     
     return report;
   }, [state, dispatch]);

   const showValidation = useCallback((fieldNames?: string[]) => {
     dispatch(validateTriggered(fieldNames));
   }, [dispatch]);

   const validateFields = useCallback(async (fieldNames: string[]) => {
     dispatch(validateTriggered(fieldNames));
     // Similar to validate() but for specific fields
   }, [state, dispatch]);
   ```

4. Add to formApi and Form.tsx metadata

**Risk**: Medium - modifies reducer, state synchronization concerns

**Testing**: 
- E2e tests for validate() method
- Test validate event handler
- Test interaction with existing validation modes
- Test partial validation (validateFields)

---

### 4.3 Phase 3: State Mutation Methods (Higher Risk)

**Goal**: Allow programmatic field value changes and dirty flag control

**Changes**:
1. Add actions:
   ```typescript
   export function fieldValueSet(uid: string, value: any) {
     return {
       type: FormActionKind.FIELD_VALUE_SET,
       payload: { uid, value },
     };
   }

   export function fieldMarkedDirty(uid: string) {
     return {
       type: FormActionKind.FIELD_MARKED_DIRTY,
       payload: { uid },
     };
   }

   export function fieldValidationCleared(uid: string) {
     return {
       type: FormActionKind.FIELD_VALIDATION_CLEARED,
       payload: { uid },
     };
   }
   ```

2. Update reducer to handle new actions

3. Add methods:
   ```typescript
   const setFieldValue = useCallback((fieldName: string, value: any) => {
     dispatch(fieldValueSet(fieldName, value));
   }, [dispatch]);

   const setData = useCallback((data: any) => {
     update(data); // Reuse existing logic
   }, [update]);

   const markFieldDirty = useCallback((fieldName: string) => {
     dispatch(fieldMarkedDirty(fieldName));
   }, [dispatch]);

   const clearFieldValidation = useCallback((fieldName: string) => {
     dispatch(fieldValidationCleared(fieldName));
   }, [dispatch]);
   ```

**Risk**: Higher - direct state mutations, could bypass normal field lifecycle

**Considerations**:
- setFieldValue should trigger validation
- Should update work with noSubmit fields?
- Does setFieldValue mark field as dirty?

**Testing**:
- Comprehensive e2e tests for each mutation
- Test interaction with FormItem components
- Test validation triggering
- Test dirty flag behavior

---

### 4.4 Phase 4: Validate Event Handler (Low Risk)

**Goal**: Allow users to define validation-only handlers

**Changes**:
1. Add `validate` prop to Form metadata in Form.tsx:
   ```typescript
   validate: {
     description: "Event handler for validation-only scenarios. Called when validate() is invoked programmatically. Can be used for preview, multi-step wizards, etc.",
     type: MetadataType.EVENT_HANDLER,
     typeDescriptor: { 
       parameterTypes: [{ name: "data", type: "any" }],
       returnType: "Promise<BackendValidationResult> | void"
     },
   }
   ```

2. Update FormNative.tsx to call validate handler:
   ```typescript
   const doValidate = async () => {
     const isAllValid = Object.values(state.validationResults).every(v => v.isValid);
     if (!isAllValid) {
       dispatch(validateTriggered()); // Show errors
       return;
     }

     const cleanedSubject = cleanUpSubject(state.subject, state.noSubmitFields);
     const backendValidationResult = await validate?.(cleanedSubject);
     
     if (backendValidationResult) {
       dispatch(backendValidationArrived(backendValidationResult));
     }
   };
   
   // Update validate() method to call doValidate
   ```

3. Wire validate event in FormWithContextVar

**Risk**: Low - similar to existing submit event pattern

**Testing**:
- E2e test with validate handler
- Test backend validation errors via validate
- Test validate + submit in same form

---

## 5. Backward Compatibility

All changes are **backward compatible**:

1. **No breaking changes** - All existing Form/FormItem props remain unchanged
2. **Optional new methods** - New API methods are additions, not replacements
3. **Optional validate event** - Forms without validate handler work as before
4. **Existing events unchanged** - submit, willSubmit, success, etc. work identically

**Migration path**: None required. Existing forms continue to work without changes.

---

## 6. Documentation Requirements

### 6.1 API Reference Updates

Update Form component documentation with:
- Complete API method reference with examples
- ValidationReport interface documentation
- validate event handler documentation

### 6.2 How-To Guides

Create new guides:
1. **"How to validate without submitting"** - Using validate() and validate event
2. **"How to build multi-step wizards"** - Using partial validation
3. **"How to access form state programmatically"** - Using getData(), isValid(), etc.
4. **"How to control validation display"** - Using showValidation(), markFieldDirty()

### 6.3 Migration Examples

Provide before/after examples for common patterns:
- Preview functionality
- Multi-step forms
- Conditional validation

---

## 6.4 XMLUI Markup Examples

### Example 1: Triangle Area Calculator

**Scenario**: Collect three side lengths, validate they form a valid triangle, and calculate the area when a button is clicked (no form submission).

```xml
<Form id="triangleForm">
  <FormItem 
    bindTo="sideA" 
    label="Side A" 
    type="number" 
    required 
    minValue={0.1}
    rangeInvalidMessage="Side length must be positive"
  />
  <FormItem 
    bindTo="sideB" 
    label="Side B" 
    type="number" 
    required 
    minValue={0.1}
    rangeInvalidMessage="Side length must be positive"
  />
  <FormItem 
    bindTo="sideC" 
    label="Side C" 
    type="number" 
    required 
    minValue={0.1}
    rangeInvalidMessage="Side length must be positive"
  />

  <Button 
    onClick={async ($formApi) => {
      const report = await $formApi.validate();
      
      if (!report.isValid) {
        return; // Validation errors will be displayed
      }
      
      const data = $formApi.getData();
      const { sideA, sideB, sideC } = data;
      
      // Triangle inequality theorem validation
      if (sideA + sideB <= sideC || sideA + sideC <= sideB || sideB + sideC <= sideA) {
        $showDialog({
          title: "Invalid Triangle",
          message: "These side lengths cannot form a valid triangle. The sum of any two sides must be greater than the third side."
        });
        return;
      }
      
      // Calculate area using Heron's formula
      const s = (sideA + sideB + sideC) / 2;
      const area = Math.sqrt(s * (s - sideA) * (s - sideB) * (s - sideC));
      
      $showDialog({
        title: "Triangle Area",
        message: `The area of the triangle is ${area.toFixed(2)} square units.`
      });
    }}
  >
    Calculate Area
  </Button>
</Form>
```

**Key features demonstrated**:
- Using `validate()` to trigger validation without submission
- Using `getData()` to access form values
- Custom validation logic (triangle inequality)
- Processing validated data without backend submission

---

### Example 2: Multi-Step Wizard

**Scenario**: A three-step registration wizard where each step validates before proceeding.

```xml
<Stack id="wizardContainer">
  <Form id="registrationForm">
    <!-- Step 1: Personal Info -->
    <VStack gap="md" visible={$step === 1}>
      <FormItem bindTo="firstName" label="First Name" required />
      <FormItem bindTo="lastName" label="Last Name" required />
      <FormItem bindTo="email" label="Email" pattern="email" required />
    </VStack>

    <!-- Step 2: Address -->
    <VStack gap="md" visible={$step === 2}>
      <FormItem bindTo="street" label="Street Address" required />
      <FormItem bindTo="city" label="City" required />
      <FormItem bindTo="zipCode" label="ZIP Code" required minLength={5} maxLength={5} />
    </VStack>

    <!-- Step 3: Preferences -->
    <VStack gap="md" visible={$step === 3}>
      <FormItem bindTo="newsletter" label="Subscribe to newsletter" type="checkbox" />
      <FormItem bindTo="notifications" label="Enable notifications" type="switch" />
    </VStack>

    <!-- Navigation Buttons -->
    <HStack gap="md" justify="space-between">
      <Button 
        visible={$step > 1}
        onClick={() => $step = $step - 1}
        variant="secondary"
      >
        Previous
      </Button>

      <Button 
        visible={$step < 3}
        onClick={async ($formApi) => {
          // Define which fields belong to each step
          const stepFields = {
            1: ['firstName', 'lastName', 'email'],
            2: ['street', 'city', 'zipCode'],
            3: ['newsletter', 'notifications']
          };
          
          const report = await $formApi.validateFields(stepFields[$step]);
          
          if (report.isValid) {
            $step = $step + 1;
          } else {
            $showDialog({
              title: "Validation Error",
              message: "Please correct the errors before proceeding."
            });
          }
        }}
      >
        Next
      </Button>

      <Button 
        visible={$step === 3}
        type="submit"
        variant="primary"
      >
        Complete Registration
      </Button>
    </HStack>
  </Form>
</Stack>

<Script>
  let $step = 1;
</Script>
```

**Key features demonstrated**:
- Using `validateFields()` for partial validation
- Step-by-step validation without submission
- Conditional field visibility
- Progressive disclosure pattern

---

### Example 3: Preview Before Submit

**Scenario**: Form with preview functionality to review data before submission.

```xml
<Stack>
  <Form 
    id="articleForm"
    submit={async (data) => {
      const response = await fetch('/api/articles', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      return response.ok ? undefined : await response.json();
    }}
    success={() => {
      $showDialog({ title: "Success", message: "Article published!" });
      $navigate('/articles');
    }}
  >
    <FormItem 
      bindTo="title" 
      label="Article Title" 
      required 
      maxLength={100}
    />
    <FormItem 
      bindTo="author" 
      label="Author" 
      required 
    />
    <FormItem 
      bindTo="content" 
      label="Content" 
      type="textarea" 
      required 
      minLength={50}
      lengthInvalidMessage="Article must be at least 50 characters"
    />
    <FormItem 
      bindTo="tags" 
      label="Tags" 
      placeholder="Enter comma-separated tags"
    />
    <FormItem 
      bindTo="draft" 
      label="Save as draft" 
      type="checkbox" 
      noSubmit
    />

    <HStack gap="md">
      <Button 
        onClick={async ($formApi) => {
          const report = await $formApi.validate();
          
          if (!report.isValid) {
            return;
          }
          
          const data = $formApi.getData();
          
          // Show preview modal
          $showDialog({
            title: "Preview Article",
            content: (
              <VStack gap="md">
                <Text variant="h2">{data.title}</Text>
                <Text variant="caption">By {data.author}</Text>
                <Divider />
                <Text>{data.content}</Text>
                {data.tags && (
                  <HStack gap="sm">
                    {data.tags.split(',').map(tag => (
                      <Chip label={tag.trim()} />
                    ))}
                  </HStack>
                )}
              </VStack>
            ),
            actions: [
              { label: "Edit", action: "close" },
              { 
                label: "Publish", 
                action: () => {
                  // Programmatically submit the form
                  document.getElementById('articleForm').submit();
                }
              }
            ]
          });
        }}
        variant="secondary"
      >
        Preview
      </Button>

      <Button type="submit" variant="primary">
        Publish Now
      </Button>
    </HStack>
  </Form>
</Stack>
```

**Key features demonstrated**:
- Using `validate()` for preview without submission
- Using `getData()` to access form data
- Using `noSubmit` for fields that shouldn't be submitted (draft checkbox)
- Showing formatted preview in modal
- Programmatic form submission after preview

---

### Example 4: Dynamic Field Validation

**Scenario**: Password strength calculator that provides real-time feedback without validation errors.

```xml
<Form id="passwordForm">
  <FormItem 
    bindTo="password" 
    label="Password" 
    type="password" 
    required 
    minLength={8}
  />

  <FormItem 
    bindTo="confirmPassword" 
    label="Confirm Password" 
    type="password" 
    required
    validate={async (value) => {
      const password = $formApi.getFieldValue('password');
      if (value !== password) {
        return {
          isValid: false,
          severity: 'error',
          invalidMessage: 'Passwords do not match'
        };
      }
      return true;
    }}
  />

  <!-- Password Strength Indicator (not a form field) -->
  <VStack gap="sm">
    <Text variant="caption">Password Strength:</Text>
    <HStack gap="sm">
      <Box 
        width="25%" 
        height="4px" 
        backgroundColor={$strength >= 1 ? 'success' : 'gray'}
      />
      <Box 
        width="25%" 
        height="4px" 
        backgroundColor={$strength >= 2 ? 'success' : 'gray'}
      />
      <Box 
        width="25%" 
        height="4px" 
        backgroundColor={$strength >= 3 ? 'warning' : 'gray'}
      />
      <Box 
        width="25%" 
        height="4px" 
        backgroundColor={$strength >= 4 ? 'error' : 'gray'}
      />
    </HStack>
    <Text variant="caption" color={$strengthColor}>
      {$strengthText}
    </Text>
  </VStack>

  <Button 
    type="submit" 
    disabled={$strength < 3}
  >
    Create Account
  </Button>
</Form>

<Script>
  let $formApi;
  let $strength = 0;
  let $strengthText = 'Too weak';
  let $strengthColor = 'error';

  // Calculate password strength whenever form data changes
  $: {
    const password = $formApi?.getFieldValue('password') || '';
    
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;
    
    $strength = score;
    
    if (score < 2) {
      $strengthText = 'Too weak';
      $strengthColor = 'error';
    } else if (score < 3) {
      $strengthText = 'Weak';
      $strengthColor = 'warning';
    } else if (score < 4) {
      $strengthText = 'Good';
      $strengthColor = 'success';
    } else {
      $strengthText = 'Strong';
      $strengthColor = 'success';
    }
  }
</Script>
```

**Key features demonstrated**:
- Using `getFieldValue()` to access specific field values
- Cross-field validation (password confirmation)
- Real-time feedback without form validation
- Dynamic UI based on form state
- Disabling submit based on validation state

---

### Example 5: Conditional Form with Validation

**Scenario**: Product order form where shipping fields are only validated if shipping is required.

```xml
<Form 
  id="orderForm"
  submit={async (data) => {
    return await placeOrder(data);
  }}
>
  <FormItem 
    bindTo="productId" 
    label="Product" 
    type="select" 
    options={$products}
    required 
  />

  <FormItem 
    bindTo="quantity" 
    label="Quantity" 
    type="integer" 
    required 
    minValue={1}
    maxValue={100}
  />

  <FormItem 
    bindTo="needsShipping" 
    label="Requires shipping?" 
    type="checkbox" 
  />

  <!-- Conditional shipping fields -->
  <VStack gap="md" visible={$needsShipping}>
    <Text variant="h3">Shipping Information</Text>
    
    <FormItem 
      bindTo="shippingAddress" 
      label="Address" 
      required={$needsShipping}
      noSubmit={!$needsShipping}
    />
    <FormItem 
      bindTo="shippingCity" 
      label="City" 
      required={$needsShipping}
      noSubmit={!$needsShipping}
    />
    <FormItem 
      bindTo="shippingZip" 
      label="ZIP Code" 
      required={$needsShipping}
      pattern="^\d{5}$"
      noSubmit={!$needsShipping}
    />
  </VStack>

  <FormItem 
    bindTo="notes" 
    label="Order Notes" 
    type="textarea" 
    placeholder="Optional special instructions"
  />

  <HStack gap="md">
    <Button 
      onClick={async ($formApi) => {
        // Calculate total before submitting
        const data = $formApi.getRawData();
        const product = $products.find(p => p.id === data.productId);
        const subtotal = product.price * data.quantity;
        const shipping = data.needsShipping ? 9.99 : 0;
        const total = subtotal + shipping;
        
        const confirmed = await $showConfirmDialog({
          title: "Confirm Order",
          message: `Subtotal: $${subtotal.toFixed(2)}\nShipping: $${shipping.toFixed(2)}\nTotal: $${total.toFixed(2)}\n\nProceed with order?`
        });
        
        if (confirmed) {
          // Trigger form submission
          $formApi.submit();
        }
      }}
      variant="primary"
    >
      Review & Place Order
    </Button>
  </HStack>
</Form>

<Script>
  let $needsShipping = false;
  let $products = [
    { id: 1, name: 'Widget', price: 29.99 },
    { id: 2, name: 'Gadget', price: 49.99 },
  ];
</Script>
```

**Key features demonstrated**:
- Using `getRawData()` to access all form data including noSubmit fields
- Conditional validation based on checkbox state
- Using `noSubmit` for conditional fields
- Pre-submission calculation and confirmation
- Programmatic form submission

---

### Example 6: Real-time Search with Validation

**Scenario**: Search form that validates and performs search on button click, showing results without page refresh.

```xml
<Stack>
  <Form id="searchForm">
    <FormItem 
      bindTo="query" 
      label="Search Query" 
      required 
      minLength={3}
      lengthInvalidMessage="Search query must be at least 3 characters"
      placeholder="Enter search term..."
    />

    <FormItem 
      bindTo="category" 
      label="Category" 
      type="select" 
      options={['All', 'Products', 'Articles', 'Users']}
    />

    <FormItem 
      bindTo="exactMatch" 
      label="Exact match only" 
      type="checkbox" 
      noSubmit
    />

    <Button 
      onClick={async ($formApi) => {
        const report = await $formApi.validate();
        
        if (!report.isValid) {
          return;
        }
        
        $loading = true;
        
        const data = $formApi.getData();
        const rawData = $formApi.getRawData();
        
        try {
          const results = await fetch('/api/search', {
            method: 'POST',
            body: JSON.stringify({
              ...data,
              exactMatch: rawData.exactMatch // Include noSubmit field in search
            })
          });
          
          $searchResults = await results.json();
        } catch (error) {
          $showDialog({
            title: "Search Error",
            message: error.message
          });
        } finally {
          $loading = false;
        }
      }}
    >
      {$loading ? 'Searching...' : 'Search'}
    </Button>
  </Form>

  <!-- Search Results -->
  <VStack gap="md" visible={$searchResults.length > 0}>
    <Text variant="h3">
      Found {$searchResults.length} results
    </Text>
    
    {$searchResults.map(result => (
      <Card key={result.id}>
        <Text variant="h4">{result.title}</Text>
        <Text>{result.description}</Text>
      </Card>
    ))}
  </VStack>
</Stack>

<Script>
  let $loading = false;
  let $searchResults = [];
</Script>
```

**Key features demonstrated**:
- Using `validate()` for search without form submission
- Using `getData()` for submittable fields
- Using `getRawData()` to access UI-only fields (exactMatch with noSubmit)
- Async operation with loading state
- Displaying results without navigation

---



## 7. Testing Strategy

### 7.1 Unit Tests

- Test each new API method in isolation
- Test new reducer actions
- Test ValidationReport generation

### 7.2 E2E Tests (Playwright)

**New test file**: `Form.api.spec.ts`

Test scenarios:
1. `validate()` triggers validation display
2. `isValid()` returns correct state
3. `isDirty()` detects changes
4. `getData()` returns cleaned subject
5. `getRawData()` returns full subject including noSubmit
6. `getFieldValue()` returns individual values
7. `setFieldValue()` updates value and triggers validation
8. `showValidation()` forces validation display
9. `validateFields()` validates specific fields only
10. validate event handler receives cleaned data
11. validate event can return backend validation errors
12. Multiple validate calls work correctly
13. validate + submit in same form
14. Programmatic validation with different validation modes

### 7.3 Integration Tests

- Test interaction between new APIs and existing features
- Test form with both validate and submit handlers
- Test noSubmit interaction with new APIs
- Test conditional fields with new APIs

### 7.4 Regression Testing

Run full existing test suite:
- All Form tests (113 tests)
- All FormItem tests (80 + 10 noSubmit tests)
- Ensure no regressions

---

## 8. Implementation Timeline

### Recommended Order

1. **Phase 1** (1-2 days) - State access methods
   - Low risk, immediate value
   - Enables developers to inspect form state

2. **Phase 2** (2-3 days) - Programmatic validation
   - Core functionality for validation-only scenarios
   - Includes validate event handler

3. **Phase 3** (2-3 days) - State mutation methods
   - More advanced use cases
   - Higher risk, needs thorough testing

4. **Phase 4** (1 day) - Documentation
   - API reference updates
   - How-to guides
   - Examples

**Total estimated time**: 6-9 days

---

## 9. Alternative Approaches Considered

### 9.1 Separate ValidateButton Component

**Idea**: Create `<ValidateButton>` component separate from submit button

**Pros**: 
- Clear separation of concerns
- Easy to discover

**Cons**:
- Inflexible - what about links, custom triggers?
- Still needs exposed validate() method
- Adds component complexity

**Decision**: Rejected - Exposed API methods more flexible

### 9.2 validateOnChange Prop

**Idea**: Add `validateOnChange` boolean prop to Form

**Pros**:
- Simple API
- Declarative

**Cons**:
- Doesn't solve programmatic validation
- Overlaps with existing validationMode
- Not flexible enough for complex scenarios

**Decision**: Rejected - Doesn't address core use cases

### 9.3 Validation Context Separate from Form

**Idea**: Extract validation logic into separate ValidationProvider

**Pros**:
- Reusable validation without forms
- Clear separation

**Cons**:
- Major refactoring required
- Breaking change
- Overly complex for current needs

**Decision**: Rejected - Too invasive, current integration works well

---

## 10. Open Questions & Considerations

### 10.1 Async Validation Timing

**Question**: When calling `validate()`, how long should we wait for async validators?

**Options**:
1. Return immediately with current validation state (partial results)
2. Wait for all async validators to complete
3. Add timeout parameter

**Recommendation**: Wait for async validators (Option 2) - more accurate, aligns with user expectation

### 10.2 ValidationReport Caching

**Question**: Should ValidationReport be memoized/cached?

**Consideration**: validate() will be called frequently, report generation has overhead

**Recommendation**: Yes - memoize based on validationResults, subject

### 10.3 Field Name vs UID

**Question**: Should new APIs use field name (bindTo) or internal UID?

**Current**: UIDs are internal (formItem-xxx), bindTo is user-facing

**Recommendation**: Use bindTo (field name) - more intuitive for developers

### 10.4 setFieldValue Behavior

**Question**: Should setFieldValue mark field as dirty?

**Options**:
1. Always mark dirty
2. Never mark dirty
3. Add optional parameter

**Recommendation**: Always mark dirty (Option 1) - matches user expectation of programmatic changes

### 10.5 Interaction with noSubmit

**Question**: Should getData() include noSubmit fields?

**Current**: cleanUpSubject removes noSubmit fields

**Recommendation**: 
- getData() - exclude noSubmit (cleaned for submission)
- getRawData() - include noSubmit (full form state)

---

## 11. Success Criteria

The implementation will be considered successful when:

1. ✅ All new API methods work as documented
2. ✅ All existing tests pass (193+ tests)
3. ✅ New e2e tests cover all new functionality (target: 20+ new tests)
4. ✅ Documentation is complete and includes examples
5. ✅ Zero breaking changes to existing forms
6. ✅ Common validation-only scenarios work intuitively
7. ✅ Performance impact is negligible (<5% overhead)

---

## 12. Risk Assessment

### Low Risk
- Read-only state access methods
- validate event handler
- Documentation updates

### Medium Risk
- Programmatic validation (VALIDATE_TRIGGERED action)
- ValidationReport generation
- Async validation timing

### Higher Risk
- State mutation methods (setFieldValue, etc.)
- Complex interaction between new APIs and existing features
- Edge cases with conditional fields, noSubmit, validation modes

### Mitigation Strategies
1. **Phased implementation** - Deliver low-risk features first
2. **Comprehensive testing** - Each phase has dedicated e2e tests
3. **Feature flags** - Consider toggling new APIs during development
4. **Code review** - Extra scrutiny on state mutation logic
5. **Beta period** - Test in real-world scenarios before full release

---

## 13. Summary

This plan proposes extending XMLUI's form infrastructure with:

- **12 new API methods** for state access and control
- **1 new event handler** (validate)
- **3 new actions** (VALIDATE_TRIGGERED, FIELD_VALUE_SET, etc.)
- **ValidationReport interface** for comprehensive validation feedback

The extensions enable:
- ✅ Validation-only scenarios (preview, wizards, etc.)
- ✅ Programmatic form control
- ✅ Better developer experience with intuitive APIs
- ✅ Full backward compatibility

**Simplest implementation path**: 
1. Start with Phase 1 (read-only methods) - immediate value, zero risk
2. Add Phase 2 (programmatic validation) - core functionality
3. Consider Phase 3 (mutations) based on user feedback

**Total effort**: 6-9 days including testing and documentation

This approach balances **minimal invasiveness** with **maximum developer value**, providing the missing pieces while respecting the existing well-designed architecture.
