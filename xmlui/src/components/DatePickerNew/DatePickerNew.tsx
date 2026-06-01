import { createComponentRenderer } from "../../components-core/renderers";
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
import { DatePicker } from "./DatePickerNewReact";

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
      defaultValue: "single",
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
      defaultValue: "MM/dd/yyyy",
    },
    enabled: dEnabled(),
    readOnly: dReadonly(),
    required: dRequired(),
    autoFocus: dAutoFocus(),
    inline: {
      description: "Render the calendar inline instead of in a popover.",
      valueType: "boolean",
      defaultValue: false,
    },
    validationStatus: dValidationStatus("none"),
    weekStartsOn: {
      description: "First day of the week. 0 is Sunday, 1 is Monday, etc.",
      valueType: "number",
      defaultValue: 0,
    },
    showWeekNumber: {
      description: "Show week number cells in the day table.",
      valueType: "boolean",
      defaultValue: false,
    },
    showWeekNumbers: {
      description: "Alias for `showWeekNumber`.",
      valueType: "boolean",
      defaultValue: false,
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
    minWidth: {
      description: "CSS min-width for the picker root.",
      valueType: "string",
    },
    maxWidth: {
      description: "CSS max-width for the picker root.",
      valueType: "string",
    },
    locale: {
      description: "BCP 47 locale used for calendar labels.",
      valueType: "string",
      defaultValue: "en-US",
    },
    timeZone: {
      description: "Time zone used by Ark UI date calculations.",
      valueType: "string",
      defaultValue: "UTC",
    },
    numOfMonths: {
      description: "Number of visible months Ark UI should manage.",
      valueType: "number",
      defaultValue: 1,
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
      defaultValue: true,
    },
    testId: {
      description: "Optional test id rendered on the picker root.",
      valueType: "string",
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
});

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
      <DatePicker
        id={extractValue.asOptionalString(props.id)}
        value={extractValue(props.value)}
        initialValue={extractValue(props.initialValue)}
        mode={extractValue.asOptionalString(props.mode)}
        label={extractValue.asOptionalString(props.label)}
        placeholder={extractValue.asOptionalString(props.placeholder)}
        dateFormat={extractValue.asOptionalString(props.dateFormat)}
        enabled={extractValue.asOptionalBoolean(props.enabled, true)}
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
        minWidth={extractValue.asSize(props.minWidth) || undefined}
        maxWidth={extractValue.asSize(props.maxWidth) || undefined}
        locale={extractValue.asOptionalString(props.locale)}
        timeZone={extractValue.asOptionalString(props.timeZone)}
        numOfMonths={extractValue.asOptionalNumber(props.numOfMonths)}
        presets={extractValue(props.presets) as never}
        showPresets={extractValue.asOptionalBoolean(props.showPresets)}
        testId={extractValue.asOptionalString(props.testId)}
        className={classes?.["default-part"]}
        onDidChange={lookupEventHandler("didChange") as never}
        onFocus={lookupEventHandler("gotFocus")}
        onBlur={lookupEventHandler("lostFocus")}
        updateState={updateState}
        registerComponentApi={registerComponentApi}
      />
    );
  },
);
