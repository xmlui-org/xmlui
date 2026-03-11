import styles from "./DateInput.module.scss";

import { createComponentRenderer } from "../../components-core/renderers";
import { parseScssVar } from "../../components-core/theming/themeVars";
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
  dReadonly,
  dStartIcon,
  dStartText,
  dValidationStatus,
} from "../metadata-helpers";
import {
  dateFormats,
  DateInput,
  DateInputModeValues,
  defaultProps,
  WeekDays,
} from "./DateInputNative";

const COMP = "DateInput";

export const DateInputMd = createMetadata({
  status: "experimental",
  description:
    "`DateInput` provides a text-based date input interface for selecting single dates " +
    "or date ranges, with direct keyboard input similar to TimeInput. It offers customizable " +
    "formatting and validation options without dropdown calendars.",
  parts: {
    day: {
      description: "The day input field.",
    },
    month: {
      description: "The month input field.",
    },
    year: {
      description: "The year input field.",
    },
    clearButton: {
      description: "The button to clear the date input.",
    },
  },
  props: {
    initialValue: dInitialValue(),
    autoFocus: dAutoFocus(),
    readOnly: dReadonly(),
    enabled: dEnabled(defaultProps.enabled),
    validationStatus: dValidationStatus(defaultProps.validationStatus),
    invalidMessages: {
      description: "The invalid messages to display for the input component.",
      type: "array",
      valueType: "string",
    },
    mode: {
      description: "The mode of the date input (single or range)",
      valueType: "string",
      availableValues: DateInputModeValues,
      defaultValue: defaultProps.mode,
    },
    dateFormat: {
      description: "The format of the date displayed in the input field",
      valueType: "string",
      defaultValue: defaultProps.dateFormat,
      availableValues: dateFormats,
    },
    emptyCharacter: {
      description: "Character used to create placeholder text for empty input fields",
      valueType: "string",
      defaultValue: defaultProps.emptyCharacter,
    },
    showWeekNumber: {
      description: "Whether to show the week number (compatibility with DatePicker, not used in DateInput)",
      valueType: "boolean",
      defaultValue: defaultProps.showWeekNumber,
    },
    weekStartsOn: {
      description: "The first day of the week. 0 is Sunday, 1 is Monday, etc. (compatibility with DatePicker, not used in DateInput)",
      valueType: "number",
      defaultValue: defaultProps.weekStartsOn,
      availableValues: [
        {
          value: WeekDays.Sunday,
          description: "Sunday",
        },
        {
          value: WeekDays.Monday,
          description: "Monday",
        },
        {
          value: WeekDays.Tuesday,
          description: "Tuesday",
        },
        {
          value: WeekDays.Wednesday,
          description: "Wednesday",
        },
        {
          value: WeekDays.Thursday,
          description: "Thursday",
        },
        {
          value: WeekDays.Friday,
          description: "Friday",
        },
        {
          value: WeekDays.Saturday,
          description: "Saturday",
        },
      ],
    },
    minValue: {
      description:
        "The optional start date of the selectable date range. If not defined, the range " +
        "allows any dates in the past.",
      valueType: "string",
    },
    maxValue: {
      description:
        "The optional end date of the selectable date range. If not defined, the range allows " +
        "any future dates.",
      valueType: "string",
    },
    disabledDates: {
      description: "An optional array of dates that are disabled (compatibility with DatePicker, not used in DateInput)",
      valueType: "any",
    },
    inline: {
      description: "Whether to display the date input inline (compatibility with DatePicker, always true for DateInput)",
      valueType: "boolean",
      defaultValue: defaultProps.inline,
    },
    clearable: {
      description: "Whether to show a clear button to reset the input",
      valueType: "boolean",
      defaultValue: defaultProps.clearable,
    },
    clearIcon: {
      description: "Icon name for the clear button",
      valueType: "string",
    },
    clearToInitialValue: {
      description: "Whether clearing resets to initial value or null",
      valueType: "boolean",
      defaultValue: defaultProps.clearToInitialValue,
    },
    gap: {
      description: "The gap between input elements",
      valueType: "string",
    },
    required: {
      description: "Whether the input is required",
      valueType: "boolean",
      defaultValue: defaultProps.required,
    },
    startText: dStartText(),
    startIcon: dStartIcon(),
    endText: dEndText(),
    endIcon: dEndIcon(),
    verboseValidationFeedback: {
      description: "Enables a concise validation summary (icon) in input components.",
      type: "boolean",
    },
    validationIconSuccess: {
      description: "Icon to display for valid state when concise validation summary is enabled.",
      type: "string",
    },
    validationIconError: {
      description: "Icon to display for error state when concise validation summary is enabled.",
      type: "string",
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
      signature: "set value(value: any): void",
      parameters: {
        value: "The new value to set for the date input.",
      },
    },
    isoValue: {
      description: `Get the current date value formatted in ISO standard (YYYY-MM-DD) format, suitable for JSON serialization.`,
      signature: "isoValue(): string | null",
    },
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    // DateInput specific theme variables (matching TimeInput structure)
    [`backgroundColor-${COMP}`]: "$backgroundColor",
    [`paddingHorizontal-${COMP}`]: "$space-2",
    [`paddingVertical-${COMP}`]: "$space-2",
    [`color-divider-${COMP}`]: "$textColor-secondary",
    [`spacing-divider-${COMP}`]: "1px 0",
    [`width-input-${COMP}`]: "1.8em",
    [`minWidth-input-${COMP}`]: "0.54em",
    [`padding-input-${COMP}`]: "0 2px",
    [`textAlign-input-${COMP}`]: "center",
    [`borderRadius-input-${COMP}`]: "$borderRadius",
    [`backgroundColor-input-${COMP}-invalid`]: "rgba(220, 53, 69, 0.15)",
    [`padding-button-${COMP}`]: "4px 6px",
    [`borderRadius-button-${COMP}`]: "$borderRadius",
    [`hoverColor-button-${COMP}`]: "$color-surface-800",
    [`disabledColor-button-${COMP}`]: "$textColor-disabled",
    [`outlineColor-button-${COMP}--focused`]: "$color-accent-500",
    [`outlineWidth-button-${COMP}--focused`]: "2px",
    [`outlineOffset-button-${COMP}--focused`]: "2px",
  },
});

