import styles from "./StickyBox.module.scss";

import { createMetadata, d } from "../../abstractions/ComponentDefs";
import { createComponentRenderer } from "../../components-core/renderers";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { StickyBox } from "./StickyBoxNative";

const COMP = "StickyBox";

export const StickyBoxMd = createMetadata({
  status: "experimental",
  description:
    `The \`${COMP}\` is a component that "sticks" or remains fixed at the top or bottom ` +
    `position on the screen as the user scrolls.`,
  props: {
    to: {
      description:
        "This property determines whether the StickyBox should be anchored to " +
        "the \`top\` or \`bottom\`.",
      availableValues: ["top", "bottom"],
      valueType: "string",
      defaultValue: "top",
    },
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    [`backgroundColor-${COMP}`]: "$backgroundColor",
  },
});

export const stickyBoxComponentRenderer = createComponentRenderer(
  COMP,
  StickyBoxMd,
  ({ node, renderChild, extractValue, layoutCss }) => {
    return (
      <StickyBox uid={node.uid} layout={layoutCss} to={extractValue(node.props?.to)}>
        {renderChild(node.children)}
      </StickyBox>
    );
  },
);
