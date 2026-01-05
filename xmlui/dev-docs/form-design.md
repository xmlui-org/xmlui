# Form Infrastructure Redesign

**Date**: December 18, 2025

## Overview

Conceptual redesign of form infrastructure and components for XMLUI framework.

## Core Requirements

### Validation Features

**Field-Level Validation**
- Required/optional field designation
- Whitespace handling via `allowWhitespaceOnly` property (default: `false`)
  - When `false`: whitespace-only values treated as empty/blank
  - When `true`: whitespace-only values accepted as valid content
- Constraints: ranges, length limits, patterns (regex, masks)
- Custom validation functions returning status + error messages

**Common Field Validation Types**
- `required` - Field must have a value
- `minLength` / `maxLength` - String length constraints
- `min` / `max` - Numeric range constraints
- `pattern` - Regex pattern matching
- `email` - Valid email format
- `url` - Valid URL format
- `phoneNumber` - Phone number format (locale-aware)
- `postalCode` / `zipCode` - Postal code format
- `creditCard` - Credit card number validation
- `dateRange` - Date constraints (min/max dates)
- `alphanumeric` - Letters and numbers only
- `numeric` - Numbers only
- `alpha` - Letters only
- `passwordStrength` - Password complexity rules
- `matches` - Match another field value (e.g., password confirmation)
- `fileSize` - File upload size limits
- `fileType` - Allowed file types/extensions
- `custom` - Custom validation function

### Current FormItem Implementation

**Supported Input Types**
- `text` - TextBox
- `password` - TextBox (password mode)
- `textarea` - Textarea
- `checkbox` - Checkbox
- `number` - NumberBox
- `integer` - NumberBox (integers only)
- `file` - FileInput
- `datePicker` - DatePicker
- `radioGroup` - RadioGroup
- `switch` - Switch
- `select` - Select
- `autocomplete` - AutoComplete
- `slider` - Slider
- `colorpicker` - ColorPicker
- `items` - Items (list management)
- `custom` - Custom input via children

**Existing Validation Props**
- `required` - Marks field as mandatory
  - `requiredInvalidMessage` - Custom error message
- `minLength` / `maxLength` - String length validation
  - `lengthInvalidMessage` - Custom error message
  - `lengthInvalidSeverity` - Severity level (error/warning/info)
- `maxTextLength` - Maximum text length constraint for input field
- `minValue` / `maxValue` - Numeric range validation
  - `rangeInvalidMessage` - Custom error message
  - `rangeInvalidSeverity` - Severity level
- `pattern` - Predefined regex patterns
  - Current patterns: `email`, `phone`, `url`
  - `patternInvalidMessage` - Custom error message
  - `patternInvalidSeverity` - Severity level
- `regex` - Custom regex validation
  - `regexInvalidMessage` - Custom error message
  - `regexInvalidSeverity` - Severity level
- `customValidationsDebounce` - Delay for custom validation (ms)
- `validationMode` - Validation strategy/timing
- `validate` event - Custom validation function
- `noSubmit` - Exclude field from form submission

**Current Pattern Implementations**
- `email` - Basic email validation (RFC-compliant pattern)
- `phone` - Phone number (alphanumeric + common symbols, requires at least one digit)
- `url` - HTTP/HTTPS URL validation using native URL API

**Suggested Additional Patterns**

*For US & Europe:*

**Postal Codes:**
- `postalCodeUS` - US ZIP codes
  - Regex: `^\d{5}(-\d{4})?$`
  - Matches: `12345` or `12345-6789`
  
- `postalCodeUK` - UK postcodes
  - Regex: `^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$`
  - Matches: `SW1A 1AA`, `EC1A 1BB`, `W1A 0AX`
  
- `postalCodeDE` - German postal codes
  - Regex: `^\d{5}$`
  - Matches: `12345`, `80331`
  
- `postalCodeFR` - French postal codes
  - Regex: `^\d{5}$`
  - Matches: `75001`, `13001`
  
- `postalCodeCA` - Canadian postal codes
  - Regex: `^[A-Z]\d[A-Z] ?\d[A-Z]\d$`
  - Matches: `K1A 0B1`, `K1A0B1`

**Government IDs:**
- `ssnUS` - US Social Security Number
  - Regex: `^\d{3}-\d{2}-\d{4}$`
  - Matches: `123-45-6789`
  
- `einUS` - US Employer Identification Number
  - Regex: `^\d{2}-\d{7}$`
  - Matches: `12-3456789`

