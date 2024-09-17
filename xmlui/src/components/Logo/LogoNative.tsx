import { NavLink } from "@components/NavLink/NavLinkNative";
import { Image } from "@components/Image/ImageNative";
import { useLogoUrl } from "@components/AppHeader/AppHeaderNative";
import type { CSSProperties } from "react";

export const Logo = ({
  inDrawer,
  style,
  title,
}: {
  inDrawer?: boolean;
  style?: CSSProperties;
  title?: string;
}) => {
  const logoUrl = useLogoUrl(inDrawer);
  if (!logoUrl) {
    return null;
  }
  return (
    <NavLink
      to={"/"}
      displayActive={false}
      style={{ padding: 0, height: "100%", fontWeight: "500", ...style }}
    >
      <Image src={logoUrl} alt={"Logo"} /> {title}
    </NavLink>
  );
};
