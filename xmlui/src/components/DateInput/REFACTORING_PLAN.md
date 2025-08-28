# DateInput Refactoring Plan

## Executive Summary

This document captures all learnings from the successful TimeInput refactoring to guide the DateInput component refactoring. The TimeInput refactoring achieved:
- ✅ 105/105 tests passing
- ✅ Complete migration to PartialInput abstraction
- ✅ Proper invalid state styling
- ✅ Clean CSS architecture with layers
- ✅ Shared InputDivider component

## Phase 1: Analysis & Preparation

### Key Architecture Patterns Learned

#### 1. PartialInput Component Structure
**Location**: `/src/components/Input/PartialInput.tsx`

**Key Features**:
- Encapsulates common multi-field input behavior
- Auto-advance logic based on `maxLength`
- Enhanced blur detection with direction (`next`, `previous`, `external`)
- Validation integration via `validateFn` and `isInvalid` props
- Invalid state styling via `invalidClassName` prop
- EmptyCharacter support for placeholders

**Critical Props**:
```typescript
interface PartialInputProps {
  // Core functionality
  value?: string | null;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (direction: BlurDirection, event: React.FocusEvent<HTMLInputElement>) => void;
  
  // Validation & styling
  validateFn?: (value: string) => boolean;
  isInvalid?: boolean;
  className?: string;
  invalidClassName?: string; // ✅ CRITICAL: For invalid state styling
  
  // Navigation
  nextInputRef?: React.RefObject<HTMLInputElement | null>;
  nextButtonRef?: React.RefObject<HTMLButtonElement | null>;
  
  // Constraints
  max: number;
  min: number;
  maxLength?: number;
  
  // Placeholder support
  emptyCharacter?: string;
  placeholderLength?: number;
}
```

#### 2. CSS Architecture with Layers
**Key Learning**: Use `@layer components` for proper CSS specificity control

**PartialInput CSS Structure**:
```scss
@layer components {
  .partialInput {
    // Base layout and reset styles only
    height: 100%;
    position: relative;
    border: 0;
    background: none;
    color: currentColor;
    font: inherit;
    text-align: center;
    -webkit-appearance: textfield;
    -moz-appearance: textfield;
    appearance: textfield;
    // Component-specific styling via className prop
  }
}
```

#### 3. InputDivider Shared Component
**Location**: `/src/components/Input/InputDivider.tsx`

**Minimal, Non-Conflicting Styles**:
```scss
@layer components {
  .inputDivider {
    white-space: pre;
    display: inline-block;
    font: inherit;
    user-select: none;
    // Component-specific styling (padding, color) via className
  }
}
```

### TimeInput Component Structure Analysis

#### Component Breakdown
1. **HourInput**: Uses PartialInput with hour-specific validation
2. **MinuteInput**: Uses PartialInput with minute-specific validation  
3. **SecondInput**: Uses PartialInput with second-specific validation
4. **InputDivider**: Shared separator component with `:` separator

#### Critical CSS Class Mapping
**Essential for proper styling**:
```typescript
// Hour input
className={classnames(partClassName(PART_HOUR), styles.input, styles.hour, "timeinput")}
invalidClassName={styles.invalid}

// Minute input  
className={classnames(partClassName(PART_MINUTE), styles.input, styles.minute, "timeinput")}
invalidClassName={styles.invalid}

// Second input
className={classnames(partClassName(PART_SECOND), styles.input, styles.second, "timeinput")}
invalidClassName={styles.invalid}
```

#### CSS Module Classes Required
```scss
.input {
  // Base input styling
  min-width: $minWidth-input-ComponentName;
  padding: $padding-input-ComponentName;
  // ... base styles
}

.hour, .minute, .second {
  // Specific width constraints
  width: 2.5ch;
  min-width: 2.5ch; 
  max-width: 2.5ch;
  text-align: center;
  // Critical for proper field sizing
}

.invalid {
  background: $backgroundColor-input-ComponentName-invalid;
  // Invalid state styling
}

.divider {
  padding: $spacing-divider-ComponentName;
  color: $color-divider-ComponentName;
  // Component-specific divider styling
}
```

## Phase 2: DateInput Analysis

### Current DateInput Structure Assessment
**TODO**: Analyze current DateInput implementation:

1. **Component Breakdown**: 
   - Identify current input field structure (day, month, year)
   - Check for existing validation logic
   - Review navigation/focus management

2. **CSS Architecture**:
   - Review current CSS module structure
   - Identify theme variables in use
   - Check for existing invalid state styling

3. **Test Coverage**:
   - Analyze existing test suite
   - Identify critical functionality to preserve
   - Note any edge cases or special behaviors

### Expected DateInput Component Structure

