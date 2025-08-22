import { type CSSProperties, useId } from "react";
import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import ReactTimePicker from "react-time-picker";
import "react-time-picker/dist/TimePicker.css";
import classnames from "classnames";
import styles from "./TimePicker.module.scss";

import type { RegisterComponentApiFn, UpdateStateFn } from "../../abstractions/RendererDefs";
import { useEvent } from "../../components-core/utils/misc";
import type { ValidationStatus } from "../abstractions";
import { Adornment } from "../Input/InputAdornment";
import { ItemWithLabel } from "../FormItem/ItemWithLabel";
import Icon from "../Icon/IconNative";

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
  disableClock?: boolean;
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
  disableClock: true,
  clearable: true,
  required: false,
  name: "time",
  labelPosition: "top",
  readOnly: false,
  autoFocus: false,
  labelBreak: false,
};

export const TimePicker = forwardRef<HTMLDivElement, Props>(function TimePicker(
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
    disableClock = defaultProps.disableClock,
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
  const internalId = useId();
  const componentId = id || internalId;
  const timePickerRef = useRef<HTMLDivElement>(null);

  // State management - controlled vs uncontrolled
  const [internalValue, setInternalValue] = useState<string | null>(initialValue || null);
  const isControlled = controlledValue !== undefined;
  const currentValue = isControlled ? controlledValue : internalValue;

  // Update internal state when controlled value changes
  useEffect(() => {
    if (isControlled && controlledValue !== internalValue) {
      setInternalValue(controlledValue || null);
    }
  }, [controlledValue, isControlled, internalValue]);

  // Initialize state from initial value
  useEffect(() => {
    if (initialValue && updateState) {
      updateState({ type: "SET_VALUE", payload: { value: initialValue } });
    }
  }, [initialValue, updateState]);

  // Event handlers
  const handleChange = useEvent((newValue: string | null) => {
    if (!isControlled) {
      setInternalValue(newValue);
    }
    
    if (updateState) {
      updateState({ type: "SET_VALUE", payload: { value: newValue } });
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
          return currentValue;
        },
        set value(newValue: string | null) {
          handleChange(newValue);
        },
      });
    }
  }, [registerComponentApi, focus, currentValue, handleChange]);

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
        <ReactTimePicker
          value={currentValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onInvalidChange={handleInvalidChange}
          disabled={!enabled}
          format={format}
          maxDetail={maxDetail}
          minTime={minTime}
          maxTime={maxTime}
          disableClock={disableClock}
          clearIcon={clearable ? clearIconElement : null}
          required={required}
          name={name}
          autoFocus={autoFocus}
          data-testid="time-picker"
        />
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
