import React, { type CSSProperties } from "react";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import classnames from "classnames";
import styles from "./DateInput.module.scss";
import { format, parse, isValid } from "date-fns";
import { PartialInput, type BlurDirection } from "../Input/PartialInput";
import { InputDivider } from "../Input/InputDivider";

import type { RegisterComponentApiFn, UpdateStateFn } from "../../abstractions/RendererDefs";
import { useEvent } from "../../components-core/utils/misc";
import { beep } from "../../components-core/utils/audio-utils";
import type { ValidationStatus } from "../abstractions";
import { Adornment } from "../Input/InputAdornment";
import { ItemWithLabel } from "../FormItem/ItemWithLabel";
import Icon from "../Icon/IconNative";
import { partClassName } from "../../components-core/parts";

// Component part names
const PART_DAY = "day";
const PART_MONTH = "month";
const PART_YEAR = "year";
const PART_CLEAR_BUTTON = "clearButton";

// Date validation constants
const MIN_YEAR = 1900;
const MAX_YEAR = 2100;

// Browser compatibility checks
const isIEOrEdgeLegacy =
  typeof window !== "undefined" && /(MSIE|Trident\/|Edge\/)/.test(navigator.userAgent);

// Date format types
export const dateFormats = [
  "MM/dd/yyyy",
  "MM-dd-yyyy",
  "yyyy/MM/dd",
  "yyyy-MM-dd",
  "dd/MM/yyyy",
  "dd-MM-yyyy",
  "yyyyMMdd",
  "MMddyyyy",
] as const;

type DateFormat = (typeof dateFormats)[number];

export const DateInputModeValues = ["single", "range"] as const;
type DateInputMode = (typeof DateInputModeValues)[number];

export const enum WeekDays {
  Sunday = 0,
  Monday = 1,
  Tuesday = 2,
  Wednesday = 3,
  Thursday = 4,
  Friday = 5,
  Saturday = 6,
}

type Props = {
  id?: string;
  initialValue?: string;
  value?: string;
  enabled?: boolean;
  updateState?: UpdateStateFn;
  style?: CSSProperties;
  className?: string;
  onDidChange?: (newValue: string | null) => void;
  onFocus?: (ev: React.FocusEvent<HTMLDivElement>) => void;
  onBlur?: (ev: React.FocusEvent<HTMLDivElement>) => void;
  onInvalidChange?: () => void;
  onBeep?: () => void;
  validationStatus?: ValidationStatus;
  registerComponentApi?: RegisterComponentApiFn;
  mode?: DateInputMode;
  dateFormat?: DateFormat;
  showWeekNumber?: boolean;
  weekStartsOn?: WeekDays;
  minValue?: string;
  maxValue?: string;
  disabledDates?: any;
  inline?: boolean;
  clearable?: boolean;
  clearIcon?: string;
  clearToInitialValue?: boolean;
  required?: boolean;
  startText?: string;
  startIcon?: string;
  endText?: string;
  endIcon?: string;
  gap?: string;
  label?: string;
  labelPosition?: string;
  labelWidth?: string;
  labelBreak?: boolean;
  readOnly?: boolean;
  autoFocus?: boolean;
  mute?: boolean;
  emptyCharacter?: string;
};

export const defaultProps = {
  enabled: true,
  validationStatus: "none" as ValidationStatus,
  mode: "single" as DateInputMode,
  dateFormat: "MM/dd/yyyy" as DateFormat,
  showWeekNumber: false,
  weekStartsOn: WeekDays.Sunday,
  inline: true,
  clearable: false,
  clearToInitialValue: true,
  required: false,
  labelPosition: "top",
  readOnly: false,
  autoFocus: false,
  labelBreak: false,
  mute: false,
  emptyCharacter: "-",
};

