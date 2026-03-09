import { SliderRender } from "./SliderRender";
import { wrapCompound } from "../../components-core/wrapComponent";
import { SliderMd } from "./Slider";

// --- wrapCompound: state lifecycle + prop mapping + Radix assembly ---
export const sliderComponentRenderer = wrapCompound("Slider", SliderRender, SliderMd, {
  booleans: ["enabled", "autoFocus", "readOnly", "required", "showValues"],
  numbers: ["minValue", "maxValue", "step", "minStepsBetweenThumbs"],
  events: {
    didChange: "onDidChange",
    gotFocus: "onFocus",
    lostFocus: "onBlur",
  },
  callbacks: {
    valueFormat: "valueFormat",
  },
  rename: {
    minValue: "min",
    maxValue: "max",
  },
  parseInitialValue: (raw: any, props: Record<string, any>) => {
    const min = Number(props.min) || 0;
    const max = Number(props.max) || 10;
    let val = raw;
    if (typeof raw === "string") {
      try { val = JSON.parse(raw); } catch { val = parseFloat(raw); }
    }
    if (val == null || (typeof val === "number" && isNaN(val))) val = min;
    const arr = Array.isArray(val) ? val : [val];
    return arr.map((v: number) => Math.min(max, Math.max(min, Number(v) || min)));
  },
  formatExternalValue: (value: any, props: Record<string, any>) => {
    const min = Number(props.min) || 0;
    const max = Number(props.max) || 10;
    const arr = Array.isArray(value) ? value : value != null ? [value] : [min];
    return arr.map((v: number) => Math.min(max, Math.max(min, Number(v) || min)));
  },
});
