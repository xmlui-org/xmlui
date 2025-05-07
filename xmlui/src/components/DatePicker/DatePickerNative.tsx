import { type CSSProperties } from "react";
import { forwardRef, useRef, useCallback, useEffect, useMemo, useState } from "react";
import type { DateRange } from "react-day-picker";
import { DayPicker } from "react-day-picker";
import { format, parse, isValid, parseISO } from "date-fns";
import * as ReactDropdownMenu from "@radix-ui/react-dropdown-menu";
import { composeRefs } from "@radix-ui/react-compose-refs";
import classnames from "classnames";
import styles from "./DatePicker.module.scss";

import type { RegisterComponentApiFn, UpdateStateFn } from "../../abstractions/RendererDefs";
import { useTheme } from "../../components-core/theming/ThemeContext";
import { noop } from "../../components-core/constants";
import { useEvent } from "../../components-core/utils/misc";
import type { ValidationStatus } from "../abstractions";
import { Adornment } from "../Input/InputAdornment";
import "react-day-picker/dist/style.css";

export const DatePickerModeValues = ["single", "range"] as const;
type DatePickerMode = (typeof DatePickerModeValues)[number];

type Props = {
  id?: string;
  initialValue?: string | { from: string; to: string };
  value?: string | { from: string; to: string };
  mode?: DatePickerMode;
  enabled?: boolean;
  placeholder?: string;
  updateState?: UpdateStateFn;
  style?: CSSProperties;
  onDidChange?: (newValue: string | { from: string; to: string }) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  validationStatus?: ValidationStatus;
  registerComponentApi?: RegisterComponentApiFn;
  dateFormat?: DateFormat;
  showWeekNumber?: boolean;
  weekStartsOn?: WeekDays;
  fromDate?: string;
  toDate?: string;
  disabledDates?: string[];
  inline?: boolean;
  startText?: string;
  startIcon?: string;
  endText?: string;
  endIcon?: string;
};

export const enum WeekDays {
  Sunday = 0,
  Monday = 1,
  Tuesday = 2,
  Wednesday = 3,
  Thursday = 4,
  Friday = 5,
  Saturday = 6,
}

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
type DateFormat = (typeof dateFormats)[number];

export const defaultProps: Pick<
  Props,
  | "mode"
  | "validationStatus"
  | "enabled"
  | "inline"
  | "dateFormat"
  | "showWeekNumber"
  | "weekStartsOn"
  | "disabledDates"
> = {
  mode: "single",
  validationStatus: "none",
  enabled: true,
  inline: false,
  dateFormat: "MM/dd/yyyy",
  showWeekNumber: false,
  weekStartsOn: WeekDays.Sunday,
  disabledDates: [],
};

export const DatePicker = forwardRef(function DatePicker(
  {
    id,
    initialValue,
    value,
    mode = defaultProps.mode,
    enabled = defaultProps.enabled,
    placeholder,
    updateState = noop,
    validationStatus = defaultProps.validationStatus,
    onDidChange = noop,
    onFocus = noop,
    onBlur = noop,
    dateFormat = defaultProps.dateFormat,
    showWeekNumber = defaultProps.showWeekNumber,
    weekStartsOn = defaultProps.weekStartsOn,
    fromDate,
    toDate,
    disabledDates = defaultProps.disabledDates,
    style,
    registerComponentApi,
    inline = defaultProps.inline,
    startText,
    startIcon,
    endText,
    endIcon,
  }: Props,
  forwardedRef: React.Ref<HTMLButtonElement>,
) {
  const _weekStartsOn = weekStartsOn >= 0 && weekStartsOn <= 6 ? weekStartsOn : WeekDays.Sunday;
  const [isButtonFocused, setIsButtonFocused] = useState(false);
  const [isMenuFocused, setIsMenuFocused] = useState(false);
  const referenceElement = useRef<HTMLButtonElement>(null);
  const ref = forwardedRef ? composeRefs(referenceElement, forwardedRef) : referenceElement;

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

  // Register component API for external interactions
  const focus = useCallback(() => {
    referenceElement?.current?.focus();
  }, [referenceElement?.current]);

  const setValue = useEvent((newValue: string) => {
    const parsedDate = parseDate(newValue);
    handleSelect(parsedDate);
  });

  useEffect(() => {
    registerComponentApi?.({
      focus,
      setValue,
    });
  }, [focus, registerComponentApi, setValue]);

  useEffect(() => {
    if (!isButtonFocused && !isMenuFocused) {
      onBlur?.();
    }
    if (isButtonFocused || isMenuFocused) {
      onFocus?.();
    }
  }, [isButtonFocused, isMenuFocused, onFocus, onBlur]);

  useEffect(() => {
    updateState({ value: initialValue }, { initial: true });
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

  return inline ? (
    <div>
      <div className={styles.inlinePickerMenu}>
        <DayPicker
          required={undefined}
          captionLayout="dropdown"
          fixedWeeks
          startMonth={startDate}
          endMonth={endDate}
          disabled={disabled}
          weekStartsOn={_weekStartsOn}
          showWeekNumber={showWeekNumber}
          showOutsideDays
          classNames={styles}
          mode={mode === "single" ? "single" : "range"}
          selected={selected}
          onSelect={handleSelect}
          autoFocus={!inline}
          numberOfMonths={mode === "range" ? 2 : 1}
        />
      </div>
    </div>
  ) : (
    <ReactDropdownMenu.Root open={open} onOpenChange={setOpen} modal={false}>
      <ReactDropdownMenu.Trigger asChild>
        <button
          disabled={!enabled}
          id={id}
          ref={ref}
          style={style}
          className={classnames(styles.datePicker, {
            [styles.disabled]: !enabled,
            [styles.error]: validationStatus === "error",
            [styles.warning]: validationStatus === "warning",
            [styles.valid]: validationStatus === "valid",
          })}
          onFocus={handleOnButtonFocus}
          onBlur={handleOnButtonBlur}
        >
          <Adornment text={startText} iconName={startIcon} className={styles.adornment} />
          <div className={styles.datePickerValue}>
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
          </div>
          <Adornment text={endText} iconName={endIcon} className={styles.adornment} />
        </button>
      </ReactDropdownMenu.Trigger>
      <ReactDropdownMenu.Portal container={root}>
        <ReactDropdownMenu.Content
          align={"start"}
          sideOffset={5}
          className={styles.datePickerMenu}
          onFocus={handleOnMenuFocus}
          onBlur={handleOnMenuBlur}
          onInteractOutside={handleOnMenuBlur}
        >
          <DayPicker
            required={undefined}
            fixedWeeks
            classNames={styles}
            captionLayout="dropdown"
            startMonth={startDate}
            endMonth={endDate}
            disabled={disabled}
            weekStartsOn={_weekStartsOn}
            showWeekNumber={showWeekNumber}
            showOutsideDays
            mode={mode === "single" ? "single" : "range"}
            selected={selected}
            onSelect={handleSelect}
            autoFocus={!inline}
            numberOfMonths={mode === "range" ? 2 : 1}
          />
        </ReactDropdownMenu.Content>
      </ReactDropdownMenu.Portal>
    </ReactDropdownMenu.Root>
  );
});

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
