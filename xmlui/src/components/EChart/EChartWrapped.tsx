import { EChartRender } from "./EChartRender";
import { wrapComponent } from "../../components-core/wrapComponent";
import { createMetadata, d } from "../metadata-helpers";

const COMP = "EChart";

export const EChartMd = createMetadata({
  status: "experimental",
  description:
    "`EChart` wraps Apache ECharts via echarts-for-react, providing a " +
    "declarative charting component with full XMLUI theming integration. " +
    "It demonstrates option-level theming — injecting XMLUI design tokens " +
    "into the ECharts option object at runtime via `useTheme()`.",
  props: {
    option: {
      description:
        "The ECharts option object. Accepts any valid ECharts configuration. " +
        "XMLUI theme colors are automatically injected for palette, text, axes, " +
        "and tooltip unless explicitly overridden in the option.",
    },
    width: d("Width of the chart container.", undefined, "string", "100%"),
    height: d("Height of the chart container.", undefined, "string", "400px"),
    renderer: {
      description: "Rendering engine: 'canvas' or 'svg'.",
      valueType: "string",
      availableValues: ["canvas", "svg"],
      defaultValue: "canvas",
    },
  },
  apis: {
    getEchartsInstance: {
      description: "Returns the underlying ECharts instance for programmatic access.",
      signature: "getEchartsInstance(): ECharts",
    },
  },
});

export const echartComponentRenderer = wrapComponent(COMP, EChartRender, EChartMd, {
  strings: ["width", "height", "renderer"],
  captureNativeEvents: true,
});
