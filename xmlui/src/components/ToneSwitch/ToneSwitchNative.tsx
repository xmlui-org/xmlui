import { forwardRef } from "react";
import { useThemes } from "../../components-core/theming/ThemeContext";
import { ThemedIcon } from "../Icon/Icon";
import { Toggle } from "../Toggle/Toggle";
import styles from "./ToneSwitch.module.scss";
import classnames from "classnames";
import { noop } from "../../components-core/constants";
import { COMPONENT_PART_KEY } from "../../components-core/theming/responsive-layout";

// Default icons for light and dark modes
const DEFAULT_LIGHT_ICON = "sun";
const DEFAULT_DARK_ICON = "moon";

export type ToneSwitchProps = {
  iconLight?: string;
  iconDark?: string;
  className?: string;
  classes?: Record<string, string>;
  onChange?: (tone: "light" | "dark") => void;
};

export const ToneSwitch = forwardRef<HTMLDivElement, ToneSwitchProps>(function ToneSwitch(
  {
    iconLight = DEFAULT_LIGHT_ICON,
    iconDark = DEFAULT_DARK_ICON,
    className,
    classes,
    onChange = noop,
    ...rest
  }: ToneSwitchProps,
  ref,
) {
  const { activeThemeTone, setActiveThemeTone } = useThemes();
  //console.log('ToneSwitch render - activeThemeTone:', activeThemeTone); // Debug log

  const handleChange = (isDark: boolean) => {
    setActiveThemeTone(isDark ? "dark" : "light");
    onChange?.(isDark ? "dark" : "light");
  };

  return (
    <div
      {...rest}
      ref={ref}
      style={{ width: "fit-content", display: "inline-block" }}
      className={classnames(classes?.[COMPONENT_PART_KEY], className)}
    >
      <Toggle
        value={activeThemeTone === "dark"}
        onDidChange={handleChange}
        variant="switch"
        style={{ width: "fit-content" }}
        inputRenderer={(contextVars) => {
          //console.log('ToneSwitch contextVars:', contextVars); // Debug log
          return (
            <div
              className={classnames(styles.iconSwitch, {
                [styles.light]: !contextVars.$checked,
                [styles.dark]: contextVars.$checked,
              })}
            >
              <div className={styles.iconThumb}>
                {!contextVars.$checked ? (
                  <ThemedIcon name={iconLight} fallback="sun" className={styles.icon} />
                ) : (
                  <ThemedIcon name={iconDark} fallback="moon" className={styles.icon} />
                )}
              </div>
            </div>
          );
        }}
      />
    </div>
  );
});
