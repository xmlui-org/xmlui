import { createMetadata } from "../../abstractions/ComponentDefs";
import { createComponentRenderer } from "../../components-core/renderers";
import { ColorPicker, defaultProps } from "./ColorPickerNative";
import {
  dAutoFocus,
  dDidChange,
  dEnabled,
  dFocus,
  dGotFocus,
  dInitialValue,
  dLabel,
  dLabelBreak,
  dLabelPosition,
  dLabelWidth,
  dLostFocus,
  dReadonly,
  dRequired,
  dSetValueApi,
  dValidationStatus,
  dValue,
} from "../metadata-helpers";
import { parseScssVar } from "../../components-core/theming/themeVars";
import styles from "./ColorPicker.module.scss";

const COMP = "ColorPicker";

export const ColorPickerMd = createMetadata({
  description:
    "This component allows the user to select a color with the browser's default color picker control.",
  props: {
    initialValue: dInitialValue(),
    label: dLabel(),
    labelPosition: dLabelPosition(),
    labelWidth: dLabelWidth(COMP),
    labelBreak: dLabelBreak(COMP),
    enabled: dEnabled(),
    autoFocus: dAutoFocus(),
    required: dRequired(),
    readOnly: dReadonly(),
    validationStatus: dValidationStatus(defaultProps.validationStatus),
  },
  events: {
    didChange: dDidChange(COMP),
    gotFocus: dGotFocus(COMP),
    lostFocus: dLostFocus(COMP),
  },
  apis: {
    focus: dFocus(COMP),
    value: dValue(),
    setValue: dSetValueApi(),
  },
  themeVars: parseScssVar(styles.themeVars),
});

export const colorPickerComponentRenderer = createComponentRenderer(
  "ColorPicker",
  ColorPickerMd,
  ({
    node,
    extractValue,
    layoutCss,
    state,
    lookupEventHandler,
    registerComponentApi,
    updateState,
  }) => {
    const enabled = extractValue.asOptionalBoolean(node.props?.enabled, true);
    const readonly = extractValue.asOptionalBoolean(node.props?.readOnly, false);
    return (
      <ColorPicker
        validationStatus={extractValue(node.props.validationStatus)}
        value={state.value}
        initialValue={extractValue(node.props.initialValue)}
        updateState={updateState}
        onDidChange={lookupEventHandler("didChange")}
        onFocus={lookupEventHandler("gotFocus")}
        onBlur={lookupEventHandler("lostFocus")}
        registerComponentApi={registerComponentApi}
        style={layoutCss}
        required={extractValue.asOptionalBoolean(node.props?.required)}
        enabled={enabled && !readonly}
        autoFocus={extractValue.asOptionalBoolean(node.props?.autoFocus)}
        label={extractValue(node.props?.label)}
        labelPosition={extractValue(node.props?.labelPosition)}
        labelBreak={extractValue(node.props?.labelBreak)}
        labelWidth={extractValue(node.props?.labelWidth)}
      />
    );
  },
);