#### Anticipated Components After Refactoring
1. **DayInput**: PartialInput for day values (1-31)
2. **MonthInput**: PartialInput for month values (1-12) 
3. **YearInput**: PartialInput for year values (variable length)
4. **InputDivider**: Shared separator (likely `/` or `-`)

#### Expected CSS Classes Needed
```scss
.input {
  // Base input styling shared across all date fields
}

.day, .month {
  // 2-character width fields
  width: 2.5ch;
  min-width: 2.5ch;
  max-width: 2.5ch;
}

.year {
  // 4-character width field  
  width: 4.5ch;
  min-width: 4.5ch;
  max-width: 4.5ch;
}

.invalid {
  // Invalid state styling
}

.divider {
  // Date separator styling
}
```

## Phase 3: Refactoring Execution Plan

### Step 1: Backup & Analysis
```bash
# Create backups
cp DateInputNative.tsx DateInputNative.tsx.backup
cp DateInput.module.scss DateInput.module.scss.backup

# Analyze current structure
# - Document existing component API
# - Map current CSS classes
# - Identify validation patterns
```

### Step 2: Create Individual Input Components

#### DayInput Component Implementation
```typescript
type DayInputProps = {
  value?: string | null;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  
  // Navigation
  inputRef?: React.RefObject<HTMLInputElement | null>;
  nextInputRef?: React.RefObject<HTMLInputElement | null>;
  
  // Validation context
  month?: string | null;
  year?: string | null;
  minDate?: string;
  maxDate?: string;
  
  // Standard props
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  isInvalid?: boolean;
  
  // Placeholder
  emptyCharacter?: string;
  onBeep?: () => void;
};

function DayInput({ /* props */ }: DayInputProps) {
  // Day validation logic (1-31, considering month/year)
  const validateDay = useCallback((val: string) => {
    // Implement day validation logic
    // Consider month length, leap years, etc.
  }, [month, year]);

  return (
    <PartialInput
      value={value}
      emptyCharacter={emptyCharacter}
      placeholderLength={2}
      max={31}
      min={1}
      maxLength={2}
      validateFn={validateDay}
      className={classnames(partClassName(PART_DAY), styles.input, styles.day, "dateinput")}
      invalidClassName={styles.invalid}
      // ... other props
    />
  );
}
```

#### MonthInput Component Implementation
```typescript
// Similar structure to DayInput
// Validation: 1-12
// Consider month length for day validation
```

#### YearInput Component Implementation  
```typescript
// 4-digit year input
// Validation: reasonable year range
// Consider leap year logic
```

### Step 3: Update Main DateInput Component

#### Integration Pattern
```typescript
<div className={styles.inputGroup}>
  <DayInput 
    value={day}
    onChange={handleDayChange}
    onBlur={handleDayBlur}
    onKeyDown={handleArrowKeys}
    inputRef={dayInputRef}
    nextInputRef={monthInputRef}
    month={month}
    year={year}
    minDate={minDate}
    maxDate={maxDate}
    disabled={!enabled}
    readOnly={readOnly}
    required={required}
    isInvalid={isDayCurrentlyInvalid}
    emptyCharacter={processedEmptyCharacter}
    onBeep={handleBeep}
  />
  
  <InputDivider separator="/" className={styles.divider} />
  
  <MonthInput 
    // Similar props structure
  />
  
  <InputDivider separator="/" className={styles.divider} />
  
  <YearInput
    // Similar props structure  
  />
</div>
```

### Step 4: CSS Module Updates

#### Add Required CSS Classes
```scss
// Add to DateInput.module.scss
@layer components {
  .input {
    // Base input styling
    min-width: $minWidth-input-DateInput;
    padding: $padding-input-DateInput;
    border: 0;
    background: none;
    color: currentColor;
    font: inherit;
    font-size: $fontSize-input-DateInput;
    box-sizing: border-box;
    border-radius: $borderRadius-input-DateInput;
    text-align: center;
  }

  .day, .month {
    width: 2.5ch;
    min-width: 2.5ch;
    max-width: 2.5ch;
  }

  .year {
    width: 4.5ch;
    min-width: 4.5ch;
    max-width: 4.5ch;
  }

  .invalid {
    background: $backgroundColor-input-DateInput-invalid;
  }

  .divider {
    padding: $spacing-divider-DateInput;
    color: $color-divider-DateInput;
    white-space: pre;
    display: inline-block;
    font: inherit;
  }
}
```

### Step 5: Validation Logic Updates