export const DateInput = forwardRef<HTMLDivElement, Props>(function DateInputNative(
  {
    id,
    initialValue,
    value: controlledValue,
    enabled = defaultProps.enabled,
    updateState,
    style,
    className,
    onDidChange,
    onFocus,
    onBlur,
    onInvalidChange,
    onBeep,
    validationStatus = defaultProps.validationStatus,
    registerComponentApi,
    mode = defaultProps.mode,
    dateFormat = defaultProps.dateFormat,
    showWeekNumber = defaultProps.showWeekNumber,
    weekStartsOn = defaultProps.weekStartsOn,
    minValue,
    maxValue,
    disabledDates,
    inline = defaultProps.inline,
    clearable = defaultProps.clearable,
    clearIcon,
    clearToInitialValue = defaultProps.clearToInitialValue,
    required = defaultProps.required,
    startText,
    startIcon,
    endText,
    endIcon,
    gap,
    label,
    labelPosition = defaultProps.labelPosition,
    labelWidth,
    labelBreak = defaultProps.labelBreak,
    readOnly = defaultProps.readOnly,
    autoFocus = defaultProps.autoFocus,
    mute = defaultProps.mute,
    emptyCharacter = defaultProps.emptyCharacter,
    ...rest
  },
  ref,
) {
  const dateInputRef = useRef<HTMLDivElement>(null);

  // Refs for auto-tabbing between inputs
  const dayInputRef = useRef<HTMLInputElement>(null);
  const monthInputRef = useRef<HTMLInputElement>(null);
  const yearInputRef = useRef<HTMLInputElement>(null);

  // Process emptyCharacter according to requirements
  const processedEmptyCharacter = useMemo(() => {
    if (!emptyCharacter || emptyCharacter.length === 0) {
      return "-";
    }
    if (emptyCharacter.length > 1) {
      // Use proper unicode-aware character extraction
      const firstChar = [...emptyCharacter][0];
      return firstChar;
    }
    return emptyCharacter;
  }, [emptyCharacter]);

  // Stabilize initialValue to prevent unnecessary re-renders
  const stableInitialValue = useMemo(() => {
    return initialValue;
  }, [initialValue]);

  // Local state management - sync with value prop
  const [localValue, setLocalValue] = useState<string | null>(() => {
    const initial = controlledValue || stableInitialValue || null;
    return initial;
  });

  // Parse current value into individual components
  const [day, setDay] = useState<string | null>(null);
  const [month, setMonth] = useState<string | null>(null);
  const [year, setYear] = useState<string | null>(null);

  // Track whether the component currently has focus
  const [componentHasFocus, setComponentHasFocus] = useState(false);

  // State to track invalid status for visual feedback
  const [isDayCurrentlyInvalid, setIsDayCurrentlyInvalid] = useState(false);
  const [isMonthCurrentlyInvalid, setIsMonthCurrentlyInvalid] = useState(false);
  const [isYearCurrentlyInvalid, setIsYearCurrentlyInvalid] = useState(false);

  useEffect(() => {
    // Initialize XMLUI state with initial value on first mount
    if (updateState && stableInitialValue !== undefined && controlledValue === undefined) {
      updateState({ value: stableInitialValue }, { initial: true });
      return; // Don't sync on this first run, let the state update trigger a re-render
    }

    // Sync with controlled value - always sync when controlledValue changes
    const newLocalValue = controlledValue || null;
    setLocalValue(newLocalValue);
  }, [controlledValue, stableInitialValue, updateState]);

  // Get the order of date inputs based on the format
  const dateOrder = useMemo(() => {
    const format = dateFormat.toLowerCase();

    // Determine the order based on the format pattern
    if (format.startsWith("mm") || format.startsWith("m")) {
      if (format.includes("/dd/yyyy") || format.includes("-dd-yyyy")) {
        return ["month", "day", "year"]; // MM/dd/yyyy or MM-dd-yyyy
      } else {
        return ["month", "day", "year"]; // MMddyyyy
      }
    } else if (format.startsWith("yyyy")) {
      return ["year", "month", "day"]; // yyyy/MM/dd or yyyy-MM-dd
    } else if (format.startsWith("dd")) {
      return ["day", "month", "year"]; // dd/MM/yyyy or dd-MM-yyyy
    } else {
      return ["month", "day", "year"]; // fallback
    }
  }, [dateFormat]);

  // Parse value into individual components
  useEffect(() => {
    if (localValue) {
      const parsedValues = parseDateString(localValue, dateFormat);
      if (parsedValues) {
        setDay(parsedValues.day);
        setMonth(parsedValues.month);
        setYear(parsedValues.year);
      } else {
        setDay(null);
        setMonth(null);
        setYear(null);
      }
    } else {
      setDay(null);
      setMonth(null);
      setYear(null);
    }
  }, [localValue, dateFormat]);

  // Event handlers
  const handleChange = useEvent((newValue: string | null) => {
    // Update local state immediately for immediate UI feedback
    setLocalValue(newValue);

    // Also update the XMLUI state
    if (updateState) {
      updateState({ value: newValue });
    }
    onDidChange?.(newValue);
  });

  // Method to handle beeping - both sound and event
  const handleBeep = useCallback(() => {
    // Play the beep sound only if not muted
    if (!mute) {
      beep(440, 50);
    }
    // Always fire the beep event for alternative implementations
    onBeep?.();
  }, [onBeep, mute]);

  // Helper function to format the complete date value
  const formatDateValue = useCallback(
    (d: string | null, m: string | null, y: string | null): string | null => {
      if (!d || !m || !y) {
        return null;
      }

      // Create a date object and format it according to the dateFormat
      const dayNum = parseInt(d, 10);
      const monthNum = parseInt(m, 10);
      const yearNum = parseInt(y, 10);

      if (isNaN(dayNum) || isNaN(monthNum) || isNaN(yearNum)) {
        return null;
      }

      try {
        // Create date object (month is 0-indexed in Date constructor)
        const date = new Date(yearNum, monthNum - 1, dayNum);

        // Validate the date
        if (
          date.getFullYear() !== yearNum ||
          date.getMonth() !== monthNum - 1 ||
          date.getDate() !== dayNum
        ) {
          return null;
        }

        // Format using the specified format
        return format(date, dateFormat);
      } catch (error) {
        return null;
      }
    },
    [dateFormat],
  );

  // Generic handlers for input change and blur
  const createInputChangeHandler = useCallback(
    (
      field: "day" | "month" | "year",
      setValue: (value: string) => void,
      setInvalid: (invalid: boolean) => void,
      validateFn: (value: string) => boolean,
    ) =>
      (event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = event.target.value;
        setValue(newValue);
        // Update invalid state immediately for visual feedback
        const isInvalid = validateFn(newValue);
        setInvalid(isInvalid);
        // Fire invalid event if the value is invalid
        if (isInvalid) {
          onInvalidChange?.();
        }
        // Don't format/normalize during typing - only on blur
      },
    [onInvalidChange],
  );

  const createInputBlurHandler = useCallback(
    (
      field: "day" | "month" | "year",
      setValue: (value: string) => void,
      setInvalid: (invalid: boolean) => void,
      normalizeFn: (value: string) => string | null,
    ) =>
      (direction: BlurDirection, event: React.FocusEvent<HTMLInputElement>) => {
        const currentValue = event.target.value;
        const normalizedValue = normalizeFn(currentValue);

        // Check if the current value was invalid (needed normalization or couldn't be normalized)
        const wasInvalid =
          currentValue !== "" && (normalizedValue === null || normalizedValue !== currentValue);

        if (wasInvalid) {
          // Play beep sound and fire beep event when manually tabbing out of invalid input
          handleBeep();
        }

        if (normalizedValue !== null && normalizedValue !== currentValue) {
          setValue(normalizedValue);
          setInvalid(false); // Clear invalid state after normalization

          // Always call handleChange to update the date value
          const dateValues = { day, month, year };
          dateValues[field] = normalizedValue;
          const dateString = formatDateValue(dateValues.day, dateValues.month, dateValues.year);
          handleChange(dateString);
        } else if (normalizedValue === null && currentValue !== "") {
          // Reset to previous valid value or clear
          setValue("");
          setInvalid(false); // Clear invalid state
          // Always call handleChange to update the date value (likely to null)
          const dateValues = { day, month, year };
          dateValues[field] = "";
          const dateString = formatDateValue(dateValues.day, dateValues.month, dateValues.year);
          handleChange(dateString);
        } else if (normalizedValue !== null) {
          // Value didn't need normalization, but still update the complete date
          const dateValues = { day, month, year };
          dateValues[field] = normalizedValue;
          const dateString = formatDateValue(dateValues.day, dateValues.month, dateValues.year);
          handleChange(dateString);
        }
      },
    [day, month, year, handleChange, handleBeep],
  );

  // Handle changes from individual inputs
  const handleDayChange = useMemo(
    () =>
      createInputChangeHandler("day", setDay, setIsDayCurrentlyInvalid, (value) =>
        isDayInvalid(value, month, year),
      ),
    [createInputChangeHandler, month, year],
  );

  const handleDayBlur = useMemo(
    () =>
      createInputBlurHandler("day", setDay, setIsDayCurrentlyInvalid, (value) =>
        normalizeDay(value, month, year),
      ),
    [createInputBlurHandler, month, year],
  );

  const handleMonthChange = useMemo(
    () => createInputChangeHandler("month", setMonth, setIsMonthCurrentlyInvalid, isMonthInvalid),
    [createInputChangeHandler],
  );

  const handleMonthBlur = useMemo(
    () => createInputBlurHandler("month", setMonth, setIsMonthCurrentlyInvalid, normalizeMonth),
    [createInputBlurHandler],
  );

  const handleYearChange = useMemo(
    () => createInputChangeHandler("year", setYear, setIsYearCurrentlyInvalid, isYearInvalid),
    [createInputChangeHandler],
  );

  const handleYearBlur = useMemo(
    () => createInputBlurHandler("year", setYear, setIsYearCurrentlyInvalid, normalizeYear),
    [createInputBlurHandler],
  );

  // Focus method
  const focus = useCallback(() => {
    const firstInput = dateInputRef.current?.querySelector("input") as HTMLInputElement;
    firstInput?.focus();
  }, []);

  // Custom focus handler that fires gotFocus when component gains focus
  const handleComponentFocus = useCallback(
    (event: React.FocusEvent<HTMLDivElement>) => {
      // If component didn't have focus before, fire gotFocus
      if (!componentHasFocus) {
        setComponentHasFocus(true);
        onFocus?.(event);
      }
    },
    [componentHasFocus, onFocus],
  );

  // Custom blur handler that only fires lostFocus when focus leaves the entire component
  const handleComponentBlur = useCallback(
    (event: React.FocusEvent<HTMLDivElement>) => {
      // Check if the new focus target is still within this DateInput component
      const relatedTarget = event.relatedTarget as HTMLElement;
      const currentTarget = event.currentTarget;

      // If there's no related target, or the related target is not within this component, fire lostFocus
      if (!relatedTarget || !currentTarget.contains(relatedTarget)) {
        setComponentHasFocus(false);
        onBlur?.(event);
      }
    },
    [onBlur],
  );

  // Arrow key navigation handler
  const createArrowKeyHandler = useCallback(() => {
    return (event: React.KeyboardEvent<HTMLInputElement>) => {
      const { key } = event;

      if (key === "ArrowRight") {
        event.preventDefault();
        const currentTarget = event.target as HTMLInputElement;

        // Determine next input based on current input
        if (currentTarget === monthInputRef.current && dayInputRef.current) {
          dayInputRef.current.focus();
          dayInputRef.current.select();
        } else if (currentTarget === dayInputRef.current && yearInputRef.current) {
          yearInputRef.current.focus();
          yearInputRef.current.select();
        }
      } else if (key === "ArrowLeft") {
        event.preventDefault();
        const currentTarget = event.target as HTMLInputElement;

        // Determine previous input based on current input
        if (currentTarget === dayInputRef.current && monthInputRef.current) {
          monthInputRef.current.focus();
          monthInputRef.current.select();
        } else if (currentTarget === yearInputRef.current && dayInputRef.current) {
          dayInputRef.current.focus();
          dayInputRef.current.select();
        }
      }
    };
  }, []);

  // Create the arrow key handler instance
  const handleArrowKeys = createArrowKeyHandler();

  const clear = useCallback(() => {
    // Reset to initial value if provided, otherwise null
    let valueToReset = clearToInitialValue
      ? stableInitialValue !== undefined
        ? stableInitialValue
        : null
      : null;

    if (valueToReset) {
      const parsedValues = parseDateString(valueToReset, dateFormat);
      if (parsedValues) {
        setDay(parsedValues.day);
        setMonth(parsedValues.month);
        setYear(parsedValues.year);
      } else {
        setDay(null);
        setMonth(null);
        setYear(null);
      }
    } else {
      // Clear all fields
      setDay(null);
      setMonth(null);
      setYear(null);
    }

    handleChange(valueToReset);

    // Focus the component after clearing
    setTimeout(() => {
      focus();
    }, 0);
  }, [stableInitialValue, handleChange, dateFormat, clearToInitialValue, focus]);

  function stopPropagation(event: React.FocusEvent) {
    event.stopPropagation();
  }

  const setValue = useEvent((newValue: string | null) => {
    handleChange(newValue);
  });

  // Component API registration
  useImperativeHandle(ref, () => dateInputRef.current as HTMLDivElement);

  useEffect(() => {
    if (registerComponentApi) {
      registerComponentApi({
        focus,
        setValue,
      });
    }
  }, [registerComponentApi, focus, setValue]);

  // Custom clear icon
  const clearIconElement = useMemo(() => {
    if (clearIcon === null || clearIcon === "null") return null;
    if (clearIcon) return <Icon name={clearIcon} />;
    // Default clear icon
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={19}
        height={19}
        viewBox="0 0 19 19"
        stroke="currentColor"
        strokeWidth={2}
        aria-hidden="true"
        className={classnames(styles.clearButtonIcon, styles.buttonIcon)}
      >
        <line x1="4" x2="15" y1="4" y2="15" />
        <line x1="15" x2="4" y1="4" y2="15" />
      </svg>
    );
  }, [clearIcon]);

  // Adornments
  const startAdornment = useMemo(() => {
    if (startIcon || startText) {
      return <Adornment iconName={startIcon} text={startText} className={styles.adornment} />;
    }
    return null;
  }, [startIcon, startText]);

  const endAdornment = useMemo(() => {
    if (endIcon || endText) {
      return <Adornment iconName={endIcon} text={endText} className={styles.adornment} />;
    }
    return null;
  }, [endIcon, endText]);

  // Helper function to get input refs based on order
  const getInputRefs = useCallback(() => {
    const refs = {
      day: dayInputRef,
      month: monthInputRef,
      year: yearInputRef,
    };
    return dateOrder.map((field) => refs[field as keyof typeof refs]);
  }, [dateOrder]);

  // Helper function to create input components in the right order
  const createDateInputs = () => {
    const inputRefs = getInputRefs();

    return dateOrder.map((field, index) => {
      const nextRef = index < inputRefs.length - 1 ? inputRefs[index + 1] : undefined;

      const getSeparator = () => {
        if (index === dateOrder.length - 1) return null;

        // Get separator based on format
        if (dateFormat.includes("/")) return "/";
        if (dateFormat.includes("-")) return "-";
        return "";
      };

      switch (field) {
        case "day":
          return (
            <React.Fragment key="day">
              <DayInput
                autoFocus={autoFocus && index === 0}
                disabled={!enabled}
                inputRef={dayInputRef}
                nextInputRef={nextRef}
                minValue={minValue}
                maxValue={maxValue}
                onChange={handleDayChange}
                onBlur={handleDayBlur}
                onKeyDown={handleArrowKeys}
                readOnly={readOnly}
                required={required}
                value={day}
                isInvalid={isDayCurrentlyInvalid}
                month={month}
                year={year}
                onBeep={handleBeep}
                emptyCharacter={processedEmptyCharacter}
              />
              {getSeparator() && <InputDivider separator={getSeparator()} />}
            </React.Fragment>
          );
        case "month":
          return (
            <React.Fragment key="month">
              <MonthInput
                autoFocus={autoFocus && index === 0}
                disabled={!enabled}
                inputRef={monthInputRef}
                nextInputRef={nextRef}
                minValue={minValue}
                maxValue={maxValue}
                onChange={handleMonthChange}
                onBlur={handleMonthBlur}
                onKeyDown={handleArrowKeys}
                readOnly={readOnly}
                required={required}
                value={month}
                isInvalid={isMonthCurrentlyInvalid}
                onBeep={handleBeep}
                emptyCharacter={processedEmptyCharacter}
              />
              {getSeparator() && <InputDivider separator={getSeparator()} />}
            </React.Fragment>
          );
        case "year":
          return (
            <React.Fragment key="year">
              <YearInput
                autoFocus={autoFocus && index === 0}
                disabled={!enabled}
                inputRef={yearInputRef}
                nextInputRef={nextRef}
                minValue={minValue}
                maxValue={maxValue}
                onChange={handleYearChange}
                onBlur={handleYearBlur}
                onKeyDown={handleArrowKeys}
                readOnly={readOnly}
                required={required}
                value={year}
                isInvalid={isYearCurrentlyInvalid}
                dateFormat={dateFormat}
                onBeep={handleBeep}
                emptyCharacter={processedEmptyCharacter}
              />
              {getSeparator() && <InputDivider separator={getSeparator()} />}
            </React.Fragment>
          );
        default:
          return null;
      }
    });
  };

  const dateInputComponent = (
    <div
      ref={dateInputRef}
      className={classnames(
        styles.dateInputWrapper,
        {
          [styles.error]: validationStatus === "error",
          [styles.warning]: validationStatus === "warning",
          [styles.valid]: validationStatus === "valid",
          [styles.disabled]: !enabled,
          [styles.readOnly]: readOnly,
        },
        className,
      )}
      style={{ ...style, gap }}
      onFocusCapture={handleComponentFocus}
      onBlur={handleComponentBlur}
      data-validation-status={validationStatus}
      {...rest}
    >
      {startAdornment}
      <div className={styles.wrapper}>
        <div className={styles.inputGroup}>{createDateInputs()}</div>

        {clearable && (
          <button
            className={classnames(
              partClassName(PART_CLEAR_BUTTON),
              styles.clearButton,
              styles.button,
            )}
            disabled={!enabled}
            onClick={clear}
            onFocus={stopPropagation}
            type="button"
          >
            {clearIconElement}
          </button>
        )}
      </div>
      {endAdornment}
    </div>
  );

  // Wrap with label if needed
  if (label) {
    return (
      <ItemWithLabel
        label={label}
        labelPosition={labelPosition as any}
        labelWidth={labelWidth}
        labelBreak={labelBreak}
        required={required}
      >
        {dateInputComponent}
      </ItemWithLabel>
    );
  }

  return dateInputComponent;
});

