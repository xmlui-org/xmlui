import { createComponentRenderer } from "../../components-core/renderers";
import { createMetadata } from "../metadata-helpers";
import { Logo, defaultProps } from "./LogoNative";

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
      type: "string",
      defaultValue: defaultProps.alt,
    },
  },
});

export const logoComponentRenderer = createComponentRenderer(
  COMP,
  LogoMd,
  ({ node, layoutCss, extractValue }) => {
    return <Logo style={layoutCss} />;
  },
);
