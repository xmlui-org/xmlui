import { GaugeRender } from "./GaugeRender";
import styles from "./Gauge.module.scss";
import {
  wrapCompound,
  createMetadata,
  type ComponentMetadata,
  d,
  dDidChange,
  dEnabled,
  dInitialValue,
  parseScssVar,
} from "xmlui";

const COMP = "Gauge";

export const GaugeMd: ComponentMetadata = createMetadata({
  status: "experimental",
  description:
    "`Gauge` wraps the Smart UI Gauge web component, providing a circular " +
    "dial display for numeric values with full XMLUI theming integration.",
  props: {
    initialValue: dInitialValue(),
    minValue: {
      description: "Minimum value of the allowed range.",
      valueType: "number",
      defaultValue: 0,
    },
    maxValue: {
      description: "Maximum value of the allowed range.",
      valueType: "number",
      defaultValue: 100,
    },
    analogDisplayType: d(
      "Display type: 'needle', 'fill', or 'line'.",
      undefined, "string", "needle",
    ),
    digitalDisplay: d("Show digital value display.", undefined, "boolean", false),
    startAngle: d("Start angle in degrees.", undefined, "number", -30),
    endAngle: d("End angle in degrees.", undefined, "number", 210),
    scalePosition: d(
      "Scale position: 'inside', 'outside', or 'none'.",
      undefined, "string", "inside",
    ),
    animation: d("Animation type: 'none' or 'advanced'.", undefined, "string", "none"),
    unit: d("Unit text appended to values.", undefined, "string", ""),
    showUnit: d("Whether to show the unit.", undefined, "boolean", false),
    enabled: dEnabled(),
  },
  events: {
    didChange: dDidChange(COMP),
  },
  apis: {
    value: {
      description: "Gets the current gauge value.",
      signature: "get value(): number | undefined",
    },
    setValue: {
      description: "Sets the gauge value programmatically.",
      signature: "setValue(value: number): void",
      parameters: {
        value: "The new numeric value.",
      },
    },
    focus: {
      description: "Sets focus on the gauge.",
      signature: "focus(): void",
    },
  },
  defaultAriaLabel: "Gauge",
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    [`backgroundColor-${COMP}`]: "$color-surface-50",
    [`textColor-${COMP}`]: "$textColor-primary",
    [`primaryColor-${COMP}`]: "$color-primary",
  },
});

export const gaugeComponentRenderer = wrapCompound(COMP, GaugeRender, GaugeMd, {
  rename: {
    minValue: "min",
    maxValue: "max",
  },
  parseInitialValue: (raw: any, props: Record<string, any>) => {
    const min = Number(props.min) || 0;
    const max = Number(props.max) || 100;
    let val = typeof raw === "string" ? parseFloat(raw) : raw;
    if (val == null || isNaN(val)) val = min;
    return Math.min(max, Math.max(min, Number(val)));
  },
  formatExternalValue: (value: any, props: Record<string, any>) => {
    const min = Number(props.min) || 0;
    const max = Number(props.max) || 100;
    const val = Number(value);
    if (isNaN(val)) return min;
    return Math.min(max, Math.max(min, val));
  },
});
