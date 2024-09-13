import styles from "./Footer.module.scss";
import { createMetadata, type ComponentDef } from "@abstractions/ComponentDefs";
import { createComponentRendererNew } from "@components-core/renderers";
import { parseScssVar } from "@components-core/theming/themeVars";
import { paddingSubject } from "@components-core/theming/themes/base-utils";
import { Footer } from "./FooterNative";

const COMP = "Footer";

/**
 * The \`Footer\` is a component that acts as the footer within `App`.
 * > **Note**: Learn more about using this component [here](../learning/app-component).
 */
export interface FooterComponentDef extends ComponentDef<"Footer"> {}

export const FooterMd = createMetadata({
  description: `The \`${COMP}\` is a component that acts as the footer within \`App\`.`,
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    [`color-bg-${COMP}`]: "$color-bg-AppHeader",
    [`vertical-alignment-${COMP}`]: "center",
    [`font-size-${COMP}`]: "$font-size-small",
    [`color-text-${COMP}`]: "$color-text-secondary",
    [`max-content-width-${COMP}`]: "$max-content-width",
    ...paddingSubject("Footer", { horizontal: "$space-4", vertical: "$space-2" }),
    light: {
      // --- No light-specific theme vars
    },
    dark: {
      // --- No dark-specific theme vars
    },
  },
});

export const footerRenderer = createComponentRendererNew(
  COMP,
  FooterMd,
  ({ node, renderChild, layoutCss, layoutContext }) => {
    return (
      <Footer style={layoutCss} className={layoutContext?.themeClassName}>
        {renderChild(node.children, {
          // Since the Footer is a flex container, it's children should behave the same as in a stack
          type: "Stack",
          orientation: "horizontal",
        })}
      </Footer>
    );
  },
);
