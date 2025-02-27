import { createComponentRenderer, createMetadata, d, parseScssVar } from "xmlui";
import styles from "../PieChart/PieChartNative.module.scss";
import { LabelList } from "./LabelListNative";

const COMP = "LabelList";

export const LabelListMd = createMetadata({
  description: "A label list component",
  props: {
    key: d("The key to use for the data"),
    position: d("The position of the label list"),
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    "color-text-labelList-PieChart": "$color-text-primary",
  },
});

export const labelListComponentRenderer = createComponentRenderer(
  COMP,
  LabelListMd,
  ({ extractValue, node }: any) => {
    return (
      <LabelList
        key={extractValue(node.props?.dataKey)}
        position={extractValue.asOptionalString(node.props?.position)}
      />
    );
  },
);
