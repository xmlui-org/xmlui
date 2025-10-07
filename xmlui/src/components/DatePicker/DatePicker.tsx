import styles from "./DatePicker.module.scss";

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
  dPlaceholder,
  dReadonly,
  dStartIcon,
  dStartText,
  dValidationStatus,
} from "../metadata-helpers";
import {
  dateFormats,
  DatePicker,
  DatePickerModeValues,
  defaultProps,
  WeekDays,
} from "./DatePickerNative";

const COMP = "DatePicker";

export const DatePickerMd = createMetadata({
  status: "experimental",
  description:
    "`DatePicker` provides an interactive calendar interface for selecting single dates " +
    "or date ranges, with customizable formatting and validation options. It displays " +
    "a text input that opens a calendar popup when clicked, offering both keyboard and " +
    "mouse interaction.",
  props: {
    placeholder: dPlaceholder(),
    initialValue: dInitialValue(),
    autoFocus: dAutoFocus(),
    readOnly: dReadonly(),
    enabled: dEnabled(defaultProps.enabled),
    validationStatus: dValidationStatus(defaultProps.validationStatus),
    mode: {
      description: "The mode of the datepicker (single or range)",
      valueType: "string",
      availableValues: DatePickerModeValues,
      defaultValue: defaultProps.mode,
    },
    dateFormat: {
      description: "The format of the date displayed in the input field",
      valueType: "string",
      defaultValue: defaultProps.dateFormat,
      availableValues: dateFormats,
    },
    showWeekNumber: {
      description: "Whether to show the week number in the calendar",
      valueType: "boolean",
      defaultValue: defaultProps.showWeekNumber,
    },
    weekStartsOn: {
      description: "The first day of the week. 0 is Sunday, 1 is Monday, etc.",
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
    startDate: {
      description:
        "The earliest month to start the month navigation from (inclusive). " +
        "If not defined, the component allows any dates in the past. " +
        "Accepts the same date format as the `initialValue`." +
        "Example: '2023-01-01' ensures the first month to select a date from is January 2023.",
      valueType: "string",
    },
    endDate: {
      description:
        "The latest month to start the month navigation from (inclusive). " +
        "If not defined, the component allows any future dates. " +
        "Accepts the same date format as the `initialValue`." +
        "Example: '2023-12-31' ensures the last month to select a date from is December 2023.",
      valueType: "string",
    },
    disabledDates: {
      description: "An optional array of dates that are to be disabled.",
      valueType: "any",
    },
    inline: {
      description:
        "If set to true, the calendar is always visible and its panel is rendered as part of the layout." +
        " If false, the calendar is shown in a popup when the input is focused or clicked.",
      valueType: "boolean",
      defaultValue: defaultProps.inline,
    },
    startText: dStartText(),
    startIcon: dStartIcon(),
    endText: dEndText(),
    endIcon: dEndIcon(),
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
        value: "The new value to set for the date picker.",
      },
    },
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    [`boxShadow-menu-${COMP}`]: "$boxShadow-md",
    [`borderRadius-menu-${COMP}`]: "$borderRadius",
    [`textColor-value-${COMP}`]: "$textColor-primary",
    [`borderColor-selectedItem-${COMP}`]: "$color-primary-200",
    [`backgroundColor-menu-${COMP}`]: "$color-surface-50",
    [`backgroundColor-item-${COMP}--hover`]: "$color-surface-100",
    [`backgroundColor-item-${COMP}--active`]: "$color-surface-200",
    [`paddingVertical-${COMP}`]: "$space-2",
    [`paddingHorizontal-${COMP}`]: "$space-2",
  },
});

export const datePickerComponentRenderer = createComponentRenderer(
  COMP,
  DatePickerMd,
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
      <DatePicker
        className={className}
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
        startDate={extractValue(node.props.startDate)}
        endDate={extractValue(node.props.endDate)}
        disabledDates={extractValue(node.props.disabledDates)}
        inline={extractValue.asOptionalBoolean(node.props.inline)}
        startText={extractValue.asOptionalString(node.props.startText)}
        startIcon={extractValue.asOptionalString(node.props.startIcon)}
        endText={extractValue.asOptionalString(node.props.endText)}
        endIcon={extractValue.asOptionalString(node.props.endIcon)}
        readOnly={extractValue.asOptionalBoolean(node.props.readOnly)}
        autoFocus={extractValue.asOptionalBoolean(node.props.autoFocus)}
      />
    );
  },
);
