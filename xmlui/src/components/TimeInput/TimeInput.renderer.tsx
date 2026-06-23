import { wrapComponent } from "../../runtime/rendering/adapter";
import { TimeInputMd } from "./TimeInput";
import { defaultProps } from "./TimeInput.defaults";
import { TimeInputNative, type TimeInputApi } from "./TimeInputReact";

const COMP = "TimeInput";

export const timeInputRenderer = wrapComponent({
  name: COMP,
  metadata: TimeInputMd,
  defaultPart: "input",
  renderer: ({ adapter }) => (
    <TimeInputNative
      {...adapter.rootAttrs("input")}
      ref={(api: TimeInputApi | null) => {
        if (api) {
          adapter.registerApi(api as unknown as Record<string, unknown>);
        }
      }}
      id={adapter.stringProp("id")}
      value={adapter.prop("value")}
      initialValue={adapter.prop("initialValue")}
      label={adapter.prop("label")}
      labelWidth={adapter.stringProp("labelWidth")}
      labelPosition={adapter.stringProp("labelPosition")}
      enabled={adapter.booleanProp("enabled", defaultProps.enabled)}
      readOnly={adapter.booleanProp("readOnly", defaultProps.readOnly)}
      required={adapter.booleanProp("required", defaultProps.required)}
      autoFocus={adapter.booleanProp("autoFocus", defaultProps.autoFocus)}
      validationStatus={adapter.stringProp("validationStatus", defaultProps.validationStatus)}
      hour24={adapter.booleanProp("hour24", defaultProps.hour24)}
      seconds={adapter.booleanProp("seconds", defaultProps.seconds)}
      minTime={adapter.stringProp("minTime")}
      maxTime={adapter.stringProp("maxTime")}
      clearable={adapter.booleanProp("clearable", defaultProps.clearable)}
      clearIcon={adapter.stringProp("clearIcon")}
      clearToInitialValue={adapter.booleanProp("clearToInitialValue", defaultProps.clearToInitialValue)}
      startText={adapter.prop("startText")}
      startIcon={adapter.prop("startIcon")}
      endText={adapter.prop("endText")}
      endIcon={adapter.prop("endIcon")}
      gap={adapter.stringProp("gap")}
      emptyCharacter={adapter.stringProp("emptyCharacter", defaultProps.emptyCharacter)}
      onDidChange={(value) => { void adapter.event("didChange")(value); }}
      onFocus={() => { void adapter.event("gotFocus")(); }}
      onBlur={() => { void adapter.event("lostFocus")(); }}
      onInvalidChange={(value) => { void adapter.event("invalidTime")(value); }}
    />
  ),
});
