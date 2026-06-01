import {
  DatePicker as ArkDatePicker,
  parseDate,
  type DatePickerDateRangePreset,
  type DateValue,
} from "@ark-ui/react/date-picker";
import { Portal } from "@ark-ui/react/portal";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type FocusEvent,
  type ReactNode,
  type RefObject,
} from "react";

import styles from "./DatePickerNew.module.scss";
import { useIsMobile } from "./useIsMobile";

// On mobile the calendar is a fixed full-screen sheet, so it does not need
// Ark's body portal — and portaling it out of the trigger's DOM subtree breaks
// touch scrolling when the picker is opened inside another overlay (e.g. an
// xmlui Drawer, whose react-remove-scroll lock blocks wheel/touch on anything
// rendered outside the drawer). Rendering inline keeps the sheet within the
// drawer's scroll-allowed subtree. Desktop still portals so Ark can anchor the
// popover to the trigger. No ancestor uses transform/filter, so the fixed sheet
// still covers the viewport when rendered inline.
function MaybePortal({ disabled, children }: { disabled: boolean; children: ReactNode }) {
  return disabled ? <>{children}</> : <Portal>{children}</Portal>;
}

type Mode = "single" | "range";
type ValidationStatus = "none" | "error" | "warning" | "valid";
type UpdateStateFn = (componentState: Record<string, unknown>, options?: any) => void;
type RegisterApiFn = (
  apis: Record<string, (...args: unknown[]) => unknown>,
) => void;
type RangePayload = { from?: string; to?: string };
type DatePickerPayload = string | RangePayload | undefined;
type PresetValue = DatePickerDateRangePreset;

type PresetItem = {
  value: PresetValue;
  label: string;
};

type RawPreset =
  | PresetValue
  | string
  | {
      value?: string;
      label?: string;
    };

export type DatePickerProps = {
  id?: string;
  value?: unknown;
  initialValue?: unknown;
  mode?: Mode | string;
  label?: string;
  placeholder?: string;
  dateFormat?: string;
  enabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  autoFocus?: boolean;
  inline?: boolean;
  validationStatus?: ValidationStatus;
  weekStartsOn?: number | string;
  showWeekNumber?: boolean;
  showWeekNumbers?: boolean;
  startDate?: unknown;
  endDate?: unknown;
  startIcon?: string;
  endIcon?: string;
  startText?: string;
  endText?: string;
  width?: string;
  minWidth?: string;
  maxWidth?: string;
  locale?: string;
  timeZone?: string;
  numOfMonths?: number | string;
  presets?: RawPreset[] | string | boolean;
  showPresets?: boolean;
  testId?: string;
  className?: string;
  onDidChange?: (newValue: DatePickerPayload) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  updateState?: UpdateStateFn;
  registerComponentApi?: RegisterApiFn;
};

const DEFAULT_DATE_FORMAT = "MM/dd/yyyy";
const DEFAULT_LOCALE = "en-US";
const DEFAULT_TIME_ZONE = "UTC";

// On mobile the calendar is a scrollable stack of months around the focused
// month, navigated by scrolling instead of prev/next buttons. Presets cover
// longer spans, so a half-year window each way is plenty for manual scrolling.
const MOBILE_MONTHS_BEFORE = 6;
const MOBILE_MONTHS_AFTER = 6;

const PRESET_LABELS: Record<PresetValue, string> = {
  thisWeek: "This week",
  lastWeek: "Last week",
  thisMonth: "This month",
  lastMonth: "Last month",
  thisQuarter: "This quarter",
  lastQuarter: "Last quarter",
  thisYear: "This year",
  lastYear: "Last year",
  last3Days: "Last 3 days",
  last7Days: "Last 7 days",
  last14Days: "Last 14 days",
  last30Days: "Last 30 days",
  last90Days: "Last 90 days",
};

const DEFAULT_PRESETS: PresetItem[] = [
  { value: "last7Days", label: PRESET_LABELS.last7Days },
  { value: "last30Days", label: PRESET_LABELS.last30Days },
  { value: "thisMonth", label: PRESET_LABELS.thisMonth },
  { value: "lastMonth", label: PRESET_LABELS.lastMonth },
];

const PRESET_ALIASES: Record<string, PresetValue> = {
  "this week": "thisWeek",
  thisweek: "thisWeek",
  "last week": "lastWeek",
  lastweek: "lastWeek",
  "this month": "thisMonth",
  thismonth: "thisMonth",
  "last month": "lastMonth",
  lastmonth: "lastMonth",
  "this quarter": "thisQuarter",
  thisquarter: "thisQuarter",
  "last quarter": "lastQuarter",
  lastquarter: "lastQuarter",
  "this year": "thisYear",
  thisyear: "thisYear",
  "last year": "lastYear",
  lastyear: "lastYear",
  "last 3 days": "last3Days",
  last3days: "last3Days",
  "last 7 days": "last7Days",
  last7days: "last7Days",
  "last 14 days": "last14Days",
  last14days: "last14Days",
  "last 30 days": "last30Days",
  last30days: "last30Days",
  "last 90 days": "last90Days",
  last90days: "last90Days",
};

const isDateValue = (value: unknown): value is DateValue => {
  return (
    typeof value === "object" &&
    value !== null &&
    "year" in value &&
    "month" in value &&
    "day" in value
  );
};

const toMode = (mode: unknown): Mode => {
  return String(mode || "single").toLowerCase() === "range" ? "range" : "single";
};

const toBoolean = (value: unknown, fallback = false): boolean => {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") return value.toLowerCase() === "true";
  return fallback;
};

const toNumber = (value: unknown, fallback: number): number => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

const cx = (...classes: Array<string | undefined | false>) => {
  return classes.filter(Boolean).join(" ");
};

const widthClass = (value: unknown): string | undefined => {
  const normalized = String(value ?? "").trim().toLowerCase();
  if (!normalized) return undefined;
  if (normalized === "100%" || normalized === "*" || normalized === "full") {
    return styles.fullWidth;
  }
  if (normalized === "auto") return styles.autoWidth;
  return undefined;
};

const pad = (value: number) => String(value).padStart(2, "0");

const dateValueToIso = (value: DateValue): string => {
  return `${value.year}-${pad(value.month)}-${pad(value.day)}`;
};

