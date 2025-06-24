import React, {
  type CSSProperties,
  type ForwardedRef,
  forwardRef,
  type RefObject,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
} from "react";
import classnames from "classnames";

import styles from "./NumberBox.module.scss";

import type { RegisterComponentApiFn, UpdateStateFn } from "../../abstractions/RendererDefs";
import { noop } from "../../components-core/constants";
import { useEvent } from "../../components-core/utils/misc";
import {
  clamp,
  DECIMAL_SEPARATOR,
  DEFAULT_STEP,
  empty,
  EXPONENTIAL_SEPARATOR,
  FLOAT_REGEXP,
  INT_REGEXP,
  isEmptyLike,
  isOutOfBounds,
  isUsableFloat,
  mapToRepresentation,
  NUMBERBOX_MAX_VALUE,
  toUsableNumber,
} from "./numberbox-abstractions";
import { type ValidationStatus } from "../abstractions";
import { Icon } from "../Icon/IconNative";
import { Adornment } from "../Input/InputAdornment";
import { Button } from "../Button/ButtonNative";
import { ItemWithLabel } from "../FormItem/ItemWithLabel";
import { isNaN } from "lodash-es";
import { NumberParser, NumberFormatter } from "@internationalized/number";

// Default props for NumberBox2 component
export const defaultProps = {
  zeroOrPositive: false,
  min: -NUMBERBOX_MAX_VALUE,
  max: NUMBERBOX_MAX_VALUE,
  maxFractionDigits: 3,
  enabled: true,
  integersOnly: false,
  validationStatus: "none" as ValidationStatus,
  hasSpinBox: true,
  step: 1,
  labelPosition: "top",
};

type Props = {
  id?: string;
  style?: CSSProperties;
  className?: string;
  value?: number | string | null;
  initialValue?: number | string | null;
  placeholder?: string;
  min?: number;
  max?: number;
  maxFractionDigits?: number;
  enabled?: boolean;
  autoFocus?: boolean;
  readOnly?: boolean;
  required?: boolean;
  validationStatus?: ValidationStatus;
  hasSpinBox?: boolean;
  step?: number | string;
  maxLength?: number;
  integersOnly?: boolean;
  zeroOrPositive?: boolean;
  updateState?: UpdateStateFn;
  onDidChange?: (newValue: number | string | null | undefined) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  registerComponentApi?: RegisterComponentApiFn;
} & LabelProps &
  AdornmentProps;

type LabelProps = {
  label?: string;
  labelPosition?: string;
  labelWidth?: string;
  labelBreak?: boolean;
};

type AdornmentProps = {
  startText?: string;
  startIcon?: string;
  endText?: string;
  endIcon?: string;
  spinnerUpIcon?: string;
  spinnerDownIcon?: string;
};

