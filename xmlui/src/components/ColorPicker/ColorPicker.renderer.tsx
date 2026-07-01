import { wrapComponent } from "../../runtime/rendering/adapter";
import { ColorPickerMd } from "./ColorPicker";
import { defaultProps } from "./ColorPicker.defaults";
import { ColorPickerNative } from "./ColorPickerReact";

const COMP = "ColorPicker";

export const colorPickerRenderer = wrapComponent({
  name: COMP,
  metadata: ColorPickerMd,
  defaultPart: "input",
  renderer: ({ adapter }) => {
    return (
      <ColorPickerNative
        {...adapter.rootAttrs("input")}
        registerComponentApi={adapter.registerApi}
        id={adapter.stringProp("id")}
        bindTo={adapter.stringProp("bindTo")}
        value={adapter.prop("value")}
        initialValue={adapter.prop("initialValue", defaultProps.initialValue)}
        label={adapter.prop("label")}
        requireLabelMode={adapter.stringProp("requireLabelMode")}
        enabled={adapter.booleanProp("enabled", defaultProps.enabled)}
        readOnly={adapter.booleanProp("readOnly", false)}
        required={adapter.booleanProp("required", false)}
        autoFocus={adapter.booleanProp("autoFocus", false)}
        validationStatus={adapter.stringProp("validationStatus", defaultProps.validationStatus)}
        onDidChange={(value) => {
          void adapter.event("didChange")(value);
        }}
        onFocus={() => {
          void adapter.event("gotFocus")();
        }}
        onBlur={() => {
          void adapter.event("lostFocus")();
        }}
      />
    );
  },
});
