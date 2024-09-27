import { createMetadata, d } from "@abstractions/ComponentDefs";

import styles from "./Range.module.scss";

import { createComponentRenderer } from "@components-core/renderers";
import { parseScssVar } from "@components-core/theming/themeVars";
import { Range } from "./RangeNative";
import { dFocus, dGotFocus, dLostFocus } from "@components/metadata-helpers";

const COMP = "Range";

// See "Range input" here: https://tabler.io/admin-template/preview
// This component must be focusable and keyboard accessible.
// Add this component to the form infrastructure.

export const RangeMd = createMetadata({
  status: "in progress",
  description:
    `(**NOT IMPLEMENTED YET**) The \`${COMP}\` component allows you to select a numeric range (lower ` +
    `and upper boundary values) between the complete range specified by minimum and maximum values.`,
  props: {
    minValue: d(
      `This property specifies the minimum value of the entire value domain to select the lower ` +
        `and upper boundary range values.`,
      null,
      "number",
      0,
    ),
    maxValue: d(
      `This property specifies the maximum value of the entire value domain to select the lower ` +
        `and upper boundary range values.`,
      null,
      "number",
      10,
    ),
    lowerInclusive: d(
      `This boolean property specifies whether the lower boundary value is inclusive (\`true\`) ` +
        `or exclusive (\`false\`).`,
      null,
      "boolean",
      true,
    ),
    upperInclusive: d(
      `This boolean property specifies whether the upper boundary value is inclusive (\`true\`) ` +
        `or exclusive (\`false\`).`,
      null,
      "boolean",
      true,
    ),
    complementary: d(
      `This boolean property specifies whether the range is complementary to the selected ` +
        `boundaries (\`true\`) or not (\`false\`). The value of this property is indicated visually.`,
      null,
      "boolean",
      false,
    ),
  },
  events: {
    didChange: d(
      `This event is fired when a range boundary has been changed. The event parameters are ` +
        `the new lower and upper boundary values (in this order).`,
    ),
    getFocus: dGotFocus(COMP),
    dostFocus: dLostFocus(COMP),
  },
  apis: {
    focus: dFocus(COMP),
    value: d(`You can query the component's value. The value is a two-item array with the ` + 
      `lower (first) and upper (second) boundary values.`),
    setValue: d(
      `This method sets the component's lower and upper range values. The value must be a ` + 
      `two-item array with the lower (first) and upper (second) boundary values.`,
    ),
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    light: {},
    dark: {},
  },
});

export const rangeComponentRenderer = createComponentRenderer(
  COMP,
  RangeMd,
  ({ node, extractValue, lookupEventHandler, layoutCss }) => {
    return <Range />;
  },
);
