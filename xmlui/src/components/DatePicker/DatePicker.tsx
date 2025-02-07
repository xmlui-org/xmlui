import { createComponentRenderer } from "../../components-core/renderers";
import styles from "./DatePicker.module.scss";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { createMetadata, d } from "../../abstractions/ComponentDefs";
import { DatePicker } from "./DatePickerNative";
import {
  dAutoFocus,
  dDidChange,
  dEnabled,
  dFocus,
  dGotFocus,
  dInitialValue,
  dLostFocus,
  dPlaceholder,
  dReadonly,
  dSetValueApi,
  dValidationStatus,
} from "@components/metadata-helpers";

const COMP = "DatePicker";

export const DatePickerMd = createMetadata({
  status: "experimental",
  description: "A datepicker component enables the selection of a date or a range of dates in a specified format from an interactive display.",
  props: {
    placeholder: dPlaceholder(),
    initialValue: dInitialValue(),
    autoFocus: dAutoFocus(),
    readOnly: dReadonly(),
    enabled: dEnabled(),
    validationStatus: dValidationStatus(),
    mode: d("The mode of the datepicker (single or range)"),
    dateFormat: d("The format of the date displayed in the input field"),
    showWeekNumber: d("Whether to show the week number in the calendar"),
    weekStartsOn: d("The first day of the week. 0 is Sunday, 1 is Monday, etc."),
    fromDate: d("The start date of the range of selectable dates"),
    toDate: d("The end date of the range of selectable dates"),
    disabledDates: d("An array of dates that are disabled"),
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
    [`shadow-menu-${COMP}`]: "$shadow-md",
    [`radius-menu-${COMP}`]: "$radius",
    [`color-text-value-${COMP}`]: "$color-text-primary",
    [`color-bg-menu-${COMP}`]: "$color-bg-primary",
    [`color-bg-item-${COMP}--hover`]: "$color-bg-dropdown-item--active",
    [`color-bg-item-${COMP}--active`]: "$color-bg-dropdown-item--active",
    light: {
      [`color-bg-menu-${COMP}`]: "$color-bg-primary",
    },
    dark: {
      [`color-bg-menu-${COMP}`]: "$color-bg-primary",
    },
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
      />
    );
  },
);
