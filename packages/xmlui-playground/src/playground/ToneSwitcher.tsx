import { forwardRef } from "react";
import { ThemeTone, ToneChangerButton } from "xmlui";
import { toneChanged } from "../state/store";
import { usePlayground } from "../hooks/usePlayground";

export const ToneSwitcher = forwardRef<HTMLDivElement>((props, ref) => {
  const { dispatch } = usePlayground();
  return (
    <div ref={ref} {...props}>
      <ToneChangerButton
        onClick={(activeTone: ThemeTone) => {
          dispatch(toneChanged(activeTone));
        }}
      />
    </div>
  );
});

ToneSwitcher.displayName = "ToneSwitcher";