// Input component types
type InputProps = {
  ariaLabel?: string;
  autoFocus?: boolean;
  className?: string;
  disabled?: boolean;
  inputRef?: React.RefObject<HTMLInputElement | null>;
  max: number;
  min: number;
  name: string;
  nextInputRef?: React.RefObject<HTMLInputElement | null>; // For auto-tabbing to next input
  onChange?: (event: React.ChangeEvent<HTMLInputElement> & { target: HTMLInputElement }) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement> & { target: HTMLInputElement }) => void;
  onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement> & { target: HTMLInputElement }) => void;
  onKeyUp?: (event: React.KeyboardEvent<HTMLInputElement> & { target: HTMLInputElement }) => void;
  placeholder?: string;
  readOnly?: boolean;
  required?: boolean;
  step?: number;
  value?: string | null;
  maxLength?: number;
  isInvalid?: boolean; // To prevent auto-tabbing when value is invalid
  validateFn?: (value: string) => boolean; // Function to validate the current input value
  onBeep?: () => void; // Function to handle beep sound and event
};

// Input component
function Input({
  ariaLabel,
  autoFocus,
  className,
  disabled,
  inputRef,
  max,
  min,
  name,
  nextInputRef, // For auto-tabbing to next input
  onChange,
  onBlur,
  onKeyDown,
  onKeyUp,
  placeholder,
  readOnly,
  required,
  step,
  value,
  maxLength = 2,
  isInvalid = false, // To prevent auto-tabbing when value is invalid
  validateFn, // Function to validate the current input value
  onBeep, // Function to handle beep sound and event
}: InputProps): React.ReactElement {
  // Handle input changes with auto-tabbing logic
  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = event.target.value;

      // Call the original onChange handler
      if (onChange) {
        onChange(event);
      }

      // Auto-tab to next input if we have reached max length, value is numeric, and value is valid
      if (newValue.length === maxLength && /^\d+$/.test(newValue)) {
        // Check if the new value is valid before auto-tabbing
        const isValueInvalid = validateFn ? validateFn(newValue) : false;

        if (!isValueInvalid) {
          // Small delay to ensure the current input is properly updated
          setTimeout(() => {
            if (nextInputRef?.current) {
              // Tab to next input field
              nextInputRef.current.focus();
              nextInputRef.current.select();
            }
          }, 0);
        } else {
          // Input is ready for auto-tab but invalid - play beep sound and fire event
          onBeep?.();
        }
      }
    },
    [onChange, nextInputRef, maxLength, validateFn, onBeep],
  );

  return (
    <>
      <input
        aria-label={ariaLabel}
        autoComplete="off"
        // biome-ignore lint/a11y/noAutofocus: This is up to developers' decision
        autoFocus={autoFocus}
        className={classnames(styles.input, className)}
        data-input="true"
        disabled={disabled}
        inputMode="numeric"
        max={max}
        maxLength={maxLength}
        min={min}
        name={name}
        onChange={handleInputChange}
        onBlur={onBlur}
        onFocus={onFocus}
        onKeyDown={onKeyDown}
        onKeyUp={onKeyUp}
        placeholder={placeholder || "--"}
        readOnly={readOnly}
        // Assertion is needed for React 18 compatibility
        ref={inputRef as React.RefObject<HTMLInputElement>}
        required={required}
        step={step}
        type="text"
        value={value !== null ? value : ""}
      />
    </>
  );
}