#### Date-Specific Validation Patterns
```typescript
// Day validation considering month/year
const isDayInvalid = (day: string, month: string, year: string) => {
  const dayNum = parseInt(day, 10);
  const monthNum = parseInt(month, 10);
  const yearNum = parseInt(year, 10);
  
  if (dayNum < 1 || dayNum > 31) return true;
  
  // Month-specific validation
  const daysInMonth = getDaysInMonth(monthNum, yearNum);
  return dayNum > daysInMonth;
};

// Month validation
const isMonthInvalid = (month: string) => {
  const monthNum = parseInt(month, 10);
  return monthNum < 1 || monthNum > 12;
};

// Year validation  
const isYearInvalid = (year: string) => {
  const yearNum = parseInt(year, 10);
  return yearNum < 1000 || yearNum > 9999; // Adjust range as needed
};
```

### Step 6: Testing Strategy

#### Test Coverage Requirements
1. **Component Rendering**: All date input fields visible
2. **Input Validation**: Day/month/year validation works
3. **Auto-advance**: Tab progression through fields
4. **Invalid State Styling**: CSS classes applied correctly
5. **Arrow Navigation**: Left/right arrow key navigation
6. **Date Range Validation**: Min/max date constraints
7. **Edge Cases**: Leap years, month boundaries, invalid dates

#### Test Execution Pattern
```bash
# Run during development
npx playwright test src/components/DateInput/DateInput.spec.ts --reporter=line

# Verify no regressions
npx tsc --noEmit --project tsconfig.json
```

## Phase 4: Key Success Criteria

### ✅ Functional Requirements
- [ ] All existing DateInput tests pass
- [ ] Auto-advance between day → month → year fields
- [ ] Arrow key navigation works correctly  
- [ ] Invalid state styling displays properly
- [ ] Date validation respects month lengths and leap years
- [ ] Min/max date constraints enforced

### ✅ Technical Requirements  
- [ ] Uses PartialInput for all date field components
- [ ] Uses shared InputDivider component
- [ ] CSS uses `@layer components` structure
- [ ] Invalid state styling via `invalidClassName` prop
- [ ] Proper CSS class mapping (`.day`, `.month`, `.year`, `.invalid`)
- [ ] Theme variables preserved and working

### ✅ Code Quality
- [ ] No TypeScript compilation errors
- [ ] Clean, documented component APIs
- [ ] Consistent styling patterns with TimeInput
- [ ] Proper error handling and edge cases

## Critical Implementation Notes

### ⚠️ Common Pitfalls to Avoid

1. **Missing CSS Classes**: Ensure `.day`, `.month`, `.year` classes are applied to PartialInput components
2. **Invalid State Styling**: Must pass `invalidClassName={styles.invalid}` to each PartialInput
3. **CSS Layer Conflicts**: Use `@layer components` to avoid specificity issues
4. **Auto-advance Logic**: Ensure `maxLength` prop is set correctly for each field type
5. **Navigation References**: Set up proper `nextInputRef` chain for tab progression

### 🔧 Debugging Tips

1. **Styling Issues**: Check that component-specific CSS classes are being applied
2. **Auto-advance Not Working**: Verify `maxLength` prop matches expected input length
3. **Invalid State Not Showing**: Ensure `invalidClassName` is passed and CSS class exists
4. **Navigation Problems**: Check `nextInputRef` chain and arrow key handling

### 📋 Testing Checklist

Before considering refactoring complete:
- [ ] All DateInput tests pass
- [ ] Manual testing shows proper styling
- [ ] Invalid state styling works correctly
- [ ] Auto-advance behavior matches TimeInput patterns
- [ ] Arrow key navigation functions properly
- [ ] Theme variables and customization still work

## Related Files for Reference

### Core Components
- `/src/components/Input/PartialInput.tsx` - Base abstraction
- `/src/components/Input/PartialInput.module.scss` - Base styles
- `/src/components/Input/InputDivider.tsx` - Shared separator
- `/src/components/Input/InputDivider.module.scss` - Separator styles

### TimeInput Implementation (Reference)
- `/src/components/TimeInput/TimeInputNative.tsx` - Implementation patterns
- `/src/components/TimeInput/TimeInput.module.scss` - CSS structure
- `/src/components/TimeInput/TimeInput.spec.ts` - Test patterns

### DateInput Target Files
- `/src/components/DateInput/DateInputNative.tsx` - Main implementation
- `/src/components/DateInput/DateInput.module.scss` - CSS module
- `/src/components/DateInput/DateInput.spec.ts` - Test suite

## Conclusion

This refactoring plan captures all critical learnings from the successful TimeInput refactoring. The key to success is following the established patterns:

1. **Use PartialInput** for all individual field components
2. **Apply proper CSS classes** for styling and invalid states
3. **Use InputDivider** for consistent separators
4. **Implement validation logic** appropriate for date constraints
5. **Test thoroughly** to ensure no regressions

The TimeInput refactoring achieved 105/105 passing tests with clean, maintainable code. Following these same patterns should yield similar success for DateInput.
