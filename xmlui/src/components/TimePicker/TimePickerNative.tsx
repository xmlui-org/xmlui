import { type CSSProperties } from "react";
import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import classnames from "classnames";
import styles from "./TimePicker.module.scss";

import type { RegisterComponentApiFn, UpdateStateFn } from "../../abstractions/RendererDefs";
import { useEvent } from "../../components-core/utils/misc";
import type { ValidationStatus } from "../abstractions";
import { Adornment } from "../Input/InputAdornment";
import { ItemWithLabel } from "../FormItem/ItemWithLabel";
import Icon from "../Icon/IconNative";

// Import shared utilities and types
import { getHours, getMinutes, getSeconds } from './shared/dateUtils';
import { convert24to12 } from './shared/dates';
import { getAmPmLabels, safeMax, safeMin } from './shared/utils';
import Divider from './Divider';
import type { AmPmType } from './shared/types';

// Browser detection utilities
const isIEOrEdgeLegacy = typeof window !== 'undefined' && /(MSIE|Trident\/|Edge\/)/.test(navigator.userAgent);
const isFirefox = typeof window !== 'undefined' && /Firefox/.test(navigator.userAgent);

// Input helper functions
function onFocus(event: React.FocusEvent<HTMLInputElement>) {
  const { target } = event;

  if (isIEOrEdgeLegacy) {
    requestAnimationFrame(() => target.select());
  } else {
    target.select();
  }
}

function getSelectionString(input: HTMLInputElement) {
  /**
   * window.getSelection().toString() returns empty string in IE11 and Firefox,
   * so alternatives come first.
   */
  if (
    input &&
    'selectionStart' in input &&
    input.selectionStart !== null &&
    'selectionEnd' in input &&
    input.selectionEnd !== null
  ) {
    return input.value.slice(input.selectionStart, input.selectionEnd);
  }

  if ('getSelection' in window) {
    const selection = window.getSelection();
    return selection?.toString();
  }

  return null;
}

function makeOnKeyPress(maxLength: number | null) {
  if (maxLength === null) {
    return undefined;
  }

  /**
   * Prevents keystrokes that would not produce a number or when value after keystroke would
   * exceed maxLength.
   */
  return function onKeyPress(
    event: React.KeyboardEvent<HTMLInputElement> & { target: HTMLInputElement },
  ) {
    if (isFirefox) {
      // See https://github.com/wojtekmaj/react-time-picker/issues/92
      return;
    }

    const { key, target: input } = event;
    const { value } = input;

    const isNumberKey = key.length === 1 && /\d/.test(key);
    const selection = getSelectionString(input);

    if (!isNumberKey || !(selection || value.length < maxLength)) {
      event.preventDefault();
    }
  };
}

// Normalization functions for smart auto-correction
function normalizeHour(value: string | null, is24Hour: boolean): string | null {
  if (!value || value === '') return null;
  
  const num = parseInt(value, 10);
  if (isNaN(num)) return null;
  
  if (is24Hour) {
    // 24-hour format: 0-23
    if (num >= 0 && num <= 23) {
      return num.toString().padStart(2, '0');
    } else {
      // For out-of-range values, use value % 10
      const corrected = num % 10;
      return corrected.toString().padStart(2, '0');
    }
  } else {
    // 12-hour format: 1-12
    if (num >= 1 && num <= 12) {
      return num.toString().padStart(2, '0');
    } else if (num === 0) {
      return '12'; // 0 becomes 12 in 12-hour format
    } else {
      // For out-of-range values, use value % 10, but ensure it's 1-12
      let corrected = num % 10;
      if (corrected === 0) corrected = 12; // 0 becomes 12 in 12-hour format
      return corrected.toString().padStart(2, '0');
    }
  }
}

function normalizeMinuteOrSecond(value: string | null): string | null {
  if (!value || value === '') return null;
  
  const num = parseInt(value, 10);
  if (isNaN(num)) return null;
  
  if (num >= 0 && num <= 59) {
    return num.toString().padStart(2, '0');
  } else {
    // For out-of-range values, use value % 10
    const corrected = num % 10;
    return corrected.toString().padStart(2, '0');
  }
}

