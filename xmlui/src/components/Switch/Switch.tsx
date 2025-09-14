import styles from "../Toggle/Toggle.module.scss";

import { createComponentRenderer } from "../../components-core/renderers";
import { parseScssVar } from "../../components-core/theming/themeVars";
import {
  createMetadata,
  dAutoFocus,
  dClick,
  dDidChange,
  dEnabled,
  dGotFocus,
  dInitialValue,
  dInternal,
  dLabel,
  dLabelBreak,
  dLabelPosition,
  dLabelWidth,
  dLostFocus,
  dReadonly,
  dRequired,
  dValidationStatus,
} from "../metadata-helpers";
import { defaultProps, Toggle } from "../Toggle/Toggle";

const COMP = "Switch";

export const SwitchMd = createMetadata({
  status: "stable",
  description: "`Switch` enables users to toggle between two states: on and off.",
  parts: {
    label: {
      description: "The label displayed for the switch.",
    },
    input: {
      description: "The switch input area.",
    },
  },
  props: {
    label: dLabel(),
    labelPosition: dLabelPosition("end"),
    labelWidth: dLabelWidth(COMP),
    labelBreak: dLabelBreak(COMP),
    required: dRequired(),
    initialValue: dInitialValue(defaultProps.initialValue),
    autoFocus: dAutoFocus(),
    readOnly: dReadonly(),
    enabled: dEnabled(),
    validationStatus: dValidationStatus(defaultProps.validationStatus),
    description: dInternal(
      `(*** NOT IMPLEMENTED YET ***) This optional property displays an alternate description ` +
        `of the ${COMP} besides its label.`,
    ),
  },
  events: {
    click: dClick(COMP),
    gotFocus: dGotFocus(COMP),
    lostFocus: dLostFocus(COMP),
    didChange: dDidChange(COMP),
  },
  apis: {
    value: {
      description:
        `This property holds the current value of the ${COMP}, which can be either ` +
        `"true" (on) or "false" (off).`,
      signature: "get value():boolean",
    },
    setValue: {
      description: `This API sets the value of the \`${COMP}\`. You can use it to programmatically change the value.`,
      signature: "setValue(value: boolean): void",
      parameters: {
        value: "The new value to set. Can be either true (on) or false (off).",
      },
    },
  },
  themeVars: parseScssVar(styles.themeVars),
  limitThemeVarsToComponent: true,
  defaultThemeVars: {
    [`borderColor-checked-${COMP}-error`]: `$borderColor-${COMP}-error`,
    [`backgroundColor-checked-${COMP}-error`]: `$borderColor-${COMP}-error`,
    [`borderColor-checked-${COMP}-warning`]: `$borderColor-${COMP}-warning`,
    [`backgroundColor-checked-${COMP}-warning`]: `$borderColor-${COMP}-warning`,
    [`borderColor-checked-${COMP}-success`]: `$borderColor-${COMP}-success`,
    [`backgroundColor-checked-${COMP}-success`]: `$borderColor-${COMP}-success`,
    [`backgroundColor-${COMP}`]: "$color-surface-0",
    [`borderColor-${COMP}`]: "$color-surface-200",
    [`borderWidth-${COMP}`]: "1px",
    [`backgroundColor-indicator-${COMP}`]: "$color-surface-400",
    [`backgroundColor-${COMP}-indicator--disabled`]: "$backgroundColor-primary",
    [`backgroundColor-indicator-checked-${COMP}`]: "$backgroundColor-primary",
    [`borderColor-checked-${COMP}`]: "$color-primary-500",
    [`backgroundColor-checked-${COMP}`]: "$color-primary-500",
    [`backgroundColor-${COMP}--disabled`]: "$color-surface-200",

    dark: {
      [`backgroundColor-indicator-${COMP}`]: "$color-surface-500",
    },
  },
});

export const switchComponentRenderer = createComponentRenderer(
  COMP,
  SwitchMd,
  ({
    node,
    extractValue,
    className,
    updateState,
    state,
    lookupEventHandler,
    registerComponentApi,
  }) => {
    return (
      <Toggle
        enabled={extractValue.asOptionalBoolean(node.props.enabled)}
        className={className}
        initialValue={extractValue.asOptionalBoolean(
          node.props.initialValue,
          defaultProps.initialValue,
        )}
        value={state?.value}
        readOnly={extractValue.asOptionalBoolean(node.props.readOnly)}
        validationStatus={extractValue(node.props.validationStatus)}
        updateState={updateState}
        autoFocus={extractValue.asOptionalBoolean(node.props.autoFocus)}
        onClick={lookupEventHandler("click")}
        onDidChange={lookupEventHandler("didChange")}
        onFocus={lookupEventHandler("gotFocus")}
        onBlur={lookupEventHandler("lostFocus")}
        label={extractValue(node.props.label)}
        labelPosition={extractValue(node.props.labelPosition)}
        labelWidth={extractValue(node.props.labelWidth)}
        labelBreak={extractValue.asOptionalBoolean(node.props.labelBreak)}
        required={extractValue.asOptionalBoolean(node.props.required)}
        variant="switch"
        registerComponentApi={registerComponentApi}
      />
    );
  },
);
