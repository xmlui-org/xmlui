# DateInput Technical Reference

## Code Patterns from TimeInput Success

### 1. PartialInput Component Pattern

#### TypeScript Interface Pattern
```typescript
type DateFieldInputProps = {
  value?: string | null;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  
  // Navigation refs
  inputRef?: React.RefObject<HTMLInputElement | null>;
  nextInputRef?: React.RefObject<HTMLInputElement | null>;
  nextButtonRef?: React.RefObject<HTMLButtonElement | null>;
  
  // Validation context (date-specific)
  day?: string | null;
  month?: string | null;
  year?: string | null;
  minDate?: string;
  maxDate?: string;
  
  // Standard input props
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  autoFocus?: boolean;
  isInvalid?: boolean;
  
  // DateInput specific
  emptyCharacter?: string;
  onBeep?: () => void;
  ariaLabel?: string;
};
```

#### Component Implementation Pattern
```typescript
function DayInput({ 
  value, 
  onChange, 
  onBlur, 
  onKeyDown,
  inputRef,
  nextInputRef,
  nextButtonRef,
  month,
  year,
  minDate,
  maxDate,
  disabled,
  readOnly,
  required,
  autoFocus,
  isInvalid,
  emptyCharacter,
  onBeep,
  ariaLabel,
  ...otherProps 
}: DayInputProps) {
  
  // Date-specific validation logic
  const validateDay = useCallback((val: string) => {
    const dayNum = parseInt(val, 10);
    if (isNaN(dayNum) || dayNum < 1 || dayNum > 31) return true;
    
    // Context-aware validation
    if (month && year) {
      const monthNum = parseInt(month, 10);
      const yearNum = parseInt(year, 10);
      const daysInMonth = getDaysInMonth(monthNum, yearNum);
      return dayNum > daysInMonth;
    }
    
    return false;
  }, [month, year, minDate, maxDate]);

  // Calculate min/max for PartialInput
  const { maxDay, minDay } = useMemo(() => {
    // Logic to determine valid day range based on month/year/minDate/maxDate
    return { maxDay: 31, minDay: 1 }; // Simplified
  }, [month, year, minDate, maxDate]);

  return (
    <PartialInput
      value={value}
      emptyCharacter={emptyCharacter}
      placeholderLength={2}
      max={maxDay}
      min={minDay}
      maxLength={2}
      validateFn={validateDay}
      onBeep={onBeep}
      onChange={otherProps.onChange}
      onBlur={(direction, event) => {
        // PartialInput provides direction, current onBlur expects just event
        if (otherProps.onBlur) {
          otherProps.onBlur(event);
        }
      }}
      onKeyDown={otherProps.onKeyDown}
      className={classnames(partClassName(PART_DAY), styles.input, styles.day, "dateinput", {
        [styles.invalid]: isInvalid,
      })}
      invalidClassName={styles.invalid}
      disabled={otherProps.disabled}
      readOnly={otherProps.readOnly}
      required={otherProps.required}
      autoFocus={otherProps.autoFocus}
      inputRef={otherProps.inputRef}
      nextInputRef={otherProps.nextInputRef}
      nextButtonRef={otherProps.nextButtonRef}
      name="day"
      ariaLabel={otherProps.ariaLabel}
      isInvalid={isInvalid}
    />
  );
}
```

### 2. Main Component Integration Pattern

#### Component Constants
```typescript
// Component part names for CSS targeting
const PART_DAY = "day";
const PART_MONTH = "month";
const PART_YEAR = "year";
const PART_CLEAR_BUTTON = "clearButton";
```

#### Ref Management Pattern
```typescript
// Input refs for navigation
const dayInputRef = useRef<HTMLInputElement>(null);
const monthInputRef = useRef<HTMLInputElement>(null);
const yearInputRef = useRef<HTMLInputElement>(null);
const clearButtonRef = useRef<HTMLButtonElement>(null);
```

