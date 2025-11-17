import { type CSSProperties } from "react";
import { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from "react";
import classnames from "classnames";
import styles from "./TimeInput.module.scss";
import { PartialInput } from "../Input/PartialInput";
import { InputDivider } from "../Input/InputDivider";

import type { RegisterComponentApiFn, UpdateStateFn } from "../../abstractions/RendererDefs";
import { useEvent } from "../../components-core/utils/misc";
import type { ValidationStatus } from "../abstractions";
import { Adornment } from "../Input/InputAdornment";
import Icon from "../Icon/IconNative";

// Import utilities and types from merged utils file
import {
  getHours,
  getMinutes,
  getSeconds,
  convert24to12,
  getAmPmLabels,
  safeMax,
  safeMin,
  type AmPmType,
} from "./utils";
import { Part } from "../Part/Part";

// Component part names
/* const PART_HOUR = "hour";
const PART_MINUTE = "minute";
const PART_SECOND = "second";
const PART_AMPM = "ampm";
const PART_CLEAR_BUTTON = "clearButton"; */

// Browser compatibility checks
// Time format configuration flags
export type TimeInputConfig = {
  hour24: boolean;
  seconds: boolean;
};

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
  validationStatus?: ValidationStatus;
  registerComponentApi?: RegisterComponentApiFn;
  hour24?: boolean;
  seconds?: boolean;
  minTime?: string;
  maxTime?: string;
  clearable?: boolean;
  clearIcon?: string;
  clearToInitialValue?: boolean;
  required?: boolean;
  startText?: string;
  startIcon?: string;
  endText?: string;
  endIcon?: string;
  gap?: string;
  readOnly?: boolean;
  autoFocus?: boolean;
  emptyCharacter?: string;
};

export const defaultProps = {
  enabled: true,
  validationStatus: "none" as ValidationStatus,
  hour24: true,
  seconds: false,
  clearable: false,
  clearToInitialValue: false,
  required: false,
  readOnly: false,
  autoFocus: false,
  emptyCharacter: "-",
};

