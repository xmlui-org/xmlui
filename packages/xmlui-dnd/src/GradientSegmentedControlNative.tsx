import React, { useEffect } from "react";
import { MantineProvider, SegmentedControl } from "@mantine/core";
import styles from "./GradientSegmentedControl.module.scss";

export type SegmentedControlItem = {
  label: string;
  value: string;
  disabled?: boolean;
};

type Props = {
  data?: (string | SegmentedControlItem)[];
  /** Current value from XMLUI state */
  value?: string;
  /** Initial value — used to seed XMLUI state on mount */
  initialValue?: string;
  /** XMLUI state updater */
  updateState?: (updater: Record<string, any>) => void;
  /** XMLUI didChange event handler (provided by wrapComponent) */
  onChange?: (value: string) => void;
  /** Start color of the active-indicator gradient (overrides theme var) */
  gradientFrom?: string;
  /** End color of the active-indicator gradient (overrides theme var) */
  gradientTo?: string;
  /** Gradient direction in degrees (overrides theme var) */
  gradientDegree?: number;
  /** Track background color (overrides theme var) */
  backgroundColor?: string;
  /** Inactive label text color (overrides theme var) */
  textColor?: string;
  /** Active label text color on top of the gradient (overrides theme var) */
  activeTextColor?: string;
  /** Border radius value with CSS unit, e.g. "8px" or "xl" (overrides theme var) */
  borderRadius?: string;
  /** Size: xs | sm | md | lg | xl */
  size?: string;
  disabled?: boolean;
  fullWidth?: boolean;
  orientation?: "horizontal" | "vertical";
  className?: string;
  registerComponentApi?: any;
};

export const defaultProps: Required<Pick<Props, "size" | "orientation">> = {
  size: "sm",
  orientation: "horizontal",
};

export const GradientSegmentedControlNative = ({
  data = [],
  value,
  initialValue,
  updateState,
  onChange,
  gradientFrom,
  gradientTo,
  gradientDegree,
  backgroundColor,
  textColor,
  activeTextColor,
  borderRadius,
  size = defaultProps.size,
  disabled,
  fullWidth,
  orientation = defaultProps.orientation,
  className,
  registerComponentApi,
}: Props) => {
  // Seed XMLUI state from initialValue on mount
  useEffect(() => {
    if (value === undefined && initialValue !== undefined) {
      updateState?.({ value: initialValue });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (newValue: string) => {
    updateState?.({ value: newValue });
    onChange?.(newValue);
  };

  // Per-instance prop overrides: set CSS custom properties on the wrapper div so they
  // take precedence over the XMLUI theme vars that the SCSS establishes as defaults.
  const wrapperVars: React.CSSProperties = {
    ...(gradientFrom !== undefined && { "--gsc-from": gradientFrom } as any),
    ...(gradientTo !== undefined && { "--gsc-to": gradientTo } as any),
    ...(gradientDegree !== undefined && { "--gsc-degree": `${gradientDegree}deg` } as any),
    ...(backgroundColor !== undefined && { "--gsc-bg": backgroundColor } as any),
    ...(textColor !== undefined && { "--gsc-text": textColor } as any),
    ...(activeTextColor !== undefined && { "--gsc-active-text": activeTextColor } as any),
    ...(borderRadius !== undefined && { "--gsc-radius": borderRadius } as any),
  };

  return (
    <MantineProvider>
      <div className={`${styles.wrapper}${className ? ` ${className}` : ""}`} style={wrapperVars}>
        <SegmentedControl
          data={data}
          value={value ?? ""}
          onChange={handleChange}
          disabled={disabled}
          fullWidth={fullWidth}
          orientation={orientation as any}
          size={size as any}
          classNames={{
            root: styles.root,
            indicator: styles.indicator,
            label: styles.label,
          }}
        />
      </div>
    </MantineProvider>
  );
};
