import { Image } from "@components/Image/ImageNative";
import { useLogoUrl } from "@components/AppHeader/AppHeaderNative";
import type { CSSProperties } from "react";

export const Logo = ({ style }: { style?: CSSProperties }) => {
  const logoUrl = useLogoUrl();
  if (!logoUrl) {
    return null;
  }
  //width auto for safari
  return (
    <Image src={logoUrl} alt={"Logo"} style={{ width: "auto", boxShadow: "none", ...style }} />
  );
};
