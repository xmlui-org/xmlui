import { createMetadata, d } from "../../abstractions/ComponentDefs";
import { createComponentRenderer } from "../../components-core/renderers";
import { ColorPicker } from "./ColorPickerNative";
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
  dRequired,
  dSetValueApi,
  dValidationStatus,
  dValue,
} from "../metadata-helpers";
import { parseScssVar } from "../../components-core/theming/themeVars";
import styles from "./ColorPicker.module.scss";

const COMP = "ColorPicker";

export const ColorPickerMd = createMetadata({
  description: ``,
  props: {
    initialValue: dInitialValue(),
    label: dLabel(),
    labelPosition: dLabelPosition("top"),
    labelWidth: dLabelWidth(COMP),
    labelBreak: dLabelBreak(COMP),
    enabled: dEnabled(),
    autoFocus: dAutoFocus(),
    required: dRequired(),
    validationStatus: dValidationStatus(),
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
        enabled={extractValue.asOptionalBoolean(node.props?.enabled)}
        autoFocus={extractValue.asOptionalBoolean(node.props?.autoFocus)}
        label={extractValue(node.props?.label)}
        labelPosition={extractValue(node.props?.labelPosition)}
        labelBreak={extractValue(node.props?.labelBreak)}
        labelWidth={extractValue(node.props?.labelWidth)}
      />
    );
  },
);
