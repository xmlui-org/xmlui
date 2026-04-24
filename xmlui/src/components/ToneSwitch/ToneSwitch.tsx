import { wrapComponent } from "../../components-core/wrapComponent";
import { createMetadata } from "../metadata-helpers";
import { parseScssVar } from "../../components-core/theming/themeVars";
import styles from "./ToneSwitch.module.scss";
import { ToneSwitch } from "./ToneSwitchReact";

const COMP = "ToneSwitch";

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
      description: "Icon to display for light mode",
      defaultValue: defaultProps.iconLight,
    },
    iconDark: {
      valueType: "string",
      description: "Icon to display for dark mode",
      defaultValue: defaultProps.iconDark,
    },
  },
  events: {
    didChange: {
      description: "This event is fired when the user switches between light and dark modes.",
      signature: "didChange(tone: string): void",
      parameters: {
        tone: "The new tone value: \"light\" or \"dark\".",
      },
    },
  },
  themeVars: parseScssVar(styles.themeVars),
  limitThemeVarsToComponent: true,
  defaultThemeVars: {
    [`backgroundColor-${COMP}-light`]: "$color-surface-200",
    [`color-${COMP}-light`]: "$color-text-primary",
    [`backgroundColor-${COMP}-dark`]: "$color-primary-500",
    [`color-${COMP}-dark`]: "$color-surface-0",
    [`borderColor-${COMP}`]: "$color-surface-200",
    [`borderColor-${COMP}--hover`]: "$color-surface-300",
    [`backgroundColor-indicator-${COMP}`]: "white",
    [`boxShadow-indicator-${COMP}`]: "0 2px 4px rgba(0, 0, 0, 0.1)",

    dark: {
      [`backgroundColor-${COMP}-light`]: "$color-surface-700",
      [`color-${COMP}-light`]: "$color-text-primary",
      [`borderColor-${COMP}`]: "$color-surface-600",
      [`borderColor-${COMP}--hover`]: "$color-surface-500",
    },
  },
});

export const toneSwitchComponentRenderer = wrapComponent(COMP, ToneSwitch, ToneSwitchMd, {
  events: { didChange: "onDidChange" },
  stateful: false,
});
