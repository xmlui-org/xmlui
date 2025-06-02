import { createMetadata, d } from "../../abstractions/ComponentDefs";
import { useThemes } from "../../components-core/theming/ThemeContext";
import { createComponentRenderer } from "../../components-core/renderers";
import { Button } from "../Button/ButtonNative";
import { Icon } from "../Icon/IconNative";

const COMP = "ToneChangerButton";
const LIGHT_TO_DARK_ICON = "lightToDark:ToneChangerButton";
const DARK_TO_LIGHT_ICON = "darkToLight:ToneChangerButton";

export const ToneChangerButtonMd = createMetadata({
  status: "experimental",
  description: `The \`${COMP}\` component is a component that allows the user to change the tone of the app.`,
  props: {
    lightToDarkIcon: d(
      `The icon displayed when the theme is in light mode and will switch to dark. You can change ` +
      `the default icon for all ${COMP} instances with the "icon.lightToDark:ToneChangerButton" ` +
      `declaration in the app configuration file.`
    ),
    darkToLightIcon: d(
      `The icon displayed when the theme is in dark mode and will switch to light. You can change ` +
      `the default icon for all ${COMP} instances with the "icon.darkToLight:ToneChangerButton" ` +
      `declaration in the app configuration file.`
    ),
  },
});

export function ToneChangerButton({
  lightToDarkIcon = LIGHT_TO_DARK_ICON,
  darkToLightIcon = DARK_TO_LIGHT_ICON
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
      onClick={() =>
        activeThemeTone === "light" ? setActiveThemeTone("dark") : setActiveThemeTone("light")
      }
    />
  );
}

/**
 * Define the renderer for the ToneChangerButton component
 */
export const toneChangerButtonComponentRenderer = createComponentRenderer(
  COMP,
  ToneChangerButtonMd,
  ({ node, extractValue }) => {
    return <ToneChangerButton
      lightToDarkIcon={extractValue.asOptionalString(node.props.lightToDarkIcon)}
      darkToLightIcon={extractValue.asOptionalString(node.props.darkToLightIcon)}
    />;
  },
);
