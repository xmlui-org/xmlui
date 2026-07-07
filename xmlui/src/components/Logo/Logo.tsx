import { wrapComponent } from "../../components-core/wrapComponent";
import { createMetadata } from "../metadata-helpers";
import { defaultProps } from "./Logo.defaults";
import { Logo } from "./LogoReact";
import React from "react";
import { useComponentThemeClass } from "../../components-core/theming/utils";
import type { ComponentMetadata } from "../../component-core/metadata/types";
import { wrapComponent as wrapRuntimeComponent } from "../../runtime/rendering/adapter";

const COMP = "Logo";

export const LogoMd = createMetadata({
  status: "stable",
  description:
    "`Logo` displays your application's brand symbol by automatically loading logo " +
    "images defined in the app manifest. While logos are typically configured " +
    "using App-level properties (`logo`, `logo-dark`), this component provides " +
    "direct control when you need custom logo placement or templating.",
  props: {
    alt: {
      description: "Alternative text for the logo image for accessibility.",
      valueType: "string",
      defaultValue: defaultProps.alt,
    },
    inline: {
      description: `When set to true, the image will be displayed as an inline element instead of a block element.`,
      valueType: "boolean",
      defaultValue: defaultProps.inline,
    },
  },
});

type ThemedLogoProps = React.ComponentPropsWithoutRef<typeof Logo>;

export const ThemedLogo = React.forwardRef<React.ElementRef<typeof Logo>, ThemedLogoProps>(
  function ThemedLogo({ className, ...props }, ref) {
    const themeClass = useComponentThemeClass(LogoMd);
    return (
      <Logo
        {...props}
        className={`${themeClass}${className ? ` ${className}` : ""}`}
        ref={ref}
      />
    );
  },
);

export const logoComponentRenderer = wrapComponent(COMP, Logo, LogoMd, {
  booleans: ["inline"],
  strings: ["alt"],
});

export const logoRenderer = wrapRuntimeComponent({
  name: COMP,
  metadata: LogoMd as ComponentMetadata,
  renderer: ({ adapter }) => (
    <Logo
      {...adapter.rootAttrs()}
      data-testid={adapter.stringProp("testId", "test-id-component")}
      alt={adapter.stringProp("alt", defaultProps.alt)}
      inline={adapter.booleanProp("inline", defaultProps.inline)}
    />
  ),
});
