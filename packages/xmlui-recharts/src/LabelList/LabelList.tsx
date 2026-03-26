import styles from "./LabelList.module.scss";
import { defaultProps, LabelList } from "./LabelListNative";
import { LabelPositionValues } from "../utils/abstractions";
import { parseScssVar, wrapComponent, createMetadata, type ComponentMetadata } from "xmlui";

const COMP = "LabelList";

export const LabelListMd: ComponentMetadata = createMetadata({
  status: "experimental",
  description:
    "`LabelList` adds custom data labels to chart components when automatic " +
    "labeling isn't sufficient. It's a specialized component for advanced chart " +
    "customization scenarios where you need precise control over label positioning " +
    "and appearance.",
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

export const labelListComponentRenderer = wrapComponent(COMP, LabelList, LabelListMd, {
  rename: { key: "nameKey" },
});