export const NumberBox2 = forwardRef(function NumberBox2(
  {
    id,
    style,
    className,
    value,
    initialValue,
    zeroOrPositive = defaultProps.zeroOrPositive,
    min = zeroOrPositive ? 0 : defaultProps.min,
    max = defaultProps.max,
    maxFractionDigits = defaultProps.maxFractionDigits,
    enabled = defaultProps.enabled,
    placeholder,
    step = defaultProps.step,
    integersOnly = defaultProps.integersOnly,
    validationStatus = defaultProps.validationStatus,
    hasSpinBox = defaultProps.hasSpinBox,
    updateState = noop,
    onDidChange = noop,
    onFocus = noop,
    onBlur = noop,
    registerComponentApi,
    startText,
    startIcon,
    endText,
    endIcon,
    spinnerUpIcon,
    spinnerDownIcon,
    autoFocus,
    readOnly,
    required,
    label,
    labelPosition,
    labelWidth,
    labelBreak,
  }: Props,
  forwardedRef: ForwardedRef<HTMLDivElement>,
) {
  const inputRef = useRef<HTMLInputElement>(null);
  const upButton = useRef<HTMLButtonElement>(null);
  const downButton = useRef<HTMLButtonElement>(null);

  // Formatter & Parser
  const locale = "en-US";
  const formatOptions: Intl.NumberFormatOptions = useMemo(() => {
    return {
      useGrouping: false,
      minimumFractionDigits: 0,
      maximumFractionDigits: integersOnly ? 0 : maxFractionDigits,
    };
  }, [maxFractionDigits, integersOnly]);
  const formatter = useNumberFormatter(locale, formatOptions);
  const parser = useNumberParser(locale, formatOptions);

  min = clamp(
    toUsableNumber(min, true) ?? (zeroOrPositive ? 0 : -NUMBERBOX_MAX_VALUE),
    (zeroOrPositive ? 0 : -NUMBERBOX_MAX_VALUE),
    NUMBERBOX_MAX_VALUE,
  );
  max = clamp(
    toUsableNumber(max, true) ?? (zeroOrPositive ? 0 : -NUMBERBOX_MAX_VALUE),
    (zeroOrPositive ? 0 : -NUMBERBOX_MAX_VALUE),
    NUMBERBOX_MAX_VALUE,
  );

  const initializeValue = useCallback(
    (value: string | number | null, defaultValue: string = "") => {
      return isEmptyLike(value) || isNaN(parser.parse(value.toString()))
        ? defaultValue
        : formatter.format(clamp(+value, min, max));
    },
    [formatter, parser, min, max],
  );

  // --- Convert to representable string value (from number | null | undefined)
  const [valueStrRep, setValueStrRep] = React.useState<string>(initializeValue(value));
  useLayoutEffect(() => {
    setValueStrRep(initializeValue(value));
  }, [value, initializeValue]);

  const onFixCursorPosition = useCursorCorrection(valueStrRep, inputRef);
  const _step = toUsableNumber(step, true) ?? DEFAULT_STEP;
  const inputMode = useMemo(() => {
    // The inputMode attribute influences the software keyboard that is shown on touch devices.
    // Browsers and operating systems are quite inconsistent about what keys are available.
    // We choose between numeric and decimal based on whether we allow negative and fractional numbers,
    // and based on testing on various devices to determine what keys are available in each inputMode.
    const hasDecimals = formatter.resolvedOptions().maximumFractionDigits! > 0;
    return hasDecimals ? "decimal" : "numeric";
  }, [formatter]);

  // --- Initialize the related field with the input's initial value
  useEffect(() => {
    updateState({ value: initialValue }, { initial: true });
  }, [initialValue, updateState]);

  const clampInputValue = useCallback(
    (value: number) => {
      return clamp(value, min, max);
    },
    [min, max],
  );

  const clampAndSaveInput = useCallback(
    (value: string | number) => {
      if (isEmptyLike(value)) {
        updateState({ value: null });
        return;
      }

      value = value.toString();
      // Set to empty state if input value is empty
      if (!value.length) {
        updateState({ value: null });
        return;
      }

      let parsedValue = parser.parse(value);
      parsedValue = clampInputValue(parsedValue);

      // if it failed to parse, then reset input to formatted version of current number
      if (isNaN(parsedValue)) {
        updateState({ value });
        return;
      }

      // value representation needs to be synchronized with the last parsed value
      setValueStrRep((lastVal) => {
        const formatted = formatter.format(parsedValue);
        if (lastVal !== formatted) {
          return formatted;
        }
        return lastVal;
      });
      updateState({ value: parsedValue });
    },
    [clampInputValue, updateState, parser, formatter],
  );

  // --- Stepper logic
  const increment = useCallback(() => {
    if (!enabled) return;
    if (readOnly) return;
    const currentValue = isEmptyLike(value) || isNaN(value) ? "0" : value.toString();
    const newValue = handleChangingValue(currentValue, parser, "increase", _step, min, max);
    updateState({ value: newValue });
  }, [value, enabled, readOnly, parser, _step, min, max, updateState]);

  const decrement = useCallback(() => {
    if (!enabled) return;
    if (readOnly) return;
    const currentValue = isEmptyLike(value) || isNaN(value) ? "0" : value.toString();
    const newValue = handleChangingValue(currentValue, parser, "decrease", _step, min, max);
    updateState({ value: newValue });
  }, [value, enabled, readOnly, parser, _step, min, max, updateState]);

  // --- Register stepper logic to buttons
  useLongPress(upButton.current, increment);
  useLongPress(downButton.current, decrement);

  // --- Handle input
  const _onBeforeInput = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const target = event.target;
      const nextValue = parser.parse(
        target.value.slice(0, target.selectionStart ?? undefined) +
        ((event.nativeEvent as InputEvent).data ?? "") +
        target.value.slice(target.selectionEnd ?? undefined)
      ).toString();

      // pre-validate
      if (!parser.isValidPartialNumber(nextValue, min, max)) {
        event.preventDefault();
      }
    },
    [parser, min, max],
  );

  const _onChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const strValue = event.target.value;
      let parsed = clampInputValue(parser.parse(event.target.value));
      if (integersOnly && Number.isInteger(parsed)) {
        parsed = Math.trunc(parsed);
      }

      // NOTE: This is the most important part.
      // We only synchronize values when they are a valid number
      // Otherwise we only update the local string representation and
      // synchronize the value from state when the input is blurred.
      if (canSynchronizeValue(strValue, locale, formatOptions)) {
        updateState({ value: parsed });
      } else {
        setValueStrRep(strValue);
      }

      // TODO: this needs to be adjusted based on the number of group separators (no group separators yet)
      onFixCursorPosition(event);
      onDidChange(parsed);
    },
    [
      clampInputValue,
      parser,
      onDidChange,
      locale,
      formatOptions,
      onFixCursorPosition,
      updateState,
      integersOnly,
    ],
  );

  const _onFocus = useCallback(() => {
    onFocus?.();
  }, [onFocus]);

  const _onBlur = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      clampAndSaveInput(value);
      onBlur();
    },
    [clampAndSaveInput, onBlur],
  );

  const _onKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter") {
        clampAndSaveInput(value);
      }
      if (event.code === "ArrowUp") {
        event.preventDefault();
        increment();
      }
      if (event.code === "ArrowDown") {
        event.preventDefault();
        decrement();
      }
    },
    [clampAndSaveInput, increment, decrement, value],
  );

  // --- Register API events
  const focus = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (autoFocus) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  }, [autoFocus]);

  const setValue = useEvent((newValue) => {
    updateState({ value: newValue });
  });

  useEffect(() => {
    registerComponentApi?.({
      focus,
      setValue,
    });
  }, [focus, registerComponentApi, setValue]);

  return (
    <ItemWithLabel
      ref={forwardedRef}
      labelPosition={labelPosition as any}
      label={label}
      labelWidth={labelWidth}
      labelBreak={labelBreak}
      required={required}
      enabled={enabled}
      onFocus={onFocus}
      onBlur={onBlur}
      style={style}
      className={className}
    >
      <div
        className={classnames(styles.inputRoot, {
          [styles.readOnly]: readOnly,
          [styles.disabled]: !enabled,
          [styles.noSpinBox]: !hasSpinBox,
          [styles.error]: validationStatus === "error",
          [styles.warning]: validationStatus === "warning",
          [styles.valid]: validationStatus === "valid",
        })}
        tabIndex={-1}
        onFocus={() => {
          inputRef.current?.focus();
        }}
      >
        <Adornment text={startText} iconName={startIcon} className={styles.adornment} />
        <input
          id={id}
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          required={required}
          readOnly={readOnly}
          disabled={!enabled}
          inputMode={inputMode}
          className={classnames(styles.input)}
          value={valueStrRep}
          min={min}
          max={max}
          autoFocus={autoFocus}
          onBeforeInput={_onBeforeInput}
          onChange={_onChange}
          onFocus={_onFocus}
          onBlur={_onBlur}
          onKeyDown={_onKeyDown}
        />
        <Adornment text={endText} iconName={endIcon} className={styles.adornment} />
        {hasSpinBox && (
          <div className={styles.spinnerBox}>
            <Button
              data-spinner="up"
              type="button"
              variant={"ghost"}
              themeColor={"secondary"}
              tabIndex={-1}
              className={styles.spinnerButton}
              disabled={!enabled || readOnly}
              ref={upButton}
            >
              <Icon name={spinnerUpIcon || "spinnerUp:NumberBox"} fallback="chevronup" size="sm" />
            </Button>
            <Button
              data-spinner="down"
              type="button"
              tabIndex={-1}
              variant={"ghost"}
              themeColor={"secondary"}
              className={styles.spinnerButton}
              disabled={!enabled || readOnly}
              ref={downButton}
            >
              <Icon name={spinnerDownIcon || "spinnerDown:NumberBox"} fallback="chevrondown" size="sm" />
            </Button>
          </div>
        )}
      </div>
    </ItemWithLabel>
  );
});

