import { KnobRender } from "./KnobRender";
import { wrapCompound } from "../../components-core/wrapComponent";
import {
  createMetadata,
  d,
  dDidChange,
  dEnabled,
  dInitialValue,
  dReadonly,
} from "../metadata-helpers";

const COMP = "Knob";

export const KnobMd = createMetadata({
  status: "experimental",
  description:
    "`Knob` provides a circular dial input for selecting numeric values within " +
    "a defined range. It wraps react-knob-headless — a headless, accessible " +
    "knob primitive — demonstrating that `wrapCompound` works with any React " +
    "component library, not just Radix.",
  props: {
    initialValue: dInitialValue(),
    minValue: {
      description: "Minimum value of the allowed range.",
      valueType: "number",
      defaultValue: 0,
    },
    maxValue: {
      description: "Maximum value of the allowed range.",
      valueType: "number",
      defaultValue: 100,
    },
    step: d("Step increment for the knob.", undefined, "number", 1),
    enabled: dEnabled(),
    readOnly: dReadonly(),
  },
  events: {
    didChange: dDidChange(COMP),
  },
  apis: {
    value: {
      description: "Gets the current knob value.",
      signature: "get value(): number | undefined",
    },
    setValue: {
      description: "Sets the knob value programmatically.",
      signature: "setValue(value: number): void",
      parameters: {
        value: "The new numeric value.",
      },
    },
    focus: {
      description: "Sets focus on the knob.",
      signature: "focus(): void",
    },
  },
});

export const knobComponentRenderer = wrapCompound(COMP, KnobRender, KnobMd, {
  booleans: ["enabled", "readOnly"],
  numbers: ["minValue", "maxValue", "step"],
  events: {
    didChange: "onDidChange",
  },
  rename: {
    minValue: "min",
    maxValue: "max",
  },
  parseInitialValue: (raw: any, props: Record<string, any>) => {
    const min = Number(props.min) || 0;
    const max = Number(props.max) || 100;
    let val = typeof raw === "string" ? parseFloat(raw) : raw;
    if (val == null || isNaN(val)) val = min;
    return Math.min(max, Math.max(min, Number(val)));
  },
  formatExternalValue: (value: any, props: Record<string, any>) => {
    const min = Number(props.min) || 0;
    const max = Number(props.max) || 100;
    const val = Number(value);
    if (isNaN(val)) return min;
    return Math.min(max, Math.max(min, val));
  },
});
