import { useThemeRuntime } from "../../runtime/rendering/theme";
import { wrapComponent } from "../../runtime/rendering/adapter";
import { defaultProps, ToneSwitchMd } from "./ToneSwitch";
import styles from "./ToneSwitch.module.scss";

export const toneSwitchRenderer = wrapComponent({
  name: "ToneSwitch",
  metadata: ToneSwitchMd,
  renderer: ({ adapter }) => {
    const theme = useThemeRuntime();
    const iconLight = adapter.stringProp("iconLight", defaultProps.iconLight) ?? defaultProps.iconLight;
    const iconDark = adapter.stringProp("iconDark", defaultProps.iconDark) ?? defaultProps.iconDark;
    const setTone = (tone: "light" | "dark") => {
      theme.setTone(tone);
      void adapter.event("didChange")(tone);
    };

    return (
      <div {...adapter.rootAttrs()} className={`${adapter.className} ${styles.toneSwitch}`} data-tone={theme.tone}>
        <button
          type="button"
          className={`${styles.button} ${theme.tone === "light" ? styles.active : ""}`}
          aria-pressed={theme.tone === "light"}
          aria-label="Light tone"
          onClick={() => setTone("light")}
        >
          {iconLight}
        </button>
        <button
          type="button"
          className={`${styles.button} ${theme.tone === "dark" ? styles.active : ""}`}
          aria-pressed={theme.tone === "dark"}
          aria-label="Dark tone"
          onClick={() => setTone("dark")}
        >
          {iconDark}
        </button>
      </div>
    );
  },
});
