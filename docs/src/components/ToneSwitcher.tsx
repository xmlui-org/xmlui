import { usePlayground } from "@/src/hooks/usePlayground";
import { toneChanged } from "@/src/state/store";
import styles from "@/src/components/Header.module.scss";
import { LuMoon, LuSun } from "react-icons/lu";
import { forwardRef } from "react";

export const ToneSwitcher = forwardRef<HTMLButtonElement>((props, ref) => {
  const { appDescription, options, dispatch } = usePlayground();
  const tone = options.activeTone || appDescription.config.defaultTone || "light";

  return (
    <button
      {...props}
      ref={ref}
      className={styles.button}
      onClick={() => {
        tone === "light" ? dispatch(toneChanged("dark")) : dispatch(toneChanged("light"));
      }}
    >
      {tone === "light" ? <LuMoon /> : <LuSun />}
    </button>
  );
});

ToneSwitcher.displayName = "ToneSwitcher";
