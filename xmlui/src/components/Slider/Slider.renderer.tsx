import { wrapComponent } from "../../runtime/rendering/adapter";
import { SliderMd } from "./Slider";
import { defaultProps } from "./Slider.defaults";
import { SliderNative, type SliderApi } from "./SliderReact";

const COMP = "Slider";

export const sliderRenderer = wrapComponent({
  name: COMP,
  metadata: SliderMd,
  defaultPart: "input",
  renderer: ({ adapter }) => {
    const apiRef = { current: null as SliderApi | null };
    return (
      <SliderNative
        {...adapter.rootAttrs("input")}
        ref={(api) => {
          apiRef.current = api;
          if (api) {
            adapter.registerApi(api as unknown as Record<string, unknown>);
          }
        }}
        id={adapter.stringProp("id")}
        value={adapter.prop("value")}
        initialValue={adapter.prop("initialValue")}
        min={adapter.prop("minValue", defaultProps.min)}
        max={adapter.prop("maxValue", defaultProps.max)}
        step={adapter.prop("step", defaultProps.step)}
        minStepsBetweenThumbs={adapter.prop("minStepsBetweenThumbs", defaultProps.minStepsBetweenThumbs)}
        inverted={adapter.prop("inverted", false)}
        label={adapter.prop("label")}
        labelPosition={adapter.stringProp("labelPosition", "top")}
        labelBreak={adapter.booleanProp("labelBreak", false)}
        labelWidth={adapter.prop("labelWidth")}
        enabled={adapter.booleanProp("enabled", defaultProps.enabled)}
        readOnly={adapter.booleanProp("readOnly", false)}
        required={adapter.booleanProp("required", false)}
        autoFocus={adapter.booleanProp("autoFocus", false)}
        validationStatus={adapter.stringProp("validationStatus", defaultProps.validationStatus)}
        showValues={adapter.booleanProp("showValues", defaultProps.showValues)}
        valueFormat={adapter.prop("valueFormat")}
        title={adapter.stringProp("title")}
        rangeStyle={adapter.prop("rangeStyle")}
        thumbStyle={adapter.prop("thumbStyle")}
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
