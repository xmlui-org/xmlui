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
import { PART_END_ADORNMENT, PART_INPUT, PART_START_ADORNMENT } from "../../components-core/parts";
import { current } from "immer";

const PART_SPINNER_UP = "spinnerUp";
const PART_SPINNER_DOWN = "spinnerDown";

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
  // probably some way to integrate with https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat
  // since there are footguns, like 0.1 + 0.2 = 0.0000...04
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

  // --- Shared character validation logic
  const processCharacterInput = useCallback(
    (
      char: string,
      currentValue: string,
      currentPos: number,
      predictedValue: string,
      isForPaste: boolean = false,
    ): {
      shouldAccept: boolean;
      newValue?: string;
      newPos?: number;
      shouldPreventDefault?: boolean;
    } => {
      // --- Are the caret after the exponential separator?
      const beforeCaret = currentValue.substring(0, currentPos);
      const expPos = beforeCaret.indexOf(EXPONENTIAL_SEPARATOR);

      let shouldAccept = true;
      let shouldPreventDefault = false;
      let newValue = currentValue;
      let newPos = currentPos;

      switch (char) {
        case "-":
          shouldAccept = false;
          shouldPreventDefault = true;
          if (zeroOrPositive) {
            // --- No minus sign allowed
            break;
          }
          if (expPos === -1) {
            // --- Change the first char to "-" if we are before the exponential separator and it's not already there
            if (!currentValue.startsWith("-")) {
              newValue = "-" + currentValue;
              newPos = currentPos + 1;
            }
          } else {
            // --- Change the char after the exponential separator to "-" if it's not already there
            if (currentValue[expPos + 1] !== "-") {
              newValue =
                currentValue.substring(0, expPos + 1) + "-" + currentValue.substring(expPos + 1);
              newPos = currentPos + 1;
            }
          }
          break;
        case "+":
          shouldAccept = false;
          shouldPreventDefault = true;
          if (expPos === -1) {
            // --- Remove the first char if it's "-" and we are before the exponential separator
            if (currentValue.startsWith("-")) {
              newValue = currentValue.substring(1);
              newPos = Math.max(0, currentPos - 1);
            }
          } else {
            // --- Remove the char after the exponential separator if it's "-"
            if (currentValue[expPos + 1] === "-") {
              newValue = currentValue.substring(0, expPos + 1) + currentValue.substring(expPos + 2);
              newPos = Math.max(expPos + 1, currentPos - 1);
            }
          }
          break;
        case "0":
          // --- Prevent leading zeros (before decimal or exponential separator)
          if (currentValue === "0") {
            shouldAccept = false;
            shouldPreventDefault = true;
          }
          break;
        case "1":
        case "2":
        case "3":
        case "4":
        case "5":
        case "6":
        case "7":
        case "8":
        case "9":
          // --- Replace leading zero with this digit
          if (currentValue === "0" && currentPos === 1) {
            if (isForPaste) {
              newValue = char;
              shouldAccept = false; // Don't add it again for paste
            } else {
              newValue = char;
              newPos = 1;
              shouldPreventDefault = true;
            }
          }
          break;
        case DECIMAL_SEPARATOR:
          // --- Prevent multiple decimal separators (integers only),
          // --- or decimal separator after the exponential separator
          if (integersOnly || currentValue.includes(DECIMAL_SEPARATOR) || expPos !== -1) {
            shouldAccept = false;
            shouldPreventDefault = true;
          } else if (predictedValue.startsWith(DECIMAL_SEPARATOR) && currentPos === 0) {
            newValue = "0" + predictedValue;
            newPos = currentPos + 2;
            shouldPreventDefault = true;
          }
          break;
        case EXPONENTIAL_SEPARATOR:
          // --- Prevent exponential notation for integers
          if (integersOnly) {
            shouldAccept = false;
            shouldPreventDefault = true;
            break;
          }
          // --- Prevent multiple exponential separators
          if (currentValue.includes(EXPONENTIAL_SEPARATOR)) {
            shouldAccept = false;
            shouldPreventDefault = true;
          }
          break;
        default:
          // --- Only allow digits for single characters
          if (char >= "0" && char <= "9") {
            // --- Prevent digits before minus sign
            if (currentValue.startsWith("-") && currentPos === 0) {
              shouldAccept = false;
              shouldPreventDefault = true;
              break;
            }

            // --- For beforeInput, check for too many digits after exponential separator
            if (!isForPaste && expPos !== -1) {
              const tooManyDigitsAfterExponentialSeparator = (
                pos: number,
                maxDigits: number,
              ): boolean => {
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
              };

              if (tooManyDigitsAfterExponentialSeparator(expPos + 1, 1)) {
                shouldAccept = false;
                shouldPreventDefault = true;
              }
            }
          } else {
            // --- Reject non-digit characters
            shouldAccept = false;
            shouldPreventDefault = true;
          }
          break;
      }

      return { shouldAccept, newValue, newPos, shouldPreventDefault };
    },
    [integersOnly, zeroOrPositive],
  );

  // --- This logic prevents the user from typing invalid characters (in the current typing context)
  const handleOnBeforeInput = (event: any) => {
    const currentValue: string = event.target.value ?? "";
    const currentPos = event.target.selectionStart;
    const expectedNewValue =
      currentValue.substring(0, currentPos) +
      event.data +
      currentValue.substring(event.target.selectionEnd);

    // --- Handle multi-character input (paste) through the legacy path
    if (event.data?.length > 1) {
      let shouldPreventDefault = false;
      const selectionStart = event.target.selectionStart;
      let newInput = event.data;

      // --- Decide whether to accept the optional sign character
      if (newInput.startsWith("-")) {
        if (selectionStart > 0) {
          shouldPreventDefault = true;
        }
      } else if (newInput.startsWith("+")) {
        shouldPreventDefault = true;
      }

      if (!shouldPreventDefault) {
        // --- Check for integers
        if (integersOnly && !INT_REGEXP.test(expectedNewValue)) {
          // --- The result is not an integer, drop the pasted input
          shouldPreventDefault = true;
        } else if (!FLOAT_REGEXP.test(expectedNewValue)) {
          // --- The result is not a float, drop the pasted input
          shouldPreventDefault = true;
        }
      }

      if (shouldPreventDefault) {
        event.preventDefault();
      }
      return;
    }

    // --- Single character processing
    const result = processCharacterInput(
      event.data,
      currentValue,
      currentPos,
      expectedNewValue,
      false,
    );

    if (result.shouldPreventDefault) {
      event.preventDefault();
    }

    // --- Apply value changes if needed
    if (result.newValue !== currentValue) {
      const setNewValue = (newValue: string, pos: number) => {
        event.target.value = newValue;
        updateValue(newValue, newValue);
        inputRef.current?.setSelectionRange(pos, pos);
      };
      setNewValue(result.newValue!, result.newPos!);
    }
  };

  // --- Handle paste events by applying the same character validation logic
  const handleOnPaste = useCallback(
    (event: React.ClipboardEvent<HTMLInputElement>) => {
      event.preventDefault();

      const pastedText = event.clipboardData.getData("text/plain");
      if (!pastedText) return;

      const inputElement = event.currentTarget;
      const currentValue = inputElement.value ?? "";
      const selectionStart = inputElement.selectionStart ?? 0;
      const selectionEnd = inputElement.selectionEnd ?? 0;
      const expectedNewValue =
        currentValue.substring(0, selectionStart) +
        pastedText +
        currentValue.substring(selectionEnd);

      // --- Start with the value before the selection
      let resultValue = currentValue.substring(0, selectionStart);
      let currentPos = selectionStart;

      // --- Process each character from the pasted text
      for (let i = 0; i < pastedText.length; i++) {
        const char = pastedText[i];

        const result = processCharacterInput(char, resultValue, currentPos, expectedNewValue, true);

        if (result.shouldAccept) {
          resultValue =
            resultValue.substring(0, currentPos) + char + resultValue.substring(currentPos);
          currentPos++;
        } else if (result.newValue !== resultValue) {
          // --- Handle special cases like sign changes or zero replacement
          resultValue = result.newValue!;
          currentPos = result.newPos!;
        }
      }

      // --- Add the rest of the original value after the selection
      resultValue += currentValue.substring(selectionEnd);

      // --- Final validation - ensure the result is a valid number format
      let isValidFinal = false;
      if (integersOnly) {
        isValidFinal = INT_REGEXP.test(resultValue) || resultValue === "" || resultValue === "-";
      } else {
        isValidFinal = FLOAT_REGEXP.test(resultValue) || resultValue === "" || resultValue === "-";
      }

      // --- Apply the result if valid
      if (isValidFinal) {
        inputElement.value = resultValue;
        updateValue(resultValue, resultValue);
        inputElement.setSelectionRange(currentPos, currentPos);
      }
    },
    [processCharacterInput, updateValue, integersOnly],
  );

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
    // --- Get the current input value
    const currentInputValue = inputRef.current?.value ?? "";

    // --- Check if we need to add a trailing zero
    let finalValue = currentInputValue;
    if (!integersOnly && currentInputValue.endsWith(DECIMAL_SEPARATOR)) {
      // --- Add trailing zero if the value ends with decimal separator
      finalValue = currentInputValue + "0";
    }

    // --- Convert to number and clamp to min/max bounds
    const numericValue = toUsableNumber(finalValue, integersOnly);
    if (numericValue !== null && numericValue !== undefined) {
      const clampedValue = clamp(numericValue, min, max);
      if (clampedValue !== numericValue) {
        const clampedString = clampedValue.toString();
        finalValue = clampedString;

        // --- Update the input field immediately
        if (inputRef.current) {
          inputRef.current.value = clampedString;
        }
      }
    }

    // --- Update the state if the final value is different from current input
    if (finalValue !== currentInputValue) {
      updateValue(finalValue, finalValue);
    } else {
      // --- Use the standard representation mapping
      setValueStrRep(mapToRepresentation(value));
    }

    onBlur?.();
  }, [value, onBlur, integersOnly, updateValue, min, max]);

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
        style={{ gap }}
      >
        <Adornment
          data-part-id={PART_START_ADORNMENT}
          text={startText}
          iconName={startIcon}
          className={classnames(styles.adornment)}
        />
        <input
          id={id}
          data-part-id={PART_INPUT}
          type="text"
          inputMode="numeric"
          className={classnames(styles.input, {
            [styles.readOnly]: readOnly,
          })}
          disabled={!enabled}
          value={valueStrRep}
          step={step}
          placeholder={placeholder}
          onChange={onInputChange}
          onFocus={handleOnFocus}
          onBlur={handleOnBlur}
          onBeforeInput={handleOnBeforeInput}
          onPaste={handleOnPaste}
          onKeyDown={handleOnKey}
          readOnly={readOnly}
          ref={inputRef}
          autoFocus={autoFocus}
          maxLength={maxLength}
          required={required}
        />
        <Adornment
          data-part-id={PART_END_ADORNMENT}
          text={endText}
          iconName={endIcon}
          className={classnames(styles.adornment)}
        />
        {hasSpinBox && (
          <div className={styles.spinnerBox}>
            <Button
              data-part-id={PART_SPINNER_UP}
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
              data-part-id={PART_SPINNER_DOWN}
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
              <Icon
                name={spinnerDownIcon || "spinnerDown:NumberBox"}
                fallback="chevrondown"
                size="sm"
              />
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
