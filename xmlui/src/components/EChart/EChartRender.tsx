import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ReactECharts from "echarts-for-react";
import * as echarts from "echarts";
import { useTheme } from "../../components-core/theming/ThemeContext";
import styles from "./EChart.module.scss";
import classnames from "classnames";

/**
 * Comprehensive list of ECharts events to capture.
 * All of these are wired up to onNativeEvent — if an event never fires,
 * there's no overhead. This is the "let everything through" approach.
 */
const ECHARTS_EVENTS = [
  // Mouse events on data items
  "click",
  "dblclick",
  // Legend
  "legendselectchanged",
  "legendselected",
  "legendunselected",
  "legendscroll",
  // Data zoom
  "datazoom",
  "datarangeselected",
  // Selection
  "selectchanged",
  // Toolbox
  "restore",
  "dataviewchanged",
  "magictypechanged",
  // Brush
  "brush",
  "brushEnd",
  // Timeline
  "timelinechanged",
  "timelineplaychanged",
  // Graph / tree roam
  "graphroam",
];

/**
 * Resolve a value that may be a CSS var() reference to an actual color string.
 * ECharts renders on canvas, which doesn't understand CSS var() references.
 */
function resolveCssValue(value: string | undefined, el: HTMLElement | undefined): string {
  if (!value || !el) return "";
  // If it contains var(--...), resolve via getComputedStyle
  const varMatch = value.match(/var\((--[^)]+)\)/);
  if (varMatch) {
    return getComputedStyle(el).getPropertyValue(varMatch[1]).trim();
  }
  return value;
}

/**
 * Format a human-readable display label from an eCharts event object.
 * This is eCharts-specific knowledge — the render component owns it,
 * not the generic wrapComponent wrapper.
 */
function formatDisplayLabel(event: any, eventName: string): string | undefined {
  if (!event || typeof event !== "object") return undefined;

  // Legend events: { name: "seriesName", selected: { seriesName: true/false } }
  if (event.name != null && event.selected != null) {
    const isSelected = event.selected[event.name];
    return `${event.name}: ${isSelected ? "show" : "hide"}`;
  }

  // Data item events: { seriesName, name, value, dataIndex }
  if (event.seriesName != null && event.name != null) {
    const val = event.value != null ? ` = ${event.value}` : "";
    return `${event.seriesName} → ${event.name}${val}`;
  }

  // VisualMap slider: { selected: [min, max] } or { selected: { 0: [min, max] } }
  if (eventName === "datarangeselected" && event.selected != null) {
    const sel = Array.isArray(event.selected)
      ? event.selected
      : Object.values(event.selected)[0];
    if (Array.isArray(sel) && sel.length === 2) {
      return `${Math.round(sel[0] as number)} – ${Math.round(sel[1] as number)}`;
    }
  }

  // Zoom events: { start, end }
  if (event.start != null && event.end != null) {
    return `${Math.round(event.start)}% – ${Math.round(event.end)}%`;
  }

  // Graph roam: { zoom } for zoom, or pan with origin coords
  if (eventName === "graphroam") {
    if (event.zoom != null) return `zoom: ${event.zoom.toFixed(2)}`;
    if (event.originX != null && event.originY != null) {
      return `pan: ${Math.round(event.originX)}, ${Math.round(event.originY)}`;
    }
    return "roam";
  }

  // Timeline: { currentIndex }
  if (eventName === "timelinechanged" && event.currentIndex != null) {
    return `index: ${event.currentIndex}`;
  }
  if (eventName === "timelineplaychanged" && event.playState != null) {
    return event.playState ? "play" : "pause";
  }

  // Toolbox: magicType changed
  if (eventName === "magictypechanged" && event.currentType != null) {
    return event.currentType;
  }

  // Restore
  if (eventName === "restore") {
    return "restore";
  }

  // Brush: { areas: [...] }
  if (eventName === "brush" && event.areas != null) {
    return `${event.areas.length} area${event.areas.length !== 1 ? "s" : ""}`;
  }
  if (eventName === "brushEnd" && event.areas != null) {
    return `${event.areas.length} area${event.areas.length !== 1 ? "s" : ""}`;
  }

  // Select changed: { selected: [{ seriesIndex, dataIndex[] }] }
  if (eventName === "selectchanged" && event.selected != null) {
    const total = event.selected.reduce(
      (sum: number, s: any) => sum + (s.dataIndex?.length || 0), 0
    );
    return total > 0 ? `${total} selected` : "none selected";
  }

  // Generic fallback
  if (event.name != null) return String(event.name);
  if (event.seriesName != null) return String(event.seriesName);

  return undefined;
}

/**
 * ECharts render component. Uses useTheme() to inject XMLUI design tokens
 * into the ECharts option object at runtime — the "option-level theming"
 * pattern for libraries without CSS custom properties.
 *
 * Because ECharts renders on a canvas (not DOM), CSS var() references must
 * be resolved to actual color values via getComputedStyle.
 */
