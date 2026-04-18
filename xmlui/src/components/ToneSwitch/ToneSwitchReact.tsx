import { memo, forwardRef, useCallback } from "react";
import type { CSSProperties } from "react";
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

const ROOT_STYLE: CSSProperties = { width: "fit-content", display: "inline-block" };
const TOGGLE_STYLE: CSSProperties = { width: "fit-content" };

export type ToneSwitchProps = {
  iconLight?: string;
  iconDark?: string;
  className?: string;
  classes?: Record<string, string>;
  onDidChange?: (tone: "light" | "dark") => void;
};

export const ToneSwitch = memo(forwardRef<HTMLDivElement, ToneSwitchProps>(function ToneSwitch(
  {
    iconLight = DEFAULT_LIGHT_ICON,
    iconDark = DEFAULT_DARK_ICON,
    className,
    classes,
    onDidChange = noop,
    ...rest
  }: ToneSwitchProps,
  ref,
) {
  const { activeThemeTone, setActiveThemeTone } = useThemes();

  const handleChange = useCallback(
    (isDark: boolean) => {
      setActiveThemeTone(isDark ? "dark" : "light");
      onDidChange?.(isDark ? "dark" : "light");
    },
    [setActiveThemeTone, onDidChange],
  );

  return (
    <div
      {...rest}
      ref={ref}
      style={ROOT_STYLE}
      className={classnames(classes?.[COMPONENT_PART_KEY], className)}
    >
      <Toggle
        value={activeThemeTone === "dark"}
        onDidChange={handleChange}
        variant="switch"
        style={TOGGLE_STYLE}
        inputRenderer={(contextVars) => {
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
}));
