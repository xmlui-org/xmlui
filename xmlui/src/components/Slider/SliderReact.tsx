import type { CSSProperties, ForwardedRef } from "react";
import React, { memo, useCallback, useEffect, useLayoutEffect, useRef } from "react";
import { useFormItemInputId } from "../FormItem/FormItemContext";
import { forwardRef } from "react";
import { Root, Range, Track, Thumb } from "@radix-ui/react-slider";
import styles from "./Slider.module.scss";
import type { RegisterComponentApiFn, UpdateStateFn } from "../../abstractions/RendererDefs";
import { noop } from "../../components-core/constants";
import { useEvent } from "../../components-core/utils/misc";
import type { ValidationStatus } from "../abstractions";
import { defaultProps } from "./Slider.defaults";
import classnames from "classnames";
import { COMPONENT_PART_KEY } from "../../components-core/theming/responsive-layout";
import { ThemedTooltip as Tooltip } from "../Tooltip/Tooltip";
import { isNaN } from "lodash-es";
import { useComposedRefs } from "@radix-ui/react-compose-refs";

export type Props = Omit<React.HTMLAttributes<HTMLDivElement>, "onFocus" | "onBlur"> & {
  id?: string;
  value?: number | number[];
  initialValue?: number | number[];
  classes?: Record<string, string>;
  step?: number;
  max?: number;
  min?: number;
  inverted?: false;
  validationStatus?: ValidationStatus;
  invalidMessages?: string[];
  minStepsBetweenThumbs?: number;
  onDidChange?: (newValue: number | number[]) => void;
  onFocus?: (ev: React.FocusEvent<HTMLDivElement>) => void;
  onBlur?: (ev: React.FocusEvent<HTMLDivElement>) => void;
  updateState?: UpdateStateFn;
  registerComponentApi?: RegisterComponentApiFn;
  autoFocus?: boolean;
  readOnly?: boolean;
  tabIndex?: number;
  required?: boolean;
  enabled?: boolean;
  rangeStyle?: CSSProperties;
  thumbStyle?: CSSProperties;
  showValues?: boolean;
  valueFormat?: (value: number) => string;
};

const parseValue = (val: string | number | undefined, defaultVal: number): number => {
  if (typeof val === "number") {
    return val;
  } else if (typeof val === "string") {
    const parsed = parseFloat(val);
    if (!isNaN(parsed)) {
      return parsed;
    }
  }
  return defaultVal;
};

// Helper function to ensure value is properly formatted
const formatValue = (
  val: number | number[] | undefined,
  defaultVal: number = 0,
  minVal?: number,
  maxVal?: number,
): number[] => {
  const clampValue = (value: number): number => {
    if (minVal !== undefined && value < minVal) return minVal;
    if (maxVal !== undefined && value > maxVal) return maxVal;
    return value;
  };

  if (val === undefined) {
    return [clampValue(defaultVal)];
  }
  if (typeof val === "number") {
    return [clampValue(val)];
  }
  if (Array.isArray(val) && val.length > 0) {
    return val.map(clampValue);
  }
  return [clampValue(defaultVal)];
};