function useNumberFormatter(locale: string, options?: Intl.NumberFormatOptions) {
  return useMemo(() => {
    return new NumberFormatter(locale, options);
  }, [locale, options]);
}

function useNumberParser(locale: string, options?: Intl.NumberFormatOptions) {
  return useMemo(() => {
    return new NumberParser(locale, options);
  }, [locale, options]);
}

function useLongPress(elementRef: HTMLElement | null, action: () => void, delay: number = 500) {
  const timeoutId = useRef(0);
  const intervalId = useRef(0);
  const savedAction = useRef<() => void>(action);

  // Remember the latest action callback, since it is different every render
  useEffect(() => {
    savedAction.current = action;
  }, [action]);

  useEffect(() => {
    const onMouseDown = () => {
      savedAction.current?.();

      timeoutId.current = window.setTimeout(() => {
        intervalId.current = window.setInterval(() => {
          savedAction.current?.();
        }, 100);
      }, delay);
    };

    const onMouseUp = () => {
      clearTimeout(timeoutId.current);
      clearInterval(intervalId.current);
    };

    const onMouseOut = () => {
      clearTimeout(timeoutId.current);
      clearInterval(intervalId.current);
    };

    elementRef?.addEventListener("mousedown", onMouseDown);
    elementRef?.addEventListener("mouseup", onMouseUp);
    elementRef?.addEventListener("mouseout", onMouseOut);

    return () => {
      elementRef?.removeEventListener("mousedown", onMouseDown);
      elementRef?.removeEventListener("mouseup", onMouseUp);
      elementRef?.removeEventListener("mouseout", onMouseOut);
    };
  }, [elementRef, action, delay]);
}

