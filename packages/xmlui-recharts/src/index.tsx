import { areaChartComponentRenderer } from "./AreaChart/AreaChart";
import { barChartComponentRenderer } from "./BarChart/BarChart";
import { donutChartComponentRenderer } from "./DonutChart/DonutChart";
import { labelListComponentRenderer } from "./LabelList/LabelList";
import { legendComponentRenderer } from "./Legend/Legend";
import { lineChartComponentRenderer } from "./LineChart/LineChart";
import { pieChartComponentRenderer } from "./PieChart/PieChart";
import { radarChartComponentRenderer } from "./RadarChart/RadarChart";

export default {
  namespace: "XMLUIExtensions",
  components: [
    areaChartComponentRenderer,
    barChartComponentRenderer,
    donutChartComponentRenderer,
    labelListComponentRenderer,
    legendComponentRenderer,
    lineChartComponentRenderer,
    pieChartComponentRenderer,
    radarChartComponentRenderer,
  ],
};