export const TimeInputNative = forwardRef<HTMLDivElement, Props>(function TimeInputNative(
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
    validationStatus = defaultProps.validationStatus,
    registerComponentApi,
    hour24 = defaultProps.hour24,
    seconds = defaultProps.seconds,
    minTime,
    maxTime,
    clearable = defaultProps.clearable,
    clearIcon,
    clearToInitialValue = defaultProps.clearToInitialValue,
    required = defaultProps.required,
    startText,
    startIcon,
    endText,
    endIcon,
    gap,
    readOnly = defaultProps.readOnly,
    autoFocus = defaultProps.autoFocus,
    emptyCharacter = defaultProps.emptyCharacter,
    ...rest
  },
  ref,
) {
  const timeInputRef = useRef<HTMLDivElement>(null);

  // Refs for auto-tabbing between inputs
  const hourInputRef = useRef<HTMLInputElement>(null);
  const minuteInputRef = useRef<HTMLInputElement>(null);
  const secondInputRef = useRef<HTMLInputElement>(null);
  const amPmButtonRef = useRef<HTMLButtonElement>(null);

  // Process emptyCharacter according to requirements
  const processedEmptyCharacter = useMemo(() => {
    if (!emptyCharacter || emptyCharacter.length === 0) {
      return "-";
    }
    if (emptyCharacter.length > 1) {
      return emptyCharacter.charAt(0);
    }
    return emptyCharacter;
  }, [emptyCharacter]);

  // Stabilize initialValue to prevent unnecessary re-renders
  const stableInitialValue = useMemo(() => {
    return initialValue;
  }, [initialValue]);

  // Local state management - sync with value prop (like TextBox and NumberBox)
  const [localValue, setLocalValue] = useState<string | null>(() => {
    const initial = controlledValue || stableInitialValue || null;
    return initial;
  });

  // Parse current value into individual components
  const [amPm, setAmPm] = useState<AmPmType | null>(null);
  const [hour, setHour] = useState<string | null>(null);
  const [minute, setMinute] = useState<string | null>(null);
  const [second, setSecond] = useState<string | null>(null);

  // Track whether the component currently has focus
  const [componentHasFocus, setComponentHasFocus] = useState(false);

  // State to track invalid status for visual feedback
  const [isHourCurrentlyInvalid, setIsHourCurrentlyInvalid] = useState(false);
  const [isMinuteCurrentlyInvalid, setIsMinuteCurrentlyInvalid] = useState(false);
  const [isSecondCurrentlyInvalid, setIsSecondCurrentlyInvalid] = useState(false);

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

  // Determine what components to show based on flags
  const is12HourFormat = !hour24;
  const showSeconds = seconds;
  const showLeadingZeros = hour24; // Always show leading zeros in 24-hour format

  // Parse value into individual components
  useEffect(() => {
    if (localValue) {
      const {
        amPm: parsedAmPm,
        hour: hourStr,
        minute: minuteStr,
        second: secondStr,
      } = parseTimeString(localValue, is12HourFormat);

      setAmPm(parsedAmPm);
      setHour(hourStr);
      setMinute(minuteStr);
      setSecond(secondStr);
    } else {
      setAmPm(null);
      setHour(null);
      setMinute(null);
      setSecond(null);
    }
  }, [localValue, is12HourFormat]);

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

  // Helper function to format the complete time value
  const formatTimeValue = useCallback(
    (
      h: string | null,
      m: string | null,
      s: string | null,
      ap: AmPmType | null,
      is12Hour: boolean,
    ): string | null => {
      if (!h || !m) {
        return null;
      }

      let formattedTime = "";

      if (is12Hour) {
        // 12-hour format
        const hour12 = h.padStart(2, "0");
        const minute12 = m.padStart(2, "0");
        formattedTime = `${hour12}:${minute12}`;

        if (s && showSeconds) {
          formattedTime += `:${s.padStart(2, "0")}`;
        }

        if (ap) {
          formattedTime += ` ${ap}`;
        }
      } else {
        // 24-hour format
        const hour24 = h.padStart(2, "0");
        const minute24 = m.padStart(2, "0");
        formattedTime = `${hour24}:${minute24}`;

        if (s && showSeconds) {
          formattedTime += `:${s.padStart(2, "0")}`;
        }
      }

      return formattedTime;
    },
    [showSeconds],
  );

  // Generic handlers for input change and blur
  const createInputChangeHandler = useCallback(
    (
      field: "hour" | "minute" | "second",
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
        // Fire invalidTime event if the value is invalid
        if (isInvalid) {
          onInvalidChange?.();
        }
        // Don't format/normalize during typing - only on blur
      },
    [onInvalidChange],
  );

  const createInputBlurHandler = useCallback(
    (
      field: "hour" | "minute" | "second",
      setValue: (value: string) => void,
      setInvalid: (invalid: boolean) => void,
      normalizeFn: (value: string) => string | null,
    ) =>
      (event: React.FocusEvent<HTMLInputElement>) => {
        const currentValue = event.target.value;
        const normalizedValue = normalizeFn(currentValue);

        // Check if the current value was invalid (needed normalization or couldn't be normalized)
        const wasInvalid =
          currentValue !== "" && (normalizedValue === null || normalizedValue !== currentValue);

        if (normalizedValue !== null && normalizedValue !== currentValue) {
          setValue(normalizedValue);
          setInvalid(false); // Clear invalid state after normalization

          // Always call handleChange to update the time value
          const timeValues = { hour, minute, second };
          timeValues[field] = normalizedValue;
          const timeString = formatTimeValue(
            timeValues.hour,
            timeValues.minute,
            timeValues.second,
            amPm,
            is12HourFormat,
          );
          handleChange(timeString);
        } else if (normalizedValue === null && currentValue !== "") {
          // Reset to previous valid value or clear
          setValue("");
          setInvalid(false); // Clear invalid state
          // Always call handleChange to update the time value (likely to null)
          const timeValues = { hour, minute, second };
          timeValues[field] = "";
          const timeString = formatTimeValue(
            timeValues.hour,
            timeValues.minute,
            timeValues.second,
            amPm,
            is12HourFormat,
          );
          handleChange(timeString);
        } else if (normalizedValue !== null) {
          // Value didn't need normalization, but still update the complete time
          const timeValues = { hour, minute, second };
          timeValues[field] = normalizedValue;
          const timeString = formatTimeValue(
            timeValues.hour,
            timeValues.minute,
            timeValues.second,
            amPm,
            is12HourFormat,
          );
          handleChange(timeString);
        }
      },
    [hour, minute, second, formatTimeValue, amPm, is12HourFormat, handleChange],
  );

  // Handle changes from individual inputs
  const handleHourChange = useMemo(
    () =>
      createInputChangeHandler("hour", setHour, setIsHourCurrentlyInvalid, (value) =>
        isHourInvalid(value, !is12HourFormat),
      ),
    [createInputChangeHandler, is12HourFormat],
  );

  const handleHourBlur = useMemo(
    () =>
      createInputBlurHandler("hour", setHour, setIsHourCurrentlyInvalid, (value) =>
        normalizeHour(value, !is12HourFormat),
      ),
    [createInputBlurHandler, is12HourFormat],
  );

  const handleMinuteChange = useMemo(
    () =>
      createInputChangeHandler(
        "minute",
        setMinute,
        setIsMinuteCurrentlyInvalid,
        isMinuteOrSecondInvalid,
      ),
    [createInputChangeHandler],
  );

  const handleMinuteBlur = useMemo(
    () =>
      createInputBlurHandler(
        "minute",
        setMinute,
        setIsMinuteCurrentlyInvalid,
        normalizeMinuteOrSecond,
      ),
    [createInputBlurHandler],
  );

  const handleSecondChange = useMemo(
    () =>
      createInputChangeHandler(
        "second",
        setSecond,
        setIsSecondCurrentlyInvalid,
        isMinuteOrSecondInvalid,
      ),
    [createInputChangeHandler],
  );

  const handleSecondBlur = useMemo(
    () =>
      createInputBlurHandler(
        "second",
        setSecond,
        setIsSecondCurrentlyInvalid,
        normalizeMinuteOrSecond,
      ),
    [createInputBlurHandler],
  );

  const handleAmPmToggle = useCallback(() => {
    const newAmPm: AmPmType = amPm === "am" ? "pm" : "am";
    setAmPm(newAmPm);

    // Always call handleChange to update the time value
    const timeString = formatTimeValue(hour, minute, second, newAmPm, is12HourFormat);
    handleChange(timeString);
  }, [amPm, formatTimeValue, hour, minute, second, is12HourFormat, handleChange]);

  const handleAmPmSet = useCallback(
    (targetAmPm: AmPmType) => {
      if (amPm === targetAmPm) return; // No change needed

      setAmPm(targetAmPm);

      // Always call handleChange to update the time value
      const timeString = formatTimeValue(hour, minute, second, targetAmPm, is12HourFormat);
      handleChange(timeString);
    },
    [amPm, formatTimeValue, hour, minute, second, is12HourFormat, handleChange],
  );

  // Focus method
  const focus = useCallback(() => {
    const input = timeInputRef.current?.querySelector(
      'input[type="time"], input[name*="hour"], input[name*="minute"]',
    ) as HTMLInputElement;
    input?.focus();
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
      // Check if the new focus target is still within this TimeInput component
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
    return (event: React.KeyboardEvent<HTMLInputElement | HTMLButtonElement>) => {
      const { key } = event;

      if (key === "ArrowRight") {
        event.preventDefault();
        const currentTarget = event.target as HTMLInputElement | HTMLButtonElement;

        // Determine next input based on current input
        if (currentTarget === hourInputRef.current && minuteInputRef.current) {
          minuteInputRef.current.focus();
          minuteInputRef.current.select();
        } else if (currentTarget === minuteInputRef.current) {
          if (showSeconds && secondInputRef.current) {
            secondInputRef.current.focus();
            secondInputRef.current.select();
          } else if (!showSeconds && is12HourFormat && amPmButtonRef.current) {
            amPmButtonRef.current.focus();
          }
        } else if (
          currentTarget === secondInputRef.current &&
          is12HourFormat &&
          amPmButtonRef.current
        ) {
          amPmButtonRef.current.focus();
        }
      } else if (key === "ArrowLeft") {
        event.preventDefault();
        const currentTarget = event.target as HTMLInputElement | HTMLButtonElement;

        // Determine previous input based on current input
        if (currentTarget === minuteInputRef.current && hourInputRef.current) {
          hourInputRef.current.focus();
          hourInputRef.current.select();
        } else if (currentTarget === secondInputRef.current && minuteInputRef.current) {
          minuteInputRef.current.focus();
          minuteInputRef.current.select();
        } else if (currentTarget === amPmButtonRef.current) {
          if (showSeconds && secondInputRef.current) {
            secondInputRef.current.focus();
            secondInputRef.current.select();
          } else if (!showSeconds && minuteInputRef.current) {
            minuteInputRef.current.focus();
            minuteInputRef.current.select();
          }
        }
      }
    };
  }, [showSeconds, is12HourFormat]);

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
      const {
        amPm: amPmValue,
        hour: hourStr,
        minute: minuteStr,
        second: secondStr,
      } = parseTimeString(String(valueToReset), is12HourFormat);

      setHour(hourStr);
      setMinute(minuteStr);
      setSecond(secondStr);
      setAmPm(amPmValue);
    } else {
      // Clear all fields
      setHour(null);
      setMinute(null);
      setSecond(null);
      setAmPm(null);
    }

    handleChange(valueToReset);

    // Focus the component after clearing
    setTimeout(() => {
      focus();
    }, 0);
  }, [clearToInitialValue, stableInitialValue, handleChange, is12HourFormat, focus]);

  function stopPropagation(event: React.FocusEvent) {
    event.stopPropagation();
  }

  const setValue = useEvent((newValue: string | null) => {
    handleChange(newValue);
  });

  // Function to get ISO formatted time value (HH:MM:SS in 24-hour format)
  const getIsoValue = useCallback((): string | null => {
    if (!hour || !minute) {
      return null;
    }

    // Convert to 24-hour format if currently in 12-hour format
    let hour24: number;
    if (is12HourFormat && amPm) {
      const hourInt = parseInt(hour, 10);
      if (amPm === "am") {
        hour24 = hourInt === 12 ? 0 : hourInt;
      } else {
        // pm
        hour24 = hourInt === 12 ? 12 : hourInt + 12;
      }
    } else {
      hour24 = parseInt(hour, 10);
    }

    // Format as ISO time string (HH:MM:SS)
    const h24 = hour24.toString().padStart(2, "0");
    const m24 = minute.padStart(2, "0");
    const s24 = (second || "00").padStart(2, "0");

    return `${h24}:${m24}:${s24}`;
  }, [hour, minute, second, amPm, is12HourFormat]);

  // Component API registration
  useEffect(() => {
    if (registerComponentApi) {
      registerComponentApi({
        focus,
        setValue,
        isoValue: getIsoValue,
      });
    }
  }, [registerComponentApi, focus, setValue, getIsoValue]);

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

  const timeInputComponent = (
    <div
      ref={timeInputRef}
      className={classnames(
        styles.timeInputWrapper,
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
        <div className={styles.inputGroup}>
          {/* Hour input */}
          <HourInput
            id={id}
            amPm={amPm}
            autoFocus={autoFocus}
            disabled={!enabled}
            inputRef={hourInputRef}
            nextInputRef={minuteInputRef}
            maxTime={maxTime}
            minTime={minTime}
            onChange={handleHourChange}
            onBlur={handleHourBlur}
            onKeyDown={handleArrowKeys}
            readOnly={readOnly}
            required={required}
            value={hour}
            isInvalid={isHourCurrentlyInvalid}
            is24Hour={!is12HourFormat}
            emptyCharacter={processedEmptyCharacter}
          />

          <InputDivider separator=":" />

          {/* Minute input */}
          <MinuteInput
            disabled={!enabled}
            hour={hour}
            inputRef={minuteInputRef}
            nextInputRef={showSeconds ? secondInputRef : undefined}
            nextButtonRef={showSeconds ? undefined : is12HourFormat ? amPmButtonRef : undefined}
            maxTime={maxTime}
            minTime={minTime}
            onChange={handleMinuteChange}
            onBlur={handleMinuteBlur}
            onKeyDown={handleArrowKeys}
            readOnly={readOnly}
            required={required}
            showLeadingZeros={showLeadingZeros}
            value={minute}
            isInvalid={isMinuteCurrentlyInvalid}
            emptyCharacter={processedEmptyCharacter}
          />

          {/* Second input (if needed) */}
          {showSeconds && (
            <>
              <InputDivider separator=":" className={styles.divider} />
              <SecondInput
                disabled={!enabled}
                hour={hour}
                inputRef={secondInputRef}
                nextButtonRef={is12HourFormat ? amPmButtonRef : undefined}
                maxTime={maxTime}
                minTime={minTime}
                minute={minute}
                onChange={handleSecondChange}
                onBlur={handleSecondBlur}
                onKeyDown={handleArrowKeys}
                readOnly={readOnly}
                required={required}
                showLeadingZeros={showLeadingZeros}
                value={second}
                isInvalid={isSecondCurrentlyInvalid}
                emptyCharacter={processedEmptyCharacter}
              />
            </>
          )}

          {/* AM/PM selector (if 12-hour format) */}
          {is12HourFormat && (
            <AmPmButton
              className="timeinput"
              disabled={!enabled}
              buttonRef={amPmButtonRef}
              maxTime={maxTime}
              minTime={minTime}
              onClick={handleAmPmToggle}
              onAmPmSet={handleAmPmSet}
              onKeyDown={handleArrowKeys}
              value={amPm}
            />
          )}
        </div>

        {clearable && (
          <Part partId="clearButton">
            <button
              className={classnames(styles.clearButton, styles.button)}
              disabled={!enabled}
              onClick={clear}
              onFocus={stopPropagation}
              type="button"
            >
              {clearIconElement}
            </button>
          </Part>
        )}
      </div>
      {endAdornment}
    </div>
  );

  return timeInputComponent;
});

