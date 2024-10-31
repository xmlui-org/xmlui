import { usePlayground } from "@/src/hooks/usePlayground";
import { toneChanged } from "@/src/state/store";
import styles from "@/src/components/Header.module.scss";
import { LuMoon, LuSun } from "react-icons/lu";

export function ToneSwitcher() {
  const { appDescription, options, dispatch } = usePlayground();
  const tone = options.activeTone || appDescription.config.defaultTone || "light";

  return (
    <button
      className={styles.button}
      onClick={() => {
        tone === "light" ? dispatch(toneChanged("dark")) : dispatch(toneChanged("light"));
      }}
    >
      {tone === "light" ? <LuMoon /> : <LuSun />}
    </button>
  );
}
