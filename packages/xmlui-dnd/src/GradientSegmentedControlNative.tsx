import React, { useEffect } from "react";
import { MantineProvider, SegmentedControl } from "@mantine/core";

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
  /** Start color of the active-indicator gradient */
  gradientFrom?: string;
  /** End color of the active-indicator gradient */
  gradientTo?: string;
  /** Gradient direction in degrees */
  gradientDegree?: number;
  /** Mantine color key — overrides gradient when set */
  color?: string;
  /** Size: xs | sm | md | lg | xl */
  size?: string;
  /** Border radius: xs | sm | md | lg | xl or a number */
  radius?: string | number;
  disabled?: boolean;
  fullWidth?: boolean;
  orientation?: "horizontal" | "vertical";
  className?: string;
  registerComponentApi?: any;
};

export const defaultProps: Required<
  Pick<Props, "gradientFrom" | "gradientTo" | "gradientDegree" | "size" | "radius" | "orientation">
> = {
  gradientFrom: "#7c3aed",
  gradientTo: "#06b6d4",
  gradientDegree: 135,
  size: "sm",
  radius: "xl",
  orientation: "horizontal",
};

export const GradientSegmentedControlNative = ({
  data = [],
  value,
  initialValue,
  updateState,
  onChange,
  gradientFrom = defaultProps.gradientFrom,
  gradientTo = defaultProps.gradientTo,
  gradientDegree = defaultProps.gradientDegree,
  color,
  size = defaultProps.size,
  radius = defaultProps.radius,
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

  const indicatorStyle: React.CSSProperties = color
    ? {}
    : {
        backgroundImage: `linear-gradient(${gradientDegree}deg, ${gradientFrom}, ${gradientTo})`,
      };

  return (
    <MantineProvider>
      <SegmentedControl
        data={data}
        value={value ?? ""}
        onChange={handleChange}
        disabled={disabled}
        fullWidth={fullWidth}
        orientation={orientation as any}
        size={size as any}
        radius={radius as any}
        color={color}
        className={className}
        styles={{
          indicator: indicatorStyle,
        }}
      />
    </MantineProvider>
  );
};
