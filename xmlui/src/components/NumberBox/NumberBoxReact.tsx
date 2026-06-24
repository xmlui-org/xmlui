import type { CSSProperties, ChangeEvent, FocusEvent, KeyboardEvent } from "react";
import { forwardRef, memo, useCallback, useEffect, useId, useImperativeHandle, useMemo, useRef, useState } from "react";

import { defaultProps } from "./NumberBox.defaults";
import {
  applyStep,
  clamp,
  mapToRepresentation,
  normalizeNumberInput,
  toUsableNumber,
} from "./numberbox-abstractions";
import styles from "./NumberBox.module.scss";

export type NumberBoxProps = {
  id?: string;
  value?: unknown;
  initialValue?: unknown;
  className?: string;
  style?: CSSProperties;
  label?: unknown;
  labelPosition?: "start" | "end" | "top" | "bottom" | string;
  labelWidth?: string | number;
  direction?: string;
  placeholder?: string;
  maxLength?: number;
  enabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  autoFocus?: boolean;
  tabIndex?: number;
  startText?: unknown;
  startIcon?: unknown;
  endText?: unknown;
  endIcon?: unknown;
  gap?: string;
  hasSpinBox?: boolean;
  spinnerUpIcon?: string;
  spinnerDownIcon?: string;
  step?: unknown;
  integersOnly?: boolean;
  zeroOrPositive?: boolean;
  min?: number;
  max?: number;
  verboseValidationFeedback?: boolean;
  validationStatus?: string;
  invalidMessages?: string[];
  onDidChange?: (value: number | string | null) => void | Promise<void>;
  onFocus?: () => void | Promise<void>;
  onBlur?: () => void | Promise<void>;
};

export type NumberBoxApi = {
  focus: () => void;
  setValue: (value: unknown) => void;
  value: number | string | null;
};

