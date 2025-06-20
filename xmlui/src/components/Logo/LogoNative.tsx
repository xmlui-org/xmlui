import { CSSProperties, ForwardedRef, forwardRef } from "react";

import { Image } from "../Image/ImageNative";
import { useLogoUrl } from "../AppHeader/AppHeaderNative";

// Default props for Logo component
export const defaultProps = {
  alt: "Logo",
};

type Props = {
  style?: CSSProperties;
  className?: string;
};

export const Logo = forwardRef(function Logo(
  { style, className }: Props,
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
      alt={defaultProps.alt}
      style={{ width: "auto", boxShadow: "none", ...style }}
      className={className}
    />
  );
});
