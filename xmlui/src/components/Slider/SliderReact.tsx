import type { CSSProperties, FocusEvent, KeyboardEvent, PointerEvent } from "react";
import { forwardRef, memo, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";

import { defaultProps } from "./Slider.defaults";

const styles = {
  disabled: "disabled",
  readOnly: "readOnly",
  sliderContainer: "sliderContainer",
  sliderLabel: "sliderLabel",
  sliderLabelBreak: "sliderLabelBreak",
  sliderLabelPositionBottom: "sliderLabelPositionBottom",
  sliderLabelPositionEnd: "sliderLabelPositionEnd",
  sliderLabelPositionStart: "sliderLabelPositionStart",
  sliderLabelPositionTop: "sliderLabelPositionTop",
  sliderLabelRequired: "sliderLabelRequired",
  sliderLabeledItem: "sliderLabeledItem",
  sliderRange: "sliderRange",
  sliderRoot: "sliderRoot",
  sliderThumb: "sliderThumb",
  sliderTooltip: "sliderTooltip",
  sliderTrack: "sliderTrack",
  sliderTrackError: "sliderTrackError",
  sliderTrackSuccess: "sliderTrackSuccess",
  sliderTrackWarning: "sliderTrackWarning",
} as const;

export type SliderApi = {
  focus: () => void;
  setValue: (value: unknown) => void;
  value: number | number[];
};

export type SliderProps = {
  id?: string;
  value?: unknown;
  initialValue?: unknown;
  min?: unknown;
  max?: unknown;
  step?: unknown;
  minStepsBetweenThumbs?: unknown;
  inverted?: unknown;
  enabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  autoFocus?: boolean;
  tabIndex?: number;
  label?: unknown;
  labelPosition?: "start" | "end" | "top" | "bottom" | string;
  labelBreak?: boolean;
  labelWidth?: string | number;
  validationStatus?: string;
  showValues?: boolean;
  valueFormat?: unknown;
  className?: string;
  style?: CSSProperties;
  rangeStyle?: CSSProperties;
  thumbStyle?: CSSProperties;
  title?: string;
  onDidChange?: (value: number | number[]) => void | Promise<void>;
  onFocus?: () => void | Promise<void>;
  onBlur?: () => void | Promise<void>;
  "data-testid"?: string;
};

export const SliderNative = memo(forwardRef<SliderApi, SliderProps>(function SliderNative(
  {
    id,
    value,
    initialValue,
    min = defaultProps.min,
    max = defaultProps.max,
    step = defaultProps.step,
    minStepsBetweenThumbs = defaultProps.minStepsBetweenThumbs,
    inverted,
    enabled = defaultProps.enabled,
    readOnly,
    required,
    autoFocus,
    tabIndex = defaultProps.tabIndex,
    label,
    labelPosition = "top",
    labelBreak,
    labelWidth,
    validationStatus = defaultProps.validationStatus,
    showValues = defaultProps.showValues,
    valueFormat,
    className,
    style,
    rangeStyle,
    thumbStyle,
    title,
    onDidChange,
    onFocus,
    onBlur,
    "data-testid": dataTestId,
    ...rest
  },
  ref,
) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const thumbRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const controlled = value !== undefined;
  const bounds = useMemo(() => normalizeBounds(min, max), [max, min]);
  const normalizedStep = normalizePositiveNumber(step, defaultProps.step);
  const normalizedGap = Math.max(0, normalizePositiveNumber(minStepsBetweenThumbs, defaultProps.minStepsBetweenThumbs)) * normalizedStep;
  const [localValue, setLocalValue] = useState<number[]>(() =>
    normalizeValue(controlled ? value : initialValue, bounds.min, bounds.max),
  );
  const currentValue = controlled ? normalizeValue(value, bounds.min, bounds.max) : localValue;
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const interactive = enabled && !readOnly;

  useEffect(() => {
    if (controlled) {
      setLocalValue(normalizeValue(value, bounds.min, bounds.max));
    }
  }, [bounds.max, bounds.min, controlled, value]);

  useEffect(() => {
    if (!controlled) {
      setLocalValue(normalizeValue(initialValue, bounds.min, bounds.max));
    }
  }, [bounds.max, bounds.min, controlled, initialValue]);

  useEffect(() => {
    if (autoFocus && enabled) {
      const timeoutId = setTimeout(() => thumbRefs.current[0]?.focus(), 0);
      return () => clearTimeout(timeoutId);
    }
  }, [autoFocus, enabled]);

  const emitValue = useCallback((next: number[]) => {
    const normalized = normalizeRangeOrder(enforceThumbGap(next, currentValue, -1, bounds.min, bounds.max, normalizedGap));
    setLocalValue(normalized);
    const publicValue = toPublicValue(normalized);
    void onDidChange?.(publicValue);
  }, [bounds.max, bounds.min, currentValue, normalizedGap, onDidChange]);

  const updateThumb = useCallback((index: number, nextNumber: number) => {
    if (!interactive) {
      return;
    }
    const next = [...currentValue];
    next[index] = snapToStep(nextNumber, bounds.min, bounds.max, normalizedStep);
    emitValue(enforceThumbGap(next, currentValue, index, bounds.min, bounds.max, normalizedGap));
  }, [bounds.max, bounds.min, currentValue, emitValue, interactive, normalizedGap, normalizedStep]);

  const updateFromPointer = useCallback((event: PointerEvent, index: number) => {
    if (!interactive || !trackRef.current) {
      return;
    }
    event.preventDefault();
    const rect = trackRef.current.getBoundingClientRect();
    const rawRatio = rect.width === 0 ? 0 : (event.clientX - rect.left) / rect.width;
    const ratio = truthy(inverted) ? 1 - rawRatio : rawRatio;
    updateThumb(index, bounds.min + clamp(ratio, 0, 1) * (bounds.max - bounds.min));
  }, [bounds.max, bounds.min, interactive, inverted, updateThumb]);

  const handlePointerDown = useCallback((event: PointerEvent<HTMLSpanElement>, index: number) => {
    updateFromPointer(event, index);
    const target = event.currentTarget;
    target.setPointerCapture(event.pointerId);
    target.focus();
  }, [updateFromPointer]);

  const handleKeyDown = useCallback((event: KeyboardEvent<HTMLSpanElement>, index: number) => {
    if (!interactive) {
      return;
    }
    let nextValue: number | undefined;
    const current = currentValue[index] ?? bounds.min;
    switch (event.key) {
      case "ArrowRight":
      case "ArrowUp":
        nextValue = current + normalizedStep;
        break;
      case "ArrowLeft":
      case "ArrowDown":
        nextValue = current - normalizedStep;
        break;
      case "Home":
        nextValue = bounds.min;
        break;
      case "End":
        nextValue = bounds.max;
        break;
      default:
        return;
    }
    event.preventDefault();
    updateThumb(index, nextValue);
  }, [bounds.max, bounds.min, currentValue, interactive, normalizedStep, updateThumb]);

  useImperativeHandle(ref, () => ({
    focus: () => {
      if (enabled) {
        thumbRefs.current[0]?.focus();
      }
    },
    setValue: (nextValue) => {
      if (!interactive) {
        return;
      }
      emitValue(normalizeValue(nextValue, bounds.min, bounds.max));
    },
    get value() {
      return toPublicValue(currentValue);
    },
  }), [bounds.max, bounds.min, currentValue, emitValue, enabled, interactive]);

  const labelText = stringifyLabel(label);
  const hasLabel = labelText !== "";
  const slider = (
    <div
      {...(!hasLabel ? rest : undefined)}
      data-slider-container
      data-part-id="input"
      data-xmlui-part="input"
      data-testid={!hasLabel ? dataTestId ?? id : undefined}
      title={title}
      className={cx(
        styles.sliderContainer,
        !enabled ? styles.disabled : undefined,
        readOnly ? styles.readOnly : undefined,
        !hasLabel ? className : undefined,
      )}
      style={!hasLabel ? style : undefined}
    >
      <div className={styles.sliderRoot}>
        <div
          ref={trackRef}
          data-track
          className={cx(
            styles.sliderTrack,
            validationStatus === "error" ? styles.sliderTrackError : undefined,
            validationStatus === "warning" ? styles.sliderTrackWarning : undefined,
            validationStatus === "valid" ? styles.sliderTrackSuccess : undefined,
          )}
        >
          <div data-range className={styles.sliderRange} style={{ ...rangeRect(currentValue, bounds.min, bounds.max, truthy(inverted)), ...rangeStyle }} />
          {currentValue.map((thumbValue, index) => {
            const position = valueToPercent(thumbValue, bounds.min, bounds.max, truthy(inverted));
            return (
              <span
                key={index}
                id={id}
                ref={(element) => {
                  thumbRefs.current[index] = element;
                }}
                role="slider"
                data-thumb-index={index}
                className={styles.sliderThumb}
                style={{ left: `${position}%`, ...thumbStyle }}
                tabIndex={enabled ? tabIndex : -1}
                aria-valuemin={bounds.min}
                aria-valuemax={bounds.max}
                aria-valuenow={thumbValue}
                aria-required={required}
                aria-readonly={readOnly}
                aria-disabled={!enabled}
                onPointerDown={(event) => handlePointerDown(event, index)}
                onPointerMove={(event) => {
                  if (event.buttons === 1) {
                    updateFromPointer(event, index);
                  }
                }}
                onKeyDown={(event) => handleKeyDown(event, index)}
                onFocus={(_event: FocusEvent<HTMLSpanElement>) => {
                  setTooltipVisible(true);
                  if (enabled) {
                    void onFocus?.();
                  }
                }}
                onBlur={(_event: FocusEvent<HTMLSpanElement>) => {
                  setTooltipVisible(false);
                  void onBlur?.();
                }}
                onMouseEnter={() => setTooltipVisible(true)}
                onMouseLeave={() => setTooltipVisible(false)}
              >
                {showValues && tooltipVisible ? (
                  <span className={styles.sliderTooltip}>{formatSliderValue(thumbValue, valueFormat)}</span>
                ) : null}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );

  if (!hasLabel) {
    return slider;
  }

  return (
    <div
      {...rest}
      data-xmlui-component="Slider"
      data-xmlui-part="input"
      data-xmlui-id={id}
      data-testid={dataTestId ?? id}
      className={className}
      style={style}
    >
      <div
        data-part-id="labeledItem"
        data-xmlui-part="labeledItem"
        className={cx(styles.sliderLabeledItem, labelPositionClass(labelPosition))}
      >
        <label
          className={cx(styles.sliderLabel, labelBreak ? styles.sliderLabelBreak : undefined)}
          style={labelWidth !== undefined ? { display: "inline-block", width: cssLength(labelWidth) } : undefined}
          onClick={() => {
            if (enabled) {
              thumbRefs.current[0]?.focus();
            }
          }}
        >
          {labelText}
          {required ? <span className={styles.sliderLabelRequired}>*</span> : null}
        </label>
        {slider}
      </div>
    </div>
  );
}));

function normalizeBounds(min: unknown, max: unknown): { min: number; max: number } {
  const normalizedMin = normalizeNumber(min, defaultProps.min);
  const normalizedMax = normalizeNumber(max, defaultProps.max);
  return normalizedMin <= normalizedMax
    ? { min: normalizedMin, max: normalizedMax }
    : { min: normalizedMax, max: normalizedMin };
}

function normalizeValue(value: unknown, min: number, max: number): number[] {
  const parsed = parseInitialValue(value);
  const values = Array.isArray(parsed) ? parsed : [parsed];
  return normalizeRangeOrder(values.map((item) => clamp(normalizeNumber(item, min), min, max)));
}

function parseInitialValue(value: unknown): unknown {
  if (typeof value !== "string") {
    return value;
  }
  if (value.trim() === "") {
    return undefined;
  }
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function normalizeRangeOrder(values: number[]): number[] {
  return values.length > 1 ? [...values].sort((a, b) => a - b) : values;
}

function enforceThumbGap(values: number[], previous: number[], activeIndex: number, min: number, max: number, gap: number): number[] {
  if (values.length < 2 || gap <= 0) {
    return values.map((value) => clamp(value, min, max));
  }
  const next = [...values];
  if (activeIndex === 0) {
    next[0] = Math.min(next[0], next[1] - gap);
  } else if (activeIndex === 1) {
    next[1] = Math.max(next[1], next[0] + gap);
  } else if (activeIndex < 0) {
    return normalizeRangeOrder(next).map((value, index, array) => {
      if (index > 0 && value - array[index - 1] < gap) {
        return array[index - 1] + gap;
      }
      return value;
    }).map((value) => clamp(value, min, max));
  }
  return next.map((value) => clamp(value, min, max)).map((value, index) => {
    if (index === activeIndex) {
      return value;
    }
    return previous[index] ?? value;
  });
}

function toPublicValue(values: number[]): number | number[] {
  return values.length === 1 ? values[0] : values;
}

function normalizeNumber(value: unknown, fallback: number): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
}

function normalizePositiveNumber(value: unknown, fallback: number): number {
  const parsed = normalizeNumber(value, fallback);
  return parsed > 0 ? parsed : fallback;
}

function snapToStep(value: number, min: number, max: number, step: number): number {
  const snapped = min + Math.round((value - min) / step) * step;
  return clamp(roundStep(snapped, step), min, max);
}

function roundStep(value: number, step: number): number {
  const decimalPart = String(step).split(".")[1];
  if (!decimalPart && !String(step).includes("e-")) {
    return value;
  }
  if (String(step).includes("e-")) {
    return Number(value.toExponential());
  }
  return Number(value.toFixed(decimalPart.length));
}

function valueToPercent(value: number, min: number, max: number, invertedValue: boolean): number {
  const range = max - min || 1;
  const percent = ((value - min) / range) * 100;
  return invertedValue ? 100 - percent : percent;
}

function rangeRect(values: number[], min: number, max: number, invertedValue: boolean): CSSProperties {
  const percents = values.map((value) => valueToPercent(value, min, max, invertedValue));
  const start = values.length > 1 ? Math.min(...percents) : invertedValue ? percents[0] : 0;
  const end = values.length > 1 ? Math.max(...percents) : invertedValue ? 100 : percents[0];
  return {
    left: `${start}%`,
    width: `${Math.max(0, end - start)}%`,
  };
}

function formatSliderValue(value: number, formatter: unknown): string {
  return typeof formatter === "function" ? String((formatter as (value: number) => unknown)(value)) : String(value);
}

function labelPositionClass(position: SliderProps["labelPosition"]): string {
  switch (position) {
    case "start":
      return styles.sliderLabelPositionStart;
    case "end":
      return styles.sliderLabelPositionEnd;
    case "bottom":
      return styles.sliderLabelPositionBottom;
    case "top":
    default:
      return styles.sliderLabelPositionTop;
  }
}

function cssLength(value: string | number): string {
  return typeof value === "number" ? `${value}px` : value;
}

function stringifyLabel(value: unknown): string {
  return value === undefined || value === null ? "" : String(value);
}

function truthy(value: unknown): boolean {
  return value === true || value === "true";
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function cx(...values: Array<string | undefined | false>): string {
  return values.filter(Boolean).join(" ");
}