#### JSX Integration Pattern
```typescript
<div className={styles.inputGroup}>
  {/* Day input */}
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
    autoFocus={autoFocus}
    isInvalid={isDayCurrentlyInvalid}
    emptyCharacter={processedEmptyCharacter}
    onBeep={handleBeep}
  />

  <InputDivider separator="/" className={styles.divider} />

  {/* Month input */}
  <MonthInput
    value={month}
    onChange={handleMonthChange}
    onBlur={handleMonthBlur}
    onKeyDown={handleArrowKeys}
    inputRef={monthInputRef}
    nextInputRef={yearInputRef}
    day={day}
    year={year}
    minDate={minDate}
    maxDate={maxDate}
    disabled={!enabled}
    readOnly={readOnly}
    required={required}
    isInvalid={isMonthCurrentlyInvalid}
    emptyCharacter={processedEmptyCharacter}
    onBeep={handleBeep}
  />

  <InputDivider separator="/" className={styles.divider} />

  {/* Year input */}
  <YearInput
    value={year}
    onChange={handleYearChange}
    onBlur={handleYearBlur}
    onKeyDown={handleArrowKeys}
    inputRef={yearInputRef}
    nextButtonRef={clearButtonRef}
    day={day}
    month={month}
    minDate={minDate}
    maxDate={maxDate}
    disabled={!enabled}
    readOnly={readOnly}
    required={required}
    isInvalid={isYearCurrentlyInvalid}
    emptyCharacter={processedEmptyCharacter}
    onBeep={handleBeep}
  />
</div>
```

### 3. CSS Module Structure

#### Complete CSS Layer Pattern
```scss
@use "../../components-core/theming/themes" as t;

// Theme variable setup (copy from TimeInput pattern)
$themeVars: ();
@function createThemeVar($componentVariable) {
  $themeVars: t.appendThemeVar($themeVars, $componentVariable) !global;
  @return t.getThemeVar($themeVars, $componentVariable);
}

$componentName: "DateInput";

// DateInput specific theme variables
$color-divider-DateInput: createThemeVar("color-divider-#{$componentName}");
$spacing-divider-DateInput: createThemeVar("spacing-divider-#{$componentName}");
$minWidth-input-DateInput: createThemeVar("minWidth-input-#{$componentName}");
$padding-input-DateInput: createThemeVar("padding-input-#{$componentName}");
$fontSize-input-DateInput: createThemeVar("fontSize-input-#{$componentName}");
$borderRadius-input-DateInput: createThemeVar("borderRadius-input-#{$componentName}");
$backgroundColor-input-DateInput-invalid: createThemeVar("backgroundColor-input-#{$componentName}-invalid");

@layer components {
  .dateInputWrapper {
    display: flex;
    align-items: center;
    width: fit-content;
    border-style: solid;
    border-width: 1px;
    transition: $transition-background-DateInput;
    overflow: hidden;
    gap: createThemeVar("Input:gap-adornment-#{$componentName}");

    &.disabled {
      opacity: $opacity-DateInput--disabled;
      pointer-events: none;
    }
    
    &.readOnly {
      .dateInputWrapper input {
        cursor: default;
      }
    }

    // Variant mixins (copy from TimeInput)
    @include variant("default");
    &.error { @include variant("error"); }
    &.warning { @include variant("warning"); }
    &.valid { @include variant("success"); }
  }

  .inputGroup {
    display: flex;
    align-items: center;
    flex-grow: 1;
    min-width: 0;
    gap: 0;
    padding: 0 0.125rem;
    box-sizing: border-box;
  }

  .divider {
    padding: $spacing-divider-DateInput;
    white-space: pre;
    display: inline-block;
    font: inherit;
    color: $color-divider-DateInput;
  }

  .input {
    min-width: $minWidth-input-DateInput;
    height: 100%;
    position: relative;
    padding: $padding-input-DateInput;
    border: 0;
    background: none;
    color: currentColor;
    font: inherit;
    font-size: $fontSize-input-DateInput;
    box-sizing: content-box;
    border-radius: $borderRadius-input-DateInput;
    -webkit-appearance: textfield;
    -moz-appearance: textfield;
    appearance: textfield;

    // Specific widths for different input types
    &.day,
    &.month {
      width: 2.5ch;
      min-width: 2.5ch;
      max-width: 2.5ch;
      text-align: center;
      padding: $padding-input-DateInput !important;
      box-sizing: border-box !important;
    }

    &.year {
      width: 4.5ch;
      min-width: 4.5ch;
      max-width: 4.5ch;
      text-align: center;
      padding: $padding-input-DateInput !important;
      box-sizing: border-box !important;
    }

    // Hide spin buttons
    &::-webkit-outer-spin-button,
    &::-webkit-inner-spin-button {
      -webkit-appearance: none !important;
      margin: 0 !important;
      display: none !important;
    }

    &[type="number"] {
      -moz-appearance: textfield !important;
    }

    &:invalid {
      background: $backgroundColor-input-DateInput-invalid;
    }
  }
}

// Export invalid class for CSS modules
.invalid {
  background: $backgroundColor-input-DateInput-invalid;
}

// Export theme variables
:export {
  themeVars: t.json-stringify($themeVars)
}
```

