import type React from "react";
import { forwardRef } from "react";
import styles from "./TooltipContent.module.scss";
import classnames from "classnames";
import type { Tooltip as RTooltip } from "recharts";

export const TooltipContent = forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof RTooltip> &
    React.ComponentProps<"div"> & {
      hideLabel?: boolean;
      hideIndicator?: boolean;
      indicator?: "line" | "dot" | "dashed";
      nameKey?: string;
      labelKey?: string;
    }
>(function ({ active, payload, indicator = "dot", hideLabel = false, label, color }, ref) {
  if (active && payload && payload.length) {
    const nestLabel = payload.length === 1 && indicator !== "dot";
    return (
      <div className={styles.tooltipContainer} ref={ref}>
        {!hideLabel && <p className="label">{label}</p>}

        <div className={styles.gridGap}>
          {payload?.map((item: any, index: any) => {
            const indicatorColor = color || item.payload?.fill || item.color;
            return (
              <div key={index} className={styles.itemContainer}>
                <div
                  className={classnames(styles.indicator, {
                    [styles.dot]: indicator === "dot",
                    [styles.line]: indicator === "line",
                    [styles.dashed]: indicator === "dashed",
                    [styles.nestDashed]: nestLabel && indicator === "dashed",
                  })}
                  style={{ backgroundColor: indicatorColor, borderColor: indicatorColor }}
                />
                <div className={styles.valueContainer}>
                  <div className={styles.labelGrid}>
                    <span className={styles.mutedText}>{item.name}</span>
                  </div>
                  {item.value && (
                    <span className={styles.valueText}>{item.value.toLocaleString()}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return null;
});

TooltipContent.displayName = "TooltipContent";
