import { ForwardedRef, forwardRef } from "react";

type Props = {
  style?: React.CSSProperties;
};

export const Alert = forwardRef(function Alert(
  { style }: Props,
  forwardedRef: ForwardedRef<HTMLDivElement>,
) {
  return (
    <div
      ref={forwardedRef}
      style={{ backgroundColor: "orange", color: "white", padding: 2, ...style }}
    >
      Alert component is not implemented yet
    </div>
  );
});
