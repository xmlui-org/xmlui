import type { CSSProperties, ForwardedRef} from "react";
import { forwardRef } from "react";
import classnames from "classnames";

import { ThemedImage as Image } from "../Image/Image";
import { useLogoUrl } from "../AppHeader/AppHeaderReact";
import { COMPONENT_PART_KEY } from "../../components-core/theming/responsive-layout";

// Default props for Logo component
export const defaultProps = {
  alt: "Logo",
  inline: false,
};

type LogoProps = {
  alt?: string;
  style?: CSSProperties;
  className?: string;
  classes?: Record<string, string>;
  inline?: boolean;
};

export const Logo = forwardRef(function Logo(
  { style, alt = defaultProps.alt, inline = defaultProps.inline, className, classes, ...rest }: LogoProps,
  forwardedRef: ForwardedRef<HTMLImageElement>,
) {
  const logoUrl = useLogoUrl();
  if (!logoUrl) {
    return null;
  }
  //width auto for safari
  return (
    <Image
      {...rest}
      ref={forwardedRef}
      src={logoUrl}
      alt={alt}
      inline={inline}
      className={classnames(classes?.[COMPONENT_PART_KEY], className)}
      style={{ width: "auto", boxShadow: "none", ...style }}
    />
  );
});
