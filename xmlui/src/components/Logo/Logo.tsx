import { createComponentRendererNew } from "@components-core/renderers";
import { createMetadata } from "@abstractions/ComponentDefs";
import { Logo } from "./LogoNative";

const COMP = "Logo";

export const LogoMd = createMetadata({
  description:
    `The \`${COMP}\` component represents a logo or a brand symbol. Usually, you use ` +
    `this component in the [\`AppHeader\`](./AppHeader.mdx#logotemplate).`,
});

export const logoComponentRenderer = createComponentRendererNew(
  COMP,
  LogoMd,
  ({ node, layoutCss, extractValue }) => {
    return <Logo style={layoutCss} title={extractValue(node.props.title)} />;
  },
);
