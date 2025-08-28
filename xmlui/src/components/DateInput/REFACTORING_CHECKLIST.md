# DateInput Refactoring Quick Reference

## Implementation Checklist

### Phase 1: Setup ✅
- [ ] Create backup files: `DateInputNative.tsx.backup`, `DateInput.module.scss.backup`
- [ ] Analyze current DateInput structure and document API
- [ ] Review existing test suite and identify critical functionality

### Phase 2: Individual Components 🔧
- [ ] Create `DayInput` component using PartialInput
- [ ] Create `MonthInput` component using PartialInput  
- [ ] Create `YearInput` component using PartialInput
- [ ] Implement date-specific validation logic for each component

### Phase 3: Integration 🔗
- [ ] Update main DateInput component to use new sub-components
- [ ] Add InputDivider components for separators
- [ ] Set up proper navigation chain (nextInputRef)
- [ ] Implement arrow key navigation handling

### Phase 4: CSS Updates 🎨
- [ ] Add `@layer components` to CSS module
- [ ] Add `.input`, `.day`, `.month`, `.year` classes
- [ ] Add `.invalid` class for invalid state styling
- [ ] Add `.divider` class for separator styling
- [ ] Update theme variables if needed

### Phase 5: Testing & Validation ✅
- [ ] Run DateInput test suite: `npx playwright test src/components/DateInput/DateInput.spec.ts --reporter=line`
- [ ] Check TypeScript compilation: `npx tsc --noEmit --project tsconfig.json`
- [ ] Manual testing of all functionality
- [ ] Verify invalid state styling works
- [ ] Test auto-advance behavior
- [ ] Test arrow key navigation

## Critical Props for PartialInput

```typescript
// Essential props for each date input component
<PartialInput
  value={value}
  emptyCharacter={emptyCharacter}
  placeholderLength={2} // or 4 for year
  max={31} // or 12 for month, 9999 for year
  min={1} // or 1000 for year
  maxLength={2} // or 4 for year
  validateFn={validateFunction}
  className={classnames(partClassName(PART_NAME), styles.input, styles.fieldType, "dateinput")}
  invalidClassName={styles.invalid} // CRITICAL for styling
  onChange={handleChange}
  onBlur={handleBlur}
  onKeyDown={handleKeyDown}
  inputRef={inputRef}
  nextInputRef={nextInputRef}
  disabled={disabled}
  readOnly={readOnly}
  required={required}
  isInvalid={isInvalid}
  onBeep={onBeep}
  name={fieldName}
/>
```

## Required CSS Classes

```scss
@layer components {
  .input {
    // Base styling for all date inputs
  }
  
  .day, .month {
    width: 2.5ch;
    min-width: 2.5ch;
    max-width: 2.5ch;
    text-align: center;
  }
  
  .year {
    width: 4.5ch; 
    min-width: 4.5ch;
    max-width: 4.5ch;
    text-align: center;
  }
  
  .invalid {
    background: $backgroundColor-input-DateInput-invalid;
  }
  
  .divider {
    padding: $spacing-divider-DateInput;
    color: $color-divider-DateInput;
  }
}
```

## Success Metrics

- ✅ All DateInput tests pass (target: 100% like TimeInput)
- ✅ No TypeScript compilation errors
- ✅ Invalid state styling visible and working
- ✅ Auto-advance between fields works correctly
- ✅ Arrow key navigation functions properly
- ✅ Date validation respects month lengths and leap years
