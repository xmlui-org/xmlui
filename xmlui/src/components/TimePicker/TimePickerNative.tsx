import { type CSSProperties, useId, useLayoutEffect, createElement } from "react";
import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import classnames from "classnames";
import clsx from 'clsx';
import updateInputWidth, { getFontShorthand } from 'update-input-width';
import makeEventProps from 'make-event-props';
import styles from "./TimePicker.module.scss";

// Import CSS for the TimePicker
import "./TimePicker.css";

import type { RegisterComponentApiFn, UpdateStateFn } from "../../abstractions/RendererDefs";
import { useEvent } from "../../components-core/utils/misc";
import type { ValidationStatus } from "../abstractions";
import { Adornment } from "../Input/InputAdornment";
import { ItemWithLabel } from "../FormItem/ItemWithLabel";
import Icon from "../Icon/IconNative";

// Import shared utilities and types
import { getHours, getMinutes, getSeconds, getHoursMinutes, getHoursMinutesSeconds } from './shared/dateUtils';
import { convert24to12, convert12to24 } from './shared/dates';
import { getAmPmLabels, safeMax, safeMin } from './shared/utils';
import { getFormatter, getNumberFormatter } from './shared/dateFormatter';
import Divider from './Divider';
import type { AmPmType, Detail, LooseValue, Value, LooseValuePiece, ClassName } from './shared/types';

// Browser detection utilities
const isBrowser = typeof window !== 'undefined';
const useIsomorphicLayoutEffect = isBrowser ? useLayoutEffect : useEffect;
const isIEOrEdgeLegacy = isBrowser && /(MSIE|Trident\/|Edge\/)/.test(navigator.userAgent);
const isFirefox = isBrowser && /Firefox/.test(navigator.userAgent);

// Input helper functions
function onFocus(event: React.FocusEvent<HTMLInputElement>) {
  const { target } = event;

  if (isIEOrEdgeLegacy) {
    requestAnimationFrame(() => target.select());
  } else {
    target.select();
  }
}

function updateInputWidthOnLoad(element: HTMLInputElement) {
  if (document.readyState === 'complete') {
    return;
  }

  function onLoad() {
    // Disabled updateInputWidth to use fixed CSS widths instead
    // updateInputWidth(element);
  }

  window.addEventListener('load', onLoad);
}

function updateInputWidthOnFontLoad(element: HTMLInputElement) {
  if (!document.fonts) {
    return;
  }

  const font = getFontShorthand(element);

  if (!font) {
    return;
  }

  const isFontLoaded = document.fonts.check(font);

  if (isFontLoaded) {
    return;
  }

  function onLoadingDone() {
    // Disabled updateInputWidth to use fixed CSS widths instead
    // updateInputWidth(element);
  }

  document.fonts.addEventListener('loadingdone', onLoadingDone);
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
  onKeyDown,
  onKeyUp,
  placeholder = '--',
  required,
  showLeadingZeros,
  step,
  value,
}: InputProps): React.ReactElement {
  useIsomorphicLayoutEffect(() => {
    if (!inputRef || !inputRef.current) {
      return;
    }

    // Disabled updateInputWidth to use fixed CSS widths instead
    // updateInputWidth(inputRef.current);
    // updateInputWidthOnLoad(inputRef.current);
    // updateInputWidthOnFontLoad(inputRef.current);
  }, [inputRef, value]);

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
        className={clsx(
          `${className}__input`,
          `${className}__${nameForClass || name}`,
          hasLeadingZero && `${className}__input--hasLeadingZero`,
        )}
        style={{ width: '1.8em', textAlign: 'center', padding: '0 2px' }}
        data-input="true"
        disabled={disabled}
        inputMode="numeric"
        max={max}
        min={min}
        name={name}
        onChange={onChange}
        onFocus={onFocus}
        onKeyDown={onKeyDown}
        onKeyPress={makeOnKeyPress(maxLength)}
        onKeyUp={(event: React.KeyboardEvent<HTMLInputElement> & { target: HTMLInputElement }) => {
          // Disabled updateInputWidth to use fixed CSS widths instead
          // updateInputWidth(event.target);

          if (onKeyUp) {
            onKeyUp(event);
          }
        }}
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
      className={clsx(`${className}__input`, `${className}__${name}`)}
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
} & Omit<React.ComponentProps<typeof Input>, 'max' | 'min' | 'name' | 'nameForClass'>;

