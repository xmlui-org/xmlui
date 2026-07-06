import { defaultProps } from "./Slider.defaults";
import { Slider } from "./SliderReact";
import React from "react";
import { useComponentThemeClass } from "../../components-core/theming/utils";
import styles from "./Slider.module.scss";
import { wrapComponent } from "../../components-core/wrapComponent";
import { parseScssVar } from "../../components-core/theming/themeVars";
import {
  createMetadata,
  dAutoFocus,
  dDidChange,
  dEnabled,
  dGotFocus,
  dInitialValue,
  dLostFocus,
  dReadonly,
  dRequired,
  dValidationStatus,
} from "../metadata-helpers";
import type { ComponentMetadata } from "../../component-core/metadata/types";
import { wrapComponent as wrapRuntimeComponent } from "../../runtime/rendering/adapter";
import { COMPONENT_PART_KEY } from "../../styling/layout";

const COMP = "Slider";

export const SliderMd = createMetadata({
  status: "stable",
  description:
    "`Slider` provides an interactive control for selecting numeric values within " +
    "a defined range, supporting both single value selection and range selection with " +
    "multiple thumbs. It offers precise control through customizable steps and visual " +
    "feedback with formatted value display." +
    "Hover over the component to see the tooltip with the current value. On mobile, tap the thumb to see the tooltip.",
  parts: {
    label: {
      description: "The label displayed for the slider.",
    },
    track: {
      description: "The track element of the slider.",
    },
    thumb: {
      description: "The thumb elements of the slider.",
    },
  },
  props: {
    initialValue: {
      ...dInitialValue(),
      valueType: "any",
    },
    minValue: {
      description: `This property specifies the minimum value of the allowed input range.`,
      valueType: "number",
      defaultValue: defaultProps.min,
    },
    maxValue: {
      description: `This property specifies the maximum value of the allowed input range.`,
      valueType: "number",
      defaultValue: defaultProps.max,
    },
    step: {
      description: `This property defines the increment value for the slider, determining the allowed intervals between selectable values.`,
      valueType: "number",
      defaultValue: defaultProps.step,
    },
    minStepsBetweenThumbs: {
      description: `This property sets the minimum number of steps required between multiple thumbs on the slider, ensuring they maintain a specified distance.`,
      valueType: "number",
      defaultValue: 1,
    },
    enabled: dEnabled(),
    autoFocus: dAutoFocus(),
    required: dRequired(),
    readOnly: dReadonly(),
    validationStatus: {
      ...dValidationStatus(),
      defaultValue: "none",
    },
    rangeStyle: {
      description: `This optional property allows you to apply custom styles to the range element of the slider.`,
      valueType: "hash",
    },
    thumbStyle: {
      description: `This optional property allows you to apply custom styles to the thumb elements of the slider.`,
      valueType: "hash",
    },
    showValues: {
      description: `This property controls whether the slider shows the current values of the thumbs.`,
      valueType: "boolean",
      defaultValue: true,
    },
    valueFormat: {
      description: `This property allows you to customize how the values are displayed.`,
      valueType: "any",
      defaultValue: "(value) => value.toString()",
    },
  },
  events: {
    didChange: dDidChange(COMP),
    gotFocus: dGotFocus(COMP),
    lostFocus: dLostFocus(COMP),
  },
  apis: {
    focus: {
      description: `This method sets the focus on the slider component.`,
      signature: "focus(): void",
    },
    value: {
      description: `This API retrieves the current value of the \`${COMP}\`. You can use it to get the value programmatically.`,
      signature: "get value(): number | [number, number] | undefined",
    },
    setValue: {
      description: `This API sets the value of the \`${COMP}\`. You can use it to programmatically change the value.`,
      signature: "setValue(value: number | [number, number] | undefined): void",
      parameters: {
        value:
          "The new value to set. Can be a single value or an array of values for range sliders.",
      },
    },
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    [`backgroundColor-track-${COMP}`]: "$color-surface-200",
    [`backgroundColor-range-${COMP}`]: "$color-primary",
    [`borderWidth-thumb-${COMP}`]: "2px",
    [`borderStyle-thumb-${COMP}`]: "solid",
    [`borderColor-thumb-${COMP}`]: "$color-surface-50",
    [`backgroundColor-thumb-${COMP}`]: "$color-primary",
    [`backgroundColor-thumb-${COMP}--focus`]: "$color-primary",
    [`boxShadow-thumb-${COMP}--focus`]: "0 0 0 6px rgb(from $color-primary r g b / 0.4)",
    [`backgroundColor-thumb-${COMP}--hover`]: "$color-primary",
    [`boxShadow-thumb-${COMP}--hover`]: "0 0 0 6px rgb(from $color-primary r g b / 0.4)",
    [`backgroundColor-thumb-${COMP}--active`]: "$color-primary-400",
    [`boxShadow-thumb-${COMP}--active`]: "0 0 0 6px rgb(from $color-primary r g b / 0.4)",
    [`borderRadius-${COMP}`]: "$borderRadius",
    [`borderColor-${COMP}`]: "transparent",
    [`borderWidth-${COMP}`]: "0",
    [`borderStyle-${COMP}`]: "solid",
    [`boxShadow-${COMP}`]: "none",

    light: {
      [`backgroundColor-track-${COMP}--disabled`]: "$color-surface-300",
      [`backgroundColor-range-${COMP}--disabled`]: "$color-surface-400",
      [`backgroundColor-thumb-${COMP}`]: "$color-primary-500",
      [`borderColor-thumb-${COMP}`]: "$color-surface-50",
    },
    dark: {
      [`backgroundColor-track-${COMP}--disabled`]: "$color-surface-600",
      [`backgroundColor-range-${COMP}--disabled`]: "$color-surface-800",
      [`backgroundColor-thumb-${COMP}`]: "$color-primary-400",
      [`borderColor-thumb-${COMP}`]: "$color-surface-950",
    },
  },
});

