import { EChartRender } from "./EChartRender";
import { wrapComponent, createMetadata, type ComponentMetadata } from "xmlui";

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
    maps: {
      description:
        "An object of `name → GeoJSON` map definitions. Each entry is passed to " +
        "`echarts.registerMap(name, geojson)` before the option is applied, so a " +
        "`map`-type series can reference the name (e.g. " +
        "`series: [{ type: 'map', map: 'my-region', ... }]`). Entries whose value " +
        "is empty are skipped, so binding a not-yet-loaded DataSource value is safe: " +
        "the map registers (and the chart re-renders) when the data arrives. " +
        "Omitting the property leaves current behavior unchanged.",
    },
    width: {
      description: "Width of the chart container.",
      valueType: "string",
      defaultValue: "100%",
    },
    height: {
      description: "Height of the chart container.",
      valueType: "string",
      defaultValue: "400px",
    },
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
  // Function-valued option members (tooltip.formatter, label.formatter, ...)
  // arrive from the engine as arrow-expression marker objects; deep-convert
  // them to callables so ECharts receives real functions (judell/bram#226).
  deepSyncCallbacks: ["option"],
  captureNativeEvents: true,
  deriveAriaLabel: (props) => {
    const option = props.option;
    if (!option?.series) return "Chart";
    const types = [
      ...new Set(
        (Array.isArray(option.series) ? option.series : [option.series]).map((s: any) => s.type),
      ),
    ];
    const title = option.title?.text;
    const chartType = types.join("/") + " chart";
    return title ? `${title} — ${chartType}` : chartType;
  },
});