function Hour12Input({
  amPm,
  maxTime,
  minTime,
  value,
  ...otherProps
}: Hour12InputProps): React.ReactElement {
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

  const value12 = value ? convert24to12(value)[0].toString() : '';

  return (
    <Input
      max={maxHour}
      min={minHour}
      name="hour12"
      nameForClass="hour"
      value={value12}
      {...otherProps}
    />
  );
}

// Hour24Input component
type Hour24InputProps = {
  maxTime?: string;
  minTime?: string;
  value?: string | null;
} & Omit<React.ComponentProps<typeof Input>, 'max' | 'min' | 'name' | 'nameForClass'>;

function Hour24Input({
  maxTime,
  minTime,
  ...otherProps
}: Hour24InputProps): React.ReactElement {
  const maxHour = safeMin(23, maxTime && getHours(maxTime));
  const minHour = safeMax(0, minTime && getHours(minTime));

  return <Input max={maxHour} min={minHour} name="hour24" nameForClass="hour" {...otherProps} />;
}

// MinuteInput component
type MinuteInputProps = {
  hour?: string | null;
  maxTime?: string;
  minTime?: string;
  showLeadingZeros?: boolean;
} & Omit<React.ComponentProps<typeof Input>, 'max' | 'min' | 'name'>;

function MinuteInput({
  hour,
  maxTime,
  minTime,
  showLeadingZeros = true,
  ...otherProps
}: MinuteInputProps): React.ReactElement {
  function isSameHour(date: string | Date) {
    return hour === getHours(date).toString();
  }

  const maxMinute = safeMin(59, maxTime && isSameHour(maxTime) && getMinutes(maxTime));
  const minMinute = safeMax(0, minTime && isSameHour(minTime) && getMinutes(minTime));

  return (
    <Input
      max={maxMinute}
      min={minMinute}
      name="minute"
      showLeadingZeros={showLeadingZeros}
      {...otherProps}
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
} & Omit<React.ComponentProps<typeof Input>, 'max' | 'min' | 'name'>;

function SecondInput({
  hour,
  maxTime,
  minTime,
  minute,
  showLeadingZeros = true,
  ...otherProps
}: SecondInputProps): React.ReactElement {
  function isSameMinute(date: string | Date) {
    return hour === getHours(date).toString() && minute === getMinutes(date).toString();
  }

  const maxSecond = safeMin(59, maxTime && isSameMinute(maxTime) && getSeconds(maxTime));
  const minSecond = safeMax(0, minTime && isSameMinute(minTime) && getSeconds(minTime));

  return (
    <Input
      max={maxSecond}
      min={minSecond}
      name="second"
      showLeadingZeros={showLeadingZeros}
      {...otherProps}
    />
  );
}

// NativeInput component
type NativeInputProps = {
  ariaLabel?: string;
  disabled?: boolean;
  maxTime?: string;
  minTime?: string;
  name?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  value?: string | Date | null;
  valueType: 'hour' | 'minute' | 'second';
};

function NativeInput({
  ariaLabel,
  disabled,
  maxTime,
  minTime,
  name,
  onChange,
  required,
  value,
  valueType,
}: NativeInputProps): React.ReactElement {
  const nativeValueParser = (() => {
    switch (valueType) {
      case 'hour':
        return (receivedValue: string | Date) => `${getHours(receivedValue)}:00`;
      case 'minute':
        return getHoursMinutes;
      case 'second':
        return getHoursMinutesSeconds;
      default:
        throw new Error('Invalid valueType');
    }
  })();

  const step = (() => {
    switch (valueType) {
      case 'hour':
        return 3600;
      case 'minute':
        return 60;
      case 'second':
        return 1;
      default:
        throw new Error('Invalid valueType');
    }
  })();

  function stopPropagation(event: React.FocusEvent<HTMLInputElement>) {
    event.stopPropagation();
  }

  return (
    <input
      aria-label={ariaLabel}
      disabled={disabled}
      hidden
      max={maxTime ? nativeValueParser(maxTime) : undefined}
      min={minTime ? nativeValueParser(minTime) : undefined}
      name={name}
      onChange={onChange}
      onFocus={stopPropagation}
      required={required}
      step={step}
      style={{
        visibility: 'hidden',
        position: 'absolute',
        zIndex: '-999',
      }}
      type="time"
      value={value ? nativeValueParser(value) : ''}
    />
  );
}

// TimePicker-specific constants and utilities
const getFormatterOptionsCache: Record<string, Intl.DateTimeFormatOptions> = {};
const allViews = ['hour', 'minute', 'second'] as const;
const formatNumber = getNumberFormatter({ useGrouping: false });

function isInternalInput(element: HTMLElement) {
  return element.dataset.input === 'true';
}

function findInput(
  element: HTMLElement,
  property: 'previousElementSibling' | 'nextElementSibling',
) {
  let nextElement: HTMLElement | null = element;
  do {
    nextElement = nextElement[property] as HTMLElement | null;
  } while (nextElement && !isInternalInput(nextElement));
  return nextElement;
}

function focus(element?: HTMLElement | null) {
  if (element) {
    element.focus();
  }
}

// TimeInput component
type TimeInputProps = {
  amPmAriaLabel?: string;
  autoFocus?: boolean;
  className: string;
  disabled?: boolean;
  format?: string;
  hourAriaLabel?: string;
  hourPlaceholder?: string;
  locale?: string;
  maxDetail?: Detail;
  maxTime?: string;
  minTime?: string;
  minuteAriaLabel?: string;
  minutePlaceholder?: string;
  name?: string;
  nativeInputAriaLabel?: string;
  onChange?: (value: Value) => void;
  onInvalidChange?: () => void;
  required?: boolean;
  secondAriaLabel?: string;
  secondPlaceholder?: string;
  value?: LooseValuePiece;
};

function TimeInput({
  amPmAriaLabel,
  autoFocus,
  className,
  disabled,
  format,
  hourAriaLabel,
  hourPlaceholder,
  locale,
  maxDetail = 'minute',
  maxTime,
  minTime,
  minuteAriaLabel,
  minutePlaceholder,
  name = 'time',
  nativeInputAriaLabel,
  onChange: onChangeProps,
  onInvalidChange,
  required,
  secondAriaLabel,
  secondPlaceholder,
  value: valueProps,
}: TimeInputProps): React.ReactElement {
  const [amPm, setAmPm] = useState<AmPmType | null>(null);
  const [hour, setHour] = useState<string | null>(null);
  const [minute, setMinute] = useState<string | null>(null);
  const [second, setSecond] = useState<string | null>(null);
  const [value, setValue] = useState<string | Date | null>(null);
  const amPmInput = useRef<HTMLSelectElement>(null);
  const hour12Input = useRef<HTMLInputElement>(null);
  const hour24Input = useRef<HTMLInputElement>(null);
  const minuteInput = useRef<HTMLInputElement>(null);
  const secondInput = useRef<HTMLInputElement>(null);
  const lastPressedKey = useRef<KeyboardEvent['key'] | undefined>(undefined);

  // biome-ignore lint/correctness/useExhaustiveDependencies: useEffect intentionally triggered on props change
  useEffect(() => {
    const nextValue = valueProps;
    console.log('[TimeInput] Processing valueProps:', valueProps, 'type:', typeof valueProps);

    if (nextValue) {
      console.log('[TimeInput] nextValue exists, parsing...');
      const parsedHour = getHours(nextValue);
      const parsedMinute = getMinutes(nextValue);
      const parsedSecond = getSeconds(nextValue);
      
      console.log('[TimeInput] Parsed values:', {
        hour: parsedHour,
        minute: parsedMinute, 
        second: parsedSecond
      });
      
      setAmPm(convert24to12(parsedHour)[1]);
      setHour(parsedHour.toString());
      setMinute(parsedMinute.toString());
      setSecond(parsedSecond.toString());
      setValue(nextValue);
      
      console.log('[TimeInput] State set - hour:', parsedHour.toString(), 'minute:', parsedMinute.toString());
    } else {
      console.log('[TimeInput] No nextValue, setting all to null');
      setAmPm(null);
      setHour(null);
      setMinute(null);
      setSecond(null);
      setValue(null);
    }
  }, [
    valueProps,
    minTime,
    maxTime,
    maxDetail,
  ]);

  const valueType = maxDetail;

  const formatTime = (() => {
    const level = allViews.indexOf(maxDetail);
    const formatterOptions =
      getFormatterOptionsCache[level] ||
      (() => {
        const options: Intl.DateTimeFormatOptions = { hour: 'numeric' };
        if (level >= 1) {
          options.minute = 'numeric';
        }
        if (level >= 2) {
          options.second = 'numeric';
        }

        getFormatterOptionsCache[level] = options;

        return options;
      })();

    return getFormatter(formatterOptions);
  })();

  // Determine what components to show based on format
  const is12HourFormat = format && format.includes('a');
  const showSeconds = format && format.includes('s');
  const showLeadingZeros = format && (format.includes('HH') || format.includes('mm') || format.includes('ss'));

  console.log('[TimeInput] Format analysis:', {
    format,
    is12HourFormat,
    showSeconds,
    showLeadingZeros,
    maxDetail
  });

  console.log('[TimeInput] Rendering with:', {
    hour,
    minute,
    second,
    amPm,
    is12HourFormat,
    showSeconds: showSeconds && maxDetail !== 'minute' && maxDetail !== 'hour',
    actualMaxDetail: maxDetail
  });

  // Create refs for focus management
  const hourInputRef = useRef<HTMLInputElement>(null);
  const minuteInputRef = useRef<HTMLInputElement>(null);
  const secondInputRef = useRef<HTMLInputElement>(null);
  const amPmInputRef = useRef<HTMLSelectElement>(null);

  // Handle changes from individual inputs
  const handleHourChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newHour = event.target.value;
    setHour(newHour);
    console.log('[TimeInput] Hour changed to:', newHour);
    
    // Update the complete time value
    if (onChangeProps) {
      const timeString = formatTimeValue(newHour, minute, second, amPm, is12HourFormat);
      console.log('[TimeInput] Calling onChange with timeString:', timeString);
      onChangeProps(timeString);
    }
  }, [minute, second, amPm, is12HourFormat, onChangeProps]);

  const handleMinuteChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newMinute = event.target.value;
    setMinute(newMinute);
    console.log('[TimeInput] Minute changed to:', newMinute);
    
    if (onChangeProps) {
      const timeString = formatTimeValue(hour, newMinute, second, amPm, is12HourFormat);
      console.log('[TimeInput] Calling onChange with timeString:', timeString);
      onChangeProps(timeString);
    }
  }, [hour, second, amPm, is12HourFormat, onChangeProps]);

  const handleSecondChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newSecond = event.target.value;
    setSecond(newSecond);
    console.log('[TimeInput] Second changed to:', newSecond);
    
    if (onChangeProps) {
      const timeString = formatTimeValue(hour, minute, newSecond, amPm, is12HourFormat);
      console.log('[TimeInput] Calling onChange with timeString:', timeString);
      onChangeProps(timeString);
    }
  }, [hour, minute, amPm, is12HourFormat, onChangeProps]);

  const handleAmPmChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
    const newAmPm = event.target.value as AmPmType;
    setAmPm(newAmPm);
    console.log('[TimeInput] AmPm changed to:', newAmPm);
    
    if (onChangeProps) {
      const timeString = formatTimeValue(hour, minute, second, newAmPm, is12HourFormat);
      console.log('[TimeInput] Calling onChange with timeString:', timeString);
      onChangeProps(timeString);
    }
  }, [hour, minute, second, is12HourFormat, onChangeProps]);

  // Helper function to format the complete time value
  function formatTimeValue(h: string | null, m: string | null, s: string | null, ap: AmPmType | null, is12Hour: boolean): string | null {
    if (!h || !m) return null;
    
    let formattedTime = '';
    
    if (is12Hour) {
      // 12-hour format
      const hour12 = h.padStart(2, '0');
      const minute12 = m.padStart(2, '0');
      formattedTime = `${hour12}:${minute12}`;
      
      if (s && (showSeconds || maxDetail === 'second')) {
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
      
      if (s && (showSeconds || maxDetail === 'second')) {
        formattedTime += `:${s.padStart(2, '0')}`;
      }
    }
    
    return formattedTime;
  }

  // Render the composed input components
  return (
    <div className={className}>
      {/* Hour input */}
      {is12HourFormat ? (
        <Hour12Input
          amPm={amPm}
          ariaLabel={hourAriaLabel}
          autoFocus={autoFocus}
          className={baseClassName}
          disabled={disabled}
          inputRef={hourInputRef}
          maxTime={maxTime}
          minTime={minTime}
          onChange={handleHourChange}
          placeholder={hourPlaceholder}
          required={required}
          showLeadingZeros={showLeadingZeros}
          value={hour}
        />
      ) : (
        <Hour24Input
          ariaLabel={hourAriaLabel}
          autoFocus={autoFocus}
          className={baseClassName}
          disabled={disabled}
          inputRef={hourInputRef}
          maxTime={maxTime}
          minTime={minTime}
          onChange={handleHourChange}
          placeholder={hourPlaceholder}
          required={required}
          showLeadingZeros={showLeadingZeros}
          value={hour}
        />
      )}
      
      <Divider>:</Divider>
      
      {/* Minute input */}
      <MinuteInput
        ariaLabel={minuteAriaLabel}
        className={baseClassName}
        disabled={disabled}
        hour={hour}
        inputRef={minuteInputRef}
        maxTime={maxTime}
        minTime={minTime}
        onChange={handleMinuteChange}
        placeholder={minutePlaceholder}
        required={required}
        showLeadingZeros={showLeadingZeros}
        value={minute}
      />
      
      {/* Second input (if needed) */}
      {(showSeconds || maxDetail === 'second') && (
        <>
          <Divider>:</Divider>
          <SecondInput
            ariaLabel={secondAriaLabel}
            className={baseClassName}
            disabled={disabled}
            hour={hour}
            inputRef={secondInputRef}
            maxTime={maxTime}
            minTime={minTime}
            minute={minute}
            onChange={handleSecondChange}
            placeholder={secondPlaceholder}
            required={required}
            showLeadingZeros={showLeadingZeros}
            value={second}
          />
        </>
      )}
      
      {/* AM/PM selector (if 12-hour format) */}
      {is12HourFormat && (
        <AmPm
          ariaLabel={amPmAriaLabel}
          className={baseClassName}
          disabled={disabled}
          inputRef={amPmInputRef}
          locale={locale}
          maxTime={maxTime}
          minTime={minTime}
          onChange={handleAmPmChange}
          required={required}
          value={amPm}
        />
      )}
    </div>
  );
}

