import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ReactECharts from "echarts-for-react";
import * as echarts from "echarts";
import { useTheme } from "xmlui";
import styles from "./EChart.module.scss";
import classnames from "classnames";

const ECHARTS_EVENTS = [
  "click", "dblclick",
  "mouseover", "mouseout",
  "legendselectchanged", "legendselected", "legendunselected", "legendscroll",
  "datazoom", "datarangeselected",
  "selectchanged",
  "restore", "dataviewchanged", "magictypechanged",
  "brush", "brushEnd",
  "timelinechanged", "timelineplaychanged",
  "graphroam",
];

function resolveCssValue(value: string | undefined, el: HTMLElement | undefined): string {
  if (!value || !el) return "";
  const varMatch = value.match(/var\((--[^)]+)\)/);
  if (varMatch) {
    return getComputedStyle(el).getPropertyValue(varMatch[1]).trim();
  }
  return value;
}

function formatDisplayLabel(event: any, eventName: string): string | undefined {
  if (!event || typeof event !== "object") return undefined;
  if (event.name != null && event.selected != null) {
    const isSelected = event.selected[event.name];
    return `${event.name}: ${isSelected ? "show" : "hide"}`;
  }
  if (event.seriesName != null && event.name != null) {
    const val = event.value != null ? ` = ${event.value}` : "";
    return `${event.seriesName} → ${event.name}${val}`;
  }
  if (eventName === "datarangeselected" && event.selected != null) {
    const sel = Array.isArray(event.selected)
      ? event.selected
      : Object.values(event.selected)[0];
    if (Array.isArray(sel) && sel.length === 2) {
      return `${Math.round(sel[0] as number)} – ${Math.round(sel[1] as number)}`;
    }
  }
  if (event.start != null && event.end != null) {
    return `${Math.round(event.start)}% – ${Math.round(event.end)}%`;
  }
  if (eventName === "graphroam") {
    if (event.zoom != null) return `zoom: ${event.zoom.toFixed(2)}`;
    if (event.originX != null && event.originY != null) {
      return `pan: ${Math.round(event.originX)}, ${Math.round(event.originY)}`;
    }
    return "roam";
  }
  if (eventName === "timelinechanged" && event.currentIndex != null) {
    return `index: ${event.currentIndex}`;
  }
  if (eventName === "timelineplaychanged" && event.playState != null) {
    return event.playState ? "play" : "pause";
  }
  if (eventName === "magictypechanged" && event.currentType != null) {
    return event.currentType;
  }
  if (eventName === "restore") return "restore";
  if (eventName === "brush" && event.areas != null) {
    return `${event.areas.length} area${event.areas.length !== 1 ? "s" : ""}`;
  }
  if (eventName === "brushEnd" && event.areas != null) {
    return `${event.areas.length} area${event.areas.length !== 1 ? "s" : ""}`;
  }
  if (eventName === "selectchanged" && event.selected != null) {
    const total = event.selected.reduce(
      (sum: number, s: any) => sum + (s.dataIndex?.length || 0), 0
    );
    return total > 0 ? `${total} selected` : "none selected";
  }
  if (event.name != null) return String(event.name);
  if (event.seriesName != null) return String(event.seriesName);
  return undefined;
}

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

  const resolve = useCallback(
    (varName: string, fallback: string = "") => {
      const raw = getThemeVar(varName);
      return resolveCssValue(raw, root) || fallback;
    },
    [getThemeVar, root],
  );

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

    const merged = { ...defaults, ...option };
    if (option.color) merged.color = option.color;
    if (option.textStyle) {
      merged.textStyle = { ...defaults.textStyle, ...option.textStyle };
    }
    if (option.tooltip) {
      merged.tooltip = { ...defaults.tooltip, ...option.tooltip };
      if (option.tooltip.textStyle) {
        merged.tooltip.textStyle = { ...defaults.tooltip.textStyle, ...option.tooltip.textStyle };
      }
    }
    if (option.legend) {
      merged.legend = { ...defaults.legend, ...option.legend };
      if (option.legend.textStyle) {
        merged.legend.textStyle = { ...defaults.legend.textStyle, ...option.legend.textStyle };
      }
    }
    if (option.title) {
      merged.title = { ...defaults.title, ...option.title };
      if (option.title.textStyle) {
        merged.title.textStyle = { ...defaults.title.textStyle, ...option.title.textStyle };
      }
    }

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

  useEffect(() => {
    registerComponentApi?.({
      getEchartsInstance: () => chartRef.current?.getEchartsInstance(),
    });
  }, [registerComponentApi]);

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
