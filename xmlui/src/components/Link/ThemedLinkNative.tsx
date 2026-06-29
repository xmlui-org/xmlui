import React from "react";

import type { ComponentMetadata } from "../../component-core/metadata/types";
import { useComponentThemeClass } from "../../runtime/rendering/theme";
import { LinkMd } from "./Link";
import { LinkNative } from "./LinkReact";

const COMP = "Link";

type ThemedLinkNativeProps = React.ComponentPropsWithoutRef<typeof LinkNative> & { className?: string };

export const ThemedLinkNative = React.forwardRef<
  React.ElementRef<typeof LinkNative>,
  ThemedLinkNativeProps
>(function ThemedLinkNative({ className, style, ...props }, ref) {
  const themeClass = useComponentThemeClass(COMP, LinkMd as ComponentMetadata);
  return (
    <LinkNative
      {...props}
      className={[themeClass.className, className].filter(Boolean).join(" ")}
      style={{ ...themeClass.style, ...style }}
      ref={ref}
    />
  );
});
