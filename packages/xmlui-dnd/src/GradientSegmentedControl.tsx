import { wrapComponent, createMetadata, d } from "xmlui";
import { GradientSegmentedControlNative, defaultProps } from "./GradientSegmentedControlNative";

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
        "Accepts any valid CSS color value.",
      undefined,
      "string",
      defaultProps.gradientFrom,
    ),
    gradientTo: d(
      "Ending color of the gradient applied to the active indicator. " +
        "Accepts any valid CSS color value.",
      undefined,
      "string",
      defaultProps.gradientTo,
    ),
    gradientDegree: d(
      "Rotation angle (in degrees) for the linear gradient.",
      undefined,
      "number",
      defaultProps.gradientDegree,
    ),
    color: d(
      "Mantine theme color for the active indicator. When set this takes precedence " +
        "over `gradientFrom`/`gradientTo`.",
      undefined,
      "string",
    ),
    size: d(
      "Size of the control. One of `xs`, `sm`, `md`, `lg`, `xl`.",
      undefined,
      "string",
      defaultProps.size,
    ),
    radius: d(
      "Border radius. One of `xs`, `sm`, `md`, `lg`, `xl` or a pixel number.",
      undefined,
      "string",
      String(defaultProps.radius),
    ),
    disabled: d(
      "When `true`, all options are non-interactive.",
      undefined,
      "boolean",
      false,
    ),
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
});

export const gradientSegmentedControlComponentRenderer = wrapComponent(
  COMP,
  GradientSegmentedControlNative,
  GradientSegmentedControlMd,
  {
    booleans: ["disabled", "fullWidth"],
    numbers: ["gradientDegree"],
    strings: ["gradientFrom", "gradientTo", "orientation", "size", "radius", "color"],
    events: { didChange: "onChange" },
  },
);