// DayInput component
type DayInputProps = {
  minValue?: string;
  maxValue?: string;
  value?: string | null;
  isInvalid?: boolean;
  month?: string | null;
  year?: string | null;
  onBeep?: () => void;
  emptyCharacter?: string;
} & Omit<
  React.ComponentProps<typeof PartialInput>,
  | "max"
  | "min"
  | "name"
  | "value"
  | "maxLength"
  | "validateFn"
  | "emptyCharacter"
  | "placeholderLength"
>;

function DayInput({
  minValue,
  maxValue,
  value,
  isInvalid = false,
  month,
  year,
  onBeep,
  emptyCharacter = "-",
  ...otherProps
}: DayInputProps): React.ReactElement {
  // Calculate max days for the current month/year
  const maxDay = useMemo(() => {
    if (month && year) {
      const monthNum = parseInt(month, 10);
      const yearNum = parseInt(year, 10);
      if (!isNaN(monthNum) && !isNaN(yearNum)) {
        return new Date(yearNum, monthNum, 0).getDate();
      }
    }
    return 31; // Default to 31 if month/year not available
  }, [month, year]);

  return (
    <PartialInput
      value={value}
      emptyCharacter={emptyCharacter}
      placeholderLength={2}
      max={Math.min(maxDay, 31)}
      min={1}
      maxLength={2}
      validateFn={(val) => isDayInvalid(val, month, year)}
      onBeep={onBeep}
      onChange={otherProps.onChange}
      onBlur={(direction, event) => {
        // PartialInput provides direction, but current onBlur expects just event
        if (otherProps.onBlur) {
          // Provide both direction and event to match the expected signature
          otherProps.onBlur(direction, event);
        }
      }}
      onKeyDown={otherProps.onKeyDown}
      className={classnames(partClassName(PART_DAY), styles.input, styles.day)}
      invalidClassName={styles.invalid}
      disabled={otherProps.disabled}
      readOnly={otherProps.readOnly}
      required={otherProps.required}
      autoFocus={otherProps.autoFocus}
      inputRef={otherProps.inputRef}
      nextInputRef={otherProps.nextInputRef}
      name="day"
      ariaLabel={otherProps.ariaLabel}
      isInvalid={isInvalid}
    />
  );
}

