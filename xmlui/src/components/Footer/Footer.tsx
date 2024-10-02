import styles from "./Footer.module.scss";
import { createMetadata } from "@abstractions/ComponentDefs";
import { createComponentRenderer } from "@components-core/renderers";
import { parseScssVar } from "@components-core/theming/themeVars";
import {borderSubject, paddingSubject} from "@components-core/theming/themes/base-utils";
import { Footer } from "./FooterNative";

const COMP = "Footer";

export const FooterMd = createMetadata({
  description: `The \`${COMP}\` is a component that acts as the footer within \`App\`.`,
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    [`color-bg-${COMP}`]: "$color-bg-AppHeader",
    [`vertical-alignment-${COMP}`]: "center",
    [`font-size-${COMP}`]: "$font-size-small",
    [`color-text-${COMP}`]: "$color-text-secondary",
    [`max-content-width-${COMP}`]: "$max-content-width",
    ...paddingSubject(COMP, { horizontal: "$space-4", vertical: "$space-2" }),
    ...borderSubject(COMP, {
      top: {
        color: "$color-border",
        thickness: "1px",
        style: "solid",
      },
    }),
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
