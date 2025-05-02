import styles from "./Footer.module.scss";

import { createMetadata } from "../../abstractions/ComponentDefs";
import { createComponentRenderer } from "../../components-core/renderers";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { Footer } from "./FooterNative";

const COMP = "Footer";

export const FooterMd = createMetadata({
  description: `The \`${COMP}\` is a component that acts as a placeholder within \`App\`.`,
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    [`backgroundColor-${COMP}`]: "$backgroundColor-AppHeader",
    [`verticalAlign-${COMP}`]: "center",
    [`fontSize-${COMP}`]: "$fontSize-small",
    [`textColor-${COMP}`]: "$textColor-secondary",
    [`maxWidth-content-${COMP}`]: "$maxWidth-content",
    [`borderTop-${COMP}`]: `1px solid $borderColor`,
    [`padding-${COMP}`]: "$space-2 $space-4",
    light: {
      // --- No light-specific theme vars
    },
    dark: {
      // --- No dark-specific theme vars
    },
  },
});

export const footerRenderer = createComponentRenderer(
  COMP,
  FooterMd,
  ({ node, renderChild, layoutCss, layoutContext }) => {
    return (
      <Footer style={layoutCss} className={layoutContext?.themeClassName}>
        {renderChild(node.children, {
          type: "Stack",
          orientation: "horizontal",
        })}
      </Footer>
    );
  },
);