// MonthInput component
type MonthInputProps = {
  minValue?: string;
  maxValue?: string;
  value?: string | null;
  isInvalid?: boolean;
  onBeep?: () => void;
  emptyCharacter?: string;
} & Omit<React.ComponentProps<typeof PartialInput>, "max" | "min" | "name" | "value" | "maxLength">;

function MonthInput({
  minValue,
  maxValue,
  value,
  isInvalid = false,
  onBeep,
  emptyCharacter = "-",
  ...otherProps
}: MonthInputProps): React.ReactElement {
  return (
    <PartialInput
      max={12}
      min={1}
      name="month"
      value={value}
      invalidClassName={styles.invalid}
      isInvalid={isInvalid}
      validateFn={isMonthInvalid}
      onBeep={onBeep}
      onChange={otherProps.onChange}
      emptyCharacter={emptyCharacter}
      placeholderLength={2}
      className={classnames(partClassName(PART_MONTH), styles.input, styles.month)}
      maxLength={2}
      onBlur={(direction, event) => {
        // PartialInput provides direction, but current onBlur expects just event
        if (otherProps.onBlur) {
          // Provide both direction and event to match the expected signature
          otherProps.onBlur(direction, event);
        }
      }}
    />
  );
}

// YearInput component
type YearInputProps = {
  minValue?: string;
  maxValue?: string;
  value?: string | null;
  isInvalid?: boolean;
  dateFormat?: DateFormat;
  onBeep?: () => void;
  emptyCharacter?: string;
} & Omit<React.ComponentProps<typeof PartialInput>, "max" | "min" | "name" | "value" | "maxLength">;