export function EChartRender({
  option,
  className,
  width,
  height,
  renderer = "canvas",
  registerComponentApi,
  onNativeEvent,
}: any) {
  const chartRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { getThemeVar, root } = useTheme();

  // Build the onEvents map: every known ECharts event calls onNativeEvent.
  // Memoized so it's stable across renders.
  const onEvents = useMemo(() => {
    if (!onNativeEvent) return undefined;
    const map: Record<string, (event: any) => void> = {};
    for (const eventName of ECHARTS_EVENTS) {
      map[eventName] = (event: any) => {
        const type = event?.type || eventName;
        onNativeEvent({
          ...event,
          type,
          displayLabel: formatDisplayLabel(event, eventName),
        });
      };
    }
    return map;
  }, [onNativeEvent]);

  // Diagnostic: monkey-patch trigger to discover ALL events eCharts fires.
  // Logs unknown event names to console so ECHARTS_EVENTS can be updated from real data.
  const patched = useRef(false);
  useEffect(() => {
    if (patched.current) return;
    const instance = chartRef.current?.getEchartsInstance();
    if (!instance) return;
    patched.current = true;
    const knownEvents = new Set(ECHARTS_EVENTS);
    const seen = new Set<string>();
    const originalTrigger = instance.trigger.bind(instance);
    instance.trigger = (eventName: string, ...args: any[]) => {
      if (!knownEvents.has(eventName) && !seen.has(eventName)) {
        seen.add(eventName);
        console.log(`[xs:echart-discovery] unknown event: "${eventName}"`, args[0]);
      }
      return originalTrigger(eventName, ...args);
    };
  });

  // Resolve a theme variable to an actual color value (not a CSS var reference)
  const resolve = useCallback(
    (varName: string, fallback: string = "") => {
      const raw = getThemeVar(varName);
      return resolveCssValue(raw, root) || fallback;
    },
    [getThemeVar, root],
  );

  // Build the XMLUI-themed color palette (same tokens as Recharts charts)
  const palette = useMemo(() => {
    return [
      resolve("color-primary-500"),
      resolve("color-success-500"),
      resolve("color-warn-500"),
      resolve("color-danger-500"),
      resolve("color-info-500"),
      resolve("color-secondary-500"),
      resolve("color-primary-300"),
      resolve("color-success-300"),
      resolve("color-warn-300"),
      resolve("color-danger-300"),
      resolve("color-info-300"),
      resolve("color-secondary-300"),
    ].filter(Boolean);
  }, [resolve]);

  const textColor = resolve("textColor-primary", "#333");
  const borderColor = resolve("color-surface-200", "#ccc");
  const tooltipBg = resolve("color-surface-50", "#fff");
  const bgColor = "transparent";

  // Merge XMLUI theme defaults with user-provided option.
  // User option wins — spread it last so explicit values override defaults.
  const themedOption = useMemo(() => {
    const defaults: any = {
      color: palette,
      backgroundColor: bgColor,
      textStyle: { color: textColor },
      title: { textStyle: { color: textColor } },
      legend: { textStyle: { color: textColor } },
      tooltip: {
        backgroundColor: tooltipBg,
        borderColor: borderColor,
        textStyle: { color: textColor },
      },
    };

    if (!option) return defaults;

    // Shallow merge at the top level, deep merge for nested objects
    const merged = { ...defaults, ...option };

    // Preserve user's color array if they specified one
    if (option.color) merged.color = option.color;
    // Merge textStyle
    if (option.textStyle) {
      merged.textStyle = { ...defaults.textStyle, ...option.textStyle };
    }
    // Merge tooltip
    if (option.tooltip) {
      merged.tooltip = { ...defaults.tooltip, ...option.tooltip };
      if (option.tooltip.textStyle) {
        merged.tooltip.textStyle = { ...defaults.tooltip.textStyle, ...option.tooltip.textStyle };
      }
    }
    // Merge legend
    if (option.legend) {
      merged.legend = { ...defaults.legend, ...option.legend };
      if (option.legend.textStyle) {
        merged.legend.textStyle = { ...defaults.legend.textStyle, ...option.legend.textStyle };
      }
    }
    // Merge title
    if (option.title) {
      merged.title = { ...defaults.title, ...option.title };
      if (option.title.textStyle) {
        merged.title.textStyle = { ...defaults.title.textStyle, ...option.title.textStyle };
      }
    }

    // Apply theme colors to axes if user didn't specify
    const applyAxisDefaults = (axis: any) => {
      if (!axis) return axis;
      const axes = Array.isArray(axis) ? axis : [axis];
      return axes.map((a: any) => ({
        axisLine: { lineStyle: { color: borderColor } },
        axisTick: { lineStyle: { color: borderColor } },
        axisLabel: { color: textColor },
        splitLine: { lineStyle: { color: borderColor } },
        ...a,
      }));
    };

    if (option.xAxis) merged.xAxis = applyAxisDefaults(option.xAxis);
    if (option.yAxis) merged.yAxis = applyAxisDefaults(option.yAxis);

    return merged;
  }, [option, palette, textColor, borderColor, tooltipBg, bgColor]);

  // Register component API
  useEffect(() => {
    registerComponentApi?.({
      getEchartsInstance: () => chartRef.current?.getEchartsInstance(),
    });
  }, [registerComponentApi]);

  // Diagnostic: monkey-patch the eCharts instance to discover ALL events it fires.
  // Logs unknown events to the console so we can expand ECHARTS_EVENTS from real data.
  // Enable by adding window._xsDiscoverEchartsEvents = true in the console.
  useEffect(() => {
  });

  // ResizeObserver for container-aware resizing (not just window resize)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let debounceTimer: ReturnType<typeof setTimeout>;
    const observer = new ResizeObserver(() => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        const instance = chartRef.current?.getEchartsInstance();
        instance?.resize();
      }, 100);
    });

    observer.observe(container);
    return () => {
      clearTimeout(debounceTimer);
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={classnames(styles.echartContainer, className)}
      style={{ width: width || "100%", height: height || "400px" }}
    >
      <ReactECharts
        ref={chartRef}
        echarts={echarts}
        option={themedOption}
        opts={{ renderer }}
        style={{ width: "100%", height: "100%" }}
        notMerge={true}
        onEvents={onEvents}
      />
    </div>
  );
}