// AmPm component types and implementation
type AmPmProps = {
  ariaLabel?: string;
  autoFocus?: boolean;
  className: string;
  disabled?: boolean;
  locale?: string;
  maxTime?: string;
  minTime?: string;
  onClick?: () => void;
  onAmPmSet?: (amPm: AmPmType) => void;
  onKeyDown?: (event: React.KeyboardEvent<HTMLButtonElement>) => void;
  buttonRef?: React.RefObject<HTMLButtonElement | null>;
  required?: boolean;
  value?: string | null;
};

function AmPmButton({
  ariaLabel,
  autoFocus,
  className,
  disabled,
  locale,
  maxTime,
  minTime,
  onClick,
  onAmPmSet,
  onKeyDown,
  buttonRef,
  value,
}: AmPmProps): React.ReactElement {
  const amDisabled = minTime ? convert24to12(getHours(minTime))[1] === "pm" : false;
  const pmDisabled = maxTime ? convert24to12(getHours(maxTime))[1] === "am" : false;

  const [amLabel, pmLabel] = getAmPmLabels(locale);

  // Determine if the button should be disabled based on time constraints
  const isDisabled = disabled || (value === "am" && pmDisabled) || (value === "pm" && amDisabled);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLButtonElement>) => {
      // First call the external key handler (for arrow navigation)
      if (onKeyDown) {
        onKeyDown(event);
      }

      // If the event was handled (preventDefault called), don't process further
      if (event.defaultPrevented || disabled) return;

      const key = event.key.toLowerCase();

      // Handle 'a' or 'A' to set AM
      if (key === "a" && !amDisabled && value !== "am" && onAmPmSet) {
        event.preventDefault();
        onAmPmSet("am");
      }
      // Handle 'p' or 'P' to set PM
      else if (key === "p" && !pmDisabled && value !== "pm" && onAmPmSet) {
        event.preventDefault();
        onAmPmSet("pm");
      }
    },
    [onKeyDown, disabled, onAmPmSet, value, amDisabled, pmDisabled],
  );

  return (
    <Part partId="ampm">
      <button
        type="button"
        aria-label={ariaLabel || "Toggle AM/PM (Press A for AM, P for PM)"}
        autoFocus={autoFocus}
        className={classnames(styles.amPmButton, styles.button, className)}
        disabled={isDisabled}
        onClick={onClick}
        onKeyDown={handleKeyDown}
        ref={buttonRef as React.RefObject<HTMLButtonElement>}
      >
        <span className={styles.amPmValue}>
          {value ? (value === "am" ? amLabel : pmLabel) : "--"}
        </span>
      </button>
    </Part>
  );
}

