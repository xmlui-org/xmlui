import { wrapComponent, createMetadata, d, parseScssVar } from "xmlui";
import { GradientSegmentedControlNative, defaultProps } from "./GradientSegmentedControlNative";
import styles from "./GradientSegmentedControl.module.scss";

const COMP = "GradientSegmentedControl";

export const GradientSegmentedControlMd = createMetadata({
  status: "experimental",
  description:
    "`GradientSegmentedControl` is a segmented picker with a gradient-filled active indicator, " +
    "powered by Mantine's `SegmentedControl`. The user selects one value from a predefined set " +
    "of options and the selection is automatically tracked in XMLUI state via `initialValue` / " +
    "`didChange`.",
  props: {
    data: d(
      "Array of options displayed in the control. Each item can be a plain string " +
        "or an object with `label`, `value`, and optional `disabled` fields.",
    ),
    initialValue: d("The initially selected option value.", undefined, "string"),
    gradientFrom: d(
      "Starting color of the gradient applied to the active indicator. " +
        "Overrides `gradientFrom-GradientSegmentedControl` theme variable.",
      undefined,
      "string",
    ),
    gradientTo: d(
      "Ending color of the gradient applied to the active indicator. " +
        "Overrides `gradientTo-GradientSegmentedControl` theme variable.",
      undefined,
      "string",
    ),
    gradientDegree: d(
      "Rotation angle in degrees for the linear gradient. " +
        "Overrides `gradientDegree-GradientSegmentedControl` theme variable.",
      undefined,
      "number",
    ),
    backgroundColor: d(
      "Background color of the track (the container behind all options). " +
        "Overrides `backgroundColor-GradientSegmentedControl` theme variable.",
      undefined,
      "string",
    ),
    textColor: d(
      "Text color for inactive option labels. " +
        "Overrides `textColor-GradientSegmentedControl` theme variable.",
      undefined,
      "string",
    ),
    activeTextColor: d(
      "Text color shown on the active indicator (on top of the gradient). " +
        "Overrides `activeTextColor-GradientSegmentedControl` theme variable.",
      undefined,
      "string",
    ),
    borderRadius: d(
      "Border radius of the control (any CSS length, e.g. `8px`, `1rem`). " +
        "Overrides `borderRadius-GradientSegmentedControl` theme variable.",
      undefined,
      "string",
    ),
    size: d(
      "Size of the control. One of `xs`, `sm`, `md`, `lg`, `xl`.",
      undefined,
      "string",
      defaultProps.size,
    ),
    disabled: d("When `true`, all options are non-interactive.", undefined, "boolean", false),
    fullWidth: d(
      "When `true`, the control stretches to fill the width of its container.",
      undefined,
      "boolean",
      false,
    ),
    orientation: d(
      "Layout orientation of the options. One of `horizontal` or `vertical`.",
      undefined,
      "string",
      defaultProps.orientation,
    ),
  },
  events: {
    didChange: {
      description:
        "Fires when the user selects a new option. The newly selected value string is " +
        "passed as the first argument.",
    },
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    [`gradientFrom-${COMP}`]: "red",
    [`gradientTo-${COMP}`]: "lightcoral",
    [`gradientDegree-${COMP}`]: "135deg",
    [`activeTextColor-${COMP}`]: "$color-surface-50",
    [`borderRadius-${COMP}`]: "9999px",
    [`backgroundColor-${COMP}`]: "$color-surface-200",
    [`textColor-${COMP}`]: "$textColor-secondary",
  },
});

export const gradientSegmentedControlComponentRenderer = wrapComponent(
  COMP,
  GradientSegmentedControlNative,
  GradientSegmentedControlMd,
  {
    booleans: ["disabled", "fullWidth"],
    numbers: ["gradientDegree"],
    strings: [
      "gradientFrom",
      "gradientTo",
      "backgroundColor",
      "textColor",
      "activeTextColor",
      "borderRadius",
      "orientation",
      "size",
    ],
    events: { didChange: "onChange" },
  },
);
