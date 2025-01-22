import { ForwardedRef, forwardRef } from "react";

type Props = {};

export const ButtonGroup = forwardRef(function ButtonGroup(
  {}: Props,
  forwardedRef: ForwardedRef<HTMLDivElement>,
) {
  return (
    <div ref={forwardedRef} style={{ backgroundColor: "orangered", color: "white", padding: 2 }}>
      ButtonGroup component is not implemented yet
    </div>
  );
});
