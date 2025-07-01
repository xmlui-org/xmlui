import styles from "./LabelListNative.module.scss";
import { defaultProps, LabelList } from "./LabelListNative";
import { LabelPositionValues } from "../utils/abstractions";
import { parseScssVar } from "../../../components-core/theming/themeVars";
import { createComponentRenderer } from "../../../components-core/renderers";
import { createMetadata } from "../../metadata-helpers";

const COMP = "LabelList";

export const LabelListMd = createMetadata({
  description:
    "`LabelList` adds custom data labels to chart components when automatic " +
    "labeling isn't sufficient. It's a specialized component for advanced chart " +
    "customization scenarios where you need precise control over label positioning " +
    "and appearance.",
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
    "textColor-LabelList": "$textColor-primary",
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
