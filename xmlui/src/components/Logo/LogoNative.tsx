import { Image } from "@components/Image/ImageNative";
import { useLogoUrl } from "@components/AppHeader/AppHeaderNative";
import { CSSProperties, ForwardedRef, forwardRef } from "react";

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