// HourInput component (unified for both 12-hour and 24-hour formats)
// Generic input properties used by time input components
type TimeInputElementProps = {
  ariaLabel?: string;
  autoFocus?: boolean;
  disabled?: boolean;
  inputRef?: React.RefObject<HTMLInputElement | null>;
  nextInputRef?: React.RefObject<HTMLInputElement | null>;
  nextButtonRef?: React.RefObject<HTMLButtonElement | null>;
  onChange?: (event: React.ChangeEvent<HTMLInputElement> & { target: HTMLInputElement }) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement> & { target: HTMLInputElement }) => void;
  onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement> & { target: HTMLInputElement }) => void;
  placeholder?: string;
  readOnly?: boolean;
  required?: boolean;
  step?: number;
};

// HourInput component
type HourInputProps = {
  id?: string;
  amPm?: AmPmType | null;
  maxTime?: string;
  minTime?: string;
  value?: string | null;
  isInvalid?: boolean;
  is24Hour?: boolean; // true for 24-hour format, false for 12-hour format
  emptyCharacter?: string;
} & Omit<TimeInputElementProps, "max" | "min" | "name" | "nameForClass" | "value">;

function HourInput({
  id,
  amPm,
  maxTime,
  minTime,
  value,
  isInvalid = false,
  is24Hour = false,
  emptyCharacter = "-",
  ...otherProps
}: HourInputProps): React.ReactElement {
  // Calculate min/max based on format
  const { minHour, maxHour } = (() => {
    if (is24Hour) {
      // 24-hour format: 0-23
      return {
        maxHour: safeMin(23, maxTime && getHours(maxTime)),
        minHour: safeMax(0, minTime && getHours(minTime)),
      };
    } else {
      // 12-hour format: 1-12
      const maxHour = safeMin(
        12,
        maxTime &&
          (() => {
            const [maxHourResult, maxAmPm] = convert24to12(getHours(maxTime));

            if (maxAmPm !== amPm) {
              // pm is always after am, so we should ignore validation
              return null;
            }

            return maxHourResult;
          })(),
      );

      const minHour = safeMax(
        1,
        minTime &&
          (() => {
            const [minHourResult, minAmPm] = convert24to12(getHours(minTime));

            if (
              // pm is always after am, so we should ignore validation
              minAmPm !== amPm ||
              // If minHour is 12 am/pm, user should be able to enter 12, 1, ..., 11.
              minHourResult === 12
            ) {
              return null;
            }

            return minHourResult;
          })(),
      );

      return { maxHour, minHour };
    }
  })();

  // Always show the raw value during typing, no conversion
  // This allows users to see invalid input like "23" before it gets normalized on blur
  const displayValue = value || "";

  return (
    <Part partId="hour">
      <PartialInput
        id={id}
        value={displayValue}
        emptyCharacter={emptyCharacter}
        placeholderLength={2}
        max={maxHour}
        min={minHour}
        maxLength={2}
        validateFn={(val) => isHourInvalid(val, is24Hour)}
        onChange={otherProps.onChange}
        onBlur={(direction, event) => {
          // PartialInput provides direction, but the current onBlur expects just the event
          if (otherProps.onBlur) {
            otherProps.onBlur(event);
          }
        }}
        onKeyDown={otherProps.onKeyDown}
        className={classnames(styles.input, styles.hour)}
        invalidClassName={styles.invalid}
        disabled={otherProps.disabled}
        readOnly={otherProps.readOnly}
        required={otherProps.required}
        autoFocus={otherProps.autoFocus}
        inputRef={otherProps.inputRef}
        nextInputRef={otherProps.nextInputRef}
        nextButtonRef={otherProps.nextButtonRef}
        name={is24Hour ? "hour24" : "hour12"}
        ariaLabel={otherProps.ariaLabel}
        isInvalid={isInvalid}
      />
    </Part>
  );
}

