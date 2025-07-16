import { useThemes } from "../../components-core/theming/ThemeContext";
import { createComponentRenderer } from "../../components-core/renderers";
import { Toggle } from "../Toggle/Toggle";
import { Icon } from "../Icon/IconNative";
import { createMetadata } from "../metadata-helpers";
import { parseScssVar } from "../../components-core/theming/themeVars";
import styles from "./ToneSwitch.module.scss";
import classnames from "classnames";

const COMP = "ToneSwitch";
const LIGHT_ICON = "sun:ToneSwitch";
const DARK_ICON = "moon:ToneSwitch";

export const defaultProps = {
  lightIcon: LIGHT_ICON,
  darkIcon: DARK_ICON,
  showIcons: true,
};

export const ToneSwitchMd = createMetadata({
  status: "stable",
  description: "`ToneSwitch` enables the user to switch between light and dark modes using a switch control.",
  props: {
    lightIcon: {
      description:
        `The icon displayed when the theme is in light mode. You can change ` +
        `the default icon for all ${COMP} instances with the "icon.light:ToneSwitch" ` +
        `declaration in the app configuration file.`,
      defaultValue: defaultProps.lightIcon,
    },
    darkIcon: {
      description:
        `The icon displayed when the theme is in dark mode. You can change ` +
        `the default icon for all ${COMP} instances with the "icon.dark:ToneSwitch" ` +
        `declaration in the app configuration file.`,
      defaultValue: defaultProps.darkIcon,
    },
    showIcons: {
      description: "Whether to use icons as the switch control itself. When true, the switch becomes a pill-shaped toggle with sun and moon icons inside. When false, uses the standard switch design.",
      defaultValue: defaultProps.showIcons,
    },
  },
  themeVars: parseScssVar(styles.themeVars),
  limitThemeVarsToComponent: true,
  defaultThemeVars: {
    [`backgroundColor-${COMP}-light`]: "$color-surface-200",
    [`color-${COMP}-light`]: "$color-text-primary",
    [`backgroundColor-${COMP}-dark`]: "$color-primary-500",
    [`color-${COMP}-dark`]: "$color-surface-0",

    dark: {
      [`backgroundColor-${COMP}-light`]: "$color-surface-700",
      [`color-${COMP}-light`]: "$color-text-primary",
    }
  },
});

export function ToneSwitch({
  lightIcon = defaultProps.lightIcon,
  darkIcon = defaultProps.darkIcon,
  showIcons = defaultProps.showIcons,
}) {
  const { activeThemeTone, setActiveThemeTone } = useThemes();
  console.log('ToneSwitch render - activeThemeTone:', activeThemeTone); // Debug log

  const handleChange = (isDark: boolean) => {
    console.log('ToneSwitch handleChange called with:', isDark); // Debug log
    setActiveThemeTone(isDark ? "dark" : "light");
  };

  if (showIcons) {
    // Custom icon-based switch
    return (
      <div style={{ width: 'fit-content', display: 'inline-block' }} className="toneSwitchContainer">
        <Toggle
          value={activeThemeTone === "dark"}
          onDidChange={handleChange}
          variant="switch"
          style={{ width: 'fit-content' }}
          inputRenderer={(contextVars) => {
            console.log('ToneSwitch contextVars:', contextVars); // Debug log
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
                      name={lightIcon} 
                      fallback="sun" 
                      className={styles.icon}
                    />
                  ) : (
                    <Icon 
                      name={darkIcon} 
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

  // Fallback to standard switch without icons
  return (
    <Toggle
      value={activeThemeTone === "dark"}
      onDidChange={handleChange}
      variant="switch"
    />
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
      <ToneSwitch
        lightIcon={extractValue.asOptionalString(node.props.lightIcon)}
        darkIcon={extractValue.asOptionalString(node.props.darkIcon)}
        showIcons={extractValue.asOptionalBoolean(node.props.showIcons)}
      />
    );
  },
);
