import { forwardRef } from "react";
import { ToneChangerButton } from "xmlui";

export const ToneSwitcher = forwardRef<HTMLDivElement>((props, ref) => {
  return (
    <div ref={ref} {...props}>
      <ToneChangerButton />
    </div>
  );
});

ToneSwitcher.displayName = "ToneSwitcher";