function YearInput({
  minValue,
  maxValue,
  value,
  isInvalid = false,
  dateFormat = "MM/dd/yyyy",
  onBeep,
  emptyCharacter = "-",
  ...otherProps
}: YearInputProps): React.ReactElement {
  // Always use 4-digit year format
  const maxLength = 4;

  const currentYear = new Date().getFullYear();
  const min = 1900;
  const max = currentYear + 100;

  const { className: originalClassName, ...restProps } = otherProps;

  return (
    <PartialInput
      max={max}
      min={min}
      name="year"
      value={value}
      isInvalid={isInvalid}
      invalidClassName={styles.invalid}
      validateFn={isYearInvalid}
      onBeep={onBeep}
      emptyCharacter={emptyCharacter}
      placeholderLength={4}
      className={classnames(partClassName(PART_YEAR), styles.input, styles.year, originalClassName)}
      maxLength={maxLength}
      onBlur={(direction, event) => {
        // PartialInput provides direction, but current onBlur expects just event
        if (otherProps.onBlur) {
          // Provide both direction and event to match the expected signature
          otherProps.onBlur(direction, event);
        }
      }}
      {...restProps}
    />
  );
}

// Input helper functions
function onFocus(event: React.FocusEvent<HTMLInputElement>) {
  const { target } = event;

  if (isIEOrEdgeLegacy) {
    requestAnimationFrame(() => target.select());
  } else {
    target.select();
  }
}