type ThemedSliderProps = React.ComponentPropsWithoutRef<typeof Slider>;

export const ThemedSlider = React.forwardRef<React.ElementRef<typeof Slider>, ThemedSliderProps>(
  function ThemedSlider({ className, ...props }, ref) {
    const themeClass = useComponentThemeClass(SliderMd);
    return (
      <Slider {...props} className={`${themeClass}${className ? ` ${className}` : ""}`} ref={ref} />
    );
  },
);

export const sliderComponentRenderer = wrapComponent(COMP, Slider, SliderMd, {
  // minValue, maxValue, minStepsBetweenThumbs are number-typed in metadata — asOptionalNumber throws
  // for non-numeric strings (e.g. "invalid"). invalidMessages is handled by form wrappers and should
  // not leak to the underlying slider DOM.
  exclude: ["minValue", "maxValue", "minStepsBetweenThumbs", "invalidMessages"],
  customRender: (
    props,
    {
      node,
      extractValue,
      lookupEventHandler,
      lookupSyncCallback,
      classes,
      updateState,
      state,
      registerComponentApi,
    },
  ) => {
    const {
      invalidMessages: _invalidMessages,
      labelPosition: _labelPosition,
      requireLabelMode: _requireLabelMode,
      ...sliderProps
    } = props;

    return (
      <Slider
        {...sliderProps}
        value={state.value}
        initialValue={extractValue(node.props.initialValue)}
        updateState={updateState}
        onDidChange={lookupEventHandler("didChange")}
        onFocus={lookupEventHandler("gotFocus")}
        onBlur={lookupEventHandler("lostFocus")}
        registerComponentApi={registerComponentApi}
        classes={classes}
        validationStatus={extractValue(node.props.validationStatus)}
        minStepsBetweenThumbs={extractValue(node.props?.minStepsBetweenThumbs)}
        min={extractValue(node.props?.minValue)}
        max={extractValue(node.props?.maxValue)}
        valueFormat={lookupSyncCallback(node.props?.valueFormat)}
      />
    );
  },
});

