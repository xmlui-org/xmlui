import { barChartComponentRenderer } from "./BarChart/BarChart";
import { pieChartComponentRenderer } from "./PieChart/PieChart";
import { lineChartComponentRenderer } from "./LineChart/LineChart";
import { donutChartComponentRenderer } from "./DonutChart/DonutChart";
import { labelListComponentRenderer } from "./LabelList/LabelList";
import { legendComponentRenderer } from "./Legend/Legend";

export default {
  namespace: "XMLUIExtensions",
  components: [
    barChartComponentRenderer,
    pieChartComponentRenderer,
    lineChartComponentRenderer,
    donutChartComponentRenderer,
    labelListComponentRenderer,
    legendComponentRenderer
  ],
};
