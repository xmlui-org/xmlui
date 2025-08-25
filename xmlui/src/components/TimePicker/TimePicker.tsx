import styles from "./TimePicker.module.scss";

import { createComponentRenderer } from "../../components-core/renderers";
import { parseScssVar } from "../../components-core/theming/themeVars";
import {
  createMetadata,
  d,
  dAutoFocus,
  dDidChange,
  dEnabled,
  dEndIcon,
  dEndText,
  dGotFocus,
  dInitialValue,
  dLabel,
  dLabelBreak,
  dLabelPosition,
  dLabelWidth,
  dLostFocus,
  dPlaceholder,
  dReadonly,
  dSetValueApi,
  dStartIcon,
  dStartText,
  dValidationStatus,
} from "../metadata-helpers";
import {
  TimePickerNative,
  TimePickerFormatValues,
  TimePickerMaxDetailValues,
  defaultProps,
} from "./TimePickerNative";

const COMP = "TimePicker";

export const TimePickerMd = createMetadata({
  status: "experimental",
  description:
    "`TimePicker` provides time input with support for 12-hour and 24-hour formats " +
    "and configurable precision for hours, minutes, and seconds.",
  props: {
    placeholder: dPlaceholder(),
    initialValue: dInitialValue(),
    autoFocus: dAutoFocus(),
    readOnly: dReadonly(),
    enabled: dEnabled(defaultProps.enabled),
    validationStatus: dValidationStatus(defaultProps.validationStatus),
    label: dLabel(),
    labelPosition: dLabelPosition("top"),
    labelWidth: dLabelWidth(COMP),
    labelBreak: dLabelBreak(COMP),
    format: {
      description: "Time format based on Unicode Technical Standard #35. Supported values include H, HH, h, hh, m, mm, s, ss, a",
      valueType: "string",
      defaultValue: defaultProps.format,
      availableValues: TimePickerFormatValues,
    },
    maxDetail: {
      description: "How detailed time picking shall be. Controls the precision of time selection",
      valueType: "string",
      availableValues: TimePickerMaxDetailValues,
      defaultValue: defaultProps.maxDetail,
    },
    minTime: {
      description: "Minimum time that the user can select",
      valueType: "string",
    },
    maxTime: {
      description: "Maximum time that the user can select", 
      valueType: "string",
    },
    clearable: {
      description: "Whether to show a clear button that allows clearing the selected time",
      valueType: "boolean",
      defaultValue: defaultProps.clearable,
    },
    clearIcon: {
      description: "Content of the clear button. Set to null to hide the icon", 
      valueType: "string",
    },
    required: {
      description: "Whether the time input should be required",
      valueType: "boolean",
      defaultValue: defaultProps.required,
    },
    name: {
      description: "Input name attribute",
      valueType: "string",
      defaultValue: defaultProps.name,
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
    invalidTime: d("Fired when the user enters an invalid time"),
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
        value: "The new time value to set for the time picker.",
      },
    },
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    [`Input:borderRadius-${COMP}-default`]: "$borderRadius",
    [`Input:borderColor-${COMP}-default`]: "$borderColor-input",
    [`Input:borderWidth-${COMP}-default`]: "1px",
    [`Input:borderStyle-${COMP}-default`]: "solid",
    [`Input:backgroundColor-${COMP}-default`]: "$color-surface-50",
    [`Input:boxShadow-${COMP}-default`]: "none",
    [`Input:textColor-${COMP}-default`]: "$textColor-primary",
    [`Input:padding-${COMP}-default`]: "$space-2 $space-3",
    [`Input:gap-adornment-${COMP}`]: "$space-2",
    [`Input:textColor-placeholder-${COMP}-default`]: "$textColor-tertiary",
    [`Input:fontSize-placeholder-${COMP}-default`]: "inherit",
    [`Input:color-adornment-${COMP}-default`]: "$textColor-secondary",
    // Error styling following TextBox pattern
    [`Input:backgroundColor-${COMP}-error`]: "rgba(220, 53, 69, 0.15)",
    [`Input:borderColor-${COMP}-error`]: "$color-danger-500",
    // TimePicker specific theme variables
    [`color-divider-${COMP}`]: "$textColor-secondary",
    [`spacing-divider-${COMP}`]: "1px 0",
    [`width-input-${COMP}`]: "1.8em",
    [`minWidth-input-${COMP}`]: "0.54em",
    [`padding-input-${COMP}`]: "0 2px",
    [`textAlign-input-${COMP}`]: "center",
    [`fontSize-input-${COMP}`]: "inherit",
    [`borderRadius-input-${COMP}`]: "$borderRadius",
    [`backgroundColor-input-${COMP}-invalid`]: "rgba(220, 53, 69, 0.15)",
    [`padding-button-${COMP}`]: "4px 6px",
    [`borderRadius-button-${COMP}`]: "$borderRadius",
    [`hoverColor-button-${COMP}`]: "$color-surface-800",
    [`disabledColor-button-${COMP}`]: "$textColor-disabled",
    [`outlineColor-button-${COMP}--focused`]: "$color-accent-500",
    [`outlineWidth-button-${COMP}--focused`]: "2px",
    [`outlineOffset-button-${COMP}--focused`]: "2px",
    [`minWidth-ampm-${COMP}`]: "3em",
    [`fontSize-ampm-${COMP}`]: "inherit",
  },
});

export const timePickerComponentRenderer = createComponentRenderer(
  COMP,
  TimePickerMd,
  ({
    node,
    state,
    updateState,
    extractValue,
    className,
    lookupEventHandler,
    registerComponentApi,
  }) => {
    const extractedInitialValue = extractValue(node.props.initialValue);
    const stateValue = state?.value;
    
    return (
      <TimePickerNative
        className={className}
        initialValue={extractedInitialValue}
        value={stateValue}
        updateState={updateState}
        registerComponentApi={registerComponentApi}
        enabled={extractValue.asOptionalBoolean(node.props.enabled, defaultProps.enabled)}
        placeholder={extractValue.asOptionalString(node.props.placeholder)}
        autoFocus={extractValue.asOptionalBoolean(node.props.autoFocus, defaultProps.autoFocus)}
        readOnly={extractValue.asOptionalBoolean(node.props.readOnly, defaultProps.readOnly)}
        validationStatus={extractValue(node.props.validationStatus)}
        format={extractValue(node.props.format)}
        maxDetail={extractValue(node.props.maxDetail)}
        minTime={extractValue(node.props.minTime)}
        maxTime={extractValue(node.props.maxTime)}
        clearable={extractValue.asOptionalBoolean(node.props.clearable, defaultProps.clearable)}
        clearIcon={extractValue(node.props.clearIcon)}
        required={extractValue.asOptionalBoolean(node.props.required, defaultProps.required)}
        name={extractValue(node.props.name)}
        label={extractValue(node.props.label)}
        labelPosition={extractValue(node.props.labelPosition)}
        labelWidth={extractValue(node.props.labelWidth)}
        labelBreak={extractValue.asOptionalBoolean(node.props.labelBreak, defaultProps.labelBreak)}
        startText={extractValue(node.props.startText)}
        startIcon={extractValue(node.props.startIcon)}
        endText={extractValue(node.props.endText)}
        endIcon={extractValue(node.props.endIcon)}
        onDidChange={lookupEventHandler("didChange")}
        onFocus={lookupEventHandler("gotFocus")}
        onBlur={lookupEventHandler("lostFocus")}
        onInvalidChange={lookupEventHandler("invalidTime")}
      />
    );
  },
);
