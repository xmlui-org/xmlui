import type { CSSProperties, ChangeEvent, FocusEvent, KeyboardEvent } from "react";
import { forwardRef, memo, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";

import { dateFormats, type DateFormat, DateInputModeValues, type DateInputMode, WeekDays } from "./DateInput.constants";
import { defaultProps } from "./DateInput.defaults";
import styles from "./DateInput.module.scss";

export type DateInputApi = {
  focus: () => void;
  setValue: (value: unknown) => void;
  isoValue: () => string | null;
  value: string | null;
};

export type DateInputProps = {
  id?: string;
  value?: unknown;
  initialValue?: unknown;
  enabled?: boolean;
  validationStatus?: string;
  mode?: DateInputMode | string;
  dateFormat?: DateFormat | string;
  showWeekNumber?: boolean;
  weekStartsOn?: WeekDays | number;
  minValue?: string;
  maxValue?: string;
  disabledDates?: unknown;
  inline?: boolean;
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
  verboseValidationFeedback?: boolean;
  validationIconSuccess?: string;
  validationIconError?: string;
  invalidMessages?: string[];
  label?: unknown;
  className?: string;
  style?: CSSProperties;
  onDidChange?: (value: string | null) => void | Promise<void>;
  onFocus?: () => void | Promise<void>;
  onBlur?: () => void | Promise<void>;
  onInvalidChange?: () => void | Promise<void>;
  "data-testid"?: string;
};

type FieldName = "month" | "day" | "year";
type DateParts = Record<FieldName, string>;

const emptyParts: DateParts = { month: "", day: "", year: "" };

export const DateInputNative = memo(forwardRef<DateInputApi, DateInputProps>(function DateInputNative(
  {
    id,
    value,
    initialValue,
    enabled = defaultProps.enabled,
    validationStatus = defaultProps.validationStatus,
    mode: _mode = defaultProps.mode,
    dateFormat = defaultProps.dateFormat,
    showWeekNumber: _showWeekNumber = defaultProps.showWeekNumber,
    weekStartsOn: _weekStartsOn = defaultProps.weekStartsOn,
    minValue: _minValue,
    maxValue: _maxValue,
    disabledDates: _disabledDates,
    inline: _inline = defaultProps.inline,
    clearable = defaultProps.clearable,
    clearIcon: _clearIcon,
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
    verboseValidationFeedback = true,
    validationIconSuccess = "checkmark",
    validationIconError = "close",
    invalidMessages,
    label,
    className,
    style,
    onDidChange,
    onFocus,
    onBlur,
    onInvalidChange,
    "data-testid": dataTestId,
    ...rest
  },
  ref,
) {
  const normalizedFormat = normalizeDateFormat(dateFormat);
  const controlled = value !== undefined;
  const initialString = stringifyDateValue(controlled ? value : initialValue);
  const [parts, setParts] = useState<DateParts>(() => parseDateParts(initialString, normalizedFormat) ?? emptyParts);
  const [invalidFields, setInvalidFields] = useState<Partial<Record<FieldName, boolean>>>({});
  const [hasFocusInside, setHasFocusInside] = useState(false);
  const [selectAllActive, setSelectAllActive] = useState(false);
  const selectAllActiveRef = useRef(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const inputRefs = {
    month: useRef<HTMLInputElement | null>(null),
    day: useRef<HTMLInputElement | null>(null),
    year: useRef<HTMLInputElement | null>(null),
  };

  const currentValue = useMemo(() => formatDateParts(parts, normalizedFormat), [normalizedFormat, parts]);
  const orderedFields = useMemo(() => getFieldOrder(normalizedFormat), [normalizedFormat]);
  const separator = normalizedFormat.includes("/") ? "/" : normalizedFormat.includes("-") ? "-" : "";
  const interactive = enabled && !readOnly;

  useEffect(() => {
    if (controlled) {
      setParts(parseDateParts(stringifyDateValue(value), normalizedFormat) ?? emptyParts);
    }
  }, [controlled, normalizedFormat, value]);

  useEffect(() => {
    if (!controlled) {
      setParts(parseDateParts(stringifyDateValue(initialValue), normalizedFormat) ?? emptyParts);
    }
  }, [controlled, initialValue, normalizedFormat]);

  useEffect(() => {
    if (autoFocus && enabled) {
      const timeoutId = setTimeout(() => inputRefs[orderedFields[0]]?.current?.focus(), 0);
      return () => clearTimeout(timeoutId);
    }
  }, [autoFocus, enabled, orderedFields]);

  const emitParts = useCallback((nextParts: DateParts) => {
    setParts(nextParts);
    const nextValue = formatDateParts(nextParts, normalizedFormat);
    void onDidChange?.(nextValue);
  }, [normalizedFormat, onDidChange]);

  const updateField = useCallback((field: FieldName, rawValue: string) => {
    if (!interactive) {
      return;
    }
    const cleanValue = rawValue.replace(/\D/g, "").slice(0, field === "year" ? 4 : 2);
    const nextParts = { ...parts, [field]: cleanValue };
    const nextInvalidFields = computeInvalidFields(nextParts);
    setInvalidFields(nextInvalidFields);
    if (Object.values(nextInvalidFields).some(Boolean)) {
      void onInvalidChange?.();
    }
    emitParts(nextParts);
    const fieldInvalid = Boolean(nextInvalidFields[field]);
    if (!fieldInvalid && cleanValue.length === (field === "year" ? 4 : 2)) {
      const nextField = orderedFields[orderedFields.indexOf(field) + 1];
      if (nextField) {
        setTimeout(() => {
          inputRefs[nextField]?.current?.focus();
          inputRefs[nextField]?.current?.select();
        }, 0);
      }
    }
  }, [emitParts, inputRefs, interactive, onInvalidChange, orderedFields, parts]);

  const normalizeField = useCallback((field: FieldName) => {
    const raw = parts[field];
    const normalized = normalizeFieldValue(field, raw, parts);
    const nextParts = { ...parts, [field]: normalized };
    const invalid = normalized !== "" && isFieldInvalid(field, normalized, nextParts);
    setInvalidFields((current) => ({ ...current, [field]: invalid }));
    if (invalid) {
      void onInvalidChange?.();
    }
    emitParts(nextParts);
  }, [emitParts, onInvalidChange, parts]);

  const setValue = useCallback((nextValue: unknown) => {
    const nextParts = parseDateParts(stringifyDateValue(nextValue), normalizedFormat) ?? emptyParts;
    setInvalidFields({});
    emitParts(nextParts);
  }, [emitParts, normalizedFormat]);

  const clear = useCallback(() => {
    setValue(clearToInitialValue ? initialValue : null);
    setTimeout(() => inputRefs[orderedFields[0]]?.current?.focus(), 0);
  }, [clearToInitialValue, initialValue, inputRefs, orderedFields, setValue]);

  const focus = useCallback(() => {
    inputRefs[orderedFields[0]]?.current?.focus();
  }, [inputRefs, orderedFields]);

  const isoValue = useCallback(() => partsToIso(parts), [parts]);

  useImperativeHandle(ref, () => ({
    focus,
    setValue,
    isoValue,
    get value() {
      return formatDateParts(parts, normalizedFormat);
    },
  }), [focus, isoValue, normalizedFormat, parts, setValue]);

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
      setSelectAllActive(false);
      selectAllActiveRef.current = false;
      void onBlur?.();
    }
  }, [onBlur]);

  const handleKeyDown = useCallback((field: FieldName, event: KeyboardEvent<HTMLInputElement>) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "a") {
      event.preventDefault();
      selectAllActiveRef.current = true;
      setSelectAllActive(true);
      inputRefs[orderedFields[0]]?.current?.focus();
      inputRefs[orderedFields[0]]?.current?.select();
      return;
    }
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "c" && selectAllActiveRef.current) {
      event.preventDefault();
      if (currentValue) {
        void navigator.clipboard?.writeText?.(currentValue);
      }
      return;
    }
    if (selectAllActiveRef.current && (event.key === "Backspace" || event.key === "Delete")) {
      event.preventDefault();
      selectAllActiveRef.current = false;
      setSelectAllActive(false);
      emitParts(emptyParts);
      inputRefs[orderedFields[0]]?.current?.focus();
      return;
    }
    const currentIndex = orderedFields.indexOf(field);
    if (event.key === "ArrowRight" && currentIndex < orderedFields.length - 1) {
      event.preventDefault();
      const next = inputRefs[orderedFields[currentIndex + 1]]?.current;
      next?.focus();
      next?.select();
    } else if (event.key === "ArrowLeft" && currentIndex > 0) {
      event.preventDefault();
      const previous = inputRefs[orderedFields[currentIndex - 1]]?.current;
      previous?.focus();
      previous?.select();
    } else if (event.key === "Backspace" && event.currentTarget.value === "" && currentIndex > 0) {
      event.preventDefault();
      const previous = inputRefs[orderedFields[currentIndex - 1]]?.current;
      previous?.focus();
      previous?.select();
    }
  }, [currentValue, emitParts, inputRefs, orderedFields]);

  const hasLabel = label !== undefined && label !== null && label !== "";
  const rootStyle = useMemo<CSSProperties>(() => ({
    ...(hasLabel ? undefined : style),
    ...(gap ? { "--xmlui-runtime-gap-DateInput": gap } as CSSProperties : undefined),
  }), [gap, hasLabel, style]);
  const labeledItemStyle = useMemo<CSSProperties>(() => ({
    width: "100%",
    ...(gap ? { "--xmlui-runtime-gap-DateInput": gap } as CSSProperties : undefined),
  }), [gap]);
  const inputRoot = (
    <div
      {...rest}
      ref={rootRef}
      data-xmlui-component="DateInput"
      data-validation-status={validationStatus}
      data-testid={hasLabel ? undefined : dataTestId}
      className={cx(
        styles.dateInputWrapper,
        validationStatus === "error" ? styles.dateInputError : undefined,
        validationStatus === "warning" ? styles.dateInputWarning : undefined,
        validationStatus === "valid" ? styles.dateInputValid : undefined,
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
        <div className={cx(styles.inputGroup, selectAllActive ? styles.selectAllActive : undefined)}>
          {orderedFields.map((field, index) => (
            <span key={field}>
              <input
                id={index === 0 ? id : undefined}
                ref={inputRefs[field]}
                data-part-id={field}
                data-xmlui-part={field}
                data-input="true"
                aria-label={field}
                autoComplete="off"
                autoFocus={autoFocus && index === 0}
                className={cx(styles.input, styles[field], invalidFields[field] ? cx(styles.invalid, "invalid") : undefined)}
                disabled={!enabled}
                inputMode="numeric"
                maxLength={field === "year" ? 4 : 2}
                name={field}
                placeholder={field === "year" ? repeatChar(emptyCharacter, 4) : repeatChar(emptyCharacter, 2)}
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
                onKeyDown={(event) => handleKeyDown(field, event)}
              />
              {index < orderedFields.length - 1 && separator ? (
                <span className={styles.divider}>{separator}</span>
              ) : null}
            </span>
          ))}
        </div>
        {clearable ? (
          <button
            type="button"
            data-part-id="clearButton"
            data-xmlui-part="clearButton"
            className={styles.clearButton}
            disabled={!enabled}
            onClick={clear}
          >
            ×
          </button>
        ) : null}
      </div>
      {!verboseValidationFeedback && validationStatus !== "none" ? (
        <span
          data-part-id="conciseValidationFeedback"
          data-xmlui-part="conciseValidationFeedback"
          className={styles.conciseValidationFeedback}
          title={invalidMessages?.join("\n")}
        >
          {validationStatus === "valid" ? validationIconSuccess : validationIconError}
        </span>
      ) : null}
      <Adornment text={endText} icon={endIcon} />
    </div>
  );

  if (!hasLabel) {
    return inputRoot;
  }

  return (
    <div data-testid={dataTestId} style={style}>
      <label
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

function getFieldOrder(format: string): FieldName[] {
  if (format.startsWith("yyyy")) {
    return ["year", "month", "day"];
  }
  if (format.startsWith("dd")) {
    return ["day", "month", "year"];
  }
  return ["month", "day", "year"];
}

function normalizeDateFormat(format: unknown): DateFormat {
  return dateFormats.includes(format as DateFormat) ? format as DateFormat : defaultProps.dateFormat as DateFormat;
}

function stringifyDateValue(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function parseDateParts(value: string | null, format: DateFormat): DateParts | null {
  if (!value) {
    return null;
  }
  const parsed = parseByFormat(value, format) ?? parseIso(value);
  if (!parsed || !isRealDate(parsed.year, parsed.month, parsed.day)) {
    return null;
  }
  return {
    month: pad2(parsed.month),
    day: pad2(parsed.day),
    year: String(parsed.year).padStart(4, "0"),
  };
}

function parseByFormat(value: string, format: DateFormat): { month: number; day: number; year: number } | null {
  const patterns: Record<DateFormat, RegExp> = {
    "MM/dd/yyyy": /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/,
    "MM-dd-yyyy": /^(\d{1,2})-(\d{1,2})-(\d{4})$/,
    "yyyy/MM/dd": /^(\d{4})\/(\d{1,2})\/(\d{1,2})$/,
    "yyyy-MM-dd": /^(\d{4})-(\d{1,2})-(\d{1,2})$/,
    "dd/MM/yyyy": /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/,
    "dd-MM-yyyy": /^(\d{1,2})-(\d{1,2})-(\d{4})$/,
    yyyyMMdd: /^(\d{4})(\d{2})(\d{2})$/,
    MMddyyyy: /^(\d{2})(\d{2})(\d{4})$/,
  };
  const match = patterns[format].exec(value);
  if (!match) {
    return null;
  }
  if (format.startsWith("yyyy")) {
    return { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) };
  }
  if (format.startsWith("dd")) {
    return { day: Number(match[1]), month: Number(match[2]), year: Number(match[3]) };
  }
  return { month: Number(match[1]), day: Number(match[2]), year: Number(match[3]) };
}

function parseIso(value: string): { month: number; day: number; year: number } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!match) {
    return null;
  }
  return { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) };
}

