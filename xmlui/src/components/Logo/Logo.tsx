import { createMetadata } from "../../abstractions/ComponentDefs";
import { createComponentRenderer } from "../../components-core/renderers";
import { Logo, defaultProps } from "./LogoNative";

const COMP = "Logo";

export const LogoMd = createMetadata({
  status: "experimental",
  description:
    `The \`${COMP}\` component represents a logo or a brand symbol. Usually, you use ` +
    `this component in the [\`AppHeader\`](./AppHeader.mdx#logotemplate).`,
  props: {
    alt: {
      description: "Alternative text for the logo image for accessibility.",
      type: "string",
      defaultValue: defaultProps.alt,
    }
  }
});

export const logoComponentRenderer = createComponentRenderer(
  COMP,
  LogoMd,
  ({ node, layoutCss, extractValue }) => {
    return <Logo style={layoutCss} />;
  },
);
