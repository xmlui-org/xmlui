import { CSSProperties, ForwardedRef, forwardRef } from "react";

type Props = {
  style?: CSSProperties;
};

export const Slider = forwardRef(function Slider(
  { style }: Props,
  forwardedRef: ForwardedRef<HTMLDivElement>,
) {
  return (
    <div
      ref={forwardedRef}
      style={{ backgroundColor: "orangered", color: "white", padding: 2, ...style }}
    >
      Slider component is not implemented yet
    </div>
  );
});
