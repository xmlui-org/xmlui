import { useThemeRuntime } from "../../runtime/rendering/theme";
import { wrapComponent } from "../../runtime/rendering/adapter";
import { defaultProps, ToneChangerButtonMd } from "./ToneChangerButton";

export const toneChangerButtonRenderer = wrapComponent({
  name: "ToneChangerButton",
  metadata: ToneChangerButtonMd,
  renderer: ({ adapter }) => {
    const theme = useThemeRuntime();
    const label = theme.tone === "light"
      ? adapter.stringProp("lightToDarkIcon", defaultProps.lightToDarkIcon)
      : adapter.stringProp("darkToLightIcon", defaultProps.darkToLightIcon);
    const nextTone = theme.tone === "light" ? "dark" : "light";
    return (
      <button
        {...adapter.rootAttrs()}
        type="button"
        aria-label="Toggle color mode"
        data-tone={theme.tone}
        onClick={() => {
          theme.setTone(nextTone);
          void adapter.event("click")(nextTone);
        }}
      >
        {label}
      </button>
    );
  },
});
