import { wrapComponent } from "../../runtime/rendering/adapter";
import { SwitchMd } from "./Switch";
import { defaultProps } from "./Switch.defaults";
import { SwitchNative, type SwitchApi } from "./SwitchReact";

const COMP = "Switch";

export const switchRenderer = wrapComponent({
  name: COMP,
  metadata: SwitchMd,
  defaultPart: "input",
  renderer: ({ adapter }) => {
    const apiRef = { current: null as SwitchApi | null };
    return (
      <SwitchNative
        {...adapter.rootAttrs("input")}
        ref={(api) => {
          apiRef.current = api;
          if (api) {
            adapter.registerApi(api as unknown as Record<string, unknown>);
          }
        }}
        id={adapter.stringProp("id")}
        bindTo={adapter.stringProp("bindTo")}
        value={adapter.prop("value")}
        initialValue={adapter.prop("initialValue", defaultProps.initialValue)}
        label={adapter.prop("label")}
        labelPosition={adapter.stringProp("labelPosition", "end")}
        labelBreak={adapter.booleanProp("labelBreak", false)}
        labelWidth={adapter.prop("labelWidth")}
        requireLabelMode={adapter.stringProp("requireLabelMode")}
        direction={adapter.stringProp("direction")}
        enabled={adapter.booleanProp("enabled", defaultProps.enabled)}
        readOnly={adapter.booleanProp("readOnly", false)}
        required={adapter.booleanProp("required", false)}
        autoFocus={adapter.booleanProp("autoFocus", false)}
        validationStatus={adapter.stringProp("validationStatus", defaultProps.validationStatus)}
        variant={adapter.stringProp("variant")}
        onClick={(event) => {
          void adapter.event("click")(event);
        }}
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