function handleChangingValue(
  value: string,
  parser: NumberParser,
  type: "increase" | "decrease",
  step = 1,
  min = -NUMBERBOX_MAX_VALUE,
  max = NUMBERBOX_MAX_VALUE,
) {
  const currentInputValue = parser.parse(value ?? "");
  if (isNaN(currentInputValue)) {
    return min ?? 0;
  }

  if (type === "increase") {
    return clamp(currentInputValue + (step ?? 1), min, max);
  } else {
    return clamp(currentInputValue - (step ?? 1), min, max);
  }
}

function canSynchronizeValue(value: string, locale?: string, options?: Intl.NumberFormatOptions) {
  if (value.trim() === "") return true;
  if (isNaN(value)) return false;
  if (hasLeadingZeros(value, locale, options)) return false;
  if (isFloatWithTrailingZeros(value, locale, options)) return false;
  if (overMaximumFractionDigits(value, locale, options)) return false;
  return true;
}

function hasLeadingZeros(input: string, locale = "en-US", options?: Intl.NumberFormatOptions) {
  // Create a formatter to detect locale-specific separators
  const formatter = new Intl.NumberFormat(locale, options);
  const parts = formatter.formatToParts(1234.5);

  const group = parts.find((p) => p.type === "group")?.value || "";
  const decimal = parts.find((p) => p.type === "decimal")?.value || "";

  // Normalize separators for parsing
  const normalized = (
    group === "" ? input : input.replace(new RegExp(`\\${group}`, "g"), "")
  ).replace(decimal, ".");

  if (!/^-?\d*\.?\d*$/.test(normalized)) return false;

  const [integer, fraction] = normalized.split(".");

  // Integer validation
  if (!fraction) {
    return integer.length > 1 && integer.startsWith("0");
  }

  // Float validation
  const leadingIntegerZeros = integer.startsWith("0") && integer.length >= 1;
  const leadingFractionZeros = (fraction.match(/^0+/) || [""])[0].length >= 2;

  return leadingIntegerZeros || leadingFractionZeros;
}

