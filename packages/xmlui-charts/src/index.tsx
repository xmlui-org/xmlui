import { barChartComponentRenderer } from "./BarChart/BarChart";
import { pieChartComponentRenderer } from "./PieChart/PieChart";
import { lineChartComponentRenderer } from "./LineChart/LineChart";

export default {
  namespace: "XMLUIExtensions",
  components: [barChartComponentRenderer, pieChartComponentRenderer, lineChartComponentRenderer],
};
