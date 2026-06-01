import styles from "./DatePickerNew.module.scss";

import { createComponentRenderer } from "../../components-core/renderers";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { useComponentThemeClass } from "../../components-core/theming/utils";
import { COMPONENT_PART_KEY } from "../../components-core/theming/responsive-layout";
import {
  createMetadata,
  dAutoFocus,
  dDidChange,
  dEnabled,
  dGotFocus,
  dInitialValue,
  dLostFocus,
  dReadonly,
  dRequired,
  dValidationStatus,
} from "../metadata-helpers";
import { DatePicker, defaultProps, type DatePickerProps } from "./DatePickerNewReact";

const COMP = "DatePickerNew";

const metadata = createMetadata({
  status: "experimental",
  description:
    "Ark UI backed DatePicker for single dates and date ranges. It mirrors " +
    "the common XMLUI DatePicker props and adds quick-select range presets.",
  props: {
    initialValue: dInitialValue(),
    value: {
      description:
        "Controlled value. Single mode accepts a date string. Range mode accepts " +
        "`{ from, to }`, `[from, to]`, or DateValue objects.",
    },
    mode: {
      description: "Selection mode: `single` or `range`.",
      valueType: "string",
      defaultValue: defaultProps.mode,
      availableValues: ["single", "range"],
    },
    label: {
      description: "Optional label rendered above the input.",
      valueType: "string",
    },
    placeholder: {
      description: "Placeholder for the date input.",
      valueType: "string",
    },
    dateFormat: {
      description:
        "Input and event output format. Supports XMLUI's standard date formats.",
      valueType: "string",
      defaultValue: defaultProps.dateFormat,
    },
    enabled: dEnabled(defaultProps.enabled),
    readOnly: dReadonly(),
    required: dRequired(),
    autoFocus: dAutoFocus(),
    inline: {
      description: "Render the calendar inline instead of in a popover.",
      valueType: "boolean",
      defaultValue: defaultProps.inline,
    },
    validationStatus: dValidationStatus(defaultProps.validationStatus),
    weekStartsOn: {
      description: "First day of the week. 0 is Sunday, 1 is Monday, etc.",
      valueType: "number",
      defaultValue: defaultProps.weekStartsOn,
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
      description: "Earliest selectable date, parsed with `dateFormat`.",
      valueType: "string",
    },
    endDate: {
      description: "Latest selectable date, parsed with `dateFormat`.",
      valueType: "string",
    },
    startIcon: {
      description:
        "When present, shows the calendar adornment at the start of the input.",
      valueType: "string",
    },
    endIcon: {
      description:
        "When present, shows the calendar adornment at the end of the input.",
      valueType: "string",
    },
    startText: {
      description: "Optional text at the start of the input.",
      valueType: "string",
    },
    endText: {
      description: "Optional text at the end of the input.",
      valueType: "string",
    },
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
      description: "Time zone used by Ark UI date calculations.",
      valueType: "string",
      defaultValue: defaultProps.timeZone,
    },
    numOfMonths: {
      description: "Number of visible months Ark UI should manage.",
      valueType: "number",
      defaultValue: defaultProps.numOfMonths,
    },
    presets: {
      description:
        "Range preset list. Accepts a comma-separated string, array of preset " +
        "keys, or `{ value, label }` objects. Defaults to Last 7 days, Last 30 " +
        "days, This month, Last month in range mode.",
    },
    showPresets: {
      description: "Set to false to hide range presets.",
      valueType: "boolean",
      defaultValue: defaultProps.showPresets,
    },
    disabledDates: {
      description:
        "An optional matcher (or array of matchers) of dates to disable. Accepts a " +
        "date string, `{ from, to }`, `{ before }`, `{ after }`, `{ before, after }`, " +
        "or `{ dayOfWeek }` — matching the core DatePicker.",
      valueType: "any",
    },
    confirmRangeSelection: {
      description:
        "In `range` mode (desktop popup), show a Cancel/Proceed footer so the user " +
        "must explicitly confirm the selected range before it is committed. When " +
        "`false` (default), the range auto-commits.",
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
      description:
        "Query the component's current value. If no value is set, it retrieves `undefined`.",
      signature: "get value(): any",
    },
    setValue: {
      description: `Set the current value of the ${COMP}.`,
      signature: "setValue(value: string | { from?: string; to?: string }): void",
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
// root and the calendar popup. Without this the `--xmlui-*-DatePickerNew`
// variables the SCSS references would never be defined. Mirrors the core
// DatePicker's `ThemedDatePicker` wrapper.
function ThemedDatePickerNew({ className, ...rest }: DatePickerProps) {
  const themeClass = useComponentThemeClass(metadata);
  const combinedClassName = className ? `${themeClass} ${className}` : themeClass;
  return (
    <DatePicker {...rest} className={combinedClassName} contentClassName={themeClass} />
  );
}

export const datePickerNewComponentRenderer = createComponentRenderer(
  COMP,
  metadata,
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
      <ThemedDatePickerNew
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
