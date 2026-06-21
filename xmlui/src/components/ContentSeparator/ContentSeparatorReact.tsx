import { forwardRef, memo, type CSSProperties } from "react";

import { defaultProps } from "./ContentSeparator.defaults";

export type ContentSeparatorProps = {
  thickness?: string;
  length?: string;
  orientation?: string;
  hasExplicitLength?: boolean;
  className?: string;
  style?: CSSProperties;
};

export const ContentSeparator = memo(forwardRef<HTMLDivElement, ContentSeparatorProps>(
  (
    {
      thickness,
      length,
      orientation = defaultProps.orientation,
      hasExplicitLength = false,
      className,
      style,
      ...rest
    },
    ref,
  ) => {
    const normalizedOrientation = orientation === "vertical" ? "vertical" : "horizontal";
    return (
      <div
        {...rest}
        ref={ref}
        className={[
          "xmluiContentSeparator",
          "separator",
          normalizedOrientation,
          !hasExplicitLength ? "stretchToFit" : undefined,
          className,
        ].filter(Boolean).join(" ")}
        style={{
          ...style,
          ...(thickness ? { "--xmlui-effective-thickness-ContentSeparator": thickness } : undefined),
          ...(length ? { "--xmlui-effective-length-ContentSeparator": length } : undefined),
        } as CSSProperties}
      />
    );
  },
));
