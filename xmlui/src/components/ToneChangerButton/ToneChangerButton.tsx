import { useThemes } from "../../components-core/theming/ThemeContext";
import { createComponentRenderer } from "../../components-core/renderers";
import { Button } from "../Button/ButtonNative";
import { Icon } from "../Icon/IconNative";
import { createMetadata, dClick } from "../metadata-helpers";
import { noop } from "lodash-es";

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
  description: "`ToneChangerButton` enables the user to switch between light and dark modes.",
  props: {
    lightToDarkIcon: {
      description:
        `The icon displayed when the theme is in light mode and will switch to dark. You can change ` +
        `the default icon for all ${COMP} instances with the "icon.lightToDark:ToneChangerButton" ` +
        `declaration in the app configuration file.`,
      defaultValue: defaultProps.lightToDarkIcon,
    },
    darkToLightIcon: {
      description:
        `The icon displayed when the theme is in dark mode and will switch to light. You can change ` +
        `the default icon for all ${COMP} instances with the "icon.darkToLight:ToneChangerButton" ` +
        `declaration in the app configuration file.`,
      defaultValue: defaultProps.darkToLightIcon,
    },
  },
  events: {
    click: dClick(COMP),
  },
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
      icon={<Icon name={iconName} fallback={fallbackIcon} />}
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

/**
 * Define the renderer for the ToneChangerButton component
 */
export const toneChangerButtonComponentRenderer = createComponentRenderer(
  COMP,
  ToneChangerButtonMd,
  ({ node, extractValue, lookupEventHandler }) => {
    return (
      <ToneChangerButton
        onClick={lookupEventHandler("click")}
        lightToDarkIcon={extractValue.asOptionalString(node.props.lightToDarkIcon)}
        darkToLightIcon={extractValue.asOptionalString(node.props.darkToLightIcon)}
      />
    );
  },
);
