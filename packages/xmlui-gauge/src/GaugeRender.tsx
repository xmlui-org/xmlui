import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import { forwardRef } from "react";
import type { ForwardedRef } from "react";
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
  const [isReady, setIsReady] = useState(false);
  const numValue = typeof value === "number" ? value : min;

  useEffect(() => {
    let cancelled = false;

    import("smart-webcomponents-react/source/modules/smart.gauge.js")
      .then(() => {
        if (!cancelled) {
          setIsReady(true);
        }
      })
      .catch((error) => {
        console.error("Failed to load smart gauge component", error);
      });

    return () => {
      cancelled = true;
    };
  }, []);

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

  useEffect(() => {
    const gauge = gaugeRef.current;
    if (!isReady || !gauge) return;

    const onGaugeChange = (event: Event) => handleChange(event);
    gauge.addEventListener("change", onGaugeChange);
    return () => {
      gauge.removeEventListener("change", onGaugeChange);
    };
  }, [handleChange, isReady]);

  useEffect(() => {
    const gauge = gaugeRef.current;
    if (!isReady || !gauge) return;

    Object.assign(gauge, {
      value: numValue,
      min,
      max,
      analogDisplayType,
      digitalDisplay,
      startAngle,
      endAngle,
      scalePosition,
      animation,
      unit,
      showUnit,
      disabled: !enabled,
      precisionDigits: 0,
    });
  }, [
    analogDisplayType,
    animation,
    digitalDisplay,
    enabled,
    endAngle,
    isReady,
    max,
    min,
    numValue,
    scalePosition,
    showUnit,
    startAngle,
    unit,
  ]);

  return (
    <div ref={ref} className={classnames(styles.gaugeContainer, className)} {...rest}>
      {isReady ? React.createElement("smart-gauge", { ref: gaugeRef }) : null}
    </div>
  );
}));
