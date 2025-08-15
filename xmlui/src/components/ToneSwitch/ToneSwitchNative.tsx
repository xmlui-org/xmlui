import { useThemes } from "../../components-core/theming/ThemeContext";
import Icon from "../Icon/IconNative";
import { Toggle } from "../Toggle/Toggle";
import styles from "./ToneSwitch.module.scss";
import classnames from "classnames";

// Default icons for light and dark modes
const DEFAULT_LIGHT_ICON = "sun";
const DEFAULT_DARK_ICON = "moon";

export type ToneSwitchProps = {
  /**
   * Icon to display for light mode
   * @default "sun"
   */
  iconLight?: string;
  
  /**
   * Icon to display for dark mode
   * @default "moon"
   */
  iconDark?: string;
  className?: string;
};

export function ToneSwitch({
  iconLight = DEFAULT_LIGHT_ICON,
  iconDark = DEFAULT_DARK_ICON,
  className
}: ToneSwitchProps) {
  const { activeThemeTone, setActiveThemeTone } = useThemes();
  //console.log('ToneSwitch render - activeThemeTone:', activeThemeTone); // Debug log

  const handleChange = (isDark: boolean) => {
    setActiveThemeTone(isDark ? "dark" : "light");
  };

  return (
    <div style={{ width: 'fit-content', display: 'inline-block' }} className={className}>
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
                    name={iconLight}
                    fallback="sun"
                    className={styles.icon}
                  />
                ) : (
                  <Icon
                    name={iconDark}
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

