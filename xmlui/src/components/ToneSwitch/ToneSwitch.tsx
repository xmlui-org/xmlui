import { wrapComponent } from "../../components-core/wrapComponent";
import { createMetadata } from "../metadata-helpers";
import { parseScssVar } from "../../components-core/theming/themeVars";
import styles from "./ToneSwitch.module.scss";
import { ToneSwitch, type ToneSwitchProps } from "./ToneSwitchNative";

const COMP = "ToneSwitch";

export const ToneSwitchMd = createMetadata({
  status: "stable",
  description:
    "`ToneSwitch` enables the user to switch between light and dark modes using a switch control.",
  props: {
    iconLight: {
      type: "string",
      description: "Icon to display for light mode",
      defaultValue: "sun",
    },
    iconDark: {
      type: "string",
      description: "Icon to display for dark mode",
      defaultValue: "moon",
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

    dark: {
      [`backgroundColor-${COMP}-light`]: "$color-surface-700",
      [`color-${COMP}-light`]: "$color-text-primary",
      [`borderColor-${COMP}`]: "$color-surface-600",
      [`borderColor-${COMP}--hover`]: "$color-surface-500",
    },
  },
});

export const toneSwitchComponentRenderer = wrapComponent(COMP, ToneSwitch, ToneSwitchMd, {});
