import { CSSProperties, ReactNode } from "react";
import styles from "./StickyBox.module.scss";
import type { ComponentDef } from "@abstractions/ComponentDefs";
import { createComponentRenderer } from "@components-core/renderers";
import { ComponentDescriptor } from "@abstractions/ComponentDescriptorDefs";
import { desc } from "@components-core/descriptorHelper";
import { parseScssVar } from "@components-core/theming/themeVars";
import classnames from "@components-core/utils/classnames";

// =====================================================================================================================
// React StickyBox component implementation

type StickyBoxProps = {
  children: ReactNode;
  uid?: string;
  layout?: CSSProperties;
  to: "top" | "bottom";
};

function StickyBox({ children, uid, layout, to = "top" }: StickyBoxProps) {
  return (
    <div
      className={classnames(styles.wrapper, {
        [styles.top]: to === "top",
        [styles.bottom]: to === "bottom",
      })}
      style={layout}
    >
      {children}
    </div>
  );
}

// =====================================================================================================================
// XMLUI StickyBox component definition

/**
 * **NOTE:** The \`StickyBox\` has a number of issues in the App component. Need to fix these before docs are updated.
 * 
 * The \`StickyBox\` is a component that "sticks" or remains fixed at the top or bottom position on the screen as the user scrolls.
 * If used inside an [\`App\`](./App.mdx) component, the \`StickyBox\` will stick under the header and atop the footer -
 * unless the \`scrollWholePage\` property is set, in which case the \`StickyBox\` will not stick at all.
 * @internal
 */
export interface StickyBoxComponentDef extends ComponentDef<"StickyBox"> {
  props: {
    /**
     * Position to anchor to the top or bottom.
     * The default value is \`top\`.
     * @descriptionRef
     */
    to?: string;
  };
}

export const StickyBoxMd: ComponentDescriptor<StickyBoxComponentDef> = {
  displayName: "StickyBox",
  description: "Provides a container that sticks to the top or bottom of the screen.",
  props: {
    to: desc("Position to anchor the sticky box (top, bottom)"),
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    "color-bg-StickyBox": "$color-bg",
  },
};

export const stickyBoxComponentRenderer = createComponentRenderer<StickyBoxComponentDef>(
  "StickyBox",
  ({ node, renderChild, extractValue, layoutCss }) => {
    return (
      <StickyBox uid={node.uid} layout={layoutCss} to={extractValue(node.props?.to)}>
        {renderChild(node.children)}
      </StickyBox>
    );
  },
  StickyBoxMd
);