export const sliderRenderer = wrapRuntimeComponent({
  name: COMP,
  metadata: SliderMd as ComponentMetadata,
  defaultPart: "input",
  renderer: ({ adapter }) => {
    const [state, setState] = React.useState<Record<string, any>>({});
    const adapterRef = React.useRef(adapter);
    adapterRef.current = adapter;
    const outerRef = React.useRef<HTMLDivElement | null>(null);
    const activeThumbRef = React.useRef(0);
    const rootAttrs = adapter.rootAttrs("input");
    const valueFormat = adapter.prop("valueFormat", defaultProps.valueFormat);
    const min = adapter.numberProp("minValue", defaultProps.min);
    const max = adapter.numberProp("maxValue", defaultProps.max);
    const step = adapter.numberProp("step", defaultProps.step);
    const minStepsBetweenThumbs = adapter.numberProp("minStepsBetweenThumbs", defaultProps.minStepsBetweenThumbs);
    const inverted = adapter.prop("inverted", false);
    const enabled = adapter.booleanProp("enabled", defaultProps.enabled);
    const readOnly = adapter.booleanProp("readOnly", false);
    const updateState = React.useCallback((nextState: Record<string, any>) => {
      setState((previous) => ({ ...previous, ...nextState }));
      if (Object.prototype.hasOwnProperty.call(nextState, "value")) {
        adapterRef.current.registerApi({ value: nextState.value });
      }
    }, []);
    const publishValue = React.useCallback((value: number | number[]) => {
      updateState({ value });
      adapterRef.current.registerApi({ value });
      void adapterRef.current.event("didChange")(value);
    }, [updateState]);
    const currentValue = adapter.prop("value", state.value);
    const updateThumb = React.useCallback((index: number, rawValue: number) => {
      if (readOnly || !enabled) {
        return;
      }
      const values = normalizeRuntimeSliderValues(currentValue, min, max);
      const safeIndex = Math.max(0, Math.min(index, values.length - 1));
      values[safeIndex] = snapRuntimeSliderValue(rawValue, min, max, step);
      const nextValue = enforceRuntimeSliderGap(
        values,
        safeIndex,
        min,
        max,
        Math.max(0, minStepsBetweenThumbs) * step,
      );
      publishValue(nextValue.length === 1 ? nextValue[0] : nextValue);
    }, [currentValue, enabled, max, min, minStepsBetweenThumbs, publishValue, readOnly, step]);
    const handleMouseDown = React.useCallback((event: React.MouseEvent<HTMLElement>) => {
      const target = event.target as HTMLElement | null;
      const thumb = target?.closest?.("[data-thumb-index]") as HTMLElement | null;
      activeThumbRef.current = Number(thumb?.dataset.thumbIndex ?? 0) || 0;
    }, []);
    const handleMouseUp = React.useCallback((event: React.MouseEvent<HTMLElement>) => {
      const track = event.currentTarget.querySelector("[data-track]");
      if (!(track instanceof HTMLElement)) {
        return;
      }
      const rect = track.getBoundingClientRect();
      if (rect.width === 0) {
        return;
      }
      const rawRatio = (event.clientX - rect.left) / rect.width;
      const ratio = inverted ? 1 - rawRatio : rawRatio;
      updateThumb(activeThumbRef.current, min + clampRuntimeSliderValue(ratio, 0, 1) * (max - min));
    }, [inverted, max, min, updateThumb]);
    React.useEffect(() => {
      const outer = outerRef.current;
      if (!outer) {
        return;
      }
      const pointerStart = (event: MouseEvent | PointerEvent) => {
        const target = event.target as HTMLElement | null;
        const thumb = target?.closest?.("[data-thumb-index]") as HTMLElement | null;
        activeThumbRef.current = Number(thumb?.dataset.thumbIndex ?? 0) || 0;
      };
      const pointerEnd = (event: MouseEvent | PointerEvent) => {
        const track = outer.querySelector("[data-track]");
        if (!(track instanceof HTMLElement)) {
          return;
        }
        const rect = track.getBoundingClientRect();
        if (rect.width === 0) {
          return;
        }
        const rawRatio = (event.clientX - rect.left) / rect.width;
        const ratio = inverted ? 1 - rawRatio : rawRatio;
        updateThumb(activeThumbRef.current, min + clampRuntimeSliderValue(ratio, 0, 1) * (max - min));
      };
      const driverSet = (event: Event) => {
        const detail = (event as CustomEvent<{ location?: string; thumbNumber?: number }>).detail ?? {};
        const thumbNumber = Number(detail.thumbNumber ?? 0) || 0;
        const value = detail.location === "start"
          ? min
          : detail.location === "end"
            ? max
            : min + (max - min) / 2;
        updateThumb(thumbNumber, value);
      };
      window.addEventListener("mousedown", pointerStart, true);
      window.addEventListener("pointerdown", pointerStart, true);
      window.addEventListener("mouseup", pointerEnd, true);
      window.addEventListener("pointerup", pointerEnd, true);
      outer.addEventListener("xmlui-slider-driver-set", driverSet);
      return () => {
        window.removeEventListener("mousedown", pointerStart, true);
        window.removeEventListener("pointerdown", pointerStart, true);
        window.removeEventListener("mouseup", pointerEnd, true);
        window.removeEventListener("pointerup", pointerEnd, true);
        outer.removeEventListener("xmlui-slider-driver-set", driverSet);
      };
    }, [inverted, max, min, updateThumb]);

    return (
      <Slider
        {...rootAttrs}
        ref={(element) => {
          outerRef.current = element;
        }}
        id={adapter.stringProp("id")}
        value={currentValue}
        initialValue={adapter.prop("initialValue")}
        updateState={updateState}
        onDidChange={(value) => {
          adapterRef.current.registerApi({ value });
          void adapterRef.current.event("didChange")(value);
        }}
        onFocus={(event) => {
          void adapter.event("gotFocus")(event);
        }}
        onBlur={(event) => {
          void adapter.event("lostFocus")(event);
        }}
        registerComponentApi={(api) => adapter.registerApi(api as Record<string, unknown>)}
        classes={{ [COMPONENT_PART_KEY]: adapter.className }}
        min={min}
        max={max}
        step={step}
        minStepsBetweenThumbs={minStepsBetweenThumbs}
        inverted={inverted}
        enabled={enabled}
        readOnly={readOnly}
        required={adapter.booleanProp("required", false)}
        autoFocus={adapter.booleanProp("autoFocus", false)}
        tabIndex={adapter.numberProp("tabIndex", defaultProps.tabIndex)}
        title={adapter.stringProp("title")}
        validationStatus={adapter.stringProp("validationStatus", defaultProps.validationStatus) as any}
        showValues={adapter.booleanProp("showValues", defaultProps.showValues)}
        valueFormat={typeof valueFormat === "function" ? valueFormat as (value: number) => string : defaultProps.valueFormat}
        rangeStyle={adapter.prop("rangeStyle")}
        thumbStyle={adapter.prop("thumbStyle")}
        onMouseDownCapture={handleMouseDown}
        onMouseUpCapture={handleMouseUp}
      />
    );
  },
});

