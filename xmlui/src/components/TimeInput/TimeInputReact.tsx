import type { CSSProperties, ChangeEvent, FocusEvent, KeyboardEvent } from "react";
import { forwardRef, memo, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";

import { defaultProps } from "./TimeInput.defaults";
import styles from "./TimeInput.module.scss";
import { useFormContext } from "../Form/FormContext";

export type TimeInputApi = {
  focus: () => void;
  setValue: (value: unknown) => void;
  isoValue: () => string | null;
  value: string | undefined;
};

export type TimeInputProps = {
  id?: string;
  bindTo?: string;
  value?: unknown;
  initialValue?: unknown;
  enabled?: boolean;
  validationStatus?: string;
  hour24?: boolean;
  seconds?: boolean;
  minTime?: string | null;
  maxTime?: string | null;
  clearable?: boolean;
  clearIcon?: string | null;
  clearToInitialValue?: boolean;
  required?: boolean;
  startText?: unknown;
  startIcon?: unknown;
  endText?: unknown;
  endIcon?: unknown;
  gap?: string;
  readOnly?: boolean;
  autoFocus?: boolean;
  emptyCharacter?: string;
  label?: unknown;
  labelWidth?: string;
  labelPosition?: string;
  className?: string;
  style?: CSSProperties;
  onDidChange?: (value: string | null) => void | Promise<void>;
  onFocus?: () => void | Promise<void>;
  onBlur?: () => void | Promise<void>;
  onInvalidChange?: (value?: string) => void | Promise<void>;
  "aria-label"?: string;
  "data-testid"?: string;
};

type FieldName = "hour" | "minute" | "second";
type AmPm = "AM" | "PM";
type TimeParts = {
  hour: string;
  minute: string;
  second: string;
  ampm: AmPm | null;
};

const emptyParts: TimeParts = { hour: "", minute: "", second: "", ampm: null };

export const TimeInputNative = memo(forwardRef<TimeInputApi, TimeInputProps>(function TimeInputNative(
  {
    id,
    bindTo,
    value,
    initialValue,
    enabled = defaultProps.enabled,
    validationStatus = defaultProps.validationStatus,
    hour24 = defaultProps.hour24,
    seconds = defaultProps.seconds,
    minTime: _minTime,
    maxTime: _maxTime,
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
    label,
    labelWidth,
    labelPosition = "top",
    className,
    style,
    onDidChange,
    onFocus,
    onBlur,
    onInvalidChange,
    "aria-label": ariaLabel,
    "data-testid": dataTestId,
    ...rest
  },
  ref,
) {
  const form = useFormContext();
  const getFormValue = form?.getValue;
  const setFormValue = form?.setValue;
  const registerFormItem = form?.registerItem;
  const fieldName = bindTo !== undefined ? resolveFieldName(bindTo, form?.fieldPrefix) : undefined;
  const formValue = getFormValue && fieldName !== undefined ? getFormValue(fieldName) : undefined;
  const effectiveValue = formValue ?? value;
  const controlled = effectiveValue !== undefined;
  const [parts, setParts] = useState<TimeParts>(() => parseTimeParts(controlled ? effectiveValue : initialValue, hour24, seconds));
  const [invalidFields, setInvalidFields] = useState<Partial<Record<FieldName, boolean>>>({});
  const [hasFocusInside, setHasFocusInside] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const inputRefs = {
    hour: useRef<HTMLInputElement | null>(null),
    minute: useRef<HTMLInputElement | null>(null),
    second: useRef<HTMLInputElement | null>(null),
  };
  const ampmRef = useRef<HTMLButtonElement | null>(null);

  const orderedFields = useMemo<FieldName[]>(() => seconds ? ["hour", "minute", "second"] : ["hour", "minute"], [seconds]);
  const interactive = enabled && !readOnly;
  const currentValue = useMemo(() => formatTimeParts(parts, hour24, seconds), [hour24, parts, seconds]);
  const placeholder = repeatChar(emptyCharacter, 2);

  useEffect(() => {
    if (controlled) {
      setParts(parseTimeParts(effectiveValue, hour24, seconds));
      setInvalidFields({});
    }
  }, [controlled, effectiveValue, hour24, seconds]);

  useEffect(() => {
    if (!controlled) {
      setParts(parseTimeParts(initialValue, hour24, seconds));
      setInvalidFields({});
    }
  }, [controlled, hour24, initialValue, seconds]);

  useEffect(() => {
    if (autoFocus && enabled) {
      const timeoutId = setTimeout(() => inputRefs.hour.current?.focus(), 0);
      return () => clearTimeout(timeoutId);
    }
  }, [autoFocus, enabled, inputRefs.hour]);

  useEffect(() => {
    if (
      !getFormValue ||
      !setFormValue ||
      fieldName === undefined ||
      getFormValue(fieldName) != null ||
      initialValue === undefined
    ) {
      return;
    }
    setFormValue(fieldName, formatTimeParts(parseTimeParts(initialValue, hour24, seconds), hour24, seconds));
  }, [fieldName, getFormValue, hour24, initialValue, seconds, setFormValue]);

  useEffect(() => {
    if (!registerFormItem || fieldName === undefined) {
      return;
    }
    return registerFormItem({
      name: fieldName,
      label: stringifyLabel(label),
      required,
    });
  }, [fieldName, label, registerFormItem, required]);

  const emitParts = useCallback((nextParts: TimeParts) => {
    setParts(nextParts);
    const nextValue = formatTimeParts(nextParts, hour24, seconds);
    if (setFormValue && fieldName !== undefined) {
      setFormValue(fieldName, nextValue);
    }
    void onDidChange?.(nextValue);
  }, [fieldName, hour24, onDidChange, seconds, setFormValue]);

  const updateField = useCallback((field: FieldName, rawValue: string) => {
    if (!interactive) {
      return;
    }
    const cleanValue = rawValue.replace(/\D/g, "").slice(0, 2);
    const nextParts = { ...parts, [field]: cleanValue };
    const nextInvalid = computeInvalidFields(nextParts, hour24, seconds);
    setInvalidFields(nextInvalid);
    if (nextInvalid[field]) {
      void onInvalidChange?.(cleanValue);
    }
    emitParts(nextParts);
    if (!nextInvalid[field] && cleanValue.length === 2) {
      const nextField = orderedFields[orderedFields.indexOf(field) + 1];
      setTimeout(() => {
        if (nextField) {
          inputRefs[nextField].current?.focus();
          inputRefs[nextField].current?.select();
        } else if (!hour24) {
          ampmRef.current?.focus();
        }
      }, 0);
    }
  }, [emitParts, hour24, inputRefs, interactive, onInvalidChange, orderedFields, parts, seconds]);

  const normalizeField = useCallback((field: FieldName) => {
    const normalized = normalizeFieldValue(field, parts[field], hour24);
    const nextParts = { ...parts, [field]: normalized };
    const nextInvalid = computeInvalidFields(nextParts, hour24, seconds);
    setInvalidFields(nextInvalid);
    if (nextInvalid[field]) {
      void onInvalidChange?.(normalized);
    }
    emitParts(nextParts);
  }, [emitParts, hour24, onInvalidChange, parts, seconds]);

  const setValue = useCallback((nextValue: unknown) => {
    const nextParts = parseTimeParts(nextValue, hour24, seconds);
    setInvalidFields({});
    emitParts(nextParts);
  }, [emitParts, hour24, seconds]);

  const clear = useCallback(() => {
    setValue(clearToInitialValue ? initialValue : null);
    setTimeout(() => inputRefs.hour.current?.focus(), 0);
  }, [clearToInitialValue, initialValue, inputRefs.hour, setValue]);

  const focus = useCallback(() => {
    inputRefs.hour.current?.focus();
  }, [inputRefs.hour]);

  const isoValue = useCallback(() => partsToIso(parts, hour24, seconds), [hour24, parts, seconds]);

  useImperativeHandle(ref, () => ({
    focus,
    setValue,
    isoValue,
    get value() {
      return formatTimeParts(parts, hour24, seconds) ?? undefined;
    },
  }), [focus, hour24, isoValue, parts, seconds, setValue]);

  const handleFocusCapture = useCallback(() => {
    if (!hasFocusInside) {
      setHasFocusInside(true);
      void onFocus?.();
    }
  }, [hasFocusInside, onFocus]);

  const handleBlur = useCallback((event: FocusEvent<HTMLDivElement>) => {
    const relatedTarget = event.relatedTarget as Node | null;
    if (!relatedTarget || !event.currentTarget.contains(relatedTarget)) {
      setHasFocusInside(false);
      void onBlur?.();
    }
  }, [onBlur]);

  const toggleAmPm = useCallback(() => {
    if (!interactive) {
      return;
    }
    emitParts({ ...parts, ampm: parts.ampm === "AM" ? "PM" : "AM" });
  }, [emitParts, interactive, parts]);

  const handleAmPmKeyDown = useCallback((event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key.toLowerCase() === "a") {
      event.preventDefault();
      emitParts({ ...parts, ampm: "AM" });
      return;
    }
    if (event.key.toLowerCase() === "p") {
      event.preventDefault();
      emitParts({ ...parts, ampm: "PM" });
      return;
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      const previous = orderedFields[orderedFields.length - 1];
      inputRefs[previous].current?.focus();
      inputRefs[previous].current?.select();
      return;
    }
    if (event.key === " " || event.key === "Enter" || event.key === "ArrowUp" || event.key === "ArrowDown") {
      event.preventDefault();
      toggleAmPm();
    }
  }, [emitParts, inputRefs, orderedFields, parts, toggleAmPm]);

  const handleInputKeyDown = useCallback((field: FieldName, event: KeyboardEvent<HTMLInputElement>) => {
    const currentIndex = orderedFields.indexOf(field);
    if (event.key === "ArrowRight") {
      event.preventDefault();
      const nextField = orderedFields[currentIndex + 1];
      if (nextField) {
        inputRefs[nextField].current?.focus();
        inputRefs[nextField].current?.select();
      } else if (!hour24) {
        ampmRef.current?.focus();
      }
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      const previousField = orderedFields[currentIndex - 1];
      if (previousField) {
        inputRefs[previousField].current?.focus();
        inputRefs[previousField].current?.select();
      }
    }
  }, [hour24, inputRefs, orderedFields]);

  const hasLabel = label !== undefined && label !== null && label !== "";
  const rootStyle = useMemo<CSSProperties>(() => ({
    ...(hasLabel ? undefined : style),
    ...(gap ? { "--xmlui-runtime-gap-TimeInput": gap } as CSSProperties : undefined),
  }), [gap, hasLabel, style]);
  const labeledItemStyle = useMemo<CSSProperties>(() => ({
    width: "100%",
    ...(gap ? { "--xmlui-runtime-gap-TimeInput": gap } as CSSProperties : undefined),
  }), [gap]);
  const labelStyle = useMemo<CSSProperties | undefined>(() => labelWidth ? ({ width: labelWidth }) : undefined, [labelWidth]);

  const inputRoot = (
    <div
      {...rest}
      ref={rootRef}
      data-xmlui-component="TimeInput"
      data-validation-status={validationStatus}
      data-testid={hasLabel ? undefined : dataTestId}
      role="group"
      aria-label={ariaLabel}
      className={cx(
        styles.timeInputWrapper,
        validationStatus === "error" ? styles.timeInputError : undefined,
        validationStatus === "warning" ? styles.timeInputWarning : undefined,
        validationStatus === "valid" ? styles.timeInputValid : undefined,
        !enabled ? styles.disabled : undefined,
        readOnly ? styles.readOnly : undefined,
        className,
      )}
      style={rootStyle}
      onFocusCapture={handleFocusCapture}
      onBlur={handleBlur}
      tabIndex={-1}
    >
      <Adornment text={startText} icon={startIcon} />
      <div className={styles.wrapper}>
        <div className={styles.inputGroup}>
          {orderedFields.map((field, index) => (
            <span key={field}>
              <input
                id={index === 0 ? id : undefined}
                ref={inputRefs[field]}
                data-part-id={field}
                data-xmlui-part={field}
                aria-label={field}
                autoComplete="off"
                autoFocus={autoFocus && index === 0}
                className={cx(styles.input, invalidFields[field] ? styles.invalid : undefined)}
                disabled={!enabled}
                inputMode="numeric"
                maxLength={2}
                name={field}
                placeholder={placeholder}
                readOnly={readOnly}
                required={required}
                type="text"
                value={parts[field]}
                onChange={(event: ChangeEvent<HTMLInputElement>) => updateField(field, event.currentTarget.value)}
                onBlur={() => normalizeField(field)}
                onFocus={(event: FocusEvent<HTMLInputElement>) => {
                  handleFocusCapture();
                  event.currentTarget.select();
                }}
                onKeyDown={(event) => handleInputKeyDown(field, event)}
              />
              {index < orderedFields.length - 1 ? <span className={styles.divider}>:</span> : null}
            </span>
          ))}
          {!hour24 ? (
            <button
              ref={ampmRef}
              type="button"
              role="switch"
              aria-checked={parts.ampm === "PM"}
              data-part-id="ampm"
              data-xmlui-part="ampm"
              className={styles.ampm}
              disabled={!enabled}
              onClick={toggleAmPm}
              onKeyDown={handleAmPmKeyDown}
            >
              {parts.ampm ?? "AM"}
            </button>
          ) : null}
        </div>
        {clearable ? (
          <button
            type="button"
            aria-label="Clear"
            data-part-id="clearButton"
            data-xmlui-part="clearButton"
            className={styles.clearButton}
            disabled={!enabled}
            onClick={clear}
          >
            {clearIcon ? String(clearIcon) : "×"}
          </button>
        ) : null}
      </div>
      <Adornment text={endText} icon={endIcon} />
    </div>
  );

  if (!hasLabel) {
    return inputRoot;
  }

  return (
    <div data-testid={dataTestId} style={style}>
      <label
        data-part-id="label"
        data-xmlui-part="label"
        data-xmlui-label-position={labelPosition}
        style={{ display: "inline-block", ...labelStyle }}
        onClick={() => focus()}
        onFocus={handleFocusCapture}
      >
        {String(label)}
      </label>
      <div data-part-id="labeledItem" data-xmlui-part="labeledItem" style={labeledItemStyle}>
        {inputRoot}
      </div>
    </div>
  );
}));

