import styles from "./ProgressBar.module.scss";

import { createMetadata, d } from "../../abstractions/ComponentDefs";
import { createComponentRenderer } from "../../components-core/renderers";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { ProgressBar } from "./ProgressBarNative";

const COMP = "ProgressBar";

export const ProgressBarMd = createMetadata({
  description: `A \`${COMP}\` component visually represents the progress of a task or process.`,
  props: {
    value: {
      description: `This property defines the progress value with a number between 0 and 1.`,
      valueType: "number",
      defaultValue: 0,
    },
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    [`borderRadius-${COMP}`]: "$borderRadius",
    [`borderRadius-indicator-${COMP}`]: "0px",
    [`thickness-${COMP}`]: "$space-2",
    [`backgroundColor-${COMP}`]: "$color-surface-200",
    [`color-indicator-${COMP}`]: "$color-primary-500",
  },
});

export const progressBarComponentRenderer = createComponentRenderer(
  COMP,
  ProgressBarMd,
  ({ node, extractValue, layoutCss }) => {
    return (
      <ProgressBar
        value={Math.max(0, Math.min(1, extractValue(node.props.value)))}
        style={layoutCss}
      />
    );
  },
);
