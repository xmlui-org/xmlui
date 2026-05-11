import { type CSSProperties, type ForwardedRef, useRef } from "react";
import { forwardRef, useCallback, useEffect, useMemo, useState } from "react";
import type { DateRange, Matcher } from "react-day-picker";
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
import { ConciseValidationFeedback } from "../ConciseValidationFeedback/ConciseValidationFeedback";
import { Popover, PopoverContent, PopoverPortal, PopoverTrigger } from "@radix-ui/react-popover";
import * as Dialog from "@radix-ui/react-dialog";
import { composeRefs } from "@radix-ui/react-compose-refs";
import { Part } from "../Part/Part";
import { COMPONENT_PART_KEY } from "../../components-core/theming/responsive-layout";
import { useFormContextPart } from "../Form/FormContext";
import { ThemedIcon } from "../Icon/Icon";
import { useFormItemInputId } from "../FormItem/FormItemContext";
import { useMediaQuery } from "../../components-core/utils/hooks";

// Below this viewport width, the dropdown switches to a bottom-sheet style
// dialog with a backdrop — see shadcn's responsive Date Picker pattern.
const MOBILE_BREAKPOINT_QUERY = "(max-width: 767px)";

const PART_CONCISE_VALIDATION_FEEDBACK = "conciseValidationFeedback";

export const DatePickerModeValues = ["single", "range"] as const;
type DatePickerMode = (typeof DatePickerModeValues)[number];

// Extended matcher types that support string dates in addition to Date objects
type StringDateRange = {
  from: string | Date;
  to?: string | Date;
};

type StringDateBefore = {
  before: string | Date;
};

type StringDateAfter = {
  after: string | Date;
};

type StringDateInterval = {
  before: string | Date;
  after: string | Date;
};

type DayOfWeekMatcher = {
  dayOfWeek: number | number[];
};

type ExtendedMatcher =
  | boolean
  | string
  | Date
  | (string | Date)[]
  | StringDateRange
  | StringDateBefore
  | StringDateAfter
  | StringDateInterval
  | DayOfWeekMatcher
  | ((date: Date) => boolean)
  | ExtendedMatcher[];

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
  classes?: Record<string, string>;
  onDidChange?: (newValue: string | { from: string; to: string }) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  validationStatus?: ValidationStatus;
  registerComponentApi?: RegisterComponentApiFn;
  dateFormat?: DateFormat;
  showWeekNumber?: boolean;
  weekStartsOn?: WeekDays;
  startDate?: string;
  endDate?: string;
  disabledDates?: ExtendedMatcher;
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
  verboseValidationFeedback?: boolean;
  validationIconSuccess?: string;
  validationIconError?: string;
  invalidMessages?: string[];
  contentClassName?: string;
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
  disabledDates: undefined as ExtendedMatcher | undefined,
};

const Chevron = ({ ...props }) => {
  const { orientation = "left" } = props;
  if (orientation === "up") {
    return <ThemedIcon name={"chevronup"} size={"sm"} />;
  } else if (orientation === "down") {
    return <ThemedIcon name={"chevrondown"} size={"sm"} />;
  } else if (orientation === "left") {
    return <ThemedIcon name={"chevronleft"} size={"lg"} />;
  } else if (orientation === "right") {
    return <ThemedIcon name={"chevronright"} size={"lg"} />;
  }
};

