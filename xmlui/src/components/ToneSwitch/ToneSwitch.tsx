import { createComponentRenderer } from "../../components-core/renderers";
import { createMetadata, dClick, dDidChange } from "../metadata-helpers";
import { parseScssVar } from "../../components-core/theming/themeVars";
import styles from "./ToneSwitch.module.scss";
import { ToneSwitch } from "./ToneSwitchNative";

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
  events: {
    didChange: dDidChange(COMP),
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

/**
 * Define the renderer for the ToneSwitch component
 */
export const toneSwitchComponentRenderer = createComponentRenderer(
  COMP,
  ToneSwitchMd,
  ({ node, extractValue, className, lookupEventHandler }) => {
    return (
      <ToneSwitch
        onDidChange={lookupEventHandler("didChange")}
        className={className}
        iconLight={extractValue(node.props.iconLight)}
        iconDark={extractValue(node.props.iconDark)}
      />
    );
  },
);
