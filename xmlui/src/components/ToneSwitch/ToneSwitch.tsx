import { createMetadata } from "../../component-core/metadata/helpers";

export const defaultProps = {
  iconLight: "sun",
  iconDark: "moon",
};

export const ToneSwitchMd = createMetadata({
  status: "stable",
  description:
    "`ToneSwitch` enables the user to switch between light and dark modes using a switch control.",
  props: {
    iconLight: {
      valueType: "string",
      description: "Icon to display for light mode.",
      defaultValue: defaultProps.iconLight,
    },
    iconDark: {
      valueType: "string",
      description: "Icon to display for dark mode.",
      defaultValue: defaultProps.iconDark,
    },
    testId: {
      description: "Adds a test identifier to the tone switch.",
      valueType: "string",
    },
  },
  events: {
    didChange: {
      description: "Fires when the user switches between light and dark modes.",
      signature: "didChange(tone: string): void",
    },
  },
});
