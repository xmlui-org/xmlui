import styles from "./DatePicker.module.scss";

import { createComponentRenderer } from "../../components-core/renderers";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { useComponentThemeClass } from "../../components-core/theming/utils";
import { COMPONENT_PART_KEY } from "../../components-core/theming/responsive-layout";
import {
  createMetadata,
  dAutoFocus,
  dDidChange,
  dEnabled,
  dEndIcon,
  dEndText,
  dGotFocus,
  dInitialValue,
  dLostFocus,
  dPlaceholder,
  dReadonly,
  dRequired,
  dStartIcon,
  dStartText,
  dValidationStatus,
} from "../metadata-helpers";
import { DatePicker, defaultProps, type DatePickerProps } from "./DatePickerReact";

const COMP = "DatePicker";

export const DatePickerMd = createMetadata({
  status: "stable",
  description:
    "`DatePicker` provides an interactive calendar interface for selecting single dates " +
    "or date ranges, with customizable formatting and validation options. It displays " +
    "a text input that opens a calendar popup when clicked, offering both keyboard and " +
    "mouse interaction.",
  props: {
    placeholder: dPlaceholder(),
    initialValue: dInitialValue(),
    value: {
      description:
        "Controlled value. In single mode, a date string; in range mode, a " +
        "`{ from, to }` object.",
    },
    mode: {
      description: "The mode of the datepicker (single or range)",
      valueType: "string",
      defaultValue: defaultProps.mode,
      availableValues: ["single", "range"],
    },
    label: {
      description: "Optional label rendered above the input.",
      valueType: "string",
    },
    dateFormat: {
      description: "The format of the date displayed in the input field",
      valueType: "string",
      defaultValue: defaultProps.dateFormat,
      availableValues: [
        "MM/dd/yyyy",
        "MM-dd-yyyy",
        "yyyy/MM/dd",
        "yyyy-MM-dd",
        "dd/MM/yyyy",
        "dd-MM-yyyy",
        "yyyyMMdd",
        "MMddyyyy",
      ],
    },
    enabled: dEnabled(defaultProps.enabled),
    readOnly: dReadonly(),
    required: dRequired(),
    autoFocus: dAutoFocus(),
    inline: {
      description:
        "If set to true, the calendar is always visible and its panel is rendered as " +
        "part of the layout. If false, the calendar is shown in a popup when the input " +
        "is focused or clicked.",
      valueType: "boolean",
      defaultValue: defaultProps.inline,
    },
    clearable: {
      description:
        "Set to `true` to show a clear button that resets the value. Hidden by default.",
      valueType: "boolean",
      defaultValue: defaultProps.clearable,
    },
    validationStatus: dValidationStatus(defaultProps.validationStatus),
    weekStartsOn: {
      description: "The first day of the week. 0 is Sunday, 1 is Monday, etc.",
      valueType: "number",
      defaultValue: defaultProps.weekStartsOn,
      availableValues: [
        { value: 0, description: "Sunday" },
        { value: 1, description: "Monday" },
        { value: 2, description: "Tuesday" },
        { value: 3, description: "Wednesday" },
        { value: 4, description: "Thursday" },
        { value: 5, description: "Friday" },
        { value: 6, description: "Saturday" },
      ],
    },
    showWeekNumber: {
      description: "Show week number cells in the day table.",
      valueType: "boolean",
      defaultValue: defaultProps.showWeekNumber,
    },
    showWeekNumbers: {
      description: "Alias for `showWeekNumber`.",
      valueType: "boolean",
      defaultValue: defaultProps.showWeekNumbers,
    },
    startDate: {
      description:
        "The earliest month to start the month navigation from (inclusive). " +
        "If not defined, the component allows any dates in the past. " +
        "Accepts the same date format as the `initialValue`. " +
        "Example: '2023-01-01' ensures the first month to select a date from is January 2023.",
      valueType: "string",
    },
    endDate: {
      description:
        "The latest month to start the month navigation from (inclusive). " +
        "If not defined, the component allows any future dates. " +
        "Accepts the same date format as the `initialValue`. " +
        "Example: '2023-12-31' ensures the last month to select a date from is December 2023.",
      valueType: "string",
    },
    startText: dStartText(),
    startIcon: dStartIcon(),
    endText: dEndText(),
    endIcon: dEndIcon(),
    width: {
      description: "CSS width for the picker root.",
      valueType: "string",
    },
    locale: {
      description: "BCP 47 locale used for calendar labels.",
      valueType: "string",
      defaultValue: defaultProps.locale,
    },
    timeZone: {
      description: "The time zone used for date calculations.",
      valueType: "string",
      defaultValue: defaultProps.timeZone,
    },
    numOfMonths: {
      description: "The number of months displayed at once.",
      valueType: "number",
      defaultValue: defaultProps.numOfMonths,
    },
    presets: {
      description:
        "Customizes the range presets (range mode only). Supplying a list also " +
        "turns the presets on. Accepts a comma-separated string or array of " +
        "built-in preset keys (e.g. `last7Days`, `thisMonth`), `{ value, label }` " +
        "objects to relabel a built-in, or `{ label, from, to }` objects for fully " +
        "custom date ranges (parsed with `dateFormat`).",
    },
    showPresets: {
      description:
        "Range presets are hidden by default. Set to `true` to show the built-in " +
        "presets (Last 7 days, Last 30 days, This month, Last month); set to " +
        "`false` to force them off even when a `presets` list is supplied.",
      valueType: "boolean",
      defaultValue: defaultProps.showPresets,
    },
    disabledDates: {
      description:
        "An optional array of dates that are to be disabled. Accepts a date string, " +
        "`{ from, to }`, `{ before }`, `{ after }`, `{ before, after }`, or " +
        "`{ dayOfWeek }` matchers (parsed with `dateFormat`).",
      valueType: "any",
    },
    confirmRangeSelection: {
      description:
        "In `range` mode, show a Cancel/Proceed footer so the user must explicitly " +
        "confirm the selected range before it is committed. When `false` (default), " +
        "the range auto-commits on the second click and the popup closes.",
      valueType: "boolean",
      defaultValue: defaultProps.confirmRangeSelection,
    },
    verboseValidationFeedback: {
      description: "Enables a concise validation summary (icon) in the input.",
      valueType: "boolean",
    },
    validationIconSuccess: {
      description: "Icon to display for the valid state when the concise summary is enabled.",
      valueType: "string",
    },
    validationIconError: {
      description: "Icon to display for the error state when the concise summary is enabled.",
      valueType: "string",
    },
    invalidMessages: {
      description: "The invalid messages to display in the concise validation summary.",
      valueType: "any",
    },
  },
  events: {
    didChange: dDidChange(COMP),
    gotFocus: dGotFocus(COMP),
    lostFocus: dLostFocus(COMP),
  },
  apis: {
    focus: {
      description: `Focus the ${COMP} component.`,
      signature: "focus(): void",
    },
    value: {
      description: `You can query the component's value. If no value is set, it will retrieve \`undefined\`.`,
      signature: "get value(): any",
    },
    setValue: {
      description: `This method sets the current value of the ${COMP}.`,
      signature: "setValue(value: string | { from?: string; to?: string }): void",
      parameters: {
        value: "The new value to set for the date picker.",
      },
    },
    getValue: {
      description: `Return the current value of the ${COMP}.`,
      signature: "getValue(): string | { from?: string; to?: string } | undefined",
    },
  },
  contextVars: {
    value: {
      description:
        "Current value. Single mode returns a string; range mode returns " +
        "`{ from, to }`.",
    },
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    [`boxShadow-menu-${COMP}`]: "$boxShadow-md",
    [`backgroundColor-menu-${COMP}`]: "$color-surface-50",
    [`borderColor-menu-${COMP}`]: "$borderColor",
    [`borderRadius-menu-${COMP}`]: "$borderRadius",
    [`backgroundColor-overlay-${COMP}`]: "$backgroundColor-overlay",
    [`backgroundColor-item-${COMP}--hover`]: "$color-surface-100",
    [`backgroundColor-item-${COMP}--active`]: "$color-surface-200",
    [`textColor-value-${COMP}`]: "$textColor-primary",
    [`borderColor-selectedItem-${COMP}`]: "$color-primary-300",
    // Day-cell modifiers — selected days, range middle, today, and disabled
    // days each get a distinct look matching the core DatePicker.
    [`backgroundColor-day-${COMP}--selected`]: "$color-primary-500",
    [`textColor-day-${COMP}--selected`]: "$color-surface-0",
    [`backgroundColor-day-${COMP}--rangeMiddle`]: "$color-primary-100",
    [`textColor-day-${COMP}--rangeMiddle`]: "$textColor-primary",
    [`backgroundColor-day-${COMP}--today`]: "transparent",
    [`textColor-day-${COMP}--today`]: "$textColor-primary",
    [`borderColor-day-${COMP}--today`]: "$color-secondary-300",
    [`borderWidth-day-${COMP}--today`]: "1px",
    [`borderStyle-day-${COMP}--today`]: "solid",
    [`backgroundColor-day-${COMP}--disabled`]: "transparent",
    [`textColor-day-${COMP}--disabled`]: "$color-secondary-300",
    [`textColor-weekday-${COMP}`]: "$color-secondary-300",
    [`paddingHorizontal-${COMP}`]: "$space-3",
    [`paddingVertical-${COMP}`]: "$space-2",
  },
});

