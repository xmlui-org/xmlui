import { wrapComponent } from "../../runtime/rendering/adapter";
import { ColorPickerMd } from "./ColorPicker";
import { defaultProps } from "./ColorPicker.defaults";
import { ColorPickerNative, type ColorPickerApi } from "./ColorPickerReact";

const COMP = "ColorPicker";

export const colorPickerRenderer = wrapComponent({
  name: COMP,
  metadata: ColorPickerMd,
  defaultPart: "input",
  renderer: ({ adapter }) => {
    const apiRef = { current: null as ColorPickerApi | null };
    return (
      <ColorPickerNative
        {...adapter.rootAttrs("input")}
        ref={(api) => {
          apiRef.current = api;
          if (api) {
            adapter.registerApi(api as unknown as Record<string, unknown>);
          }
        }}
        id={adapter.stringProp("id")}
        value={adapter.prop("value")}
        initialValue={adapter.prop("initialValue", defaultProps.initialValue)}
        label={adapter.prop("label")}
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