// Utility function to parse date string into components
function parseDateString(dateString: string, dateFormat: DateFormat) {
  try {
    // Try to parse the date using the specified format
    const parsedDate = parse(dateString, dateFormat, new Date());

    if (!isValid(parsedDate)) {
      return null;
    }

    return {
      day: parsedDate.getDate().toString().padStart(2, "0"),
      month: (parsedDate.getMonth() + 1).toString().padStart(2, "0"),
      year: parsedDate.getFullYear().toString(),
    };
  } catch (error) {
    return null;
  }
}

// Normalize functions
function normalizeDay(
  value: string | null,
  month: string | null,
  year: string | null,
): string | null {
  if (!value || value === "") return null;

  const num = parseInt(value, 10);
  if (isNaN(num)) return null;

  // Calculate max days for the current month/year
  let maxDay = 31;
  if (month && year) {
    const monthNum = parseInt(month, 10);
    const yearNum = parseInt(year, 10);
    if (!isNaN(monthNum) && !isNaN(yearNum)) {
      maxDay = new Date(yearNum, monthNum, 0).getDate();
    }
  }

  if (num >= 1 && num <= maxDay) {
    return num.toString().padStart(2, "0");
  } else {
    // Keep value % 10. In case of "0" use "01"
    const normalizedValue = num % 10;
    if (normalizedValue === 0) {
      return "01";
    } else {
      return normalizedValue.toString().padStart(2, "0");
    }
  }
}

