import { wrapComponent } from "../../runtime/rendering/adapter";
import { DateInputMd } from "./DateInput";
import { defaultProps } from "./DateInput.defaults";
import { DateInputNative, type DateInputApi } from "./DateInputReact";

const COMP = "DateInput";

export const dateInputRenderer = wrapComponent({
  name: COMP,
  metadata: DateInputMd,
  defaultPart: "input",
  renderer: ({ adapter }) => (
    <DateInputNative
      {...adapter.rootAttrs("input")}
      ref={(api: DateInputApi | null) => {
        if (api) {
          adapter.registerApi(api as unknown as Record<string, unknown>);
        }
      }}
      id={adapter.stringProp("id")}
      bindTo={adapter.stringProp("bindTo")}
      value={adapter.prop("value")}
      initialValue={adapter.prop("initialValue")}
      label={adapter.prop("label")}
      enabled={adapter.booleanProp("enabled", defaultProps.enabled)}
      readOnly={adapter.booleanProp("readOnly", defaultProps.readOnly)}
      required={adapter.booleanProp("required", defaultProps.required)}
      autoFocus={adapter.booleanProp("autoFocus", defaultProps.autoFocus)}
      validationStatus={adapter.stringProp("validationStatus", defaultProps.validationStatus)}
      mode={adapter.stringProp("mode", defaultProps.mode)}
      dateFormat={adapter.stringProp("dateFormat", defaultProps.dateFormat)}
      showWeekNumber={adapter.booleanProp("showWeekNumber", defaultProps.showWeekNumber)}
      weekStartsOn={Number(adapter.prop("weekStartsOn", defaultProps.weekStartsOn))}
      minValue={adapter.stringProp("minValue")}
      maxValue={adapter.stringProp("maxValue")}
      disabledDates={adapter.prop("disabledDates")}
      inline={adapter.booleanProp("inline", defaultProps.inline)}
      clearable={adapter.booleanProp("clearable", defaultProps.clearable)}
      clearIcon={adapter.stringProp("clearIcon")}
      clearToInitialValue={adapter.booleanProp("clearToInitialValue", defaultProps.clearToInitialValue)}
      emptyCharacter={adapter.stringProp("emptyCharacter", defaultProps.emptyCharacter)}
      startText={adapter.prop("startText")}
      startIcon={adapter.prop("startIcon")}
      endText={adapter.prop("endText")}
      endIcon={adapter.prop("endIcon")}
      gap={adapter.stringProp("gap")}
      verboseValidationFeedback={
        Object.prototype.hasOwnProperty.call(adapter.props, "verboseValidationFeedback")
          ? adapter.booleanProp("verboseValidationFeedback", true)
          : undefined
      }
      validationIconSuccess={adapter.stringProp("validationIconSuccess")}
      validationIconError={adapter.stringProp("validationIconError")}
      invalidMessages={adapter.prop("invalidMessages") as string[] | undefined}
      onDidChange={(value) => {
        void adapter.event("didChange")(value);
      }}
      onFocus={() => {
        void adapter.event("gotFocus")();
        void adapter.event("focus")();
      }}
      onBlur={() => {
        void adapter.event("lostFocus")();
      }}
      onInvalidChange={() => {
        void adapter.event("invalidChange")();
      }}
    />
  ),
});