export const dateInputComponentRenderer = createComponentRenderer(
  COMP,
  DateInputMd,
  ({
    node,
    state,
    updateState,
    extractValue,
    className,
    lookupEventHandler,
    registerComponentApi,
  }) => {
    return (
      <DateInput
        id={node.uid}
        className={className}
        mode={extractValue(node.props?.mode)}
        value={state?.value}
        initialValue={extractValue(node.props.initialValue)}
        enabled={extractValue.asOptionalBoolean(node.props.enabled)}
        validationStatus={extractValue(node.props.validationStatus)}
        invalidMessages={extractValue(node.props.invalidMessages)}
        updateState={updateState}
        onDidChange={lookupEventHandler("didChange")}
        onFocus={lookupEventHandler("gotFocus")}
        onBlur={lookupEventHandler("lostFocus")}
        registerComponentApi={registerComponentApi}
        dateFormat={extractValue(node.props.dateFormat)}
        showWeekNumber={extractValue.asOptionalBoolean(node.props.showWeekNumber)}
        weekStartsOn={extractValue.asOptionalNumber(node.props.weekStartsOn)}
        minValue={extractValue.asOptionalString(node.props.minValue)}
        maxValue={extractValue.asOptionalString(node.props.maxValue)}
        disabledDates={extractValue(node.props.disabledDates)}
        inline={extractValue.asOptionalBoolean(node.props.inline, defaultProps.inline)}
        startText={extractValue.asOptionalString(node.props.startText)}
        startIcon={extractValue.asOptionalString(node.props.startIcon)}
        endText={extractValue.asOptionalString(node.props.endText)}
        endIcon={extractValue.asOptionalString(node.props.endIcon)}
        readOnly={extractValue.asOptionalBoolean(node.props.readOnly)}
        autoFocus={extractValue.asOptionalBoolean(node.props.autoFocus)}
        required={extractValue.asOptionalBoolean(node.props.required)}
        clearable={extractValue.asOptionalBoolean(node.props.clearable, defaultProps.clearable)}
        clearIcon={extractValue.asOptionalString(node.props.clearIcon)}
        clearToInitialValue={extractValue.asOptionalBoolean(node.props.clearToInitialValue, defaultProps.clearToInitialValue)}
        gap={extractValue.asOptionalString(node.props.gap)}
        emptyCharacter={extractValue.asOptionalString(node.props.emptyCharacter)}
        verboseValidationFeedback={extractValue.asOptionalBoolean(node.props.verboseValidationFeedback)}
        validationIconSuccess={extractValue.asOptionalString(node.props.validationIconSuccess)}
        validationIconError={extractValue.asOptionalString(node.props.validationIconError)}
      />
    );
  },
);
