import barChartComponentRenderer from "./BarChart";
import pieChartComponentRenderer from "./PieChart";
import lineChartComponentRenderer from "./LineChart";

export default {
  namespace: "XMLUIExtensions",
  components: [barChartComponentRenderer, pieChartComponentRenderer, lineChartComponentRenderer],
};
