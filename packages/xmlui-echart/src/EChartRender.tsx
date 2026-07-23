import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import ReactECharts from "echarts-for-react";
import * as echarts from "echarts";
import { useTheme } from "xmlui";
import type { RegisterComponentApiFn } from "xmlui";
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

function formatDisplayLabel(event: unknown, eventName: string): string | undefined {
  if (!event || typeof event !== "object") return undefined;
  const e = event as Record<string, unknown>;
  if (e.name != null && e.selected != null) {
    const isSelected = (e.selected as Record<string, unknown>)[e.name as string];
    return `${e.name}: ${isSelected ? "show" : "hide"}`;
  }
  if (e.seriesName != null && e.name != null) {
    const val = e.value != null ? ` = ${e.value}` : "";
    return `${e.seriesName} → ${e.name}${val}`;
  }
  if (eventName === "datarangeselected" && e.selected != null) {
    const sel = Array.isArray(e.selected)
      ? e.selected
      : Object.values(e.selected as Record<string, unknown>)[0];
    if (Array.isArray(sel) && sel.length === 2) {
      return `${Math.round(sel[0] as number)} – ${Math.round(sel[1] as number)}`;
    }
  }
  if (e.start != null && e.end != null) {
    return `${Math.round(e.start as number)}% – ${Math.round(e.end as number)}%`;
  }
  if (eventName === "graphroam") {
    if (e.zoom != null) return `zoom: ${(e.zoom as number).toFixed(2)}`;
    if (e.originX != null && e.originY != null) {
      return `pan: ${Math.round(e.originX as number)}, ${Math.round(e.originY as number)}`;
    }
    return "roam";
  }
  if (eventName === "timelinechanged" && e.currentIndex != null) {
    return `index: ${e.currentIndex}`;
  }
  if (eventName === "timelineplaychanged" && e.playState != null) {
    return e.playState ? "play" : "pause";
  }
  if (eventName === "magictypechanged" && e.currentType != null) {
    return String(e.currentType);
  }
  if (eventName === "restore") return "restore";
  if (eventName === "brush" && e.areas != null) {
    const areas = e.areas as unknown[];
    return `${areas.length} area${areas.length !== 1 ? "s" : ""}`;
  }
  if (eventName === "brushEnd" && e.areas != null) {
    const areas = e.areas as unknown[];
    return `${areas.length} area${areas.length !== 1 ? "s" : ""}`;
  }
  if (eventName === "selectchanged" && e.selected != null) {
    const total = (e.selected as Array<{ dataIndex?: unknown[] }>).reduce(
      (sum: number, s) => sum + (s.dataIndex?.length || 0), 0
    );
    return total > 0 ? `${total} selected` : "none selected";
  }
  if (e.name != null) return String(e.name);
  if (e.seriesName != null) return String(e.seriesName);
  return undefined;
}

type Props = {
  option?: unknown;
  maps?: Record<string, unknown>;
  className?: string;
  width?: string;
  height?: string;
  renderer?: "canvas" | "svg";
  registerComponentApi?: RegisterComponentApiFn;
  onNativeEvent?: (event: Record<string, unknown>) => void;
};

export const EChartRender = memo(function EChartRender({
  option,
  maps,
  className,
  width,
  height,
  renderer = "canvas",
  registerComponentApi,
  onNativeEvent,
}: Props) {
  const chartRef = useRef<InstanceType<typeof ReactECharts> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { getThemeVar, root } = useTheme();

  // Register GeoJSON maps BEFORE the chart applies an option that references
  // them (a `map` series naming an unregistered map fails to render).
  // Change detection is per-name by value identity: XMLUI binding expressions
  // produce a fresh outer object every evaluation, but the inner GeoJSON refs
  // (e.g. a DataSource value) are stable until the data actually changes — so
  // this registers each map once, and again only when its GeoJSON is replaced
  // (the async-arrival case: undefined → loaded). registerMap parses the
  // GeoJSON, so avoiding per-render re-registration matters for large files.
  // mapsRevision feeds ReactECharts' key: echarts-for-react deep-equals the
  // option to decide whether to re-apply it, so a map registered AFTER first
  // mount would never take effect without forcing a remount.
  const registeredMaps = useRef<Record<string, unknown>>({});
  const mapsRevision = useRef(0);
  if (maps) {
    let changed = false;
    for (const [name, geojson] of Object.entries(maps)) {
      if (!name || !geojson) continue;
      if (registeredMaps.current[name] !== geojson) {
        echarts.registerMap(name, geojson as Parameters<typeof echarts.registerMap>[1]);
        registeredMaps.current[name] = geojson;
        changed = true;
      }
    }
    if (changed) mapsRevision.current++;
  }

  const onEvents = useMemo(() => {
    if (!onNativeEvent) return undefined;
    const map: Record<string, (event: unknown) => void> = {};
    for (const eventName of ECHARTS_EVENTS) {
      map[eventName] = (event: unknown) => {
        const e = event as Record<string, unknown>;
        const type = (e?.type as string) || eventName;
        onNativeEvent({
          ...e,
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
    const defaults: Record<string, unknown> = {
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

    const opt = option as Record<string, unknown>;
    const merged: Record<string, unknown> = { ...defaults, ...opt };
    if (opt.color) merged.color = opt.color;
    if (opt.textStyle) {
      merged.textStyle = { ...(defaults.textStyle as object), ...(opt.textStyle as object) };
    }
    if (opt.tooltip) {
      merged.tooltip = { ...(defaults.tooltip as object), ...(opt.tooltip as object) };
      if ((opt.tooltip as Record<string, unknown>).textStyle) {
        merged.tooltip = { ...merged.tooltip as object, textStyle: { ...((defaults.tooltip as Record<string, unknown>).textStyle as object), ...((opt.tooltip as Record<string, unknown>).textStyle as object) } };
      }
    }
    if (opt.legend) {
      merged.legend = { ...(defaults.legend as object), ...(opt.legend as object) };
      if ((opt.legend as Record<string, unknown>).textStyle) {
        merged.legend = { ...merged.legend as object, textStyle: { ...((defaults.legend as Record<string, unknown>).textStyle as object), ...((opt.legend as Record<string, unknown>).textStyle as object) } };
      }
    }
    if (opt.title) {
      merged.title = { ...(defaults.title as object), ...(opt.title as object) };
      if ((opt.title as Record<string, unknown>).textStyle) {
        merged.title = { ...merged.title as object, textStyle: { ...((defaults.title as Record<string, unknown>).textStyle as object), ...((opt.title as Record<string, unknown>).textStyle as object) } };
      }
    }

    const applyAxisDefaults = (axis: unknown) => {
      if (!axis) return axis;
      const axes = Array.isArray(axis) ? axis : [axis];
      return axes.map((a: unknown) => ({
        axisLine: { lineStyle: { color: borderColor } },
        axisTick: { lineStyle: { color: borderColor } },
        axisLabel: { color: textColor },
        splitLine: { lineStyle: { color: borderColor } },
        ...(a as object),
      }));
    };

    if (opt.xAxis) merged.xAxis = applyAxisDefaults(opt.xAxis);
    if (opt.yAxis) merged.yAxis = applyAxisDefaults(opt.yAxis);

    return merged;
  }, [option, palette, textColor, borderColor, tooltipBg, bgColor]);

  const getEchartsInstance = useCallback(() => chartRef.current?.getEchartsInstance(), []);

  useEffect(() => {
    registerComponentApi?.({
      getEchartsInstance,
    });
  }, [registerComponentApi, getEchartsInstance]);

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
        key={mapsRevision.current}
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
});
