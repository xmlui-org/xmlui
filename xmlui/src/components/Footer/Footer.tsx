import React, { ReactNode } from "react";
import styles from "./Footer.module.scss";
import type { ComponentDef } from "@abstractions/ComponentDefs";
import { createComponentRenderer } from "@components-core/renderers";
import { ComponentDescriptor } from "@abstractions/ComponentDescriptorDefs";
import { parseScssVar } from "@components-core/theming/themeVars";
import { paddingSubject } from "@components-core/theming/themes/base-utils";
import { useAppLayoutContext } from "@components/App/AppLayoutContext";
import { createPortal } from "react-dom";
import classnames from "@components-core/utils/classnames";

// =====================================================================================================================
// React Footer component implementation

function Footer({
  children,
  style,
  className,
}: {
  children: ReactNode;
  style: React.CSSProperties;
  className?: string;
}) {
  const appLayoutContext = useAppLayoutContext();
  const content = (
    <div className={styles.outerWrapper}>
      <div className={classnames(styles.wrapper, className)} style={style}>
        {children}
      </div>
    </div>
  );

  const { footerRoot } = appLayoutContext || {};
  if (footerRoot) {
    return createPortal(content, footerRoot);
  }
  return content;
}

// =====================================================================================================================
// XMLUI Footer component definition

/**
 * The \`Footer\` is a component that acts as the footer within `App`.
 * > **Note**: Learn more about using this component [here](../learning/app-component).
 */
export interface FooterComponentDef extends ComponentDef<"Footer"> {}

const metadata: ComponentDescriptor<FooterComponentDef> = {
  displayName: "Footer",
  description: "Display an application footer",
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    "color-bg-Footer": "$color-bg-AppHeader",
    "vertical-alignment-Footer": "center",
    "font-size-Footer": "$font-size-small",
    "color-text-Footer": "$color-text-secondary",
    "max-content-width-Footer": "$max-content-width",
    ...paddingSubject("Footer", { horizontal: "$space-4", vertical: "$space-2" }),
    light: {
      // --- No light-specific theme vars
    },
    dark: {
      // --- No dark-specific theme vars
    }
  },
};

export const footerRenderer = createComponentRenderer<FooterComponentDef>(
  "Footer",
  ({ node, renderChild, layoutCss, layoutContext }) => {
    return (
      <Footer style={layoutCss} className={layoutContext?.themeClassName}>
        {renderChild(node.children, {
          // Since the Footer is a flex container, it's children should behave the same as in a stack
          type: "Stack",
          orientation: "horizontal"
        })}
      </Footer>
    );
  },
  metadata
);