export const Slider = memo(forwardRef(
  (
    {
      id: idProp,
      style,
      className,
      classes,
      step = defaultProps.step,
      min = defaultProps.min,
      max = defaultProps.max,
      inverted,
      updateState,
      onDidChange = noop,
      onFocus = noop,
      onBlur = noop,
      registerComponentApi,
      enabled = defaultProps.enabled,
      value,
      autoFocus,
      readOnly,
      tabIndex = defaultProps.tabIndex,
      required,
      validationStatus = defaultProps.validationStatus,
      invalidMessages: _invalidMessages,
      initialValue,
      minStepsBetweenThumbs = defaultProps.minStepsBetweenThumbs,
      rangeStyle,
      thumbStyle,
      showValues = defaultProps.showValues,
      valueFormat = defaultProps.valueFormat,
      ...rest
    }: Props,
    forwardedRef: ForwardedRef<HTMLDivElement>,
  ) => {
    const id = useFormItemInputId(idProp);
    const inputRef = useRef(null);
    const outerDivRef = useRef<HTMLDivElement>(null);
    const composedRef = useComposedRefs(forwardedRef, outerDivRef);
    const tooltipRef = useRef<HTMLDivElement>(null);
    const thumbsRef = useRef<(HTMLSpanElement | null)[]>([]);
    min = parseValue(min, defaultProps.min);
    max = parseValue(max, defaultProps.max);

    // Initialize localValue properly
    const [localValue, setLocalValue] = React.useState<number[]>(() =>
      formatValue(value || initialValue, min, min, max),
    );
    const [showTooltip, setShowTooltip] = React.useState(false);
    const onShowTooltip = useCallback(() => setShowTooltip(true), []);
    const onHideTooltip = useCallback(() => setShowTooltip(false), []);

    // Process initialValue on mount
    useEffect(() => {
      let initialVal: number | number[] = min;

      if (typeof initialValue === "string") {
        try {
          // Try to parse as JSON first (for arrays)
          const parsed = JSON.parse(initialValue);
          initialVal = parsed;
        } catch (e) {
          // If not JSON, try to parse as number
          const num = parseFloat(initialValue);
          if (!isNaN(num)) {
            initialVal = num;
          }
        }
      } else if (typeof initialValue === "number") {
        initialVal = initialValue;
      } else if (initialValue !== undefined) {
        initialVal = initialValue;
      }

      // Format the value properly - single call to formatValue with bounds checking
      const formattedValue = formatValue(initialVal, min, min, max);
      setLocalValue(formattedValue);

      // Notify parent component
      if (updateState) {
        updateState(
          {
            value: formattedValue.length === 1 ? formattedValue[0] : formattedValue,
          },
          { initial: true },
        );
      }
    }, [initialValue, min, max, updateState]);

    // Sync with external value changes
    useEffect(() => {
      if (value !== undefined) {
        const formattedValue = formatValue(value, min, min, max);
        setLocalValue(formattedValue);
      }
    }, [value, min, max]);

    const updateValue = useCallback(
      (value: number | number[]) => {
        if (updateState) {
          updateState({ value });
        }
        // Call onDidChange without extra arguments to maintain type compatibility
        onDidChange(value);
      },
      [onDidChange, updateState],
    );

    const onInputChange = useCallback(
      (value: number[]) => {
        if (readOnly) {
          return;
        }
        setLocalValue(value);

        // 👇 Force the DOM element to reflect the latest value synchronously
        if (inputRef.current) {
          inputRef.current.value = value;
        }

        if (value.length > 1) {
          updateValue(value); // calls updateState + onDidChange
        } else if (value.length === 1) {
          updateValue(value[0]);
        }
      },
      [updateValue, readOnly],
    );

    // Component APIs
    const handleOnFocus = useCallback(
      (ev: React.FocusEvent<HTMLInputElement>) => {
        onShowTooltip();
        onFocus?.(ev);
      },
      [onFocus, onShowTooltip],
    );
    const handleOnBlur = useCallback(
      (ev: React.FocusEvent<HTMLInputElement>) => {
        onBlur?.(ev);
      },
      [onBlur],
    );

    const focus = useCallback(() => {
      // Focus the first available thumb
      const firstThumb = thumbsRef.current.find(thumb => thumb !== null);
      if (firstThumb) {
        firstThumb.focus();
      } else {
        inputRef.current?.focus();
      }
    }, []);

    const setValue = useEvent((newValue) => {
      if (readOnly || !enabled) {
        return;
      }
      const formattedValue = formatValue(newValue, min, min, max);
      const valueToUpdate = formattedValue.length === 1 ? formattedValue[0] : formattedValue;
      setLocalValue(formattedValue);
      updateValue(valueToUpdate);
    });

    useEffect(() => {
      registerComponentApi?.({
        focus,
        setValue,
      });
    }, [focus, registerComponentApi, setValue]);

    // Ensure we always have at least one thumb
    const displayValue = localValue.length > 0 ? localValue : formatValue(undefined, min, min, max);

    // Clean up thumbs ref array when number of thumbs changes
    useEffect(() => {
      thumbsRef.current = thumbsRef.current.slice(0, displayValue.length);
    }, [displayValue.length]);

    const handleKeyDownCapture = useCallback(
      (e: React.KeyboardEvent) => {
        if (readOnly || !enabled) return;

        if (
          e.key !== "ArrowRight" &&
          e.key !== "ArrowUp" &&
          e.key !== "ArrowLeft" &&
          e.key !== "ArrowDown" &&
          e.key !== "Home" &&
          e.key !== "End"
        ) {
          return;
        }

        const eventThumb = (e.target as HTMLElement | null)?.closest?.("[data-thumb-index]") as HTMLElement | null;
        const focusedThumbIndex =
          eventThumb?.dataset.thumbIndex !== undefined
            ? Number(eventThumb.dataset.thumbIndex)
            : thumbsRef.current.findIndex((thumb) => thumb === document.activeElement);
        if (focusedThumbIndex === -1) return;

        e.preventDefault();
        e.stopPropagation();

        const currentThumbValue = displayValue[focusedThumbIndex];
        const nextThumbValue =
          e.key === "Home"
            ? min
            : e.key === "End"
              ? max
              : currentThumbValue + (e.key === "ArrowRight" || e.key === "ArrowUp" ? step : -step);
        const newValues = [...displayValue];
        newValues[focusedThumbIndex] = Math.max(min, Math.min(max, nextThumbValue));
        const minimumGap = Math.max(0, minStepsBetweenThumbs) * step;
        if (focusedThumbIndex > 0) {
          newValues[focusedThumbIndex] = Math.max(
            newValues[focusedThumbIndex],
            newValues[focusedThumbIndex - 1] + minimumGap,
          );
        }
        if (focusedThumbIndex < newValues.length - 1) {
          newValues[focusedThumbIndex] = Math.min(
            newValues[focusedThumbIndex],
            newValues[focusedThumbIndex + 1] - minimumGap,
          );
        }
        newValues[focusedThumbIndex] = Math.max(min, Math.min(max, newValues[focusedThumbIndex]));
        onInputChange(newValues);
      },
      [step, readOnly, enabled, displayValue, min, max, minStepsBetweenThumbs, onInputChange],
    );

    useLayoutEffect(() => {
      const outer = outerDivRef.current;
      if (!outer) {
        return;
      }
      const applyThumbValue = (thumbNumber: number, rawValue: number, values = [...displayValue]) => {
        const safeIndex = Math.max(0, Math.min(thumbNumber, values.length - 1));
        values[safeIndex] = Math.max(min, Math.min(max, rawValue));
        const minimumGap = Math.max(0, minStepsBetweenThumbs) * step;
        if (safeIndex > 0) {
          values[safeIndex] = Math.max(values[safeIndex], values[safeIndex - 1] + minimumGap);
        }
        if (safeIndex < values.length - 1) {
          values[safeIndex] = Math.min(values[safeIndex], values[safeIndex + 1] - minimumGap);
        }
        values[safeIndex] = Math.max(min, Math.min(max, values[safeIndex]));
        return values;
      };
      const driverSet = (event: Event) => {
        if (readOnly || !enabled) {
          return;
        }
        const detail = (event as CustomEvent<{
          location?: string;
          thumbNumber?: number;
          key?: "ArrowLeft" | "ArrowRight" | "Home" | "End";
          repeat?: number;
        }>).detail ?? {};
        const thumbNumber = Number(detail.thumbNumber ?? 0) || 0;
        let values = [...displayValue];
        if (detail.key) {
          const repeat = Math.max(1, Number(detail.repeat ?? 1) || 1);
          for (let i = 0; i < repeat; i += 1) {
            const safeIndex = Math.max(0, Math.min(thumbNumber, values.length - 1));
            const current = values[safeIndex] ?? min;
            const nextValue =
              detail.key === "Home"
                ? min
                : detail.key === "End"
                  ? max
                  : current + (detail.key === "ArrowRight" ? step : -step);
            values = applyThumbValue(thumbNumber, nextValue, values);
          }
        } else {
          const nextValue =
            detail.location === "start"
              ? min
              : detail.location === "end"
                ? max
                : min + (max - min) / 2;
          values = applyThumbValue(thumbNumber, nextValue, values);
        }
        event.stopImmediatePropagation();
        onInputChange(values);
      };
      const keyDown = (event: KeyboardEvent) => {
        if (readOnly || !enabled) {
          return;
        }
        if (
          event.key !== "ArrowRight" &&
          event.key !== "ArrowUp" &&
          event.key !== "ArrowLeft" &&
          event.key !== "ArrowDown" &&
          event.key !== "Home" &&
          event.key !== "End"
        ) {
          return;
        }
        const eventThumb = (event.target as HTMLElement | null)?.closest?.("[data-thumb-index]") as HTMLElement | null;
        if (!eventThumb || !outer.contains(eventThumb)) {
          return;
        }
        const thumbIndex = Number(eventThumb.dataset.thumbIndex);
        if (!Number.isFinite(thumbIndex)) {
          return;
        }
        const current = displayValue[thumbIndex] ?? min;
        const nextValue =
          event.key === "Home"
            ? min
            : event.key === "End"
              ? max
              : current + (event.key === "ArrowRight" || event.key === "ArrowUp" ? step : -step);
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        onInputChange(applyThumbValue(thumbIndex, nextValue));
      };
      outer.addEventListener("xmlui-slider-driver-set", driverSet);
      (outer as HTMLDivElement & {
        __xmluiSliderDriverSet?: (detail: {
          location?: string;
          thumbNumber?: number;
          key?: "ArrowLeft" | "ArrowRight" | "Home" | "End";
          repeat?: number;
        }) => void;
      }).__xmluiSliderDriverSet = (detail) => {
        driverSet(new CustomEvent("xmlui-slider-driver-set", { detail }));
      };
      outer.addEventListener("keydown", keyDown, true);
      return () => {
        outer.removeEventListener("xmlui-slider-driver-set", driverSet);
        delete (outer as HTMLDivElement & { __xmluiSliderDriverSet?: unknown }).__xmluiSliderDriverSet;
        outer.removeEventListener("keydown", keyDown, true);
      };
    }, [displayValue, enabled, max, min, minStepsBetweenThumbs, onInputChange, readOnly, step]);

      return (
          <div {...rest} ref={composedRef} style={style} className={classnames(styles.sliderContainer, classes?.[COMPONENT_PART_KEY], className)} data-slider-container onKeyDownCapture={handleKeyDownCapture}>
            <Root
              ref={inputRef}
              minStepsBetweenThumbs={minStepsBetweenThumbs}
              tabIndex={tabIndex}
              aria-readonly={readOnly}
              className={classnames(styles.sliderRoot, {
                [styles.disabled]: !enabled,
                [styles.readOnly]: readOnly,
              })}
              max={max}
              min={min}
              inverted={inverted}
              step={step}
              disabled={!enabled}
              onFocus={handleOnFocus}
              onBlur={handleOnBlur}
              onValueChange={onInputChange}
              onMouseOver={onShowTooltip}
              onMouseLeave={onHideTooltip}
              onPointerDown={onShowTooltip}
              value={displayValue}
            >
            <Track
              data-track
              className={classnames(styles.sliderTrack, {
                [styles.disabled]: !enabled,
                [styles.readOnly]: readOnly,
                [styles.error]: validationStatus === "error",
                [styles.warning]: validationStatus === "warning",
                [styles.valid]: validationStatus === "valid",
              })}
              style={rangeStyle ? { ...rangeStyle } : undefined}
            >
              <Range
                data-range
                className={classnames(styles.sliderRange, {
                  [styles.disabled]: !enabled,
                })}
              />
            </Track>
            {displayValue.map((_, index) => (
              <Tooltip
                key={index}
                ref={tooltipRef}
                text={valueFormat(displayValue[index])}
                delayDuration={100}
                open={showValues && showTooltip}
              >
                <Thumb
                  id={id}
                  aria-required={required}
                  ref={(el) => {
                    thumbsRef.current[index] = el;
                  }}
                  className={classnames(styles.sliderThumb, {
                    [styles.disabled]: !enabled,
                  })}
                  style={thumbStyle ? { ...thumbStyle } : undefined}
                  data-thumb-index={index}
                  autoFocus={autoFocus && index === 0}
                  onKeyDownCapture={handleKeyDownCapture}
                />
              </Tooltip>
            ))}
          </Root>
        </div>
    );
  },
));
