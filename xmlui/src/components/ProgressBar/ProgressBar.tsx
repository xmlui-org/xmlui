import { createMetadata } from "../../component-core/metadata/helpers";
import { extractScssThemeVars } from "../../styling/theme";
import { defaultProps } from "./ProgressBar.defaults";

const COMP = "ProgressBar";

const progressBarStylesSource = `
$backgroundColor-ProgressBar: createThemeVar("backgroundColor-ProgressBar");
$color-indicator-ProgressBar: createThemeVar("color-indicator-ProgressBar");
$color-indicator-ProgressBar--complete: createThemeVar("color-indicator-ProgressBar--complete");
$borderRadius-ProgressBar: createThemeVar("borderRadius-ProgressBar");
$borderRadius-indicator-ProgressBar: createThemeVar("borderRadius-indicator-ProgressBar");
$thickness-ProgressBar: createThemeVar("thickness-ProgressBar");
`;

export const ProgressBarMd = createMetadata({
  status: "stable",
  description:
    "`ProgressBar` provides a visual indicator showing the completion percentage " +
    "of tasks, processes, or any measurable progress.",
  props: {
    value: {
      description: "Defines the progress value with a number between 0 and 1.",
      valueType: "number",
      defaultValue: defaultProps.value,
    },
    testId: {
      description: "Adds a test identifier to the component root.",
      valueType: "string",
    },
  },
  themeVars: extractScssThemeVars(progressBarStylesSource),
  defaultThemeVars: {
    [`borderRadius-${COMP}`]: "999em",
    [`borderRadius-indicator-${COMP}`]: "999em",
    [`thickness-${COMP}`]: "0.5em",
    [`backgroundColor-${COMP}`]: "$color-surface-200",
    [`color-indicator-${COMP}`]: "$color-primary-500",
    [`color-indicator-${COMP}--complete`]: "$color-success-500",
  },
});
