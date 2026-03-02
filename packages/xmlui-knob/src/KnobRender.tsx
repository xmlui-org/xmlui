import React, { useCallback, useEffect, useRef } from "react";
import { forwardRef } from "react";
import { KnobHeadless } from "react-knob-headless";

/**
 * Pure React knob component. No XMLUI imports.
 * Receives `value`, `onChange`, `registerApi` from wrapCompound's StateWrapper.
 */
export const KnobRender = forwardRef(({
  value, onChange, registerApi, className,
  min = 0, max = 100, step = 1,
  enabled = true, readOnly,
  ...rest
}: any, ref: any) => {
  const knobRef = useRef<HTMLDivElement>(null);

  const numValue = typeof value === "number" ? value : min;

  useEffect(() => {
    registerApi?.({
      focus: () => knobRef.current?.focus(),
      setValue: (v: any) => onChange?.(Number(v)),
    });
  }, [registerApi, onChange]);

  const handleChange = useCallback((newVal: number) => {
    if (readOnly || !enabled) return;
    // Round to step
    const rounded = Math.round(newVal / step) * step;
    const clamped = Math.min(max, Math.max(min, rounded));
    onChange(clamped);
  }, [onChange, readOnly, enabled, min, max, step]);

  // Knob visual: a circle with a rotation indicator
  const rotation = ((numValue - min) / (max - min)) * 270 - 135;

  return (
    <div ref={ref} className={className} {...rest} style={{ display: "inline-block", ...rest.style }}>
      <KnobHeadless
        ref={knobRef}
        valueMin={min}
        valueMax={max}
        valueRaw={numValue}
        valueRawRoundFn={(v: number) => Math.round(v / step) * step}
        valueRawDisplayFn={(v: number) => String(Math.round(v / step) * step)}
        dragSensitivity={0.006}
        onValueRawChange={handleChange}
        aria-label={rest["aria-label"] || "Knob"}
        style={{
          width: 80,
          height: 80,
          borderRadius: "50%",
          background: `conic-gradient(
            var(--knob-color, #6366f1) 0deg,
            var(--knob-color, #6366f1) ${((numValue - min) / (max - min)) * 270}deg,
            #e2e8f0 ${((numValue - min) / (max - min)) * 270}deg,
            #e2e8f0 270deg,
            transparent 270deg
          )`,
          border: "3px solid #cbd5e1",
          cursor: enabled && !readOnly ? "grab" : "default",
          opacity: enabled ? 1 : 0.5,
          position: "relative" as const,
          outline: "none",
        }}
      >
        {/* Indicator line */}
        <div style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: 2,
          height: "40%",
          background: "#1e293b",
          borderRadius: 1,
          transformOrigin: "bottom center",
          transform: `translate(-50%, -100%) rotate(${rotation}deg)`,
        }} />
      </KnobHeadless>
      <div style={{ textAlign: "center", marginTop: 4, fontSize: 14, fontWeight: 600 }}>
        {numValue}
      </div>
    </div>
  );
});

KnobRender.displayName = "KnobRender";
