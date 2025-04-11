import React, {
  type CSSProperties,
  type ForwardedRef,
  forwardRef,
  useCallback,
  useEffect,
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
  EXPONENTIAL_SEPARATOR,
  FLOAT_REGEXP,
  INT_REGEXP,
  isEmptyLike,
  isOutOfBounds,
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

type Props = {
  id?: string;
  style?: CSSProperties;
  value?: number | string | null;
  initialValue?: number | string | null;
  placeholder?: string;
  min?: number;
  max?: number;
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
};

export const NumberBox2 = forwardRef(function NumberBox2(
  {
    id,
    style,
    value,
    initialValue,
    min = -NUMBERBOX_MAX_VALUE,
    max = NUMBERBOX_MAX_VALUE,
    enabled = true,
    placeholder,
    step,
    validationStatus = "none",
    hasSpinBox = true,
    updateState = noop,
    onDidChange = noop,
    onFocus = noop,
    onBlur = noop,
    registerComponentApi,
    startText,
    startIcon,
    endText,
    endIcon,
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
  const formatter = useNumberFormatter(locale);
  const parser = useNumberParser(locale);

  const _step = toUsableNumber(step, true) ?? DEFAULT_STEP;
  const inputMode = useMemo(() => {
    // The inputMode attribute influences the software keyboard that is shown on touch devices.
    // Browsers and operating systems are quite inconsistent about what keys are available.
    // We choose between numeric and decimal based on whether we allow negative and fractional numbers,
    // and based on testing on various devices to determine what keys are available in each inputMode.
    const hasDecimals = formatter.resolvedOptions().maximumFractionDigits! > 0;
    return hasDecimals ? "decimal" : "numeric";
  }, []);

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

  const restrictInputValue = useCallback(
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
      updateState({ value: parsedValue });
    },
    [clampInputValue, updateState, parser],
  );

  const _onBlur = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      restrictInputValue(value);
      onDidChange(value);
    },
    [value, onDidChange],
  );

  // --- Stepper logic
  const increment = useCallback(() => {
    if (!enabled) return;
    if (readOnly) return;
    const currentValue = isEmptyLike(value) || isNaN(value) ? "0" : value.toString();
    const newValue = handleChangingValue(currentValue, parser, "increase", _step, min, max);
    updateState({ value: newValue });
  }, [value, enabled, readOnly, parser, _step, min, max]);

  const decrement = useCallback(() => {
    if (!enabled) return;
    if (readOnly) return;
    const currentValue = isEmptyLike(value) || isNaN(value) ? "0" : value.toString();
    const newValue = handleChangingValue(currentValue, parser, "decrease", _step, min, max);
    updateState({ value: newValue });
  }, [value, enabled, readOnly, parser, _step, min, max]);

  // --- Register stepper logic to buttons
  useLongPress(upButton.current, increment);
  useLongPress(downButton.current, decrement);

  // --- Register API events
  const focus = useCallback(() => {
    inputRef.current?.focus();
  }, []);

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
        <input
          id={id}
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          inputMode={inputMode as any}
          className={classnames(styles.input)}
          value={isEmptyLike(value) || isNaN(value) ? "" : value}
          onBeforeInput={(event: React.ChangeEvent<HTMLInputElement>) => {
            const target = event.target;
            let nextValue =
              target.value.slice(0, target.selectionStart ?? undefined) +
              ((event.nativeEvent as InputEvent).data ?? "") +
              target.value.slice(target.selectionEnd ?? undefined);

            // validate
            if (!parser.isValidPartialNumber(nextValue)) {
              event.preventDefault();
            }
          }}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            updateState({ value: event.target.value });
          }}
          onBlur={_onBlur}
          onKeyDown={(event: React.KeyboardEvent<HTMLInputElement>) => {
            if (event.key === "Enter") {
              restrictInputValue(value);
            }
            if (event.code === "ArrowUp") {
              event.preventDefault();
              increment();
            }
            if (event.code === "ArrowDown") {
              event.preventDefault();
              decrement();
            }
          }}
        />
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
              <Icon name="chevronup" size="sm" />
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
              <Icon name="chevrondown" size="sm" />
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
  }, []);
}

function useNumberParser(locale: string, options?: Intl.NumberFormatOptions) {
  return useMemo(() => {
    return new NumberParser(locale, options);
  }, []);
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
