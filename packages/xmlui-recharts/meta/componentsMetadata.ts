import { AreaChartMd } from "../src/AreaChart/AreaChart";
import { BarChartMd } from "../src/BarChart/BarChart";
import { DonutChartMd } from "../src/DonutChart/DonutChart";
import { LabelListMd } from "../src/LabelList/LabelList";
import { LegendMd } from "../src/Legend/Legend";
import { LineChartMd } from "../src/LineChart/LineChart";
import { PieChartMd } from "../src/PieChart/PieChart";
import { RadarChartMd } from "../src/RadarChart/RadarChart";

export const componentMetadata = {
  name: "Recharts",
  state: "experimental",
  description: "This package provides Recharts-based chart components including area, bar, line, pie, donut, and radar charts with full XMLUI theming integration.",
  metadata: {
    AreaChart: AreaChartMd,
    BarChart: BarChartMd,
    DonutChart: DonutChartMd,
    LabelList: LabelListMd,
    Legend: LegendMd,
    LineChart: LineChartMd,
    PieChart: PieChartMd,
    RadarChart: RadarChartMd,
  },
};
