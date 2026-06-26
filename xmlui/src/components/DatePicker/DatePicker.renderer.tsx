import { wrapComponent } from "../../runtime/rendering/adapter";
import { DatePickerMd } from "./DatePicker";
import { defaultProps } from "./DatePicker.defaults";
import { DatePickerNative, type DatePickerApi } from "./DatePickerReact";

const COMP = "DatePicker";

export const datePickerRenderer = wrapComponent({
  name: COMP,
  metadata: DatePickerMd,
  defaultPart: "input",
  renderer: ({ adapter }) => (
    <DatePickerNative
      {...adapter.rootAttrs("input")}
      ref={(api: DatePickerApi | null) => {
        if (api) {
          adapter.registerApi(api as unknown as Record<string, unknown>);
        }
      }}
      id={adapter.stringProp("id")}
      bindTo={adapter.stringProp("bindTo")}
      value={adapter.prop("value")}
      initialValue={adapter.prop("initialValue")}
      mode={adapter.stringProp("mode", defaultProps.mode)}
      label={adapter.prop("label")}
      placeholder={adapter.stringProp("placeholder")}
      dateFormat={adapter.stringProp("dateFormat", defaultProps.dateFormat)}
      enabled={adapter.booleanProp("enabled", defaultProps.enabled)}
      readOnly={adapter.booleanProp("readOnly", defaultProps.readOnly)}
      required={adapter.booleanProp("required", defaultProps.required)}
      autoFocus={adapter.booleanProp("autoFocus", defaultProps.autoFocus)}
      inline={adapter.booleanProp("inline", defaultProps.inline)}
      clearable={adapter.booleanProp("clearable", defaultProps.clearable)}
      validationStatus={adapter.stringProp("validationStatus", defaultProps.validationStatus)}
      weekStartsOn={adapter.prop("weekStartsOn", defaultProps.weekStartsOn)}
      showWeekNumber={adapter.booleanProp("showWeekNumber", defaultProps.showWeekNumber)}
      showWeekNumbers={adapter.booleanProp("showWeekNumbers", defaultProps.showWeekNumbers)}
      startDate={adapter.prop("startDate")}
      endDate={adapter.prop("endDate")}
      minValue={adapter.prop("minValue")}
      maxValue={adapter.prop("maxValue")}
      startText={adapter.prop("startText")}
      startIcon={adapter.prop("startIcon")}
      endText={adapter.prop("endText")}
      endIcon={adapter.prop("endIcon")}
      width={adapter.stringProp("width")}
      locale={adapter.stringProp("locale", defaultProps.locale)}
      timeZone={adapter.stringProp("timeZone", defaultProps.timeZone)}
      numOfMonths={adapter.prop("numOfMonths", defaultProps.numOfMonths)}
      presets={adapter.prop("presets")}
      showPresets={adapter.booleanProp("showPresets", defaultProps.showPresets)}
      disabledDates={adapter.prop("disabledDates")}
      confirmRangeSelection={adapter.booleanProp("confirmRangeSelection", defaultProps.confirmRangeSelection)}
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
      }}
      onBlur={() => {
        void adapter.event("lostFocus")();
      }}
    />
  ),
});