const formatDateValue = (value: DateValue, dateFormat: string): string => {
  const yyyy = String(value.year).padStart(4, "0");
  const MM = pad(value.month);
  const dd = pad(value.day);

  switch (dateFormat) {
    case "MM/dd/yyyy":
      return `${MM}/${dd}/${yyyy}`;
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
      return dateValueToIso(value);
  }
};

const toIsoFromDate = (value: Date): string => {
  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`;
};

// Human-friendly label for the mobile sheet header, e.g. "May 25, 2026".
const friendlyDate = (value: DateValue, locale: string): string => {
  try {
    const date = new Date(Date.UTC(value.year, value.month - 1, value.day));
    return new Intl.DateTimeFormat(locale || DEFAULT_LOCALE, {
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    }).format(date);
  } catch {
    return dateValueToIso(value);
  }
};

const monthLabel = (value: DateValue, locale: string): string => {
  try {
    const date = new Date(Date.UTC(value.year, value.month - 1, 1));
    return new Intl.DateTimeFormat(locale || DEFAULT_LOCALE, {
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    }).format(date);
  } catch {
    return `${value.year}-${pad(value.month)}`;
  }
};

// Inclusive day count between two dates (e.g. Mon–Sun = 7).
const daysInclusive = (a: DateValue, b: DateValue): number => {
  const start = Date.UTC(a.year, a.month - 1, a.day);
  const end = Date.UTC(b.year, b.month - 1, b.day);
  return Math.round(Math.abs(end - start) / 86_400_000) + 1;
};

const datePartsFromString = (
  raw: string,
  dateFormat: string,
): { year: number; month: number; day: number } | undefined => {
  const value = raw.trim();
  if (!value) return undefined;

  const iso = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(value);
  if (iso) {
    return {
      year: Number(iso[1]),
      month: Number(iso[2]),
      day: Number(iso[3]),
    };
  }

  const readSplit = (separator: string, order: Array<"year" | "month" | "day">) => {
    const pieces = value.split(separator);
    if (pieces.length !== 3) return undefined;
    const result = { year: 0, month: 0, day: 0 };
    order.forEach((part, index) => {
      result[part] = Number(pieces[index]);
    });
    return result;
  };

  switch (dateFormat) {
    case "MM/dd/yyyy":
      return readSplit("/", ["month", "day", "year"]);
    case "MM-dd-yyyy":
      return readSplit("-", ["month", "day", "year"]);
    case "yyyy/MM/dd":
      return readSplit("/", ["year", "month", "day"]);
    case "yyyy-MM-dd":
      return readSplit("-", ["year", "month", "day"]);
    case "dd/MM/yyyy":
      return readSplit("/", ["day", "month", "year"]);
    case "dd-MM-yyyy":
      return readSplit("-", ["day", "month", "year"]);
    case "yyyyMMdd":
      if (!/^\d{8}$/.test(value)) return undefined;
      return {
        year: Number(value.slice(0, 4)),
        month: Number(value.slice(4, 6)),
        day: Number(value.slice(6, 8)),
      };
    case "MMddyyyy":
      if (!/^\d{8}$/.test(value)) return undefined;
      return {
        month: Number(value.slice(0, 2)),
        day: Number(value.slice(2, 4)),
        year: Number(value.slice(4, 8)),
      };
    default:
      return undefined;
  }
};

const fieldForLetter = (letter: string): "year" | "month" | "day" | "other" => {
  if (letter === "y" || letter === "Y") return "year";
  if (letter === "M") return "month";
  if (letter === "d" || letter === "D") return "day";
  return "other";
};

// Real number of days in a month. The year is used so February respects leap
// years; when the year isn't known yet (formats where the day precedes it) we
// fall back to a leap year so the 29th stays reachable.
const daysInMonth = (year: number | undefined, month: number | undefined): number => {
  if (!month || month < 1 || month > 12) return 31;
  const safeYear = year && year > 0 ? year : 2000;
  return new Date(Date.UTC(safeYear, month, 0)).getUTCDate();
};

type DateSegment = {
  field: "year" | "month" | "day" | "other";
  start: number;
  end: number;
  capacity: number;
};

// Splits the format into its fixed-position segments, e.g. "yyyy-MM-dd" ->
// year[0,4) month[5,7) day[8,10). The masked value uses the same positions.
const buildDateSegments = (dateFormat: string): DateSegment[] => {
  const segments: DateSegment[] = [];
  let i = 0;
  while (i < dateFormat.length) {
    const ch = dateFormat[i];
    if (/[A-Za-z]/.test(ch)) {
      let j = i;
      while (j < dateFormat.length && dateFormat[j] === ch) j += 1;
      segments.push({ field: fieldForLetter(ch), start: i, end: j, capacity: j - i });
      i = j;
    } else {
      i += 1;
    }
  }
  return segments;
};

// Per-segment digit strings read out of a value, e.g. "2026-06-07" ->
// ["2026","06","07"]. Placeholder letters (an in-progress template) count as 0.
const readSegmentDigits = (value: string, segments: DateSegment[]): string[] =>
  segments.map((seg) => value.slice(seg.start, seg.end).replace(/\D/g, ""));

// Renders the editing value: a segment with typed digits shows just those
// digits (no placeholder filler for the part being typed), an untyped segment
// shows its lowercase placeholder letters, and the separators are always there.
// Segments are therefore variable-width, so the [start, end] character range of
// each one in the produced string is returned alongside it.
// e.g. ["2","06",""] -> "2-06-dd".
const buildDisplay = (
  segDigits: string[],
  segments: DateSegment[],
  dateFormat: string,
): { value: string; positions: Array<[number, number]> } => {
  let value = "";
  const positions: Array<[number, number]> = [];
  let cursor = 0;
  segments.forEach((seg, k) => {
    value += dateFormat.slice(cursor, seg.start); // separators / literals before
    const start = value.length;
    const digits = segDigits[k] || "";
    value +=
      digits.length > 0
        ? digits
        : dateFormat.slice(seg.start, seg.end).toLowerCase();
    positions.push([start, value.length]);
    cursor = seg.end;
  });
  value += dateFormat.slice(cursor);
  return { value, positions };
};

// Adds one digit to a single segment's running value, validating as it goes.
// Returns the new digit string + whether the segment is now complete, or null
// when the digit is impossible (month > 12, day past the month's length). A
// leading digit too big to begin a two-digit value is auto-padded ("9" -> "09").
const addDigitToSegment = (
  field: DateSegment["field"],
  capacity: number,
  current: string,
  digit: string,
  year: number | undefined,
  month: number | undefined,
): { digits: string; complete: boolean } | null => {
  if (field === "month") {
    if (current.length === 0) {
      if (Number(digit) > 1) return { digits: `0${digit}`, complete: true };
      return { digits: digit, complete: false };
    }
    const value = Number(current + digit);
    if (value < 1 || value > 12) return null;
    return { digits: current + digit, complete: true };
  }
  if (field === "day") {
    const maxDay = daysInMonth(year, month);
    if (current.length === 0) {
      if (Number(digit) > Math.floor(maxDay / 10)) {
        return { digits: `0${digit}`, complete: true };
      }
      return { digits: digit, complete: false };
    }
    const value = Number(current + digit);
    if (value < 1 || value > maxDay) return null;
    return { digits: current + digit, complete: true };
  }
  const next = current + digit;
  return { digits: next, complete: next.length >= capacity };
};

const parseDateValue = (
  raw: unknown,
  dateFormat: string,
): DateValue | undefined => {
  if (isDateValue(raw)) return raw;
  if (raw instanceof Date) {
    try {
      return parseDate(toIsoFromDate(raw));
    } catch {
      return undefined;
    }
  }
  if (typeof raw !== "string") return undefined;

  const parts = datePartsFromString(raw, dateFormat);
  if (!parts) return undefined;
  if (!parts.year || !parts.month || !parts.day) return undefined;

  try {
    return parseDate(`${parts.year}-${pad(parts.month)}-${pad(parts.day)}`);
  } catch {
    return undefined;
  }
};

const toDateValues = (
  raw: unknown,
  mode: Mode,
  dateFormat: string,
): DateValue[] => {
  if (raw === undefined || raw === null || raw === "") return [];

  if (mode === "range") {
    if (Array.isArray(raw)) {
      return raw
        .slice(0, 2)
        .map((item) => parseDateValue(item, dateFormat))
        .filter((item): item is DateValue => !!item);
    }

    if (typeof raw === "object") {
      const candidate = raw as Record<string, unknown>;
      return [candidate.from ?? candidate.start, candidate.to ?? candidate.end]
        .map((item) => parseDateValue(item, dateFormat))
        .filter((item): item is DateValue => !!item);
    }
  }

  if (Array.isArray(raw)) {
    const first = parseDateValue(raw[0], dateFormat);
    return first ? [first] : [];
  }

  const single = parseDateValue(raw, dateFormat);
  return single ? [single] : [];
};

const toPayload = (
  values: DateValue[],
  mode: Mode,
  dateFormat: string,
): DatePickerPayload => {
  if (mode === "range") {
    const from = values[0] ? formatDateValue(values[0], dateFormat) : undefined;
    const to = values[1] ? formatDateValue(values[1], dateFormat) : undefined;
    if (!from && !to) return undefined;
    return { from, to };
  }

  return values[0] ? formatDateValue(values[0], dateFormat) : undefined;
};

const shouldPublishValue = (
  values: DateValue[],
  mode: Mode,
  initial: boolean | undefined,
): boolean => {
  if (initial || mode !== "range") return true;
  if (values.length === 0) return true;
  return !!values[0] && !!values[1];
};

const resolvePresetValue = (raw: string): PresetValue | undefined => {
  const compact = raw.trim().replace(/[-_]+/g, " ");
  const key = compact.replace(/\s+/g, "").toLowerCase();
  const spacedKey = compact.replace(/\s+/g, " ").toLowerCase();
  if (compact in PRESET_LABELS) return compact as PresetValue;
  return PRESET_ALIASES[spacedKey] ?? PRESET_ALIASES[key];
};

const resolvePresets = (
  rawPresets: DatePickerProps["presets"],
  showPresets: boolean | undefined,
  mode: Mode,
): PresetItem[] => {
  if (mode !== "range") return [];
  if (showPresets === false || rawPresets === false) return [];

  const source =
    rawPresets === undefined || rawPresets === true
      ? DEFAULT_PRESETS
      : Array.isArray(rawPresets)
        ? rawPresets
        : String(rawPresets)
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean);

  const resolved = source
    .map((preset): PresetItem | undefined => {
      if (typeof preset === "object" && "value" in preset) {
        const value = preset.value ? resolvePresetValue(preset.value) : undefined;
        return value ? { value, label: preset.label || PRESET_LABELS[value] } : undefined;
      }
      const value = resolvePresetValue(String(preset));
      return value ? { value, label: PRESET_LABELS[value] } : undefined;
    })
    .filter((item): item is PresetItem => !!item);

  return resolved.length ? resolved : DEFAULT_PRESETS;
};

type DateFieldProps = {
  value: DateValue | undefined;
  dateFormat: string;
  placeholder: string;
  className?: string;
  ariaLabel?: string;
  autoFocus?: boolean;
  readOnly?: boolean;
  fieldRef?: RefObject<HTMLInputElement | null>;
  onCommit: (value: DateValue | null) => void;
};

// A self-owned segmented date input. Ark never controls this element — we only
// push complete, valid dates back into Ark's value via `onCommit`, and mirror
// Ark's value here when not mid-edit. Typing fills the year/month/day part the
// caret is on, that part is highlighted (selected) so it's clear which one
// you're entering, and completing a part auto-advances to the next. Month is
// clamped to 01-12 and day to the real length of the month (see maskToFormat).
function DateField({
  value,
  dateFormat,
  placeholder,
  className,
  ariaLabel,
  autoFocus,
  readOnly,
  fieldRef,
  onCommit,
}: DateFieldProps) {
  const ownRef = useRef<HTMLInputElement>(null);
  const segments = useMemo(() => buildDateSegments(dateFormat), [dateFormat]);
  const editingRef = useRef(false);
  const activeRef = useRef(0);
  const freshRef = useRef(true);
  // Per-segment digits typed so far while editing (the rest render as the
  // placeholder template), and each segment's character range in the current
  // (variable-width) display string.
  const segDigitsRef = useRef<string[]>([]);
  const segPositionsRef = useRef<Array<[number, number]>>([]);

  const display = value ? formatDateValue(value, dateFormat) : "";
  // Refs keep the native handlers fresh without re-attaching every render.
  const displayRef = useRef(display);
  displayRef.current = display;
  const commitRef = useRef(onCommit);
  commitRef.current = onCommit;

  // Mirror the committed value (clean date, no template) whenever we aren't
  // actively editing (calendar selection, clear, or post-blur normalization).
  useEffect(() => {
    const el = fieldRef?.current ?? ownRef.current;
    if (el && !editingRef.current) el.value = display;
  }, [display, fieldRef]);

  // All editing runs through native listeners (React's synthetic onBeforeInput
  // isn't reliable for programmatic input, and this element is ours to drive).
  // The value always carries the full template — typed digits + placeholder
  // letters + separators — so the structure never disappears while typing.
  useEffect(() => {
    const el = fieldRef?.current ?? ownRef.current;
    if (!el || readOnly) return;

    const render = () => {
      const { value, positions } = buildDisplay(
        segDigitsRef.current,
        segments,
        dateFormat,
      );
      el.value = value;
      segPositionsRef.current = positions;
    };
    // Highlight the active segment (its typed digits, or its placeholder when
    // empty), so it's clear which part you're entering and the caret sits on it.
    const select = () => {
      const pos = segPositionsRef.current[activeRef.current];
      if (!pos) return;
      try {
        el.setSelectionRange(pos[0], pos[1]);
      } catch {
        /* setSelectionRange can throw for some input states; ignore */
      }
    };
    const allComplete = () =>
      segments.every(
        (seg, i) => (segDigitsRef.current[i] || "").length === seg.capacity,
      );
    const firstIncomplete = () => {
      const idx = segments.findIndex(
        (seg, i) => (segDigitsRef.current[i] || "").length < seg.capacity,
      );
      return idx < 0 ? 0 : idx;
    };
    // Map a caret position in the (variable-width) display to a segment.
    const segmentAtCaret = (caret: number) => {
      const positions = segPositionsRef.current;
      let best = 0;
      positions.forEach((range, k) => {
        if (caret >= range[0] && caret <= range[1]) best = k;
        else if (range[0] <= caret) best = k;
      });
      return best;
    };
    const knownYearMonth = () => ({
      year:
        (segDigitsRef.current[0] || "").length === 4
          ? Number(segDigitsRef.current[0])
          : undefined,
      month:
        (segDigitsRef.current[1] || "").length === 2
          ? Number(segDigitsRef.current[1])
          : undefined,
    });
    const onBeforeInput = (event: Event) => {
      const e = event as InputEvent;
      e.preventDefault();
      editingRef.current = true;
      const type = e.inputType || "";
      if (type.startsWith("history")) return;

      if (type.startsWith("delete")) {
        const current = segDigitsRef.current[activeRef.current] || "";
        if (current.length > 0) {
          segDigitsRef.current[activeRef.current] = current.slice(0, -1);
        } else if (activeRef.current > 0) {
          activeRef.current -= 1;
          const prev = segDigitsRef.current[activeRef.current] || "";
          segDigitsRef.current[activeRef.current] = prev.slice(0, -1);
        }
        freshRef.current = false;
        render();
        select();
        return;
      }

      const data = (e.data ?? "").replace(/\D/g, "");
      if (!data) {
        select(); // non-digit — blocked, structure stays
        return;
      }
      for (const digit of data) {
        // Re-entering a segment clears just that segment (its placeholders come
        // back); the other segments keep their digits.
        if (freshRef.current) {
          segDigitsRef.current[activeRef.current] = "";
          freshRef.current = false;
        }
        const seg = segments[activeRef.current];
        const { year, month } = knownYearMonth();
        const res = addDigitToSegment(
          seg.field,
          seg.capacity,
          segDigitsRef.current[activeRef.current] || "",
          digit,
          year,
          month,
        );
        if (!res) continue; // impossible value — ignore the keystroke
        segDigitsRef.current[activeRef.current] = res.digits;
        if (res.complete && activeRef.current < segments.length - 1) {
          activeRef.current += 1;
          freshRef.current = true;
        }
      }
      render();
      select();
    };

    const onPointerUp = () => {
      const caret = el.selectionStart ?? 0;
      requestAnimationFrame(() => {
        activeRef.current = segmentAtCaret(caret);
        freshRef.current = true;
        select();
      });
    };

    const onFocus = () => {
      editingRef.current = true;
      // el.value here is the committed (fixed-width) date or empty, so reading
      // by the format's fixed positions is correct.
      segDigitsRef.current = readSegmentDigits(el.value, segments);
      activeRef.current = allComplete() ? 0 : firstIncomplete();
      freshRef.current = true;
      render();
      requestAnimationFrame(() => select());
    };

    const onKeyDown = (event: Event) => {
      const e = event as KeyboardEvent;
      // Enter applies the typed date (commit happens on blur).
      if (e.key === "Enter") {
        e.preventDefault();
        el.blur();
        return;
      }
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      e.preventDefault();
      const delta = e.key === "ArrowLeft" ? -1 : 1;
      activeRef.current = Math.max(
        0,
        Math.min(segments.length - 1, activeRef.current + delta),
      );
      freshRef.current = true;
      select();
    };

    const onBlur = () => {
      editingRef.current = false;
      if (allComplete()) {
        const parsed = parseDateValue(el.value, dateFormat);
        if (parsed) {
          commitRef.current(parsed);
          el.value = formatDateValue(parsed, dateFormat);
          return;
        }
      }
      // Incomplete: drop the template and fall back to the committed value.
      el.value = displayRef.current;
      if (displayRef.current === "") commitRef.current(null);
    };

    el.addEventListener("beforeinput", onBeforeInput);
    el.addEventListener("pointerup", onPointerUp);
    el.addEventListener("focus", onFocus);
    el.addEventListener("keydown", onKeyDown);
    el.addEventListener("blur", onBlur);
    return () => {
      el.removeEventListener("beforeinput", onBeforeInput);
      el.removeEventListener("pointerup", onPointerUp);
      el.removeEventListener("focus", onFocus);
      el.removeEventListener("keydown", onKeyDown);
      el.removeEventListener("blur", onBlur);
    };
  }, [segments, dateFormat, readOnly, fieldRef]);

  return (
    <input
      ref={fieldRef ?? ownRef}
      className={className}
      placeholder={placeholder}
      aria-label={ariaLabel}
      defaultValue={display}
      autoFocus={autoFocus}
      readOnly={readOnly}
      inputMode="numeric"
      autoComplete="off"
      spellCheck={false}
    />
  );
}

export function DatePicker(props: DatePickerProps) {
  const {
    id,
    value: controlledValue,
    initialValue,
    mode: rawMode,
    label,
    placeholder,
    dateFormat = DEFAULT_DATE_FORMAT,
    enabled = true,
    readOnly = false,
    required = false,
    autoFocus = false,
    inline = false,
    validationStatus = "none",
    weekStartsOn,
    showWeekNumber,
    showWeekNumbers,
    startDate,
    endDate,
    startIcon,
    endIcon,
    startText,
    endText,
    width,
    locale = DEFAULT_LOCALE,
    timeZone = DEFAULT_TIME_ZONE,
    numOfMonths,
    presets,
    showPresets,
    testId,
    className,
    onDidChange,
    onFocus,
    onBlur,
    updateState,
    registerComponentApi,
  } = props;

  const mode = toMode(rawMode);
  const isControlled = controlledValue !== undefined;
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);
  const [insideDialog, setInsideDialog] = useState(false);
  const [mobileFocusedValue, setMobileFocusedValue] = useState<DateValue | undefined>();
  const [desktopFocusedValue, setDesktopFocusedValue] = useState<DateValue | undefined>();
  const rootRef = useRef<HTMLDivElement>(null);
  const positionerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  // Captured from Ark's context so a click on the control's non-value area can
  // open the calendar programmatically (desktop).
  const apiRef = useRef<{ setOpen: (open: boolean) => void } | null>(null);
  const dayViewRef = useRef<HTMLDivElement>(null);
  const monthZeroRef = useRef<HTMLDivElement>(null);
  const pendingMobileScrollTopRef = useRef<number | null>(null);
  const focusedWithinRef = useRef(false);

  const [internalValue, setInternalValue] = useState<DateValue[]>(() =>
    toDateValues(controlledValue ?? initialValue, mode, dateFormat),
  );

  const controlledDateValues = useMemo(
    () => toDateValues(controlledValue, mode, dateFormat),
    [controlledValue, dateFormat, mode],
  );

  const values = isControlled ? controlledDateValues : internalValue;
  const latestPayloadRef = useRef<DatePickerPayload>(
    toPayload(values, mode, dateFormat),
  );
  latestPayloadRef.current = toPayload(values, mode, dateFormat);

  const presetItems = useMemo(
    () => resolvePresets(presets, showPresets, mode),
    [mode, presets, showPresets],
  );

  const minDate = useMemo(
    () => parseDateValue(startDate, dateFormat),
    [dateFormat, startDate],
  );
  const maxDate = useMemo(
    () => parseDateValue(endDate, dateFormat),
    [dateFormat, endDate],
  );

  const emitValue = useCallback(
    (next: DateValue[], options?: { initial?: boolean }) => {
      if (!isControlled) setInternalValue(next);
      const payload = toPayload(next, mode, dateFormat);
      latestPayloadRef.current = payload;
      if (!shouldPublishValue(next, mode, options?.initial)) return;
      updateState?.({ value: payload }, options?.initial ? { initial: true } : undefined);
      if (!options?.initial) onDidChange?.(payload);
    },
    [dateFormat, isControlled, mode, onDidChange, updateState],
  );

  const setValue = useCallback(
    (next: unknown) => {
      emitValue(toDateValues(next, mode, dateFormat));
    },
    [dateFormat, emitValue, mode],
  );

  // A single typed field (start/end) committed a value. Merge it into the value
  // array by position and push it back through Ark's state. Range keeps both
  // slots so the other field is preserved.
  const commitField = useCallback(
    (index: number, date: DateValue | null) => {
      if (mode === "range") {
        const slots: (DateValue | undefined)[] = [values[0], values[1]];
        slots[index] = date ?? undefined;
        emitValue(slots as DateValue[]);
      } else {
        emitValue(date ? [date] : []);
      }
    },
    [emitValue, mode, values],
  );

  // Ark's value must be a dense array (no holes); the typed fields read the
  // positional `values` instead.
  const arkValue = useMemo(
    () => values.filter((item): item is DateValue => !!item),
    [values],
  );

  const createFallbackFocusedValue = useCallback(() => {
    try {
      return parseDate(toIsoFromDate(new Date()));
    } catch {
      return undefined;
    }
  }, []);

  const handleOpenChange = useCallback(
    (details: { open: boolean }) => {
      setIsOpen(details.open);
      if (!details.open) {
        setMobileFocusedValue(undefined);
        setDesktopFocusedValue(undefined);
        pendingMobileScrollTopRef.current = null;
        return;
      }
      if (isMobile) {
        setMobileFocusedValue(values[0] ?? createFallbackFocusedValue());
      } else {
        setDesktopFocusedValue(values[0] ?? createFallbackFocusedValue());
      }
    },
    [createFallbackFocusedValue, isMobile, values],
  );

  const rememberMobileScrollTop = useCallback(() => {
    if (!isMobile || !isOpen) return;
    if (pendingMobileScrollTopRef.current != null) return;
    pendingMobileScrollTopRef.current = dayViewRef.current?.scrollTop ?? null;
  }, [isMobile, isOpen]);

  // When the picker lives inside another overlay that locks scroll (an xmlui
  // Drawer / Radix Dialog), Ark's body portal would place the mobile sheet
  // outside that overlay's react-remove-scroll subtree, which blocks touch/wheel
  // scrolling in the calendar. Detect that case so the sheet can render inline
  // (within the scroll-allowed subtree). Top-level pickers keep the body portal
  // because the page may have a transformed ancestor that breaks fixed layout.
  useLayoutEffect(() => {
    if (!isMobile || !isOpen) return;
    setInsideDialog(!!rootRef.current?.closest('[role="dialog"]'));
  }, [isMobile, isOpen]);

  useLayoutEffect(() => {
    if (!isMobile || !isOpen || pendingMobileScrollTopRef.current == null) return;
    const scrollTop = pendingMobileScrollTopRef.current;
    pendingMobileScrollTopRef.current = null;
    const restore = () => {
      if (dayViewRef.current) {
        dayViewRef.current.scrollTop = scrollTop;
      }
    };
    restore();
    let secondFrame = 0;
    const firstFrame = requestAnimationFrame(() => {
      restore();
      secondFrame = requestAnimationFrame(restore);
    });
    const timeouts = [80, 180, 320].map((delay) =>
      window.setTimeout(restore, delay),
    );
    return () => {
      cancelAnimationFrame(firstFrame);
      cancelAnimationFrame(secondFrame);
      timeouts.forEach((timeout) => window.clearTimeout(timeout));
    };
  }, [isMobile, isOpen, values]);

  useEffect(() => {
    updateState?.({ value: latestPayloadRef.current }, { initial: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    registerComponentApi?.({
      focus: () => {
        inputRef.current?.focus();
      },
      setValue,
      getValue: () => latestPayloadRef.current,
    });
  }, [registerComponentApi, setValue]);

  const handleFocusCapture = useCallback(() => {
    if (focusedWithinRef.current) return;
    focusedWithinRef.current = true;
    onFocus?.();
  }, [onFocus]);

  const handleBlurCapture = useCallback(
    (event: FocusEvent<HTMLDivElement>) => {
      const next = event.relatedTarget as Node | null;
      if (next && rootRef.current?.contains(next)) return;
      if (next && positionerRef.current?.contains(next)) return;
      focusedWithinRef.current = false;
      onBlur?.();
    },
    [onBlur],
  );


  const hasAdornment = !!startText || !!endText || !!startIcon || !!endIcon;
  const visibleMonthCount = toNumber(numOfMonths, mode === "range" ? 2 : 1);

  // Day-view month offsets: a single side-by-side desktop row, or a vertical
  // scrollable window centered on the focused month on mobile.
  const dayMonthOffsets = isMobile
    ? Array.from(
        { length: MOBILE_MONTHS_BEFORE + MOBILE_MONTHS_AFTER + 1 },
        (_, i) => i - MOBILE_MONTHS_BEFORE,
      )
    : Array.from({ length: visibleMonthCount }, (_, i) => i);

  // When the mobile sheet opens, bring the focused month to the top of the
  // scroll area so past months are reachable by scrolling up.
  useEffect(() => {
    if (!isMobile || !isOpen) return;
    const frame = requestAnimationFrame(() => {
      monthZeroRef.current?.scrollIntoView({ block: "start" });
    });
    return () => cancelAnimationFrame(frame);
  }, [isMobile, isOpen]);

  // Lock background page scroll while the mobile sheet is open so the page
  // behind the backdrop doesn't move under the user's finger.
  useEffect(() => {
    if (!isMobile || !isOpen || typeof document === "undefined") return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [isMobile, isOpen]);

  // Mobile drawer header: live title, selection summary, and day count.
  const sheetTitle = mode === "range" ? "Select date range" : "Select date";
  const sheetSummaryEmpty = !values[0];
  const sheetSummary = (() => {
    if (mode === "range") {
      const from = values[0] ? friendlyDate(values[0], locale) : undefined;
      const to = values[1] ? friendlyDate(values[1], locale) : undefined;
      if (from && to) return `${from} – ${to}`;
      if (from) return `${from} – …`;
      return placeholder || "Select dates";
    }
    return values[0] ? friendlyDate(values[0], locale) : placeholder || "Select a date";
  })();
  const rangeDays =
    mode === "range" && values[0] && values[1]
      ? daysInclusive(values[0], values[1])
      : undefined;

  return (
    <ArkDatePicker.Root
      id={id}
      value={arkValue}
      focusedValue={isMobile && isOpen ? mobileFocusedValue : undefined}
      onValueChange={(details) => {
        rememberMobileScrollTop();
        emitValue(details.value);
      }}
      onOpenChange={handleOpenChange}
      selectionMode={mode}
      disabled={!enabled}
      readOnly={readOnly}
      required={required}
      invalid={validationStatus === "error"}
      inline={inline}
      locale={locale}
      timeZone={timeZone}
      startOfWeek={toNumber(weekStartsOn, 0)}
      showWeekNumbers={showWeekNumber ?? showWeekNumbers ?? false}
      min={minDate}
      max={maxDate}
      numOfMonths={isMobile ? 1 : visibleMonthCount}
      openOnClick={false}
      closeOnSelect={mode !== "range"}
      placeholder={placeholder}
      format={(date) => formatDateValue(date, dateFormat)}
      parse={(value) => parseDateValue(value, dateFormat)}
      positioning={{ placement: "bottom-start", sameWidth: false }}
    >
      <div
        ref={rootRef}
        className={cx(styles.root, widthClass(width), className)}
        data-mode={mode}
        data-validation-status={validationStatus}
        data-inline={inline ? "" : undefined}
        data-mobile={isMobile ? "" : undefined}
        data-open={isOpen ? "" : undefined}
        data-testid={testId}
        onFocusCapture={handleFocusCapture}
        onBlurCapture={handleBlurCapture}
      >
        {label && (
          <ArkDatePicker.Label className={styles.label}>
            {label}
          </ArkDatePicker.Label>
        )}

        <div className={styles.pickerRow}>
          {/* Capture Ark's api so a click on the control's non-value area can
              open the calendar (desktop). */}
          <ArkDatePicker.Context>
            {(api) => {
              apiRef.current = api;
              return null;
            }}
          </ArkDatePicker.Context>
          <ArkDatePicker.Control
            className={styles.control}
            data-has-adornment={hasAdornment ? "" : undefined}
            onClick={(event) => {
              // Mobile: tapping anywhere in the field opens the sheet (the
              // inputs are read-only there). Desktop: clicking the value is for
              // typing and the calendar/clear buttons handle their own clicks;
              // a click anywhere else in the control opens the calendar.
              if (isMobile) {
                apiRef.current?.setOpen(true);
                return;
              }
              const target = event.target as HTMLElement;
              if (target.closest("input") || target.closest("button")) return;
              apiRef.current?.setOpen(true);
            }}
          >
            {!endIcon && (
              <ArkDatePicker.Trigger
                className={styles.adornmentTrigger}
                aria-label="Open calendar"
              >
                <CalendarGlyph />
                {startText}
              </ArkDatePicker.Trigger>
            )}
            {endIcon && startText && (
              <span className={styles.adornment}>{startText}</span>
            )}

            <DateField
              fieldRef={inputRef}
              value={values[0]}
              dateFormat={dateFormat}
              placeholder={dateFormat.replace(/[A-Za-z]/g, (ch) => ch.toLowerCase())}
              className={styles.input}
              ariaLabel={label || "Date"}
              autoFocus={autoFocus}
              readOnly={isMobile || readOnly}
              onCommit={(date) => commitField(0, date)}
            />

            {mode === "range" && (
              <>
                <span className={styles.rangeSeparator}>-</span>
                <DateField
                  value={values[1]}
                  dateFormat={dateFormat}
                  placeholder={dateFormat.replace(/[A-Za-z]/g, (ch) => ch.toLowerCase())}
                  className={styles.input}
                  ariaLabel="End date"
                  readOnly={isMobile || readOnly}
                  onCommit={(date) => commitField(1, date)}
                />
              </>
            )}

            {endText && !endIcon && (
              <span className={styles.adornment}>{endText}</span>
            )}

            {!isMobile && (
              <ArkDatePicker.ClearTrigger
                className={styles.clear}
                aria-label="Clear date"
              >
                <CloseGlyph />
              </ArkDatePicker.ClearTrigger>
            )}
            {endIcon && (
              <ArkDatePicker.Trigger
                className={styles.trigger}
                aria-label="Open calendar"
              >
                <CalendarGlyph />
                {endText}
              </ArkDatePicker.Trigger>
            )}
          </ArkDatePicker.Control>
        </div>

        <MaybePortal disabled={isMobile && insideDialog}>
          <ArkDatePicker.Positioner
            ref={positionerRef}
            className={styles.positioner}
          >
            <ArkDatePicker.Content
              className={styles.content}
              data-testid={isMobile ? "datepicker-sheet" : undefined}
            >
              {isMobile && (
                <div className={styles.sheetHeader}>
                  <div className={styles.sheetHeaderText}>
                    <span className={styles.sheetTitle}>{sheetTitle}</span>
                    <span
                      className={styles.sheetSummary}
                      data-testid="datepicker-summary"
                      data-empty={sheetSummaryEmpty ? "" : undefined}
                    >
                      {sheetSummary}
                    </span>
                    {mode === "range" && (
                      <span
                        className={styles.sheetCount}
                        data-empty={rangeDays == null ? "" : undefined}
                      >
                        {rangeDays != null
                          ? `${rangeDays} ${rangeDays === 1 ? "day" : "days"}`
                          : "\u00a0"}
                      </span>
                    )}
                  </div>
                  <ArkDatePicker.Context>
                    {(api) => (
                      <button
                        type="button"
                        className={styles.sheetClose}
                        aria-label="close"
                        onClick={() => api.setOpen(false)}
                      >
                        <CloseGlyph />
                      </button>
                    )}
                  </ArkDatePicker.Context>
                </div>
              )}

              {presetItems.length > 0 && (
                <div className={styles.quickPresets}>
                  {presetItems.map((preset) => (
                    <ArkDatePicker.PresetTrigger
                      key={preset.value}
                      value={preset.value}
                      className={styles.preset}
                    >
                      {preset.label}
                    </ArkDatePicker.PresetTrigger>
                  ))}
                </div>
              )}

              <ArkDatePicker.View
                ref={dayViewRef}
                view="day"
                className={styles.view}
                onPointerDownCapture={rememberMobileScrollTop}
                onTouchStartCapture={rememberMobileScrollTop}
              >
                <ArkDatePicker.Context>
                  {(api) => (
                    <div className={styles.calendarMonths}>
                      {dayMonthOffsets.map((offset, monthIndex) => {
                        const anchoredMonthStart =
                          isMobile && mobileFocusedValue
                            ? mobileFocusedValue.set({ day: 1 }).add({ months: offset })
                            : !isMobile && desktopFocusedValue
                              ? desktopFocusedValue.set({ day: 1 }).add({ months: offset })
                              : undefined;
                        const shiftDesktopMonth = (months: number) => {
                          if (isMobile) return;
                          const base = desktopFocusedValue ?? api.visibleRange.start;
                          const next = base.set({ day: 1 }).add({ months });
                          setDesktopFocusedValue(next);
                          api.setFocusedValue(next);
                        };
                        const month = anchoredMonthStart
                          ? {
                              weeks: api.getMonthWeeks(anchoredMonthStart),
                              visibleRange: {
                                start: anchoredMonthStart,
                                end: anchoredMonthStart
                                  .add({ months: 1 })
                                  .subtract({ days: 1 }),
                              },
                              visibleRangeText: {
                                start: monthLabel(anchoredMonthStart, locale),
                                end: monthLabel(anchoredMonthStart, locale),
                              },
                            }
                          : offset === 0
                            ? {
                                weeks: api.weeks,
                                visibleRange: api.visibleRange,
                                visibleRangeText: api.visibleRangeText,
                              }
                            : api.getOffset({ months: offset });
                        const monthKey = anchoredMonthStart
                          ? `${anchoredMonthStart.year}-${anchoredMonthStart.month}`
                          : offset;

                        return (
                          <div
                            className={styles.calendarMonth}
                            key={monthKey}
                            ref={offset === 0 ? monthZeroRef : undefined}
                          >
                            <ArkDatePicker.ViewControl className={styles.viewControl}>
                              {!isMobile &&
                                (monthIndex === 0 ? (
                                  <button
                                    type="button"
                                    className={styles.nav}
                                    aria-label="Previous month"
                                    onClick={() => shiftDesktopMonth(-1)}
                                  >
                                    <ChevronLeftGlyph />
                                  </button>
                                ) : (
                                  <span className={styles.navSpacer} />
                                ))}
                              <ArkDatePicker.ViewTrigger className={styles.viewTrigger}>
                                {month.visibleRangeText.start}
                              </ArkDatePicker.ViewTrigger>
                              {!isMobile &&
                                (monthIndex === dayMonthOffsets.length - 1 ? (
                                  <button
                                    type="button"
                                    className={styles.nav}
                                    aria-label="Next month"
                                    onClick={() => shiftDesktopMonth(1)}
                                  >
                                    <ChevronRightGlyph />
                                  </button>
                                ) : (
                                  <span className={styles.navSpacer} />
                                ))}
                            </ArkDatePicker.ViewControl>

                            <ArkDatePicker.Table
                              className={styles.table}
                              id={`month-${monthIndex}`}
                            >
                              <ArkDatePicker.TableHead>
                                <ArkDatePicker.TableRow>
                                  {api.showWeekNumbers && (
                                    <ArkDatePicker.WeekNumberHeaderCell
                                      className={cx(styles.weekday, styles.weekNumber)}
                                    />
                                  )}
                                  {api.weekDays.map((day) => (
                                    <ArkDatePicker.TableHeader
                                      key={day.value.toString()}
                                      className={styles.weekday}
                                    >
                                      {day.short}
                                    </ArkDatePicker.TableHeader>
                                  ))}
                                </ArkDatePicker.TableRow>
                              </ArkDatePicker.TableHead>
                              <ArkDatePicker.TableBody>
                                {month.weeks.map((week, weekIndex) => (
                                  <ArkDatePicker.TableRow key={weekIndex}>
                                    {api.showWeekNumbers && (
                                      <ArkDatePicker.WeekNumberCell
                                        week={week}
                                        weekIndex={weekIndex}
                                        className={styles.weekNumber}
                                      >
                                        {api.getWeekNumber(week)}
                                      </ArkDatePicker.WeekNumberCell>
                                    )}
                                    {week.map((day) => (
                                      <ArkDatePicker.TableCell
                                        key={day.toString()}
                                        value={day}
                                        visibleRange={month.visibleRange}
                                        className={styles.cell}
                                      >
                                        <ArkDatePicker.TableCellTrigger
                                          className={styles.cellTrigger}
                                        >
                                          {day.day}
                                        </ArkDatePicker.TableCellTrigger>
                                      </ArkDatePicker.TableCell>
                                    ))}
                                  </ArkDatePicker.TableRow>
                                ))}
                              </ArkDatePicker.TableBody>
                            </ArkDatePicker.Table>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </ArkDatePicker.Context>
              </ArkDatePicker.View>

              <ArkDatePicker.View view="month" className={styles.view}>
                <ArkDatePicker.ViewControl className={styles.viewControl}>
                  <ArkDatePicker.PrevTrigger className={styles.nav}>
                    <ChevronLeftGlyph />
                  </ArkDatePicker.PrevTrigger>
                  <ArkDatePicker.ViewTrigger className={styles.viewTrigger}>
                    <ArkDatePicker.RangeText />
                  </ArkDatePicker.ViewTrigger>
                  <ArkDatePicker.NextTrigger className={styles.nav}>
                    <ChevronRightGlyph />
                  </ArkDatePicker.NextTrigger>
                </ArkDatePicker.ViewControl>

                <ArkDatePicker.Context>
                  {(api) => (
                    <ArkDatePicker.Table columns={4} className={styles.table}>
                      <ArkDatePicker.TableBody>
                        {api.getMonthsGrid({ columns: 4, format: "short" }).map((months, rowIndex) => (
                          <ArkDatePicker.TableRow key={rowIndex}>
                            {months.map((month) => (
                              <ArkDatePicker.TableCell
                                key={month.value}
                                value={month.value}
                                className={styles.cell}
                              >
                                <ArkDatePicker.TableCellTrigger className={styles.cellTrigger}>
                                  {month.label}
                                </ArkDatePicker.TableCellTrigger>
                              </ArkDatePicker.TableCell>
                            ))}
                          </ArkDatePicker.TableRow>
                        ))}
                      </ArkDatePicker.TableBody>
                    </ArkDatePicker.Table>
                  )}
                </ArkDatePicker.Context>
              </ArkDatePicker.View>

              <ArkDatePicker.View view="year" className={styles.view}>
                <ArkDatePicker.ViewControl className={styles.viewControl}>
                  <ArkDatePicker.PrevTrigger className={styles.nav}>
                    <ChevronLeftGlyph />
                  </ArkDatePicker.PrevTrigger>
                  <ArkDatePicker.ViewTrigger className={styles.viewTrigger}>
                    <ArkDatePicker.RangeText />
                  </ArkDatePicker.ViewTrigger>
                  <ArkDatePicker.NextTrigger className={styles.nav}>
                    <ChevronRightGlyph />
                  </ArkDatePicker.NextTrigger>
                </ArkDatePicker.ViewControl>

                <ArkDatePicker.Context>
                  {(api) => (
                    <ArkDatePicker.Table columns={4} className={styles.table}>
                      <ArkDatePicker.TableBody>
                        {api.getYearsGrid({ columns: 4 }).map((years, rowIndex) => (
                          <ArkDatePicker.TableRow key={rowIndex}>
                            {years.map((year) => (
                              <ArkDatePicker.TableCell
                                key={year.value}
                                value={year.value}
                                className={styles.cell}
                              >
                                <ArkDatePicker.TableCellTrigger className={styles.cellTrigger}>
                                  {year.label}
                                </ArkDatePicker.TableCellTrigger>
                              </ArkDatePicker.TableCell>
                            ))}
                          </ArkDatePicker.TableRow>
                        ))}
                      </ArkDatePicker.TableBody>
                    </ArkDatePicker.Table>
                  )}
                </ArkDatePicker.Context>
              </ArkDatePicker.View>

              {isMobile && (
                <ArkDatePicker.Context>
                  {(api) => (
                    <div className={styles.sheetFooter}>
                      <button
                        type="button"
                        className={styles.sheetClear}
                        onClick={() => api.clearValue()}
                      >
                        Clear
                      </button>
                      <button
                        type="button"
                        className={styles.sheetApply}
                        onClick={() => api.setOpen(false)}
                      >
                        Apply
                      </button>
                    </div>
                  )}
                </ArkDatePicker.Context>
              )}
            </ArkDatePicker.Content>
          </ArkDatePicker.Positioner>
        </MaybePortal>
      </div>
    </ArkDatePicker.Root>
  );
}

function CalendarGlyph() {
  return (
    <svg
      className={styles.icon}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  );
}

function CloseGlyph() {
  return (
    <svg
      className={styles.icon}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

function ChevronLeftGlyph() {
  return (
    <svg
      className={styles.icon}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function ChevronRightGlyph() {
  return (
    <svg
      className={styles.icon}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

export default DatePicker;
