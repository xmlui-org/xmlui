import { CSSProperties, ForwardedRef, forwardRef } from "react";

import { Image } from "../Image/ImageNative";
import { useLogoUrl } from "../AppHeader/AppHeaderNative";

export const Logo = forwardRef(function Logo(
  {
    style,
  }: {
    style?: CSSProperties;
  },
  forwardedRef: ForwardedRef<HTMLImageElement>,
) {
  const logoUrl = useLogoUrl();
  if (!logoUrl) {
    return null;
  }
  //width auto for safari
  return (
    <Image
      ref={forwardedRef}
      src={logoUrl}
      alt={"Logo"}
      style={{ width: "auto", boxShadow: "none", ...style }}
    />
  );
});