// TimePicker component constants
const baseClassName = 'react-time-picker';

const iconProps = {
  xmlns: 'http://www.w3.org/2000/svg',
  width: 19,
  height: 19,
  viewBox: '0 0 19 19',
  stroke: 'black',
  strokeWidth: 2,
};

const ClearIcon = (
  <svg
    {...iconProps}
    aria-hidden="true"
    className={`${baseClassName}__clear-button__icon ${baseClassName}__button__icon`}
  >
    <line x1="4" x2="15" y1="4" y2="15" />
    <line x1="15" x2="4" y1="4" y2="15" />
  </svg>
);

type ReactNodeLike = React.ReactNode | string | number | boolean | null | undefined;
type Icon = ReactNodeLike | ReactNodeLike[];
type IconOrRenderFunction = Icon | React.ComponentType | React.ReactElement;
type EventProps = ReturnType<typeof makeEventProps>;

export type TimePickerProps = {
  amPmAriaLabel?: string;
  autoFocus?: boolean;
  className?: ClassName;
  clearAriaLabel?: string;
  clearIcon?: IconOrRenderFunction | null;
  'data-testid'?: string;
  disabled?: boolean;
  format?: string;
  hourAriaLabel?: string;
  hourPlaceholder?: string;
  id?: string;
  locale?: string;
  maxDetail?: Detail;
  maxTime?: string;
  minTime?: string;
  minuteAriaLabel?: string;
  minutePlaceholder?: string;
  name?: string;
  nativeInputAriaLabel?: string;
  onChange?: (value: Value) => void;
  onFocus?: (event: React.FocusEvent<HTMLDivElement>) => void;
  onInvalidChange?: () => void;
  required?: boolean;
  secondAriaLabel?: string;
  secondPlaceholder?: string;
  value?: LooseValue;
} & Omit<EventProps, 'onChange' | 'onFocus'>;

