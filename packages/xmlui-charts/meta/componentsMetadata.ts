import { BarChartMd } from "../src/BarChart/BarChart";
import { PieChartMd } from "../src/PieChart/PieChart";
import { LineChartMd } from "../src/LineChart/LineChart";
import { DonutChartMd } from "../src/DonutChart/DonutChart";
import { LabelListMd } from "../src/LabelList/LabelList";
import { LegendMd } from "../src/Legend/Legend";

export const componentMetadata = {
  name: "Charts",
  description:
    `The \`Charts\` package contains components that display data in a graphical way.` +
    `All chart components use the same set of properties to receive data.` +
    `All chart components accept a \`LabelLst\` component as a child to parametrize display labels.` +
    `All chart components also accept a \`Legend\` component as a child to display the legend.`,
  metadata: {
    BarChart: BarChartMd,
    PieChart: PieChartMd,
    LineChart: LineChartMd,
    DonutChart: DonutChartMd,
    LabelList: LabelListMd,
    Legend: LegendMd
  },
};
