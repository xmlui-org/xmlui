import React, { memo, useCallback, useEffect, useRef } from "react";
import { forwardRef } from "react";
import type { ForwardedRef } from "react";
import { Gauge } from "smart-webcomponents-react/gauge/gauge.umd.js";
import "smart-webcomponents-react/source/styles/smart.default.css";
import styles from "./Gauge.module.scss";
import classnames from "classnames";

type Props = React.HTMLAttributes<HTMLDivElement> & {
  value?: number;
  onChange?: (value: number) => void;
  registerApi?: (api: Record<string, unknown>) => void;
  min?: number;
  max?: number;
  analogDisplayType?: string;
  digitalDisplay?: boolean;
  startAngle?: number;
  endAngle?: number;
  scalePosition?: string;
  animation?: string;
  unit?: string;
  showUnit?: boolean;
  enabled?: boolean;
};

export const GaugeRender = memo(forwardRef(function GaugeRender({
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
}: Props, ref: ForwardedRef<HTMLDivElement>) {
  const gaugeRef = useRef<any>(null);
  const numValue = typeof value === "number" ? value : min;

  const focusApi = useCallback(() => gaugeRef.current?.focus(), []);
  const setValueApi = useCallback((v: unknown) => onChange?.(Number(v)), [onChange]);

  useEffect(() => {
    registerApi?.({
      focus: focusApi,
      setValue: setValueApi,
    });
  }, [registerApi, focusApi, setValueApi]);

  const handleChange = useCallback((event: any) => {
    const newVal = event?.detail?.value ?? event?.detail;
    if (newVal != null) {
      onChange?.(Math.round(Number(newVal) * 100) / 100);
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
}));
