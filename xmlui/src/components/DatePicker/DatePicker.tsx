import type { CSSProperties } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { DateRange } from "react-day-picker";
import { DayPicker } from "react-day-picker";
import { format, parse, isValid, parseISO } from "date-fns";
import * as ReactDropdownMenu from "@radix-ui/react-dropdown-menu";
import { desc } from "@components-core/descriptorHelper";

import type { RegisterComponentApiFn, UpdateStateFn } from "@abstractions/RendererDefs";
import { createComponentRenderer } from "@components-core/renderers";
import type { ValidationStatus } from "@components/Input/input-abstractions";
import {
  inputComponentEventDescriptors,
  inputComponentPropertyDescriptors,
} from "@components/Input/input-abstractions";
import { useTheme } from "@components-core/theming/ThemeContext";
import { noop } from "@components-core/constants";
import classnames from "@components-core/utils/classnames";
import styles from "./DatePicker.module.scss";
import { ComponentDescriptor } from "@abstractions/ComponentDescriptorDefs";
import { parseScssVar } from "@components-core/theming/themeVars";
import type { ComponentDef } from "@abstractions/ComponentDefs";

// =====================================================================================================================
// React DatePicker component implementation

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
      throw new Error(`Invalid dateFormat: ${dateFormat}. Supported formats are: ${dateFormats.join(", ")}`);
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

// ============================================================================
// XMLUI DatePicker definition

/**
 * The \`DatePicker\` component allows users to select a date from a graphical calendar interface.
 */
export interface DatePickerComponentDef extends ComponentDef<"DatePicker"> {
  props: {
    /**
     * A placeholder text that is visible in the input field when its empty.
     * @descriptionRef
     */
    placeholder?: string;
    /**
     * The initial value displayed in the input field.
     * @descriptionRef
     */
    initialValue?: string | string[];
    /**
     * You can specify the identifier of a component acting as its label. When you click the label,
     * the component behaves as you clicked it.
     * @descriptionRef
     */
    labelId?: string;
    /**
     * If this boolean prop is set to \`true\`, the \`DatePicker\` will be focused when it appears on the UI.
     * The default is \`false\`.
     * @descriptionRef
     */
    autoFocus?: boolean;
    /**
     * Set this property to \`true\` to indicate it must have a value before submitting the containing form.
     * @descriptionRef
     */
    required?: boolean;
    /**
     * This boolean determines whether the input field can be modified or not.
     * @descriptionRef
     */
    readOnly?: boolean;
    /**
     * Controls whether the input field is enabled (\`true\`) or disabled (\`false\`).
     * @descriptionRef
     */
    enabled?: string | boolean;
    /**
     * This prop is used to visually indicate status changes reacting to form field validation.
     * @descriptionRef
     */
    validationStatus?: ValidationStatus;
    /**
     * This property determines whether the user can pick only one date (\`single\`) or a start and end date (\`range\`).
     * @descriptionRef
     */
    mode?: "single" | "range";
    /** 
     * Define custom date formats using this property.
     * @descriptionRef 
     */
    dateFormat?: string;
    /**
     * Either show the number of weeks (\`true\`) or not (\`false\`).
     * @descriptionRef
     */
    showWeekNumber?: boolean;
    /**
     * Determines on which day the week starts denoted by integers.
     * The week starts on Sunday by default.
     * @descriptionRef
     */
    weekStartsOn?: number;
    /**
     * This optional property indicates the start of the range of selectable dates.
     * The property accepts a date in string format the same way as the \`initialValue\` does.
     * @descriptionRef
     */
    fromDate?: string;
    /**
     * This optional property indicates the end of the range of selectable dates.
     * The property accepts a date in string format the same way as the \`initialValue\` does.
     * @descriptionRef
     */
    toDate?: string;
    /**
     * This optional property determines which dates are disabled and unselectable.
     * The property accepts a list of dates in string format the same way as the \`initialValue\` does.
     * @descriptionRef
     */
    disabledDates?: string[];
  };
  events: {
    /** 
     * This event is triggered after the user has changed the field value.
     * @descriptionRef 
     */
    didChange?: string;
    /** 
     * This event is triggered when the `DatePicker` receives focus.
     * @descriptionRef
     */
    gotFocus?: string;
    /**
     * This event is triggered when the \`DatePicker\` loses focus.
     *
     * (See the example in the [\`gotFocus\`](#gotfocus) event section.)
     */
    lostFocus?: string;
  };
  api: {
    /**
     * You can query this read-only API property to get the input component's current value.
     *
     * See an example in the \`setValue\` API method.
     */
    value?: string | string[];
    /**
     * You can use this method to set the component's current value programmatically.
     * @descriptionRef
     */
    setValue?: (newValue: string | string[]) => void;
  };
}

export const DatePickerMd: ComponentDescriptor<DatePickerComponentDef> = {
  displayName: "DatePicker",
  description: "A datepicker component",
  props: {
    ...inputComponentPropertyDescriptors,
    mode: desc("The mode of the datepicker (single or range)"),
    dateFormat: desc("The format of the date displayed in the input field"),
    showWeekNumber: desc("Whether to show the week number in the calendar"),
    weekStartsOn: desc("The first day of the week. 0 is Sunday, 1 is Monday, etc."),
    fromDate: desc("The start date of the range of selectable dates"),
    toDate: desc("The end date of the range of selectable dates"),
    disabledDates: desc("An array of dates that are disabled"),
  },
  events: inputComponentEventDescriptors,
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    "shadow-menu-DatePicker": "$shadow-md",
    "radius-menu-DatePicker": "$radius",
    "color-text-value-DatePicker": "$color-text-primary",
    "color-bg-menu-DatePicker": "$color-bg-primary",
    "color-bg-item-DatePicker--hover": "$color-bg-dropdown-item--active",
    "color-bg-item-DatePicker--active": "$color-bg-dropdown-item--active",
    light: {
      "color-bg-menu-DatePicker": "$color-bg-primary",
    },
    dark: {
      "color-bg-menu-DatePicker": "$color-bg-primary",
    },
  },
};

export const datePickerComponentRenderer = createComponentRenderer<DatePickerComponentDef>(
  "DatePicker",
  ({ node, state, updateState, extractValue, layoutCss, lookupEventHandler, registerComponentApi }) => {
    return (
      <DatePicker
        layout={layoutCss}
        mode={extractValue(node.props?.mode)}
        value={state?.value}
        initialValue={extractValue(node.props.initialValue)}
        enabled={extractValue.asOptionalBoolean(node.props.enabled)}
        placeholder={extractValue.asOptionalString(node.props.placeholder)}
        validationStatus={extractValue(node.props.validationStatus)}
        updateState={updateState}
        onDidChange={lookupEventHandler("didChange")}
        onFocus={lookupEventHandler("gotFocus")}
        onBlur={lookupEventHandler("lostFocus")}
        registerComponentApi={registerComponentApi}
        dateFormat={extractValue(node.props.dateFormat)}
        showWeekNumber={extractValue.asOptionalBoolean(node.props.showWeekNumber)}
        weekStartsOn={extractValue(node.props.weekStartsOn)}
        fromDate={extractValue(node.props.fromDate)}
        toDate={extractValue(node.props.toDate)}
        disabledDates={extractValue(node.props.disabledDates)}
      />
    );
  },
  DatePickerMd,
);
