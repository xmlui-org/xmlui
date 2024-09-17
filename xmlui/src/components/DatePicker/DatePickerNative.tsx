import type { CSSProperties } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { DateRange } from "react-day-picker";
import { DayPicker } from "react-day-picker";
import { format, parse, isValid, parseISO } from "date-fns";
import * as ReactDropdownMenu from "@radix-ui/react-dropdown-menu";

import type { RegisterComponentApiFn, UpdateStateFn } from "@abstractions/RendererDefs";
import type { ValidationStatus } from "@components/abstractions";
import { useTheme } from "@components-core/theming/ThemeContext";
import { noop } from "@components-core/constants";
import classnames from "@components-core/utils/classnames";
import styles from "./DatePicker.module.scss";

type Props = {
  id?: string;
  initialValue?: string | { from: string; to: string };
  value?: string | { from: string; to: string };
  mode?: "single" | "range";
  enabled?: boolean;
  placeholder?: string;
  updateState?: UpdateStateFn;
  layout?: CSSProperties;
  onDidChange?: (newValue: string | { from: string; to: string }) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  validationStatus?: ValidationStatus;
  registerComponentApi?: RegisterComponentApiFn;
  dateFormat?: string;
  showWeekNumber?: boolean;
  weekStartsOn?: WeekDays;
  fromDate?: string;
  toDate?: string;
  disabledDates?: string[];
};

const enum WeekDays {
  Sunday = 0,
  Monday = 1,
  Tuesday = 2,
  Wednesday = 3,
  Thursday = 4,
  Friday = 5,
  Saturday = 6,
}

const dateFormats = [
  "MM/dd/yyyy",
  "MM-dd-yyyy",
  "yyyy/MM/dd",
  "yyyy-MM-dd",
  "dd/MM/yyyy",
  "dd-MM-yyyy",
  "yyyyMMdd",
  "MMddyyyy",
];

const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/;

const parseISODate = (dateString?: string) => {
  if (dateString && isoRegex.test(dateString)) {
    const parsedDate = parseISO(dateString);
    if (isValid(parsedDate)) {
      return parsedDate;
    }
  }
  return undefined;
};

const parseDate = (dateString?: string) => {
  if (dateString) {
    for (const format of dateFormats) {
      const parsedDate = parse(dateString, format, new Date());
      if (isValid(parsedDate)) {
        return parsedDate;
      }
    }
  }
  return undefined;
};

