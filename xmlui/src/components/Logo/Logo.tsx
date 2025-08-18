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
    inline: {
      description: `When set to true, the image will be displayed as an inline element instead of a block element.`,
      type: "boolean",
      defaultValue: defaultProps.inline,
    },
  },
});

export const logoComponentRenderer = createComponentRenderer(
  COMP,
  LogoMd,
  ({ node, className, extractValue }) => {
    return (
      <Logo
        className={className}
        inline={extractValue.asOptionalBoolean(node.props.inline)}
        alt={extractValue(node.props.alt)}
      />
    );
  },
);
