import type { CSSProperties, FocusEvent } from "react";
import { forwardRef, memo, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";

import { defaultProps } from "./DatePicker.defaults";

const styles = {
  adornment: "adornment",
  autoWidth: "autoWidth",
  calendarArea: "calendarArea",
  cell: "cell",
  cellTrigger: "cellTrigger",
  clear: "clear",
  content: "content",
  control: "control",
  footerButton: "footerButton",
  footerButtonPrimary: "footerButtonPrimary",
  fullWidth: "fullWidth",
  input: "input",
  label: "label",
  nav: "nav",
  positioner: "positioner",
  preset: "preset",
  popupFooter: "popupFooter",
  quickPresets: "quickPresets",
  rangeSeparator: "rangeSeparator",
  root: "root",
  table: "table",
  trailing: "trailing",
  viewControl: "viewControl",
  viewTrigger: "viewTrigger",
  weekday: "weekday",
  weekNumber: "weekNumber",
} as const;

export const dateFormats = [
  "MM/dd/yyyy",
  "MM-dd-yyyy",
  "yyyy/MM/dd",
  "yyyy-MM-dd",
  "dd/MM/yyyy",
  "dd-MM-yyyy",
  "yyyyMMdd",
  "MMddyyyy",
] as const;

export type DateFormat = (typeof dateFormats)[number];
type Mode = "single" | "range";
type ValidationStatus = "none" | "error" | "warning" | "valid";
type DateParts = { year: number; month: number; day: number };
type RangePayload = { from?: string; to?: string };
type DatePickerValue = string | RangePayload | undefined;

export type DatePickerApi = {
  focus: () => void;
  setValue: (value: unknown) => void;
  getValue: () => DatePickerValue;
  value: DatePickerValue;
};

export type DatePickerProps = {
  id?: string;
  value?: unknown;
  initialValue?: unknown;
  mode?: Mode | string;
  label?: unknown;
  placeholder?: string;
  dateFormat?: string;
  enabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  autoFocus?: boolean;
  inline?: boolean;
  clearable?: boolean;
  validationStatus?: ValidationStatus | string;
  weekStartsOn?: number | string;
  showWeekNumber?: boolean;
  showWeekNumbers?: boolean;
  startDate?: unknown;
  endDate?: unknown;
  minValue?: unknown;
  maxValue?: unknown;
  startIcon?: unknown;
  endIcon?: unknown;
  startText?: unknown;
  endText?: unknown;
  width?: string;
  locale?: string;
  timeZone?: string;
  numOfMonths?: number | string;
  presets?: unknown;
  showPresets?: boolean;
  disabledDates?: unknown;
  confirmRangeSelection?: boolean;
  verboseValidationFeedback?: boolean;
  validationIconSuccess?: string;
  validationIconError?: string;
  invalidMessages?: string[];
  className?: string;
  style?: CSSProperties;
  onDidChange?: (value: DatePickerValue) => void | Promise<void>;
  onFocus?: () => void | Promise<void>;
  onBlur?: () => void | Promise<void>;
  "data-testid"?: string;
};

type DisabledMatcher =
  | boolean
  | string
  | Date
  | ((date: Date) => boolean)
  | { from?: string | Date; to?: string | Date; before?: string | Date; after?: string | Date; dayOfWeek?: number | number[] };

const dayMs = 86_400_000;

export const DatePickerNative = memo(forwardRef<DatePickerApi, DatePickerProps>(function DatePickerNative(
  {
    id,
    value,
    initialValue,
    mode: rawMode = defaultProps.mode,
    label,
    placeholder,
    dateFormat = defaultProps.dateFormat,
    enabled = defaultProps.enabled,
    readOnly = defaultProps.readOnly,
    required = defaultProps.required,
    autoFocus = defaultProps.autoFocus,
    inline = defaultProps.inline,
    clearable = defaultProps.clearable,
    validationStatus = defaultProps.validationStatus,
    weekStartsOn = defaultProps.weekStartsOn,
    showWeekNumber,
    showWeekNumbers,
    startDate,
    endDate,
    minValue,
    maxValue,
    startIcon,
    endIcon,
    startText,
    endText,
    width,
    locale = defaultProps.locale,
    timeZone: _timeZone = defaultProps.timeZone,
    numOfMonths = defaultProps.numOfMonths,
    presets,
    showPresets = defaultProps.showPresets,
    disabledDates,
    confirmRangeSelection = defaultProps.confirmRangeSelection,
    verboseValidationFeedback = true,
    validationIconSuccess = "checkmark",
    validationIconError = "error",
    invalidMessages,
    className,
    style,
    onDidChange,
    onFocus,
    onBlur,
    "data-testid": dataTestId,
    ...rest
  },
  ref,
) {
  const mode = normalizeMode(rawMode);
  const normalizedFormat = normalizeDateFormat(dateFormat);
  const controlled = value !== undefined;
  const initialValues = useMemo(
    () => toDateParts(controlled ? value : initialValue, mode, normalizedFormat),
    [controlled, initialValue, mode, normalizedFormat, value],
  );
  const [selected, setSelected] = useState<DateParts[]>(initialValues);
  const [draftRange, setDraftRange] = useState<DateParts[]>([]);
  const [isOpen, setIsOpen] = useState(inline);
  const [visibleMonth, setVisibleMonth] = useState<DateParts>(() => monthStart(initialValues[0] ?? todayParts()));
  const rootRef = useRef<HTMLDivElement | null>(null);
  const firstInputRef = useRef<HTMLInputElement | null>(null);
  const hasFocusInsideRef = useRef(false);
  const pendingRangeRef = useRef<DateParts[]>([]);

  useEffect(() => {
    if (controlled) {
      const next = toDateParts(value, mode, normalizedFormat);
      setSelected(next);
      if (next[0]) {
        setVisibleMonth(monthStart(next[0]));
      }
    }
  }, [controlled, mode, normalizedFormat, value]);

  useEffect(() => {
    if (!controlled) {
      setSelected(initialValues);
      if (initialValues[0]) {
        setVisibleMonth(monthStart(initialValues[0]));
      }
    }
  }, [controlled, initialValues]);

  useEffect(() => {
    if (autoFocus && enabled) {
      const timeoutId = setTimeout(() => firstInputRef.current?.focus(), 0);
      return () => clearTimeout(timeoutId);
    }
  }, [autoFocus, enabled]);

  const currentValue = useMemo(
    () => toPayload(selected, mode, normalizedFormat),
    [mode, normalizedFormat, selected],
  );
  const inputValues = useMemo(() => {
    if (mode === "range") {
      return [
        selected[0] ? formatDateParts(selected[0], normalizedFormat) : "",
        selected[1] ? formatDateParts(selected[1], normalizedFormat) : "",
      ];
    }
    return [selected[0] ? formatDateParts(selected[0], normalizedFormat) : ""];
  }, [mode, normalizedFormat, selected]);

  const minDate = useMemo(() => parseDateValue(minValue ?? startDate, normalizedFormat), [minValue, normalizedFormat, startDate]);
  const maxDate = useMemo(() => parseDateValue(maxValue ?? endDate, normalizedFormat), [endDate, maxValue, normalizedFormat]);
  const weekStart = clampWeekStart(weekStartsOn);
  const visibleMonthCount = Math.max(1, Number(numOfMonths) || defaultProps.numOfMonths);
  const presetItems = useMemo(
    () => resolvePresets(presets, showPresets, mode, normalizedFormat),
    [mode, normalizedFormat, presets, showPresets],
  );
  const hasLabel = label !== undefined && label !== null && label !== "";
  const interactive = enabled && !readOnly;
  const renderedSelected = draftRange.length ? draftRange : selected;

  const publish = useCallback((nextSelected: DateParts[], keepOpen = false) => {
    pendingRangeRef.current = [];
    setDraftRange([]);
    setSelected(nextSelected);
    const nextPayload = toPayload(nextSelected, mode, normalizedFormat);
    void onDidChange?.(nextPayload);
    if (!inline && !keepOpen) {
      setIsOpen(false);
    }
  }, [inline, mode, normalizedFormat, onDidChange]);

  const setValue = useCallback((nextValue: unknown) => {
    const nextSelected = toDateParts(nextValue, mode, normalizedFormat);
    publish(nextSelected, true);
    if (nextSelected[0]) {
      setVisibleMonth(monthStart(nextSelected[0]));
    }
  }, [mode, normalizedFormat, publish]);

  const focus = useCallback(() => {
    firstInputRef.current?.focus();
  }, []);

  useImperativeHandle(ref, () => ({
    focus,
    setValue,
    getValue: () => currentValue,
    get value() {
      return currentValue;
    },
  }), [currentValue, focus, setValue]);

  const handleFocusCapture = useCallback(() => {
    if (!hasFocusInsideRef.current) {
      hasFocusInsideRef.current = true;
      void onFocus?.();
    }
  }, [onFocus]);

  const handleBlurCapture = useCallback((event: FocusEvent<HTMLDivElement>) => {
    const relatedTarget = event.relatedTarget as Node | null;
    if (!relatedTarget || !event.currentTarget.contains(relatedTarget)) {
      hasFocusInsideRef.current = false;
      void onBlur?.();
    }
  }, [onBlur]);

  const commitInput = useCallback((index: number, raw: string) => {
    if (!interactive) {
      return;
    }
    const parsed = parseDateValue(raw, normalizedFormat);
    if (!parsed || isUnavailable(parsed, minDate, maxDate, disabledDates, normalizedFormat)) {
      if (raw === "") {
        const next = [...selected];
        next[index] = undefined as unknown as DateParts;
        publish(next.filter(Boolean), true);
      }
      return;
    }
    const next = mode === "range" ? [...selected] : [parsed];
    next[index] = parsed;
    publish(next.filter(Boolean).sort(compareParts), true);
    setVisibleMonth(monthStart(parsed));
  }, [disabledDates, interactive, maxDate, minDate, mode, normalizedFormat, publish, selected]);

  const selectDay = useCallback((day: DateParts) => {
    if (!interactive || isUnavailable(day, minDate, maxDate, disabledDates, normalizedFormat)) {
      return;
    }
    if (mode !== "range") {
      publish([day]);
      return;
    }
    const pending = pendingRangeRef.current;
    if (pending.length !== 1) {
      pendingRangeRef.current = [day];
      setDraftRange([day]);
      return;
    }
    const next = [pending[0], day].sort(compareParts);
    if (confirmRangeSelection) {
      pendingRangeRef.current = next;
      setDraftRange(next);
      return;
    }
    publish(next);
  }, [confirmRangeSelection, disabledDates, interactive, maxDate, minDate, mode, normalizedFormat, publish]);

  const clear = useCallback(() => {
    publish([], true);
    firstInputRef.current?.focus();
  }, [publish]);

  const cancelRange = useCallback(() => {
    pendingRangeRef.current = [];
    setDraftRange([]);
    if (!inline) {
      setIsOpen(false);
    }
  }, [inline]);

  const proceedRange = useCallback(() => {
    publish(pendingRangeRef.current, false);
  }, [publish]);

  const rootStyle = useMemo<CSSProperties>(() => ({
    ...style,
    ...(width && !widthClass(width) ? { width } : undefined),
  }), [style, width]);

  return (
    <div
      {...rest}
      ref={rootRef}
      data-xmlui-component="DatePicker"
      data-mode={mode}
      data-validation-status={validationStatus}
      data-inline={inline ? "" : undefined}
      data-disabled={!enabled ? "" : undefined}
      data-open={isOpen ? "" : undefined}
      data-testid={dataTestId}
      className={cx(styles.root, widthClass(width), className)}
      style={rootStyle}
      onFocusCapture={handleFocusCapture}
      onBlurCapture={handleBlurCapture}
    >
      {!inline && hasLabel ? (
        <label className={styles.label} onClick={focus}>
          {String(label)}
        </label>
      ) : null}

      {!inline ? (
        <div className={styles.control} data-part-id="input" data-xmlui-part="input">
          <Adornment text={startText} icon={startIcon} />
          <input
            ref={firstInputRef}
            id={id}
            className={styles.input}
            value={inputValues[0]}
            placeholder={placeholder ?? placeholderFor(normalizedFormat)}
            aria-label={hasLabel ? String(label) : "Date"}
            disabled={!enabled}
            readOnly={readOnly}
            required={required}
            onChange={(event) => commitInput(0, event.currentTarget.value)}
            onFocus={() => {
              if (interactive) {
                setIsOpen(true);
              }
            }}
          />
          {mode === "range" ? (
            <>
              <span className={styles.rangeSeparator}>-</span>
              <input
                className={styles.input}
                value={inputValues[1] ?? ""}
                placeholder={placeholderFor(normalizedFormat)}
                aria-label="End date"
                disabled={!enabled}
                readOnly={readOnly}
                required={required}
                onChange={(event) => commitInput(1, event.currentTarget.value)}
                onFocus={() => {
                  if (interactive) {
                    setIsOpen(true);
                  }
                }}
              />
            </>
          ) : null}
          <div className={styles.trailing}>
            {!verboseValidationFeedback && validationStatus !== "none" ? (
              <span
                data-part-id="conciseValidationFeedback"
                data-xmlui-part="conciseValidationFeedback"
                title={invalidMessages?.join("\n")}
              >
                {validationStatus === "valid" ? validationIconSuccess : validationIconError}
              </span>
            ) : null}
            {clearable ? (
              <button
                type="button"
                className={styles.clear}
                data-part-id="clearButton"
                data-xmlui-part="clearButton"
                aria-label="Clear date"
                disabled={!enabled}
                onClick={clear}
              >
                x
              </button>
            ) : null}
            <Adornment text={endText} icon={endIcon} />
          </div>
        </div>
      ) : null}

      {(inline || isOpen) ? (
        <div className={styles.positioner}>
          <div className={styles.content} data-part-id="calendar" data-xmlui-part="calendar">
            {presetItems.length > 0 ? (
              <div className={styles.quickPresets}>
                {presetItems.map((preset) => (
                  <button
                    key={preset.key}
                    type="button"
                    className={styles.preset}
                    onClick={() => {
                      publish(preset.range, !inline);
                      setVisibleMonth(monthStart(preset.range[0]));
                    }}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            ) : null}
            <div className={styles.calendarArea}>
              {Array.from({ length: visibleMonthCount }, (_, offset) => addMonths(visibleMonth, offset)).map((month, index) => (
                <CalendarMonth
                  key={`${month.year}-${month.month}`}
                  month={month}
                  locale={locale}
                  weekStartsOn={weekStart}
                  showWeekNumbers={showWeekNumber ?? showWeekNumbers ?? false}
                  selected={renderedSelected}
                  minDate={minDate}
                  maxDate={maxDate}
                  disabledDates={disabledDates}
                  dateFormat={normalizedFormat}
                  showNav={index === 0}
                  onPrevious={() => setVisibleMonth(addMonths(visibleMonth, -1))}
                  onNext={() => setVisibleMonth(addMonths(visibleMonth, 1))}
                  onSelect={selectDay}
                />
              ))}
              {confirmRangeSelection && draftRange.length ? (
                <div className={styles.popupFooter}>
                  <button type="button" className={styles.footerButton} onClick={cancelRange}>
                    Cancel
                  </button>
                  <button type="button" className={cx(styles.footerButton, styles.footerButtonPrimary)} onClick={proceedRange}>
                    Proceed
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}));

function CalendarMonth({
  month,
  locale,
  weekStartsOn,
  showWeekNumbers,
  selected,
  minDate,
  maxDate,
  disabledDates,
  dateFormat,
  showNav,
  onPrevious,
  onNext,
  onSelect,
}: {
  month: DateParts;
  locale: string;
  weekStartsOn: number;
  showWeekNumbers: boolean;
  selected: DateParts[];
  minDate?: DateParts;
  maxDate?: DateParts;
  disabledDates?: unknown;
  dateFormat: DateFormat;
  showNav: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onSelect: (day: DateParts) => void;
}) {
  const weeks = useMemo(() => buildWeeks(month, weekStartsOn), [month, weekStartsOn]);
  const weekdays = useMemo(() => weekdayLabels(weekStartsOn, locale), [locale, weekStartsOn]);
  const today = todayParts();
  return (
    <div>
      <div className={styles.viewControl}>
        {showNav ? (
          <button type="button" className={styles.nav} aria-label="Previous month" onClick={onPrevious}>
            {"<"}
          </button>
        ) : <span />}
        <div className={styles.viewTrigger}>{monthLabel(month, locale)}</div>
        {showNav ? (
          <button type="button" className={styles.nav} aria-label="Next month" onClick={onNext}>
            {">"}
          </button>
        ) : <span />}
      </div>
      <table className={styles.table}>
        <thead>
          <tr>
            {showWeekNumbers ? <th className={styles.weekNumber}>#</th> : null}
            {weekdays.map((day) => <th key={day} className={styles.weekday}>{day}</th>)}
          </tr>
        </thead>
        <tbody>
          {weeks.map((week, weekIndex) => (
            <tr key={weekIndex}>
              {showWeekNumbers ? <td className={styles.weekNumber}>{weekNumber(week[0])}</td> : null}
              {week.map((day) => {
                const disabled = day.month !== month.month || isUnavailable(day, minDate, maxDate, disabledDates, dateFormat);
                const selectedIndex = selected.findIndex((item) => isSameDay(item, day));
                const inRange = selected.length > 1 && compareParts(selected[0], day) < 0 && compareParts(day, selected[1]) < 0;
                return (
                  <td key={toIso(day)} className={styles.cell}>
                    <button
                      type="button"
                      className={styles.cellTrigger}
                      disabled={disabled}
                      data-selected={selected.length === 1 && selectedIndex === 0 ? "" : undefined}
                      data-range-start={selected.length > 1 && selectedIndex === 0 ? "" : undefined}
                      data-range-end={selected.length > 1 && selectedIndex === 1 ? "" : undefined}
                      data-in-range={inRange ? "" : undefined}
                      data-today={isSameDay(day, today) ? "" : undefined}
                      onClick={() => onSelect(day)}
                    >
                      {day.day}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

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

function normalizeMode(value: unknown): Mode {
  return String(value ?? "").toLowerCase() === "range" ? "range" : "single";
}

function normalizeDateFormat(format: unknown): DateFormat {
  return dateFormats.includes(format as DateFormat) ? format as DateFormat : defaultProps.dateFormat as DateFormat;
}

function placeholderFor(format: DateFormat) {
  return format.replace(/[A-Za-z]/g, (char) => char.toLowerCase());
}

function widthClass(value: unknown): string | undefined {
  const normalized = String(value ?? "").trim().toLowerCase();
  if (normalized === "100%" || normalized === "*" || normalized === "full") {
    return styles.fullWidth;
  }
  if (normalized === "auto") {
    return styles.autoWidth;
  }
  return undefined;
}

function toDateParts(raw: unknown, mode: Mode, format: DateFormat): DateParts[] {
  if (raw === undefined || raw === null || raw === "") {
    return [];
  }
  if (mode === "range") {
    if (Array.isArray(raw)) {
      return raw.slice(0, 2).map((item) => parseDateValue(item, format)).filter(Boolean) as DateParts[];
    }
    if (typeof raw === "object") {
      const record = raw as Record<string, unknown>;
      return [record.from ?? record.start, record.to ?? record.end]
        .map((item) => parseDateValue(item, format))
        .filter(Boolean) as DateParts[];
    }
  }
  if (Array.isArray(raw)) {
    const first = parseDateValue(raw[0], format);
    return first ? [first] : [];
  }
  const single = parseDateValue(raw, format);
  return single ? [single] : [];
}

function toPayload(values: DateParts[], mode: Mode, format: DateFormat): DatePickerValue {
  if (mode === "range") {
    const from = values[0] ? formatDateParts(values[0], format) : undefined;
    const to = values[1] ? formatDateParts(values[1], format) : undefined;
    return from || to ? { from, to } : undefined;
  }
  return values[0] ? formatDateParts(values[0], format) : undefined;
}

function parseDateValue(raw: unknown, format: DateFormat): DateParts | undefined {
  if (raw instanceof Date) {
    return realDateParts(raw.getFullYear(), raw.getMonth() + 1, raw.getDate());
  }
  if (typeof raw === "object" && raw !== null && "year" in raw && "month" in raw && "day" in raw) {
    const record = raw as Record<string, unknown>;
    return realDateParts(Number(record.year), Number(record.month), Number(record.day));
  }
  if (typeof raw !== "string") {
    return undefined;
  }
  const value = raw.trim();
  if (!value) {
    return undefined;
  }
  const iso = /^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(value);
  if (iso) {
    return realDateParts(Number(iso[1]), Number(iso[2]), Number(iso[3]));
  }
  const split = (separator: string, order: Array<"year" | "month" | "day">) => {
    const pieces = value.split(separator);
    if (pieces.length !== 3) {
      return undefined;
    }
    const parts = { year: 0, month: 0, day: 0 };
    order.forEach((part, index) => {
      parts[part] = Number(pieces[index]);
    });
    return realDateParts(parts.year, parts.month, parts.day);
  };
  switch (format) {
    case "MM/dd/yyyy":
      return split("/", ["month", "day", "year"]);
    case "MM-dd-yyyy":
      return split("-", ["month", "day", "year"]);
    case "yyyy/MM/dd":
      return split("/", ["year", "month", "day"]);
    case "yyyy-MM-dd":
      return split("-", ["year", "month", "day"]);
    case "dd/MM/yyyy":
      return split("/", ["day", "month", "year"]);
    case "dd-MM-yyyy":
      return split("-", ["day", "month", "year"]);
    case "yyyyMMdd":
      return /^\d{8}$/.test(value) ? realDateParts(Number(value.slice(0, 4)), Number(value.slice(4, 6)), Number(value.slice(6, 8))) : undefined;
    case "MMddyyyy":
      return /^\d{8}$/.test(value) ? realDateParts(Number(value.slice(4, 8)), Number(value.slice(0, 2)), Number(value.slice(2, 4))) : undefined;
  }
}

function realDateParts(year: number, month: number, day: number): DateParts | undefined {
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
    return undefined;
  }
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
    ? { year, month, day }
    : undefined;
}

function formatDateParts(parts: DateParts, format: DateFormat): string {
  const yyyy = String(parts.year).padStart(4, "0");
  const MM = String(parts.month).padStart(2, "0");
  const dd = String(parts.day).padStart(2, "0");
  switch (format) {
    case "MM-dd-yyyy":
      return `${MM}-${dd}-${yyyy}`;
    case "yyyy/MM/dd":
      return `${yyyy}/${MM}/${dd}`;
    case "yyyy-MM-dd":
      return `${yyyy}-${MM}-${dd}`;
    case "dd/MM/yyyy":
      return `${dd}/${MM}/${yyyy}`;
    case "dd-MM-yyyy":
      return `${dd}-${MM}-${yyyy}`;
    case "yyyyMMdd":
      return `${yyyy}${MM}${dd}`;
    case "MMddyyyy":
      return `${MM}${dd}${yyyy}`;
    default:
      return `${MM}/${dd}/${yyyy}`;
  }
}

function monthStart(parts: DateParts): DateParts {
  return { year: parts.year, month: parts.month, day: 1 };
}

function todayParts(): DateParts {
  const today = new Date();
  return { year: today.getFullYear(), month: today.getMonth() + 1, day: today.getDate() };
}

function addMonths(parts: DateParts, count: number): DateParts {
  const date = new Date(Date.UTC(parts.year, parts.month - 1 + count, 1));
  return { year: date.getUTCFullYear(), month: date.getUTCMonth() + 1, day: 1 };
}

function buildWeeks(month: DateParts, weekStartsOn: number): DateParts[][] {
  const first = new Date(Date.UTC(month.year, month.month - 1, 1));
  const leading = (first.getUTCDay() - weekStartsOn + 7) % 7;
  const start = new Date(first.getTime() - leading * dayMs);
  return Array.from({ length: 6 }, (_, weekIndex) =>
    Array.from({ length: 7 }, (_, dayIndex) => {
      const date = new Date(start.getTime() + (weekIndex * 7 + dayIndex) * dayMs);
      return { year: date.getUTCFullYear(), month: date.getUTCMonth() + 1, day: date.getUTCDate() };
    }),
  );
}

function weekdayLabels(weekStartsOn: number, locale: string) {
  const base = new Date(Date.UTC(2024, 0, 7 + weekStartsOn));
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(base.getTime() + index * dayMs);
    return new Intl.DateTimeFormat(locale || defaultProps.locale, { weekday: "short", timeZone: "UTC" }).format(date);
  });
}

function monthLabel(parts: DateParts, locale: string) {
  return new Intl.DateTimeFormat(locale || defaultProps.locale, {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(parts.year, parts.month - 1, 1)));
}

function weekNumber(parts: DateParts) {
  const date = new Date(Date.UTC(parts.year, parts.month - 1, parts.day));
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil((((date.getTime() - yearStart.getTime()) / dayMs) + yearStart.getUTCDay() + 1) / 7);
}

function compareParts(left: DateParts, right: DateParts): number {
  return Date.UTC(left.year, left.month - 1, left.day) - Date.UTC(right.year, right.month - 1, right.day);
}

function isSameDay(left: DateParts, right: DateParts): boolean {
  return left.year === right.year && left.month === right.month && left.day === right.day;
}

function toIso(parts: DateParts): string {
  return `${parts.year}-${String(parts.month).padStart(2, "0")}-${String(parts.day).padStart(2, "0")}`;
}

function isUnavailable(parts: DateParts, minDate: DateParts | undefined, maxDate: DateParts | undefined, matcher: unknown, format: DateFormat): boolean {
  if (minDate && compareParts(parts, minDate) < 0) {
    return true;
  }
  if (maxDate && compareParts(parts, maxDate) > 0) {
    return true;
  }
  return matchesDisabledDate(parts, matcher as DisabledMatcher | DisabledMatcher[] | undefined, format);
}

function matchesDisabledDate(parts: DateParts, matcher: DisabledMatcher | DisabledMatcher[] | undefined, format: DateFormat): boolean {
  if (matcher === undefined || matcher === null) {
    return false;
  }
  if (typeof matcher === "boolean") {
    return matcher;
  }
  if (Array.isArray(matcher)) {
    return matcher.some((item) => matchesDisabledDate(parts, item, format));
  }
  if (typeof matcher === "function") {
    return Boolean(matcher(new Date(Date.UTC(parts.year, parts.month - 1, parts.day))));
  }
  if (matcher instanceof Date || typeof matcher === "string") {
    const target = parseDateValue(matcher, format);
    return Boolean(target && isSameDay(parts, target));
  }
  if (typeof matcher === "object") {
    if ("dayOfWeek" in matcher) {
      const days = Array.isArray(matcher.dayOfWeek) ? matcher.dayOfWeek : [matcher.dayOfWeek];
      return days.includes(new Date(Date.UTC(parts.year, parts.month - 1, parts.day)).getUTCDay());
    }
    const from = matcher.from ? parseDateValue(matcher.from, format) : undefined;
    const to = matcher.to ? parseDateValue(matcher.to, format) : undefined;
    const before = matcher.before ? parseDateValue(matcher.before, format) : undefined;
    const after = matcher.after ? parseDateValue(matcher.after, format) : undefined;
    if (from && compareParts(parts, from) < 0) {
      return false;
    }
    if (to && compareParts(parts, to) > 0) {
      return false;
    }
    if (from || to) {
      return true;
    }
    if (before && after) {
      return compareParts(parts, after) > 0 && compareParts(parts, before) < 0;
    }
    if (before) {
      return compareParts(parts, before) < 0;
    }
    if (after) {
      return compareParts(parts, after) > 0;
    }
  }
  return false;
}

function resolvePresets(raw: unknown, showPresets: boolean | undefined, mode: Mode, format: DateFormat) {
  if (mode !== "range" || raw === false || (showPresets !== true && raw === undefined)) {
    return [];
  }
  const today = todayParts();
  const lastDays = (days: number) => ({
    from: addDays(today, -(days - 1)),
    to: today,
  });
  const monthStartToday = { year: today.year, month: today.month, day: 1 };
  const defaultPresets = [
    { key: "last7Days", label: "Last 7 days", range: [lastDays(7).from, lastDays(7).to] },
    { key: "last30Days", label: "Last 30 days", range: [lastDays(30).from, lastDays(30).to] },
    { key: "thisMonth", label: "This month", range: [monthStartToday, today] },
    { key: "lastMonth", label: "Last month", range: [addMonths(monthStartToday, -1), addDays(monthStartToday, -1)] },
  ];
  if (Array.isArray(raw)) {
    const custom = raw.map((item, index) => {
      if (typeof item === "object" && item !== null) {
        const record = item as Record<string, unknown>;
        const from = parseDateValue(record.from, format);
        const to = parseDateValue(record.to, format);
        if (from && to) {
          return { key: String(record.label ?? index), label: String(record.label ?? `${formatDateParts(from, format)} - ${formatDateParts(to, format)}`), range: [from, to] };
        }
      }
      return undefined;
    }).filter(Boolean) as Array<{ key: string; label: string; range: DateParts[] }>;
    return custom.length ? custom : defaultPresets;
  }
  return defaultPresets;
}

function addDays(parts: DateParts, count: number): DateParts {
  const date = new Date(Date.UTC(parts.year, parts.month - 1, parts.day) + count * dayMs);
  return { year: date.getUTCFullYear(), month: date.getUTCMonth() + 1, day: date.getUTCDate() };
}

function clampWeekStart(value: unknown) {
  const numberValue = Number(value);
  return Number.isInteger(numberValue) && numberValue >= 0 && numberValue <= 6 ? numberValue : 0;
}

function cx(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(" ");
}