function Adornment({ text, icon }: { text?: unknown; icon?: unknown }) {
  if (text === undefined && icon === undefined) {
    return null;
  }
  return (
    <span className={styles.adornment}>
      {icon !== undefined ? <span role="img" aria-label={String(icon)} data-icon={String(icon)}>{String(icon)}</span> : null}
      {text !== undefined ? <span>{String(text)}</span> : null}
    </span>
  );
}

function parseTimeParts(value: unknown, hour24: boolean, seconds: boolean): TimeParts {
  const source = stringifyTimeValue(value);
  if (source === null) {
    return emptyParts;
  }
  const match = /^(\d{1,2})(?::(\d{1,2}))?(?::(\d{1,2}))?(?:\s*(AM|PM))?$/i.exec(source.trim());
  if (!match || match[2] === undefined) {
    return source === "" ? emptyParts : { hour: "00", minute: "00", second: seconds ? "00" : "", ampm: hour24 ? null : "AM" };
  }
  let hour = Number(match[1]);
  const minute = Number(match[2]);
  const second = match[3] === undefined ? 0 : Number(match[3]);
  let ampm = normalizeAmPm(match[4]);
  if (!hour24) {
    if (hour === 0) {
      hour = 12;
      ampm = "AM";
    } else if (hour > 12) {
      ampm = "PM";
      hour -= 12;
    } else {
      ampm ??= "AM";
    }
  }
  return {
    hour: pad2(hour),
    minute: pad2(minute),
    second: seconds ? pad2(second) : "",
    ampm: hour24 ? null : ampm,
  };
}