**Financial:**
- `creditCard` - Credit card number (format only)
  - Regex: `^\d{13,19}$` (digits only) or `^[\d\s-]{13,23}$` (with spaces/dashes)
  - Note: Use Luhn algorithm for actual validation
  
- `iban` - International Bank Account Number
  - Regex: `^[A-Z]{2}\d{2}[A-Z0-9]{1,30}$`
  - Note: Requires country-specific validation and checksum algorithm

**Phone Numbers:**
- `phoneUS` - US phone number (flexible format)
  - Regex: `^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$`
  - Matches: `(123) 456-7890`, `123-456-7890`, `123.456.7890`, `1234567890`
  
- `phoneInternational` - International phone with country code
  - Regex: `^\+?[1-9]\d{1,14}$`
  - Matches: `+12345678901`, `12345678901`

**Network:**
- `ipv4` - IPv4 address
  - Regex: `^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)\.?\b){4}$`
  - Matches: `192.168.1.1`, `255.255.255.0`
  
- `ipv6` - IPv6 address (simplified)
  - Regex: `^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|::)$`
  - Note: Full IPv6 validation is complex; consider using library or API
  
- `macAddress` - MAC address
  - Regex: `^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$`
  - Matches: `00:1A:2B:3C:4D:5E`, `00-1a-2b-3c-4d-5e`

**Character Sets:**
- `alpha` - Letters only
  - Regex: `^[a-zA-Z]+$`
  
- `alphanumeric` - Letters and numbers
  - Regex: `^[a-zA-Z0-9]+$`
  
- `numeric` - Numbers only
  - Regex: `^\d+$`
  
- `hex` - Hexadecimal
  - Regex: `^[0-9A-Fa-f]+$`

**Format/Structure:**
- `slug` - URL-friendly slug
  - Regex: `^[a-z0-9]+(?:-[a-z0-9]+)*$`
  - Matches: `my-page-title`, `article-123`
  
- `username` - Common username pattern
  - Regex: `^[a-zA-Z0-9_-]{3,16}$`
  - Matches: `user_name`, `user-123` (3-16 chars)

**Date/Time:**
- `dateISO` - ISO 8601 date
  - Regex: `^\d{4}-\d{2}-\d{2}$`
  - Matches: `2025-12-18`
  
- `time24h` - 24-hour time
  - Regex: `^([01]\d|2[0-3]):([0-5]\d)$`
  - Matches: `14:30`, `09:15`
  
- `time12h` - 12-hour time with AM/PM
  - Regex: `^(0?[1-9]|1[0-2]):([0-5]\d)\s?(AM|PM|am|pm)$`
  - Matches: `2:30 PM`, `11:45 AM`

**Gap Analysis**
- ✅ Has: Required, length, range, regex validations
- ✅ Has: Custom validation function via `validate` event
- ✅ Has: Severity levels for different validation types
- ⚠️ Missing: Predefined validators (email, url, phone, etc.) - need to expand from 3 to 20+ patterns
- ⚠️ Missing: Cross-field validation (form-level rules)
- ⚠️ Missing: Explicit "reward early, punish late" implementation
- ⚠️ Missing: File validation (size, type constraints)
- ⚠️ Missing: Match validator (password confirmation)

### Suggested New Input Components

**Priority 1: Financial/Accounting (Essential)**

1. **`currency`** - Currency/money input
   - Auto-formatting with thousands separators (1,234.56)
   - Currency symbol positioning (locale-aware)
   - Decimal place precision control (typically 2)
   - Negative value handling (parentheses or minus sign)
   - Multi-currency support with currency code selector
   - Integration with accounting systems

2. **`dateRange`** - Date range picker
   - Start and end date selection in single component
   - Common presets (Today, This Week, This Month, This Quarter, YTD, Last Year)
   - Critical for reports, filtering, analytics
   - Min/max date constraints

3. **`multiSelect`** - Multiple selection dropdown
   - Select multiple items from list
   - Tag/chip display for selected items
   - Search/filter capability
   - Essential for categories, departments, cost centers, GL accounts

4. **`dataGrid`** / `spreadsheetInput` - Editable data grid
   - Line items (invoices, purchase orders, timesheets)
   - In-place cell editing
   - Add/remove rows dynamically
   - Column calculations (subtotals, totals, tax)
   - Copy/paste from Excel
   - Keyboard navigation

5. **`percentage`** - Percentage input
   - Auto-append % symbol
   - Range validation (0-100 or custom)
   - Decimal precision control
   - For tax rates, discounts, margins