function formatDateParts(parts: DateParts, format: DateFormat): string | null {
  if (!parts.month || !parts.day || !parts.year) {
    return null;
  }
  const month = Number(parts.month);
  const day = Number(parts.day);
  const year = Number(parts.year);
  if (!isRealDate(year, month, day)) {
    return null;
  }
  const mm = pad2(month);
  const dd = pad2(day);
  const yyyy = String(year).padStart(4, "0");
  switch (format) {
    case "MM-dd-yyyy":
      return `${mm}-${dd}-${yyyy}`;
    case "yyyy/MM/dd":
      return `${yyyy}/${mm}/${dd}`;
    case "yyyy-MM-dd":
      return `${yyyy}-${mm}-${dd}`;
    case "dd/MM/yyyy":
      return `${dd}/${mm}/${yyyy}`;
    case "dd-MM-yyyy":
      return `${dd}-${mm}-${yyyy}`;
    case "yyyyMMdd":
      return `${yyyy}${mm}${dd}`;
    case "MMddyyyy":
      return `${mm}${dd}${yyyy}`;
    default:
      return `${mm}/${dd}/${yyyy}`;
  }
}

function partsToIso(parts: DateParts): string | null {
  if (!parts.month || !parts.day || !parts.year) {
    return null;
  }
  const month = Number(parts.month);
  const day = Number(parts.day);
  const year = Number(parts.year);
  return isRealDate(year, month, day) ? `${String(year).padStart(4, "0")}-${pad2(month)}-${pad2(day)}` : null;
}