function stringifyTimeValue(value: unknown): string | null {
  if (value === undefined || value === null || value === "") {
    return null;
  }
  if (typeof value === "string") {
    return value;
  }
  return null;
}

function stringifyLabel(value: unknown): string {
  return value === undefined || value === null ? "" : String(value);
}

function resolveFieldName(bindTo: string, fieldPrefix?: string): string {
  if (!fieldPrefix) {
    return bindTo;
  }
  return bindTo ? `${fieldPrefix}.${bindTo}` : fieldPrefix;
}

function formatTimeParts(parts: TimeParts, hour24: boolean, seconds: boolean): string | null {
  if (!parts.hour || !parts.minute) {
    return null;
  }
  const suffix = !hour24 ? ` ${parts.ampm ?? "AM"}` : "";
  const second = seconds ? `:${(parts.second || "00").padStart(2, "0")}` : "";
  return `${parts.hour.padStart(2, "0")}:${parts.minute.padStart(2, "0")}${second}${suffix}`;
}

function partsToIso(parts: TimeParts, hour24: boolean, seconds: boolean): string | null {
  if (!parts.hour || !parts.minute) {
    return null;
  }
  let hour = Number(parts.hour);
  if (!hour24) {
    if (parts.ampm === "PM" && hour < 12) {
      hour += 12;
    }
    if (parts.ampm === "AM" && hour === 12) {
      hour = 0;
    }
  }
  return `${pad2(hour)}:${pad2(Number(parts.minute))}:${pad2(seconds ? Number(parts.second || 0) : 0)}`;
}