**Priority 2: Business Operations (Important)**

6. **`maskedInput`** - Masked text input with formatting
   - Credit card numbers (with Luhn validation)
   - Phone numbers with locale format
   - Account numbers, invoice numbers
   - Tax IDs with specific country formats
   - Custom mask patterns
   
   **Recommended Libraries (as of April 2024 - VERIFY CURRENT STATUS):**
   
   1. **IMask (react-imask)**
      - GitHub: https://github.com/uNmAnNeR/imaskjs
      - NPM: `imask` and `react-imask`
      - License: MIT
      - Most flexible masking engine
      - Dynamic masks, date/number/regex patterns
      - TypeScript support, zero dependencies
      - ~6.4k stars (April 2024)
   
   2. **react-number-format**
      - GitHub: https://github.com/s-yadav/react-number-format
      - NPM: `react-number-format`
      - License: MIT
      - Best for currency, phone, credit card numbers
      - Prefix/suffix, thousands separator
      - ~3.8k stars (April 2024)
   
   3. **Cleave.js**
      - GitHub: https://github.com/nosir/cleave.js
      - NPM: `cleave.js` or `cleave-zen` (newer)
      - License: Apache 2.0
      - Credit card auto-detection
      - Date, numeral formatting
      - ~17.9k stars (April 2024)
   
   4. **react-input-mask**
      - GitHub: https://github.com/sanniassin/react-input-mask
      - NPM: `react-input-mask`
      - License: MIT
      - Simple fixed-format masks
      - Lightweight (~3kb)
      - ~2.2k stars (April 2024)
   
   5. **input-otp** (for PIN/OTP codes)
      - GitHub: https://github.com/guilhermerodz/input-otp
      - NPM: `input-otp`
      - License: MIT
      - Specialized for OTP/PIN entry
      - Accessible, customizable
      - Modern React patterns
   
   **⚠️ IMPORTANT:** These recommendations are from April 2024. Before using:
   - Check NPM last publish date
   - Verify GitHub recent commits (last 6 months)
   - Test with current React version (18/19)
   - Review open issues and response times
   - Check NPM weekly downloads trend
   
   **⚠️ STATUS NOTE (Dec 2025):** Due to the fast-evolving React ecosystem and 
   knowledge cutoff limitations, the current state of these libraries cannot be 
   verified. Consider:
   - **Research required:** Investigate current maintenance status before adoption
   - **Custom implementation:** Building a lightweight custom solution may provide 
     better long-term control and integration with XMLUI form infrastructure
   - **Deferred decision:** Evaluate options when implementation phase begins

7. **`addressInput`** - Structured address entry
   - Street address, city, state/province, postal code
   - Country selection
   - Address validation/autocomplete (Google, USPS)
   - Separate billing/shipping addresses
   - International format support

8. **`treeSelect`** - Hierarchical selection
   - Chart of accounts (accounting)
   - Organization structure
   - Category hierarchies
   - Expand/collapse nodes
   - Search within tree

9. **`combobox`** - Editable dropdown
   - Type or select from list
   - Auto-complete while typing
   - Common in ERP/accounting software
   - Create new items on-the-fly

10. **`decimal`** - Precise decimal number input
    - Fixed decimal places for accounting precision
    - Prevents floating-point errors
    - Scientific notation support optional
    - For quantities, rates, precise measurements

**Priority 3: Enhanced Functionality (Useful)**

11. **`timePicker`** - Time input
    - 12h/24h format support
    - Minute intervals (5, 15, 30 min)
    - For scheduling, time tracking

12. **`dateTimePicker`** - Combined date and time
    - Single component for timestamp entry
    - Scheduling, appointments, deadline tracking
    - Timezone support

13. **`monthPicker`** - Month/year selector
    - Financial periods, fiscal year selection
    - Reporting cycles, budgeting periods
    - Dropdown or calendar view

14. **`tags`** / `chips` - Tag/chip input
    - Free-form or predefined tags
    - Categories, labels, keywords
    - Easy add/remove interaction
    - For expense categories, project tags

15. **`richText`** - Rich text editor (WYSIWYG)
    - Notes, descriptions, comments, memo fields
    - Basic formatting (bold, italic, lists, links)
    - Keep lightweight (not full CMS editor)

**Priority 4: Specialized (Nice to Have)**

16. **`signaturePad`** - Digital signature capture
    - Approvals, contracts, invoices
    - Canvas-based drawing
    - Export as image/data URL
    - Clear and redo functionality