// MinuteInput component
type MinuteInputProps = {
  hour?: string | null;
  maxTime?: string;
  minTime?: string;
  showLeadingZeros?: boolean;
  value?: string | null;
  isInvalid?: boolean;
  emptyCharacter?: string;
} & Omit<TimeInputElementProps, "max" | "min" | "name" | "value">;

function MinuteInput({
  hour,
  maxTime,
  minTime,
  showLeadingZeros = true,
  value,
  isInvalid = false,
  emptyCharacter = "-",
  ...otherProps
}: MinuteInputProps): React.ReactElement {
  function isSameHour(date: string | Date) {
    return hour === getHours(date).toString();
  }

  const maxMinute = safeMin(59, maxTime && isSameHour(maxTime) && getMinutes(maxTime));
  const minMinute = safeMax(0, minTime && isSameHour(minTime) && getMinutes(minTime));

  return (
    <Part partId="minute">
      <PartialInput
        max={maxMinute}
        min={minMinute}
        name="minute"
        value={value}
        validateFn={isMinuteOrSecondInvalid}
        emptyCharacter={emptyCharacter}
        placeholderLength={2}
        maxLength={2}
        onChange={otherProps.onChange}
        onBlur={(direction, event) => {
          // PartialInput provides direction, but the current onBlur expects just the event
          if (otherProps.onBlur) {
            otherProps.onBlur(event);
          }
        }}
        onKeyDown={otherProps.onKeyDown}
        className={classnames(styles.input, styles.minute)}
        invalidClassName={styles.invalid}
        disabled={otherProps.disabled}
        readOnly={otherProps.readOnly}
        required={otherProps.required}
        autoFocus={otherProps.autoFocus}
        inputRef={otherProps.inputRef}
        nextInputRef={otherProps.nextInputRef}
        nextButtonRef={otherProps.nextButtonRef}
        ariaLabel={otherProps.ariaLabel}
        isInvalid={isInvalid}
      />
    </Part>
  );
}