function normalizeFieldValue(field: FieldName, value: string, hour24: boolean): string {
  if (!value) {
    return "";
  }
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return value;
  }
  if (field === "hour") {
    if (hour24) {
      return pad2(Math.max(0, Math.min(23, numeric)));
    }
    return pad2(Math.max(1, Math.min(12, numeric)));
  }
  return pad2(Math.max(0, Math.min(59, numeric)));
}

function computeInvalidFields(parts: TimeParts, hour24: boolean, seconds: boolean): Partial<Record<FieldName, boolean>> {
  return {
    hour: parts.hour !== "" && isInvalidField("hour", parts.hour, hour24),
    minute: parts.minute !== "" && isInvalidField("minute", parts.minute, hour24),
    second: seconds && parts.second !== "" && isInvalidField("second", parts.second, hour24),
  };
}

function isInvalidField(field: FieldName, value: string, hour24: boolean): boolean {
  if (!/^\d{1,2}$/.test(value)) {
    return true;
  }
  const numeric = Number(value);
  if (field === "hour") {
    return hour24 ? numeric > 23 : numeric < 1 || numeric > 12;
  }
  return numeric > 59;
}

function normalizeAmPm(value: string | undefined): AmPm | null {
  const upper = value?.toUpperCase();
  return upper === "AM" || upper === "PM" ? upper : null;
}

function pad2(value: number): string {
  return Math.max(0, value).toString().padStart(2, "0").slice(-2);
}

function repeatChar(value: string | undefined, count: number): string {
  const char = value && value.length > 0 ? value[0] : "-";
  return char.repeat(count);
}

function cx(...classes: Array<string | undefined | false>): string {
  return classes.filter(Boolean).join(" ");
}