function normalizeRuntimeSliderValues(value: unknown, min: number, max: number): number[] {
  const clamp = (next: number) => snapRuntimeSliderValue(next, min, max, 0);
  if (typeof value === "number") {
    return [clamp(value)];
  }
  if (typeof value === "string" && value.trim() !== "") {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed.map((item) => clamp(Number(item))).filter(Number.isFinite);
      }
    } catch {
      // Fall through to numeric string parsing.
    }
    const numeric = Number(value);
    return Number.isFinite(numeric) ? [clamp(numeric)] : [min];
  }
  if (Array.isArray(value) && value.length > 0) {
    const values = value.map((item) => clamp(Number(item))).filter(Number.isFinite);
    return values.length > 0 ? values : [min];
  }
  return [min];
}

function snapRuntimeSliderValue(value: number, min: number, max: number, step: number): number {
  const clamped = clampRuntimeSliderValue(value, min, max);
  if (!Number.isFinite(step) || step <= 0) {
    return clamped;
  }
  const steps = Math.round((clamped - min) / step);
  const snapped = min + steps * step;
  const precision = decimalPrecision(step);
  return Number(clampRuntimeSliderValue(snapped, min, max).toFixed(precision));
}

function enforceRuntimeSliderGap(
  values: number[],
  index: number,
  min: number,
  max: number,
  gap: number,
): number[] {
  const next = [...values];
  if (index > 0) {
    next[index] = Math.max(next[index], next[index - 1] + gap);
  }
  if (index < next.length - 1) {
    next[index] = Math.min(next[index], next[index + 1] - gap);
  }
  next[index] = clampRuntimeSliderValue(next[index], min, max);
  return next;
}

function clampRuntimeSliderValue(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function decimalPrecision(value: number): number {
  const text = String(value);
  if (text.includes("e-")) {
    return Number(text.split("e-")[1] ?? 0);
  }
  return text.includes(".") ? text.split(".")[1].length : 0;
}
