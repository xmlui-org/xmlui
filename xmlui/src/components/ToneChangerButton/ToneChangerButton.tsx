import { useThemes } from "../../components-core/theming/ThemeContext";
import { ThemedButton as Button } from "../Button/Button";
import { ThemedIcon } from "../Icon/Icon";
import { createMetadata, dClick } from "../metadata-helpers";
import { noop } from "lodash-es";
import { wrapComponent } from "../../components-core/wrapComponent";

const COMP = "ToneChangerButton";
const LIGHT_TO_DARK_ICON = "lightToDark:ToneChangerButton";
const DARK_TO_LIGHT_ICON = "darkToLight:ToneChangerButton";

export const defaultProps = {
  lightToDarkIcon: LIGHT_TO_DARK_ICON,
  darkToLightIcon: DARK_TO_LIGHT_ICON,
  onClick: noop,
};

export const ToneChangerButtonMd = createMetadata({
  status: "stable",
  deprecationMessage:
    "The `ToneChangerButton` component is deprecated and will be removed in a future release. " +
    "Please use the `ToneSwitch` component instead.",
  description: "`ToneChangerButton` enables the user to switch between light and dark modes.",
  props: {
    lightToDarkIcon: {
      description:
        `The icon displayed when the theme is in light mode and will switch to dark. You can change ` +
        `the default icon for all ${COMP} instances with the "icon.lightToDark:ToneChangerButton" ` +
        `declaration in the app configuration file.`,
      valueType: "string",
      defaultValue: defaultProps.lightToDarkIcon,
    },
    darkToLightIcon: {
      description:
        `The icon displayed when the theme is in dark mode and will switch to light. You can change ` +
        `the default icon for all ${COMP} instances with the "icon.darkToLight:ToneChangerButton" ` +
        `declaration in the app configuration file.`,
      valueType: "string",
      defaultValue: defaultProps.darkToLightIcon,
    },
  },
  events: {
    click: dClick(COMP),
  },
  defaultAriaLabel: "Toggle color mode",
});

export function ToneChangerButton({
  lightToDarkIcon = defaultProps.lightToDarkIcon,
  darkToLightIcon = defaultProps.darkToLightIcon,
  onClick = defaultProps.onClick,
}) {
  const { activeThemeTone, setActiveThemeTone } = useThemes();

  // Use the direct icon name as both the main icon and the fallback
  // This ensures we always have a working icon
  const iconName = activeThemeTone === "light" ? lightToDarkIcon : darkToLightIcon;
  const fallbackIcon = activeThemeTone === "light" ? "lightToDark" : "darkToLight";

  return (
    <Button
      variant="ghost"
      style={{ flexShrink: 0 }}
      icon={<ThemedIcon name={iconName} fallback={fallbackIcon} />}
      onClick={() => {
        if (activeThemeTone === "light") {
          setActiveThemeTone("dark");
          onClick?.("dark");
        } else {
          setActiveThemeTone("light");
          onClick?.("light");
        }
      }}
    />
  );
}

export const toneChangerButtonComponentRenderer = wrapComponent(
  COMP,
  ToneChangerButton,
  ToneChangerButtonMd,
);