export const NumberBoxNative = memo(forwardRef<NumberBoxApi, NumberBoxProps>(function NumberBoxNative(
  {
    id,
    value,
    initialValue = defaultProps.initialValue,
    className,
    style,
    label,
    labelPosition = "top",
    labelWidth,
    direction,
    placeholder,
    maxLength,
    enabled = defaultProps.enabled,
    readOnly,
    required,
    autoFocus,
    tabIndex,
    startText,
    startIcon,
    endText,
    endIcon,
    gap,
    hasSpinBox = defaultProps.hasSpinBox,
    spinnerUpIcon = "chevronup",
    spinnerDownIcon = "chevrondown",
    step = defaultProps.step,
    integersOnly = defaultProps.integersOnly,
    zeroOrPositive = defaultProps.zeroOrPositive,
    min = zeroOrPositive ? 0 : defaultProps.min,
    max = defaultProps.max,
    verboseValidationFeedback = true,
    validationStatus = defaultProps.validationStatus,
    invalidMessages = defaultProps.invalidMessages,
    onDidChange,
    onFocus,
    onBlur,
    ...rest
  },
  ref,
) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const generatedInputId = useId();
  const controlled = value !== undefined;
  const boundedMin = Math.max(zeroOrPositive ? 0 : defaultProps.min, Number(min));
  const boundedMax = Math.min(defaultProps.max, Number(max));
  const parsedStep = parseStep(step);
  const [localValue, setLocalValue] = useState(() =>
    normalizeInitialValue(controlled ? value : initialValue, integersOnly, boundedMin, boundedMax),
  );

  useEffect(() => {
    if (controlled) {
      setLocalValue(normalizeInitialValue(value, integersOnly, boundedMin, boundedMax));
    }
  }, [boundedMax, boundedMin, controlled, integersOnly, value]);

  useEffect(() => {
    if (!controlled) {
      setLocalValue(normalizeInitialValue(initialValue, integersOnly, boundedMin, boundedMax));
    }
  }, [boundedMax, boundedMin, controlled, initialValue, integersOnly]);

  useEffect(() => {
    if (!autoFocus || !enabled) {
      return;
    }
    const timeoutId = setTimeout(() => inputRef.current?.focus(), 0);
    return () => clearTimeout(timeoutId);
  }, [autoFocus, enabled]);

  const emitValue = useCallback((representation: string) => {
    const usable = toUsableNumber(representation, integersOnly);
    return representation === "" || representation === "-" ? null : usable ?? representation;
  }, [integersOnly]);

  const updateRepresentation = useCallback((representation: string, inputType?: string) => {
    const next = normalizeRepresentation(
      representation,
      integersOnly,
      zeroOrPositive,
      boundedMin,
      boundedMax,
      inputType,
      localValue,
    );
    setLocalValue(next);
    void onDidChange?.(emitValue(next));
  }, [boundedMax, boundedMin, emitValue, integersOnly, localValue, onDidChange, zeroOrPositive]);

  const stepBy = useCallback((direction: 1 | -1) => {
    if (!enabled || readOnly) {
      return;
    }
    const next = applyStep(localValue, parsedStep * direction, boundedMin, boundedMax, integersOnly);
    if (next === undefined) {
      return;
    }
    updateRepresentation(String(next));
  }, [boundedMax, boundedMin, enabled, integersOnly, localValue, parsedStep, readOnly, updateRepresentation]);

  useImperativeHandle(ref, () => ({
    focus: () => {
      if (enabled) {
        inputRef.current?.focus();
      }
    },
    setValue: (nextValue) => updateRepresentation(mapToRepresentation(nextValue)),
    get value() {
      return emitValue(localValue);
    },
  }), [emitValue, enabled, localValue, updateRepresentation]);

  const rootStyle = useMemo<CSSProperties>(() => ({
    ...style,
    ...(gap ? { "--xmlui-runtime-gap-NumberBox": gap } as CSSProperties : undefined),
  }), [gap, style]);
  const inputId = id ? `${id}__input` : generatedInputId;
  const hasLabel = label !== undefined && label !== null && label !== "";
  const labelText = stringifyValue(label);
  const labelNode = hasLabel ? (
    <label
      data-part-id="label"
      data-xmlui-part="label"
      htmlFor={inputId}
      className={styles.numberBoxLabel}
    >
      <span style={labelWidth !== undefined ? { width: cssLength(labelWidth) } : undefined}>
        {labelText}
        {required ? <span className={styles.numberBoxLabelRequired}>*</span> : null}
      </span>
    </label>
  ) : null;
  const inputRoot = (
    <div
      {...(!hasLabel ? rest : undefined)}
      data-part-id="input"
      data-xmlui-part="input"
      className={cx(
        styles.numberBoxRoot,
        !enabled ? styles.numberBoxDisabled : undefined,
        readOnly ? styles.numberBoxReadOnly : undefined,
        validationStatus === "error" ? styles.numberBoxError : undefined,
        validationStatus === "warning" ? styles.numberBoxWarning : undefined,
        validationStatus === "valid" ? styles.numberBoxSuccess : undefined,
        !hasLabel ? className : undefined,
      )}
      style={!hasLabel ? rootStyle : undefined}
    >
      <Adornment partId="startAdornment" text={startText} icon={startIcon} />
      <input
        id={inputId}
        ref={inputRef}
        data-part-id="input"
        data-xmlui-part="input"
        className={styles.numberBoxInput}
        type="text"
        role="spinbutton"
        inputMode={integersOnly ? "numeric" : "decimal"}
        value={localValue}
        placeholder={placeholder}
        maxLength={maxLength}
        disabled={!enabled}
        readOnly={readOnly}
        required={required}
        tabIndex={enabled ? tabIndex : -1}
        aria-valuemin={Number.isFinite(boundedMin) ? boundedMin : undefined}
        aria-valuemax={Number.isFinite(boundedMax) ? boundedMax : undefined}
        aria-valuenow={toUsableNumber(localValue, integersOnly) ?? undefined}
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          const nativeEvent = event.nativeEvent as InputEvent | undefined;
          updateRepresentation(event.currentTarget.value, nativeEvent?.inputType);
        }}
        onFocus={(_event: FocusEvent<HTMLInputElement>) => void onFocus?.()}
        onBlur={(_event: FocusEvent<HTMLInputElement>) => {
          const next = normalizeBlurRepresentation(localValue, integersOnly, zeroOrPositive, boundedMin, boundedMax);
          if (next !== localValue) {
            setLocalValue(next);
            void onDidChange?.(emitValue(next));
          }
          void onBlur?.();
        }}
        onKeyDown={(event: KeyboardEvent<HTMLInputElement>) => {
          if (event.key === "ArrowUp") {
            event.preventDefault();
            stepBy(1);
          } else if (event.key === "ArrowDown") {
            event.preventDefault();
            stepBy(-1);
          } else if (event.key === "-" && !zeroOrPositive) {
            event.preventDefault();
            updateRepresentation(applyMinusKey(event.currentTarget));
          } else if (event.key === "." && !integersOnly) {
            const next = applyDecimalKey(event.currentTarget);
            if (next !== undefined) {
              event.preventDefault();
              updateRepresentation(next);
            }
          }
        }}
      />
      <Adornment partId="endAdornment" text={endText} icon={endIcon} />
      {hasSpinBox ? (
        <span className={styles.numberBoxSpinner}>
          <button
            type="button"
            data-part-id="spinnerUp"
            data-xmlui-part="spinnerUp"
            className={styles.numberBoxSpinnerButton}
            disabled={!enabled}
            tabIndex={-1}
            aria-label="Increment"
            onClick={() => stepBy(1)}
          >
            <span role="img" aria-label={spinnerUpIcon} data-icon-name={spinnerUpIcon} className={styles.numberBoxIconMarker} />
          </button>
          <button
            type="button"
            data-part-id="spinnerDown"
            data-xmlui-part="spinnerDown"
            className={styles.numberBoxSpinnerButton}
            disabled={!enabled}
            tabIndex={-1}
            aria-label="Decrement"
            onClick={() => stepBy(-1)}
          >
            <span role="img" aria-label={spinnerDownIcon} data-icon-name={spinnerDownIcon} className={styles.numberBoxIconMarker} />
          </button>
        </span>
      ) : null}
      {!verboseValidationFeedback && validationStatus && validationStatus !== "none" ? (
        <span
          data-part-id="conciseValidationFeedback"
          data-xmlui-part="conciseValidationFeedback"
          className={styles.numberBoxConciseFeedback}
          title={invalidMessages?.join("\n")}
        >
          <span data-icon-name={validationStatus === "valid" ? "checkmark" : "error"} />
        </span>
      ) : null}
    </div>
  );

  if (!hasLabel) {
    return inputRoot;
  }

  return (
    <div {...rest} className={className} style={rootStyle}>
      <div
        className={cx(styles.numberBoxLabeledItem, labelPositionClass(labelPosition, direction))}
        data-part-id="labeledItem"
        data-xmlui-part="labeledItem"
        dir={direction === "rtl" ? "rtl" : direction === "ltr" ? "ltr" : undefined}
      >
        {labelNode}
        {inputRoot}
      </div>
    </div>
  );
}));

