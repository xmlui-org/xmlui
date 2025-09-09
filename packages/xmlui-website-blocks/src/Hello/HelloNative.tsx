import { forwardRef } from "react";

export const Hello = forwardRef<HTMLDivElement, React.PropsWithChildren<{}>>((props, ref) => {
  return <div ref={ref}>Hello</div>;
});
