import { createComponentRenderer, createMetadata, parseScssVar } from "xmlui";
import styles from "./LabelListNative.module.scss";
import { defaultProps, LabelList } from "./LabelListNative";
import { LabelPositionValues } from "../utils/abstractions";

const COMP = "LabelList";

export const LabelListMd = createMetadata({
  description: "Label list component for a chart component.",
  status: "experimental",
  props: {
    key: {
      description: "The key that needs to be matched to the data series.",
      valueType: "string",
    },
    position: {
      description: "The position of the label list",
      valueType: "string",
      availableValues: LabelPositionValues,
      defaultValue: defaultProps.position,
    },
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    "color-text-LabelList": "$color-text-primary",
  },
});

export const labelListComponentRenderer = createComponentRenderer(
  COMP,
  LabelListMd,
  ({ extractValue, node, layoutCss }: any) => {
    return (
      <LabelList
        key={extractValue(node.props?.dataKey)}
        position={extractValue.asOptionalString(node.props?.position)}
        style={layoutCss}
      />
    );
  },
);