export const DatePicker = ({
  id,
  initialValue,
  value,
  mode = "single",
  enabled = true,
  placeholder,
  updateState = noop,
  validationStatus = "none",
  onDidChange = noop,
  onFocus = noop,
  onBlur = noop,
  dateFormat = "MM/dd/yyyy", // Default dateFormat
  showWeekNumber = false,
  weekStartsOn = WeekDays.Sunday,
  fromDate,
  toDate,
  disabledDates = [],
}: Props) => {
  const _weekStartsOn = weekStartsOn >= 0 && weekStartsOn <= 6 ? weekStartsOn : WeekDays.Sunday;
  const [isButtonFocused, setIsButtonFocused] = useState(false);
  const [isMenuFocused, setIsMenuFocused] = useState(false);

  const selected: any = useMemo(() => {
    if (mode === "single" && typeof value === "string") {
      return parseISODate(value) || parseDate(value);
    } else if (mode === "range" && typeof value === "object") {
      return {
        from: parseISODate(value?.from) || parseDate(value?.from),
        to: parseISODate(value?.to) || parseDate(value?.to),
      };
    }
    return undefined;
  }, [value, mode]);

  useEffect(() => {
    if (!dateFormats.includes(dateFormat)) {
      throw new Error(
        `Invalid dateFormat: ${dateFormat}. Supported formats are: ${dateFormats.join(", ")}`,
      );
    }
  }, [dateFormat]);

  const startDate = useMemo(() => {
    return fromDate ? parse(fromDate, dateFormat, new Date()) : undefined;
  }, [fromDate, dateFormat]);

  const endDate = useMemo(() => {
    return toDate ? parse(toDate, dateFormat, new Date()) : undefined;
  }, [toDate, dateFormat]);

  const disabled = useMemo(() => {
    return disabledDates?.map((date) => parse(date, dateFormat, new Date()));
  }, [disabledDates, dateFormat]);

  const [open, setOpen] = useState(false);
  const { root } = useTheme();

  const handleOnButtonFocus = () => {
    setIsButtonFocused(true);
  };

  const handleOnButtonBlur = () => {
    setIsButtonFocused(false);
  };

  const handleOnMenuFocus = () => {
    setIsMenuFocused(true);
  };

  const handleOnMenuBlur = () => {
    setIsMenuFocused(false);
  };

  useEffect(() => {
    if (!isButtonFocused && !isMenuFocused) {
      onBlur?.();
    }
    if (isButtonFocused || isMenuFocused) {
      onFocus?.();
    }
  }, [isButtonFocused, isMenuFocused, onFocus, onBlur]);

  useEffect(() => {
    updateState({ value: initialValue });
  }, [initialValue, updateState]);

  const handleSelect = useCallback(
    (dateOrRange?: Date | DateRange) => {
      if (!dateOrRange) {
        updateState({ value: undefined });
        onDidChange("");
      } else if (mode === "single") {
        const date = dateOrRange as Date;
        const formattedDate = format(date, dateFormat);
        updateState({ value: formattedDate });
        onDidChange(formattedDate);
      } else {
        const range = dateOrRange as DateRange;
        const formattedRange = {
          from: range.from ? format(range.from, dateFormat) : "",
          to: range.to ? format(range.to, dateFormat) : "",
        };
        updateState({ value: formattedRange });
        onDidChange(formattedRange);
      }
      if (mode === "single") {
        setOpen(false);
      }
    },
    [onDidChange, updateState, mode, dateFormat],
  );

  return (
    <ReactDropdownMenu.Root open={open} onOpenChange={setOpen} modal={false}>
      <ReactDropdownMenu.Trigger asChild>
        <button
          disabled={!enabled}
          id={id}
          className={classnames(styles.datePicker, {
            [styles.disabled]: !enabled,
            [styles.error]: validationStatus === "error",
            [styles.warning]: validationStatus === "warning",
            [styles.valid]: validationStatus === "valid",
          })}
          onFocus={handleOnButtonFocus}
          onBlur={handleOnButtonBlur}
        >
          {mode === "single" && selected ? (
            <>{format(selected, dateFormat)}</>
          ) : mode === "range" && typeof selected === "object" && selected.from ? (
            selected.to ? (
              <>
                {format(selected.from, dateFormat)} - {format(selected.to, dateFormat)}
              </>
            ) : (
              <>{format(selected.from, dateFormat)}</>
            )
          ) : placeholder ? (
            <span className={styles.placeholder}>{placeholder}</span>
          ) : (
            <span>&nbsp;</span>
          )}
        </button>
      </ReactDropdownMenu.Trigger>
      <ReactDropdownMenu.Portal container={root}>
        <ReactDropdownMenu.Content
          align={"start"}
          className={styles.datePickerMenu}
          onFocus={handleOnMenuFocus}
          onBlur={handleOnMenuBlur}
          onInteractOutside={handleOnMenuBlur}
        >
          <DayPicker
            fixedWeeks
            fromDate={startDate}
            toDate={endDate}
            disabled={disabled}
            weekStartsOn={_weekStartsOn}
            showWeekNumber={showWeekNumber}
            showOutsideDays
            classNames={styles}
            mode={mode === "single" ? "single" : "range"}
            selected={selected}
            onSelect={handleSelect}
            initialFocus
            numberOfMonths={mode === "range" ? 2 : 1}
          />
        </ReactDropdownMenu.Content>
      </ReactDropdownMenu.Portal>
    </ReactDropdownMenu.Root>
  );
};
