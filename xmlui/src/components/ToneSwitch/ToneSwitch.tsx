import { useThemes } from "../../components-core/theming/ThemeContext";
import { createComponentRenderer } from "../../components-core/renderers";
import { Toggle } from "../Toggle/Toggle";
import { Icon } from "../Icon/IconNative";
import { createMetadata } from "../metadata-helpers";
import { parseScssVar } from "../../components-core/theming/themeVars";
import styles from "./ToneSwitch.module.scss";
import classnames from "classnames";

const COMP = "ToneSwitch";
const LIGHT_ICON = "sun";
const DARK_ICON = "moon";

export const ToneSwitchMd = createMetadata({
  status: "stable",
  description: "`ToneSwitch` enables the user to switch between light and dark modes using a switch control.",
  props: {
    // No props exposed in documentation
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
    }
  },
});

export function ToneSwitch() {
  const { activeThemeTone, setActiveThemeTone } = useThemes();
  //console.log('ToneSwitch render - activeThemeTone:', activeThemeTone); // Debug log

  const handleChange = (isDark: boolean) => {
    console.log('ToneSwitch handleChange called with:', isDark); // Debug log
    setActiveThemeTone(isDark ? "dark" : "light");
  };

  return (
    <div style={{ width: 'fit-content', display: 'inline-block' }} className="toneSwitchContainer">
      <Toggle
        value={activeThemeTone === "dark"}
        onDidChange={handleChange}
        variant="switch"
        style={{ width: 'fit-content' }}
        inputRenderer={(contextVars) => {
          //console.log('ToneSwitch contextVars:', contextVars); // Debug log
          return (
            <div
              className={classnames(styles.iconSwitch, {
                [styles.light]: !contextVars.$checked,
                [styles.dark]: contextVars.$checked
              })}
            >
              <div className={styles.iconThumb}>
                {!contextVars.$checked ? (
                  <Icon
                    name={LIGHT_ICON}
                    fallback="sun"
                    className={styles.icon}
                  />
                ) : (
                  <Icon
                    name={DARK_ICON}
                    fallback="moon"
                    className={styles.icon}
                  />
                )}
              </div>
            </div>
          );
        }}
      />
    </div>
  );
}

/**
 * Define the renderer for the ToneSwitch component
 */
export const toneSwitchComponentRenderer = createComponentRenderer(
  COMP,
  ToneSwitchMd,
  ({ node, extractValue }) => {
    return (
      <ToneSwitch />
    );
  },
);
