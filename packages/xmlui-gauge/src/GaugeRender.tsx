import React, { useCallback, useEffect, useRef } from "react";
import { forwardRef } from "react";
import { Gauge } from "smart-webcomponents-react/gauge";
import "smart-webcomponents-react/source/styles/smart.default.css";
import styles from "./Gauge.module.scss";
import classnames from "classnames";

/**
 * Pure React gauge component. No XMLUI imports.
 * Receives `value`, `onChange`, `registerApi` from wrapCompound's StateWrapper.
 */
export const GaugeRender = forwardRef(({
  value, onChange, registerApi, className,
  min = 0, max = 100,
  analogDisplayType = "needle",
  digitalDisplay = false,
  startAngle = -30, endAngle = 210,
  scalePosition = "inside",
  animation = "none",
  unit = "", showUnit = false,
  enabled = true,
  ...rest
}: any, ref: any) => {
  const gaugeRef = useRef<any>(null);
  const numValue = typeof value === "number" ? value : min;

  useEffect(() => {
    registerApi?.({
      focus: () => gaugeRef.current?.focus(),
      setValue: (v: any) => onChange?.(Number(v)),
    });
  }, [registerApi, onChange]);

  const handleChange = useCallback((event: any) => {
    const newVal = event?.detail?.value ?? event?.detail;
    if (newVal != null) {
      onChange(Math.round(Number(newVal) * 100) / 100);
    }
  }, [onChange]);

  return (
    <div ref={ref} className={classnames(styles.gaugeContainer, className)} {...rest}>
      <Gauge
        ref={gaugeRef}
        value={numValue}
        min={min}
        max={max}
        analogDisplayType={analogDisplayType}
        digitalDisplay={digitalDisplay}
        startAngle={startAngle}
        endAngle={endAngle}
        scalePosition={scalePosition}
        animation={animation}
        unit={unit}
        showUnit={showUnit}
        disabled={!enabled}
        precisionDigits={0}
        onChange={handleChange}
      />
    </div>
  );
});

GaugeRender.displayName = "GaugeRender";