// Helper functions to check if values are currently invalid (need normalization)
function isHourInvalid(value: string | null, is24Hour: boolean): boolean {
  if (!value || value === '') return false;
  
  const num = parseInt(value, 10);
  if (isNaN(num)) return true;
  
  if (is24Hour) {
    return num < 0 || num > 23;
  } else {
    return num < 1 || num > 12;
  }
}

function isMinuteOrSecondInvalid(value: string | null): boolean {
  if (!value || value === '') return false;
  
  const num = parseInt(value, 10);
  if (isNaN(num)) return true;
  
  return num < 0 || num > 59;
}

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
  nameForClass?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement> & { target: HTMLInputElement }) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement> & { target: HTMLInputElement }) => void;
  onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement> & { target: HTMLInputElement }) => void;
  onKeyUp?: (event: React.KeyboardEvent<HTMLInputElement> & { target: HTMLInputElement }) => void;
  placeholder?: string;
  required?: boolean;
  showLeadingZeros?: boolean;
  step?: number;
  value?: string | null;
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
  nameForClass,
  onChange,
  onBlur,
  onKeyDown,
  onKeyUp,
  placeholder = '--',
  required,
  showLeadingZeros,
  step,
  value,
}: InputProps): React.ReactElement {
  const hasLeadingZero =
    showLeadingZeros &&
    value &&
    Number(value) < 10 &&
    (value === '0' || !value.toString().startsWith('0'));
  const maxLength = max ? max.toString().length : null;

  return (
    <>
      {hasLeadingZero ? <span className={`${className}__leadingZero`}>0</span> : null}
      <input
        aria-label={ariaLabel}
        autoComplete="off"
        // biome-ignore lint/a11y/noAutofocus: This is up to developers' decision
        autoFocus={autoFocus}
        className={classnames(
          styles.input,
          styles[nameForClass || name],
          hasLeadingZero && styles.hasLeadingZero,
          className,
        )}
        style={{ width: '1.8em', textAlign: 'center', padding: '0 2px' }}
        data-input="true"
        disabled={disabled}
        inputMode="numeric"
        max={max}
        min={min}
        name={name}
        onChange={onChange}
        onBlur={onBlur}
        onFocus={onFocus}
        onKeyDown={onKeyDown}
        onKeyPress={makeOnKeyPress(maxLength)}
        onKeyUp={onKeyUp}
        placeholder={placeholder}
        // Assertion is needed for React 18 compatibility
        ref={inputRef as React.RefObject<HTMLInputElement>}
        required={required}
        step={step}
        type="text"
        value={value !== null ? value : ''}
      />
    </>
  );
}

// AmPm component types and implementation
type AmPmProps = {
  ariaLabel?: string;
  autoFocus?: boolean;
  className: string;
  disabled?: boolean;
  inputRef?: React.RefObject<HTMLSelectElement | null>;
  locale?: string;
  maxTime?: string;
  minTime?: string;
  onChange?: (event: React.ChangeEvent<HTMLSelectElement> & { target: HTMLSelectElement }) => void;
  onKeyDown?: (
    event: React.KeyboardEvent<HTMLSelectElement> & { target: HTMLSelectElement },
  ) => void;
  required?: boolean;
  value?: string | null;
};

function AmPm({
  ariaLabel,
  autoFocus,
  className,
  disabled,
  inputRef,
  locale,
  maxTime,
  minTime,
  onChange,
  onKeyDown,
  required,
  value,
}: AmPmProps): React.ReactElement {
  const amDisabled = minTime ? convert24to12(getHours(minTime))[1] === 'pm' : false;
  const pmDisabled = maxTime ? convert24to12(getHours(maxTime))[1] === 'am' : false;

  const name = 'amPm';
  const [amLabel, pmLabel] = getAmPmLabels(locale);

  return (
    <select
      aria-label={ariaLabel}
      // biome-ignore lint/a11y/noAutofocus: This is up to developers' decision
      autoFocus={autoFocus}
      className={classnames(styles.input, styles.amPm)}
      data-input="true"
      data-select="true"
      disabled={disabled}
      name={name}
      onChange={onChange}
      onKeyDown={onKeyDown}
      // Assertion is needed for React 18 compatibility
      ref={inputRef as React.RefObject<HTMLSelectElement>}
      required={required}
      value={value !== null ? value : ''}
    >
      {!value && <option value="">--</option>}
      <option disabled={amDisabled} value="am">
        {amLabel}
      </option>
      <option disabled={pmDisabled} value="pm">
        {pmLabel}
      </option>
    </select>
  );
}

