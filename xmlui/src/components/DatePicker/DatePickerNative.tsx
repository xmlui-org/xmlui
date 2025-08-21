import { type CSSProperties, useId } from "react";
import { forwardRef, useCallback, useEffect, useMemo, useState } from "react";
import type { DateRange } from "react-day-picker";
import { DayPicker } from "react-day-picker";
import { format, parse, isValid, parseISO } from "date-fns";
import classnames from "classnames";
import styles from "./DatePicker.module.scss";

import type { RegisterComponentApiFn, UpdateStateFn } from "../../abstractions/RendererDefs";
import { useTheme } from "../../components-core/theming/ThemeContext";
import { noop } from "../../components-core/constants";
import { useEvent } from "../../components-core/utils/misc";
import type { ValidationStatus } from "../abstractions";
import { Adornment } from "../Input/InputAdornment";
import { ItemWithLabel } from "../FormItem/ItemWithLabel";
import { Popover, PopoverContent, PopoverPortal, PopoverTrigger } from "@radix-ui/react-popover";
import Icon from "../Icon/IconNative";
import { Item } from "@radix-ui/react-dropdown-menu";

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
  className?: string;
  onDidChange?: (newValue: string | { from: string; to: string }) => void;
  onFocus?: (ev: React.FocusEvent<HTMLDivElement>) => void;
  onBlur?: (ev: React.FocusEvent<HTMLDivElement>) => void;
  validationStatus?: ValidationStatus;
  registerComponentApi?: RegisterComponentApiFn;
  dateFormat?: DateFormat;
  showWeekNumber?: boolean;
  weekStartsOn?: WeekDays;
  minValue?: string;
  maxValue?: string;
  disabledDates?: string[];
  inline?: boolean;
  startText?: string;
  startIcon?: string;
  endText?: string;
  endIcon?: string;
  label?: string;
  labelPosition?: string;
  labelWidth?: string;
  labelBreak?: boolean;
  inProgress?: boolean;
  inProgressNotificationMessage?: string;
  readOnly?: boolean;
  required?: boolean;
  autoFocus?: boolean;
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

const Chevron = ({ ...props }) => {
  const { orientation = "left" } = props;
  if (orientation === "up") {
    return <Icon name={"chevronup"} size={"sm"} />;
  } else if (orientation === "down") {
    return <Icon name={"chevrondown"} size={"sm"} />;
  } else if (orientation === "left") {
    return <Icon name={"chevronleft"} size={"lg"} />;
  } else if (orientation === "right") {
    return <Icon name={"chevronright"} size={"lg"} />;
  }
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
    minValue,
    maxValue,
    disabledDates = defaultProps.disabledDates,
    style,
    className,
    registerComponentApi,
    inline = defaultProps.inline,
    startText,
    startIcon,
    endText,
    endIcon,
    label,
    labelPosition,
    labelWidth,
    labelBreak,
    readOnly = false,
    required,
    autoFocus = false,
    ...rest
  }: Props,
  ref: React.Ref<HTMLDivElement>,
) {
  const _weekStartsOn = weekStartsOn >= 0 && weekStartsOn <= 6 ? weekStartsOn : WeekDays.Sunday;
  const [isMenuFocused, setIsMenuFocused] = useState(false);
  const [referenceElement, setReferenceElement] = useState<HTMLElement | null>(null);
  const generatedId = useId();
  const inputId = id || generatedId;

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
    return minValue ? parse(minValue, dateFormat, new Date()) : undefined;
  }, [minValue, dateFormat]);

  const endDate = useMemo(() => {
    return maxValue ? parse(maxValue, dateFormat, new Date()) : undefined;
  }, [maxValue, dateFormat]);

  const disabled = useMemo(() => {
    return disabledDates?.map((date) => parse(date, dateFormat, new Date()));
  }, [disabledDates, dateFormat]);

  const [open, setOpen] = useState(false);
  const { root } = useTheme();

  const handleOnMenuFocus = () => {
    setIsMenuFocused(true);
  };

  const handleOnMenuBlur = () => {
    setIsMenuFocused(false);
  };

  // Register component API for external interactions
  const focus = useCallback(() => {
    referenceElement?.focus();
  }, [referenceElement]);

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

  // useEffect(() => {
  //   if (!isButtonFocused && !isMenuFocused) {
  //     onBlur?.();
  //   }
  //   if (isButtonFocused || isMenuFocused) {
  //     onFocus?.();
  //   }
  // }, [isButtonFocused, isMenuFocused, onFocus, onBlur]);

  useEffect(() => {
    updateState({ value: initialValue }, { initial: true });
  }, [initialValue, updateState]);

  const handleSelect = useCallback(
    (dateOrRange?: Date | DateRange) => {
      if (readOnly) {
        return;
      }
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
    <ItemWithLabel
      id={inputId}
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
      ref={ref}
    >
      <div {...rest} className={styles.inlinePickerMenu} ref={(ref) => setReferenceElement(ref)}>
        <DayPicker
          id={inputId}
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
          autoFocus={autoFocus}
          numberOfMonths={mode === "range" ? 2 : 1}
          components={{
            Chevron,
          }}
        />
      </div>
    </ItemWithLabel>
  ) : (
    <Popover open={open} onOpenChange={setOpen} modal={false}>
      <ItemWithLabel
        {...rest}
        id={inputId}
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
        ref={ref}
      >
        <PopoverTrigger
          ref={setReferenceElement}
          id={inputId}
          aria-haspopup={true}
          disabled={!enabled}
          style={style}
          aria-expanded={open}
          className={classnames(
            styles.datePicker,
            {
              [styles.disabled]: !enabled,
              [styles.error]: validationStatus === "error",
              [styles.warning]: validationStatus === "warning",
              [styles.valid]: validationStatus === "valid",
            },
            className,
          )}
          autoFocus={autoFocus}
          onFocus={onFocus as any}
          onBlur={onBlur as any}
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
              <span className={styles.placeholder} placeholder={placeholder}>
                {placeholder}
              </span>
            ) : (
              <span>&nbsp;</span>
            )}
          </div>
          <Adornment text={endText} iconName={endIcon} className={styles.adornment} />
        </PopoverTrigger>
      </ItemWithLabel>
      <PopoverPortal container={root}>
        <PopoverContent
          role="menu"
          align={"start"}
          sideOffset={5}
          className={styles.datePickerMenu}
          onFocus={handleOnMenuFocus}
          onBlur={handleOnMenuBlur}
          onInteractOutside={handleOnMenuBlur}
        >
          <DayPicker
            required={undefined}
            animate
            fixedWeeks
            autoFocus={autoFocus}
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
            numberOfMonths={mode === "range" ? 2 : 1}
            components={{
              Chevron,
            }}
          />
        </PopoverContent>
      </PopoverPortal>
    </Popover>
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
