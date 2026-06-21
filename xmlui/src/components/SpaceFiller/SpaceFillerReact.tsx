import { forwardRef, memo, type HTMLAttributes } from "react";

export const SpaceFiller = memo(forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function SpaceFiller({ className, ...rest }, ref) {
    return (
      <div
        {...rest}
        ref={ref}
        className={["xmluiSpaceFiller", className].filter(Boolean).join(" ")}
      />
    );
  },
));
