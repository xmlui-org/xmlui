import { wrapComponent } from "../../runtime/rendering/adapter";
import { CheckboxMd } from "./Checkbox";
import { defaultProps } from "./Checkbox.defaults";
import { CheckboxNative, type CheckboxApi } from "./CheckboxReact";

const COMP = "Checkbox";

export const checkboxRenderer = wrapComponent({
  name: COMP,
  metadata: CheckboxMd,
  defaultPart: "input",
  renderer: ({ adapter }) => {
    const apiRef = { current: null as CheckboxApi | null };
    return (
      <CheckboxNative
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
        labelPosition={adapter.stringProp("labelPosition", "end")}
        labelBreak={adapter.booleanProp("labelBreak", false)}
        labelWidth={adapter.prop("labelWidth")}
        direction={adapter.stringProp("direction")}
        enabled={adapter.booleanProp("enabled", defaultProps.enabled)}
        readOnly={adapter.booleanProp("readOnly", false)}
        required={adapter.booleanProp("required", false)}
        autoFocus={adapter.booleanProp("autoFocus", false)}
        indeterminate={adapter.booleanProp("indeterminate", defaultProps.indeterminate)}
        validationStatus={adapter.stringProp("validationStatus", defaultProps.validationStatus)}
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