// SecondInput component
type SecondInputProps = {
  hour?: string | null;
  maxTime?: string;
  minTime?: string;
  minute?: string | null;
  showLeadingZeros?: boolean;
  value?: string | null;
  isInvalid?: boolean;
  emptyCharacter?: string;
} & Omit<TimeInputElementProps, "max" | "min" | "name" | "value">;

function SecondInput({
  hour,
  maxTime,
  minTime,
  minute,
  showLeadingZeros = true,
  value,
  isInvalid = false,
  emptyCharacter = "-",
  ...otherProps
}: SecondInputProps): React.ReactElement {
  function isSameMinute(date: string | Date) {
    return hour === getHours(date).toString() && minute === getMinutes(date).toString();
  }

  const maxSecond = safeMin(59, maxTime && isSameMinute(maxTime) && getSeconds(maxTime));
  const minSecond = safeMax(0, minTime && isSameMinute(minTime) && getSeconds(minTime));

  return (
    <Part partId="second">
      <PartialInput
        max={maxSecond}
        min={minSecond}
        name="second"
        value={value}
        validateFn={isMinuteOrSecondInvalid}
        emptyCharacter={emptyCharacter}
        placeholderLength={2}
        maxLength={2}
        onChange={otherProps.onChange}
        onBlur={(direction, event) => {
          // PartialInput provides direction, but the current onBlur expects just the event
          if (otherProps.onBlur) {
            otherProps.onBlur(event);
          }
        }}
        onKeyDown={otherProps.onKeyDown}
        className={classnames(styles.input, styles.second)}
        invalidClassName={styles.invalid}
        disabled={otherProps.disabled}
        readOnly={otherProps.readOnly}
        required={otherProps.required}
        autoFocus={otherProps.autoFocus}
        inputRef={otherProps.inputRef}
        nextInputRef={otherProps.nextInputRef}
        nextButtonRef={otherProps.nextButtonRef}
        ariaLabel={otherProps.ariaLabel}
        isInvalid={isInvalid}
      />
    </Part>
  );
}

