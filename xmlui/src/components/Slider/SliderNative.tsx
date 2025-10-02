import type { CSSProperties, ForwardedRef } from "react";
import React, { useCallback, useEffect, useId, useRef } from "react";
import { forwardRef } from "react";
import { Root, Range, Track, Thumb } from "@radix-ui/react-slider";
import styles from "./Slider.module.scss";
import type { RegisterComponentApiFn, UpdateStateFn } from "../../abstractions/RendererDefs";
import { noop } from "../../components-core/constants";
import { useEvent } from "../../components-core/utils/misc";
import { ItemWithLabel } from "../FormItem/ItemWithLabel";
import type { ValidationStatus } from "../abstractions";
import classnames from "classnames";
import { Tooltip } from "../Tooltip/TooltipNative";
import { isNaN } from "lodash-es";
import { composeRefs } from "@radix-ui/react-compose-refs";

export type Props = {
  id?: string;
  value?: number | number[];
  initialValue?: number | number[];
  style?: CSSProperties;
  className?: string;
  step?: number;
  max?: number;
  min?: number;
  inverted?: false;
  validationStatus?: ValidationStatus;
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

export const defaultProps: Pick<
  Props,
  | "step"
  | "min"
  | "max"
  | "enabled"
  | "validationStatus"
  | "tabIndex"
  | "showValues"
  | "valueFormat"
  | "minStepsBetweenThumbs"
> = {
  step: 1,
  min: 0,
  max: 10,
  enabled: true,
  validationStatus: "none" as ValidationStatus,
  tabIndex: -1,
  showValues: true,
  valueFormat: (value: number) => value.toString(),
  minStepsBetweenThumbs: 1,
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

export const Slider = forwardRef(
  (
    {
      id,
      style,
      className,
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
      initialValue,
      minStepsBetweenThumbs = defaultProps.minStepsBetweenThumbs,
      rangeStyle,
      thumbStyle,
      showValues = defaultProps.showValues,
      valueFormat = defaultProps.valueFormat,
      ...rest
    }: Props,
    forwardedRef: ForwardedRef<HTMLInputElement>,
  ) => {
    const inputRef = useRef(null);
    const ref = forwardedRef ? composeRefs(inputRef, forwardedRef) : inputRef;
    const tooltipRef = useRef<HTMLDivElement>(null);
    const thumbRef = useRef(null);
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
        thumbRef.current?.focus();
        onFocus?.(ev);
      },
      [onFocus],
    );
    const handleOnBlur = useCallback(
      (ev: React.FocusEvent<HTMLInputElement>) => {
        thumbRef.current?.focus();
        onBlur?.(ev);
      },
      [onBlur],
    );

    const focus = useCallback(() => {
      inputRef.current?.focus();
    }, []);

    const setValue = useEvent((newValue) => {
      if (readOnly || !enabled) {
        return;
      }
      const formattedValue = formatValue(newValue, min, min, max);
      const valueToUpdate = formattedValue.length === 1 ? formattedValue[0] : formattedValue;
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
      return (
          <div className={styles.sliderContainer} data-slider-container>
            <Root
              minStepsBetweenThumbs={minStepsBetweenThumbs}
              ref={ref}
              tabIndex={tabIndex}
              aria-readonly={readOnly}
              className={classnames(className, styles.sliderRoot, {
                [styles.disabled]: !enabled,
                [styles.readOnly]: readOnly,
              })}
              style={style}
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
                  ref={index === 0 ? thumbRef : null}
                  className={classnames(styles.sliderThumb, {
                    [styles.disabled]: !enabled,
                  })}
                  style={thumbStyle ? { ...thumbStyle } : undefined}
                  data-thumb-index={index}
                  autoFocus={autoFocus}
                />
              </Tooltip>
            ))}
          </Root>
        </div>
    );
  },
);

Slider.displayName = "Slider";