// Hour12Input component
type Hour12InputProps = {
  amPm: AmPmType | null;
  maxTime?: string;
  minTime?: string;
  value?: string | null;
  isInvalid?: boolean;
} & Omit<React.ComponentProps<typeof Input>, 'max' | 'min' | 'name' | 'nameForClass'>;

function Hour12Input({
  amPm,
  maxTime,
  minTime,
  value,
  isInvalid = false,
  ...otherProps
}: Hour12InputProps): React.ReactElement {
  console.log("render", isInvalid);
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

  // Only convert if it's a valid 24-hour value, otherwise preserve raw input during typing
  const value12 = (() => {
    if (!value) return '';
    const numValue = parseInt(value, 10);
    if (isNaN(numValue)) return value;
    
    // If it's already a valid 12-hour value (1-12), keep it as is
    if (numValue >= 1 && numValue <= 12) {
      return value;
    }
    
    // If it's a valid 24-hour value (0-23), convert it
    if (numValue >= 0 && numValue <= 23) {
      return convert24to12(value)[0].toString();
    }
    
    // For invalid values (like 25, 99, etc.), preserve the raw input during typing
    return value;
  })();

  const { className: originalClassName, ...restProps } = otherProps;

  return (
    <Input
      max={maxHour}
      min={minHour}
      name="hour12"
      nameForClass="hour"
      value={value12}
      className={classnames(originalClassName, {
        [styles.invalid]: isInvalid
      })}
      {...restProps}
    />
  );
}

// Hour24Input component
type Hour24InputProps = {
  maxTime?: string;
  minTime?: string;
  value?: string | null;
  isInvalid?: boolean;
} & Omit<React.ComponentProps<typeof Input>, 'max' | 'min' | 'name' | 'nameForClass'>;

