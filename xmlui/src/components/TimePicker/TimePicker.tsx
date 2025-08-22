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
    "`TimePicker` provides an interactive time selection interface using the extracted " +
    "react-time-picker source code directly. Users can input time values via keyboard " +
    "with support for various time formats including 12-hour and 24-hour displays " +
    "and configurable precision levels. This version does not include the clock popup.",
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
        {...node.props}
        className={className}
        initialValue={extractedInitialValue}
        value={stateValue}
        updateState={updateState}
        registerComponentApi={registerComponentApi}
      />
    );
  },
);
