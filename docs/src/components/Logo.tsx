import { useTheme } from "nextra-theme-docs";
import React from "react";
import Image from "next/image";

export const Logo = () => {
  const {theme} = useTheme();
  return (
    <div style={{ paddingLeft: 8 }}>
      {theme === "dark" ? <Image src="/resources/xmlui-logo-dark.svg" alt="dark-xmlui-logo" width="86" height="41"/> : <Image src="/resources/xmlui-logo.svg" alt="xmlui-logo" width="86" height="41"/>}
    </div>
  );
};