function Hour24Input({
  maxTime,
  minTime,
  value,
  isInvalid = false,
  ...otherProps
}: Hour24InputProps): React.ReactElement {
  const maxHour = safeMin(23, maxTime && getHours(maxTime));
  const minHour = safeMax(0, minTime && getHours(minTime));

  const { className: originalClassName, ...restProps } = otherProps;

  return (
    <Input 
      max={maxHour} 
      min={minHour} 
      name="hour24" 
      nameForClass="hour" 
      value={value}
      className={classnames(originalClassName, {
        [styles.invalid]: isInvalid
      })}
      {...restProps} 
    />
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
} & Omit<React.ComponentProps<typeof Input>, 'max' | 'min' | 'name' | 'value'>;

function MinuteInput({
  hour,
  maxTime,
  minTime,
  showLeadingZeros = true,
  value,
  isInvalid = false,
  ...otherProps
}: MinuteInputProps): React.ReactElement {
  function isSameHour(date: string | Date) {
    return hour === getHours(date).toString();
  }

  const maxMinute = safeMin(59, maxTime && isSameHour(maxTime) && getMinutes(maxTime));
  const minMinute = safeMax(0, minTime && isSameHour(minTime) && getMinutes(minTime));

  const { className: originalClassName, ...restProps } = otherProps;

  return (
    <Input
      max={maxMinute}
      min={minMinute}
      name="minute"
      showLeadingZeros={showLeadingZeros}
      value={value}
      className={classnames(originalClassName, {
        [styles.invalid]: isInvalid
      })}
      {...restProps}
    />
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
} & Omit<React.ComponentProps<typeof Input>, 'max' | 'min' | 'name' | 'value'>;

function SecondInput({
  hour,
  maxTime,
  minTime,
  minute,
  showLeadingZeros = true,
  value,
  isInvalid = false,
  ...otherProps
}: SecondInputProps): React.ReactElement {
  function isSameMinute(date: string | Date) {
    return hour === getHours(date).toString() && minute === getMinutes(date).toString();
  }

  const maxSecond = safeMin(59, maxTime && isSameMinute(maxTime) && getSeconds(maxTime));
  const minSecond = safeMax(0, minTime && isSameMinute(minTime) && getSeconds(minTime));

  const { className: originalClassName, ...restProps } = otherProps;

  return (
    <Input
      max={maxSecond}
      min={minSecond}
      name="second"
      showLeadingZeros={showLeadingZeros}
      value={value}
      className={classnames(originalClassName, {
        [styles.invalid]: isInvalid
      })}
      {...restProps}
    />
  );
}

// Available time formats
export const TimePickerFormatValues = [
  "h:m:s a", // 12-hour with seconds
  "h:m a",   // 12-hour without seconds
  "HH:mm:ss", // 24-hour with seconds
  "HH:mm",   // 24-hour without seconds
  "H:m:s",   // 24-hour with seconds (no leading zeros)
  "H:m",     // 24-hour without seconds (no leading zeros)
] as const;

type TimePickerFormat = (typeof TimePickerFormatValues)[number];

// Available detail levels
export const TimePickerMaxDetailValues = ["hour", "minute", "second"] as const;
type TimePickerMaxDetail = (typeof TimePickerMaxDetailValues)[number];

type Props = {
  id?: string;
  initialValue?: string;
  value?: string;
  enabled?: boolean;
  placeholder?: string;
  updateState?: UpdateStateFn;
  style?: CSSProperties;
  className?: string;
  onDidChange?: (newValue: string | null) => void;
  onFocus?: (ev: React.FocusEvent<HTMLDivElement>) => void;
  onBlur?: (ev: React.FocusEvent<HTMLDivElement>) => void;
  onInvalidChange?: () => void;
  validationStatus?: ValidationStatus;
  registerComponentApi?: RegisterComponentApiFn;
  format?: TimePickerFormat;
  maxDetail?: TimePickerMaxDetail;
  minTime?: string;
  maxTime?: string;
  clearable?: boolean;
  clearIcon?: string;
  required?: boolean;
  name?: string;
  startText?: string;
  startIcon?: string;
  endText?: string;
  endIcon?: string;
  label?: string;
  labelPosition?: string;
  labelWidth?: string;
  labelBreak?: boolean;
  readOnly?: boolean;
  autoFocus?: boolean;
};

export const defaultProps = {
  enabled: true,
  validationStatus: "none" as ValidationStatus,
  format: "HH:mm" as TimePickerFormat,
  maxDetail: "minute" as TimePickerMaxDetail,
  clearable: true,
  required: false,
  name: "time",
  labelPosition: "top",
  readOnly: false,
  autoFocus: false,
  labelBreak: false,
};

export const TimePickerNative = forwardRef<HTMLDivElement, Props>(function TimePickerNative(
  {
    id,
    initialValue,
    value: controlledValue,
    enabled = defaultProps.enabled,
    placeholder,
    updateState,
    style,
    className,
    onDidChange,
    onFocus,
    onBlur,
    onInvalidChange,
    validationStatus = defaultProps.validationStatus,
    registerComponentApi,
    format = defaultProps.format,
    maxDetail = defaultProps.maxDetail,
    minTime,
    maxTime,
    clearable = defaultProps.clearable,
    clearIcon,
    required = defaultProps.required,
    name = defaultProps.name,
    startText,
    startIcon,
    endText,
    endIcon,
    label,
    labelPosition = defaultProps.labelPosition,
    labelWidth,
    labelBreak = defaultProps.labelBreak,
    readOnly = defaultProps.readOnly,
    autoFocus = defaultProps.autoFocus,
    ...rest
  },
  ref,
) {
  const timePickerRef = useRef<HTMLDivElement>(null);

  // Local state management - sync with value prop (like TextBox and NumberBox)
  const [localValue, setLocalValue] = useState<string | null>(controlledValue || null);

  // Parse current value into individual components
  const [amPm, setAmPm] = useState<AmPmType | null>(null);
  const [hour, setHour] = useState<string | null>(null);
  const [minute, setMinute] = useState<string | null>(null);
  const [second, setSecond] = useState<string | null>(null);
  
  // State to track invalid status for visual feedback
  const [isHourCurrentlyInvalid, setIsHourCurrentlyInvalid] = useState(false);
  const [isMinuteCurrentlyInvalid, setIsMinuteCurrentlyInvalid] = useState(false);
  const [isSecondCurrentlyInvalid, setIsSecondCurrentlyInvalid] = useState(false);
  
  useEffect(() => {
    // If there's no controlled value, use the initial value
    const valueToUse = (controlledValue === null || controlledValue === undefined) ? initialValue : controlledValue;
    setLocalValue(valueToUse || null);
  }, [controlledValue, initialValue]);

  // Parse value into individual components
  useEffect(() => {
    if (localValue) {
      const parsedHour = getHours(localValue);
      const parsedMinute = getMinutes(localValue);
      const parsedSecond = getSeconds(localValue);
      
      setAmPm(convert24to12(parsedHour)[1]);
      setHour(parsedHour.toString().padStart(2, '0'));
      setMinute(parsedMinute.toString().padStart(2, '0'));
      setSecond(parsedSecond.toString().padStart(2, '0'));
    } else {
      setAmPm(null);
      setHour(null);
      setMinute(null);
      setSecond(null);
    }
  }, [localValue]);

  // Determine what components to show based on format
  const is12HourFormat = format && format.includes('a');
  const showSeconds = (format && format.includes('s')) || maxDetail === 'second';
  const showLeadingZeros = format && (format.includes('HH') || format.includes('mm') || format.includes('ss'));

  // Initialize the related field with the input's initial value
  useEffect(() => {
    updateState({ value: initialValue }, { initial: true });
  }, [initialValue, updateState]);

  // Event handlers
  const handleChange = useEvent((newValue: string | null) => {
    setLocalValue(newValue);
    if (updateState) {
      updateState({ value: newValue });
    }
    onDidChange?.(newValue);
  });

  // Handle changes from individual inputs
  const handleHourChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newHour = event.target.value;
    setHour(newHour);
    // Update invalid state immediately for visual feedback
    setIsHourCurrentlyInvalid(isHourInvalid(newHour, !is12HourFormat));
    // Don't format/normalize during typing - only on blur
  }, [is12HourFormat]);

  const handleHourBlur = useCallback((event: React.FocusEvent<HTMLInputElement>) => {
    const currentValue = event.target.value;
    const normalizedHour = normalizeHour(currentValue, !is12HourFormat);
    
    if (normalizedHour !== null && normalizedHour !== currentValue) {
      setHour(normalizedHour);
      setIsHourCurrentlyInvalid(false); // Clear invalid state after normalization
      
      if (minute) {
        const timeString = formatTimeValue(normalizedHour, minute, second, amPm, is12HourFormat);
        handleChange(timeString);
      }
    } else if (normalizedHour === null && currentValue !== '') {
      // Reset to previous valid value or clear
      setHour('');
      setIsHourCurrentlyInvalid(false); // Clear invalid state
      if (minute) {
        const timeString = formatTimeValue('', minute, second, amPm, is12HourFormat);
        handleChange(timeString);
      }
    }
  }, [minute, second, amPm, is12HourFormat, handleChange]);

  const handleMinuteChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newMinute = event.target.value;
    setMinute(newMinute);
    // Update invalid state immediately for visual feedback
    setIsMinuteCurrentlyInvalid(isMinuteOrSecondInvalid(newMinute));
    // Don't format/normalize during typing - only on blur
  }, []);

  const handleMinuteBlur = useCallback((event: React.FocusEvent<HTMLInputElement>) => {
    const currentValue = event.target.value;
    const normalizedMinute = normalizeMinuteOrSecond(currentValue);
    
    if (normalizedMinute !== null && normalizedMinute !== currentValue) {
      setMinute(normalizedMinute);
      setIsMinuteCurrentlyInvalid(false); // Clear invalid state after normalization
      
      if (hour) {
        const timeString = formatTimeValue(hour, normalizedMinute, second, amPm, is12HourFormat);
        handleChange(timeString);
      }
    } else if (normalizedMinute === null && currentValue !== '') {
      // Reset to previous valid value or clear
      setMinute('');
      setIsMinuteCurrentlyInvalid(false); // Clear invalid state
      if (hour) {
        const timeString = formatTimeValue(hour, '', second, amPm, is12HourFormat);
        handleChange(timeString);
      }
    }
  }, [hour, second, amPm, is12HourFormat, handleChange]);

  const handleSecondChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newSecond = event.target.value;
    setSecond(newSecond);
    // Update invalid state immediately for visual feedback
    setIsSecondCurrentlyInvalid(isMinuteOrSecondInvalid(newSecond));
    // Don't format/normalize during typing - only on blur
  }, []);

  const handleSecondBlur = useCallback((event: React.FocusEvent<HTMLInputElement>) => {
    const currentValue = event.target.value;
    const normalizedSecond = normalizeMinuteOrSecond(currentValue);
    
    if (normalizedSecond !== null && normalizedSecond !== currentValue) {
      setSecond(normalizedSecond);
      setIsSecondCurrentlyInvalid(false); // Clear invalid state after normalization
      
      if (hour && minute) {
        const timeString = formatTimeValue(hour, minute, normalizedSecond, amPm, is12HourFormat);
        handleChange(timeString);
      }
    } else if (normalizedSecond === null && currentValue !== '') {
      // Reset to previous valid value or clear
      setSecond('');
      setIsSecondCurrentlyInvalid(false); // Clear invalid state
      if (hour && minute) {
        const timeString = formatTimeValue(hour, minute, '', amPm, is12HourFormat);
        handleChange(timeString);
      }
    }
  }, [hour, minute, amPm, is12HourFormat, handleChange]);

  const handleAmPmChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
    const newAmPm = event.target.value as AmPmType;
    setAmPm(newAmPm);
    
    if (hour && minute) {
      const timeString = formatTimeValue(hour, minute, second, newAmPm, is12HourFormat);
      handleChange(timeString);
    }
  }, [hour, minute, second, is12HourFormat, handleChange]);

  // Helper function to format the complete time value
  function formatTimeValue(h: string | null, m: string | null, s: string | null, ap: AmPmType | null, is12Hour: boolean): string | null {
    if (!h || !m) return null;
    
    let formattedTime = '';
    
    if (is12Hour) {
      // 12-hour format
      const hour12 = h.padStart(2, '0');
      const minute12 = m.padStart(2, '0');
      formattedTime = `${hour12}:${minute12}`;
      
      if (s && showSeconds) {
        formattedTime += `:${s.padStart(2, '0')}`;
      }
      
      if (ap) {
        formattedTime += ` ${ap}`;
      }
    } else {
      // 24-hour format
      const hour24 = h.padStart(2, '0');
      const minute24 = m.padStart(2, '0');
      formattedTime = `${hour24}:${minute24}`;
      
      if (s && showSeconds) {
        formattedTime += `:${s.padStart(2, '0')}`;
      }
    }
    
    return formattedTime;
  }

  function clear() {
    handleChange(null);
  }

  function stopPropagation(event: React.FocusEvent) {
    event.stopPropagation();
  }

  // Initialize the related field with the input's initial value
  useEffect(() => {
    updateState({ value: initialValue }, { initial: true });
  }, [initialValue, updateState]);

  const handleFocus = useEvent((event: React.FocusEvent<HTMLDivElement>) => {
    onFocus?.(event);
  });

  const handleBlur = useEvent((event: React.FocusEvent<HTMLDivElement>) => {
    onBlur?.(event);
  });

  const handleInvalidChange = useEvent(() => {
    onInvalidChange?.();
  });

  // Focus method
  const focus = useCallback(() => {
    const input = timePickerRef.current?.querySelector('input[type="time"], input[name*="hour"], input[name*="minute"]') as HTMLInputElement;
    input?.focus();
  }, []);

  // Component API registration
  useImperativeHandle(ref, () => timePickerRef.current as HTMLDivElement);

  useEffect(() => {
    if (registerComponentApi) {
      registerComponentApi({
        focus,
        get value() {
          return localValue;
        },
        set value(newValue: string | null) {
          handleChange(newValue);
        },
      });
    }
  }, [registerComponentApi, focus, localValue, handleChange]);

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
      return (
        <Adornment
          iconName={startIcon}
          text={startText}
        />
      );
    }
    return null;
  }, [startIcon, startText]);

  const endAdornment = useMemo(() => {
    if (endIcon || endText) {
      return (
        <Adornment
          iconName={endIcon}
          text={endText}
        />
      );
    }
    return null;
  }, [endIcon, endText]);

  const timePickerComponent = (
    <div
      ref={timePickerRef}
      className={classnames(
        styles.timePicker,
        {
          [styles.disabled]: !enabled,
          [styles.readOnly]: readOnly,
        },
        className,
      )}
      style={style}
      {...rest}
    >
      {startAdornment}
      <div
        className={classnames(
          styles.reactTimePickerWrapper,
          {
            [styles.error]: validationStatus === "error",
            [styles.warning]: validationStatus === "warning",
            [styles.valid]: validationStatus === "valid",
          }
        )}
      >
        <div className={styles.wrapper}>
          <div className={styles.inputGroup}>
            {/* Hour input */}
            {is12HourFormat ? (
              <Hour12Input
                amPm={amPm}
                autoFocus={autoFocus}
                className="timepicker"
                disabled={!enabled}
                maxTime={maxTime}
                minTime={minTime}
                onChange={handleHourChange}
                onBlur={handleHourBlur}
                required={required}
                showLeadingZeros={showLeadingZeros}
                value={hour}
                isInvalid={isHourCurrentlyInvalid}
              />
            ) : (
              <Hour24Input
                autoFocus={autoFocus}
                className="timepicker"
                disabled={!enabled}
                maxTime={maxTime}
                minTime={minTime}
                onChange={handleHourChange}
                onBlur={handleHourBlur}
                required={required}
                showLeadingZeros={showLeadingZeros}
                value={hour}
                isInvalid={isHourCurrentlyInvalid}
              />
            )}
            
            <Divider>:</Divider>
            
            {/* Minute input */}
            <MinuteInput
              className="timepicker"
              disabled={!enabled}
              hour={hour}
              maxTime={maxTime}
              minTime={minTime}
              onChange={handleMinuteChange}
              onBlur={handleMinuteBlur}
              required={required}
              showLeadingZeros={showLeadingZeros}
              value={minute}
              isInvalid={isMinuteCurrentlyInvalid}
            />
            
            {/* Second input (if needed) */}
            {showSeconds && (
              <>
                <Divider>:</Divider>
                <SecondInput
                  className="timepicker"
                  disabled={!enabled}
                  hour={hour}
                  maxTime={maxTime}
                  minTime={minTime}
                  minute={minute}
                  onChange={handleSecondChange}
                  onBlur={handleSecondBlur}
                  required={required}
                  showLeadingZeros={showLeadingZeros}
                  value={second}
                  isInvalid={isSecondCurrentlyInvalid}
                />
              </>
            )}
            
            {/* AM/PM selector (if 12-hour format) */}
            {is12HourFormat && (
              <AmPm
                className="timepicker"
                disabled={!enabled}
                maxTime={maxTime}
                minTime={minTime}
                onChange={handleAmPmChange}
                required={required}
                value={amPm}
              />
            )}
          </div>
          
          {clearable && (
            <button
              className={classnames(styles.clearButton, styles.button)}
              disabled={!enabled}
              onClick={clear}
              onFocus={stopPropagation}
              type="button"
            >
              {clearIconElement}
            </button>
          )}
        </div>
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
        {timePickerComponent}
      </ItemWithLabel>
    );
  }

  return timePickerComponent;
});