function isFloatWithTrailingZeros(
  input: string,
  locale = "en-US",
  options?: Intl.NumberFormatOptions,
) {
  // Create formatter to detect locale-specific separators
  const formatter = new Intl.NumberFormat(locale, options);
  const parts = formatter.formatToParts(1234.5);

  const group = parts.find((p) => p.type === "group")?.value || "";
  const decimal = parts.find((p) => p.type === "decimal")?.value || ".";

  // Normalize separators for parsing
  const normalized = (
    group === "" ? input : input.replace(new RegExp(`\\${group}`, "g"), "")
  ).replace(decimal, ".");

  // Validate numeric format
  if (!/^-?\d*\.?\d*$/.test(normalized)) return false;

  // Check if it's a float (has decimal point)
  if (!normalized.includes(".")) return false;

  // Split into integer and fractional parts
  const [_, fraction] = normalized.split(".");

  // Must have fractional digits to be a float -> integers get a pass
  if (!fraction || fraction.length === 0) return true;

  // Check for trailing zeros in the fractional part
  return /0+$/.test(fraction);
}

function overMaximumFractionDigits(
  input: string,
  locale = "en-US",
  options?: Intl.NumberFormatOptions,
) {
  // Create a formatter to detect locale-specific separators
  const formatter = new Intl.NumberFormat(locale, options);
  const parts = formatter.formatToParts(1234.5);

  const group = parts.find((p) => p.type === "group")?.value || "";
  const decimal = parts.find((p) => p.type === "decimal")?.value || "";

  // Normalize separators for parsing
  const normalized = (
    group === "" ? input : input.replace(new RegExp(`\\${group}`, "g"), "")
  ).replace(decimal, ".");

  if (!/^-?\d*\.?\d*$/.test(normalized)) return false;

  const [_, fraction] = normalized.split(".");

  // Integer validation
  if (!fraction) {
    return false;
  }

  // Float validation
  return fraction.length > options.maximumFractionDigits!;
}

/**
 * Solution comes from: https://giacomocerquone.com/blog/keep-input-cursor-still/
 */
function useCursorCorrection(value: string | number | null, inputRef: RefObject<HTMLInputElement>) {
  const position = useRef({
    beforeStart: 0,
    beforeEnd: 0,
  });

  useLayoutEffect(() => {
    inputRef.current.setSelectionRange(position.current.beforeStart, position.current.beforeEnd);
  }, [value]);

  const onInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    position.current.beforeStart = event.target.selectionStart;
    position.current.beforeEnd = event.target.selectionEnd;
  };

  return onInputChange;
}

// TODO: Buggy, does not account for our partially formatted values, only for group separators
/* function useCursorCorrection1(
  value: string | number | null,
  inputRef: React.RefObject<HTMLInputElement>,
) {
  const position = useRef({
    beforeStart: 0,
    beforeEnd: 0,
  });
  const previousValue = useRef<string | number | null>(null);

  useLayoutEffect(() => {
    if (!inputRef.current) return;

    // Initial setup for first render
    if (previousValue.current === null) {
      previousValue.current = value;
      return;
    }

    const oldValue = String(previousValue.current);
    const newValue = String(value ?? "");

    // Adjust cursor positions based on digit offsets
    const adjustPosition = (originalPos: number) => {
      const targetDigitCount = countDigitsBefore(oldValue, originalPos);
      return findNewPosition(newValue, targetDigitCount);
    };

    const newStart = adjustPosition(position.current.beforeStart);
    const newEnd = adjustPosition(position.current.beforeEnd);

    inputRef.current.setSelectionRange(newStart, newEnd);
    previousValue.current = value;
  }, [value, inputRef]);

  const onInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    position.current.beforeStart = event.target.selectionStart ?? 0;
    position.current.beforeEnd = event.target.selectionEnd ?? 0;
  };

  return onInputChange;
}

// Helper functions
function countDigitsBefore(s: string, pos: number): number {
  let count = 0;
  for (let i = 0; i < pos && i < s.length; i++) {
    if (/\d/.test(s[i])) count++;
  }
  return count;
}

function findNewPosition(newValue: string, targetDigitCount: number): number {
  let currentCount = 0;
  for (let i = 0; i < newValue.length; i++) {
    if (currentCount === targetDigitCount) return i;
    if (/\d/.test(newValue[i])) currentCount++;
  }
  return newValue.length; // Fallback to end position
}
 */
