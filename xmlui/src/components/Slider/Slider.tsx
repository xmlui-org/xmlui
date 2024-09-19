import { createMetadata, d } from "@abstractions/ComponentDefs";

import styles from "./Slider.module.scss";

import { createComponentRenderer } from "@components-core/renderers";
import { parseScssVar } from "@components-core/theming/themeVars";
import { Slider } from "./SliderNative";
import { dDidChange, dFocus, dGotFocus, dLostFocus, dSetValueApi, dValue } from "@components/metadata-helpers";

const COMP = "Slider";

// This component must be focusable and keyboard accessible.
// Add this component to the form infrastructure.

export const SliderMd = createMetadata({
  status: "in review",
  description:
    `(**NOT IMPLEMENTED YET**) The \`${COMP}\` component allows you to select a numeric value ` +
    `between a range specified by minimum and maximum values.`,
  props: {
    minValue: d(
      `This property specifies the minimum value of the allowed input range.`,
      null,
      "number",
      0,
    ),
    maxValue: d(
      `This property specifies the maximum value of the allowed input range.`,
      null,
      "number",
      10,
    ),
    rangeHighlight: d(
      `This booleaThis property indicates if you want to highlight a specific part of the input range.`,
      [
        { value: "none", description: "No highlight (default)" },
        {
          value: "lower",
          description:
            "Highlight the lower part of the range (from the minimum to the current slider value)",
        },
        {
          value: "upper",
          description:
            "Highlight the upper part of the range (from the current slider value to the maximum)",
        },
      ],
      "string",
      "none",
    ),
  },
  events: {
    didChange: dDidChange(COMP),
    getFocus: dGotFocus(COMP),
    dostFocus: dLostFocus(COMP),
  },
  apis: {
    focus: dFocus(COMP),
    value: dValue(),
    setValue: dSetValueApi(),
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    light: {},
    dark: {},
  },
});

export const sliderComponentRenderer = createComponentRenderer(
  COMP,
  SliderMd,
  ({ node, extractValue, lookupEventHandler, layoutCss }) => {
    return <Slider />;
  },
);