function Adornment({
  partId,
  text,
  icon,
}: {
  partId: "startAdornment" | "endAdornment";
  text?: unknown;
  icon?: unknown;
}) {
  const iconName = typeof icon === "string" && icon !== "" ? icon : undefined;
  const content = text !== undefined && text !== null && text !== "" ? String(text) : undefined;
  if (!iconName && content === undefined) {
    return <span data-part-id={partId} data-xmlui-part={partId} className={styles.numberBoxAdornment} hidden />;
  }
  return (
    <span data-part-id={partId} data-xmlui-part={partId} className={styles.numberBoxAdornment}>
      {iconName ? <span role="img" aria-label={iconName} data-icon-name={iconName} className={styles.numberBoxIconMarker} /> : null}
      {content}
    </span>
  );
}

function normalizeInitialValue(value: unknown, integerOnly: boolean, min: number, max: number): string {
  const usable = toUsableNumber(value, integerOnly);
  if (usable === null) {
    return "";
  }
  return String(clamp(usable, min, max));
}

function normalizeRepresentation(
  value: string,
  integerOnly: boolean,
  zeroOrPositive: boolean,
  min: number,
  max: number,
  inputType?: string,
  previousValue = "",
): string {
  const normalized = normalizeNumberInput(value, integerOnly, zeroOrPositive);
  if (normalized === "" || normalized === "-") {
    return normalized;
  }
  if (/[eE]/.test(normalized) && !isCompleteScientificNotation(normalized)) {
    const malformedScientificReplacement = previousValue === "" && /^-?\d/.test(normalized) && /[eE].*\./.test(normalized);
    return inputType === "insertReplacementText" || malformedScientificReplacement ? "" : normalized;
  }
  if (!integerOnly && /^-?\d+\.$/.test(normalized)) {
    return normalized;
  }
  const usable = toUsableNumber(normalized, integerOnly);
  if (usable === null) {
    return normalized;
  }
  return String(clamp(usable, min, max));
}

