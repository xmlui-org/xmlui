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

export const defaultProps = {
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

type Props = {
  id?: string;
  value?: number | number[];
  initialValue?: number | number[];
  style?: CSSProperties;
  step?: number;
  max?: number;
  min?: number;
  inverted?: false;
  validationStatus?: ValidationStatus;
  minStepsBetweenThumbs?: number;
  onDidChange?: (newValue: number | number[]) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  updateState?: UpdateStateFn;
  registerComponentApi?: RegisterComponentApiFn;
  autoFocus?: boolean;
  readOnly?: boolean;
  tabIndex?: number;
  label?: string;
  labelPosition?: string;
  labelWidth?: string;
  labelBreak?: boolean;
  required?: boolean;
  enabled?: boolean;
  rangeStyle?: CSSProperties;
  thumbStyle?: CSSProperties;
  showValues?: boolean;
  valueFormat?: (value: number) => string;
};

// Helper function to ensure value is properly formatted
const formatValue = (val: number | number[] | undefined, defaultVal: number = 0): number[] => {
  if (val === undefined) {
    return [defaultVal];
  }
  if (typeof val === "number") {
    return [val];
  }
  if (Array.isArray(val) && val.length > 0) {
    return val;
  }
  return [defaultVal];
};

export const Slider = forwardRef(
  (
    {
      id,
      style,
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
      label,
      labelPosition,
      labelWidth,
      labelBreak,
      required,
      validationStatus = defaultProps.validationStatus,
      initialValue,
      minStepsBetweenThumbs = defaultProps.minStepsBetweenThumbs,
      rangeStyle,
      thumbStyle,
      showValues = defaultProps.showValues,
      valueFormat = defaultProps.valueFormat,
    }: Props,
    forwardedRef: ForwardedRef<HTMLInputElement>,
  ) => {
    const _id = useId();
    id = id || _id;
    const inputRef = useRef(null);

    // Initialize localValue properly
    const [localValue, setLocalValue] = React.useState<number[]>([]);

    // Process initialValue on mount
    useEffect(() => {
      let initialVal: number | number[] = min;

      if (typeof initialValue === "string") {
        try {
          // Try to parse as JSON first (for arrays)
          initialVal = JSON.parse(initialValue);
        } catch (e) {
          // If not JSON, try to parse as number
          const num = parseFloat(initialValue);
          if (!isNaN(num)) {
            initialVal = num;
          }
        }
      } else {
        initialVal = initialValue;
      }

      // Format the value properly
      const formattedValue = formatValue(initialVal, min);
      setLocalValue(formattedValue);

      // Notify parent component
      if (updateState) {
        updateState({
          value: formattedValue.length === 1 ? formattedValue[0] : formattedValue
        }, { initial: true });
      }
    }, [initialValue, min, updateState]);

    // Sync with external value changes
    useEffect(() => {
      if (value !== undefined) {
        const formattedValue = formatValue(value, min);
        setLocalValue(formattedValue);
      }
    }, [value, min]);

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
      [updateValue],
    );

    // Component APIs
    const handleOnFocus = useCallback(() => {
      onFocus?.();
    }, [onFocus]);

    const handleOnBlur = useCallback(() => {
      onBlur?.();
    }, [onBlur]);

    const focus = useCallback(() => {
      inputRef.current?.focus();
    }, []);

    const setValue = useEvent((newValue) => {
      updateValue(newValue);
    });

    useEffect(() => {
      registerComponentApi?.({
        focus,
        setValue,
      });
    }, [focus, registerComponentApi, setValue]);

    // Ensure we always have at least one thumb
    const displayValue = localValue.length > 0 ? localValue : [min];

    // Format the current values as a string
    const valuesText = displayValue.map(v => valueFormat(v)).join(', ');

    // Create a custom label that includes the current values
    const displayLabel = label ? (showValues ? `${label} ${valuesText}` : label) : (showValues ? valuesText : '');

    return (
      <ItemWithLabel
        labelPosition={labelPosition as any}
        label={displayLabel}
        labelWidth={labelWidth}
        labelBreak={labelBreak}
        required={required}
        enabled={enabled}
        onFocus={onFocus}
        onBlur={onBlur}
        style={style}
        ref={forwardedRef}
        id={id}
        isInputTemplateUsed={true}
      >
        <div className={styles.sliderContainer}>
          <Root
            minStepsBetweenThumbs={minStepsBetweenThumbs}
            ref={inputRef}
            tabIndex={tabIndex}
            aria-readonly={readOnly}
            className={classnames(styles.sliderRoot, {
              [styles.disabled]: !enabled,
              [styles.readOnly]: readOnly
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
            aria-required={required}
            value={displayValue}
            autoFocus={autoFocus}
          >
            <Track
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
                className={classnames(styles.sliderRange, {
                  [styles.disabled]: !enabled
                })}
              />
            </Track>
            {displayValue.map((_, index) => (
              <Thumb
                key={index}
                className={classnames(styles.sliderThumb, {
                  [styles.disabled]: !enabled
                })}
                style={thumbStyle ? { ...thumbStyle } : undefined}
                id={id}
              />
            ))}
          </Root>
        </div>
      </ItemWithLabel>
    );
  },
);

Slider.displayName = Root.displayName;
