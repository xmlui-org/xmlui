import { useThemes } from "../../components-core/theming/ThemeContext";
import { createComponentRenderer } from "../../components-core/renderers";
import { Toggle } from "../Toggle/Toggle";
import { Icon } from "../Icon/IconNative";
import { createMetadata } from "../metadata-helpers";

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
      description: "Whether to show icons next to the switch control.",
      defaultValue: defaultProps.showIcons,
    },
  },
});

export function ToneSwitch({
  lightIcon = defaultProps.lightIcon,
  darkIcon = defaultProps.darkIcon,
  showIcons = defaultProps.showIcons,
}) {
  const { activeThemeTone, setActiveThemeTone } = useThemes();

  const handleChange = (isDark: boolean) => {
    setActiveThemeTone(isDark ? "dark" : "light");
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      {showIcons && (
        <Icon 
          name={lightIcon} 
          fallback="sun" 
          style={{ opacity: activeThemeTone === "light" ? 1 : 0.5 }}
        />
      )}
      <Toggle
        value={activeThemeTone === "dark"}
        onDidChange={handleChange}
        variant="switch"
      />
      {showIcons && (
        <Icon 
          name={darkIcon} 
          fallback="moon" 
          style={{ opacity: activeThemeTone === "dark" ? 1 : 0.5 }}
        />
      )}
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
      <ToneSwitch
        lightIcon={extractValue.asOptionalString(node.props.lightIcon)}
        darkIcon={extractValue.asOptionalString(node.props.darkIcon)}
        showIcons={extractValue.asOptionalBoolean(node.props.showIcons)}
      />
    );
  },
);
