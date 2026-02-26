import React, { useCallback, useEffect, useRef, useState } from "react";
import { forwardRef } from "react";
import { Root, Range, Track, Thumb } from "@radix-ui/react-slider";
import classnames from "classnames";
import styles from "./Slider.module.scss";
import { Tooltip } from "../Tooltip/TooltipNative";

/**
 * Pure Radix slider assembly. No XMLUI imports.
 *
 * Receives `value`, `onChange`, and `registerApi` from wrapCompound's
 * StateWrapper. Everything else is native React/Radix props.
 */
export const SliderRender = forwardRef(({
  value, onChange, registerApi, className,
  min = 0, max = 10, step = 1, inverted, enabled = true, readOnly,
  required, autoFocus, tabIndex = -1, validationStatus = "none",
  minStepsBetweenThumbs = 1, rangeStyle, thumbStyle,
  showValues = true, valueFormat = (v: number) => v.toString(),
  id,
  ...rest
}: any, ref: any) => {
  const inputRef = useRef<any>(null);
  const thumbsRef = useRef<(HTMLSpanElement | null)[]>([]);
  const [showTooltip, setShowTooltip] = useState(false);

  const displayValue: number[] = Array.isArray(value) ? value : value != null ? [value] : [min];

  useEffect(() => {
    registerApi?.({
      focus: () => {
        const thumb = thumbsRef.current.find(t => t !== null);
        if (thumb) thumb.focus();
        else inputRef.current?.focus();
      },
      setValue: (v: any) => onChange?.(v),
    });
  }, [registerApi, onChange]);

  const handleValueChange = useCallback((vals: number[]) => {
    if (readOnly) return;
    if (inputRef.current) inputRef.current.value = vals;
    onChange(vals.length === 1 ? vals[0] : vals);
  }, [onChange, readOnly]);

  return (
    <div {...rest} ref={ref} className={classnames(styles.sliderContainer, className)} data-slider-container>
      <Root
        ref={inputRef}
        value={displayValue}
        onValueChange={handleValueChange}
        min={min} max={max} step={step} inverted={inverted}
        disabled={!enabled} tabIndex={tabIndex}
        aria-readonly={readOnly}
        minStepsBetweenThumbs={minStepsBetweenThumbs}
        className={classnames(styles.sliderRoot, {
          [styles.disabled]: !enabled,
          [styles.readOnly]: readOnly,
        })}
        onFocus={(e: any) => { setShowTooltip(true); rest.onFocus?.(e); }}
        onBlur={(e: any) => { rest.onBlur?.(e); }}
        onMouseOver={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onPointerDown={() => setShowTooltip(true)}
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
        {displayValue.map((_: any, index: number) => (
          <Tooltip
            key={index}
            text={valueFormat(displayValue[index])}
            delayDuration={100}
            open={showValues && showTooltip}
          >
            <Thumb
              id={id}
              aria-required={required}
              ref={(el: any) => { thumbsRef.current[index] = el; }}
              className={classnames(styles.sliderThumb, {
                [styles.disabled]: !enabled,
              })}
              style={thumbStyle ? { ...thumbStyle } : undefined}
              data-thumb-index={index}
              autoFocus={autoFocus && index === 0}
            />
          </Tooltip>
        ))}
      </Root>
    </div>
  );
});

SliderRender.displayName = "SliderRender";
