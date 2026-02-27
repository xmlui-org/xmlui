import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ReactECharts from "echarts-for-react";
import * as echarts from "echarts";
import { useTheme } from "../../components-core/theming/ThemeContext";
import styles from "./EChart.module.scss";
import classnames from "classnames";

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
}: any) {
  const chartRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { getThemeVar, root } = useTheme();

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
      />
    </div>
  );
}
