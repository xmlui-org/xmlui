import styles from "./TimeInput.module.scss";

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
  dLostFocus,
  dReadonly,
  dStartIcon,
  dStartText,
  dValidationStatus,
} from "../metadata-helpers";
import { TimeInputNative, defaultProps } from "./TimeInputNative";

const COMP = "TimeInput";

export const TimeInputMd = createMetadata({
  status: "experimental",
  description:
    "`TimeInput` provides time input with support for 12-hour and 24-hour formats " +
    "and configurable precision for hours, minutes, and seconds.",
  parts: {
    hour: {
      description: "The hour input field.",
    },
    minute: {
      description: "The minute input field.",
    },
    second: {
      description: "The second input field.",
    },
    ampm: {
      description: "The AM/PM indicator.",
    },
    clearButton: {
      description: "The button to clear the time input.",
    },
  },
  props: {
    initialValue: dInitialValue(),
    autoFocus: dAutoFocus(),
    readOnly: dReadonly(),
    enabled: dEnabled(defaultProps.enabled),
    validationStatus: dValidationStatus(defaultProps.validationStatus),
    hour24: {
      description: "Whether to use 24-hour format (true) or 12-hour format with AM/PM (false)",
      valueType: "boolean",
      defaultValue: defaultProps.hour24,
    },
    seconds: {
      description: "Whether to show and allow input of seconds",
      valueType: "boolean", 
      defaultValue: defaultProps.seconds,
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
      description: "The icon to display in the clear button.",
      valueType: "string",
    },
    clearToInitialValue: {
      description: "Whether the clear button resets the time input to its initial value",
      valueType: "boolean",
      defaultValue: defaultProps.clearToInitialValue,
    },
    required: {
      description: "Whether the time input should be required",
      valueType: "boolean",
      defaultValue: defaultProps.required,
    },
    startText: dStartText(),
    startIcon: dStartIcon(),
    endText: dEndText(),
    endIcon: dEndIcon(),
    gap: {
      description:
        "This property defines the gap between the adornments and the input area. If not " +
        "set, the gap declared by the current theme is used.",
      valueType: "string",
    },
    emptyCharacter: {
      description: "Character to use as placeholder for empty time values. If longer than 1 character, uses the first character. Defaults to '-'",
      valueType: "string",
      defaultValue: defaultProps.emptyCharacter,
    },
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
    isoValue: {
      description: `Get the current time value formatted in ISO standard (HH:MM:SS) using 24-hour format, suitable for JSON serialization.`,
      signature: "isoValue(): string | null",
    },
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    // TimeInput specific theme variables
    [`paddingHorizontal-${COMP}`]: "$space-2",
    [`paddingVertical-${COMP}`]: "$space-2",
    [`color-divider-${COMP}`]: "$textColor-secondary",
    [`spacing-divider-${COMP}`]: "1px 0",
    [`width-input-${COMP}`]: "1.8em",
    [`minWidth-input-${COMP}`]: "0.54em",
    [`padding-input-${COMP}`]: "0 2px",
    [`textAlign-input-${COMP}`]: "center",
    [`fontSize-input-${COMP}`]: "inherit",
    [`borderRadius-input-${COMP}`]: "$borderRadius",
    [`backgroundColor-input-${COMP}-invalid`]: "rgba(220, 53, 69, 0.15)",
    [`padding-button-${COMP}`]: "4px 4px",
    [`borderRadius-button-${COMP}`]: "$borderRadius",
    [`hoverColor-button-${COMP}`]: "$color-surface-800",
    [`disabledColor-button-${COMP}`]: "$textColor-disabled",
    [`outlineColor-button-${COMP}--focused`]: "$color-accent-500",
    [`outlineWidth-button-${COMP}--focused`]: "2px",
    [`outlineOffset-button-${COMP}--focused`]: "0",
    [`minWidth-ampm-${COMP}`]: "2.2em",
    [`fontSize-ampm-${COMP}`]: "inherit",
  },
});

export const timeInputComponentRenderer = createComponentRenderer(
  COMP,
  TimeInputMd,
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
      <TimeInputNative
        className={className}
        initialValue={extractedInitialValue}
        value={stateValue}
        updateState={updateState}
        registerComponentApi={registerComponentApi}
        enabled={extractValue.asOptionalBoolean(node.props.enabled, defaultProps.enabled)}
        autoFocus={extractValue.asOptionalBoolean(node.props.autoFocus, defaultProps.autoFocus)}
        readOnly={extractValue.asOptionalBoolean(node.props.readOnly, defaultProps.readOnly)}
        validationStatus={extractValue(node.props.validationStatus)}
        hour24={extractValue.asOptionalBoolean(node.props.hour24, defaultProps.hour24)}
        seconds={extractValue.asOptionalBoolean(node.props.seconds, defaultProps.seconds)}
        minTime={extractValue(node.props.minTime)}
        maxTime={extractValue(node.props.maxTime)}
        clearable={extractValue.asOptionalBoolean(node.props.clearable, defaultProps.clearable)}
        clearIcon={extractValue(node.props.clearIcon)}
        clearToInitialValue={extractValue.asOptionalBoolean(node.props.clearToInitialValue, defaultProps.clearToInitialValue)}
        required={extractValue.asOptionalBoolean(node.props.required, defaultProps.required)}
        startText={extractValue(node.props.startText)}
        startIcon={extractValue(node.props.startIcon)}
        endText={extractValue(node.props.endText)}
        endIcon={extractValue(node.props.endIcon)}
        gap={extractValue.asOptionalString(node.props.gap)}
        emptyCharacter={extractValue.asOptionalString(node.props.emptyCharacter, defaultProps.emptyCharacter)}
        onDidChange={lookupEventHandler("didChange")}
        onFocus={lookupEventHandler("gotFocus")}
        onBlur={lookupEventHandler("lostFocus")}
        onInvalidChange={lookupEventHandler("invalidTime")}
      />
    );
  },
);