// Utility function to parse time string into components
function parseTimeString(timeValue: any, targetIs12Hour: boolean = false) {
  // Handle non-string values gracefully
  if (timeValue == null || timeValue === undefined) {
    return {
      amPm: null,
      hour: "",
      minute: "",
      second: "",
    };
  }

  // If not a string, return empty values for type safety
  if (typeof timeValue !== "string") {
    return {
      amPm: null,
      hour: "",
      minute: "",
      second: "",
    };
  }

  const timeString = timeValue;
  const normalizedTimeString = timeString.toLowerCase();

  // Check if the time string contains AM/PM
  const hasAmPm = normalizedTimeString.includes("am") || normalizedTimeString.includes("pm");
  const isAmPmPm = normalizedTimeString.includes("pm");

  // Extract just the time part (remove AM/PM suffix)
  const timePart = normalizedTimeString.replace(/\s*(am|pm)\s*$/i, "").trim();

  let parsedHour = getHours(timePart);
  let parsedMinute = getMinutes(timePart);
  let parsedSecond = getSeconds(timePart);

  // If parsing with the current format fails (all zeros), try ISO time format
  if (
    parsedHour === 0 &&
    parsedMinute === 0 &&
    parsedSecond === 0 &&
    timePart !== "00:00:00" &&
    timePart !== "00:00"
  ) {
    try {
      // Try parsing as ISO time format using Date constructor
      const isoDate = new Date(`1970-01-01T${timePart}`);
      if (!isNaN(isoDate.getTime())) {
        parsedHour = isoDate.getHours();
        parsedMinute = isoDate.getMinutes();
        parsedSecond = isoDate.getSeconds();
      }
    } catch {
      // If ISO parsing fails, keep the original parsed values (zeros)
    }
  }

  // Set AM/PM based on the actual string content or convert from 24-hour
  let amPmValue: AmPmType | null = null;
  let displayHour = parsedHour;

  if (hasAmPm) {
    // String already has AM/PM, use the hour as-is (should be 1-12)
    amPmValue = isAmPmPm ? "pm" : "am";
  } else {
    // If no AM/PM in string, derive it from 24-hour format
    const [hour12, amPm12] = convert24to12(parsedHour);
    amPmValue = amPm12;

    // If target format is 12-hour, convert the hour value
    if (targetIs12Hour) {
      displayHour = hour12;
    }
  }

  // Format hour value appropriately
  const hourStr = displayHour.toString().padStart(2, "0");
  const minuteStr = parsedMinute.toString().padStart(2, "0");
  const secondStr = parsedSecond.toString().padStart(2, "0");

  return {
    amPm: amPmValue,
    hour: hourStr,
    minute: minuteStr,
    second: secondStr,
  };
}

