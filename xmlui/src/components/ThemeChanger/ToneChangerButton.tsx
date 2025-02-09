import { createMetadata } from "../../abstractions/ComponentDefs";
import { Button } from "../Button/ButtonNative";
import { useThemes } from "../../components-core/theming/ThemeContext";
import { createComponentRenderer } from "../../components-core/renderers";
import { Icon } from "../Icon/IconNative";

const COMP = "ToneChangerButton";
export const ToneChangerButtonMd = createMetadata({
  status: "experimental",
  docFolder: "ThemeChanger",
  description: `The \`${COMP}\` component is a component that allows the user to change the tone of the app.`,
  props: {},
});

function ToneChangerButton() {
  const { activeThemeTone, setActiveThemeTone } = useThemes();

  return (
    <Button
      variant="ghost"
      icon={<Icon name={activeThemeTone === "light" ? "moon" : "sun"} />}
      onClick={() => {
        activeThemeTone === "light" ? setActiveThemeTone("dark") : setActiveThemeTone("light");
      }}
    />
  );
}

/**
 * Define the renderer for the Button component
 */
export const toneChangerButtonComponentRenderer = createComponentRenderer(
  COMP,
  ToneChangerButtonMd,
  () => {
    return <ToneChangerButton />;
  },
);
