import styles from "./ProgressBar.module.scss";

import { wrapComponent } from "../../components-core/wrapComponent";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { ProgressBar, defaultProps } from "./ProgressBarNative";
import { createMetadata } from "../metadata-helpers";

const COMP = "ProgressBar";

export const ProgressBarMd = createMetadata({
  status: "stable",
  description:
    "`ProgressBar` provides a visual indicator showing the completion percentage " +
    "of tasks, processes, or any measurable progress. It displays as a horizontal " +
    "bar that fills from left to right based on the provided value between 0 " +
    "(empty) and 1 (complete).",
  props: {
    value: {
      description: `This property defines the progress value with a number between 0 and 1.`,
      valueType: "number",
      defaultValue: defaultProps.value,
    },
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    [`borderRadius-${COMP}`]: "999em",
    [`borderRadius-indicator-${COMP}`]: "999em",
    [`thickness-${COMP}`]: "0.5em",
    [`backgroundColor-${COMP}`]: "$color-surface-200",
    [`color-indicator-${COMP}`]: "$color-primary-500",
  },
});

export const progressBarComponentRenderer = wrapComponent(COMP, ProgressBar, ProgressBarMd, {
  // Exclude "value" from the auto-processing loop: asOptionalNumber throws for
  // non-numeric inputs (strings like "invalid", booleans). customRender handles
  // the extraction and clamping directly.
  exclude: ["value"],
  customRender: (_props, { node, extractValue, classes }) => (
    <ProgressBar
      value={Math.max(0, Math.min(1, extractValue(node.props.value)))}
      classes={classes}
    />
  ),
});