// Normalize the hour value based on 12/24 hour format
function normalizeHour(value: string | null, is24Hour: boolean): string | null {
  if (!value || value === "") return null;

  const num = parseInt(value, 10);
  if (isNaN(num)) return null;

  if (is24Hour) {
    // 24-hour format: 0-23
    if (num >= 0 && num <= 23) {
      return num.toString().padStart(2, "0");
    } else {
      // For out-of-range values, use value % 10
      const corrected = num % 10;
      return corrected.toString().padStart(2, "0");
    }
  } else {
    // 12-hour format: 1-12
    if (num >= 1 && num <= 12) {
      return num.toString().padStart(2, "0");
    } else if (num === 0) {
      return "12"; // 0 becomes 12 in 12-hour format
    } else {
      // For out-of-range values, use value % 10, but ensure it's 1-12
      let corrected = num % 10;
      if (corrected === 0) corrected = 12; // 0 becomes 12 in 12-hour format
      return corrected.toString().padStart(2, "0");
    }
  }
}

// Normalize the minute or second value
function normalizeMinuteOrSecond(value: string | null): string | null {
  if (!value || value === "") return null;

  const num = parseInt(value, 10);
  if (isNaN(num)) return null;

  if (num >= 0 && num <= 59) {
    return num.toString().padStart(2, "0");
  } else {
    // For out-of-range values, use value % 10
    const corrected = num % 10;
    return corrected.toString().padStart(2, "0");
  }
}

// Helper functions to check if values are currently invalid (need normalization)
function isHourInvalid(value: string | null, is24Hour: boolean): boolean {
  if (!value || value === "") return false;

  const num = parseInt(value, 10);
  if (isNaN(num)) {
    return true;
  }

  const invalid = is24Hour ? num < 0 || num > 23 : num < 1 || num > 12;
  return invalid;
}

function isMinuteOrSecondInvalid(value: string | null): boolean {
  if (!value || value === "") return false;

  const num = parseInt(value, 10);
  if (isNaN(num)) {
    return true;
  }

  const invalid = num < 0 || num > 59;
  return invalid;
}