function TimePicker(props: TimePickerProps): React.ReactElement {
  const {
    amPmAriaLabel,
    autoFocus,
    className,
    clearAriaLabel,
    clearIcon = ClearIcon,
    'data-testid': dataTestid,
    hourAriaLabel,
    hourPlaceholder,
    disabled,
    format,
    id,
    locale,
    maxTime,
    maxDetail = 'minute',
    minTime,
    minuteAriaLabel,
    minutePlaceholder,
    name = 'time',
    nativeInputAriaLabel,
    onChange: onChangeProps,
    onFocus: onFocusProps,
    onInvalidChange,
    required,
    value,
    secondAriaLabel,
    secondPlaceholder,
    ...otherProps
  } = props;

  const wrapper = useRef<HTMLDivElement>(null);

  function onChange(value: Value) {
    if (onChangeProps) {
      onChangeProps(value);
    }
  }

  function onFocus(event: React.FocusEvent<HTMLInputElement>) {
    if (onFocusProps) {
      onFocusProps(event);
    }
  }

  function clear() {
    onChange(null);
  }

  function stopPropagation(event: React.FocusEvent) {
    event.stopPropagation();
  }

  function renderInputs() {
    const [valueFrom] = Array.isArray(value) ? value : [value];
    console.log('[TimePicker] renderInputs - value:', value, 'valueFrom:', valueFrom, 'typeof valueFrom:', typeof valueFrom);

    const ariaLabelProps = {
      amPmAriaLabel,
      hourAriaLabel,
      minuteAriaLabel,
      nativeInputAriaLabel,
      secondAriaLabel,
    };

    const placeholderProps = {
      hourPlaceholder,
      minutePlaceholder,
      secondPlaceholder,
    };

    return (
      <div className={`${baseClassName}__wrapper`}>
        <TimeInput
          {...ariaLabelProps}
          {...placeholderProps}
          autoFocus={autoFocus}
          className={`${baseClassName}__inputGroup`}
          disabled={disabled}
          format={format}
          locale={locale}
          maxDetail={maxDetail}
          maxTime={maxTime}
          minTime={minTime}
          name={name}
          onChange={onChange}
          onInvalidChange={onInvalidChange}
          required={required}
          value={valueFrom}
        />
        {clearIcon !== null && (
          <button
            aria-label={clearAriaLabel}
            className={`${baseClassName}__clear-button ${baseClassName}__button`}
            disabled={disabled}
            onClick={clear}
            onFocus={stopPropagation}
            type="button"
          >
            {typeof clearIcon === 'function' ? createElement(clearIcon) : clearIcon}
          </button>
        )}
      </div>
    );
  }

  const eventProps = useMemo(
    () => makeEventProps(otherProps),
    // biome-ignore lint/correctness/useExhaustiveDependencies: FIXME
    [otherProps],
  );

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: False positive caused by non interactive wrapper listening for bubbling events
    <div
      className={clsx(
        baseClassName,
        `${baseClassName}--disabled`,
        className,
      )}
      data-testid={dataTestid}
      id={id}
      {...eventProps}
      onFocus={onFocus}
      ref={wrapper}
    >
      {renderInputs()}
    </div>
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
  console.log('[TimePickerNative] Props received:', {
    initialValue,
    value: controlledValue,
    id: id || 'auto-generated'
  });
  
  const internalId = useId();
  const componentId = id || internalId;
  const timePickerRef = useRef<HTMLDivElement>(null);

  // Local state management - sync with value prop (like TextBox and NumberBox)
  const [localValue, setLocalValue] = useState<string | null>(controlledValue || null);
  console.log('[TimePicker] Initial localValue state:', localValue);
  
  useEffect(() => {
    // If there's no controlled value, use the initial value
    const valueToUse = (controlledValue === null || controlledValue === undefined) ? initialValue : controlledValue;
    setLocalValue(valueToUse || null);
  }, [controlledValue, initialValue]);

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
    return undefined; // Use default
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
        <TimePicker
          value={localValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onInvalidChange={handleInvalidChange}
          disabled={!enabled}
          format={format}
          maxDetail={maxDetail}
          minTime={minTime}
          maxTime={maxTime}
          clearIcon={clearable ? clearIconElement : null}
          required={required}
          name={name}
          autoFocus={autoFocus}
          data-testid="time-picker"
        />
        {/* Debug info */}
        {process.env.NODE_ENV === 'development' && (
          <div style={{ fontSize: '10px', color: '#666', marginTop: '4px' }}>
            Debug: localValue={typeof localValue === 'string' ? localValue : JSON.stringify(localValue)}, controlledValue={typeof controlledValue === 'string' ? controlledValue : JSON.stringify(controlledValue)}, initialValue={JSON.stringify(initialValue)}
          </div>
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
        {timePickerComponent}
      </ItemWithLabel>
    );
  }

  return timePickerComponent;
});