function normalizeMonth(value: string | null): string | null {
  if (!value || value === "") return null;

  const num = parseInt(value, 10);
  if (isNaN(num)) return null;

  if (num >= 1 && num <= 12) {
    return num.toString().padStart(2, "0");
  } else {
    // Keep the last digit. Use "0" as the first digit. In case of "0" use "01"
    const lastDigit = num % 10;
    if (lastDigit === 0) {
      return "01";
    } else {
      return `0${lastDigit}`;
    }
  }
}

function normalizeYear(value: string | null): string | null {
  if (!value || value === "") return null;

  const num = parseInt(value, 10);
  if (isNaN(num)) return null;

  if (num >= MIN_YEAR && num <= MAX_YEAR) {
    return num.toString();
  } else {
    // Keep the last two year digits and use "20" as the first two digits if the resulting year is not in the future; otherwise, use "19" as the first two digits
    const lastTwoDigits = num % 100;
    const currentYear = new Date().getFullYear();
    const candidate20 = 2000 + lastTwoDigits;
    const candidate19 = 1900 + lastTwoDigits;

    // Use "20" if the resulting year is not in the future; otherwise, use "19"
    if (candidate20 <= currentYear) {
      return candidate20.toString();
    } else {
      return candidate19.toString();
    }
  }
}

// Validation functions
function isDayInvalid(value: string | null, month: string | null, year: string | null): boolean {
  if (!value || value === "") return false;

  const num = parseInt(value, 10);
  if (isNaN(num)) return true;

  // Calculate max days for the current month/year
  let maxDay = 31;
  if (month && year) {
    const monthNum = parseInt(month, 10);
    const yearNum = parseInt(year, 10);
    if (!isNaN(monthNum) && !isNaN(yearNum)) {
      maxDay = new Date(yearNum, monthNum, 0).getDate();
    }
  }

  return num < 1 || num > maxDay;
}

function isMonthInvalid(value: string | null): boolean {
  if (!value || value === "") return false;

  const num = parseInt(value, 10);
  if (isNaN(num)) return true;

  return num < 1 || num > 12;
}

function isYearInvalid(value: string | null): boolean {
  if (!value || value === "") return false;

  const num = parseInt(value, 10);
  if (isNaN(num)) return true;

  // Invalid if out of the minimum and maximum year range
  return num < MIN_YEAR || num > MAX_YEAR;
}
