import { memo, useCallback } from "react";
import type { CSSProperties, MouseEvent } from "react";
import { useThemes } from "../../components-core/theming/ThemeContext";
import { ThemedButton as Button } from "../Button/Button";
import { ThemedIcon } from "../Icon/Icon";
import { createMetadata, dClick } from "../metadata-helpers";
import { noop } from "../../components-core/constants";
import { wrapComponent } from "../../components-core/wrapComponent";
import { defaultProps } from "./ToneChangerButton.defaults";
import type { ComponentMetadata } from "../../component-core/metadata/types";
import { wrapComponent as wrapRuntimeComponent } from "../../runtime/rendering/adapter";

const COMP = "ToneChangerButton";
const GHOST_BUTTON_STYLE = { flexShrink: 0 };

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

export const ToneChangerButton = memo(function ToneChangerButton({
  lightToDarkIcon = defaultProps.lightToDarkIcon,
  darkToLightIcon = defaultProps.darkToLightIcon,
  onClick = noop,
}: {
  lightToDarkIcon?: string;
  darkToLightIcon?: string;
  onClick?: (tone: string) => void;
}) {
  const { activeThemeTone, setActiveThemeTone } = useThemes();

  const iconName = activeThemeTone === "light" ? lightToDarkIcon : darkToLightIcon;
  const fallbackIcon = activeThemeTone === "light" ? "lightToDark" : "darkToLight";

  const handleClick = useCallback(() => {
    if (activeThemeTone === "light") {
      setActiveThemeTone("dark");
      onClick?.("dark");
    } else {
      setActiveThemeTone("light");
      onClick?.("light");
    }
  }, [activeThemeTone, setActiveThemeTone, onClick]);

  return (
    <Button
      variant="ghost"
      style={GHOST_BUTTON_STYLE}
      icon={<ThemedIcon name={iconName} fallback={fallbackIcon} />}
      onClick={handleClick}
    />
  );
});

export const toneChangerButtonComponentRenderer = wrapComponent(
  COMP,
  ToneChangerButton,
  ToneChangerButtonMd,
);

export const toneChangerButtonRenderer = wrapRuntimeComponent({
  name: COMP,
  metadata: ToneChangerButtonMd as ComponentMetadata,
  renderer: ({ adapter }) => {
    const rootAttrs = adapter.rootAttrs();
    const { activeThemeTone, setActiveThemeTone } = useThemes();
    const handleWrapperClick = (event: MouseEvent<HTMLSpanElement>) => {
      if (event.target !== event.currentTarget) {
        return;
      }
      const nextTone = activeThemeTone === "light" ? "dark" : "light";
      setActiveThemeTone(nextTone);
      void adapter.event("click")(nextTone);
    };
    return (
      <span
        {...rootAttrs}
        onClick={handleWrapperClick}
        style={{
          ...(rootAttrs.style as CSSProperties | undefined),
          display: "inline-flex",
        }}
      >
        <ToneChangerButton
          lightToDarkIcon={adapter.stringProp("lightToDarkIcon", defaultProps.lightToDarkIcon)}
          darkToLightIcon={adapter.stringProp("darkToLightIcon", defaultProps.darkToLightIcon)}
          onClick={(tone) => {
            void adapter.event("click")(tone);
          }}
        />
      </span>
    );
  },
});