export const DatePicker = forwardRef(function DatePicker(
  {
    id: idProp,
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
    startDate,
    endDate,
    disabledDates = defaultProps.disabledDates,
    style,
    className,
    classes,
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
    verboseValidationFeedback,
    validationIconSuccess,
    validationIconError,
    invalidMessages,
    contentClassName,
    ...rest
  }: Props,
  forwardedRef: ForwardedRef<HTMLDivElement>,
) {
  const id = useFormItemInputId(idProp);
  const _weekStartsOn = weekStartsOn >= 0 && weekStartsOn <= 6 ? weekStartsOn : WeekDays.Sunday;
  const [_, setIsMenuFocused] = useState(false);
  const [referenceElement, setReferenceElement] = useState<HTMLElement | null>(null);
  const [inlineMonth, setInlineMonth] = useState<Date | undefined>();
  const [hoveredDate, setHoveredDate] = useState<Date | undefined>();
  const inputRef = useRef<HTMLInputElement>(null);
  const ref = forwardedRef ? composeRefs(forwardedRef, inputRef) : inputRef;

  const contextVerboseValidationFeedback = useFormContextPart(
    (ctx) => ctx?.verboseValidationFeedback,
  );
  const contextValidationIconSuccess = useFormContextPart((ctx) => ctx?.validationIconSuccess);
  const contextValidationIconError = useFormContextPart((ctx) => ctx?.validationIconError);

  const finalVerboseValidationFeedback =
    verboseValidationFeedback ?? contextVerboseValidationFeedback ?? true;
  const finalValidationIconSuccess =
    validationIconSuccess ?? contextValidationIconSuccess ?? "checkmark";
  const finalValidationIconError = validationIconError ?? contextValidationIconError ?? "close";

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

  const _startDate = useMemo(() => {
    return startDate ? parse(startDate, dateFormat, new Date()) : undefined;
  }, [startDate, dateFormat]);

  const _endDate = useMemo(() => {
    return endDate ? parse(endDate, dateFormat, new Date()) : undefined;
  }, [endDate, dateFormat]);

  const defaultMonth = useMemo(() => {
    if (mode === "single" && selected) {
      return selected;
    } else if (mode === "range" && selected && typeof selected === "object" && selected.from) {
      return selected.from;
    }
    return undefined;
  }, [selected, mode]);

  const disabled = useMemo(() => {
    if (!disabledDates) {
      return undefined;
    }

    const convertStringToDate = (dateValue: string | Date): Date | undefined => {
      if (dateValue instanceof Date) {
        return dateValue;
      }
      if (typeof dateValue === "string") {
        // Try to parse as ISO date first
        const isoDate = parseISODate(dateValue);
        if (isoDate) {
          return isoDate;
        }
        // Parse using the specified dateFormat
        const parsedDate = parse(dateValue, dateFormat, new Date());
        if (isValid(parsedDate)) {
          return parsedDate;
        }
      }
      return undefined;
    };

    const convertMatcher = (matcher: ExtendedMatcher): Matcher | undefined => {
      // Handle boolean - disable all dates
      if (typeof matcher === "boolean") {
        return matcher;
      }

      // Handle function matcher - pass through as is
      if (typeof matcher === "function") {
        return matcher;
      }

      // Handle single Date or string
      if (matcher instanceof Date || typeof matcher === "string") {
        const convertedDate = convertStringToDate(matcher);
        return convertedDate || undefined;
      }

      // Handle array of mixed matchers (combines multiple disable patterns)
      if (Array.isArray(matcher)) {
        const convertedMatchers: any[] = [];

        for (const item of matcher) {
          if (
            typeof item === "object" &&
            item !== null &&
            !Array.isArray(item) &&
            !(item instanceof Date)
          ) {
            // Handle nested matcher objects in array (e.g., {dayOfWeek: [0,6]}, {from: date, to: date})
            const nestedResult = convertMatcher(item);
            if (nestedResult) {
              convertedMatchers.push(nestedResult);
            }
          } else if (item instanceof Date || typeof item === "string") {
            // Handle individual dates in the array
            const convertedDate = convertStringToDate(item);
            if (convertedDate) {
              convertedMatchers.push(convertedDate);
            }
          }
        }

        // Return array of all matchers to combine their effects
        return convertedMatchers.length > 0 ? (convertedMatchers as Matcher) : undefined;
      }

      // Handle object matchers (DateRange, DateBefore, DateAfter, DateInterval, DayOfWeek)
      if (typeof matcher === "object" && matcher !== null) {
        // Handle DateRange: { from: Date, to?: Date }
        if ("from" in matcher) {
          const fromDate = convertStringToDate(matcher.from);
          const toDate = matcher.to ? convertStringToDate(matcher.to) : undefined;
          if (fromDate) {
            return { from: fromDate, to: toDate };
          }
        }

        // Handle DateBefore: { before: Date }
        if ("before" in matcher && !("after" in matcher)) {
          const beforeDate = convertStringToDate(matcher.before);
          if (beforeDate) {
            return { before: beforeDate };
          }
        }

        // Handle DateAfter: { after: Date }
        if ("after" in matcher && !("before" in matcher)) {
          const afterDate = convertStringToDate(matcher.after);
          if (afterDate) {
            return { after: afterDate };
          }
        }

        // Handle DateInterval: { before: Date, after: Date }
        if ("before" in matcher && "after" in matcher) {
          const beforeDate = convertStringToDate(matcher.before);
          const afterDate = convertStringToDate(matcher.after);
          if (beforeDate && afterDate) {
            return { before: beforeDate, after: afterDate };
          }
        }

        // Handle DayOfWeek: { dayOfWeek: number | number[] }
        if ("dayOfWeek" in matcher) {
          return { dayOfWeek: matcher.dayOfWeek };
        }
      }

      return undefined;
    };

    return convertMatcher(disabledDates);
  }, [disabledDates, dateFormat]);

  const [open, setOpen] = useState(false);
  const { root } = useTheme();
  const isMobile = useMediaQuery(MOBILE_BREAKPOINT_QUERY);

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
    updateState({ value: newValue });
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

  // Update inline month when selected value changes
  useEffect(() => {
    if (inline) {
      if (mode === "single" && selected) {
        setInlineMonth(selected);
      } else if (mode === "range" && selected && typeof selected === "object" && selected.from) {
        setInlineMonth(selected.from);
      } else if (!selected) {
        // Reset to defaultMonth logic when no selection
        setInlineMonth(defaultMonth);
      }
    }
  }, [selected, mode, inline, defaultMonth]);

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
      setHoveredDate(undefined);
    },
    [onDidChange, updateState, mode, dateFormat, readOnly],
  );

  const handleDayMouseEnter = useCallback(
    (date: Date) => {
      if (mode === "range") {
        setHoveredDate(date);
      }
    },
    [mode],
  );

  const handleDayMouseLeave = useCallback(() => {
    setHoveredDate(undefined);
  }, []);

  const modifiers = useMemo(() => {
    const mods: any = {};

    if (mode === "range" && hoveredDate && selected?.from) {
      // Show preview when hovering, even if a range is already selected
      // This allows users to see what the new range would be
      const start = selected.from < hoveredDate ? selected.from : hoveredDate;
      const end = selected.from < hoveredDate ? hoveredDate : selected.from;
      mods.hovered = { from: start, to: end };
    }

    // Add background to single selected date in range mode
    if (mode === "range" && selected?.from && !selected?.to) {
      mods.singleSelected = selected.from;
    }

    return mods;
  }, [mode, hoveredDate, selected]);

  const triggerClassName = classnames(
    classes?.[COMPONENT_PART_KEY],
    className,
    styles.datePicker,
    {
      [styles.disabled]: !enabled,
      [styles.error]: validationStatus === "error",
      [styles.warning]: validationStatus === "warning",
      [styles.valid]: validationStatus === "valid",
    },
    className,
  );

  const triggerInner = (
    <>
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
      {!finalVerboseValidationFeedback && (
        <Part partId={PART_CONCISE_VALIDATION_FEEDBACK}>
          <ConciseValidationFeedback
            validationStatus={validationStatus}
            invalidMessages={invalidMessages}
            successIcon={finalValidationIconSuccess}
            errorIcon={finalValidationIconError}
          />
        </Part>
      )}
      <Adornment text={endText} iconName={endIcon} className={styles.adornment} />
    </>
  );

  const popupCalendar = (
    <DayPicker
      required={undefined}
      animate
      fixedWeeks={mode !== "range"}
      autoFocus={autoFocus}
      classNames={styles}
      captionLayout="dropdown"
      startMonth={_startDate}
      endMonth={_endDate}
      defaultMonth={defaultMonth}
      disabled={disabled}
      weekStartsOn={_weekStartsOn}
      showWeekNumber={showWeekNumber}
      showOutsideDays={mode !== "range"}
      mode={mode === "single" ? "single" : "range"}
      selected={selected}
      onSelect={handleSelect}
      numberOfMonths={mode === "range" ? 2 : 1}
      pagedNavigation={mode === "range"}
      modifiers={modifiers}
      modifiersClassNames={{ hovered: styles.hovered, singleSelected: styles.singleSelected }}
      onDayMouseEnter={handleDayMouseEnter}
      onDayMouseLeave={handleDayMouseLeave}
      components={{
        Chevron,
      }}
    />
  );

  if (inline) {
    return (
      <div
        ref={ref}
        {...rest}
        style={style}
        className={classnames(styles.inlinePickerMenu, classes?.[COMPONENT_PART_KEY], className)}
        tabIndex={0}
      >
        <DayPicker
          id={id}
          required={undefined}
          captionLayout="dropdown"
          fixedWeeks={mode !== "range"}
          startMonth={_startDate}
          endMonth={_endDate}
          month={inlineMonth}
          onMonthChange={setInlineMonth}
          disabled={disabled}
          weekStartsOn={_weekStartsOn}
          showWeekNumber={showWeekNumber}
          showOutsideDays={mode !== "range"}
          classNames={styles}
          mode={mode === "single" ? "single" : "range"}
          selected={selected}
          onSelect={handleSelect}
          autoFocus={autoFocus}
          numberOfMonths={mode === "range" ? 2 : 1}
          pagedNavigation={mode === "range"}
          modifiers={modifiers}
          modifiersClassNames={{ hovered: styles.hovered, singleSelected: styles.singleSelected }}
          onDayMouseEnter={handleDayMouseEnter}
          onDayMouseLeave={handleDayMouseLeave}
          components={{
            Chevron,
          }}
        />
      </div>
    );
  }

  // On mobile, render the calendar inside a Radix Dialog styled as a bottom
  // sheet (shadcn's responsive Date Picker pattern). Desktop keeps the
  // anchored Popover.
  if (isMobile) {
    return (
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Trigger
          id={id}
          ref={composeRefs(setReferenceElement, ref) as any}
          aria-haspopup={true}
          disabled={!enabled}
          style={style}
          className={triggerClassName}
          autoFocus={autoFocus}
          onFocus={onFocus}
          onBlur={onBlur}
          {...rest}
        >
          {triggerInner}
        </Dialog.Trigger>
        <Dialog.Portal container={root}>
          <Dialog.Overlay
            className={classnames(contentClassName, styles.mobileBackdrop)}
          />
          <Dialog.Content
            role="menu"
            aria-label="Select date"
            aria-describedby={undefined}
            className={classnames(contentClassName, styles.datePickerMenu, styles.mobileSheet)}
            onOpenAutoFocus={(e) => {
              // Prevent the calendar from stealing focus on open so taps on
              // dates fire cleanly on mobile (similar to shadcn).
              e.preventDefault();
            }}
          >
            <Dialog.Title className={styles.srOnly}>Select date</Dialog.Title>
            {popupCalendar}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen} modal={false}>
      <PopoverTrigger
        id={id}
        ref={composeRefs(setReferenceElement, ref)}
        aria-haspopup={true}
        disabled={!enabled}
        style={style}
        aria-expanded={open}
        className={triggerClassName}
        autoFocus={autoFocus}
        onFocus={onFocus}
        onBlur={onBlur}
        {...rest}
      >
        {triggerInner}
      </PopoverTrigger>
      <PopoverPortal container={root}>
        <PopoverContent
          role="menu"
          align={"start"}
          sideOffset={5}
          className={classnames(contentClassName, styles.datePickerMenu)}
          onFocus={handleOnMenuFocus}
          onBlur={handleOnMenuBlur}
          onInteractOutside={handleOnMenuBlur}
        >
          {popupCalendar}
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