function normalizeBlurRepresentation(
  value: string,
  integerOnly: boolean,
  zeroOrPositive: boolean,
  min: number,
  max: number,
): string {
  if (value === "" || value === "-") {
    return value;
  }
  if (/^[eE]$/.test(value)) {
    return "";
  }
  if (value === ".") {
    return "0.0";
  }
  if (/^-?\d+\.$/.test(value)) {
    return `${value}0`;
  }
  if (/[eE]/.test(value) && !isCompleteScientificNotation(value)) {
    return normalizeRepresentation(value.replace(/[eE]/, ""), integerOnly, zeroOrPositive, min, max);
  }
  return normalizeRepresentation(value, integerOnly, zeroOrPositive, min, max);
}

function isCompleteScientificNotation(value: string): boolean {
  return /^-?\d+(\.\d+)?[eE][+-]?\d+$/.test(value);
}

function applyMinusKey(input: HTMLInputElement): string {
  const value = input.value;
  const selectionStart = input.selectionStart ?? value.length;
  const exponentIndex = value.toLowerCase().indexOf("e");
  if (exponentIndex >= 0 && selectionStart > exponentIndex) {
    const signIndex = exponentIndex + 1;
    return value[signIndex] === "-"
      ? `${value.slice(0, signIndex)}${value.slice(signIndex + 1)}`
      : `${value.slice(0, signIndex)}-${value.slice(signIndex)}`;
  }
  return value.startsWith("-") ? value.slice(1) : `-${value}`;
}

function applyDecimalKey(input: HTMLInputElement): string | undefined {
  const value = input.value;
  const selectionStart = input.selectionStart ?? value.length;
  const selectionEnd = input.selectionEnd ?? selectionStart;
  if (value.includes(".")) {
    return value;
  }
  const next = `${value.slice(0, selectionStart)}.${value.slice(selectionEnd)}`;
  return next.startsWith(".") ? `0${next}` : next;
}

function parseStep(value: unknown): number {
  const parsed = toUsableNumber(value, true);
  return parsed === null || parsed === 0 ? defaultProps.step : parsed;
}

function stringifyValue(value: unknown): string {
  return value === undefined || value === null ? "" : String(value);
}

function cssLength(value: string | number): string {
  return typeof value === "number" ? `${value}px` : value;
}

function labelPositionClass(value: string, direction?: string): string {
  const normalized = value === "before"
    ? direction === "rtl" ? "end" : "start"
    : value === "after"
      ? direction === "rtl" ? "start" : "end"
      : value;
  if (normalized === "start") {
    return styles.numberBoxLabelPositionStart;
  }
  if (normalized === "end") {
    return styles.numberBoxLabelPositionEnd;
  }
  if (normalized === "bottom") {
    return styles.numberBoxLabelPositionBottom;
  }
  return styles.numberBoxLabelPositionTop;
}

function cx(...classes: Array<string | undefined | false>): string {
  return classes.filter(Boolean).join(" ");
}
