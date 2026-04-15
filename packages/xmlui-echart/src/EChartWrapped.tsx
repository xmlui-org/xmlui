import { EChartRender } from "./EChartRender";
import {
  wrapComponent,
  createMetadata,
  type ComponentMetadata,
  d,
} from "xmlui";

const COMP = "EChart";

export const EChartMd: ComponentMetadata = createMetadata({
  status: "experimental",
  description:
    "`EChart` wraps Apache ECharts via echarts-for-react, providing a " +
    "declarative charting component with full XMLUI theming integration.",
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
  exposeRegisterApi: true,
  strings: ["width", "height", "renderer"],
  captureNativeEvents: true,
  deriveAriaLabel: (props) => {
    const option = props.option;
    if (!option?.series) return "Chart";
    const types = [
      ...new Set(
        (Array.isArray(option.series) ? option.series : [option.series]).map(
          (s: any) => s.type,
        ),
      ),
    ];
    const title = option.title?.text;
    const chartType = types.join("/") + " chart";
    return title ? `${title} — ${chartType}` : chartType;
  },
});
