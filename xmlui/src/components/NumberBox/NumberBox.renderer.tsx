import { wrapComponent } from "../../runtime/rendering/adapter";
import { NumberBoxMd } from "./NumberBox";
import { defaultProps } from "./NumberBox.defaults";
import { NumberBoxNative } from "./NumberBoxReact";

const COMP = "NumberBox";

export const numberBoxRenderer = wrapComponent({
  name: COMP,
  metadata: NumberBoxMd,
  defaultPart: "input",
  renderer({ adapter }) {
    return (
      <NumberBoxNative
        {...adapter.rootAttrs("input")}
        registerComponentApi={adapter.registerApi}
        id={adapter.stringProp("id")}
        bindTo={adapter.stringProp("bindTo")}
        value={adapter.prop("value")}
        initialValue={adapter.prop("initialValue", defaultProps.initialValue)}
        label={adapter.prop("label")}
        labelPosition={adapter.stringProp("labelPosition", "top")}
        labelWidth={adapter.prop("labelWidth")}
        requireLabelMode={adapter.stringProp("requireLabelMode")}
        direction={adapter.stringProp("direction")}
        placeholder={adapter.stringProp("placeholder")}
        maxLength={adapter.prop("maxLength") as number | undefined}
        enabled={adapter.booleanProp("enabled", defaultProps.enabled)}
        readOnly={adapter.booleanProp("readOnly", false)}
        required={adapter.booleanProp("required", false)}
        autoFocus={adapter.booleanProp("autoFocus", false)}
        startText={adapter.prop("startText")}
        startIcon={adapter.prop("startIcon")}
        endText={adapter.prop("endText")}
        endIcon={adapter.prop("endIcon")}
        gap={adapter.stringProp("gap")}
        hasSpinBox={adapter.booleanProp("hasSpinBox", defaultProps.hasSpinBox)}
        spinnerUpIcon={adapter.stringProp("spinnerUpIcon")}
        spinnerDownIcon={adapter.stringProp("spinnerDownIcon")}
        step={adapter.prop("step", defaultProps.step)}
        integersOnly={adapter.booleanProp("integersOnly", defaultProps.integersOnly)}
        zeroOrPositive={adapter.booleanProp("zeroOrPositive", defaultProps.zeroOrPositive)}
        min={adapter.prop("minValue", defaultProps.min) as number}
        max={adapter.prop("maxValue", defaultProps.max) as number}
        verboseValidationFeedback={
          Object.prototype.hasOwnProperty.call(adapter.props, "verboseValidationFeedback")
            ? adapter.booleanProp("verboseValidationFeedback", true)
            : undefined
        }
        validationStatus={adapter.stringProp("validationStatus", defaultProps.validationStatus)}
        invalidMessages={adapter.prop("invalidMessages", defaultProps.invalidMessages)}
        style={adapter.style}
        className={adapter.className}
        onDidChange={(value) => { void adapter.event("didChange")(value); }}
        onFocus={() => { void adapter.event("gotFocus")(); }}
        onBlur={() => { void adapter.event("lostFocus")(); }}
      />
    );
  },
});
