import styles from "./DatePicker.module.scss";
import { createMetadata, d } from "../../abstractions/ComponentDefs";

import { createComponentRenderer } from "../../components-core/renderers";
import { parseScssVar } from "../../components-core/theming/themeVars";
import {
  dAutoFocus,
  dDidChange,
  dEnabled, dEndIcon, dEndText,
  dFocus,
  dGotFocus,
  dInitialValue,
  dLostFocus,
  dPlaceholder,
  dReadonly,
  dSetValueApi, dStartIcon, dStartText,
  dValidationStatus,
} from "../metadata-helpers";
import { dateFormats, DatePicker, DatePickerModeValues, defaultProps, WeekDays } from "./DatePickerNative";

const COMP = "DatePicker";

export const DatePickerMd = createMetadata({
  status: "experimental",
  description: "A datepicker component enables the selection of a date or a range of dates in a specified format from an interactive display.",
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
    fromDate: {
      description: "The start date of the range of selectable dates",
      valueType: "string",
    },
    toDate: {
      description: "The end date of the range of selectable dates",
      valueType: "string",
    },
    disabledDates: {
      description: "An array of dates that are disabled",
      valueType: "any",
    },
    inline: {
      description: "Whether to display the datepicker inline",
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
    focus: dFocus(COMP),
    value: d(
      `You can query the component's value. If no value is set, it will retrieve \`undefined\`.`,
    ),
    setValue: dSetValueApi(),
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    [`boxShadow-menu-${COMP}`]: "$boxShadow-md",
    [`borderRadius-menu-${COMP}`]: "$borderRadius",
    [`textColor-value-${COMP}`]: "$textColor-primary",
    [`backgroundColor-menu-${COMP}`]: "$color-surface-50",
    [`backgroundColor-item-${COMP}--hover`]: "$color-surface-100",
    [`backgroundColor-item-${COMP}--active`]: "$color-surface-200",
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
    layoutCss,
    lookupEventHandler,
    registerComponentApi,
  }) => {
    return (
      <DatePicker
        style={layoutCss}
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
        inline={extractValue.asOptionalBoolean(node.props.inline)}
        startText={extractValue.asOptionalString(node.props.startText)}
        startIcon={extractValue.asOptionalString(node.props.startIcon)}
        endText={extractValue.asOptionalString(node.props.endText)}
        endIcon={extractValue.asOptionalString(node.props.endIcon)}
      />
    );
  },
);
