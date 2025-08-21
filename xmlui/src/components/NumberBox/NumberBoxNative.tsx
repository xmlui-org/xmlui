import React, {
  type CSSProperties,
  type ForwardedRef,
  forwardRef,
  useCallback,
  useEffect,
  useId,
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
  EXPONENTIAL_SEPARATOR,
  FLOAT_REGEXP,
  INT_REGEXP,
  isEmptyLike,
  mapToRepresentation,
  NUMBERBOX_MAX_VALUE,
  toUsableNumber,
} from "./numberbox-abstractions";
import { type ValidationStatus } from "../abstractions";
import { Icon } from "../Icon/IconNative";
import { Adornment } from "../Input/InputAdornment";
import { Button } from "../Button/ButtonNative";
import { ItemWithLabel } from "../FormItem/ItemWithLabel";

// Default props for NumberBox component
export const defaultProps = {
  enabled: true,
  validationStatus: "none" as ValidationStatus,
  hasSpinBox: true,
  integersOnly: false,
  zeroOrPositive: false,
  min: -NUMBERBOX_MAX_VALUE,
  max: NUMBERBOX_MAX_VALUE,
  step: 1,
  updateState: noop,
  onDidChange: noop,
  onFocus: noop,
  onBlur: noop,
};

// =====================================================================================================================
// React NumberBox component definition

type Props = {
  id?: string;
  value?: number | string | null;
  initialValue?: number | string | null;
  style?: CSSProperties;
  className?: string;
  step?: number | string;
  enabled?: boolean;
  placeholder?: string;
  hasSpinBox?: boolean;
  validationStatus?: ValidationStatus;
  min?: number;
  max?: number;
  maxLength?: number;
  integersOnly?: boolean;
  zeroOrPositive?: boolean;
  updateState?: UpdateStateFn;
  onDidChange?: (newValue: number | string | null | undefined) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  registerComponentApi?: RegisterComponentApiFn;
  startText?: string;
  startIcon?: string;
  endText?: string;
  endIcon?: string;
  gap?: string;
  spinnerUpIcon?: string;
  spinnerDownIcon?: string;
  autoFocus?: boolean;
  readOnly?: boolean;
  required?: boolean;
  label?: string;
  labelPosition?: string;
  labelWidth?: string;
  labelBreak?: boolean;
};