17. **`rating`** - Star/numeric rating input
    - Vendor ratings, performance reviews
    - Customer feedback, satisfaction scores
    - Configurable scale (1-5, 1-10)

18. **`pinCode`** - PIN/verification code input
    - 4-6 digit codes with individual boxes
    - Security, 2FA, confirmation codes
    - Auto-focus next field
    - Paste support

**Form-Level Validation**
- Cross-field rules (e.g., field A > field B + field C)
- Executed during field validation and submission

**Validation Philosophy: "Reward Early, Punish Late"**

This UX pattern optimizes user experience by:
- **"Punish late"**: Don't show validation errors while user is still typing (avoid premature criticism)
- **"Reward early"**: Show success/valid state immediately when input becomes valid (positive feedback)

**Validation State Machine:**

1. **Pristine State** (field untouched)
   - No validation messages shown
   - Field appears neutral
   - User hasn't interacted yet

2. **Typing State** (user is entering data)
   - Events: `onChange` (typing), `onInput` (character entered)
   - Behavior: **No errors shown** while typing initially
   - Visual: Neutral or minimal feedback
   - Rationale: Don't interrupt user flow with premature errors

3. **First Validation Trigger**
   - Events: `onBlur` (field loses focus) OR form submission attempt
   - Behavior: **First validation check performed**
   - If valid: Show success indicator (green checkmark, border color change)
   - If invalid: Show error message and error styling
   - State changes to "Touched"

4. **Post-Error State** (after first error shown)
   - Events: `onChange` (every keystroke)
   - Behavior: **Live validation on each change**
   - If still invalid: Keep showing updated error
   - If becomes valid: **Immediately show success** ("reward early")
   - Rationale: User is now fixing the error, give instant feedback

5. **Valid State**
   - Visual: Success indicator (subtle, non-intrusive)
   - Behavior: Continue validating `onChange` to catch new errors
   - Can revert to error state if user breaks validation

**Implementation with FormItem Events:**

```typescript
// Validation state tracking
interface FieldValidationState {
  touched: boolean;           // Has user left the field?
  hasShownError: boolean;     // Have we shown an error yet?
  isDirty: boolean;           // Has user typed anything?
  currentValue: any;
  validationResult: ValidationResult;
}

// Event handlers
onFocus: () => {
  // Field gains focus - no action needed
  // Just track for analytics if desired
}

onChange: (newValue) => {
  // User is typing
  state.isDirty = true;
  state.currentValue = newValue;
  
  if (state.hasShownError) {
    // Error was shown before - validate immediately
    const result = validateField(newValue);
    state.validationResult = result;
    
    if (result.isValid) {
      // REWARD EARLY: Show success immediately
      showSuccessIndicator();
    } else {
      // Still invalid - update error message
      showError(result.message);
    }
  } else {
    // First time typing - don't validate yet (PUNISH LATE)
    // Just update the value silently
    clearVisualFeedback();
  }
}

onBlur: () => {
  // User left the field - time for first validation
  state.touched = true;
  
  if (!state.hasShownError && state.isDirty) {
    // First validation check
    const result = validateField(state.currentValue);
    state.validationResult = result;
    state.hasShownError = !result.isValid;
    
    if (result.isValid) {
      showSuccessIndicator();
    } else {
      // PUNISH LATE: Only now show the error
      showError(result.message);
    }
  }
}

onSubmit: () => {
  // Form submission - validate all fields regardless of state
  const result = validateField(state.currentValue);
  state.touched = true;
  state.hasShownError = !result.isValid;
  
  if (!result.isValid) {
    showError(result.message);
    return false; // Block submission
  }
  return true;
}
```

**Visual Feedback States:**
- **Neutral**: Default state, no decoration
- **Success**: Subtle indicator (✓, green border, success icon)
- **Error**: Clear indicator (✗, red border, error message below)
- **Warning**: Optional (⚠, yellow border, warning message)

**Benefits:**
- Less frustrating for users (no premature errors)
- Faster error recovery (immediate feedback when fixing)
- Encourages completion (positive reinforcement)
- Reduces cognitive load (errors appear when expected)

**Validation Philosophy**

### Validation Lifecycle

**During Input**
- Validate on typing or blur (field-specific triggers)
- Test form-level rules when validating any field

**Submission Flow**
1. User triggers submit → validate all fields
2. If errors → block submission, show errors
3. If valid → submit to backend
4. Evaluate backend response:
   - Success → complete
   - Error → extract error info, bind to fields if possible
5. User fixes issues → allow resubmission

---