function normalizeFieldValue(field: FieldName, value: string, parts: DateParts): string {
  if (!value) {
    return "";
  }
  const numberValue = Number(value);
  if (!Number.isFinite(numberValue)) {
    return "";
  }
  if (field === "year") {
    if (numberValue >= 1900 && numberValue <= 2100) {
      return String(numberValue).padStart(4, "0");
    }
    if (value.length <= 2) {
      const candidate = Number(`20${value.padStart(2, "0")}`);
      return String(candidate > new Date().getFullYear() + 100 ? Number(`19${value.padStart(2, "0")}`) : candidate);
    }
    return "";
  }
  if (field === "month") {
    if (numberValue >= 1 && numberValue <= 12) {
      return pad2(numberValue);
    }
    const lastDigit = numberValue % 10;
    return pad2(lastDigit === 0 ? 1 : lastDigit);
  }
  const maxDay = parts.month && parts.year ? new Date(Number(parts.year), Number(parts.month), 0).getDate() : 31;
  if (numberValue >= 1 && numberValue <= maxDay) {
    return pad2(numberValue);
  }
  const normalized = numberValue % 10;
  return pad2(normalized === 0 ? 1 : normalized);
}

function isFieldInvalid(field: FieldName, value: string, parts: DateParts): boolean {
  const numberValue = Number(value);
  if (!Number.isFinite(numberValue)) {
    return true;
  }
  if (field === "year") {
    return value.length === 4 && (numberValue < 1900 || numberValue > 2100);
  }
  if (field === "month") {
    return numberValue < 1 || numberValue > 12;
  }
  const maxDay = parts.month && parts.year ? new Date(Number(parts.year), Number(parts.month), 0).getDate() : 31;
  return numberValue < 1 || numberValue > maxDay;
}

function computeInvalidFields(parts: DateParts): Partial<Record<FieldName, boolean>> {
  const invalidFields: Partial<Record<FieldName, boolean>> = {};
  for (const field of ["month", "day", "year"] as const) {
    invalidFields[field] = parts[field] !== "" && isFieldInvalid(field, parts[field], parts);
  }
  if (parts.month && parts.day && parts.year && !partsToIso(parts)) {
    invalidFields.day = true;
  }
  return invalidFields;
}

function isRealDate(year: number, month: number, day: number): boolean {
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
    return false;
  }
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

function pad2(value: number) {
  return String(value).padStart(2, "0");
}

function repeatChar(value: string | undefined, count: number) {
  const char = value && [...value][0] ? [...value][0] : "-";
  return char.repeat(count);
}

function cx(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(" ");
}
