import { createMetadata } from "../../component-core/metadata/helpers";

export const defaultProps = {
  lightToDarkIcon: "lightToDark:ToneChangerButton",
  darkToLightIcon: "darkToLight:ToneChangerButton",
};

export const ToneChangerButtonMd = createMetadata({
  status: "stable",
  deprecationMessage:
    "The `ToneChangerButton` component is deprecated and will be removed in a future release. Please use the `ToneSwitch` component instead.",
  description: "`ToneChangerButton` enables the user to switch between light and dark modes.",
  props: {
    lightToDarkIcon: {
      description: "The icon displayed when the theme is in light mode and will switch to dark.",
      valueType: "string",
      defaultValue: defaultProps.lightToDarkIcon,
    },
    darkToLightIcon: {
      description: "The icon displayed when the theme is in dark mode and will switch to light.",
      valueType: "string",
      defaultValue: defaultProps.darkToLightIcon,
    },
    testId: {
      description: "Adds a test identifier to the button.",
      valueType: "string",
    },
  },
  events: {
    click: {
      description: "Fires after the tone changes.",
      signature: "click(tone: string): void",
    },
  },
  defaultAriaLabel: "Toggle color mode",
});