export const NumberBox = forwardRef(function NumberBox(
  {
    id,
    value,
    initialValue,
    style,
    className,
    enabled = defaultProps.enabled,
    placeholder,
    validationStatus = defaultProps.validationStatus,
    hasSpinBox = defaultProps.hasSpinBox,
    step = defaultProps.step,
    integersOnly = defaultProps.integersOnly,
    zeroOrPositive = defaultProps.zeroOrPositive,
    min = zeroOrPositive ? 0 : defaultProps.min,
    max = defaultProps.max,
    maxLength,
    updateState = defaultProps.updateState,
    onDidChange = defaultProps.onDidChange,
    onFocus = defaultProps.onFocus,
    onBlur = defaultProps.onBlur,
    registerComponentApi,
    startText,
    startIcon,
    endText,
    endIcon,
    gap,
    spinnerUpIcon,
    spinnerDownIcon,
    autoFocus,
    readOnly,
    required,
    label,
    labelPosition,
    labelWidth,
    labelBreak,
    ...rest
  }: Props,
  forwardedRef: ForwardedRef<HTMLDivElement>,
) {
  const _id = useId();
  id = id || _id;
  // --- Ensure the provided value is a number or null

  // Ensure the provided minimum is not smaller than the 0 if zeroOrPositive is set to true
  min = Math.max(zeroOrPositive ? 0 : -NUMBERBOX_MAX_VALUE, min);

  // Step must be an integer since floating point arithmetic needs a deeper dive.
  const _step = toUsableNumber(step, true) ?? DEFAULT_STEP;

  const inputRef = useRef<HTMLInputElement>(null);
  const upButton = useRef<HTMLButtonElement>(null);
  const downButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (autoFocus) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  }, [autoFocus]);

  // --- Convert to representable string value (from number | null | undefined)
  const [valueStrRep, setValueStrRep] = React.useState<string>(mapToRepresentation(value));
  useEffect(() => {
    setValueStrRep(mapToRepresentation(value));
  }, [value]);

  // --- Initialize the related field with the input's initial value
  useEffect(() => {
    updateState({ value: initialValue }, { initial: true });
  }, [initialValue, updateState]);

  // --- Handle the value change events for this input
  const updateValue = useCallback(
    (newValue: string | number | null | undefined, rep: string) => {
      setValueStrRep(rep);
      updateState({ value: newValue });
      onDidChange(newValue);
    },
    [onDidChange, updateState],
  );

  // --- Keypress
  const onInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      // const newValue = sanitizeInput(event.target.value.trim(), value, integersOnly, zeroOrPositive, min, max);
      // if (!newValue) return;
      // updateValue(newValue[0], newValue[1]);
      const value = event.target.value;
      const repr = value;
      updateValue(value, repr);
    },
    [updateValue],
  );

  // --- Stepper logic
  const handleIncStep = useCallback(() => {
    if (readOnly) return;
    const newValue = applyStep(valueStrRep, _step, min, max, integersOnly);

    if (newValue === undefined) return;
    updateValue(newValue, newValue.toString());
  }, [valueStrRep, _step, min, max, integersOnly, updateValue, readOnly]);

  const handleDecStep = useCallback(() => {
    if (readOnly) return;
    const newValue = applyStep(valueStrRep, -_step, min, max, integersOnly);

    if (newValue === undefined) return;
    updateValue(newValue, newValue.toString());
  }, [valueStrRep, _step, min, max, integersOnly, updateValue, readOnly]);

  // --- Register stepper logic to buttons
  useLongPress(upButton.current, handleIncStep);
  useLongPress(downButton.current, handleDecStep);

  // --- This logic prevenst the user from typing invalid characters (in the current typing context)
  const handleOnBeforeInput = (event: any) => {
    // --- Prevent the default behavior for some characters
    let shouldPreventDefault = false;
    const currentValue: string = event.target.value ?? "";
    const currentPos = event.target.selectionStart;

    // --- Are the caret after the exponential separator?
    const beforeCaret = currentValue.substring(0, event.target.selectionStart);

    // --- If "expPos" is -1, the caret is not after the exponential separator
    const expPos = beforeCaret.indexOf(EXPONENTIAL_SEPARATOR);

    switch (event.data) {
      case "-":
        shouldPreventDefault = true;
        if (expPos === -1) {
          // --- Change the first char to "-" if we are before the exponential separator and it's not already there
          if (!currentValue.startsWith("-")) {
            setNewValue("-" + currentValue, currentPos + 1);
          }
        } else {
          // --- Change the char after the exponential separator to "-" if it's not already there
          if (currentValue[expPos + 1] !== "-") {
            setNewValue(
              currentValue.substring(0, expPos + 1) + "-" + currentValue.substring(expPos + 1),
              currentPos + 1,
            );
          }
        }
        break;
      case "+":
        shouldPreventDefault = true;
        if (expPos === -1) {
          // --- Remove the first char if it's "-" and we are before the exponential separator
          if (currentValue.startsWith("-")) {
            setNewValue(currentValue.substring(1), currentPos - 1);
          }
        } else {
          // --- Remove the char after the exponential separator if it's "-"
          if (currentValue[expPos + 1] === "-") {
            setNewValue(
              currentValue.substring(0, expPos + 1) + currentValue.substring(expPos + 2),
              currentPos - 1,
            );
          }
        }
        break;
      case DECIMAL_SEPARATOR:
        // --- Prevent multiple decimal separators (integers only),
        // --- or decimal separator after the exponential separator
        if (integersOnly || currentValue.includes(DECIMAL_SEPARATOR) || expPos !== -1) {
          shouldPreventDefault = true;
        }
        break;
      case EXPONENTIAL_SEPARATOR:
        // --- Prevent exponential notation for integers
        if (integersOnly) {
          shouldPreventDefault = true;
          break;
        }

        // --- Prevent multiple exponential separators (and too many digits after it)
        if (
          currentValue.includes(EXPONENTIAL_SEPARATOR) ||
          tooManyDigitsAfterExponentialSeparator(currentPos, 2)
        ) {
          shouldPreventDefault = true;
        }
        break;

      default:
        let newInput = event.data;
        const selectionStart = event.target.selectionStart;

        // --- Test for multi-character input (perhaps paste)
        if (event.data?.length > 0) {
          // --- Decide whether to accept the optional sign character
          if (newInput.startsWith("-")) {
            if (selectionStart > 0) {
              shouldPreventDefault = true;
              break;
            }
          } else if (newInput.startsWith("+")) {
            shouldPreventDefault = true;
            break;
          }

          // --- Replace the selection with the new input
          const newValue =
            currentValue.substring(0, selectionStart) +
            newInput +
            currentValue.substring(event.target.selectionEnd);

          // --- Check for integers
          if (integersOnly && !INT_REGEXP.test(newValue)) {
            // --- The result is not an integer, drop the pasted input
            shouldPreventDefault = true;
          } else if (!FLOAT_REGEXP.test(newValue)) {
            // --- The result is not a loat, drop the pasted input
            shouldPreventDefault = true;
          }
          break;
        }

        // --- Single character input
        // --- Prevent non-digit characters
        if (event.data < "0" || event.data > "9") {
          shouldPreventDefault = true;
          break;
        }

        // --- Prevent digits before minus sign
        if (currentValue.startsWith("-") && selectionStart === 0) {
          shouldPreventDefault = true;
          break;
        }

        // --- Prevent too many digits after the exponential separator
        if (expPos !== -1 && tooManyDigitsAfterExponentialSeparator(expPos + 1, 1)) {
          // --- Caret after the exponential separator
          // --- Prevent typing a digi if more than 2 digits after the exponential separator
          shouldPreventDefault = true;
        }
        break;
    }

    // --- Done.
    if (shouldPreventDefault) {
      event.preventDefault();
    }
    return;

    // --- Helpers
    function tooManyDigitsAfterExponentialSeparator(pos: number, maxDigits: number): boolean {
      let numDigitsAfter = 0;
      while (pos < currentValue.length) {
        if (/\d/.test(currentValue[pos++])) {
          numDigitsAfter++;
        } else {
          numDigitsAfter = maxDigits + 1;
          break;
        }
      }
      return numDigitsAfter > maxDigits;
    }

    function setNewValue(newValue: string, pos: number) {
      event.target.value = newValue;
      updateValue(newValue, newValue);
      inputRef.current?.setSelectionRange(pos, pos);
    }
  };

  // --- Setting steppers with keyboard
  const handleOnKey = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.code === "ArrowUp") {
        event.preventDefault();
        handleIncStep();
      }
      if (event.code === "ArrowDown") {
        event.preventDefault();
        handleDecStep();
      }
    },
    [handleIncStep, handleDecStep],
  );

  // --- Manage obtaining and losing focus & blur
  const handleOnFocus = useCallback(() => {
    onFocus?.();
  }, [onFocus]);

  const handleOnBlur = useCallback(() => {
    setValueStrRep(mapToRepresentation(value));
    onBlur?.();
  }, [value, onBlur]);

  const focus = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  const setValue = useEvent((newValue) => {
    updateValue(newValue, isEmptyLike(newValue) ? "" : String(newValue));
  });

  useEffect(() => {
    registerComponentApi?.({
      focus,
      setValue,
    });
  }, [focus, registerComponentApi, setValue]);

  return (
    <ItemWithLabel
      {...rest}
      id={id}
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
      // NOTE: This is a band-aid solution to handle the multiple IDs issue - remove after resolving focus bug
      isInputTemplateUsed={true}
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
        style={{gap}}
      >
        <Adornment text={startText} iconName={startIcon} className={styles.adornment} />
        <input
          id={id}
          type="text"
          inputMode="numeric"
          className={classnames(styles.input, { [styles.readOnly]: readOnly })}
          disabled={!enabled}
          value={valueStrRep}
          step={step}
          placeholder={placeholder}
          onChange={onInputChange}
          onFocus={handleOnFocus}
          onBlur={handleOnBlur}
          onBeforeInput={handleOnBeforeInput}
          onKeyDown={handleOnKey}
          readOnly={readOnly}
          ref={inputRef}
          autoFocus={autoFocus}
          maxLength={maxLength}
          required={required}
        />
        <Adornment text={endText} iconName={endIcon} className={styles.adornment} />
        {hasSpinBox && (
          <div className={styles.spinnerBox}>
            <Button
              data-spinner="up"
              type="button"
              role="spinbutton"
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
              role="spinbutton"
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

function applyStep(
  valueStrRep: string,
  step: number,
  min: number,
  max: number,
  integersOnly: boolean,
) {
  const currentValue = toUsableNumber(valueStrRep, integersOnly);
  if (isEmptyLike(currentValue)) {
    return;
  }
  return clamp(currentValue + step, min, max);
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