// Emits the component's theme variables (themeVars + defaultThemeVars resolved
// against the active theme) onto a scoped class, then applies it to both the
// root and the calendar popup. Without this the `--xmlui-*-DatePicker`
// variables the SCSS references would never be defined. Mirrors the core
// DatePicker's `ThemedDatePicker` wrapper.
export function ThemedDatePicker({ className, ...rest }: DatePickerProps) {
  const themeClass = useComponentThemeClass(DatePickerMd);
  const combinedClassName = className ? `${themeClass} ${className}` : themeClass;
  return (
    <DatePicker {...rest} className={combinedClassName} contentClassName={themeClass} />
  );
}

export const datePickerComponentRenderer = createComponentRenderer(
  COMP,
  DatePickerMd,
  ({
    node,
    extractValue,
    lookupEventHandler,
    updateState,
    registerComponentApi,
    classes,
  }) => {
    const props = (node.props ?? {}) as Record<string, any>;

    return (
      <ThemedDatePicker
        id={extractValue.asOptionalString(props.id)}
        value={extractValue(props.value)}
        initialValue={extractValue(props.initialValue)}
        mode={extractValue.asOptionalString(props.mode)}
        label={extractValue.asOptionalString(props.label)}
        placeholder={extractValue.asOptionalString(props.placeholder)}
        dateFormat={extractValue.asOptionalString(props.dateFormat)}
        enabled={extractValue.asOptionalBoolean(props.enabled, defaultProps.enabled)}
        readOnly={extractValue.asOptionalBoolean(props.readOnly)}
        required={extractValue.asOptionalBoolean(props.required)}
        autoFocus={extractValue.asOptionalBoolean(props.autoFocus)}
        inline={extractValue.asOptionalBoolean(props.inline)}
        clearable={extractValue.asOptionalBoolean(props.clearable, defaultProps.clearable)}
        validationStatus={
          extractValue.asOptionalString(props.validationStatus) as
            | "none"
            | "error"
            | "warning"
            | "valid"
            | undefined
        }
        weekStartsOn={extractValue(props.weekStartsOn)}
        showWeekNumber={extractValue.asOptionalBoolean(props.showWeekNumber)}
        showWeekNumbers={extractValue.asOptionalBoolean(props.showWeekNumbers)}
        startDate={extractValue(props.startDate)}
        endDate={extractValue(props.endDate)}
        startIcon={extractValue.asOptionalString(props.startIcon)}
        endIcon={extractValue.asOptionalString(props.endIcon)}
        startText={extractValue.asOptionalString(props.startText)}
        endText={extractValue.asOptionalString(props.endText)}
        width={extractValue.asSize(props.width) || undefined}
        locale={extractValue.asOptionalString(props.locale)}
        timeZone={extractValue.asOptionalString(props.timeZone)}
        numOfMonths={extractValue.asOptionalNumber(props.numOfMonths)}
        presets={extractValue(props.presets) as never}
        showPresets={extractValue.asOptionalBoolean(props.showPresets)}
        disabledDates={extractValue(props.disabledDates) as never}
        confirmRangeSelection={extractValue.asOptionalBoolean(props.confirmRangeSelection)}
        verboseValidationFeedback={extractValue.asOptionalBoolean(props.verboseValidationFeedback)}
        validationIconSuccess={extractValue.asOptionalString(props.validationIconSuccess)}
        validationIconError={extractValue.asOptionalString(props.validationIconError)}
        invalidMessages={extractValue(props.invalidMessages) as never}
        className={classes?.[COMPONENT_PART_KEY]}
        onDidChange={lookupEventHandler("didChange") as never}
        onFocus={lookupEventHandler("gotFocus")}
        onBlur={lookupEventHandler("lostFocus")}
        updateState={updateState}
        registerComponentApi={registerComponentApi}
      />
    );
  },
);