### 4. Date Validation Utilities

#### Helper Functions Pattern
```typescript
// Date utility functions for validation
function getDaysInMonth(month: number, year: number): number {
  // Handle leap years and varying month lengths
  const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  
  if (month === 2 && isLeapYear(year)) {
    return 29;
  }
  
  return daysInMonth[month - 1] || 31;
}

function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

function isDateInRange(day: number, month: number, year: number, minDate?: string, maxDate?: string): boolean {
  const date = new Date(year, month - 1, day);
  
  if (minDate) {
    const min = new Date(minDate);
    if (date < min) return false;
  }
  
  if (maxDate) {
    const max = new Date(maxDate);
    if (date > max) return false;
  }
  
  return true;
}
```

### 5. Event Handling Patterns

#### Arrow Key Navigation Pattern
```typescript
const handleArrowKeys = useEvent((event: React.KeyboardEvent<HTMLInputElement>) => {
  const target = event.target as HTMLInputElement;
  
  if (event.key === "ArrowRight") {
    event.preventDefault();
    
    // Navigate to next input
    if (target === dayInputRef.current) {
      monthInputRef.current?.focus();
    } else if (target === monthInputRef.current) {
      yearInputRef.current?.focus();
    }
    // Year is last field, no navigation
  } else if (event.key === "ArrowLeft") {
    event.preventDefault();
    
    // Navigate to previous input
    if (target === yearInputRef.current) {
      monthInputRef.current?.focus();
    } else if (target === monthInputRef.current) {
      dayInputRef.current?.focus();
    }
    // Day is first field, no navigation
  }
});
```

#### Change Handler Pattern
```typescript
const handleDayChange = useEvent((event: React.ChangeEvent<HTMLInputElement>) => {
  const newDay = event.target.value;
  setDay(newDay);
  
  // Trigger overall date change if all fields are valid
  if (newDay && month && year) {
    const dateString = `${year}-${month.padStart(2, '0')}-${newDay.padStart(2, '0')}`;
    handleChange(dateString);
  }
});
```

### 6. Testing Patterns

#### Driver Pattern Updates
```typescript
// Update DateInputDriver to work with new structure
export class DateInputDriver {
  get dayInput() {
    return this.component.locator('[name="day"]');
  }
  
  get monthInput() {
    return this.component.locator('[name="month"]');
  }
  
  get yearInput() {
    return this.component.locator('[name="year"]');
  }
  
  get dividers() {
    return this.component.locator('.inputDivider');
  }
}
```

#### Test Case Patterns
```typescript
test("auto-tabs from day to month after typing two digits", async ({ initTestBed, page, createDateInputDriver }) => {
  await initTestBed(`<DateInput testId="dateInput" />`);
  const driver = await createDateInputDriver("dateInput");
  
  await driver.dayInput.focus();
  await driver.dayInput.selectText();
  await page.keyboard.type("15");
  
  await expect(driver.dayInput).toHaveValue("15");
  await expect(driver.monthInput).toBeFocused();
});

test("validates day based on month and year", async ({ initTestBed, createDateInputDriver }) => {
  await initTestBed(`<DateInput testId="dateInput" />`);
  const driver = await createDateInputDriver("dateInput");
  
  // Set February in non-leap year
  await driver.monthInput.fill("02");
  await driver.yearInput.fill("2023");
  
  // Try to enter invalid day (30th of February)
  await driver.dayInput.fill("30");
  await driver.dayInput.blur();
  
  // Should show invalid styling
  await expect(driver.dayInput).toHaveClass(/invalid/);
});
```

## Key Success Factors

1. **Follow PartialInput Pattern**: Use exactly the same props and patterns as TimeInput
2. **CSS Class Mapping**: Ensure `.day`, `.month`, `.year`, `.invalid` classes are properly applied
3. **InputDivider Usage**: Use shared component for consistent separators
4. **Validation Logic**: Implement date-specific validation that considers month lengths and leap years
5. **Navigation Chain**: Set up proper `nextInputRef` chain for smooth tab progression
6. **Testing Coverage**: Cover all the same scenarios as TimeInput but with date-specific logic
