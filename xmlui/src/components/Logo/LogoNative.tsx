import { Image } from "@components/Image/ImageNative";
import { useLogoUrl } from "@components/AppHeader/AppHeaderNative";
import type { CSSProperties } from "react";

export const Logo = ({ inDrawer, style }: { inDrawer?: boolean; style?: CSSProperties }) => {
  const logoUrl = useLogoUrl(inDrawer);
  if (!logoUrl) {
    return null;
  }
  //width auto for safari
  return <Image src={logoUrl} alt={"Logo"} layout={{ width: 'auto', ...style }} />;
};
