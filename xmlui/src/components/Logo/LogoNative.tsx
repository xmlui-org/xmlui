import { CSSProperties, ForwardedRef, forwardRef } from "react";

import { Image } from "../Image/ImageNative";
import { useLogoUrl } from "../AppHeader/AppHeaderNative";

// Default props for Logo component
export const defaultProps = {
  alt: "Logo",
  inline: false,
};

type LogoProps = {
  alt?: string;
  style?: CSSProperties;
  inline?: boolean;
};

export const Logo = forwardRef(function Logo(
  { style, alt = defaultProps.alt, inline = defaultProps.inline }: LogoProps,
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
      alt={alt}
      inline={inline}
      style={{ width: "auto", boxShadow: "none", ...style }}
    />
  );
});
