import styles from "../Toggle/Toggle.module.scss";

import { createMetadata, d } from "../../abstractions/ComponentDefs";
import { createComponentRenderer } from "../../components-core/renderers";
import { parseScssVar } from "../../components-core/theming/themeVars";
import {
  dAutoFocus,
  dClick,
  dDidChange,
  dEnabled,
  dGotFocus,
  dIndeterminate,
  dInitialValue,
  dInternal,
  dLabel,
  dLabelBreak,
  dLabelPosition,
  dLabelWidth,
  dLostFocus,
  dReadonly,
  dRequired,
  dSetValueApi,
  dValidationStatus,
  dValueApi,
} from "../metadata-helpers";
import { defaultProps, Toggle } from "../Toggle/Toggle";

const COMP = "Switch";

export const SwitchMd = createMetadata({
  description:
    `The \`${COMP}\` component is a user interface element that allows users to toggle between two states: ` +
    `on and off. It consists of a small rectangular or circular button that can be moved left or right to ` +
    `change its state.`,
  props: {
    indeterminate: dIndeterminate(defaultProps.indeterminate),
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
    gotFocus: dGotFocus(COMP),
    lostFocus: dLostFocus(COMP),
    didChange: dDidChange(COMP),
  },
  apis: {
    value: dValueApi(),
    setValue: dSetValueApi(),
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    [`borderColor-checked-${COMP}-error`]: `$borderColor-${COMP}-error`,
    [`backgroundColor-checked-${COMP}-error`]: `$borderColor-${COMP}-error`,
    [`borderColor-checked-${COMP}-warning`]: `$borderColor-${COMP}-warning`,
    [`backgroundColor-checked-${COMP}-warning`]: `$borderColor-${COMP}-warning`,
    [`borderColor-checked-${COMP}-success`]: `$borderColor-${COMP}-success`,
    [`backgroundColor-checked-${COMP}-success`]: `$borderColor-${COMP}-success`,
    [`backgroundColor-${COMP}`]: "$color-surface-400",
    [`borderColor-${COMP}`]: "$color-surface-400",
    [`backgroundColor-indicator-${COMP}`]: "$backgroundColor-primary",
    [`borderColor-checked-${COMP}`]: "$color-primary-500",
    [`backgroundColor-checked-${COMP}`]: "$color-primary-500",
    [`backgroundColor-${COMP}--disabled`]: "$color-surface-200",
  },
});

export const switchComponentRenderer = createComponentRenderer(
  COMP,
  SwitchMd,
  ({
    node,
    extractValue,
    layoutCss,
    updateState,
    state,
    lookupEventHandler,
    registerComponentApi,
  }) => {
    return (
      <Toggle
        enabled={extractValue.asOptionalBoolean(node.props.enabled)}
        style={layoutCss}
        initialValue={extractValue.asOptionalBoolean(
          node.props.initialValue,
          defaultProps.initialValue,
        )}
        value={state?.value}
        readOnly={extractValue.asOptionalBoolean(node.props.readOnly)}
        validationStatus={extractValue(node.props.validationStatus)}
        updateState={updateState}
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
