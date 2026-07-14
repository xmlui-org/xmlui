import styles from "./Footer.module.scss";
import type { CSSProperties } from "react";

import { wrapComponent } from "../../components-core/wrapComponent";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { Footer } from "./FooterReact";
import { createMetadata } from "../metadata-helpers";
import classnames from "classnames";
import { COMPONENT_PART_KEY } from "../../components-core/theming/responsive-layout";

const COMP = "Footer";

export const FooterMd = createMetadata({
  status: "stable",
  description:
    "`Footer` provides a designated area at the bottom of your application for " +
    "footer content such as branding, copyright notices, or utility controls like " +
    "theme toggles.",
  props: {
    sticky: {
      description:
        "When set to true (default), keeps the Footer docked to the bottom of the page in sticky layouts. " +
        "When set to false, allows the Footer to scroll with the main content for non-desktop layouts. " +
        "In desktop layout, the Footer remains sticky regardless of this property.",
      valueType: "boolean",
      defaultValue: true,
    },
  },
  themeVars: parseScssVar(styles.themeVars),
  limitThemeVarsToComponent: true,
  defaultThemeVars: {
    [`backgroundColor-${COMP}`]: "$backgroundColor-AppHeader",
    [`verticalAlignment-${COMP}`]: "center",
    [`fontSize-${COMP}`]: "$fontSize-sm",
    [`textColor-${COMP}`]: "$textColor-secondary",
    [`maxWidth-content-${COMP}`]: "$maxWidth-content",
    [`borderTop-${COMP}`]: `1px solid $borderColor`,
    [`padding-${COMP}`]: "$space-2 $space-4",
    [`gap-${COMP}`]: "$space-normal",
    [`margin-${COMP}`]: `0 auto`,
    light: {
      // --- No light-specific theme vars
    },
    dark: {
      // --- No dark-specific theme vars
    },
  },
});

export const footerRenderer = wrapComponent(COMP, Footer, FooterMd, {
  customRender: (_props, { node, extractValue, renderChild, classes, layoutContext }) => {
    const sticky = extractValue.asOptionalBoolean(node.props.sticky, true);
    const mergedClasses = layoutContext?.themeClassName
      ? { ...classes, [COMPONENT_PART_KEY]: classnames(layoutContext.themeClassName, classes?.[COMPONENT_PART_KEY]) }
      : classes;
    return (
      <Footer classes={mergedClasses} sticky={sticky}>
        {renderChild(node.children, { type: "Stack", orientation: "horizontal" })}
      </Footer>
    );
  },
});

import type { ComponentMetadata } from "../../component-core/metadata/types";
import { wrapComponent as wrapRuntimeComponent } from "../../runtime/rendering/adapter";
import { defaultProps } from "./Footer.defaults";

export const footerRuntimeRenderer = wrapRuntimeComponent({
  name: COMP,
  metadata: FooterMd as ComponentMetadata,
  renderer: ({ adapter }) => {
    const rootAttrs = adapter.rootAttrs();
    const { rootStyle, contentStyle } = splitRuntimeFooterStyles(rootAttrs.style);
    return (
      <Footer
        {...rootAttrs}
        style={rootStyle}
        contentStyle={contentStyle}
        sticky={adapter.booleanProp("sticky", defaultProps.sticky)}
        classes={{ [COMPONENT_PART_KEY]: adapter.className }}
      >
        {adapter.renderChildren()}
      </Footer>
    );
  },
});

function splitRuntimeFooterStyles(style: unknown): {
  rootStyle?: CSSProperties;
  contentStyle?: CSSProperties;
} {
  if (!style || typeof style !== "object") {
    return {};
  }
  const rootStyle = { ...(style as CSSProperties) };
  const contentStyle: CSSProperties = {};
  for (const key of [
    "padding",
    "paddingTop",
    "paddingRight",
    "paddingBottom",
    "paddingLeft",
  ] as const) {
    if (rootStyle[key] !== undefined) {
      contentStyle[key] = rootStyle[key];
      delete rootStyle[key];
    }
  }
  return {
    rootStyle,
    contentStyle: Object.keys(contentStyle).length ? contentStyle : undefined,
  };
}
