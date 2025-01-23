import { CSSProperties, ForwardedRef, forwardRef } from "react";

type Props = {
  style?: CSSProperties;
};

export const Range = forwardRef(function Range(
  { style }: Props,
  forwardedRef: ForwardedRef<HTMLDivElement>,
) {
  return (
    <div
      ref={forwardedRef}
      style={{ backgroundColor: "orangered", color: "white", padding: 2, ...style }}
    >
      Range component is not implemented yet
    </div>
  );
});
